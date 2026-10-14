import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto py-5 px-6 border-t border-slate-200 bg-white/50 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div>
        © {new Date().getFullYear()} <strong className="text-slate-700">BookStack</strong>. Modern React & Tailwind Library Management System.
      </div>
      <div className="flex items-center gap-4 text-slate-500">
        <span>OpenLibrary API Integration</span>
        <span>•</span>
        <span>Context API Architecture</span>
        <span>•</span>
        <span>Protected Sessions</span>
      </div>
    </footer>
  );
};

export default Footer;
