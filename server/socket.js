const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "https://zeckov2-deceb43992ac.herokuapp.com",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
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
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user._id);

    // Join user's personal room
    socket.join(socket.user._id.toString());

    // Handle activity log updates
    socket.on('activity', async (activity) => {
      try {
        const user = await User.findById(socket.user._id);
        if (user) {
          // Add activity to user's log
          user.activity.push({
            type: activity.type,
            timestamp: new Date(),
            details: activity.details
          });
          await user.save();

          // Emit to user's room
          io.to(socket.user._id.toString()).emit('activityUpdate', user.activity);
        }
      } catch (error) {
        console.error('Activity log error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
    });
  });

  return io;
}

module.exports = initializeSocket; 