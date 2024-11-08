const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const BusinessUser = require('../models/businessUserModel');

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
        const businesses = await BusinessUser.find()
            .select('-password -__v')
            .sort({ createdAt: -1 });

        const sanitizedBusinesses = businesses.map(business => 
            sanitizeBusinessData(business.toObject())
        );

        res.json(sanitizedBusinesses);
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ 
            message: 'Error fetching businesses',
            businesses: [] // Return empty array as fallback
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
        console.log('Fetching business profile for user:', req.user.id);
        
        if (!req.user || !req.user.id) {
            console.error('No user ID in request');
            return res.status(401).json({ 
                message: 'Authentication required' 
            });
        }

        const business = await BusinessUser.findById(req.user.id)
            .select('-password')
            .lean();

        console.log('Found business:', business ? 'yes' : 'no');

        if (!business) {
            return res.status(404).json({ 
                message: 'Business profile not found',
                userId: req.user.id 
            });
        }

        res.json({
            success: true,
            business: {
                businessName: business.businessName,
                email: business.email,
                phone: business.phone || '',
                description: business.description || '',
                website: business.website || '',
                category: business.category || '',
                addresses: business.addresses || []
            }
        });
    } catch (error) {
        console.error('Error in /profile route:', error);
        res.status(500).json({ 
            message: 'Error fetching business profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update business profile
router.put('/profile', auth, async (req, res) => {
    try {
        const business = await BusinessUser.findById(req.user.id);

        if (!business) {
            return res.status(404).json({ 
                message: 'Business not found' 
            });
        }

        const allowedUpdates = [
            'businessName',
            'email',
            'phone',
            'description',
            'website',
            'category'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                business[field] = req.body[field];
            }
        });

        await business.save();
        res.json(business);
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

module.exports = router;
