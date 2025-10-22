const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { 
  generateToken, 
  generateRefreshToken, 
  authenticateToken, 
  sensitiveOperationLimit,
  refreshToken 
} = require('../middleware/auth');
const { asyncHandler, AppError, validationError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City is required and must be between 2 and 50 characters')
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { firstName, lastName, email, phone, password, city, state, country } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AppError('Email already registered', 400, 'EMAIL_EXISTS');
    }
    if (existingUser.phone === phone) {
      throw new AppError('Phone number already registered', 400, 'PHONE_EXISTS');
    }
  }

  // Create user
  const user = new User({
    firstName,
    lastName,
    email,
    phone,
    password,
    location: {
      city,
      state,
      country: country || 'India'
    }
  });

  // Generate email verification token
  const emailToken = crypto.randomBytes(32).toString('hex');
  user.verification.email.token = emailToken;
  user.verification.email.tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Generate phone OTP
  const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
  user.verification.phone.otp = phoneOTP;
  user.verification.phone.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save();

  // Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - OLX Classifieds',
      template: 'emailVerification',
      data: {
        name: user.firstName,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`,
        expiresIn: '24 hours'
      }
    });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
  }

  // Send phone OTP
  try {
    await sendSMS({
      to: user.phone,
      message: `Your OLX Classifieds verification code is: ${phoneOTP}. Valid for 10 minutes.`
    });
  } catch (error) {
    logger.error('Failed to send phone OTP:', error);
  }

  // Generate tokens
  const accessToken = generateToken({ userId: user._id });
  const refreshTokenValue = generateRefreshToken({ userId: user._id });

  // Save refresh token
  user.refreshTokens.push({
    token: refreshTokenValue,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    deviceInfo: req.headers['user-agent']
  });
  await user.save();

  logger.auth('User registered successfully', { userId: user._id, email: user.email });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email and phone number.',
    data: {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.verification.email.isVerified,
        isPhoneVerified: user.verification.phone.isVerified,
        role: user.role
      }
    }
  });
}));

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { identifier, password, rememberMe } = req.body;

  // Find user by email or phone
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new AppError('Account is temporarily locked due to multiple failed login attempts', 423, 'ACCOUNT_LOCKED');
  }

  // Check if account is suspended or banned
  if (user.status !== 'active') {
    throw new AppError(`Account is ${user.status}`, 403, 'ACCOUNT_SUSPENDED');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Generate tokens
  const tokenExpiry = rememberMe ? '30d' : '24h';
  const accessToken = generateToken({ userId: user._id });
  const refreshTokenValue = generateRefreshToken({ userId: user._id });

  // Save refresh token
  user.refreshTokens.push({
    token: refreshTokenValue,
    expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
    deviceInfo: req.headers['user-agent']
  });

  // Clean up old refresh tokens (keep only last 5)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  logger.auth('User logged in successfully', { userId: user._id, email: user.email });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isEmailVerified: user.verification.email.isVerified,
        isPhoneVerified: user.verification.phone.isVerified,
        role: user.role,
        location: user.location
      }
    }
  });
}));

// @route   POST /api/v1/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', refreshToken);

// @route   POST /api/v1/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove specific refresh token
    req.user.refreshTokens = req.user.refreshTokens.filter(rt => rt.token !== refreshToken);
  } else {
    // Remove all refresh tokens (logout from all devices)
    req.user.refreshTokens = [];
  }

  await req.user.save();

  logger.auth('User logged out', { userId: req.user._id });

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// @route   POST /api/v1/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Verification token is required', 400, 'TOKEN_REQUIRED');
  }

  const user = await User.findOne({
    'verification.email.token': token,
    'verification.email.tokenExpires': { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
  }

  // Mark email as verified
  user.verification.email.isVerified = true;
  user.verification.email.token = undefined;
  user.verification.email.tokenExpires = undefined;

  await user.save();

  logger.auth('Email verified successfully', { userId: user._id, email: user.email });

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// @route   POST /api/v1/auth/verify-phone
// @desc    Verify phone number with OTP
// @access  Private
router.post('/verify-phone', authenticateToken, asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    throw new AppError('OTP is required', 400, 'OTP_REQUIRED');
  }

  const user = req.user;

  if (user.verification.phone.isVerified) {
    throw new AppError('Phone number is already verified', 400, 'ALREADY_VERIFIED');
  }

  if (!user.verification.phone.otp || user.verification.phone.otpExpires < Date.now()) {
    throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
  }

  if (user.verification.phone.otp !== otp) {
    throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
  }

  // Mark phone as verified
  user.verification.phone.isVerified = true;
  user.verification.phone.otp = undefined;
  user.verification.phone.otpExpires = undefined;

  await user.save();

  logger.auth('Phone verified successfully', { userId: user._id, phone: user.phone });

  res.json({
    success: true,
    message: 'Phone number verified successfully'
  });
}));

// @route   POST /api/v1/auth/resend-email-verification
// @desc    Resend email verification
// @access  Private
router.post('/resend-email-verification', authenticateToken, sensitiveOperationLimit, asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.verification.email.isVerified) {
    throw new AppError('Email is already verified', 400, 'ALREADY_VERIFIED');
  }

  // Generate new verification token
  const emailToken = crypto.randomBytes(32).toString('hex');
  user.verification.email.token = emailToken;
  user.verification.email.tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await user.save();

  // Send verification email
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email - OLX Classifieds',
    template: 'emailVerification',
    data: {
      name: user.firstName,
      verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`,
      expiresIn: '24 hours'
    }
  });

  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
}));

// @route   POST /api/v1/auth/resend-phone-otp
// @desc    Resend phone OTP
// @access  Private
router.post('/resend-phone-otp', authenticateToken, sensitiveOperationLimit, asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.verification.phone.isVerified) {
    throw new AppError('Phone number is already verified', 400, 'ALREADY_VERIFIED');
  }

  // Generate new OTP
  const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
  user.verification.phone.otp = phoneOTP;
  user.verification.phone.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  // Send OTP
  await sendSMS({
    to: user.phone,
    message: `Your OLX Classifieds verification code is: ${phoneOTP}. Valid for 10 minutes.`
  });

  res.json({
    success: true,
    message: 'OTP sent successfully'
  });
}));

// @route   POST /api/v1/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], sensitiveOperationLimit, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await user.save();

  // Send reset email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - OLX Classifieds',
      template: 'passwordReset',
      data: {
        name: user.firstName,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        expiresIn: '30 minutes'
      }
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    logger.error('Failed to send password reset email:', error);
    throw new AppError('Failed to send password reset email', 500, 'EMAIL_SEND_FAILED');
  }

  res.json({
    success: true,
    message: 'Password reset link sent to your email'
  });
}));

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { token, password } = req.body;

  // Hash token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // Invalidate all refresh tokens for security
  user.refreshTokens = [];

  await user.save();

  logger.auth('Password reset successfully', { userId: user._id });

  res.json({
    success: true,
    message: 'Password reset successfully. Please login with your new password.'
  });
}));

// @route   GET /api/v1/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshTokens -verification.email.token -verification.phone.otp');

  res.json({
    success: true,
    data: {
      user
    }
  });
}));

module.exports = router;



