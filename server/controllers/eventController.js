const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const Notification = require('../models/Notification');
const { getEventOccupancy } = require('../utils/waitlistHelper');
const { eventCancelledEmail } = require('../utils/emailTemplates');
const { sendMail } = require('../config/mailer');

// Helper to attach occupancy and spots left to event objects
const attachEventStats = async (events, userId = null) => {
  const eventIds = events.map((e) => e._id);
  const occupancyData = await RSVP.aggregate([
    { $match: { event: { $in: eventIds }, status: 'going' } },
    { $group: { _id: '$event', totalAttendees: { $sum: '$guestsCount' } } },
  ]);

  const occupancyMap = {};
  occupancyData.forEach((item) => {
    occupancyMap[item._id.toString()] = item.totalAttendees;
  });

  let userRsvpMap = {};
  if (userId) {
    const userRsvps = await RSVP.find({
      event: { $in: eventIds },
      user: userId,
    });
    userRsvps.forEach((r) => {
      userRsvpMap[r.event.toString()] = r;
    });
  }

  return events.map((event) => {
    const plain = event.toObject();
    const goingCount = occupancyMap[event._id.toString()] || 0;
    plain.attendeesCount = goingCount;
    plain.spotsRemaining = Math.max(0, event.capacity - goingCount);
    plain.isFull = goingCount >= event.capacity;
    if (userId) {
      plain.userRSVP = userRsvpMap[event._id.toString()] || null;
    }
    return plain;
  });
};

