import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Mail,
  CheckCircle2,
  Users,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Badge, Card, Avatar, Skeleton } from '../components/ui/Badge';
import { TicketModal } from '../components/shared/TicketModal';
import { inviteService } from '../services/inviteService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const PublicInvitePage = () => {
  const { token } = useParams();
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState('');
  const [status, setStatus] = useState('going');
  const [guestsCount, setGuestsCount] = useState(1);
  const [note, setNote] = useState('');

  // Ticket modal
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [confirmedRSVP, setConfirmedRSVP] = useState(null);

  useEffect(() => {
    inviteService
      .getInviteByToken(token)
      .then((data) => {
        setInviteData(data);
        if (data.existingRSVP) {
          setConfirmedRSVP(data.existingRSVP);
          setGuestName(data.existingRSVP.guestName || '');
          setStatus(data.existingRSVP.status || 'going');
          setGuestsCount(data.existingRSVP.guestsCount || 1);
          setNote(data.existingRSVP.note || '');
        }
      })
      .catch((err) => {
        toast.error('Invitation link is invalid or expired');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (selectedStatus) => {
    const finalStatus = selectedStatus || status;
    if (!guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      setSubmitting(true);
      const res = await inviteService.respondToInvite(token, {
        guestName,
        status: finalStatus,
        guestsCount,
        note,
      });

      setConfirmedRSVP(res.data.rsvp);
      toast.success(res.message);

      if (finalStatus === 'going') {
        setTicketModalOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  if (!inviteData || !inviteData.event) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Invitation Not Found
        </h2>
        <p className="text-xs text-slate-500">
          This invitation link may have expired or is invalid.
        </p>
        <Link to="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  const { event, invite } = inviteData;

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-soft-lg space-y-6">
        {/* Event Header Cover */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-800">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 inset-x-6 space-y-1 text-white">
            <Badge variant="indigo" size="sm" className="mb-1">
              Personal Invitation
            </Badge>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white line-clamp-2">
              {event.title}
            </h1>
            <p className="text-xs text-slate-300">
              Invited by <strong>{event.organizer?.name || 'Organizer'}</strong>
            </p>
          </div>
        </div>

        {/* Details & Form */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
              <span>{format(new Date(event.startDate), 'EEE, MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-purple-500 shrink-0" />
              <span>{format(new Date(event.startDate), 'h:mm a')}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
              {event.locationType === 'online' ? (
                <>
                  <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Online Virtual Event</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">{event.venue?.name}, {event.venue?.city}</span>
                </>
              )}
            </div>
          </div>

          {confirmedRSVP && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                You have currently RSVP'd: <span className="uppercase">{confirmedRSVP.status}</span>
              </p>
              {confirmedRSVP.status === 'going' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTicketModalOpen(true)}
                >
                  View Your Ticket & QR Code
                </Button>
              )}
            </div>
          )}

          {/* RSVP Form */}
          <div className="space-y-4">
            <Input
              label="Your Full Name"
              required
              autoFocus
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Robin Taylor"
            />

            <Input
              label="Your Email"
              disabled
              value={invite.email}
              icon={Mail}
              helperText="This invitation is designated for this email address."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Number of Guests (+1s)"
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value, 10))}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Attendee (Just me)' : `Attendees (+${n - 1})`}
                  </option>
                ))}
              </Select>

              <Input
                label="Dietary / Note (Optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Vegetarian, wheelchair, etc."
              />
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={submitting}
                onClick={() => handleSubmit('going')}
              >
                Accept Invitation (Going) 🎉
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleSubmit('maybe')}
                >
                  Maybe
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleSubmit('declined')}
                >
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {confirmedRSVP && (
        <TicketModal
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          rsvp={confirmedRSVP}
          event={event}
          isNew={true}
        />
      )}
    </div>
  );
};
