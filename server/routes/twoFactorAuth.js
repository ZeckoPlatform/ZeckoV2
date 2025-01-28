const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
    generate2FASecret,
    generateBackupCodes,
    verifyTOTP,
    generateQRCode
} = require('../utils/twoFactorAuth');
const User = require('../models/User');

// Setup 2FA
router.post('/setup', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        
        if (user.twoFactorAuth.enabled) {
            return res.status(400).json({ message: '2FA is already enabled' });
        }

        const { secret, otpauthUrl } = generate2FASecret(user.email);
        const qrCode = await generateQRCode(otpauthUrl);
        const backupCodes = generateBackupCodes();

        // Store temporarily in session until verified
        req.session.temp2FA = {
            secret,
            backupCodes
        };

        res.json({
            qrCode,
            secret,
            backupCodes
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to setup 2FA' });
    }
});

// Verify and enable 2FA
router.post('/verify', isAuthenticated, async (req, res) => {
    try {
        const { token } = req.body;
        const temp2FA = req.session.temp2FA;

        if (!temp2FA?.secret) {
            return res.status(400).json({ message: '2FA setup not initiated' });
        }

        if (!verifyTOTP(token, temp2FA.secret)) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        const user = await User.findById(req.session.user.id);
        user.twoFactorAuth = {
            enabled: true,
            secret: temp2FA.secret,
            verified: true,
            backupCodes: temp2FA.backupCodes.map(code => ({
                code,
                used: false
            }))
        };

        await user.save();
        delete req.session.temp2FA;
        req.session.twoFactorVerified = true;

        res.json({ message: '2FA enabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to verify 2FA' });
    }
});

// Verify 2FA during login
router.post('/validate', async (req, res) => {
    try {
        const { token, userId } = req.body;
        
        const user = await User.findById(userId)
            .select('+twoFactorAuth.secret +twoFactorAuth.backupCodes.code');

        // Check TOTP
        if (verifyTOTP(token, user.twoFactorAuth.secret)) {
            req.session.twoFactorVerified = true;
            return res.json({ verified: true });
        }

        // Check backup codes
        const backupCode = user.twoFactorAuth.backupCodes.find(
            bc => !bc.used && bc.code === token
        );

        if (backupCode) {
            backupCode.used = true;
            await user.save();
            req.session.twoFactorVerified = true;
            return res.json({ verified: true });
        }

        res.status(401).json({ message: 'Invalid verification code' });
    } catch (error) {
        res.status(500).json({ message: 'Validation failed' });
    }
});

// Disable 2FA
router.post('/disable', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        user.twoFactorAuth = {
            enabled: false,
            secret: null,
            verified: false,
            backupCodes: []
        };
        await user.save();
        req.session.twoFactorVerified = false;
        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to disable 2FA' });
    }
});

module.exports = router; 