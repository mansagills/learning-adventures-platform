import { PixelBuffer, mix } from '../../kit/art/pixel';
import { P } from '../../kit/art/palette';
import { labelBuffer, paintText, textWidth } from '../../kit/art/pixelFont';
import { mulberry32 } from '../../kit/core/rng';
import type { BeltId } from './problems';

/**
 * All of Number Line Ninja's art, painted in code in the Seeds of Genius
 * pixel style: five riverside places (one per belt), stepping stones with
 * numbers, trees, lanterns, koi, the hop arcs and little effects.
 */

export interface Theme {
  id: BeltId;
  sky: [string, string];
  mountains: [string, string];
  grass: [string, string, string];
  water: [string, string, string];
  tree: 'cherry' | 'bamboo' | 'maple' | 'pine';
  /** Color of drifting petals or leaves (null = none). */
  petal: string | null;
  night: boolean;
  /** Light tint for the whole scene. */
  tint: [number, number, number];
  waterfall?: boolean;
}

export const THEMES: Record<BeltId, Theme> = {
  white: {
    id: 'white',
    sky: ['#9fd4f0', '#e7f4f6'],
    mountains: ['#a9bfd8', '#7f9cbf'],
    grass: [P.grass1, P.grass2, P.grass3],
    water: [P.water1, P.water2, P.water3],
    tree: 'cherry',
    petal: '#f6b8cf',
    night: false,
    tint: [1, 1, 1],
  },
  yellow: {
    id: 'yellow',
    sky: ['#a7d8e8', '#eef7e3'],
    mountains: ['#9fbfa8', '#76a07e'],
    grass: ['#86b85a', '#73a64c', '#98c76a'],
    water: ['#4fa6b8', '#72c1cf', '#3d8ea3'],
    tree: 'bamboo',
    petal: null,
    night: false,
    tint: [1, 1, 0.97],
  },
  orange: {
    id: 'orange',
    sky: ['#f3c48f', '#fbe8c8'],
    mountains: ['#c59a86', '#a07766'],
    grass: ['#a7a957', '#949849', '#b8b866'],
    water: ['#4f8fb5', '#6daccc', '#3c769d'],
    tree: 'maple',
    petal: '#e0823a',
    night: false,
    tint: [1, 0.96, 0.9],
    waterfall: true,
  },
  green: {
    id: 'green',
    sky: ['#b4d6e8', '#e3eff2'],
    mountains: ['#9cb0c2', '#768ea6'],
    grass: [P.grass1, P.grass2, P.grass3],
    water: ['#4b98c8', '#6cb3dc', '#3a80b0'],
    tree: 'pine',
    petal: null,
    night: false,
    tint: [0.98, 1, 1],
  },
  black: {
    id: 'black',
    sky: ['#141a3a', '#2c3566'],
    mountains: ['#262e57', '#1c2246'],
    grass: ['#4f7a52', '#436a47', '#5b8a5c'],
    water: ['#2a4f7a', '#3a6a97', '#21416a'],
    tree: 'pine',
    petal: null,
    night: true,
    tint: [0.62, 0.66, 0.9],
  },
};

// ------------------------------------------------------------------ backdrop

