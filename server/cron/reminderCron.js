const cron = require('node-cron');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const { eventReminderEmail } = require('../utils/emailTemplates');
const { sendMail } = require('../config/mailer');

const initReminderCron = () => {
  // Run once every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running 24-hour event reminder check...');
    try {
      const now = new Date();
      const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      // Find published events starting in roughly 24 hours
      const upcomingEvents = await Event.find({
        status: 'published',
        startDate: { $gte: in23Hours, $lte: in25Hours },
      });

      for (const event of upcomingEvents) {
        const goingRSVPs = await RSVP.find({
          event: event._id,
          status: 'going',
        });

        for (const rsvp of goingRSVPs) {
          const emailHtml = eventReminderEmail({ event, rsvp });
          sendMail({
            to: rsvp.guestEmail,
            subject: `Reminder: ${event.title} is tomorrow!`,
            html: emailHtml,
          });
        }
        console.log(`[Cron] Sent 24h reminders for "${event.title}" to ${goingRSVPs.length} attendees.`);
      }
    } catch (err) {
      console.error('[Cron Error]', err.message);
    }
  });
};

module.exports = initReminderCron;
