import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      required = false,
      disabled = false,
      maxLength,
      showCharCount = false,
      value,
      defaultValue,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const currentLength = typeof value === 'string' ? value.length : typeof defaultValue === 'string' ? defaultValue.length : 0;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-zinc-300 flex items-center gap-1 select-none">
            {label}
            {required && <span className="text-danger">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          className={[
            'w-full bg-darkInput border text-sm text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 transition-all outline-none min-h-[100px] resize-y',
            'focus:border-primary focus:ring-1 focus:ring-primary',
            disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/50' : '',
            error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border hover:border-zinc-700',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        <div className="flex items-center justify-between gap-2">
          {error ? (
            <span className="text-xs font-medium text-danger">{error}</span>
          ) : (
            helperText ? <span className="text-xs text-zinc-400">{helperText}</span> : <div />
          )}

          {showCharCount && maxLength && (
            <span className="text-xs text-zinc-500 ml-auto">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
