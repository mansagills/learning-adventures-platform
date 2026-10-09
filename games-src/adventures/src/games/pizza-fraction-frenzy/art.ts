import type { PixelBuffer } from '../../kit/art/pixel';
import { ANC } from '../../kit/worlds/ancient-kingdoms/art';
import { Paint, mixHex, ramp, type Ramp } from '../../kit/worlds/shade';
import type { Loaf, Road } from './problems';

/**
 * Forum Fraction Feast art, painted in code in the Ancient Kingdoms 16-bit
 * style (5-shade ramps lit from the top left, soft seams, no black outlines).
 * World props are designed on a 16-per-tile grid and scaled by u = T / 16;
 * the panel pictures (loaves, the milestone road) are painted at a fixed size
 * and shown at a whole-number scale.
 */

const C = {
  crust: ramp('#c98a46'),
  crumb: ramp('#f0d29a'),
  glaze: ramp('#e8b04a', { spread: 0.9 }),
  plate: ramp('#dfe6ea', { spread: 0.7 }),
  rim: ramp('#5f86a8'),
  board: ramp('#9a6a3e'),
  brick: ramp('#b8583a'),
  plaster: ramp('#e6d4b0'),
  ember: ramp('#ff8a2a'),
  stone: ramp('#d8ccb2'),
  basalt: ramp('#626875'),
  curb: ramp('#e6d9bd'),
  stake: ramp('#9a6a3e'),
  flag: ramp('#c9483f'),
  goose: ramp('#f4f0e6', { spread: 0.8 }),
  beak: ramp('#f08a2a'),
  ink: ramp('#3a2a24'),
  grass: ramp('#86ad52'),
  sky: ramp('#9fd0e6'),
  bronze: ramp('#b07a3a'),
  gold: ramp('#f2c94c'),
} as const;

const U = (T: number) => T / 16;

// ------------------------------------------------------------------ world props

/** A domed bread oven like the ones at Pompeii: a brick dome on a plastered base, embers in the mouth. */
export function paintOven(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(40 * u), Math.round(36 * u));
  // base
  p.rect(S(2), S(20), S(36), S(15), C.plaster, { form: 'cylV', box: [S(2), S(20), S(36), S(15)], sep: true });
  p.rect(S(2), S(19), S(36), S(2), C.plaster, { level: 3 });
  // dome
  p.ellipse(S(20), S(20), S(15), S(13), C.brick, { sep: true, box: [S(5), S(7), S(30), S(26)] });
  p.relevel((x, y, _l, r) => r === C.brick && (Math.floor(y / S(3)) + Math.floor((x + (Math.floor(y / S(3)) % 2) * S(2)) / S(4))) % 7 === 0, -1);
  p.rect(S(4), S(19), S(32), S(1.5), C.brick, { level: 1 });
  // the mouth: an arch with embers
  p.shape((x, y) => (y > S(16) && Math.abs(x - S(20)) < S(6)) || (x - S(20)) ** 2 + (y - S(16)) ** 2 < S(6) ** 2, [S(14), S(10), S(12), S(10)], ramp('#3a2622'), { form: 'flat', level: 1 });
  const glow = [0, 1, 2][frame % 3];
  p.ellipse(S(20), S(18.5), S(4.6), S(1.6), C.ember, { form: 'flat', level: 2 + (glow === 1 ? 1 : 0) });
  p.dot(S(17 + glow), S(17), C.ember, 4);
  p.dot(S(22 - glow), S(17.4), C.ember, 3);
  // a wooden peel (the long bread paddle) leaning on the base
  p.capsule(S(35), S(6), S(31), S(30), S(0.9), C.board, {});
  p.ellipse(S(30.6), S(31.5), S(2.4), S(3.2), C.board, { sep: true });
  return p.toBuffer();
}

