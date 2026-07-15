type ShortcutCallback = (e: KeyboardEvent) => void;

class ShortcutRegistry {
  private actions = new Map<string, ShortcutCallback[]>();

  register(actionId: string, callback: ShortcutCallback): () => void {
    const list = this.actions.get(actionId) || [];
    list.push(callback);
    this.actions.set(actionId, list);

    return () => {
      this.unregister(actionId, callback);
    };
  }

  unregister(actionId: string, callback: ShortcutCallback) {
    const list = this.actions.get(actionId) || [];
    const index = list.indexOf(callback);
    if (index !== -1) {
      list.splice(index, 1);
    }
    if (list.length === 0) {
      this.actions.delete(actionId);
    } else {
      this.actions.set(actionId, list);
    }
  }

  trigger(actionId: string, e: KeyboardEvent): boolean {
    const list = this.actions.get(actionId);
    if (!list || list.length === 0) return false;
    
    for (const callback of list) {
      try {
        callback(e);
      } catch (err) {
        console.error(`Error running shortcut callback for action ${actionId}:`, err);
      }
    }
    return true;
  }
}

export const shortcutRegistry = new ShortcutRegistry();
export default shortcutRegistry;
