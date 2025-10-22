const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { 
  authenticateToken, 
  requireVerification, 
  optionalAuth,
  requireOwnership 
} = require('../middleware/auth');
const { asyncHandler, AppError, validationError } = require('../middleware/errorHandler');
const { uploadMultipleFiles, deleteMultipleFiles } = require('../utils/upload');
const logger = require('../utils/logger');
const { redisCache } = require('../middleware/redisSession');
const realTimeService = require('../services/redisService');

const router = express.Router();

// Configure multer for multiple file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400), false);
    }
  }
});

// Category and subcategory mappings
const categoryMappings = {
  electronics: ['mobile', 'laptop', 'tv', 'camera', 'tablet', 'gaming', 'audio', 'accessories'],
  furniture: ['sofa', 'bed', 'table', 'chair', 'wardrobe', 'decor', 'kitchen', 'office'],
  vehicles: ['car', 'bike', 'scooter', 'bicycle', 'commercial', 'parts', 'accessories'],
  real_estate: ['house', 'apartment', 'plot', 'commercial', 'pg', 'office', 'warehouse'],
  fashion: ['men', 'women', 'kids', 'shoes', 'bags', 'watches', 'jewelry', 'accessories'],
  sports: ['fitness', 'outdoor', 'cycling', 'cricket', 'football', 'badminton', 'gym'],
  books: ['academic', 'fiction', 'non_fiction', 'children', 'comics', 'magazines'],
  pets: ['dogs', 'cats', 'birds', 'fish', 'accessories', 'food', 'care'],
  services: ['home', 'education', 'health', 'business', 'repair', 'beauty', 'events'],
  others: ['collectibles', 'art', 'music', 'toys', 'baby', 'health', 'miscellaneous']
};

