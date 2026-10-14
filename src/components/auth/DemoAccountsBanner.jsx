import React from 'react';
import { Shield, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

const DemoAccountsBanner = ({ onSelectAccount }) => {
  const accounts = [
    {
      role: 'Admin',
      name: 'Eleanor Vance',
      email: 'admin@library.com',
      password: 'Password@123',
      icon: Shield,
      accent: 'border-rose-200/80 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700',
    },
    {
      role: 'Librarian',
      name: 'Marcus Sterling',
      email: 'librarian@library.com',
      password: 'Password@123',
      icon: BookOpen,
      accent: 'border-purple-200/80 bg-purple-50/50 hover:bg-purple-100/70 text-purple-700',
    },
    {
      role: 'Student',
      name: 'Sophia Chen',
      email: 'student@library.com',
      password: 'Password@123',
      icon: GraduationCap,
      accent: 'border-indigo-200/80 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-700',
    },
  ];

  return (
    <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-3.5 my-4">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Demo Access</span>
        </span>
        <span className="text-[10px] text-slate-400">Click to autofill</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          return (
            <button
              key={acc.role}
              type="button"
              onClick={() => onSelectAccount(acc.email, acc.password)}
              className={`group flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-150 hover:shadow-2xs active:scale-98 ${acc.accent}`}
              title={`Click to autofill ${acc.role} credentials`}
            >
              <Icon className="w-4 h-4 mb-1 transition-transform group-hover:scale-110" />
              <span className="text-xs font-bold leading-tight">{acc.role}</span>
              <span className="text-[10px] opacity-70 truncate w-full text-center mt-0.5">
                {acc.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DemoAccountsBanner;
