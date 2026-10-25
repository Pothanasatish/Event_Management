const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedEvents');
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, notificationPrefs } = req.body;
    const fieldsToUpdate = {};

    if (name) fieldsToUpdate.name = name;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;
    if (notificationPrefs) fieldsToUpdate.notificationPrefs = notificationPrefs;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/v1/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const user = await User.findById(req.user.id).select('+passwordHash');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save/bookmark event
// @route   POST /api/v1/users/saved-events/:eventId
// @access  Private
exports.toggleSaveEvent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.eventId;

    const index = user.savedEvents.indexOf(eventId);
    let saved = false;

    if (index > -1) {
      user.savedEvents.splice(index, 1);
      saved = false;
    } else {
      user.savedEvents.push(eventId);
      saved = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        saved,
        savedEvents: user.savedEvents,
      },
      message: saved ? 'Event saved to bookmarks' : 'Event removed from bookmarks',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user saved events
// @route   GET /api/v1/users/saved-events
// @access  Private
exports.getSavedEvents = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedEvents',
      populate: { path: 'category organizer', select: 'name email avatar' },
    });

    res.status(200).json({
      success: true,
      data: {
        events: user.savedEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};