// Validation rules for creating listing
const createListingValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Title must be between 10 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('category')
    .isIn(Object.keys(categoryMappings))
    .withMessage('Invalid category'),
  body('subcategory')
    .custom((value, { req }) => {
      const validSubcategories = categoryMappings[req.body.category] || [];
      if (!validSubcategories.includes(value)) {
        throw new Error('Invalid subcategory for the selected category');
      }
      return true;
    }),
  body('price.amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('price.currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP']),
  body('condition')
    .isIn(['new', 'like_new', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  body('location.address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('location.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City is required'),
  body('location.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Invalid pincode format')
];

// @route   GET /api/v1/listings
// @desc    Get all listings with filters
// @access  Public
router.get('/', [
  optionalAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(Object.keys(categoryMappings)),
  query('subcategory').optional(),
  query('city').optional(),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('condition').optional().isIn(['new', 'like_new', 'good', 'fair', 'poor']),
  query('sortBy').optional().isIn(['recent', 'price_low', 'price_high', 'popular']),
  query('search').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const {
    page = 1,
    limit = 20,
    category,
    subcategory,
    city,
    minPrice,
    maxPrice,
    condition,
    sortBy = 'recent',
    search
  } = req.query;

  const skip = (page - 1) * limit;

  // Build query
  const query = {
    status: 'active',
    availability: 'available',
    expiresAt: { $gt: new Date() }
  };

  // Apply filters
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (condition) query.condition = condition;

  // Price range filter
  if (minPrice || maxPrice) {
    query['price.amount'] = {};
    if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
    if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Build sort criteria
  let sortCriteria = {};
  switch (sortBy) {
    case 'price_low':
      sortCriteria = { 'price.amount': 1 };
      break;
    case 'price_high':
      sortCriteria = { 'price.amount': -1 };
      break;
    case 'popular':
      sortCriteria = { 'views.total': -1, searchScore: -1 };
      break;
    case 'recent':
    default:
      sortCriteria = { 'promotion.isFeatured': -1, createdAt: -1 };
      break;
  }

  // Execute query
  const [listings, total] = await Promise.all([
    Listing.find(query)
      .populate('seller', 'firstName lastName profilePicture rating location')
      .select('title images price category subcategory condition location createdAt views favorites promotion')
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Listing.countDocuments(query)
  ]);

  // Add user-specific data if authenticated
  if (req.user) {
    listings.forEach(listing => {
      listing.isFavorited = req.user.favorites.includes(listing._id);
    });
  }

  res.json({
    success: true,
    data: {
      listings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      filters: {
        category,
        subcategory,
        city,
        minPrice,
        maxPrice,
        condition,
        search
      }
    }
  });
}));

// @route   GET /api/v1/listings/featured
// @desc    Get featured listings
// @access  Public
router.get('/featured', optionalAuth, redisCache('featured', 300), asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const listings = await Listing.find({
    status: 'active',
    availability: 'available',
    'promotion.isFeatured': true,
    'promotion.promotionExpires': { $gt: new Date() }
  })
  .populate('seller', 'firstName lastName profilePicture rating')
  .select('title images price category location createdAt views favorites')
  .sort({ 'promotion.promotionExpires': -1, createdAt: -1 })
  .limit(parseInt(limit))
  .lean();

  // Add user-specific data if authenticated
  if (req.user) {
    listings.forEach(listing => {
      listing.isFavorited = req.user.favorites.includes(listing._id);
    });
  }

  res.json({
    success: true,
    data: { listings }
  });
}));

// @route   GET /api/v1/listings/categories
// @desc    Get categories with listing counts
// @access  Public
router.get('/categories', redisCache('categories', 600), asyncHandler(async (req, res) => {
  const categoryCounts = await Listing.aggregate([
    {
      $match: {
        status: 'active',
        availability: 'available'
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        subcategories: { $addToSet: '$subcategory' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const categories = Object.keys(categoryMappings).map(category => {
    const categoryData = categoryCounts.find(c => c._id === category);
    return {
      name: category,
      displayName: category.replace('_', ' ').toUpperCase(),
      count: categoryData ? categoryData.count : 0,
      subcategories: categoryMappings[category].map(sub => ({
        name: sub,
        displayName: sub.replace('_', ' ').toUpperCase()
      }))
    };
  });

  res.json({
    success: true,
    data: { categories }
  });
}));

// @route   GET /api/v1/listings/:id
// @desc    Get single listing by ID
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;

  const listing = await Listing.findById(id)
    .populate('seller', 'firstName lastName profilePicture rating location activity verification')
    .populate('relatedListings', 'title images price location createdAt');

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Increment view count (only if not the owner)
  if (!userId || !listing.seller._id.equals(userId)) {
    await listing.incrementViews(!userId); // Anonymous view if no user
    
    // Track view in Redis for real-time analytics
    try {
      await realTimeService.updateListingViews(id);
    } catch (error) {
      logger.error('Redis view tracking error:', error);
    }
  }

  // Get similar listings
  const similarListings = await Listing.findSimilar(listing, 6);

  // Add user-specific data
  const listingData = listing.toObject();
  if (userId) {
    listingData.isFavorited = req.user.favorites.includes(listing._id);
    listingData.isOwner = listing.seller._id.equals(userId);
  }

  res.json({
    success: true,
    data: {
      listing: listingData,
      similarListings
    }
  });
}));

// @route   GET /api/v1/listings/:id/views
// @desc    Get real-time view count for a listing
// @access  Public
router.get('/:id/views', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const views = await realTimeService.getListingViews(id);
    res.json({
      success: true,
      data: { views }
    });
  } catch (error) {
    logger.error('Get listing views error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get view count'
    });
  }
}));

