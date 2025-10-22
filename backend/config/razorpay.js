const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
const createOrder = async (amount, currency = 'INR', receipt = null) => {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (multiply by 100)
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    logger.info(`Razorpay order created: ${order.id}`);
    return {
      success: true,
      order: order,
    };
  } catch (error) {
    logger.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify payment signature
const verifyPayment = (orderId, paymentId, signature) => {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = generatedSignature === signature;
    
    if (isValid) {
      logger.info(`Payment verified successfully for order: ${orderId}`);
    } else {
      logger.warn(`Payment verification failed for order: ${orderId}`);
    }

    return {
      success: isValid,
      message: isValid ? 'Payment verified successfully' : 'Payment verification failed',
    };
  } catch (error) {
    logger.error('Error verifying payment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    logger.info(`Payment details fetched for: ${paymentId}`);
    return {
      success: true,
      payment: payment,
    };
  } catch (error) {
    logger.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Refund payment
const refundPayment = async (paymentId, amount = null, notes = {}) => {
  try {
    const refundData = {
      payment_id: paymentId,
      notes: notes,
    };

    if (amount) {
      refundData.amount = amount * 100; // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    logger.info(`Refund created: ${refund.id} for payment: ${paymentId}`);
    return {
      success: true,
      refund: refund,
    };
  } catch (error) {
    logger.error('Error creating refund:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Test Razorpay connection
const testConnection = async () => {
  try {
    // Try to fetch account details (this will fail if credentials are wrong)
    const account = await razorpay.accounts.fetch();
    logger.info('Razorpay connection test successful');
    return {
      success: true,
      message: 'Razorpay connection successful',
      account: account,
    };
  } catch (error) {
    logger.error('Razorpay connection test failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  razorpay,
  createOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
  testConnection,
};






