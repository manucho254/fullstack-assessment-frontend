import { RoutePoint, RouteSegment } from "@/components/RouteMap";
import { HOSStatus } from "./hosCalculations";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteRequest {
  origin: string;
  pickup: string;
  dropoff: string;
  hosStatus: HOSStatus;
}

export interface RouteResponse {
  waypoints: RoutePoint[];
  segments: RouteSegment[];
  totalDistance: number;
  totalDrivingTime: number;
  estimatedFuelStops: number;
}

// Geocoding service using Nominatim (OpenStreetMap)
export const geocodeAddress = async (
  address: string
): Promise<Coordinates | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1&countrycodes=us`
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();

    if (data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Route optimization using OpenRouteService or OSRM
export const calculateOptimizedRoute = async (
  coordinates: Coordinates[],
  hosStatus: HOSStatus
): Promise<{ path: Coordinates[]; duration: number; distance: number }> => {
  try {
    // For demo purposes, create a simplified route
    // In production, you would use OpenRouteService or OSRM API
    const path: Coordinates[] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];

      // Calculate straight-line distance (in production, use road distance)
      const distance = calculateDistance(start, end);
      const duration = distance / 55; // Assume 55 mph average

      totalDistance += distance;
      totalDuration += duration;

      // Add intermediate points for visualization
      const steps = Math.max(2, Math.floor(distance / 50)); // Point every ~50 miles
      for (let step = 0; step <= steps; step++) {
        const ratio = step / steps;
        path.push({
          lat: start.lat + (end.lat - start.lat) * ratio,
          lng: start.lng + (end.lng - start.lng) * ratio,
        });
      }
    }

    return {
      path,
      distance: totalDistance,
      duration: totalDuration,
    };
  } catch (error) {
    console.error("Route calculation error:", error);
    throw error;
  }
};

// Calculate great circle distance between two points
const calculateDistance = (
  point1: Coordinates,
  point2: Coordinates
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Generate HOS-compliant waypoints
export const generateHOSWaypoints = (
  origin: Coordinates,
  pickup: Coordinates,
  dropoff: Coordinates,
  hosStatus: HOSStatus,
  routeDistance: number
): RoutePoint[] => {
  const waypoints: RoutePoint[] = [];
  let currentTime = new Date();
  currentTime.setHours(6, 0, 0, 0); // Start at 6 AM

  // Origin
  waypoints.push({
    ...origin,
    type: "origin",
    address: "Starting location",
    eta: formatTime(currentTime),
    complianceStatus: "safe",
  });

  // travel to pickup
  const timeToPickup = calculateDistance(origin, pickup) / 55;
  currentTime = new Date(currentTime.getTime() + timeToPickup * 60 * 60 * 1000);

  waypoints.push({
    ...pickup,
    type: "pickup",
    address: "Pickup location",
    eta: formatTime(currentTime),
    serviceWindow: "1 hour",
    complianceStatus: "safe",
  });

  // Add service time
  currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // 1 hour service

  const remainingDistance = calculateDistance(pickup, dropoff);
  // track distance and position as we iterate
  let distanceCovered = 0;
  let drivingTimeSinceBreak = hosStatus.drivingHoursUsed;
  let currentPos: Coordinates = { ...pickup };

  // helper to interpolate a point between pickup and dropoff
  const interpPoint = (ratio: number): Coordinates => ({
    lat: pickup.lat + (dropoff.lat - pickup.lat) * ratio,
    lng: pickup.lng + (dropoff.lng - pickup.lng) * ratio,
  });

  // Decide next break/fuel positions iteratively
  // simple strategy: drive chunks until a break is needed or we reach dropoff
  const maxDriveBeforeBreak = 8; // hours
  // schedule fuel stops roughly every 400 miles
  const fuelInterval = 400;

  let nextFuelAt = fuelInterval; // miles

  while (distanceCovered < remainingDistance - 0.0001) {
    // remaining to go
    const remaining = remainingDistance - distanceCovered;
    // how far until we need break (in miles) given drivingTimeSinceBreak
    const hoursUntilBreak = Math.max(
      0,
      maxDriveBeforeBreak - drivingTimeSinceBreak
    );
    const milesUntilBreak = hoursUntilBreak * 55;

    // plan next chunk: either to break point, fuel point, or to dropoff
    let nextChunk = Math.min(
      remaining,
      milesUntilBreak > 0 ? milesUntilBreak : remaining
    );

    // if next fuel stop is closer than the break point, go to fuel first
    if (
      nextFuelAt - distanceCovered > 0 &&
      nextFuelAt - distanceCovered < nextChunk
    ) {
      nextChunk = nextFuelAt - distanceCovered;
    }

    // limit small steps to avoid infinite loops
    if (nextChunk <= 0.0001) break;

    distanceCovered += nextChunk;
    const ratio = Math.min(1, distanceCovered / remainingDistance);
    const newPos = interpPoint(ratio);

    // advance time for driving that chunk
    currentTime = new Date(
      currentTime.getTime() + (nextChunk / 55) * 60 * 60 * 1000
    );
    drivingTimeSinceBreak += nextChunk / 55;

    // If we arrived at a fuel stop threshold
    if (
      Math.abs(distanceCovered - nextFuelAt) < 1e-6 ||
      distanceCovered > nextFuelAt - 1e-6
    ) {
      waypoints.push({
        ...newPos,
        type: "fuel",
        address: "Fuel stop",
        eta: formatTime(currentTime),
        reason: "Recommended fuel stop",
        complianceStatus: "safe",
      });
      // add fuel time
      currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000); // 15 mins
      // schedule next fuel
      nextFuelAt += fuelInterval;
    }

    // If we reached break threshold (>=8 hours driving since last break)
    if (
      drivingTimeSinceBreak >= 8 ||
      hosStatus.drivingHoursUsed + drivingTimeSinceBreak >= 8
    ) {
      waypoints.push({
        ...newPos,
        type: "rest",
        address: "Required rest break",
        eta: formatTime(currentTime),
        reason: "HOS 8-hour driving limit",
        complianceStatus: "safe",
      });
      // add break time
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30-min break
      // reset driving since break
      drivingTimeSinceBreak = 0;
    }

    // update currentPos
    currentPos = newPos;
  }

  // Final leg from currentPos to dropoff (if not already exactly at dropoff)
  const lastLegDistance = calculateDistance(currentPos, dropoff);
  if (lastLegDistance > 0.001) {
    currentTime = new Date(
      currentTime.getTime() + (lastLegDistance / 55) * 60 * 60 * 1000
    );
  }

  waypoints.push({
    ...dropoff,
    type: "dropoff",
    address: "Drop-off location",
    eta: formatTime(currentTime),
    serviceWindow: "1 hour",
    complianceStatus: hosStatus.canContinueDriving ? "safe" : "violation",
  });

  return waypoints;
};

// Generate route segments with compliance status
export const generateRouteSegments = (
  waypoints: RoutePoint[],
  hosStatus: HOSStatus
): RouteSegment[] => {
  const segments: RouteSegment[] = [];
  let cumulativeDriving = hosStatus.drivingHoursUsed;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];

    const distance = calculateDistance(start, end);
    const drivingHours = distance / 55;
    cumulativeDriving += drivingHours;

    let complianceStatus: "safe" | "warning" | "violation" = "safe";

    // Check HOS compliance
    if (cumulativeDriving > 10) {
      complianceStatus = "warning";
    }
    if (cumulativeDriving > 11) {
      complianceStatus = "violation";
    }

    segments.push({
      points: [
        [start.lat, start.lng],
        [end.lat, end.lng],
      ],
      complianceStatus,
      drivingHours,
      distance,
    });

    // Reset driving hours after rest stops (should go to 0 additional driving since rest)
    if (end.type === "rest") {
      cumulativeDriving = 0;
    }
  }

  return segments;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
