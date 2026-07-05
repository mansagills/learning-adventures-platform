// demoEconomy.ts
// Pure TypeScript module — NO Phaser dependency.
//
// Local XP economy for the no-auth demo sandbox: quest rewards add XP, the
// campus shop spends it, and purchases land in a small inventory. Everything
// persists in localStorage so a demo session survives reloads. The authed
// /world/campus page does NOT use this — it awards through /api/world/award.

import { EventBus } from '@/components/phaser/EventBus';
import { playXpChime, playPurchase } from './campusAudio';

export interface DemoShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
}

/** Kid-friendly cosmetics priced around the 100 XP quest reward. */
export const DEMO_SHOP_ITEMS: DemoShopItem[] = [
  { id: 'sticker-pack',  name: 'Sticker Pack',   icon: '✨', cost: 30,  description: 'A mystery pack of shiny campus stickers.' },
  { id: 'campus-cap',    name: 'Campus Cap',     icon: '🧢', cost: 50,  description: 'The classic Learning Adventures cap.' },
  { id: 'racing-helmet', name: 'Racing Helmet',  icon: '🏎️', cost: 80,  description: 'For licensed Math Racers only!' },
  { id: 'golden-trophy', name: 'Golden Trophy',  icon: '🏆', cost: 150, description: 'Proof that you are a campus legend.' },
];

export interface DemoEconomySnapshot {
  xp: number;
  owned: string[];
  /** Set on the update that granted XP (drives the +XP toast). */
  gained?: { amount: number; reason: string };
  /** Set on the update that spent XP. */
  purchased?: DemoShopItem;
}

const XP_KEY = 'gather-demo-xp';
const INVENTORY_KEY = 'gather-demo-inventory';

class DemoEconomy {
  private xp = 0;
  private owned = new Set<string>();
  private loaded = false;

  private load(): void {
    if (this.loaded) return;
    this.loaded = true;
    if (typeof window === 'undefined') return;
    try {
      this.xp = Math.max(0, parseInt(window.localStorage.getItem(XP_KEY) ?? '0', 10) || 0);
      const raw = window.localStorage.getItem(INVENTORY_KEY);
      if (raw) {
        const ids: unknown = JSON.parse(raw);
        if (Array.isArray(ids)) {
          ids
            .filter((id): id is string => typeof id === 'string')
            .forEach((id) => this.owned.add(id));
        }
      }
    } catch {
      // Corrupt/blocked storage: start fresh in-memory
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(XP_KEY, String(this.xp));
      window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(Array.from(this.owned)));
    } catch {
      // Storage blocked: economy still works in-memory
    }
  }

  snapshot(extra?: Pick<DemoEconomySnapshot, 'gained' | 'purchased'>): DemoEconomySnapshot {
    this.load();
    return { xp: this.xp, owned: Array.from(this.owned), ...extra };
  }

  addXP(amount: number, reason: string): void {
    this.load();
    this.xp += amount;
    this.save();
    playXpChime();
    EventBus.emit('demo-economy-updated', this.snapshot({ gained: { amount, reason } }));
  }

  /** Buy a shop item. Returns false if unaffordable or already owned. */
  purchase(itemId: string): boolean {
    this.load();
    const item = DEMO_SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item || this.owned.has(itemId) || this.xp < item.cost) return false;
    this.xp -= item.cost;
    this.owned.add(itemId);
    this.save();
    playPurchase();
    EventBus.emit('demo-economy-updated', this.snapshot({ purchased: item }));
    return true;
  }

  /** Emit current state so HUDs hydrate on mount. */
  announce(): void {
    EventBus.emit('demo-economy-updated', this.snapshot());
  }
}

/** Module singleton — localStorage-backed, demo sandbox only. */
export const demoEconomy = new DemoEconomy();
