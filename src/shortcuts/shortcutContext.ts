import { createContext } from 'react';
import { Shortcut } from './types/shortcut';

export interface ShortcutContextType {
  shortcuts: Shortcut[];
  customPreferences: Record<string, string>;
  disabledPreferences: Record<string, boolean>;
  contextStack: string[];
  pushContext: (context: string) => void;
  popContext: (context: string) => void;
  updateShortcut: (id: string, newKeys: string) => void;
  resetShortcuts: () => void;
  disableShortcut: (id: string, disabled: boolean) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  triggerToast: (keys: string, description: string) => void;
  toastMessage: { keys: string; description: string } | null;
}

export const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined);
export default ShortcutContext;
