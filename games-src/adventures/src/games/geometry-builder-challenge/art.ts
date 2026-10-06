import type { Expression } from '../../kit/art/portraits';
import { mix, PixelBuffer } from '../../kit/art/pixel';
import { P } from '../../kit/art/palette';
import { paintText, textWidth } from '../../kit/art/pixelFont';
import { hash2, mulberry32 } from '../../kit/core/rng';
import type { Blueprint, Composition, GardenPic, Piece, PieceKind, ShapeSpec, Solid, ThingKind } from './problems';

/**
 * Shape Town Builders' art, painted in code in the Seeds of Genius pixel
 * style: the building yard, the clubhouse at every stage, the four places,
 * Chip the beaver, and the shapes and solid blocks used in the panels.
 */

/** Sky and a row of rooftops behind the yard (from Time Attack Clock), darker as evening falls. */
export function paintSkyline(widthPx: number, heightPx: number, night: number, seed = 8): HTMLCanvasElement {
  const b = new PixelBuffer(widthPx, heightPx);
  const r = mulberry32(seed);
  const top = mix('#8fd0ee', '#141a3a', night);
  const low = mix('#fde9c9', '#3a3566', night);
  for (let y = 0; y < heightPx; y++) {
    const band = Math.floor((y / heightPx) * 6) / 6;
    for (let x = 0; x < widthPx; x++) b.set(x, y, mix(top, low, band));
  }
  if (night > 0.5) for (let i = 0; i < widthPx / 8; i++) b.set(Math.floor(r() * widthPx), Math.floor(r() * heightPx * 0.5), '#fff6cf');
  // far hills
  for (let x = 0; x < widthPx; x++) {
    const hh = 26 + Math.round(Math.sin(x / 37) * 7 + Math.sin(x / 13) * 3);
    b.vline(x, heightPx - hh, heightPx - 1, mix('#8cbf7a', '#1d2a3a', night * 0.8));
  }
  // houses with pointed roofs
  const roofs = ['#b9503e', '#3f6fa8', '#5f8a3a', '#8a5cc4', '#c7782e'];
  const walls = ['#f1e3c6', '#e7d0b0', '#f4ecdc', '#dcc7a3'];
  let x = -6;
  while (x < widthPx) {
    const w = 26 + Math.floor(r() * 18);
    const wallTop = heightPx - 18 - Math.floor(r() * 10);
    const roof = mix(roofs[Math.floor(r() * roofs.length)], '#141a3a', night * 0.5);
    const wall = mix(walls[Math.floor(r() * walls.length)], '#2a2d4a', night * 0.55);
    b.rect(x, wallTop, w, heightPx - wallTop, wall);
    const peak = Math.floor(w / 2);
    for (let k = 0; k <= peak; k++) b.hline(x + k - 1, x + w - k, wallTop - Math.floor(k * 0.7), roof);
    for (let wx = x + 5; wx < x + w - 6; wx += 9) {
      const lit = night > 0.3 && r() < 0.7;
      b.rect(wx, wallTop + 4, 5, 6, lit ? '#ffe7a3' : mix('#9ad1e8', '#2a3050', night));
    }
    x += w + 1;
  }
  return b.toCanvas();
}

/** A leafy tree (from Time Attack Clock). */
export function paintTree(seed: number, night: number): PixelBuffer {
  const r = mulberry32(seed);
  const b = new PixelBuffer(28, 36);
  b.rect(12, 22, 4, 14, P.trunk);
  const g = [P.leaf1, P.leaf2, P.leaf3];
  for (const [x, y, w, h] of [
    [2, 8, 14, 14],
    [12, 6, 14, 14],
    [6, 0, 16, 14],
    [8, 12, 14, 12],
  ])
    b.ellipse(x, y, w, h, mix(g[1], '#1a2050', night * 0.3));
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(r() * 28);
    const y = Math.floor(r() * 24);
    if (b.get(x, y)) b.set(x, y, mix(g[Math.floor(r() * 3)], '#1a2050', night * 0.3));
  }
  return b.outline();
}

export interface YardLayout {
  w: number;
  h: number;
  /** The packed-earth building site in the middle (tiles). */
  site: { x0: number; y0: number; x1: number; y1: number };
  /** Gravel paths from the middle to each place, as tile points. */
  paths: Array<[number, number, number, number]>;
}

// ------------------------------------------------------------ drawing helpers

type Pt = [number, number];

function inPoly(x: number, y: number, pts: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Fill a polygon (pixel centres inside it). */
export function fillPoly(b: PixelBuffer, pts: Pt[], color: string): void {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) if (inPoly(x + 0.5, y + 0.5, pts)) b.set(x, y, color);
}

/** A line with a square pen of the given width. */
export function line(b: PixelBuffer, x0: number, y0: number, x1: number, y1: number, color: string, w = 1): void {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n - (w - 1) / 2);
    const y = Math.round(y0 + ((y1 - y0) * i) / n - (w - 1) / 2);
    b.rect(x, y, w, w, color);
  }
}

// ------------------------------------------------------------ the yard

export function paintYard(L: YardLayout, seed = 41): HTMLCanvasElement {
  const W = L.w * 16;
  const H = L.h * 16;
  const b = new PixelBuffer(W, H);
  const r = mulberry32(seed);
  const s = L.site;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const v = r();
      b.set(x, y, v < 0.12 ? P.grass2 : v < 0.2 ? P.grass3 : P.grass1);
    }
  // gravel paths
  for (const [x0, y0, x1, y1] of L.paths) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 16;
    for (let t = 0; t <= n; t++) {
      const px = (x0 + ((x1 - x0) * t) / n) * 16;
      const py = (y0 + ((y1 - y0) * t) / n) * 16;
      for (let k = -10; k <= 10; k++)
        for (let j = -10; j <= 10; j++)
          if (k * k + j * j < 90) {
            const xx = Math.round(px + k);
            const yy = Math.round(py + j);
            if (xx >= 0 && yy >= 0 && xx < W && yy < H) b.set(xx, yy, hash2(xx, yy, 5) < 0.15 ? P.cobble2 : hash2(xx, yy, 9) < 0.1 ? P.cobble3 : P.cobble1);
          }
    }
  }
  // the building site: packed earth with tyre tracks and a dashed outline
  for (let y = s.y0 * 16; y < s.y1 * 16; y++)
    for (let x = s.x0 * 16; x < s.x1 * 16; x++) b.set(x, y, hash2(x, y, 3) < 0.12 ? P.path2 : hash2(x, y, 7) < 0.08 ? P.path3 : P.path1);
  for (let x = s.x0 * 16 + 6; x < s.x1 * 16 - 6; x += 3) {
    b.set(x, s.y1 * 16 - 20, P.path2);
    b.set(x + 1, s.y1 * 16 - 12, P.path2);
  }
  for (let x = s.x0 * 16; x < s.x1 * 16; x += 8) {
    b.rect(x, s.y0 * 16, 4, 2, '#e8bd3f');
    b.rect(x, s.y1 * 16 - 2, 4, 2, '#e8bd3f');
  }
  for (let y = s.y0 * 16; y < s.y1 * 16; y += 8) {
    b.rect(s.x0 * 16, y, 2, 4, '#e8bd3f');
    b.rect(s.x1 * 16 - 2, y, 2, 4, '#e8bd3f');
  }
  // flowers in the grass
  const fl = ['#ef8fb1', '#f2c94c', '#ffffff', '#9ad1e8'];
  for (let i = 0; i < (W * H) / 320; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * H);
    if (b.get(x, y) === P.grass1) b.set(x, y, fl[Math.floor(r() * fl.length)]);
  }
  return b.toCanvas();
}

