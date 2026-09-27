/**
 * Sweetgum Hollow, the compact hub town, as data.
 *
 * Ground is a grid of characters; everything that stands up (trees,
 * buildings, fences, lamps) is listed separately. Collision, the minimap,
 * pathfinding and the 3D scene are all built from this one description.
 */

export const TILE_PX = 16;

export type GroundKind = 'grass' | 'path' | 'cobble' | 'water' | 'soil' | 'field' | 'dryfield' | 'flowers' | 'floor' | 'rug' | 'wall';

export interface BuildingDef {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  d: number;
  /** Wall height in tiles as seen on screen. */
  h: number;
  style: 'cottage' | 'greenhouse' | 'shop' | 'school' | 'workshop';
  roof: 'red' | 'blue' | 'green' | 'brown' | 'glass';
  /** Door column (tile x) on the front (south) wall. */
  doorX: number;
}

export type PropKind =
  | 'tree'
  | 'pine'
  | 'bush'
  | 'lamp'
  | 'bench'
  | 'sign'
  | 'well'
  | 'stall'
  | 'mailbox'
  | 'fence'
  | 'crop'
  | 'scarecrow'
  | 'crate'
  | 'reeds'
  | 'barrel'
  | 'potting';

export interface PropDef {
  kind: PropKind;
  x: number;
  y: number;
  /** Tiles this prop blocks, relative to (x, y). Defaults to its own tile. */
  solid?: boolean;
  variant?: number;
  /** Sign text / interaction id. */
  text?: string;
}

/** A spot the player can use: doors, signs, the bed... */
export interface PlaceDef {
  id: string;
  label: string;
  x: number;
  y: number;
  /** How close (tiles) the player must be to use it. */
  radius: number;
}

/** Every place the player can be. Interiors share the scene kit. */
export type SceneId = 'hub' | 'room' | 'school' | 'farm' | 'workshop';

export interface MapDef {
  id: SceneId;
  w: number;
  h: number;
  ground: GroundKind[][];
  buildings: BuildingDef[];
  props: PropDef[];
  places: PlaceDef[];
  spawn: { x: number; y: number };
  /** Extra blocked tiles (e.g. room furniture) as "x,y". */
  blocked: Set<string>;
  /**
   * Interiors: where you appear when you come in, and the doorway you walk
   * out through (going below exitY between exitX0 and exitX1 leaves).
   */
  entry?: { x: number; y: number };
  exit?: { x0: number; x1: number; y: number; to: SceneId; at: { x: number; y: number } };
}

const G: Record<string, GroundKind> = {
  '.': 'grass',
  p: 'path',
  c: 'cobble',
  w: 'water',
  s: 'soil',
  f: 'field',
  d: 'dryfield',
  '*': 'flowers',
  o: 'floor',
  r: 'rug',
  '#': 'wall',
};

function parseGround(rows: string[]): GroundKind[][] {
  return rows.map((row) => row.split('').map((ch) => G[ch] ?? 'grass'));
}

/**
 * Layout rule: in this 3/4 view a building hides the ground up to (height +
 * depth) rows north of its front wall. Every walkable road therefore sits at
 * least that far from the building south of it, so the player never
 * disappears behind a roof on a required path.
 */

/** Paint the hub ground from rectangles (x0, y0, x1, y1 inclusive). */
function hubGround(): GroundKind[][] {
  const W = 40;
  const H = 30;
  const g: GroundKind[][] = Array.from({ length: H }, () => Array<GroundKind>(W).fill('grass'));
  const fill = (k: GroundKind, x0: number, y0: number, x1: number, y1: number) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = k;
  };
  fill('soil', 9, 3, 13, 6); // community garden
  fill('field', 31, 3, 36, 6); // Hilltop Farm
  fill('path', 19, 6, 20, 8); // greenhouse walk
  fill('path', 11, 7, 12, 8); // garden gate
  fill('path', 33, 7, 34, 8); // farm gate
  fill('path', 11, 9, 34, 10); // north road
  fill('path', 11, 9, 12, 27); // west road
  fill('path', 27, 9, 28, 27); // east road
  fill('path', 3, 26, 36, 27); // south road
  fill('cobble', 14, 12, 25, 16); // town square
  fill('cobble', 19, 11, 20, 11);
  fill('cobble', 13, 14, 13, 15);
  fill('cobble', 26, 14, 26, 15);
  fill('path', 5, 17, 5, 18); // cottage step
  fill('path', 5, 18, 10, 18);
  fill('path', 29, 19, 36, 19); // Seed & Mail yard
  fill('path', 33, 17, 33, 18);
  fill('path', 6, 25, 6, 25); // school step
  fill('path', 33, 25, 33, 25); // workshop step
  fill('path', 19, 17, 20, 18); // square to pond
  fill('water', 17, 19, 22, 19); // Sweetgum Pond
  fill('water', 16, 20, 23, 21);
  fill('water', 17, 22, 22, 22);
  fill('flowers', 2, 9, 3, 9);
  fill('flowers', 21, 8, 24, 8);
  fill('flowers', 15, 24, 17, 24);
  fill('flowers', 22, 24, 24, 24);
  fill('flowers', 36, 11, 37, 12);
  fill('flowers', 4, 19, 4, 19);
  return g;
}

