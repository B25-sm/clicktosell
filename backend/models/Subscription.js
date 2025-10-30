const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Subscription Plan
  plan: {
    type: String,
    enum: ['basic', 'premium', 'unlimited'],
    required: true,
    default: 'basic'
  },

  // Plan Details
  planDetails: {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    duration: {
      type: Number, // in days
      required: true
    },
    maxListings: {
      type: Number,
      required: true,
      default: 10
    },
    maxAds: {
      type: Number,
      required: true,
      default: 10
    },
    features: [{
      name: String,
      description: String,
      enabled: {
        type: Boolean,
        default: true
      }
    }]
  },

  // Subscription Status
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'suspended', 'pending'],
    default: 'pending'
  },

  // Payment Information
  payment: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'netbanking', 'upi', 'wallet', 'bank_transfer'],
      required: true
    },
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal'],
      required: true
    },
    transactionId: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    paidAt: Date
  },

  // Subscription Period
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  },

  // Usage Tracking
  usage: {
    listingsCreated: {
      type: Number,
      default: 0
    },
    adsPosted: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },

  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processed', 'failed'],
    default: 'none'
  },

  // Admin Notes
  adminNotes: String,
  metadata: mongoose.Schema.Types.Mixed

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });
subscriptionSchema.index({ 'payment.transactionId': 1 });

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && 
         this.endDate > new Date() && 
         this.startDate <= new Date();
});

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  if (!this.isActive) return 0;
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for usage percentage
subscriptionSchema.virtual('usagePercentage').get(function() {
  const totalAllowed = this.planDetails.maxListings + this.planDetails.maxAds;
  const totalUsed = this.usage.listingsCreated + this.usage.adsPosted;
  return totalAllowed > 0 ? (totalUsed / totalAllowed) * 100 : 0;
});

// Static method to get subscription plans
subscriptionSchema.statics.getPlans = function() {
  return {
    basic: {
      name: 'Basic Plan',
      price: 0,
      currency: 'INR',
      duration: 30,
      maxListings: 10,
      maxAds: 10,
      features: [
        { name: 'Basic Listings', description: 'Post up to 10 listings per month', enabled: true },
        { name: 'Basic Ads', description: 'Post up to 10 ads per month', enabled: true },
        { name: 'Standard Support', description: 'Email support', enabled: true }
      ]
    },
    premium: {
      name: 'Premium Plan',
      price: 999,
      currency: 'INR',
      duration: 30,
      maxListings: -1, // Unlimited
      maxAds: 10,
      features: [
        { name: 'Unlimited Listings', description: 'Post unlimited listings per month', enabled: true },
        { name: 'Premium Ads', description: 'Post up to 10 premium ads per month', enabled: true },
        { name: 'Priority Support', description: 'Priority email and chat support', enabled: true },
        { name: 'Advanced Analytics', description: 'Detailed listing performance analytics', enabled: true },
        { name: 'Featured Listings', description: 'Get your listings featured in search results', enabled: true }
      ]
    },
    unlimited: {
      name: 'Unlimited Plan',
      price: 1999,
      currency: 'INR',
      duration: 30,
      maxListings: -1, // Unlimited
      maxAds: -1, // Unlimited
      features: [
        { name: 'Unlimited Everything', description: 'Post unlimited listings and ads', enabled: true },
        { name: 'Premium Support', description: '24/7 priority support', enabled: true },
        { name: 'Advanced Analytics', description: 'Comprehensive analytics dashboard', enabled: true },
        { name: 'Featured Listings', description: 'All listings automatically featured', enabled: true },
        { name: 'API Access', description: 'Access to listing management API', enabled: true },
        { name: 'Custom Branding', description: 'Custom branding options', enabled: true }
      ]
    }
  };
};

// Method to check if user can create listing
subscriptionSchema.methods.canCreateListing = function() {
  if (!this.isActive) return false;
  if (this.planDetails.maxListings === -1) return true; // Unlimited
  return this.usage.listingsCreated < this.planDetails.maxListings;
};

// Method to check if user can post ad
subscriptionSchema.methods.canPostAd = function() {
  if (!this.isActive) return false;
  if (this.planDetails.maxAds === -1) return true; // Unlimited
  return this.usage.adsPosted < this.planDetails.maxAds;
};

// Method to increment listing usage
subscriptionSchema.methods.incrementListingUsage = function() {
  if (this.planDetails.maxListings !== -1) { // Not unlimited
    this.usage.listingsCreated += 1;
  }
  return this.save();
};

// Method to increment ad usage
subscriptionSchema.methods.incrementAdUsage = function() {
  if (this.planDetails.maxAds !== -1) { // Not unlimited
    this.usage.adsPosted += 1;
  }
  return this.save();
};

// Method to reset usage (called monthly)
subscriptionSchema.methods.resetUsage = function() {
  this.usage.listingsCreated = 0;
  this.usage.adsPosted = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

// Static method to get active subscription for user
subscriptionSchema.statics.getActiveSubscription = async function(userId) {
  return await this.findOne({
    user: userId,
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to create subscription
subscriptionSchema.statics.createSubscription = async function(userId, plan, paymentData) {
  const plans = this.getPlans();
  const planDetails = plans[plan];
  
  if (!planDetails) {
    throw new Error('Invalid subscription plan');
  }

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + (planDetails.duration * 24 * 60 * 60 * 1000));

  const subscription = new this({
    user: userId,
    plan,
    planDetails,
    status: 'pending',
    payment: paymentData,
    startDate,
    endDate
  });

  return await subscription.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);

