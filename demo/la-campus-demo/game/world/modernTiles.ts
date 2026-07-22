import * as Phaser from 'phaser';

/**
 * modernTiles — campus tile art from the user-supplied "Modern
 * Interiors/Exteriors" packs (LimeZu). Bright contemporary style: grass
 * campus, sidewalk paths, colored school-building walls.
 *
 * public/game-assets/modern/ holds 48×48 tiles prepared from the packs:
 * terrain "Singles" copied directly, wall faces cut from the Room Builder
 * 3d-walls sheet. Same pattern as rccTiles: loaded under staging keys in
 * preload, then swapped behind the campus texture keys in create().
 *
 * NOTE: LimeZu's license allows use in games but not redistributing raw
 * asset files — keep this repo private or clear the license before release.
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
