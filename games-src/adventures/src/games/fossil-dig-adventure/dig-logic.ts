import type { FossilId } from '../../kit/worlds/wild-lands/dig-art';
import { FOSSILS, LAYERS, type LayerId } from './fossils';
import { shuffle, type Rand } from './problems';

/**
 * The rules of Fossil Dig Adventure's two hands-on jobs, as pure functions
 * (unit tested): digging a quarry square, and the Cliff Wall's puzzles.
 *
 * The quarry dig (the original game's grid, now with real rules): each
 * square has three layers. The top is loose dirt (the shovel moves it), then
 * hard rock (the rock pick breaks it), then a thin last layer right over
 * whatever is below (the gentle brush clears it). Using the shovel or the
 * pick on that last layer is faster, but if a fossil is there it gets
 * chipped: still found, but not perfect. Pebble's sniff marks the squares
 * round the nearest fossil still hidden.
 */

export type Tool = 'shovel' | 'pick' | 'brush';
export const TOOLS: Tool[] = ['shovel', 'pick', 'brush'];

export interface DigCell {
  /** Layers left: 3 loose dirt, 2 hard rock, 1 the thin last layer, 0 dug. */
  left: 0 | 1 | 2 | 3;
  find: FossilId | null;
  chipped: boolean;
  sniffed: boolean;
}

export interface Dig {
  cols: number;
  rows: number;
  cells: DigCell[];
  finds: FossilId[];
}

/** What a tool did to a square (the game turns this into a message and a sound). */
export type DigResult = { k: 'dug'; left: number } | { k: 'found'; id: FossilId; chipped: boolean } | { k: 'empty' } | { k: 'too-hard' } | { k: 'too-soft' } | { k: 'done-here' };

/** The layer a square is at, by how many are left. */
export function layerOf(left: number): 'dirt' | 'rock' | 'last' | 'dug' {
  return left === 3 ? 'dirt' : left === 2 ? 'rock' : left === 1 ? 'last' : 'dug';
}

/** The right tool for each layer. */
export const RIGHT_TOOL: Record<'dirt' | 'rock' | 'last', Tool> = { dirt: 'shovel', rock: 'pick', last: 'brush' };

/** A new quarry square with these finds hidden in it (no two side by side, so each find has its own squares). */
export function newDig(finds: FossilId[], r: Rand, cols = 8, rows = 6): Dig {
  const cells: DigCell[] = Array.from({ length: cols * rows }, () => ({ left: 3, find: null, chipped: false, sniffed: false }));
  const spots = shuffle(
    r,
    cells.map((_, i) => i),
  );
  const taken: number[] = [];
  for (const id of finds) {
    const spot = spots.find((i) => {
      const x = i % cols;
      const y = Math.floor(i / cols);
      // keep finds off the very edge and apart from each other
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) return false;
      return taken.every((j) => Math.abs((j % cols) - x) + Math.abs(Math.floor(j / cols) - y) > 2);
    });
    if (spot === undefined) continue;
    taken.push(spot);
    cells[spot].find = id;
  }
  return { cols, rows, cells, finds: taken.map((i) => cells[i].find!) };
}

/** Use a tool on a square. */
export function dig(d: Dig, i: number, tool: Tool): DigResult {
  const c = d.cells[i];
  const layer = layerOf(c.left);
  if (layer === 'dug') return { k: 'done-here' };
  if (layer === 'dirt') {
    // loose dirt: the shovel moves it; the pick works too; the brush is too slow and soft
    if (tool === 'brush') return { k: 'too-soft' };
    c.left = 2;
    return { k: 'dug', left: 2 };
  }
  if (layer === 'rock') {
    if (tool === 'shovel') return { k: 'too-hard' };
    if (tool === 'brush') return { k: 'too-soft' };
    c.left = 1;
    return { k: 'dug', left: 1 };
  }
  // the thin last layer: the brush clears it gently; the shovel and the pick clear it too, but chip a fossil
  c.left = 0;
  if (!c.find) return { k: 'empty' };
  if (tool !== 'brush') c.chipped = true;
  return { k: 'found', id: c.find, chipped: c.chipped };
}

/** The finds still hidden. */
export function hidden(d: Dig): number[] {
  return d.cells.map((c, i) => (c.find && c.left > 0 ? i : -1)).filter((i) => i >= 0);
}

