const User = require('../models/User');
const { logger } = require('../utils/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email or phone',
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    // Generate token
    const token = user.getSignedJwtToken();

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });

    logger.info(`New user registered: ${user.email}`);
  } catch (error) {
    logger.error('Register error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    // Remove password from output
    user.password = undefined;

    res.json({
      status: 'success',
      token,
      data: {
        user,
      },
    });

    logger.info(`User logged in: ${user.email}`);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully',
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });

    logger.info(`User updated details: ${user.email}`);
  } catch (error) {
    logger.error('Update details error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Password is incorrect',
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      status: 'success',
      token,
    });

    logger.info(`User updated password: ${user.email}`);
  } catch (error) {
    logger.error('Update password error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'There is no user with that email',
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    // For now, just return the token (in production, send via email)
    
    res.status(200).json({
      status: 'success',
      message: 'Reset token sent',
      resetToken, // Remove this in production
    });

    logger.info(`Password reset requested: ${user.email}`);
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Email could not be sent',
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.resettoken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      status: 'success',
      token,
    });

    logger.info(`Password reset successful: ${user.email}`);
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { email, token } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });

    logger.info(`Email verified: ${user.email}`);
  } catch (error) {
    logger.error('Verify email error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Verify phone
// @route   POST /api/auth/verify-phone
// @access  Public
const verifyPhone = async (req, res, next) => {
  try {
    const { phone, token } = req.body;

    const user = await User.findOne({
      phone,
      phoneVerificationToken: token,
      phoneVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token',
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationToken = undefined;
    user.phoneVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Phone verified successfully',
    });

    logger.info(`Phone verified: ${user.phone}`);
  } catch (error) {
    logger.error('Verify phone error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Resend verification
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res, next) => {
  try {
    const { email, type } = req.body; // type: 'email' or 'phone'

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    let token;
    if (type === 'email') {
      token = user.getEmailVerificationToken();
    } else if (type === 'phone') {
      token = user.getPhoneVerificationToken();
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: `Verification ${type} sent`,
      token, // Remove this in production
    });

    logger.info(`Verification resent: ${user.email} - ${type}`);
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    // TODO: Implement refresh token logic
    res.status(200).json({
      status: 'success',
      message: 'Token refreshed',
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyPhone,
  resendVerification,
  refreshToken,
};


