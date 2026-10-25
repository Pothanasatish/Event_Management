import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Share2,
  Bookmark,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Copy,
  ExternalLink,
  MessageSquare,
  Send,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, Avatar, Card, Skeleton } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';
import { TicketModal } from '../components/shared/TicketModal';
import { EventCard } from '../components/shared/EventCard';
import { eventService } from '../services/eventService';
import { rsvpService } from '../services/rsvpService';
import { userService } from '../services/userService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);

  // RSVP Form State
  const [rsvpStatus, setRsvpStatus] = useState('going');
  const [guestsCount, setGuestsCount] = useState(1);
  const [note, setNote] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submittingRSVP, setSubmittingRSVP] = useState(false);

  // Modals
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [activeRSVP, setActiveRSVP] = useState(null);
  const [isNewRSVP, setIsNewRSVP] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const eventData = await eventService.getEventById(id);
      setEvent(eventData);

      if (eventData.userRSVP) {
        setActiveRSVP(eventData.userRSVP);
        setRsvpStatus(eventData.userRSVP.status);
        setGuestsCount(eventData.userRSVP.guestsCount || 1);
        setNote(eventData.userRSVP.note || '');
      }

      const [related, commentData] = await Promise.all([
        eventService.getRelatedEvents(eventData._id).catch(() => []),
        api.get(`/comments/${eventData._id}`).then((r) => r.data.data.comments).catch(() => []),
      ]);

      setRelatedEvents(related || []);
      setComments(commentData || []);
    } catch (err) {
      console.error('Error fetching event details:', err);
      toast.error('Event not found or failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  // Countdown effect
  useEffect(() => {
    if (!event?.startDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(event.startDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [event?.startDate]);

  // Submit RSVP
  const handleRSVPSubmit = async (statusOverride) => {
    const statusToUse = statusOverride || rsvpStatus;

    if (!isAuthenticated && (!guestName || !guestEmail)) {
      toast.error('Please enter your name and email to RSVP');
      return;
    }

    try {
      setSubmittingRSVP(true);
      const res = await rsvpService.submitRSVP({
        eventId: event._id,
        status: statusToUse,
        guestsCount,
        note,
        guestName: !isAuthenticated ? guestName : undefined,
        guestEmail: !isAuthenticated ? guestEmail : undefined,
      });

      setActiveRSVP(res.data.rsvp);
      toast.success(res.message);

      if (statusToUse === 'going') {
        setIsNewRSVP(true);
        setTicketModalOpen(true);
      }

      // Refresh event occupancy stats
      fetchEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit RSVP');
    } finally {
      setSubmittingRSVP(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to join the discussion');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.post(`/comments/${event._id}`, { content: newComment });
      setComments([res.data.data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Could not delete comment');
    }
  };

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleGoogleCalendar = () => {
    if (!event) return;
    const startIso = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(event.endDate || event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(
      event.locationType === 'online' ? event.onlineLink || 'Online' : `${event.venue?.name}, ${event.venue?.city}`
    );
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Skeleton className="w-full h-80 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <Link to="/events">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  const capacity = event.capacity || 100;
  const attendeesCount = event.attendeesCount || 0;
  const spotsRemaining = Math.max(0, capacity - attendeesCount);
  const percentFilled = Math.min(100, Math.round((attendeesCount / capacity) * 100));
  const isFull = event.isFull || spotsRemaining <= 0;
  const eventHasEnded = isPast(new Date(event.endDate));

  const tabOptions = [
    { id: 'about', label: 'About' },
    { id: 'agenda', label: 'Agenda & Speakers', count: event.agenda?.length || 0 },
    { id: 'attendees', label: 'Attendees', count: attendeesCount },
    { id: 'discussion', label: 'Discussion', count: comments.length },
    { id: 'location', label: 'Location' },
  ];

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Hero Cover Header */}
      <div className="relative w-full h-72 sm:h-96 lg:h-[450px] bg-slate-900 overflow-hidden">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover opacity-80"
          crossOrigin="anonymous"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {event.category && (
              <Badge variant="indigo" size="md" className="font-semibold shadow-sm">
                {event.category.name}
              </Badge>
            )}
            <Badge
              variant={event.price === 0 ? 'emerald' : 'purple'}
              size="md"
              className="font-bold uppercase tracking-wider"
            >
              {event.price === 0 ? 'Free Admission' : `$${event.price}`}
            </Badge>
            {event.status === 'cancelled' && (
              <Badge variant="rose" size="md" className="font-bold uppercase">
                Cancelled
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight max-w-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>{format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>
                {format(new Date(event.startDate), 'h:mm a')} –{' '}
                {format(new Date(event.endDate), 'h:mm a')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {event.locationType === 'online' ? (
                <>
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Online Event</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>
                    {event.venue?.name}, {event.venue?.city}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Body Grid: Content Tabs (Left) + Sticky RSVP Card (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details & Tabs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Action Bar (Share, Calendar, Bookmark) */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
              {/* Organizer Chip */}
              <div className="flex items-center gap-3">
                <Avatar
                  src={event.organizer?.avatar}
                  name={event.organizer?.name}
                  size="md"
                />
                <div>
                  <p className="text-xs text-slate-400">Organized by</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {event.organizer?.name}
                  </p>
                </div>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Share2}
                  onClick={() => setShareModalOpen(true)}
                >
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Calendar}
                  onClick={handleGoogleCalendar}
                >
                  Google Calendar
                </Button>
                <a
                  href={rsvpService.getCalendarICSUrl(event._id)}
                  download
                >
                  <Button variant="outline" size="sm" icon={Download}>
                    .ICS
                  </Button>
                </a>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs
              tabs={tabOptions}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* Tab 1: About */}
            {activeTab === 'about' && (
              <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
                <div>
                  <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-3">
                    About this event
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Event Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Agenda & Schedule */}
            {activeTab === 'agenda' && (
              <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                  Schedule & Speakers
                </h3>
                {event.agenda && event.agenda.length > 0 ? (
                  <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-500/30">
                    {event.agenda.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-500" />
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                            {item.time}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          {item.speaker && (
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                              Speaker: {item.speaker}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    No specific agenda sessions posted yet for this event.
                  </p>
                )}
              </div>
            )}

            {/* Tab 3: Attendees Avatar Stack & List */}
            {activeTab === 'attendees' && (
              <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                    Confirmed Attendees
                  </h3>
                  <Badge variant="indigo" size="md">
                    {attendeesCount} Going
                  </Badge>
                </div>

                <div className="flex -space-x-3 overflow-hidden py-3">
                  {event.attendeeAvatars?.map((att, idx) => (
                    <Avatar
                      key={idx}
                      src={att.avatar}
                      name={att.name}
                      size="lg"
                      className="ring-2 ring-white dark:ring-slate-900"
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Join fellow builders, founders, and professionals already confirmed for this event.
                </p>
              </div>
            )}

            {/* Tab 4: Discussion & Comments */}
            {activeTab === 'discussion' && (
              <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                  Event Discussion
                </h3>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <Textarea
                    placeholder={
                      isAuthenticated
                        ? 'Ask a question or share a thought with the organizer & attendees...'
                        : 'Please sign in to join the discussion.'
                    }
                    disabled={!isAuthenticated}
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      icon={Send}
                      disabled={!isAuthenticated || !newComment.trim()}
                      isLoading={submittingComment}
                    >
                      Post Comment
                    </Button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No comments yet. Be the first to start the conversation!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={comment.user?.avatar}
                              name={comment.user?.name}
                              size="sm"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {comment.user?.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                          {(user?.role === 'admin' || user?._id === comment.user?._id) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              aria-label="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 5: Location Map */}
            {activeTab === 'location' && (
              <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                  Venue & Location
                </h3>
                {event.locationType === 'online' ? (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Virtual Online Event
                    </p>
                    <p className="text-xs text-slate-500">
                      The live streaming link will be accessible on your digital ticket and sent via email reminder 24 hours before start.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {event.venue?.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {event.venue?.address}, {event.venue?.city}
                      </p>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(
                          `${event.venue?.name} ${event.venue?.address} ${event.venue?.city}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-2"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sticky RSVP Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft-lg p-6 sm:p-8 space-y-6">
                {/* Countdown Timer */}
                {!eventHasEnded ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/40 dark:to-purple-950/40 border border-brand-200 dark:border-brand-800/60 text-center space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      Event Starts In:
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <span className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                          {timeLeft.days}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Days</span>
                      </div>
                      <div>
                        <span className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                          {timeLeft.hours}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Hours</span>
                      </div>
                      <div>
                        <span className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                          {timeLeft.minutes}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Mins</span>
                      </div>
                      <div>
                        <span className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                          {timeLeft.seconds}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Secs</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs text-slate-500 font-semibold">
                    This event has concluded.
                  </div>
                )}

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>
                      {isFull ? (
                        <span className="text-amber-500 font-bold">
                          At Capacity (Waitlist Open)
                        </span>
                      ) : (
                        `${spotsRemaining} spots left`
                      )}
                    </span>
                    <span>{percentFilled}% filled</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull
                          ? 'bg-amber-500'
                          : percentFilled > 80
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-r from-brand-500 to-purple-500'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                {/* Current RSVP badge if already responded */}
                {activeRSVP && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Your Status:</span>
                      <Badge
                        variant={activeRSVP.status === 'going' ? 'emerald' : activeRSVP.status === 'waitlisted' ? 'purple' : 'amber'}
                        size="sm"
                        className="capitalize"
                      >
                        {activeRSVP.status}
                      </Badge>
                    </div>

                    {activeRSVP.status === 'going' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setIsNewRSVP(false);
                          setTicketModalOpen(true);
                        }}
                      >
                        View Ticket & QR Code
                      </Button>
                    )}
                  </div>
                )}

                {/* RSVP Form Buttons */}
                {!eventHasEnded && event.status === 'published' && (
                  <div className="space-y-4">
                    {/* Unauthenticated guest inputs */}
                    {!isAuthenticated && (
                      <div className="space-y-3 pt-2">
                        <Input
                          label="Your Name"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Jordan Lee"
                        />
                        <Input
                          label="Your Email"
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                    )}

                    {/* Guests count */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Number of Attendees (+1s)
                      </label>
                      <Select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(parseInt(e.target.value, 10))}
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Person (Just me)' : `People (+${num - 1} guests)`}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Note / Dietary */}
                    <Input
                      label="Dietary / Note (Optional)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Vegetarian, wheelchair access"
                    />

                    {/* Main RSVP Action Buttons */}
                    <div className="space-y-2 pt-2">
                      {isFull ? (
                        <Button
                          variant="amber"
                          size="lg"
                          className="w-full"
                          isLoading={submittingRSVP}
                          onClick={() => handleRSVPSubmit('going')}
                        >
                          Join Priority Waitlist
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full"
                          isLoading={submittingRSVP}
                          onClick={() => handleRSVPSubmit('going')}
                        >
                          RSVP: Going 🎉
                        </Button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={submittingRSVP}
                          onClick={() => handleRSVPSubmit('maybe')}
                        >
                          Maybe
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={submittingRSVP}
                          onClick={() => handleRSVPSubmit('declined')}
                        >
                          Can't Go
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Related Events Section */}
        {relatedEvents.length > 0 && (
          <div className="pt-16 space-y-6">
            <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Related Events in this Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((rel) => (
                <EventCard key={rel._id} event={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {activeRSVP && (
        <TicketModal
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          rsvp={activeRSVP}
          event={event}
          isNew={isNewRSVP}
        />
      )}

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share this event"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Share this event link with friends, colleagues, or on social media:
          </p>
          <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 flex-1 truncate focus:outline-none"
            />
            <Button size="sm" icon={Copy} onClick={handleShareCopy}>
              Copy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
