// explorationState.ts
// Pure TypeScript module — NO Phaser dependency.
//
// Exploration tracker for the Gather campus demo: which of the four campus
// buildings has the player actually walked into? Persisted to localStorage so
// progress survives reloads (the last unbuilt item from the original browser
// demo plan's Day 2 checklist).
//
// The scene detects room entry (player tile inside a GATHER_ROOMS interior)
// and calls markVisited; React HUDs listen to the 'exploration-updated'
// EventBus event.

import { EventBus } from '@/components/phaser/EventBus';

export interface ExplorationRoom {
  id: string;
  label: string;
}

/** Display order for the HUD checklist. Ids match GATHER_ROOMS. */
export const EXPLORATION_ROOMS: ExplorationRoom[] = [
  { id: 'math-hall',     label: 'Math Hall' },
  { id: 'discovery-lab', label: 'Discovery Lab' },
  { id: 'story-grove',   label: 'Story Grove' },
  { id: 'commons',       label: 'The Commons' },
];

export interface ExplorationSnapshot {
  visited: string[];
  total: number;
  percent: number;
  /** Set only on the update caused by a first visit (drives the HUD toast). */
  discovered?: ExplorationRoom;
}

const STORAGE_KEY = 'gather-exploration-v1';

class ExplorationState {
  private visited = new Set<string>();
  private loaded = false;

  private load(): void {
    if (this.loaded) return;
    this.loaded = true;
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids: unknown = JSON.parse(raw);
        if (Array.isArray(ids)) {
          ids
            .filter((id): id is string => typeof id === 'string')
            .filter((id) => EXPLORATION_ROOMS.some((r) => r.id === id))
            .forEach((id) => this.visited.add(id));
        }
      }
    } catch {
      // Corrupt/blocked storage: start fresh
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.visited)));
    } catch {
      // Storage full/blocked: exploration still works in-memory
    }
  }

  snapshot(discovered?: ExplorationRoom): ExplorationSnapshot {
    this.load();
    return {
      visited: Array.from(this.visited),
      total: EXPLORATION_ROOMS.length,
      percent: Math.round((this.visited.size / EXPLORATION_ROOMS.length) * 100),
      discovered,
    };
  }

  /** Mark a room visited. Emits 'exploration-updated'; no-op if already seen. */
  markVisited(roomId: string): void {
    this.load();
    if (this.visited.has(roomId)) return;
    const room = EXPLORATION_ROOMS.find((r) => r.id === roomId);
    if (!room) return;
    this.visited.add(roomId);
    this.save();
    EventBus.emit('exploration-updated', this.snapshot(room));
  }

  /** Emit the current state (scene calls this on create so the HUD hydrates). */
  announce(): void {
    EventBus.emit('exploration-updated', this.snapshot());
  }

  /** Wipe visited rooms (the "Restart Demo" control). */
  reset(): void {
    this.visited.clear();
    this.loaded = true;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    EventBus.emit('exploration-updated', this.snapshot());
  }
}

/** Module singleton — backed by localStorage, shared across scenes/pages. */
export const exploration = new ExplorationState();
