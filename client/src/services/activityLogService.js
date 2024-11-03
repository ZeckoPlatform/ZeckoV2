import axios from 'axios';
import { API_URL } from '../config/constants';

class ActivityLogService {
  async getActivityLog(filters) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/activity-logs`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }
  }

  async createActivity(activityData) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/activity-logs`, activityData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }
}

export const activityLogService = new ActivityLogService(); 