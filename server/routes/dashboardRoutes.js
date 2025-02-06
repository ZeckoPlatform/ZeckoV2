const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Job = require('../models/jobModel');
const Business = require('../models/businessModel');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');
const Product = require('../models/productModel');
const { auth, protect } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Debug logging
console.log('Setting up dashboard routes with controller methods:', {
    overview: typeof dashboardController.overview,
    activity: typeof dashboardController.activity,
    stats: typeof dashboardController.stats,
    earnings: typeof dashboardController.earnings,
    tasks: typeof dashboardController.tasks,
    updateTask: typeof dashboardController.updateTask
});

// Main dashboard route
router.get('/', auth, async (req, res) => {
    try {
        let userData;
        let dashboardData = {
            stats: {
                notifications: 0,
                messages: 0
            }
        };

        switch(req.user.accountType) {
            case 'business':
                userData = await BusinessUser.findById(req.user.id).select('-password');
                dashboardData = {
                    ...dashboardData,
                    user: {
                        name: userData.businessName || userData.username,
                        email: userData.email,
                        role: 'business'
                    },
                    businessMetrics: {
                        totalOrders: 0,
                        revenue: 0,
                        products: 0
                    }
                };
                break;

            case 'vendor':
                userData = await VendorUser.findById(req.user.id).select('-password');
                dashboardData = {
                    ...dashboardData,
                    user: {
                        name: userData.businessName || userData.username,
                        email: userData.email,
                        role: 'vendor'
                    },
                    vendorMetrics: {
                        totalProducts: 0,
                        totalSales: 0,
                        pendingOrders: 0
                    }
                };
                break;

            default:
                userData = await User.findById(req.user.id).select('-password');
                dashboardData = {
                    ...dashboardData,
                    user: {
                        name: userData.username,
                        email: userData.email,
                        role: userData.role
                    }
                };
        }

        res.json(dashboardData);
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        let user;
        switch(req.user.accountType) {
            case 'business':
                user = await BusinessUser.findById(req.user.id).select('-password');
                break;
            case 'vendor':
                user = await VendorUser.findById(req.user.id).select('-password');
                break;
            default:
                user = await User.findById(req.user.id).select('-password');
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findById(req.user.id);
        if (username) user.username = username;
        if (email) user.email = email;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile', error: error.message });
    }
});

// Get user's jobs (for customers)
router.get('/jobs', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user jobs', error: error.message });
    }
});

// Get user's business profile (for business accounts)
router.get('/business', auth, async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user.id });
        if (!business) {
            return res.status(404).json({ message: 'Business profile not found' });
        }
        res.json(business);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching business profile', error: error.message });
    }
});

// Get user's products (for seller accounts)
router.get('/products', auth, async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user.id });
        if (!business) {
            return res.status(404).json({ message: 'Business profile not found' });
        }
        const products = await Product.find({ seller: business._id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user products', error: error.message });
    }
});

// Get user's subscription info
router.get('/subscription', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('subscription.plan');
        if (!user.subscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }
        res.json(user.subscription);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscription info', error: error.message });
    }
});

// Overview routes
router.get('/overview', protect, dashboardController.overview);
router.get('/activity', protect, dashboardController.activity);
router.get('/stats', protect, dashboardController.stats);
router.get('/earnings', protect, dashboardController.earnings);

// Tasks routes
router.get('/tasks', protect, dashboardController.tasks);
router.put('/tasks/:id', protect, dashboardController.updateTask);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Dashboard route error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

module.exports = router;
