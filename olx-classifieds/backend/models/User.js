const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
    trim: true,
    maxlength: [50, 'Full name cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    match: [/^[0-9]{10,15}$/, 'Please add a valid phone number'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  phoneVerificationToken: String,
  phoneVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
    },
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    privacy: {
      showPhone: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
    },
  },
  stats: {
    totalListings: { type: Number, default: 0 },
    activeListings: { type: Number, default: 0 },
    soldListings: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  socialLogin: {
    google: {
      id: String,
      email: String,
    },
    facebook: {
      id: String,
      email: String,
    },
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ 'location.coordinates': '2dsphere' });
UserSchema.index({ createdAt: -1 });

// Virtual for user's listings
UserSchema.virtual('listings', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'seller',
  justOne: false,
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    next();
  }

  // Hash the password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  // Add to user's refresh tokens
  this.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  return refreshToken;
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash email verification token
UserSchema.methods.getEmailVerificationToken = function () {
  // Generate token
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = verificationToken;

  // Set expire
  this.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return verificationToken;
};

// Generate and hash phone verification token
UserSchema.methods.getPhoneVerificationToken = function () {
  // Generate token
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash token and set to phoneVerificationToken field
  this.phoneVerificationToken = verificationToken;

  // Set expire
  this.phoneVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return verificationToken;
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = resetToken;

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Update user stats
UserSchema.methods.updateStats = async function () {
  const Listing = mongoose.model('Listing');
  
  const stats = await Listing.aggregate([
    { $match: { seller: this._id } },
    {
      $group: {
        _id: null,
        totalListings: { $sum: 1 },
        activeListings: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        soldListings: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } },
        totalViews: { $sum: '$views' },
      },
    },
  ]);

  if (stats.length > 0) {
    this.stats = { ...this.stats, ...stats[0] };
    await this.save();
  }
};

module.exports = mongoose.model('User', UserSchema);


