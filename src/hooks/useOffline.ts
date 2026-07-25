import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { setOfflineStatus } from '../store/slices/uiSlice';
import { toast } from '../services/toast/toast.service';
import { logger } from '../utils/logger';

export function useOffline() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOfflineStatus(false));
      toast.success('Connection restored. Online mode enabled.');
      logger.info('Network status changed: ONLINE');
    };

    const handleOffline = () => {
      dispatch(setOfflineStatus(true));
      toast.error('Connection lost. Offline mode activated.');
      logger.warn('Network status changed: OFFLINE');
    };

    // Set initial status
    if (typeof navigator !== 'undefined') {
      dispatch(setOfflineStatus(!navigator.onLine));
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);
}
