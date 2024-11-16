import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.code === 'ECONNABORTED' || error.response?.status === 503) {
      const retries = error.config._retry || 0;
      if (retries < 2) {
        error.config._retry = retries + 1;
        return api(error.config);
      }
    }
    throw error;
  }
);

// Jobs API
export const jobsApi = {
  getFeatured: () => api.get('/jobs/featured'),
  getUserJobs: (userId) => api.get(`/jobs/user/${userId}`),
  create: (jobData) => api.post('/jobs', jobData),
  update: (jobId, jobData) => api.put(`/jobs/${jobId}`, jobData),
  delete: (jobId) => api.delete(`/jobs/${jobId}`)
};

// Featured items service
export const getFeaturedItems = async () => {
  try {
    const [jobsResponse] = await Promise.all([
      jobsApi.getFeatured()
    ]);

    return {
      jobs: jobsResponse.data,
      contractors: [] // Placeholder until contractors are implemented
    };
  } catch (error) {
    console.error('Error fetching featured items:', error);
    toast.error('Failed to load featured items');
    return {
      jobs: [],
      contractors: []
    };
  }
};

export default api; 