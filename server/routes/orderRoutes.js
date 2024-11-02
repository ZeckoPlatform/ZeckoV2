console.log('Loading orderRoutes.js - START');

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');
const socketHelpers = require('../socket');
const notificationService = require('../services/notificationService');

// Debug logging
console.log('orderController type:', typeof orderController);
console.log('getVendorOrders type:', typeof orderController.getVendorOrders);

// Vendor routes
router.get('/vendor/orders', auth, orderController.getVendorOrders);

// Basic routes
router.get('/', auth, orderController.getOrders);
router.post('/', auth, orderController.createOrder);

// Order specific routes
router.get('/:id', auth, orderController.getOrderById);
router.patch('/:id/status', auth, orderController.updateOrderStatus);

console.log('Loading orderRoutes.js - END');

module.exports = router;
