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

    // Close existing connection if any
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    try {
      console.log('Initializing socket with token:', token.substring(0, 20) + '...');
      
      this.socket = io(API_URL, {
        auth: {
          token: `Bearer ${token}` // Add Bearer prefix
        },
        extraHeaders: {
          Authorization: `Bearer ${token}`
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { token: `Bearer ${token}` } // Add token to query params
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.updateConnectionStatus(true);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.updateConnectionStatus(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        this.updateConnectionStatus(false);
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        this.updateConnectionStatus(false);
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
      this.updateConnectionStatus(false);
    }
  }

  onConnectionStatus(callback) {
    this.connectionCallback = callback;
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
    if (!this.socket) {
      console.log('No socket connection available');
      return;
    }

    this.socket.on('activityUpdate', (activities) => {
      console.log('Received activity update:', activities);
      callback(activities);
    });
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