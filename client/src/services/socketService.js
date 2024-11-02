import io from 'socket.io-client';
import { SOCKET_URL, SOCKET_CONFIG } from '../config/socketConfig';

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = new Set();
    this.userId = null;
    this.isInitialized = false;
  }

  initialize(userId) {
    if (this.isInitialized && this.userId === userId) {
      return;
    }

    this.userId = userId;
    const token = localStorage.getItem('token');

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        ...SOCKET_CONFIG,
        auth: { token, userId }
      });

      this.setupListeners();
      this.isInitialized = true;
    }
  }

  setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      if (this.userId) {
        this.socket.emit('authenticate', { userId: this.userId });
      }
    });

    this.socket.on('notification', (data) => {
      this.handlers.forEach(handler => handler(data));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  addNotificationHandler(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.handlers.clear();
    this.userId = null;
    this.isInitialized = false;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();