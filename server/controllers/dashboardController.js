const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Task = require('../models/taskModel');
const ApiError = require('../utils/apiError');

// Simple controller object
const dashboardController = {
    // Overview endpoint
    overview: function(req, res, next) {
        Product.countDocuments({ seller: req.user.id })
            .then(products => {
                return Order.countDocuments({ seller: req.user.id })
                    .then(orders => {
                        return Task.countDocuments({ user: req.user.id, status: 'pending' })
                            .then(tasks => {
                                res.status(200).json({
                                    status: 'success',
                                    data: {
                                        totalProducts: products,
                                        totalOrders: orders,
                                        pendingTasks: tasks
                                    }
                                });
                            });
                    });
            })
            .catch(next);
    },

    // Activity endpoint
    activity: function(req, res, next) {
        Promise.all([
            Order.find({ seller: req.user.id }).sort('-createdAt').limit(5),
            Product.find({ seller: req.user.id }).sort('-createdAt').limit(5),
            Task.find({ user: req.user.id }).sort('-createdAt').limit(5)
        ])
        .then(([recentOrders, recentProducts, recentTasks]) => {
            res.status(200).json({
                status: 'success',
                data: {
                    orders: recentOrders,
                    products: recentProducts,
                    tasks: recentTasks
                }
            });
        })
        .catch(next);
    },

    // Stats endpoint
    stats: function(req, res, next) {
        Promise.all([
            Product.countDocuments({ seller: req.user.id }),
            Order.countDocuments({ seller: req.user.id }),
            Task.countDocuments({ user: req.user.id })
        ])
        .then(([products, orders, tasks]) => {
            res.status(200).json({
                status: 'success',
                data: { products, orders, tasks }
            });
        })
        .catch(next);
    },

    // Earnings endpoint
    earnings: function(req, res, next) {
        Order.find({ seller: req.user.id, status: 'completed' })
            .then(orders => {
                const totalEarnings = orders.reduce((acc, order) => acc + order.total, 0);
                res.status(200).json({
                    status: 'success',
                    data: {
                        totalEarnings,
                        orderCount: orders.length
                    }
                });
            })
            .catch(next);
    },

    // Tasks endpoint
    tasks: function(req, res, next) {
        Task.find({ user: req.user.id })
            .sort('-createdAt')
            .then(tasks => {
                res.status(200).json({
                    status: 'success',
                    data: tasks
                });
            })
            .catch(next);
    },

    // Update task endpoint
    updateTask: function(req, res, next) {
        const { id } = req.params;
        const { status } = req.body;

        Task.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
            .then(task => {
                if (!task) {
                    throw new ApiError('Task not found', 404);
                }
                res.status(200).json({
                    status: 'success',
                    data: task
                });
            })
            .catch(next);
    }
};

module.exports = dashboardController;