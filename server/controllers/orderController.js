console.log('Loading orderController.js - START');

const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const notificationService = require('../services/notificationService');

const getVendorOrders = async (req, res) => {
    console.log('getVendorOrders called');
    try {
        const orders = await Order.find({
            'items.product': { 
                $in: await Product.find({ seller: req.user._id }).select('_id') 
            }
        }).populate('items.product user');
        res.json(orders);
    } catch (error) {
        console.error('getVendorOrders error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createOrder = async (orderData, userId) => {
    const { items, shippingAddress, totalAmount } = orderData;

    // Validate items stock
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.product}`);
        }
    }

    const order = new Order({
        user: userId,
        items,
        shippingAddress,
        totalAmount,
        status: 'pending'
    });

    await order.save();

    // Update product stock
    for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
        });
    }

    // Clear cart
    await Cart.findOneAndUpdate(
        { user: userId },
        { items: [] }
    );

    return order;
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('items.product');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check authorization
        if (!req.user.isAdmin && req.user._id.toString() !== order.vendor?.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        order.status = status;
        await order.save();

        await notificationService.createNotification(
            order.user,
            'order',
            `Your order status has been updated to ${status}`,
            { orderId: order._id, status }
        );

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const controller = {
    getVendorOrders,
    getOrders,
    createOrder,
    getOrderById,
    updateOrderStatus
};

console.log('orderController methods:', Object.keys(controller));
console.log('getVendorOrders type:', typeof controller.getVendorOrders);
console.log('Loading orderController.js - END');

module.exports = controller;