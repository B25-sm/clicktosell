const express = require('express');
const router = express.Router();
const razorpay = require('../config/razorpay');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// @route   POST /api/payments/create-order
// @desc    Create Razorpay payment order
// @access  Private
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, metadata = {} } = req.body;

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required (minimum ₹1)',
      });
    }

    // Create order
    const result = await razorpay.createOrder(amount, currency, receipt);
    
    if (result.success) {
      // Add metadata to order
      const orderData = {
        ...result.order,
        metadata: {
          userId: req.user.id,
          ...metadata,
        },
      };

      logger.info(`Payment order created for user ${req.user.id}: ${result.order.id}`);
      
      res.json({
        success: true,
        order: orderData,
        message: 'Payment order created successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: result.error,
      });
    }
  } catch (error) {
    logger.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, and Signature are required',
      });
    }

    // Verify payment
    const verification = razorpay.verifyPayment(orderId, paymentId, signature);
    
    if (verification.success) {
      // Get payment details
      const paymentDetails = await razorpay.getPaymentDetails(paymentId);
      
      if (paymentDetails.success) {
        logger.info(`Payment verified successfully for user ${req.user.id}: ${paymentId}`);
        
        // Here you would typically:
        // 1. Update user's premium status in database
        // 2. Send confirmation email
        // 3. Log transaction
        
        res.json({
          success: true,
          message: 'Payment verified successfully',
          payment: paymentDetails.payment,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Payment verification failed',
          error: paymentDetails.error,
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: verification.message,
      });
    }
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/payments/:paymentId
// @desc    Get payment details
// @access  Private
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const result = await razorpay.getPaymentDetails(paymentId);
    
    if (result.success) {
      res.json({
        success: true,
        payment: result.payment,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
        error: result.error,
      });
    }
  } catch (error) {
    logger.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   POST /api/payments/refund
// @desc    Create payment refund
// @access  Private (Admin only)
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you'll need to implement this check)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { paymentId, amount, reason = 'Refund requested' } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    const result = await razorpay.refundPayment(paymentId, amount, {
      reason: reason,
      refundedBy: req.user.id,
    });

    if (result.success) {
      logger.info(`Refund created by admin ${req.user.id} for payment: ${paymentId}`);
      
      res.json({
        success: true,
        refund: result.refund,
        message: 'Refund created successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create refund',
        error: result.error,
      });
    }
  } catch (error) {
    logger.error('Error creating refund:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/payments/test/connection
// @desc    Test Razorpay connection
// @access  Private (Admin only)
router.get('/test/connection', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const result = await razorpay.testConnection();
    
    res.json({
      success: result.success,
      message: result.success ? 'Razorpay connection successful' : 'Razorpay connection failed',
      details: result,
    });
  } catch (error) {
    logger.error('Error testing Razorpay connection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;