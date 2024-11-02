console.log('Loading analyticsRoutes.js - START');

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth, isAdmin } = require('../middleware/auth');

// Debug logging
console.log('analyticsController methods:', Object.keys(analyticsController));

// Analytics routes
router.get('/sales', auth, isAdmin, analyticsController.getSalesAnalytics);
router.get('/products', auth, isAdmin, analyticsController.getProductAnalytics);
router.get('/users', auth, isAdmin, analyticsController.getUserAnalytics);

console.log('Loading analyticsRoutes.js - END');

module.exports = router; 