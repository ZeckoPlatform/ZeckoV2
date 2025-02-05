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

// Controller methods
const getOverview = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const overview = {
        totalProducts: await Product.countDocuments({ seller: userId }),
        totalOrders: await Order.countDocuments({ seller: userId }),
        totalEarnings: await calculateTotalEarnings(userId),
        recentOrders: await getRecentOrders(userId),
        pendingTasks: await Task.countDocuments({ user: userId, status: 'pending' })
    };

    res.status(200).json({
        status: 'success',
        data: overview
    });
});

const getRecentActivity = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const activity = await fetchRecentActivity(userId);

    res.status(200).json({
        status: 'success',
        data: activity
    });
});

const getUserStats = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const stats = await calculateUserStats(userId);

    res.status(200).json({
        status: 'success',
        data: stats
    });
});

const getEarningsOverview = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const earnings = await calculateEarnings(userId);

    res.status(200).json({
        status: 'success',
        data: earnings
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

const getTasks = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const tasks = await Task.find({ user: userId }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        data: tasks
    });
});

const updateTaskStatus = catchAsync(async (req, res) => {
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