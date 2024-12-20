import io from 'socket.io-client';
import { API_URL } from '../config/constants';

class ActivityLogService {
  constructor() {
    this.socket = null;
    this.connectionCallback = null;
    this.activityCallback = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.reconnectTimeout = null;
  }

  async initializeSocket() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token available for socket connection');
        this.updateConnectionStatus(false);
        return;
      }

      // Prevent multiple connections
      if (this.socket?.connected) {
        console.log('Socket already connected');
        return;
      }

      // Clean up existing socket
      this.cleanupSocket();

      console.log('Initializing socket connection with token');
      
      this.socket = io(API_URL, {
        auth: { token },
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxRetries,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      this.setupSocketListeners();

    } catch (error) {
      console.error('Socket initialization error:', error);
      this.updateConnectionStatus(false);
      throw error; // Propagate error for better handling
    }
  }

  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.retryAttempts = 0;
      this.updateConnectionStatus(true);
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
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
        console.log(`Retry attempt ${this.retryAttempts} of ${this.maxRetries}`);
        this.reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect...');
          this.reconnect();
        }, 2000);
      }
    });

    this.socket.on('initialActivities', (activities) => {
      console.log('Received initial activities');
      if (this.activityCallback) {
        this.activityCallback(activities);
      }
    });

    this.socket.on('activityUpdate', (activity) => {
      console.log('Received activity update');
      if (this.activityCallback) {
        this.activityCallback([activity]);
      }
    });
  }

  cleanupSocket() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  onConnectionStatus(callback) {
    this.connectionCallback = callback;
    if (this.socket) {
      callback(this.socket.connected);
    } else {
      callback(false);
    }
  }

  updateConnectionStatus(status) {
    if (this.connectionCallback) {
      this.connectionCallback(status);
    }
  }

  disconnect() {
    this.cleanupSocket();
    this.retryAttempts = 0;
    this.updateConnectionStatus(false);
  }

  async reconnect() {
    console.log('Reconnecting socket...');
    this.cleanupSocket();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.initializeSocket();
  }

  subscribeToUpdates(callback) {
    this.activityCallback = callback;
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
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/activity-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
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

  async logActivity(activityData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Send to server via REST API
      const response = await fetch(`${API_URL}/api/activity-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      const data = await response.json();

      // Emit via socket if connected
      if (this.socket?.connected) {
        this.socket.emit('activity', {
          ...activityData,
          save: false // Already saved via REST API
        });
      }

      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  // Helper method to check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

export const activityLogService = new ActivityLogService();