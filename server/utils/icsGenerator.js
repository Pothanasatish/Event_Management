const ics = require('ics');

const generateICS = ({ event }) => {
  return new Promise((resolve, reject) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate || new Date(start.getTime() + 2 * 60 * 60 * 1000));

    const eventAttributes = {
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ],
      end: [
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
        end.getHours(),
        end.getMinutes(),
      ],
      title: event.title,
      description: event.description || '',
      location:
        event.locationType === 'online'
          ? event.onlineLink || 'Online Event'
          : `${event.venue.name || ''}, ${event.venue.address || ''}, ${event.venue.city || ''}`.trim(),
      url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/events/${event._id}`,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'EventHub Organizer', email: 'noreply@eventhub.io' },
    };

    ics.createEvent(eventAttributes, (error, value) => {
      if (error) {
        return reject(error);
      }
      resolve(value);
    });
  });
};

module.exports = { generateICS };
