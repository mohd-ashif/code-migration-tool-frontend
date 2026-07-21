export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export type ToastAction = 
  | { type: 'add'; toast: Toast }
  | { type: 'update'; toast: Toast }
  | { type: 'remove'; id: string };

type ToastListener = (action: ToastAction) => void;

const listeners = new Set<ToastListener>();

export const toast = {
  subscribe(listener: ToastListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  show(message: string, type: ToastType = 'info', duration?: number, existingId?: string): string {
    const id = existingId || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const actionType = existingId ? 'update' : 'add';
    const toastItem: Toast = { id, message, type, duration };

    listeners.forEach((l) => l({ type: actionType, toast: toastItem }));
    return id;
  },

  dismiss(id: string) {
    listeners.forEach((l) => l({ type: 'remove', id }));
  },

  success(message: string, duration?: number, id?: string) {
    return this.show(message, 'success', duration, id);
  },

  error(message: string, duration?: number, id?: string) {
    return this.show(message, 'error', duration, id);
  },

  warning(message: string, duration?: number, id?: string) {
    return this.show(message, 'warning', duration, id);
  },

  info(message: string, duration?: number, id?: string) {
    return this.show(message, 'info', duration, id);
  },

  loading(message: string, duration?: number, id?: string) {
    // Loading toasts default to a long timeout unless dismissed/resolved
    return this.show(message, 'loading', duration || 120_000, id);
  },

  async promise<T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    duration?: number
  ): Promise<T> {
    const id = this.loading(msgs.loading);
    try {
      const result = await promise;
      const successMsg = typeof msgs.success === 'function' ? msgs.success(result) : msgs.success;
      this.success(successMsg, duration, id);
      return result;
    } catch (err: any) {
      const errorMsg = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
      this.error(errorMsg, duration, id);
      throw err;
    }
  }
};

export function useToast() {
  return toast;
}
