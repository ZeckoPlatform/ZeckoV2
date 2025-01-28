const redis = require('../config/redis');

const cache = (duration) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await redis.get(key);
      
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store original res.json function
      const originalJson = res.json;
      
      // Override res.json method
      res.json = function(body) {
        // Restore original json function
        res.json = originalJson;
        
        // Cache the response
        redis.setex(key, duration, JSON.stringify(body));
        
        // Send the response
        return res.json(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = cache; 