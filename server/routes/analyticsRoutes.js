console.log('Loading analyticsRoutes.js - START');

const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validation');
const analyticsController = require('../controllers/analyticsController');
const { query, param } = require('express-validator');
const { auth, isAdmin } = require('../middleware/auth');

// Debug logging
console.log('analyticsController methods:', Object.keys(analyticsController));

// Analytics routes
router.get('/sales', auth, isAdmin, analyticsController.getSalesAnalytics);
router.get('/products', auth, isAdmin, analyticsController.getProductAnalytics);
router.get('/users', auth, isAdmin, analyticsController.getUserAnalytics);

const dateRangeValidations = [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    query('type').optional().isIn(['leads', 'bids', 'orders', 'revenue']),
    query('interval').optional().isIn(['day', 'week', 'month', 'year']),
    validationMiddleware.handleValidationErrors
];

router.get('/metrics', dateRangeValidations, analyticsController.getMetrics);
router.get('/performance/:userId', [
    param('userId').isMongoId(),
    ...dateRangeValidations
], analyticsController.getUserPerformance);

console.log('Loading analyticsRoutes.js - END');

module.exports = router; 