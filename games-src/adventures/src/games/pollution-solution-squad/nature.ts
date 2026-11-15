import { add, count, type Inventory } from '../../kit/craft/workbench';
import { NATURE, NATURE_IDS, visitorsFor, type NatureId, type VisitorId } from '../../kit/worlds/wild-lands/coast-art';
import { LOT } from './levels';

/**
 * The Nature Center: the free-building lot beside Beach Camp. Pure rules
 * (what a piece costs, when it unlocks, where it can go) so they can be unit
 * tested; the play screen draws it.
 *
 * Plants come free from the Squad’s seed library. Built things cost spare
 * materials from the backpack (a recycled bench is made of bottles), and
 * taking a piece away gives its materials back.
 */

export interface Placed {
  id: NatureId;
  x: number;
}

/** What each piece costs from the backpack. */
export const NATURE_COST: Record<NatureId, Inventory> = {
  beachgrass: {},
  milkweed: {},
  sunflower: {},
  shadetree: {},
  cattails: {},
  birdbox: { wood: 2 },
  batbox: { wood: 2 },
  beehotel: { wood: 1 },
  dunefence: { wood: 2, rope: 1 },
  compost: { wood: 2 },
  rainbarrel: {},
  amberlight: {},
  bench: { bottle: 3 },
  sign: { wood: 1 },
  lookout: { wood: 4 },
  logpile: { wood: 2 },
};

/** The level that unlocks each piece (half 2 adds the shade tree and the rain barrel). */
export const NATURE_UNLOCK: Partial<Record<NatureId, string>> = {
  beachgrass: 'beach-1',
  sunflower: 'beach-1',
  sign: 'beach-1',
  dunefence: 'beach-1',
  milkweed: 'beach-2',
  compost: 'beach-2',
  bench: 'beach-2',
  birdbox: 'harbor-1',
  beehotel: 'harbor-1',
  amberlight: 'harbor-1',
  cattails: 'harbor-2',
  batbox: 'harbor-2',
  logpile: 'harbor-2',
  lookout: 'harbor-2',
};

export function unlocked(levelsDone: readonly string[]): NatureId[] {
  return NATURE_IDS.filter((id) => {
    const from = NATURE_UNLOCK[id];
    return !!from && levelsDone.includes(from);
  });
}

export function canAfford(inv: Inventory, id: NatureId): boolean {
  return Object.entries(NATURE_COST[id]).every(([m, n]) => count(inv, m) >= n);
}

export function pay(inv: Inventory, id: NatureId, sign: 1 | -1 = 1): Inventory {
  let out = inv;
  for (const [m, n] of Object.entries(NATURE_COST[id])) out = add(out, m, -sign * n);
  return out;
}

/** The columns a piece covers. */
export function cols(p: Placed): number[] {
  return Array.from({ length: NATURE[p.id].w }, (_, i) => p.x + i);
}

/** Why a piece can't go at column x (null when it can). */
export function placeProblem(placed: readonly Placed[], id: NatureId, x: number): string | null {
  const info = NATURE[id];
  const c = cols({ id, x });
  if (c.some((k) => k < LOT.x0 + 1 || k > LOT.x1 - 1)) return 'That doesn’t fit on the lot there.';
  const inPond = c.map((k) => k >= LOT.pond[0] && k <= LOT.pond[1]);
  if (info.layer === 'pond' && !inPond.every(Boolean)) return `${info.name} grow in the pond.`;
  if (info.layer !== 'pond' && inPond.some(Boolean)) return 'That goes on dry ground, not in the pond.';
  const taken = new Set(placed.flatMap(cols));
  if (c.some((k) => taken.has(k))) return 'Something is already there. Take it away first.';
  return null;
}

/** The piece covering column x, if any. */
export function pieceAt(placed: readonly Placed[], x: number): number {
  return placed.findIndex((p) => cols(p).includes(x));
}

export function visitors(placed: readonly Placed[]): VisitorId[] {
  return visitorsFor(
    placed.map((p) => p.id),
    true,
  );
}
