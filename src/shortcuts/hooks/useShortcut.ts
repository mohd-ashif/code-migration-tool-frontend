import { useEffect, useContext } from 'react';
import { ShortcutContext } from '../shortcutContext';
import { shortcutRegistry } from '../shortcutRegistry';

export function useShortcut(
  actionId: string,
  callback: (e: KeyboardEvent) => void,
  options?: { context?: string; active?: boolean }
) {
  const contextData = useContext(ShortcutContext);
  if (!contextData) {
    throw new Error('useShortcut must be used within a ShortcutProvider');
  }

  const { pushContext, popContext } = contextData;
  const context = options?.context;
  const active = options?.active !== false;

  useEffect(() => {
    if (!active) return;

    if (context) {
      pushContext(context);
    }

    const unregister = shortcutRegistry.register(actionId, callback);

    return () => {
      unregister();
      if (context) {
        popContext(context);
      }
    };
  }, [actionId, callback, context, active, pushContext, popContext]);
}
export default useShortcut;
