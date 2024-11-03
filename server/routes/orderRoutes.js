console.log('Loading orderRoutes.js - START');

const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const { auth } = require('../middleware/auth');

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

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod, totalAmount } = req.body;
    
    const newOrder = new Order({
      user: req.user.id,
      products,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Error creating order',
      error: error.message 
    });
  }
});

console.log('Loading orderRoutes.js - END');

module.exports = router;
