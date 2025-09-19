import axios, { AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import humps from "humps";

import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  TripData as ApiTripData,
  HOSLog,
  HOSViolation,
  Driver,
  Vehicle,
  Report,
} from "@/types/api";

const __API_URL__ = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: __API_URL__,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
      transformRequest: [
        (data) => (data ? humps.decamelizeKeys(data) : data),
        ...(axios.defaults.transformRequest as []),
      ],
      transformResponse: [
        ...(axios.defaults.transformResponse as []),
        (data) => {
          try {
            const parsed = JSON.parse(data);
            return humps.camelizeKeys(parsed);
          } catch {
            return data;
          }
        },
      ],
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get("auth_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove("auth_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // ===================== Authentication =====================
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post("/api/auth/login/", credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.client.post("/api/auth/register/", credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post("/api/auth/logout/");
  }

  async verifyToken(token: string): Promise<User> {
    const response = await this.client.get("/api/auth/verify/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.client.post("/api/auth/refresh/");
    return response.data;
  }

  // ===================== Drivers =====================
  async getDrivers(): Promise<Driver[]> {
    const response = await this.client.get("/api/drivers/");
    return response.data;
  }

  async createDriver(driverData: Partial<Driver>): Promise<Driver> {
    const response = await this.client.post("/api/drivers/", driverData);
    return response.data;
  }

  async getDriverById(id: string): Promise<Driver> {
    const response = await this.client.get(`/api/drivers/${id}/`);
    return response.data;
  }

  async updateDriver(id: string, driverData: Partial<Driver>): Promise<Driver> {
    const response = await this.client.put(`/api/drivers/${id}/`, driverData);
    return response.data;
  }

  async deleteDriver(id: string): Promise<void> {
    await this.client.delete(`/api/drivers/${id}/`);
  }

  // ===================== Vehicles =====================
  async getVehicles(): Promise<Vehicle[]> {
    const response = await this.client.get("/api/vehicles/");
    return response.data;
  }

  async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const response = await this.client.post("/api/vehicles/", vehicleData);
    return response.data;
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await this.client.get(`/api/vehicles/${id}/`);
    return response.data;
  }

  async updateVehicle(
    id: string,
    vehicleData: Partial<Vehicle>
  ): Promise<Vehicle> {
    const response = await this.client.put(`/api/vehicles/${id}/`, vehicleData);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.client.delete(`/api/vehicles/${id}/`);
  }

  // Vehicle Locations
  async getVehicleLocations(vehicleId: string): Promise<any[]> {
    const response = await this.client.get(
      `/api/vehicles/${vehicleId}/locations/`
    );
    return response.data;
  }

  async addVehicleLocation(vehicleId: string, locationData: any): Promise<any> {
    const response = await this.client.post(
      `/api/vehicles/${vehicleId}/locations/`,
      locationData
    );
    return response.data;
  }

  // ===================== Trips =====================
  async getTrips(): Promise<ApiTripData[]> {
    const response = await this.client.get("/api/trips/");
    return response.data;
  }

  async createTrip(tripData: Partial<ApiTripData>): Promise<ApiTripData> {
    const response = await this.client.post("/api/trips/", tripData);
    return response.data;
  }

  async getTripById(id: string): Promise<ApiTripData> {
    const response = await this.client.get(`/api/trips/${id}/`);
    return response.data;
  }

  async updateTrip(
    id: string,
    tripData: Partial<ApiTripData>
  ): Promise<ApiTripData> {
    const response = await this.client.put(`/api/trips/${id}/`, tripData);
    return response.data;
  }

  async deleteTrip(id: string): Promise<void> {
    await this.client.delete(`/api/trips/${id}/`);
  }

  async calculateTripRoute(tripId: string, routeData?: any): Promise<any> {
    const response = await this.client.post(
      `/api/trips/${tripId}/calculate-route/`,
      routeData
    );
    return response.data;
  }

  async getTripWaypoints(tripId: string): Promise<any[]> {
    const response = await this.client.get(`/api/trips/${tripId}/waypoints/`);
    return response.data;
  }

  async addTripWaypoint(tripId: string, waypointData: any): Promise<any> {
    const response = await this.client.post(
      `/api/trips/${tripId}/waypoints/`,
      waypointData
    );
    return response.data;
  }

  // ===================== HOS Logs =====================
  async getHOSLogs(driverId?: string): Promise<HOSLog[]> {
    const url = driverId
      ? `/api/logs/hos/?driver_id=${driverId}`
      : "/api/logs/hos/";
    const response = await this.client.get(url);
    return response.data;
  }

  async createHOSLog(logData: Partial<HOSLog>): Promise<HOSLog> {
    const response = await this.client.post("/api/logs/hos/", logData);
    return response.data;
  }

  async getHOSLogById(id: string): Promise<HOSLog> {
    const response = await this.client.get(`/api/logs/hos/${id}/`);
    return response.data;
  }

  async updateHOSLog(id: string, logData: Partial<HOSLog>): Promise<HOSLog> {
    const response = await this.client.put(`/api/logs/hos/${id}/`, logData);
    return response.data;
  }

  async deleteHOSLog(id: string): Promise<void> {
    await this.client.delete(`/api/logs/hos/${id}/`);
  }

  async getLogDutyPeriods(logId: string): Promise<any[]> {
    const response = await this.client.get(`/api/logs/hos/${logId}/periods/`);
    return response.data;
  }

  async addDutyPeriod(logId: string, periodData: any): Promise<any> {
    const response = await this.client.post(
      `/api/logs/hos/${logId}/periods/`,
      periodData
    );
    return response.data;
  }

  async updateDutyPeriod(periodId: string, periodData: any): Promise<any> {
    const response = await this.client.put(
      `/api/logs/hos/periods/${periodId}/`,
      periodData
    );
    return response.data;
  }

  async deleteDutyPeriod(periodId: string): Promise<void> {
    await this.client.delete(`/api/logs/hos/periods/${periodId}/`);
  }

  async getLogViolations(logId: string): Promise<HOSViolation[]> {
    const response = await this.client.get(
      `/api/logs/hos/${logId}/violations/`
    );
    return response.data;
  }

  async addLogViolation(
    logId: string,
    violationData: Partial<HOSViolation>
  ): Promise<HOSViolation> {
    const response = await this.client.post(
      `/api/logs/hos/${logId}/violations/`,
      violationData
    );
    return response.data;
  }

  async checkHOSCompliance(logId: string): Promise<any> {
    const response = await this.client.get(`/api/logs/hos/${logId}/check/`);
    return response.data;
  }

  async generateHOSSchedule(logId: string, scheduleData: any): Promise<any> {
    const response = await this.client.post(
      `/api/logs/hos/${logId}/schedule/`,
      scheduleData
    );
    return response.data;
  }

  // ===================== Reports =====================
  async getComplianceReport(): Promise<any> {
    const response = await this.client.get("/api/reports/compliance/");
    return response.data;
  }

  async getDriverComplianceReport(driverId: string): Promise<any> {
    const response = await this.client.get(
      `/api/reports/compliance/${driverId}/`
    );
    return response.data;
  }

  async getTripsReport(): Promise<any> {
    const response = await this.client.get("/api/reports/trips/");
    return response.data;
  }

  async getFleetComplianceReport(): Promise<any> {
    const response = await this.client.get("/api/reports/compliance/");
    return response.data;
  }

  // ===================== Legacy Helpers =====================
  async getHOSViolations(): Promise<HOSViolation[]> {
    const logs = await this.getHOSLogs();
    if (logs.length > 0) return this.getLogViolations(logs[0].id.toString());
    return [];
  }

  async performComplianceCheck(): Promise<any> {
    return this.getComplianceReport();
  }

  async getReports(): Promise<Report[]> {
    return [];
  }

  async generateReport(reportType: string, filters: any): Promise<Report> {
    return {
      id: Math.random().toString(),
      title: `${reportType} Report`,
      type: reportType,
      createdAt: new Date().toISOString(),
      data: filters,
    };
  }
}

export const apiService = new ApiService();
