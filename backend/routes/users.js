const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { 
  authenticateToken, 
  requireVerification, 
  sensitiveOperationLimit,
  optionalAuth 
} = require('../middleware/auth');
const { asyncHandler, AppError, validationError } = require('../middleware/errorHandler');
const { uploadToS3, deleteFromS3 } = require('../utils/upload');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400), false);
    }
  }
});

// @route   GET /api/v1/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshTokens -verification.email.token -verification.phone.otp')
    .populate('favorites', 'title images price location createdAt');

  res.json({
    success: true,
    data: {
      user
    }
  });
}));

// @route   PUT /api/v1/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateToken,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('bio').optional().isLength({ max: 500 }),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('location.city').optional().trim().isLength({ min: 2, max: 50 }),
  body('location.state').optional().trim().isLength({ max: 50 }),
  body('location.pincode').optional().isPostalCode('IN')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const updateFields = {};
  const allowedFields = [
    'firstName', 'lastName', 'bio', 'dateOfBirth', 'gender',
    'location', 'preferences'
  ];

  // Only update provided fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateFields[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateFields,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens -verification.email.token -verification.phone.otp');

  logger.info('User profile updated', { userId: user._id });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
}));

// @route   POST /api/v1/users/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile-picture', [
  authenticateToken,
  upload.single('profilePicture')
], asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Profile picture is required', 400);
  }

  const user = req.user;

  // Delete old profile picture if exists
  if (user.profilePicture?.publicId) {
    try {
      await deleteFromS3(user.profilePicture.publicId);
    } catch (error) {
      logger.warn('Failed to delete old profile picture:', error);
    }
  }

  // Upload new profile picture
  const uploadResult = await uploadToS3({
    file: req.file,
    folder: 'profile-pictures',
    userId: user._id
  });

  // Update user profile
  user.profilePicture = {
    url: uploadResult.url,
    publicId: uploadResult.key
  };
  await user.save();

  logger.info('Profile picture updated', { userId: user._id });

  res.json({
    success: true,
    message: 'Profile picture updated successfully',
    data: {
      profilePicture: user.profilePicture
    }
  });
}));

// @route   DELETE /api/v1/users/profile-picture
// @desc    Delete profile picture
// @access  Private
router.delete('/profile-picture', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.profilePicture?.publicId) {
    throw new AppError('No profile picture to delete', 400);
  }

  // Delete from S3
  try {
    await deleteFromS3(user.profilePicture.publicId);
  } catch (error) {
    logger.warn('Failed to delete profile picture from S3:', error);
  }

  // Update user profile
  user.profilePicture = undefined;
  await user.save();

  logger.info('Profile picture deleted', { userId: user._id });

  res.json({
    success: true,
    message: 'Profile picture deleted successfully'
  });
}));

// @route   GET /api/v1/users/:id
// @desc    Get user public profile
// @access  Public
router.get('/:id', [
  optionalAuth,
  query('includeListings').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { includeListings } = req.query;

  const user = await User.findById(id)
    .select('firstName lastName profilePicture bio location rating activity createdAt')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user's active listings if requested
  let listings = [];
  if (includeListings === 'true') {
    listings = await Listing.find({
      seller: id,
      status: 'active',
      availability: 'available'
    })
    .select('title images price category location createdAt views favorites')
    .sort({ createdAt: -1 })
    .limit(20);
  }

  res.json({
    success: true,
    data: {
      user: {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
        memberSince: user.createdAt
      },
      listings
    }
  });
}));

// @route   GET /api/v1/users/me/listings
// @desc    Get current user's listings
// @access  Private
router.get('/me/listings', [
  authenticateToken,
  query('status').optional().isIn(['active', 'sold', 'expired', 'draft', 'suspended']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const filter = { seller: req.user._id };
  if (status) {
    filter.status = status;
  }

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .select('title images price category status availability location createdAt views inquiries favorites')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Listing.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      listings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
}));

// @route   GET /api/v1/users/me/favorites
// @desc    Get current user's favorite listings
// @access  Private
router.get('/me/favorites', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user._id)
    .populate({
      path: 'favorites',
      select: 'title images price category location seller createdAt status availability',
      populate: {
        path: 'seller',
        select: 'firstName lastName profilePicture rating'
      },
      options: {
        skip,
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      }
    });

  const total = user.favorites.length;

  res.json({
    success: true,
    data: {
      favorites: user.favorites,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
}));