// @route   POST /api/v1/listings
// @desc    Create new listing
// @access  Private (Verified users only)
router.post('/', [
  authenticateToken,
  requireVerification,
  upload.array('images', 10),
  ...createListingValidation
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  if (!req.files || req.files.length === 0) {
    throw new AppError('At least one image is required', 400);
  }

  const {
    title,
    description,
    category,
    subcategory,
    price,
    condition,
    location,
    brand,
    model,
    yearOfPurchase,
    warranty,
    contact,
    delivery,
    tags,
    features
  } = req.body;

  // Upload images
  const uploadResult = await uploadMultipleFiles({
    files: req.files,
    folder: 'listings',
    userId: req.user._id,
    generateThumbnails: true
  });

  if (uploadResult.totalUploaded === 0) {
    throw new AppError('Failed to upload images', 500);
  }

  // Prepare images data
  const images = uploadResult.successful.map((upload, index) => ({
    url: upload.url,
    publicId: upload.key,
    isPrimary: index === 0, // First image is primary
    order: index,
    thumbnails: upload.thumbnails
  }));

  // Create listing
  const listing = new Listing({
    title,
    description,
    category,
    subcategory,
    price: {
      amount: parseFloat(price.amount),
      currency: price.currency || 'INR',
      negotiable: price.negotiable !== false,
      priceType: price.priceType || 'negotiable'
    },
    condition,
    location: {
      ...location,
      coordinates: location.coordinates ? {
        latitude: parseFloat(location.coordinates.latitude),
        longitude: parseFloat(location.coordinates.longitude)
      } : undefined
    },
    seller: req.user._id,
    images,
    brand,
    model,
    yearOfPurchase: yearOfPurchase ? parseInt(yearOfPurchase) : undefined,
    warranty: warranty ? {
      hasWarranty: warranty.hasWarranty,
      warrantyPeriod: warranty.warrantyPeriod,
      warrantyExpires: warranty.warrantyExpires ? new Date(warranty.warrantyExpires) : undefined
    } : undefined,
    contact: contact || {},
    delivery: delivery || { available: false },
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    features: features || []
  });

  await listing.save();

  // Update user's listing count
  req.user.activity.totalListings += 1;
  req.user.activity.activeListings += 1;
  await req.user.save();

  logger.info('Listing created successfully', {
    listingId: listing._id,
    userId: req.user._id,
    title: listing.title
  });

  res.status(201).json({
    success: true,
    message: 'Listing created successfully',
    data: {
      listing: await listing.populate('seller', 'firstName lastName profilePicture rating')
    }
  });
}));