/** A Roman milestone: a stone column on a square base, with its number carved in. */
export function paintMilestone(T: number, n: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(26 * u));
  p.rect(S(1), S(21), S(12), S(5), C.stone, { form: 'cylV', box: [S(1), S(21), S(12), S(5)], sep: true });
  p.rect(S(2.5), S(4), S(9), S(17.5), C.stone, { form: 'cylV', box: [S(2.5), 0, S(9), S(26)], sep: true });
  p.ellipse(S(7), S(4), S(4.5), S(2), C.stone, { form: 'flat', level: 4 });
  // the number in Roman numerals (I, II) or a ring for the start (0)
  const ink = ramp('#7a6a58');
  if (n === 0) {
    // the Golden Milestone was covered in gilded bronze
    p.rect(S(2.5), S(4), S(9), S(17.5), C.gold, { form: 'cylV', box: [S(2.5), 0, S(9), S(26)], sep: true });
    p.ellipse(S(7), S(4), S(4.5), S(2), C.gold, { form: 'flat', level: 4 });
  } else
    for (let i = 0; i < n; i++) {
      const x = S(7 + (i - (n - 1) / 2) * 2.4);
      p.rect(x - S(0.6), S(9), S(1.2), S(6), ink, { level: 1 });
    }
  return p.toBuffer();
}

/** A surveyor's groma: a staff with a turning cross on top and four plumb lines. */
export function paintGroma(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(18 * u), Math.round(40 * u));
  p.capsule(S(9), S(6), S(9), S(39), S(0.8), C.board, {});
  p.rect(S(1), S(5), S(16), S(1.2), C.board, { level: 2 });
  for (const x of [1.4, 16.4]) {
    p.line(S(x), S(6), S(x), S(15), C.ink, 3);
    p.ellipse(S(x), S(16), S(0.9), S(1.3), C.bronze, {});
  }
  p.ellipse(S(9), S(5.4), S(1.4), S(1.4), C.bronze, {});
  return p.toBuffer();
}

/** Anser the goose, side view facing right. Frames: 0 standing, 1 and 2 waddling, 3 honking (beak open, wings up). */
export function paintGoose(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(16 * u));
  const step = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  const bob = frame === 1 || frame === 2 ? -0.5 : 0;
  // feet
  for (const [fx, lift] of [
    [6 + step, frame === 1 ? 0.6 : 0],
    [9 - step, frame === 2 ? 0.6 : 0],
  ]) {
    p.capsule(S(fx), S(12), S(fx), S(14.4 - lift), S(0.5), C.beak, { form: 'flat', level: 2 });
    p.rect(S(fx - 0.6), S(14.4 - lift), S(2.4), S(1), C.beak, { level: 1 });
  }
  // body and tail
  p.ellipse(S(7), S(10 + bob), S(5.2), S(3.4), C.goose, { sep: true });
  p.poly(
    [
      [S(2), S(8.6 + bob)],
      [S(0.4), S(7.2 + bob)],
      [S(3), S(10 + bob)],
    ],
    C.goose,
    { form: 'flat', level: 2 },
  );
  // wing
  if (frame === 3)
    p.poly(
      [
        [S(4), S(9)],
        [S(8), S(3.4)],
        [S(9.6), S(9)],
      ],
      C.goose,
      { form: 'flat', level: 3, sep: true },
    );
  else p.ellipse(S(6.4), S(9.6 + bob), S(3.4), S(1.9), C.goose, { form: 'flat', level: 1 });
  // neck and head
  p.capsule(S(10.6), S(9 + bob), S(11.6), S(3.4 + bob), S(1.3), C.goose, {});
  p.ellipse(S(12), S(3.2 + bob), S(1.9), S(1.7), C.goose, { sep: true });
  // beak (open when honking)
  if (frame === 3) {
    p.poly(
      [
        [S(13.4), S(2.4)],
        [S(15.8), S(1.6)],
        [S(13.8), S(3.2)],
      ],
      C.beak,
      { form: 'flat', level: 3 },
    );
    p.poly(
      [
        [S(13.4), S(3.8)],
        [S(15.6), S(4.8)],
        [S(13.6), S(4.4)],
      ],
      C.beak,
      { form: 'flat', level: 1 },
    );
  } else
    p.poly(
      [
        [S(13.4), S(2.6 + bob)],
        [S(15.8), S(3.4 + bob)],
        [S(13.4), S(4.2 + bob)],
      ],
      C.beak,
      { form: 'flat', level: 2 },
    );
  p.pix(S(12.4), S(2.6 + bob), '#2a1a1c');
  return p.toBuffer();
}

