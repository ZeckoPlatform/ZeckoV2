import io from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
  socket = io('http://localhost:5000', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  return socket;
};

export const subscribeToNotifications = (callback) => {
  if (!socket) {
    console.error('Socket not initialized. Call initializeSocket first.');
    return;
  }

  socket.on('notification', callback);
};

export default socket;
