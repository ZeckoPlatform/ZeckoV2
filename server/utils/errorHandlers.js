const { logger } = require('../services/logger');

exports.catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch((error) => {
                logger.error('Request error:', {
                    error: error.message,
                    stack: error.stack,
                    path: req.path,
                    method: req.method,
                    timestamp: new Date().toISOString()
                });
                next(error);
            });
    };
};
  
  exports.errorHandler = (err, req, res, next) => {
    const errorResponse = {
        status: 'error',
        message: err.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };

    // Log error details
    logger.error('Error details:', {
        ...errorResponse,
        stack: err.stack,
        headers: req.headers,
        query: req.query,
        body: req.body
    });

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        ...errorResponse,
        status: 'validation_error',
        errors: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      });
    }

    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(409).json({
        ...errorResponse,
        status: 'duplicate_error',
        message: 'Duplicate entry found'
      });
    }

    // Production vs Development error details
    if (process.env.NODE_ENV === 'production') {
      delete errorResponse.stack;
    } else {
      errorResponse.stack = err.stack;
    }

    res.status(err.status || 500).json(errorResponse);
  };