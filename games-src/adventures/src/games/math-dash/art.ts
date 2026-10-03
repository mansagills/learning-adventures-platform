import { PixelBuffer, mix } from '../../kit/art/pixel';
import { P } from '../../kit/art/palette';
import { paintText, textWidth } from '../../kit/art/pixelFont';
import { hash2, mulberry32 } from '../../kit/core/rng';

/**
 * Library Rush art, painted in code in the same pixel style as the other
 * games: a warm wooden library, bookcases with signs, reading tables, books
 * with call numbers, and the power-up icons.
 */

export const SPINES = ['#c9483f', '#e0823a', '#e8bd3f', '#4f9a4a', '#2f9a94', '#4b7fcf', '#8a5cc4', '#dc6f9c', '#8a5a3a', '#3e5a88'];

/** Place-value colors (Reading Glasses): hundreds, tens, ones. Same as the blocks used in class. */
export const PV_COLORS = { h: '#d2453a', t: '#2f6fd1', o: '#2e8a3a' };

/** Scale a buffer up by a whole number (for big pixel lettering). */
export function scaleUp(src: PixelBuffer, k: number): PixelBuffer {
  const b = new PixelBuffer(src.w * k, src.h * k);
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const c = src.get(x, y);
    if (c) b.rect(x * k, y * k, k, k, c);
  }
  return b;
}

// ------------------------------------------------------------------ the room

export interface Rug {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  edge: string;
}

/** The floor: honey wooden planks, rugs, and a darker band along the walls. */
export function paintFloor(w: number, h: number, rugs: Rug[], seed = 7): HTMLCanvasElement {
  const W = w * 16;
  const H = h * 16;
  const b = new PixelBuffer(W, H);
  const r = mulberry32(seed);
  const tones = ['#c08a55', '#b67f4b', '#c99561', '#ba844f'];
  for (let y = 0; y < H; y++) {
    const row = Math.floor(y / 8);
    for (let x = 0; x < W; x++) {
      const plank = Math.floor((x + (row % 2) * 24) / 48);
      let c = tones[Math.floor(hash2(plank, row, seed) * tones.length)];
      if (y % 8 === 7) c = '#9c6b3e';
      else if ((x + (row % 2) * 24) % 48 === 0) c = '#a5733f';
      else if (r() < 0.04) c = mix(c, '#7a4f2c', 0.25);
      b.set(x, y, c);
    }
  }
  for (const g of rugs) {
    const x0 = g.x * 16;
    const y0 = g.y * 16;
    const ww = g.w * 16;
    const hh = g.h * 16;
    b.rect(x0, y0, ww, hh, g.edge);
    b.rect(x0 + 3, y0 + 3, ww - 6, hh - 6, g.color);
    for (let x = x0 + 6; x < x0 + ww - 6; x += 6) {
      b.set(x, y0 + 6, g.edge);
      b.set(x, y0 + hh - 7, g.edge);
    }
    for (let y = y0 + 6; y < y0 + hh - 6; y += 6) {
      b.set(x0 + 6, y, g.edge);
      b.set(x0 + ww - 7, y, g.edge);
    }
    // a diamond in the middle
    const cx = x0 + ww / 2;
    const cy = y0 + hh / 2;
    for (let d = 0; d < 10; d++) {
      b.set(cx - d, cy - 10 + d, g.edge);
      b.set(cx + d, cy - 10 + d, g.edge);
      b.set(cx - d, cy + 10 - d, g.edge);
      b.set(cx + d, cy + 10 - d, g.edge);
    }
    // fringe
    for (let x = x0 + 2; x < x0 + ww - 2; x += 3) {
      b.set(x, y0 - 1, P.paper);
      b.set(x, y0 + hh, P.paper);
    }
  }
  // the front edge: a low wooden wall along the bottom two rows
  for (let y = H - 32; y < H; y++) for (let x = 0; x < W; x++) b.set(x, y, y === H - 32 ? '#3a2516' : y < H - 28 ? '#6e4527' : (x >> 4) % 2 ? '#5a381f' : '#4f3019');
  // shadow line along the back wall
  for (let x = 0; x < W; x++) for (let y = 0; y < 4; y++) b.set(x, 3 * 16 + y, mix(b.get(x, 3 * 16 + y) ?? '#000', '#3a2516', 0.35 - y * 0.08));
  return b.toCanvas();
}

