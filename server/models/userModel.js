const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: [8, 'Password must be at least 8 characters long']
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatarUrl: {
        type: String,
        default: null
    },
    profile: {
        phone: {
            type: String,
            default: '',
            match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number']
        },
        bio: {
            type: String,
            default: '',
            maxlength: 500
        },
        address: [{
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
            isDefault: Boolean
        }]
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'vendor'],
        default: 'user'
    },
    accountType: {
        type: String,
        enum: ['personal', 'business'],
        default: 'personal'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    verificationToken: String,
    verified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    passwordLastChanged: {
        type: Date,
        default: Date.now
    },
    passwordExpiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    },
    preferences: {
        notifications: {
            email: {
                marketing: { type: Boolean, default: true },
                security: { type: Boolean, default: true },
                updates: { type: Boolean, default: true }
            },
            push: {
                marketing: { type: Boolean, default: true },
                security: { type: Boolean, default: true },
                updates: { type: Boolean, default: true }
            }
        },
        language: {
            type: String,
            default: 'en'
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    biddingPreferences: {
        type: biddingPreferencesSchema,
        default: () => ({})
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'profile.phone': 1 });
userSchema.index({ status: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Login attempts handling
userSchema.methods.incrementLoginAttempts = async function() {
    // If lock has expired, reset attempts and remove lock
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: {
                loginAttempts: 1
            },
            $unset: {
                lockUntil: 1
            }
        });
    }

    // Otherwise increment attempts count
    const updates = {
        $inc: {
            loginAttempts: 1
        }
    };

    // Lock the account if we've reached max attempts and haven't locked it yet
    if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hour lock
        };
    }

    return this.updateOne(updates);
};

// Password verification
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

// Generate password reset token
userSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    return this.save();
};

// Check if account is locked
userSchema.methods.isAccountLocked = function() {
    return this.isLocked && this.lockUntil && this.lockUntil > Date.now();
};

const biddingPreferencesSchema = new mongoose.Schema({
    notifyOutbid: {
        type: Boolean,
        default: true
    },
    notifyAuctionEnd: {
        type: Boolean,
        default: true
    },
    notifyWatchedItems: {
        type: Boolean,
        default: true
    },
    autoBidEnabled: {
        type: Boolean,
        default: false
    },
    maxBidAmount: {
        type: Number,
        default: 0
    },
    bidIncrement: {
        type: Number,
        default: 0
    },
    preferredCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    emailNotifications: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const User = mongoose.model('User', userSchema);

module.exports = User;
