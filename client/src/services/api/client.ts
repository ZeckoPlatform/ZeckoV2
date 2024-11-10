import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { logger } from '../logger/Logger';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';
import { requestQueue } from '../queue/RequestQueueManager';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      this.handleRequest,
      this.handleRequestError
    );

    this.client.interceptors.response.use(
      this.handleResponse,
      this.handleResponseError
    );
  }

  private handleRequest = async (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Start performance monitoring
    const startTime = performance.now();
    config.metadata = { startTime };

    return config;
  };

  private handleRequestError = (error: AxiosError) => {
    logger.error('Request error:', error);
    return Promise.reject(error);
  };

  private handleResponse = (response: any) => {
    const duration = performance.now() - response.config.metadata.startTime;
    performanceMonitor.trackApiCall(
      response.config.url,
      duration,
      response.status
    );

    return response;
  };

  private handleResponseError = async (error: AxiosError) => {
    if (!error.response) {
      // Network error - queue request if offline
      if (!navigator.onLine) {
        await requestQueue.addToQueue(error.config);
        return Promise.reject(new Error('Request queued - offline mode'));
      }
      return Promise.reject(error);
    }

    // Handle 401 errors
    if (error.response.status === 401) {
      return this.handle401Error(error);
    }

    logger.error('Response error:', error);
    return Promise.reject(error);
  };

  private async handle401Error(error: AxiosError) {
    const originalRequest = error.config;
    
    if (originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await this.client.post('/auth/refresh-token', { refreshToken });
        
        localStorage.setItem('token', response.data.token);
        return this.client(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }

  // Public methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient(); 