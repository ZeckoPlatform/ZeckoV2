const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    createBid,
    getBids,
    getUserBids,
    cancelBid,
    getBidAnalytics
} = require('../controllers/bidController');
const validationMiddleware = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// Protect all routes
router.use(protect);

// Bid routes
router.post('/:leadId/bid', [
    param('leadId').isMongoId(),
    ...bidValidations
], createBid);
router.get('/product/:productId', getBids);
router.get('/user', getUserBids);
router.patch('/:id/cancel', cancelBid);
router.get('/analytics/:productId', getBidAnalytics);

// Bid specific validations
const bidValidations = [
    body('amount').isNumeric().isFloat({ min: 0 }),
    body('proposal').trim().isLength({ min: 10, max: 1000 }),
    body('timeframe').isObject(),
    body('timeframe.start').isISO8601(),
    body('timeframe.end').isISO8601(),
    body('terms').optional().trim().isLength({ min: 10, max: 500 }),
    validationMiddleware.handleValidationErrors
];

router.put('/bid/:bidId', [
    param('bidId').isMongoId(),
    ...bidValidations
], updateBid);

module.exports = router; 