import io from 'socket.io-client';
import { SOCKET_URL, SOCKET_CONFIG } from '../config/socketConfig';

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = new Set();
    this.userId = null;
  }

  initialize(userId) {
    this.userId = userId;
    return this.connect();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log('Connecting to socket:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      ...SOCKET_CONFIG,
      auth: { token, userId: this.userId }
    });

    this.setupListeners();
    return this.socket;
  }

  setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      if (this.userId) {
        this.socket.emit('authenticate', { userId: this.userId });
      }
    });

    this.socket.on('notification', (data) => {
      console.log('Received notification:', data);
      this.handlers.forEach(handler => handler(data));
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
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
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();