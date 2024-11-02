import io from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://zeckov2-deceb43992ac.herokuapp.com'
  : 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.subscribers = new Set();
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    this.setupListeners();
    return this.socket;
  }

  setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('notification', (data) => {
      this.notifySubscribers(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(data) {
    this.subscribers.forEach(callback => callback(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscribers.clear();
  }
}

export const socketService = new SocketService(); 