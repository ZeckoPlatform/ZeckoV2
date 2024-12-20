const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const businessUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessType: {
        type: String,
        required: true,
        enum: ['plumbing', 'electrical', 'construction', 'landscaping', 'cleaning', 'maintenance', 'other']
    },
    serviceCategories: [{
        type: String,
        required: true
    }],
    availability: {
        workingHours: {
            monday: { start: String, end: String },
            tuesday: { start: String, end: String },
            wednesday: { start: String, end: String },
            thursday: { start: String, end: String },
            friday: { start: String, end: String },
            saturday: { start: String, end: String },
            sunday: { start: String, end: String }
        },
        customAvailability: [{
            date: Date,
            available: Boolean
        }]
    },
    serviceArea: {
        radius: Number,
        zipCodes: [String]
    },
    description: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    addresses: [{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    role: {
        type: String,
        default: 'contractor'
    },
    accountType: {
        type: String,
        default: 'business'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
businessUserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    this.updatedAt = new Date();
    next();
});

// Compare password method
businessUserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
businessUserSchema.index({ email: 1 }, { unique: true });
businessUserSchema.index({ businessName: 1 });
businessUserSchema.index({ businessType: 1 });

const BusinessUser = mongoose.model('BusinessUser', businessUserSchema);

module.exports = BusinessUser; 