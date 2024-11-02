import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let socket;

export const initSocket = () => {
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
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
