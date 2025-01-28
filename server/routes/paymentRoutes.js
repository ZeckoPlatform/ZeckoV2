const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentController = require('../controllers/paymentController');
const validationMiddleware = require('../middleware/validation');
const { body, param } = require('express-validator');
const RateLimitService = require('../services/rateLimitService');

// Payment specific validations
const paymentValidations = [
    body('amount').isNumeric().isFloat({ min: 0 }),
    body('currency').isIn(['USD', 'EUR', 'GBP']),
    body('paymentMethod').isIn(['card', 'bank_transfer']),
    body('description').optional().trim().isLength({ min: 5, max: 200 }),
    body('billingDetails').isObject(),
    body('billingDetails.name').trim().isLength({ min: 2 }),
    body('billingDetails.email').isEmail(),
    body('billingDetails.address').isObject(),
    body('billingDetails.address.line1').trim().isLength({ min: 5 }),
    body('billingDetails.address.city').trim().isLength({ min: 2 }),
    body('billingDetails.address.state').trim().isLength({ min: 2 }),
    body('billingDetails.address.postal_code').matches(/^[0-9]{5}(-[0-9]{4})?$/),
    body('billingDetails.address.country').isISO31661Alpha2(),
    validationMiddleware.handleValidationErrors
];

router.post('/process', RateLimitService.paymentLimiter, paymentValidations, paymentController.processPayment);
router.post('/subscription', RateLimitService.paymentLimiter, [
    ...paymentValidations,
    body('planId').isMongoId(),
    body('interval').isIn(['month', 'year'])
], paymentController.createSubscription);

router.post('/create-subscription', RateLimitService.paymentLimiter, auth, async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;
    // Create or update Stripe subscription
    // Update user's subscription status
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/buy-credits', RateLimitService.paymentLimiter, auth, async (req, res) => {
  try {
    const { amount, paymentMethodId } = req.body;
    // Process payment and add credits
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
router.post('/create-checkout-session', auth, paymentController.createCheckoutSession);

// Webhook route (unprotected as it's called by Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router; 