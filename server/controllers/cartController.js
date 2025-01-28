const Cart = require('../models/Cart');
const Product = require('../models/Product');

module.exports = {
  // Add to cart
  addToCart: async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      let cart = await Cart.findOne({ user: req.user.id });
      
      if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
      }

      const productIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (productIndex > -1) {
        cart.items[productIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get cart
  getCart: async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user.id })
        .populate('items.product');
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}; 