// @desc    Get all events with search, filters, sorting & pagination
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      dateRange,
      startDate,
      endDate,
      price,
      locationType,
      sort = 'soonest',
      page = 1,
      limit = 9,
      status = 'published',
      organizer,
    } = req.query;

    const query = {};

    // Filter by status (organizer/admin can see drafts; public only published)
    if (status && status !== 'all') {
      query.status = status;
    }

    if (organizer) {
      query.organizer = organizer;
    }

    // Keyword search across title, description, tags, venue
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { tags: regex },
        { 'venue.name': regex },
        { 'venue.city': regex },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Price filter
    if (price === 'free') {
      query.price = 0;
    } else if (price === 'paid') {
      query.price = { $gt: 0 };
    }

    // Location type filter
    if (locationType && locationType !== 'all') {
      query.locationType = locationType;
    }

    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      query.startDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (dateRange === 'this_week') {
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      query.startDate = { $gte: startOfWeek, $lte: endOfWeek };
    } else if (dateRange === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      query.startDate = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (dateRange === 'past') {
      query.endDate = { $lt: new Date() };
    } else if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    } else if (!status || status === 'published') {
      // By default for explore, show upcoming events unless specified
      if (!query.startDate && dateRange !== 'all') {
        query.endDate = { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) };
      }
    }

    // Sorting
    let sortOptions = { startDate: 1 }; // Soonest
    if (sort === 'popular') {
      sortOptions = { isFeatured: -1, capacity: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'price_low') {
      sortOptions = { price: 1, startDate: 1 };
    } else if (sort === 'price_high') {
      sortOptions = { price: -1, startDate: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('category', 'name slug icon color')
      .populate('organizer', 'name email avatar bio')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const eventsWithStats = await attachEventStats(
      events,
      req.user ? req.user.id : null
    );

    res.status(200).json({
      success: true,
      data: {
        events: eventsWithStats,
        pagination: {
          total: totalEvents,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalEvents / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured events
// @route   GET /api/v1/events/featured
// @access  Public
exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      status: 'published',
      endDate: { $gte: new Date() },
    })
      .sort({ isFeatured: -1, startDate: 1 })
      .limit(6)
      .populate('category', 'name slug icon color')
      .populate('organizer', 'name email avatar');

    const eventsWithStats = await attachEventStats(
      events,
      req.user ? req.user.id : null
    );

    res.status(200).json({
      success: true,
      data: { events: eventsWithStats },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID or Slug
// @route   GET /api/v1/events/:idOrSlug
// @access  Public
exports.getEventById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let event;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(idOrSlug)
        .populate('category', 'name slug icon color')
        .populate('organizer', 'name email avatar bio');
    } else {
      event = await Event.findOne({ slug: idOrSlug })
        .populate('category', 'name slug icon color')
        .populate('organizer', 'name email avatar bio');
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const currentOccupancy = await getEventOccupancy(event._id);
    const spotsRemaining = Math.max(0, event.capacity - currentOccupancy);

    let userRSVP = null;
    if (req.user) {
      userRSVP = await RSVP.findOne({
        event: event._id,
        user: req.user.id,
      });
    }

    // Attendees avatar preview (up to 8 avatars of going attendees)
    const attendeeRSVPs = await RSVP.find({
      event: event._id,
      status: 'going',
    })
      .limit(8)
      .populate('user', 'name avatar');

    const attendeeAvatars = attendeeRSVPs.map((r) => ({
      name: r.user ? r.user.name : r.guestName,
      avatar: r.user ? r.user.avatar : null,
    }));

    const plainEvent = event.toObject();
    plainEvent.attendeesCount = currentOccupancy;
    plainEvent.spotsRemaining = spotsRemaining;
    plainEvent.isFull = currentOccupancy >= event.capacity;
    plainEvent.userRSVP = userRSVP;
    plainEvent.attendeeAvatars = attendeeAvatars;

    res.status(200).json({
      success: true,
      data: { event: plainEvent },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related events in same category
// @route   GET /api/v1/events/:id/related
// @access  Public
exports.getRelatedEvents = async (req, res, next) => {
  try {
    const currentEvent = await Event.findById(req.params.id);
    if (!currentEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const related = await Event.find({
      _id: { $ne: currentEvent._id },
      category: currentEvent.category,
      status: 'published',
      endDate: { $gte: new Date() },
    })
      .limit(3)
      .populate('category', 'name slug icon color')
      .populate('organizer', 'name avatar');

    const stats = await attachEventStats(related, req.user ? req.user.id : null);

    res.status(200).json({
      success: true,
      data: { events: stats },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private (Organizer / Admin)
exports.createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user.id,
    };

    if (req.file) {
      eventData.coverImage = `/uploads/${req.file.filename}`;
    }

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private (Organizer owner / Admin)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Ensure user is organizer owner or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this event',
      });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel event (notifies attendees)
// @route   PUT /api/v1/events/:id/cancel
// @access  Private (Organizer owner / Admin)
exports.cancelEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this event',
      });
    }

    event.status = 'cancelled';
    await event.save();

    // Notify all RSVPs (going and waitlisted)
    const rsvps = await RSVP.find({
      event: event._id,
      status: { $in: ['going', 'waitlisted'] },
    });

    for (const rsvp of rsvps) {
      if (rsvp.user) {
        await Notification.create({
          user: rsvp.user,
          title: `Event Cancelled: ${event.title}`,
          message: `The event "${event.title}" has been cancelled by the organizer.`,
          type: 'cancellation',
          link: `/events/${event._id}`,
        });
      }

      const emailHtml = eventCancelledEmail({ event, rsvp });
      sendMail({
        to: rsvp.guestEmail,
        subject: `Event Cancelled: ${event.title}`,
        html: emailHtml,
      });
    }

    res.status(200).json({
      success: true,
      message: `Event cancelled successfully. Notified ${rsvps.length} attendees.`,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate event
// @route   POST /api/v1/events/:id/duplicate
// @access  Private (Organizer owner / Admin)
exports.duplicateEvent = async (req, res, next) => {
  try {
    const existing = await Event.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (existing.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to duplicate this event',
      });
    }

    const plain = existing.toObject();
    delete plain._id;
    delete plain.slug;
    delete plain.createdAt;
    delete plain.updatedAt;

    plain.title = `${plain.title} (Copy)`;
    plain.status = 'draft';
    plain.organizer = req.user.id;

    // Shift dates forward by 7 days
    const duration = new Date(plain.endDate).getTime() - new Date(plain.startDate).getTime();
    const newStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    plain.startDate = newStart;
    plain.endDate = new Date(newStart.getTime() + duration);

    const duplicatedEvent = await Event.create(plain);

    res.status(201).json({
      success: true,
      message: 'Event duplicated as draft',
      data: { event: duplicatedEvent },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private (Organizer owner / Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event',
      });
    }

    await Event.findByIdAndDelete(req.params.id);
    await RSVP.deleteMany({ event: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Event and associated RSVPs deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
