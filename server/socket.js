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

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
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

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
      socket.leave(userRoom);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

module.exports = initializeSocket; 