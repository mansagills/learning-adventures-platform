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
