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
        const log = new ActivityLog({
            userId: req.user.id,
            ...req.body
        });
        await log.save();
        res.status(201).json(log);
    } catch (error) {
        console.error('Error in POST /:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug log
console.log('ActivityLog routes configured');

module.exports = router;