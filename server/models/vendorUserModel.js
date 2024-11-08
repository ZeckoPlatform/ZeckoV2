const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        required: true 
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
    role: { 
        type: String, 
        default: 'vendor' 
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

module.exports = mongoose.model('VendorUser', vendorUserSchema); 