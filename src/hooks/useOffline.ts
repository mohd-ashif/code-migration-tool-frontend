// ── useOffline ─────────────────────────────────────────────────────────────────
// Subscribes to window online/offline events and syncs the status into Redux so
// any component can read `state.ui.isOffline`. Also shows informational toasts
// on transition.

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../store';
import { setOfflineStatus } from '../store/slices/uiSlice';
import { useToast } from '../shared/components/NotificationToast';
import { logger } from '../utils/logger';

export function useOffline(): void {
  const dispatch = useAppDispatch();
  const toast = useToast();
  // Avoid toasting on the initial mount (the page is presumably online already)
  const mounted = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOfflineStatus(false));
      logger.info('[Network] Connection restored — online mode active.');
      if (mounted.current) {
        toast.success('Connection restored. Back online!');
      }
    };

    const handleOffline = () => {
      dispatch(setOfflineStatus(true));
      logger.warn('[Network] Connection lost — offline mode active.');
      if (mounted.current) {
        toast.error('Connection lost. You are offline.');
      }
    };

    // Sync initial state in case we mount already offline
    dispatch(setOfflineStatus(!navigator.onLine));

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    mounted.current = true;

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, toast]);
}
