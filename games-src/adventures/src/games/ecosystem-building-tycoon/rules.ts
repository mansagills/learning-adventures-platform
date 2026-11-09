/**
 * Ecosystem Building Tycoon: the island, the tiles and the scoring, as pure
 * functions (no drawing, no timers) so every rule can be unit tested and
 * checked against the science.
 *
 * A run is one island. Each season the player gets a hand of tiles (plants,
 * animals, decomposers, habitat features) and places one. The island's
 * health is worked out fresh from the whole board after every move, so it
 * always shows how well the ecosystem works right now:
 *
 *   - Plants (producers) make their own food from sunlight: every plant
 *     scores. Water next to a land plant, rich ground, and pollinators
 *     (bees and butterflies next to flowers and berry bushes) add more.
 *   - A plant-eater scores only next to a plant it really eats; a meat-eater
 *     only next to an animal it really eats. A plant, its eater and that
 *     eater's hunter in a row make a food chain bonus.
 *   - Decomposers (mushrooms, worms, dung beetles) score only with dead
 *     things to break down (a fallen log, fallen leaves, a plant-eater's
 *     dung), and then they make rich soil that feeds every plant next to
 *     them.
 *   - A full loop (a food chain plus a working decomposer next to a plant)
 *     is the circle of life bonus.
 *   - Balance, the energy pyramid: more plant-eaters than plants, or more
 *     meat-eaters than plant-eaters, costs points, because there is not
 *     enough food to go round.
 *   - An invasive vine shades the plants next to it and spreads every other
 *     season, unless native plants crowd it out.
 *
 * Each island has health targets to reach by set seasons (3 on a short run,
 * 5 on a long one). Reaching one opens a research choice; missing one ends
 * the run gently, and Warden Nia says what held the island back.
 */

import { PIECES, type Ground, type PieceId, type Role } from '../../kit/worlds/wild-lands/eco-art';

export type Rand = () => number;

export type IslandKind = 'meadow' | 'pond' | 'woods' | 'wetland' | 'archipelago';
/** Every island type, in the order they open. The Archipelago (the finale) joins the other four. */
export const ISLAND_KINDS: IslandKind[] = ['meadow', 'pond', 'woods', 'wetland', 'archipelago'];
/** The four island types with their own Field Notebook questions. */
export type HomeKind = Exclude<IslandKind, 'archipelago'>;
export const HOME_KINDS: HomeKind[] = ['meadow', 'pond', 'woods', 'wetland'];
export type RunLength = 'short' | 'long';

/** The usual island grid; the Archipelago is bigger. */
export const W = 12;
export const H = 8;

export function sizeOf(kind: IslandKind): { w: number; h: number } {
  return kind === 'archipelago' ? { w: 16, h: 10 } : { w: W, h: H };
}

export interface Island {
  kind: IslandKind;
  w: number;
  h: number;
  /** One per cell, row by row; null is the sea. */
  ground: Array<Ground | null>;
}

export interface Board {
  island: Island;
  pieces: Array<PieceId | null>;
}

// ------------------------------------------------------------------ the living things

/** Where a tile can go: on land, in the water, at the water's edge (water or mud), or anywhere dry (fallen logs, leaves and rock piles). */
export type Habitat = 'land' | 'water' | 'edge' | 'any';

export const HABITAT: Record<PieceId, Habitat> = {
  grass: 'land',
  flowers: 'land',
  berries: 'land',
  oak: 'land',
  reeds: 'edge',
  lilies: 'water',
  rabbit: 'land',
  deer: 'land',
  mouse: 'land',
  bee: 'land',
  butterfly: 'land',
  snail: 'water',
  duck: 'water',
  fox: 'land',
  hawk: 'land',
  owl: 'land',
  frog: 'edge',
  fish: 'water',
  heron: 'edge',
  mushrooms: 'land',
  worms: 'land',
  beetle: 'land',
  log: 'any',
  leaves: 'any',
  stones: 'any',
  vine: 'land',
};

/** What each animal really eats (from the tiles in the game). */
export const EATS: Partial<Record<PieceId, PieceId[]>> = {
  rabbit: ['grass', 'flowers'],
  deer: ['grass', 'berries', 'oak'],
  mouse: ['grass', 'berries'],
  bee: ['flowers', 'berries'],
  butterfly: ['flowers'],
  snail: ['lilies', 'reeds'],
  duck: ['lilies', 'reeds', 'snail'],
  fox: ['rabbit', 'mouse'],
  hawk: ['rabbit', 'mouse'],
  owl: ['mouse'],
  frog: ['bee', 'butterfly', 'snail'],
  fish: ['snail', 'butterfly'],
  heron: ['fish', 'frog'],
};

