import { PixelBuffer } from '../../kit/art/pixel';
import { STAR } from '../../kit/worlds/star-station/art';
import { Paint, hash, mixHex, ramp, type Ramp } from '../../kit/worlds/shade';

/**
 * Multiplication Space Quest art, painted in code in the Star Station style
 * (the 16-bit painter: 5 shades per color, light from the top left, colored
 * outlines). Designs are written at 16 pixels per tile and scaled by
 * u = 1.5, the same pixel size as the station deck (24 pixels per tile).
 *
 * The flight: the player's ship, the stranded supply ships (gray until the
 * right answer lights them up), the gray Static pebbles (friendly: they burst
 * into sparkles), the big answer rocks, the starfield and nebula. The deck:
 * the player's ship parked on the docking ring, and Blip the alien.
 */

const U = 1.5;
const S = (v: number) => Math.round(v * U);

export const PAINTS = {
  teal: { body: '#2fb7c4', trim: '#f2c14c', name: 'Teal and gold' },
  coral: { body: '#ef6f5e', trim: '#f4efe6', name: 'Coral' },
  violet: { body: '#8a6ad6', trim: '#7ff0ff', name: 'Violet and cyan' },
  lime: { body: '#6fcf5a', trim: '#2c3350', name: 'Lime' },
  sun: { body: '#f2b53a', trim: '#5d3fa8', name: 'Sunburst' },
} as const;
export type PaintId = keyof typeof PAINTS;
export const PAINT_IDS = Object.keys(PAINTS) as PaintId[];

/** The player's ship, nose up (3 frames: the engine flame flickers). About 33 x 39 pixels. */
export function paintShip(paint: PaintId = 'teal', frame = 0, opts: { twin?: boolean } = {}): PixelBuffer {
  const col = PAINTS[paint];
  const body = ramp(col.body);
  const trim = ramp(col.trim);
  const p = new Paint(S(22), S(26));
  const cx = S(11);
  // engine flame under the ship
  const flame = [ramp('#ffb547'), ramp('#ff7a3c'), ramp('#ffd36a')][frame % 3];
  p.ellipse(cx, S(23), S(2.2), S(2.4 + (frame % 3) * 0.5), flame, { form: 'flat', level: 3 });
  p.ellipse(cx, S(22.5), S(1), S(1.4), ramp('#fff4d0'), { form: 'flat', level: 3 });
  // wings
  p.poly(
    [
      [cx, S(9)],
      [S(21), S(19)],
      [S(19), S(21)],
      [cx, S(18)],
      [S(3), S(21)],
      [S(1), S(19)],
    ],
    trim,
    { form: 'flat', level: 2, sep: true },
  );
  if (opts.twin)
    for (const x of [S(4), S(18)]) {
      p.rect(x - S(0.8), S(14), S(1.6), S(5), STAR.trim, { level: 3 });
      p.pix(x, S(13.4), STAR.neonCyan);
    }
  // body
  p.capsule(cx, S(4), cx, S(19), S(4.2), body, { sep: true });
  // cockpit window
  p.ellipse(cx, S(9), S(2.4), S(3.2), STAR.glass, { sep: true });
  p.pix(cx - S(1), S(7.6), '#bff6ff');
  p.pix(cx - S(1), S(8.3), '#7ff0ff');
  // stripes and engine
  p.rect(cx - S(1), S(13), S(2), S(5), trim, { level: 3 });
  p.rect(cx - S(2.4), S(19), S(4.8), S(2), STAR.dark, { level: 2 });
  return p.toBuffer();
}

