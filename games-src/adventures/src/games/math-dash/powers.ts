import type { PowerId } from './art';
import { POWERS } from './content';

/** Power-up levels for one run (0 = not picked). */
export type PowerLevels = Record<PowerId, number>;

export const MAX_LEVEL = 5;

export function startingPowers(): PowerLevels {
  return { bell: 1, notes: 0, rug: 0, magnet: 0, cart: 0, sneakers: 0, glasses: 0, cocoa: 0, card: 0 };
}

/** The numbers each power level turns into. Pure, so it can be tested and tuned in one place. */
export function stats(p: PowerLevels) {
  return {
    speed: 4.2 * (1 + 0.08 * p.sneakers),
    capacity: 3 + p.cart + (p.cart >= 5 ? 1 : 0),
    pickup: 0.8 + 0.55 * p.magnet,
    bellEvery: p.bell ? Math.max(1.4, 4.2 - 0.6 * (p.bell - 1)) : 0,
    bellRadius: p.bell ? 1.9 + 0.45 * (p.bell - 1) + (p.bell >= 5 ? 0.6 : 0) : 0,
    notesEvery: p.notes ? Math.max(1.2, 3.2 - 0.45 * (p.notes - 1)) : 0,
    notesCount: p.notes >= 5 ? 3 : p.notes >= 3 ? 2 : p.notes ? 1 : 0,
    noteSpeed: p.notes >= 4 ? 10 : 7.5,
    rugRadius: p.rug ? 1.6 + 0.35 * p.rug : 0,
    rugSlow: p.rug ? Math.min(0.8, 0.3 + 0.1 * p.rug) : 0,
    regen: 0.7 * p.cocoa,
    cardEvery: p.card ? 23 - 3 * p.card : 0,
    glasses: p.glasses > 0,
    pointsBonus: p.glasses > 1 ? 0.2 * (p.glasses - 1) : 0,
  };
}

/** Three different choices for a level-up (fewer if most powers are maxed; "snack" fills the gaps). */
export function offerChoices(p: PowerLevels, rnd: () => number = Math.random): Array<PowerId | 'snack'> {
  const open = POWERS.map((d) => d.id).filter((id) => p[id] < MAX_LEVEL);
  // Shuffle, but powers the player already has are a little more likely (builds feel like builds).
  const weighted = open.map((id) => ({ id, w: rnd() + (p[id] > 0 ? 0.25 : 0) }));
  weighted.sort((a, b) => b.w - a.w);
  const out: Array<PowerId | 'snack'> = weighted.slice(0, 3).map((x) => x.id);
  while (out.length < 3) out.push('snack');
  return out;
}

/** Books needed for the next level-up (it grows slowly). */
export function booksForLevel(level: number): number {
  return Math.min(10, 3 + Math.floor(level / 2));
}
