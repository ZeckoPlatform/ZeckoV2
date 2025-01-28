const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { validationResult } = require('express-validator');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL 
        : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Input validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }
    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.message
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized Access'
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        error: 'Internal Server Error'
    });
};

// Security headers middleware using helmet
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:", "wss:"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
});

// CSRF middleware configuration
const csrfMiddleware = {
    setupCSRF: (app) => {
        // Cookie parser is required for CSRF
        app.use(cookieParser());

        // Setup CSRF protection
        app.use(csrf({ 
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            }
        }));

        // Handle CSRF token errors
        app.use((err, req, res, next) => {
            if (err.code === 'EBADCSRFTOKEN') {
                return res.status(403).json({
                    error: 'Invalid or missing CSRF token'
                });
            }
            next(err);
        });

        // Provide CSRF token to frontend
        app.get('/api/csrf-token', (req, res) => {
            res.json({ csrfToken: req.csrfToken() });
        });
    }
};

module.exports = {
    limiter,
    corsOptions,
    validateRequest,
    errorHandler,
    securityHeaders,
    csrfMiddleware
}; 