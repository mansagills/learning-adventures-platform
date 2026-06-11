// GatherCampusMap.ts
// Pure TypeScript module — NO Phaser dependency.
// Defines the Gather-style continuous campus: one 40×30 tile map where every
// building is an open-front room you walk into (no scene transitions).
//
// Zone/building/NPC/station IDs follow docs/CAMPUS_V1_POINT_CLICK_SPEC.md so
// they stay stable across versions: math west, science north, english east,
// commons south, main hub in the centre.

// ─── Dimensions ───────────────────────────────────────────────────────────────
export const CAMPUS_COLS = 40;
export const CAMPUS_ROWS = 30;
export const TILE_SIZE = 64;
export const CAMPUS_PIXEL_W = CAMPUS_COLS * TILE_SIZE; // 2560
export const CAMPUS_PIXEL_H = CAMPUS_ROWS * TILE_SIZE; // 1920

// ─── Tile indices ─────────────────────────────────────────────────────────────
export const CTILE = {
  GRASS_1: 0,
  GRASS_2: 1,
  GRASS_3: 2,
  FLOWERS_1: 3,
  FLOWERS_2: 4,
  PATH: 5,
  WATER: 6,
  WALL_MATH: 7,
  WALL_SCI: 8,
  WALL_ENG: 9,
  WALL_BRICK: 10,
  FLOOR_WOOD_1: 11,
  FLOOR_WOOD_2: 12,
  FLOOR_STONE_1: 13,
  FLOOR_STONE_2: 14,
} as const;

type CTileIndex = (typeof CTILE)[keyof typeof CTILE];

/** Phaser texture key for each tile index. Keys match GatherCampusScene preload. */
export const CTILE_ASSET_KEYS: Record<CTileIndex, string> = {
  [CTILE.GRASS_1]: 'ground-grass-1',
  [CTILE.GRASS_2]: 'ground-grass-2',
  [CTILE.GRASS_3]: 'ground-grass-3',
  [CTILE.FLOWERS_1]: 'ground-flowers-1',
  [CTILE.FLOWERS_2]: 'ground-flowers-2',
  [CTILE.PATH]: 'ground-path',
  [CTILE.WATER]: 'ground-water',
  [CTILE.WALL_MATH]: 'wall-math-1',
  [CTILE.WALL_SCI]: 'wall-science-1',
  [CTILE.WALL_ENG]: 'wall-english-1',
  [CTILE.WALL_BRICK]: 'wall-brick-1',
  [CTILE.FLOOR_WOOD_1]: 'floor-wood-1',
  [CTILE.FLOOR_WOOD_2]: 'floor-wood-2',
  [CTILE.FLOOR_STONE_1]: 'floor-stone-1',
  [CTILE.FLOOR_STONE_2]: 'floor-stone-2',
};

/** Tiles the player cannot walk through. */
export const SOLID_TILES: ReadonlySet<number> = new Set([
  CTILE.WATER,
  CTILE.WALL_MATH,
  CTILE.WALL_SCI,
  CTILE.WALL_ENG,
  CTILE.WALL_BRICK,
]);

// ─── Spawn point (plaza centre) ───────────────────────────────────────────────
export const CAMPUS_SPAWN = { x: 20 * TILE_SIZE, y: 19 * TILE_SIZE };

// ─── Building room definitions ────────────────────────────────────────────────
// Each room is a walled rectangle with an open doorway facing the plaza.
interface RoomDef {
  id: string;
  label: string;
  wallTile: CTileIndex;
  // Inclusive tile bounds of the walled footprint
  col0: number;
  row0: number;
  col1: number;
  row1: number;
  // Doorway: tiles on the perimeter left open (floor instead of wall)
  door: { col: number; row: number }[];
  // Where the label sign hangs (pixel coords)
  labelX: number;
  labelY: number;
}