// ------------------------------------------------------------ the clubhouse

export interface ClubParts {
  walls: boolean;
  pillars: boolean;
  roof: boolean;
  garden: boolean;
}

/** The clubhouse on the building site: a slab and scaffolding, then each part as it is delivered. */
export function paintClubhouse(parts: ClubParts, night: number, open = false): PixelBuffer {
  const W = 112;
  const H = 96;
  const b = new PixelBuffer(W, H);
  const dim = (c: string) => mix(c, '#1a2050', night * 0.35);
  // the concrete slab
  b.rect(6, 82, 100, 10, dim('#b9b2a6'));
  b.hline(6, 105, 82, dim('#d6d0c4'));
  // scaffolding until the roof is on
  if (!parts.roof) {
    for (const x of [10, 52, 96]) b.rect(x, 22, 3, 60, dim('#8f9aa6'));
    for (const y of [34, 58]) b.rect(10, y, 89, 2, dim('#8f9aa6'));
    for (let k = 0; k < 40; k += 2) {
      b.set(13 + k, 36 + Math.floor(k * 0.55), dim('#6f7a86'));
      b.set(55 + k, 36 + Math.floor(k * 0.55), dim('#6f7a86'));
    }
  }
  if (parts.walls) {
    b.rect(16, 42, 80, 40, dim(P.plaster));
    for (let y = 46; y < 82; y += 6) b.hline(16, 95, y, dim(P.plaster2));
    // door
    b.rect(50, 58, 14, 24, dim(P.wood2));
    b.rect(52, 60, 10, 22, dim(P.wood1));
    b.set(60, 70, dim('#e8bd3f'));
  }
  if (parts.pillars) {
    // two cylinder pillars and cube steps
    for (const x of [40, 68]) {
      b.rect(x, 48, 6, 34, dim('#e9e4da'));
      b.vline(x + 4, 48, 81, dim('#cfc8bb'));
      b.rect(x - 1, 46, 8, 3, dim('#d6d0c4'));
    }
    b.rect(46, 82, 22, 4, dim('#cfc8bb'));
    b.rect(48, 86, 18, 4, dim('#bdb6a9'));
  }
  if (parts.roof) {
    // a triangle roof with a round window and square windows
    for (let k = 0; k < 28; k++) b.hline(12 + k * 2, 100 - k * 2, 42 - k, dim(k % 4 < 2 ? P.roofRed1 : P.roofRed2));
    b.ellipse(50, 22, 12, 12, dim('#f4ecdc'));
    b.ellipse(52, 24, 8, 8, open ? '#ffe08a' : dim('#9ad1e8'));
    for (const x of [24, 78]) {
      b.rect(x, 52, 12, 12, dim(P.wood2));
      b.rect(x + 1, 53, 10, 10, open || night > 0.5 ? '#ffe08a' : dim('#9ad1e8'));
      b.hline(x + 1, x + 10, 58, dim(P.wood2));
      b.vline(x + 6, 53, 62, dim(P.wood2));
    }
  } else if (parts.walls) {
    for (const x of [24, 78]) {
      b.rect(x, 52, 12, 12, dim(P.wood2));
      b.rect(x + 1, 53, 10, 10, dim('#5c4a3a'));
    }
  }
  if (parts.garden) {
    // flower boxes and a little picket fence
    for (const x of [18, 82]) {
      b.rect(x, 74, 14, 6, dim(P.wood1));
      for (let k = 0; k < 5; k++) b.rect(x + 1 + k * 3, 71, 2, 3, dim(['#ef8fb1', '#f2c94c', '#ffffff', '#d2453a', '#8a5cc4'][k]));
    }
    for (let x = 2; x < 110; x += 5) {
      b.rect(x, 86, 3, 8, dim('#f4ecdc'));
      b.set(x + 1, 85, dim('#f4ecdc'));
    }
    b.hline(2, 109, 89, dim('#dcd4c4'));
  }
  if (open) {
    // bunting and lanterns
    for (let x = 14; x < 98; x += 6) {
      b.rect(x, 18 + Math.round(Math.sin(x / 9) * 2), 4, 4, ['#d2453a', '#e8bd3f', '#4b7fcf', '#4f9a4a'][(x / 6) % 4 | 0]);
    }
    for (const x of [10, 100]) {
      b.rect(x, 50, 2, 32, '#5c3822');
      b.ellipse(x - 2, 44, 6, 7, '#ffcf5a');
    }
  }
  return b.outline();
}

// ------------------------------------------------------------ the four places

