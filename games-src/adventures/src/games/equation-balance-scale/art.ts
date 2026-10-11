import type { PixelBuffer } from '../../kit/art/pixel';
import { STAR } from '../../kit/worlds/star-station/art';
import { Paint, hash, ramp, type Ramp } from '../../kit/worlds/shade';
import type { Job } from './problems';

/**
 * Equation Balance Scale art, painted in code in the Star Station style (the
 * 16-bit painter: 5 shades per color, light from the top left, colored
 * outlines). The scale on the job panel is built from three pieces (the
 * stand, the beam and two pans) so the page can tip the beam and lift the
 * pans smoothly. The world gets the big weigh-station scale by Kiri and the
 * outpost beacon, lit one part per finished job.
 */

const METAL = ramp('#c9d1de');
const DARK = ramp('#5a6280');
const CYAN = ramp('#5fe3ff');
const PINK = ramp('#ff6fc0');
const AMBER = ramp('#ffcf6a');

/** The crystal colors: left pan cyan, right pan pink, so the two sides read apart. */
export const CRYSTAL = { left: '#5fe3ff', right: '#ff6fc0', gold: '#ffcf6a' } as const;

/** The scale's stand: a post on a wide base, with the pivot at the top (48 x 64). */
export function paintStand(): PixelBuffer {
  const p = new Paint(48, 64);
  p.rect(8, 56, 32, 6, DARK, { level: 2, sep: true });
  p.rect(12, 52, 24, 5, METAL, { level: 2, sep: true });
  p.rect(21, 8, 6, 46, METAL, { form: 'cylV', sep: true });
  for (let y = 14; y < 50; y += 8) p.line(21, y, 26, y, DARK, 1);
  p.ellipse(24, 7, 6, 6, AMBER, { form: 'sphere', sep: true });
  p.pix(22, 5, '#fff4d0');
  return p.toBuffer();
}

/** The beam that tips (128 x 8): a bar with a hook at each end and the pivot ring in the middle. */
export function paintBeam(): PixelBuffer {
  const p = new Paint(128, 8);
  p.rect(2, 2, 124, 4, METAL, { form: 'cylH', sep: true });
  for (const x of [2, 122]) p.rect(x, 0, 4, 8, DARK, { level: 2, sep: true });
  p.ellipse(64, 4, 4, 4, AMBER, { form: 'flat', level: 3 });
  for (let x = 12; x < 120; x += 10) if (Math.abs(x - 64) > 6) p.pix(x, 3, '#e7ecf6');
  return p.toBuffer();
}

/** One pan hanging from its strings (64 x 40): the strings meet at the top, the dish is at the bottom. */
export function paintPan(side: 'left' | 'right'): PixelBuffer {
  const p = new Paint(64, 40);
  const rim = side === 'left' ? CYAN : PINK;
  p.line(32, 0, 4, 32, DARK, 2);
  p.line(32, 0, 60, 32, DARK, 2);
  p.line(32, 0, 32, 30, DARK, 1);
  p.ellipse(32, 34, 30, 5, METAL, { form: 'sphere', sep: true });
  p.rect(4, 31, 56, 2, rim, { level: 3 });
  p.ellipse(32, 1, 2, 2, AMBER, { form: 'flat', level: 3 });
  return p.toBuffer();
}

/** A small crystal for the level 1 piles (8 x 12). */
export function paintCrystal(color: string): PixelBuffer {
  const p = new Paint(8, 12);
  const r = ramp(color);
  p.poly(
    [
      [4, 0],
      [7, 4],
      [6, 11],
      [2, 11],
      [1, 4],
    ],
    r,
    { form: 'sphere', sep: true },
  );
  p.line(4, 1, 4, 10, r, 4);
  p.pix(3, 3, '#ffffff');
  return p.toBuffer();
}

/** A crystal weight the player picks (24 x 28): a big faceted crystal on a little metal base. The number is written on top by the page. */
export function paintWeight(color: string = CRYSTAL.gold): PixelBuffer {
  const p = new Paint(24, 28);
  const r = ramp(color);
  p.rect(3, 22, 18, 5, DARK, { level: 2, sep: true });
  p.poly(
    [
      [12, 0],
      [21, 7],
      [19, 22],
      [5, 22],
      [3, 7],
    ],
    r,
    { form: 'sphere', sep: true },
  );
  p.line(12, 1, 12, 21, r, 4);
  p.line(4, 8, 20, 8, r, 3);
  p.pix(8, 4, '#ffffff');
  p.pix(9, 5, '#ffffff');
  return p.toBuffer();
}

