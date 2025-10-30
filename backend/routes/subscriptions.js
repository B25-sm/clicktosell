const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { User, Subscription } = require('../models');
const razorpay = require('../config/razorpay');
const logger = require('../utils/logger');
const { asyncHandler, AppError, validationError } = require('../utils/errorHandler');

// @route   GET /api/v1/subscriptions/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', asyncHandler(async (req, res) => {
  const plans = Subscription.getPlans();
  
  res.json({
    success: true,
    data: {
      plans
    }
  });
}));

// @route   GET /api/v1/subscriptions/current
// @desc    Get user's current subscription status
// @access  Private
router.get('/current', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('subscription.subscriptionId');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get active subscription
  const activeSubscription = await Subscription.getActiveSubscription(req.user._id);
  
  res.json({
    success: true,
    data: {
      currentPlan: user.subscription.currentPlan,
      subscriptionStatus: user.subscription.subscriptionStatus,
      subscriptionExpiresAt: user.subscription.subscriptionExpiresAt,
      monthlyUsage: user.subscription.monthlyUsage,
      activeSubscription: activeSubscription,
      canCreateListing: user.canCreateListing(),
      canPostAd: user.canPostAd()
    }
  });
}));

// @route   POST /api/v1/subscriptions/purchase
// @desc    Purchase a subscription plan
// @access  Private
router.post('/purchase', [
  authenticateToken,
  body('plan')
    .isIn(['basic', 'premium', 'unlimited'])
    .withMessage('Invalid subscription plan'),
  body('paymentMethod')
    .isIn(['card', 'netbanking', 'upi', 'wallet', 'bank_transfer'])
    .withMessage('Invalid payment method')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { plan, paymentMethod } = req.body;
  const plans = Subscription.getPlans();
  const planDetails = plans[plan];

  if (!planDetails) {
    throw new AppError('Invalid subscription plan', 400);
  }

  // Check if user already has an active subscription
  const existingSubscription = await Subscription.getActiveSubscription(req.user._id);
  if (existingSubscription) {
    throw new AppError('You already have an active subscription', 400);
  }

  // For basic plan (free), create subscription directly
  if (plan === 'basic') {
    const subscription = await Subscription.createSubscription(req.user._id, plan, {
      amount: 0,
      currency: 'INR',
      paymentMethod: 'free',
      paymentGateway: 'internal',
      paidAt: new Date()
    });

    // Update user subscription
    await req.user.updateSubscription({
      plan: plan,
      subscriptionId: subscription._id,
      status: 'active',
      expiresAt: subscription.endDate
    });

    return res.json({
      success: true,
      message: 'Basic subscription activated successfully',
      data: {
        subscription: subscription
      }
    });
  }

  // For paid plans, create Razorpay order
  const orderData = {
    amount: planDetails.price * 100, // Convert to paise
    currency: planDetails.currency,
    receipt: `sub_${req.user._id}_${Date.now()}`,
    notes: {
      plan: plan,
      userId: req.user._id.toString(),
      type: 'subscription'
    }
  };

  const razorpayOrder = await razorpay.createOrder(
    orderData.amount,
    orderData.currency,
    orderData.receipt,
    orderData.notes
  );

  if (!razorpayOrder.success) {
    throw new AppError('Failed to create payment order', 500);
  }

  // Create pending subscription
  const subscription = await Subscription.createSubscription(req.user._id, plan, {
    amount: planDetails.price,
    currency: planDetails.currency,
    paymentMethod: paymentMethod,
    paymentGateway: 'razorpay',
    gatewayOrderId: razorpayOrder.order.id
  });

  res.json({
    success: true,
    message: 'Payment order created successfully',
    data: {
      order: razorpayOrder.order,
      subscription: subscription
    }
  });
}));

// @route   POST /api/v1/subscriptions/verify
// @desc    Verify subscription payment
// @access  Private
router.post('/verify', [
  authenticateToken,
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('signature').notEmpty().withMessage('Signature is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { orderId, paymentId, signature } = req.body;

  // Verify payment with Razorpay
  const verification = razorpay.verifyPayment(orderId, paymentId, signature);
  
  if (!verification.success) {
    throw new AppError('Payment verification failed', 400);
  }

  // Get payment details
  const paymentDetails = await razorpay.getPaymentDetails(paymentId);
  if (!paymentDetails.success) {
    throw new AppError('Failed to get payment details', 500);
  }

  // Find the subscription
  const subscription = await Subscription.findOne({
    'payment.gatewayOrderId': orderId,
    user: req.user._id
  });

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  // Update subscription with payment details
  subscription.status = 'active';
  subscription.payment.transactionId = paymentId;
  subscription.payment.gatewayPaymentId = paymentId;
  subscription.payment.paidAt = new Date();
  await subscription.save();

  // Update user subscription
  await req.user.updateSubscription({
    plan: subscription.plan,
    subscriptionId: subscription._id,
    status: 'active',
    expiresAt: subscription.endDate
  });

  logger.info(`Subscription activated for user ${req.user._id}: ${subscription.plan}`);

  res.json({
    success: true,
    message: 'Subscription activated successfully',
    data: {
      subscription: subscription
    }
  });
}));

