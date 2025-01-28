console.log('Loading adminRoutes.js - START');

const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');
const validationMiddleware = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// Debug logging
console.log('adminController methods:', Object.keys(adminController));

// Admin dashboard route
router.get('/dashboard/stats', auth, isAdmin, adminController.getAdminStats);

// Add analytics routes
router.get('/dashboard/stats', auth, adminMiddleware, adminController.getDashboardStats);
router.get('/dashboard/revenue', auth, adminMiddleware, adminController.getRevenueStats);

// Add analytics route
router.get('/analytics', auth, adminMiddleware, adminController.getAnalytics);

// Add export route
router.get('/analytics/export', auth, adminMiddleware, adminController.exportAnalytics);

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

// Add review moderation routes
router.get('/reviews/reported', auth, isAdmin, adminController.getReportsForModeration);
router.post('/reviews/:reviewId/moderate', auth, isAdmin, adminController.moderateReview);

// Add user management routes
router.get('/users', auth, adminMiddleware, adminController.getUsers);

const userManagementValidations = [
    body('status').optional().isIn(['active', 'suspended', 'banned']),
    body('role').optional().isIn(['user', 'business', 'admin']),
    body('verificationStatus').optional().isIn(['pending', 'verified', 'rejected']),
    validationMiddleware.handleValidationErrors
];

router.put('/users/:userId/status', [
    param('userId').isMongoId(),
    ...userManagementValidations
], adminController.updateUserStatus);

// Add business verification routes
router.get('/verifications', auth, adminMiddleware, adminController.getPendingVerifications);
router.post('/verifications/:businessId', auth, adminMiddleware, adminController.handleVerification);

const reportValidations = [
    query('type').isIn(['users', 'businesses', 'transactions', 'disputes']),
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    query('format').optional().isIn(['csv', 'pdf', 'excel']),
    validationMiddleware.handleValidationErrors
];

router.get('/reports', reportValidations, adminController.generateReport);

router.post('/categories', [
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('description').trim().isLength({ min: 10, max: 500 }),
    body('parentId').optional().isMongoId(),
    validationMiddleware.handleValidationErrors
], adminController.createCategory);

console.log('Loading adminRoutes.js - END');

module.exports = router;