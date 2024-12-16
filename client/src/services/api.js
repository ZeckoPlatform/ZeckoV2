import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add to api.js
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return Promise.reject(new Error('Authentication required'));
  }

  const errorMessage = error.response?.data?.message 
    || error.message 
    || 'An unexpected error occurred';

  return Promise.reject(new Error(errorMessage));
};

// Add response interceptor
api.interceptors.response.use(
  response => response,
  error => handleApiError(error)
);

export default api;