import { PixelBuffer, mix } from '../../kit/art/pixel';
import { P } from '../../kit/art/palette';
import { paintText } from '../../kit/art/pixelFont';
import { hash2, mulberry32 } from '../../kit/core/rng';
import type { Expression } from '../../kit/art/portraits';
import { COL_LETTERS, GRID, type Zone } from './problems';

/**
 * Math Adventure Island's art, painted in code in the Seeds of Genius pixel
 * style: the island and the sea, the four zones, the treasure beach grid, the
 * quiz show stage with its torches, and Pip the parrot.
 */

export interface IslandLayout {
  w: number;
  h: number;
  /** The treasure grid's top-left tile (row 1 is the bottom row). */
  grid: { x: number; y: number };
  /** Sandy paths from the middle to each place, as tile points. */
  paths: Array<[number, number, number, number]>;
}

/** Is a tile on dry land? The island is a rounded blob with a bay at the east dock. */
export function isLand(x: number, y: number, w: number, h: number): boolean {
  const cx = w / 2;
  const cy = h / 2 + 1;
  const dx = (x + 0.5 - cx) / (w / 2 - 2.6);
  const dy = (y + 0.5 - cy) / (h / 2 - 2.8);
  const wobble = Math.sin(x * 0.7) * 0.03 + Math.cos(y * 0.9) * 0.03;
  return dx * dx + dy * dy < 1 + wobble;
}

/** Ground: sea, surf, sand, grass, sandy paths and the labelled treasure grid. */
export function paintIsland(L: IslandLayout, seed = 31): HTMLCanvasElement {
  const W = L.w * 16;
  const H = L.h * 16;
  const b = new PixelBuffer(W, H);
  const r = mulberry32(seed);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const tx = x / 16;
      const ty = y / 16;
      const land = isLand(Math.floor(tx), Math.floor(ty), L.w, L.h);
      const v = r();
      if (!land) {
        // the sea, darker further out, with small wave dashes
        const near = isLand(Math.floor(tx + 1), Math.floor(ty), L.w, L.h) || isLand(Math.floor(tx - 1), Math.floor(ty), L.w, L.h) || isLand(Math.floor(tx), Math.floor(ty + 1), L.w, L.h) || isLand(Math.floor(tx), Math.floor(ty - 1), L.w, L.h);
        b.set(x, y, near ? (v < 0.2 ? '#9ad1e8' : P.water2) : v < 0.04 ? P.water2 : P.water1);
        continue;
      }
      // sand at the edge of the island, grass inside
      let edge = false;
      for (const [ox, oy] of [
        [1.4, 0],
        [-1.4, 0],
        [0, 1.4],
        [0, -1.4],
      ])
        if (!isLand(Math.floor(tx + ox), Math.floor(ty + oy), L.w, L.h)) edge = true;
      if (edge) b.set(x, y, v < 0.1 ? '#e8cf96' : '#f0dca8');
      else b.set(x, y, v < 0.12 ? P.grass2 : v < 0.2 ? P.grass3 : P.grass1);
    }
  // wave dashes
  for (let i = 0; i < (W * H) / 900; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * H);
    if (!isLand(Math.floor(x / 16), Math.floor(y / 16), L.w, L.h)) b.hline(x, x + 3, y, '#cfeefa');
  }
  // sandy paths
  for (const [x0, y0, x1, y1] of L.paths) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 16;
    for (let t = 0; t <= n; t++) {
      const px = (x0 + ((x1 - x0) * t) / n) * 16;
      const py = (y0 + ((y1 - y0) * t) / n) * 16;
      for (let k = -9; k <= 9; k++)
        for (let j = -9; j <= 9; j++)
          if (k * k + j * j < 80) {
            const xx = Math.round(px + k);
            const yy = Math.round(py + j);
            if (xx >= 0 && yy >= 0 && xx < W && yy < H && isLand(Math.floor(xx / 16), Math.floor(yy / 16), L.w, L.h)) b.set(xx, yy, hash2(xx, yy, 3) < 0.12 ? '#e3c88f' : '#ecd6a2');
          }
    }
  }
  // the treasure grid: sand squares with lines, letters under the columns, numbers beside the rows
  const gx = L.grid.x * 16;
  const gy = L.grid.y * 16;
  b.rect(gx - 20, gy - 6, GRID.cols * 16 + 26, GRID.rows * 16 + 26, '#f3e2b4');
  for (let c = 0; c <= GRID.cols; c++) b.vline(gx + c * 16, gy, gy + GRID.rows * 16, '#c9a86a');
  for (let rr = 0; rr <= GRID.rows; rr++) b.hline(gx, gx + GRID.cols * 16, gy + rr * 16, '#c9a86a');
  for (let c = 0; c < GRID.cols; c++) {
    const t = COL_LETTERS[c];
    paintLetter(b, t, gx + c * 16 + 6, gy + GRID.rows * 16 + 6, '#7a4c2c');
    // the column number too, for the (across, up) clues
    paintText(b, String(c + 1), gx + c * 16 + 6, gy + GRID.rows * 16 + 13, '#b08452');
  }
  for (let rr = 0; rr < GRID.rows; rr++) paintText(b, String(rr + 1), gx - 12, gy + (GRID.rows - 1 - rr) * 16 + 5, '#7a4c2c');
  // flowers in the grass
  const fl = ['#ef8fb1', '#f2c94c', '#ffffff', '#e8832e'];
  for (let i = 0; i < (W * H) / 260; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * H);
    if (b.get(x, y) === P.grass1) b.set(x, y, fl[Math.floor(r() * fl.length)]);
  }
  return b.toCanvas();
}

