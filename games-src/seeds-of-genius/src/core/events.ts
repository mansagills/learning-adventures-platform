/**
 * A tiny typed event bus. Systems announce what happened ("an item was
 * granted", "the quest changed") and the UI, audio and save systems listen,
 * so no system needs to import the others directly.
 */
export interface GameEvents {
  'quest:changed': { chapterId: string };
  'item:granted': { itemId: string; from: string };
  'item:used': { itemId: string; usedIn: string };
  'chapter:completed': { chapterId: string; xp: number; seeds: number };
  'rewards:changed': { xp: number; seeds: number };
  'dialogue:started': { conversationId: string };
  'dialogue:ended': { conversationId: string };
  'time:changed': { minutes: number };
  'save:status': { status: 'saving' | 'saved' | 'error' | 'recovered'; message?: string };
  'settings:changed': Record<string, never>;
  'appearance:changed': Record<string, never>;
  'scene:changed': { scene: string };
  'toast': { text: string; kind?: 'item' | 'info' | 'reward' | 'hint' };
}

type Handler<T> = (payload: T) => void;

export class EventBus {
  private handlers = new Map<keyof GameEvents, Set<Handler<unknown>>>();

  on<K extends keyof GameEvents>(type: K, handler: Handler<GameEvents[K]>): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler as Handler<unknown>);
    return () => set!.delete(handler as Handler<unknown>);
  }

  emit<K extends keyof GameEvents>(type: K, payload: GameEvents[K]): void {
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

export const bus = new EventBus();
