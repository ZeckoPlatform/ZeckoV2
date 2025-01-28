const { verifyTOTP } = require('../utils/twoFactorAuth');

const require2FA = async (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Skip 2FA check if user hasn't enabled it
    if (!req.session.user.twoFactorEnabled) {
        return next();
    }

    // Skip 2FA check if already verified in this session
    if (req.session.twoFactorVerified) {
        return next();
    }

    // User needs to verify 2FA
    return res.status(403).json({
        message: 'Two-factor authentication required',
        require2FA: true
    });
};

module.exports = { require2FA }; 