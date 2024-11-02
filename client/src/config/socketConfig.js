const getSocketUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  return 'https://zeckov2-deceb43992ac.herokuapp.com';
};

export const SOCKET_URL = getSocketUrl();

export const SOCKET_CONFIG = {
  transports: ['websocket'],
  autoConnect: true,
  forceNew: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  path: '/socket.io'
}; 