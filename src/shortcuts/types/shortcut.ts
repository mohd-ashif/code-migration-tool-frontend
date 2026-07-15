export type ShortcutCategory =
  | 'General'
  | 'Navigation'
  | 'Files'
  | 'Editor'
  | 'Migration'
  | 'Dependency Graph'
  | 'Search'
  | 'Settings';

export interface Shortcut {
  id: string; // Unique configuration ID
  actionId: string; // Action reference bound in hooks
  keys: string; // e.g. 'control+k', 'alt+1', 'arrowup'
  description: string;
  category: ShortcutCategory;
  context?: string; // Active scope context (e.g. 'editor', 'graph', 'dialog', etc.)
  disabled?: boolean;
}

export interface UserShortcutPreference {
  id: string;
  keys: string;
  disabled: boolean;
}