/** Sky, mountains and a distant treeline: a tall standing picture behind the far bank. */
export function paintBackdrop(theme: Theme, widthPx: number, heightPx: number, seed = 3): HTMLCanvasElement {
  const b = new PixelBuffer(widthPx, heightPx);
  const r = mulberry32(seed);
  // sky in flat bands with a dithered seam between them
  const bands = 6;
  for (let y = 0; y < heightPx; y++) {
    const t = Math.min(1, y / (heightPx * 0.75));
    const band = Math.floor(t * bands) / bands;
    const next = Math.min(1, band + 1 / bands);
    const inBand = t * bands - Math.floor(t * bands);
    for (let x = 0; x < widthPx; x++) {
      const dither = inBand > 0.75 && (x + y) % 2 === 0;
      b.set(x, y, mix(theme.sky[0], theme.sky[1], dither ? next : band));
    }
  }
  // sun or moon and stars
  if (theme.night) {
    for (let i = 0; i < widthPx / 9; i++) {
      const x = Math.floor(r() * widthPx);
      const y = Math.floor(r() * heightPx * 0.55);
      b.set(x, y, r() < 0.3 ? '#fff6cf' : '#c9d3ff');
    }
    b.ellipse(Math.floor(widthPx * 0.72), 18, 18, 18, '#f3e3b5');
    b.ellipse(Math.floor(widthPx * 0.72) + 6, 15, 15, 15, mix(theme.sky[0], theme.sky[1], 0.15));
  } else {
    b.ellipse(Math.floor(widthPx * 0.78), 16, 16, 16, '#fff3c4');
    b.ellipse(Math.floor(widthPx * 0.78) + 3, 19, 10, 10, '#fffbe6');
  }
  // clouds
  if (!theme.night)
    for (let i = 0; i < widthPx / 120; i++) {
      const cx = Math.floor(r() * widthPx);
      const cy = 24 + Math.floor(r() * 40);
      b.ellipse(cx, cy, 26, 8, '#ffffff');
      b.ellipse(cx + 8, cy - 5, 16, 9, '#ffffff');
      b.hline(cx + 2, cx + 23, cy + 7, mix('#ffffff', theme.sky[1], 0.4));
    }
  // two mountain ranges
  const ranges: Array<[string, number, number]> = [
    [theme.mountains[0], heightPx - 60, 34],
    [theme.mountains[1], heightPx - 34, 26],
  ];
  ranges.forEach(([color, base, amp], k) => {
    let y = base;
    let slope = 0;
    for (let x = 0; x < widthPx; x++) {
      if (x % 6 === 0) slope = (r() - 0.5) * 2.4 + (base - y) * 0.06;
      y = Math.max(base - amp, Math.min(base + 8, y + slope));
      const top = Math.round(y);
      for (let yy = top; yy < heightPx; yy++) b.set(x, yy, color);
      if (k === 0 && top < base - amp + 10 && !theme.night) for (let yy = top; yy < top + 3; yy++) b.set(x, yy, '#f4f6fb');
      else b.set(x, top, mix(color, '#ffffff', 0.18));
    }
  });
  // a waterfall down the near range
  if (theme.waterfall) {
    const wx = Math.floor(widthPx * 0.3);
    for (let y = heightPx - 46; y < heightPx; y++)
      for (let x = wx; x < wx + 7; x++) b.set(x, y, (x + y) % 3 === 0 ? '#ffffff' : '#bfe6f5');
  }
  // far treeline along the bottom
  const tl = theme.night ? '#1d3b2e' : mix(theme.grass[1], P.outline, 0.35);
  for (let x = 0; x < widthPx; x += 3) {
    const hgt = 4 + Math.floor(r() * 6);
    b.ellipse(x - 2, heightPx - hgt - 2, 7, hgt + 4, tl);
  }
  b.rect(0, heightPx - 3, widthPx, 3, tl);
  return b.toCanvas();
}

// ------------------------------------------------------------------ ground and water

/**
 * The banks: one canvas for the whole ground, 16px per tile. Water rows are
 * left as a darker bed; the animated water plane sits on top of them.
 */
export function paintGround(theme: Theme, wTiles: number, hTiles: number, water: [number, number], seed = 7): HTMLCanvasElement {
  const W = wTiles * 16;
  const H = hTiles * 16;
  const b = new PixelBuffer(W, H);
  const r = mulberry32(seed);
  const [g1, g2, g3] = theme.grass;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const v = r();
      b.set(x, y, v < 0.12 ? g2 : v < 0.2 ? g3 : g1);
    }
  // grass tufts and flowers
  const flowers = theme.night ? ['#c9d3ff', '#f3e3b5'] : [P.flowerYellow, P.flowerWhite, P.flowerPink, P.flowerPurple];
  for (let i = 0; i < (W * H) / 140; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * H);
    if (r() < 0.75) {
      b.set(x, y, g2);
      b.set(x + 1, y - 1, g2);
      b.set(x + 2, y, g2);
    } else {
      const c = flowers[Math.floor(r() * flowers.length)];
      b.set(x, y, c);
      b.set(x + 1, y, c);
      b.set(x, y + 1, c);
      b.set(x + 1, y + 1, mix(c, P.outline, 0.2));
    }
  }
  // the river bed and its stony banks
  const top = water[0] * 16;
  const bot = water[1] * 16;
  b.rect(0, top, W, bot - top, theme.water[2]);
  for (let x = 0; x < W; x++) {
    const n1 = Math.floor(r() * 3);
    const n2 = Math.floor(r() * 3);
    for (let k = 0; k < 4 + n1; k++) b.set(x, top - 1 - k, k < 2 ? '#c9b48c' : k === 2 ? '#b39a72' : mix('#b39a72', g1, 0.5));
    for (let k = 0; k < 4 + n2; k++) b.set(x, bot + k, k < 2 ? '#c9b48c' : k === 2 ? '#b39a72' : mix('#b39a72', g1, 0.5));
  }
  // pebbles on the banks
  for (let i = 0; i < W / 6; i++) {
    const x = Math.floor(r() * W);
    const y = r() < 0.5 ? top - 2 - Math.floor(r() * 3) : bot + 1 + Math.floor(r() * 3);
    b.set(x, y, '#9a8a74');
    b.set(x + 1, y, '#e2d6bd');
  }
  return b.toCanvas();
}