// a tiny 3x5 alphabet for the grid letters (the kit font only has digits)
const LETTERS: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
};
export function paintLetter(b: PixelBuffer, ch: string, x: number, y: number, color: string): void {
  const g = LETTERS[ch];
  if (!g) return;
  for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) if (g[row][col] === '#') b.set(x + col, y + row, color);
}

/** The sea and sky behind the island. */
export function paintHorizon(widthPx: number, heightPx: number, night: number): HTMLCanvasElement {
  const b = new PixelBuffer(widthPx, heightPx);
  const r = mulberry32(9);
  const top = mix('#6fc3ec', '#141a3a', night);
  const low = mix('#d6f2fb', '#3a3566', night);
  for (let y = 0; y < heightPx - 22; y++) b.hline(0, widthPx - 1, y, mix(top, low, Math.floor((y / heightPx) * 6) / 6));
  for (let y = heightPx - 22; y < heightPx; y++) b.hline(0, widthPx - 1, y, mix('#3f8fc6', '#1d2a50', night));
  if (night > 0.5) for (let i = 0; i < widthPx / 6; i++) b.set(Math.floor(r() * widthPx), Math.floor(r() * (heightPx - 30)), '#fff6cf');
  else
    for (let i = 0; i < 5; i++) {
      const x = Math.floor(r() * widthPx);
      const y = 8 + Math.floor(r() * 30);
      b.ellipse(x, y, 28, 7, '#ffffff');
      b.ellipse(x + 7, y - 3, 16, 7, '#ffffff');
    }
  // distant islands and a sailing ship
  for (let x = 0; x < widthPx; x++) {
    const hh = Math.max(0, Math.round(Math.sin(x / 23) * 6 + Math.sin(x / 7) * 2) - 2);
    if (Math.floor(x / 90) % 3 === 1) b.vline(x, heightPx - 22 - hh, heightPx - 22, mix('#5f9a66', '#1f2d3a', night));
  }
  const sx = Math.floor(widthPx * 0.7);
  b.rect(sx, heightPx - 27, 16, 4, '#84502f');
  b.vline(sx + 8, heightPx - 42, heightPx - 27, '#5c3822');
  for (let k = 0; k < 12; k++) b.hline(sx + 9, sx + 9 + Math.floor(k * 0.6), heightPx - 41 + k, '#f4f1e8');
  return b.toCanvas();
}

