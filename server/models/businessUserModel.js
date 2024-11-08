const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const businessUserSchema = new mongoose.Schema({
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
    role: { 
        type: String, 
        default: 'business' 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    business: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Business' 
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
    next();
});

// Method to compare password
businessUserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('BusinessUser', businessUserSchema); 