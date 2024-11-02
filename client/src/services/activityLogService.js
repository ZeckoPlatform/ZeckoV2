import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://zeckov2-deceb43992ac.herokuapp.com'
  : 'http://localhost:5000';

export const activityLogService = {
  async logActivity(activityData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping activity log');
        return;
      }

      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded token:', decoded);

      const logData = {
        type: activityData.type.toLowerCase(),
        description: activityData.description,
        timestamp: activityData.timestamp || new Date().toISOString(),
        metadata: {
          ...activityData.metadata,
          userId: decoded.userId
        },
        userAgent: navigator.userAgent
      };

      console.log('Sending activity log:', logData);

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
      console.error('Error logging activity:', error.response?.data || error);
      return null;
    }
  }
}; 