import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Sidebar } from './components/layout/Sidebar';
import { useAuth } from './context/AuthContext';
import { Skeleton } from './components/ui/Badge';

// Lazy-loaded page components for optimal bundle performance
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const ExploreEventsPage = lazy(() =>
  import('./pages/ExploreEventsPage').then((m) => ({ default: m.ExploreEventsPage }))
);
const EventDetailsPage = lazy(() =>
  import('./pages/EventDetailsPage').then((m) => ({ default: m.EventDetailsPage }))
);
const PublicInvitePage = lazy(() =>
  import('./pages/PublicInvitePage').then((m) => ({ default: m.PublicInvitePage }))
);
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import('./pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const DashboardOverview = lazy(() =>
  import('./pages/dashboard/DashboardOverview').then((m) => ({ default: m.DashboardOverview }))
);
const DashboardEvents = lazy(() =>
  import('./pages/dashboard/DashboardEvents').then((m) => ({ default: m.DashboardEvents }))
);
const CreateEditEventPage = lazy(() =>
  import('./pages/dashboard/CreateEditEventPage').then((m) => ({ default: m.CreateEditEventPage }))
);
const DashboardGuests = lazy(() =>
  import('./pages/dashboard/DashboardGuests').then((m) => ({ default: m.DashboardGuests }))
);
const DashboardCheckIn = lazy(() =>
  import('./pages/dashboard/DashboardCheckIn').then((m) => ({ default: m.DashboardCheckIn }))
);
const MyRSVPsPage = lazy(() =>
  import('./pages/attendee/MyRSVPsPage').then((m) => ({ default: m.MyRSVPsPage }))
);
const AdminPanel = lazy(() =>
  import('./pages/admin/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);
const ContactPage = lazy(() =>
  import('./pages/misc/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const AboutPage = lazy(() =>
  import('./pages/misc/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const TermsPage = lazy(() =>
  import('./pages/misc/AboutPage').then((m) => ({ default: m.TermsPage }))
);
const PrivacyPage = lazy(() =>
  import('./pages/misc/AboutPage').then((m) => ({ default: m.PrivacyPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/misc/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-12 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Organizer Dashboard Layout with Sidebar
const DashboardLayout = ({ children, isAdmin = false }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950">
      <Sidebar
        isCollapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        isAdmin={isAdmin}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export function App() {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 500,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 25px -3px rgba(0,0,0,0.2)',
          },
        }}
      />

      <Navbar />

      <div className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto p-8 space-y-6">
              <Skeleton className="h-48 rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
              </div>
            </div>
          }
        >
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<ExploreEventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/invite/:token" element={<PublicInvitePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Attendee Portal */}
            <Route
              path="/my"
              element={
                <ProtectedRoute allowedRoles={['attendee', 'organizer', 'admin']}>
                  <MyRSVPsPage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <DashboardLayout>
                    <DashboardOverview />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/events"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <DashboardLayout>
                    <DashboardEvents />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/events/new"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <DashboardLayout>
                    <CreateEditEventPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/events/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <DashboardLayout>
                    <CreateEditEventPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/guests"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <DashboardLayout>
                    <DashboardGuests />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/check-in"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <DashboardLayout>
                    <DashboardCheckIn />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <DashboardLayout>
                    <DashboardOverview />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Panel */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout isAdmin={true}>
                    <AdminPanel />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout isAdmin={true}>
                    <AdminPanel />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout isAdmin={true}>
                    <AdminPanel />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout isAdmin={true}>
                    <AdminPanel />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>

      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;
