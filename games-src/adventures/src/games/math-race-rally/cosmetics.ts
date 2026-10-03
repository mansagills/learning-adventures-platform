/**
 * The garage: cosmetic upgrades for the car, bought with bolts won at the
 * pit stop (Math Memory Match). They change only how the car looks, never
 * how fast it goes, so speed always comes from the math.
 */

export type Slot = 'body' | 'paint' | 'stripe' | 'wheels' | 'spoiler';
export const SLOTS: Slot[] = ['body', 'paint', 'stripe', 'wheels', 'spoiler'];
export const SLOT_NAME: Record<Slot, string> = { body: 'Car type', paint: 'Paint', stripe: 'Style', wheels: 'Wheels', spoiler: 'Spoiler' };

export interface Part {
  id: string;
  slot: Slot;
  name: string;
  /** Bolts. 0 means you start with it. */
  cost: number;
  /** A color for paints and wheels. */
  color?: string;
  shade?: string;
}

export const PARTS: Part[] = [
  { id: 'kart', slot: 'body', name: 'Go-kart', cost: 0 },
  { id: 'roadster', slot: 'body', name: 'Roadster', cost: 30 },
  { id: 'bubble', slot: 'body', name: 'Bubble car', cost: 40 },
  { id: 'pickup', slot: 'body', name: 'Pickup truck', cost: 45 },
  { id: 'rocket', slot: 'body', name: 'Rocket racer', cost: 70 },

  { id: 'red', slot: 'paint', name: 'Racing red', cost: 0, color: '#d2453a', shade: '#a3302a' },
  { id: 'blue', slot: 'paint', name: 'Sky blue', cost: 6, color: '#3f7fd6', shade: '#2d5fa8' },
  { id: 'yellow', slot: 'paint', name: 'Sunny yellow', cost: 6, color: '#f2c94c', shade: '#c99a22' },
  { id: 'green', slot: 'paint', name: 'Lime green', cost: 6, color: '#5fbf4a', shade: '#3f8f32' },
  { id: 'purple', slot: 'paint', name: 'Grape', cost: 8, color: '#8a5cc4', shade: '#6a429e' },
  { id: 'pink', slot: 'paint', name: 'Bubblegum', cost: 8, color: '#e47aa6', shade: '#b8567f' },
  { id: 'orange', slot: 'paint', name: 'Tangerine', cost: 8, color: '#e8832e', shade: '#b86218' },
  { id: 'black', slot: 'paint', name: 'Midnight', cost: 10, color: '#2f3440', shade: '#1c1f27' },
  { id: 'silver', slot: 'paint', name: 'Silver', cost: 12, color: '#c9ced6', shade: '#9aa1ad' },
  { id: 'gold', slot: 'paint', name: 'Gold', cost: 25, color: '#e8b830', shade: '#b8861a' },

  { id: 'plain', slot: 'stripe', name: 'Plain', cost: 0 },
  { id: 'stripe', slot: 'stripe', name: 'Racing stripes', cost: 10 },
  { id: 'stars', slot: 'stripe', name: 'Stars', cost: 16 },
  { id: 'flames', slot: 'stripe', name: 'Flames', cost: 18 },
  { id: 'checker', slot: 'stripe', name: 'Checkers', cost: 20 },
  { id: 'bolt', slot: 'stripe', name: 'Lightning', cost: 22 },

  { id: 'tires', slot: 'wheels', name: 'Black tires', cost: 0, color: '#2b2b33' },
  { id: 'white', slot: 'wheels', name: 'White walls', cost: 6, color: '#f4f1e8' },
  { id: 'goldrims', slot: 'wheels', name: 'Gold rims', cost: 15, color: '#e8b830' },
  { id: 'neon', slot: 'wheels', name: 'Neon glow', cost: 18, color: '#4fe8d0' },

  { id: 'nowing', slot: 'spoiler', name: 'No spoiler', cost: 0 },
  { id: 'lip', slot: 'spoiler', name: 'Small spoiler', cost: 10 },
  { id: 'wing', slot: 'spoiler', name: 'Big wing', cost: 18 },
];

export type CarLook = Record<Slot, string>;
export const STARTING_LOOK: CarLook = { body: 'kart', paint: 'red', stripe: 'plain', wheels: 'tires', spoiler: 'nowing' };
export const STARTING_OWNED = PARTS.filter((p) => p.cost === 0).map((p) => p.id);

export const partById = (id: string): Part | undefined => PARTS.find((p) => p.id === id);

/** A look that only uses parts that exist and are owned (for loading a save). */
export function cleanLook(look: Partial<Record<Slot, unknown>>, owned: string[]): CarLook {
  const out = { ...STARTING_LOOK };
  for (const s of SLOTS) {
    const id = look[s];
    const p = typeof id === 'string' ? partById(id) : undefined;
    if (p && p.slot === s && owned.includes(p.id)) out[s] = p.id;
  }
  return out;
}

/** What buying a part leaves (or null if the player cannot afford it or already owns it). */
export function buy(bolts: number, owned: string[], id: string): { bolts: number; owned: string[] } | null {
  const p = partById(id);
  if (!p || owned.includes(id) || bolts < p.cost) return null;
  return { bolts: bolts - p.cost, owned: [...owned, id] };
}

/** The rival's look (fixed, so the player can always tell the cars apart). */
export const RIVAL_LOOK: CarLook = { body: 'roadster', paint: 'black', stripe: 'bolt', wheels: 'neon', spoiler: 'wing' };

/** Tracks, unlocked by winning races. */
export interface Track {
  id: string;
  name: string;
  /** Wins needed before it opens. */
  wins: number;
}
export const TRACKS: Track[] = [
  { id: 'hills', name: 'Sunny Hills', wins: 0 },
  { id: 'desert', name: 'Desert Canyon', wins: 1 },
  { id: 'seaside', name: 'Seaside', wins: 3 },
  { id: 'city', name: 'Neon City', wins: 5 },
];
