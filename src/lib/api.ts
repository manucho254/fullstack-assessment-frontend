// API configuration for Django backend integration
declare const __API_URL__: string;

export const API_BASE_URL = typeof __API_URL__ !== 'undefined' ? __API_URL__ : 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Trip planning endpoints
  trips: '/api/trips/',
  calculateRoute: '/api/trips/calculate-route/',
  
  // HOS compliance endpoints
  hosLogs: '/api/hos-logs/',
  hosViolations: '/api/hos-violations/',
  
  // Driver management
  drivers: '/api/drivers/',
  driverStatus: '/api/drivers/status/',
  
  // Vehicle tracking
  vehicles: '/api/vehicles/',
  vehicleLocation: '/api/vehicles/location/',
  
  // Compliance and reporting
  reports: '/api/reports/',
  complianceCheck: '/api/compliance/check/',
} as const;

// HTTP client configuration
export const apiClient = {
  get: async (endpoint: string, params?: Record<string, any>) => {
    const url = new URL(API_BASE_URL + endpoint);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  post: async (endpoint: string, data?: any) => {
    const response = await fetch(API_BASE_URL + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  put: async (endpoint: string, data?: any) => {
    const response = await fetch(API_BASE_URL + endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  delete: async (endpoint: string) => {
    const response = await fetch(API_BASE_URL + endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.ok;
  },
};

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}