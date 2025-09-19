import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TripForm, TripData } from "@/components/TripForm";
import { DutyStatusGrid, DutyBlock } from "@/components/DutyStatusGrid";
import { HOSAlerts } from "@/components/HOSAlerts";
import { RouteMap, RouteSegment, RoutePoint } from "@/components/RouteMap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  BarChart3,
  Route,
  Users,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [currentTrip, setCurrentTrip] = useState<any | null>(null);
  const [dutyBlocks, setDutyBlocks] = useState<DutyBlock[]>([]);
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [routeWaypoints, setRouteWaypoints] = useState<RoutePoint[]>([]);
  const [routeData, setRouteData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hosStatus, setHosStatus] = useState<any>(null);

  // --------------------------
  // Trip Creation + Route Calc
  // --------------------------
  const handleTripSubmit = async (tripData: TripData) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      // 1. Save trip (camelCase → axios will decamelize to snake_case)
      const createdTrip = await apiService.createTrip({
        currentLocation: tripData.currentLocation,
        pickupLocation: tripData.pickupLocation,
        dropoffLocation: tripData.dropoffLocation,
        currentCycleHours: tripData.currentCycleHours,
      });

      setCurrentTrip(createdTrip);

      // 2. Ask backend to calculate route (camelCase keys)
      const routeResult = await apiService.calculateTripRoute(
        createdTrip.id.toString(),
        {
          currentLocationAddress: tripData.currentLocation,
          pickupAddress: tripData.pickupLocation,
          dropoffAddress: tripData.dropoffLocation,
          currentCycleHours: tripData.currentCycleHours,
        }
      );

      console.log(routeResult)

     
      setDutyBlocks(routeResult.hosSchedule);
      setHosStatus(routeResult.hosStatus);
      setRouteData(routeResult.route);
      setRouteWaypoints(routeResult.route.route.waypoints || []);
      setRouteSegments(routeResult.route.routeSegments || []);
      setShowLogSheet(true);

      toast({
        title: "Trip Planned",
        description: "Your trip has been created and route calculated.",
      });
    } catch (error) {
      console.error("Trip planning failed:", error);
      toast({
        title: "Error",
        description: "Failed to plan trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  // --------------------------
  // Duty Block Updates → Waypoints
  // --------------------------
  const handleBlockUpdate = async (blocks: DutyBlock[]) => {
    if (!currentTrip) return;

    try {
      setIsSaving(true);

      // Map DutyBlock → waypoint payloads
      const payloads = blocks.map((block) => ({
        status: block.status.replace("-", "_"),
        start_time: block.startTime,
        end_time: block.endTime,
        location: block.location,
        notes: block.remarks,
      }));

      // For now, add waypoints one by one (could batch on backend later)
      await Promise.all(
        payloads.map((wp) =>
          apiService.addTripWaypoint(currentTrip.id.toString(), wp)
        )
      );

      // Refresh waypoints from backend
      const freshWaypoints = await apiService.getTripWaypoints(
        currentTrip.id.toString()
      );

      const updatedBlocks: DutyBlock[] = freshWaypoints.map(
        (wp: any, idx: number) => ({
          id: wp.id || idx,
          status: wp.status.replace("_", "-"),
          startTime: wp.start_time,
          endTime: wp.end_time,
          location: wp.location,
          remarks: wp.notes,
        })
      );

      setDutyBlocks(updatedBlocks);

      toast({
        title: "Log Updated",
        description: "Duty status changes saved to backend.",
      });
    } catch (error) {
      console.error("Failed to save waypoints:", error);
      toast({
        title: "Error",
        description: "Could not save log changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------
  // Route Map Update (local only)
  // --------------------------
  const handleRouteUpdate = useCallback(
    (segments: RouteSegment[], waypoints: RoutePoint[]) => {
      setRouteSegments(segments);
      setRouteWaypoints(waypoints);
    },
    []
  );
  console.log(currentTrip)

  const resetApp = () => {
    setCurrentTrip(null);
    setDutyBlocks([]);
    setShowLogSheet(false);
    setRouteSegments([]);
    setRouteWaypoints([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Plan your trips and track HOS compliance
        </p>
      </div>

      <main className="space-y-8">
        {!showLogSheet ? (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="gradient-surface border-0 shadow-medium p-6">
                <div className="flex items-center">
                  <Shield className="h-12 w-12 text-primary mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      FMCSA Compliant
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Full regulatory compliance
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="gradient-surface border-0 shadow-medium p-6">
                <div className="flex items-center">
                  <Route className="h-12 w-12 text-accent mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Smart Routing
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered optimization
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="gradient-surface border-0 shadow-medium p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-12 w-12 text-secondary mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Real-time Analytics
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Live monitoring
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Trip Planning */}
            <Card className="gradient-surface border-0 shadow-medium">
              <div className="p-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Plan Your Next Trip
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Enter your trip details and let our system generate an
                    optimized, compliant schedule
                  </p>
                </div>
                <TripForm onSubmit={handleTripSubmit} />
              </div>
            </Card>
          </>
        ) : (
          <div className="space-y-8">
            {/* Trip Overview */}
            <Card className="gradient-surface border-0 shadow-medium p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Trip Overview
                  </h2>
                  <p className="text-muted-foreground">
                    Comprehensive trip planning and compliance monitoring
                  </p>
                </div>
                <Button
                  onClick={resetApp}
                  variant="outline"
                  size="lg"
                  className="transition-smooth hover:shadow-glow mt-4 md:mt-0"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Plan New Trip
                </Button>
              </div>

              {routeData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Route Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center">
                      <Route className="h-5 w-5 mr-2 text-primary" />
                      Route Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-3 text-primary mt-0.5" />
                        <div>
                          <span className="text-muted-foreground block capitalize">
                            Origin:
                          </span>
                          <span className="font-medium">{currentTrip?.current_location?.address}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-3 text-primary mt-0.5" />
                        <div>
                          <span className="text-muted-foreground block capitalize">
                            Pickup:
                          </span>
                          <span className="font-medium">{currentTrip?.pickup_location?.address}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-3 text-primary mt-0.5" />
                        <div>
                          <span className="text-muted-foreground block capitalize">
                            Destination:
                          </span>
                          <span className="font-medium">{currentTrip?.dropoff_location?.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Metrics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                      Trip Metrics
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distance:</span>
                        <span className="font-medium">
                          {routeData.route.distance?.toFixed(1)} miles
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Driving Time:
                        </span>
                        <span className="font-medium">
                          {routeData.route.duration?.toFixed(1)}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Cycle Hours:
                        </span>
                        <span className="font-medium">
                          {currentTrip.current_cycle_hours}h / 70h
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compliance */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary" />
                      Compliance Status
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-3 text-success" />
                        <span>Property Carrying Vehicle</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-3 text-primary" />
                        <span>70-hour/8-day Cycle</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-3 text-success" />
                        <span>Automated Rest Scheduling</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Route Map */}
            {currentTrip && (
              <RouteMap
                waypoints={routeWaypoints} // route.waypoints from backend
                coordinates={routeData?.route.coordinates} // route.coordinates
                distance={routeData?.route.distance}
                duration={routeData?.route.duration}
                className="shadow-medium"
              />
            )}

            {/* HOS Alerts */}
            {hosStatus && (
              <HOSAlerts hosStatus={hosStatus} />
            )}

            {/* Log Sheet */}
            <Card className="gradient-surface border-0 shadow-medium p-6">
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 mr-3 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">
                  Digital Log Book
                </h3>
              </div>
              <DutyStatusGrid
                date={new Date()}
                dutyBlocks={dutyBlocks}
                onBlockUpdate={handleBlockUpdate}
                isSaving={isSaving}
              />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
