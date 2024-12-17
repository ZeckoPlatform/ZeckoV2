const Product = require('../models/productModel');
const { validateRequest } = require('../utils/validator');

exports.createProduct = async (req, res) => {
    try {
        const { error } = validateRequest(req.body, {
            name: 'required|string',
            description: 'required|string',
            shortDescription: 'required|string',
            price: 'required|object',
            'price.regular': 'required|numeric',
            category: 'required|mongoId'
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const product = new Product({
            ...req.body,
            vendor: req.user.id
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            vendor,
            status = 'published',
            sort = '-createdAt'
        } = req.query;

        const query = { status };
        if (category) query.category = category;
        if (vendor) query.vendor = vendor;

        const products = await Product.find(query)
            .populate('vendor', 'name profile.avatar')
            .populate('category', 'name')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.json({
            products,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            slug: req.params.slug,
            status: 'published'
        })
        .populate('vendor', 'name profile.avatar businessProfile')
        .populate('category', 'name');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            vendor: req.user.id
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        Object.assign(product, req.body);
        await product.save();

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            vendor: req.user.id
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 