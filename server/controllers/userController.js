console.log('Loading userController.js - START');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const PasswordService = require('../services/passwordService');
const AccountSecurityService = require('../services/accountSecurityService');

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

        // Validate password strength
        const passwordValidation = PasswordService.validatePassword(password, email, username);
        
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: 'Password is too weak',
                details: passwordValidation.warnings,
                suggestions: passwordValidation.suggestions
            });
        }

        // Hash password with enhanced security
        const hashedPassword = await PasswordService.hashPassword(password);

        // Create user with normalized account type
        user = new User({
            username,
            email,
            password: hashedPassword,
            accountType: normalizedAccountType,
            // Add other fields as needed
        });

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
        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +isLocked +passwordExpiresAt');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            return res.status(423).json({
                message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`
            });
        }

        // Verify password
        const isMatch = await PasswordService.verifyPassword(password, user.password);
        if (!isMatch) {
            await AccountSecurityService.handleFailedLogin(user);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password expiration
        if (AccountSecurityService.isPasswordExpired(user)) {
            return res.status(403).json({
                message: 'Your password has expired. Please reset your password.',
                requiresPasswordChange: true
            });
        }

        // Reset login attempts on successful login
        await AccountSecurityService.resetLoginAttempts(user);

        // Generate tokens
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Check for approaching password expiration
        const expiryWarning = AccountSecurityService.getPasswordExpiryWarning(user);

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            },
            ...(expiryWarning && { passwordWarning: expiryWarning })
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Check if refresh token exists in database and is valid
        const tokenDoc = await RefreshToken.findOne({ 
            userId: decoded.userId,
            token: refreshToken,
            isValid: true
        });

        if (!tokenDoc) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Get user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Generate new tokens
        const newAccessToken = jwt.sign(
            { 
                userId: user._id,
                accountType: user.accountType,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const newRefreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Invalidate old refresh token and save new one
        tokenDoc.isValid = false;
        await tokenDoc.save();

        await RefreshToken.create({
            userId: user._id,
            token: newRefreshToken,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        // Invalidate refresh token if provided
        if (refreshToken) {
            await RefreshToken.findOneAndUpdate(
                { token: refreshToken },
                { isValid: false }
            );
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
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

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId).select('+password +passwordHistory');

        // Verify current password
        const isMatch = await PasswordService.verifyPassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Validate new password strength
        const passwordValidation = PasswordService.validatePassword(newPassword, user.email, user.username);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: 'New password is too weak',
                details: passwordValidation.warnings,
                suggestions: passwordValidation.suggestions
            });
        }

        // Check password history
        if (!PasswordService.enforcePasswordHistory(newPassword, user.passwordHistory || [])) {
            return res.status(400).json({
                message: 'New password must be different from your last 5 passwords'
            });
        }

        // Update password and history
        const hashedPassword = await PasswordService.hashPassword(newPassword);
        user.passwordHistory = [
            ...(user.passwordHistory || []).slice(0, 4), // Keep last 5 passwords
            user.password // Add current password to history
        ];
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const controller = {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
    changePassword
};

console.log('Controller object being exported:', Object.keys(controller));
console.log('Loading userController.js - END');

module.exports = controller; 