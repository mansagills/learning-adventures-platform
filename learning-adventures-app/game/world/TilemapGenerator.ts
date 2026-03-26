// TilemapGenerator.ts
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
  tileIndex: number;           // tile index (8-11) for wall tiles
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

  // ── Step 4: Branch paths (2 tiles wide, connecting zone centers) ──────────
  // Math zone center ≈ col 16. Branch: cols 15-16, rows 12 down to PATH_ROW_A (35)
  for (let r = 12; r <= PATH_ROW_A; r++) {
    tiles[r][15] = TILE.PATH;
    tiles[r][16] = TILE.PATH;
  }

  // Science zone center ≈ col 80. Branch: cols 79-80, rows 12 down to PATH_ROW_A
  for (let r = 12; r <= PATH_ROW_A; r++) {
    tiles[r][79] = TILE.PATH;
    tiles[r][80] = TILE.PATH;
  }

  // History zone center ≈ col 16. Already on horizontal path at row 35-36.
  // (Branch rows 36-36 is already the horizontal path — nothing extra needed.)

  // English zone center ≈ col 80. Add rows 36-40 for visibility.
  for (let r = PATH_ROW_B; r <= 40; r++) {
    tiles[r][79] = TILE.PATH;
    tiles[r][80] = TILE.PATH;
  }

  // Nature Park center ≈ col 16. Branch: cols 15-16, rows 60 up to PATH_ROW_B (36)
  for (let r = PATH_ROW_B; r <= 60; r++) {
    tiles[r][15] = TILE.PATH;
    tiles[r][16] = TILE.PATH;
  }

  // Market center col 48 — already on vertical cross-path. Nothing extra needed.

  // Interdisciplinary center ≈ col 80. Branch: cols 79-80, rows 60 up to PATH_ROW_B (36)
  for (let r = PATH_ROW_B; r <= 60; r++) {
    tiles[r][79] = TILE.PATH;
    tiles[r][80] = TILE.PATH;
  }

  // ── Step 5: Building footprints (4 wide × 3 tall) ─────────────────────────
  // Math Building: rows 4-6, cols 13-16
  fillRect(tiles, 4, 6, 13, 16, TILE.WALL_MATH);

  // Science Building: rows 4-6, cols 68-71
  fillRect(tiles, 4, 6, 68, 71, TILE.WALL_SCI);

  // English Building: rows 28-30, cols 68-71
  fillRect(tiles, 28, 30, 68, 71, TILE.WALL_ENG);

  // History Building: rows 28-30, cols 13-16
  fillRect(tiles, 28, 30, 13, 16, TILE.WALL_BRICK);

  // Library Building: rows 4-6, cols 44-47
  fillRect(tiles, 4, 6, 44, 47, TILE.WALL_BRICK);

  // Nature Center: rows 52-54, cols 13-16
  fillRect(tiles, 52, 54, 13, 16, TILE.WALL_SCI);

  // Market Hall: rows 52-54, cols 44-47
  fillRect(tiles, 52, 54, 44, 47, TILE.WALL_BRICK);

  // Interdisciplinary Hub: rows 52-54, cols 68-71
  fillRect(tiles, 52, 54, 68, 71, TILE.WALL_ENG);

  // Shop: rows 36-38, cols 5-7  (preserved from old WorldScene; intentionally 3×3, not 4×3 like academic buildings)
  fillRect(tiles, 36, 38, 5, 7, TILE.WALL_BRICK);

  // Job Board: rows 36-38, cols 86-88  (preserved from old WorldScene; intentionally 3×3, not 4×3 like academic buildings)
  fillRect(tiles, 36, 38, 86, 88, TILE.WALL_BRICK);

  // ── Step 6: Water pond — rows 60-65, cols 8-12 ───────────────────────────
  fillRect(tiles, 60, 65, 8, 12, TILE.WATER);

  return tiles;
}

// ─── Building door positions ──────────────────────────────────────────────────
/**
 * Returns the door configuration for every named building.
 * Shop and Job Board are excluded — handled separately as InteractableObjects.
 */
export function getBuildingDoorPositions(): BuildingDoorConfig[] {
  return [
    {
      building:    'Math Building',
      doorTileCol: 14,
      doorTileRow: 7,
      targetScene: 'MathBuildingScene',
      spawnX:      320,
      spawnY:      500,
      label:       'MATH\nBUILDING',
      wallKey:     'wall-math-1',
      wallTileCol: 13,
      wallTileRow: 4,
      tileIndex:   8,
    },
    {
      building:    'Science Building',
      doorTileCol: 69,
      doorTileRow: 7,
      targetScene: null,
      spawnX:      0,
      spawnY:      0,
      label:       'SCIENCE\nBUILDING',
      wallKey:     'wall-science-1',
      wallTileCol: 68,
      wallTileRow: 4,
      tileIndex:   9,
    },
    {
      building:    'English Building',
      doorTileCol: 69,
      doorTileRow: 31,
      targetScene: null,
      spawnX:      0,
      spawnY:      0,
      label:       'ENGLISH\nBUILDING',
      wallKey:     'wall-english-1',
      wallTileCol: 68,
      wallTileRow: 28,
      tileIndex:   10,
    },
    {
      building:    'History Building',
      doorTileCol: 14,
      doorTileRow: 31,
      targetScene: null,
      spawnX:      0,
      spawnY:      0,
      label:       'HISTORY\nBUILDING',
      wallKey:     'wall-brick-1',
      wallTileCol: 13,
      wallTileRow: 28,
      tileIndex:   11,
    },
    {
      building:    'Library',
      doorTileCol: 45,
      doorTileRow: 7,
      targetScene: null,
      spawnX:      0,
      spawnY:      0,
      label:       'LIBRARY',
      wallKey:     'wall-brick-1',
      wallTileCol: 44,
      wallTileRow: 4,
      tileIndex:   11,
    },
    {
      building:    'Nature Center',
      doorTileCol: 14,
      doorTileRow: 55,
      targetScene: null,
      spawnX:      0,
      spawnY:      0,
      label:       'NATURE\nCENTER',
      wallKey:     'wall-science-1',
      wallTileCol: 13,
      wallTileRow: 52,
      tileIndex:   9,
    },
    {
      building:    'Market Hall',
      doorTileCol: 45,
      doorTileRow: 55,
      targetScene: null,
      spawnX:      0,
      spawnY:      0,
      label:       'MARKET\nHALL',
      wallKey:     'wall-brick-1',
      wallTileCol: 44,
      wallTileRow: 52,
      tileIndex:   11,
    },
    {
      building:    'Interdisciplinary Hub',
      doorTileCol: 69,
      doorTileRow: 55,
      targetScene: null,
      spawnX:      0,
      spawnY:      0,
      label:       'INTERDISCIP.\nHUB',
      wallKey:     'wall-english-1',
      wallTileCol: 68,
      wallTileRow: 52,
      tileIndex:   10,
    },
  ];
}