/** The back wall: wallpaper, tall windows with daylight, wall shelves and a clock. */
export function paintBackWall(wTiles: number): HTMLCanvasElement {
  const W = wTiles * 16;
  const H = 64;
  const b = new PixelBuffer(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let c = (x >> 3) % 2 ? '#e9dcc0' : '#efe3c9';
      if (y > 44) c = y === 45 ? '#6e4527' : (x >> 4) % 2 ? '#8a5a35' : '#7f522f';
      if (y === 44) c = '#5a381f';
      b.set(x, y, c);
    }
  for (let x = 0; x < W; x++) {
    b.set(x, 0, '#5a381f');
    b.set(x, 1, '#7f522f');
  }
  // windows every 8 tiles, wall shelves between
  for (let wx = 3 * 16; wx < W - 3 * 16; wx += 8 * 16) {
    const x0 = wx;
    b.rect(x0, 6, 28, 34, '#f4f1e8');
    b.rect(x0 + 2, 8, 24, 30, '#a8dcef');
    b.rect(x0 + 2, 26, 24, 12, '#bfe8f4');
    b.rect(x0 + 13, 8, 2, 30, '#f4f1e8');
    b.rect(x0 + 2, 21, 24, 2, '#f4f1e8');
    for (let i = 0; i < 6; i++) b.set(x0 + 4 + i, 10 + i, '#e6f7fc');
    b.rect(x0 - 2, 40, 32, 3, '#6e4527');
    const sx = x0 + 44;
    if (sx + 40 < W) {
      b.rect(sx, 10, 40, 30, '#6e4527');
      b.rect(sx + 2, 12, 36, 26, '#4a2d18');
      for (let row = 0; row < 2; row++) {
        let x = sx + 3;
        while (x < sx + 37) {
          const bw = 2 + Math.floor(hash2(x, row, 3) * 3);
          const bh = 9 + Math.floor(hash2(x, row, 9) * 3);
          b.rect(x, 12 + row * 13 + (12 - bh), bw, bh, SPINES[Math.floor(hash2(x, row, 5) * SPINES.length)]);
          x += bw + 1;
        }
        b.rect(sx + 2, 24 + row * 13, 36, 1, '#6e4527');
      }
    }
  }
  // a round clock in the middle
  const cx = Math.floor(W / 2);
  for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) {
    const d = Math.hypot(x, y);
    if (d <= 7.2) b.set(cx + x, 20 + y, d > 6 ? '#5a381f' : '#fdfbf5');
  }
  b.vline(cx, 15, 20, '#2b1d1e');
  b.hline(cx, cx + 4, 20, '#2b1d1e');
  return b.toCanvas();
}

/** A side wall strip (left or right edge), seen from above as a tall wooden border. */
export function paintSideWall(hTiles: number): HTMLCanvasElement {
  const b = new PixelBuffer(16, hTiles * 16);
  for (let y = 0; y < b.h; y++) for (let x = 0; x < 16; x++) b.set(x, y, x < 3 || x > 12 ? '#5a381f' : (y >> 3) % 2 ? '#7f522f' : '#8a5a35');
  return b.toCanvas();
}

// ------------------------------------------------------------------ furniture