export function paintPalm(seed: number, coconuts = false): PixelBuffer {
  const b = new PixelBuffer(36, 52);
  for (let y = 18; y < 52; y++) b.rect(16 + Math.round(Math.sin(y / 10 + seed) * 2), y, 4, 1, y % 4 ? '#a5754a' : '#8a5f3a');
  for (let a = 0; a < 7; a++) {
    const ang = (a / 7) * Math.PI * 2 + seed;
    for (let t = 0; t < 15; t++) b.rect(Math.round(18 + Math.cos(ang) * t), Math.round(16 + Math.sin(ang) * t * 0.55 + (t * t) / 28), 2, 2, t % 3 ? P.leaf2 : P.leaf1);
  }
  if (coconuts) for (const [x, y] of [
    [15, 17],
    [19, 18],
    [17, 20],
  ])
    b.ellipse(x, y, 4, 4, '#6b4a2a');
  return b.outline();
}

/** Each zone's building or landmark. */
export function paintZone(zone: Zone, lit: boolean): PixelBuffer {
  if (zone === 'add') {
    // a shell hut
    const b = new PixelBuffer(64, 52);
    b.rect(8, 22, 48, 30, '#e3c88f');
    for (let y = 24; y < 52; y += 5) b.hline(8, 55, y, '#cdb07a');
    for (let k = 0; k < 18; k++) b.hline(4 + k, 59 - k, 22 - k, k % 3 ? '#c9a24a' : '#b88a32');
    b.rect(26, 34, 12, 18, '#7a4c2c');
    for (const [x, y, c] of [
      [12, 44, '#ef8fb1'],
      [46, 44, '#f4f1e8'],
      [50, 40, '#e8832e'],
      [16, 40, '#f2c94c'],
    ] as Array<[number, number, string]>) {
      b.ellipse(x - 3, y - 2, 7, 5, c);
      b.hline(x - 2, x + 2, y, mix(c, '#000000', 0.2));
    }
    if (lit) b.rect(30, 24, 4, 4, '#ffe08a');
    return b.outline();
  }
  if (zone === 'sub') {
    // a fishing boat by the dock
    const b = new PixelBuffer(64, 44);
    for (let k = 0; k < 12; k++) b.hline(4 + k, 59 - k, 28 + k, k < 3 ? '#f4f1e8' : '#3f7fd6');
    b.vline(30, 2, 28, '#5c3822');
    for (let k = 0; k < 20; k++) b.hline(31, 31 + Math.floor(k * 0.9), 4 + k, '#f4f1e8');
    b.rect(12, 22, 10, 6, '#c98c4a');
    for (let i = 0; i < 3; i++) b.ellipse(13 + i * 3, 20, 5, 3, '#9aa3ab');
    if (lit) b.rect(29, 0, 3, 3, '#ffe08a');
    return b.outline();
  }
  if (zone === 'mul') {
    // a sign for the grove, with coconuts in rows
    const b = new PixelBuffer(48, 36);
    b.rect(4, 4, 40, 22, P.wood2);
    b.rect(6, 6, 36, 18, P.wood1);
    for (let rr = 0; rr < 2; rr++) for (let c = 0; c < 4; c++) b.ellipse(10 + c * 8, 9 + rr * 7, 5, 5, '#6b4a2a');
    b.rect(10, 26, 3, 10, P.wood2);
    b.rect(35, 26, 3, 10, P.wood2);
    if (lit) b.rect(22, 0, 4, 4, '#ffe08a');
    return b.outline();
  }
  // a mango market stall
  const b = new PixelBuffer(64, 52);
  for (let x = 2; x < 62; x++) b.vline(x, 6, 16, Math.floor((x - 2) / 7) % 2 ? '#f4f1e8' : '#e8832e');
  b.rect(6, 16, 3, 28, P.wood2);
  b.rect(55, 16, 3, 28, P.wood2);
  b.rect(2, 34, 60, 18, P.wood1);
  b.rect(2, 34, 60, 3, P.wood3);
  for (let i = 0; i < 9; i++) b.ellipse(8 + (i % 5) * 10 + (i > 4 ? 5 : 0), 27 + (i > 4 ? -5 : 0), 7, 6, i % 3 ? '#f2a83a' : '#e8832e');
  if (lit) b.rect(30, 2, 4, 4, '#ffe08a');
  return b.outline();
}