/** A stranded supply ship (nose up): gray and powered down, or lit in its own color. 18 x 15 pixels (12 x 10 when `small`, for big formations). */
export function paintSupply(lit: boolean, hue = 0, small = false): PixelBuffer {
  const k = small ? 1 : U;
  const Z = (v: number) => Math.round(v * k);
  const colors = ['#4fd6ff', '#ff8fd0', '#ffcf6a', '#8dffb0', '#b89cff'];
  const base = lit ? colors[hue % colors.length] : '#a3a8bf';
  const body = ramp(base);
  const wing = lit ? ramp(mixHex(base, '#e7ecf6', 0.45)) : ramp('#6c7088');
  const p = new Paint(Z(12), Z(10));
  p.poly(
    [
      [Z(6), Z(2)],
      [Z(12), Z(8)],
      [Z(11), Z(9.5)],
      [Z(6), Z(7)],
      [Z(1), Z(9.5)],
      [Z(0), Z(8)],
    ],
    wing,
    { form: 'flat', level: 2, sep: true },
  );
  p.capsule(Z(6), Z(1.6), Z(6), Z(7.6), Z(2.2), body, { sep: true });
  p.pix(Z(6), Z(3), lit ? '#ffffff' : '#4a4e66');
  if (lit) p.pix(Z(6), Z(9), '#ffd36a');
  return p.toBuffer();
}

/** A supply crate (for the Cargo questions): gray and dim in the Static, or glowing once delivered. 15 x 15 pixels (10 x 10 when `small`). */
export function paintCrate(lit: boolean, small = false): PixelBuffer {
  const k = small ? 1 : U;
  const Z = (v: number) => Math.round(v * k);
  const p = new Paint(Z(10), Z(10));
  const body = ramp(lit ? '#ef8a3c' : '#9a8f86');
  const band = ramp(lit ? '#ffcf6a' : '#6c6560');
  p.rect(0, Z(1), Z(10), Z(9), body, { level: 2, sep: true });
  p.rect(0, 0, Z(10), Z(2), body, { level: 3 });
  p.rect(0, Z(4.5), Z(10), Math.max(1, Z(1.2)), band, { level: 2 });
  p.rect(Z(4.2), Z(1), Math.max(1, Z(1.6)), Z(9), band, { level: 3 });
  if (lit) p.pix(Z(1.5), Z(2.5), '#fff4d0');
  return p.toBuffer();
}

/** A Static pebble: a fuzzy gray space rock that crackles (2 frames, 3 shapes). */
export function paintPebble(shape = 0, frame = 0): PixelBuffer {
  const size = [10, 13, 8][shape % 3];
  const p = new Paint(S(size + 2), S(size + 2));
  const gray = ramp(['#8a8aa0', '#7a7d92', '#9894a6'][shape % 3], { spread: 0.9 });
  const c = S(size / 2 + 1);
  const r = S(size / 2);
  p.shape(
    (x, y) => {
      const a = Math.atan2(y - c, x - c);
      const wob = 1 + 0.16 * Math.sin(a * (3 + shape) + shape) + 0.08 * Math.sin(a * 7);
      return Math.hypot(x - c, y - c) <= r * wob * 0.92;
    },
    [0, 0, S(size + 2), S(size + 2)],
    gray,
    { sep: true },
  );
  // craters
  p.ellipse(c - S(1.5), c + S(0.6), S(1.3), S(1), gray, { form: 'flat', level: 1 });
  p.ellipse(c + S(1.8), c - S(1.4), S(0.9), S(0.8), gray, { form: 'flat', level: 1 });
  // little static sparks crackle round the edge
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + frame * 0.8 + shape;
    const x = c + Math.cos(a) * (r + S(0.4));
    const y = c + Math.sin(a) * (r + S(0.4));
    if (hash(k, frame, shape) > 0.35) p.pix(x, y, k % 2 ? '#d7d4e8' : '#a59fcf');
  }
  return p.toBuffer();
}