/** A small seamless water tile (32x16) that scrolls to make the river flow. */
export function paintWaterTile(theme: Theme): HTMLCanvasElement {
  const b = new PixelBuffer(32, 16);
  const [w1, w2, w3] = theme.water;
  b.rect(0, 0, 32, 16, w1);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 32; x++) if ((x * 7 + y * 13) % 29 === 0) b.set(x, y, w3);
  // two soft wave dashes
  b.hline(3, 9, 4, w2);
  b.hline(5, 7, 3, mix(w2, '#ffffff', 0.4));
  b.hline(19, 26, 11, w2);
  b.hline(21, 24, 10, mix(w2, '#ffffff', 0.4));
  return b.toCanvas();
}

// ------------------------------------------------------------------ stepping stones

export interface StoneLook {
  /** The number to print (null = a hidden number). */
  label: string | null;
  /** Gold ring for the start stone. */
  start?: boolean;
  /** Glow for a hinted landing stone. */
  glow?: boolean;
  /** Dimmed (past the end of this challenge's line). */
  dim?: boolean;
}

/**
 * Paint one stone into a 16x24 cell: a ripple ring, the rounded top face
 * with its number, and a darker side so it reads as a raised block.
 */
export function paintStone(b: PixelBuffer, ox: number, oy: number, s: StoneLook, theme: Theme): void {
  const ring = mix(theme.water[1], '#ffffff', 0.35);
  b.ellipse(ox, oy + 10, 16, 8, ring);
  b.ellipse(ox + 1, oy + 11, 14, 6, theme.water[0]);
  const top = s.dim ? '#8d949c' : '#c7ccd2';
  const side = s.dim ? '#5f666e' : '#868e98';
  const light = s.dim ? '#a4aab1' : '#e3e7eb';
  // side face
  b.rect(ox + 2, oy + 10, 12, 4, side);
  b.rect(ox + 1, oy + 11, 14, 2, side);
  // top face
  b.rect(ox + 2, oy + 1, 12, 11, top);
  b.rect(ox + 1, oy + 2, 14, 9, top);
  b.hline(ox + 3, ox + 12, oy + 1, light);
  b.vline(ox + 1, oy + 3, oy + 9, light);
  if (s.start) {
    for (let x = ox + 1; x <= ox + 14; x++) {
      b.set(x, oy, P.gold);
      b.set(x, oy + 12, P.gold);
    }
    b.vline(ox, oy + 1, oy + 11, P.gold);
    b.vline(ox + 15, oy + 1, oy + 11, P.gold);
  }
  if (s.glow) {
    b.rect(ox + 2, oy + 1, 12, 11, '#fff1b8');
    b.rect(ox + 1, oy + 2, 14, 9, '#fff1b8');
  }
  if (s.label !== null) {
    const w = textWidth(s.label);
    paintText(b, s.label, ox + 8 - Math.ceil(w / 2), oy + 5, '#2b1d1e');
  } else {
    // a hidden number: a small carved notch
    b.rect(ox + 7, oy + 7, 2, 2, side);
  }
  // outline the stone body (not the ripple)
  for (let y = oy; y < oy + 15; y++)
    for (let x = ox; x < ox + 16; x++) {
      const c = b.get(x, y);
      if (c !== ring && c !== theme.water[0] && c !== null) continue;
      const near = [b.get(x - 1, y), b.get(x + 1, y), b.get(x, y - 1), b.get(x, y + 1)];
      if (near.some((n) => n === top || n === side || n === light || n === P.gold || n === '#fff1b8')) b.set(x, y, P.outline);
    }
}

