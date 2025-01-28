const redis = require('../config/redis');
const { promisify } = require('util');

class TokenBlacklistService {
    static async addToBlacklist(token, reason = 'manual_blacklist') {
        try {
            // Store token in blacklist with expiry matching token expiry
            await redis.setex(
                `blacklist:${token}`,
                24 * 60 * 60, // 24 hours (matching access token lifetime)
                reason
            );
        } catch (error) {
            console.error('Error adding token to blacklist:', error);
            throw error;
        }
    }

    static async isBlacklisted(token) {
        try {
            const exists = await redis.exists(`blacklist:${token}`);
            return exists === 1;
        } catch (error) {
            console.error('Error checking token blacklist:', error);
            throw error;
        }
    }
}

module.exports = TokenBlacklistService; 