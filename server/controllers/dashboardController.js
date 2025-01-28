const Order = require('../models/orderModel');
const Lead = require('../models/Lead');
const Product = require('../models/productModel');

exports.getBusinessStats = async (req, res) => {
  try {
    const businessId = req.user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const stats = await Promise.all([
      Lead.countDocuments({ 
        contractors: businessId,
        status: 'active'
      }),
      Lead.countDocuments({
        selectedContractor: businessId,
        status: 'completed'
      }),
      Lead.find({
        contractors: businessId,
        updatedAt: { $gte: thirtyDaysAgo }
      })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status updatedAt amount')
    ]);

    res.json({
      activeLeads: stats[0],
      wonContracts: stats[1],
      recentActivity: stats[2],
      responseRate: stats[0] ? Math.round((stats[1] / stats[0]) * 100) : 0
    });
  } catch (error) {
    console.error('Business stats error:', error);
    res.status(500).json({ message: 'Error fetching business statistics' });
  }
};

exports.getVendorStats = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const stats = await Promise.all([
      Product.countDocuments({ 
        vendor: vendorId,
        status: 'active'
      }),
      Order.countDocuments({
        vendor: vendorId,
        status: 'pending'
      }),
      Order.aggregate([
        {
          $match: {
            vendor: vendorId,
            createdAt: { $gte: firstDayOfMonth },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    res.json({
      activeProducts: stats[0],
      pendingOrders: stats[1],
      monthlySales: stats[2][0]?.total || 0
    });
  } catch (error) {
    console.error('Vendor stats error:', error);
    res.status(500).json({ message: 'Error fetching vendor statistics' });
  }
};

module.exports = exports; 