/** Pebble sniffs: marks the square of the nearest hidden find to `from` and the squares round it. Returns the squares marked. */
export function sniff(d: Dig, from: number): number[] {
  const left = hidden(d);
  if (!left.length) return [];
  const fx = from % d.cols;
  const fy = Math.floor(from / d.cols);
  const target = left.reduce((a, b) => (dist(d, a, fx, fy) <= dist(d, b, fx, fy) ? a : b));
  const tx = target % d.cols;
  const ty = Math.floor(target / d.cols);
  const marked: number[] = [];
  for (let y = ty - 1; y <= ty + 1; y++)
    for (let x = tx - 1; x <= tx + 1; x++) {
      if (x < 0 || y < 0 || x >= d.cols || y >= d.rows) continue;
      // only the target and its four neighbors, so the sniff narrows it down but does not give it away
      if (Math.abs(x - tx) + Math.abs(y - ty) > 1) continue;
      const i = y * d.cols + x;
      d.cells[i].sniffed = true;
      marked.push(i);
    }
  return marked;
}

function dist(d: Dig, i: number, x: number, y: number): number {
  return Math.abs((i % d.cols) - x) + Math.abs(Math.floor(i / d.cols) - y);
}

/** A square's grid name, as on the quarry map: columns A, B, C... and rows 1, 2, 3... */
export function gridName(d: Dig, i: number): string {
  return `${String.fromCharCode(65 + (i % d.cols))}${Math.floor(i / d.cols) + 1}`;
}

/** The dig is finished when every find is out. */
export function digDone(d: Dig): boolean {
  return hidden(d).length === 0;
}

// ------------------------------------------------------------------ the Cliff Wall's puzzles

/** A layer card for the ordering puzzle: the layer, with its age and what is in it. */
export interface LayerCard {
  id: LayerId;
  /** Shown on the card at every level. */
  clue: string;
}

/**
 * The cards for "put the layers in order" at a level. Levels 1 and 2 give
 * each layer's age, so the rule (older is lower) is all the child needs.
 * Level 3 gives no ages, only what lived there, so the child uses what they
 * know (sea animals, then swamp ferns, then dinosaurs, then mammoths).
 */
export function layerCards(tier: 1 | 2 | 3): LayerCard[] {
  const what: Record<LayerId, string> = {
    sea: 'Shells and trilobites',
    swamp: 'Ferns and coal',
    river: 'Dinosaur bones',
    ice: 'Mammoth tusks',
    today: 'Soil and sagebrush',
  };
  const age: Record<LayerId, string> = {
    sea: 'About 400 million years old',
    swamp: 'About 300 million years old',
    river: 'About 70 million years old',
    ice: 'About 20 thousand years old',
    today: 'Forming today',
  };
  return LAYERS.map((id) => ({ id, clue: tier === 3 ? what[id] : `${what[id]}. ${age[id]}.` }));
}

/** Is this the right layer for this slot (slot 0 is the bottom)? */
export function rightSlot(id: LayerId, slot: number): boolean {
  return LAYERS[slot] === id;
}

/** Why a layer card does not go in that slot (one sentence, without saying where it does go). */
export function slotWhy(id: LayerId, slot: number): string {
  const right = LAYERS.indexOf(id);
  if (right < slot) return 'This layer is older than that. Older layers lie lower down.';
  return 'This layer is younger than that. Younger layers lie higher up.';
}

/** Does this fossil belong in this layer? */
export function rightLayer(id: FossilId, layer: LayerId): boolean {
  return FOSSILS[id].layer === layer;
}

/** Why a fossil does not belong in that layer (one sentence, without naming the right one). */
export function layerWhy(id: FossilId, layer: LayerId): string {
  const f = FOSSILS[id];
  const sea = f.layer === 'sea';
  if (layer === 'today') return 'Today’s soil is too young for any fossil. Fossils take a very long time to form.';
  if (sea) return `A ${f.name.toLowerCase()} lived in the sea. Which layer was laid down under the sea?`;
  if (f.layer === 'swamp') return `A ${f.name.toLowerCase()} comes from a swampy forest. Which layer has ferns and coal?`;
  if (f.layer === 'ice') return 'Mammoths lived in the Ice Age, long after the dinosaurs. Which layer is that?';
  return `A ${f.name.toLowerCase()} comes from the time of the dinosaurs. Which layer has dinosaur bones?`;
}

// ------------------------------------------------------------------ the Prep Lab's bench

/**
 * Sam's prep bench: a fossil still in its block of rock, split into a grid.
 * Squares of plain rock come off with the tiny air chisel, which is fast: it
 * takes off the plain rock round the square too (the brush is too slow for
 * rock). Squares of rock right next to the bone need the brush:
 * the chisel clears them too, but its buzzing cracks the bone beside it.
 * Bone squares are under a film of dust that only the brush clears (the
 * chisel on the bone cracks it). Cracks, old ones from being buried and any
 * new ones, are fixed with glue. The fossil is ready when every square is
 * clear and every crack is glued.
 */
export type PrepTool = 'chisel' | 'brush' | 'glue';
export const PREP_TOOLS: PrepTool[] = ['chisel', 'brush', 'glue'];

export interface PrepCell {
  kind: 'rock' | 'near' | 'bone';
  /** Still covered (rock, or dust on the bone). */
  covered: boolean;
  cracked: boolean;
  glued: boolean;
}