// ------------------------------------------------------------------ hop arcs

/**
 * A hop arc from one stone to another: a dotted curve with the hop size at
 * the top. `ghost` arcs are Sensei's hint (gold and dashed).
 */
export function paintArc(dist: number, ghost: boolean): { canvas: HTMLCanvasElement; heightPx: number } {
  const span = Math.abs(dist) * 16;
  const rise = Math.abs(dist) >= 5 ? 30 : 16;
  const label = `${dist > 0 ? '+' : '-'}${Math.abs(dist)}`;
  // The hop size is the math, so it is drawn at double size.
  // A "+1" tag is exactly one stone wide, so tags on neighbouring hops touch but never overlap.
  const labelW = textWidth(label) * 2 + 2;
  const labelH = 12;
  const W = Math.max(span + 2, labelW + 2);
  const H = rise + labelH + 4;
  const b = new PixelBuffer(W, H);
  const cx = W / 2;
  const color = ghost ? '#ffd35e' : '#ffffff';
  const edge = ghost ? '#8a5a0e' : '#2b1d1e';
  let px = -1;
  let py = -1;
  for (let i = 0; i <= span; i++) {
    const t = i / span;
    const x = Math.round(cx - span / 2 + i);
    const y = Math.round(H - 2 - 4 * rise * t * (1 - t));
    const draw = ghost ? Math.floor(i / 3) % 2 === 0 : true;
    if (draw) {
      // join steep parts so the curve has no gaps
      if (px >= 0 && Math.abs(y - py) > 1) for (let yy = Math.min(y, py); yy <= Math.max(y, py); yy++) b.set(x, yy, color);
      b.set(x, y, color);
    }
    px = x;
    py = y;
  }
  // arrow head at the landing end
  const endX = dist > 0 ? Math.round(cx + span / 2) : Math.round(cx - span / 2);
  const back = dist > 0 ? -1 : 1;
  b.set(endX + back, H - 4, color);
  b.set(endX + back * 2, H - 4, color);
  b.set(endX + back, H - 5, color);
  // the label on a little tag
  const lx = Math.round(cx - labelW / 2);
  const ly = Math.max(0, Math.round(H - 2 - rise - labelH));
  b.rect(lx, ly, labelW, labelH, ghost ? '#fff1b8' : '#fdfbf5');
  const small = new PixelBuffer(textWidth(label), 5);
  paintText(small, label, 0, 0, ghost ? '#6a4106' : '#2b1d1e');
  for (let y = 0; y < small.h; y++)
    for (let x = 0; x < small.w; x++) {
      const c = small.get(x, y);
      if (c) b.rect(lx + 1 + x * 2, ly + 1 + y * 2, 2, 2, c);
    }
  b.outline(edge);
  return { canvas: b.toCanvas(), heightPx: H };
}

// ------------------------------------------------------------------ scenery

