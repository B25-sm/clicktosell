const twilio = require('twilio');
const logger = require('../utils/logger');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS
const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    logger.info(`SMS sent successfully to ${to}: ${result.sid}`);
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      message: 'SMS sent successfully',
    };
  } catch (error) {
    logger.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send SMS',
    };
  }
};

// Send OTP SMS
const sendOTP = async (phoneNumber, otp) => {
  const message = `Your OLX Classifieds OTP is: ${otp}. This OTP is valid for 5 minutes. Do not share it with anyone.`;
  return await sendSMS(phoneNumber, message);
};

// Send verification SMS
const sendVerificationSMS = async (phoneNumber, verificationCode) => {
  const message = `Welcome to OLX Classifieds! Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
  return await sendSMS(phoneNumber, message);
};

// Send notification SMS
const sendNotificationSMS = async (phoneNumber, message) => {
  const formattedMessage = `OLX Classifieds: ${message}`;
  return await sendSMS(phoneNumber, formattedMessage);
};

// Test Twilio connection
const testTwilioConnection = async () => {
  try {
    // Try to get account info
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    logger.info('Twilio connection test successful');
    return {
      success: true,
      message: 'Twilio connection successful',
      account: {
        friendlyName: account.friendlyName,
        status: account.status,
      },
    };
  } catch (error) {
    logger.error('Twilio connection test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Twilio connection failed',
    };
  }
};

module.exports = {
  client,
  sendSMS,
  sendOTP,
  sendVerificationSMS,
  sendNotificationSMS,
  testTwilioConnection,
};






