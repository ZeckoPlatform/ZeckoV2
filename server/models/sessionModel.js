const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    device: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: String,
    location: {
        country: String,
        city: String
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isValid: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
sessionSchema.index({ user: 1, token: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Clean up expired sessions
sessionSchema.statics.cleanupExpired = async function() {
    return this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { isValid: false }
        ]
    });
};

// Update last activity
sessionSchema.methods.updateActivity = async function() {
    this.lastActivity = new Date();
    return this.save();
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session; 