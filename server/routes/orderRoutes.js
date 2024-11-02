console.log('Loading orderRoutes.js - START');

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const socketHelpers = require('../socket');
const notificationService = require('../services/notificationService');

// Vendor routes
router.get('/vendor/orders', auth, orderController.getVendorOrders);

// Basic routes
router.get('/', auth, orderController.getOrders);

router.post('/', auth, async (req, res) => {
    try {
        const order = await orderController.createOrder(req.body, req.user._id);
        
        // Send notifications
        socketHelpers.sendOrderNotification(req.user.id, order);
        socketHelpers.notifyAdmins('new_order', {
            message: `New order #${order.orderNumber} created`,
            data: order
        });

        await notificationService.createNotification(
            req.user._id,
            'order',
            'Your order has been placed successfully',
            { orderId: order._id }
        );

        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: error.message || 'Failed to create order' });
    }
});

// Order specific routes
router.get('/:id', auth, orderController.getOrderById);

console.log('Loading orderRoutes.js - END');

module.exports = router;
