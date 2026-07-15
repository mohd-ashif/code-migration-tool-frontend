import { useShortcut } from './useShortcut';

export function useGlobalShortcut(
  actionId: string,
  callback: (e: KeyboardEvent) => void,
  active = true
) {
  useShortcut(actionId, callback, { active });
}
export default useGlobalShortcut;
