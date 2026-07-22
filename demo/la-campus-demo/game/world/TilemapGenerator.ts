// TilemapGenerator.ts
import { CAMPUS_BUILDINGS } from './campusLayout';
// Pure TypeScript module — NO Phaser dependency.
// Generates the tile data array for the 96×72 open world campus.

// ─── World dimensions ────────────────────────────────────────────────────────
export const WORLD_COLS = 96;
export const WORLD_ROWS = 72;
export const ZONE_COLS = 32;   // each zone is 32 tiles wide
export const ZONE_ROWS = 24;   // each zone is 24 tiles tall
export const TILE_SIZE = 64;   // pixels per tile

// Main cross-path tile positions
export const PATH_COL_A = 47;  // left column of vertical path band
export const PATH_COL_B = 48;  // right column of vertical path band
export const PATH_ROW_A = 35;  // top row of horizontal path band
export const PATH_ROW_B = 36;  // bottom row of horizontal path band

// ─── Tile index constants ─────────────────────────────────────────────────────
export const TILE = {
  GRASS_1:    0,  // ground-grass-1   plain grass
  GRASS_2:    1,  // ground-grass-2   grass variant
  GRASS_3:    2,  // ground-grass-3   grass variant
  FLOWERS_1:  3,  // ground-flowers-1
  FLOWERS_2:  4,  // ground-flowers-2
  PATH:       5,  // ground-path      stone path
  DIRT:       6,  // ground-dirt
  WATER:      7,  // ground-water
  WALL_MATH:  8,  // wall-math-1
  WALL_SCI:   9,  // wall-science-1
  WALL_ENG:   10, // wall-english-1
  WALL_BRICK: 11, // wall-brick-1
} as const;

// Type check: ensures TILE_ASSET_KEYS covers every tile index
type _TileCoverage = Record<typeof TILE[keyof typeof TILE], string>;

export const TILE_ASSET_KEYS: _TileCoverage = {
  0:  'ground-grass-1',
  1:  'ground-grass-2',
  2:  'ground-grass-3',
  3:  'ground-flowers-1',
  4:  'ground-flowers-2',
  5:  'ground-path',
  6:  'ground-dirt',
  7:  'ground-water',
  8:  'wall-math-1',
  9:  'wall-science-1',
  10: 'wall-english-1',
  11: 'wall-brick-1',
};

// ─── Building door interface ──────────────────────────────────────────────────
export interface BuildingDoorConfig {
  id: string;
  zoneId: string;
  building: string;
  doorTileCol: number;
  doorTileRow: number;
  targetScene: string | null;  // null = NPC "coming soon" dialog
  spawnX: number;              // spawn position in OpenWorldScene after exiting
  spawnY: number;
  label: string;               // display label on building
  wallKey: string;             // asset key for wall texture
  wallTileCol: number;         // top-left tile col of 4×3 building footprint
  wallTileRow: number;         // top-left tile row of 4×3 building footprint
  wallTileW: number;
  wallTileH: number;
  tileIndex: number;           // tile index (8-11) for wall tiles
  dialog: string;
}

// ─── Helper: fill a rectangular region with a single tile index ───────────────
function fillRect(
  tiles: number[][],
  rowStart: number,
  rowEnd: number,
  colStart: number,
  colEnd: number,
  tileIndex: number,
): void {
  for (let r = rowStart; r <= rowEnd; r++) {
    for (let c = colStart; c <= colEnd; c++) {
      tiles[r][c] = tileIndex;
    }
  }
}

// ─── Main generator ───────────────────────────────────────────────────────────
/**
 * Generate the 72-row × 96-column tile data array for the open world campus.
 * Steps execute in order; later steps overwrite earlier ones.
 */
