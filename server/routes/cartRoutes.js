const express = require('express');
const router = express.Router();
const Cart = require('../models/cartModel');
const { auth } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { body } = require('express-validator');

// Add item to cart validations
const cartItemValidations = [
    body('productId').isMongoId(),
    body('quantity').isInt({ min: 1 }),
    validationMiddleware.handleValidationErrors
];

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price image');
    
    // If no cart exists, create an empty one
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
      await cart.save();
    }

    // Always return an object with items array
    res.json({
      items: cart.items || [],
      total: cart.total || 0
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching cart',
      error: error.message 
    });
  }
});

// Add item to cart
router.post('/add', [auth, ...cartItemValidations], async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }

    // Check if item exists
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    
    // Populate product details before sending response
    await cart.populate('items.product', 'name price image');
    
    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      message: 'Error adding to cart',
      error: error.message 
    });
  }
});

module.exports = router;