/** What each decomposer breaks down. The dung beetle uses the dung of big plant-eaters. */
export const BREAKS_DOWN: Partial<Record<PieceId, PieceId[]>> = {
  mushrooms: ['log', 'leaves'],
  worms: ['leaves', 'log'],
  beetle: ['deer', 'rabbit'],
};

const POLLINATORS: PieceId[] = ['bee', 'butterfly'];
const POLLINATED: PieceId[] = ['flowers', 'berries'];
/** Small animals that shelter in a rock pile. */
const SHELTERS: PieceId[] = ['mouse', 'beetle', 'snail', 'frog'];

export function role(id: PieceId): Role {
  return PIECES[id].role;
}

const isProducer = (id: PieceId | null): id is PieceId => !!id && role(id) === 'producer';
const isPlantEater = (id: PieceId | null): id is PieceId => !!id && (role(id) === 'herbivore' || role(id) === 'omnivore');
const isHunter = (id: PieceId | null): id is PieceId => !!id && role(id) === 'carnivore';
const isDecomposer = (id: PieceId | null): id is PieceId => !!id && role(id) === 'decomposer';

// ------------------------------------------------------------------ the research upgrades (for one run)

export type UpgradeId = 'reroll' | 'big-hand' | 'bee-boost' | 'compost' | 'hawk-eye' | 'reed-cover' | 'volunteers';
export const UPGRADE_IDS: UpgradeId[] = ['reroll', 'big-hand', 'bee-boost', 'compost', 'hawk-eye', 'reed-cover', 'volunteers'];

// ------------------------------------------------------------------ the grid

export function idx(b: { island: Island } | Island, x: number, y: number): number {
  const is = 'island' in b ? b.island : b;
  return y * is.w + x;
}

/** The 8 cells around a cell (sides and corners), inside the grid. */
export function around(is: Island, i: number, range = 1): number[] {
  const x0 = i % is.w;
  const y0 = Math.floor(i / is.w);
  const out: number[] = [];
  for (let dy = -range; dy <= range; dy++)
    for (let dx = -range; dx <= range; dx++) {
      if (!dx && !dy) continue;
      const x = x0 + dx;
      const y = y0 + dy;
      if (x >= 0 && y >= 0 && x < is.w && y < is.h) out.push(y * is.w + x);
    }
  return out;
}

const LAND: Ground[] = ['grass', 'soil', 'rich', 'mud'];

export function canPlace(b: Board, id: PieceId, i: number): boolean {
  const g = b.island.ground[i];
  if (!g || b.pieces[i]) return false;
  switch (HABITAT[id]) {
    case 'land':
      return LAND.includes(g);
    case 'water':
      return g === 'water';
    case 'edge':
      return g === 'water' || g === 'mud';
    case 'any':
      return g !== 'water';
  }
}

export function spotsFor(b: Board, id: PieceId): number[] {
  const out: number[] = [];
  for (let i = 0; i < b.pieces.length; i++) if (canPlace(b, id, i)) out.push(i);
  return out;
}

export function place(b: Board, id: PieceId, i: number): Board {
  if (!canPlace(b, id, i)) throw new Error(`Cannot place ${id} at ${i}`);
  const pieces = [...b.pieces];
  pieces[i] = id;
  return { island: b.island, pieces };
}

export function emptyBoard(island: Island): Board {
  return { island, pieces: island.ground.map(() => null) };
}

// ------------------------------------------------------------------ scoring

export type Rule =
  | 'sun' // a plant makes its own food from sunlight
  | 'big-tree' // an oak makes a lot of food
  | 'water' // a land plant next to water
  | 'rich-ground' // a plant on rich ground
  | 'rich-soil' // a plant next to a working decomposer
  | 'pollination' // a flower or berry bush next to a bee or butterfly
  | 'shaded' // a plant next to the invasive vine
  | 'fed' // an animal next to its food
  | 'both-foods' // a duck with plant food and animal food
  | 'hungry' // an animal with nothing to eat next to it
  | 'decompose' // a decomposer with dead things to break down
  | 'idle' // a decomposer with nothing to break down
  | 'shelter' // small animals sheltering in a rock pile
  | 'reed-cover' // animals hiding in the cattails (research)
  | 'invasive' // the vine itself
  | 'food-chain' // a plant, its eater and that eater's hunter
  | 'circle' // the circle of life
  | 'too-many-eaters' // more plant-eaters than plants
  | 'too-many-hunters' // more meat-eaters than plant-eaters
  | 'litter'; // fallen leaves that no decomposer is breaking down

