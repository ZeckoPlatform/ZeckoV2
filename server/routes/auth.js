const express = require('express');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const timeout = require('connect-timeout');

const router = express.Router();

router.use(timeout('25s'));

router.use((req, res, next) => {
    if (!req.timedout) next();
});

const formatAccountType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    console.log('Verify endpoint called with user:', req.user);
    
    let Model;
    switch(req.user.accountType) {
      case 'business':
        Model = BusinessUser;
        break;
      case 'vendor':
        Model = VendorUser;
        break;
      default:
        Model = User;
    }

    const user = await Model.findById(req.user.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build response object with ALL fields
    const userData = {
      id: user._id,
      userId: user._id,
      email: user.email,
      username: user.username || user.email,
      accountType: formatAccountType(req.user.accountType),
      role: user.role,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl || null,
      address: user.address || '',
      phone: user.phone || '',
      businessName: ['business', 'vendor'].includes(req.user.accountType) ? user.businessName : '',
      vendorCategory: req.user.accountType === 'vendor' ? user.vendorCategory : undefined,
      serviceCategories: req.user.accountType === 'business' ? user.serviceCategories : undefined
    };

    console.log('Verify response:', userData);
    res.json({ user: userData, verified: true });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      username, 
      accountType, 
      businessName, 
      businessType,
      vendorCategory,
      serviceCategories,
      serviceArea,
      storeSettings
    } = req.body;

    // Check for existing user across all models
    const existingUser = await User.findOne({ email }) 
      || await BusinessUser.findOne({ email })
      || await VendorUser.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let user;
    switch(accountType) {
      case 'business':
        user = new BusinessUser({
          email,
          password,
          username,
          businessName,
          businessType,
          serviceCategories,
          serviceArea,
          role: 'contractor'
        });
        break;
      
      case 'vendor':
        user = new VendorUser({
          email,
          password,
          username,
          businessName,
          businessType,
          vendorCategory,
          storeSettings,
          role: 'vendor'
        });
        break;
      
      default:
        user = new User({
          email,
          password,
          username,
          role: 'user'
        });
    }

    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id,
        accountType,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return type-specific response
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      accountType,
      role: user.role
    };

    if (accountType === 'business') {
      userData.businessName = user.businessName;
      userData.businessType = user.businessType;
      userData.serviceCategories = user.serviceCategories;
    }

    if (accountType === 'vendor') {
      userData.businessName = user.businessName;
      userData.vendorCategory = user.vendorCategory;
      userData.storeSettings = user.storeSettings;
    }

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Since we're using JWT, we don't need to do server-side logout
    // The client will remove the token
    // But we can blacklist the token if needed
    
    // Optional: Add token to blacklist
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      // You could add the token to a blacklist in Redis or your database
      // await blacklistToken(token);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt for:', email);

        if (!email || !password) {
            console.log('Missing credentials:', { email: !!email, password: !!password });
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Try to find user in all collections
        let user = null;
        let userType = 'Regular'; // Default to Regular (capitalized)

        try {
            // Check each user type collection
            console.log('Checking User collection...');
            const regularUser = await User.findOne({ email }).select('+password');
            
            console.log('Checking BusinessUser collection...');
            const businessUser = await BusinessUser.findOne({ email }).select('+password');
            
            console.log('Checking VendorUser collection...');
            const vendorUser = await VendorUser.findOne({ email }).select('+password');

            if (regularUser) {
                user = regularUser;
                userType = 'Regular';
                console.log('Found regular user');
            } else if (businessUser) {
                user = businessUser;
                userType = 'Business';
                console.log('Found business user');
            } else if (vendorUser) {
                user = vendorUser;
                userType = 'Vendor';
                console.log('Found vendor user');
            }
        } catch (dbError) {
            console.error('Database error during user lookup:', dbError);
            return res.status(500).json({
                error: 'Database error during user lookup',
                details: dbError.message
            });
        }

        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                accountType: userType,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Prepare user response
        const userData = {
            id: user._id,
            email: user.email,
            username: user.username || user.email,
            accountType: userType,
            role: user.role || 'user',
            name: user.name || user.businessName || user.username,
            avatarUrl: user.avatarUrl || null,
            profile: user.profile || {}
        };

        // Add type-specific fields
        if (userType === 'Business') {
            userData.businessName = user.businessName;
            userData.businessType = user.businessType;
            userData.serviceCategories = user.serviceCategories;
        } else if (userType === 'Vendor') {
            userData.businessName = user.businessName;
            userData.vendorCategory = user.vendorCategory;
            userData.storeSettings = user.storeSettings;
        }

        console.log('Login successful for:', email);
        res.json({
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Server error during login',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 