const express = require('express');
const { protect, isBusiness } = require('../middleware/auth');
const ServiceRequest = require('../models/serviceRequestModel');
const { body } = require('express-validator');
const validationMiddleware = require('../middleware/validation');
const router = express.Router();

// Validation middleware
const validateServiceRequest = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('budget').isNumeric().withMessage('Budget must be a number'),
    body('deadline').isISO8601().withMessage('Valid deadline date is required'),
    body('categories').isArray().withMessage('Categories must be an array'),
    validationMiddleware.handleValidationErrors
];

// GET all service requests
router.get('/', async (req, res, next) => {
    try {
        const requests = await ServiceRequest.find()
            .populate('businessId', 'businessName email')
            .sort('-createdAt');
        
        res.status(200).json({
            status: 'success',
            results: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
});

// GET business's service requests
router.get('/my-requests', protect, isBusiness, async (req, res, next) => {
    try {
        const requests = await ServiceRequest.find({ businessId: req.user.id })
            .populate('businessId', 'businessName email')
            .sort('-createdAt');
        
        res.status(200).json({
            status: 'success',
            results: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
});

// GET single service request
router.get('/:id', async (req, res, next) => {
    try {
        const request = await ServiceRequest.findById(req.params.id)
            .populate('businessId', 'businessName email');
        
        if (!request) {
            return res.status(404).json({
                status: 'fail',
                message: 'Service request not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: request
        });
    } catch (error) {
        next(error);
    }
});

// POST new service request
router.post('/', [
    protect,
    isBusiness,
    validateServiceRequest,
    async (req, res, next) => {
        try {
            const request = await ServiceRequest.create({
                ...req.body,
                businessId: req.user.id,
                status: 'open'
            });

            res.status(201).json({
                status: 'success',
                data: request
            });
        } catch (error) {
            next(error);
        }
    }
]);

// PUT update service request
router.put('/:id', [
    protect,
    isBusiness,
    validateServiceRequest,
    async (req, res, next) => {
        try {
            const request = await ServiceRequest.findOneAndUpdate(
                { _id: req.params.id, businessId: req.user.id },
                req.body,
                { new: true, runValidators: true }
            );

            if (!request) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Service request not found or unauthorized'
                });
            }

            res.status(200).json({
                status: 'success',
                data: request
            });
        } catch (error) {
            next(error);
        }
    }
]);

// DELETE service request
router.delete('/:id', protect, isBusiness, async (req, res, next) => {
    try {
        const request = await ServiceRequest.findOneAndDelete({
            _id: req.params.id,
            businessId: req.user.id
        });

        if (!request) {
            return res.status(404).json({
                status: 'fail',
                message: 'Service request not found or unauthorized'
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
    console.error('Service Request route error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

module.exports = router; 