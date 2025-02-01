console.log('Loading userController.js - START');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const PasswordService = require('../services/passwordService');
const AccountSecurityService = require('../services/accountSecurityService');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');
const speakeasy = require('speakeasy');

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
        const { username, email, name, phone, address, businessName } = req.body;
        
        // Find user first to check account type
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create update object with only the fields that are present
        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (name) updateFields.name = name;
        if (phone) updateFields['profile.phone'] = phone;
        if (address) {
            // Handle address as an array with isDefault flag
            if (!user.profile.address) {
                updateFields['profile.address'] = [{...address, isDefault: true}];
            } else {
                // Add new address or update existing one
                const addresses = [...user.profile.address];
                const existingIndex = addresses.findIndex(a => 
                    a.street === address.street && 
                    a.city === address.city
                );
                
                if (existingIndex >= 0) {
                    addresses[existingIndex] = {...addresses[existingIndex], ...address};
                } else {
                    addresses.push({...address, isDefault: false});
                }
                updateFields['profile.address'] = addresses;
            }
        }
        
        // Handle business name for Business/Vendor accounts
        if (['Business', 'Vendor'].includes(user.accountType) && businessName) {
            updateFields['vendor.businessName'] = businessName;
        }

        // Update the user with the new fields
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Format the response
        const response = {
            id: updatedUser._id,
            email: updatedUser.email,
            username: updatedUser.username,
            name: updatedUser.name,
            accountType: updatedUser.accountType,
            profile: {
                phone: updatedUser.profile?.phone,
                address: updatedUser.profile?.address,
                bio: updatedUser.profile?.bio
            },
            preferences: updatedUser.preferences,
            ...((['Business', 'Vendor'].includes(updatedUser.accountType)) && {
                vendor: {
                    businessName: updatedUser.vendor?.businessName
                }
            })
        };
        
        res.json(response);
    } catch (error) {
        console.error('Profile update error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: Object.values(error.errors).map(e => e.message)
            });
        }
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

const forgotPassword = async (req, res) => {
    try {
        const { email, accountType = 'user' } = req.body;
        let Model = accountType.toLowerCase() === 'business' ? BusinessUser : 
                   accountType.toLowerCase() === 'vendor' ? VendorUser : User;
        
        const user = await Model.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In a real application, send email with reset link
        // For now, just return the token
        res.json({ 
            message: 'Password reset email sent',
            resetToken // Remove this in production
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password, accountType = 'user' } = req.body;
        const { token } = req.params;

        let Model = accountType.toLowerCase() === 'business' ? BusinessUser : 
                   accountType.toLowerCase() === 'vendor' ? VendorUser : User;

        const user = await Model.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};

const verifyToken = async (req, res) => {
    try {
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

        const userData = {
            id: user._id,
            userId: user._id,
            email: user.email,
            username: user.username || user.email,
            accountType: req.user.accountType.toLowerCase(),
            role: user.role,
            createdAt: user.createdAt,
            avatarUrl: user.avatarUrl || null,
            address: user.address || '',
            phone: user.phone || '',
            businessName: ['business', 'vendor'].includes(req.user.accountType) ? user.businessName : '',
            vendorCategory: req.user.accountType === 'vendor' ? user.vendorCategory : undefined,
            serviceCategories: req.user.accountType === 'business' ? user.serviceCategories : undefined
        };

        res.json({ user: userData, verified: true });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

const getSecuritySettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.securitySettings) {
            user.securitySettings = {
                twoFactorEnabled: false,
                emailNotifications: true,
                loginAlerts: true
            };
            await user.save();
        }

        res.json(user.securitySettings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching security settings' });
    }
};

const updateSecuritySettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.securitySettings = {
            ...user.securitySettings,
            ...req.body
        };

        await user.save();
        res.json(user.securitySettings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating security settings' });
    }
};

const setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const secret = speakeasy.generateSecret({
            name: `YourApp:${user.email}`
        });

        user.tempSecret = secret.base32;
        await user.save();

        res.json({ 
            secret: secret.base32,
            message: '2FA setup initiated'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error setting up 2FA' });
    }
};

const verify2FA = async (req, res) => {
    try {
        const { code, secret } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: code,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        user.twoFactorSecret = secret;
        user.tempSecret = undefined;
        user.securitySettings.twoFactorEnabled = true;
        await user.save();

        res.json({ message: '2FA setup successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying 2FA' });
    }
};

const userController = {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyToken,
    getSecuritySettings,
    updateSecuritySettings,
    setup2FA,
    verify2FA
};

console.log('Controller object being exported:', Object.keys(userController));
console.log('Loading userController.js - END');

module.exports = userController; 