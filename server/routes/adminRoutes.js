console.log('Loading adminRoutes.js - START');

const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Debug logging
console.log('adminController methods:', Object.keys(adminController));

// Admin dashboard route
router.get('/dashboard/stats', auth, isAdmin, adminController.getAdminStats);

// Legacy routes (if still needed)
router.get('/dashboard', auth, isAdmin, async (req, res) => {
    try {
        res.json({ 
            message: 'Admin dashboard data',
            user: req.user
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        res.json({ 
            message: 'Admin users list',
            user: req.user
        });
    } catch (error) {
        console.error('Users list error:', error);
        res.status(500).json({ error: error.message });
    }
});

console.log('Loading adminRoutes.js - END');

module.exports = router;