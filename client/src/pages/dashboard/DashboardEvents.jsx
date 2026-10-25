import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  PlusCircle,
  Search,
  MoreVertical,
  Edit2,
  Copy,
  Ban,
  Trash2,
  Eye,
  Grid,
  List,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge, EmptyState } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/Tabs';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const DashboardEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialogs
  const [cancelDialogEvent, setCancelDialogEvent] = useState(null);
  const [deleteDialogEvent, setDeleteDialogEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents({
        organizer: user?._id,
        status: 'all',
        limit: 50,
      });
      setEvents(res.events || []);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Duplicate Event
  const handleDuplicate = async (eventId) => {
    try {
      toast.loading('Duplicating event as draft...');
      await eventService.duplicateEvent(eventId);
      toast.dismiss();
      toast.success('Event duplicated as a new draft!');
      fetchEvents();
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to duplicate event');
    }
  };

  // Cancel Event
  const handleCancelConfirm = async () => {
    if (!cancelDialogEvent) return;
    try {
      setActionLoading(true);
      await eventService.cancelEvent(cancelDialogEvent._id);
      toast.success('Event cancelled. Attendees have been notified.');
      setCancelDialogEvent(null);
      fetchEvents();
    } catch {
      toast.error('Could not cancel event');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Event
  const handleDeleteConfirm = async () => {
    if (!deleteDialogEvent) return;
    try {
      setActionLoading(true);
      await eventService.deleteEvent(deleteDialogEvent._id);
      toast.success('Event deleted successfully');
      setDeleteDialogEvent(null);
      fetchEvents();
    } catch {
      toast.error('Could not delete event');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.venue?.name && ev.venue.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            My Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your published events, drafts, and past gatherings.
          </p>
        </div>
        <Link to="/dashboard/events/new">
          <Button icon={PlusCircle}>Create New Event</Button>
        </Link>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 py-2 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600' : 'text-slate-400'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600' : 'text-slate-400'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events Table / Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="You don't have any events matching your search or filters."
          actionText="Create an Event"
          onAction={() => (window.location.href = '/dashboard/events/new')}
        />
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Event</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">RSVPs / Capacity</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredEvents.map((ev) => (
                <tr key={ev._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={ev.coverImage}
                        alt={ev.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <Link
                          to={`/events/${ev.slug || ev._id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-brand-600 transition-colors line-clamp-1"
                        >
                          {ev.title}
                        </Link>
                        <span className="text-[11px] text-slate-400">
                          {ev.locationType === 'online' ? 'Online' : ev.venue?.city || 'Physical Venue'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                    {format(new Date(ev.startDate), 'MMM d, yyyy • h:mm a')}
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={
                        ev.status === 'published'
                          ? 'emerald'
                          : ev.status === 'draft'
                          ? 'slate'
                          : 'rose'
                      }
                      size="sm"
                      className="capitalize"
                    >
                      {ev.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                    <strong>{ev.attendeesCount || 0}</strong> / {ev.capacity} spots
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/events/${ev.slug || ev._id}`}>
                        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" title="View Public Page">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link to={`/dashboard/events/${ev._id}/edit`}>
                        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit Event">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDuplicate(ev._id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Duplicate Event"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {ev.status === 'published' && (
                        <button
                          onClick={() => setCancelDialogEvent(ev)}
                          className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          title="Cancel Event"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteDialogEvent(ev)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <div
              key={ev._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      ev.status === 'published'
                        ? 'emerald'
                        : ev.status === 'draft'
                        ? 'slate'
                        : 'rose'
                    }
                    size="sm"
                    className="capitalize"
                  >
                    {ev.status}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {ev.attendeesCount || 0} / {ev.capacity} spots
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                  {ev.title}
                </h4>
                <p className="text-xs text-slate-500">
                  {format(new Date(ev.startDate), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link to={`/dashboard/events/${ev._id}/edit`}>
                  <Button variant="outline" size="sm" icon={Edit2}>
                    Edit
                  </Button>
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(ev._id)}
                    className="p-2 text-slate-400 hover:text-slate-600"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteDialogEvent(ev)}
                    className="p-2 text-rose-500 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Event Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelDialogEvent}
        onClose={() => setCancelDialogEvent(null)}
        onConfirm={handleCancelConfirm}
        title={`Cancel "${cancelDialogEvent?.title}"?`}
        message="Cancelling this event will immediately email all confirmed and waitlisted attendees informing them that the event has been called off."
        confirmText="Yes, Cancel Event"
        cancelText="Keep Event"
        isDestructive={true}
        isLoading={actionLoading}
      />

      {/* Delete Event Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDialogEvent}
        onClose={() => setDeleteDialogEvent(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteDialogEvent?.title}"?`}
        message="Are you sure you want to permanently delete this event and its RSVP records? This action cannot be reversed."
        confirmText="Delete Permanently"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
};
