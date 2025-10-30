const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[+]?[0-9]{10,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.facebookId; // Password required if not OAuth user
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },

  // Profile Information
  profilePicture: {
    url: String,
    publicId: String // For Cloudinary or S3
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },

  // Location Information
  location: {
    address: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: String,
    country: {
      type: String,
      default: 'India'
    },
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Verification Status
  verification: {
    email: {
      isVerified: { type: Boolean, default: false },
      token: String,
      tokenExpires: Date
    },
    phone: {
      isVerified: { type: Boolean, default: false },
      otp: String,
      otpExpires: Date
    },
    identity: {
      isVerified: { type: Boolean, default: false },
      documentType: {
        type: String,
        enum: ['aadhaar', 'pan', 'passport', 'driving_license']
      },
      documentNumber: String,
      documentImage: {
        url: String,
        publicId: String
      },
      verifiedAt: Date
    }
  },

  // OAuth Information
  googleId: String,
  facebookId: String,
  appleId: String,

  // Account Settings
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    privacy: {
      showPhone: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showLastSeen: { type: Boolean, default: true }
    }
  },

  // Rating and Reviews
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    breakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },

  // Activity Tracking
  activity: {
    totalListings: { type: Number, default: 0 },
    activeListings: { type: Number, default: 0 },
    soldItems: { type: Number, default: 0 },
    boughtItems: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    joinedAt: { type: Date, default: Date.now }
  },

  // Account Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'deactivated'],
    default: 'active'
  },
  suspensionReason: String,
  suspensionExpires: Date,

  // Security
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    deviceInfo: String
  }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // Favorites and Saved Items
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  savedSearches: [{
    query: String,
    filters: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
  }],

  // Admin fields
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'super_admin'],
    default: 'user'
  },
  permissions: [String],

  // Subscription fields
  subscription: {
    currentPlan: {
      type: String,
      enum: ['basic', 'premium', 'unlimited'],
      default: 'basic'
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription'
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'suspended', 'pending'],
      default: 'pending'
    },
    subscriptionExpiresAt: Date,
    monthlyUsage: {
      listingsCreated: { type: Number, default: 0 },
      adsPosted: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now }
    }
  },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to update last active
userSchema.methods.updateLastActive = function() {
  this.activity.lastActive = new Date();
  return this.save();
};

// Method to add to favorites
userSchema.methods.addToFavorites = function(listingId) {
  if (!this.favorites.includes(listingId)) {
    this.favorites.push(listingId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove from favorites
userSchema.methods.removeFromFavorites = function(listingId) {
  this.favorites = this.favorites.filter(id => !id.equals(listingId));
  return this.save();
};

// Method to update rating
userSchema.methods.updateRating = function(newRating) {
  const oldCount = this.rating.count;
  const oldAverage = this.rating.average;
  
  // Update breakdown
  this.rating.breakdown[newRating] += 1;
  this.rating.count += 1;
  
  // Calculate new average
  this.rating.average = ((oldAverage * oldCount) + newRating) / this.rating.count;
  
  return this.save();
};

// Subscription methods
userSchema.methods.canCreateListing = function() {
  // Check if user has active subscription
  if (this.subscription.subscriptionStatus !== 'active') {
    return false;
  }

  // Check if subscription has expired
  if (this.subscription.subscriptionExpiresAt && this.subscription.subscriptionExpiresAt < new Date()) {
    return false;
  }

  // For basic plan, check monthly limit
  if (this.subscription.currentPlan === 'basic') {
    return this.subscription.monthlyUsage.listingsCreated < 10;
  }

  // For premium and unlimited plans, unlimited listings
  return true;
};

userSchema.methods.canPostAd = function() {
  // Check if user has active subscription
  if (this.subscription.subscriptionStatus !== 'active') {
    return false;
  }

  // Check if subscription has expired
  if (this.subscription.subscriptionExpiresAt && this.subscription.subscriptionExpiresAt < new Date()) {
    return false;
  }

  // Check monthly ad limit
  if (this.subscription.currentPlan === 'unlimited') {
    return true; // Unlimited ads
  }

  return this.subscription.monthlyUsage.adsPosted < 10;
};

userSchema.methods.incrementListingUsage = function() {
  if (this.subscription.currentPlan === 'basic') {
    this.subscription.monthlyUsage.listingsCreated += 1;
  }
  return this.save();
};

userSchema.methods.incrementAdUsage = function() {
  if (this.subscription.currentPlan !== 'unlimited') {
    this.subscription.monthlyUsage.adsPosted += 1;
  }
  return this.save();
};

userSchema.methods.resetMonthlyUsage = function() {
  this.subscription.monthlyUsage.listingsCreated = 0;
  this.subscription.monthlyUsage.adsPosted = 0;
  this.subscription.monthlyUsage.lastResetDate = new Date();
  return this.save();
};

userSchema.methods.updateSubscription = function(subscriptionData) {
  this.subscription.currentPlan = subscriptionData.plan;
  this.subscription.subscriptionId = subscriptionData.subscriptionId;
  this.subscription.subscriptionStatus = subscriptionData.status;
  this.subscription.subscriptionExpiresAt = subscriptionData.expiresAt;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);