/** Anser's 72x72 portrait for the talk box. */
export function paintGoosePortrait(honk = false): PixelBuffer {
  const p = new Paint(72, 72);
  const sky = ramp('#e9dcc0');
  p.rect(0, 0, 72, 72, sky, { level: 2 });
  p.ellipse(30, 70, 30, 18, C.goose, { sep: true });
  p.capsule(38, 66, 40, 30, 8, C.goose, {});
  p.ellipse(40, 26, 13, 12, C.goose, { sep: true });
  if (honk) {
    p.poly(
      [
        [49, 22],
        [68, 15],
        [52, 27],
      ],
      C.beak,
      { form: 'flat', level: 3 },
    );
    p.poly(
      [
        [49, 30],
        [66, 36],
        [51, 33],
      ],
      C.beak,
      { form: 'flat', level: 1 },
    );
    p.ellipse(53, 28, 2.5, 2, ramp('#8a3a3a'), { form: 'flat', level: 1 });
  } else {
    p.poly(
      [
        [49, 22],
        [67, 27],
        [49, 32],
      ],
      C.beak,
      {},
    );
    p.line(50, 27, 64, 27, C.beak, 0);
  }
  p.fillPix(42, 19, 3, 3, '#2a1a1c');
  p.pix(42, 19, '#fdfbf5');
  return p.toBuffer();
}

// ------------------------------------------------------------------ panel pictures

/** Where each piece of a loaf goes: angles (round) or x positions (long), from the relative sizes. */
export function pieceSpans(sizes: number[]): Array<[number, number]> {
  const total = sizes.reduce((a, b) => a + b, 0);
  let at = 0;
  return sizes.map((s) => {
    const a = at / total;
    at += s;
    return [a, at / total];
  });
}

/**
 * A loaf seen from above. Round loaves are cut into wedges (starting at the
 * top and going clockwise); long loaves into slices. Pieces that are gone show
 * the plate or board with crumbs; shaded pieces are glazed gold. `numbers`
 * writes nothing (no labels on pictures), but `count` marks each piece with
 * a small dot pattern for the hint (1, 2, 3...).
 */
export function paintLoaf(loaf: Loaf, size = 64, opts: { count?: boolean } = {}): PixelBuffer {
  const spans = pieceSpans(loaf.sizes);
  if (loaf.shape === 'long') return paintLongLoaf(loaf, spans, size, opts);
  const p = new Paint(size, size);
  const c = size / 2;
  const R = size * 0.44;
  // the plate: pale glazed clay with a blue rim, so the pieces that are gone stand out
  p.ellipse(c, c + 1, R + 3, R + 3, C.rim, { form: 'flat', level: 2 });
  p.ellipse(c, c + 1, R + 1.5, R + 1.5, C.plate, { form: 'flat', level: 3 });
  // faint lines on the plate where every piece was, so the whole loaf can still be counted
  if (spans.length > 1)
    for (const [a0] of spans) {
      const a = a0 * Math.PI * 2;
      p.line(c, c, c + Math.sin(a) * R, c - Math.cos(a) * R, C.plate, 1);
    }
  if (loaf.gone.length) p.ellipse(c, c, R, R, C.plate, { form: 'flat', level: 1, clip: (x, y) => Math.abs(Math.hypot(x - c, y - c) - R) < 0.8 });
  const angleOf = (x: number, y: number) => {
    const a = Math.atan2(x - c, -(y - c)) / (Math.PI * 2);
    return a < 0 ? a + 1 : a;
  };
  const gap = 1.1; // pixels of cut between pieces
  spans.forEach(([a0, a1], i) => {
    if (loaf.gone.includes(i)) return;
    const r = loaf.shaded.includes(i) ? C.glaze : C.crust;
    p.shape(
      (x, y) => {
        const d = Math.hypot(x - c, y - c);
        if (d > R) return false;
        const a = angleOf(x, y);
        if (a < a0 || a >= a1) return false;
        if (spans.length === 1) return true;
        // keep a thin cut on both edges of the wedge
        const edge = Math.min(a - a0, a1 - a) * Math.PI * 2 * d;
        return edge > gap / 2 || d < 1.2;
      },
      [c - R, c - R, R * 2, R * 2],
      r,
      { box: [c - R, c - R, R * 2, R * 2], sep: true },
    );
  });
  // crumbs where pieces are gone
  spans.forEach(([a0, a1], i) => {
    if (!loaf.gone.includes(i)) return;
    for (let k = 0; k < 3; k++) {
      const a = (a0 + (a1 - a0) * (0.3 + k * 0.2)) * Math.PI * 2;
      const d = R * (0.45 + 0.15 * (k % 2));
      p.dot(c + Math.sin(a) * d, c - Math.cos(a) * d, C.crust, 1);
    }
  });
  // scoring lines across the crust's top (decoration) and the count dots for the hint
  if (opts.count)
    spans.forEach(([a0, a1], i) => {
      const a = ((a0 + a1) / 2) * Math.PI * 2;
      const d = R * 0.62;
      countDots(p, c + Math.sin(a) * d, c - Math.cos(a) * d, i + 1, loaf.gone.includes(i));
    });
  return p.toBuffer();
}

