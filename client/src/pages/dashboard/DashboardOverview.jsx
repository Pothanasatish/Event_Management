import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  QrCode,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Badge, Card, Avatar, Skeleton } from '../../components/ui/Badge';
import { analyticsService } from '../../services/analyticsService';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export const DashboardOverview = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [data, eventsData] = await Promise.all([
          analyticsService.getOrganizerAnalytics(),
          eventService.getEvents({ organizer: user?._id, limit: 5 }),
        ]);
        setAnalytics(data);
        setUpcomingEvents(eventsData.events || []);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {
    totalEvents: 0,
    totalRSVPs: 0,
    upcomingEvents: 0,
    checkInRate: 0,
  };

  const statusData = analytics?.statusBreakdown || [];
  const rsvpsOverTime = analytics?.rsvpsOverTime || [];
  const recentActivity = analytics?.recentActivity || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your events, RSVPs, and live check-ins today.
          </p>
        </div>
        <Link to="/dashboard/events/new">
          <Button icon={PlusCircle} size="md">
            Create Event
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Events */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Events
            </span>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            {kpis.totalEvents}
          </p>
          <p className="text-xs text-slate-500">
            {kpis.upcomingEvents} upcoming • {kpis.draftEvents || 0} drafts
          </p>
        </div>

        {/* Card 2: Total RSVPs */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total RSVPs
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            {kpis.totalRSVPs}
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active registrations</span>
          </div>
        </div>

        {/* Card 3: Live Check-in Rate */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Check-in Rate
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            {kpis.checkInRate}%
          </p>
          <p className="text-xs text-slate-500">
            {kpis.totalCheckedIn || 0} verified attendees at doors
          </p>
        </div>

        {/* Card 4: Upcoming Highlights */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Upcoming Events
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            {kpis.upcomingEvents}
          </p>
          <Link
            to="/dashboard/events"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
          >
            <span>Manage schedule</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Visual Charts: RSVPs Over Time & RSVP Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line / Area Chart: RSVPs Over Time */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                RSVPs Over Time (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400">Daily registration activity</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rsvpsOverTime}>
                <defs>
                  <linearGradient id="rsvpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rsvps"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#rsvpGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Status Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              RSVP Status Breakdown
            </h3>
            <p className="text-xs text-slate-400">Distribution across active events</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-400">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Events List & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Upcoming Events
            </h3>
            <Link
              to="/dashboard/events"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No upcoming events found. Click "Create Event" to launch one!
              </p>
            ) : (
              upcomingEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={ev.coverImage}
                      alt={ev.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {format(new Date(ev.startDate), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge variant={ev.status === 'published' ? 'emerald' : 'slate'} size="sm">
                      {ev.status}
                    </Badge>
                    <Link to={`/dashboard/events/${ev._id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
            Recent RSVPs
          </h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No recent RSVPs yet.
              </p>
            ) : (
              recentActivity.map((act) => (
                <div key={act._id} className="flex items-start gap-3">
                  <Avatar src={act.user?.avatar} name={act.guestName} size="sm" />
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {act.guestName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      RSVP'd <strong className="capitalize">{act.status}</strong> for "{act.event?.title}"
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(act.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
