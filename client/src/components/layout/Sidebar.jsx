import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Users,
  QrCode,
  BarChart3,
  Settings,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge } from '../ui/Badge';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isAdmin = false }) => {
  const { user } = useAuth();

  const organizerNav = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Events', path: '/dashboard/events', icon: Calendar },
    { label: 'Create Event', path: '/dashboard/events/new', icon: PlusCircle },
    { label: 'Guests & RSVPs', path: '/dashboard/guests', icon: Users },
    { label: 'Live Check-in', path: '/dashboard/check-in', icon: QrCode },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  ];

  const adminNav = [
    { label: 'System Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Manage Users', path: '/admin/users', icon: UserCheck },
    { label: 'Moderate Events', path: '/admin/events', icon: Shield },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
  ];

  const links = isAdmin ? adminNav : organizerNav;

  return (
    <aside
      className={`relative flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm z-30 transition-transform"
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
          {isAdmin ? <Shield className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white truncate">
              {isAdmin ? 'Admin Console' : 'Organizer Hub'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
              {user?.role} Portal
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {links.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info Footer */}
      {user && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 ${
              isCollapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            <Avatar src={user.avatar} name={user.name} size="sm" />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.name}
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize block truncate">
                  {user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
