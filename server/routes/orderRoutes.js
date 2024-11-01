const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const orderController = require('../controllers/orderController');
const Notification = require('../models/Notification');
const io = require('../socket');

// Vendor routes (must come before /:id routes)
router.get('/vendor/orders', auth, orderController.getVendorOrders);
router.post('/bulk-update', auth, orderController.bulkUpdateOrders);

// Basic routes
router.get('/', auth, orderController.getOrders);
router.post('/', auth, orderController.createOrder);

// Order specific routes
router.get('/:id', auth, orderController.getOrderById);
router.patch('/:id/status', auth, orderController.updateOrderStatus);
router.patch('/:id/tracking', auth, orderController.updateTracking);
router.get('/:id/tracking', auth, orderController.getTracking);

router.post('/create', auth, async (req, res) => {
    try {
        // ... order creation ...
        
        // Should see notification creation
        await Notification.create({
            recipient: req.user.id,
            type: 'ORDER_CREATED',
            // ...
        });

        // Should see socket emission
        io.to(req.user.id).emit('orderNotification', {
            // ...
        });
    } catch (error) {
        // ...
    }
});

module.exports = router; 