const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
exports.sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: html || generateEmailHTML(subject, text)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Generate HTML email template
const generateEmailHTML = (subject, text) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SkillSwap</h1>
                <h2>${subject}</h2>
            </div>
            <div class="content">
                <p>${text}</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="button">Open SkillSwap</a>
            </div>
            <div class="footer">
                <p>© 2025 SkillSwap. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send session reminder email
exports.sendSessionReminder = async (userEmail, sessionDetails) => {
  const subject = 'Session Reminder - SkillSwap';
  const text = `
    Hi there!
    
    This is a reminder that you have a skill swap session scheduled:
    
    Title: ${sessionDetails.title}
    Date: ${new Date(sessionDetails.date).toLocaleDateString()}
    Time: ${sessionDetails.time}
    Mode: ${sessionDetails.mode}
    ${sessionDetails.mode === 'online' ? `Meeting Link: ${sessionDetails.meetingLink}` : `Location: ${sessionDetails.location}`}
    
    Don't forget to prepare and be on time!
    
    Best regards,
    SkillSwap Team
  `;

  return await exports.sendEmail(userEmail, subject, text);
};

// Send swap request notification email
exports.sendSwapRequestEmail = async (userEmail, requesterName, skillOffered, skillNeeded) => {
  const subject = 'New Swap Request - SkillSwap';
  const text = `
    Hi there!
    
    You have received a new skill swap request:
    
    From: ${requesterName}
    They offer: ${skillOffered}
    They need: ${skillNeeded}
    
    Log in to SkillSwap to accept or decline this request.
    
    Best regards,
    SkillSwap Team
  `;

  return await exports.sendEmail(userEmail, subject, text);
};
