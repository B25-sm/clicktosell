import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Types
export interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  category: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page?: number;
  limit?: number;
}

// API Service Functions
export const apiService = {
  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    const response = await apiClient.get('/api/health');
    return response.data;
  },

  // Get all listings
  async getListings(params?: {
    page?: number;
    limit?: number;
    category?: string;
    location?: string;
    search?: string;
  }): Promise<ApiResponse<ListingsResponse>> {
    const response = await apiClient.get('/api/v1/listings', { params });
    return response.data;
  },

  // Get single listing
  async getListing(id: string): Promise<ApiResponse<Listing>> {
    const response = await apiClient.get(`/api/v1/listings/${id}`);
    return response.data;
  },

  // Create listing
  async createListing(listingData: Partial<Listing>): Promise<ApiResponse<Listing>> {
    const response = await apiClient.post('/api/v1/listings', listingData);
    return response.data;
  },

  // Update listing
  async updateListing(id: string, listingData: Partial<Listing>): Promise<ApiResponse<Listing>> {
    const response = await apiClient.put(`/api/v1/listings/${id}`, listingData);
    return response.data;
  },

  // Delete listing
  async deleteListing(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/api/v1/listings/${id}`);
    return response.data;
  },

  // User authentication
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  async register(userData: { name: string; email: string; password: string }): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    return response.data;
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
};

export default apiService;
