const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const ApiError = require('../utils/apiError');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Upload');
const mongoose = require('mongoose');

class CategoryController {
    // Create new category
    async createCategory(req, res, next) {
        try {
            const { file, body } = req;

            // Handle image upload
            if (file) {
                const uploadResult = await uploadToS3(file);
                body.image = {
                    url: uploadResult.Location,
                    alt: body.name
                };
            }

            const category = await Category.create(body);

            res.status(201).json({
                status: 'success',
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all categories
    async getCategories(req, res, next) {
        try {
            const filter = { status: 'active' };
            if (req.query.featured) {
                filter.featured = true;
            }

            const categories = await Category.find(filter)
                .populate('subcategories')
                .sort('order name');

            res.status(200).json({
                status: 'success',
                results: categories.length,
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }

    // Get category by ID or slug
    async getCategory(req, res, next) {
        try {
            const category = await Category.findOne({
                $or: [
                    { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
                    { slug: req.params.id }
                ]
            }).populate('subcategories');

            if (!category) {
                throw new ApiError('Category not found', 404);
            }

            // Get products count
            const productsCount = await Product.countDocuments({
                category: category._id,
                status: 'published'
            });

            res.status(200).json({
                status: 'success',
                data: {
                    ...category.toObject(),
                    productsCount
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Update category
    async updateCategory(req, res, next) {
        try {
            const { file, body } = req;
            const category = await Category.findById(req.params.id);

            if (!category) {
                throw new ApiError('Category not found', 404);
            }

            // Handle image upload
            if (file) {
                // Delete old image
                if (category.image?.url) {
                    await deleteFromS3(category.image.url);
                }

                // Upload new image
                const uploadResult = await uploadToS3(file);
                body.image = {
                    url: uploadResult.Location,
                    alt: body.name || category.name
                };
            }

            const updatedCategory = await Category.findByIdAndUpdate(
                req.params.id,
                { $set: body },
                { new: true, runValidators: true }
            );

            res.status(200).json({
                status: 'success',
                data: updatedCategory
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete category
    async deleteCategory(req, res, next) {
        try {
            const category = await Category.findById(req.params.id);

            if (!category) {
                throw new ApiError('Category not found', 404);
            }

            // Check if category has products
            const hasProducts = await Product.exists({ category: category._id });
            if (hasProducts) {
                throw new ApiError('Cannot delete category with existing products', 400);
            }

            // Check if category has subcategories
            const hasSubcategories = await Category.exists({ parent: category._id });
            if (hasSubcategories) {
                throw new ApiError('Cannot delete category with existing subcategories', 400);
            }

            // Delete image from S3
            if (category.image?.url) {
                await deleteFromS3(category.image.url);
            }

            await category.remove();

            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }

    // Get category tree
    async getCategoryTree(req, res, next) {
        try {
            const categories = await Category.find({ parent: null, status: 'active' })
                .populate({
                    path: 'subcategories',
                    match: { status: 'active' },
                    populate: {
                        path: 'subcategories',
                        match: { status: 'active' }
                    }
                })
                .sort('order name');

            res.status(200).json({
                status: 'success',
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryController(); 