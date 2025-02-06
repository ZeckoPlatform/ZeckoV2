const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Task = require('../models/taskModel');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

// Define controller methods
exports.overview = catchAsync(async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [products, orders, tasks] = await Promise.all([
            Product.countDocuments({ seller: userId }),
            Order.countDocuments({ seller: userId }),
            Task.countDocuments({ user: userId, status: 'pending' })
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                totalProducts: products,
                totalOrders: orders,
                pendingTasks: tasks
            }
        });
    } catch (error) {
        next(error);
    }
});

exports.activity = catchAsync(async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [recentOrders, recentProducts, recentTasks] = await Promise.all([
            Order.find({ seller: userId }).sort('-createdAt').limit(5),
            Product.find({ seller: userId }).sort('-createdAt').limit(5),
            Task.find({ user: userId }).sort('-createdAt').limit(5)
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                orders: recentOrders,
                products: recentProducts,
                tasks: recentTasks
            }
        });
    } catch (error) {
        next(error);
    }
});

exports.stats = catchAsync(async (req, res, next) => {
    try {
        const userId = req.user.id;
        const stats = {
            products: await Product.countDocuments({ seller: userId }),
            orders: await Order.countDocuments({ seller: userId }),
            tasks: await Task.countDocuments({ user: userId })
        };

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

exports.earnings = catchAsync(async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ 
            seller: userId,
            status: 'completed'
        });

        const totalEarnings = orders.reduce((acc, order) => acc + order.total, 0);

        res.status(200).json({
            status: 'success',
            data: {
                totalEarnings,
                orderCount: orders.length
            }
        });
    } catch (error) {
        next(error);
    }
});

exports.tasks = catchAsync(async (req, res, next) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({ user: userId }).sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: tasks
        });
    } catch (error) {
        next(error);
    }
});

exports.updateTask = catchAsync(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const task = await Task.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!task) {
            throw new ApiError('Task not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: task
        });
    } catch (error) {
        next(error);
    }
});