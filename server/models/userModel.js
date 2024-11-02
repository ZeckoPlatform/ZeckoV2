const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
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
  role: {
    type: String,
    enum: ['user', 'admin', 'vendor'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  },
  profile: {
    avatar: { type: String },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    bio: { type: String }
  },
  activity: {
    lastLogin: { type: Date },
    lastNotificationCheck: { type: Date },
    loginCount: { type: Number, default: 0 }
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

userSchema.methods.isVendor = function() {
  return this.role === 'vendor';
};

userSchema.methods.updateLastLogin = async function() {
  this.activity.lastLogin = new Date();
  this.activity.loginCount += 1;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
