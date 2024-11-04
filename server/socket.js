const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
const ActivityLog = require('./models/ActivityLog');

function initializeSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "https://zeckov2-deceb43992ac.herokuapp.com",
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Authorization"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Debug middleware
  io.use((socket, next) => {
    console.log('Socket connection attempt with:', {
      headers: socket.handshake.headers,
      auth: socket.handshake.auth,
      query: socket.handshake.query
    });
    next();
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('No token provided');
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.userId) {
        console.log('Invalid token:', decoded);
        return next(new Error('Invalid token'));
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found:', decoded.userId);
        return next(new Error('User not found'));
      }

      socket.user = user;
      console.log('Socket authenticated for user:', user._id);
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.user._id);

    // Join user's room
    const userRoom = `user_${socket.user._id}`;
    socket.join(userRoom);

    try {
      // Send initial activities on connection
      const activities = await ActivityLog.find({ userId: socket.user._id })
        .sort({ timestamp: -1 })
        .limit(100);
      socket.emit('initialActivities', activities);
    } catch (error) {
      console.error('Error fetching initial activities:', error);
    }

    // Send connection status
    socket.emit('connectionStatus', true);

    // Handle activity updates
    socket.on('activity', async (data) => {
      try {
        console.log('Activity received:', data);
        
        // Save activity to database
        if (data.save) {
          const log = new ActivityLog({
            userId: socket.user._id,
            type: data.type,
            description: data.description,
            timestamp: new Date(),
            metadata: data.metadata || {}
          });
          await log.save();
        }

        // Broadcast to user's room
        io.to(userRoom).emit('activityUpdate', {
          ...data,
          userId: socket.user._id,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error handling activity:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
      socket.leave(userRoom);
    });

    socket.on('error', (error) => {
      console.error('Socket error for user:', socket.user._id, error);
    });
  });

  return io;
}

module.exports = initializeSocket;