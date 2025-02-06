const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Job = require('../models/jobModel');
const Business = require('../models/businessModel');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');
const Product = require('../models/productModel');
const { auth, protect } = require('../middleware/auth');
const dashboard = require('../controllers/dashboardController');

// Debug logging
console.log('Dashboard controller methods:', {
    overview: typeof dashboard.overview === 'function',
    activity: typeof dashboard.activity === 'function',
    stats: typeof dashboard.stats === 'function',
    earnings: typeof dashboard.earnings === 'function',
    tasks: typeof dashboard.tasks === 'function',
    updateTask: typeof dashboard.updateTask === 'function'
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

// Define routes
router.get('/overview', protect, (req, res, next) => dashboard.overview(req, res, next));
router.get('/activity', protect, (req, res, next) => dashboard.activity(req, res, next));
router.get('/stats', protect, (req, res, next) => dashboard.stats(req, res, next));
router.get('/earnings', protect, (req, res, next) => dashboard.earnings(req, res, next));
router.get('/tasks', protect, (req, res, next) => dashboard.tasks(req, res, next));
router.put('/tasks/:id', protect, (req, res, next) => dashboard.updateTask(req, res, next));

module.exports = router;
