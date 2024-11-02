const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const socketHelpers = require('../socket');

// Vendor routes (must come before /:id routes)
router.get('/vendor/orders', auth, async (req, res) => {
    try {
        const orders = await orderController.getVendorOrders(req.user);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/bulk-update', auth, async (req, res) => {
    try {
        const result = await orderController.bulkUpdateOrders(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Basic routes
router.get('/', auth, async (req, res) => {
    try {
        const orders = await orderController.getOrders(req.user);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await orderController.getOrderById(req.params.id);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id/status', auth, async (req, res) => {
    try {
        const updatedOrder = await orderController.updateOrderStatus(req.params.id, req.body);
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id/tracking', auth, async (req, res) => {
    try {
        const updatedTracking = await orderController.updateTracking(req.params.id, req.body);
        res.json(updatedTracking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/tracking', auth, async (req, res) => {
    try {
        const trackingInfo = await orderController.getTracking(req.params.id);
        res.json(trackingInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