const ROOMS: RoomDef[] = [
  {
    id: 'discovery-lab',
    label: '🔬 DISCOVERY LAB',
    wallTile: CTILE.WALL_SCI,
    col0: 14, row0: 2, col1: 25, row1: 9,
    door: [{ col: 19, row: 9 }, { col: 20, row: 9 }],
    labelX: 20 * TILE_SIZE, labelY: 1.4 * TILE_SIZE,
  },
  {
    id: 'math-hall',
    label: '🔢 MATH HALL',
    wallTile: CTILE.WALL_MATH,
    col0: 2, row0: 12, col1: 11, row1: 21,
    door: [{ col: 11, row: 16 }, { col: 11, row: 17 }],
    labelX: 7 * TILE_SIZE, labelY: 11.4 * TILE_SIZE,
  },
  {
    id: 'story-grove',
    label: '📚 STORY GROVE',
    wallTile: CTILE.WALL_ENG,
    col0: 28, row0: 12, col1: 37, row1: 21,
    door: [{ col: 28, row: 16 }, { col: 28, row: 17 }],
    labelX: 33 * TILE_SIZE, labelY: 11.4 * TILE_SIZE,
  },
  {
    id: 'commons',
    label: '🏪 THE COMMONS',
    wallTile: CTILE.WALL_BRICK,
    col0: 14, row0: 23, col1: 25, row1: 29,
    door: [{ col: 19, row: 23 }, { col: 20, row: 23 }],
    labelX: 20 * TILE_SIZE, labelY: 22.4 * TILE_SIZE,
  },
];

export interface BuildingLabel {
  text: string;
  x: number;
  y: number;
}

export function getBuildingLabels(): BuildingLabel[] {
  return ROOMS.map((r) => ({ text: r.label, x: r.labelX, y: r.labelY }));
}

// ─── Map generator ────────────────────────────────────────────────────────────
function fillRect(
  tiles: number[][],
  row0: number, col0: number, row1: number, col1: number,
  tile: number,
): void {
  for (let r = row0; r <= row1; r++) {
    for (let c = col0; c <= col1; c++) {
      tiles[r][c] = tile;
    }
  }
}

function carveRoom(tiles: number[][], room: RoomDef): void {
  // Interior floor — checkerboard of wood variants for 16-bit texture
  for (let r = room.row0 + 1; r <= room.row1 - 1; r++) {
    for (let c = room.col0 + 1; c <= room.col1 - 1; c++) {
      tiles[r][c] = (r + c) % 2 === 0 ? CTILE.FLOOR_WOOD_1 : CTILE.FLOOR_WOOD_2;
    }
  }
  // Perimeter walls
  for (let c = room.col0; c <= room.col1; c++) {
    tiles[room.row0][c] = room.wallTile;
    tiles[room.row1][c] = room.wallTile;
  }
  for (let r = room.row0; r <= room.row1; r++) {
    tiles[r][room.col0] = room.wallTile;
    tiles[r][room.col1] = room.wallTile;
  }
  // Doorway openings
  room.door.forEach(({ col, row }) => {
    tiles[row][col] = CTILE.FLOOR_WOOD_1;
  });
}

/** Generate the 30-row × 40-column tile array for the campus. */
export function generateCampus(): number[][] {
  const tiles: number[][] = [];

  // Base grass with deterministic variety (no Math.random — stable map)
  for (let r = 0; r < CAMPUS_ROWS; r++) {
    tiles[r] = new Array(CAMPUS_COLS);
    for (let c = 0; c < CAMPUS_COLS; c++) {
      if ((c * 7 + r * 13) % 23 === 0) tiles[r][c] = CTILE.FLOWERS_1;
      else if ((c * 5 + r * 11) % 19 === 0) tiles[r][c] = CTILE.FLOWERS_2;
      else if ((c + r) % 5 === 0) tiles[r][c] = CTILE.GRASS_2;
      else if ((c + r) % 7 === 0) tiles[r][c] = CTILE.GRASS_3;
      else tiles[r][c] = CTILE.GRASS_1;
    }
  }

  // Pond (top-left corner park)
  fillRect(tiles, 3, 3, 6, 7, CTILE.WATER);

  // Central plaza — stone pavement between the four buildings
  for (let r = 11; r <= 21; r++) {
    for (let c = 13; c <= 26; c++) {
      tiles[r][c] = (r + c) % 2 === 0 ? CTILE.FLOOR_STONE_1 : CTILE.FLOOR_STONE_2;
    }
  }

  // Paths from plaza to each doorway
  fillRect(tiles, 10, 19, 10, 20, CTILE.PATH); // up to Discovery Lab door
  fillRect(tiles, 16, 12, 17, 12, CTILE.PATH); // left to Math Hall door
  fillRect(tiles, 16, 27, 17, 27, CTILE.PATH); // right to Story Grove door
  fillRect(tiles, 22, 19, 22, 20, CTILE.PATH); // down to Commons door
  // Scenic path from plaza toward the pond park
  fillRect(tiles, 9, 10, 10, 12, CTILE.PATH);
  fillRect(tiles, 7, 10, 9, 10, CTILE.PATH);

  // Buildings (drawn last so walls overwrite plaza/path edges)
  ROOMS.forEach((room) => carveRoom(tiles, room));

  return tiles;
}