/** A big answer rock (the number floats on it as text). Wider than tall, 51 x 36 pixels; 2 frames of crackle. */
export function paintAnswerRock(frame = 0, seed = 0): PixelBuffer {
  const w = 34;
  const hgt = 24;
  const p = new Paint(S(w), S(hgt));
  const gray = ramp('#7c7896', { spread: 0.85 });
  const cx = S(w / 2);
  const cy = S(hgt / 2);
  p.shape(
    (x, y) => {
      const a = Math.atan2((y - cy) / S(hgt / 2 - 1), (x - cx) / S(w / 2 - 1));
      const wob = 1 + 0.07 * Math.sin(a * 5 + seed) + 0.05 * Math.sin(a * 9 + seed * 2);
      return ((x - cx) / S(w / 2 - 1)) ** 2 + ((y - cy) / S(hgt / 2 - 1)) ** 2 <= wob * wob * 0.98;
    },
    [0, 0, S(w), S(hgt)],
    gray,
    { sep: true, dither: true },
  );
  // a smooth face in the middle for the number to sit on
  p.ellipse(cx, cy + S(0.5), S(w / 2 - 6), S(hgt / 2 - 5), ramp('#2c2a45'), { form: 'flat', level: 2 });
  for (const [x, y, rr] of [
    [5, 8, 1.6],
    [29, 15, 1.4],
    [8, 18, 1.1],
    [27, 6, 1],
  ] as const)
    p.ellipse(S(x), S(y), S(rr), S(rr * 0.8), gray, { form: 'flat', level: 1 });
  // crackling static along the top
  for (let k = 0; k < 7; k++) {
    const x = S(4 + k * 4.4) + ((frame + k) % 2);
    const y = S(2.2 + Math.abs(Math.sin(k * 1.7 + frame)) * 1.5);
    if ((k + frame) % 3 !== 0) p.pix(x, y, k % 2 ? '#d7d4e8' : '#b2a8ff');
  }
  return p.toBuffer();
}

/** The Static core (the mini-boss at the end of a flight): a wide, crackling gray rock that the last question's three answer rocks sit on. 225 x 66 pixels. */
export function paintStaticCore(frame = 0): PixelBuffer {
  const w = 150;
  const hh = 44;
  const p = new Paint(S(w), S(hh));
  const gray = ramp('#5f5c7a', { spread: 0.9 });
  const cx = S(w / 2);
  const cy = S(hh / 2);
  const rx = S(w / 2 - 1);
  const ry = S(hh / 2 - 1);
  p.shape(
    (x, y) => {
      const a = Math.atan2((y - cy) / ry, (x - cx) / rx);
      const wob = 1 + 0.06 * Math.sin(a * 7 + frame * 0.3) + 0.04 * Math.sin(a * 13);
      return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= wob * wob * 0.95;
    },
    [0, 0, S(w), S(hh)],
    gray,
    { sep: true, dither: true },
  );
  for (const [x, y, r] of [
    [22, 14, 4],
    [128, 26, 5],
    [60, 34, 3],
    [104, 9, 3],
  ] as const)
    p.ellipse(S(x), S(y), S(r), S(r * 0.7), gray, { form: 'flat', level: 1 });
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2 + frame * 0.4;
    p.pix(cx + Math.cos(a) * (rx - 2), cy + Math.sin(a) * (ry - 2), k % 2 ? '#e1dcff' : '#a59fcf');
  }
  return p.toBuffer();
}

/** A small round "spark" of light (sparkle bursts, beam ends). */
export function paintSpark(color: string, size = 3): PixelBuffer {
  const b = new PixelBuffer(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (size < 3 || !((x === 0 || x === size - 1) && (y === 0 || y === size - 1))) b.px[y * size + x] = color;
  if (size >= 3) b.px[Math.floor(size / 2) * size + Math.floor(size / 2)] = '#ffffff';
  return b;
}

/**
 * A tall strip of deep space that repeats top to bottom: a purple-blue
 * nebula with soft dithered clouds (the stars are drawn separately so they
 * can move at different speeds).
 */
export function paintNebula(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  const base = ['#0e1024', '#151838', '#1d1f4a', '#2a2160', '#3a2470'];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      // soft clouds from a few sine waves, wrapping top to bottom
      const v = 0.5 + 0.22 * Math.sin((x / w) * Math.PI * 2 * 1.5 + Math.sin((y / h) * Math.PI * 2) * 1.6) + 0.2 * Math.sin((y / h) * Math.PI * 2 * 2 + x / 37) + 0.12 * Math.sin((x + y) / 23);
      const k = Math.max(0, Math.min(base.length - 1, Math.floor(v * base.length + (((x + y) % 2) - 0.5) * 0.45)));
      b.px[y * w + x] = base[k];
    }
  return b;
}

