import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Library,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'Student',
      department: 'Computer Science',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
    mode: 'onTouched',
  });

  const passwordValue = watch('password', '');

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 10) score += 1;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2) return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser({
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      password: data.password,
    });
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-3 sm:p-5">
      {/* Reduced outer card size to average, balanced dimensions (max-w-3xl) */}
      <div className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left column: Compact Minimalist Branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-6 sm:mb-8">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-indigo-300 shadow-2xs">
                <Library className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight block leading-tight">
                  BookStack<span className="text-indigo-400">Lib</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                  LMS Portal
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-[11px] font-medium text-indigo-200">
                <ShieldCheck className="w-3 h-3 text-indigo-300" />
                <span>Digital Pass</span>
              </span>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                Join our academic learning network.
              </h2>

              <p className="text-xs text-slate-300/90 leading-relaxed font-normal">
                Register once to access catalog searches, book loans, and circulation tracking across all devices.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-5 mt-6 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2.5 text-[11px] text-slate-300">
              <div className="w-4.5 h-4.5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span>Automatic Membership ID assigned</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-slate-300">
              <div className="w-4.5 h-4.5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span>Immediate access to borrowing records</span>
            </div>
          </div>
        </div>

        {/* Right column: Clean Compact Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-center bg-white">
          <div className="w-full">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in your details to register as a library member.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
              {/* Row 1: Full Name & Email (2 columns on sm+) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  id="reg-name"
                  placeholder="e.g. Alexander Vance"
                  icon={User}
                  required
                  error={errors.name?.message}
                  registration={register('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Min 2 characters' },
                  })}
                />

                <Input
                  label="Email Address"
                  id="reg-email"
                  type="email"
                  placeholder="name@university.edu"
                  icon={Mail}
                  required
                  error={errors.email?.message}
                  registration={register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email format',
                    },
                  })}
                />
              </div>

              {/* Row 2: Role & Department (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1">
                    Member Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register('role')}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 focus:bg-white py-2 px-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-2xs"
                  >
                    <option value="Student">Student</option>
                    <option value="Librarian">Librarian Staff</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Science & Tech"
                    {...register('department')}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 focus:bg-white py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 3: Password & Confirm Password (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  required
                  error={errors.password?.message}
                  registration={register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Min 6 characters',
                    },
                  })}
                />

                <Input
                  label="Confirm Password"
                  id="reg-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  required
                  error={errors.confirmPassword?.message}
                  registration={register('confirmPassword', {
                    required: 'Confirm your password',
                    validate: (val) => val === passwordValue || 'Passwords do not match',
                  })}
                />
              </div>

              {/* Password strength indicator */}
              {passwordValue && (
                <div className="space-y-1 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Security:</span>
                    <span className={`font-semibold ${strength.text}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          strength.score >= level ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    {...register('agreeTerms', {
                      required: 'You must agree to circulation rules',
                    })}
                  />
                  <span className="text-[11px] leading-tight">
                    I agree to the <span className="text-indigo-600 font-semibold underline">Library Circulation Policies</span>.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {errors.agreeTerms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-1.5">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={isLoading}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Create Member Account
                </Button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link
                  to="/login"
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
