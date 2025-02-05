const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Notification = require('../models/notificationModel');
const Task = require('../models/taskModel');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

// Helper functions
const calculateTotalEarnings = async (userId) => {
    const orders = await Order.find({ seller: userId, status: 'completed' });
    return orders.reduce((total, order) => total + order.total, 0);
};

const getRecentOrders = async (userId) => {
    return Order.find({ seller: userId })
        .sort('-createdAt')
        .limit(5)
        .populate('buyer', 'name email');
};

const fetchRecentActivity = async (userId) => {
    // Implement activity tracking logic
    return [];
};

const calculateUserStats = async (userId) => {
    // Implement user statistics calculation
    return {};
};

const calculateEarnings = async (userId) => {
    // Implement detailed earnings calculation
    return {};
};

// Get dashboard overview
exports.getOverview = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const [products, orders, tasks] = await Promise.all([
        Product.countDocuments({ seller: userId }),
        Order.countDocuments({ seller: userId }),
        Task.countDocuments({ user: userId, status: 'pending' })
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            totalProducts: products,
            totalOrders: orders,
            pendingTasks: tasks
        }
    });
});

// Get recent activity
exports.getRecentActivity = catchAsync(async (req, res) => {
    const userId = req.user.id;
    
    const [recentOrders, recentProducts, recentTasks] = await Promise.all([
        Order.find({ seller: userId }).sort('-createdAt').limit(5),
        Product.find({ seller: userId }).sort('-createdAt').limit(5),
        Task.find({ user: userId }).sort('-createdAt').limit(5)
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            orders: recentOrders,
            products: recentProducts,
            tasks: recentTasks
        }
    });
});

// Get user statistics
exports.getUserStats = catchAsync(async (req, res) => {
    const userId = req.user.id;
    
    const stats = {
        products: await Product.countDocuments({ seller: userId }),
        orders: await Order.countDocuments({ seller: userId }),
        tasks: await Task.countDocuments({ user: userId })
    };

    res.status(200).json({
        status: 'success',
        data: stats
    });
});

// Get earnings overview
exports.getEarningsOverview = catchAsync(async (req, res) => {
    const userId = req.user.id;
    
    const orders = await Order.find({ 
        seller: userId,
        status: 'completed'
    });

    const earnings = orders.reduce((acc, order) => acc + order.total, 0);

    res.status(200).json({
        status: 'success',
        data: {
            totalEarnings: earnings,
            orderCount: orders.length
        }
    });
});

const getNotifications = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const notifications = await Notification.find({ user: userId })
        .sort('-createdAt')
        .limit(10);

    res.status(200).json({
        status: 'success',
        data: notifications
    });
});

const markNotificationAsRead = catchAsync(async (req, res) => {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
    );

    if (!notification) {
        throw new ApiError('Notification not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: notification
    });
});

// Get tasks
exports.getTasks = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const tasks = await Task.find({ user: userId }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        data: tasks
    });
});

// Update task status
exports.updateTaskStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );

    if (!task) {
        throw new ApiError('Task not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: task
    });
});

module.exports = {
    getOverview,
    getRecentActivity,
    getUserStats,
    getEarningsOverview,
    getNotifications,
    markNotificationAsRead,
    getTasks,
    updateTaskStatus
};