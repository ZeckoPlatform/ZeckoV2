console.log('Loading userController.js - START');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const register = async (req, res) => {
    try {
        console.log('Registration attempt with:', req.body);
        
        const { username, email, password, accountType } = req.body;

        // Normalize account type
        const normalizedAccountType = accountType 
            ? accountType.charAt(0).toUpperCase() + accountType.slice(1).toLowerCase()
            : 'Regular';

        // Validate account type
        if (!['Regular', 'Business', 'Vendor'].includes(normalizedAccountType)) {
            return res.status(400).json({ message: 'Invalid account type' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user with normalized account type
        user = new User({
            username,
            email,
            password,
            accountType: normalizedAccountType,
            // Add other fields as needed
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        console.log('Login attempt with:', req.body);
        
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Normalize account type
        const normalizedAccountType = user.accountType
            ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1).toLowerCase()
            : 'Regular';

        // Generate token with normalized account type
        const token = jwt.sign(
            { 
                userId: user._id,
                accountType: normalizedAccountType,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                accountType: normalizedAccountType
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, email, address, phone, businessName } = req.body;
        
        // Create update object with only the fields that are present
        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (address) updateFields['profile.address'] = address;
        if (phone) updateFields['profile.phone'] = phone;
        
        // Only add businessName if user is not Regular account type
        const user = await User.findById(req.user.userId);
        if (user.accountType !== 'Regular' && businessName) {
            updateFields['vendor.businessName'] = businessName;
        }

        // Update the user with the new fields
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updateFields },
            { new: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Format the response
        const response = {
            id: updatedUser._id,
            email: updatedUser.email,
            username: updatedUser.username,
            accountType: updatedUser.accountType,
            profile: {
                address: updatedUser.profile?.address,
                phone: updatedUser.profile?.phone
            },
            ...(updatedUser.accountType !== 'Regular' && {
                businessName: updatedUser.vendor?.businessName
            })
        };
        
        res.json(response);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

const controller = {
    register,
    login,
    getProfile,
    updateProfile
};

console.log('Controller object being exported:', Object.keys(controller));
console.log('Loading userController.js - END');

module.exports = controller; 