function hubProps(): PropDef[] {
  const props: PropDef[] = [];
  const W = 40;
  const H = 30;
  // Forest border (two rows/columns deep, alternating tree kinds).
  for (let x = 0; x < W; x++) {
    for (const y of [0, 1, 28, 29]) props.push({ kind: (x + y) % 3 === 0 ? 'pine' : 'tree', x, y, variant: (x * 7 + y) % 3 });
  }
  for (let y = 2; y < H - 2; y++) {
    for (const x of [0, 1, 38, 39]) props.push({ kind: (x + y) % 3 === 0 ? 'pine' : 'tree', x, y, variant: (x + y * 5) % 3 });
  }
  // Scattered trees and bushes.
  const trees: Array<[number, number]> = [
    [3, 3], [5, 5], [3, 7], [25, 3], [26, 6], [15, 5], [3, 10], [9, 13], [37, 14], [10, 21], [29, 21], [37, 22], [14, 24], [25, 24], [37, 25],
  ];
  trees.forEach(([x, y], i) => props.push({ kind: i % 4 === 0 ? 'pine' : 'tree', x, y, variant: i % 3 }));
  const bushes: Array<[number, number]> = [[7, 8], [15, 8], [24, 7], [13, 18], [26, 18], [4, 18], [37, 19], [9, 16]];
  bushes.forEach(([x, y], i) => props.push({ kind: 'bush', x, y, variant: i % 2 }));

  // Garden fence (x 8..14, y 2..7) with a gate at x 11..12 and its sign at x 13.
  for (let x = 8; x <= 14; x++) {
    props.push({ kind: 'fence', x, y: 2 });
    if (x < 11 || x > 13) props.push({ kind: 'fence', x, y: 7 });
  }
  for (let y = 3; y <= 6; y++) {
    props.push({ kind: 'fence', x: 8, y });
    props.push({ kind: 'fence', x: 14, y });
  }
  for (let x = 9; x <= 13; x++) for (const y of [3, 5]) props.push({ kind: 'crop', x, y, variant: (x + y) % 3, solid: false });

  // Farm fence (x 30..37, y 2..7) with a gate at x 33..34 and its sign at x 32.
  for (let x = 30; x <= 37; x++) {
    props.push({ kind: 'fence', x, y: 2 });
    if (x < 32 || x > 34) props.push({ kind: 'fence', x, y: 7 });
  }
  for (let y = 3; y <= 6; y++) {
    props.push({ kind: 'fence', x: 30, y });
    props.push({ kind: 'fence', x: 37, y });
  }
  for (let x = 31; x <= 36; x++) for (const y of [4, 6]) if (x !== 35) props.push({ kind: 'crop', x, y, variant: 3, solid: false });
  props.push({ kind: 'scarecrow', x: 35, y: 5 });
  // Hattie's potting bench, where Chapter 1's card game is played.
  props.push({ kind: 'potting', x: 9, y: 8 });

  // Town square.
  props.push({ kind: 'well', x: 19, y: 13 });
  props.push({ kind: 'bench', x: 16, y: 11 });
  props.push({ kind: 'bench', x: 23, y: 11 });
  const lamps: Array<[number, number]> = [[10, 8], [29, 8], [13, 11], [26, 11], [13, 17], [26, 17], [10, 25], [29, 25], [18, 18], [21, 18]];
  lamps.forEach(([x, y]) => props.push({ kind: 'lamp', x, y }));

  // Seed & Mail stall, mailbox and crates.
  props.push({ kind: 'stall', x: 34, y: 18 });
  props.push({ kind: 'mailbox', x: 30, y: 18 });
  props.push({ kind: 'crate', x: 36, y: 18 });
  props.push({ kind: 'barrel', x: 37, y: 18 });

  // Pond reeds.
  for (const [x, y] of [[15, 21], [24, 20], [24, 21], [16, 22]] as Array<[number, number]>)
    props.push({ kind: 'reeds', x, y, solid: false });

  // Signs.
  props.push({ kind: 'sign', x: 18, y: 7, text: "Carver's Greenhouse." });
  props.push({ kind: 'sign', x: 13, y: 7, text: 'Community Garden. A lesson grows here in Chapter 1.' });
  props.push({ kind: 'sign', x: 32, y: 7, text: 'Hilltop Farm. Open for lessons in Chapters 3 and 5.' });
  props.push({ kind: 'sign', x: 9, y: 17, text: 'Your cottage. Rest, change your look and check your windowsill.' });
  props.push({ kind: 'sign', x: 29, y: 17, text: 'Seed & Mail. Seeds, letters and parcels.' });
  props.push({ kind: 'sign', x: 8, y: 25, text: 'Schoolhouse. Opens in Chapter 2.' });
  props.push({ kind: 'sign', x: 31, y: 25, text: "Workshop. Mr. Brooks builds and fixes things here. Inventions start in Chapter 4." });
  props.push({ kind: 'sign', x: 17, y: 18, text: 'Sweetgum Pond. Please do not feed the ducks bread.' });
  return props;
}

