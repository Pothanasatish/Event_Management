import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide your email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const user = await login(formData);
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'organizer') {
        navigate(redirectPath === '/' ? '/dashboard' : redirectPath);
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 1-click test credentials autofill
  const fillDemo = (email, password) => {
    setFormData({ email, password, rememberMe: true });
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-slate-900">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 group mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                Event<span className="text-brand-600">Hub</span>
              </span>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Or{' '}
              <Link
                to="/register"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                create a new account for free
              </Link>
            </p>
          </div>

          {/* Demo Login Quick-Fill Chips */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Demo Login:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillDemo('admin@eventhub.io', 'Password123!')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 hover:opacity-80 transition-opacity"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('organizer1@eventhub.io', 'Password123!')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:opacity-80 transition-opacity"
              >
                💼 Organizer
              </button>
              <button
                type="button"
                onClick={() => fillDemo('liam@example.com', 'Password123!')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:opacity-80 transition-opacity"
              >
                🎟️ Attendee
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              name="email"
              required
              autoFocus
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={Mail}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="w-full text-base"
              iconRight={ArrowRight}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>

      {/* Right side: Visual Showcase */}
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-brand-900 via-indigo-950 to-purple-950 p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-between max-w-lg mx-auto">
          <div className="space-y-4 pt-12">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20">
              EventHub Platform v1.0
            </span>
            <h3 className="text-3xl font-extrabold font-heading leading-tight">
              One platform for every unforgettable gathering.
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time RSVPs, dynamic QR tickets, waitlist automation, and live attendance metrics built for world-class organizers.
            </p>
          </div>

          {/* Floating mock card */}
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                Live Check-in Status
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Gate
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold">Global AI Summit 2026</p>
              <p className="text-xs text-slate-300">Moscone Center, San Francisco</p>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-3/4" />
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Checked in: 240 / 320</span>
              <span>75% attendance</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} EventHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
