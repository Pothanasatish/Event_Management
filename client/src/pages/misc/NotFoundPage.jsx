import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-md">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <span className="text-5xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
            404
          </span>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The page you're looking for doesn't exist, has been moved, or the link may have expired.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button icon={Home}>Back to Home</Button>
          </Link>
          <Link to="/events">
            <Button variant="outline" icon={Compass}>
              Explore Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