export const HUB_BUILDINGS: BuildingDef[] = [
  { id: 'greenhouse', label: "Carver's Greenhouse", x: 16, y: 3, w: 8, d: 3, h: 2.5, style: 'greenhouse', roof: 'glass', doorX: 19 },
  { id: 'cottage', label: 'Your cottage', x: 3, y: 14, w: 6, d: 3, h: 2.5, style: 'cottage', roof: 'red', doorX: 5 },
  { id: 'seedmail', label: 'Seed & Mail', x: 31, y: 14, w: 6, d: 3, h: 2.5, style: 'shop', roof: 'green', doorX: 33 },
  { id: 'school', label: 'Schoolhouse', x: 3, y: 22, w: 7, d: 3, h: 2.5, style: 'school', roof: 'blue', doorX: 6 },
  { id: 'workshop', label: 'Workshop', x: 30, y: 23, w: 7, d: 2, h: 2.5, style: 'workshop', roof: 'brown', doorX: 33 },
];

export function buildHubMap(): MapDef {
  return {
    id: 'hub',
    w: 40,
    h: 30,
    ground: hubGround(),
    buildings: HUB_BUILDINGS,
    props: hubProps(),
    places: [
      { id: 'cottage_door', label: 'Enter your cottage', x: 5.5, y: 17.4, radius: 1.1 },
      { id: 'school_door', label: 'Schoolhouse door', x: 6.5, y: 25.4, radius: 1.1 },
      { id: 'workshop_door', label: 'Workshop door', x: 33.5, y: 25.4, radius: 1.1 },
      { id: 'greenhouse_door', label: 'Greenhouse door', x: 19.9, y: 6.4, radius: 1.1 },
      { id: 'shop_door', label: 'Seed & Mail door', x: 33.5, y: 17.4, radius: 0.8 },
      { id: 'farm_door', label: 'Hilltop Farm gate', x: 33.9, y: 7.6, radius: 1.0 },
    ],
    spawn: { x: 5.5, y: 18.5 },
    blocked: new Set(),
  };
}

// ------------------------------------------------------------------ room

const ROOM_ROWS = [
  '##########',
  '##########',
  '#oooooooo#',
  '#oooooooo#',
  '#ooorrooo#',
  '#ooorrooo#',
  '#oooooooo#',
  '#oooooooo#',
  '####oo####',
];

