const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const vendorUserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String,
        required: true,
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    businessName: { 
        type: String, 
        required: true 
    },
    businessType: { 
        type: String, 
        required: true 
    },
    vendorCategory: { 
        type: String, 
        required: true,
        enum: ['retail', 'wholesale', 'manufacturer', 'service'] 
    },
    storeSettings: {
        storeName: String,
        storeDescription: String,
        storeLogo: String,
        storeBanner: String,
        shippingPolicy: String,
        returnPolicy: String,
        storeTheme: {
            primaryColor: String,
            secondaryColor: String
        }
    },
    shippingMethods: [{
        name: String,
        price: Number,
        estimatedDays: String,
        isDefault: Boolean
    }],
    paymentMethods: [{
        type: String,
        enabled: Boolean
    }],
    role: { 
        type: String, 
        default: 'vendor' 
    },
    accountType: {
        type: String,
        default: 'vendor'
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
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
vendorUserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
vendorUserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Add indexes for better performance
vendorUserSchema.index({ 'businessName': 1 });
vendorUserSchema.index({ 'vendorCategory': 1 });
vendorUserSchema.index({ 'ratings.average': -1 });

// Add generatePasswordReset method
vendorUserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    return this.save();
};

module.exports = mongoose.model('VendorUser', vendorUserSchema); 