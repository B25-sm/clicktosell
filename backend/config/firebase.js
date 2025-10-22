const admin = require('firebase-admin');
const logger = require('../utils/logger');

let firebaseApp = null;

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (!firebaseApp) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      logger.info('Firebase Admin SDK initialized successfully');
    }
    
    return firebaseApp;
  } catch (error) {
    logger.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Send push notification to single device
const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    const app = initializeFirebase();
    
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#667eea',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    
    logger.info(`Push notification sent successfully: ${response}`);
    
    return {
      success: true,
      messageId: response,
      message: 'Push notification sent successfully',
    };
  } catch (error) {
    logger.error('Error sending push notification:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send push notification',
    };
  }
};

// Send push notification to multiple devices
const sendBulkPushNotification = async (tokens, title, body, data = {}) => {
  try {
    const app = initializeFirebase();
    
    const message = {
      tokens: tokens,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#667eea',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendMulticast(message);
    
    logger.info(`Bulk push notification sent: ${response.successCount}/${response.failureCount}`);
    
    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
      message: `Sent ${response.successCount} notifications successfully`,
    };
  } catch (error) {
    logger.error('Error sending bulk push notification:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send bulk push notification',
    };
  }
};

// Send topic-based notification
const sendTopicNotification = async (topic, title, body, data = {}) => {
  try {
    const app = initializeFirebase();
    
    const message = {
      topic: topic,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#667eea',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    
    logger.info(`Topic notification sent successfully: ${response}`);
    
    return {
      success: true,
      messageId: response,
      topic: topic,
      message: 'Topic notification sent successfully',
    };
  } catch (error) {
    logger.error('Error sending topic notification:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send topic notification',
    };
  }
};

// Subscribe device to topic
const subscribeToTopic = async (tokens, topic) => {
  try {
    const app = initializeFirebase();
    
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    
    logger.info(`Subscribed ${response.successCount} devices to topic: ${topic}`);
    
    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.errors,
      message: `Subscribed ${response.successCount} devices to ${topic}`,
    };
  } catch (error) {
    logger.error('Error subscribing to topic:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to subscribe to topic',
    };
  }
};

// Unsubscribe device from topic
const unsubscribeFromTopic = async (tokens, topic) => {
  try {
    const app = initializeFirebase();
    
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    
    logger.info(`Unsubscribed ${response.successCount} devices from topic: ${topic}`);
    
    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.errors,
      message: `Unsubscribed ${response.successCount} devices from ${topic}`,
    };
  } catch (error) {
    logger.error('Error unsubscribing from topic:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to unsubscribe from topic',
    };
  }
};

// Test Firebase connection
const testFirebaseConnection = async () => {
  try {
    const app = initializeFirebase();
    
    // Try to get project info
    const projectId = app.options.projectId;
    
    logger.info('Firebase connection test successful');
    return {
      success: true,
      message: 'Firebase connection successful',
      projectId: projectId,
    };
  } catch (error) {
    logger.error('Firebase connection test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Firebase connection failed',
    };
  }
};

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendBulkPushNotification,
  sendTopicNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  testFirebaseConnection,
};






