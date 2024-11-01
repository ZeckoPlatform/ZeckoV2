const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getVendorOrders
} = require('../controllers/orderController');

// Create new order
router.post('/', auth, createOrder);

// Get all orders for current user
router.get('/', auth, getOrders);

// Get specific order by ID
router.get('/:id', auth, getOrderById);

// Update order status (admin/vendor only)
router.patch('/:id/status', auth, updateOrderStatus);

// Get all orders for vendor
router.get('/vendor/orders', auth, getVendorOrders);

router.post('/bulk-update', auth, async (req, res) => {
  try {
    const { updates } = req.body;
    const results = [];

    for (const update of updates) {
      try {
        const order = await Order.findById(update.orderId);
        if (!order) {
          results.push({
            orderId: update.orderId,
            success: false,
            error: 'Order not found'
          });
          continue;
        }

        order.status = update.status;
        if (update.tracking) {
          order.tracking = {
            ...order.tracking,
            ...update.tracking,
            updatedAt: new Date()
          };
        }

        await order.save();

        // Send notification to customer
        await notificationService.createOrderNotification(
          order.user,
          'order_update',
          `Order status updated to: ${update.status}`
        );

        results.push({
          orderId: update.orderId,
          success: true
        });
      } catch (error) {
        results.push({
          orderId: update.orderId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process bulk update' });
  }
});

module.exports = router; 