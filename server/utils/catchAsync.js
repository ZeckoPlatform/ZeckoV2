/**
 * Wraps an async function and catches any errors, passing them to next()
 * This eliminates the need for try/catch blocks in route handlers
 */
const catchAsync = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = catchAsync; 