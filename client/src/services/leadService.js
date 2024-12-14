import { api } from '../contexts/AuthContext';

export const getUserJobs = async (userId) => {
  try {
    const response = await api.get(`/jobs/user/${userId}`);
    return response.data;
  } catch (error) {
    if (error.isTimeout) {
      console.error('Job fetch timeout:', error);
      return { jobs: [], error: 'Request timed out. Please try again.' };
    }
    throw error;
  }
}; 