const RefreshToken = require('../models/refreshTokenModel');

class TokenCleanupService {
    static async cleanupExpiredTokens() {
        try {
            const result = await RefreshToken.deleteMany({
                $or: [
                    { expiresAt: { $lt: new Date() } },
                    { isValid: false }
                ]
            });
            console.log(`Cleaned up ${result.deletedCount} expired/invalid tokens`);
        } catch (error) {
            console.error('Token cleanup error:', error);
        }
    }

    static startCleanupSchedule() {
        // Run cleanup every 12 hours
        setInterval(this.cleanupExpiredTokens, 12 * 60 * 60 * 1000);
    }
}

module.exports = TokenCleanupService; 