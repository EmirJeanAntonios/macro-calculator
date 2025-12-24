import axios from 'axios';
import type { CalculateRequest, MacroResult, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const macroService = {
  // Calculate macros based on user input and workout schedule
  calculate: async (data: CalculateRequest): Promise<ApiResponse<MacroResult>> => {
    try {
      const response = await api.post<MacroResult>('/calculate', data);
      return { success: true, data: response.data };
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
      const response = await api.get<MacroResult>(`/macros/${id}`);
      return { success: true, data: response.data };
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
};

export default api;

