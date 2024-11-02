import io from 'socket.io-client';
import { Subject } from 'rxjs';

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://zeckov2-deceb43992ac.herokuapp.com'
  : 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.notificationSubject = new Subject();
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

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
      this.notificationSubject.next(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  getNotificationObservable() {
    return this.notificationSubject.asObservable();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    // Don't complete the subject, just clean up socket
  }
}

export const socketService = new SocketService(); 