// @route   PUT /api/v1/listings/:id
// @desc    Update listing
// @access  Private (Owner only)
router.put('/:id', [
  authenticateToken,
  requireOwnership(Listing),
  upload.array('newImages', 10),
  body('title').optional().trim().isLength({ min: 10, max: 100 }),
  body('description').optional().trim().isLength({ min: 20, max: 2000 }),
  body('price.amount').optional().isNumeric().isFloat({ min: 0 }),
  body('condition').optional().isIn(['new', 'like_new', 'good', 'fair', 'poor'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const listing = req.resource; // Set by requireOwnership middleware
  const updateData = { ...req.body };

  // Handle image updates
  if (req.files && req.files.length > 0) {
    // Upload new images
    const uploadResult = await uploadMultipleFiles({
      files: req.files,
      folder: 'listings',
      userId: req.user._id,
      generateThumbnails: true
    });

    if (uploadResult.totalUploaded > 0) {
      const newImages = uploadResult.successful.map((upload, index) => ({
        url: upload.url,
        publicId: upload.key,
        isPrimary: listing.images.length === 0 && index === 0,
        order: listing.images.length + index,
        thumbnails: upload.thumbnails
      }));

      updateData.images = [...listing.images, ...newImages];
    }
  }

  // Handle image deletion
  if (updateData.deleteImages && updateData.deleteImages.length > 0) {
    const imagesToDelete = updateData.deleteImages;
    const remainingImages = listing.images.filter(img => 
      !imagesToDelete.includes(img.publicId)
    );

    // Delete from S3
    await deleteMultipleFiles(imagesToDelete);

    updateData.images = remainingImages;
    delete updateData.deleteImages;
  }

  // Ensure at least one image remains
  if (updateData.images && updateData.images.length === 0) {
    throw new AppError('At least one image is required', 400);
  }

  // Update listing
  Object.assign(listing, updateData);
  await listing.save();

  logger.info('Listing updated successfully', {
    listingId: listing._id,
    userId: req.user._id
  });

  res.json({
    success: true,
    message: 'Listing updated successfully',
    data: {
      listing: await listing.populate('seller', 'firstName lastName profilePicture rating')
    }
  });
}));

// @route   DELETE /api/v1/listings/:id
// @desc    Delete listing
// @access  Private (Owner only)
router.delete('/:id', [
  authenticateToken,
  requireOwnership(Listing)
], asyncHandler(async (req, res) => {
  const listing = req.resource;

  // Delete images from S3
  const imageKeys = listing.images.map(img => img.publicId);
  if (imageKeys.length > 0) {
    await deleteMultipleFiles(imageKeys);
  }

  // Soft delete - mark as deleted instead of removing
  listing.status = 'deleted';
  await listing.save();

  // Update user's listing count
  req.user.activity.activeListings = Math.max(0, req.user.activity.activeListings - 1);
  await req.user.save();

  logger.info('Listing deleted successfully', {
    listingId: listing._id,
    userId: req.user._id
  });

  res.json({
    success: true,
    message: 'Listing deleted successfully'
  });
}));

// @route   POST /api/v1/listings/:id/mark-sold
// @desc    Mark listing as sold
// @access  Private (Owner only)
router.post('/:id/mark-sold', [
  authenticateToken,
  requireOwnership(Listing),
  body('buyerId').optional().isMongoId(),
  body('soldPrice').optional().isNumeric()
], asyncHandler(async (req, res) => {
  const listing = req.resource;
  const { buyerId, soldPrice } = req.body;

  if (listing.status === 'sold') {
    throw new AppError('Listing is already marked as sold', 400);
  }

  // Mark as sold
  await listing.markAsSold(buyerId, {
    amount: soldPrice || listing.price.amount,
    status: 'completed'
  });

  // Update user statistics
  req.user.activity.soldItems += 1;
  req.user.activity.activeListings = Math.max(0, req.user.activity.activeListings - 1);
  await req.user.save();

  logger.info('Listing marked as sold', {
    listingId: listing._id,
    userId: req.user._id,
    soldPrice
  });

  res.json({
    success: true,
    message: 'Listing marked as sold successfully'
  });
}));

// @route   POST /api/v1/listings/:id/bump
// @desc    Bump listing to top
// @access  Private (Owner only)
router.post('/:id/bump', [
  authenticateToken,
  requireOwnership(Listing)
], asyncHandler(async (req, res) => {
  const listing = req.resource;

  if (listing.status !== 'active') {
    throw new AppError('Only active listings can be bumped', 400);
  }

  // Check if user can bump (e.g., once per day)
  const lastBumped = listing.lastBumpedAt;
  if (lastBumped && (Date.now() - lastBumped.getTime()) < 24 * 60 * 60 * 1000) {
    throw new AppError('Listing can only be bumped once per day', 400);
  }

  await listing.bump();

  logger.info('Listing bumped', {
    listingId: listing._id,
    userId: req.user._id
  });

  res.json({
    success: true,
    message: 'Listing bumped to top successfully'
  });
}));

// @route   POST /api/v1/listings/:id/report
// @desc    Report listing
// @access  Private
router.post('/:id/report', [
  authenticateToken,
  body('reason').isIn(['spam', 'inappropriate', 'fake', 'duplicate', 'overpriced', 'other']),
  body('description').optional().isLength({ max: 500 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { id } = req.params;
  const { reason, description } = req.body;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Check if user already reported this listing
  const alreadyReported = listing.moderation.flags.some(flag => 
    flag.reportedBy.equals(req.user._id)
  );

  if (alreadyReported) {
    throw new AppError('You have already reported this listing', 400);
  }

  // Add report
  listing.moderation.flags.push({
    reason,
    description,
    reportedBy: req.user._id
  });
  listing.moderation.flagCount += 1;

  await listing.save();

  logger.security('Listing reported', {
    listingId: listing._id,
    reportedBy: req.user._id,
    reason
  });

  res.json({
    success: true,
    message: 'Listing reported successfully. Our team will review it soon.'
  });
}));

module.exports = router;