// @route   POST /api/v1/users/favorites/:listingId
// @desc    Add listing to favorites
// @access  Private
router.post('/favorites/:listingId', authenticateToken, asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Check if user is not the seller
  if (listing.seller.equals(req.user._id)) {
    throw new AppError('Cannot add your own listing to favorites', 400);
  }

  // Add to user's favorites
  await req.user.addToFavorites(listingId);

  // Add to listing's favorites
  await listing.addToFavorites(req.user._id);

  logger.info('Listing added to favorites', { userId: req.user._id, listingId });

  res.json({
    success: true,
    message: 'Added to favorites successfully'
  });
}));

// @route   DELETE /api/v1/users/favorites/:listingId
// @desc    Remove listing from favorites
// @access  Private
router.delete('/favorites/:listingId', authenticateToken, asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Remove from user's favorites
  await req.user.removeFromFavorites(listingId);

  // Remove from listing's favorites
  await listing.removeFromFavorites(req.user._id);

  logger.info('Listing removed from favorites', { userId: req.user._id, listingId });

  res.json({
    success: true,
    message: 'Removed from favorites successfully'
  });
}));

// @route   PUT /api/v1/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  authenticateToken,
  body('language').optional().isIn(['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu']),
  body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP']),
  body('notifications').optional().isObject(),
  body('privacy').optional().isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { language, currency, notifications, privacy } = req.body;
  const user = req.user;

  if (language) user.preferences.language = language;
  if (currency) user.preferences.currency = currency;
  if (notifications) {
    user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
  }
  if (privacy) {
    user.preferences.privacy = { ...user.preferences.privacy, ...privacy };
  }

  await user.save();

  logger.info('User preferences updated', { userId: user._id });

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: user.preferences
    }
  });
}));

// @route   POST /api/v1/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  authenticateToken,
  sensitiveOperationLimit,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Set new password
  user.password = newPassword;
  
  // Invalidate all refresh tokens for security
  user.refreshTokens = [];
  
  await user.save();

  logger.security('Password changed', { userId: user._id });

  res.json({
    success: true,
    message: 'Password changed successfully. Please login again with your new password.'
  });
}));

// @route   DELETE /api/v1/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', [
  authenticateToken,
  sensitiveOperationLimit,
  body('password').notEmpty().withMessage('Password is required for account deletion'),
  body('reason').optional().isLength({ max: 500 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { password, reason } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Password is incorrect', 400);
  }

  // Deactivate account instead of hard delete
  user.status = 'deactivated';
  user.refreshTokens = [];
  
  // Log deletion reason
  if (reason) {
    logger.info('Account deletion reason', { userId: user._id, reason });
  }

  await user.save();

  // TODO: Handle cleanup tasks:
  // - Mark all listings as deleted
  // - Close active chats
  // - Cancel pending transactions

  logger.security('Account deactivated', { userId: user._id });

  res.json({
    success: true,
    message: 'Account has been deactivated successfully'
  });
}));

// @route   GET /api/v1/users/me/stats
// @desc    Get user statistics
// @access  Private
router.get('/me/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get listing statistics
  const listingStats = await Listing.aggregate([
    { $match: { seller: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalViews: { $sum: '$views.total' },
        totalInquiries: { $sum: '$inquiries.total' }
      }
    }
  ]);

  // Format statistics
  const stats = {
    listings: {
      total: 0,
      active: 0,
      sold: 0,
      expired: 0,
      draft: 0
    },
    engagement: {
      totalViews: 0,
      totalInquiries: 0,
      avgViewsPerListing: 0,
      avgInquiriesPerListing: 0
    },
    account: {
      memberSince: req.user.createdAt,
      lastActive: req.user.activity.lastActive,
      rating: req.user.rating.average,
      totalRatings: req.user.rating.count,
      favoritesCount: req.user.favorites.length
    }
  };

  listingStats.forEach(stat => {
    stats.listings.total += stat.count;
    stats.listings[stat._id] = stat.count;
    stats.engagement.totalViews += stat.totalViews;
    stats.engagement.totalInquiries += stat.totalInquiries;
  });

  if (stats.listings.total > 0) {
    stats.engagement.avgViewsPerListing = Math.round(stats.engagement.totalViews / stats.listings.total);
    stats.engagement.avgInquiriesPerListing = Math.round(stats.engagement.totalInquiries / stats.listings.total);
  }

  res.json({
    success: true,
    data: { stats }
  });
}));

module.exports = router;



