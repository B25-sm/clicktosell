import { useState, useEffect } from 'react';
import { apiService, ApiResponse } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'An error occurred',
      });
    }
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

export function useListings(params?: {
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  search?: string;
}) {
  return useApi(() => apiService.getListings(params), { immediate: false });
}

export function useListing(id: string) {
  return useApi(() => apiService.getListing(id));
}

export function useCategories() {
  return useApi(() => apiService.getCategories());
}

export function useSearch(params: {
  q?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  return useApi(() => apiService.searchListings(params), { immediate: false });
}

export function useHealthCheck() {
  return useApi(() => apiService.healthCheck());
}
