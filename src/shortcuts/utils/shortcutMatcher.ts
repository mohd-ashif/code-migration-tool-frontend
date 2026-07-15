import { Shortcut } from '../types/shortcut';

export function matchShortcut(
  pressedKey: string,
  shortcuts: Shortcut[],
  customPreferences: Record<string, string>,
  disabledPreferences: Record<string, boolean>
): Shortcut | null {
  if (!pressedKey) return null;
  
  const normalizedPressed = pressedKey.toLowerCase();
  
  for (const shortcut of shortcuts) {
    if (disabledPreferences[shortcut.id]) continue;
    const keyBinding = customPreferences[shortcut.id] || shortcut.keys;
    if (keyBinding.toLowerCase() === normalizedPressed) {
      return shortcut;
    }
  }
  return null;
}
