import axios from 'axios';
import type { CalculateRequest, MacroResult, ApiResponse, WorkoutTypeOption } from '../types';

// Backend response wrapper type
interface BackendResponse<T> {
  success: boolean;
  data: T;
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// LocalStorage key for user's calculation history
const HISTORY_STORAGE_KEY = 'macro_calculator_history';

// Helper to get user's calculation IDs from localStorage
const getUserHistoryIds = (): string[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to add a calculation ID to user's history
const addToUserHistory = (id: string): void => {
  try {
    const ids = getUserHistoryIds();
    if (!ids.includes(id)) {
      ids.unshift(id); // Add to beginning (most recent first)
      // Keep only last 50 calculations
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(ids.slice(0, 50)));
    }
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const macroService = {
  // Calculate macros based on user input and workout schedule
  calculate: async (data: CalculateRequest): Promise<ApiResponse<MacroResult>> => {
    try {
      const response = await api.post<BackendResponse<MacroResult>>('/calculate', data);
      const result = response.data.data;
      // Store the result ID in localStorage for user's history
      if (result?.id) {
        addToUserHistory(result.id);
      }
      return { success: true, data: result };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to calculate macros' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get saved macro result by ID
  getResult: async (id: string): Promise<ApiResponse<MacroResult>> => {
    try {
      const response = await api.get<BackendResponse<MacroResult>>(`/macros/${id}`);
      // Backend wraps response in { success, data }
      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to fetch results' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get all saved macro results (admin/debug use)
  getAllResults: async (): Promise<ApiResponse<MacroResult[]>> => {
    try {
      const response = await api.get<BackendResponse<MacroResult[]>>('/macros');
      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to fetch results' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get user's own calculation history (stored in localStorage)
  getUserHistory: async (): Promise<ApiResponse<MacroResult[]>> => {
    try {
      const userIds = getUserHistoryIds();
      if (userIds.length === 0) {
        return { success: true, data: [] };
      }
      
      // Fetch all results that belong to this user
      const results: MacroResult[] = [];
      for (const id of userIds) {
        try {
          const response = await api.get<BackendResponse<MacroResult>>(`/macros/${id}`);
          if (response.data.data) {
            results.push(response.data.data);
          }
        } catch {
          // Result may have been deleted, skip it
        }
      }
      
      return { success: true, data: results };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to fetch results' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Download PDF for macro result
  downloadPdf: async (id: string): Promise<void> => {
    const response = await api.get(`/pdf/${id}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `macro-results-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Get available workout types
  getWorkoutTypes: async (): Promise<ApiResponse<WorkoutTypeOption[]>> => {
    try {
      const response = await api.get<BackendResponse<WorkoutTypeOption[]>>('/workout-types');
      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: error.response?.data?.message || 'Failed to fetch workout types' };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
};

export default api;

