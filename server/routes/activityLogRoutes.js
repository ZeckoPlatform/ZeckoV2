const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// Debug log
console.log('Setting up activityLogRoutes');

// Routes
router.get('/', auth, async (req, res) => {
    try {
        const activities = await ActivityLog.find({ userId: req.user.id })
            .sort({ timestamp: -1 });
        res.json(activities);
    } catch (error) {
        console.error('Error in GET /:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        console.log('Received activity log request:', req.body);
        console.log('User from auth middleware:', req.user);
        
        if (!req.user || (!req.user.id && !req.user._id)) {
            throw new Error('User ID not found in request');
        }

        const userId = req.user.id || req.user._id;
        
        const ip = req.ip || 
                  req.connection.remoteAddress || 
                  req.headers['x-forwarded-for'] || 
                  'unknown';

        const log = new ActivityLog({
            userId: userId,
            type: req.body.type,
            description: req.body.description,
            ip: ip,
            userAgent: req.headers['user-agent'] || 'unknown',
            timestamp: req.body.timestamp || new Date(),
            metadata: req.body.metadata || {}
        });

        console.log('Creating activity log with data:', log);
        const savedLog = await log.save();
        console.log('Successfully saved activity log:', savedLog);
        
        res.status(201).json(savedLog);
    } catch (error) {
        console.error('Error creating activity log:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to create activity log',
            details: error.message,
            userId: req.user?.id || req.user?._id,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Debug log
console.log('ActivityLog routes configured');

module.exports = router;