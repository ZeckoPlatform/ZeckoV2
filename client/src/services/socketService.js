import io from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://zeckov2-deceb43992ac.herokuapp.com'
  : 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = new Set();
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    console.log('Connecting to socket:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupListeners();
    return this.socket;
  }

  setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
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
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService(); 