import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  registration = {},
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 tracking-tight"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        </div>
      )}

      <div className="relative rounded-xl">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}

        <input
          id={inputId}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full rounded-xl border text-sm text-slate-900 placeholder:text-slate-400
            transition-all duration-200 ease-in-out py-2.5
            disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${isPassword ? 'pr-11' : 'pr-3.5'}
            ${
              error
                ? 'bg-rose-50/30 border-rose-300 text-rose-900 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10'
                : 'bg-slate-50/60 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
            }
            focus:outline-none shadow-2xs
          `}
          {...registration}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </span>
          </button>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 font-medium animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
