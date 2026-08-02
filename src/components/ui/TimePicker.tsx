import React, { forwardRef } from 'react';
import { Clock } from 'lucide-react';

export interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({ label, helperText, error, required = false, disabled = false, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-zinc-300 flex items-center gap-1 select-none">
            {label}
            {required && <span className="text-danger">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <Clock className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            ref={ref}
            id={inputId}
            type="time"
            disabled={disabled}
            className={[
              'w-full bg-darkInput border text-sm text-white rounded-lg pl-9 pr-3.5 py-2.5 transition-all outline-none',
              'focus:border-primary focus:ring-1 focus:ring-primary [color-scheme:dark]',
              disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/50' : 'hover:border-zinc-700',
              error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
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

TimePicker.displayName = 'TimePicker';
export default TimePicker;
