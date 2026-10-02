/**
 * A tiny typed event bus. Systems announce what happened ("settings
 * changed", "show a toast") and the UI, audio and save systems listen, so no
 * system needs to import the others directly.
 */
export interface KitEvents {
  'settings:changed': Record<string, never>;
  'save:status': { status: 'saved' | 'error' };
  toast: { text: string; kind?: 'info' | 'reward' | 'hint' };
}

type Handler<T> = (payload: T) => void;

export class EventBus<E extends object = KitEvents> {
  private handlers = new Map<keyof E, Set<Handler<unknown>>>();

  on<K extends keyof E>(type: K, handler: Handler<E[K]>): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler as Handler<unknown>);
    return () => set!.delete(handler as Handler<unknown>);
  }

  emit<K extends keyof E>(type: K, payload: E[K]): void {
    this.handlers.get(type)?.forEach((h) => {
      try {
        h(payload);
      } catch (err) {
        // One broken listener must never stop the others (or the game loop).
        console.error(`[events] listener for ${String(type)} failed`, err);
      }
    });
  }
}

export const bus = new EventBus<KitEvents>();
