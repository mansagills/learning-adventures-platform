// storyItems.ts
// Pure TypeScript module — NO Phaser/React dependency.
//
// Season 1 story items (Quest Dev Brief): guaranteed, non-random rewards
// granted ONCE on a chapter's first clear — e.g. the "Null Fragment" from
// Chapter 1. Persisted to localStorage so a replay never re-grants (the
// brief's first-clear-only rule), and so the pitch can show a kid's
// recovered fragments surviving a reload.
//
// Sandbox-scope demo state (like demoEconomy / playerIdentity). The authed
// campus would persist these server-side instead; nothing here touches it.

import { EventBus } from '@/components/phaser/EventBus';

const STORY_KEY = 'gather-demo-story-items';

export interface StoryItem {
  id: string;
  label: string;
  emoji: string;
}

class StoryItems {
  private owned = new Map<string, StoryItem>();
  private loaded = false;

  private load(): void {
    if (this.loaded) return;
    this.loaded = true;
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORY_KEY);
      if (!raw) return;
      const arr: unknown = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach((it) => {
          if (it && typeof it.id === 'string') this.owned.set(it.id, it as StoryItem);
        });
      }
    } catch {
      // corrupt/blocked storage — start empty, harmless
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORY_KEY, JSON.stringify(Array.from(this.owned.values())));
    } catch {
      // storage blocked — item lives for this session only
    }
  }

  has(id: string): boolean {
    this.load();
    return this.owned.has(id);
  }

  list(): StoryItem[] {
    this.load();
    return Array.from(this.owned.values());
  }

  /**
   * Grant a story item. Returns true only on the FIRST grant (per the brief:
   * replays pay XP/points but never re-grant the item). Emits a snapshot so
   * HUD chips / the activity feed can react.
   */
  grant(item: StoryItem): boolean {
    this.load();
    if (this.owned.has(item.id)) return false;
    this.owned.set(item.id, item);
    this.persist();
    EventBus.emit('story-item-granted', item);
    EventBus.emit('story-items-updated', this.list());
    return true;
  }

  /** Re-emit the current set (HUD hydration after mount). */
  announce(): void {
    EventBus.emit('story-items-updated', this.list());
  }

  reset(): void {
    this.owned.clear();
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(STORY_KEY); } catch { /* ignore */ }
    }
    EventBus.emit('story-items-updated', this.list());
  }
}

/** Module singleton. */
export const storyItems = new StoryItems();

/** The Chapter 1 reward. */
export const NULL_FRAGMENT: StoryItem = { id: 'null-fragment', label: 'Null Fragment', emoji: '🧊' };