/** A bookcase (4 tiles wide), filled with spines. `closed` shows a dust sheet for unused cases. */
export function paintBookcase(seed: number, closed = false): PixelBuffer {
  const b = new PixelBuffer(64, 46);
  b.rect(0, 2, 64, 44, P.woodDark);
  b.rect(1, 0, 62, 4, P.wood3);
  b.rect(0, 3, 64, 2, P.wood2);
  b.rect(3, 6, 58, 38, '#3e2614');
  for (let row = 0; row < 3; row++) {
    const top = 6 + row * 13;
    let x = 4;
    let i = 0;
    while (x < 60) {
      const bw = 2 + Math.floor(hash2(x, row + seed * 7, seed) * 3);
      const bh = 8 + Math.floor(hash2(x + 3, row, seed) * 4);
      if (hash2(x, row, seed + 2) < 0.08 && x < 56) {
        // a leaning book
        for (let k = 0; k < bh - 2; k++) b.rect(x + Math.floor(k / 3), top + 12 - k, 3, 1, SPINES[(i + seed) % SPINES.length]);
        x += 6;
      } else {
        const c = SPINES[Math.floor(hash2(x, row, seed + 1) * SPINES.length)];
        b.rect(x, top + 12 - bh, bw, bh, c);
        b.set(x, top + 12 - bh, mix(c, '#ffffff', 0.35));
        if (bh > 9) b.rect(x, top + 14 - bh, bw, 1, mix(c, '#f2c94c', 0.6));
        x += bw;
      }
      i++;
    }
    b.rect(3, top + 12, 58, 1, P.wood1);
  }
  b.rect(0, 44, 64, 2, '#3a2516');
  if (closed) {
    b.rect(2, 5, 60, 40, '#e9e1cf');
    for (let y = 8; y < 44; y += 6) b.hline(4, 60, y, '#d6ccb6');
  }
  return b.outline();
}

/**
 * The sign on a bookcase: big pixel numbers (2x the small font) on a cream
 * plate. `glow` is the hint state (a gold plate), `fresh` a just-relabelled flash.
 */
export function paintSign(text: string, opts: { glow?: boolean; fresh?: boolean } = {}): PixelBuffer {
  const tw = textWidth(text);
  const inner = new PixelBuffer(tw + 1, 6);
  paintText(inner, text, 0, 0, '#2b1d1e');
  const big = scaleUp(inner, 2);
  const w = Math.max(30, big.w + 10);
  const b = new PixelBuffer(w, 18);
  const plate = opts.glow ? '#ffe27a' : opts.fresh ? '#fff6d6' : '#f6ecd3';
  b.rect(0, 0, w, 18, '#5a381f');
  b.rect(2, 2, w - 4, 14, plate);
  b.hline(2, w - 3, 2, '#ffffff');
  for (let y = 0; y < big.h; y++) for (let x = 0; x < big.w; x++) {
    const c = big.get(x, y);
    if (c) b.set(Math.floor((w - big.w) / 2) + x, 4 + y, c);
  }
  // two little brass screws
  b.set(3, 4, '#c98c1f');
  b.set(w - 4, 4, '#c98c1f');
  return b.outline();
}

/** A reading table with four chairs (3 tiles wide). */
export function paintTable(): PixelBuffer {
  const b = new PixelBuffer(48, 34);
  const chair = (x: number, y: number) => {
    b.rect(x, y, 8, 3, P.wood2);
    b.rect(x, y + 3, 8, 6, P.wood1);
    b.rect(x + 1, y + 9, 1, 3, P.woodDark);
    b.rect(x + 6, y + 9, 1, 3, P.woodDark);
  };
  chair(8, 0);
  chair(32, 0);
  b.rect(2, 10, 44, 14, P.wood3);
  b.rect(2, 10, 44, 2, '#d39563');
  b.rect(2, 24, 44, 3, P.wood2);
  b.rect(4, 27, 2, 7, P.woodDark);
  b.rect(42, 27, 2, 7, P.woodDark);
  // an open book and a small lamp on the table
  b.rect(10, 15, 10, 6, '#fdfbf5');
  b.vline(15, 15, 20, '#d9cdb0');
  b.rect(32, 12, 6, 3, '#2f6b48');
  b.rect(34, 15, 2, 5, '#c98c1f');
  b.rect(31, 20, 8, 2, '#c98c1f');
  return b.outline();
}

/** The librarian's desk (5 tiles wide) with a bell, a stamp and a stack of returns. */
export function paintDesk(): PixelBuffer {
  const b = new PixelBuffer(80, 36);
  const o = 6;
  b.rect(0, 4 + o, 80, 26, P.wood2);
  b.rect(0, 2 + o, 80, 6, P.wood3);
  b.rect(0, 2 + o, 80, 1, '#d39563');
  for (let x = 6; x < 76; x += 14) b.rect(x, 12 + o, 10, 14, P.wood1);
  // a bell, then a stack of returned books
  b.rect(9, o - 1, 8, 3, '#f2c94c');
  b.rect(12, o - 3, 2, 2, '#c98c1f');
  for (let i = 0; i < 4; i++) b.rect(56 + (i % 2), o - i * 2, 14, 2, SPINES[i * 2]);
  return b.outline();
}

