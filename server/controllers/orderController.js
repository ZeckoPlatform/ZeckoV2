console.log('Loading orderController.js - START');

const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const notificationService = require('../services/notificationService');

// Define all controller functions
const getVendorOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            'items.product': { 
                $in: await Product.find({ seller: req.user._id }).select('_id') 
            }
        }).populate('items.product user');
        res.json(orders);
    } catch (error) {
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

const createOrder = async (req, res) => {
    try {
        const order = new Order({
            user: req.user._id,
            items: req.body.items,
            shippingAddress: req.body.shippingAddress,
            totalAmount: req.body.totalAmount
        });
        await order.save();
        res.status(201).json(order);
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

// Create controller object
const controller = {
    getVendorOrders,
    getOrders,
    createOrder,
    getOrderById,
    updateOrderStatus
};

console.log('orderController methods:', Object.keys(controller));
console.log('Loading orderController.js - END');

module.exports = controller;