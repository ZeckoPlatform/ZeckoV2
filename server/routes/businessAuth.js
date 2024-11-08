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
            description,
            phone,
            website
        } = req.body;

        // Check if email already exists
        const existingUser = await BusinessUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new business user with all fields
        const businessUser = new BusinessUser({
            username,
            email,
            password,
            businessName,
            businessType,
            phone: phone || '',
            website: website || '',
            description: description || '',
            role: 'business',
            addresses: [],
            isVerified: false
        });

        await businessUser.save();

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: businessUser._id,
                accountType: 'business',
                role: 'business'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send success response with token
        res.status(201).json({
            success: true,
            message: 'Business registration successful',
            token,
            user: {
                id: businessUser._id,
                email: businessUser.email,
                businessName: businessUser.businessName,
                role: 'business',
                accountType: 'business'
            }
        });
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
        
        console.log('Business login attempt for:', email);

        const businessUser = await BusinessUser.findOne({ email });
        if (!businessUser) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await businessUser.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token with consistent format
        const token = jwt.sign(
            { 
                userId: businessUser._id.toString(), // Ensure string format
                accountType: 'business',
                role: 'business'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Store user data in consistent format
        const userData = {
            id: businessUser._id.toString(),
            email: businessUser.email,
            businessName: businessUser.businessName,
            role: 'business',
            accountType: 'business'
        };

        res.json({
            success: true,
            token,
            user: userData
        });
    } catch (error) {
        console.error('Business login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router; 