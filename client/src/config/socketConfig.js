export const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://zeckov2-deceb43992ac.herokuapp.com'
  : 'http://localhost:5000';

export const SOCKET_CONFIG = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false
}; 