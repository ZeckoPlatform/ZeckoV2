import { api, endpoints } from './api';

export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get(endpoints.users.profile);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // other methods...
};