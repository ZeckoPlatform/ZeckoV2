import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor with timeout handling
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add cache control headers
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor with retry logic
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' && originalRequest._retry !== true) {
      originalRequest._retry = true;
      return api(originalRequest);
    }

    // Handle 503 errors
    if (error.response?.status === 503 && originalRequest._retry !== true) {
      originalRequest._retry = true;
      return new Promise(resolve => setTimeout(() => resolve(api(originalRequest)), 2000));
    }

    return Promise.reject(error);
  }
);

// Jobs API with optimized endpoints
export const jobsApi = {
  getFeatured: async () => {
    try {
      const response = await api.get('/jobs/featured', { 
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      return [];
    }
  },
  getUserJobs: (userId) => api.get(`/jobs/user/${userId}`),
  create: (jobData) => api.post('/jobs', jobData),
  update: (jobId, jobData) => api.put(`/jobs/${jobId}`, jobData),
  delete: (jobId) => api.delete(`/jobs/${jobId}`)
};

// Featured items service with optimized fetching
export const getFeaturedItems = async () => {
  try {
    // Use Promise.race to implement a timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const fetchPromise = Promise.all([
      api.get('/jobs/featured', { timeout: 5000 })
        .catch(() => ({ data: [] })), // Fallback for jobs
      api.get('/contractors/featured', { timeout: 5000 })
        .catch(() => ({ data: [] })) // Fallback for contractors
    ]);

    const [jobsResponse, contractorsResponse] = await Promise.race([
      fetchPromise,
      timeoutPromise
    ]);

    return {
      jobs: jobsResponse.data || [],
      contractors: contractorsResponse.data || []
    };
  } catch (error) {
    console.error('Error fetching featured items:', error);
    toast.error('Some content failed to load. Please refresh the page.');
    return {
      jobs: [],
      contractors: []
    };
  }
};

export default api; 