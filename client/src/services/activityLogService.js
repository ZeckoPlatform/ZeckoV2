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
      
      // Create socket connection with token in query AND auth
      this.socket = io(API_URL, {
        auth: {
          token: `Bearer ${token}`
        },
        query: {
          token: `Bearer ${token}`
        },
        extraHeaders: {
          'Authorization': `Bearer ${token}`
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxRetries,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      // Connection event handlers
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
          console.log(`Retry attempt ${this.retryAttempts} of ${this.maxRetries}`);
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.reconnect();
          }, 2000);
        } else {
          console.log('Max retry attempts reached');
        }
      });

      // Activity event handlers
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

      // Error handler
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
    // Send current connection status
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
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.retryAttempts = 0;
    this.updateConnectionStatus(false);
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

  async reconnect() {
    console.log('Reconnecting socket...');
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.initializeSocket();
  }

  // Helper method to check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
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
}

export const activityLogService = new ActivityLogService();