export interface Reason {
  rule: Rule;
  pts: number;
}

export interface PieceScore {
  i: number;
  id: PieceId;
  pts: number;
  reasons: Reason[];
}

export interface Bonus {
  rule: Rule;
  pts: number;
  /** The cells it is about (a food chain's plant, eater and hunter). */
  cells: number[];
}

/** An arrow on the board: energy or matter moving from one tile to the next. */
export interface Link {
  from: number;
  to: number;
  kind: 'eat' | 'recycle' | 'pollinate';
}

export interface Score {
  total: number;
  pieces: PieceScore[];
  bonuses: Bonus[];
  links: Link[];
}

/** Hunters that can reach two tiles away (the Hawk Eye research). */
const LONG_SIGHT: PieceId[] = ['hawk', 'owl'];

/** The food next to an eater (cells), using the hunting range. */
function foodNear(b: Board, i: number, up: readonly UpgradeId[]): number[] {
  const id = b.pieces[i]!;
  const menu = EATS[id] ?? [];
  const range = up.includes('hawk-eye') && LONG_SIGHT.includes(id) ? 2 : 1;
  return around(b.island, i, range).filter((j) => {
    const p = b.pieces[j];
    return !!p && menu.includes(p);
  });
}

/** Dead things (or dung) next to a decomposer. */
function deadNear(b: Board, i: number): number[] {
  const menu = BREAKS_DOWN[b.pieces[i]!] ?? [];
  return around(b.island, i).filter((j) => {
    const p = b.pieces[j];
    return !!p && menu.includes(p);
  });
}

