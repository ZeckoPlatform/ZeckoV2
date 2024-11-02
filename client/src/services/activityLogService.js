import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ActivityLogService {
  async getActivities(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/api/activity-logs`, {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  async logActivity(type, description) {
    try {
      const response = await axios.post(`${API_URL}/api/activity-logs`, 
        { type, description },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  async getActivityStats() {
    try {
      const response = await axios.get(`${API_URL}/api/activity-logs/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  }

  async deleteActivity(id) {
    try {
      const response = await axios.delete(`${API_URL}/api/activity-logs/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }
}

export const activityLogService = new ActivityLogService(); 