function paintLongLoaf(loaf: Loaf, spans: Array<[number, number]>, size: number, opts: { count?: boolean }): PixelBuffer {
  const W = Math.round(size * 1.5);
  const H = Math.round(size * 0.62);
  const p = new Paint(W, H);
  const x0 = 4;
  const x1 = W - 4;
  const y0 = H * 0.2;
  const y1 = H * 0.86;
  p.rect(1, y1 - 3, W - 2, H - y1 + 2, C.board, { form: 'cylV', box: [1, y1 - 3, W - 2, H - y1 + 2] });
  const r = (y1 - y0) / 2;
  const cy = (y0 + y1) / 2;
  spans.forEach(([a0, a1], i) => {
    if (loaf.gone.includes(i)) return;
    const s0 = x0 + (x1 - x0) * a0;
    const s1 = x0 + (x1 - x0) * a1;
    const tone = loaf.shaded.includes(i) ? C.glaze : C.crust;
    p.shape(
      (x, y) => {
        // a rounded loaf: a capsule from x0 to x1
        const cx = Math.max(x0 + r, Math.min(x1 - r, x));
        if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) return false;
        if (spans.length === 1) return true;
        return x > s0 + (i === 0 ? 0 : 0.8) && x < s1 - (i === spans.length - 1 ? 0 : 0.8);
      },
      [s0, y0, s1 - s0, y1 - y0],
      tone,
      { box: [x0, y0, x1 - x0, y1 - y0], sep: true },
    );
    if (opts.count) countDots(p, (s0 + s1) / 2, cy, i + 1, false);
  });
  return p.toBuffer();
}

/** Small cream dots (1 to 12) for counting pieces in a hint picture. */
function countDots(p: Paint, cx: number, cy: number, n: number, faint: boolean): void {
  const cols = n <= 3 ? n : n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  for (let k = 0; k < n; k++) {
    const x = Math.round(cx + ((k % cols) - (cols - 1) / 2) * 3 - 1);
    const y = Math.round(cy + (Math.floor(k / cols) - (rows - 1) / 2) * 3 - 1);
    p.fillPix(x, y, 2, 2, faint ? '#5f86a8' : '#fff6dc');
  }
}

/**
 * The milestone road for the number line: a basalt road between curbs, a
 * milestone at 0, 1 (and 2), and a wooden post at the end of every equal
 * stretch. `marker` puts a red flag on a post. With `stretches`, every other
 * stretch is tinted so the child can count them.
 */
