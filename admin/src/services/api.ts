import axios from 'axios';
import type { MacroResult, ApiResponse } from '../types';

// Backend response wrapper type
interface BackendResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminLoginResponse {
  accessToken: string;
  admin: {
    id: string;
    username: string;
  };
}

export interface ConfigItem {
  id: string;
  key: string;
  value: number | string;
  category: string;
  label: string;
  description: string;
}

export type ConfigMap = Record<string, ConfigItem[]>;

const api = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  // Login
  login: async (username: string, password: string): Promise<ApiResponse<AdminLoginResponse>> => {
    try {
      const response = await api.post<BackendResponse<AdminLoginResponse>>('/login', {
        username,
        password,
      });
      const { accessToken, admin } = response.data.data;
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Invalid credentials' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  // Check if logged in
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('adminToken');
  },

  // Get current admin user
  getCurrentUser: (): { id: string; username: string } | null => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },

  // Get all records with pagination
  getRecords: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ data: MacroResult[]; pagination: PaginatedResponse<MacroResult>['pagination'] }>> => {
    try {
      const response = await api.get<PaginatedResponse<MacroResult>>('/records', {
        params: { page, limit },
      });
      return {
        success: true,
        data: {
          data: response.data.data,
          pagination: response.data.pagination,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to fetch records' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get single record
  getRecord: async (id: string): Promise<ApiResponse<MacroResult>> => {
    try {
      const response = await api.get<BackendResponse<MacroResult>>(`/records/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to fetch record' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Delete record
  deleteRecord: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    try {
      const response = await api.delete<BackendResponse<{ deleted: boolean }>>(`/records/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to delete record' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get all configurations
  getConfigurations: async (): Promise<ApiResponse<ConfigMap>> => {
    try {
      const response = await api.get<BackendResponse<ConfigMap>>('/config');
      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to fetch configurations' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Update configurations
  updateConfigurations: async (
    configs: { key: string; value: number }[]
  ): Promise<ApiResponse<ConfigMap>> => {
    try {
      const response = await api.put<BackendResponse<ConfigMap>>('/config', { configs });
      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to update configurations' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
};

export default api;