export function paintTree(kind: Theme['tree'], seed: number, night: boolean): PixelBuffer {
  const r = mulberry32(seed);
  const shade = (c: string) => (night ? mix(c, '#1a2050', 0.35) : c);
  if (kind === 'bamboo') {
    const b = new PixelBuffer(20, 52);
    for (let i = 0; i < 4; i++) {
      const x = 2 + i * 4 + Math.floor(r() * 2);
      const top = 4 + Math.floor(r() * 10);
      for (let y = top; y < 52; y++) {
        b.set(x, y, shade(y % 9 === 0 ? '#4d7d2f' : '#7fb44b'));
        b.set(x + 1, y, shade(y % 9 === 0 ? '#3d6624' : '#5f9a3a'));
      }
      for (let k = 0; k < 3; k++) {
        const ly = top + 3 + k * 9;
        const dir = k % 2 ? 1 : -1;
        for (let j = 1; j < 6; j++) b.set(x + (dir > 0 ? 1 + j : -j), ly + Math.floor(j / 2), shade(j < 3 ? '#8cc463' : '#6aa24a'));
      }
    }
    return b.outline();
  }
  if (kind === 'pine') {
    const b = new PixelBuffer(24, 40);
    b.rect(10, 30, 4, 10, shade(P.trunk));
    const greens = ['#2f6b3a', '#3d7f45', '#4f9550'];
    for (let tier = 0; tier < 4; tier++) {
      const y = 4 + tier * 7;
      const w = 8 + tier * 4;
      for (let j = 0; j < 9; j++) b.hline(12 - Math.floor((w * j) / 18), 11 + Math.floor((w * j) / 18), y + j, shade(greens[j < 3 ? 2 : j < 6 ? 1 : 0]));
    }
    if (night) for (let i = 0; i < 4; i++) b.set(6 + Math.floor(r() * 12), 10 + Math.floor(r() * 18), '#7d8fd0');
    return b.outline();
  }
  const b = new PixelBuffer(32, 40);
  b.rect(14, 24, 4, 16, shade(P.trunk));
  b.set(13, 39, shade(P.trunk));
  b.set(18, 39, shade(P.trunk));
  b.hline(10, 13, 26, shade(P.trunk));
  const palette =
    kind === 'cherry'
      ? ['#f6b8cf', '#ef8fb1', '#fbd7e4', '#d9739a']
      : ['#e0823a', '#c9483f', '#f2b53a', '#a8442f'];
  const blobs = [
    [4, 8, 14, 12],
    [14, 4, 14, 13],
    [9, 1, 14, 11],
    [2, 15, 12, 10],
    [18, 14, 12, 10],
    [10, 12, 14, 12],
  ];
  blobs.forEach(([x, y, w, h]) => b.ellipse(x, y, w, h, shade(palette[0])));
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(r() * 32);
    const y = Math.floor(r() * 26);
    if (b.get(x, y)) b.set(x, y, shade(palette[1 + Math.floor(r() * 3)]));
  }
  return b.outline();
}

export function paintLantern(lit: boolean): PixelBuffer {
  const b = new PixelBuffer(12, 22);
  const stone = '#a39b8f';
  const dark = '#7d756a';
  b.rect(1, 2, 10, 3, stone);
  b.rect(3, 0, 6, 2, stone);
  b.rect(2, 5, 8, 6, dark);
  b.rect(3, 6, 6, 4, lit ? '#ffe7a3' : '#4a4540');
  b.rect(1, 11, 10, 2, stone);
  b.rect(4, 13, 4, 6, stone);
  b.rect(2, 19, 8, 3, dark);
  return b.outline();
}

export function paintDojo(night: boolean): PixelBuffer {
  const b = new PixelBuffer(56, 44);
  const wood = night ? '#6a4630' : P.wood1;
  const woodD = night ? '#4a2f20' : P.wood2;
  const roof = night ? '#3a3f5c' : '#4e5a7a';
  const roofL = night ? '#4c5274' : '#66739a';
  // walls
  b.rect(6, 22, 44, 20, night ? '#cdbf9e' : P.plaster);
  b.vline(6, 22, 41, woodD);
  b.vline(49, 22, 41, woodD);
  b.hline(6, 49, 22, woodD);
  // sliding doors with paper panes
  b.rect(20, 26, 16, 16, wood);
  for (let x = 21; x < 35; x += 4) b.rect(x, 27, 3, 6, night ? '#ffd88a' : '#fbf3de');
  for (let x = 21; x < 35; x += 4) b.rect(x, 34, 3, 7, night ? '#ffd88a' : '#fbf3de');
  // roof with upturned ends
  for (let j = 0; j < 12; j++) b.hline(2 + Math.max(0, 6 - j), 53 - Math.max(0, 6 - j), 10 + j, j % 3 === 0 ? roofL : roof);
  b.hline(0, 55, 21, roofL);
  b.set(0, 20, roofL);
  b.set(55, 20, roofL);
  b.rect(16, 4, 24, 7, roof);
  b.hline(14, 41, 10, roofL);
  // the sign: a small number line
  b.rect(22, 13, 12, 5, P.paper);
  b.hline(23, 32, 15, P.ink);
  [23, 26, 29, 32].forEach((x) => b.set(x, 14, P.ink));
  b.rect(2, 41, 52, 3, '#8a8478');
  return b.outline();
}