/** Kofi's Shape Sorting Arcade: a booth with a conveyor belt and shape sign. */
export function paintArcade(lit: boolean): PixelBuffer {
  const b = new PixelBuffer(80, 64);
  // the booth
  b.rect(6, 18, 68, 36, '#3b5fa8');
  b.rect(6, 18, 68, 4, '#2e4c8a');
  for (let x = 6; x < 74; x += 8) b.rect(x, 14, 8, 6, (x / 8) % 2 ? '#f4ecdc' : '#d2453a');
  // the sign with three shapes
  b.rect(14, 2, 52, 13, '#2b2340');
  fillPoly(b, [[22, 12], [27, 4], [32, 12]], lit ? '#e8bd3f' : '#9b8c78');
  b.rect(36, 5, 8, 7, lit ? '#2f9a94' : '#8a8378');
  b.ellipse(48, 4, 9, 9, lit ? '#dc6f9c' : '#8a8378');
  // the screen and bins
  b.rect(26, 24, 28, 14, '#1d2a3a');
  b.rect(28, 26, 24, 10, lit ? '#3f8f6a' : '#2f3a4a');
  if (lit) {
    fillPoly(b, [[32, 34], [35, 28], [38, 34]], '#e8bd3f');
    b.rect(42, 29, 5, 5, '#f4ecdc');
  }
  for (const [x, c] of [[10, '#d2453a'], [56, '#4f9a4a']] as Array<[number, string]>) {
    b.rect(x, 40, 14, 14, c);
    b.rect(x + 2, 42, 10, 3, mix(c, '#000000', 0.3));
  }
  // the conveyor belt
  b.rect(2, 54, 76, 8, '#4a4a52');
  for (let x = 4; x < 78; x += 6) b.rect(x, 56, 3, 4, '#6a6a74');
  b.rect(0, 58, 4, 6, '#2b2b33');
  b.rect(76, 58, 4, 6, '#2b2b33');
  return b.outline();
}

/** Lupe's Block Shop: a shed with shelves of solid blocks. */
export function paintBlockShop(lit: boolean): PixelBuffer {
  const b = new PixelBuffer(72, 60);
  b.rect(6, 22, 60, 34, P.wood1);
  for (let y = 26; y < 56; y += 5) b.hline(6, 65, y, P.wood2);
  for (let k = 0; k < 18; k++) b.hline(2 + k, 69 - k, 22 - Math.floor(k * 0.8), k % 3 ? '#4f9a4a' : '#3c7b39');
  // open front with shelves
  b.rect(14, 28, 44, 26, '#5c3822');
  for (const y of [38, 52]) b.rect(14, y, 44, 2, P.wood3);
  // blocks on the shelves: cube, cylinder, cone, sphere, box
  b.rect(17, 31, 7, 7, '#e8bd3f');
  b.rect(17, 31, 7, 2, '#f2d77a');
  b.rect(28, 31, 6, 7, '#4b7fcf');
  b.ellipse(28, 30, 6, 3, '#7fa6e0');
  fillPoly(b, [[38, 38], [41, 30], [44, 38]], '#d2453a');
  b.ellipse(48, 32, 7, 7, '#dc6f9c');
  b.rect(18, 45, 14, 7, '#2f9a94');
  b.rect(18, 45, 14, 2, '#6fc4bf');
  b.ellipse(38, 46, 6, 6, '#e8832e');
  b.rect(47, 45, 7, 7, '#8a5cc4');
  // the sign
  b.rect(22, 8, 28, 9, '#f4ecdc');
  b.rect(26, 10, 5, 5, '#e8bd3f');
  b.ellipse(34, 10, 5, 5, '#dc6f9c');
  fillPoly(b, [[40, 15], [42, 10], [44, 15]], '#d2453a');
  void lit;
  return b.outline();
}

/** Mr. Haruto's Blueprint Workshop (half 2), with a barrier until it opens. */
export function paintWorkshop(open: boolean): PixelBuffer {
  const b = new PixelBuffer(72, 60);
  b.rect(6, 22, 60, 34, '#9b6b44');
  for (let x = 8; x < 66; x += 6) b.vline(x, 22, 55, '#84502f');
  for (let k = 0; k < 18; k++) b.hline(2 + k, 69 - k, 22 - Math.floor(k * 0.8), k % 3 ? '#4e6fa3' : '#3e5a88');
  // a blueprint board on the wall
  b.rect(16, 28, 30, 20, '#2f5fa8');
  for (let x = 18; x < 46; x += 4) b.vline(x, 29, 47, '#4a7cc4');
  fillPoly(b, [[22, 40], [28, 32], [34, 40]], '#cfe2ff');
  b.rect(24, 40, 8, 6, '#cfe2ff');
  b.ellipse(37, 36, 6, 6, '#cfe2ff');
  // a saw and a workbench
  b.rect(50, 42, 12, 3, P.wood3);
  b.rect(51, 45, 2, 10, P.wood2);
  b.rect(59, 45, 2, 10, P.wood2);
  b.rect(52, 36, 8, 4, '#b9b7b4');
  void open;
  return b.outline();
}

/** Priya's Garden Yard (half 2): fenced garden beds on a grid. */
export function paintGardenYard(open: boolean): PixelBuffer {
  const b = new PixelBuffer(80, 48);
  b.rect(4, 14, 72, 30, '#7a4f33');
  for (let x = 4; x < 76; x += 8) b.vline(x, 14, 43, '#65402a');
  for (let y = 14; y < 44; y += 8) b.hline(4, 75, y, '#65402a');
  const r = mulberry32(5);
  for (let i = 0; i < 26; i++) {
    const x = 6 + Math.floor(r() * 66);
    const y = 16 + Math.floor(r() * 24);
    b.rect(x, y, 2, 2, ['#4f9a4a', '#6aa24a', '#ef8fb1', '#f2c94c'][i % 4]);
  }
  // the fence
  for (let x = 0; x < 80; x += 5) {
    b.rect(x, 8, 3, 10, '#f4ecdc');
    b.set(x + 1, 7, '#f4ecdc');
  }
  b.hline(0, 79, 11, '#dcd4c4');
  // a tape measure
  b.ellipse(62, 0, 10, 10, '#e8bd3f');
  b.ellipse(65, 3, 4, 4, '#3a2a26');
  void open;
  return b.outline();
}

function paintBarrierInto(b: PixelBuffer, x: number, y: number): void {
  b.rect(x, y, 28, 6, '#f4ecdc');
  for (let k = 0; k < 28; k += 6) b.rect(x + k, y, 3, 6, '#e8832e');
  b.rect(x + 2, y + 6, 2, 8, '#5c3822');
  b.rect(x + 24, y + 6, 2, 8, '#5c3822');
}

/** A striped traffic cone. */
export function paintTrafficCone(): PixelBuffer {
  const b = new PixelBuffer(12, 16);
  fillPoly(b, [[2, 14], [6, 1], [10, 14]], '#e8832e');
  b.hline(4, 8, 7, '#f4ecdc');
  b.hline(3, 9, 10, '#f4ecdc');
  b.rect(0, 13, 12, 3, '#c25f1c');
  return b.outline();
}

