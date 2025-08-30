const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/emailService');
const auth = require('../middleware/auth');

// Test endpoint to send a test email
router.post('/test-email', auth, async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    await sendEmail(
      email || 'test@example.com',
      subject || 'Test Email from SkillSwap',
      message || 'This is a test email to verify the email functionality is working correctly.'
    );
    
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
