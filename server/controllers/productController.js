const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const ApiError = require('../utils/apiError');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Upload');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class ProductController {
    // Create new product
    async createProduct(req, res, next) {
        try {
            const { files, body } = req;
            
            // Handle image uploads
            const images = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const uploadResult = await uploadToS3(file);
                    images.push({
                        url: uploadResult.Location,
                        alt: body.name,
                        isMain: images.length === 0 // First image is main
                    });
                }
            }

            const product = new Product({
                ...body,
                vendor: req.user._id,
                images
            });

            await product.save();

            scheduleAuction(req, product);

            res.status(201).json({
                status: 'success',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all products with filtering, sorting, and pagination
    async getProducts(req, res, next) {
        try {
            let query = Product.find();
            
            // Build filter object
            const filter = { status: 'published' };
            if (req.query.category) {
                filter.category = req.query.category;
            }
            if (req.query.vendor) {
                filter.vendor = req.query.vendor;
            }
            if (req.query.priceMin || req.query.priceMax) {
                filter['price.regular'] = {};
                if (req.query.priceMin) filter['price.regular'].$gte = Number(req.query.priceMin);
                if (req.query.priceMax) filter['price.regular'].$lte = Number(req.query.priceMax);
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
        } catch (error) {
            next(error);
        }
    }

    // Get single product
    async getProduct(req, res, next) {
        try {
            const product = await Product.findOne({
                $or: [
                    { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
                    { slug: req.params.id }
                ]
            }).populate('category vendor');

            if (!product) {
                throw new ApiError('Product not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    // Update product
    async updateProduct(req, res, next) {
        try {
            const { files, body } = req;
            const product = await Product.findById(req.params.id);

            if (!product) {
                throw new ApiError('Product not found', 404);
            }

            // Check ownership
            if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                throw new ApiError('Not authorized to update this product', 403);
            }

            // Handle image uploads
            if (files && files.length > 0) {
                // Delete old images from S3
                for (const image of product.images) {
                    await deleteFromS3(image.url);
                }

                // Upload new images
                const images = [];
                for (const file of files) {
                    const uploadResult = await uploadToS3(file);
                    images.push({
                        url: uploadResult.Location,
                        alt: body.name || product.name,
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
        } catch (error) {
            next(error);
        }
    }

    // Delete product
    async deleteProduct(req, res, next) {
        try {
            const product = await Product.findById(req.params.id);

            if (!product) {
                throw new ApiError('Product not found', 404);
            }

            // Check ownership
            if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                throw new ApiError('Not authorized to delete this product', 403);
            }

            // Delete images from S3
            for (const image of product.images) {
                await deleteFromS3(image.url);
            }

            await product.remove();

            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }

    // Get vendor products
    async getVendorProducts(req, res, next) {
        try {
            const products = await Product.find({ vendor: req.user._id })
                .sort('-createdAt');

            res.status(200).json({
                status: 'success',
                results: products.length,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    // Update product stock
    async updateStock(req, res, next) {
        try {
            const { quantity, operation } = req.body;
            const product = await Product.findById(req.params.id);

            if (!product) {
                throw new ApiError('Product not found', 404);
            }

            await product.updateStock(quantity, operation);

            res.status(200).json({
                status: 'success',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }
}

const scheduleAuction = (req, product) => {
    if (product.bidding?.enabled && product.bidding?.endTime) {
        const auctionScheduler = req.app.get('auctionScheduler');
        auctionScheduler.scheduleAuction(product);
    }
};

module.exports = new ProductController(); 