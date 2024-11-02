import io from 'socket.io-client';
import { SOCKET_URL, SOCKET_CONFIG } from '../config/socketConfig';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    console.log('Initializing socket connection to:', SOCKET_URL);
    
    socket = io(SOCKET_URL, SOCKET_CONFIG);

    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected and reset');
  }
};

export const subscribeToActivityUpdates = (callback) => {
  const socket = getSocket();
  
  socket.on('activityUpdate', (data) => {
    if (callback) {
      callback(data);
    }
  });

  return () => {
    socket.off('activityUpdate');
  };
};

export const unsubscribeFromActivityUpdates = () => {
  const socket = getSocket();
  if (socket) {
    socket.off('activityUpdate');
  }
};

export const subscribeToUserUpdates = (callback) => {
  const socket = getSocket();
  
  socket.on('userUpdate', (data) => {
    if (callback) {
      callback(data);
    }
  });

  return () => {
    socket.off('userUpdate');
  };
};

export const emitActivity = (activityData) => {
  const socket = getSocket();
  socket.emit('newActivity', activityData);
};
