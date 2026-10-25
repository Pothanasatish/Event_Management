const QRCode = require('qrcode');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { getEventOccupancy, promoteWaitlistCandidate } = require('../utils/waitlistHelper');
const { generateICS } = require('../utils/icsGenerator');
const { rsvpConfirmationEmail } = require('../utils/emailTemplates');
const { sendMail } = require('../config/mailer');

// Helper to generate unique ticket code
const generateTicketCode = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const time = Date.now().toString(36).substring(4).toUpperCase();
  return `EVT-${rand}-${time}`;
};

// @desc    Create or update an RSVP (Going / Maybe / Declined)
// @route   POST /api/v1/rsvps
// @access  Public (Guest with name/email) or Private (Logged in user)
exports.createOrUpdateRSVP = async (req, res, next) => {
  try {
    const { eventId, status = 'going', guestsCount = 1, note = '', guestName, guestEmail } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Business Rules Verification
    if (event.status === 'draft') {
      return res.status(400).json({ success: false, message: 'Cannot RSVP to a draft event' });
    }
    if (event.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This event has been cancelled by the organizer' });
    }
    if (new Date(event.endDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This event has already ended' });
    }
    if (event.rsvpDeadline && new Date(event.rsvpDeadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'The RSVP deadline for this event has passed' });
    }

    const finalName = req.user ? req.user.name : guestName;
    const finalEmail = req.user ? req.user.email : guestEmail ? guestEmail.toLowerCase() : null;

    if (!finalName || !finalEmail) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required to RSVP',
      });
    }

    // Check for existing RSVP
    let existingRSVP = null;
    if (req.user) {
      existingRSVP = await RSVP.findOne({ event: eventId, user: req.user.id });
    }
    if (!existingRSVP) {
      existingRSVP = await RSVP.findOne({ event: eventId, guestEmail: finalEmail });
    }

    const previousStatus = existingRSVP ? existingRSVP.status : null;
    const requestedCount = parseInt(guestsCount, 10) || 1;

    let targetStatus = status;

    // Check capacity if attendee wants to go
    if (targetStatus === 'going') {
      const currentOccupancy = await getEventOccupancy(eventId);
      const spotsRemaining = event.capacity - currentOccupancy;

      // If user was already going, don't double count previous guests
      const alreadyGoingOffset = previousStatus === 'going' ? existingRSVP.guestsCount : 0;
      const effectiveSpots = spotsRemaining + alreadyGoingOffset;

      if (effectiveSpots < requestedCount) {
        // Event is at capacity -> redirect to waitlist!
        targetStatus = 'waitlisted';
      }
    }

    let rsvp;
    let ticketCode = existingRSVP ? existingRSVP.ticketCode : null;

    if (targetStatus === 'going' && !ticketCode) {
      ticketCode = generateTicketCode();
    }

    if (existingRSVP) {
      existingRSVP.status = targetStatus;
      existingRSVP.guestsCount = requestedCount;
      existingRSVP.note = note;
      existingRSVP.guestName = finalName;
      existingRSVP.guestEmail = finalEmail;
      if (req.user && !existingRSVP.user) {
        existingRSVP.user = req.user.id;
      }
      if (ticketCode) {
        existingRSVP.ticketCode = ticketCode;
      }
      rsvp = await existingRSVP.save();
    } else {
      rsvp = await RSVP.create({
        event: eventId,
        user: req.user ? req.user.id : null,
        guestName: finalName,
        guestEmail: finalEmail,
        status: targetStatus,
        guestsCount: requestedCount,
        note,
        ticketCode: targetStatus === 'going' ? ticketCode : undefined,
      });
    }

    // If previously 'going' and now 'declined' or 'maybe', promote someone from waitlist
    if (previousStatus === 'going' && (targetStatus === 'declined' || targetStatus === 'maybe')) {
      await promoteWaitlistCandidate(eventId);
    }

    // Generate QR code and send confirmation email if going
    let qrDataUrl = null;
    if (targetStatus === 'going' && rsvp.ticketCode) {
      qrDataUrl = await QRCode.toDataURL(rsvp.ticketCode, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 256,
        color: {
          dark: '#312E81',
          light: '#FFFFFF',
        },
      });

      // Send confirmation email asynchronously with ICS attachment
      generateICS({ event })
        .then((icsContent) => {
          const emailHtml = rsvpConfirmationEmail({ event, rsvp, qrDataUrl });
          return sendMail({
            to: finalEmail,
            subject: `RSVP Confirmed: ${event.title}`,
            html: emailHtml,
            attachments: [
              {
                filename: `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`,
                content: icsContent,
                contentType: 'text/calendar',
              },
            ],
          });
        })
        .catch((err) => console.error('[RSVP Mailer Error]', err.message));
    }

    // Create in-app notification if user is authenticated
    if (req.user) {
      let notifTitle = 'RSVP Confirmed';
      let notifMsg = `You're confirmed for "${event.title}".`;
      if (targetStatus === 'waitlisted') {
        notifTitle = 'Added to Waitlist';
        notifMsg = `The event "${event.title}" is currently full. You have been added to the waitlist and will be notified automatically if a spot opens!`;
      }
      await Notification.create({
        user: req.user.id,
        title: notifTitle,
        message: notifMsg,
        type: 'rsvp',
        link: `/events/${event._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message:
        targetStatus === 'waitlisted'
          ? 'Event is currently full. You have been placed on the priority waitlist!'
          : `RSVP successfully updated to ${targetStatus}!`,
      data: {
        rsvp,
        qrDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendee RSVPs with tabs (upcoming, past, waitlisted)
// @route   GET /api/v1/rsvps/my
// @access  Private
exports.getMyRSVPs = async (req, res, next) => {
  try {
    const { tab = 'upcoming' } = req.query;

    const rsvps = await RSVP.find({
      $or: [{ user: req.user.id }, { guestEmail: req.user.email }],
    })
      .populate({
        path: 'event',
        populate: { path: 'category organizer', select: 'name email avatar' },
      })
      .sort({ createdAt: -1 });

    const now = new Date();
    const filtered = rsvps.filter((r) => {
      if (!r.event) return false;
      if (tab === 'waitlisted') {
        return r.status === 'waitlisted';
      }
      if (tab === 'past') {
        return new Date(r.event.endDate) < now;
      }
      // 'upcoming' by default
      return r.status === 'going' && new Date(r.event.endDate) >= now;
    });

    res.status(200).json({
      success: true,
      data: { rsvps: filtered },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all RSVPs for an event (Organizer / Admin)
// @route   GET /api/v1/rsvps/event/:eventId
// @access  Private (Organizer owner / Admin)
exports.getEventRSVPs = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { status, search } = req.query;
    const query = { event: req.params.eventId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ guestName: regex }, { guestEmail: regex }, { ticketCode: regex }];
    }

    const rsvps = await RSVP.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });

    const totalGoing = await RSVP.aggregate([
      { $match: { event: event._id, status: 'going' } },
      { $group: { _id: null, total: { $sum: '$guestsCount' } } },
    ]);

    const totalCheckedIn = await RSVP.countDocuments({
      event: event._id,
      checkedIn: true,
    });

    res.status(200).json({
      success: true,
      data: {
        rsvps,
        totalCount: rsvps.length,
        goingCount: totalGoing.length > 0 ? totalGoing[0].total : 0,
        checkedInCount: totalCheckedIn,
        capacity: event.capacity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export guest list to CSV
// @route   GET /api/v1/rsvps/event/:eventId/export
// @access  Private (Organizer owner / Admin)
exports.exportRSVPsCSV = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const rsvps = await RSVP.find({ event: req.params.eventId }).sort({ createdAt: 1 });

    let csv = 'Name,Email,Status,Guests Count,Ticket Code,Checked In,Checked In At,RSVP Date,Note\n';
    rsvps.forEach((r) => {
      const row = [
        `"${r.guestName.replace(/"/g, '""')}"`,
        `"${r.guestEmail.replace(/"/g, '""')}"`,
        r.status,
        r.guestsCount,
        r.ticketCode || 'N/A',
        r.checkedIn ? 'Yes' : 'No',
        r.checkedInAt ? new Date(r.checkedInAt).toISOString() : '',
        new Date(r.createdAt).toISOString(),
        `"${(r.note || '').replace(/"/g, '""')}"`,
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_guests.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Check in guest via QR ticket code or RSVP ID
// @route   POST /api/v1/rsvps/check-in
// @access  Private (Organizer owner / Admin)
exports.checkInGuest = async (req, res, next) => {
  try {
    const { eventId, ticketCode, rsvpId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to check in guests for this event' });
    }

    const query = { event: eventId };
    if (ticketCode) {
      query.ticketCode = ticketCode.trim().toUpperCase();
    } else if (rsvpId) {
      query._id = rsvpId;
    } else {
      return res.status(400).json({ success: false, message: 'Ticket code or RSVP ID required' });
    }

    const rsvp = await RSVP.findOne(query).populate('user', 'name email avatar');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'No matching RSVP found for this event with that ticket code.',
      });
    }

    if (rsvp.status !== 'going') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in attendee with status "${rsvp.status}". Only "going" RSVPs can be checked in.`,
      });
    }

    if (rsvp.checkedIn) {
      return res.status(400).json({
        success: false,
        alreadyCheckedIn: true,
        checkedInAt: rsvp.checkedInAt,
        message: `Guest already checked in at ${new Date(rsvp.checkedInAt).toLocaleTimeString()}!`,
        data: { rsvp },
      });
    }

    rsvp.checkedIn = true;
    rsvp.checkedInAt = new Date();
    await rsvp.save();

    res.status(200).json({
      success: true,
      message: `Successfully checked in ${rsvp.guestName}!`,
      data: { rsvp },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download ICS calendar file
// @route   GET /api/v1/rsvps/calendar/:eventId
// @access  Public
exports.downloadICS = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const icsString = await generateICS({ event });
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`);
    res.send(icsString);
  } catch (error) {
    next(error);
  }
};

