import { api, endpoints } from './api';

export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};