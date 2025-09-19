// =========================
// API RESPONSE TYPES
// =========================
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: "success" | "error";
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// =========================
// TRIP TYPES
// =========================
export interface Location {
  lat: number;
  lon: number;
  address?: string; // optional human-readable
}

export interface Trip {
  id: number;
  driver_id: number;
  vehicle_id?: number;
  current_location: Location;
  pickup_location: Location;
  dropoff_location: Location;
  shipping_document?: string;
  commodity?: string;
  current_cycle_hours: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  time_zone?: string; // driver’s home terminal timezone (per FMCSA)
}

export interface RouteCalculationRequest {
  current_location: Location;
  pickup_location: Location;
  dropoff_location: Location;
  current_cycle_hours: number;
  vehicle_type?: string;
  driver_id?: number;
}

export interface RouteCalculationResponse {
  route: {
    coordinates: [number, number][]; // lat, lon
    distance: number; // meters or miles
    duration: number; // seconds
    waypoints: RouteWaypoint[];
  };
  hos_schedule: HOSSchedule[];
  compliance_warnings: ComplianceWarning[];
}

export interface RouteWaypoint {
  id: string;
  type: "pickup" | "dropoff" | "rest_break" | "fuel_stop" | "mandatory_break";
  location: Location;
  estimated_arrival: string;
  duration_minutes: number;
  description: string;
  is_mandatory: boolean;
}

// =========================
// HOS / LOG TYPES
// =========================
export interface HOSLog {
  id: number;
  driver_id: number;
  trip_id?: number;
  date: string;
  time_zone: string;
  duty_periods: DutyPeriod[];
  total_drive_time: number;
  total_on_duty_time: number;
  cycle_hours_used: number;
  violations: HOSViolation[];
  shipping_document?: string;
  commodity?: string;
}

export interface DutyPeriod {
  id: string;
  status: "driving" | "on_duty" | "off_duty" | "sleeper_berth";
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location?: Location;
  notes?: string;
}

export interface HOSSchedule {
  date: string;
  periods: DutyPeriod[];
  daily_drive_limit_remaining: number;
  daily_on_duty_limit_remaining: number;
  cycle_reset_time?: string;
}

export interface HOSViolation {
  id: number;
  type:
    | "daily_drive_limit"
    | "daily_on_duty_limit"
    | "cycle_limit"
    | "break_required";
  severity: "warning" | "violation";
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface ComplianceWarning {
  type: "approaching_limit" | "break_required" | "violation_risk";
  message: string;
  severity: "info" | "warning" | "critical";
  eta_impact?: number;
}

// =========================
// DRIVER TYPES
// =========================
export interface Driver {
  id: number;
  name: string;
  license_number: string;
  current_vehicle_id?: number;
  current_location?: Location;
  status: "available" | "driving" | "on_break" | "off_duty";
  current_cycle_hours: number;
  home_terminal_time_zone?: string;
  last_updated: string;
}

export interface DriverStatus {
  driver_id: number;
  current_duty_status: "driving" | "on_duty" | "off_duty" | "sleeper_berth";
  duty_status_since: string;
  current_location: Location;
  next_required_break: string | null;
  available_drive_time: number;
  available_on_duty_time: number;
}

// =========================
// VEHICLE TYPES
// =========================
export interface Vehicle {
  id: number;
  vehicle_number: string;
  make_model: string;
  current_driver_id?: number;
  last_known_location?: Location;
  fuel_level?: number;
  odometer: number;
  status: "active" | "maintenance" | "inactive";
}

export interface VehicleLocation {
  vehicle_id: number;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: string;
}

// =========================
// REPORTING TYPES
// =========================
export interface ComplianceReport {
  period_start: string;
  period_end: string;
  total_violations: number;
  violations_by_type: Record<string, number>;
  driver_compliance_scores: Array<{
    driver_id: number;
    driver_name: string;
    compliance_score: number;
    total_violations: number;
  }>;
}

export interface FleetTripOverview {
  driver: Driver;
  vehicle: Vehicle;
  active_trip?: Trip;
  hos_status: DriverStatus;
}
