const { User, Subscription } = require('../models');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

// Middleware to check if user can create listings
const checkListingLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user can create listing
    if (!user.canCreateListing()) {
      const plans = Subscription.getPlans();
      const currentPlan = plans[user.subscription.currentPlan];
      
      // Check if user has reached monthly limit
      if (user.subscription.currentPlan === 'basic' && 
          user.subscription.monthlyUsage.listingsCreated >= 10) {
        
        return res.status(403).json({
          success: false,
          message: 'You have reached your monthly listing limit',
          code: 'LISTING_LIMIT_REACHED',
          data: {
            currentPlan: user.subscription.currentPlan,
            limit: 10,
            used: user.subscription.monthlyUsage.listingsCreated,
            upgradeRequired: true,
            availablePlans: {
              premium: plans.premium,
              unlimited: plans.unlimited
            }
          }
        });
      }

      // Check if subscription is inactive or expired
      if (user.subscription.subscriptionStatus !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Active subscription required to create listings',
          code: 'SUBSCRIPTION_REQUIRED',
          data: {
            subscriptionStatus: user.subscription.subscriptionStatus,
            availablePlans: plans
          }
        });
      }

      // Check if subscription has expired
      if (user.subscription.subscriptionExpiresAt && 
          user.subscription.subscriptionExpiresAt < new Date()) {
        return res.status(403).json({
          success: false,
          message: 'Your subscription has expired',
          code: 'SUBSCRIPTION_EXPIRED',
          data: {
            expiredAt: user.subscription.subscriptionExpiresAt,
            availablePlans: plans
          }
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error checking listing limits:', error);
    next(error);
  }
};

// Middleware to check if user can post ads
const checkAdLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user can post ad
    if (!user.canPostAd()) {
      const plans = Subscription.getPlans();
      const currentPlan = plans[user.subscription.currentPlan];
      
      // Check if user has reached monthly ad limit
      if (user.subscription.currentPlan !== 'unlimited' && 
          user.subscription.monthlyUsage.adsPosted >= 10) {
        
        return res.status(403).json({
          success: false,
          message: 'You have reached your monthly ad limit',
          code: 'AD_LIMIT_REACHED',
          data: {
            currentPlan: user.subscription.currentPlan,
            limit: 10,
            used: user.subscription.monthlyUsage.adsPosted,
            upgradeRequired: true,
            availablePlans: {
              unlimited: plans.unlimited
            }
          }
        });
      }

      // Check if subscription is inactive or expired
      if (user.subscription.subscriptionStatus !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Active subscription required to post ads',
          code: 'SUBSCRIPTION_REQUIRED',
          data: {
            subscriptionStatus: user.subscription.subscriptionStatus,
            availablePlans: plans
          }
        });
      }

      // Check if subscription has expired
      if (user.subscription.subscriptionExpiresAt && 
          user.subscription.subscriptionExpiresAt < new Date()) {
        return res.status(403).json({
          success: false,
          message: 'Your subscription has expired',
          code: 'SUBSCRIPTION_EXPIRED',
          data: {
            expiredAt: user.subscription.subscriptionExpiresAt,
            availablePlans: plans
          }
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error checking ad limits:', error);
    next(error);
  }
};

// Middleware to increment usage after successful listing creation
const incrementListingUsage = async (req, res, next) => {
  try {
    // Only increment if the listing was successfully created
    if (res.locals.listingCreated) {
      await req.user.incrementListingUsage();
      
      logger.info(`Listing usage incremented for user ${req.user._id}`);
    }
    
    next();
  } catch (error) {
    logger.error('Error incrementing listing usage:', error);
    // Don't fail the request if usage increment fails
    next();
  }
};

// Middleware to increment usage after successful ad posting
const incrementAdUsage = async (req, res, next) => {
  try {
    // Only increment if the ad was successfully posted
    if (res.locals.adPosted) {
      await req.user.incrementAdUsage();
      
      logger.info(`Ad usage incremented for user ${req.user._id}`);
    }
    
    next();
  } catch (error) {
    logger.error('Error incrementing ad usage:', error);
    // Don't fail the request if usage increment fails
    next();
  }
};

// Middleware to check subscription status and provide upgrade suggestions
const checkSubscriptionStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Add subscription info to request
    req.subscriptionInfo = {
      currentPlan: user.subscription.currentPlan,
      status: user.subscription.subscriptionStatus,
      expiresAt: user.subscription.subscriptionExpiresAt,
      canCreateListing: user.canCreateListing(),
      canPostAd: user.canPostAd(),
      monthlyUsage: user.subscription.monthlyUsage
    };

    next();
  } catch (error) {
    logger.error('Error checking subscription status:', error);
    next(error);
  }
};

module.exports = {
  checkListingLimits,
  checkAdLimits,
  incrementListingUsage,
  incrementAdUsage,
  checkSubscriptionStatus
};

