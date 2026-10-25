import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  CameraOff,
  User,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge, Card, Avatar } from '../../components/ui/Badge';
import { eventService } from '../../services/eventService';
import { rsvpService } from '../../services/rsvpService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const DashboardCheckIn = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [ticketInput, setTicketInput] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Result state
  const [scanResult, setScanResult] = useState(null); // { success, attendee, message, isDuplicate, time }

  // Stats
  const [stats, setStats] = useState({
    checkedInCount: 0,
    goingCount: 0,
    capacity: 0,
  });

  const scannerRef = useRef(null);

  // Sound feedback
  const playBeep = (isSuccess) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = isSuccess ? 'sine' : 'sawtooth';
      osc.frequency.value = isSuccess ? 880 : 330; // High beep vs Low buzz
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  // Load organizer's events
  useEffect(() => {
    eventService.getEvents({ organizer: user?._id, limit: 50 }).then((res) => {
      const evs = res.events || [];
      setEvents(evs);
      if (evs.length > 0) {
        setSelectedEventId(evs[0]._id);
      }
    });
  }, [user]);

  // Load event check-in stats
  const fetchStats = async () => {
    if (!selectedEventId) return;
    try {
      const data = await rsvpService.getEventRSVPs(selectedEventId);
      setStats({
        checkedInCount: data.checkedInCount || 0,
        goingCount: data.goingCount || 0,
        capacity: data.capacity || 0,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedEventId]);

  // Execute check in
  const processCheckIn = async (code) => {
    if (!code || !selectedEventId) return;

    try {
      setCheckingIn(true);
      const res = await rsvpService.checkInGuest({
        eventId: selectedEventId,
        ticketCode: code.trim(),
      });

      playBeep(true);
      setScanResult({
        success: true,
        attendee: res.data.rsvp,
        message: `Successfully checked in ${res.data.rsvp.guestName}!`,
      });
      toast.success(`Checked in: ${res.data.rsvp.guestName}`);
      fetchStats();
    } catch (err) {
      playBeep(false);
      const data = err.response?.data;
      if (data?.alreadyCheckedIn) {
        setScanResult({
          success: false,
          isDuplicate: true,
          attendee: data.data?.rsvp,
          message: data.message,
        });
        toast.error('Warning: Attendee was already checked in!');
      } else {
        setScanResult({
          success: false,
          message: data?.message || 'Invalid ticket code for this event',
        });
        toast.error(data?.message || 'Ticket verification failed');
      }
    } finally {
      setCheckingIn(false);
      setTicketInput('');
    }
  };

  // Camera Scanner Lifecycle
  useEffect(() => {
    if (scannerActive) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          // Successfully scanned QR Code
          processCheckIn(decodedText);
        },
        (error) => {
          // scanning frame (ignore noisy logs)
        }
      );

      scannerRef.current = scanner;
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scannerActive, selectedEventId]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    processCheckIn(ticketInput);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Live Check-in Scanner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Scan attendee QR codes with your device camera or enter ticket codes manually.
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* Event Selector & Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Event Gate
          </label>
          <Select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setScanResult(null);
            }}
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center space-y-0.5">
          <p className="text-xs text-slate-400 uppercase font-semibold">Checked In</p>
          <p className="text-3xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
            {stats.checkedInCount}{' '}
            <span className="text-xs text-slate-400 font-normal">/ {stats.goingCount} Expected</span>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center space-y-0.5">
          <p className="text-xs text-slate-400 uppercase font-semibold">Attendance Rate</p>
          <p className="text-3xl font-extrabold font-heading text-brand-600 dark:text-brand-400">
            {stats.goingCount > 0
              ? Math.round((stats.checkedInCount / stats.goingCount) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Main Check-in Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Camera Scanner */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white uppercase tracking-wider">
              Camera QR Scanner
            </h3>
            <Button
              size="sm"
              variant={scannerActive ? 'danger' : 'primary'}
              icon={scannerActive ? CameraOff : Camera}
              onClick={() => setScannerActive(!scannerActive)}
            >
              {scannerActive ? 'Stop Camera' : 'Start Camera'}
            </Button>
          </div>

          <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative border border-dashed border-slate-300 dark:border-slate-700">
            {scannerActive ? (
              <div id="qr-reader" className="w-full h-full" />
            ) : (
              <div className="text-center p-6 space-y-2">
                <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Camera scanner is currently inactive.
                </p>
                <Button size="sm" variant="outline" onClick={() => setScannerActive(true)}>
                  Activate Camera
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Manual Ticket Code Entry & Real-time Feedback */}
        <div className="space-y-6">
          {/* Manual Input Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white uppercase tracking-wider">
              Manual Ticket Code Entry
            </h3>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. EVT-AI26-LIA10"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-mono uppercase tracking-wider placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button type="submit" isLoading={checkingIn}>
                Verify
              </Button>
            </form>
          </div>

          {/* Feedback Card */}
          {scanResult && (
            <div
              className={`p-6 rounded-3xl border shadow-soft space-y-4 transition-all duration-300 ${
                scanResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : scanResult.isDuplicate
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {scanResult.success ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : scanResult.isDuplicate ? (
                  <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-base font-bold font-heading">
                    {scanResult.success
                      ? 'Admit Attendee'
                      : scanResult.isDuplicate
                      ? 'Already Checked In'
                      : 'Entry Denied'}
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    {scanResult.message}
                  </p>
                </div>
              </div>

              {scanResult.attendee && (
                <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Name:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {scanResult.attendee.guestName}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Ticket Code:</span>
                    <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                      {scanResult.attendee.ticketCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Party Size:</span>
                    <span>
                      {scanResult.attendee.guestsCount} Attendee(s)
                    </span>
                  </div>
                  {scanResult.attendee.checkedInAt && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500">Checked in timestamp:</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(scanResult.attendee.checkedInAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
