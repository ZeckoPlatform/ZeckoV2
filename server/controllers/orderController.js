console.log('Loading orderController.js - START');

const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { validateRequest } = require('../utils/validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createOrder = async (req, res) => {
    try {
        const { error } = validateRequest(req.body, {
            items: 'required|array',
            'items.*.product': 'required|mongoId',
            'items.*.quantity': 'required|integer|min:1',
            shipping: 'required|object',
            'shipping.address': 'required|object'
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Calculate totals and verify stock
        let subtotal = 0;
        const processedItems = [];

        for (const item of req.body.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.product} not found` });
            }

            if (product.stock.quantity < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for ${product.name}` 
                });
            }

            const itemPrice = product.price.sale || product.price.regular;
            subtotal += itemPrice * item.quantity;

            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                price: itemPrice,
                variant: item.variant
            });

            // Update stock
            product.stock.quantity -= item.quantity;
            await product.save();
        }

        // Calculate shipping cost (implement your logic here)
        const shippingCost = 10; // Example fixed shipping cost

        const order = new Order({
            customer: req.user.id,
            vendor: processedItems[0].product.vendor, // Assuming single vendor order
            items: processedItems,
            shipping: {
                ...req.body.shipping,
                cost: shippingCost
            },
            subtotal,
            total: subtotal + shippingCost
        });

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round((order.total) * 100), // Convert to cents
            currency: 'gbp',
            customer: req.user.stripeCustomerId,
            metadata: {
                orderId: order._id.toString()
            }
        });

        order.payment = {
            method: 'card',
            transactionId: paymentIntent.id
        };

        await order.save();

        res.status(201).json({
            order,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { role } = req.user;
        const query = role === 'vendor' 
            ? { vendor: req.user.id }
            : { customer: req.user.id };

        const orders = await Order.find(query)
            .populate('items.product', 'name images')
            .sort('-createdAt');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.vendor.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        order.status = status;
        if (status === 'shipped') {
            order.shipping.trackingNumber = req.body.trackingNumber;
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create controller object
const controller = {
    createOrder,
    getOrders,
    updateOrderStatus
};

console.log('orderController methods:', Object.keys(controller));
console.log('Loading orderController.js - END');

module.exports = controller;