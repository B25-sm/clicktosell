const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Category and Subcategory
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'electronics',
      'furniture',
      'vehicles',
      'real_estate',
      'fashion',
      'sports',
      'books',
      'pets',
      'services',
      'others'
    ]
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required']
  },
  
  // Pricing
  price: {
    amount: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    negotiable: {
      type: Boolean,
      default: true
    },
    priceType: {
      type: String,
      enum: ['fixed', 'negotiable', 'auction', 'free'],
      default: 'negotiable'
    }
  },
  
  // Images and Media
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // For Cloudinary or S3
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Location
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: String,
    country: {
      type: String,
      default: 'India'
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    landmark: String
  },
  
  // Item Condition and Details
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['new', 'like_new', 'good', 'fair', 'poor']
  },
  brand: String,
  model: String,
  yearOfPurchase: Number,
  warranty: {
    hasWarranty: {
      type: Boolean,
      default: false
    },
    warrantyPeriod: String,
    warrantyExpires: Date
  },
  
  // Seller Information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerType: {
    type: String,
    enum: ['individual', 'dealer', 'business'],
    default: 'individual'
  },
  
  // Contact Information
  contact: {
    showPhone: {
      type: Boolean,
      default: true
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    alternatePhone: String,
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'chat', 'email'],
      default: 'chat'
    }
  },
  
  // Listing Status and Lifecycle
  status: {
    type: String,
    enum: ['draft', 'active', 'sold', 'expired', 'deleted', 'suspended'],
    default: 'active'
  },
  availability: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  
  // Dates and Timing
  postedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry is 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  lastBumpedAt: Date,
  soldAt: Date,
  
  // Engagement Metrics
  views: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 }
  },
  inquiries: {
    total: { type: Number, default: 0 },
    responded: { type: Number, default: 0 }
  },
  favorites: {
    count: { type: Number, default: 0 },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Promotion and Featured
  promotion: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    isPromoted: {
      type: Boolean,
      default: false
    },
    isBoosted: {
      type: Boolean,
      default: false
    },
    promotionExpires: Date,
    promotionType: {
      type: String,
      enum: ['featured', 'promoted', 'boosted', 'highlighted']
    }
  },
  
  // Moderation
  moderation: {
    isReviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    moderationNotes: String,
    flagCount: {
      type: Number,
      default: 0
    },
    flags: [{
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'fake', 'duplicate', 'overpriced', 'other']
      },
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reportedAt: {
        type: Date,
        default: Date.now
      },
      description: String
    }]
  },
  
  // Search and SEO
  tags: [String],
  keywords: [String], // Auto-generated for search
  searchScore: {
    type: Number,
    default: 0
  },
  
  // Additional Features
  features: [{
    name: String,
    value: String
  }],
  
  // Delivery Options
  delivery: {
    available: {
      type: Boolean,
      default: false
    },
    charge: Number,
    methods: [{
      type: String,
      enum: ['pickup', 'delivery', 'shipping']
    }],
    radius: Number // Delivery radius in km
  },
  
  // Transaction History
  transactions: [{
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'disputed']
    },
    amount: Number,
    paymentMethod: String,
    transactionId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Related Listings
  relatedListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
listingSchema.index({ seller: 1 });
listingSchema.index({ category: 1, subcategory: 1 });
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index({ status: 1, availability: 1 });
listingSchema.index({ 'price.amount': 1 });
listingSchema.index({ postedAt: -1 });
listingSchema.index({ expiresAt: 1 });
listingSchema.index({ 'promotion.isFeatured': 1 });
listingSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Compound indexes
listingSchema.index({ category: 1, 'location.city': 1, status: 1 });
listingSchema.index({ seller: 1, status: 1, createdAt: -1 });

// Virtual for primary image
listingSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0];
});

// Virtual for age in days
listingSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.postedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is expired
listingSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual for is promoted
listingSchema.virtual('isPromoted').get(function() {
  return this.promotion.promotionExpires && this.promotion.promotionExpires > new Date();
});

// Pre-save middleware
listingSchema.pre('save', function(next) {
  // Set primary image if none is set
  if (this.images.length > 0 && !this.images.some(img => img.isPrimary)) {
    this.images[0].isPrimary = true;
  }
  
  // Generate keywords from title and description
  const text = `${this.title} ${this.description}`.toLowerCase();
  this.keywords = text.match(/\w+/g) || [];
  
  // Update search score based on various factors
  this.searchScore = this.calculateSearchScore();
  
  next();
});

// Method to calculate search score
listingSchema.methods.calculateSearchScore = function() {
  let score = 0;
  
  // Base score
  score += 10;
  
  // Recent listings get higher score
  const ageInDays = this.ageInDays;
  if (ageInDays <= 1) score += 20;
  else if (ageInDays <= 7) score += 15;
  else if (ageInDays <= 30) score += 10;
  
  // Images boost score
  score += this.images.length * 2;
  
  // Views and engagement
  score += Math.min(this.views.total * 0.1, 50);
  score += this.favorites.count * 2;
  
  // Promotion boosts
  if (this.promotion.isFeatured) score += 100;
  if (this.promotion.isPromoted) score += 50;
  if (this.promotion.isBoosted) score += 25;
  
  // Verified seller bonus
  // This would need to be populated or calculated
  
  return Math.round(score);
};

// Method to increment view count
listingSchema.methods.incrementViews = function(isUnique = false) {
  this.views.total += 1;
  if (isUnique) this.views.unique += 1;
  
  // Update daily, weekly, monthly views
  // This would typically be done with a more sophisticated tracking system
  this.views.today += 1;
  this.views.thisWeek += 1;
  this.views.thisMonth += 1;
  
  return this.save();
};

// Method to add to favorites
listingSchema.methods.addToFavorites = function(userId) {
  if (!this.favorites.users.includes(userId)) {
    this.favorites.users.push(userId);
    this.favorites.count = this.favorites.users.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove from favorites
listingSchema.methods.removeFromFavorites = function(userId) {
  this.favorites.users = this.favorites.users.filter(id => !id.equals(userId));
  this.favorites.count = this.favorites.users.length;
  return this.save();
};

// Method to mark as sold
listingSchema.methods.markAsSold = function(buyerId, transactionData) {
  this.status = 'sold';
  this.availability = 'sold';
  this.soldAt = new Date();
  
  if (buyerId && transactionData) {
    this.transactions.push({
      buyer: buyerId,
      ...transactionData
    });
  }
  
  return this.save();
};

// Method to bump listing
listingSchema.methods.bump = function() {
  this.lastBumpedAt = new Date();
  this.postedAt = new Date(); // Move to top of recent listings
  return this.save();
};

// Method to extend expiry
listingSchema.methods.extendExpiry = function(days = 30) {
  this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this.save();
};

// Static method to find nearby listings
listingSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active',
    availability: 'available'
  });
};

// Static method to find similar listings
listingSchema.statics.findSimilar = function(listing, limit = 5) {
  return this.find({
    _id: { $ne: listing._id },
    category: listing.category,
    'location.city': listing.location.city,
    status: 'active',
    availability: 'available'
  })
  .sort({ searchScore: -1, createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Listing', listingSchema);



