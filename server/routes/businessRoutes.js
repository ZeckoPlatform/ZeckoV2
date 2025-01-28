const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const BusinessUser = require('../models/businessUserModel');
const Business = require('../models/businessModel');
const validationMiddleware = require('../middleware/validation');
const businessController = require('../controllers/businessController');
const { body } = require('express-validator');

// Helper function to sanitize business data
const sanitizeBusinessData = (business) => {
    return {
        _id: business._id || '',
        businessName: business.businessName || '',
        email: business.email || '',
        phone: business.phone || '',
        description: business.description || '',
        website: business.website || '',
        category: business.category || '',
        subcategory: business.subcategory || '',
        location: business.location || '',
        addresses: Array.isArray(business.addresses) ? business.addresses : [],
        status: business.status || 'active',
        type: 'business',
        createdAt: business.createdAt || new Date(),
        updatedAt: business.updatedAt || new Date(),
        // Add any other fields that might be used in filtering/searching
        searchTerms: [
            business.businessName || '',
            business.category || '',
            business.subcategory || '',
            business.location || ''
        ].filter(Boolean).join(' ').toLowerCase()
    };
};

// Get all businesses
router.get('/', async (req, res) => {
    try {
        const businesses = await Business.find()
            .populate('owner', '-password -__v')  // Include owner details if needed
            .select('-__v')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            businesses: businesses
        });
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching businesses',
            businesses: []
        });
    }
});

// Get single business
router.get('/:id', async (req, res) => {
    try {
        const business = await BusinessUser.findById(req.params.id)
            .select('-password -__v');
        
        if (!business) {
            return res.status(404).json({ 
                message: 'Business not found',
                business: null
            });
        }

        const sanitizedBusiness = sanitizeBusinessData(business.toObject());
        res.json(sanitizedBusiness);
    } catch (error) {
        console.error('Error fetching business:', error);
        res.status(500).json({ 
            message: 'Error fetching business',
            business: null
        });
    }
});

// Get business profile
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('Profile request received');
        console.log('User from request:', req.user);

        const userId = req.user.id;
        console.log('Looking up business with ID:', userId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid ObjectId:', userId);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const business = await BusinessUser.findById(userId)
            .select('-password')
            .lean();

        console.log('Found business:', business ? 'yes' : 'no');

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business profile not found'
            });
        }

        res.json({
            success: true,
            business: {
                _id: business._id,
                businessName: business.businessName || '',
                email: business.email || '',
                phone: business.phone || '',
                description: business.description || '',
                website: business.website || '',
                businessType: business.businessType || '',
                addresses: business.addresses || []
            }
        });

    } catch (error) {
        console.error('Profile route error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching business',
            debug: process.env.NODE_ENV === 'development' ? {
                error: error.message,
                stack: error.stack
            } : undefined
        });
    }
});

// Update business profile
router.put('/profile', auth, async (req, res) => {
    try {
        console.log('1. Update request received');
        console.log('2. Request body:', req.body);

        const business = await BusinessUser.findById(req.user.id);

        if (!business) {
            console.log('3a. Business not found');
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        console.log('3b. Business found, updating fields');

        const allowedUpdates = [
            'businessName',
            'email',
            'phone',
            'description',
            'website',
            'businessType'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                business[field] = req.body[field];
            }
        });

        await business.save();
        console.log('4. Business updated successfully');

        res.json({
            success: true,
            business: {
                _id: business._id,
                businessName: business.businessName,
                email: business.email,
                phone: business.phone || '',
                description: business.description || '',
                website: business.website || '',
                category: business.businessType || '',
                addresses: business.addresses || []
            }
        });

    } catch (error) {
        console.error('Error updating business profile:', error);
        res.status(500).json({ 
            message: 'Error updating business profile' 
        });
    }
});

// Add business address
router.post('/addresses', auth, async (req, res) => {
    try {
        const business = await BusinessUser.findById(req.user.id);
        if (!business) {
            return res.status(404).json({ 
                message: 'Business not found',
                success: false 
            });
        }

        const { street, city, state, zipCode, country, isDefault } = req.body;

        if (!business.addresses) {
            business.addresses = [];
        }

        const newAddress = {
            street: street || '',
            city: city || '',
            state: state || '',
            zipCode: zipCode || '',
            country: country || '',
            isDefault: isDefault || business.addresses.length === 0
        };

        if (newAddress.isDefault) {
            business.addresses.forEach(addr => addr.isDefault = false);
        }

        business.addresses.push(newAddress);
        await business.save();

        res.status(201).json({
            message: 'Address added successfully',
            success: true,
            address: newAddress
        });
    } catch (error) {
        console.error('Error adding business address:', error);
        res.status(500).json({ 
            message: 'Error adding business address',
            success: false 
        });
    }
});

// Search businesses
router.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        const businesses = await BusinessUser.find()
            .select('-password -__v');

        const sanitizedBusinesses = businesses
            .map(business => sanitizeBusinessData(business.toObject()))
            .filter(business => 
                business.searchTerms.includes(query) ||
                business.businessName.toLowerCase().includes(query) ||
                business.category.toLowerCase().includes(query) ||
                (business.subcategory && business.subcategory.toLowerCase().includes(query)) ||
                (business.location && business.location.toLowerCase().includes(query))
            );

        res.json(sanitizedBusinesses);
    } catch (error) {
        console.error('Error searching businesses:', error);
        res.status(500).json({ 
            message: 'Error searching businesses',
            businesses: []
        });
    }
});

// Business specific validations
const businessValidations = [
    body('businessName').trim().isLength({ min: 2 }),
    body('businessType').isIn(['contractor', 'company', 'individual']),
    body('registrationNumber').optional().trim().isLength({ min: 5 }),
    body('address').isObject(),
    body('address.street').trim().isLength({ min: 5 }),
    body('address.city').trim().isLength({ min: 2 }),
    body('address.state').trim().isLength({ min: 2 }),
    body('address.zipCode').trim().matches(/^[0-9]{5}(-[0-9]{4})?$/),
    body('phone').matches(/^\+?[\d\s-]{10,}$/),
    validationMiddleware.handleValidationErrors
];

// Apply validation to business routes
router.post('/register', [...businessValidations, validationMiddleware.validateUser], businessController.register);
router.put('/update', businessValidations, businessController.update);
router.post('/verify', [
    body('documents').isArray(),
    body('documents.*.type').isIn(['license', 'insurance', 'certification']),
    body('documents.*.number').trim().isLength({ min: 5 }),
    validationMiddleware.handleValidationErrors
], businessController.verify);

module.exports = router;
