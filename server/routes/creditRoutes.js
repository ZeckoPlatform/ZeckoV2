const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const creditController = require('../controllers/creditController');
const validationMiddleware = require('../middleware/validation');
const { body } = require('express-validator');

const creditPurchaseValidations = [
    body('amount').isInt({ min: 1 }),
    body('paymentMethodId').exists(),
    validationMiddleware.handleValidationErrors
];

const paymentIntentValidations = [
    body('amount').isInt({ min: 1 }),
    body('currency').isIn(['usd', 'eur', 'gbp']),
    validationMiddleware.handleValidationErrors
];

router.get('/balance', auth, creditController.getBalance);
router.get('/transactions', auth, creditController.getTransactions);
router.post('/purchase', [auth, ...creditPurchaseValidations], creditController.purchaseCredits);
router.post('/create-payment-intent', [auth, ...paymentIntentValidations], creditController.createPaymentIntent);
router.post('/confirm-purchase', [auth, body('paymentIntentId').exists()], creditController.confirmCreditPurchase);

module.exports = router; 