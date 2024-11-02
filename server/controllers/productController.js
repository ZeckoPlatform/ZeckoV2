const Product = require('../models/Product');

module.exports = {
  // Create new product
  createProduct: async (req, res) => {
    try {
      const { name, description, price, category, stock, images } = req.body;
      const product = await Product.create({
        name,
        description,
        price,
        category,
        stock,
        images,
        seller: req.user.id
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all products with filters
  getProducts: async (req, res) => {
    try {
      const { category, minPrice, maxPrice, search, sort } = req.query;
      const query = {};

      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = minPrice;
        if (maxPrice) query.price.$lte = maxPrice;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const products = await Product.find(query)
        .sort(sort === 'price_asc' ? { price: 1 } : 
              sort === 'price_desc' ? { price: -1 } : 
              { createdAt: -1 });

      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}; 