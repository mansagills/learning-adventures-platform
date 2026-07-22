import * as Phaser from 'phaser';

/**
 * rccTiles — campus tile art from the user-supplied "RCC apartment" pack
 * (public/game-assets/rcc/, 48×48 upscaled A5 sheets, cyberpunk palette).
 *
 * Layered OVER the procedural futuristic set: applyFuturisticTiles() runs
 * first as the fallback, then this replaces a subset of the same texture
 * keys with frames cut from the pack's sheets. Toggle USE_RCC_TILES in
 * GatherCampusScene to flip between the two looks — no other code changes.
 *
 * Frames are addressed as (col, row) on the 8-column sheets; tiles render at
 * 64×64 via setDisplaySize, so the 48px source scales up crisply.
 *
 * NOTE: the pack ships without a license file — confirm its terms before any
 * public release.
 */

interface TilePick {
  /** Existing campus texture key to replace */
  key: string;
  /** Loaded spritesheet key (see preloadRccSheets) */
  sheet: string;
  col: number;
  row: number;
}

const COLS = 8; // A5 sheets are 8 tiles wide
const TILE = 48;

/** Initial frame picks — tuned by eye against in-game screenshots. */
const TILE_PICKS: TilePick[] = [
  // Open ground: dark starry asphalt — the block's CENTER frame everywhere.
  // Edge frames have visible borders that quilt badly when mixed, so all
  // ground variants share the seamless center tile.
  { key: 'ground-grass-1', sheet: 'rcc-ext', col: 6, row: 13 },
  { key: 'ground-grass-2', sheet: 'rcc-ext', col: 6, row: 13 },
  { key: 'ground-grass-3', sheet: 'rcc-ext', col: 6, row: 13 },
  { key: 'ground-flowers-1', sheet: 'rcc-ext', col: 6, row: 13 },
  { key: 'ground-flowers-2', sheet: 'rcc-ext', col: 6, row: 13 },
  // Paths + carved room floors: teal panel (block center for seamless tiling)
  { key: 'ground-path', sheet: 'rcc-ext', col: 2, row: 7 },
  // Utility ground around buildings: same starry base for a calm surround
  { key: 'ground-dirt', sheet: 'rcc-ext', col: 6, row: 13 },
  // Walls — top-edge frames of the pack's framed blocks so the colored trim
  // line reads as building trim lighting (preserves subject color coding):
  { key: 'wall-math-1',    sheet: 'rcc-int', col: 6, row: 6 },  // navy + orange trim
  { key: 'wall-science-1', sheet: 'rcc-ext', col: 2, row: 6 },  // teal, dark top edge
  { key: 'wall-english-1', sheet: 'rcc-int', col: 6, row: 9 },  // maroon + pink trim
  { key: 'wall-brick-1',   sheet: 'rcc-ext', col: 6, row: 4 },  // solid maroon panel
  // ground-water intentionally omitted: the procedural energy canal stays
];

/** Queue the pack's sheets. Call from the scene's preload(). */
export function preloadRccSheets(scene: Phaser.Scene): void {
  scene.load.spritesheet('rcc-ext', '/game-assets/rcc/exterior-a5.png', {
    frameWidth: TILE,
    frameHeight: TILE,
  });
  scene.load.spritesheet('rcc-int', '/game-assets/rcc/interior-a5.png', {
    frameWidth: TILE,
    frameHeight: TILE,
  });
}

/**
 * Replace campus tile textures with pack frames. Call in create() AFTER
 * applyFuturisticTiles (fallback) and BEFORE the tilemap images are built.
 */
export function applyRccTiles(scene: Phaser.Scene): void {
  if (!scene.textures.exists('rcc-ext') || !scene.textures.exists('rcc-int')) {
    return; // sheets missing: procedural fallback stays
  }
  TILE_PICKS.forEach(({ key, sheet, col, row }) => {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
    const canvas = scene.textures.createCanvas(key, TILE, TILE);
    if (!canvas) return;
    canvas.drawFrame(sheet, row * COLS + col, 0, 0);
    canvas.refresh();
  });
}