export function paintPlant(seed = 1): PixelBuffer {
  const b = new PixelBuffer(16, 26);
  const r = mulberry32(seed);
  b.rect(4, 18, 8, 8, '#b85d3a');
  b.rect(3, 17, 10, 2, '#d0744c');
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI;
    const len = 4 + r() * 8;
    const x = 8 + Math.cos(a) * len;
    const y = 17 - Math.sin(a) * len;
    b.rect(Math.round(x), Math.round(y), 2, 2, r() < 0.5 ? P.leaf2 : P.leaf1);
  }
  return b.outline();
}

export function paintFloorLamp(): PixelBuffer {
  const b = new PixelBuffer(14, 40);
  b.rect(2, 0, 10, 8, '#f2c94c');
  b.rect(1, 6, 12, 2, '#c98c1f');
  b.rect(6, 8, 2, 28, P.metal);
  b.rect(3, 36, 8, 3, P.metal);
  return b.outline();
}

export function paintGlobe(): PixelBuffer {
  const b = new PixelBuffer(16, 26);
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (Math.hypot(x, y) <= 6.3) b.set(8 + x, 8 + y, (x * 3 + y * 2) % 7 < 3 ? P.leaf2 : P.water1);
  b.rect(7, 15, 2, 6, P.wood2);
  b.rect(3, 21, 10, 4, P.wood1);
  return b.outline();
}

export function paintReturnCart(): PixelBuffer {
  const b = new PixelBuffer(32, 24);
  b.rect(0, 4, 32, 3, P.metal);
  b.rect(0, 14, 32, 3, P.metal);
  for (let i = 0; i < 9; i++) b.rect(2 + i * 3, 7 - (i % 2), 2, 7 + (i % 2), SPINES[i % SPINES.length]);
  b.rect(1, 4, 2, 15, P.metalLight);
  b.rect(29, 4, 2, 15, P.metalLight);
  b.rect(2, 19, 4, 4, '#2b2b33');
  b.rect(26, 19, 4, 4, '#2b2b33');
  return b.outline();
}

// ------------------------------------------------------------------ books

/**
 * A book lying on the floor with its call-number tag. With Reading Glasses
 * the digits are colored by place value (hundreds red, tens blue, ones green).
 */
export function paintFloorBook(n: number, color: string, glasses: boolean): PixelBuffer {
  const s = String(n);
  const tw = textWidth(s);
  const w = Math.max(14, tw + 6);
  const b = new PixelBuffer(w, 19);
  // the tag
  b.rect(Math.floor((w - tw - 4) / 2), 0, tw + 4, 9, '#fdfbf5');
  const x0 = Math.floor((w - tw) / 2);
  const cols = s.length === 3 ? [PV_COLORS.h, PV_COLORS.t, PV_COLORS.o] : s.length === 2 ? [PV_COLORS.t, PV_COLORS.o] : [PV_COLORS.o];
  [...s].forEach((ch, i) => {
    const one = new PixelBuffer(4, 6);
    paintText(one, ch, 0, 0, glasses ? cols[i] : '#2b1d1e');
    for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) if (one.get(x, y)) b.set(x0 + i * 4 + x, 2 + y, one.get(x, y)!);
  });
  b.vline(Math.floor(w / 2), 9, 10, '#8f8c89');
  // the book (a little 3/4 view)
  const bx = Math.floor((w - 12) / 2);
  b.rect(bx, 11, 12, 6, color);
  b.rect(bx, 17, 12, 2, '#fdfbf5');
  b.hline(bx, bx + 11, 11, mix(color, '#ffffff', 0.35));
  b.rect(bx + 2, 13, 5, 1, mix(color, '#f2c94c', 0.7));
  return b.outline();
}