// @route   GET /api/v1/subscriptions/history
// @desc    Get user's subscription history
// @access  Private
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    data: {
      subscriptions
    }
  });
}));

// @route   POST /api/v1/subscriptions/cancel
// @desc    Cancel current subscription
// @access  Private
router.post('/cancel', [
  authenticateToken,
  body('reason').optional().isString().withMessage('Cancellation reason must be a string')
], asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const activeSubscription = await Subscription.getActiveSubscription(req.user._id);
  if (!activeSubscription) {
    throw new AppError('No active subscription found', 404);
  }

  // Cancel subscription
  activeSubscription.status = 'cancelled';
  activeSubscription.cancelledAt = new Date();
  activeSubscription.cancellationReason = reason || 'User requested cancellation';
  await activeSubscription.save();

  // Update user subscription status
  req.user.subscription.subscriptionStatus = 'cancelled';
  await req.user.save();

  logger.info(`Subscription cancelled for user ${req.user._id}: ${activeSubscription.plan}`);

  res.json({
    success: true,
    message: 'Subscription cancelled successfully',
    data: {
      subscription: activeSubscription
    }
  });
}));

// @route   GET /api/v1/subscriptions/usage
// @desc    Get current usage statistics
// @access  Private
router.get('/usage', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const plans = Subscription.getPlans();
  const currentPlan = plans[user.subscription.currentPlan];

  res.json({
    success: true,
    data: {
      currentPlan: user.subscription.currentPlan,
      planDetails: currentPlan,
      usage: user.subscription.monthlyUsage,
      limits: {
        maxListings: currentPlan.maxListings,
        maxAds: currentPlan.maxAds,
        listingsRemaining: currentPlan.maxListings === -1 ? -1 : Math.max(0, currentPlan.maxListings - user.subscription.monthlyUsage.listingsCreated),
        adsRemaining: currentPlan.maxAds === -1 ? -1 : Math.max(0, currentPlan.maxAds - user.subscription.monthlyUsage.adsPosted)
      },
      canCreateListing: user.canCreateListing(),
      canPostAd: user.canPostAd()
    }
  });
}));

// @route   POST /api/v1/subscriptions/upgrade
// @desc    Upgrade subscription plan
// @access  Private
router.post('/upgrade', [
  authenticateToken,
  body('plan')
    .isIn(['premium', 'unlimited'])
    .withMessage('Invalid upgrade plan'),
  body('paymentMethod')
    .isIn(['card', 'netbanking', 'upi', 'wallet', 'bank_transfer'])
    .withMessage('Invalid payment method')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors);
  }

  const { plan, paymentMethod } = req.body;
  const plans = Subscription.getPlans();
  const planDetails = plans[plan];

  if (!planDetails) {
    throw new AppError('Invalid subscription plan', 400);
  }

  // Check if user has an active subscription
  const activeSubscription = await Subscription.getActiveSubscription(req.user._id);
  if (!activeSubscription) {
    throw new AppError('No active subscription found. Please purchase a subscription first.', 400);
  }

  // Check if already on the same or higher plan
  const planHierarchy = { basic: 1, premium: 2, unlimited: 3 };
  if (planHierarchy[activeSubscription.plan] >= planHierarchy[plan]) {
    throw new AppError('Cannot downgrade or upgrade to the same plan', 400);
  }

  // Calculate prorated amount (simplified - in production, you'd want more sophisticated proration)
  const remainingDays = Math.ceil((activeSubscription.endDate - new Date()) / (1000 * 60 * 60 * 24));
  const dailyRate = planDetails.price / 30;
  const upgradeAmount = Math.round(dailyRate * remainingDays);

  // Create Razorpay order for upgrade
  const orderData = {
    amount: upgradeAmount * 100,
    currency: planDetails.currency,
    receipt: `upgrade_${req.user._id}_${Date.now()}`,
    notes: {
      plan: plan,
      userId: req.user._id.toString(),
      type: 'subscription_upgrade',
      originalPlan: activeSubscription.plan
    }
  };

  const razorpayOrder = await razorpay.createOrder(
    orderData.amount,
    orderData.currency,
    orderData.receipt,
    orderData.notes
  );

  if (!razorpayOrder.success) {
    throw new AppError('Failed to create upgrade payment order', 500);
  }

  res.json({
    success: true,
    message: 'Upgrade payment order created successfully',
    data: {
      order: razorpayOrder.order,
      upgradeAmount: upgradeAmount,
      originalPlan: activeSubscription.plan,
      newPlan: plan
    }
  });
}));

module.exports = router;

