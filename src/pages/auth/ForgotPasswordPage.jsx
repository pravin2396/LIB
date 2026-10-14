import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [targetEmail, setTargetEmail] = useState('');
  const [mockCode, setMockCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const newPasswordValue = watch('newPassword', '');

  // Step 1: Send reset code
  const handleSendCode = async (data) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setTargetEmail(data.email);
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setMockCode(generated);
    setIsLoading(false);
    setStep(2);
  };

  // Step 2: Verify code
  const handleVerifyCode = (data) => {
    if (data.code !== mockCode && data.code !== '123456') {
      setError('code', {
        type: 'manual',
        message: 'Invalid verification code. Please check or use the demo code.',
      });
      return;
    }
    setStep(3);
  };

  // Step 3: Reset password
  const handleResetPassword = async (data) => {
    setIsLoading(true);
    const result = await resetPassword(targetEmail, data.newPassword);
    setIsLoading(false);

    if (result.success) {
      setStep(4);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/70 p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50/80 text-indigo-600 mb-4 border border-indigo-100 shadow-2xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Password Recovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
            {step === 1 && 'Enter your registered library email to receive a recovery code.'}
            {step === 2 && `Enter the 6-digit verification code sent to ${targetEmail}.`}
            {step === 3 && 'Create a new secure password for your member account.'}
            {step === 4 && 'Your password has been successfully reset.'}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s ? 'w-7 bg-indigo-600' : step > s ? 'w-4 bg-emerald-500' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSubmit(handleSendCode)} className="space-y-4" noValidate>
            <Input
              label="Registered Email"
              id="forgot-email"
              type="email"
              placeholder="e.g. admin@library.com"
              icon={Mail}
              required
              error={errors.email?.message}
              registration={register('email', {
                required: 'Please enter your registered email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please provide a valid email format',
                },
              })}
            />

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs text-slate-600">
              💡 <strong>Demo tip:</strong> You can test with pre-configured accounts like <code className="text-indigo-600 font-medium">admin@library.com</code> or <code className="text-indigo-600 font-medium">student@library.com</code>.
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Send Recovery Code
            </Button>
          </form>
        )}

        {/* STEP 2: Verify Code */}
        {step === 2 && (
          <form onSubmit={handleSubmit(handleVerifyCode)} className="space-y-4" noValidate>
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900">
              <span className="font-bold">Simulated OTP:</span> Your verification code is{' '}
              <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-600">
                {mockCode}
              </span>
            </div>

            <Input
              label="6-Digit Verification Code"
              id="forgot-code"
              type="text"
              placeholder="e.g. 123456"
              icon={KeyRound}
              required
              error={errors.code?.message}
              registration={register('code', {
                required: 'Verification code is required',
                minLength: { value: 6, message: 'Code must be 6 digits' },
              })}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                icon={ArrowRight}
                iconPosition="right"
              >
                Verify Code
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4" noValidate>
            <Input
              label="New Password"
              id="new-pass"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              error={errors.newPassword?.message}
              registration={register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />

            <Input
              label="Confirm New Password"
              id="confirm-new-pass"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              error={errors.confirmPassword?.message}
              registration={register('confirmPassword', {
                required: 'Please confirm new password',
                validate: (v) => v === newPasswordValue || 'Passwords do not match',
              })}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
              >
                Update Password
              </Button>
            </div>
          </form>
        )}

        {/* STEP 4: Success Message */}
        {step === 4 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Password Changed!</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
              Your password has been successfully updated in LocalStorage. You can now log into your account using your new credentials.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Return to Sign In
              </Button>
            </div>
          </div>
        )}

        {/* Back link */}
        {step !== 4 && (
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
