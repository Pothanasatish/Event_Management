import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Globe, Bookmark, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge, Avatar } from '../ui/Badge';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const EventCard = ({
  event,
  viewMode = 'grid',
  onBookmarkToggle,
  isBookmarked: initialBookmarked = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [bookmarked, setBookmarked] = useState(
    initialBookmarked || (event.userRSVP ? true : false)
  );
  const [bookmarking, setBookmarking] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save events to your bookmarks');
      return;
    }

    try {
      setBookmarking(true);
      const res = await userService.toggleSaveEvent(event._id);
      setBookmarked(res.saved);
      toast.success(res.saved ? 'Event saved!' : 'Event removed from bookmarks');
      if (onBookmarkToggle) onBookmarkToggle(event._id, res.saved);
    } catch (err) {
      toast.error('Could not update bookmark');
    } finally {
      setBookmarking(false);
    }
  };

  const formattedDate = event.startDate
    ? format(new Date(event.startDate), 'EEE, MMM d • h:mm a')
    : '';

  const attendeesCount = event.attendeesCount || 0;
  const capacity = event.capacity || 100;
  const percentFilled = Math.min(100, Math.round((attendeesCount / capacity) * 100));
  const isFull = percentFilled >= 100;

  // Grid View Mode
  if (viewMode === 'grid') {
    return (
      <Link
        to={`/events/${event.slug || event._id}`}
        className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-300"
      >
        {/* Cover Image Container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top Chips */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
            {event.category && (
              <Badge variant="indigo" size="sm" className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-sm font-semibold">
                {event.category.name}
              </Badge>
            )}
            <button
              onClick={handleBookmark}
              disabled={bookmarking}
              className={`p-2 rounded-full backdrop-blur-md transition-transform duration-200 active:scale-90 ${
                bookmarked
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              aria-label="Save event"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md">
              {event.price === 0 ? 'Free' : `$${event.price}`}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            {/* Date */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>

            {/* Title */}
            <h3 className="font-bold font-heading text-slate-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
              {event.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              {event.locationType === 'online' ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Online Event</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">
                    {event.venue?.name || event.venue?.city || 'Location Announced'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Footer stats: Capacity bar & Organizer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
            {/* Capacity Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                <span>
                  {isFull ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      Waitlist Open
                    </span>
                  ) : (
                    `${capacity - attendeesCount} spots left`
                  )}
                </span>
                <span>{percentFilled}% filled</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

            {/* Organizer Avatar */}
            {event.organizer && (
              <div className="flex items-center gap-2 pt-1">
                <Avatar
                  src={event.organizer.avatar}
                  name={event.organizer.name}
                  size="xs"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  By <strong className="font-semibold text-slate-800 dark:text-slate-200">{event.organizer.name}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // List View Mode
  return (
    <Link
      to={`/events/${event.slug || event._id}`}
      className="group flex flex-col sm:flex-row bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-300"
    >
      <div className="relative w-full sm:w-64 aspect-[16/9] sm:aspect-auto overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="indigo" size="sm" className="bg-white/90 dark:bg-slate-900/90 shadow-sm">
            {event.category?.name}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              {formattedDate}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {event.price === 0 ? 'Free' : `$${event.price}`}
            </span>
          </div>

          <h3 className="font-bold font-heading text-slate-900 dark:text-white text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {event.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            {event.locationType === 'online' ? (
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>{event.locationType === 'online' ? 'Online' : event.venue?.city}</span>
          </div>
          <div className="font-medium">
            {isFull ? (
              <span className="text-amber-500 font-bold">Waitlist Open</span>
            ) : (
              `${capacity - attendeesCount} spots left`
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
