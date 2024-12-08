const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
        return res.status(409).json({
            message: 'Duplicate key error',
            field: Object.keys(err.keyPattern)[0]
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    if (err.name === 'TimeoutError') {
        return res.status(408).json({
            message: 'Request timeout',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
};

module.exports = errorHandler; 