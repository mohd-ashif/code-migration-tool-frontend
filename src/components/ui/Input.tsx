import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Loader2, Search, AlertCircle, CheckCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  required?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      loading = false,
      required = false,
      disabled = false,
      type = 'text',
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isPassword = type === 'password';
    const isSearch = type === 'search';
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-zinc-300 flex items-center gap-1 select-none"
          >
            {label}
            {required && <span className="text-danger">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {/* Left Icon or Search Icon */}
          {isSearch && !leftIcon ? (
            <Search className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
          ) : (
            leftIcon && <div className="absolute left-3 text-zinc-400 shrink-0 pointer-events-none">{leftIcon}</div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            disabled={disabled || loading}
            className={[
              'w-full bg-darkInput border text-sm text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 transition-all outline-none',
              'focus:border-primary focus:ring-1 focus:ring-primary',
              disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/50' : '',
              error
                ? 'border-danger focus:border-danger focus:ring-danger'
                : success
                ? 'border-success focus:border-success focus:ring-success'
                : 'border-border hover:border-zinc-700',
              isSearch || leftIcon ? 'pl-9' : '',
              isPassword || rightIcon || loading || error || success ? 'pr-9' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {/* Right Icon / Actions */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}

            {!loading && error && <AlertCircle className="w-4 h-4 text-danger shrink-0" />}

            {!loading && !error && success && <CheckCircle className="w-4 h-4 text-success shrink-0" />}

            {!loading && isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-zinc-400 hover:text-white focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}

            {!loading && rightIcon && <div className="text-zinc-400 shrink-0">{rightIcon}</div>}
          </div>
        </div>

        {error ? (
          <span className="text-xs font-medium text-danger">{error}</span>
        ) : (
          helperText && <span className="text-xs text-zinc-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
