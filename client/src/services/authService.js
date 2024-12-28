import api from './api';
import { endpoints } from './api';

export const authService = {
  login: async (credentials) => {
    try {
      console.log('AuthService: Attempting login with:', credentials);
      const response = await api.post(endpoints.auth.login, credentials);
      
      if (response.data.requiresTwoFactor) {
        return {
          requiresTwoFactor: true,
          tempToken: response.data.tempToken
        };
      }

      if (!response.data || !response.data.token) {
        throw new Error('Invalid response format from server');
      }

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      console.log('AuthService: Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again later.');
      } else {
        throw new Error(error.message || 'Login failed');
      }
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || error.message;
    }
  },

  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || error.message;
    }
  },

  logout: async () => {
    try {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  verify2FA: async (code, tempToken) => {
    try {
      const response = await api.post(endpoints.auth.verify2FA, { code }, {
        headers: { Authorization: `Bearer ${tempToken}` }
      });
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response format from server');
      }

      // Set the new token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid verification code');
      }
      throw error;
    }
  }
};

// ... other auth functions 