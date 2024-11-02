const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const socketHelpers = require('../socket');

// Vendor routes (must come before /:id routes)
router.get('/vendor/orders', auth, orderController.getVendorOrders);
router.post('/bulk-update', auth, orderController.bulkUpdateOrders);

// Basic routes
router.get('/', auth, orderController.getOrders);
router.post('/', auth, async (req, res) => {
    try {
        const order = await orderController.createOrder(req.body);
        socketHelpers.sendOrderNotification(req.user.id, order);
        socketHelpers.notifyAdmins('new_order', {
            message: `New order #${order.orderNumber} created`,
            data: order
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Order specific routes
router.get('/:id', auth, orderController.getOrderById);
router.patch('/:id/status', auth, orderController.updateOrderStatus);
router.patch('/:id/tracking', auth, orderController.updateTracking);
router.get('/:id/tracking', auth, orderController.getTracking);

module.exports = router; 