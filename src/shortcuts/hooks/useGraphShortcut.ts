import { useShortcut } from './useShortcut';

export function useGraphShortcut(
  actionId: string,
  callback: (e: KeyboardEvent) => void,
  active = true
) {
  useShortcut(actionId, callback, { context: 'graph', active });
}
export default useGraphShortcut;
