import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  Plus,
  Mail,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  Send,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge, Avatar, Card, EmptyState } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { eventService } from '../../services/eventService';
import { rsvpService } from '../../services/rsvpService';
import { inviteService } from '../../services/inviteService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const DashboardGuests = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [addGuestModalOpen, setAddGuestModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitesText, setInvitesText] = useState('');
  const [sendingInvites, setSendingInvites] = useState(false);

  // Manual Add Form
  const [manualForm, setManualForm] = useState({
    guestName: '',
    guestEmail: '',
    status: 'going',
    guestsCount: 1,
    note: '',
  });
  const [addingGuest, setAddingGuest] = useState(false);

  // Stats
  const [guestStats, setGuestStats] = useState({
    totalCount: 0,
    goingCount: 0,
    checkedInCount: 0,
    capacity: 0,
  });

  // Load events
  useEffect(() => {
    eventService.getEvents({ organizer: user?._id, limit: 50 }).then((res) => {
      const evs = res.events || [];
      setEvents(evs);
      if (evs.length > 0) {
        setSelectedEventId(evs[0]._id);
      }
    });
  }, [user]);

  // Load RSVPs for selected event
  const fetchRSVPs = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      const data = await rsvpService.getEventRSVPs(selectedEventId, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setRsvps(data.rsvps || []);
      setGuestStats({
        totalCount: data.totalCount || 0,
        goingCount: data.goingCount || 0,
        checkedInCount: data.checkedInCount || 0,
        capacity: data.capacity || 0,
      });
    } catch {
      toast.error('Failed to load guest list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRSVPs();
  }, [selectedEventId, statusFilter, search]);

  // Manual Add Guest
  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualForm.guestName || !manualForm.guestEmail) {
      toast.error('Please provide name and email');
      return;
    }

    try {
      setAddingGuest(true);
      await rsvpService.manualAddGuest(selectedEventId, manualForm);
      toast.success(`Guest ${manualForm.guestName} added!`);
      setAddGuestModalOpen(false);
      setManualForm({ guestName: '', guestEmail: '', status: 'going', guestsCount: 1, note: '' });
      fetchRSVPs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add guest');
    } finally {
      setAddingGuest(false);
    }
  };

  // Remove Guest
  const handleRemoveGuest = async (rsvpId) => {
    if (!window.confirm('Are you sure you want to remove this guest? Any waitlisted candidate will be promoted.')) {
      return;
    }
    try {
      await rsvpService.removeGuest(rsvpId);
      toast.success('Guest removed and waitlist updated.');
      fetchRSVPs();
    } catch {
      toast.error('Failed to remove guest');
    }
  };

  // Bulk Invites
  const handleSendInvites = async (e) => {
    e.preventDefault();
    const emailList = invitesText
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e && e.includes('@'));

    if (emailList.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    try {
      setSendingInvites(true);
      const res = await inviteService.bulkSend(selectedEventId, emailList);
      toast.success(res.message);
      setInviteModalOpen(false);
      setInvitesText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invites');
    } finally {
      setSendingInvites(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedEventId) return;
    const url = rsvpService.getExportCSVUrl(selectedEventId);
    window.open(url, '_blank');
    toast.success('Downloading guest list CSV...');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Guest Lists & RSVPs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View attendees, export CSV rosters, and send tokenized email invitations.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExportCSV}
            disabled={!selectedEventId || rsvps.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            icon={Mail}
            onClick={() => setInviteModalOpen(true)}
            disabled={!selectedEventId}
          >
            Send Invites
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setAddGuestModalOpen(true)}
            disabled={!selectedEventId}
          >
            Add Guest
          </Button>
        </div>
      </div>

      {/* Event Selector & Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="md:col-span-2 space-y-1">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Event
          </label>
          <Select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title} ({format(new Date(ev.startDate), 'MMM d, yyyy')})
              </option>
            ))}
          </Select>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center space-y-0.5">
          <p className="text-xs text-slate-400 font-semibold uppercase">Confirmed Going</p>
          <p className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {guestStats.goingCount} <span className="text-xs text-slate-400 font-normal">/ {guestStats.capacity} spots</span>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center space-y-0.5">
          <p className="text-xs text-slate-400 font-semibold uppercase">Checked-In</p>
          <p className="text-2xl font-bold font-heading text-brand-600 dark:text-brand-400">
            {guestStats.checkedInCount}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by attendee name, email, or ticket code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 py-2 text-xs"
        >
          <option value="all">All Statuses</option>
          <option value="going">Going Only</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="maybe">Maybe</option>
          <option value="declined">Declined</option>
        </Select>
      </div>

      {/* Guests Table */}
      {rsvps.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests found"
          description="No attendees match your filter, or no one has RSVP'd yet."
          actionText="Send Invitations"
          onAction={() => setInviteModalOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Attendee</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Guests (+1s)</th>
                <th className="py-4 px-6">Ticket Code</th>
                <th className="py-4 px-6">Check-in Status</th>
                <th className="py-4 px-6 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {rsvps.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar src={r.user?.avatar} name={r.guestName} size="sm" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {r.guestName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {r.guestEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={
                        r.status === 'going'
                          ? 'emerald'
                          : r.status === 'waitlisted'
                          ? 'purple'
                          : r.status === 'maybe'
                          ? 'amber'
                          : 'rose'
                      }
                      size="sm"
                      className="capitalize"
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 font-semibold">
                    {r.guestsCount}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-brand-600 dark:text-brand-400">
                    {r.ticketCode || 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    {r.checkedIn ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Checked in</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Not checked in</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleRemoveGuest(r._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Remove attendee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Add Guest Modal */}
      <Modal
        isOpen={addGuestModalOpen}
        onClose={() => setAddGuestModalOpen(false)}
        title="Add Guest Manually"
      >
        <form onSubmit={handleManualAdd} className="space-y-4">
          <Input
            label="Guest Name"
            required
            value={manualForm.guestName}
            onChange={(e) => setManualForm({ ...manualForm, guestName: e.target.value })}
            placeholder="e.g. Jordan Lee"
          />
          <Input
            label="Guest Email"
            type="email"
            required
            value={manualForm.guestEmail}
            onChange={(e) => setManualForm({ ...manualForm, guestEmail: e.target.value })}
            placeholder="jordan@example.com"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status"
              value={manualForm.status}
              onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
            >
              <option value="going">Going</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="maybe">Maybe</option>
            </Select>
            <Input
              label="Guests Count"
              type="number"
              min="1"
              value={manualForm.guestsCount}
              onChange={(e) => setManualForm({ ...manualForm, guestsCount: parseInt(e.target.value, 10) })}
            />
          </div>
          <Input
            label="Internal Note"
            value={manualForm.note}
            onChange={(e) => setManualForm({ ...manualForm, note: e.target.value })}
            placeholder="e.g. VIP speaker pass"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddGuestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addingGuest}>
              Add Guest
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Invitations Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Send Bulk Email Invitations"
      >
        <form onSubmit={handleSendInvites} className="space-y-4">
          <p className="text-xs text-slate-500">
            Paste recipient email addresses separated by commas or new lines. Each recipient will receive a branded invitation with a unique 1-click RSVP link.
          </p>
          <Textarea
            rows={5}
            required
            placeholder="sarah@example.com&#10;alex@company.org, david@acme.io"
            value={invitesText}
            onChange={(e) => setInvitesText(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={Send} isLoading={sendingInvites}>
              Send Invitations
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
