const Notification = require('../models/Notification');

module.exports = {
  // Get user notifications
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({ 
        user: req.user.id,
        read: false 
      }).sort({ createdAt: -1 });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}; 