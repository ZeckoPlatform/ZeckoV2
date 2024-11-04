import io from 'socket.io-client';
import { API_URL } from '../config/constants';

class ActivityLogService {
  constructor() {
    this.socket = null;
    this.connectionCallback = null;
  }

  initializeSocket() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping socket initialization');
      this.updateConnectionStatus(false);
      return;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      this.updateConnectionStatus(true);
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
        this.updateConnectionStatus(true);
      });

      this.socket.on('disconnect', () => {
        console.log('Activity log socket disconnected');
        this.updateConnectionStatus(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Activity log socket error:', error.message);
        this.updateConnectionStatus(false);
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
      this.updateConnectionStatus(false);
    }
  }

  onConnectionStatus(callback) {
    this.connectionCallback = callback;
    // Initial status
    this.updateConnectionStatus(this.socket?.connected || false);
  }

  updateConnectionStatus(status) {
    if (this.connectionCallback) {
      this.connectionCallback(status);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.updateConnectionStatus(false);
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
      const response = await fetch(`${API_URL}/api/activity-logs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity log');
      }

      const data = await response.json();
      return data.activities || [];
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }
  }
}

export const activityLogService = new ActivityLogService(); 