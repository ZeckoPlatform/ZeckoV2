import { api } from '../contexts/AuthContext';

export const getUserLeads = async (userId) => {
  try {
    const response = await api.get(`/leads/user/${userId}`);
    return response.data;
  } catch (error) {
    if (error.isTimeout) {
      console.error('Lead fetch timeout:', error);
      return { leads: [], error: 'Request timed out. Please try again.' };
    }
    throw error;
  }
}; 