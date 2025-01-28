class AccountSecurityService {
    static MAX_LOGIN_ATTEMPTS = 5;
    static LOCK_TIME = 30 * 60 * 1000; // 30 minutes
    static PASSWORD_EXPIRY_DAYS = 90;

    static async handleFailedLogin(user) {
        // Increment login attempts
        user.loginAttempts += 1;

        // Lock account if max attempts reached
        if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
            user.isLocked = true;
            user.lockUntil = new Date(Date.now() + this.LOCK_TIME);
        }

        await user.save();
        
        if (user.isLocked) {
            throw new Error('Account locked. Try again later.');
        }
    }

    static async resetLoginAttempts(user) {
        user.loginAttempts = 0;
        user.isLocked = false;
        user.lockUntil = null;
        await user.save();
    }

    static isPasswordExpired(user) {
        return user.passwordExpiresAt && user.passwordExpiresAt < new Date();
    }

    static async updatePasswordExpiry(user) {
        user.passwordLastChanged = new Date();
        user.passwordExpiresAt = new Date(+new Date() + this.PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        await user.save();
    }

    static getPasswordExpiryWarning(user) {
        if (!user.passwordExpiresAt) return null;

        const daysUntilExpiry = Math.ceil((user.passwordExpiresAt - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 14 && daysUntilExpiry > 0) {
            return {
                warning: true,
                message: `Your password will expire in ${daysUntilExpiry} days. Please change it soon.`,
                daysRemaining: daysUntilExpiry
            };
        }
        return null;
    }
}

module.exports = AccountSecurityService; 