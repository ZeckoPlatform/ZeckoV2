console.log('Loading adminController.js - START');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const { startOfMonth, subMonths, startOfDay, subDays, startOfWeek, endOfWeek, startOfYear, endOfYear } = require('date-fns');
const Review = require('../models/reviewModel');
const Lead = require('../models/leadModel');
const Credit = require('../models/Credit');
const Business = require('../models/businessModel');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');

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
        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

        const [
            totalUsers,
            newUsers,
            totalLeads,
            activeLeads,
            totalCredits,
            recentTransactions,
            reviewStats
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Lead.countDocuments(),
            Lead.countDocuments({ status: 'active' }),
            Credit.aggregate([
                { $group: { _id: null, total: { $sum: '$balance' } } }
            ]),
            Credit.find()
                .sort({ 'transactions.createdAt': -1 })
                .limit(10)
                .populate('business', 'businessName'),
            Review.aggregate([
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 },
                        reported: {
                            $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] }
                        }
                    }
                }
            ])
        ]);

        res.json({
            users: {
                total: totalUsers,
                new: newUsers
            },
            leads: {
                total: totalLeads,
                active: activeLeads
            },
            credits: {
                total: totalCredits[0]?.total || 0,
                recentTransactions
            },
            reviews: reviewStats[0] || {
                averageRating: 0,
                totalReviews: 0,
                reported: 0
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};

exports.getRevenueStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueStats = await Credit.aggregate([
            {
                $unwind: '$transactions'
            },
            {
                $match: {
                    'transactions.type': 'purchase',
                    'transactions.createdAt': { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$transactions.createdAt' }
                    },
                    revenue: { $sum: '$transactions.amount' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(revenueStats);
    } catch (error) {
        console.error('Revenue stats error:', error);
        res.status(500).json({ message: 'Error fetching revenue statistics' });
    }
};

// Add review moderation methods alongside existing admin methods
exports.getReportsForModeration = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ status: 'reported' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('clientId', 'name email')
        .populate('contractorId', 'businessName')
        .populate('leadId', 'title'),
      Review.countDocuments({ status: 'reported' })
    ]);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get reported reviews error:', error);
    res.status(500).json({ message: 'Error fetching reported reviews' });
  }
};

exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action } = req.body;

    if (!['approve', 'remove'].includes(action)) {
      return res.status(400).json({ message: 'Invalid moderation action' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.status = action === 'approve' ? 'active' : 'removed';
    await review.save();

    res.json({ message: 'Review moderated successfully' });
  } catch (error) {
    console.error('Review moderation error:', error);
    res.status(500).json({ message: 'Error moderating review' });
  }
};

exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const filter = req.query.filter || '';

        const query = {};
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { 'business.businessName': { $regex: search, $options: 'i' } }
            ];
        }
        if (filter) {
            query.role = filter;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('business', 'businessName'),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = status;
        if (reason) {
            user.statusReason = reason;
        }

        await user.save();

        // Notify user of status change using existing notification system
        if (global.io) {
            global.io.to(`user:${userId}`).emit('status_update', {
                status,
                reason
            });
        }

        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Error updating user status' });
    }
};

