const mongoose = require('mongoose');
const slugify = require('slugify');

const ListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  currency: {
    type: String,
    default: 'IDR',
    enum: ['IDR', 'USD', 'EUR'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Electronics',
      'Cars',
      'Motorcycles', 
      'Home & Furniture',
      'Fashion',
      'Sports',
      'Books',
      'Jobs',
      'Services',
      'Others'
    ],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  condition: {
    type: String,
    required: [true, 'Please select condition'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
  },
  brand: {
    type: String,
    trim: true,
  },
  model: {
    type: String,
    trim: true,
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: String, // For cloud storage
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
    },
    state: String,
    country: {
      type: String,
      default: 'Indonesia',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
    },
    zipCode: String,
  },
  contact: {
    phone: String,
    email: String,
    preferredMethod: {
      type: String,
      enum: ['phone', 'email', 'chat'],
      default: 'chat',
    },
    showPhone: {
      type: Boolean,
      default: true,
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'sold', 'expired', 'suspended'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  urgent: {
    type: Boolean,
    default: false,
  },
  negotiable: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  specifications: {
    type: Map,
    of: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  favorites: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  inquiries: {
    type: Number,
    default: 0,
  },
  boost: {
    isActive: {
      type: Boolean,
      default: false,
    },
    expiresAt: Date,
    type: {
      type: String,
      enum: ['premium', 'featured', 'urgent'],
    },
  },
  moderation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    rejectionReason: String,
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    },
  },
  renewalCount: {
    type: Number,
    default: 0,
  },
  lastRenewed: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
ListingSchema.index({ seller: 1, status: 1 });
ListingSchema.index({ category: 1, status: 1 });
ListingSchema.index({ 'location.coordinates': '2dsphere' });
ListingSchema.index({ price: 1 });
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ expiresAt: 1 });
ListingSchema.index({ 
  title: 'text', 
  description: 'text',
  'location.city': 'text',
  tags: 'text'
});

// Virtual for favorite count
ListingSchema.virtual('favoriteCount').get(function() {
  return this.favorites ? this.favorites.length : 0;
});

// Virtual for primary image
ListingSchema.virtual('primaryImage').get(function() {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
  }
  return null;
});

// Virtual for time remaining
ListingSchema.virtual('timeRemaining').get(function() {
  if (this.expiresAt) {
    const now = new Date();
    const expiry = new Date(this.expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  }
  return null;
});

// Create listing slug from title
ListingSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

// Set primary image if none is set
ListingSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Update seller stats when listing status changes
ListingSchema.post('save', async function(doc) {
  if (this.wasNew || this.isModified('status')) {
    const User = mongoose.model('User');
    const seller = await User.findById(doc.seller);
    if (seller) {
      await seller.updateStats();
    }
  }
});

// Static method to get listings by location
ListingSchema.statics.getByLocation = function(coordinates, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
    status: 'active',
  });
};

// Static method to search listings
ListingSchema.statics.searchListings = function(searchTerm, filters = {}) {
  const query = {
    $and: [
      { status: 'active' },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        ],
      },
    ],
  };

  // Apply filters
  if (filters.category) {
    query.$and.push({ category: filters.category });
  }
  
  if (filters.minPrice || filters.maxPrice) {
    const priceFilter = {};
    if (filters.minPrice) priceFilter.$gte = filters.minPrice;
    if (filters.maxPrice) priceFilter.$lte = filters.maxPrice;
    query.$and.push({ price: priceFilter });
  }
  
  if (filters.condition) {
    query.$and.push({ condition: filters.condition });
  }
  
  if (filters.city) {
    query.$and.push({ 'location.city': { $regex: filters.city, $options: 'i' } });
  }

  return this.find(query);
};

// Method to increment views
ListingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add to favorites
ListingSchema.methods.addToFavorites = function(userId) {
  const existingFavorite = this.favorites.find(
    fav => fav.user.toString() === userId.toString()
  );
  
  if (!existingFavorite) {
    this.favorites.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to remove from favorites
ListingSchema.methods.removeFromFavorites = function(userId) {
  this.favorites = this.favorites.filter(
    fav => fav.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to check if listing is expired
ListingSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Method to renew listing
ListingSchema.methods.renew = function(days = 30) {
  this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  this.renewalCount += 1;
  this.lastRenewed = new Date();
  this.status = 'active';
  return this.save();
};

module.exports = mongoose.model('Listing', ListingSchema);