/** A stack of wooden crates. */
export function paintCrates(): PixelBuffer {
  const b = new PixelBuffer(28, 26);
  for (const [x, y] of [
    [0, 12],
    [14, 12],
    [7, 0],
  ]) {
    b.rect(x, y, 13, 13, P.wood1);
    b.rect(x, y, 13, 2, P.wood3);
    line(b, x + 1, y + 2, x + 11, y + 12, P.wood2);
  }
  return b.outline();
}

/** A wheelbarrow full of blocks. */
export function paintWheelbarrow(): PixelBuffer {
  const b = new PixelBuffer(30, 18);
  fillPoly(b, [[2, 4], [22, 4], [18, 12], [6, 12]], '#4f9a4a');
  b.rect(6, 1, 4, 4, '#e8bd3f');
  b.rect(11, 0, 5, 5, '#d2453a');
  b.ellipse(16, 1, 5, 4, '#4b7fcf');
  b.ellipse(8, 11, 7, 7, '#2b2b33');
  b.ellipse(10, 13, 3, 3, '#8f9aa6');
  line(b, 20, 6, 29, 2, P.wood2, 2);
  return b.outline();
}

/** The "coming soon" barrier in front of a place that opens in half 2. */
export function paintSoonSign(): PixelBuffer {
  const b = new PixelBuffer(26, 22);
  paintBarrierInto(b, 0, 8);
  b.rect(8, 0, 10, 8, '#f2c94c');
  fillPoly(b, [[10, 6], [13, 1], [16, 6]], '#3a2a26');
  return b.outline();
}

// ------------------------------------------------------------ Chip the beaver

/** Chip the beaver (two frames: tail down, tail up). */
export function paintChip(frame: number): PixelBuffer {
  const b = new PixelBuffer(18, 16);
  b.ellipse(1, frame ? 7 : 9, 7, 5, '#5c3822'); // the flat tail
  for (let k = 0; k < 3; k++) b.hline(2, 6, (frame ? 8 : 10) + k, '#4a2c1a');
  b.ellipse(5, 5, 10, 10, '#9c6440');
  b.ellipse(8, 1, 8, 7, '#9c6440');
  b.ellipse(7, 7, 6, 6, '#c49a6c');
  b.set(13, 3, '#2b1d1e');
  b.rect(14, 5, 2, 1, '#2b1d1e');
  b.rect(13, 6, 2, 2, '#f4ecdc'); // big teeth
  b.set(9, 1, '#7a4a2e');
  b.rect(6, 14, 3, 2, '#4a2c1a');
  b.rect(11, 14, 3, 2, '#4a2c1a');
  b.rect(10, 0, 5, 2, '#e8bd3f'); // a tiny hard hat
  return b.outline();
}

/** Chip's portrait for the talk box (48x48). */
export function paintChipPortrait(expression: Expression): PixelBuffer {
  const b = new PixelBuffer(48, 48);
  b.ellipse(4, 8, 40, 40, '#9c6440');
  b.ellipse(12, 24, 24, 22, '#c49a6c');
  b.ellipse(4, 6, 9, 9, '#7a4a2e');
  b.ellipse(35, 6, 9, 9, '#7a4a2e');
  // hard hat
  b.ellipse(8, 0, 32, 14, '#e8bd3f');
  b.rect(4, 9, 40, 3, '#c29a2c');
  // eyes
  const happy = expression === 'smile' || expression === 'proud';
  for (const x of [15, 29]) {
    if (happy) for (let k = 0; k < 5; k++) b.set(x + k, 20 - (k === 0 || k === 4 ? 0 : 1), P.outline);
    else {
      b.ellipse(x, 17, 5, 6, P.outline);
      b.set(x + 1, 18, '#ffffff');
    }
  }
  if (expression === 'thinking') b.hline(13, 34, 14, '#5c3822');
  // nose and big teeth
  b.ellipse(20, 25, 8, 5, '#3a2a26');
  b.rect(20, 33, 4, 6, '#f4ecdc');
  b.rect(24, 33, 4, 6, '#f4ecdc');
  b.vline(24, 33, 38, '#d6d0c4');
  if (expression === 'curious') b.ellipse(19, 41, 10, 4, '#7a2a2a');
  return b.outline();
}

// ------------------------------------------------------------ shapes for the panels

export interface ShapePicOptions {
  /** Number each corner (the picture hint). */
  numbers?: boolean;
  /** Draw a letter under the shape (odd-one-out). */
  letter?: string;
}

/** A flat shape at its size, turn and color, drawn into a square picture. */
export function paintShapePic(s: ShapeSpec, size = 72, o: ShapePicOptions = {}): PixelBuffer {
  const b = new PixelBuffer(size, size);
  const c = size / 2;
  // leave room round the edge for the corner numbers
  const rad = (size / 2 - (o.numbers ? 11 : 5)) * s.scale;
  const out = mix(s.color, '#000000', 0.45);
  if (s.kind === 'circle') {
    const d = Math.round(rad * 2);
    b.ellipse(Math.round(c - rad), Math.round(c - rad), d, d, s.color);
    b.outline(out);
    return b;
  }
  const pts: Pt[] = s.pts.map(([x, y]) => [c + x * rad, c + y * rad]);
  if (!s.open) {
    fillPoly(b, pts, s.color);
    if (s.curved) {
      // bulge the first side outwards (away from the middle)
      const [a, z] = [pts[0], pts[1]];
      const mx = (a[0] + z[0]) / 2;
      const my = (a[1] + z[1]) / 2;
      const d = Math.hypot(mx - c, my - c) || 1;
      const bulge = Math.hypot(z[0] - a[0], z[1] - a[1]) * 0.3;
      const ctrl: Pt = [mx + ((mx - c) / d) * bulge, my + ((my - c) / d) * bulge];
      const curve: Pt[] = [];
      for (let t = 0; t <= 1.0001; t += 0.05) curve.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * ctrl[0] + t * t * z[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * ctrl[1] + t * t * z[1]]);
      fillPoly(b, curve, s.color);
      for (let i = 1; i < curve.length; i++) line(b, curve[i - 1][0], curve[i - 1][1], curve[i][0], curve[i][1], out, 2);
    }
  }
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    if (s.curved && i === 0) continue;
    if (s.open && i === n - 1) continue;
    const a = pts[i];
    const z = pts[(i + 1) % n];
    line(b, a[0], a[1], z[0], z[1], s.open ? s.color : out, 2);
  }
  if (o.numbers)
    pts.forEach(([x, y], i) => {
      const dx = x - c;
      const dy = y - c;
      const d = Math.hypot(dx, dy) || 1;
      b.rect(Math.round(x) - 1, Math.round(y) - 1, 3, 3, '#ffffff');
      paintText(b, String(i + 1), Math.round(x + (dx / d) * 5) - 1, Math.round(y + (dy / d) * 5) - 2, '#1c3a6e');
    });
  return b;
}

