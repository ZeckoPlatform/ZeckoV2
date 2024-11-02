const { Server } = require('socket.io');
let io;

const socketHelpers = {
    init: (server) => {
        io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });

        global.connectedClients = new Map();

        io.on('connection', (socket) => {
            console.log('New client connected');

            socket.on('authenticate', (token) => {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    socket.userId = decoded.userId;
                    socket.userType = decoded.userType;

                    if (!global.connectedClients.has(decoded.userId)) {
                        global.connectedClients.set(decoded.userId, new Set());
                    }
                    global.connectedClients.get(decoded.userId).add(socket);

                    if (decoded.userType === 'admin') {
                        socketHelpers.emitAdminStats(socket);
                    }

                    console.log(`User ${decoded.userId} authenticated`);
                    socket.emit('authenticated', { success: true });
                } catch (error) {
                    console.error('Authentication error:', error);
                    socket.emit('authenticated', { success: false, error: 'Invalid token' });
                }
            });

            socket.on('disconnect', () => {
                if (socket.userId) {
                    const userSockets = global.connectedClients.get(socket.userId);
                    if (userSockets) {
                        userSockets.delete(socket);
                        if (userSockets.size === 0) {
                            global.connectedClients.delete(socket.userId);
                        }
                    }
                    console.log(`User ${socket.userId} disconnected`);
                }
                console.log('Client disconnected');
            });

            socket.on('newActivity', (activityData) => {
                socketHelpers.broadcastActivity(activityData);
            });
        });

        return io;
    },

    emitAdminStats: async (socket) => {
        try {
            const stats = await require('./controllers/adminController').getAdminStats();
            socket.emit('admin_stats_update', stats);
        } catch (error) {
            console.error('Error emitting admin stats:', error);
        }
    },

    notifyAdmins: (type, notification) => {
        if (!global.connectedClients) return;
        global.connectedClients.forEach((sockets, userId) => {
            sockets.forEach(socket => {
                if (socket.userType === 'admin') {
                    socket.emit(type, notification);
                }
            });
        });
    },

    sendNotificationToUser: (userId, notification) => {
        if (!global.connectedClients) return;
        const userSockets = global.connectedClients.get(userId);
        if (userSockets) {
            userSockets.forEach(socket => {
                socket.emit('notification', notification);
            });
        }
    },

    broadcastActivity: (activity) => {
        if (!io) return;
        io.emit('activityUpdate', activity);
    },

    sendActivityNotification: (userId, activity) => {
        if (!global.connectedClients) return;
        const userSockets = global.connectedClients.get(userId);
        if (userSockets) {
            userSockets.forEach(socket => {
                socket.emit('activity_update', activity);
            });
        }
    },

    sendOrderNotification: (userId, orderData) => {
        if (!global.connectedClients) return;
        const userSockets = global.connectedClients.get(userId);
        if (userSockets) {
            userSockets.forEach(socket => {
                socket.emit('order_notification', orderData);
            });
        }
    },

    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized');
        }
        return io;
    }
};

module.exports = socketHelpers; 