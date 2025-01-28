const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    isValid: {
        type: Boolean,
        default: true
    },
    userAgent: String,
    ipAddress: String,
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60 // 30 days
    }
});

// Add index for faster queries
refreshTokenSchema.index({ userId: 1, token: 1 });

// Add method to check if token is expired
refreshTokenSchema.methods.isExpired = function() {
    return Date.now() >= this.expiresAt;
};

// Middleware to automatically invalidate expired tokens
refreshTokenSchema.pre('save', function(next) {
    if (this.isExpired()) {
        this.isValid = false;
    }
    next();
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken; 