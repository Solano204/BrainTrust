// lib/axios.ts
import axios from 'axios';
import { JWTUtils } from '@/app/utils/jwt';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Track if we're currently refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // On client side, we'll get token from cookies via a server action
    if (typeof window !== 'undefined') {
      try {
        // Get access token from server action
        const response = await fetch('/api/auth/get-token', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const { accessToken } = await response.json();
          if (accessToken && !JWTUtils.isTokenExpired(accessToken)) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }
      } catch (error) {
        console.warn('Failed to get access token:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (refreshResponse.ok) {
          const { accessToken } = await refreshResponse.json();
          
          // Process queued requests
          processQueue(null, accessToken);
          
          // Update current request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return axiosInstance(originalRequest);
        } else {
          // Refresh failed, logout
          processQueue(new Error('Refresh token expired'));
          await fetch('/api/auth/clear-tokens', { method: 'POST' });
          
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login?session=expired';
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;