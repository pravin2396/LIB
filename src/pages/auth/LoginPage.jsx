import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Library, BookOpenCheck, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import DemoAccountsBanner from '../../components/auth/DemoAccountsBanner';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleSelectDemo = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Modern Minimalist Branding & Overview */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 mb-6 sm:mb-8">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-indigo-300 shadow-2xs">
                <Library className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight block leading-tight">
                  BookStack<span className="text-indigo-400">Lib</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Academic LMS
                </span>
              </div>
            </div>

            {/* Headline and Narrative */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-xs font-medium text-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                <span>Next-Gen Library System</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                Modern academic management for the digital era.
              </h2>

              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
                Access curated bibliographic collections, manage digital loans, and track circulation analytics effortlessly across devices.
              </p>
            </div>
          </div>

          {/* Minimal Feature Highlights */}
          <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Connecting readers with resources</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Private and secure data handling</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Minimalist Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-center bg-white">
          <div className="w-full">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your credentials to access your library account.
              </p>
            </div>

            {/* Quick Demo Credentials Switcher */}
            <DemoAccountsBanner onSelectAccount={handleSelectDemo} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email Input */}
              <Input
                label="Email Address"
                id="login-email"
                type="email"
                placeholder="name@library.com"
                icon={Mail}
                required
                error={errors.email?.message}
                registration={register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please provide a valid email format',
                  },
                })}
              />

              {/* Password Input with Show/Hide toggle */}
              <Input
                label="Password"
                id="login-password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                required
                error={errors.password?.message}
                registration={register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    {...register('rememberMe')}
                  />
                  <span>Remember my session</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Sign In to Account
                </Button>
              </div>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don’t have a library account yet?{' '}
                <Link
                  to="/register"
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Register as New Member
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
