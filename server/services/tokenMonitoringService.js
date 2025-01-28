const redis = require('../config/redis');
const TokenBlacklistService = require('./tokenBlacklistService');

class TokenMonitoringService {
    static async trackTokenUsage(token, userId, ipAddress) {
        const key = `token-usage:${userId}:${ipAddress}`;
        const windowSize = 3600; // 1 hour in seconds

        try {
            // Increment usage count
            const count = await redis.incr(key);
            
            // Set expiry on first increment
            if (count === 1) {
                await redis.expire(key, windowSize);
            }

            // Check for suspicious activity
            if (count > 100) { // More than 100 requests per hour from same IP
                await TokenBlacklistService.addToBlacklist(token, 'suspicious_activity');
                console.warn(`Suspicious token activity detected for user ${userId} from IP ${ipAddress}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token monitoring error:', error);
            return true; // Fail open to prevent service disruption
        }
    }

    static async logTokenEvent(eventType, userId, tokenData) {
        const event = {
            timestamp: new Date(),
            eventType,
            userId,
            tokenData,
        };

        console.log('Token event:', JSON.stringify(event));
        // You can extend this to store events in your database or logging service
    }
}

module.exports = TokenMonitoringService; 