// ─── NPC definitions ──────────────────────────────────────────────────────────
export interface CampusNpcDef {
  id: string;
  name: string;
  /** Character sheet id — texture key is `player-${charKey}` */
  charKey: string;
  x: number;
  y: number;
  /** Lines spoken in order when the player walks up */
  lines: string[];
  /** Optional patrol waypoints (pixel coords). NPC wanders when not talking. */
  wander?: { x: number; y: number }[];
  /** Optional EventBus event emitted when the conversation finishes */
  onComplete?: { event: string; payload?: Record<string, unknown> };
}

const T = TILE_SIZE;

export const CAMPUS_NPCS: CampusNpcDef[] = [
  {
    id: 'mayor-maple',
    name: 'Mayor Maple',
    charKey: 'human-2',
    x: 20 * T, y: 14 * T,
    lines: [
      'Welcome to Learning Campus! Walk up to anyone and they\'ll chat with you.',
      'The Discovery Lab is up north, Math Hall is out west, and Story Grove is east.',
      'Head south to The Commons if you want to spend your coins. Have fun!',
    ],
    wander: [
      { x: 20 * T, y: 14 * T },
      { x: 16 * T, y: 18 * T },
      { x: 24 * T, y: 18 * T },
      { x: 20 * T, y: 20 * T },
    ],
  },
  {
    id: 'prof-euler',
    name: 'Professor Euler',
    charKey: 'wizard-purple',
    x: 7 * T, y: 16 * T,
    lines: [
      'Ah, a new mathematician! Welcome to Math Hall.',
      'Each station here runs a different math game — fractions, racing, equations…',
      'Walk up to any station and press SPACE to play. Math is the language of the universe!',
    ],
    wander: [
      { x: 7 * T, y: 16 * T },
      { x: 5 * T, y: 14 * T },
      { x: 9 * T, y: 18 * T },
    ],
  },
  {
    id: 'dr-bunsen',
    name: 'Dr. Bunsen',
    charKey: 'robot-blue',
    x: 20 * T, y: 5 * T,
    lines: [
      'BEEP! Welcome to the Discovery Lab, young scientist.',
      'Hypothesis first, then experiment! Try the chemistry and space stations.',
      'And remember — safety goggles are a state of mind.',
    ],
    wander: [
      { x: 20 * T, y: 5 * T },
      { x: 18 * T, y: 7 * T },
      { x: 22 * T, y: 6 * T },
    ],
  },
  {
    id: 'poet-penelope',
    name: 'Poet Penelope',
    charKey: 'human-1',
    x: 33 * T, y: 16 * T,
    lines: [
      'Welcome to Story Grove, where every game tells a tale.',
      'Match, explore, and battle your way through stories at the stations here.',
      'Let your imagination paint a thousand pictures!',
    ],
    wander: [
      { x: 33 * T, y: 16 * T },
      { x: 31 * T, y: 14 * T },
      { x: 35 * T, y: 19 * T },
    ],
  },
  {
    id: 'merchant-mo',
    name: 'Merchant Mo',
    charKey: 'knight-silver',
    x: 20 * T, y: 26 * T,
    lines: [
      'Welcome to The Commons — best deals on campus!',
      'Earn coins by finishing games, then come see what I\'ve got in stock.',
      'Want a look at my wares?',
    ],
    onComplete: { event: 'open-shop', payload: {} },
  },
  {
    id: 'student-skye',
    name: 'Skye',
    charKey: 'cat-orange',
    x: 24 * T, y: 12 * T,
    lines: [
      'Hi! I just finished the Pizza Fractions game — it\'s SO good.',
      'I\'m trying to earn enough coins for the wizard hat in the shop!',
    ],
    wander: [
      { x: 24 * T, y: 12 * T },
      { x: 14 * T, y: 12 * T },
      { x: 14 * T, y: 20 * T },
      { x: 25 * T, y: 20 * T },
    ],
  },
  {
    id: 'student-remy',
    name: 'Remy',
    charKey: 'robot-blue',
    x: 10 * T, y: 8 * T,
    lines: [
      'I like watching the pond between classes. Very calming.',
      'Did you know there are games in every building? The lab ones are my favorite.',
    ],
    wander: [
      { x: 10 * T, y: 8 * T },
      { x: 11 * T, y: 10 * T },
      { x: 9 * T, y: 9 * T },
    ],
  },
];

