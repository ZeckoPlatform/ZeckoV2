const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "https://zeckov2-deceb43992ac.herokuapp.com",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Check auth header first, then query
      let token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      // Remove Bearer prefix if present
      token = token.replace('Bearer ', '');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.userId) {
        return next(new Error('Invalid token'));
      }

      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user._id);

    // Join user's personal room
    socket.join(socket.user._id.toString());

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
    });

    // Handle activity events
    socket.on('activity', async (data) => {
      try {
        // Process activity
        console.log('Activity received:', data);
        // Broadcast to user's room
        io.to(socket.user._id.toString()).emit('activityUpdate', data);
      } catch (error) {
        console.error('Activity processing error:', error);
      }
    });
  });

  return io;
}

module.exports = initializeSocket; 