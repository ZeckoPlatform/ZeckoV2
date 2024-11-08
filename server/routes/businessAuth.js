const express = require('express');
const router = express.Router();
const BusinessUser = require('../models/businessUserModel');
const Business = require('../models/businessModel');
const jwt = require('jsonwebtoken');

// Business Registration
router.post('/register', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            businessName,
            businessType,
            location,
            description
        } = req.body;

        // Check if email already exists
        const existingUser = await BusinessUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new business user
        const businessUser = new BusinessUser({
            username,
            email,
            password,
            businessName,
            businessType,
            role: 'business'
        });

        await businessUser.save();

        // Create associated business profile
        const business = new Business({
            name: businessName,
            description: description || businessType,
            category: businessType,
            location: location || '',
            contactEmail: email,
            owner: businessUser._id
        });

        await business.save();

        // Update the business user with the business reference
        businessUser.business = business._id;
        await businessUser.save();

        res.status(201).json({ message: 'Business registration successful' });
    } catch (error) {
        console.error('Business registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed', 
            details: error.message 
        });
    }
});

// Business Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const businessUser = await BusinessUser.findOne({ email });
        if (!businessUser) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await businessUser.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                userId: businessUser._id,
                accountType: 'business'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: businessUser._id,
                email: businessUser.email,
                businessName: businessUser.businessName,
                role: 'business'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router; 