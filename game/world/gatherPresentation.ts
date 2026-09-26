// gatherPresentation.ts
// Pure TypeScript module — NO Phaser dependency.
//
// Gather-variant presentation layer over the shared campus layout
// (campusLayout.ts). The zone/NPC DATA stays in campusLayout so both world
// variants share one source of truth; this module adds what the Gather-style
// scene needs on top:
//   - open walk-in ROOMS carved into the map (perimeter walls + a doorway +
//     stone floor) so buildings are entered seamlessly, no scene transitions
//   - animated character sprites + in-room placement for each NPC
//   - per-room learning stations (incl. the full Math Hall game set)

import { CAMPUS_NPCS, type CampusNpcDefinition } from './campusLayout';
import { TILE, TILE_SIZE } from './TilemapGenerator';
import type { TalkableNpcConfig } from '../entities/TalkableNPC';

const T = TILE_SIZE;

// ─── Open walk-in rooms ───────────────────────────────────────────────────────
// Tile-rectangle rooms placed inside each learning zone, clear of the two main
// cross-path bands (cols 47-48, rows 35-36). Each is hollow: perimeter walls of
// the zone's wall tile, a stone-path floor, and a 2-tile open doorway.
export interface GatherRoom {
  id: string;
  label: string;
  wallTile: number;
  /** Inclusive wall-rectangle bounds, in tiles */
  c0: number; r0: number; c1: number; r1: number;
  /** Wall tiles left open as a doorway */
  door: { c: number; r: number }[];
  /** Sign position (pixels) */
  labelX: number; labelY: number;
}

export const GATHER_ROOMS: GatherRoom[] = [
  {
    id: 'math-hall',
    label: 'MATH HALL',
    wallTile: TILE.WALL_MATH,
    c0: 4, r0: 25, c1: 20, r1: 34,
    door: [{ c: 11, r: 34 }, { c: 12, r: 34 }],
    labelX: 12 * T, labelY: 24.2 * T,
  },
  {
    id: 'discovery-lab',
    label: 'DISCOVERY LAB',
    wallTile: TILE.WALL_SCI,
    c0: 34, r0: 4, c1: 45, r1: 15,
    door: [{ c: 39, r: 15 }, { c: 40, r: 15 }],
    labelX: 39.5 * T, labelY: 3.2 * T,
  },
  {
    id: 'story-grove',
    label: 'STORY GROVE',
    wallTile: TILE.WALL_ENG,
    c0: 74, r0: 25, c1: 90, r1: 34,
    door: [{ c: 81, r: 34 }, { c: 82, r: 34 }],
    labelX: 82 * T, labelY: 24.2 * T,
  },
  {
    id: 'commons',
    label: 'THE COMMONS',
    wallTile: TILE.WALL_BRICK,
    c0: 50, r0: 52, c1: 62, r1: 63,
    door: [{ c: 55, r: 52 }, { c: 56, r: 52 }],
    labelX: 56 * T, labelY: 51.2 * T,
  },
];

/** Carve every Gather room into the given tile grid (mutates in place). */
export function carveGatherRooms(tiles: number[][]): void {
  for (const room of GATHER_ROOMS) {
    // Stone-path floor interior
    for (let r = room.r0 + 1; r <= room.r1 - 1; r++) {
      for (let c = room.c0 + 1; c <= room.c1 - 1; c++) {
        tiles[r][c] = TILE.PATH;
      }
    }
    // Perimeter walls
    for (let c = room.c0; c <= room.c1; c++) {
      tiles[room.r0][c] = room.wallTile;
      tiles[room.r1][c] = room.wallTile;
    }
    for (let r = room.r0; r <= room.r1; r++) {
      tiles[r][room.c0] = room.wallTile;
      tiles[r][room.c1] = room.wallTile;
    }
    // Open the doorway: replace those wall tiles with floor
    for (const d of room.door) {
      tiles[d.r][d.c] = TILE.PATH;
    }
  }
}

export interface GatherRoomLabel { text: string; x: number; y: number; }

export function getGatherRoomLabels(): GatherRoomLabel[] {
  return GATHER_ROOMS.map((r) => ({ text: r.label, x: r.labelX, y: r.labelY }));
}

// ─── NPC presentation: sprite + in-room placement per campusLayout NPC id ─────
interface NpcPresentation {
  charKey: string;
  /** Override the campusLayout tile position (to place the NPC inside a room) */
  tile?: { col: number; row: number };
  /** Patrol offsets in tiles relative to the home tile (hub NPCs only) */
  patrol?: { dc: number; dr: number }[];
}

const NPC_PRESENTATION: Record<string, NpcPresentation> = {
  // Hub guides wander the open plaza
  npc_jaylen_guide: {
    charKey: 'human-2',
    patrol: [{ dc: 0, dr: 0 }, { dc: -2, dr: -1 }, { dc: 2, dr: -1 }],
  },
  npc_professor_ivy: {
    charKey: 'human-1',
    patrol: [{ dc: 0, dr: 0 }, { dc: 1, dr: 2 }, { dc: -1, dr: 2 }],
  },
  // Subject hosts stand inside their open rooms (stationary — small rooms)
  npc_professor_numbers: { charKey: 'wizard-purple', tile: { col: 15, row: 31 } },
  npc_dr_spark: { charKey: 'robot-blue', tile: { col: 40, row: 10 } },
  npc_story_sage: { charKey: 'cat-orange', tile: { col: 79, row: 30 } },
  npc_commons_host: { charKey: 'knight-silver', tile: { col: 56, row: 60 } },
};