/** The quiz show stage: curtains, a light-bulb marquee and the question board (curtains shut until it opens). */
export function paintStage(open: boolean): PixelBuffer {
  const W = 96;
  const H = 72;
  const b = new PixelBuffer(W, H);
  // the platform, with a purple skirt and two steps
  b.rect(2, 46, 92, 6, P.wood3);
  b.rect(2, 52, 92, 20, '#4a3a8a');
  for (let x = 4; x < 92; x += 6) b.rect(x, 53, 3, 19, '#5a46a8');
  b.rect(36, 62, 24, 5, P.wood2);
  b.rect(32, 67, 32, 5, P.wood1);
  // back wall
  b.rect(8, 10, 80, 36, '#2e2260');
  // the question board: 4 columns, 3 rows
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 3; r++) {
      b.rect(24 + c * 12, 18 + r * 8, 10, 6, open ? '#5a46a8' : '#3b2d6b');
      if (open) b.rect(27 + c * 12, 20 + r * 8, 4, 2, '#ffe08a');
    }
  // curtains: drawn open at the sides, or shut across the board
  const curtain = (x0: number, x1: number) => {
    b.rect(x0, 10, x1 - x0, 36, '#b8302a');
    for (let x = x0 + 2; x < x1; x += 4) b.vline(x, 10, 45, '#d2453a');
    for (let x = x0 + 4; x < x1; x += 8) b.vline(x, 12, 45, '#8a221e');
  };
  if (open) {
    curtain(8, 20);
    curtain(76, 88);
    b.rect(8, 30, 12, 2, '#c9a227');
    b.rect(76, 30, 12, 2, '#c9a227');
  } else {
    curtain(8, 88);
    b.vline(48, 12, 45, '#5c1512');
  }
  // the marquee with light bulbs and a big question mark
  b.rect(10, 0, 76, 11, '#c9a227');
  b.rect(12, 2, 72, 7, '#7a2a6a');
  for (let x = 14; x < 84; x += 5) b.rect(x, 4, 2, 2, open ? '#ffe08a' : '#6a5a52');
  b.rect(44, 1, 8, 9, '#c9a227');
  b.rect(46, 2, 4, 1, open ? '#ffffff' : '#9b8c78');
  b.rect(49, 3, 1, 2, open ? '#ffffff' : '#9b8c78');
  b.rect(47, 5, 2, 1, open ? '#ffffff' : '#9b8c78');
  b.rect(47, 7, 2, 1, open ? '#ffffff' : '#9b8c78');
  return b.outline();
}

/** A tiki torch: bamboo pole and a bowl, burning once its zone is done. */
export function paintTorch(lit: boolean): PixelBuffer {
  const b = new PixelBuffer(12, 36);
  b.rect(5, 12, 3, 24, '#c9a24a');
  for (let y = 16; y < 36; y += 6) b.hline(5, 7, y, '#8a6a2a');
  b.rect(2, 9, 9, 4, '#5c3822');
  b.rect(3, 13, 7, 1, '#3a2418');
  if (lit) {
    b.ellipse(2, 0, 9, 11, '#ff8a3a');
    b.ellipse(4, 3, 5, 7, '#ffe08a');
  } else b.rect(3, 8, 7, 1, '#2b1d1e');
  return b.outline();
}

/** Pip the parrot (two wing frames). */
export function paintPip(frame: number): PixelBuffer {
  const b = new PixelBuffer(16, 18);
  b.ellipse(4, 4, 9, 12, '#d2453a');
  b.ellipse(5, 1, 7, 7, '#d2453a');
  b.rect(11, 4, 3, 2, '#f2c94c');
  b.set(13, 6, '#f2c94c');
  b.set(8, 3, '#2b1d1e');
  b.rect(4, frame ? 6 : 9, 5, 4, '#3f7fd6');
  b.rect(3, frame ? 9 : 12, 3, 2, '#5fbf4a');
  b.rect(6, 15, 1, 3, '#f2c94c');
  b.rect(9, 15, 1, 3, '#f2c94c');
  return b.outline();
}

export function paintPerch(): PixelBuffer {
  const b = new PixelBuffer(16, 30);
  b.rect(7, 4, 2, 26, '#84502f');
  b.rect(2, 4, 12, 2, '#84502f');
  b.rect(5, 28, 6, 2, '#5c3822');
  return b.outline();
}

