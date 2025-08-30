const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp = null;

const initializeFirebase = () => {
  if (!firebaseApp && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }
  return firebaseApp;
};

// Send push notification
exports.sendPushNotification = async (deviceToken, title, body, data = {}) => {
  try {
    const app = initializeFirebase();
    
    if (!app) {
      console.log('Firebase not configured, skipping push notification');
      return null;
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      token: deviceToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'skillswap_notifications'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const result = await admin.messaging().send(message);
    console.log('Push notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    // Don't throw error to prevent breaking the flow
    return null;
  }
};

// Send push notification to multiple devices
exports.sendPushNotificationToMultiple = async (deviceTokens, title, body, data = {}) => {
  try {
    const app = initializeFirebase();
    
    if (!app || !deviceTokens || deviceTokens.length === 0) {
      console.log('Firebase not configured or no device tokens, skipping push notifications');
      return null;
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      tokens: deviceTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'skillswap_notifications'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const result = await admin.messaging().sendMulticast(message);
    console.log('Push notifications sent:', result.successCount, 'successful,', result.failureCount, 'failed');
    return result;
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return null;
  }
};

// Send session reminder push notification
exports.sendSessionReminderPush = async (deviceToken, sessionDetails) => {
  const title = 'Session Reminder';
  const body = `Your session "${sessionDetails.title}" starts in 30 minutes`;
  const data = {
    type: 'session_reminder',
    sessionId: sessionDetails._id.toString(),
    action: 'open_session'
  };

  return await exports.sendPushNotification(deviceToken, title, body, data);
};

// Send swap request push notification
exports.sendSwapRequestPush = async (deviceToken, requesterName) => {
  const title = 'New Swap Request';
  const body = `${requesterName} wants to swap skills with you`;
  const data = {
    type: 'swap_request',
    action: 'open_requests'
  };

  return await exports.sendPushNotification(deviceToken, title, body, data);
};