export function score(b: Board, up: readonly UpgradeId[] = []): Score {
  const is = b.island;
  const n = b.pieces.length;
  const pieces: PieceScore[] = [];
  const links: Link[] = [];
  const bonuses: Bonus[] = [];
  const working = new Set<number>(); // decomposers with something to break down
  const fed = new Set<number>(); // animals with food next to them
  for (let i = 0; i < n; i++) if (isDecomposer(b.pieces[i]) && deadNear(b, i).length) working.add(i);
  for (let i = 0; i < n; i++) {
    const id = b.pieces[i];
    if (id && EATS[id] && foodNear(b, i, up).length) fed.add(i);
  }
  const richSoil = up.includes('compost') ? 3 : 2;
  const pollen = up.includes('bee-boost') ? 3 : 2;

  for (let i = 0; i < n; i++) {
    const id = b.pieces[i];
    if (!id) continue;
    const r: Reason[] = [];
    const near = around(is, i);
    const r0 = role(id);
    if (r0 === 'producer') {
      r.push({ rule: 'sun', pts: 1 });
      if (id === 'oak') r.push({ rule: 'big-tree', pts: 1 });
      if (HABITAT[id] === 'land' && near.some((j) => is.ground[j] === 'water')) r.push({ rule: 'water', pts: 1 });
      if (is.ground[i] === 'rich') r.push({ rule: 'rich-ground', pts: 1 });
      const dec = near.filter((j) => working.has(j));
      if (dec.length) {
        r.push({ rule: 'rich-soil', pts: richSoil });
        for (const j of dec) links.push({ from: j, to: i, kind: 'recycle' });
      }
      if (POLLINATED.includes(id)) {
        const pol = near.filter((j) => POLLINATORS.includes(b.pieces[j]!));
        if (pol.length) {
          r.push({ rule: 'pollination', pts: pollen });
          links.push({ from: pol[0], to: i, kind: 'pollinate' });
        }
      }
      if (near.some((j) => b.pieces[j] === 'vine')) r.push({ rule: 'shaded', pts: -2 });
    } else if (r0 === 'invasive') {
      r.push({ rule: 'invasive', pts: -1 });
    } else if (r0 === 'decomposer') {
      const dead = deadNear(b, i);
      if (dead.length) {
        r.push({ rule: 'decompose', pts: 2 });
        links.push({ from: dead[0], to: i, kind: 'recycle' });
      } else r.push({ rule: 'idle', pts: 0 });
    } else if (EATS[id]) {
      const food = foodNear(b, i, up);
      if (food.length) {
        r.push({ rule: 'fed', pts: r0 === 'carnivore' ? 4 : 3 });
        if (id === 'duck' && food.some((j) => isProducer(b.pieces[j])) && food.some((j) => !isProducer(b.pieces[j]))) r.push({ rule: 'both-foods', pts: 1 });
        // one arrow from each kind of food (the energy moves from the eaten to the eater)
        const seen = new Set<PieceId>();
        for (const j of food) {
          if (seen.has(b.pieces[j]!)) continue;
          seen.add(b.pieces[j]!);
          links.push({ from: j, to: i, kind: 'eat' });
        }
      } else r.push({ rule: 'hungry', pts: 0 });
      if (up.includes('reed-cover') && role(id) !== 'carnivore' && near.some((j) => b.pieces[j] === 'reeds')) r.push({ rule: 'reed-cover', pts: 1 });
    } else if (id === 'stones') {
      const sheltered = near.filter((j) => SHELTERS.includes(b.pieces[j]!)).length;
      if (sheltered) r.push({ rule: 'shelter', pts: Math.min(2, sheltered) });
    } else if (id === 'leaves' && !near.some((j) => working.has(j) && BREAKS_DOWN[b.pieces[j]!]!.includes('leaves'))) {
      // nobody is breaking these leaves down: they pile up and smother the ground
      r.push({ rule: 'litter', pts: -1 });
    }
    pieces.push({ i, id, pts: r.reduce((s, x) => s + x.pts, 0), reasons: r });
  }

  // food chains: a hunter next to a plant-eater that is next to its plant
  let chains = 0;
  for (let i = 0; i < n; i++) {
    if (!isHunter(b.pieces[i]) || !fed.has(i)) continue;
    const prey = foodNear(b, i, up).find((j) => fed.has(j) && isPlantEater(b.pieces[j]) && foodNear(b, j, up).some((k) => isProducer(b.pieces[k])));
    if (prey === undefined) continue;
    const plant = foodNear(b, prey, up).find((k) => isProducer(b.pieces[k]))!;
    bonuses.push({ rule: 'food-chain', pts: 3, cells: [plant, prey, i] });
    chains++;
  }
  // the circle of life: a food chain, and a decomposer making rich soil for a plant
  const loop = [...working].find((j) => around(is, j).some((k) => isProducer(b.pieces[k])));
  if (chains && loop !== undefined) {
    const plant = around(is, loop).find((k) => isProducer(b.pieces[k]))!;
    bonuses.push({ rule: 'circle', pts: 5, cells: [loop, plant] });
  }
  // balance: the energy pyramid. Hunters with prey next to them keep the plant-eaters in check (each one counts against one extra plant-eater).
  const c = census(b);
  const fedHunters = [...fed].filter((i) => isHunter(b.pieces[i])).length;
  const extraEaters = c.plantEaters - c.plants - Math.min(fedHunters, Math.max(0, c.plantEaters - c.plants));
  if (extraEaters > 0) bonuses.push({ rule: 'too-many-eaters', pts: -2 * extraEaters, cells: [] });
  if (c.hunters > c.plantEaters) bonuses.push({ rule: 'too-many-hunters', pts: -2 * (c.hunters - c.plantEaters), cells: [] });

  const total = pieces.reduce((s, p) => s + p.pts, 0) + bonuses.reduce((s, x) => s + x.pts, 0);
  return { total: Math.max(0, total), pieces, bonuses, links };
}

export interface Census {
  plants: number;
  plantEaters: number;
  hunters: number;
  decomposers: number;
  vines: number;
}

/** How many of each kind of living thing (the plant-eaters include the duck, which eats both). */
export function census(b: Board): Census {
  const c: Census = { plants: 0, plantEaters: 0, hunters: 0, decomposers: 0, vines: 0 };
  for (const p of b.pieces) {
    if (!p) continue;
    if (isProducer(p)) c.plants++;
    else if (isPlantEater(p)) c.plantEaters++;
    else if (isHunter(p)) c.hunters++;
    else if (isDecomposer(p)) c.decomposers++;
    else if (p === 'vine') c.vines++;
  }
  return c;
}

/** How much a move would change the island's health. */
export function gain(b: Board, id: PieceId, i: number, up: readonly UpgradeId[] = []): number {
  return score(place(b, id, i), up).total - score(b, up).total;
}

// ------------------------------------------------------------------ the invasive vine

/** Native plants next to a vine crowd it out: with two or more, it stops spreading. */
export function vineBlocked(b: Board, i: number): boolean {
  return around(b.island, i).filter((j) => isProducer(b.pieces[j])).length >= 2;
}

