const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const socketHelpers = require('../socket');
const notificationService = require('../services/notificationService');

// Vendor routes (must come before /:id routes)
router.get('/vendor/orders', auth, (req, res, next) => {
    orderController.getVendorOrders(req, res).catch(next);
});

router.post('/bulk-update', auth, (req, res, next) => {
    orderController.bulkUpdateOrders(req, res).catch(next);
});

// Basic routes
router.get('/', auth, (req, res, next) => {
    orderController.getOrders(req, res).catch(next);
});

router.post('/', auth, async (req, res) => {
    try {
        const order = await orderController.createOrder(req.body, req.user._id);
        
        // Send notifications
        socketHelpers.sendOrderNotification(req.user.id, order);
        socketHelpers.notifyAdmins('new_order', {
            message: `New order #${order.orderNumber} created`,
            data: order
        });

        // Send notification through service
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
router.get('/:id', auth, (req, res, next) => {
    orderController.getOrderById(req, res).catch(next);
});

router.patch('/:id/status', auth, (req, res, next) => {
    orderController.updateOrderStatus(req, res).catch(next);
});

router.patch('/:id/tracking', auth, (req, res, next) => {
    orderController.updateTracking(req, res).catch(next);
});

router.get('/:id/tracking', auth, (req, res, next) => {
    orderController.getTracking(req, res).catch(next);
});

module.exports = router;