const DEFAULT_CHAR_KEY = 'human-1';

/** Build TalkableNPC configs from the shared campus layout NPC definitions. */
export function buildGatherNpcConfigs(): TalkableNpcConfig[] {
  return CAMPUS_NPCS.map((def: CampusNpcDefinition) => {
    const p = NPC_PRESENTATION[def.id];
    const x = (p?.tile?.col ?? def.tileCol) * T;
    const y = (p?.tile?.row ?? def.tileRow) * T;
    return {
      id: def.id,
      name: def.name,
      charKey: p?.charKey ?? DEFAULT_CHAR_KEY,
      x,
      y,
      lines: def.dialog,
      wander: p?.patrol?.map((o) => ({ x: x + o.dc * T, y: y + o.dr * T })),
      onComplete:
        def.onFinalDialogLine === 'openQuestBoard'
          ? { event: 'open-job-board', payload: {} }
          : undefined,
    };
  });
}

// ─── Learning stations, placed INSIDE the open rooms ──────────────────────────
// adventureId must match an HTML game in public/games/ (AdventureEmbed falls
// back to /games/{id}.html).
export interface GatherStationDef {
  id: string;
  name: string;
  adventureId: string;
  texture: 'arcade-cabinet' | 'desk-computer';
  x: number;
  y: number;
}

export const GATHER_STATIONS: GatherStationDef[] = [
  // Math Hall (interior cols 5-19, rows 26-33) — the full Math Lab game set,
  // incl. Math Race Rally (the quest game). Professor Numbers stands at (15,31).
  { id: 'math-pizza',  name: 'Pizza Fractions',     adventureId: 'pizza-fraction-frenzy',         texture: 'arcade-cabinet', x: 6 * T,  y: 27 * T },
  { id: 'math-race',   name: 'Math Race Rally',     adventureId: 'math-race-rally',               texture: 'arcade-cabinet', x: 10 * T, y: 27 * T },
  { id: 'math-bingo',  name: 'Multiplication Bingo',adventureId: 'multiplication-bingo-bonanza',  texture: 'arcade-cabinet', x: 14 * T, y: 27 * T },
  { id: 'math-monster',name: 'Number Monsters',     adventureId: 'number-monster-feeding',        texture: 'desk-computer',  x: 18 * T, y: 27 * T },
  { id: 'math-jep',    name: 'Math Jeopardy',       adventureId: 'math-jeopardy-junior',          texture: 'desk-computer',  x: 8 * T,  y: 32 * T },
  { id: 'math-nullrun',name: 'Null Run',            adventureId: 'null-run',                      texture: 'arcade-cabinet', x: 12 * T, y: 32 * T },
  // Discovery Lab (interior cols 35-44, rows 5-14). Dr. Spark at (40,10).
  { id: 'sci-crystal', name: 'Crystal Chemistry',   adventureId: 'crystal-cave-chemistry',        texture: 'desk-computer',  x: 36 * T, y: 6 * T },
  { id: 'sci-solar',   name: 'Solar System',        adventureId: 'solar-system-explorer',         texture: 'arcade-cabinet', x: 43 * T, y: 6 * T },
  { id: 'sci-matter',  name: 'Matter Mixer',        adventureId: 'states-of-matter-mixer',        texture: 'desk-computer',  x: 36 * T, y: 13 * T },
  { id: 'sci-magnet',  name: 'Magnet Puzzle',       adventureId: 'magnet-power-puzzle',           texture: 'arcade-cabinet', x: 43 * T, y: 13 * T },
  // Story Grove (interior cols 75-89, rows 26-33). Story Sage at (79,30).
  { id: 'story-animal',name: 'Animal Match',        adventureId: 'animal-kingdom-match',          texture: 'arcade-cabinet', x: 77 * T, y: 27 * T },
  { id: 'story-ocean', name: 'Ocean Heroes',        adventureId: 'ocean-conservation-heroes',     texture: 'desk-computer',  x: 87 * T, y: 27 * T },
  { id: 'story-weather',name:'Weather Wizard',      adventureId: 'weather-wizard-battle',         texture: 'arcade-cabinet', x: 83 * T, y: 32 * T },
  // The Commons (interior cols 51-61, rows 53-62). Commons Host at (56,60),
  // campus shop interactable sits at door tile (54,56) from campusLayout.
  { id: 'commons-cash',name: 'Cafeteria Cashier',   adventureId: 'cafeteria-cashier',             texture: 'desk-computer',  x: 52 * T, y: 55 * T },
  { id: 'commons-money',name:'Money Market',        adventureId: 'money-market-madness',          texture: 'arcade-cabinet', x: 60 * T, y: 55 * T },
];
