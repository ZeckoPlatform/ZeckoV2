const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: false
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
  }],
  securitySettings: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    loginAlerts: {
      type: Boolean,
      default: true
    },
    lastSecurityUpdate: {
      type: Date,
      default: Date.now
    }
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  tempSecret: {
    type: String,
    select: false
  }
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

userSchema.methods.verifyTwoFactorToken = function(token) {
  if (!this.twoFactorSecret) return false;
  
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add comparePassword method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
