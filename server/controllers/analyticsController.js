const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');

// @desc    Get organizer dashboard analytics
// @route   GET /api/v1/analytics/organizer
// @access  Private (Organizer / Admin)
exports.getOrganizerAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const now = new Date();

    // 1. All events created by organizer
    const events = await Event.find({ organizer: organizerId });
    const eventIds = events.map((e) => e._id);

    const totalEvents = events.length;
    const upcomingEvents = events.filter((e) => new Date(e.endDate) >= now && e.status === 'published').length;
    const pastEvents = events.filter((e) => new Date(e.endDate) < now).length;
    const draftEvents = events.filter((e) => e.status === 'draft').length;

    // 2. RSVPs for organizer's events
    const allRSVPs = await RSVP.find({ event: { $in: eventIds } });
    const totalRSVPs = allRSVPs.length;
    const goingRSVPs = allRSVPs.filter((r) => r.status === 'going');
    const checkedInRSVPs = allRSVPs.filter((r) => r.checkedIn);
    const waitlistedRSVPs = allRSVPs.filter((r) => r.status === 'waitlisted');
    const maybeRSVPs = allRSVPs.filter((r) => r.status === 'maybe');
    const declinedRSVPs = allRSVPs.filter((r) => r.status === 'declined');

    const checkInRate = goingRSVPs.length > 0
      ? Math.round((checkedInRSVPs.length / goingRSVPs.length) * 100)
      : 0;

    // 3. Status breakdown for donut chart
    const statusBreakdown = [
      { name: 'Going', value: goingRSVPs.length, color: '#10B981' },
      { name: 'Maybe', value: maybeRSVPs.length, color: '#F59E0B' },
      { name: 'Waitlisted', value: waitlistedRSVPs.length, color: '#8B5CF6' },
      { name: 'Declined', value: declinedRSVPs.length, color: '#EF4444' },
    ];

    // 4. RSVPs over the last 7 days for line chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dateMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateKey = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateMap[dateKey] = 0;
    }

    allRSVPs.forEach((r) => {
      const rsvpDate = new Date(r.createdAt);
      if (rsvpDate >= sevenDaysAgo) {
        const key = rsvpDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dateMap[key] !== undefined) {
          dateMap[key] += 1;
        }
      }
    });

    const rsvpsOverTime = Object.keys(dateMap).map((date) => ({
      date,
      rsvps: dateMap[date],
    }));

    // 5. Recent activity feed (latest RSVPs)
    const recentActivity = await RSVP.find({ event: { $in: eventIds } })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('event', 'title')
      .populate('user', 'name avatar');

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalEvents,
          totalRSVPs,
          upcomingEvents,
          checkInRate,
          pastEvents,
          draftEvents,
          totalCheckedIn: checkedInRSVPs.length,
        },
        statusBreakdown,
        rsvpsOverTime,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin platform analytics
// @route   GET /api/v1/analytics/admin
// @access  Private (Admin only)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const organizersCount = await User.countDocuments({ role: 'organizer' });
    const attendeesCount = await User.countDocuments({ role: 'attendee' });
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const draftEvents = await Event.countDocuments({ status: 'draft' });
    const cancelledEvents = await Event.countDocuments({ status: 'cancelled' });
    const totalRSVPs = await RSVP.countDocuments();
    const totalCheckedIn = await RSVP.countDocuments({ checkedIn: true });

    // Latest user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('name email role createdAt isActive avatar');

    // Recent events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('organizer', 'name email')
      .populate('category', 'name color');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          organizersCount,
          attendeesCount,
          totalEvents,
          publishedEvents,
          draftEvents,
          cancelledEvents,
          totalRSVPs,
          totalCheckedIn,
        },
        recentUsers,
        recentEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};