export function buildRoomMap(): MapDef {
  const blocked = new Set<string>();
  // bed (1..2, 2..3), wardrobe (4, 2), shelf (6, 2), desk (7..8, 2), plant stand (8, 6)
  ['1,2', '2,2', '1,3', '2,3', '4,2', '6,2', '7,2', '8,2', '1,7'].forEach((k) => blocked.add(k));
  return {
    id: 'room',
    w: 10,
    h: 9,
    ground: parseGround(ROOM_ROWS),
    buildings: [],
    props: [],
    places: [
      { id: 'bed', label: 'Rest in bed', x: 2, y: 3.9, radius: 1.2 },
      { id: 'wardrobe', label: 'Change your look', x: 4.5, y: 3.1, radius: 1.0 },
      { id: 'shelf', label: 'Look at the shelf', x: 6.5, y: 3.1, radius: 1.0 },
      { id: 'windowsill', label: 'Look at the windowsill', x: 8, y: 3.1, radius: 1.1 },
      { id: 'room_door', label: 'Go outside', x: 5, y: 8.3, radius: 1.1 },
    ],
    spawn: { x: 5, y: 7.2 },
    blocked,
    entry: { x: 5, y: 7.2 },
    exit: { x0: 4, x1: 6, y: 8.05, to: 'hub', at: { x: 5.5, y: 18.5 } },
  };
}

// ------------------------------------------------------------------ schoolhouse

const SCHOOL_ROWS = [
  '##############',
  '##############',
  '#oooooooooooo#',
  '#oooooooooooo#',
  '#oooooooooooo#',
  '#ooooorrooooo#',
  '#oooooooooooo#',
  '#oooooooooooo#',
  '######oo######',
];

/** Easel tiles in the schoolhouse (chapters hang their memory displays here). */
export const SCHOOL_EASELS: Array<[number, number]> = [
  [2, 2],
  [11, 2],
  [1, 4],
  [12, 4],
  [1, 6],
  [12, 6],
];
/** The storybook painting on each easel (same order as Chapter 2's stages). */
export const SCHOOL_EASEL_ART = ['ch2-reading', 'ch2-neosho', 'ch2-kansas', 'ch2-highland', 'ch2-simpson', 'ch2-iowastate'];

/** The schoolhouse: desks, a chalkboard and room for memory displays. */
export function buildSchoolMap(): MapDef {
  const blocked = new Set<string>();
  // desks (two rows of two) and the teacher's desk by the chalkboard
  ['3,4', '4,4', '9,4', '10,4', '3,6', '4,6', '9,6', '10,6'].forEach((k) => blocked.add(k));
  // memory-display easels along the walls
  SCHOOL_EASELS.forEach(([x, y]) => blocked.add(`${x},${y}`));
  return {
    id: 'school',
    w: 14,
    h: 9,
    ground: parseGround(SCHOOL_ROWS),
    buildings: [],
    props: [],
    places: [{ id: 'school_exit', label: 'Go outside', x: 7, y: 8.3, radius: 1.1 }],
    spawn: { x: 7, y: 7.3 },
    blocked,
    entry: { x: 7, y: 7.3 },
    exit: { x0: 6, x1: 8, y: 8.05, to: 'hub', at: { x: 6.5, y: 26.4 } },
  };
}

// ------------------------------------------------------------------ Hilltop Farm fields

const FARM_ROWS = [
  '................',
  '................',
  '................',
  '..dddddppfffff..',
  '..dddddppfffff..',
  '..dddddppfffff..',
  '..dddddppfffff..',
  '.......pp.......',
  '..pppppppppppp..',
  '.......pp.......',
  '.......pp.......',
  '.......pp.......',
];

/** The two plots Chapter 3 compares (tile rectangles, inclusive). */
export const FARM_PLOTS = {
  west: { x0: 2, y0: 3, x1: 6, y1: 6 },
  east: { x0: 9, y0: 3, x1: 13, y1: 6 },
};

/**
 * Hilltop Farm's fields, through the gate north of the road: a tired west
 * plot (cotton every year) and a healthier east plot (rotated), with a
 * planning bench between them. Chapters 3 and 5 use it.
 */
