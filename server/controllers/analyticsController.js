console.log('Loading analyticsController.js - START');

const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const getSalesAnalytics = async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalSales: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        res.json(salesData);
    } catch (error) {
        console.error('Sales analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch sales analytics' });
    }
};

const getProductAnalytics = async (req, res) => {
    try {
        const productData = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    averagePrice: { $avg: "$price" }
                }
            }
        ]);

        res.json(productData);
    } catch (error) {
        console.error('Product analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch product analytics' });
    }
};

const getUserAnalytics = async (req, res) => {
    try {
        const userData = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    newUsers: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        res.json(userData);
    } catch (error) {
        console.error('User analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
};

const controller = {
    getSalesAnalytics,
    getProductAnalytics,
    getUserAnalytics
};

console.log('analyticsController methods:', Object.keys(controller));
console.log('Loading analyticsController.js - END');

module.exports = controller; 