import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowRightLeft,
  DollarSign,
  User,
  LogOut,
  Library,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/books',
      label: 'Book Management',
      icon: BookOpen,
      badge: null,
    },
    {
      to: '/members',
      label: 'Member Management',
      icon: Users,
      badge: null,
    },
    {
      to: '/circulation',
      label: 'Issue / Return',
      icon: ArrowRightLeft,
      badge: null,
    },
    {
      to: '/fines',
      label: 'Fine Management',
      icon: DollarSign,
      badge: null,
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: User,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 flex flex-col justify-between
          transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between h-18 px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight block leading-tight">
                  Book<span className="text-indigo-400">Stack</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  LMS Portal
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick System Status / Role Pills */}
          <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Library Online
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl mb-3 hover:bg-slate-800/50 transition-colors">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
              }
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Member'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-slate-400 truncate">{user?.role || 'User'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-[10px] text-indigo-400 font-mono">
                  {user?.membershipId || 'ID-001'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-600/80 border border-rose-900/40 hover:border-rose-600 transition-all duration-200 shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