exports.getPendingVerifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const [verifications, total] = await Promise.all([
            Business.find({ verificationStatus: 'pending' })
                .populate('userId', 'name email')
                .sort({ createdAt: 1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Business.countDocuments({ verificationStatus: 'pending' })
        ]);

        res.json({
            verifications,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get pending verifications error:', error);
        res.status(500).json({ message: 'Error fetching pending verifications' });
    }
};

exports.handleVerification = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { businessId } = req.params;
        const { status, reason } = req.body;

        const business = await Business.findById(businessId)
            .populate('userId')
            .session(session);

        if (!business) {
            throw new Error('Business not found');
        }

        business.verificationStatus = status;
        business.verificationReason = reason;
        business.verifiedAt = status === 'approved' ? new Date() : null;
        business.verifiedBy = status === 'approved' ? req.user._id : null;

        await business.save({ session });

        // Update user role if approved
        if (status === 'approved') {
            await User.findByIdAndUpdate(
                business.userId._id,
                { role: 'business' },
                { session }
            );
        }

        // Send notification using existing notification system
        if (global.io) {
            global.io.to(`user:${business.userId._id}`).emit('verification_update', {
                status,
                reason
            });
        }

        await session.commitTransaction();
        res.json({ message: 'Verification status updated successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error('Handle verification error:', error);
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30'; // days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeframe));

        const [
            userStats,
            leadStats,
            revenueStats,
            categoryStats,
            conversionStats
        ] = await Promise.all([
            // User growth analytics
            User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // Lead analytics
            Lead.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        avgBudget: { $avg: '$budget' }
                    }
                }
            ]),

            // Revenue analytics
            Credit.aggregate([
                {
                    $unwind: '$transactions'
                },
                {
                    $match: {
                        'transactions.type': 'purchase',
                        'transactions.createdAt': { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$transactions.createdAt' }
                        },
                        revenue: { $sum: '$transactions.amount' },
                        transactions: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // Category performance
            Lead.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        avgProposals: { $avg: { $size: '$proposals' } },
                        totalBudget: { $sum: '$budget' }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            // Lead conversion analytics
            Lead.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        converted: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$status', 'completed'] },
                                    1,
                                    0
                                ]
                            }
                        },
                        avgTimeToConvert: {
                            $avg: {
                                $cond: [
                                    { $eq: ['$status', 'completed'] },
                                    { $subtract: ['$completedAt', '$createdAt'] },
                                    null
                                ]
                            }
                        }
                    }
                }
            ])
        ]);

        res.json({
            userGrowth: userStats,
            leads: leadStats,
            revenue: revenueStats,
            categories: categoryStats,
            conversion: conversionStats[0] || {
                total: 0,
                converted: 0,
                avgTimeToConvert: 0
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
};

exports.exportAnalytics = async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30';
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeframe));

        // Fetch analytics data
        const [leads, users, revenue] = await Promise.all([
            Lead.find({ createdAt: { $gte: startDate } })
                .populate('postedBy', 'name email')
                .populate('selectedContractor', 'businessName'),
            User.find({ createdAt: { $gte: startDate } })
                .select('-password'),
            Credit.aggregate([
                { $unwind: '$transactions' },
                {
                    $match: {
                        'transactions.createdAt': { $gte: startDate }
                    }
                }
            ])
        ]);

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        
        // Leads worksheet
        const leadsSheet = workbook.addWorksheet('Leads');
        leadsSheet.columns = [
            { header: 'Title', key: 'title' },
            { header: 'Category', key: 'category' },
            { header: 'Status', key: 'status' },
            { header: 'Budget', key: 'budget' },
            { header: 'Posted By', key: 'postedBy' },
            { header: 'Contractor', key: 'contractor' },
            { header: 'Created At', key: 'createdAt' }
        ];
        
        leads.forEach(lead => {
            leadsSheet.addRow({
                title: lead.title,
                category: lead.category,
                status: lead.status,
                budget: lead.budget,
                postedBy: lead.postedBy?.name,
                contractor: lead.selectedContractor?.businessName,
                createdAt: lead.createdAt
            });
        });

        // Users worksheet
        const usersSheet = workbook.addWorksheet('Users');
        usersSheet.columns = [
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Role', key: 'role' },
            { header: 'Status', key: 'status' },
            { header: 'Joined', key: 'createdAt' }
        ];

        users.forEach(user => {
            usersSheet.addRow({
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            });
        });

        // Revenue worksheet
        const revenueSheet = workbook.addWorksheet('Revenue');
        revenueSheet.columns = [
            { header: 'Date', key: 'date' },
            { header: 'Amount', key: 'amount' },
            { header: 'Type', key: 'type' }
        ];

        revenue.forEach(transaction => {
            revenueSheet.addRow({
                date: transaction.transactions.createdAt,
                amount: transaction.transactions.amount,
                type: transaction.transactions.type
            });
        });

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=analytics-${new Date().toISOString()}.xlsx`
        );

        // Send workbook
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({ message: 'Error exporting analytics' });
    }
};

// Create the controller object
const controller = {
    getAdminStats,
    getDashboardStats,
    getReportsForModeration,
    moderateReview,
    getRevenueStats,
    getUsers,
    updateUserStatus,
    getPendingVerifications,
    handleVerification,
    getAnalytics,
    exportAnalytics
};

console.log('adminController methods:', Object.keys(controller));
console.log('Loading adminController.js - END');

module.exports = controller; 