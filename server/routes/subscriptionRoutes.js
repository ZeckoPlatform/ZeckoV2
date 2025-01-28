const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');
const validationMiddleware = require('../middleware/validation');
const { body, param } = require('express-validator');
const RateLimitService = require('../services/rateLimitService');

const subscriptionValidations = [
    body('planId').isMongoId(),
    body('paymentMethodId').exists(),
    body('billingCycle').isIn(['monthly', 'yearly']),
    body('autoRenew').optional().isBoolean(),
    body('couponCode').optional().isString().isLength({ min: 3, max: 20 }),
    validationMiddleware.handleValidationErrors
];

router.get('/plans', subscriptionController.getPlans);
router.get('/my-subscription', auth, subscriptionController.getCurrentSubscription);
router.post('/subscribe', [RateLimitService.paymentLimiter, ...subscriptionValidations], subscriptionController.createSubscription);
router.post('/:subscriptionId/cancel', [
    RateLimitService.paymentLimiter,
    param('subscriptionId').isMongoId(),
    body('reason').optional().trim().isLength({ min: 5, max: 500 }),
    validationMiddleware.handleValidationErrors
], subscriptionController.cancelSubscription);
router.post('/upgrade', auth, subscriptionController.upgradeSubscription);
router.post('/credits/purchase', auth, subscriptionController.purchaseCredits);
router.get('/credits/balance', auth, subscriptionController.getCreditsBalance);
router.get('/credits/history', auth, subscriptionController.getCreditsHistory);

router.put('/:subscriptionId', [
    param('subscriptionId').isMongoId(),
    body('planId').optional().isMongoId(),
    body('autoRenew').optional().isBoolean(),
    body('paymentMethodId').optional().exists(),
    validationMiddleware.handleValidationErrors
], subscriptionController.updateSubscription);

module.exports = router;
