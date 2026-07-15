export function parseEvent(e: KeyboardEvent): string {
  const parts: string[] = [];
  
  if (e.ctrlKey || e.metaKey) {
    parts.push('control');
  }
  if (e.altKey) {
    parts.push('alt');
  }
  if (e.shiftKey) {
    parts.push('shift');
  }

  let key = e.key.toLowerCase();
  
  if (key === ' ') {
    key = 'space';
  } else if (key === 'control' || key === 'alt' || key === 'shift' || key === 'meta') {
    return '';
  }

  if (key === '=') {
    key = '+';
  }

  parts.push(key);
  return parts.join('+');
}
