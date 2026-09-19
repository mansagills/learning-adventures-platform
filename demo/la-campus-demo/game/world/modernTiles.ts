import * as Phaser from 'phaser';

/**
 * modernTiles — the campus base tiles. Bright contemporary style: grass
 * campus, sidewalk paths, colored school-building walls. Loaded under
 * staging keys in preload, then swapped behind the campus texture keys in
 * create() — same pattern as rccTiles.
 *
 * What these files actually are
 * ----------------------------
 * This header used to say the 8 tiles in public/game-assets/modern/ were
 * "prepared from the packs: terrain Singles copied directly, wall faces cut
 * from the Room Builder 3d-walls sheet" (LimeZu Modern Interiors/Exteriors),
 * and carried that pack's redistribution warning. Decoding them says
 * otherwise — they are flat colour swatches:
 *
 *   dirt.png, grass.png, water.png    1 distinct RGBA value, 155 bytes each
 *   wall-red.png                      3 values
 *   wall-blue.png                     5 values
 *   wall-green/grey.png, sidewalk.png 6 values
 *
 * A 48×48 tile holding a single colour contains no pack artwork, so the
 * LimeZu attribution and its redistribution warning do not belong on these
 * files. Whatever was originally cut from those sheets is not what is here
 * now. Treat them as placeholders.
 *
 * Where the real question lives: campusDecorations.ts, which loads the 58
 * genuine pixel-art props in public/game-assets/modern/props/ — 7–79 colours
 * each, visible in every screenshot of the demo. See docs/ASSET_INVENTORY.md
 * for the full picture, including the 41 files under sprites/ and tilemaps/
 * that have no recorded origin at all.
 */

const TILE = 48;

/** staging key → file (under /game-assets/modern/) */
const MODERN_FILES: Record<string, string> = {
  'modern-grass': 'grass.png',
  'modern-dirt': 'dirt.png',
  'modern-water': 'water.png',
  'modern-sidewalk': 'sidewalk.png',
  'modern-wall-blue': 'wall-blue.png',
  'modern-wall-green': 'wall-green.png',
  'modern-wall-red': 'wall-red.png',
  'modern-wall-grey': 'wall-grey.png',
};

/** campus texture key → staging key */
const KEY_MAP: Record<string, string> = {
  'ground-grass-1': 'modern-grass',
  'ground-grass-2': 'modern-grass',
  'ground-grass-3': 'modern-grass',
  'ground-flowers-1': 'modern-grass',
  'ground-flowers-2': 'modern-grass',
  'ground-path': 'modern-sidewalk',
  'ground-dirt': 'modern-dirt',
  'ground-water': 'modern-water',
  // Subject color coding: math=blue, science=green, english=red, commons=grey
  'wall-math-1': 'modern-wall-blue',
  'wall-science-1': 'modern-wall-green',
  'wall-english-1': 'modern-wall-red',
  'wall-brick-1': 'modern-wall-grey',
};

/** Queue the prepared tiles. Call from the scene's preload(). */
export function preloadModernTiles(scene: Phaser.Scene): void {
  Object.entries(MODERN_FILES).forEach(([key, file]) => {
    scene.load.image(key, `/game-assets/modern/${file}`);
  });
}

/**
 * Replace campus tile textures with the Modern pack tiles. Call in create()
 * after the fallback art and before the tilemap images are built.
 */
export function applyModernTiles(scene: Phaser.Scene): void {
  if (!scene.textures.exists('modern-grass')) {
    return; // files missing: previous art stays
  }
  Object.entries(KEY_MAP).forEach(([destKey, srcKey]) => {
    if (!scene.textures.exists(srcKey)) return;
    if (scene.textures.exists(destKey)) {
      scene.textures.remove(destKey);
    }
    const canvas = scene.textures.createCanvas(destKey, TILE, TILE);
    if (!canvas) return;
    canvas.drawFrame(srcKey, 0, 0, 0);
    canvas.refresh();
  });
}
