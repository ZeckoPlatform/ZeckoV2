const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// Get sales analytics
router.get('/sales', auth, admin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Get product performance
router.get('/products', auth, admin, async (req, res) => {
  try {
    const performance = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          totalOrders: { $size: '$orders' },
          rating: 1,
          stock: 1
        }
      }
    ]);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product analytics', error: error.message });
  }
});

module.exports = router; 