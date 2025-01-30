// Response handler middleware
const responseHandler = (req, res, next) => {
    // Success response
    res.success = (data, message = 'Success', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    };

    // Error response
    res.error = (message = 'Error occurred', statusCode = 500, errors = null) => {
        return res.status(statusCode).json({
            success: false,
            message,
            errors
        });
    };

    next();
};

module.exports = responseHandler; 