// hooks/useAuthApi.ts
import { useCallback } from 'react';
import axiosInstance from './axios';
import { useAuth } from '../context/AuthContext';

export function useAuthApi() {
  const { accessToken, refreshTokens, logout, user } = useAuth();

  const authRequest = useCallback(async <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    options?: any
  ): Promise<T> => {
    const headers = {
      ...options?.headers,
      'Authorization': accessToken ? `Bearer ${accessToken}` : '',
    };

    try {
      const response = await axiosInstance({
        method,
        url,
        data,
        headers,
        ...options,
      });
      
      return response.data;
    } catch (error: any) {
      // If token expired, try to refresh and retry once
      if (error.response?.status === 401 && accessToken) {
        try {
          const refreshed = await refreshTokens();
          if (refreshed) {
            // Get new token from cookies since context might not have updated yet
            // We'll make a new request with the updated token via the interceptor
            const retryResponse = await axiosInstance({
              method,
              url,
              data,
              headers: {
                ...headers,
                // Clear Authorization header, let interceptor handle it
              },
              ...options,
            });
            
            return retryResponse.data;
          } else {
            await logout();
            throw new Error('Session expired. Please login again.');
          }
        } catch (refreshError) {
          await logout();
          throw new Error('Session expired. Please login again.');
        }
      }
      
      // If it's an authentication error but we don't have a token
      if (error.response?.status === 401 && !accessToken) {
        await logout();
        throw new Error('Please login to continue.');
      }
      
      throw error;
    }
  }, [accessToken, refreshTokens, logout]);

  return {
    get: <T>(url: string, options?: any) => authRequest<T>('GET', url, undefined, options),
    post: <T>(url: string, data?: any, options?: any) => authRequest<T>('POST', url, data, options),
    put: <T>(url: string, data?: any, options?: any) => authRequest<T>('PUT', url, data, options),
    delete: <T>(url: string, options?: any) => authRequest<T>('DELETE', url, undefined, options),
    patch: <T>(url: string, data?: any, options?: any) => authRequest<T>('PATCH', url, data, options),
  };
}