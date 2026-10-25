import React, { useEffect } from 'react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { Calendar, MapPin, User, CheckCircle2, Download, Printer } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { triggerConfetti } from '../ui/Confetti';
import { rsvpService } from '../../services/rsvpService';

export const TicketModal = ({ isOpen, onClose, rsvp, event, isNew = false }) => {
  useEffect(() => {
    if (isOpen && isNew) {
      triggerConfetti();
    }
  }, [isOpen, isNew]);

  if (!rsvp || !event) return null;

  const handlePrint = () => {
    window.print();
  };

  const calendarUrl = rsvpService.getCalendarICSUrl(event._id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Header confirmation message */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
            {rsvp.status === 'going' ? 'Your RSVP is Confirmed!' : 'RSVP Saved'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Present this ticket and QR code at the event entrance for fast check-in.
          </p>
        </div>

        {/* Printable Ticket Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-brand-900 via-indigo-950 to-purple-950 text-white p-6 shadow-xl overflow-hidden border border-brand-800/50">
          {/* Decorative circles on ticket edges */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-900" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-900" />

          {/* Ticket Header */}
          <div className="border-b border-white/10 pb-4 mb-4 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-300">
                Official Event Ticket
              </span>
              <h3 className="text-lg font-bold font-heading text-white line-clamp-1 mt-0.5">
                {event.title}
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              {rsvp.status}
            </span>
          </div>

          {/* Ticket Body: Details & QR Code */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl shadow-md shrink-0">
              <QRCode
                value={rsvp.ticketCode || `EVT-${event._id}-${rsvp._id}`}
                size={120}
                level="H"
              />
            </div>

            {/* Event Information */}
            <div className="space-y-2 text-xs flex-1 text-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-300 shrink-0" />
                <span>
                  {event.startDate
                    ? format(new Date(event.startDate), 'EEEE, MMMM d, yyyy • h:mm a')
                    : 'TBA'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-300 shrink-0" />
                <span className="line-clamp-1">
                  {event.locationType === 'online'
                    ? 'Online Event'
                    : `${event.venue?.name || ''}, ${event.venue?.city || ''}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-300 shrink-0" />
                <span>
                  <strong>{rsvp.guestName}</strong> ({rsvp.guestsCount} attendee
                  {rsvp.guestsCount > 1 ? 's' : ''})
                </span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Ticket Code
                </p>
                <p className="font-mono font-bold text-sm text-brand-300 tracking-wider">
                  {rsvp.ticketCode || 'EVT-GEN-CODE'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <a
            href={calendarUrl}
            download
            className="w-full sm:w-auto"
          >
            <Button variant="outline" size="sm" icon={Download} className="w-full">
              Add to Calendar (.ics)
            </Button>
          </a>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
              className="w-full sm:w-auto"
            >
              Print
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