/** Blip, the friendly little floating alien (2 frames: the antennae bob). About 30 x 33 pixels. */
export function paintBlip(frame = 0, happy = false): PixelBuffer {
  const p = new Paint(S(20), S(22));
  const body = ramp('#7d6af0');
  const belly = ramp('#c3b8ff');
  const cx = S(10);
  // antennae
  for (const k of [-1, 1]) {
    const tip = S(1.6 + (frame % 2) * 0.8);
    p.capsule(cx + k * S(3), S(7), cx + k * S(4.6), tip + S(1.2), S(0.6), body, { form: 'flat', level: 3 });
    p.ellipse(cx + k * S(4.6), tip, S(1.3), S(1.3), ramp('#8dffb0'), { form: 'flat', level: 3 });
  }
  p.ellipse(cx, S(12), S(7.4), S(7), body, { sep: true });
  p.ellipse(cx, S(14.6), S(4.4), S(3.4), belly, { form: 'flat', level: 2 });
  // big friendly eyes
  for (const k of [-1, 1]) {
    p.ellipse(cx + k * S(2.6), S(10.4), S(1.9), S(2.2), ramp('#ffffff'), { form: 'flat', level: 4 });
    p.ellipse(cx + k * S(2.4), S(10.9), S(1), S(1.3), ramp('#2a1d4a'), { form: 'flat', level: 1 });
    p.pix(cx + k * S(2.4) - 1, S(10.1), '#ffffff');
  }
  // smile and cheeks
  if (happy) for (let x = -2; x <= 2; x++) p.pix(cx + S(x * 0.7), S(14.2) + (Math.abs(x) === 2 ? -1 : 0), '#2a1d4a');
  else for (let x = -1; x <= 1; x++) p.pix(cx + S(x * 0.7), S(14), '#2a1d4a');
  for (const k of [-1, 1]) p.pix(cx + k * S(5), S(13), '#ff8fd0');
  // a little glow ring under it (it floats)
  p.ellipse(cx, S(20.6), S(3.4), S(0.9), ramp('#5fe3ff'), { form: 'flat', level: 3 });
  return p.toBuffer();
}

/** Blip's portrait for the talk box (72 x 72). */
export function paintBlipPortrait(curious = false): PixelBuffer {
  const p = new Paint(72, 72);
  p.rect(0, 0, 72, 72, ramp('#1d1f4a'), { level: 2 });
  for (let k = 0; k < 18; k++) p.pix(Math.floor(hash(k, 1, 4) * 72), Math.floor(hash(k, 2, 4) * 72), k % 3 ? '#7ff0ff' : '#ffffff');
  const body = ramp('#7d6af0');
  p.capsule(22, 26, 16, 8, 2, body, { form: 'flat', level: 3 });
  p.capsule(50, 26, 56, 8, 2, body, { form: 'flat', level: 3 });
  p.ellipse(16, 8, 4.5, 4.5, ramp('#8dffb0'), { form: 'flat', level: 3 });
  p.ellipse(56, 8, 4.5, 4.5, ramp('#8dffb0'), { form: 'flat', level: 3 });
  p.ellipse(36, 46, 28, 25, body, { sep: true });
  p.ellipse(36, 56, 15, 11, ramp('#c3b8ff'), { form: 'flat', level: 2 });
  for (const k of [-1, 1]) {
    p.ellipse(36 + k * 10, 40, 7, 8, ramp('#ffffff'), { form: 'flat', level: 4 });
    p.ellipse(36 + k * 9 + (curious ? 2 : 0), curious ? 39 : 42, 3.6, 4.6, ramp('#2a1d4a'), { form: 'flat', level: 1 });
    p.fillPix(36 + k * 9 - 2, 38, 2, 2, '#ffffff');
    p.fillPix(36 + k * 19 - 2, 50, 4, 2, '#ff8fd0');
  }
  if (curious) p.ellipse(36, 56, 3, 3, ramp('#2a1d4a'), { form: 'flat', level: 1 });
  else for (let x = -6; x <= 6; x++) p.pix(36 + x, 54 + Math.round((x * x) / 14), '#2a1d4a');
  return p.toBuffer();
}