// @desc    Manual Add Guest by Organizer
// @route   POST /api/v1/rsvps/event/:eventId/manual
// @access  Private (Organizer owner / Admin)
exports.manualAddGuest = async (req, res, next) => {
  try {
    const { guestName, guestEmail, status = 'going', guestsCount = 1, note = '' } = req.body;
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const ticketCode = generateTicketCode();
    const rsvp = await RSVP.create({
      event: event._id,
      guestName,
      guestEmail: guestEmail.toLowerCase(),
      status,
      guestsCount,
      note,
      ticketCode,
    });

    res.status(201).json({
      success: true,
      message: `Guest ${guestName} manually added!`,
      data: { rsvp },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove Guest by Organizer
// @route   DELETE /api/v1/rsvps/:id
// @access  Private (Organizer owner / Admin)
exports.removeGuest = async (req, res, next) => {
  try {
    const rsvp = await RSVP.findById(req.params.id).populate('event');
    if (!rsvp) {
      return res.status(404).json({ success: false, message: 'RSVP not found' });
    }

    const event = rsvp.event;
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const wasGoing = rsvp.status === 'going';
    await RSVP.findByIdAndDelete(req.params.id);

    if (wasGoing) {
      await promoteWaitlistCandidate(event._id);
    }

    res.status(200).json({
      success: true,
      message: 'Guest removed and waitlist checked for promotion.',
    });
  } catch (error) {
    next(error);
  }
};
