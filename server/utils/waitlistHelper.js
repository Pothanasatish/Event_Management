const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { waitlistPromotionEmail } = require('./emailTemplates');
const { sendMail } = require('../config/mailer');

/**
 * Calculates current "going" attendees count for an event
 */
const getEventOccupancy = async (eventId) => {
  const result = await RSVP.aggregate([
    { $match: { event: eventId, status: 'going' } },
    { $group: { _id: null, total: { $sum: '$guestsCount' } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

/**
 * Check if event has remaining spots for requested guestsCount
 */
const hasAvailableSpots = async (eventId, requestedGuests = 1) => {
  const event = await Event.findById(eventId);
  if (!event) return false;
  const currentOccupancy = await getEventOccupancy(eventId);
  return (currentOccupancy + requestedGuests) <= event.capacity;
};

/**
 * Promotes the next waitlisted RSVP if spots become available
 */
const promoteWaitlistCandidate = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event || event.status !== 'published') return null;

  const currentOccupancy = await getEventOccupancy(eventId);
  const spotsAvailable = event.capacity - currentOccupancy;

  if (spotsAvailable <= 0) return null;

  // Find the earliest waitlisted RSVP that fits in the available spots
  const candidates = await RSVP.find({
    event: eventId,
    status: 'waitlisted',
  }).sort({ createdAt: 1 });

  for (const candidate of candidates) {
    if (candidate.guestsCount <= spotsAvailable) {
      candidate.status = 'going';
      if (!candidate.ticketCode) {
        candidate.ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      }
      await candidate.save();

      // Create in-app notification if user is registered
      if (candidate.user) {
        await Notification.create({
          user: candidate.user,
          title: 'Waitlist Promotion 🎉',
          message: `Great news! You have been promoted from the waitlist for "${event.title}". Your ticket is now ready!`,
          type: 'waitlist_promoted',
          link: `/events/${event._id}`,
        });
      }

      // Send email notification
      const emailHtml = waitlistPromotionEmail({ event, rsvp: candidate });
      sendMail({
        to: candidate.guestEmail,
        subject: `You're off the waitlist for ${event.title}!`,
        html: emailHtml,
      });

      console.log(`[Waitlist] Promoted ${candidate.guestEmail} for event ${event.title}`);
      return candidate;
    }
  }

  return null;
};

module.exports = {
  getEventOccupancy,
  hasAvailableSpots,
  promoteWaitlistCandidate,
};
