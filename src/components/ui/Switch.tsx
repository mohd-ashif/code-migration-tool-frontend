import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  helperText?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  helperText,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: { track: 'w-7 h-4', thumb: 'w-3 h-3', translate: 'translate-x-3' },
    md: { track: 'w-10 h-5.5', thumb: 'w-4 h-4', translate: 'translate-x-4.5' },
    lg: { track: 'w-12 h-6.5', thumb: 'w-5 h-5', translate: 'translate-x-5.5' },
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        onClick={() => !disabled && onChange(!checked)}
        className={`inline-flex items-center gap-3 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div
          className={[
            'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out',
            checked ? 'bg-primary' : 'bg-zinc-800 border border-border',
            sizeMap[size].track,
          ].join(' ')}
        >
          <div
            className={[
              'rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out',
              sizeMap[size].thumb,
              checked ? sizeMap[size].translate : 'translate-x-0',
            ].join(' ')}
          />
        </div>

        {label && <span className="text-sm font-medium text-zinc-200">{label}</span>}
      </label>

      {helperText && <span className="text-xs text-zinc-400 ml-13">{helperText}</span>}
    </div>
  );
};

export default Switch;
