const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');
const cache = require('memory-cache');
const RefreshToken = require('../models/refreshTokenModel');
const TokenBlacklistService = require('../services/tokenBlacklistService');
const TokenMonitoringService = require('../services/tokenMonitoringService');
const AppError = require('../utils/appError');

// Rate limiting setup - BOBO
const rateLimit = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes

const auth = {
    protect: async (req, res, next) => {
        try {
            // Check rate limiting
            const clientIp = req.ip;
            const now = Date.now();
            const rateLimitInfo = rateLimit.get(clientIp) || { 
                attempts: 0, 
                firstAttempt: now,
                blockedUntil: null 
            };

            // Check if client is blocked
            if (rateLimitInfo.blockedUntil && now < rateLimitInfo.blockedUntil) {
                const remainingTime = Math.ceil((rateLimitInfo.blockedUntil - now) / 1000 / 60);
                return res.status(429).json({
                    status: 'error',
                    message: `Too many attempts. Please try again in ${remainingTime} minutes`
                });
            }

            // Reset rate limiting after window expires
            if (now - rateLimitInfo.firstAttempt > WINDOW_MS) {
                rateLimitInfo.attempts = 0;
                rateLimitInfo.firstAttempt = now;
                rateLimitInfo.blockedUntil = null;
            }

            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                rateLimitInfo.attempts++;
                rateLimit.set(clientIp, rateLimitInfo);

                if (rateLimitInfo.attempts >= MAX_ATTEMPTS) {
                    rateLimitInfo.blockedUntil = now + BLOCK_DURATION;
                }

                return res.status(401).json({
                    status: 'error',
                    message: 'Not authorized to access this route'
                });
            }

            // Check if token is blacklisted
            const isBlacklisted = await TokenBlacklistService.isBlacklisted(token);
            if (isBlacklisted) {
                return next(new AppError('Token has been revoked', 401));
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Monitor token usage
                const isTokenValid = await TokenMonitoringService.trackTokenUsage(
                    token,
                    decoded.userId,
                    req.ip
                );

                if (!isTokenValid) {
                    return next(new AppError('Suspicious token activity detected', 401));
                }

                const user = await User.findById(decoded.userId);
                if (!user) {
                    return next(new AppError('User not found', 401));
                }

                // Log successful token usage
                await TokenMonitoringService.logTokenEvent('token_used', user._id, {
                    tokenType: 'access',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                });

                req.user = user;
                next();
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    // Token has expired, check for refresh token in request
                    const refreshToken = req.headers['x-refresh-token'];
                    if (!refreshToken) {
                        return next(new AppError('Access token expired', 401));
                    }

                    // Log refresh attempt
                    await TokenMonitoringService.logTokenEvent('token_refresh_attempt', null, {
                        ipAddress: req.ip,
                        userAgent: req.headers['user-agent']
                    });

                    try {
                        // Verify refresh token
                        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                        
                        // Check if refresh token exists and is valid
                        const tokenDoc = await RefreshToken.findOne({
                            userId: decoded.userId,
                            token: refreshToken,
                            isValid: true
                        });

                        if (!tokenDoc) {
                            return next(new AppError('Invalid refresh token', 401));
                        }

                        // Get user
                        const user = await User.findById(decoded.userId);
                        if (!user) {
                            return next(new AppError('User not found', 401));
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

                        // Set new tokens in response headers
                        res.set({
                            'Access-Control-Expose-Headers': 'x-new-access-token,x-new-refresh-token',
                            'x-new-access-token': newAccessToken,
                            'x-new-refresh-token': newRefreshToken
                        });

                        req.user = user;
                        next();
                    } catch (refreshError) {
                        return next(new AppError('Invalid refresh token', 401));
                    }
                } else {
                    return next(new AppError('Invalid token', 401));
                }
            }
        } catch (error) {
            const clientIp = req.ip;
            const rateLimitInfo = rateLimit.get(clientIp) || { 
                attempts: 0, 
                firstAttempt: Date.now(),
                blockedUntil: null 
            };

            rateLimitInfo.attempts++;
            rateLimit.set(clientIp, rateLimitInfo);

            if (rateLimitInfo.attempts >= MAX_ATTEMPTS) {
                rateLimitInfo.blockedUntil = Date.now() + BLOCK_DURATION;
            }

            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
    },

    // Restrict to specific roles
    restrictTo: (...roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to perform this action'
                });
            }
            next();
        };
    },

    // Optional auth - doesn't require authentication but will process token if present
    optional: async (req, res, next) => {
        try {
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            let user;
            
            switch(decoded.accountType) {
                case 'business':
                    user = await BusinessUser.findById(decoded.userId)
                        .select('-password')
                        .lean();
                    break;
                case 'vendor':
                    user = await VendorUser.findById(decoded.userId)
                        .select('-password')
                        .lean();
                    break;
                default:
                    user = await User.findById(decoded.userId)
                        .select('-password')
                        .lean();
            }

            if (user && user.status === 'active') {
                req.user = {
                    ...user,
                    accountType: decoded.accountType
                };
            }

            req.token = token;
            req.userType = decoded.accountType;

            next();
        } catch (error) {
            next();
        }
    }
};

// Cleanup interval for rate limiting data
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimit.entries()) {
        if (now - data.firstAttempt > WINDOW_MS || 
            (data.blockedUntil && now > data.blockedUntil)) {
            rateLimit.delete(ip);
        }
    }
}, 5 * 60 * 1000); // Run every 5 minutes

const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Unauthorized - Please login' });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.session?.user?.role === 'admin') {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    next();
};

module.exports = { ...auth, isAuthenticated, isAdmin };

