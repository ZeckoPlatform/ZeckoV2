const Product = require('../models/Product');
const User = require('../models/User');

module.exports = {
  // Global search
  globalSearch: async (req, res) => {
    try {
      const { query } = req.query;
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(5);

      const users = await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).limit(5);

      res.json({
        products,
        users
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}; 