/** The player's ship parked on the deck's docking ring (seen from the 45-degree camera: the same ship, a little bigger). */
export function paintParkedShip(paint: PaintId = 'teal'): PixelBuffer {
  const ship = paintShip(paint, 0);
  // a landing glow under it
  const b = new PixelBuffer(ship.w + 8, ship.h + 4);
  for (let x = 6; x < b.w - 6; x++) b.px[(b.h - 2) * b.w + x] = x % 2 ? '#5fe3ff' : '#2e8f9c';
  b.blit(ship, 4, 0);
  return b;
}

// ------------------------------------------------------------------ icons (HUD, job list, upgrade bay)

/** Sector icons, 16 x 16: formations (three ships), engines (a power cell), cargo (a crate), constellations (stars joined up). */
export function paintSectorIcon(kind: 'formations' | 'engines' | 'cargo' | 'constellations', on = true): PixelBuffer {
  const p = new Paint(16, 16);
  const c = (hex: string): Ramp => ramp(on ? hex : '#6c6f86');
  if (kind === 'formations') {
    for (const [x, y] of [
      [8, 3],
      [4, 9],
      [12, 9],
    ])
      p.poly(
        [
          [x, y],
          [x + 3, y + 5],
          [x, y + 4],
          [x - 3, y + 5],
        ],
        c('#4fd6ff'),
        { form: 'flat', level: 3 },
      );
  } else if (kind === 'engines') {
    p.rect(5, 3, 6, 11, c('#7dea8a'), { level: 2, sep: true });
    p.rect(6, 1, 4, 2, c('#e7ecf6'), { level: 3 });
    p.poly(
      [
        [9, 5],
        [6, 9],
        [8, 9],
        [7, 12],
        [10, 8],
        [8, 8],
      ],
      c('#ffd36a'),
      { form: 'flat', level: 4 },
    );
  } else if (kind === 'cargo') {
    p.rect(2, 5, 12, 9, c('#ef8a3c'), { level: 2, sep: true });
    p.rect(2, 3, 12, 3, c('#ef8a3c'), { level: 3 });
    p.rect(6, 8, 4, 2, c('#e7ecf6'), { level: 3 });
  } else {
    const pts: Array<[number, number]> = [
      [3, 12],
      [6, 5],
      [11, 7],
      [13, 2],
    ];
    for (let i = 0; i < pts.length - 1; i++) p.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c('#b89cff'), 2);
    for (const [x, y] of pts) p.ellipse(x + 0.5, y + 0.5, 1.6, 1.6, c('#ffe27a'), { form: 'flat', level: 4 });
  }
  return p.toBuffer();
}

/** A shield pip (16 x 16), full or empty. */
export function paintShieldIcon(full: boolean): PixelBuffer {
  const p = new Paint(16, 16);
  const r = ramp(full ? '#4fd6ff' : '#4a5070');
  p.poly(
    [
      [8, 1],
      [14, 3],
      [13, 10],
      [8, 15],
      [3, 10],
      [2, 3],
    ],
    r,
    { form: 'sphere', sep: true },
  );
  if (full) p.pix(6, 5, '#ffffff');
  return p.toBuffer();
}

