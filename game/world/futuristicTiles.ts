import * as Phaser from 'phaser';

/**
 * futuristicTiles — procedural sci-fi replacement for the campus tile art.
 *
 * The Gather campus wants a futuristic look, but the base OpenWorldScene
 * loads hand-painted grass/brick PNGs. Rather than shipping third-party
 * asset packs, this module regenerates every tile texture key at runtime
 * with Phaser Graphics: dark alloy ground panels, neon-strip walkways,
 * energy water, and per-subject accent-lit building walls. The palette
 * matches the campus HUD neon system (dark navy + cyan accents).
 *
 * Call applyFuturisticTiles(scene) in create() BEFORE the tilemap images are
 * created — it swaps the textures behind the same keys, so TilemapGenerator
 * and the chunk streamer need no changes.
 */

const SIZE = 64;

// ── palette ──────────────────────────────────────────────────────────────────
const GROUND_BASE = [0x18213a, 0x151d33, 0x1b2540]; // three ground variants
const GROUND_SEAM = 0x27345a;
const PANEL_LIGHT_CYAN = 0x22d3ee;
const PANEL_LIGHT_MAGENTA = 0xd946ef;
const PATH_BASE = 0x273249;
const PATH_EDGE = 0x00ccff;
const DIRT_BASE = 0x1d1a2b;
const DIRT_SEAM = 0x2b2640;
const WATER_BASE = 0x04121f;
const WATER_WAVE = 0x0ea5e9;

interface WallStyle {
  base: number;
  panel: number;
  accent: number;
}

// Per-building neon accents: math=gold, science=teal, english=magenta,
// generic brick=cyan. Keeps each hall recognizable at a glance.
const WALL_STYLES: Record<string, WallStyle> = {
  'wall-math-1':    { base: 0x1a1a24, panel: 0x24242f, accent: 0xfacc15 },
  'wall-science-1': { base: 0x14201f, panel: 0x1d2c2a, accent: 0x2dd4bf },
  'wall-english-1': { base: 0x1e1626, panel: 0x2a2033, accent: 0xe879f9 },
  'wall-brick-1':   { base: 0x161d2b, panel: 0x202939, accent: 0x38bdf8 },
};

/** Replace `key`'s texture with the drawing produced by `draw`. */
function regenerate(
  scene: Phaser.Scene,
  key: string,
  draw: (g: Phaser.GameObjects.Graphics) => void,
): void {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  const g = scene.add.graphics();
  draw(g);
  g.generateTexture(key, SIZE, SIZE);
  g.destroy();
}

/** Dark alloy floor panel with grid seams; optional glow dots. */
function drawGroundPanel(
  g: Phaser.GameObjects.Graphics,
  base: number,
  dots?: { color: number; points: [number, number][] },
): void {
  g.fillStyle(base, 1);
  g.fillRect(0, 0, SIZE, SIZE);
  // Panel seams (2×2 sub-panels per tile)
  g.lineStyle(1, GROUND_SEAM, 0.9);
  g.strokeRect(0.5, 0.5, SIZE - 1, SIZE - 1);
  g.lineBetween(SIZE / 2, 0, SIZE / 2, SIZE);
  g.lineBetween(0, SIZE / 2, SIZE, SIZE / 2);
  // Corner rivets
  g.fillStyle(GROUND_SEAM, 1);
  [[4, 4], [SIZE - 5, 4], [4, SIZE - 5], [SIZE - 5, SIZE - 5]].forEach(([x, y]) => {
    g.fillRect(x, y, 2, 2);
  });
  if (dots) {
    dots.points.forEach(([x, y]) => {
      g.fillStyle(dots.color, 0.25);
      g.fillCircle(x, y, 5);
      g.fillStyle(dots.color, 1);
      g.fillCircle(x, y, 2);
    });
  }
}

/**
 * Walkway / room-floor panel. Orientation-neutral (paths run both directions
 * and carved rooms are floored with this tile), so no directional strips —
 * just a lighter alloy panel with seams and a soft glow point where panel
 * corners meet.
 */
