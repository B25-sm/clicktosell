const twilio = require('twilio');
const logger = require('./logger');

// Initialize Twilio client
let twilioClient = null;

const initializeTwilio = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    return true;
  }
  return false;
};

// Initialize on module load
const isTwilioConfigured = initializeTwilio();

// Send SMS function
const sendSMS = async ({ to, message, from }) => {
  try {
    // Check if Twilio is configured
    if (!isTwilioConfigured || !twilioClient) {
      logger.warn('Twilio not configured, SMS not sent', { to, message });
      
      // In development, just log the SMS
      if (process.env.NODE_ENV === 'development') {
        logger.info('SMS would be sent:', { to, message });
        return {
          success: true,
          messageId: 'dev_' + Date.now(),
          status: 'delivered'
        };
      }
      
      throw new Error('SMS service not configured');
    }

    // Format phone number (ensure it starts with +)
    let formattedPhone = to.toString();
    if (!formattedPhone.startsWith('+')) {
      // Assume Indian number if no country code
      formattedPhone = '+91' + formattedPhone;
    }

    const smsOptions = {
      body: message,
      from: from || process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    };

    const smsResult = await twilioClient.messages.create(smsOptions);

    logger.info('SMS sent successfully', {
      to: formattedPhone,
      messageId: smsResult.sid,
      status: smsResult.status
    });

    return {
      success: true,
      messageId: smsResult.sid,
      status: smsResult.status,
      to: formattedPhone
    };

  } catch (error) {
    logger.error('SMS sending failed:', {
      to,
      message,
      error: error.message
    });

    throw new Error('Failed to send SMS: ' + error.message);
  }
};

// Send OTP SMS
const sendOTP = async ({ to, otp, purpose = 'verification' }) => {
  const messages = {
    verification: `Your OLX Classifieds verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
    password_reset: `Your OLX Classifieds password reset code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
    login: `Your OLX Classifieds login verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`
  };

  const message = messages[purpose] || messages.verification;

  return await sendSMS({ to, message });
};

// Send notification SMS
const sendNotificationSMS = async ({ to, type, data = {} }) => {
  const templates = {
    new_inquiry: `New inquiry for your listing "${data.listingTitle}". Check your messages on OLX Classifieds.`,
    price_drop_alert: `Price drop alert! "${data.listingTitle}" is now available for ${data.newPrice}. Check it out on OLX Classifieds.`,
    listing_sold: `Congratulations! Your listing "${data.listingTitle}" has been marked as sold.`,
    payment_received: `Payment of ${data.amount} received for "${data.listingTitle}". Transaction ID: ${data.transactionId}`,
    meeting_reminder: `Reminder: You have a meeting scheduled for "${data.listingTitle}" at ${data.meetingTime}.`,
    account_security: `Security alert: ${data.action} on your OLX Classifieds account. If this wasn't you, please contact support.`
  };

  const message = templates[type];
  if (!message) {
    throw new Error(`Unknown notification type: ${type}`);
  }

  return await sendSMS({ to, message });
};

// Send bulk SMS
const sendBulkSMS = async (smsData) => {
  const results = [];

  for (const sms of smsData) {
    try {
      const result = await sendSMS(sms);
      results.push({ ...sms, success: true, result });
    } catch (error) {
      results.push({ ...sms, success: false, error: error.message });
    }
  }

  return results;
};

// Validate phone number format
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.toString());
};

// Format phone number for display
const formatPhoneNumber = (phone) => {
  const phoneStr = phone.toString();
  
  // Indian number formatting
  if (phoneStr.startsWith('+91')) {
    const number = phoneStr.slice(3);
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  }
  
  // International number - just add spaces
  if (phoneStr.startsWith('+')) {
    return phoneStr.slice(0, 3) + ' ' + phoneStr.slice(3);
  }
  
  // Local number
  if (phoneStr.length === 10) {
    return `${phoneStr.slice(0, 5)} ${phoneStr.slice(5)}`;
  }
  
  return phoneStr;
};

// Check SMS delivery status
const checkDeliveryStatus = async (messageId) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio not configured');
    }

    const message = await twilioClient.messages(messageId).fetch();
    
    return {
      messageId: message.sid,
      status: message.status,
      to: message.to,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated
    };
  } catch (error) {
    logger.error('Failed to check SMS delivery status:', error);
    throw new Error('Failed to check delivery status: ' + error.message);
  }
};

// Get SMS usage statistics
const getSMSStats = async (startDate, endDate) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio not configured');
    }

    const messages = await twilioClient.messages.list({
      dateSentAfter: startDate,
      dateSentBefore: endDate,
      limit: 1000
    });

    const stats = {
      total: messages.length,
      delivered: 0,
      failed: 0,
      pending: 0,
      costs: 0
    };

    messages.forEach(message => {
      switch (message.status) {
        case 'delivered':
          stats.delivered++;
          break;
        case 'failed':
        case 'undelivered':
          stats.failed++;
          break;
        case 'queued':
        case 'sending':
          stats.pending++;
          break;
      }
      
      // Add price if available (in account currency)
      if (message.price) {
        stats.costs += Math.abs(parseFloat(message.price));
      }
    });

    return stats;
  } catch (error) {
    logger.error('Failed to get SMS stats:', error);
    throw new Error('Failed to get SMS statistics: ' + error.message);
  }
};

// Verify SMS configuration
const verifySMSConfig = async () => {
  try {
    if (!isTwilioConfigured || !twilioClient) {
      return { configured: false, error: 'Twilio credentials not configured' };
    }

    // Test the configuration by fetching account info
    const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    logger.info('SMS configuration verified successfully', {
      accountSid: account.sid,
      status: account.status
    });

    return {
      configured: true,
      accountSid: account.sid,
      status: account.status,
      friendlyName: account.friendlyName
    };
  } catch (error) {
    logger.error('SMS configuration verification failed:', error);
    return {
      configured: false,
      error: error.message
    };
  }
};

module.exports = {
  sendSMS,
  sendOTP,
  sendNotificationSMS,
  sendBulkSMS,
  validatePhoneNumber,
  formatPhoneNumber,
  checkDeliveryStatus,
  getSMSStats,
  verifySMSConfig
};