/** Stardust (what pebbles and answers give; it pays for upgrades). 16 x 16. */
export function paintStardustIcon(): PixelBuffer {
  const p = new Paint(16, 16);
  const gold = ramp('#ffcf6a');
  p.poly(
    [
      [8, 1],
      [10, 6],
      [15, 8],
      [10, 10],
      [8, 15],
      [6, 10],
      [1, 8],
      [6, 6],
    ],
    gold,
    { form: 'sphere' },
  );
  p.pix(7, 6, '#ffffff');
  return p.toBuffer();
}

/** A small rescued-ship icon for the fleet counter (16 x 14). */
export function paintFleetIcon(): PixelBuffer {
  const b = paintSupply(true, 0);
  return b;
}

/** The upgrade icons for Rafi's bay (16 x 16). */
export function paintUpgradeIcon(kind: 'twin' | 'rapid' | 'shield' | 'thrusters' | 'paint'): PixelBuffer {
  const p = new Paint(16, 16);
  if (kind === 'twin') {
    for (const x of [5, 11]) {
      p.rect(x - 1, 4, 2, 9, ramp('#8c98bd'), { level: 3 });
      p.rect(x - 1, 1, 2, 3, ramp('#7ff0ff'), { level: 3 });
    }
  } else if (kind === 'rapid') {
    for (const y of [2, 7, 12]) p.rect(7, y, 2, 3, ramp('#7ff0ff'), { level: 3 });
    p.poly(
      [
        [2, 8],
        [5, 5],
        [5, 11],
      ],
      ramp('#ffcf6a'),
      { form: 'flat', level: 3 },
    );
  } else if (kind === 'shield') return paintShieldIcon(true);
  else if (kind === 'thrusters') {
    p.rect(5, 2, 6, 7, ramp('#8c98bd'), { level: 2, sep: true });
    p.ellipse(8, 11.5, 3, 3.5, ramp('#ff7a3c'), { form: 'flat', level: 3 });
    p.ellipse(8, 11, 1.4, 1.8, ramp('#fff4d0'), { form: 'flat', level: 3 });
  } else {
    p.rect(3, 3, 7, 9, ramp('#ef6f5e'), { level: 2, sep: true });
    p.rect(10, 6, 3, 2, ramp('#8c98bd'), { level: 3 });
    p.rect(5, 12, 3, 3, ramp('#8c98bd'), { level: 2 });
  }
  return p.toBuffer();
}

/** One star of the Star Map (8 x 8): lit gold, or a faint dot. */
export function paintMapStar(lit: boolean): PixelBuffer {
  const b = new PixelBuffer(8, 8);
  if (!lit) {
    b.px[3 * 8 + 3] = b.px[3 * 8 + 4] = b.px[4 * 8 + 3] = b.px[4 * 8 + 4] = '#5a5f86';
    return b;
  }
  const c = '#ffd36a';
  for (let i = 1; i < 7; i++) b.px[3 * 8 + i] = b.px[4 * 8 + i] = c;
  for (let i = 1; i < 7; i++) b.px[i * 8 + 3] = b.px[i * 8 + 4] = c;
  b.px[3 * 8 + 3] = b.px[4 * 8 + 4] = '#ffffff';
  return b;
}

/** The Static core as a 16 x 16 icon (the Bingo Boss in the mission list). */
export function paintStaticCoreIcon(): PixelBuffer {
  const p = new Paint(16, 16);
  p.ellipse(8, 8.5, 7, 6, ramp('#6b6884'), { sep: true });
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) p.rect(4 + x * 3, 5 + y * 3, 2, 2, ramp((x + y) % 2 ? '#ffd36a' : '#7ff0ff'), { level: 3 });
  return p.toBuffer();
}
