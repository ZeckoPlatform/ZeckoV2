const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');

// Debug log
console.log('Setting up adminRoutes');

// Admin routes
router.get('/dashboard', auth, isAdmin, async (req, res) => {
    try {
        res.json({ message: 'Admin dashboard data' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        res.json({ message: 'Admin users list' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

console.log('Admin routes configured');

module.exports = router;  // Export the router directly