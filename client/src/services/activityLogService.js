import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://zeckov2-deceb43992ac.herokuapp.com'
  : 'http://localhost:5000';

export const activityLogService = {
  async logActivity(activityData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get user agent
      const userAgent = navigator.userAgent;

      // Prepare the activity log data
      const logData = {
        ...activityData,
        userAgent,
        ip: window.clientIP || 'unknown', // You might want to fetch this from your server
        metadata: {
          browser: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      };

      const response = await axios.post(
        `${API_URL}/api/activity-logs`,
        logData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Activity logged successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  async getActivityLogs() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const response = await axios.get(
        `${API_URL}/api/activity-logs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }
}; 