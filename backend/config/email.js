const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email configuration
const createTransporter = () => {
  // Gmail configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  }

  // SendGrid configuration
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // SMTP configuration
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send email
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'OLX Classifieds'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully',
    };
  } catch (error) {
    logger.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email',
    };
  }
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken, firstName = 'User') => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to OLX Classifieds!</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Thank you for signing up with OLX Classifieds! To complete your registration and start using our platform, 
          please verify your email address by clicking the button below.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        
        <p style="color: #667eea; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${verificationUrl}
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>© 2024 OLX Classifieds. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;

  return await sendEmail(email, 'Verify Your Email - OLX Classifieds', html);
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, firstName = 'User') => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          We received a request to reset your password for your OLX Classifieds account. 
          Click the button below to create a new password.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        
        <p style="color: #ff6b6b; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${resetUrl}
        </p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-weight: bold;">⚠️ Security Notice:</p>
          <p style="color: #856404; margin: 5px 0 0 0; font-size: 14px;">
            This link will expire in 1 hour for security reasons. If you didn't request this password reset, 
            please ignore this email and your password will remain unchanged.
          </p>
        </div>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>© 2024 OLX Classifieds. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;

  return await sendEmail(email, 'Reset Your Password - OLX Classifieds', html);
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName = 'User') => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to OLX Classifieds! 🎉</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Congratulations! Your email has been verified and your OLX Classifieds account is now active. 
          You can now start buying and selling items in your area.
        </p>
        
        <div style="background: #e8f5e8; border: 1px solid #00b894; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #00b894; margin-top: 0;">🚀 What you can do now:</h3>
          <ul style="color: #666; line-height: 1.6;">
            <li>Browse thousands of listings in your area</li>
            <li>Post your own items for sale</li>
            <li>Connect with buyers and sellers</li>
            <li>Get notifications for items you're interested in</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/listings" 
             style="background: #00b894; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Start Browsing Listings
          </a>
        </div>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>© 2024 OLX Classifieds. All rights reserved.</p>
        <p>Need help? Contact our support team.</p>
      </div>
    </div>
  `;

  return await sendEmail(email, 'Welcome to OLX Classifieds! 🎉', html);
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration test successful');
    return {
      success: true,
      message: 'Email configuration is valid',
    };
  } catch (error) {
    logger.error('Email configuration test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Email configuration is invalid',
    };
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  testEmailConfig,
  createTransporter,
};






