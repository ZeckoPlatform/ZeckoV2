import axios from 'axios';
import { errorHandler } from '../error/ErrorHandler';
import { logger } from '../logger/Logger';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';
import { cacheService } from '../cache/CacheService';
import { retryService } from '../retry/RetryService';
import { requestQueue } from '../queue/RequestQueueManager';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    config.metadata = { 
      startTime: new Date(),
      endpoint: config.url
    };

    // Check cache for GET requests
    if (config.method.toLowerCase() === 'get' && !config.skipCache) {
      const cacheKey = cacheService.getCacheKey(config);
      const cachedResponse = cacheService.get(cacheKey);
      
      if (cachedResponse) {
        logger.debug(`Cache hit for ${config.url}`);
        return Promise.reject({
          config,
          response: cachedResponse,
          isCache: true
        });
      }
    }

    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });

    if (!navigator.onLine && config.method !== 'get') {
      const queueId = await requestQueue.addToQueue({
        url: config.url,
        method: config.method,
        headers: config.headers,
        body: config.data,
        options: config
      });
      
      throw new Error('Request queued for offline processing', { queueId });
    }

    return config;
  },
  (error) => {
    logger.error('API Request Error', error);
    performanceMonitor.trackError(error);
    return Promise.reject(errorHandler.handle(error));
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    const endpoint = response.config.metadata.endpoint;

    performanceMonitor.trackApiCall(endpoint, duration, response.status);
    
    // Cache successful GET requests
    if (response.config.method.toLowerCase() === 'get' && !response.config.skipCache) {
      const cacheKey = cacheService.getCacheKey(response.config);
      cacheService.set(cacheKey, response);
    }

    logger.debug(`API Response: ${response.status} ${endpoint}`, {
      duration,
      data: response.data,
    });

    return response;
  },
  async (error) => {
    // Handle cached responses
    if (error.isCache) {
      return error.response;
    }

    const duration = new Date() - error.config.metadata.startTime;
    const endpoint = error.config.metadata.endpoint;

    performanceMonitor.trackApiCall(endpoint, duration, error.response?.status || 0);
    
    // Handle retry logic
    if (!error.config._retry) {
      try {
        return await retryService.retryRequest(
          () => apiClient(error.config),
          { error, endpoint }
        );
      } catch (retryError) {
        return Promise.reject(errorHandler.handle(retryError));
      }
    }

    // Handle token refresh
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await apiClient.post('/auth/refresh-token', { refreshToken });
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        error.config.headers.Authorization = `Bearer ${token}`;
        
        return apiClient(error.config);
      } catch (refreshError) {
        return Promise.reject(errorHandler.handle(refreshError));
      }
    }

    logger.error(`API Error: ${endpoint}`, error, {
      duration,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(errorHandler.handle(error));
  }
);

export default apiClient; 