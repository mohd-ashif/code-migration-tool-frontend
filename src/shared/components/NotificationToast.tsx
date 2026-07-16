import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const ICONS: Record<ToastType, any> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: 'text-emerald-400' },
  error: { bg: 'bg-rose-500/10', border: 'border-rose-500/25', icon: 'text-rose-400' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/25', icon: 'text-amber-400' },
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/25', icon: 'text-blue-400' },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const { bg, border, icon } = COLORS[toast.type];
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl max-w-sm w-full ${bg} ${border}`}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${icon}`} />
      <p className="text-sm text-white flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-zinc-500 hover:text-white transition-colors mt-0.5 shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  }, []);

  const value: ToastContextValue = {
    show,
    success: (m, d) => show(m, 'success', d),
    error: (m, d) => show(m, 'error', d),
    warning: (m, d) => show(m, 'warning', d),
    info: (m, d) => show(m, 'info', d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onClose={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
