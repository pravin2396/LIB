import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header Banner in Body Content */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>BookStack Academic Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Scholar'}! 👋
          </h1>
          <p className="text-sm sm:text-base text-indigo-200 mt-2 leading-relaxed">
            Welcome to your library command center. Explore the digital repository, manage checkouts, and track due dates with ease.
          </p>
        </div>

        {/* Decorative graphic */}
        <div className="hidden md:block absolute right-6 bottom-4 opacity-15 pointer-events-none">
          <BookOpen className="w-64 h-64 text-white" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
