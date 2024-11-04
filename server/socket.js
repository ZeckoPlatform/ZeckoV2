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
      // Get token from auth object or headers
      const authHeader = socket.handshake.headers.authorization;
      const authToken = socket.handshake.auth.token;
      
      let token = authHeader ? authHeader.split(' ')[1] : authToken;

      if (!token) {
        console.log('No token provided');
        return next(new Error('Authentication token missing'));
      }

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

    // Handle activity updates
    socket.on('activity', async (data) => {
      try {
        // Emit to user's room
        io.to(userRoom).emit('activityUpdate', {
          ...data,
          timestamp: new Date(),
          userId: socket.user._id
        });
      } catch (error) {
        console.error('Activity broadcast error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
      socket.leave(userRoom);
    });
  });

  return io;
}

module.exports = initializeSocket; 