export interface Prep {
  cols: number;
  rows: number;
  cells: PrepCell[];
  /** Cracks made by the chisel (for the grown-ups page). */
  accidents: number;
}

export type PrepResult =
  | { k: 'cleared' }
  | { k: 'revealed'; cracked: boolean }
  | { k: 'cracked'; at: number }
  | { k: 'glued' }
  | { k: 'too-slow' }
  | { k: 'no-crack' }
  | { k: 'crack-here' }
  | { k: 'done-here' };

/** A new bench from a mask of the fossil's squares (true = bone), with `oldCracks` bone squares cracked from being buried. */
export function newPrep(mask: boolean[], cols: number, rows: number, r: Rand, oldCracks = 2): Prep {
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows && mask[y * cols + x];
  const cells: PrepCell[] = mask.map((bone, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);
    const near = !bone && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1));
    return { kind: bone ? 'bone' : near ? 'near' : 'rock', covered: true, cracked: false, glued: false };
  });
  const bones = shuffle(
    r,
    cells.map((c, i) => (c.kind === 'bone' ? i : -1)).filter((i) => i >= 0),
  );
  for (const i of bones.slice(0, oldCracks)) cells[i].cracked = true;
  return { cols, rows, cells, accidents: 0 };
}

/** The bone square next to square `i` (for the chisel's crack), or -1. */
function boneNextTo(p: Prep, i: number): number {
  const x = i % p.cols;
  const y = Math.floor(i / p.cols);
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= p.cols || ny >= p.rows) continue;
    const j = ny * p.cols + nx;
    if (p.cells[j].kind === 'bone') return j;
  }
  return -1;
}

/** Use a tool on a square of the bench. */
export function prepUse(p: Prep, i: number, tool: PrepTool): PrepResult {
  const c = p.cells[i];
  if (c.covered) {
    if (tool === 'glue') return { k: 'no-crack' };
    if (c.kind === 'rock') {
      if (tool === 'brush') return { k: 'too-slow' };
      // the air chisel is fast: it also takes off the plain rock right round this square (never rock touching the fossil)
      c.covered = false;
      const x = i % p.cols;
      const y = Math.floor(i / p.cols);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= p.cols || ny >= p.rows) continue;
        const n = p.cells[ny * p.cols + nx];
        if (n.kind === 'rock') n.covered = false;
      }
      return { k: 'cleared' };
    }
    if (c.kind === 'near') {
      c.covered = false;
      if (tool === 'brush') return { k: 'cleared' };
      const j = boneNextTo(p, i);
      if (j >= 0) {
        p.cells[j].cracked = true;
        p.cells[j].glued = false;
        p.accidents++;
        return { k: 'cracked', at: j };
      }
      return { k: 'cleared' };
    }
    // dust on the bone
    c.covered = false;
    if (tool === 'chisel') {
      c.cracked = true;
      c.glued = false;
      p.accidents++;
      return { k: 'cracked', at: i };
    }
    return { k: 'revealed', cracked: c.cracked };
  }
  if (c.cracked) {
    if (tool !== 'glue') return { k: 'crack-here' };
    c.cracked = false;
    c.glued = true;
    return { k: 'glued' };
  }
  return tool === 'glue' ? { k: 'no-crack' } : { k: 'done-here' };
}

/** Squares still to do: covered, or cracked and not glued. */
export function prepLeft(p: Prep): number {
  return p.cells.filter((c) => c.covered || c.cracked).length;
}

export function prepDone(p: Prep): boolean {
  return prepLeft(p) === 0;
}

/** The right tool for a square as it is now (for hints and the browser test). */
export function prepRightTool(c: PrepCell): PrepTool | null {
  if (c.covered) return c.kind === 'rock' ? 'chisel' : 'brush';
  return c.cracked ? 'glue' : null;
}

// ------------------------------------------------------------------ the Trackway's numbers

/**
 * The trackway's measurements, as the tape reads them: the three-toed
 * dinosaur's print, its walking steps at the start and its running steps at
 * the end, and Pebble's prints in the creek mud for comparing.
 */
export const TRACK = {
  printCm: 40,
  walkStepM: 1.5,
  runStepM: 3,
  pebblePrintCm: 4,
  pebbleWalkCm: 30,
  pebbleRunCm: 90,
} as const;

/** The paleontologists' rule of thumb: hip height is about 4 times the footprint's length. */
export function hipHeightCm(printCm: number): number {
  return printCm * 4;
}

/** "1.6 meters" or "80 centimeters", for a height in centimeters. */
export function sayLength(cm: number): string {
  if (cm >= 100) {
    const m = Math.round(cm / 10) / 10;
    return `${m} ${m === 1 ? 'meter' : 'meters'}`;
  }
  return `${cm} centimeters`;
}