/** The vine creeps one tile: the first vine that is not crowded out spreads to its first empty land neighbor. Returns the new board and the cell it took (if any). */
export function spreadVines(b: Board): { board: Board; spread: number[] } {
  const vines = b.pieces.map((p, i) => (p === 'vine' ? i : -1)).filter((i) => i >= 0);
  for (const v of vines) {
    if (vineBlocked(b, v)) continue;
    const to = around(b.island, v).find((j) => !b.pieces[j] && LAND.includes(b.island.ground[j]!) && b.island.ground[j] !== 'mud');
    if (to === undefined) continue;
    const pieces = [...b.pieces];
    pieces[to] = 'vine';
    return { board: { island: b.island, pieces }, spread: [to] };
  }
  return { board: b, spread: [] };
}

/** The vine spreads after every second season. */
export const VINE_EVERY = 2;

export function removeVines(b: Board): Board {
  return { island: b.island, pieces: b.pieces.map((p) => (p === 'vine' ? null : p)) };
}

// ------------------------------------------------------------------ autumn and the drought

/** In autumn every oak drops its leaves onto its first empty dry neighbor. Returns the new board and where the leaves fell. */
export function dropLeaves(b: Board): { board: Board; fell: number[] } {
  const pieces = [...b.pieces];
  const fell: number[] = [];
  b.pieces.forEach((p, i) => {
    if (p !== 'oak') return;
    const to = around(b.island, i).find((j) => !pieces[j] && LAND.includes(b.island.ground[j]!));
    if (to === undefined) return;
    pieces[to] = 'leaves';
    fell.push(to);
  });
  return { board: { island: b.island, pieces }, fell };
}

/** The water the drought dries up: the Archipelago's eastern pond (water squares in the right half of the island). */
export function droughtCells(is: Island): number[] {
  return is.ground.map((g, i) => (g === 'water' && i % is.w >= is.w / 2 ? i : -1)).filter((i) => i >= 0);
}

/**
 * The drought: the eastern pond dries to mud. Living things that need open
 * water there (lily pads, snails, fish, ducks) cannot stay; edge animals and
 * cattails can live on the mud. Returns the new board and what had to leave.
 */
export function startDrought(b: Board): { board: Board; gone: Array<[number, PieceId]> } {
  const cells = droughtCells(b.island);
  const ground = [...b.island.ground];
  const pieces = [...b.pieces];
  const gone: Array<[number, PieceId]> = [];
  for (const i of cells) {
    ground[i] = 'mud';
    const p = pieces[i];
    if (p && HABITAT[p] === 'water') {
      gone.push([i, p]);
      pieces[i] = null;
    }
  }
  return { board: { island: { ...b.island, ground }, pieces }, gone };
}

/** The rain comes back: the dried pond fills again (the squares in `cells` turn back into water). */
export function endDrought(b: Board, cells: readonly number[]): Board {
  const ground = [...b.island.ground];
  for (const i of cells) ground[i] = 'water';
  return { island: { ...b.island, ground }, pieces: b.pieces };
}

// ------------------------------------------------------------------ runs and targets

export interface Target {
  season: number;
  health: number;
}

export interface RunSpec {
  seasons: number;
  targets: Target[];
  rerolls: number;
  /** The season the drought starts (the Archipelago only); it lasts DROUGHT_SEASONS seasons. */
  drought?: number;
}

export const DROUGHT_SEASONS = 2;

/** Targets tested with a simple greedy player on hundreds of seeded islands (see tests/ebt.test.ts): always reachable with good placing, missed with careless placing. */
const run = (rerollsShort: number, short: number[], long: number[], drought?: [number, number]): Record<RunLength, RunSpec> => ({
  short: { seasons: 12, rerolls: rerollsShort, targets: short.map((health, i) => ({ season: (i + 1) * 4, health })), drought: drought?.[0] },
  long: { seasons: 20, rerolls: rerollsShort + 1, targets: long.map((health, i) => ({ season: (i + 1) * 4, health })), drought: drought?.[1] },
});

export const RUNS: Record<IslandKind, Record<RunLength, RunSpec>> = {
  meadow: run(2, [6, 16, 28], [6, 16, 28, 38, 46]),
  pond: run(2, [10, 22, 36], [10, 22, 36, 48, 60]),
  woods: run(2, [12, 26, 40], [12, 26, 40, 52, 64]),
  wetland: run(2, [8, 20, 32], [8, 20, 32, 44, 54]),
  archipelago: run(3, [10, 22, 32], [10, 22, 32, 42, 52], [6, 10]),
};

export const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

/** Season 1 is the first spring. */
export function seasonName(season: number): (typeof SEASON_NAMES)[number] {
  return SEASON_NAMES[(season - 1) % 4];
}

