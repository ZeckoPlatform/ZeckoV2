exports.catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
  
  exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
  
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal server error'
    });
  };