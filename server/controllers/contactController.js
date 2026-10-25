const ContactMessage = require('../models/ContactMessage');
const { sendMail } = require('../config/mailer');

// @desc    Submit contact message
// @route   POST /api/v1/contact
// @access  Public
exports.submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const contact = await ContactMessage.create({
      name,
      email: email.toLowerCase(),
      subject,
      message,
    });

    // Notify team/admin
    sendMail({
      to: 'support@eventhub.io',
      subject: `[Contact Form] ${subject} from ${name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We have received your message and will respond shortly.',
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/v1/contact
// @access  Private (Admin)
exports.getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};
