import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  helperText?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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
              type="checkbox"
              checked={checked}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={[
                'w-4 h-4 rounded border transition-all flex items-center justify-center bg-darkInput',
                checked ? 'bg-primary border-primary text-white shadow-glow-sm' : 'border-border hover:border-zinc-500',
                error ? 'border-danger' : '',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {checked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {label && <span className="text-sm font-medium text-zinc-200 leading-tight">{label}</span>}
        </label>

        {error ? (
          <span className="text-xs font-medium text-danger ml-6">{error}</span>
        ) : (
          helperText && <span className="text-xs text-zinc-400 ml-6">{helperText}</span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