// ------------------------------------------------------------ solids

const shade = (c: string, k: number) => mix(c, k > 0 ? '#ffffff' : '#000000', Math.abs(k));

/** A solid block drawn in a three-quarter view. */
export function paintSolid(s: Solid, color: string, size = 48, faces = false): PixelBuffer {
  const b = new PixelBuffer(size, size);
  const u = size / 48;
  const R = (x: number) => Math.round(x * u);
  if (s === 'cube' || s === 'box') {
    const w = s === 'cube' ? 22 : 30;
    const hgt = s === 'cube' ? 22 : 16;
    const d = 10;
    const x0 = R(24 - (w + d) / 2);
    const y0 = R(44 - hgt - d);
    fillPoly(b, [[x0, y0 + R(d)], [x0 + R(d), y0], [x0 + R(d + w), y0], [x0 + R(w), y0 + R(d)]], shade(color, 0.35)); // top
    fillPoly(b, [[x0 + R(w), y0 + R(d)], [x0 + R(d + w), y0], [x0 + R(d + w), y0 + R(hgt)], [x0 + R(w), y0 + R(d + hgt)]], shade(color, -0.25)); // side
    b.rect(x0, y0 + R(d), R(w), R(hgt), color); // front
    if (faces) {
      // dashed edges for the hidden faces
      for (let k = 0; k < R(hgt); k += 3) b.set(x0 + R(d), y0 + k, '#1c3a6e');
      for (let k = 0; k < R(w); k += 3) b.set(x0 + R(d) + k, y0 + R(hgt), '#1c3a6e');
    }
  } else if (s === 'sphere') {
    b.ellipse(R(8), R(8), R(32), R(32), color);
    b.ellipse(R(14), R(14), R(12), R(10), shade(color, 0.35));
    b.ellipse(R(17), R(16), R(5), R(4), shade(color, 0.6));
    for (let y = R(8); y < R(40); y++) for (let x = R(8); x < R(40); x++) if (b.get(x, y) === color && (x - R(24)) + (y - R(24)) > R(10)) b.set(x, y, shade(color, -0.2));
  } else if (s === 'cylinder') {
    b.rect(R(12), R(14), R(24), R(26), color);
    b.ellipse(R(12), R(34), R(24), R(10), shade(color, -0.2));
    b.rect(R(12), R(14), R(24), R(25), color);
    b.vline(R(30), R(14), R(38), shade(color, -0.2));
    b.vline(R(31), R(14), R(38), shade(color, -0.2));
    b.ellipse(R(12), R(9), R(24), R(10), shade(color, 0.35));
  } else {
    // cone
    b.ellipse(R(10), R(34), R(28), R(10), shade(color, -0.25));
    fillPoly(b, [[R(10), R(39)], [R(24), R(6)], [R(38), R(39)]], color);
    fillPoly(b, [[R(26), R(39)], [R(24), R(6)], [R(38), R(39)]], shade(color, -0.15));
    if (faces) for (let x = R(10); x < R(38); x += 3) b.set(x, R(36), '#1c3a6e');
  }
  return b.outline();
}

/** Everyday things for "what solid is it shaped like?". */
export function paintThing(t: ThingKind, size = 48): PixelBuffer {
  let b: PixelBuffer;
  switch (t) {
    case 'ball':
      b = paintSolid('sphere', '#4b7fcf', size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (b.get(x, y) && b.get(x, y) !== P.outline && Math.abs(x - y) < size / 10) b.set(x, y, '#f4ecdc');
      return b;
    case 'orange':
      b = paintSolid('sphere', '#e8832e', size);
      b.rect(Math.round(size / 2), Math.round(size * 0.12), Math.round(size / 8), Math.round(size / 14), '#4f9a4a');
      return b;
    case 'can':
      b = paintSolid('cylinder', '#b9b7b4', size);
      b.rect(Math.round(size * 0.25), Math.round(size * 0.42), Math.round(size * 0.5), Math.round(size * 0.22), '#d2453a');
      return b.outline();
    case 'drum':
      b = paintSolid('cylinder', '#d2453a', size);
      for (let k = 0; k < 6; k++) b.set(Math.round(size * (0.28 + k * 0.08)), Math.round(size * (k % 2 ? 0.5 : 0.62)), '#f4ecdc');
      return b;
    case 'dice':
      b = paintSolid('cube', '#f4ecdc', size);
      for (const [x, y] of [
        [0.3, 0.55],
        [0.4, 0.68],
        [0.5, 0.8],
      ])
        b.rect(Math.round(size * x), Math.round(size * y), 2, 2, '#3a2a26');
      return b;
    case 'giftbox':
      b = paintSolid('cube', '#8a5cc4', size);
      b.rect(Math.round(size * 0.34), Math.round(size * 0.3), Math.round(size / 12), Math.round(size * 0.62), '#e8bd3f');
      return b;
    case 'cereal':
      b = new PixelBuffer(size, size);
      b.rect(Math.round(size * 0.3), Math.round(size * 0.12), Math.round(size * 0.34), Math.round(size * 0.78), '#e8bd3f');
      fillPoly(b, [[size * 0.64, size * 0.12], [size * 0.74, size * 0.05], [size * 0.74, size * 0.83], [size * 0.64, size * 0.9]], '#c29a2c');
      b.ellipse(Math.round(size * 0.36), Math.round(size * 0.35), Math.round(size * 0.22), Math.round(size * 0.22), '#d2453a');
      return b.outline();
    case 'icecream':
      b = new PixelBuffer(size, size);
      fillPoly(b, [[size * 0.3, size * 0.42], [size * 0.5, size * 0.95], [size * 0.7, size * 0.42]], '#d9a35b');
      b.ellipse(Math.round(size * 0.27), Math.round(size * 0.12), Math.round(size * 0.46), Math.round(size * 0.38), '#f4b3c8');
      return b.outline();
    default:
      // party hat (a cone upside up)
      b = paintSolid('cone', '#2f9a94', size);
      b.rect(Math.round(size * 0.46), Math.round(size * 0.06), Math.round(size / 10), Math.round(size / 10), '#e8bd3f');
      return b;
  }
}

/** A sorting bin with its label stripe. */
export function paintBin(color: string): PixelBuffer {
  const b = new PixelBuffer(28, 22);
  fillPoly(b, [[1, 4], [27, 4], [24, 21], [4, 21]], color);
  b.rect(0, 2, 28, 4, mix(color, '#000000', 0.3));
  b.rect(5, 9, 18, 6, mix(color, '#ffffff', 0.5));
  return b.outline();
}

/** The clubhouse parts as small HUD icons. */
export function paintPartIcon(part: keyof ClubParts, done: boolean): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  const c = (x: string) => (done ? x : '#8a8378');
  if (part === 'walls') {
    b.rect(2, 4, 12, 10, c(P.plaster));
    for (let y = 6; y < 14; y += 3) b.hline(2, 13, y, c(P.plaster2));
    b.rect(6, 8, 4, 6, c(P.wood2));
  } else if (part === 'pillars') {
    b.rect(3, 2, 3, 12, c('#e9e4da'));
    b.rect(10, 2, 3, 12, c('#e9e4da'));
    b.rect(1, 13, 14, 2, c('#cfc8bb'));
  } else if (part === 'roof') {
    for (let k = 0; k < 7; k++) b.hline(1 + k, 14 - k, 12 - k, c(P.roofRed1));
    b.ellipse(6, 7, 4, 4, c('#9ad1e8'));
  } else {
    for (let x = 0; x < 16; x += 4) b.rect(x, 7, 2, 8, c('#f4ecdc'));
    b.hline(0, 15, 10, c('#dcd4c4'));
    b.rect(5, 3, 2, 2, c('#ef8fb1'));
    b.rect(9, 4, 2, 2, c('#f2c94c'));
  }
  return b.outline();
}