export function yearOf(season: number): number {
  return Math.floor((season - 1) / 4) + 1;
}

// ------------------------------------------------------------------ the islands

/** The tiles each island type can deal, before unlocks. */
const MEADOW_DECK: PieceId[] = ['grass', 'flowers', 'berries', 'rabbit', 'mouse', 'bee', 'butterfly', 'fox', 'hawk', 'mushrooms', 'worms', 'log', 'leaves', 'stones'];
const POND_DECK: PieceId[] = ['grass', 'flowers', 'reeds', 'lilies', 'rabbit', 'mouse', 'butterfly', 'bee', 'snail', 'duck', 'fox', 'frog', 'fish', 'heron', 'mushrooms', 'worms', 'leaves', 'log'];
/** The woods are full of trees and the things that live on them, so the oak, the deer, the owl and the dung beetle are always there. */
const WOODS_DECK: PieceId[] = ['oak', 'grass', 'flowers', 'berries', 'deer', 'mouse', 'rabbit', 'bee', 'butterfly', 'fox', 'owl', 'hawk', 'mushrooms', 'worms', 'beetle', 'log', 'leaves', 'stones'];
const WETLAND_DECK: PieceId[] = [
  'reeds',
  'lilies',
  'grass',
  'flowers',
  'berries',
  'snail',
  'duck',
  'frog',
  'fish',
  'heron',
  'mouse',
  'rabbit',
  'butterfly',
  'bee',
  'fox',
  'hawk',
  'mushrooms',
  'worms',
  'log',
  'leaves',
  'stones',
];
const ARCHIPELAGO_DECK: PieceId[] = [...new Set([...MEADOW_DECK, ...POND_DECK, ...WOODS_DECK, ...WETLAND_DECK])];
const DECKS: Record<IslandKind, PieceId[]> = { meadow: MEADOW_DECK, pond: POND_DECK, woods: WOODS_DECK, wetland: WETLAND_DECK, archipelago: ARCHIPELAGO_DECK };

/** New tiles earned at the end of each run, win or lose, in this order. */
export const UNLOCK_ORDER: PieceId[] = ['owl', 'deer', 'oak', 'beetle'];

/** The tiles that island can deal with these unlocks. Land-only unlocks go to every island; the pond keeps its water tiles. */
export function deck(kind: IslandKind, unlocked: readonly PieceId[]): PieceId[] {
  return [...new Set([...DECKS[kind], ...UNLOCK_ORDER.filter((u) => unlocked.includes(u))])];
}

/**
 * A new island from a seed: an oval of land with a wobbly coast, a sandy
 * beach all round, grass inside with patches of bare soil, rich soil and
 * rock, and water: a small pond on the meadow and in the woods, a big pond
 * with muddy banks on the pond island, a winding channel through the
 * wetland, and two ponds on the Archipelago. Some tiles are there from the
 * start.
 */
export function makeIsland(kind: IslandKind, r: Rand): Board {
  for (let attempt = 0; attempt < 80; attempt++) {
    const b = tryIsland(kind, r);
    if (b) return b;
  }
  throw new Error('Could not make an island');
}