/** The stack of books the player carries (drawn above the head), up to 8. */
export function paintStack(count: number): PixelBuffer {
  const n = Math.min(8, count);
  const b = new PixelBuffer(14, Math.max(1, n * 3 + 1));
  for (let i = 0; i < n; i++) {
    const y = b.h - 3 - i * 3;
    const off = i % 2 ? 1 : 0;
    b.rect(1 + off, y, 11, 3, SPINES[(i * 3) % SPINES.length]);
    b.hline(1 + off, 11 + off, y + 2, '#fdfbf5');
  }
  return n ? b.outline() : b;
}

/** A sitting reader's open book (held in front of a calmed student). */
export function paintOpenBook(color: string): PixelBuffer {
  const b = new PixelBuffer(10, 6);
  b.rect(0, 1, 10, 5, color);
  b.rect(1, 0, 4, 5, '#fdfbf5');
  b.rect(5, 0, 4, 5, '#f1ead8');
  return b.outline();
}

// ------------------------------------------------------------------ effects

export function paintPlane(): PixelBuffer {
  const b = new PixelBuffer(11, 7);
  for (let i = 0; i < 10; i++) b.hline(i, 10, Math.floor(i / 3), i % 2 ? '#fdfbf5' : '#e9e1cf');
  b.hline(0, 10, 3, '#d6ccb6');
  for (let i = 0; i < 6; i++) b.hline(4 + i, 10, 3 + Math.floor(i / 2), '#e9e1cf');
  return b.outline('#6b6560');
}

/** A soft ring drawn flat on the floor (the Shush Bell wave), as a canvas with alpha. */
export function ringCanvas(sizePx: number, color: string): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = sizePx;
  cv.height = sizePx;
  const ctx = cv.getContext('2d')!;
  const c = sizePx / 2;
  for (let y = 0; y < sizePx; y++)
    for (let x = 0; x < sizePx; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c) / c;
      if (d > 1) continue;
      const a = d > 0.88 ? 0.95 : d > 0.8 ? 0.45 : d > 0.7 ? 0.18 : 0;
      if (a === 0) continue;
      ctx.fillStyle = color;
      ctx.globalAlpha = a;
      ctx.fillRect(x, y, 1, 1);
    }
  return cv;
}

/** The Story Rug under the player: a round patterned rug, half transparent. */
export function rugAuraCanvas(sizePx: number): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = sizePx;
  cv.height = sizePx;
  const ctx = cv.getContext('2d')!;
  const c = sizePx / 2;
  for (let y = 0; y < sizePx; y++)
    for (let x = 0; x < sizePx; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c) / c;
      if (d > 1) continue;
      const band = Math.floor(d * 6);
      ctx.fillStyle = d > 0.92 ? '#f2c94c' : ['#8a5cc4', '#dc6f9c', '#8a5cc4', '#e8bd3f', '#8a5cc4', '#dc6f9c'][band];
      ctx.globalAlpha = d > 0.92 ? 0.7 : 0.32;
      ctx.fillRect(x, y, 1, 1);
    }
  return cv;
}

// ------------------------------------------------------------------ power-up icons

export type PowerId = 'bell' | 'notes' | 'rug' | 'magnet' | 'cart' | 'sneakers' | 'glasses' | 'cocoa' | 'card';

