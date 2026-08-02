import React, { forwardRef } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  helperText?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, helperText, error, disabled, checked, className = '', id, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              id={inputId}
              type="radio"
              checked={checked}
              disabled={disabled}
              className="sr-only"
              {...props}
            />
            <div
              className={[
                'w-4 h-4 rounded-full border transition-all flex items-center justify-center bg-darkInput',
                checked ? 'border-primary' : 'border-border hover:border-zinc-500',
                error ? 'border-danger' : '',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {checked && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
          </div>

          {label && <span className="text-sm font-medium text-zinc-200 leading-tight">{label}</span>}
        </label>

        {error ? (
          <span className="text-xs font-medium text-danger ml-6.5">{error}</span>
        ) : (
          helperText && <span className="text-xs text-zinc-400 ml-6.5">{helperText}</span>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
export default Radio;
