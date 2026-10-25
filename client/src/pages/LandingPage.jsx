import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  PlusCircle,
  Calendar,
  Sparkles,
  CheckCircle2,
  Users,
  QrCode,
  Bell,
  BarChart3,
  ArrowRight,
  ChevronDown,
  Star,
  Shield,
  Layers,
  Cpu,
  Music,
  Briefcase,
  Palette,
  Heart,
  Trophy,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Badge';
import { EventCard } from '../components/shared/EventCard';
import { eventService } from '../services/eventService';
import { categoryService } from '../services/categoryService';

export const LandingPage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, catsData] = await Promise.all([
          eventService.getFeaturedEvents(),
          categoryService.getCategories(),
        ]);
        setFeaturedEvents(eventsData || []);
        setCategories(catsData || []);
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Events Hosted', value: '1,250+' },
    { label: 'RSVPs Processed', value: '85,000+' },
    { label: 'Active Attendees', value: '42,000+' },
    { label: 'Global Cities', value: '38+' },
  ];

  const categoryIcons = {
    'tech-ai': Cpu,
    'music-concerts': Music,
    'business-startups': Briefcase,
    'design-creative': Palette,
    'health-wellness': Heart,
    'sports-outdoor': Trophy,
    'workshops-education': GraduationCap,
    'social-networking': Users,
  };

  const steps = [
    {
      step: '01',
      title: 'Discover or Create',
      description: 'Explore curated events by category and location, or publish your own event in minutes with our wizard.',
      icon: Compass,
    },
    {
      step: '02',
      title: 'Instant 1-Click RSVP',
      description: 'Secure your spot with Going, Maybe, or waitlist status. Invite +1s and add dietary notes effortlessly.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Get Tickets & Calendar Sync',
      description: 'Receive verified digital tickets with QR codes and auto-generated .ics calendar invites for your device.',
      icon: Calendar,
    },
    {
      step: '04',
      title: 'Seamless QR Check-in',
      description: 'Organizers scan tickets at the door using built-in camera scanning with live attendance analytics.',
      icon: QrCode,
    },
  ];

  const features = [
    {
      title: 'Automated Waitlist Engine',
      description: 'When an event hits capacity, attendees join a smart queue. As spots open up, candidates are automatically promoted and emailed.',
      icon: Sparkles,
      tag: 'Smart Queue',
      span: 'md:col-span-2',
    },
    {
      title: 'High-Speed QR Check-in',
      description: 'Built-in camera scanner with zero duplicate admissions and instant visual & sound cues.',
      icon: QrCode,
      tag: 'On-site Entry',
      span: 'md:col-span-1',
    },
    {
      title: 'Deep Telemetry & Analytics',
      description: 'Track RSVP conversions, peak response windows, check-in percentages, and guest breakdown over time.',
      icon: BarChart3,
      tag: 'Analytics',
      span: 'md:col-span-1',
    },
    {
      title: 'Automated Reminders & Invitations',
      description: '24-hour scheduled reminders via node-cron, calendar attachments, and private tokenized invite links.',
      icon: Bell,
      tag: 'Automations',
      span: 'md:col-span-2',
    },
  ];

  const testimonials = [
    {
      quote: "EventHub made our 500-person tech summit flawless. The waitlist auto-promotion saved us dozens of hours, and the QR check-in took 2 seconds per attendee at the door.",
      author: 'Sarah Chen',
      role: 'Head of Developer Relations, SF AI Summit',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop',
    },
    {
      quote: "The interface is breathtaking. Our attendees constantly comment on how smooth the 1-click RSVP and mobile ticket experience feels compared to legacy platforms.",
      author: 'Marcus Vance',
      role: 'Creative Director, Sunset Sonic Music Series',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop',
    },
    {
      quote: "Managing founder dinners and private angel pitch nights has never been easier. Tokenized invite links allowed VIPs to RSVP without creating an account.",
      author: 'Elena Rostova',
      role: 'Founding Partner, Vantage Ventures',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&fit=crop',
    },
  ];

  const faqs = [
    {
      q: 'How does the automatic waitlist promotion work?',
      a: 'When an event reaches maximum capacity, new RSVPs are assigned "waitlisted" status in chronological order. If an attendee cancels or changes to declined, EventHub automatically promotes the oldest eligible waitlisted attendee to "going", generates their QR ticket, and sends them an email notification.',
    },
    {
      q: 'Do guests need an account to RSVP through an invitation?',
      a: 'No! When organizers send private tokenized invites, recipients can simply open the link and RSVP in one click using their prefilled name and email without creating a password.',
    },
    {
      q: 'Can organizers export attendee data for check-in or CRM?',
      a: 'Yes, organizers can export comprehensive CSV guest lists at any time, complete with ticket codes, attendance status, timestamps, and guest counts.',
    },
    {
      q: 'How does the live QR check-in work?',
      a: 'Organizers can open the Live Check-in tool in the dashboard on any laptop, tablet, or smartphone. The browser camera scans ticket QR codes in real-time, verifying ticket authenticity and preventing duplicate check-ins.',
    },
    {
      q: 'Is there a calendar sync feature?',
      a: 'Yes! Every event confirmation includes an official RFC 5545 iCalendar (.ics) attachment, as well as a direct 1-click Google Calendar / Apple Calendar link.',
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 pb-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="indigo" size="lg" dot className="font-semibold shadow-sm">
                Next-Gen Event & RSVP Infrastructure
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight leading-[1.1]"
            >
              Discover, Create & Manage{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600">
                Unforgettable
              </span>{' '}
              Events.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              From tech summits and live concerts to private pitch nights. Effortless 1-click RSVPs, automated waitlist promotions, and high-speed QR check-ins.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/events" className="w-full sm:w-auto">
                <Button size="lg" icon={Compass} className="w-full text-base">
                  Explore Events
                </Button>
              </Link>
              <Link to="/dashboard/events/new" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" icon={PlusCircle} className="w-full text-base border border-slate-200 dark:border-slate-800">
                  Create an Event
                </Button>
              </Link>
            </motion.div>

            {/* Trust Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-6 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400"
            >
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop" alt="" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop" alt="" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop" alt="" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop" alt="" />
              </div>
              <span className="font-medium">Trusted by <strong>1,200+ organizers</strong> & 85,000+ attendees worldwide</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Stats Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-soft p-8 sm:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {stats.map((s, idx) => (
              <div key={s.label} className={`space-y-1 ${idx > 0 ? 'pt-4 md:pt-0' : ''}`}>
                <p className="text-3xl sm:text-4xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured / Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <Badge variant="indigo" size="sm" className="mb-2">
              Don't Miss Out
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              Featured Events
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top trending workshops, summits, and experiences happening soon.
            </p>
          </div>
          <Link to="/events">
            <Button variant="ghost" iconRight={ArrowRight}>
              View All Events
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredEvents.slice(0, 6).map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </section>

      {/* 4. Explore by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="purple" size="sm">
            Curated Collections
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
            Explore by Category
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Find the experiences tailored to your passions and professional interests.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Calendar;
            return (
              <Link
                key={cat._id}
                to={`/events?category=${cat._id}`}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 hover:border-brand-500/40 transition-all duration-300 flex flex-col items-center text-center space-y-3"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: cat.color || '#6366F1' }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {cat.eventCount || 0} events
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="indigo" size="sm">
            Simple & Transparent
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
            How EventHub Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Engineered for frictionless discovery, RSVPing, and on-site check-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((st) => (
            <div
              key={st.step}
              className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4"
            >
              <span className="text-4xl font-extrabold font-heading text-slate-200 dark:text-slate-800">
                {st.step}
              </span>
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <st.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                {st.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {st.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Bento-Grid Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="purple" size="sm">
            Enterprise Grade
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
            Powerful Features for Modern Organizers
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Everything you need to run high-capacity conferences, meetups, and exclusive gatherings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div
              key={feat.title}
              className={`p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between ${feat.span}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="indigo" size="sm">
                    {feat.tag}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="indigo" size="sm">
            Community Love
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
            Loved by Organizers Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card key={t.author} className="p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.author}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.role}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 8. FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="indigo" size="sm">
            FAQ
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-brand-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Final CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-700 p-8 sm:p-14 text-white text-center shadow-xl overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight leading-tight">
              Ready to host your next memorable event?
            </h2>
            <p className="text-sm sm:text-base text-brand-100">
              Join thousands of organizers creating seamless RSVPs, digital tickets, and happy attendees today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/register?role=organizer">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100 shadow-lg text-base">
                  Get Started as Organizer
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 text-base">
                  Browse All Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
