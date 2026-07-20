import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';
import { defaultTransition } from '../../animations/variants';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#06060c]/85 backdrop-blur-sm"
          />

          {/* Dialog Card Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={defaultTransition}
            className="relative w-full max-w-md bg-[#121324] border border-[#1E1F35]/70 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
          >
            {/* Top Glow bar for premium styling */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
                isDestructive ? 'from-rose-500/0 via-rose-500 to-rose-500/0' : 'from-[#7C6CFF]/0 via-[#7C6CFF] to-[#7C6CFF]/0'
              }`}
            />

            {/* Close Cross icon */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              {/* Alert Indicator icon container */}
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  isDestructive
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-[#7C6CFF]/10 text-[#7C6CFF] border border-[#7C6CFF]/20'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="space-y-1.5 flex-1 select-none">
                <h3 className="text-white font-bold text-sm leading-snug">{title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{message}</p>
              </div>
            </div>

            {/* Action Row buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#1E1F35]/30">
              <Button
                variant="ghost"
                onClick={onClose}
                className="px-4 py-2 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                {cancelLabel}
              </Button>
              <Button
                variant={isDestructive ? 'danger' : 'primary'}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
