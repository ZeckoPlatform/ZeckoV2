const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const notificationService = require('../services/notificationService');

const orderController = {
    // Create order
    createOrder: async (orderData, userId) => {
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
    },

    // Get all orders
    getOrders: async (req, res) => {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        return res.json(orders);
    },

    // Get order by ID
    getOrderById: async (req, res) => {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('items.product');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        return res.json(order);
    },

    // Get vendor orders
    getVendorOrders: async (req, res) => {
        const orders = await Order.find({
            'items.product': { 
                $in: await Product.find({ seller: req.user._id }).select('_id') 
            }
        }).populate('items.product user');
        return res.json(orders);
    },

    // Update order status
    updateOrderStatus: async (req, res) => {
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

        // Send notification
        await notificationService.createNotification(
            order.user,
            'order',
            `Your order status has been updated to ${status}`,
            { orderId: order._id, status }
        );

        return res.json(order);
    },

    // Update tracking
    updateTracking: async (req, res) => {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check authorization
        if (!req.user.isAdmin && req.user._id.toString() !== order.vendor?.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        order.tracking = {
            ...req.body,
            updatedAt: new Date()
        };
        
        if (req.body.carrier && req.body.trackingNumber) {
            order.status = 'shipped';
        }

        await order.save();

        // Send notification
        await notificationService.createNotification(
            order.user,
            'order',
            `Tracking information updated for your order`,
            { 
                orderId: order._id, 
                tracking: order.tracking 
            }
        );

        return res.json(order);
    },

    // Get tracking
    getTracking: async (req, res) => {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check authorization
        if (order.user.toString() !== req.user._id.toString() && 
            !req.user.isAdmin && 
            req.user._id.toString() !== order.vendor?.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        return res.json(order.tracking || {});
    },

    // Bulk update orders
    bulkUpdateOrders: async (req, res) => {
        const { updates } = req.body;
        const results = [];

        for (const update of updates) {
            try {
                const order = await Order.findById(update.orderId);
                
                if (!order) {
                    results.push({
                        orderId: update.orderId,
                        success: false,
                        error: 'Order not found'
                    });
                    continue;
                }

                // Check authorization
                if (!req.user.isAdmin && req.user._id.toString() !== order.vendor?.toString()) {
                    results.push({
                        orderId: update.orderId,
                        success: false,
                        error: 'Not authorized'
                    });
                    continue;
                }

                order.status = update.status;
                if (update.tracking) {
                    order.tracking = {
                        ...order.tracking,
                        ...update.tracking,
                        updatedAt: new Date()
                    };
                }

                await order.save();

                // Send notification
                await notificationService.createNotification(
                    order.user,
                    'order',
                    `Order status updated to: ${update.status}`,
                    { orderId: order._id, status: update.status }
                );

                results.push({
                    orderId: update.orderId,
                    success: true,
                    order
                });
            } catch (error) {
                results.push({
                    orderId: update.orderId,
                    success: false,
                    error: error.message
                });
            }
        }

        return res.json({ results });
    },
};

module.exports = orderController;