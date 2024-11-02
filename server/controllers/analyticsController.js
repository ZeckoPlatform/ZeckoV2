const Order = require('../models/Order');
const Product = require('../models/Product');

module.exports = {
  // Get sales analytics
  getSalesAnalytics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const sales = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalSales: { $sum: "$total" },
            orderCount: { $sum: 1 }
          }
        }
      ]);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}; 