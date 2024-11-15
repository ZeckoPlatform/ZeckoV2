import axios from 'axios';
import { errorHandler } from '../error/ErrorHandler';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add timestamp to prevent caching
    config.params = { ...config.params, _t: Date.now() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Received HTML response instead of JSON');
    }
    return response;
  },
  (error) => {
    return Promise.reject(errorHandler.handle(error, toast));
  }
);

// API methods
export const apiService = {
  async fetchJobs() {
    try {
      const response = await api.get('/jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  async fetchContractors() {
    try {
      const response = await api.get('/contractors');
      return response.data;
    } catch (error) {
      console.error('Error fetching contractors:', error);
      throw error;
    }
  },

  // Add health check endpoint
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

export default apiService; 