export function paintReeds(seed: number, night: boolean): PixelBuffer {
  const r = mulberry32(seed);
  const b = new PixelBuffer(12, 16);
  for (let i = 0; i < 5; i++) {
    const x = 1 + i * 2 + Math.floor(r() * 2);
    const top = 2 + Math.floor(r() * 6);
    b.vline(x, top, 15, night ? '#3f6a4a' : '#5f9a3a');
    if (r() < 0.5) b.rect(x, top, 1, 3, night ? '#5a4a3a' : '#7a4f2a');
  }
  return b.outline();
}

export function paintRock(seed: number): PixelBuffer {
  const r = mulberry32(seed);
  const b = new PixelBuffer(14, 10);
  b.ellipse(0, 1 + Math.floor(r() * 2), 14, 9, '#9a958c');
  b.ellipse(2, 1, 8, 5, '#b9b3a8');
  return b.outline();
}

export function paintLily(seed: number): PixelBuffer {
  const r = mulberry32(seed);
  const b = new PixelBuffer(10, 6);
  b.ellipse(0, 0, 10, 6, '#4f9a4a');
  b.set(5, 0, null);
  b.set(5, 1, null);
  if (r() < 0.5) {
    b.rect(3, 2, 2, 2, '#f6b8cf');
    b.set(4, 2, '#ffffff');
  }
  return b;
}

/** A koi seen from above (two frames for the tail). */
export function paintKoi(frame: number, color: string): PixelBuffer {
  const b = new PixelBuffer(14, 7);
  b.ellipse(3, 1, 9, 5, color);
  b.rect(5, 2, 3, 1, '#ffffff');
  b.set(11, 3, '#2b1d1e');
  const tail = frame ? [[1, 1], [2, 2], [1, 5], [2, 4]] : [[0, 2], [1, 3], [0, 4], [2, 3]];
  tail.forEach(([x, y]) => b.set(x, y, color));
  return b;
}

export function paintFlag(): PixelBuffer {
  const b = new PixelBuffer(14, 26);
  b.vline(3, 1, 25, '#5c3822');
  b.rect(4, 2, 9, 7, '#c9483f');
  b.rect(4, 9, 6, 2, '#c9483f');
  b.set(12, 9, '#c9483f');
  b.hline(5, 9, 4, '#f2c94c');
  b.hline(5, 8, 6, '#f2c94c');
  return b.outline();
}

export function paintPuff(size: number): PixelBuffer {
  const b = new PixelBuffer(size, size);
  b.ellipse(0, 0, size, size, '#f4efe2');
  b.ellipse(1, 1, size - 3, size - 3, '#ffffff');
  return b.outline('#b8ad98');
}

export function paintPetal(color: string): PixelBuffer {
  const b = new PixelBuffer(3, 2);
  b.rect(0, 0, 2, 1, color);
  b.set(1, 1, mix(color, '#ffffff', 0.3));
  b.set(2, 1, color);
  return b;
}

export function paintFirefly(): PixelBuffer {
  const b = new PixelBuffer(3, 3);
  b.set(1, 0, '#fff6a8');
  b.set(0, 1, '#fff6a8');
  b.set(1, 1, '#ffffff');
  b.set(2, 1, '#fff6a8');
  b.set(1, 2, '#fff6a8');
  return b;
}

/** A "+3" or "11" floating number shown when the ninja lands. */
export function paintPop(text: string, color = '#ffffff'): PixelBuffer {
  return labelBuffer(text, color, '#2b1d1e');
}

/** A gold star used for the celebration burst. */
export function paintStar(): PixelBuffer {
  const b = new PixelBuffer(9, 9);
  b.vline(4, 0, 8, P.gold);
  b.hline(0, 8, 4, P.gold);
  b.rect(3, 3, 3, 3, P.gold);
  b.rect(2, 2, 5, 5, P.gold);
  b.set(4, 4, '#fff1b8');
  b.set(2, 2, null);
  b.set(6, 2, null);
  b.set(2, 6, null);
  b.set(6, 6, null);
  return b.outline(P.gold2);
}
