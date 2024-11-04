import axios from 'axios';
import { API_URL } from '../config/constants';
import io from 'socket.io-client';

class ActivityLogService {
  constructor() {
    this.socket = null;
  }

  initializeSocket() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping socket initialization');
      return;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      this.socket = io(API_URL, {
        auth: { token },
        extraHeaders: {
          Authorization: `Bearer ${token}`
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Activity log socket connected successfully');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Activity log socket error:', error.message);
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async refreshToken() {
    try {
      const response = await axios.post(`${API_URL}/api/users/refresh-token`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        this.reconnect();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  subscribeToUpdates(callback) {
    if (this.socket) {
      this.socket.on('activityUpdate', (activities) => {
        callback(activities);
      });
    }
  }

  unsubscribeFromUpdates() {
    if (this.socket) {
      this.socket.off('activityUpdate');
    }
  }

  async getActivityLog(filters) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/activity-logs`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: filters
      });
      return {
        activities: response.data?.activities || []
      };
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }
  }

  async createActivity(activityData) {
    try {
      const token = localStorage.getItem('token');
      
      // Send via REST API
      const response = await axios.post(`${API_URL}/api/activity-logs`, activityData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Emit via Socket
      if (this.socket) {
        this.socket.emit('activity', activityData);
      }

      return response.data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // New method for real-time filtering
  setFilters(filters) {
    if (this.socket) {
      this.socket.emit('setFilters', filters);
    }
  }

  // New method for pagination
  async getMoreActivities(page, limit) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/activity-logs`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching more activities:', error);
      throw error;
    }
  }

  // Method to reconnect socket
  reconnect() {
    console.log('Attempting to reconnect socket...');
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token available for reconnection');
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }
    this.initializeSocket();
  }

  // Method to check connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  // Method to handle token refresh
  updateToken(newToken) {
    localStorage.setItem('token', newToken);
    this.reconnect();
  }
}

export const activityLogService = new ActivityLogService(); 