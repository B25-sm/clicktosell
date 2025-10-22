const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Basic Transaction Info
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Related Entities
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  
  // Payment Details
  amount: {
    original: {
      type: Number,
      required: true,
      min: 0
    },
    final: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    fees: {
      platform: { type: Number, default: 0 },
      payment: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }
  },
  
  // Payment Gateway Info
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal'],
    required: true
  },
  gatewayTransactionId: String,
  gatewayOrderId: String,
  
  // Transaction Status
  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'held_in_escrow',
      'completed',
      'failed',
      'cancelled',
      'refunded',
      'disputed'
    ],
    default: 'pending'
  },
  
  // Escrow Information
  escrow: {
    isEscrow: {
      type: Boolean,
      default: true
    },
    holdPeriod: {
      type: Number,
      default: 7 // days
    },
    releaseDate: Date,
    isReleased: {
      type: Boolean,
      default: false
    },
    releasedAt: Date,
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    autoReleaseEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // Payment Method
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'netbanking', 'upi', 'wallet', 'bank_transfer']
    },
    details: {
      last4: String,
      brand: String,
      bank: String,
      wallet: String,
      upiId: String
    }
  },
  
  // Timeline
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Dispute Information
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    disputedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    disputedAt: Date,
    reason: String,
    description: String,
    evidence: [{
      type: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    resolution: {
      status: {
        type: String,
        enum: ['pending', 'resolved', 'escalated']
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      resolvedAt: Date,
      resolution: String,
      refundAmount: Number
    }
  },
  
  // Refund Information
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
    refundTransactionId: String,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Meeting/Delivery Information
  fulfillment: {
    type: {
      type: String,
      enum: ['pickup', 'delivery', 'shipping', 'digital'],
      default: 'pickup'
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'in_progress', 'completed', 'failed'],
      default: 'pending'
    },
    scheduledAt: Date,
    completedAt: Date,
    location: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    trackingInfo: {
      trackingId: String,
      carrier: String,
      status: String,
      updates: [{
        status: String,
        location: String,
        timestamp: Date,
        description: String
      }]
    }
  },
  
  // Additional Information
  notes: String,
  internalNotes: String,
  metadata: mongoose.Schema.Types.Mixed,
  
  // Auto-release job ID (for background processing)
  autoReleaseJobId: String
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
transactionSchema.index({ buyer: 1, createdAt: -1 });
transactionSchema.index({ seller: 1, createdAt: -1 });
transactionSchema.index({ listing: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ 'escrow.releaseDate': 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ gatewayTransactionId: 1 });

// Virtual for days remaining in escrow
transactionSchema.virtual('escrowDaysRemaining').get(function() {
  if (!this.escrow.releaseDate) return 0;
  const now = new Date();
  const releaseDate = new Date(this.escrow.releaseDate);
  const diffTime = releaseDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for total transaction amount (including fees)
transactionSchema.virtual('totalAmount').get(function() {
  return this.amount.final + this.amount.fees.total;
});

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Set escrow release date if not set
  if (this.escrow.isEscrow && !this.escrow.releaseDate && this.status === 'held_in_escrow') {
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + this.escrow.holdPeriod);
    this.escrow.releaseDate = releaseDate;
  }
  
  // Calculate total fees
  this.amount.fees.total = this.amount.fees.platform + this.amount.fees.payment;
  
  next();
});

// Method to add timeline entry
transactionSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
  this.timeline.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });
  this.status = status;
  return this.save();
};

// Method to initiate dispute
transactionSchema.methods.initiateDispute = function(disputedBy, reason, description) {
  this.dispute = {
    isDisputed: true,
    disputedBy,
    disputedAt: new Date(),
    reason,
    description,
    resolution: {
      status: 'pending'
    }
  };
  this.status = 'disputed';
  return this.save();
};

// Method to release escrow
transactionSchema.methods.releaseEscrow = function(releasedBy) {
  this.escrow.isReleased = true;
  this.escrow.releasedAt = new Date();
  this.escrow.releasedBy = releasedBy;
  this.status = 'completed';
  return this.addTimelineEntry('completed', 'Escrow released', releasedBy);
};

// Method to process refund
transactionSchema.methods.processRefund = function(refundAmount, reason, refundedBy) {
  this.refund = {
    isRefunded: true,
    refundAmount: refundAmount || this.amount.final,
    refundReason: reason,
    refundedAt: new Date(),
    refundedBy
  };
  this.status = 'refunded';
  return this.addTimelineEntry('refunded', `Refund processed: ${reason}`, refundedBy);
};

// Static method to find transactions ready for auto-release
transactionSchema.statics.findReadyForAutoRelease = function() {
  return this.find({
    status: 'held_in_escrow',
    'escrow.autoReleaseEnabled': true,
    'escrow.releaseDate': { $lte: new Date() },
    'escrow.isReleased': false
  });
};

// Static method to calculate platform fees
transactionSchema.statics.calculateFees = function(amount, paymentMethod = 'card') {
  const platformFeeRate = 0.025; // 2.5%
  const paymentFeeRates = {
    card: 0.029, // 2.9%
    netbanking: 0.019, // 1.9%
    upi: 0.015, // 1.5%
    wallet: 0.02, // 2.0%
    bank_transfer: 0.01 // 1.0%
  };
  
  const platformFee = Math.round(amount * platformFeeRate);
  const paymentFee = Math.round(amount * (paymentFeeRates[paymentMethod] || paymentFeeRates.card));
  
  return {
    platform: platformFee,
    payment: paymentFee,
    total: platformFee + paymentFee
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);