export function buildFarmMap(): MapDef {
  const props: PropDef[] = [];
  const W = 16;
  const H = 12;
  for (let x = 0; x < W; x++) props.push({ kind: (x % 3 === 0 ? 'pine' : 'tree'), x, y: 0, variant: x % 3 });
  for (let y = 1; y < H; y++)
    for (const x of [0, W - 1]) props.push({ kind: (x + y) % 3 === 0 ? 'pine' : 'tree', x, y, variant: (x + y) % 3 });
  for (let x = 1; x < W - 1; x++) if (x < 6 || x > 9) props.push({ kind: x % 2 ? 'bush' : 'tree', x, y: H - 1, variant: x % 2 });
  // Low fences behind each plot.
  for (let x = FARM_PLOTS.west.x0; x <= FARM_PLOTS.west.x1; x++) props.push({ kind: 'fence', x, y: 2 });
  for (let x = FARM_PLOTS.east.x0; x <= FARM_PLOTS.east.x1; x++) props.push({ kind: 'fence', x, y: 2 });
  // West plot: thin, pale cotton. East plot: sturdy cotton after cowpeas.
  for (let x = FARM_PLOTS.west.x0; x <= FARM_PLOTS.west.x1; x++) for (const y of [4, 6]) props.push({ kind: 'crop', x, y, variant: 4, solid: false });
  for (let x = FARM_PLOTS.east.x0; x <= FARM_PLOTS.east.x1; x++) {
    props.push({ kind: 'crop', x, y: 4, variant: 6, solid: false });
    props.push({ kind: 'crop', x, y: 6, variant: 5, solid: false });
  }
  props.push({ kind: 'potting', x: 7, y: 2 });
  props.push({ kind: 'scarecrow', x: 14, y: 4 });
  props.push({ kind: 'crate', x: 5, y: 1 });
  props.push({ kind: 'barrel', x: 10, y: 1 });
  props.push({ kind: 'sign', x: 1, y: 7, text: 'West plot. Cotton, five years in a row.' });
  props.push({ kind: 'sign', x: 14, y: 7, text: 'East plot. Cotton, peanuts, cotton, cowpeas, cotton.' });
  return {
    id: 'farm',
    w: W,
    h: H,
    ground: parseGround(FARM_ROWS),
    buildings: [],
    props,
    places: [{ id: 'farm_exit', label: 'Back to town', x: 7.9, y: 11.3, radius: 1.1 }],
    spawn: { x: 7.9, y: 10.2 },
    blocked: new Set(),
    entry: { x: 7.9, y: 10.2 },
    exit: { x0: 7, x1: 9, y: 11.05, to: 'hub', at: { x: 33.9, y: 8.6 } },
  };
}

// ------------------------------------------------------------------ workshop

const WORKSHOP_ROWS = [
  '##############',
  '##############',
  '#oooooooooooo#',
  '#oooooooooooo#',
  '#oooooooooooo#',
  '#oooooorroooo#',
  '#oooooooooooo#',
  '#oooooooooooo#',
  '######oo######',
];

/** Where the workshop's furniture stands (tile x, y). */
export const WORKSHOP = {
  cropShelf: [2, 2] as [number, number],
  bench: [6, 4] as [number, number],
  decorShelf: [11, 2] as [number, number],
  rack: [1, 5] as [number, number],
};

/** Decorations players can buy with Seeds, and where each one shows up. */
export const WORKSHOP_DECOR_SPOTS: Record<string, { x: number; y: number; wall?: boolean }> = {
  fern: { x: 12.5, y: 7.6 },
  stool: { x: 1.6, y: 7.6 },
  poster: { x: 9.5, y: 2.0, wall: true },
  chime: { x: 4.6, y: 2.0, wall: true },
};

/** Mr. Brooks's workshop: a crop shelf, a workbench, a decoration shelf. */
export function buildWorkshopMap(): MapDef {
  const blocked = new Set<string>();
  const [cx, cy] = WORKSHOP.cropShelf;
  const [bx, by] = WORKSHOP.bench;
  const [dx, dy] = WORKSHOP.decorShelf;
  const [rx, ry] = WORKSHOP.rack;
  [`${cx},${cy}`, `${cx + 1},${cy}`, `${bx},${by}`, `${bx + 1},${by}`, `${dx},${dy}`, `${dx + 1},${dy}`, `${rx},${ry}`].forEach((k) => blocked.add(k));
  return {
    id: 'workshop',
    w: 14,
    h: 9,
    ground: parseGround(WORKSHOP_ROWS),
    buildings: [],
    props: [],
    places: [{ id: 'workshop_exit', label: 'Go outside', x: 7, y: 8.3, radius: 1.1 }],
    spawn: { x: 7, y: 7.3 },
    blocked,
    entry: { x: 7, y: 7.3 },
    exit: { x0: 6, x1: 8, y: 8.05, to: 'hub', at: { x: 33.5, y: 26.4 } },
  };
}
