import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  validateStatus: status => status >= 200 && status < 500,
  timeout: 15000
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add cache control headers
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  config.headers['Pragma'] = 'no-cache';
  config.headers['Expires'] = '0';
  
  // Add timestamp and environment
  config.params = { 
    ...config.params, 
    _t: Date.now(),
    env: process.env.NODE_ENV 
  };
  
  return config;
}, error => Promise.reject(error));

// Response interceptor with 304 handling
api.interceptors.response.use(
  response => {
    // Handle 304 Not Modified
    if (response.status === 304) {
      console.log('Using cached response for:', response.config.url);
      return response;
    }

    const contentType = response.headers['content-type'];
    if (contentType?.includes('text/html')) {
      console.error('Received HTML response:', {
        url: response.config.url,
        status: response.status,
        contentType
      });
      throw new Error('Invalid response type: expected JSON, got HTML');
    }
    return response;
  },
  error => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    };

    console.error('API Error:', errorDetails);

    // Don't show error toast for 304 responses
    if (error.response?.status === 304) {
      return Promise.resolve(error.response);
    }

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
          toast.error(error.response.data?.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const fetchJobs = async (featured = false) => {
  try {
    const endpoint = featured ? '/jobs/featured' : '/jobs';
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', {
      message: error.message,
      url: error.config?.url,
      response: error.response?.data
    });
    throw error;
  }
};

export const fetchContractors = async (featured = false) => {
  try {
    const endpoint = featured ? '/contractors/featured' : '/contractors';
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching contractors:', {
      message: error.message,
      url: error.config?.url,
      response: error.response?.data
    });
    throw error;
  }
};

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