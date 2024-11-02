import io from 'socket.io-client';
import { SOCKET_URL, SOCKET_CONFIG } from '../config/socketConfig';

let socket = null;

const initializeSocket = () => {
  if (!socket) {
    const url = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000'
      : 'https://zeckov2-deceb43992ac.herokuapp.com';

    console.log('Initializing notification socket to:', url);
    
    socket = io(url, {
      ...SOCKET_CONFIG,
      transports: ['websocket'],
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('Notification socket connected to:', url);
    });

    socket.on('connect_error', (error) => {
      console.error('Notification socket connection error:', error.message);
    });
  }
  return socket;
};

export const initializeNotifications = (userId) => {
  const currentSocket = socket || initializeSocket();
  
  if (currentSocket && userId) {
    console.log('Setting up notifications for user:', userId);
    currentSocket.emit('authenticate', { userId });
  }
};

export const disconnectNotifications = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Notification socket disconnected and reset');
  }
};

// Initialize socket when the service is imported
initializeSocket();
export default socket;