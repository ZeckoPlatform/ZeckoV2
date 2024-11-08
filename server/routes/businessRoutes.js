const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const BusinessUser = require('../models/businessUserModel');

// Get business profile with addresses
router.get('/profile', auth, async (req, res) => {
    try {
        const business = await BusinessUser.findById(req.user.id)
            .select('-password');

        if (!business) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        res.json({
            profile: business,
            addresses: business.addresses || []
        });
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

        // Update allowed fields
        const allowedUpdates = [
            'businessName',
            'email',
            'phone',
            'description',
            'website',
            'addresses'
        ];

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                business[field] = updates[field];
            }
        });

        await business.save();
        res.json(business);
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
