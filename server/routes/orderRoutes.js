console.log('Loading orderRoutes.js - START');

const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const { auth } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const orderController = require('../controllers/orderController');
const { body, param } = require('express-validator');

// Get user's orders
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('products.product', 'name price image')
      .populate('user', 'name email');
    
    if (!orders) {
      return res.json([]);  // Return empty array if no orders found
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      message: 'Error fetching user orders',
      error: error.message 
    });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    })
    .populate('products.product', 'name price image')
    .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      message: 'Error fetching order',
      error: error.message 
    });
  }
});

const orderValidations = [
    body('leadId').isMongoId(),
    body('bidId').isMongoId(),
    body('terms').trim().isLength({ min: 10, max: 1000 }),
    body('milestones').optional().isArray(),
    body('milestones.*.description').trim().isLength({ min: 5, max: 200 }),
    body('milestones.*.amount').isNumeric().isFloat({ min: 0 }),
    body('milestones.*.dueDate').isISO8601(),
    validationMiddleware.handleValidationErrors
];

// Create new order
router.post('/create', orderValidations, orderController.createOrder);
router.put('/:orderId', [
    param('orderId').isMongoId(),
    ...orderValidations
], orderController.updateOrder);

console.log('Loading orderRoutes.js - END');

module.exports = router;
