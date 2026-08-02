import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  helperText,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((item) => item !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((item) => item !== val));
  };

  return (
    <div ref={containerRef} className={`flex flex-col gap-1.5 w-full relative ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1 select-none">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={[
          'min-h-[42px] w-full bg-darkInput border rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 cursor-pointer transition-all',
          disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/50' : 'hover:border-zinc-700',
          error ? 'border-danger' : isOpen ? 'border-primary ring-1 ring-primary' : 'border-border',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1">
          {value.length === 0 ? (
            <span className="text-sm text-zinc-500 select-none">{placeholder}</span>
          ) : (
            value.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 bg-primary/20 text-primary-light border border-primary/30 text-xs px-2 py-0.5 rounded-md font-medium"
                >
                  {opt ? opt.label : val}
                  {!disabled && (
                    <X
                      className="w-3 h-3 hover:text-white cursor-pointer ml-0.5"
                      onClick={(e) => removeValue(val, e)}
                    />
                  )}
                </span>
              );
            })
          )}
        </div>

        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-darkPopover border border-border rounded-lg shadow-dropdown max-h-56 overflow-y-auto p-1"
          >
            {options.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggleOption(opt.value)}
                  className={[
                    'flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors',
                    isSelected ? 'bg-primary/20 text-white font-medium' : 'text-zinc-300 hover:bg-zinc-800/60',
                  ].join(' ')}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <span className="text-xs font-medium text-danger">{error}</span>
      ) : (
        helperText && <span className="text-xs text-zinc-400">{helperText}</span>
      )}
    </div>
  );
};

export default MultiSelect;
