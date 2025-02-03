const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const ApiError = require('../utils/apiError');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class ProductController {
    // Add logging to see what's being exported
    constructor() {
        console.log('ProductController methods:', {
            createProduct: !!this.createProduct,
            getProducts: !!this.getProducts,
            getProduct: !!this.getProduct,
            updateProduct: !!this.updateProduct,
            deleteProduct: !!this.deleteProduct,
            getSellerProducts: !!this.getSellerProducts,
            updateStock: !!this.updateStock
        });
    }

    // Create new product
    createProduct = catchAsync(async (req, res, next) => {
        const { title, description, price, category } = req.body;
        
        // Handle image uploads
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = await Promise.all(
                req.files.map(async (file) => {
                    const result = await cloudinary.uploader.upload(file.path);
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

        scheduleAuction(req, product);

        res.status(201).json({
            status: 'success',
            data: product
        });
    });

    // Get all products with filtering, sorting, and pagination
    getProducts = catchAsync(async (req, res, next) => {
        let query = Product.find();
        
        // Build filter object
        const filter = { status: 'active' };
        if (req.query.category) {
            filter.category = req.query.category;
        }
        if (req.query.seller) {
            filter.seller = req.query.seller;
        }
        if (req.query.priceMin || req.query.priceMax) {
            filter['price.current'] = {};
            if (req.query.priceMin) filter['price.current'].$gte = Number(req.query.priceMin);
            if (req.query.priceMax) filter['price.current'].$lte = Number(req.query.priceMax);
        }
        
        // Apply filters
        query = query.find(filter);

        // Search functionality
        if (req.query.search) {
            query = query.find({
                $text: { $search: req.query.search }
            });
        }

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        
        query = query.skip(skip).limit(limit);

        // Execute query
        const [products, total] = await Promise.all([
            query.exec(),
            Product.countDocuments(filter)
        ]);

        res.status(200).json({
            status: 'success',
            results: products.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                resultsPerPage: limit
            },
            data: products
        });
    });

    // Get single product
    getProduct = catchAsync(async (req, res, next) => {
        const product = await Product.findOne({
            $or: [
                { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
                { slug: req.params.id }
            ]
        }).populate('category seller');

        if (!product) {
            throw new ApiError('Product not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: product
        });
    });

    // Update product
    updateProduct = catchAsync(async (req, res, next) => {
        const { files, body } = req;
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ApiError('Product not found', 404);
        }

        // Check ownership
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            throw new ApiError('Not authorized to update this product', 403);
        }

        // Handle image uploads
        if (files && files.length > 0) {
            // Delete old images from Cloudinary
            for (const image of product.images) {
                if (image.publicId) {
                    await cloudinary.uploader.destroy(image.publicId);
                }
            }

            // Upload new images
            const images = [];
            for (const file of files) {
                const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                const uploadResult = await cloudinary.uploader.upload(fileStr, {
                    folder: 'products',
                    resource_type: 'auto'
                });
                
                images.push({
                    url: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                    alt: body.title || product.title,
                    isMain: images.length === 0
                });
            }
            body.images = images;
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: body },
            { new: true, runValidators: true }
        );

        scheduleAuction(req, updatedProduct);

        res.status(200).json({
            status: 'success',
            data: updatedProduct
        });
    });

    // Delete product
    deleteProduct = catchAsync(async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ApiError('Product not found', 404);
        }

        // Check ownership
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            throw new ApiError('Not authorized to delete this product', 403);
        }

        // Delete images from Cloudinary
        for (const image of product.images) {
            if (image.publicId) {
                await cloudinary.uploader.destroy(image.publicId);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    // Get vendor products
    getSellerProducts = catchAsync(async (req, res, next) => {
        const products = await Product.find({ seller: req.user._id })
            .populate('category', 'name')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: products.length,
            data: products
        });
    });

    // Update product stock
    updateStock = catchAsync(async (req, res, next) => {
        const { quantity, operation } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ApiError('Product not found', 404);
        }

        // Check ownership
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            throw new ApiError('Not authorized to update this product', 403);
        }

        // Update inventory quantity based on operation
        if (operation === 'add') {
            product.inventory.quantity += Number(quantity);
        } else if (operation === 'subtract') {
            if (product.inventory.quantity < Number(quantity)) {
                throw new ApiError('Insufficient stock', 400);
            }
            product.inventory.quantity -= Number(quantity);
        } else {
            throw new ApiError('Invalid operation', 400);
        }

        await product.save();

        res.status(200).json({
            status: 'success',
            data: product
        });
    });
}

const scheduleAuction = (req, product) => {
    if (product.bidding?.enabled && product.bidding?.endTime) {
        try {
            const auctionScheduler = req.app.get('auctionScheduler');
            if (auctionScheduler) {
                auctionScheduler.scheduleAuction(product);
            } else {
                console.warn('Auction scheduler not initialized');
            }
        } catch (error) {
            console.error('Failed to schedule auction:', error);
        }
    }
};

// Create a single instance and export it
const productController = new ProductController();
console.log('Exported controller methods:', Object.keys(productController));
module.exports = productController; 