import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      error,
      required = false,
      disabled = false,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-zinc-300 flex items-center gap-1 select-none">
            {label}
            {required && <span className="text-danger">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={[
              'w-full appearance-none bg-darkInput border text-sm text-white rounded-lg px-3.5 py-2.5 pr-10 transition-all outline-none cursor-pointer',
              'focus:border-primary focus:ring-1 focus:ring-primary',
              disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/50' : '',
              error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border hover:border-zinc-700',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-darkCard text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 w-4 h-4 text-zinc-400 pointer-events-none" />
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

Select.displayName = 'Select';
export default Select;
