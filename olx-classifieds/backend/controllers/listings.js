const Listing = require('../models/Listing');
const User = require('../models/User');
const { logger } = require('../utils/logger');

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    let query = Listing.find({ status: 'active' });

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Listing.countDocuments({ status: 'active' });

    query = query.skip(startIndex).limit(limit);

    // Populate seller info
    query = query.populate('seller', 'fullName avatar phone isPhoneVerified');

    // Sort
    const sortBy = req.query.sort || '-createdAt';
    query = query.sort(sortBy);

    const listings = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      status: 'success',
      count: listings.length,
      pagination,
      data: {
        listings,
      },
    });
  } catch (error) {
    logger.error('Get listings error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'fullName avatar phone email isPhoneVerified isEmailVerified stats.rating stats.totalReviews')
      .populate('favorites.user', 'fullName');

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    // Increment views if user is not the seller
    if (!req.user || req.user._id.toString() !== listing.seller._id.toString()) {
      listing.views += 1;
      await listing.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        listing,
      },
    });
  } catch (error) {
    logger.error('Get listing error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.seller = req.user._id;

    // Set contact info from user if not provided
    if (!req.body.contact) {
      req.body.contact = {
        phone: req.user.phone,
        email: req.user.email,
        showPhone: req.user.preferences?.privacy?.showPhone !== false,
        showEmail: req.user.preferences?.privacy?.showEmail === true,
      };
    }

    const listing = await Listing.create(req.body);

    // Populate seller info
    await listing.populate('seller', 'fullName avatar');

    res.status(201).json({
      status: 'success',
      data: {
        listing,
      },
    });

    logger.info(`New listing created: ${listing.title} by ${req.user.email}`);
  } catch (error) {
    logger.error('Create listing error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    // Make sure user is listing owner
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to update this listing',
      });
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('seller', 'fullName avatar');

    res.status(200).json({
      status: 'success',
      data: {
        listing,
      },
    });

    logger.info(`Listing updated: ${listing.title} by ${req.user.email}`);
  } catch (error) {
    logger.error('Update listing error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    // Make sure user is listing owner
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to delete this listing',
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Listing deleted successfully',
    });

    logger.info(`Listing deleted: ${listing.title} by ${req.user.email}`);
  } catch (error) {
    logger.error('Delete listing error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Search listings
// @route   GET /api/listings/search
// @access  Public
const searchListings = async (req, res, next) => {
  try {
    const {
      q: searchTerm,
      category,
      minPrice,
      maxPrice,
      condition,
      city,
      sort = '-createdAt',
      page = 1,
      limit = 20,
    } = req.query;

    let query = { status: 'active' };

    // Text search
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // Condition filter
    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    // Location filter
    if (city && city !== 'All') {
      query['location.city'] = new RegExp(city, 'i');
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const total = await Listing.countDocuments(query);

    let listings = await Listing.find(query)
      .populate('seller', 'fullName avatar')
      .sort(sort)
      .skip(startIndex)
      .limit(parseInt(limit));

    // Pagination result
    const pagination = {};
    if (startIndex + parseInt(limit) < total) {
      pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
    }
    if (startIndex > 0) {
      pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };
    }

    res.status(200).json({
      status: 'success',
      count: listings.length,
      total,
      pagination,
      data: {
        listings,
      },
    });
  } catch (error) {
    logger.error('Search listings error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get nearby listings
// @route   GET /api/listings/nearby
// @access  Public
const getNearbyListings = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide latitude and longitude',
      });
    }

    const listings = await Listing.find({
      status: 'active',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    })
      .populate('seller', 'fullName avatar')
      .limit(20);

    res.status(200).json({
      status: 'success',
      count: listings.length,
      data: {
        listings,
      },
    });
  } catch (error) {
    logger.error('Get nearby listings error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get featured listings
// @route   GET /api/listings/featured
// @access  Public
const getFeaturedListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({
      status: 'active',
      featured: true,
    })
      .populate('seller', 'fullName avatar')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      status: 'success',
      count: listings.length,
      data: {
        listings,
      },
    });
  } catch (error) {
    logger.error('Get featured listings error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get user's listings
// @route   GET /api/listings/user/:userId
// @access  Private
const getUserListings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status = 'all', page = 1, limit = 20 } = req.query;

    let query = { seller: userId };

    if (status !== 'all') {
      query.status = status;
    }

    // Only allow user to see their own listings or admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      query.status = 'active'; // Others can only see active listings
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const total = await Listing.countDocuments(query);

    const listings = await Listing.find(query)
      .sort('-createdAt')
      .skip(startIndex)
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      count: listings.length,
      total,
      data: {
        listings,
      },
    });
  } catch (error) {
    logger.error('Get user listings error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Add listing to favorites
// @route   POST /api/listings/:id/favorite
// @access  Private
const addToFavorites = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    // Check if already in favorites
    const existingFavorite = listing.favorites.find(
      (fav) => fav.user.toString() === req.user._id.toString()
    );

    if (existingFavorite) {
      return res.status(400).json({
        status: 'error',
        message: 'Listing already in favorites',
      });
    }

    listing.favorites.push({ user: req.user._id });
    await listing.save();

    res.status(200).json({
      status: 'success',
      message: 'Added to favorites',
    });
  } catch (error) {
    logger.error('Add to favorites error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Remove listing from favorites
// @route   DELETE /api/listings/:id/favorite
// @access  Private
const removeFromFavorites = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    listing.favorites = listing.favorites.filter(
      (fav) => fav.user.toString() !== req.user._id.toString()
    );

    await listing.save();

    res.status(200).json({
      status: 'success',
      message: 'Removed from favorites',
    });
  } catch (error) {
    logger.error('Remove from favorites error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get user's favorite listings
// @route   GET /api/listings/user/favorites
// @access  Private
const getFavoriteListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({
      'favorites.user': req.user._id,
      status: 'active',
    })
      .populate('seller', 'fullName avatar')
      .sort('-favorites.addedAt');

    res.status(200).json({
      status: 'success',
      count: listings.length,
      data: {
        listings,
      },
    });
  } catch (error) {
    logger.error('Get favorite listings error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Increment listing views
// @route   PUT /api/listings/:id/views
// @access  Public
const incrementViews = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    listing.views += 1;
    await listing.save();

    res.status(200).json({
      status: 'success',
      data: {
        views: listing.views,
      },
    });
  } catch (error) {
    logger.error('Increment views error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Renew listing
// @route   PUT /api/listings/:id/renew
// @access  Private
const renewListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    // Make sure user is listing owner
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to renew this listing',
      });
    }

    await listing.renew();

    res.status(200).json({
      status: 'success',
      message: 'Listing renewed successfully',
      data: {
        listing,
      },
    });

    logger.info(`Listing renewed: ${listing.title} by ${req.user.email}`);
  } catch (error) {
    logger.error('Renew listing error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  searchListings,
  getNearbyListings,
  getFeaturedListings,
  getUserListings,
  addToFavorites,
  removeFromFavorites,
  getFavoriteListings,
  incrementViews,
  renewListing,
};


