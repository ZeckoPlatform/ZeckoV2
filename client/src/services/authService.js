import api, { endpoints } from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const loginData = {
        email: credentials.email,
        password: credentials.password
      };

      if (!loginData.email || !loginData.password) {
        throw new Error('Email and password are required');
      }

      const response = await api.post(endpoints.auth.login, loginData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(endpoints.auth.logout);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
    }
  }
};

// ... other auth functions 