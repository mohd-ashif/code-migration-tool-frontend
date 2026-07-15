export function formatShortcut(keys: string): string {
  if (!keys) return '';
  
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  return keys
    .split('+')
    .map((part) => {
      switch (part.toLowerCase()) {
        case 'control':
          return isMac ? '⌘' : 'Ctrl';
        case 'alt':
          return isMac ? '⌥' : 'Alt';
        case 'shift':
          return isMac ? '⇧' : 'Shift';
        case 'space':
          return 'Space';
        case 'arrowup':
          return '↑';
        case 'arrowdown':
          return '↓';
        case 'arrowleft':
          return '←';
        case 'arrowright':
          return '→';
        case 'escape':
          return 'Esc';
        case 'enter':
          return 'Enter';
        case 'delete':
          return 'Del';
        case 'pageup':
          return 'PgUp';
        case 'pagedown':
          return 'PgDn';
        case 'home':
          return 'Home';
        case 'end':
          return 'End';
        default:
          return part.toUpperCase();
      }
    })
    .join(isMac ? '' : ' + ');
}