export function generate(): number[][] {
  // ── Step 1: Initialise all cells to GRASS_1 ──────────────────────────────
  const tiles: number[][] = [];
  for (let r = 0; r < WORLD_ROWS; r++) {
    tiles[r] = new Array(WORLD_COLS).fill(TILE.GRASS_1);
  }

  // ── Step 2: Zone biome fills ──────────────────────────────────────────────
  // Zone layout (3×3 grid):
  //  Row 0 (rows 0 to ZONE_ROWS-1)         : Math(0..ZONE_COLS-1)       Library(ZONE_COLS..2*ZONE_COLS-1)   Science(2*ZONE_COLS..3*ZONE_COLS-1)
  //  Row 1 (rows ZONE_ROWS..2*ZONE_ROWS-1) : History(0..ZONE_COLS-1)    TownSquare(ZONE_COLS..2*ZONE_COLS-1) English(2*ZONE_COLS..3*ZONE_COLS-1)
  //  Row 2 (rows 2*ZONE_ROWS..3*ZONE_ROWS-1): Nature(0..ZONE_COLS-1)   Market(ZONE_COLS..2*ZONE_COLS-1)    Interdisc.(2*ZONE_COLS..3*ZONE_COLS-1)

  // ── Math zone (cols 0 to ZONE_COLS-1, rows 0 to ZONE_ROWS-1) ─────────────
  for (let r = 0; r <= ZONE_ROWS - 1; r++) {
    for (let c = 0; c <= ZONE_COLS - 1; c++) {
      if ((c + r) % 5 === 0) {
        tiles[r][c] = TILE.FLOWERS_1;
      } else if ((c + r) % 7 === 0) {
        tiles[r][c] = TILE.GRASS_2;
      } else {
        tiles[r][c] = TILE.GRASS_1;
      }
    }
  }

  // ── Library zone (cols ZONE_COLS to 2*ZONE_COLS-1, rows 0 to ZONE_ROWS-1) ─
  for (let r = 0; r <= ZONE_ROWS - 1; r++) {
    for (let c = ZONE_COLS; c <= 2 * ZONE_COLS - 1; c++) {
      tiles[r][c] = (c + r) % 4 === 0 ? TILE.GRASS_3 : TILE.GRASS_2;
    }
  }
  // 2-tile inner border with dirt: top/bottom rows of this zone
  for (let c = ZONE_COLS; c <= 2 * ZONE_COLS - 1; c++) {
    tiles[0][c]              = TILE.DIRT;
    tiles[1][c]              = TILE.DIRT;
    tiles[ZONE_ROWS - 2][c] = TILE.DIRT;
    tiles[ZONE_ROWS - 1][c] = TILE.DIRT;
  }
  // left/right 2-tile columns of this zone
  for (let r = 0; r <= ZONE_ROWS - 1; r++) {
    tiles[r][ZONE_COLS]         = TILE.DIRT;
    tiles[r][ZONE_COLS + 1]     = TILE.DIRT;
    tiles[r][2 * ZONE_COLS - 2] = TILE.DIRT;
    tiles[r][2 * ZONE_COLS - 1] = TILE.DIRT;
  }

  // ── Science zone (cols 2*ZONE_COLS to 3*ZONE_COLS-1, rows 0 to ZONE_ROWS-1)
  for (let r = 0; r <= ZONE_ROWS - 1; r++) {
    for (let c = 2 * ZONE_COLS; c <= 3 * ZONE_COLS - 1; c++) {
      tiles[r][c] = (c * r) % 7 === 0 ? TILE.FLOWERS_2 : TILE.GRASS_1;
    }
  }

  // ── History zone (cols 0 to ZONE_COLS-1, rows ZONE_ROWS to 2*ZONE_ROWS-1) ─
  for (let r = ZONE_ROWS; r <= 2 * ZONE_ROWS - 1; r++) {
    for (let c = 0; c <= ZONE_COLS - 1; c++) {
      tiles[r][c] = (c + r) % 3 !== 0 ? TILE.DIRT : TILE.GRASS_3;
    }
  }

  // ── Town Square zone (cols ZONE_COLS to 2*ZONE_COLS-1, rows ZONE_ROWS to 2*ZONE_ROWS-1)
  // Base fill: grass-1
  for (let r = ZONE_ROWS; r <= 2 * ZONE_ROWS - 1; r++) {
    for (let c = ZONE_COLS; c <= 2 * ZONE_COLS - 1; c++) {
      tiles[r][c] = TILE.GRASS_1;
    }
  }
  // PATH ring — outermost 2 tiles inside zone boundary
  // top 2 rows
  for (let c = ZONE_COLS; c <= 2 * ZONE_COLS - 1; c++) {
    tiles[ZONE_ROWS][c]     = TILE.PATH;
    tiles[ZONE_ROWS + 1][c] = TILE.PATH;
  }
  // bottom 2 rows
  for (let c = ZONE_COLS; c <= 2 * ZONE_COLS - 1; c++) {
    tiles[2 * ZONE_ROWS - 2][c] = TILE.PATH;
    tiles[2 * ZONE_ROWS - 1][c] = TILE.PATH;
  }
  // left 2 columns
  for (let r = ZONE_ROWS; r <= 2 * ZONE_ROWS - 1; r++) {
    tiles[r][ZONE_COLS]     = TILE.PATH;
    tiles[r][ZONE_COLS + 1] = TILE.PATH;
  }
  // right 2 columns
  for (let r = ZONE_ROWS; r <= 2 * ZONE_ROWS - 1; r++) {
    tiles[r][2 * ZONE_COLS - 2] = TILE.PATH;
    tiles[r][2 * ZONE_COLS - 1] = TILE.PATH;
  }

  // ── English zone (cols 2*ZONE_COLS to 3*ZONE_COLS-1, rows ZONE_ROWS to 2*ZONE_ROWS-1)
  for (let r = ZONE_ROWS; r <= 2 * ZONE_ROWS - 1; r++) {
    for (let c = 2 * ZONE_COLS; c <= 3 * ZONE_COLS - 1; c++) {
      if ((c + r) % 4 === 0) {
        tiles[r][c] = TILE.FLOWERS_1;
      } else if ((c + r) % 6 === 0) {
        tiles[r][c] = TILE.FLOWERS_2;
      } else {
        tiles[r][c] = TILE.GRASS_2;
      }
    }
  }

  // ── Nature Park zone (cols 0 to ZONE_COLS-1, rows 2*ZONE_ROWS to 3*ZONE_ROWS-1)
  for (let r = 2 * ZONE_ROWS; r <= 3 * ZONE_ROWS - 1; r++) {
    for (let c = 0; c <= ZONE_COLS - 1; c++) {
      if ((c + r) % 2 === 0) {
        // alternate between flowers-1 and flowers-2
        tiles[r][c] = (c + r) % 4 === 0 ? TILE.FLOWERS_1 : TILE.FLOWERS_2;
      } else {
        tiles[r][c] = TILE.GRASS_1;
      }
    }
  }

  // ── Market zone (cols ZONE_COLS to 2*ZONE_COLS-1, rows 2*ZONE_ROWS to 3*ZONE_ROWS-1)
  for (let r = 2 * ZONE_ROWS; r <= 3 * ZONE_ROWS - 1; r++) {
    for (let c = ZONE_COLS; c <= 2 * ZONE_COLS - 1; c++) {
      const localCol = c - ZONE_COLS;
      const mod = localCol % 5;
      tiles[r][c] = (mod === 0 || mod === 1) ? TILE.DIRT : TILE.GRASS_1;
    }
  }

  // ── Interdisciplinary zone (cols 2*ZONE_COLS to 3*ZONE_COLS-1, rows 2*ZONE_ROWS to 3*ZONE_ROWS-1)
  for (let r = 2 * ZONE_ROWS; r <= 3 * ZONE_ROWS - 1; r++) {
    for (let c = 2 * ZONE_COLS; c <= 3 * ZONE_COLS - 1; c++) {
      if (r % 3 === 0) {
        tiles[r][c] = TILE.GRASS_3;
      } else {
        tiles[r][c] = r % 2 === 0 ? TILE.GRASS_1 : TILE.GRASS_2;
      }
    }
  }

  // ── Step 3: Main cross-paths (overwrite everything) ───────────────────────
  // Vertical band: cols 47 & 48, all rows
  for (let r = 0; r < WORLD_ROWS; r++) {
    tiles[r][PATH_COL_A] = TILE.PATH;
    tiles[r][PATH_COL_B] = TILE.PATH;
  }
  // Horizontal band: rows 35 & 36, all cols
  for (let c = 0; c < WORLD_COLS; c++) {
    tiles[PATH_ROW_A][c] = TILE.PATH;
    tiles[PATH_ROW_B][c] = TILE.PATH;
  }

  // Step 4: Campus V1 approach paths to the hub, buildings, and guide points.
  fillRect(tiles, 32, 39, 44, 51, TILE.PATH); // Main Hub plaza
  fillRect(tiles, 31, PATH_ROW_B, 14, 16, TILE.PATH); // Math Hall approach
  fillRect(tiles, 8, 10, 41, PATH_COL_B, TILE.PATH); // Discovery Lab approach
  fillRect(tiles, 31, PATH_ROW_B, 79, 80, TILE.PATH); // Story Grove approach
  fillRect(tiles, 37, 43, 43, 45, TILE.PATH); // Quest Board approach
  fillRect(tiles, 56, 58, PATH_COL_B, 54, TILE.PATH); // Commons shop approach
  // Step 5: Building footprints from the stable Campus V1 layout.
  CAMPUS_BUILDINGS.forEach((building) => {
    fillRect(
      tiles,
      building.wallTileRow,
      building.wallTileRow + building.wallTileH - 1,
      building.wallTileCol,
      building.wallTileCol + building.wallTileW - 1,
      building.tileIndex,
    );
  });

  // ── Step 6: Water pond — rows 60-65, cols 8-12 ───────────────────────────
  fillRect(tiles, 60, 65, 8, 12, TILE.WATER);

  return tiles;
}

// ─── Building door positions ──────────────────────────────────────────────────
/**
 * Returns the stable Campus V1 building and interaction configuration.
 */
export function getBuildingDoorPositions(): BuildingDoorConfig[] {
  return CAMPUS_BUILDINGS;
}