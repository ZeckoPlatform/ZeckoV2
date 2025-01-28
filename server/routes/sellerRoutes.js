const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { protect } = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validation');
const { query } = require('express-validator');

const dateRangeValidations = [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('period').optional().isIn(['day', 'week', 'month', 'year']),
    validationMiddleware.handleValidationErrors
];

router.use(protect);

router.get('/stats', dateRangeValidations, sellerController.getSellerStats);
router.get('/auctions', [
    query('status').optional().isIn(['active', 'ended', 'cancelled']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validationMiddleware.handleValidationErrors
], sellerController.getSellerAuctions);

module.exports = router; 