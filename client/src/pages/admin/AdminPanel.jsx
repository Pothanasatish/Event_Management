import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Calendar,
  Layers,
  Search,
  UserCheck,
  UserX,
  Star,
  Trash2,
  Plus,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge, Avatar, Card, EmptyState } from '../../components/ui/Badge';
import { Tabs, Pagination, ConfirmDialog } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { analyticsService } from '../../services/analyticsService';
import { userService } from '../../services/userService';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  // Users Management
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ total: 0, pages: 1 });

  // Event Moderation
  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState('');

  // Categories
  const [categories, setCategories] = useState([]);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '', color: '#6366F1' });

  // Dialogs
  const [deleteUserDialog, setDeleteUserDialog] = useState(null);

  const fetchStats = async () => {
    try {
      const data = await analyticsService.getAdminAnalytics();
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
      setRecentEvents(data.recentEvents || []);
    } catch {
      // ignore
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.adminGetUsers({
        search: userSearch.trim() || undefined,
        role: userRoleFilter !== 'all' ? userRoleFilter : undefined,
        page: userPage,
        limit: 10,
      });
      setUsers(res.users || []);
      setUserPagination(res.pagination || { total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await eventService.getEvents({ status: 'all', limit: 30, search: eventSearch });
      setEvents(res.events || []);
    } catch {
      // ignore
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'events') {
      fetchEvents();
    }
  }, [activeTab, userSearch, userRoleFilter, userPage, eventSearch]);

  // Toggle user status
  const handleToggleStatus = async (user) => {
    try {
      const res = await userService.adminToggleStatus(user._id);
      toast.success(res.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Change user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.adminUpdateRole(userId, newRole);
      toast.success(`User role changed to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to change role');
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deleteUserDialog) return;
    try {
      await userService.adminDeleteUser(deleteUserDialog._id);
      toast.success('User deleted successfully');
      setDeleteUserDialog(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Toggle Featured Event
  const handleToggleFeatured = async (eventId) => {
    try {
      const res = await userService.adminToggleFeatured(eventId);
      toast.success(res.isFeatured ? 'Event marked as featured' : 'Removed from featured');
      fetchEvents();
    } catch {
      toast.error('Could not toggle featured');
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryService.createCategory(catForm);
      toast.success('Category created');
      setCatModalOpen(false);
      setCatForm({ name: '', description: '', color: '#6366F1' });
      fetchCategories();
    } catch {
      toast.error('Failed to create category');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Platform Overview', icon: Shield },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'events', label: 'Moderate Events', icon: Calendar },
    { id: 'categories', label: 'Categories', icon: Layers },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Admin Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            System telemetry, user roles, event moderation, and category administration.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Users</span>
              <p className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
                {stats?.totalUsers || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {stats?.organizersCount || 0} Organizers • {stats?.attendeesCount || 0} Attendees
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Events</span>
              <p className="text-3xl font-extrabold font-heading text-brand-600 dark:text-brand-400 mt-1">
                {stats?.totalEvents || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {stats?.publishedEvents || 0} Published • {stats?.draftEvents || 0} Drafts
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total RSVPs</span>
              <p className="text-3xl font-extrabold font-heading text-purple-600 dark:text-purple-400 mt-1">
                {stats?.totalRSVPs || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Across all system events
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
              <span className="text-xs text-slate-400 uppercase font-semibold">Checked-In</span>
              <p className="text-3xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400 mt-1">
                {stats?.totalCheckedIn || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Verified admissions
              </p>
            </div>
          </div>

          {/* Recent Signups & Recent Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
              <h3 className="font-bold font-heading text-slate-900 dark:text-white">
                Recent Signups
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentUsers.map((u) => (
                  <div key={u._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant="indigo" size="sm" className="capitalize">
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Events */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
              <h3 className="font-bold font-heading text-slate-900 dark:text-white">
                Recently Created Events
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentEvents.map((ev) => (
                  <div key={ev._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {ev.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        By {ev.organizer?.name || 'Organizer'}
                      </p>
                    </div>
                    <Badge variant={ev.status === 'published' ? 'emerald' : 'slate'} size="sm">
                      {ev.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <Select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value);
                setUserPage(1);
              }}
              className="w-full sm:w-44 py-2 text-xs"
            >
              <option value="all">All Roles</option>
              <option value="attendee">Attendee</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} name={u.name} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold capitalize focus:outline-none"
                      >
                        <option value="attendee">Attendee</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={u.isActive ? 'emerald' : 'rose'} size="sm">
                        {u.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.isActive
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={u.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteUserDialog(u)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          title="Delete User"
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

          <Pagination
            currentPage={userPage}
            totalPages={userPagination.pages}
            onPageChange={setUserPage}
          />
        </div>
      )}

      {/* Tab 3: Events Moderation */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-6">Organizer</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Featured</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={ev.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <Link to={`/events/${ev.slug || ev._id}`} className="font-bold text-slate-900 dark:text-white hover:underline">
                          {ev.title}
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {ev.organizer?.name || 'Organizer'}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={ev.status === 'published' ? 'emerald' : 'slate'} size="sm">
                        {ev.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleFeatured(ev._id)}
                        className={`p-1.5 rounded-lg flex items-center gap-1.5 ${
                          ev.isFeatured ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-400'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${ev.isFeatured ? 'fill-current' : ''}`} />
                        <span>{ev.isFeatured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/events/${ev.slug || ev._id}`}>
                        <Button variant="ghost" size="sm">
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button icon={Plus} onClick={() => setCatModalOpen(true)}>
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div
                key={c._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name[0]}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {c.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {c.description || 'No description provided.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title="New Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={catForm.name}
            onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            placeholder="e.g. Science & Discovery"
          />
          <Input
            label="Hex Color"
            value={catForm.color}
            onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
            placeholder="#6366F1"
          />
          <Textarea
            label="Description"
            value={catForm.description}
            onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
            placeholder="Brief explanation of this category..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Category</Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteUserDialog}
        onClose={() => setDeleteUserDialog(null)}
        onConfirm={handleDeleteUser}
        title={`Delete user "${deleteUserDialog?.name}"?`}
        message="This will completely remove the user account and purge their RSVP records. This action cannot be undone."
        isDestructive={true}
      />
    </div>
  );
};
