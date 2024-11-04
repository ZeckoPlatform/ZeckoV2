import io from 'socket.io-client';
import { API_URL } from '../config/constants';

class ActivityLogService {
  constructor() {
    this.socket = null;
    this.connectionCallback = null;
    this.activityCallback = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
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
          token: token // Send raw token
        },
        extraHeaders: {
          Authorization: `Bearer ${token}`
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxRetries,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.retryAttempts = 0;
        this.updateConnectionStatus(true);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.updateConnectionStatus(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        this.updateConnectionStatus(false);
        
        if (this.retryAttempts < this.maxRetries) {
          this.retryAttempts++;
          setTimeout(() => this.initializeSocket(), 2000);
        }
      });

      this.socket.on('initialActivities', (activities) => {
        console.log('Received initial activities:', activities);
        if (this.activityCallback) {
          this.activityCallback(activities);
        }
      });

      this.socket.on('activityUpdate', (activity) => {
        console.log('Received activity update:', activity);
        if (this.activityCallback) {
          this.activityCallback([activity]);
        }
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
    this.retryAttempts = 0;
  }

  subscribeToUpdates(callback) {
    this.activityCallback = callback;
    if (!this.socket) {
      console.log('No socket connection available');
      return;
    }
  }

  unsubscribeFromUpdates() {
    this.activityCallback = null;
    if (this.socket) {
      this.socket.off('activityUpdate');
      this.socket.off('initialActivities');
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

  async reconnect() {
    this.disconnect();
    this.retryAttempts = 0;
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.initializeSocket();
  }
}

export const activityLogService = new ActivityLogService();