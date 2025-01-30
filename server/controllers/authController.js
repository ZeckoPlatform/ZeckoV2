const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { sanitizeInput } = require('../utils/securityUtils');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create({
            name: sanitizeInput(req.body.name),
            email: sanitizeInput(req.body.email.toLowerCase()),
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        next(new AppError('Error creating user', 400));
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        // Check if user exists && password is correct
        const user = await User.findOne({ email: sanitizeInput(email.toLowerCase()) }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        createSendToken(user, 200, res);
    } catch (err) {
        next(new AppError('Error logging in', 400));
    }
};

exports.protect = async (req, res, next) => {
    try {
        // Getting token and check if it exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (err) {
        next(new AppError('Authentication failed', 401));
    }
}; 