const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    guestEmail: {
      type: String,
      required: [true, 'Guest email is required'],
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'declined', 'waitlisted'],
      required: true,
      default: 'going',
    },
    guestsCount: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 attendee'],
      max: [10, 'Maximum 10 attendees per RSVP'],
    },
    note: {
      type: String,
      default: '',
    },
    ticketCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound indexes
rsvpSchema.index(
  { event: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

rsvpSchema.index(
  { event: 1, guestEmail: 1 },
  { unique: true, partialFilterExpression: { user: null } }
);

module.exports = mongoose.model('RSVP', rsvpSchema);