/** The gap: a dashed crystal outline the missing weight goes into (24 x 28). */
export function paintGap(): PixelBuffer {
  const p = new Paint(24, 28);
  const pts: Array<[number, number]> = [
    [12, 0],
    [21, 7],
    [19, 22],
    [5, 22],
    [3, 7],
    [12, 0],
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let k = 0; k <= n; k++) if (Math.floor(k / 2) % 2 === 0) p.pix(Math.round(x1 + ((x2 - x1) * k) / n), Math.round(y1 + ((y2 - y1) * k) / n), '#ffe9a8');
  }
  p.rect(3, 22, 18, 5, DARK, { level: 1 });
  return p.toBuffer({ outline: false });
}

/** The lock Kiri puts on the scale while you think (12 x 14). */
export function paintLock(open = false): PixelBuffer {
  const p = new Paint(12, 14);
  const shackleY = open ? 0 : 2;
  p.line(3, 7, 3, shackleY + 2, METAL, 3);
  p.line(3, shackleY + 1, 8, shackleY + 1, METAL, 3);
  p.line(8, shackleY + 2, 8, open ? 3 : 7, METAL, 3);
  p.rect(1, 7, 10, 7, AMBER, { level: 2, sep: true });
  p.rect(5, 9, 2, 3, DARK, { level: 0 });
  return p.toBuffer();
}

// ------------------------------------------------------------------ icons and portraits

/** A job's icon for the job list and the HUD (16 x 16). */
export function paintJobIcon(job: Job, on = true): PixelBuffer {
  const p = new Paint(16, 16);
  const c = (hex: string): Ramp => ramp(on ? hex : '#6c6f86');
  if (job === 'weigh') {
    p.rect(7, 3, 2, 10, c('#c9d1de'), { level: 3 });
    p.rect(2, 3, 12, 2, c('#c9d1de'), { level: 3 });
    p.ellipse(4, 10, 3, 1.5, c('#5fe3ff'), { form: 'flat', level: 3 });
    p.ellipse(12, 10, 3, 1.5, c('#ff6fc0'), { form: 'flat', level: 3 });
    p.line(4, 5, 2, 9, c('#5a6280'), 2);
    p.line(12, 5, 14, 9, c('#5a6280'), 2);
    p.rect(4, 13, 8, 2, c('#5a6280'), { level: 2 });
  } else if (job === 'rover') {
    p.rect(2, 6, 12, 5, c('#e7ecf6'), { level: 3, sep: true });
    p.rect(3, 3, 6, 3, c('#4fd6ff'), { level: 3 });
    for (const x of [4, 8, 12]) p.ellipse(x, 12, 1.6, 1.6, c('#5a6280'), { form: 'flat', level: 1 });
    p.rect(11, 2, 1, 4, c('#5a6280'), { level: 2 });
  } else {
    p.ellipse(8, 10, 6, 5, c('#e7ecf6'), { form: 'sphere', sep: true });
    p.rect(2, 10, 12, 4, c('#c9d1de'), { level: 2 });
    p.ellipse(8, 9, 2, 2, c('#7dea8a'), { form: 'flat', level: 3 });
  }
  return p.toBuffer();
}

/** The beacon in the HUD (12 x 16): three lamps, lit one per finished job. */
export function paintBeaconIcon(lit: number): PixelBuffer {
  const p = new Paint(12, 18);
  p.rect(5, 6, 2, 11, METAL, { level: 2 });
  p.rect(2, 15, 8, 3, DARK, { level: 2 });
  const lamps = [CYAN, PINK, AMBER];
  [0, 1, 2].forEach((i) => p.ellipse(6, 13 - i * 5, 2.4, 2.4, i < lit ? lamps[i] : ramp('#4a4d66'), { form: 'flat', level: i < lit ? 4 : 1 }));
  return p.toBuffer();
}

