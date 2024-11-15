import axios from 'axios';

// Get the base URL from environment variables with a fallback
const BASE_URL = process.env.REACT_APP_API_URL || 'https://zeckov2-deceb43992ac.herokuapp.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML instead of JSON');
      return Promise.reject(new Error('Invalid response type: expected JSON, got HTML'));
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Log the full error for debugging
      console.error('Full error response:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
        url: error.config.url
      });

      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
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