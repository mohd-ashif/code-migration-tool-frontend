import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X, XCircle, Loader2 } from 'lucide-react';
import { toast, Toast as ToastType, ToastAction } from '../../services/toast/toast.service';

const ICONS: Record<ToastType['type'], any> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const COLORS: Record<ToastType['type'], { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: 'text-emerald-400' },
  error: { bg: 'bg-rose-500/10', border: 'border-rose-500/25', icon: 'text-rose-400' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/25', icon: 'text-amber-400' },
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/25', icon: 'text-blue-400' },
  loading: { bg: 'bg-[#7C6CFF]/10', border: 'border-[#7C6CFF]/25', icon: 'text-[#7C6CFF]' },
};

function ToastItem({ toastItem, onClose }: { toastItem: ToastType; onClose: (id: string) => void }) {
  const { bg, border, icon } = COLORS[toastItem.type];
  const Icon = ICONS[toastItem.type];

  useEffect(() => {
    if (toastItem.type === 'loading') return;
    const timer = setTimeout(() => onClose(toastItem.id), toastItem.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toastItem.id, toastItem.type, toastItem.duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-glow-sm backdrop-blur-xl max-w-sm w-full select-none ${bg} ${border}`}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${icon} ${toastItem.type === 'loading' ? 'animate-spin' : ''}`} />
      <p className="text-xs font-sans text-white flex-1 leading-snug">{toastItem.message}</p>
      
      {toastItem.type !== 'loading' && (
        <button
          onClick={() => onClose(toastItem.id)}
          className="text-zinc-400 hover:text-white transition-colors mt-0.5 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = toast.subscribe((action: ToastAction) => {
      if (action.type === 'add') {
        setToasts((prev) => [...prev.slice(-4), action.toast]);
      } else if (action.type === 'update') {
        setToasts((prev) =>
          prev.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t))
        );
      } else if (action.type === 'remove') {
        removeToast(action.id);
      }
    });

    return unsubscribe;
  }, [removeToast]);

  return (
    <>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toastItem={t} onClose={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
