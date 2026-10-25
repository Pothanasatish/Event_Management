const Comment = require('../models/Comment');
const Event = require('../models/Event');

// @desc    Get comments for an event
// @route   GET /api/v1/comments/:eventId
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ event: req.params.eventId })
      .populate('user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { comments },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to event discussion
// @route   POST /api/v1/comments/:eventId
// @access  Private (Logged in user)
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const comment = await Comment.create({
      event: event._id,
      user: req.user.id,
      content: content.trim(),
    });

    const populated = await Comment.findById(comment._id).populate('user', 'name avatar role');

    res.status(201).json({
      success: true,
      message: 'Comment posted',
      data: { comment: populated },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted',
    });
  } catch (error) {
    next(error);
  }
};
