import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShortcutContext, ShortcutContextType } from './shortcutContext';
import { defaultShortcuts } from './defaultShortcuts';
import { parseEvent } from './utils/keyParser';
import { matchShortcut } from './utils/shortcutMatcher';
import { shortcutRegistry } from './shortcutRegistry';

export const ShortcutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customPreferences, setCustomPreferences] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('custom_shortcuts');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [disabledPreferences, setDisabledPreferences] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('disabled_shortcuts');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [contextStack, setContextStack] = useState<string[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ keys: string; description: string } | null>(null);

  const activeContext = useMemo(() => {
    return contextStack.length > 0 ? contextStack[contextStack.length - 1] : 'global';
  }, [contextStack]);

  const pushContext = useCallback((context: string) => {
    setContextStack((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === context) return prev;
      return [...prev, context];
    });
  }, []);

  const popContext = useCallback((context: string) => {
    setContextStack((prev) => {
      const lastIndex = prev.lastIndexOf(context);
      if (lastIndex === -1) return prev;
      const next = [...prev];
      next.splice(lastIndex, 1);
      return next;
    });
  }, []);

  const updateShortcut = useCallback((id: string, newKeys: string) => {
    setCustomPreferences((prev) => {
      const updated = { ...prev, [id]: newKeys };
      localStorage.setItem('custom_shortcuts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetShortcuts = useCallback(() => {
    setCustomPreferences({});
    setDisabledPreferences({});
    localStorage.removeItem('custom_shortcuts');
    localStorage.removeItem('disabled_shortcuts');
  }, []);

  const disableShortcut = useCallback((id: string, disabled: boolean) => {
    setDisabledPreferences((prev) => {
      const updated = { ...prev, [id]: disabled };
      localStorage.setItem('disabled_shortcuts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const triggerToast = useCallback((keys: string, description: string) => {
    setToastMessage({ keys, description });
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const parsedKey = parseEvent(e);
      if (isInput && parsedKey !== 'escape') {
        return;
      }

      const matched = matchShortcut(parsedKey, defaultShortcuts, customPreferences, disabledPreferences);
      if (matched) {
        const isGlobal = !matched.context;
        const matchesContext = matched.context === activeContext;

        if (isGlobal || matchesContext) {
          const didTrigger = shortcutRegistry.trigger(matched.actionId, e);
          
          if (didTrigger || isGlobal) {
            e.preventDefault();
            e.stopPropagation();
            triggerToast(matched.keys, matched.description);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [customPreferences, disabledPreferences, activeContext, triggerToast]);

  const value = useMemo<ShortcutContextType>(() => ({
    shortcuts: defaultShortcuts,
    customPreferences,
    disabledPreferences,
    contextStack,
    pushContext,
    popContext,
    updateShortcut,
    resetShortcuts,
    disableShortcut,
    isHelpOpen,
    setIsHelpOpen,
    triggerToast,
    toastMessage,
  }), [
    customPreferences,
    disabledPreferences,
    contextStack,
    pushContext,
    popContext,
    updateShortcut,
    resetShortcuts,
    disableShortcut,
    isHelpOpen,
    toastMessage,
    triggerToast,
  ]);

  return (
    <ShortcutContext.Provider value={value}>
      {children}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] pointer-events-none animate-fadeIn">
          <div className="bg-[#12131F]/90 border border-primary/30 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-glow flex items-center gap-3 font-mono text-[10px] text-gray-300">
            <span className="px-1.5 py-0.5 bg-primary/20 text-primary border border-primary/20 rounded font-bold uppercase tracking-wider text-[8px]">
              Shortcut
            </span>
            <span>{toastMessage.description}</span>
            <kbd className="px-1.5 py-0.5 bg-[#1E1F35] border border-border text-white rounded text-[8px] font-bold shadow-glow-sm">
              {toastMessage.keys.toUpperCase()}
            </kbd>
          </div>
        </div>
      )}
    </ShortcutContext.Provider>
  );
};
export default ShortcutProvider;