/** A tiny gold hard hat (for the Rush best score). */
export function paintHardHat(color = '#e8bd3f'): PixelBuffer {
  const b = new PixelBuffer(16, 12);
  b.ellipse(2, 1, 12, 10, color);
  b.rect(0, 7, 16, 3, mix(color, '#000000', 0.25));
  b.rect(7, 1, 2, 6, mix(color, '#ffffff', 0.35));
  return b.outline();
}

// ------------------------------------------------------------ Mr. Haruto's blueprints

const BP_PAPER = '#22508f';
const BP_GRID = '#2c5d9e';
const BP_FILL = '#3468ad';
const BP_LINE = '#e8f0ff';
const HILITE = '#f2c94c';

/** A line drawn in dashes (for hidden edges and the lines where pieces meet). */
function dashed(b: PixelBuffer, x0: number, y0: number, x1: number, y1: number, color: string, w = 1): void {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) if (Math.floor(i / 3) % 2 === 0) b.rect(Math.round(x0 + ((x1 - x0) * i) / n - (w - 1) / 2), Math.round(y0 + ((y1 - y0) * i) / n - (w - 1) / 2), w, w, color);
}

function piecePts(p: Piece, ox: number, oy: number): Pt[] {
  const { x, y, w, h } = p;
  if (p.kind === 'triangle')
    return p.flip
      ? [[ox + x, oy + y], [ox + x + w, oy + y], [ox + x + w / 2, oy + y + h]]
      : [[ox + x + w / 2, oy + y], [ox + x + w, oy + y + h], [ox + x, oy + y + h]];
  return [[ox + x, oy + y], [ox + x + w, oy + y], [ox + x + w, oy + y + h], [ox + x, oy + y + h]];
}

function drawPiece(b: PixelBuffer, p: Piece, ox: number, oy: number, fill: string, stroke: string, dash = false): void {
  if (p.kind === 'circle') {
    if (!dash) {
      b.ellipse(ox + p.x, oy + p.y, p.w, p.h, stroke);
      if (p.w > 3) b.ellipse(ox + p.x + 1, oy + p.y + 1, p.w - 2, p.h - 2, fill);
      return;
    }
    const cx = ox + p.x + p.w / 2 - 0.5;
    const cy = oy + p.y + p.h / 2 - 0.5;
    for (let k = 0; k < 40; k++) if (k % 4 < 2) b.set(Math.round(cx + Math.cos((k / 40) * 2 * Math.PI) * (p.w / 2 - 0.5)), Math.round(cy + Math.sin((k / 40) * 2 * Math.PI) * (p.h / 2 - 0.5)), stroke);
    return;
  }
  const pts = piecePts(p, ox, oy);
  if (!dash) fillPoly(b, pts, fill);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const z = pts[(i + 1) % pts.length];
    (dash ? dashed : line)(b, a[0], a[1], Math.min(z[0], ox + 63.5), z[1], stroke);
  }
}

/** A blueprint on blue paper. With `ask`, the pieces of that kind are colored in and numbered (the picture hint). */
export function paintBlueprint(bp: Blueprint, ask?: PieceKind): PixelBuffer {
  const S = 72;
  const o = 4;
  const b = new PixelBuffer(S, S);
  b.rect(0, 0, S, S, BP_PAPER);
  for (let k = 4; k < S; k += 8) {
    b.hline(0, S - 1, k, BP_GRID);
    b.vline(k, 0, S - 1, BP_GRID);
  }
  for (const p of bp.pieces) drawPiece(b, p, o, o, ask === p.kind ? HILITE : BP_FILL, BP_LINE);
  if (ask) {
    // pieces that hide behind others get a dashed outline, so every one can be counted
    bp.pieces.filter((p) => p.kind === ask && p.behind).forEach((p) => drawPiece(b, p, o, o, HILITE, HILITE, true));
    bp.pieces
      .filter((p) => p.kind === ask)
      .forEach((p, i) => {
        const cx = o + p.x + p.w / 2;
        const cy = o + p.y + (p.kind === 'triangle' && !p.flip ? (p.h * 2) / 3 : p.h / 2);
        const t = String(i + 1);
        const tx = Math.round(cx - textWidth(t) / 2);
        const ty = Math.round(cy - 2.5);
        b.rect(tx - 1, ty - 1, textWidth(t) + 2, 7, '#ffffff');
        paintText(b, t, tx, ty, '#1c3a6e');
      });
  }
  b.rect(0, 0, S, 1, '#163a6e');
  b.rect(0, S - 1, S, 1, '#163a6e');
  return b;
}

