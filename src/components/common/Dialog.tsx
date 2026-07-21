import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { defaultTransition } from '../../animations/variants';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}: DialogProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[95vw] h-[90vh]',
  };

  const dialogElement = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#06060c]/85 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={defaultTransition}
            className={`relative w-full ${sizeClasses[size]} bg-[#121324] border border-[#1E1F35]/70 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden flex flex-col ${className}`}
          >
            {/* Top decorative glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7C6CFF]/0 via-[#7C6CFF] to-[#7C6CFF]/0" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1E1F35]/30">
              {title && <h3 className="text-white font-bold text-sm select-none">{title}</h3>}
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto min-h-0 select-none">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined'
    ? createPortal(dialogElement, document.body)
    : null;
}
