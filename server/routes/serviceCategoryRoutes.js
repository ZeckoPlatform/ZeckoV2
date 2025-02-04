const express = require('express');
const router = express.Router();
const ServiceCategory = require('../models/serviceCategoryModel');
const { protect, isAdmin } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const { body } = require('express-validator');
const validationMiddleware = require('../middleware/validation');

// GET all categories
router.get('/', async (req, res, next) => {
    try {
        const categories = await ServiceCategory.find().sort('name');
        res.status(200).json({
            status: 'success',
            results: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
});

// GET single category
router.get('/:id', async (req, res, next) => {
    try {
        const category = await ServiceCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: category
        });
    } catch (error) {
        next(error);
    }
});

// POST new category (admin only)
router.post('/', [
    protect,
    isAdmin,
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    validationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const category = await ServiceCategory.create({
                name: req.body.name,
                description: req.body.description,
                icon: req.body.icon
            });
            res.status(201).json({
                status: 'success',
                data: category
            });
        } catch (error) {
            next(error);
        }
    }
]);

// PUT update category (admin only)
router.put('/:id', [
    protect,
    isAdmin,
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    validationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const category = await ServiceCategory.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!category) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Category not found'
                });
            }
            res.status(200).json({
                status: 'success',
                data: category
            });
        } catch (error) {
            next(error);
        }
    }
]);

// DELETE category (admin only)
router.delete('/:id', protect, isAdmin, async (req, res, next) => {
    try {
        const category = await ServiceCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category not found'
            });
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Service Category route error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

module.exports = router;
