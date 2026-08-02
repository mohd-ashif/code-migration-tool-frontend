import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: React.ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toast: (options: Omit<ToastMessage, 'id'>) => string;
  success: (message: React.ReactNode, title?: string) => string;
  error: (message: React.ReactNode, title?: string) => string;
  warning: (message: React.ReactNode, title?: string) => string;
  info: (message: React.ReactNode, title?: string) => string;
  loading: (message: React.ReactNode, title?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-danger shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
  info: <Info className="w-5 h-5 text-info shrink-0" />,
  loading: <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />,
};

const toastBorders: Record<ToastType, string> = {
  success: 'border-success/30 shadow-glow-success',
  error: 'border-danger/30 shadow-glow-danger',
  warning: 'border-warning/30 shadow-glow-warning',
  info: 'border-info/30',
  loading: 'border-primary/30 shadow-glow',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (options: Omit<ToastMessage, 'id'>) => {
      // Duplicate prevention based on content & type
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      const newToast: ToastMessage = { ...options, id };

      setToasts((prev) => {
        const isDuplicate = prev.some(
          (t) => t.type === options.type && t.message === options.message && t.title === options.title
        );
        if (isDuplicate) return prev;
        return [...prev, newToast];
      });

      if (options.type !== 'loading' && options.duration !== 0) {
        const autoDismissTime = options.duration || 4000;
        setTimeout(() => {
          dismiss(id);
        }, autoDismissTime);
      }

      return id;
    },
    [dismiss]
  );

  const success = useCallback((message: React.ReactNode, title?: string) => addToast({ type: 'success', message, title }), [addToast]);
  const error = useCallback((message: React.ReactNode, title?: string) => addToast({ type: 'error', message, title }), [addToast]);
  const warning = useCallback((message: React.ReactNode, title?: string) => addToast({ type: 'warning', message, title }), [addToast]);
  const info = useCallback((message: React.ReactNode, title?: string) => addToast({ type: 'info', message, title }), [addToast]);
  const loading = useCallback((message: React.ReactNode, title?: string) => addToast({ type: 'loading', message, title }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info, loading, dismiss, dismissAll }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={[
                'pointer-events-auto flex items-start gap-3 p-4 bg-darkCard/95 border backdrop-blur-md rounded-xl shadow-dialog text-white overflow-hidden relative',
                toastBorders[toast.type],
              ].join(' ')}
            >
              {toastIcons[toast.type]}

              <div className="flex-1 flex flex-col gap-0.5">
                {toast.title && <h4 className="text-xs font-bold text-white uppercase tracking-wider">{toast.title}</h4>}
                <div className="text-xs text-zinc-300 leading-normal">{toast.message}</div>

                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      dismiss(toast.id);
                    }}
                    className="text-xs font-bold text-primary hover:underline mt-1 self-start cursor-pointer"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              <button
                onClick={() => dismiss(toast.id)}
                className="text-zinc-500 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
