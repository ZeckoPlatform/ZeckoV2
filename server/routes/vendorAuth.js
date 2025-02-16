const express = require('express');
const router = express.Router();
const VendorUser = require('../models/vendorUserModel');
const jwt = require('jsonwebtoken');
const RateLimitService = require('../services/rateLimitService');

router.post('/register', RateLimitService.registrationLimiter, async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            businessName,
            businessType,
            vendorCategory
        } = req.body;

        // Check if email already exists
        const existingUser = await VendorUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new vendor user
        const vendorUser = new VendorUser({
            username,
            email,
            password,
            businessName,
            businessType,
            vendorCategory,
            role: 'vendor'
        });

        await vendorUser.save();

        res.status(201).json({ message: 'Vendor registration successful' });
    } catch (error) {
        console.error('Vendor registration error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

router.post('/login', RateLimitService.authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Vendor login attempt:', email);

        const vendorUser = await VendorUser.findOne({ email });
        if (!vendorUser) {
            console.log('No vendor found with email:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await vendorUser.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for vendor:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                userId: vendorUser._id,
                accountType: 'vendor',
                role: 'vendor'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Vendor login successful:', email);

        res.json({
            token,
            user: {
                id: vendorUser._id,
                email: vendorUser.email,
                businessName: vendorUser.businessName,
                role: 'vendor',
                accountType: 'vendor'
            }
        });
    } catch (error) {
        console.error('Vendor login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router; 