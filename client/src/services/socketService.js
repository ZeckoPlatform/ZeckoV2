import io from 'socket.io-client';
import { SOCKET_URL, SOCKET_CONFIG } from '../config/socketConfig';

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = new Set();
    this.userId = null;
    this.isInitialized = false;
    this.connectAttempts = 0;
    this.maxConnectAttempts = 3;
  }

  initialize(userId) {
    if (!userId) {
      console.error('Cannot initialize socket without userId');
      return;
    }

    if (this.isInitialized && this.userId === userId && this.socket?.connected) {
      return;
    }

    this.disconnect(); // Clean up any existing connection
    this.userId = userId;
    this.connectSocket();
  }

  connectSocket() {
    try {
      const token = localStorage.getItem('token');
      if (!token || !this.userId) return;

      this.socket = io(SOCKET_URL, {
        ...SOCKET_CONFIG,
        auth: { token, userId: this.userId }
      });

      this.setupListeners();
      this.isInitialized = true;
      this.connectAttempts = 0;
    } catch (error) {
      console.error('Socket connection error:', error);
      this.handleConnectionError();
    }
  }

  setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connectAttempts = 0;
      if (this.userId) {
        this.socket.emit('authenticate', { userId: this.userId });
      }
    });

    this.socket.on('notification', (data) => {
      this.handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error handling notification:', error);
        }
      });
    });

    this.socket.on('connect_error', this.handleConnectionError.bind(this));
    this.socket.on('error', this.handleConnectionError.bind(this));
  }

  handleConnectionError(error) {
    this.connectAttempts++;
    if (this.connectAttempts >= this.maxConnectAttempts) {
      this.disconnect();
      console.error('Max connection attempts reached');
    }
  }

  addNotificationHandler(handler) {
    if (typeof handler !== 'function') {
      console.error('Notification handler must be a function');
      return () => {};
    }
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.handlers.clear();
    this.userId = null;
    this.isInitialized = false;
    this.connectAttempts = 0;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();