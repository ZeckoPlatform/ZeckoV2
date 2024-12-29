const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    name: String,
    accountType: {
        type: String,
        enum: ['Regular', 'Business', 'Vendor', 'Admin'],
        default: 'Regular'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    profile: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    securitySettings: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: String
    },
    avatarUrl: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
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

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
