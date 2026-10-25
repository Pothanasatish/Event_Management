import React from 'react';
import { Calendar, Users, Award, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="indigo" size="md">
          Our Mission
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Empowering communities to gather meaningfully.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          EventHub was founded with a singular conviction: technology should make discovering and hosting events effortless, transparent, and unforgettable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Simplicity First
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            1-click RSVPs, instant verified digital tickets, and intelligent waitlist auto-promotion without bureaucratic hurdles.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Reliability at Scale
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Built on resilient infrastructure capable of handling high-speed entrance scanning, zero double admissions, and real-time telemetry.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Organizer Empowerment
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Comprehensive analytics, automated 24h reminders, CSV exports, and tokenized private invitations to put organizers in full command.
          </p>
        </div>
      </div>
    </div>
  );
};

export const TermsPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
        Terms of Service
      </h1>
      <p className="text-xs text-slate-400">Last updated: October 2026</p>
      <div className="prose dark:prose-invert text-sm text-slate-600 dark:text-slate-300 space-y-4">
        <p>
          Welcome to EventHub. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service.
        </p>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Use of Services</h3>
        <p>
          EventHub provides ticketing, RSVP tracking, waitlist queues, and check-in tools. You agree not to misuse the services or engage in fraudulent ticket generation.
        </p>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Organizer Obligations</h3>
        <p>
          Organizers are responsible for providing accurate event details, venue safety, and honouring confirmed RSVPs.
        </p>
      </div>
    </div>
  );
};

export const PrivacyPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="text-xs text-slate-400">Last updated: October 2026</p>
      <div className="prose dark:prose-invert text-sm text-slate-600 dark:text-slate-300 space-y-4">
        <p>
          Your privacy is sacred. EventHub collects only the minimum necessary information to provide event registration, ticketing, and check-in.
        </p>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h3>
        <p>
          Name, email address, optional profile details, and RSVP responses. We never sell your personal data to third parties.
        </p>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Security</h3>
        <p>
          We employ industry-standard encryption, password hashing via bcrypt, and secure httpOnly cookies.
        </p>
      </div>
    </div>
  );
};