/** Gloop's portrait for the talk box (72 x 72), from the setting's critter. */
export function paintGloopPortrait(curious = false): PixelBuffer {
  const p = new Paint(72, 72);
  p.rect(0, 0, 72, 72, ramp('#3a2a62'), { level: 2 });
  for (let k = 0; k < 14; k++) p.pix(Math.floor(hash(k, 3, 5) * 72), Math.floor(hash(k, 4, 5) * 40), k % 3 ? '#ff9ed0' : '#ffffff');
  p.rect(0, 58, 72, 14, ramp('#2fa39a'), { level: 2 });
  const fur = ramp('#7dd0ff');
  p.line(40, 18, 46, 4, fur, 1);
  p.ellipse(47, 4, 4, 4, STAR.amber, { form: 'flat', level: 4 });
  p.ellipse(36, 44, 26, 22, fur, { sep: true });
  for (const k of [-1, 1]) {
    p.ellipse(36 + k * 10, 38, 6, 7, ramp('#ffffff'), { form: 'flat', level: 4 });
    p.ellipse(36 + k * 9 + (curious ? 2 : 0), curious ? 37 : 39, 3, 4, ramp('#1d1a30'), { form: 'flat', level: 1 });
    p.fillPix(36 + k * 9 - 2, 35, 2, 2, '#ffffff');
  }
  if (curious) p.ellipse(36, 54, 3, 3, ramp('#c0506a'), { form: 'flat', level: 2 });
  else for (let x = -6; x <= 6; x++) p.pix(36 + x, 52 + Math.round((x * x) / 12), '#c0506a');
  return p.toBuffer();
}

// ------------------------------------------------------------------ the world

/** The big weigh-station scale by Kiri (at T pixels per tile; about 3 tiles wide). */
export function paintWeighStation(T: number, tip = 0): PixelBuffer {
  // a big scale: 1.6 times the size of the setting's props, so it reads from across the outpost
  const u = (T / 16) * 1.6;
  const S = (v: number) => Math.round(v * u);
  const p = new Paint(S(48), S(44));
  p.rect(S(14), S(38), S(20), S(5), DARK, { level: 2, sep: true });
  p.rect(S(22), S(8), S(4), S(31), METAL, { form: 'cylV', sep: true });
  const dy = S(tip * 3);
  p.line(S(4), S(10) + dy, S(44), S(10) - dy, METAL, 3);
  p.line(S(4), S(11) + dy, S(44), S(11) - dy, METAL, 2);
  for (const [x, side, d] of [
    [S(6), CYAN, dy],
    [S(42), PINK, -dy],
  ] as const) {
    p.line(x, S(11) + d, x - S(5), S(22) + d, DARK, 2);
    p.line(x, S(11) + d, x + S(5), S(22) + d, DARK, 2);
    p.ellipse(x, S(23) + d, S(7), S(2.2), METAL, { form: 'sphere', sep: true });
    p.rect(x - S(6), S(22) + d, S(12), Math.max(1, S(0.8)), side, { level: 3 });
    // a few crystals on each pan
    for (const k of [-3, 0, 3]) p.poly([[x + S(k), S(16) + d], [x + S(k + 1.6), S(20) + d], [x + S(k - 1.6), S(20) + d]], side, { form: 'flat', level: 3 });
  }
  p.ellipse(S(24), S(8), S(3), S(3), AMBER, { form: 'sphere', sep: true });
  return p.toBuffer();
}

/** The outpost beacon (a tall mast with three lamps; `lit` of them glow). */
export function paintOutpostBeacon(T: number, lit: number, frame = 0): PixelBuffer {
  const u = T / 16;
  const S = (v: number) => Math.round(v * u);
  const p = new Paint(S(20), S(62));
  p.line(S(4), S(60), S(8), S(10), METAL, 1);
  p.line(S(16), S(60), S(12), S(10), METAL, 2);
  for (let y = 14; y < 60; y += 6) {
    const t = (y - 10) / 50;
    p.line(S(8 - t * 4), S(y), S(12 + t * 4), S(y + 5), METAL, 1);
    p.line(S(12 + t * 4), S(y), S(8 - t * 4), S(y + 5), METAL, 2);
  }
  p.rect(S(2), S(58), S(16), S(4), DARK, { level: 2 });
  const lamps = [CYAN, PINK, AMBER];
  const ys = [44, 28, 10];
  ys.forEach((y, i) => {
    const on = i < lit;
    p.ellipse(S(10), S(y), S(3.4), S(3.4), on ? lamps[i] : ramp('#4a4d66'), { form: 'sphere', sep: true, bias: on ? (frame % 2 ? 0.2 : 0.35) : -0.1 });
  });
  return p.toBuffer();
}
