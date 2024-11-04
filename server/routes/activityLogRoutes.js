const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// Debug log
console.log('Setting up activityLogRoutes');

// Get all activities for a user
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const activities = await ActivityLog.find({ userId: req.user.id })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ActivityLog.countDocuments({ userId: req.user.id });
        
        res.json({ 
            activities: activities.map(a => a.toClient()),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new activity log
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

        const log = new ActivityLog({
            userId,
            type: req.body.type,
            description: req.body.description,
            ip,
            userAgent: req.headers['user-agent'] || 'unknown',
            timestamp: req.body.timestamp || new Date(),
            metadata: req.body.metadata || {}
        });

        const savedLog = await log.save();

        // Emit real-time update
        if (req.io) {
            const userRoom = `user_${userId}`;
            req.io.to(userRoom).emit('activityUpdate', savedLog.toClient());
        }

        res.status(201).json({
            activity: savedLog.toClient()
        });
    } catch (error) {
        console.error('Error creating activity log:', error);
        res.status(500).json({ 
            error: 'Failed to create activity log',
            details: error.message
        });
    }
});

// Get recent activities (last 24 hours)
router.get('/recent', auth, async (req, res) => {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activities = await ActivityLog.find({
            userId: req.user.id || req.user._id,
            timestamp: { $gte: oneDayAgo }
        }).sort({ timestamp: -1 });
        
        res.json({ activities });
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get activity count
router.get('/count', auth, async (req, res) => {
    try {
        const count = await ActivityLog.countDocuments({
            userId: req.user.id || req.user._id
        });
        res.json({ count });
    } catch (error) {
        console.error('Error getting activity count:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete old activities (admin only)
router.delete('/cleanup', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await ActivityLog.deleteMany({
            timestamp: { $lt: thirtyDaysAgo }
        });

        res.json({
            message: 'Cleanup completed',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error during cleanup:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug log
console.log('ActivityLog routes configured');

module.exports = router;