// ─── Learning station definitions ─────────────────────────────────────────────
// adventureId must match an HTML game in public/games/ (AdventureEmbed falls
// back to /games/{id}.html).
export interface CampusStationDef {
  id: string;
  name: string;
  adventureId: string;
  texture: 'arcade-cabinet' | 'desk-computer';
  x: number;
  y: number;
}

export const CAMPUS_STATIONS: CampusStationDef[] = [
  // Math Hall
  { id: 'math-1', name: 'Pizza Fractions', adventureId: 'pizza-fraction-frenzy', texture: 'arcade-cabinet', x: 4 * T, y: 14 * T },
  { id: 'math-2', name: 'Math Race Rally', adventureId: 'math-race-rally', texture: 'arcade-cabinet', x: 10 * T, y: 14 * T },
  { id: 'math-3', name: 'Equation Balance', adventureId: 'equation-balance-scale', texture: 'desk-computer', x: 4 * T, y: 20 * T },
  { id: 'math-4', name: 'Geometry Builder', adventureId: 'geometry-builder-challenge', texture: 'desk-computer', x: 10 * T, y: 20 * T },
  // Discovery Lab
  { id: 'sci-1', name: 'Crystal Chemistry', adventureId: 'crystal-cave-chemistry', texture: 'desk-computer', x: 16 * T, y: 4 * T },
  { id: 'sci-2', name: 'Solar System', adventureId: 'solar-system-explorer', texture: 'arcade-cabinet', x: 24 * T, y: 4 * T },
  { id: 'sci-3', name: 'Matter Mixer', adventureId: 'states-of-matter-mixer', texture: 'desk-computer', x: 16 * T, y: 8 * T },
  { id: 'sci-4', name: 'Magnet Puzzle', adventureId: 'magnet-power-puzzle', texture: 'arcade-cabinet', x: 24 * T, y: 8 * T },
  // Story Grove
  { id: 'story-1', name: 'Animal Match', adventureId: 'animal-kingdom-match', texture: 'arcade-cabinet', x: 30 * T, y: 14 * T },
  { id: 'story-2', name: 'Ocean Heroes', adventureId: 'ocean-conservation-heroes', texture: 'desk-computer', x: 36 * T, y: 14 * T },
  { id: 'story-3', name: 'Weather Wizard', adventureId: 'weather-wizard-battle', texture: 'arcade-cabinet', x: 30 * T, y: 20 * T },
  // The Commons
  { id: 'commons-1', name: 'Cafeteria Cashier', adventureId: 'cafeteria-cashier', texture: 'desk-computer', x: 16 * T, y: 25 * T },
  { id: 'commons-2', name: 'Money Market', adventureId: 'money-market-madness', texture: 'arcade-cabinet', x: 24 * T, y: 25 * T },
];
