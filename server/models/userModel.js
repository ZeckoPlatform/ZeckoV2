const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');

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
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: false }
  },
  credits: { type: Number, default: 0 },
  billing: {
    customerId: String,
    defaultPaymentMethod: String,
    invoices: [{
      id: String,
      amount: Number,
      status: String,
      date: Date
    }]
  },
  businessProfile: {
    companyName: String,
    businessType: String,
    registrationNumber: String,
    vatNumber: String,
    services: [{
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      subcategories: [String],
      pricing: {
        hourlyRate: Number,
        minimumCharge: Number,
        currency: { type: String, default: 'USD' }
      }
    }],
    portfolio: [{
      title: String,
      description: String,
      images: [String],
      completionDate: Date
    }],
    reviews: [{
      client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      comment: String,
      date: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 }
  },
  leads: [{
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    status: {
      type: String,
      enum: ['viewed', 'contacted', 'hired', 'completed', 'declined'],
      default: 'viewed'
    },
    viewedAt: Date,
    creditsUsed: Number
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

// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'activity.lastLogin': -1 });

// Add new methods for credit management
userSchema.methods.addCredits = async function(amount, transactionType, description) {
  this.credits += amount;
  await this.save();
  
  // Create credit transaction record
  await mongoose.model('CreditBalance').create({
    user: this._id,
    amount,
    type: transactionType,
    description
  });
};

userSchema.methods.useCredits = async function(amount, leadId) {
  if (this.credits < amount) {
    throw new Error('Insufficient credits');
  }
  
  this.credits -= amount;
  await this.save();
  
  // Create credit transaction record
  await mongoose.model('CreditBalance').create({
    user: this._id,
    amount: -amount,
    type: 'usage',
    description: `Used for lead ${leadId}`,
    leadId
  });
};

// Add method to check subscription status
userSchema.methods.hasActiveSubscription = function() {
  if (!this.subscription.endDate) return false;
  return new Date() < new Date(this.subscription.endDate);
};

module.exports = mongoose.model('User', userSchema);
