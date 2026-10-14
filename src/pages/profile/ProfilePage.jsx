import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Building,
  Phone,
  Shield,
  Key,
  Calendar,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const ProfilePage = () => {
  const { user, updateProfile, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  // General profile form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || 'General Studies',
      phone: user?.phone || '+1 (555) 234-5678',
    },
  });

  // Password change form
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passErrors, isSubmitting: isPassSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPass = watchPassword('newPassword', '');

  const onSaveProfile = (data) => {
    updateProfile({
      name: data.name,
      department: data.department,
      phone: data.phone,
    });
  };

  const onUpdatePassword = async (data) => {
    const res = await resetPassword(user.email, data.newPassword);
    if (res.success) {
      resetPasswordForm();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl object-cover border-4 border-indigo-100 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name}</h1>
              <Badge variant="purple" size="sm">
                {user?.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Membership ID: <strong className="text-slate-700">{user?.membershipId}</strong>
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined: {user?.memberSince || '2024-01-01'}</span>
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'general'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security & Password
          </button>
        </div>
      </div>

      {/* Tab 1: General Info */}
      {activeTab === 'general' && (
        <Card title="Account Details" subtitle="Update your personal information">
          <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                id="profile-name"
                icon={User}
                required
                error={profileErrors.name?.message}
                registration={regProfile('name', { required: 'Name is required' })}
              />

              <Input
                label="Email Address"
                id="profile-email"
                type="email"
                icon={Mail}
                disabled
                helperText="Email is your unique identifier and cannot be altered"
                registration={regProfile('email')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department / Field"
                id="profile-dept"
                icon={Building}
                registration={regProfile('department')}
              />

              <Input
                label="Phone Number"
                id="profile-phone"
                icon={Phone}
                registration={regProfile('phone')}
              />
            </div>

            <div className="pt-3">
              <Button type="submit" variant="primary" loading={isProfileSubmitting}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <Card title="Password & Security" subtitle="Update your account credentials">
          <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4 max-w-md">
            <Input
              label="New Password"
              id="update-new-password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              error={passErrors.newPassword?.message}
              registration={regPassword('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />

            <Input
              label="Confirm New Password"
              id="update-confirm-password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              error={passErrors.confirmPassword?.message}
              registration={regPassword('confirmPassword', {
                required: 'Please confirm new password',
                validate: (v) => v === newPass || 'Passwords do not match',
              })}
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" loading={isPassSubmitting}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
