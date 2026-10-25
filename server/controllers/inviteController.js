const crypto = require('crypto');
const Invite = require('../models/Invite');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const { inviteEmail, rsvpConfirmationEmail } = require('../utils/emailTemplates');
const { sendMail } = require('../config/mailer');
const { getEventOccupancy, promoteWaitlistCandidate } = require('../utils/waitlistHelper');
const QRCode = require('qrcode');

// Helper to generate ticket code
const generateTicketCode = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const time = Date.now().toString(36).substring(4).toUpperCase();
  return `EVT-${rand}-${time}`;
};

// @desc    Bulk send invitations
// @route   POST /api/v1/invites/:eventId/bulk
// @access  Private (Organizer owner / Admin)
exports.bulkSendInvites = async (req, res, next) => {
  try {
    const { emails } = req.body;
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of emails' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const createdInvites = [];
    const validEmails = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter((e) => e && e.includes('@')))];

    for (const email of validEmails) {
      let invite = await Invite.findOne({ event: event._id, email });
      if (!invite) {
        const token = crypto.randomBytes(24).toString('hex');
        invite = await Invite.create({
          event: event._id,
          email,
          token,
          status: 'sent',
          sentAt: new Date(),
        });
      }

      const inviteUrl = `${clientUrl}/invite/${invite.token}`;
      const emailHtml = inviteEmail({
        event,
        inviteUrl,
        organizerName: req.user.name,
      });

      sendMail({
        to: email,
        subject: `You're invited: ${event.title}`,
        html: emailHtml,
      });

      createdInvites.push(invite);
    }

    res.status(200).json({
      success: true,
      message: `Invitations sent to ${createdInvites.length} recipient(s).`,
      data: { invites: createdInvites },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invites for an event
// @route   GET /api/v1/invites/:eventId
// @access  Private (Organizer owner / Admin)
exports.getEventInvites = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const invites = await Invite.find({ event: req.params.eventId }).sort({ sentAt: -1 });

    res.status(200).json({
      success: true,
      data: { invites },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invitation details by token (Public invite page)
// @route   GET /api/v1/invites/token/:token
// @access  Public
exports.getInviteByToken = async (req, res, next) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token }).populate({
      path: 'event',
      populate: { path: 'category organizer', select: 'name email avatar' },
    });

    if (!invite || !invite.event) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation link',
      });
    }

    // Mark as opened if currently sent
    if (invite.status === 'sent') {
      invite.status = 'opened';
      await invite.save();
    }

    // Check if an RSVP already exists for this email
    const existingRSVP = await RSVP.findOne({
      event: invite.event._id,
      guestEmail: invite.email,
    });

    const currentOccupancy = await getEventOccupancy(invite.event._id);
    const spotsRemaining = Math.max(0, invite.event.capacity - currentOccupancy);

    res.status(200).json({
      success: true,
      data: {
        invite,
        event: invite.event,
        spotsRemaining,
        existingRSVP,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to invitation
// @route   POST /api/v1/invites/token/:token/respond
// @access  Public
exports.respondToInvite = async (req, res, next) => {
  try {
    const { guestName, status = 'going', guestsCount = 1, note = '' } = req.body;
    const invite = await Invite.findOne({ token: req.params.token }).populate('event');

    if (!invite || !invite.event) {
      return res.status(404).json({ success: false, message: 'Invalid invitation link' });
    }

    const event = invite.event;
    const requestedCount = parseInt(guestsCount, 10) || 1;

    let targetStatus = status;
    if (targetStatus === 'going') {
      const currentOccupancy = await getEventOccupancy(event._id);
      if (currentOccupancy + requestedCount > event.capacity) {
        targetStatus = 'waitlisted';
      }
    }

    let existingRSVP = await RSVP.findOne({ event: event._id, guestEmail: invite.email });
    let ticketCode = existingRSVP ? existingRSVP.ticketCode : null;
    if (targetStatus === 'going' && !ticketCode) {
      ticketCode = generateTicketCode();
    }

    let rsvp;
    if (existingRSVP) {
      const prev = existingRSVP.status;
      existingRSVP.status = targetStatus;
      existingRSVP.guestName = guestName || existingRSVP.guestName;
      existingRSVP.guestsCount = requestedCount;
      existingRSVP.note = note;
      if (ticketCode) existingRSVP.ticketCode = ticketCode;
      rsvp = await existingRSVP.save();

      if (prev === 'going' && (targetStatus === 'declined' || targetStatus === 'maybe')) {
        await promoteWaitlistCandidate(event._id);
      }
    } else {
      rsvp = await RSVP.create({
        event: event._id,
        guestName: guestName || invite.email.split('@')[0],
        guestEmail: invite.email,
        status: targetStatus,
        guestsCount: requestedCount,
        note,
        ticketCode: targetStatus === 'going' ? ticketCode : undefined,
      });
    }

    invite.status = 'responded';
    invite.respondedAt = new Date();
    await invite.save();

    let qrDataUrl = null;
    if (targetStatus === 'going' && rsvp.ticketCode) {
      qrDataUrl = await QRCode.toDataURL(rsvp.ticketCode, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 256,
        color: { dark: '#312E81', light: '#FFFFFF' },
      });

      const emailHtml = rsvpConfirmationEmail({ event, rsvp, qrDataUrl });
      sendMail({
        to: invite.email,
        subject: `Invitation Confirmed: ${event.title}`,
        html: emailHtml,
      });
    }

    res.status(200).json({
      success: true,
      message: targetStatus === 'waitlisted'
        ? 'You have been added to the priority waitlist!'
        : `RSVP recorded as ${targetStatus}!`,
      data: { rsvp, qrDataUrl },
    });
  } catch (error) {
    next(error);
  }
};
