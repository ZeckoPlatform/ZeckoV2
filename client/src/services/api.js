import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  validateStatus: status => status >= 200 && status < 500
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add timestamp to prevent caching
  config.params = { ...config.params, _t: Date.now() };
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => {
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Invalid response type: expected JSON, got HTML');
    }
    return response;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(error.response.data);
          break;
      }
    } else if (error.request) {
      console.error('No response received:', {
        url: error.config.url,
        method: error.config.method
      });
    }
    return Promise.reject(error);
  }
);

// API endpoints with better error handling
export const fetchJobs = async () => {
  try {
    const response = await api.get('/jobs', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', {
      message: error.message,
      url: error.config?.url,
      response: error.response?.data
    });
    throw new Error('Failed to fetch jobs. Please try again later.');
  }
};

export const fetchContractors = async () => {
  try {
    const response = await api.get('/contractors', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contractors:', {
      message: error.message,
      url: error.config?.url,
      response: error.response?.data
    });
    throw new Error('Failed to fetch contractors. Please try again later.');
  }
};

// Test endpoint to verify API connection
export const testApiConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('API connection test failed:', error);
    throw error;
  }
};

export default api; 