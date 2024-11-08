const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const BusinessUser = require('../models/businessUserModel');

// Get all businesses
router.get('/', async (req, res) => {
    try {
        const businesses = await BusinessUser.find()
            .select('-password -__v')
            .sort({ createdAt: -1 });

        // Ensure all required fields are present
        const sanitizedBusinesses = businesses.map(business => ({
            _id: business._id,
            businessName: business.businessName || '',
            email: business.email || '',
            phone: business.phone || '',
            description: business.description || '',
            website: business.website || '',
            category: business.category || '',
            addresses: business.addresses || [],
            createdAt: business.createdAt,
            updatedAt: business.updatedAt,
            status: business.status || 'active',
            type: 'business' // Add explicit type
        }));

        res.json(sanitizedBusinesses);
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ message: 'Error fetching businesses' });
    }
});

// Get single business
router.get('/:id', async (req, res) => {
    try {
        const business = await BusinessUser.findById(req.params.id)
            .select('-password -__v');
        
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        // Ensure all required fields are present
        const sanitizedBusiness = {
            _id: business._id,
            businessName: business.businessName || '',
            email: business.email || '',
            phone: business.phone || '',
            description: business.description || '',
            website: business.website || '',
            category: business.category || '',
            addresses: business.addresses || [],
            createdAt: business.createdAt,
            updatedAt: business.updatedAt,
            status: business.status || 'active',
            type: 'business' // Add explicit type
        };

        res.json(sanitizedBusiness);
    } catch (error) {
        console.error('Error fetching business:', error);
        res.status(500).json({ message: 'Error fetching business' });
    }
});

// Get business profile
router.get('/profile', auth, async (req, res) => {
    try {
        const business = await BusinessUser.findById(req.user.id)
            .select('-password -__v');

        if (!business) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        // Return sanitized response
        const sanitizedBusiness = {
            _id: business._id,
            businessName: business.businessName || '',
            email: business.email || '',
            phone: business.phone || '',
            description: business.description || '',
            website: business.website || '',
            category: business.category || '',
            addresses: business.addresses || [],
            createdAt: business.createdAt,
            updatedAt: business.updatedAt,
            status: business.status || 'active',
            type: 'business'
        };

        res.json(sanitizedBusiness);
    } catch (error) {
        console.error('Error fetching business profile:', error);
        res.status(500).json({ message: 'Error fetching business profile' });
    }
});

// Update business profile
router.put('/profile', auth, async (req, res) => {
    try {
        const updates = req.body;
        const business = await BusinessUser.findById(req.user.id);

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        // Update allowed fields with default values if undefined
        const allowedUpdates = {
            businessName: updates.businessName || business.businessName || '',
            email: updates.email || business.email || '',
            phone: updates.phone || business.phone || '',
            description: updates.description || business.description || '',
            website: updates.website || business.website || '',
            category: updates.category || business.category || '',
            addresses: updates.addresses || business.addresses || []
        };

        // Apply updates
        Object.keys(allowedUpdates).forEach(key => {
            business[key] = allowedUpdates[key];
        });

        await business.save();

        // Return sanitized response
        const sanitizedBusiness = {
            _id: business._id,
            ...allowedUpdates,
            createdAt: business.createdAt,
            updatedAt: business.updatedAt,
            status: business.status || 'active',
            type: 'business'
        };

        res.json(sanitizedBusiness);
    } catch (error) {
        console.error('Error updating business profile:', error);
        res.status(500).json({ message: 'Error updating business profile' });
    }
});

// Add business address
router.post('/addresses', auth, async (req, res) => {
    try {
        const business = await BusinessUser.findById(req.user.id);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        const { street, city, state, zipCode, country, isDefault } = req.body;
        const newAddress = {
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false
        };

        if (!business.addresses) {
            business.addresses = [];
        }

        // If this is the first address or marked as default, update other addresses
        if (isDefault || business.addresses.length === 0) {
            business.addresses.forEach(addr => addr.isDefault = false);
            newAddress.isDefault = true;
        }

        business.addresses.push(newAddress);
        await business.save();

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error adding business address:', error);
        res.status(500).json({ message: 'Error adding business address' });
    }
});

// Get business addresses
router.get('/addresses', auth, async (req, res) => {
    try {
        const business = await BusinessUser.findById(req.user.id);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        res.json(business.addresses || []);
    } catch (error) {
        console.error('Error fetching business addresses:', error);
        res.status(500).json({ message: 'Error fetching business addresses' });
    }
});

module.exports = router;
