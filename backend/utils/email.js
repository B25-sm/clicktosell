const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production - use actual email service
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      secure: true,
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Development - use Ethereal for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Email templates
const emailTemplates = {
  emailVerification: {
    subject: 'Verify Your Email - OLX Classifieds',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #183b45; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #183b45; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OLX Classifieds</h1>
          </div>
          <div class="content">
            <h2>Welcome {{name}}!</h2>
            <p>Thank you for joining OLX Classifieds. Please verify your email address to complete your registration.</p>
            <p>Click the button below to verify your email:</p>
            <a href="{{verificationLink}}" class="button">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p>{{verificationLink}}</p>
            <p>This link will expire in {{expiresIn}}.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 OLX Classifieds. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  passwordReset: {
    subject: 'Password Reset - OLX Classifieds',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #183b45; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #183b45; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OLX Classifieds</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi {{name}},</p>
            <p>We received a request to reset your password for your OLX Classifieds account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{{resetLink}}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p>{{resetLink}}</p>
            <div class="warning">
              <strong>Important:</strong> This link will expire in {{expiresIn}}. If you didn't request a password reset, please ignore this email or contact our support team.
            </div>
            <p>For security reasons, this link can only be used once.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 OLX Classifieds. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  welcomeEmail: {
    subject: 'Welcome to OLX Classifieds!',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to OLX Classifieds</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #183b45; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #183b45; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .tips { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to OLX Classifieds!</h1>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>Congratulations! Your account has been successfully verified and you're now part of the OLX Classifieds community.</p>
            
            <div class="tips">
              <h3>Get Started:</h3>
              <ul>
                <li>Complete your profile to build trust with other users</li>
                <li>Post your first ad and reach thousands of potential buyers</li>
                <li>Browse categories to find great deals in your area</li>
                <li>Use our secure chat system to communicate with buyers/sellers</li>
              </ul>
            </div>
            
            <p>Ready to start buying and selling?</p>
            <a href="{{dashboardLink}}" class="button">Go to Dashboard</a>
            <a href="{{postAdLink}}" class="button">Post Your First Ad</a>
            
            <p>If you have any questions, our support team is here to help!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 OLX Classifieds. All rights reserved.</p>
            <p>Contact us: support@olx-classifieds.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  inquiryNotification: {
    subject: 'New Inquiry for Your Listing - {{listingTitle}}',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #183b45; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #183b45; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .listing-info { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #183b45; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Inquiry Received!</h1>
          </div>
          <div class="content">
            <h2>Hi {{sellerName}},</h2>
            <p>Great news! Someone is interested in your listing.</p>
            
            <div class="listing-info">
              <h3>{{listingTitle}}</h3>
              <p><strong>Price:</strong> {{listingPrice}}</p>
              <p><strong>Inquirer:</strong> {{buyerName}}</p>
              <p><strong>Message:</strong> {{inquiryMessage}}</p>
            </div>
            
            <p>Don't keep them waiting! Respond quickly to increase your chances of making a sale.</p>
            <a href="{{chatLink}}" class="button">Reply Now</a>
            
            <p>Tips for a successful sale:</p>
            <ul>
              <li>Respond promptly to inquiries</li>
              <li>Be honest about the item's condition</li>
              <li>Suggest meeting in a safe, public place</li>
              <li>Consider secure payment options</li>
            </ul>
          </div>
          <div class="footer">
            <p>&copy; 2024 OLX Classifieds. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Replace template variables
const replaceTemplateVariables = (template, data) => {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
};

// Send email function
const sendEmail = async ({ to, subject, template, data = {}, html, text }) => {
  try {
    const transporter = createTransporter();

    let emailHtml = html;
    let emailSubject = subject;

    // Use template if provided
    if (template && emailTemplates[template]) {
      const templateData = emailTemplates[template];
      emailHtml = replaceTemplateVariables(templateData.template, data);
      emailSubject = replaceTemplateVariables(templateData.subject, data);
    }

    const mailOptions = {
      from: `"OLX Classifieds" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: emailSubject,
      html: emailHtml,
      text: text || stripHtml(emailHtml)
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info('Email sent successfully', {
      to,
      subject: emailSubject,
      messageId: info.messageId,
      template
    });

    // Log preview URL in development
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };

  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Send bulk emails
const sendBulkEmail = async (emails) => {
  const results = [];
  const transporter = createTransporter();

  for (const emailData of emails) {
    try {
      const result = await sendEmail(emailData);
      results.push({ ...emailData, success: true, result });
    } catch (error) {
      results.push({ ...emailData, success: false, error: error.message });
    }
  }

  return results;
};

// Strip HTML tags for plain text version
const stripHtml = (html) => {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  verifyEmailConfig,
  emailTemplates
};