/** The big shape to fill, and one piece at the same size beside it. With `cuts`, dashed lines show where the pieces meet. */
export function paintComposition(c: Composition, cuts = false): PixelBuffer {
  const W = 112;
  const H = 64;
  const b = new PixelBuffer(W, H);
  b.rect(0, 0, W, H, BP_PAPER);
  for (let k = 4; k < W; k += 8) b.vline(k, 0, H - 1, BP_GRID);
  for (let k = 4; k < H; k += 8) b.hline(0, W - 1, k, BP_GRID);
  const bw = Math.max(...c.outline.map((p) => p[0]));
  const bh = Math.max(...c.outline.map((p) => p[1]));
  const pw = Math.max(...c.pieceShape.map((p) => p[0]));
  const ph = Math.max(...c.pieceShape.map((p) => p[1]));
  // one size for both, so the piece really is the size it would be inside the big shape
  const u = Math.min(52 / bh, 52 / ph, (W - 30) / (bw + pw));
  const split = Math.round(10 + bw * u + 7);
  const ox = 8;
  const oy = (H - bh * u) / 2;
  const T: Pt[] = c.outline.map(([x, y]) => [ox + x * u, oy + y * u]);
  fillPoly(b, T, BP_FILL);
  for (let i = 0; i < T.length; i++) line(b, T[i][0], T[i][1], T[(i + 1) % T.length][0], T[(i + 1) % T.length][1], BP_LINE);
  if (cuts) for (const [[x0, y0], [x1, y1]] of c.cuts) dashed(b, ox + x0 * u, oy + y0 * u, ox + x1 * u, oy + y1 * u, HILITE, 2);
  // the piece, at the same size, on the right
  const px = split + 6 + (W - split - 12 - pw * u) / 2;
  const py = (H - ph * u) / 2;
  const Q: Pt[] = c.pieceShape.map(([x, y]) => [px + x * u, py + y * u]);
  fillPoly(b, Q, HILITE);
  for (let i = 0; i < Q.length; i++) line(b, Q[i][0], Q[i][1], Q[(i + 1) % Q.length][0], Q[(i + 1) % Q.length][1], '#8a6a10');
  b.vline(split, 4, H - 5, BP_LINE);
  return b;
}

/** A window cut into panes ('grid'), or a floor with only its first row and column of tiles drawn ('edge'). */
export function paintTiles(rows: number, cols: number, mode: 'grid' | 'edge', hint = false): PixelBuffer {
  const W = 96;
  const H = 64;
  const b = new PixelBuffer(W, H);
  b.rect(0, 0, W, H, BP_PAPER);
  const t = Math.min(Math.floor(84 / cols), Math.floor(54 / rows), 16);
  const x0 = Math.round((W - t * cols) / 2);
  const y0 = Math.round((H - t * rows) / 2);
  const ROWS = ['#f2c94c', '#9ad1e8'];
  if (mode === 'grid') {
    b.rect(x0 - 2, y0 - 2, t * cols + 4, t * rows + 4, P.wood2);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        b.rect(x0 + c * t + 1, y0 + r * t + 1, t - 2, t - 2, hint ? ROWS[r % 2] : '#9ad1e8');
        if (!hint) b.set(x0 + c * t + 2, y0 + r * t + 2, '#e8f6ff');
      }
    return b;
  }
  b.rect(x0, y0, t * cols, t * rows, BP_FILL);
  line(b, x0, y0, x0 + t * cols - 1, y0, BP_LINE);
  line(b, x0, y0 + t * rows - 1, x0 + t * cols - 1, y0 + t * rows - 1, BP_LINE);
  line(b, x0, y0, x0, y0 + t * rows - 1, BP_LINE);
  line(b, x0 + t * cols - 1, y0, x0 + t * cols - 1, y0 + t * rows - 1, BP_LINE);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const drawn = r === 0 || c === 0;
      if (drawn) {
        b.rect(x0 + c * t + 1, y0 + r * t + 1, t - 2, t - 2, '#e9d9b8');
        b.rect(x0 + c * t + 1, y0 + r * t + t - 2, t - 2, 1, '#c9b48c');
      } else if (hint) {
        dashed(b, x0 + c * t, y0 + r * t, x0 + c * t + t - 1, y0 + r * t, HILITE);
        dashed(b, x0 + c * t, y0 + r * t, x0 + c * t, y0 + r * t + t - 1, HILITE);
      }
    }
  return b;
}

// ------------------------------------------------------------ Priya's gardens

const SOIL = '#8a5a35';
const GRASS = ['#5aa64e', '#4f9a44'];
const FENCE = '#f4ecdc';
const FENCE_DARK = '#6b4a2e';

/** Tiny local letters for the garden labels (the shared pixel font has digits only). */
const LETTERS: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
};

function label(b: PixelBuffer, text: string, cx: number, cy: number, bg = '#ffffff', fg = '#1c3a6e'): void {
  const w = textWidth(text);
  const x = Math.round(cx - w / 2);
  const y = Math.round(cy - 2.5);
  b.rect(x - 2, y - 2, w + 4, 9, bg);
  let lx = x;
  for (const ch of text) {
    const g = LETTERS[ch];
    if (g) g.forEach((row, j) => [...row].forEach((v, i) => v === '#' && b.set(lx + i, y + j, fg)));
    else paintText(b, ch, lx, y, fg);
    lx += 4;
  }
}