export function paintRoad(road: Road, opts: { stretches?: number; flag?: number | null } = {}): PixelBuffer {
  const W = 200;
  const H = 46;
  const p = new Paint(W, H);
  const left = 12;
  const right = W - 12;
  const posts = road.d * road.end;
  const xOf = (k: number) => left + ((right - left) * k) / posts;
  // grass verge, road, curbs
  p.rect(0, 0, W, H, C.grass, { level: 2 });
  for (let x = 0; x < W; x += 3) p.dot(x + ((x * 7) % 2), 2 + ((x * 13) % 5), C.grass, 3);
  p.rect(0, 22, W, 14, C.basalt, { level: 2 });
  for (let x = 0; x < W; x += 9) for (let y = 23; y < 35; y += 5) p.dot(x + ((y * 3) % 5), y, C.basalt, 1);
  p.rect(0, 20, W, 2, C.curb, { level: 3 });
  p.rect(0, 36, W, 2, C.curb, { level: 1 });
  // tinted stretches for the hint: every other stretch lighter, up to `stretches`
  if (opts.stretches)
    for (let k = 0; k < Math.min(opts.stretches, posts); k++)
      p.rect(xOf(k) + 1, 24, xOf(k + 1) - xOf(k) - 2, 10, k % 2 ? ramp('#e7a63a') : ramp('#f2c94c'), { level: 2 });
  // posts (stakes) along the near curb, milestones at whole numbers
  for (let k = 0; k <= posts; k++) {
    const x = Math.round(xOf(k));
    if (k % road.d === 0) {
      const tone = k === 0 ? C.gold : C.stone;
      p.rect(x - 4, 8, 8, 14, tone, { form: 'cylV', box: [x - 4, 8, 8, 14], sep: true });
      p.ellipse(x, 8, 4, 1.6, tone, { form: 'flat', level: 4 });
    } else {
      p.rect(x - 1, 12, 3, 10, C.stake, { form: 'cylV', box: [x - 1, 12, 3, 10] });
      p.rect(x - 1, 11, 3, 1, C.stake, { level: 3 });
    }
  }
  // the flag on a post
  const flag = opts.flag ?? road.marker;
  if (flag !== undefined && flag !== null) {
    const x = Math.round(xOf(flag));
    p.rect(x, 1, 1, 21, C.board, { level: 1 });
    p.poly(
      [
        [x + 1, 1],
        [x + 10, 4],
        [x + 1, 8],
      ],
      C.flag,
      { form: 'flat', level: 2, sep: true },
    );
  }
  return p.toBuffer();
}

/** Where post `k` sits across the road picture, as a fraction of its width (for the clickable posts). */
export function postAt(road: Road, k: number): number {
  const posts = road.d * road.end;
  return (12 + ((200 - 24) * k) / posts) / 200;
}

// ------------------------------------------------------------------ HUD and icons

/** A small brazier for the HUD: cold (ash) or lit (a flame). */
export function paintBrazierIcon(lit: boolean): PixelBuffer {
  const p = new Paint(16, 16);
  for (const fx of [4, 8, 12]) p.capsule(8, 11, fx, 15, 0.6, C.bronze, {});
  p.ellipse(8, 10, 6, 2.4, C.bronze, { sep: true });
  if (lit) {
    p.ellipse(8, 5.5, 3.6, 4.6, ANC.flame, { form: 'flat', level: 2 });
    p.ellipse(8, 6.6, 2.2, 2.8, ramp('#ffd25a'), { form: 'flat', level: 3 });
  } else p.ellipse(8, 8.2, 3.6, 1.2, ramp('#8d8780'), { form: 'flat', level: 2 });
  return p.toBuffer();
}

/** A round loaf icon (for the job list and grown-ups). */
export function paintLoafIcon(): PixelBuffer {
  return paintLoaf({ shape: 'round', sizes: [1, 1, 1, 1, 1, 1, 1, 1], gone: [], shaded: [] }, 20);
}

/** A milestone icon for the job list. */
export function paintMilestoneIcon(): PixelBuffer {
  return paintMilestone(16, 1);
}

/** The color behind loaf pictures in the panel (parchment-like, so crust and plate both read). */
export const PICTURE_BG = mixHex('#f1e3c2', '#e6d4b0', 0.5);

export type { Ramp };