/** 16x16 icons for the power-up cards and the HUD. */
export function paintPowerIcon(id: PowerId | 'snack'): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  switch (id) {
    case 'bell':
      b.rect(5, 3, 6, 2, '#f2c94c');
      b.rect(4, 5, 8, 5, '#f2c94c');
      b.rect(3, 10, 10, 2, '#e3a92a');
      b.rect(7, 1, 2, 2, '#c98c1f');
      b.rect(7, 12, 2, 2, '#c98c1f');
      b.vline(5, 5, 9, '#fff1b8');
      b.set(1, 5, '#fdfbf5');
      b.set(0, 7, '#fdfbf5');
      b.set(14, 5, '#fdfbf5');
      b.set(15, 7, '#fdfbf5');
      break;
    case 'notes':
      for (let i = 0; i < 12; i++) b.hline(2 + i, 14, 4 + Math.floor(i / 3), i % 2 ? '#fdfbf5' : '#e9e1cf');
      b.hline(2, 14, 8, '#d6ccb6');
      for (let i = 0; i < 6; i++) b.hline(7 + i, 14, 8 + Math.floor(i / 2), '#e9e1cf');
      b.set(1, 12, '#6ea5e6');
      b.set(3, 13, '#6ea5e6');
      break;
    case 'rug':
      for (let y = -6; y <= 6; y++) for (let x = -7; x <= 7; x++) {
        const d = Math.hypot(x / 7, y / 6);
        if (d <= 1) b.set(8 + x, 8 + y, d > 0.8 ? '#f2c94c' : d > 0.5 ? '#8a5cc4' : d > 0.25 ? '#dc6f9c' : '#8a5cc4');
      }
      break;
    case 'magnet':
      b.rect(3, 2, 4, 9, '#d2453a');
      b.rect(9, 2, 4, 9, '#d2453a');
      b.rect(3, 9, 10, 4, '#d2453a');
      b.rect(5, 2, 6, 7, null);
      b.rect(3, 1, 4, 2, '#c7ccd2');
      b.rect(9, 1, 4, 2, '#c7ccd2');
      b.rect(5, 11, 6, 1, '#a3322a');
      break;
    case 'cart':
      b.rect(2, 4, 12, 2, P.metal);
      b.rect(2, 10, 12, 2, P.metal);
      for (let i = 0; i < 5; i++) b.rect(3 + i * 2, 6 - (i % 2), 2, 4 + (i % 2), SPINES[i * 2]);
      b.rect(2, 4, 1, 9, P.metalLight);
      b.rect(13, 4, 1, 9, P.metalLight);
      b.rect(3, 13, 3, 2, '#2b2b33');
      b.rect(10, 13, 3, 2, '#2b2b33');
      break;
    case 'sneakers':
      b.rect(2, 7, 9, 5, '#4b7fcf');
      b.rect(8, 9, 6, 3, '#4b7fcf');
      b.rect(2, 12, 12, 2, '#fdfbf5');
      b.hline(4, 8, 8, '#fdfbf5');
      b.hline(4, 8, 10, '#fdfbf5');
      b.hline(0, 1, 9, '#f2c94c');
      b.hline(0, 1, 11, '#f2c94c');
      break;
    case 'glasses':
      for (const cx of [4, 11]) for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
        const d = Math.hypot(x, y);
        if (d <= 3.3) b.set(cx + x, 8 + y, d > 2.3 ? '#2b1d1e' : '#bfe6ee');
      }
      b.hline(7, 8, 7, '#2b1d1e');
      b.set(3, 7, '#d2453a');
      b.set(10, 7, '#2f6fd1');
      b.set(12, 9, '#2e8a3a');
      break;
    case 'cocoa':
      b.rect(3, 6, 8, 8, '#e0823a');
      b.rect(11, 8, 3, 1, '#e0823a');
      b.rect(13, 8, 1, 4, '#e0823a');
      b.rect(11, 11, 3, 1, '#e0823a');
      b.rect(4, 6, 6, 2, '#6b3f22');
      b.set(5, 3, '#fdfbf5');
      b.set(6, 2, '#fdfbf5');
      b.set(8, 4, '#fdfbf5');
      b.set(9, 3, '#fdfbf5');
      break;
    case 'card':
      b.rect(1, 3, 14, 10, '#2f9a94');
      b.rect(2, 5, 4, 5, '#f6ecd3');
      b.hline(8, 13, 5, '#fdfbf5');
      b.hline(8, 12, 7, '#fdfbf5');
      b.hline(8, 13, 9, '#fdfbf5');
      b.rect(1, 11, 14, 2, '#237872');
      break;
    case 'snack':
      for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (Math.hypot(x, y) <= 5.3) b.set(8 + x, 8 + y, '#c98c4a');
      b.set(6, 6, '#4a2a1a');
      b.set(10, 7, '#4a2a1a');
      b.set(7, 10, '#4a2a1a');
      break;
  }
  return b.outline();
}
