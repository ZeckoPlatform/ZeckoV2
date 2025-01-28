const performanceMonitor = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 500) { // Log requests taking more than 500ms
            console.log(`Slow API Request (${duration}ms): ${req.method} ${req.originalUrl}`);
        }
    });
    
    next();
};

module.exports = performanceMonitor; 