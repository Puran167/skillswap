const dotenv = require('dotenv');

// Load env vars
dotenv.config();

console.log('Loading modules...');

const { sendEmail } = require('./utils/emailService');

async function testEmail() {
  try {
    console.log('Testing email service...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    
    await sendEmail(
      'officialmrpuran167@gmail.com',
      'Test Email from SkillSwap',
      'This is a test email to verify the email functionality is working correctly.'
    );
    
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
