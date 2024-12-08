const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

router.get('/plans', subscriptionController.getPlans);
router.get('/my-subscription', auth, subscriptionController.getCurrentSubscription);
router.post('/subscribe', auth, subscriptionController.subscribe);
router.post('/cancel', auth, subscriptionController.cancelSubscription);
router.post('/upgrade', auth, subscriptionController.upgradeSubscription);
router.post('/credits/purchase', auth, subscriptionController.purchaseCredits);
router.get('/credits/balance', auth, subscriptionController.getCreditsBalance);
router.get('/credits/history', auth, subscriptionController.getCreditsHistory);

module.exports = router;