function tryIsland(kind: IslandKind, r: Rand): Board | null {
  const { w, h } = sizeOf(kind);
  const ground: Array<Ground | null> = new Array(w * h).fill(null);
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const wob = [r(), r(), r(), r()];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const a = Math.atan2(y - cy, x - cx);
      const edge = 1 + 0.12 * Math.sin(a * 2 + wob[0] * 6) + 0.1 * Math.sin(a * 3 + wob[1] * 6);
      const d = Math.hypot((x - cx) / (w / 2 - 0.2), (y - cy) / (h / 2 - 0.1));
      if (d < edge) ground[y * w + x] = 'grass';
    }
  const is: Island = { kind, w, h, ground };
  // the beach: land next to the sea (or the grid's edge)
  for (let i = 0; i < w * h; i++) {
    if (!ground[i]) continue;
    const x = i % w;
    const y = Math.floor(i / w);
    const coast = x === 0 || y === 0 || x === w - 1 || y === h - 1 || around(is, i).some((j) => !ground[j]);
    if (coast) ground[i] = 'sand';
  }
  const inner = () => ground.map((g, i) => (g === 'grass' ? i : -1)).filter((i) => i >= 0);
  const pick = (list: number[]) => list[Math.floor(r() * list.length) % list.length];
  const pond = (x: number, y: number, big: boolean) => {
    const c = Math.round(y) * w + Math.round(x);
    const cells = big ? [c, c - 1, c + 1, c - w, c + w, c - w - 1, c + w + 1, c - 2, c + 2] : [c, c - 1, c + 1, c - w, c + w - 1];
    for (const i of cells) if (ground[i] === 'grass') ground[i] = 'water';
    if (big && r() < 0.5 && ground[c - w + 1] === 'grass') ground[c - w + 1] = 'water';
    if (big && r() < 0.5 && ground[c + w - 1] === 'grass') ground[c + w - 1] = 'water';
  };
  const banks = (chance: number) => {
    for (const i of inner()) if (around(is, i).some((j) => ground[j] === 'water') && r() < chance) ground[i] = 'mud';
  };
  // water
  if (kind === 'pond') {
    pond(cx, cy, true);
    banks(0.45);
  } else if (kind === 'wetland') {
    // a slow, winding channel from one side to the other, with wide muddy banks
    const ph = r() * 6;
    for (let x = 1; x < w - 1; x++) {
      const y = Math.round(cy + Math.sin(x * 0.7 + ph) * 1.3);
      for (const yy of [y, y + (x % 3 === 0 ? 1 : 0)]) if (ground[yy * w + x] === 'grass') ground[yy * w + x] = 'water';
    }
    banks(0.6);
  } else if (kind === 'archipelago') {
    pond(w * 0.28, cy, true);
    pond(w * 0.72, cy + 0.5, false);
    banks(0.35);
  } else {
    const at = pick(inner().filter((i) => Math.abs((i % w) - cx) > 1.5));
    ground[at] = 'water';
    const next = around(is, at).filter((j) => ground[j] === 'grass' && (j === at + 1 || j === at - 1 || j === at + w || j === at - w));
    if (next.length) ground[pick(next)] = 'water';
  }
  // patches: the woods (and the Archipelago's north-east corner) have far more rich soil from all the fallen leaves
  for (const i of inner()) {
    const v = r();
    const woodsy = kind === 'woods' || (kind === 'archipelago' && i % w >= w / 2 && Math.floor(i / w) < h / 2);
    if (woodsy) {
      if (v < 0.1) ground[i] = 'soil';
      else if (v < 0.4) ground[i] = 'rich';
      else if (v < 0.44) ground[i] = 'rock';
    } else if (v < 0.14) ground[i] = 'soil';
    else if (v < 0.2) ground[i] = 'rich';
    else if (v < 0.25) ground[i] = 'rock';
  }
  let b = emptyBoard(is);
  const land = b.pieces.map((_, i) => i).filter((i) => canPlace(b, 'grass', i)).length;
  const water = b.pieces.map((_, i) => i).filter((i) => canPlace(b, 'lilies', i)).length;
  const need: Record<IslandKind, [number, number, number]> = {
    // [land, water, both]
    meadow: [34, 0, 34],
    woods: [34, 0, 34],
    pond: [24, 8, 34],
    wetland: [22, 8, 34],
    archipelago: [50, 14, 66],
  };
  const [nl, nw, nb] = need[kind];
  if (land < nl || water < nw || land + water < nb) return null;
  if (kind === 'archipelago' && droughtCells(is).length < 3) return null;
  // the tiles already there
  const put = (id: PieceId) => {
    const spots = spotsFor(b, id);
    if (!spots.length) return false;
    b = place(b, id, pick(spots));
    return true;
  };
  /** The vine starts at the island's far (east) end. */
  const vine = () => {
    const far = spotsFor(b, 'vine').filter((i) => i % w >= w - 4);
    if (!far.length) return false;
    b = place(b, 'vine', pick(far));
    return true;
  };
  const start: Record<IslandKind, PieceId[]> = {
    meadow: ['grass', 'grass', 'log'],
    pond: ['lilies', 'reeds', 'grass', 'leaves'],
    woods: ['oak', 'oak', 'log', 'leaves'],
    // a boom: too many snails for the water plants
    wetland: ['reeds', 'lilies', 'snail', 'snail', 'snail'],
    archipelago: ['grass', 'oak', 'lilies', 'reeds', 'log'],
  };
  for (const id of start[kind]) if (!put(id)) return null;
  if ((kind === 'meadow' || kind === 'wetland' || kind === 'archipelago') && !vine()) return null;
  return b;
}

// ------------------------------------------------------------------ dealing the hand

/**
 * A hand of tiles: a plant, an animal and one more (a decomposer, a habitat
 * feature or anything else), all different and all with somewhere to go.
 * Animals whose food is already on the island, and decomposers with
 * something to break down, come up more often, so a careful player can
 * always build on what they have.
 */
