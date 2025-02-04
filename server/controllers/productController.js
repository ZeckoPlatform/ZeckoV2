const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { cloudinary } = require('../config/cloudinary');

class ProductController {
    constructor() {
        // Bind all methods to this instance
        Object.getOwnPropertyNames(ProductController.prototype)
            .filter(prop => typeof this[prop] === 'function')
            .forEach(method => {
                this[method] = this[method].bind(this);
            });
    }

    getProducts = catchAsync(async (req, res) => {
        const products = await Product.find()
            .populate('seller', 'name email')
            .sort('-createdAt');
            
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: products
        });
    });

    getProduct = catchAsync(async (req, res) => {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email');
            
        if (!product) {
            throw new ApiError('Product not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: product
        });
    });

    getSellerProducts = catchAsync(async (req, res) => {
        const products = await Product.find({ seller: req.user._id })
            .sort('-createdAt');
            
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: products
        });
    });

    createProduct = catchAsync(async (req, res) => {
        const { title, description, price, category } = req.body;
        
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = await Promise.all(
                req.files.map(async (file) => {
                    const b64 = Buffer.from(file.buffer).toString('base64');
                    const dataURI = `data:${file.mimetype};base64,${b64}`;
                    
                    const result = await cloudinary.uploader.upload(dataURI, {
                        folder: 'products',
                        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
                        transformation: [{ width: 800, crop: 'scale' }]
                    });
                    return result.secure_url;
                })
            );
        }

        const product = await Product.create({
            title,
            description,
            price: {
                current: price.current
            },
            category,
            images: imageUrls,
            seller: req.user._id
        });

        res.status(201).json({
            status: 'success',
            data: product
        });
    });

    updateProduct = catchAsync(async (req, res) => {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, seller: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            throw new ApiError('Product not found or unauthorized', 404);
        }

        res.status(200).json({
            status: 'success',
            data: product
        });
    });

    deleteProduct = catchAsync(async (req, res) => {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            seller: req.user._id
        });

        if (!product) {
            throw new ApiError('Product not found or unauthorized', 404);
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    updateStock = catchAsync(async (req, res) => {
        const { quantity, operation } = req.body;
        const product = await Product.findOne({
            _id: req.params.id,
            seller: req.user._id
        });

        if (!product) {
            throw new ApiError('Product not found or unauthorized', 404);
        }

        if (operation === 'add') {
            product.stock += quantity;
        } else if (operation === 'subtract') {
            if (product.stock < quantity) {
                throw new ApiError('Insufficient stock', 400);
            }
            product.stock -= quantity;
        }

        await product.save();

        res.status(200).json({
            status: 'success',
            data: product
        });
    });
}

// Create a single instance and export it
const productController = new ProductController();

// For debugging
console.log('Product controller methods:', Object.keys(productController));

module.exports = productController;