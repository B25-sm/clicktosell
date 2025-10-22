const Razorpay = require('razorpay');
const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Listing = require('../models/Listing');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Initialize payment gateways
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  // Create payment order
  static async createPaymentOrder({
    buyerId,
    sellerId,
    listingId,
    amount,
    paymentGateway = 'razorpay',
    currency = 'INR'
  }) {
    try {
      // Validate inputs
      const [buyer, seller, listing] = await Promise.all([
        User.findById(buyerId),
        User.findById(sellerId),
        Listing.findById(listingId)
      ]);

      if (!buyer || !seller || !listing) {
        throw new Error('Invalid buyer, seller, or listing');
      }

      if (listing.status !== 'active' || listing.availability !== 'available') {
        throw new Error('Listing is not available for purchase');
      }

      // Calculate fees
      const fees = Transaction.calculateFees(amount);
      const totalAmount = amount + fees.total;

      // Generate transaction ID
      const transactionId = `TXN_${Date.now()}_${uuidv4().substr(0, 8).toUpperCase()}`;

      // Create transaction record
      const transaction = new Transaction({
        transactionId,
        buyer: buyerId,
        seller: sellerId,
        listing: listingId,
        amount: {
          original: listing.price.amount,
          final: amount,
          currency
        },
        paymentGateway,
        status: 'pending',
        escrow: {
          isEscrow: true,
          holdPeriod: 7,
          autoReleaseEnabled: true
        }
      });

      transaction.amount.fees = fees;
      await transaction.save();

      // Create payment order based on gateway
      let paymentOrder;
      if (paymentGateway === 'razorpay') {
        paymentOrder = await this.createRazorpayOrder(transaction, totalAmount, currency);
      } else if (paymentGateway === 'stripe') {
        paymentOrder = await this.createStripePaymentIntent(transaction, totalAmount, currency);
      } else {
        throw new Error('Unsupported payment gateway');
      }

      // Update transaction with gateway order ID
      transaction.gatewayOrderId = paymentOrder.id;
      await transaction.save();

      logger.payment('Payment order created', {
        transactionId: transaction.transactionId,
        amount: totalAmount,
        gateway: paymentGateway
      });

      return {
        transaction,
        paymentOrder,
        clientSecret: paymentOrder.client_secret || null
      };

    } catch (error) {
      logger.error('Create payment order failed:', error);
      throw error;
    }
  }

  // Create Razorpay order
  static async createRazorpayOrder(transaction, amount, currency) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency: currency.toUpperCase(),
        receipt: transaction.transactionId,
        notes: {
          transactionId: transaction.transactionId,
          buyerId: transaction.buyer.toString(),
          sellerId: transaction.seller.toString(),
          listingId: transaction.listing.toString()
        }
      };

      const order = await razorpay.orders.create(options);
      return order;

    } catch (error) {
      logger.error('Razorpay order creation failed:', error);
      throw new Error('Failed to create Razorpay order: ' + error.message);
    }
  }

  // Create Stripe payment intent
  static async createStripePaymentIntent(transaction, amount, currency) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Amount in cents
        currency: currency.toLowerCase(),
        metadata: {
          transactionId: transaction.transactionId,
          buyerId: transaction.buyer.toString(),
          sellerId: transaction.seller.toString(),
          listingId: transaction.listing.toString()
        },
        capture_method: 'manual' // For escrow - capture later
      });

      return paymentIntent;

    } catch (error) {
      logger.error('Stripe payment intent creation failed:', error);
      throw new Error('Failed to create Stripe payment intent: ' + error.message);
    }
  }

  // Verify and process payment
  static async verifyPayment({
    transactionId,
    paymentId,
    signature,
    paymentGateway
  }) {
    try {
      const transaction = await Transaction.findOne({ transactionId })
        .populate('buyer seller listing');

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      let isVerified = false;
      let paymentDetails = {};

      if (paymentGateway === 'razorpay') {
        isVerified = await this.verifyRazorpayPayment(
          transaction.gatewayOrderId,
          paymentId,
          signature
        );
        if (isVerified) {
          paymentDetails = await razorpay.payments.fetch(paymentId);
        }
      } else if (paymentGateway === 'stripe') {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        isVerified = paymentIntent.status === 'requires_capture' || paymentIntent.status === 'succeeded';
        paymentDetails = paymentIntent;
      }

      if (!isVerified) {
        transaction.status = 'failed';
        await transaction.addTimelineEntry('failed', 'Payment verification failed');
        throw new Error('Payment verification failed');
      }

      // Update transaction with payment details
      transaction.gatewayTransactionId = paymentId;
      transaction.paymentMethod = {
        type: this.getPaymentMethodType(paymentDetails),
        details: this.extractPaymentMethodDetails(paymentDetails)
      };

      // Move to escrow
      await this.moveToEscrow(transaction);

      // Schedule auto-release
      await this.scheduleAutoRelease(transaction);

      logger.payment('Payment verified and moved to escrow', {
        transactionId: transaction.transactionId,
        paymentId
      });

      return transaction;

    } catch (error) {
      logger.error('Payment verification failed:', error);
      throw error;
    }
  }

  // Verify Razorpay payment signature
  static async verifyRazorpayPayment(orderId, paymentId, signature) {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      logger.error('Razorpay signature verification failed:', error);
      return false;
    }
  }

  // Move payment to escrow
  static async moveToEscrow(transaction) {
    try {
      transaction.status = 'held_in_escrow';
      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() + transaction.escrow.holdPeriod);
      transaction.escrow.releaseDate = releaseDate;

      await transaction.addTimelineEntry(
        'held_in_escrow',
        `Payment held in escrow for ${transaction.escrow.holdPeriod} days`
      );

      // Update listing status
      const listing = await Listing.findById(transaction.listing);
      if (listing) {
        listing.availability = 'reserved';
        await listing.save();
      }

      return transaction;

    } catch (error) {
      logger.error('Move to escrow failed:', error);
      throw error;
    }
  }

  // Release escrow payment to seller
  static async releaseEscrow(transactionId, releasedBy, reason = 'Auto-release') {
    try {
      const transaction = await Transaction.findOne({ transactionId })
        .populate('seller');

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'held_in_escrow') {
        throw new Error('Transaction is not in escrow');
      }

      // Capture/transfer payment based on gateway
      if (transaction.paymentGateway === 'stripe') {
        await this.captureStripePayment(transaction);
      }
      // Razorpay payments are already captured, just need to transfer

      // Release escrow
      await transaction.releaseEscrow(releasedBy);

      // Update listing as sold
      const listing = await Listing.findById(transaction.listing);
      if (listing) {
        await listing.markAsSold(transaction.buyer, {
          amount: transaction.amount.final,
          status: 'completed'
        });
      }

      // Update user statistics
      const seller = transaction.seller;
      seller.activity.soldItems += 1;
      await seller.save();

      logger.payment('Escrow released', {
        transactionId: transaction.transactionId,
        reason,
        releasedBy
      });

      return transaction;

    } catch (error) {
      logger.error('Escrow release failed:', error);
      throw error;
    }
  }

  // Capture Stripe payment
  static async captureStripePayment(transaction) {
    try {
      await stripe.paymentIntents.capture(transaction.gatewayTransactionId);
    } catch (error) {
      logger.error('Stripe payment capture failed:', error);
      throw error;
    }
  }

  // Process refund
  static async processRefund(transactionId, refundAmount, reason, refundedBy) {
    try {
      const transaction = await Transaction.findOne({ transactionId });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (!['held_in_escrow', 'completed'].includes(transaction.status)) {
        throw new Error('Transaction cannot be refunded');
      }

      const refundAmountFinal = refundAmount || transaction.amount.final;
      let refundResult;

      // Process refund based on gateway
      if (transaction.paymentGateway === 'razorpay') {
        refundResult = await razorpay.payments.refund(
          transaction.gatewayTransactionId,
          {
            amount: Math.round(refundAmountFinal * 100),
            notes: {
              reason,
              refundedBy: refundedBy.toString()
            }
          }
        );
      } else if (transaction.paymentGateway === 'stripe') {
        refundResult = await stripe.refunds.create({
          payment_intent: transaction.gatewayTransactionId,
          amount: Math.round(refundAmountFinal * 100),
          metadata: {
            reason,
            refundedBy: refundedBy.toString()
          }
        });
      }

      // Update transaction
      transaction.refund.refundTransactionId = refundResult.id;
      await transaction.processRefund(refundAmountFinal, reason, refundedBy);

      // Update listing availability
      const listing = await Listing.findById(transaction.listing);
      if (listing && listing.availability === 'reserved') {
        listing.availability = 'available';
        await listing.save();
      }

      logger.payment('Refund processed', {
        transactionId: transaction.transactionId,
        refundAmount: refundAmountFinal,
        reason
      });

      return transaction;

    } catch (error) {
      logger.error('Refund processing failed:', error);
      throw error;
    }
  }

  // Schedule auto-release job
  static async scheduleAutoRelease(transaction) {
    try {
      // This would integrate with a job queue like Bull or Agenda
      // For now, we'll store the job reference
      const jobId = `auto-release-${transaction.transactionId}`;
      transaction.autoReleaseJobId = jobId;
      await transaction.save();

      // In a real implementation, you would schedule this with a job queue
      logger.info('Auto-release scheduled', {
        transactionId: transaction.transactionId,
        releaseDate: transaction.escrow.releaseDate,
        jobId
      });

    } catch (error) {
      logger.error('Auto-release scheduling failed:', error);
    }
  }

  // Process auto-release (called by scheduled job)
  static async processAutoRelease() {
    try {
      const transactions = await Transaction.findReadyForAutoRelease();
      
      for (const transaction of transactions) {
        try {
          await this.releaseEscrow(
            transaction.transactionId,
            null, // System auto-release
            'Automatic release after hold period'
          );
        } catch (error) {
          logger.error('Auto-release failed for transaction:', {
            transactionId: transaction.transactionId,
            error: error.message
          });
        }
      }

      logger.info('Auto-release batch processed', {
        processed: transactions.length
      });

    } catch (error) {
      logger.error('Auto-release batch processing failed:', error);
    }
  }

  // Helper methods
  static getPaymentMethodType(paymentDetails) {
    if (paymentDetails.method === 'card') return 'card';
    if (paymentDetails.method === 'netbanking') return 'netbanking';
    if (paymentDetails.method === 'upi') return 'upi';
    if (paymentDetails.method === 'wallet') return 'wallet';
    return 'card'; // default
  }

  static extractPaymentMethodDetails(paymentDetails) {
    const details = {};
    
    if (paymentDetails.method === 'card' && paymentDetails.card) {
      details.last4 = paymentDetails.card.last4;
      details.brand = paymentDetails.card.network || paymentDetails.card.brand;
    }
    
    if (paymentDetails.method === 'netbanking' && paymentDetails.bank) {
      details.bank = paymentDetails.bank;
    }
    
    if (paymentDetails.method === 'upi' && paymentDetails.vpa) {
      details.upiId = paymentDetails.vpa;
    }
    
    if (paymentDetails.method === 'wallet' && paymentDetails.wallet) {
      details.wallet = paymentDetails.wallet;
    }

    return details;
  }

  // Get transaction statistics
  static async getTransactionStats(sellerId, period = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const stats = await Transaction.aggregate([
        {
          $match: {
            seller: sellerId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount.final' }
          }
        }
      ]);

      return stats;

    } catch (error) {
      logger.error('Transaction stats calculation failed:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;

