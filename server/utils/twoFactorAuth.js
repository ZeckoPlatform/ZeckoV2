const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

const generate2FASecret = (email) => {
    const secret = speakeasy.generateSecret({
        name: `YourAppName:${email}`
    });
    return {
        otpauthUrl: secret.otpauth_url,
        secret: secret.base32
    };
};

const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
};

const verifyTOTP = (token, secret) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allows for 30 seconds of time drift
    });
};

const generateQRCode = async (otpauthUrl) => {
    try {
        return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
        throw new Error('Failed to generate QR code');
    }
};

module.exports = {
    generate2FASecret,
    generateBackupCodes,
    verifyTOTP,
    generateQRCode
}; 