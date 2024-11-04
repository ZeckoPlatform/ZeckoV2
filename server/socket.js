const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "https://zeckov2-deceb43992ac.herokuapp.com",
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Authorization"]
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Get token from different possible sources
      const authHeader = socket.handshake.headers.authorization;
      const authToken = socket.handshake.auth.token;
      const queryToken = socket.handshake.query.token;
      
      let token = authHeader || authToken || queryToken;

      if (!token) {
        console.log('No token found in socket connection');
        return next(new Error('Authentication token missing'));
      }

      // Remove Bearer prefix if present
      token = token.replace('Bearer ', '');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.userId) {
        console.log('Invalid token:', decoded);
        return next(new Error('Invalid token'));
      }

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found:', decoded.userId);
        return next(new Error('User not found'));
      }

      // Attach user to socket
      socket.user = user;
      console.log('Socket authenticated for user:', user._id);
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user._id);

    // Join user's room
    const userRoom = `user_${socket.user._id}`;
    socket.join(userRoom);

    // Send initial connection status
    socket.emit('connectionStatus', true);

    // Handle activity updates
    socket.on('activity', (data) => {
      console.log('Activity received:', data);
      io.to(userRoom).emit('activityUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
      socket.leave(userRoom);
    });
  });

  return io;
}

module.exports = initializeSocket; 