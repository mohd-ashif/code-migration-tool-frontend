import { useShortcut } from './useShortcut';

export function useEditorShortcut(
  actionId: string,
  callback: (e: KeyboardEvent) => void,
  active = true
) {
  useShortcut(actionId, callback, { context: 'editor', active });
}
export default useEditorShortcut;
