console.log('Loading adminController.js - START');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const { startOfMonth, subMonths, startOfDay, subDays, startOfWeek, endOfWeek, startOfYear, endOfYear } = require('date-fns');

const getAdminStats = async (req, res) => {
    try {
        // Get date ranges
        const currentMonth = startOfMonth(new Date());
        const lastMonth = startOfMonth(subMonths(new Date(), 1));
        const last30Days = startOfDay(subDays(new Date(), 30));

        // Get user statistics
        const totalUsers = await User.countDocuments();
        const usersLastMonth = await User.countDocuments({
            createdAt: { $lt: currentMonth, $gte: lastMonth }
        });
        const usersThisMonth = await User.countDocuments({
            createdAt: { $gte: currentMonth }
        });
        const userGrowth = ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;

        // Get product statistics
        const totalProducts = await Product.countDocuments();
        const productsLastMonth = await Product.countDocuments({
            createdAt: { $lt: currentMonth, $gte: lastMonth }
        });
        const productsThisMonth = await Product.countDocuments({
            createdAt: { $gte: currentMonth }
        });
        const productGrowth = ((productsThisMonth - productsLastMonth) / productsLastMonth) * 100;

        // Get order statistics
        const totalOrders = await Order.countDocuments();
        const ordersLastMonth = await Order.countDocuments({
            createdAt: { $lt: currentMonth, $gte: lastMonth }
        });
        const ordersThisMonth = await Order.countDocuments({
            createdAt: { $gte: currentMonth }
        });
        const orderGrowth = ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100;

        // Get revenue statistics
        const revenueAggregation = await Order.aggregate([
            {
                $facet: {
                    totalRevenue: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$totalAmount' }
                            }
                        }
                    ],
                    lastMonthRevenue: [
                        {
                            $match: {
                                createdAt: { $lt: currentMonth, $gte: lastMonth }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$totalAmount' }
                            }
                        }
                    ],
                    thisMonthRevenue: [
                        {
                            $match: {
                                createdAt: { $gte: currentMonth }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$totalAmount' }
                            }
                        }
                    ],
                    monthlySales: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$createdAt' },
                                    month: { $month: '$createdAt' }
                                },
                                total: { $sum: '$totalAmount' }
                            }
                        },
                        {
                            $sort: { '_id.year': 1, '_id.month': 1 }
                        },
                        {
                            $limit: 6
                        }
                    ]
                }
            }
        ]);

        const totalRevenue = revenueAggregation[0].totalRevenue[0]?.total || 0;
        const lastMonthRevenue = revenueAggregation[0].lastMonthRevenue[0]?.total || 0;
        const thisMonthRevenue = revenueAggregation[0].thisMonthRevenue[0]?.total || 0;
        const revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        // Get recent activity
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .select('orderNumber totalAmount status createdAt');

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt');

        // Get top products
        const topProducts = await Order.aggregate([
            {
                $unwind: '$items'
            },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            }
        ]);

        // Get daily stats for the last 30 days
        const dailyStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: last30Days }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        res.json({
            totalUsers,
            userGrowth,
            totalProducts,
            productGrowth,
            totalOrders,
            orderGrowth,
            totalRevenue,
            revenueGrowth,
            monthlySales: revenueAggregation[0].monthlySales,
            recentActivity: {
                orders: recentOrders,
                users: recentUsers
            },
            topProducts,
            dailyStats,
            overview: {
                users: {
                    total: totalUsers,
                    growth: userGrowth,
                    recent: usersThisMonth
                },
                products: {
                    total: totalProducts,
                    growth: productGrowth,
                    recent: productsThisMonth
                },
                orders: {
                    total: totalOrders,
                    growth: orderGrowth,
                    recent: ordersThisMonth
                },
                revenue: {
                    total: totalRevenue,
                    growth: revenueGrowth,
                    recent: thisMonthRevenue
                }
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const { range = 'week' } = req.query;
        let startDate, endDate;

        // Set date range
        switch (range) {
            case 'day':
                startDate = startOfDay(new Date());
                endDate = endOfDay(new Date());
                break;
            case 'week':
                startDate = startOfWeek(new Date());
                endDate = endOfWeek(new Date());
                break;
            case 'month':
                startDate = startOfMonth(new Date());
                endDate = endOfMonth(new Date());
                break;
            case 'year':
                startDate = startOfYear(new Date());
                endDate = endOfYear(new Date());
                break;
            default:
                startDate = startOfWeek(new Date());
                endDate = endOfWeek(new Date());
        }

        // Get stats
        const [users, vendors, orders, revenue, recentActivity] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
            User.countDocuments({ role: 'vendor' }),
            Order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        'payment.status': 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ]),
            Order.find()
                .sort('-createdAt')
                .limit(10)
                .populate('customer', 'name')
                .populate('vendor', 'name')
        ]);

        // Get revenue chart data
        const revenueChart = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    'payment.status': 'completed'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    amount: { $sum: '$total' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            users,
            vendors,
            orders,
            revenue: revenue[0]?.total || 0,
            revenueChart: revenueChart.map(item => ({
                date: item._id,
                amount: item.amount
            })),
            recentActivity: recentActivity.map(order => ({
                _id: order._id,
                action: 'New Order',
                user: order.customer.name,
                details: `Order #${order.orderNumber}`,
                date: order.createdAt,
                status: order.status
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create the controller object
const controller = {
    getAdminStats,
    getDashboardStats
};

console.log('adminController methods:', Object.keys(controller));
console.log('Loading adminController.js - END');

module.exports = controller; 