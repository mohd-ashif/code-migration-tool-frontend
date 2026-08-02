import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose',
    },
    warning: {
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-glow-amber',
    },
    primary: {
      iconBg: 'bg-primary/10 text-primary border-primary/20',
      btn: 'bg-primary hover:bg-primary/90 text-white shadow-glow',
    },
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={loading ? undefined : onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md bg-[#0D0E1A] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5"
          >
            {/* Close Button */}
            {!loading && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800/50"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Icon + Title */}
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl border shrink-0 ${variantStyles.iconBg}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 pt-0.5">
                <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="text-xs px-4 py-2 font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`text-xs px-4 py-2 font-semibold rounded-xl transition-all shadow-glow active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 ${variantStyles.btn}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
