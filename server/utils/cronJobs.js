const cron = require('node-cron');
const Session = require('../models/Session');
const User = require('../models/User');
const { sendSessionReminder, sendSessionReminderSMS } = require('../utils/emailService');
const { sendSessionReminderSMS: sendSMSReminder } = require('../utils/smsService');
const { sendSessionReminderPush } = require('../utils/pushService');
const { sendNotificationToUser } = require('../controllers/notifications');

// Initialize cron jobs
exports.initializeCronJobs = () => {
  console.log('Initializing cron jobs...');

  // Check for session reminders every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running session reminder check...');
    await checkSessionReminders();
  });

  // Clean up old notifications daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running notification cleanup...');
    await cleanupOldNotifications();
  });

  console.log('Cron jobs initialized successfully');
};

// Check for upcoming sessions and send reminders
const checkSessionReminders = async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    // Find sessions starting in 1 hour (for email reminders)
    const emailReminderSessions = await Session.find({
      date: {
        $gte: new Date(now.toDateString()),
        $lt: new Date(oneHourFromNow.toDateString())
      },
      $expr: {
        $and: [
          {
            $gte: [
              {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      "T",
                      "$time",
                      ":00.000Z"
                    ]
                  }
                }
              },
              now
            ]
          },
          {
            $lte: [
              {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      "T",
                      "$time",
                      ":00.000Z"
                    ]
                  }
                }
              },
              oneHourFromNow
            ]
          }
        ]
      },
      status: 'confirmed',
      emailReminderSent: { $ne: true }
    }).populate('creatorId participantId');

    // Send email reminders
    for (const session of emailReminderSessions) {
      await sendEmailReminders(session);
      // Mark as email reminder sent
      session.emailReminderSent = true;
      await session.save();
    }

    // Find sessions starting in 30 minutes (for SMS reminders)
    const smsReminderSessions = await Session.find({
      date: {
        $gte: new Date(now.toDateString()),
        $lt: new Date(thirtyMinutesFromNow.toDateString())
      },
      $expr: {
        $and: [
          {
            $gte: [
              {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      "T",
                      "$time",
                      ":00.000Z"
                    ]
                  }
                }
              },
              now
            ]
          },
          {
            $lte: [
              {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      "T",
                      "$time",
                      ":00.000Z"
                    ]
                  }
                }
              },
              thirtyMinutesFromNow
            ]
          }
        ]
      },
      status: 'confirmed',
      smsReminderSent: { $ne: true }
    }).populate('creatorId participantId');

    // Send SMS reminders
    for (const session of smsReminderSessions) {
      await sendSMSReminders(session);
      // Mark as SMS reminder sent
      session.smsReminderSent = true;
      await session.save();
    }

    if (emailReminderSessions.length > 0 || smsReminderSessions.length > 0) {
      console.log(`Sent ${emailReminderSessions.length} email reminders and ${smsReminderSessions.length} SMS reminders`);
    }
  } catch (error) {
    console.error('Error in checkSessionReminders:', error);
  }
};

// Send email reminders for a session
const sendEmailReminders = async (session) => {
  try {
    const participants = [session.creatorId, session.participantId];

    for (const participant of participants) {
      if (participant.notificationPreferences?.email && participant.email) {
        await sendSessionReminder(participant.email, session);
      }

      // Send in-app notification
      await sendNotificationToUser(
        participant._id,
        `Reminder: Your session "${session.title}" starts in 1 hour at ${session.time}`,
        'session',
        { sessionId: session._id, type: 'reminder_1hour' },
        ['inApp']
      );

      // Send push notification
      if (participant.deviceToken) {
        await sendSessionReminderPush(participant.deviceToken, session);
      }
    }
  } catch (error) {
    console.error('Error sending email reminders:', error);
  }
};

// Send SMS reminders for a session
const sendSMSReminders = async (session) => {
  try {
    const participants = [session.creatorId, session.participantId];

    for (const participant of participants) {
      if (participant.notificationPreferences?.sms && participant.phoneNumber) {
        await sendSMSReminder(participant.phoneNumber, session);
      }

      // Send in-app notification
      await sendNotificationToUser(
        participant._id,
        `Your session "${session.title}" starts in 30 minutes! Get ready.`,
        'session',
        { sessionId: session._id, type: 'reminder_30min' },
        ['inApp']
      );
    }
  } catch (error) {
    console.error('Error sending SMS reminders:', error);
  }
};

// Clean up old notifications (older than 30 days)
const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await require('../models/Notification').deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
};