/** An X on the sand for a dig spot, or a dug hole. */
export function paintDigMark(dug: boolean): PixelBuffer {
  const b = new PixelBuffer(16, 10);
  if (dug) {
    b.ellipse(1, 2, 14, 8, '#8a6a3a');
    b.ellipse(3, 3, 10, 5, '#5c4424');
  } else
    for (let k = 0; k < 8; k++) {
      b.rect(4 + k, 1 + k, 2, 1, '#d2453a');
      b.rect(11 - k, 1 + k, 2, 1, '#d2453a');
    }
  return b;
}

export function paintChest(open: boolean): PixelBuffer {
  const b = new PixelBuffer(28, 22);
  b.rect(2, 9, 24, 13, '#84502f');
  b.rect(2, 9, 24, 2, '#a0643c');
  b.rect(2, 14, 24, 2, '#c9a227');
  if (open) {
    b.rect(2, 2, 24, 7, '#5c3822');
    for (let i = 0; i < 7; i++) b.ellipse(4 + i * 3, 6, 4, 4, i % 2 ? '#f2c94c' : '#ffe08a');
  } else {
    b.ellipse(2, 3, 24, 12, '#a0643c');
    b.rect(12, 12, 4, 5, '#c9a227');
  }
  return b.outline();
}

/** One piece of the treasure map (index 0-3: which corner). */
export function paintMapPiece(i: number, have = true): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  const c = have ? '#f1e3c6' : '#9b8c78';
  b.rect(1, 1, 14, 14, c);
  for (let k = 0; k < 14; k += 3) b.set(1 + k, i % 2 ? 1 : 14, mix(c, '#000000', 0.15));
  if (have) {
    b.rect(3, 3, 6, 1, '#c9a86a');
    b.rect(5, 6, 1, 5, '#c9a86a');
    if (i === 3) {
      b.rect(9, 9, 4, 1, '#d2453a');
      b.rect(10, 8, 1, 3, '#d2453a');
    }
  }
  return b.outline();
}

/** A tiny pixel trophy for the finale. */
export function paintTrophy(): PixelBuffer {
  const b = new PixelBuffer(20, 22);
  b.rect(4, 0, 12, 10, '#f2c94c');
  b.ellipse(4, 4, 12, 10, '#f2c94c');
  b.rect(0, 2, 4, 2, '#f2c94c');
  b.rect(16, 2, 4, 2, '#f2c94c');
  b.rect(8, 12, 4, 5, '#f2c94c');
  b.rect(4, 17, 12, 4, '#84502f');
  b.rect(7, 3, 2, 5, '#fff1b3');
  return b.outline();
}

/** Pip's portrait for the talk box (48x48). */
export function paintPipPortrait(expression: Expression): PixelBuffer {
  const b = new PixelBuffer(48, 48);
  // crest feathers
  b.rect(16, 0, 4, 8, '#f2c94c');
  b.rect(21, expression === 'curious' ? 0 : 2, 4, 7, '#e8832e');
  // head and body
  b.ellipse(6, 4, 32, 30, '#d2453a');
  b.ellipse(4, 26, 34, 24, '#d2453a');
  b.ellipse(8, 30, 18, 18, '#3f7fd6');
  b.ellipse(6, 40, 12, 8, '#5fbf4a');
  b.ellipse(16, 8, 12, 8, '#e05d50');
  // beak
  b.ellipse(32, 12, 14, 12, '#f2c94c');
  b.rect(38, 20, 6, 4, '#c9a227');
  b.hline(33, 44, 18, '#c9a227');
  // eye patch and eye
  b.ellipse(18, 10, 12, 12, '#fdfbf5');
  const happy = expression === 'smile' || expression === 'proud';
  if (happy) for (let x = 20; x < 28; x++) b.set(x, 16 - Math.round(Math.sin(((x - 20) / 7) * Math.PI) * 2), P.outline);
  else {
    b.ellipse(21, 12, 6, 7, P.outline);
    b.rect(22, 13, 2, 2, '#ffffff');
    if (expression === 'thinking') b.hline(17, 29, 9, '#a2362f');
  }
  return b.outline();
}
