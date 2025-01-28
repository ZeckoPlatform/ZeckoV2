const express = require('express');
const router = express.Router();
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress
    });

    await order.save();

    // Clear the cart
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error processing checkout', error: error.message });
  }
});

module.exports = router;
