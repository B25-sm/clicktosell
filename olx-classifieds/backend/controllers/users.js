const User = require('../models/User');
const { logger } = require('../utils/logger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await User.countDocuments();

    const users = await User.find()
      .select('-password -refreshTokens')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};
    if (startIndex + limit < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      status: 'success',
      count: users.length,
      total,
      pagination,
      data: {
        users,
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens')
      .populate('listings');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      isActive: req.body.isActive,
      isEmailVerified: req.body.isEmailVerified,
      isPhoneVerified: req.body.isPhoneVerified,
    };

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });

    logger.info(`User updated by admin: ${user.email}`);
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Soft delete - deactivate user instead of deleting
    user.isActive = false;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully',
    });

    logger.info(`User deactivated by admin: ${user.email}`);
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshTokens')
      .populate({
        path: 'listings',
        match: { status: { $ne: 'deleted' } },
        options: { sort: { createdAt: -1 }, limit: 5 },
      });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      location: req.body.location,
      preferences: req.body.preferences,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -refreshTokens');

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });

    logger.info(`User profile updated: ${user.email}`);
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    // TODO: Implement file upload logic with multer and AWS S3
    // For now, just accept a URL
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide avatar URL',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });

    logger.info(`User avatar updated: ${user.email}`);
  } catch (error) {
    logger.error('Upload avatar error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Update user stats
    await user.updateStats();

    res.status(200).json({
      status: 'success',
      data: {
        stats: user.stats,
      },
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update user location
// @route   PUT /api/users/location
// @access  Private
const updateUserLocation = async (req, res, next) => {
  try {
    const { address, city, state, country, coordinates } = req.body;

    const location = {
      address,
      city,
      state,
      country,
      coordinates,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { location },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });

    logger.info(`User location updated: ${user.email}`);
  } catch (error) {
    logger.error('Update user location error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updateUserPreferences = async (req, res, next) => {
  try {
    const { notifications, privacy } = req.body;

    const preferences = {};
    if (notifications) preferences.notifications = notifications;
    if (privacy) preferences.privacy = privacy;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });

    logger.info(`User preferences updated: ${user.email}`);
  } catch (error) {
    logger.error('Update user preferences error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Deactivate user account
// @route   DELETE /api/users/profile
// @access  Private
const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully',
    });

    logger.info(`User deactivated account: ${user.email}`);
  } catch (error) {
    logger.error('Deactivate account error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserStats,
  updateUserLocation,
  updateUserPreferences,
  deactivateAccount,
};


