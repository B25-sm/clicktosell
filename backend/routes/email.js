const express = require('express');
const router = express.Router();
const emailService = require('../config/email');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// @route   POST /api/email/send
// @desc    Send custom email
// @access  Private
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'To, subject, and html content are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const result = await emailService.sendEmail(to, subject, html, text);
    
    if (result.success) {
      logger.info(`Email sent by user ${req.user.id} to ${to}: ${result.messageId}`);
      
      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error,
      });
    }
  } catch (error) {
    logger.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   POST /api/email/send-verification
// @desc    Send verification email
// @access  Public (used during registration)
router.post('/send-verification', async (req, res) => {
  try {
    const { email, verificationToken, firstName } = req.body;

    // Validate required fields
    if (!email || !verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification token are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const result = await emailService.sendVerificationEmail(email, verificationToken, firstName);
    
    if (result.success) {
      logger.info(`Verification email sent to ${email}: ${result.messageId}`);
      
      res.json({
        success: true,
        message: 'Verification email sent successfully',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: result.error,
      });
    }
  } catch (error) {
    logger.error('Error sending verification email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   POST /api/email/send-password-reset
// @desc    Send password reset email
// @access  Public (used during password reset)
router.post('/send-password-reset', async (req, res) => {
  try {
    const { email, resetToken, firstName } = req.body;

    // Validate required fields
    if (!email || !resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Email and reset token are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const result = await emailService.sendPasswordResetEmail(email, resetToken, firstName);
    
    if (result.success) {
      logger.info(`Password reset email sent to ${email}: ${result.messageId}`);
      
      res.json({
        success: true,
        message: 'Password reset email sent successfully',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: result.error,
      });
    }
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   POST /api/email/send-welcome
// @desc    Send welcome email
// @access  Private
router.post('/send-welcome', authenticateToken, async (req, res) => {
  try {
    const { email, firstName } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const result = await emailService.sendWelcomeEmail(email, firstName);
    
    if (result.success) {
      logger.info(`Welcome email sent by user ${req.user.id} to ${email}: ${result.messageId}`);
      
      res.json({
        success: true,
        message: 'Welcome email sent successfully',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
        error: result.error,
      });
    }
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/email/test-config
// @desc    Test email configuration
// @access  Private (Admin only)
router.get('/test-config', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you'll need to implement this check)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const result = await emailService.testEmailConfig();
    
    res.json({
      success: result.success,
      message: result.success ? 'Email configuration is valid' : 'Email configuration is invalid',
      details: result,
    });
  } catch (error) {
    logger.error('Error testing email configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   POST /api/email/test-send
// @desc    Send test email
// @access  Private (Admin only)
router.post('/test-send', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">🧪 Email Configuration Test</h1>
        <p>This is a test email from your OLX Classifieds server.</p>
        <p><strong>Server:</strong> ${req.get('host')}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>User:</strong> ${req.user.email || req.user.id}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          If you received this email, your email configuration is working correctly!
        </p>
      </div>
    `;

    const result = await emailService.sendEmail(
      testEmail,
      '🧪 OLX Classifieds - Email Test',
      testHtml
    );
    
    if (result.success) {
      logger.info(`Test email sent by admin ${req.user.id} to ${testEmail}: ${result.messageId}`);
      
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error,
      });
    }
  } catch (error) {
    logger.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;