function grassGrid(b: PixelBuffer, x0: number, y0: number, w: number, h: number, t: number, opts: { number?: 'area' | 'fence'; fenceOn?: boolean } = {}): void {
  b.rect(x0 - 1, y0 - 1, w * t + 2, h * t + 2, SOIL);
  for (let r = 0; r < h; r++)
    for (let c = 0; c < w; c++) {
      b.rect(x0 + c * t, y0 + r * t, t - 1, t - 1, GRASS[(r + c) % 2]);
      if (opts.number === 'area' && t >= 9) {
        const n = String(r * w + c + 1);
        paintText(b, n, x0 + c * t + Math.round((t - 1 - textWidth(n)) / 2), y0 + r * t + Math.round((t - 6) / 2), '#ffffff');
      }
    }
  if (opts.fenceOn !== false) {
    // one fence piece along every edge square side, with a dark post where two pieces meet
    for (let c = 0; c < w; c++)
      for (const y of [y0 - 3, y0 + h * t]) {
        b.rect(x0 + c * t, y, t, 3, FENCE);
        b.hline(x0 + c * t, x0 + c * t + t - 1, y + 2, '#d8cbb0');
      }
    for (let r = 0; r < h; r++)
      for (const x of [x0 - 3, x0 + w * t]) {
        b.rect(x, y0 + r * t, 3, t, FENCE);
        b.vline(x + 2, y0 + r * t, y0 + r * t + t - 1, '#d8cbb0');
      }
    for (let c = 0; c <= w; c++)
      for (const y of [y0 - 4, y0 + h * t - 1]) b.rect(x0 + c * t - 2, y, 3, 5, FENCE_DARK);
    for (let r = 1; r < h; r++) for (const x of [x0 - 4, x0 + w * t - 1]) b.rect(x, y0 + r * t - 2, 5, 3, FENCE_DARK);
  }
  if (opts.number === 'fence') {
    let k = 1;
    const put = (x: number, y: number) => label(b, String(k++), x, y, '#fff7d6');
    for (let c = 0; c < w; c++) put(x0 + c * t + t / 2, y0 - 9);
    for (let r = 0; r < h; r++) put(x0 + w * t + 10, y0 + r * t + t / 2);
    for (let c = w - 1; c >= 0; c--) put(x0 + c * t + t / 2, y0 + h * t + 9);
    for (let r = h - 1; r >= 0; r--) put(x0 - 10, y0 + r * t + t / 2);
  }
}

/** A garden for Priya's questions. `hint` shows the picture hint: numbered squares or fence pieces, a grid inside, or the two parts of an L. */
export function paintGarden(g: GardenPic, hint: 'area' | 'fence' | null = null): PixelBuffer {
  const W = 112;
  const H = 84;
  const b = new PixelBuffer(W, H);
  b.rect(0, 0, W, H, '#a9cf7a');
  for (let k = 0; k < 60; k++) b.set((k * 37) % W, (k * 53) % H, '#9cc56c');
  if (g.kind === 'grid') {
    const t = Math.min(14, Math.floor(80 / g.w), Math.floor(56 / g.h));
    grassGrid(b, Math.round((W - g.w * t) / 2), Math.round((H - g.h * t) / 2), g.w, g.h, t, { number: hint ?? undefined });
    return b;
  }
  if (g.kind === 'pair') {
    const t = Math.min(5, Math.floor(44 / Math.max(g.A[0], g.B[0])));
    const t2 = Math.min(t, Math.floor(56 / Math.max(g.A[1], g.B[1])));
    [g.A, g.B].forEach(([w, h], i) => {
      const cx = i === 0 ? 28 : 84;
      grassGrid(b, Math.round(cx - (w * t2) / 2), Math.round(46 - (h * t2) / 2), w, h, t2);
      label(b, i === 0 ? 'A' : 'B', cx, 9);
      if (hint) label(b, String(2 * (w + h)), cx, 76, '#fff7d6');
    });
    return b;
  }
  if (g.kind === 'rect') {
    const s = Math.min(76 / g.w, 52 / g.h);
    const w = Math.round(g.w * s);
    const h = Math.round(g.h * s);
    const x0 = Math.round(12 + (88 - w) / 2);
    const y0 = Math.round(16 + (60 - h) / 2);
    b.rect(x0 - 2, y0 - 2, w + 4, h + 4, FENCE);
    b.rect(x0, y0, w, h, GRASS[0]);
    for (let y = y0 + 2; y < y0 + h; y += 4) for (let x = x0 + ((y / 4) % 2 ? 1 : 3); x < x0 + w; x += 5) b.set(x, y, GRASS[1]);
    if (hint === 'area' && g.top !== '?')
      for (let c = 1; c < g.w; c++) for (let y = y0; y < y0 + h; y++) if (y % 2 === 0) b.set(Math.round(x0 + c * s), y, '#d9f0c0');
    if (hint === 'area' && g.top !== '?')
      for (let r = 1; r < g.h; r++) for (let x = x0; x < x0 + w; x++) if (x % 2 === 0) b.set(x, Math.round(y0 + r * s), '#d9f0c0');
    label(b, g.top, x0 + w / 2, y0 - 8);
    label(b, g.left, x0 - 9, y0 + h / 2);
    if (hint === 'fence') {
      label(b, g.top, x0 + w / 2, y0 + h + 8);
      label(b, g.left, x0 + w + 9, y0 + h / 2);
    }
    return b;
  }
  // the L: an upright a wide on the left, on top of a bar W wide and b tall
  const s = Math.min(80 / g.W, 60 / g.H);
  const x0 = Math.round(14 + (84 - g.W * s) / 2);
  const y0 = Math.round(12 + (64 - g.H * s) / 2);
  const X = (u: number) => Math.round(x0 + u * s);
  const Y = (v: number) => Math.round(y0 + v * s);
  const outline: Pt[] = [[X(0), Y(0)], [X(g.a), Y(0)], [X(g.a), Y(g.H - g.b)], [X(g.W), Y(g.H - g.b)], [X(g.W), Y(g.H)], [X(0), Y(g.H)]];
  fillPoly(b, outline, FENCE);
  const inner: Pt[] = outline.map(([x, y], i) => [x + (i === 0 || i === 5 ? 2 : -2), y + (i === 0 || i === 1 ? 2 : i === 2 || i === 3 ? 2 : -2)]);
  fillPoly(b, inner, GRASS[0]);
  if (hint) {
    b.rect(X(0) + 2, Y(0) + 2, X(g.a) - X(0) - 4, Y(g.H - g.b) - Y(0) - 2, '#7cc06a');
    b.rect(X(0) + 2, Y(g.H - g.b) + 1, X(g.W) - X(0) - 4, Y(g.H) - Y(g.H - g.b) - 3, '#e2c77a');
  }
  dashed(b, X(0), Y(g.H - g.b), X(g.a), Y(g.H - g.b), '#ffffff');
  label(b, String(g.W), (X(0) + X(g.W)) / 2, Y(g.H) + 7);
  label(b, String(g.H), X(0) - 8, (Y(0) + Y(g.H)) / 2);
  label(b, String(g.a), (X(0) + X(g.a)) / 2, Y(0) - 7);
  label(b, String(g.b), X(g.W) + 8, (Y(g.H - g.b) + Y(g.H)) / 2);
  return b;
}
