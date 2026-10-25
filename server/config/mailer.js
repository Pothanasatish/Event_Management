const nodemailer = require('nodemailer');

let transporter = null;

const initMailer = async () => {
  if (transporter) return transporter;

  // If specific SMTP credentials provided in .env
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log(`✓ [Mailer] Configured SMTP transporter for ${process.env.EMAIL_USER}`);
  } else {
    // Development fallback: automatic Ethereal test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`✓ [Mailer] Initialized Ethereal test account (${testAccount.user})`);
    } catch (err) {
      console.warn('! [Mailer] Could not create Ethereal test account, using JSON transport fallback:', err.message);
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
};

const sendMail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const activeTransporter = await initMailer();
    const info = await activeTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"EventHub" <noreply@eventhub.io>',
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
      attachments,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`✉ [Mailer] Email sent to ${to}. Preview URL: ${previewUrl}`);
    } else {
      console.log(`✉ [Mailer] Email sent to ${to}. ID: ${info.messageId}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`✗ [Mailer] Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { initMailer, sendMail };
