import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'System Notice',
      message: 'Welcome to BookStack Library Management Portal.',
      time: 'Just now',
      type: 'info',
    },
    {
      id: 2,
      title: 'Profile Updated',
      message: 'Your membership account is fully active and verified.',
      time: '1 hour ago',
      type: 'success',
    },
  ];

  const getRoleVariant = (role) => {
    if (role === 'Admin') return 'danger';
    if (role === 'Librarian') return 'purple';
    return 'primary';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-18 flex items-center justify-between transition-all">
      {/* Left side: Hamburger toggle */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search library portal resources..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right side: Notifications + User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserDropdown(false);
            }}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Notifications</span>
                <span className="text-[11px] font-semibold text-indigo-600 cursor-pointer hover:underline">
                  Mark all as read
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 hover:bg-slate-50 rounded-lg px-2 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`
              }
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {user?.name || 'Guest User'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={getRoleVariant(user?.role)} size="sm">
                  {user?.role || 'Member'}
                </Badge>
              </div>
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>My Profile & ID</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
