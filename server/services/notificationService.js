const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// Create notification
const createNotification = async (userId, type, message, data = {}) => {
    try {
        const notification = new Notification({
            user: userId,
            type,
            message,
            data
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Get user notifications
const getUserNotifications = async (userId) => {
    try {
        return await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
        return notification;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { user: userId, read: false },
            { read: true }
        );
        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

// Delete notification
const deleteNotification = async (notificationId) => {
    try {
        await Notification.findByIdAndDelete(notificationId);
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
}; 