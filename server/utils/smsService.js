const twilio = require('twilio');

// Initialize Twilio client
let twilioClient = null;

const initializeTwilio = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

// Send SMS function
exports.sendSMS = async (phoneNumber, message) => {
  try {
    const client = initializeTwilio();
    
    if (!client) {
      console.log('Twilio not configured, skipping SMS');
      return null;
    }

    // Format phone number (ensure it starts with +)
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Send session reminder SMS
exports.sendSessionReminderSMS = async (phoneNumber, sessionDetails) => {
  const message = `SkillSwap Reminder: Your session "${sessionDetails.title}" starts in 30 minutes at ${sessionDetails.time}. ${sessionDetails.mode === 'online' ? 'Check your email for the meeting link.' : `Location: ${sessionDetails.location}`}`;
  
  return await exports.sendSMS(phoneNumber, message);
};

// Send swap request SMS
exports.sendSwapRequestSMS = async (phoneNumber, requesterName) => {
  const message = `SkillSwap: You have a new swap request from ${requesterName}. Check the app to respond.`;
  
  return await exports.sendSMS(phoneNumber, message);
};

// Validate phone number format
exports.validatePhoneNumber = (phoneNumber) => {
  // Simple validation for US/international numbers
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phoneNumber);
};
