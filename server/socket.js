const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
const BusinessUser = require('./models/businessUserModel');
const VendorUser = require('./models/vendorUserModel');
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

  // Debug middleware with enhanced logging
  io.use((socket, next) => {
    console.log('Socket connection attempt:', {
      id: socket.id,
      timestamp: new Date().toISOString(),
      headers: socket.handshake.headers,
      auth: socket.handshake.auth,
      query: socket.handshake.query,
      transport: socket.conn.transport.name
    });
    next();
  });

  // Enhanced authentication middleware with rate limiting
  const authAttempts = new Map();
  io.use(async (socket, next) => {
    try {
      const clientIp = socket.handshake.address;
      const attempts = authAttempts.get(clientIp) || { count: 0, timestamp: Date.now() };

      // Reset attempts after 15 minutes
      if (Date.now() - attempts.timestamp > 15 * 60 * 1000) {
        attempts.count = 0;
        attempts.timestamp = Date.now();
      }

      if (attempts.count >= 5) {
        console.log(`Rate limit exceeded for IP: ${clientIp}`);
        return next(new Error('Too many authentication attempts'));
      }

      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('No token provided');
        attempts.count++;
        authAttempts.set(clientIp, attempts);
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.userId) {
        console.log('Invalid token:', decoded);
        attempts.count++;
        authAttempts.set(clientIp, attempts);
        return next(new Error('Invalid token'));
      }

      let user;
      switch(decoded.accountType) {
        case 'business':
          user = await BusinessUser.findById(decoded.userId);
          break;
        case 'vendor':
          user = await VendorUser.findById(decoded.userId);
          break;
        default:
          user = await User.findById(decoded.userId);
      }

      if (!user) {
        console.log('User not found:', decoded.userId);
        attempts.count++;
        authAttempts.set(clientIp, attempts);
        return next(new Error('User not found'));
      }

      // Reset attempts on successful authentication
      authAttempts.delete(clientIp);

      socket.user = {
        _id: user._id,
        accountType: decoded.accountType,
        role: decoded.role
      };
      
      console.log('Socket authenticated for user:', socket.user);
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

    // Track user's active connections
    const userConnections = io.sockets.adapter.rooms.get(userRoom)?.size || 0;

    try {
      // Send initial activities with pagination
      const page = 1;
      const limit = 100;
      const activities = await ActivityLog.find({ userId: socket.user._id })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      socket.emit('initialActivities', {
        activities,
        pagination: {
          page,
          limit,
          hasMore: activities.length === limit
        }
      });

      // Notify about active connections
      io.to(userRoom).emit('connectionStatus', { 
        connected: true, 
        userId: socket.user._id,
        accountType: socket.user.accountType,
        activeConnections: userConnections
      });
    } catch (error) {
      console.error('Error fetching initial activities:', error);
      socket.emit('error', { message: 'Failed to fetch activities' });
    }

    socket.on('activity', async (data) => {
      try {
        console.log('Activity received:', data);
        
        if (data.save) {
          const log = new ActivityLog({
            userId: socket.user._id,
            type: data.type,
            description: data.description,
            timestamp: new Date(),
            metadata: data.metadata || {},
            deviceInfo: {
              transport: socket.conn.transport.name,
              userAgent: socket.handshake.headers['user-agent']
            }
          });
          await log.save();
        }

        io.to(userRoom).emit('activityUpdate', {
          ...data,
          userId: socket.user._id,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error handling activity:', error);
        socket.emit('error', { message: 'Failed to process activity' });
      }
    });

    // Handle pagination requests for activities
    socket.on('getMoreActivities', async ({ page, limit = 100 }) => {
      try {
        const activities = await ActivityLog.find({ userId: socket.user._id })
          .sort({ timestamp: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        socket.emit('moreActivities', {
          activities,
          pagination: {
            page,
            limit,
            hasMore: activities.length === limit
          }
        });
      } catch (error) {
        console.error('Error fetching more activities:', error);
        socket.emit('error', { message: 'Failed to fetch more activities' });
      }
    });

    socket.on('join:userType', (userType, userId) => {
      if (userType && userId) {
        socket.join(`${userType}:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
      socket.leave(userRoom);
      
      // Update active connections count
      const remainingConnections = io.sockets.adapter.rooms.get(userRoom)?.size || 0;
      if (remainingConnections > 0) {
        io.to(userRoom).emit('connectionStatus', {
          connected: true,
          userId: socket.user._id,
          accountType: socket.user.accountType,
          activeConnections: remainingConnections
        });
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error for user:', socket.user._id, error);
    });
  });

  // Cleanup interval for rate limiting data
  setInterval(() => {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    for (const [ip, data] of authAttempts.entries()) {
      if (data.timestamp < fifteenMinutesAgo) {
        authAttempts.delete(ip);
      }
    }
  }, 5 * 60 * 1000); // Run every 5 minutes

  return io;
}

module.exports = initializeSocket;