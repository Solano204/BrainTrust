import axios from 'axios';
import { JWTUtils } from '@/app/utils/jwt';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

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

axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (refreshResponse.ok) {
          const { accessToken } = await refreshResponse.json();
          
          processQueue(null, accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error('Refresh token expired'));
          await fetch('/api/auth/clear-tokens', { method: 'POST' });
          
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
