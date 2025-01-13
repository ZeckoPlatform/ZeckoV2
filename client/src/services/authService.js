import api, { endpoints } from './api';

export const authService = {
  login: async (credentials) => {
    try {
      console.log('Login attempt with:', credentials);
      const response = await api.post(endpoints.auth.login, credentials);
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