function drawWalkway(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(PATH_BASE, 1);
  g.fillRect(0, 0, SIZE, SIZE);
  // 2×2 sub-panel seams
  g.lineStyle(1, 0x1b2337, 0.9);
  g.strokeRect(0.5, 0.5, SIZE - 1, SIZE - 1);
  g.lineBetween(SIZE / 2, 0, SIZE / 2, SIZE);
  g.lineBetween(0, SIZE / 2, SIZE, SIZE / 2);
  // Brushed highlight on each sub-panel
  g.fillStyle(0x2f3b55, 0.8);
  g.fillRect(4, 4, SIZE / 2 - 8, 3);
  g.fillRect(SIZE / 2 + 4, SIZE / 2 + 4, SIZE / 2 - 8, 3);
  // Soft glow point at the center seam crossing
  g.fillStyle(PATH_EDGE, 0.16);
  g.fillCircle(SIZE / 2, SIZE / 2, 7);
  g.fillStyle(PATH_EDGE, 0.75);
  g.fillCircle(SIZE / 2, SIZE / 2, 1.5);
}

/** Deep energy-water with glowing wave lines. */
function drawWater(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(WATER_BASE, 1);
  g.fillRect(0, 0, SIZE, SIZE);
  g.lineStyle(2, WATER_WAVE, 0.55);
  g.lineBetween(4, 16, 26, 16);
  g.lineBetween(34, 30, 58, 30);
  g.lineBetween(10, 46, 34, 46);
  g.lineStyle(1, WATER_WAVE, 0.25);
  g.lineBetween(30, 8, 52, 8);
  g.lineBetween(6, 58, 24, 58);
}

/** Utility duct floor (replaces dirt). */
function drawDuct(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(DIRT_BASE, 1);
  g.fillRect(0, 0, SIZE, SIZE);
  g.lineStyle(1, DIRT_SEAM, 1);
  for (let y = 8; y < SIZE; y += 16) {
    g.lineBetween(0, y, SIZE, y);
  }
  g.strokeRect(0.5, 0.5, SIZE - 1, SIZE - 1);
}

/** Building wall: dark metal panels, vertical seams, neon accent cap. */
function drawWall(g: Phaser.GameObjects.Graphics, style: WallStyle): void {
  g.fillStyle(style.base, 1);
  g.fillRect(0, 0, SIZE, SIZE);
  // Raised panel face
  g.fillStyle(style.panel, 1);
  g.fillRect(4, 10, SIZE - 8, SIZE - 16);
  // Vertical seams
  g.lineStyle(1, style.base, 1);
  g.lineBetween(SIZE / 3, 10, SIZE / 3, SIZE - 6);
  g.lineBetween((2 * SIZE) / 3, 10, (2 * SIZE) / 3, SIZE - 6);
  // Neon accent strip along the top edge (reads as building trim lighting)
  g.fillStyle(style.accent, 0.28);
  g.fillRect(0, 0, SIZE, 12);
  g.fillStyle(style.accent, 1);
  g.fillRect(0, 2, SIZE, 4);
}

/**
 * Swap every campus tile texture for its futuristic counterpart.
 * Must run after preload (textures loaded) and before the map images are
 * created — i.e. at the top of the scene's create().
 */
export function applyFuturisticTiles(scene: Phaser.Scene): void {
  // Ground variants
  GROUND_BASE.forEach((base, i) => {
    regenerate(scene, `ground-grass-${i + 1}`, (g) => drawGroundPanel(g, base));
  });
  // "Flowers" become panels with embedded glow lights
  regenerate(scene, 'ground-flowers-1', (g) =>
    drawGroundPanel(g, GROUND_BASE[0], {
      color: PANEL_LIGHT_CYAN,
      points: [[18, 22], [46, 44]],
    }),
  );
  regenerate(scene, 'ground-flowers-2', (g) =>
    drawGroundPanel(g, GROUND_BASE[2], {
      color: PANEL_LIGHT_MAGENTA,
      points: [[44, 18], [20, 48]],
    }),
  );
  regenerate(scene, 'ground-path', drawWalkway);
  regenerate(scene, 'ground-dirt', drawDuct);
  regenerate(scene, 'ground-water', drawWater);
  // Building walls
  Object.entries(WALL_STYLES).forEach(([key, style]) => {
    regenerate(scene, key, (g) => drawWall(g, style));
  });
}
