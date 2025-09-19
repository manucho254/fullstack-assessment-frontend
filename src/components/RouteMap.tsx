import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { Icon, DivIcon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, AlertTriangle } from "lucide-react";

// Fix default marker icons
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export interface BackendWaypoint {
  id: string;
  type: "origin" | "pickup" | "dropoff" | "fuel_stop" | "rest_break";
  location: { lat: number; lon: number };
  coordinates: [number, number];
  estimated_arrival: string;
  duration_minutes: number;
  description: string;
  is_mandatory: boolean;
}

interface RouteMapProps {
  waypoints: BackendWaypoint[];
  coordinates: [number, number][]; // from route.coordinates
  distance: number;
  duration: number;
  className?: string;
}

interface MapFitBoundsProps {
  waypoints: BackendWaypoint[];
}

const MapFitBounds: React.FC<MapFitBoundsProps> = ({ waypoints }) => {
  const map = useMap();

  React.useEffect(() => {
    if (waypoints.length > 0) {
      const bounds = waypoints.map((wp) => [wp.location.lat, wp.location.lon]);
      map.fitBounds(bounds as [number, number][], { padding: [20, 20] });
    }
  }, [waypoints, map]);

  return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({
  waypoints,
  coordinates,
  distance,
  duration,
  className = "",
}) => {
  const getMarkerIcon = (type: BackendWaypoint["type"]) => {
    const iconMap: Record<BackendWaypoint["type"], string> = {
      origin: "🏠",
      pickup: "📦",
      dropoff: "🎯",
      rest_break: "☕",
      fuel_stop: "⛽",
    };

    return new DivIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-primary shadow-lg text-lg">${iconMap[type]}</div>`,
      className: "custom-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  if (!waypoints || waypoints.length === 0) {
    return (
      <Card
        className={`gradient-surface border-0 shadow-medium p-6 ${className}`}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No route data available</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`gradient-surface border-0 shadow-medium overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Route Overview
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {distance.toFixed(1)} mi
            </Badge>
            <Badge variant="outline" className="text-xs">
              {duration.toFixed(1)}h drive
            </Badge>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-96">
        <MapContainer
          center={[waypoints[0].location.lat, waypoints[0].location.lon]}
          zoom={5}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapFitBounds waypoints={waypoints} />

          {/* Route polyline */}
          <Polyline
            positions={coordinates as LatLngExpression[]}
            color="#2563eb"
            weight={4}
            opacity={0.8}
          />

          {/* Waypoints */}
          {waypoints.map((wp) => (
            <Marker
              key={wp.id}
              position={[wp.location.lat, wp.location.lon]}
              icon={getMarkerIcon(wp.type)}
            >
              <Popup className="custom-popup">
                <div className="min-w-48 p-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm capitalize">
                      {wp.type.replace("_", " ")}
                    </h4>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    {wp.description}
                  </p>

                  {wp.estimated_arrival && (
                    <div className="flex items-center text-xs mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      ETA: {new Date(wp.estimated_arrival).toLocaleString()}
                    </div>
                  )}

                  {wp.is_mandatory && (
                    <div className="flex items-center text-xs text-warning">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Mandatory Stop
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
};