export function dealHand(b: Board, pool: readonly PieceId[], size: number, r: Rand): PieceId[] {
  const hand: PieceId[] = [];
  const onBoard = new Set(b.pieces.filter((p): p is PieceId => !!p));
  const usable = pool.filter((id) => spotsFor(b, id).length > 0);
  const weight = (id: PieceId): number => {
    const ro = role(id);
    if (EATS[id]) return EATS[id]!.some((f) => onBoard.has(f)) ? 4 : 1;
    if (ro === 'decomposer') return BREAKS_DOWN[id]!.some((f) => onBoard.has(f)) ? 3 : 1;
    if (ro === 'producer') return 2;
    return 1;
  };
  const draw = (from: PieceId[]) => {
    const list = from.filter((id) => !hand.includes(id));
    if (!list.length) return;
    const total = list.reduce((s, id) => s + weight(id), 0);
    let t = r() * total;
    for (const id of list) {
      t -= weight(id);
      if (t <= 0) {
        hand.push(id);
        return;
      }
    }
    hand.push(list[list.length - 1]);
  };
  draw(usable.filter((id) => role(id) === 'producer'));
  draw(usable.filter((id) => !!EATS[id]));
  while (hand.length < size && usable.some((id) => !hand.includes(id))) {
    const others = usable.filter((id) => role(id) !== 'producer' && !EATS[id]);
    draw(hand.length === 2 && others.some((id) => !hand.includes(id)) ? others : usable);
  }
  return hand;
}

/** The best move from a hand (Bramble's sniff, and the test player). Ties go to the first card, then the first cell. */
export function bestMove(b: Board, hand: readonly PieceId[], up: readonly UpgradeId[] = []): { card: number; cell: number; gain: number } | null {
  const before = score(b, up).total;
  let best: { card: number; cell: number; gain: number } | null = null;
  hand.forEach((id, card) => {
    for (const cell of spotsFor(b, id)) {
      const g = score(place(b, id, cell), up).total - before;
      if (!best || g > best.gain) best = { card, cell, gain: g };
    }
  });
  return best;
}

// ------------------------------------------------------------------ what held the island back

export type Trouble = 'hungry' | 'no-decomposers' | 'too-many-eaters' | 'too-many-hunters' | 'vine' | 'few-plants' | 'no-chain';

/** The biggest thing holding the island back, for Warden Nia's explanation when a target is missed. */
export function diagnose(b: Board, up: readonly UpgradeId[] = []): Trouble {
  const s = score(b, up);
  const c = census(b);
  // Hungry hunters on an island with too few plant-eaters are hungry because of the imbalance, so they count there (and the same for plant-eaters and plants).
  const hungryOf = (test: (id: PieceId) => boolean) => s.pieces.filter((p) => test(p.id) && p.reasons.some((x) => x.rule === 'hungry')).length;
  const hungryHunters = hungryOf((id) => isHunter(id));
  const hungryEaters = hungryOf((id) => isPlantEater(id));
  const huntersShort = c.hunters > c.plantEaters;
  const eatersShort = c.plantEaters > c.plants;
  const hungry = (huntersShort ? 0 : hungryHunters) + (eatersShort ? 0 : hungryEaters);
  const idle = s.pieces.filter((p) => p.reasons.some((x) => x.rule === 'idle')).length;
  const lost: Array<[Trouble, number]> = [
    ['too-many-eaters', -(s.bonuses.find((x) => x.rule === 'too-many-eaters')?.pts ?? 0) + (eatersShort ? hungryEaters * 3 : 0)],
    ['too-many-hunters', -(s.bonuses.find((x) => x.rule === 'too-many-hunters')?.pts ?? 0) + (huntersShort ? hungryHunters * 4 : 0)],
    ['hungry', hungry * 3],
    ['vine', c.vines * 2 + s.pieces.filter((p) => p.reasons.some((x) => x.rule === 'shaded')).length * 2],
    ['no-decomposers', (c.decomposers === 0 || idle === c.decomposers ? 5 + idle : idle * 2) + s.pieces.filter((p) => p.reasons.some((x) => x.rule === 'litter')).length * 2],
    ['few-plants', c.plants < 5 ? (5 - c.plants) * 2 : 0],
    ['no-chain', s.bonuses.some((x) => x.rule === 'food-chain') ? 0 : 3],
  ];
  lost.sort((a, z) => z[1] - a[1]);
  return lost[0][0];
}
