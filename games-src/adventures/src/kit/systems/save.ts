import { bus } from '../core/events';

/**
 * A small versioned save in localStorage (the Seeds of Genius approach,
 * simplified for shorter games):
 *
 * - every write also keeps the previous good save as a backup;
 * - a damaged save falls back to the backup, then to a fresh start;
 * - `clean` turns untrusted JSON (an old version, a hand-edited file) into a
 *   valid save, so a bad value can never crash the game;
 * - nothing ever leaves the browser.
 */
export class SaveStore<T extends { version: number }> {
  private readonly backupKey: string;

  constructor(
    private readonly key: string,
    private readonly fresh: () => T,
    /** Validate and migrate untrusted data into the current version. */
    private readonly clean: (raw: unknown) => T,
  ) {
    this.backupKey = `${key}.backup`;
  }

  /** Is there a save to continue from? */
  exists(): boolean {
    return this.read(this.key) !== null || this.read(this.backupKey) !== null;
  }

  load(): T {
    const main = this.read(this.key);
    if (main !== null) return this.clean(main);
    const backup = this.read(this.backupKey);
    if (backup !== null) return this.clean(backup);
    return this.fresh();
  }

  save(data: T): boolean {
    try {
      const prev = window.localStorage.getItem(this.key);
      if (prev) window.localStorage.setItem(this.backupKey, prev);
      window.localStorage.setItem(this.key, JSON.stringify(data));
      bus.emit('save:status', { status: 'saved' });
      return true;
    } catch {
      // Private mode or a full disk: the game keeps going, progress lasts this visit.
      bus.emit('save:status', { status: 'error' });
      return false;
    }
  }

  reset(): T {
    try {
      window.localStorage.removeItem(this.key);
      window.localStorage.removeItem(this.backupKey);
    } catch {
      /* nothing to remove */
    }
    return this.fresh();
  }

  private read(key: string): unknown | null {
    try {
      const t = window.localStorage.getItem(key);
      if (!t) return null;
      return JSON.parse(t) as unknown;
    } catch {
      return null;
    }
  }
}
