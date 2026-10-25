import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  User,
  Lock,
  Bell,
  Trash2,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge, Avatar, Card, EmptyState } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { TicketModal } from '../../components/shared/TicketModal';
import { EventCard } from '../../components/shared/EventCard';
import { rsvpService } from '../../services/rsvpService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const MyRSVPsPage = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'upcoming';

  const [rsvps, setRsvps] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState(null); // { rsvp, event }

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    notificationPrefs: user?.notificationPrefs || {
      emailReminders: true,
      rsvpUpdates: true,
    },
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchTabData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'saved') {
        const events = await userService.getSavedEvents();
        setSavedEvents(events || []);
      } else if (['upcoming', 'past', 'waitlisted'].includes(activeTab)) {
        const data = await rsvpService.getMyRSVPs(activeTab);
        setRsvps(data || []);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Cancel RSVP
  const handleCancelRSVP = async (rsvp) => {
    if (!window.confirm(`Are you sure you want to cancel your RSVP for "${rsvp.event?.title}"?`)) {
      return;
    }
    try {
      await rsvpService.submitRSVP({
        eventId: rsvp.event?._id,
        status: 'declined',
      });
      toast.success('RSVP successfully cancelled');
      fetchTabData();
    } catch {
      toast.error('Failed to cancel RSVP');
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await userService.updateProfile(profileForm);
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming RSVPs' },
    { id: 'past', label: 'Past Events' },
    { id: 'waitlisted', label: 'Waitlisted' },
    { id: 'saved', label: 'Saved Bookmarks' },
    { id: 'profile', label: 'Profile & Settings' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
          Attendee Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your confirmed event tickets, waitlist status, and profile preferences.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      {/* Tab Contents */}
      {loading ? (
        <div className="space-y-4">
          <div className="animate-pulse bg-slate-200 dark:bg-slate-800 h-28 rounded-2xl" />
          <div className="animate-pulse bg-slate-200 dark:bg-slate-800 h-28 rounded-2xl" />
        </div>
      ) : activeTab === 'profile' ? (
        /* Profile & Settings Sub-Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Details Form */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Personal Information
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar src={profileForm.avatar} name={profileForm.name} size="lg" />
                <div className="flex-1">
                  <Input
                    label="Avatar Image URL"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <Input
                label="Full Name"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />

              <Input label="Email Address" disabled value={user?.email || ''} />

              <Textarea
                label="Bio"
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="A short description about yourself..."
              />

              {/* Notification Preferences */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Notification Preferences
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={profileForm.notificationPrefs?.emailReminders}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        notificationPrefs: {
                          ...profileForm.notificationPrefs,
                          emailReminders: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span>Email me event reminders 24 hours prior</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={profileForm.notificationPrefs?.rsvpUpdates}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        notificationPrefs: {
                          ...profileForm.notificationPrefs,
                          rsvpUpdates: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span>Email me waitlist promotions and updates</span>
                </label>
              </div>

              <Button type="submit" isLoading={savingProfile} className="w-full">
                Save Profile
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6 h-fit">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Security & Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
              />

              <Input
                label="New Password"
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                value={passwordForm.confirmNewPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
                }
              />

              <Button type="submit" variant="outline" isLoading={changingPassword} className="w-full">
                Update Password
              </Button>
            </form>
          </div>
        </div>
      ) : activeTab === 'saved' ? (
        /* Saved Bookmarks Sub-Tab */
        savedEvents.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved events"
            description="Explore upcoming events and click the bookmark icon to save them for later."
            actionText="Browse Events"
            onAction={() => (window.location.href = '/events')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedEvents.map((ev) => (
              <EventCard key={ev._id} event={ev} isBookmarked={true} />
            ))}
          </div>
        )
      ) : (
        /* Upcoming / Past / Waitlisted RSVPs */
        rsvps.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title={`No ${activeTab} RSVPs`}
            description={
              activeTab === 'waitlisted'
                ? 'You are not currently on any waitlists.'
                : 'You have not RSVP’d to any events in this section yet.'
            }
            actionText="Discover Events"
            onAction={() => (window.location.href = '/events')}
          />
        ) : (
          <div className="space-y-4">
            {rsvps.map((r) => {
              const ev = r.event;
              if (!ev) return null;
              return (
                <div
                  key={r._id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={ev.coverImage}
                      alt={ev.title}
                      className="w-20 sm:w-28 aspect-[16/9] rounded-2xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={r.status === 'going' ? 'emerald' : r.status === 'waitlisted' ? 'purple' : 'amber'}
                          size="sm"
                          className="capitalize"
                        >
                          {r.status}
                        </Badge>
                        {r.checkedIn && (
                          <Badge variant="emerald" size="sm">
                            Checked In
                          </Badge>
                        )}
                      </div>
                      <Link
                        to={`/events/${ev.slug || ev._id}`}
                        className="font-bold font-heading text-slate-900 dark:text-white hover:text-brand-600 transition-colors line-clamp-1 text-base sm:text-lg"
                      >
                        {ev.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(ev.startDate), 'EEE, MMM d • h:mm a')}
                        </span>
                        <span>
                          {r.guestsCount} Attendee{r.guestsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {r.status === 'going' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Ticket}
                        onClick={() => setSelectedTicket({ rsvp: r, event: ev })}
                      >
                        Ticket & QR
                      </Button>
                    )}

                    {r.status !== 'declined' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelRSVP(r)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          rsvp={selectedTicket.rsvp}
          event={selectedTicket.event}
          isNew={false}
        />
      )}
    </div>
  );
};
