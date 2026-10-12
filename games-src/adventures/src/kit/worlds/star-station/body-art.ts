import { PixelBuffer } from '../../art/pixel';
import type { Look16 } from '../hero16';
import { Paint, ramp, type Ramp } from '../shade';
import { STAR } from './art';

/**
 * Star Station art for the inside-the-body setting (Body System Heroes, look
 * development). The same 16-bit painter, 24 pixels per tile and glowing
 * accents as the deck and the planet, in soft, friendly body colors: warm
 * pinks and corals for tissue, deep reds for blood vessels, never gory.
 *
 * The cast:
 *   - the Micro-Scout, the shrunk-down ship (a round pod with a cockpit bubble)
 *   - Nib, the co-pilot: a tiny round nanobot with one big eye
 *   - the Grime Gang germs: Sniffles (the flu virus) and Plaque Jack (cavity bacteria)
 *   - the body's helpers: red blood cells, white blood cells, good gut bacteria, oxygen
 */

const U = (T: number) => T / 16;

export const BODY = {
  tissue: ramp('#e98a9a'),
  tissue2: ramp('#d9707f'),
  lung: ramp('#f4a6b4'),
  vessel: ramp('#b23a4e'),
  vessel2: ramp('#8e2b40'),
  blood: ramp('#e0434f'),
  stomach: ramp('#f09a7a'),
  stomach2: ramp('#dc7f66'),
  acid: ramp('#c6e85a'),
  mucus: ramp('#e8e07a'),
  vein: ramp('#7a5ab8'),
  wbc: ramp('#f2eee4'),
  good: ramp('#5ccf8a'),
  flu: ramp('#7c6ae0'),
  fluKnob: ramp('#ff9f43'),
  plaque: ramp('#e8c24a'),
  oxygen: ramp('#8fe6ff'),
  hull: ramp('#e7ecf6'),
  fin: ramp('#ef8a3c'),
  glass: ramp('#4fd6ff'),
  nib: ramp('#c9d1de'),
  nibEye: ramp('#5fe3ff'),
  gold: ramp('#ffcf6a'),
  skin: ramp('#e9b48c'),
  skin2: ramp('#d99a72'),
  scrape: ramp('#e0606a'),
  scab: ramp('#8a3a2e'),
  dirt: ramp('#8a7a6a'),
  hair: ramp('#3b2a24'),
  platelet: ramp('#b47ad8'),
  tongue: ramp('#ec7f92'),
  tongue2: ramp('#de6b80'),
  gum: ramp('#e86a86'),
  tooth: ramp('#f4f1e6'),
  plaqueFilm: ramp('#e6d27a'),
  sugar: ramp('#f6f4ff'),
  scrapes: ramp('#9ad04a'),
} as const;

/** Big friendly cartoon eyes (white, a dark pupil looking `look`, a sparkle). */
function eyes(p: Paint, xs: number[], y: number, r: number, look: [number, number] = [0, 0], sleepy = false): void {
  const white = ramp('#ffffff');
  const dark = ramp('#1d1a30');
  for (const x of xs) {
    p.ellipse(x, y, r, sleepy ? r * 0.7 : r, white, { form: 'flat', level: 3, sep: true });
    p.ellipse(x + look[0] * r * 0.35, y + look[1] * r * 0.3 + (sleepy ? r * 0.15 : 0), r * 0.48, r * (sleepy ? 0.34 : 0.48), dark, { form: 'flat', level: 1 });
    p.pix(Math.round(x - r * 0.3), Math.round(y - r * 0.35), '#ffffff');
    if (sleepy) p.rect(x - r, y - r, r * 2, r * 0.55, ramp('#7c6ae0'), { form: 'flat', level: 2, onlyOver: true });
  }
}

// ------------------------------------------------------------------ the ship and Nib

/**
 * The Micro-Scout (about 1.75 tiles wide): a white pod with a cockpit bubble,
 * orange fins and a glowing thruster. `face` is where it points; `frame`
 * flickers the thruster (0 = idle, 1 and 2 = thrusting).
 */
export function paintMicroScout(T: number, face: 'left' | 'right' = 'right', frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = 30;
  const p = new Paint(Math.round(W * u), Math.round(22 * u));
  // design facing right; mirrored at the end for left
  // the thruster flame behind the pod
  if (frame > 0) {
    const len = frame === 1 ? 5 : 7;
    p.ellipse(S(4.5 - len / 3), S(12), S(len / 2 + 1), S(2.6), ramp('#ffcf6a'), { form: 'flat', level: 3 });
    p.ellipse(S(4.8 - len / 4), S(12), S(len / 3 + 0.5), S(1.5), ramp('#ffffff'), { form: 'flat', level: 2 });
  }
  // the tail fins (top and bottom)
  p.poly(
    [
      [S(6), S(7)],
      [S(9), S(2.5)],
      [S(13), S(2.5)],
      [S(12), S(8)],
    ],
    BODY.fin,
    { sep: true },
  );
  p.poly(
    [
      [S(6), S(17)],
      [S(9), S(21.5)],
      [S(13), S(21.5)],
      [S(12), S(16)],
    ],
    BODY.fin,
    { sep: true },
  );
  // the hull: a rounded pod
  p.ellipse(S(15), S(12), S(10.5), S(7), BODY.hull, { sep: true });
  // a cyan stripe and the thruster ring
  p.rect(S(5), S(13.6), S(20), S(1.4), STAR.cyan, { form: 'flat', level: 3, onlyOver: true });
  p.ellipse(S(5.4), S(12), S(1.6), S(3.2), STAR.trim, { sep: true });
  p.ellipse(S(5.2), S(12), S(0.8), S(2), frame > 0 ? ramp('#ffcf6a') : STAR.dark, { form: 'flat', level: frame > 0 ? 4 : 1 });
  // the cockpit bubble with a little pilot inside
  p.ellipse(S(19), S(9.8), S(5.4), S(4.4), BODY.glass, { form: 'sphere', bias: -0.15, sep: true });
  p.ellipse(S(18.6), S(10.6), S(1.8), S(1.8), ramp('#7a4a2e'), { form: 'sphere', onlyOver: true });
  p.ellipse(S(18.4), S(9.0), S(2.1), S(1.3), ramp('#2c2433'), { form: 'sphere', onlyOver: true });
  p.rect(S(16.4), S(12.4), S(4.4), S(2), ramp('#2f9a94'), { form: 'flat', level: 2, onlyOver: true });
  p.pix(S(21.6), S(7.4), '#ffffff');
  p.pix(S(22.4), S(8.2), '#ffffff');
  // the scanner light on the nose
  p.ellipse(S(25.3), S(12.4), S(1.1), S(1.1), STAR.amber, { form: 'flat', level: 4 });
  const b = p.toBuffer();
  if (face === 'right') return b;
  const m = new PixelBuffer(b.w, b.h);
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) m.set(b.w - 1 - x, y, b.get(x, y));
  return m;
}

/** Nib, the co-pilot nanobot (about 0.75 tiles): a round body, one big eye, a blinking antenna. */
export function paintNib(T: number, frame = 0, look: [number, number] = [0.4, 0]): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(16 * u));
  p.line(S(7), S(4.5), S(7), S(1.8), STAR.trim, 1);
  p.ellipse(S(7), S(1.6), S(1.2), S(1.2), frame % 2 ? STAR.magenta : BODY.gold, { form: 'flat', level: 4 });
  p.ellipse(S(7), S(9), S(5.6), S(5.2), BODY.nib, { sep: true });
  p.rect(S(1.6), S(10.5), S(10.8), S(1.2), BODY.gold, { form: 'flat', level: 3, onlyOver: true });
  // the one big eye
  p.ellipse(S(7), S(8.4), S(3.2), S(3.2), STAR.dark, { form: 'flat', level: 1 });
  p.ellipse(S(7) + look[0] * S(1), S(8.4) + look[1] * S(1), S(2.2), S(2.2), BODY.nibEye, { form: 'sphere' });
  p.ellipse(S(7) + look[0] * S(1.2), S(8.4) + look[1] * S(1.2), S(0.9), S(0.9), STAR.dark, { form: 'flat', level: 0 });
  p.pix(S(6), S(7.2), '#ffffff');
  // little hover jets
  for (const x of [S(4), S(10)]) p.ellipse(x, S(14.4), S(1), S(frame % 2 ? 1.2 : 0.8), STAR.cyan, { form: 'flat', level: 4 });
  return p.toBuffer();
}

/** Nib's portrait for the talk box (72 x 72). */
export function paintNibPortrait(happy = true): PixelBuffer {
  const p = new Paint(72, 72);
  p.rect(0, 0, 72, 72, ramp('#26324f'), { level: 2 });
  for (let y = 0; y < 72; y += 6) p.line(0, y, 71, y, ramp('#2e3c5e'), 2);
  p.line(36, 18, 36, 8, STAR.trim, 2);
  p.ellipse(36, 7, 4, 4, BODY.gold, { form: 'flat', level: 4 });
  p.ellipse(36, 42, 26, 24, BODY.nib, { sep: true });
  p.rect(10, 50, 52, 5, BODY.gold, { form: 'flat', level: 3, onlyOver: true });
  p.ellipse(36, 39, 15, 15, STAR.dark, { form: 'flat', level: 1 });
  p.ellipse(38, 39, 11, 11, BODY.nibEye, { form: 'sphere' });
  p.ellipse(39, 39, 4.5, 4.5, STAR.dark, { form: 'flat', level: 0 });
  p.fillPix(32, 32, 3, 3, '#ffffff');
  // a happy curve under the eye (or a flat line)
  for (let x = -7; x <= 7; x++) p.pix(36 + x, 58 + (happy ? Math.round(-(x * x) / 18) + 3 : 0), '#1d1a30');
  return p.toBuffer();
}

// ------------------------------------------------------------------ the Grime Gang

/**
 * Sniffles, the flu virus (about 1.4 tiles): a round purple body covered in
 * orange knobs (the flu virus really is covered in knobby spikes), goofy eyes
 * and a runny drip. `frame` wobbles the knobs.
 */
export function paintSniffles(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(24 * u), Math.round(24 * u));
  const c = S(12);
  const R = S(7.2);
  // knobby spikes all round (the flu virus's surface proteins)
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + (frame % 2 ? 0.13 : 0);
    const x1 = c + Math.cos(a) * R;
    const y1 = c + Math.sin(a) * R;
    const x2 = c + Math.cos(a) * (R + S(3.2));
    const y2 = c + Math.sin(a) * (R + S(3.2));
    p.line(x1, y1, x2, y2, BODY.flu, 1);
    p.ellipse(x2, y2, S(1.5), S(1.5), BODY.fluKnob, { form: 'sphere', sep: true });
  }
  p.ellipse(c, c, R, R, BODY.flu, { sep: true });
  // spots on the skin
  for (const [x, y] of [
    [-3.5, 3.5],
    [4, 4],
    [3.6, -4.4],
  ])
    p.ellipse(c + S(x), c + S(y), S(1.1), S(0.9), BODY.flu, { form: 'flat', level: 1, onlyOver: true });
  eyes(p, [c - S(2.6), c + S(2.6)], c - S(1.4), S(2.2), [frame % 2 ? 0.6 : -0.4, 0.3], true);
  // a wobbly frown-grin and a runny drip
  for (let x = -2.5; x <= 2.5; x += 0.5) p.pix(c + S(x), c + S(2.6) + Math.round(Math.sin(x * 1.6) * u), '#1d1a30');
  p.ellipse(c + S(0.6), c + S(4.3) + (frame % 2 ? S(0.6) : 0), S(0.9), S(1.3), BODY.oxygen, { form: 'sphere' });
  return p.toBuffer();
}

/**
 * Plaque Jack, the cavity bacteria (about 1.4 tiles): a yellow rod with a
 * sugar-crystal hat, a wiggly tail and a sly grin. Bacteria are rod- or
 * ball-shaped; this one is a rod.
 */
export function paintPlaqueJack(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(26 * u), Math.round(22 * u));
  // the wiggly tail (a flagellum: how bacteria swim)
  for (let x = 0; x < 8; x += 0.5) p.pix(S(1 + x), S(15 + Math.sin(x * 1.2 + (frame % 2 ? 1.6 : 0)) * 1.6), '#b88a2a');
  p.capsule(S(9), S(13), S(21), S(13), S(5), BODY.plaque, { sep: true });
  for (const [x, y] of [
    [12, 16],
    [17, 16.5],
    [19.5, 10],
  ])
    p.ellipse(S(x), S(y), S(1), S(0.8), BODY.plaque, { form: 'flat', level: 1, onlyOver: true });
  // a little sugar-cube hat
  p.rect(S(13), S(3.2), S(6), S(4.6), ramp('#f4f1ff'), { form: 'sphere', sep: true });
  for (const [x, y] of [
    [14.5, 4.6],
    [17, 6],
  ])
    p.pix(S(x), S(y), '#ffffff');
  p.rect(S(11.5), S(7.6), S(9), S(1.4), ramp('#ff6fc0'), { form: 'flat', level: 2, sep: true });
  eyes(p, [S(14), S(18.2)], S(11.6), S(1.9), [frame % 2 ? 0.5 : 0, 0.2]);
  // a sly grin
  for (let x = -2.5; x <= 2.5; x += 0.5) p.pix(S(16.1 + x), S(15) + Math.round((x * x) / 4 - 1) * u * 0.6, '#5a3a10');
  return p.toBuffer();
}

/**
 * Scrapes McGee, the bacteria in a cut (about 1.4 tiles): a bunch of round
 * green bacteria stuck together (some real bacteria grow in bunches like
 * grapes), with one cheeky face on the biggest ball. `frame` jiggles the bunch.
 */
export function paintScrapesMcGee(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(24 * u), Math.round(22 * u));
  const j = frame % 2 ? 0.5 : 0;
  const balls: Array<[number, number, number]> = [
    [6, 8 + j, 4],
    [17.5, 7 - j, 4.2],
    [5.5, 16, 3.6],
    [18.5, 15.5 + j, 3.8],
    [12, 4.5, 3.4],
  ];
  for (const [x, y, r] of balls) p.ellipse(S(x), S(y), S(r), S(r), BODY.scrapes, { sep: true, box: [S(x - r), S(y - r), S(r * 2), S(r * 2)] });
  p.ellipse(S(12), S(12), S(6.4), S(6.2), BODY.scrapes, { sep: true });
  for (const [x, y] of [
    [9, 15],
    [15.5, 14.6],
  ])
    p.ellipse(S(x), S(y), S(0.9), S(0.8), BODY.scrapes, { form: 'flat', level: 1, onlyOver: true });
  eyes(p, [S(9.8), S(14.4)], S(10.8), S(2), [frame % 2 ? 0.5 : -0.3, 0.2]);
  // a cheeky lopsided grin
  for (let x = -2.5; x <= 2.5; x += 0.5) p.pix(S(12.2 + x), S(14.4) + Math.round(((x + 1) * (x + 1)) / 5 - 0.6) * u * 0.6, '#2f4a14');
  return p.toBuffer();
}

/** A platelet (a tiny purple flake; platelets stick together to make a clot). */
export function paintPlatelet(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(9 * u), Math.round(7 * u));
  p.poly(
    [
      [S(1), S(4)],
      [S(3), S(1 + (frame % 2))],
      [S(7), S(1.5)],
      [S(8), S(5)],
      [S(4), S(6)],
    ],
    BODY.platelet,
    { sep: true },
  );
  return p.toBuffer();
}

/** A molar tooth standing up out of the gum (about 2 tiles), with a patch of plaque if `plaque`. */
export function paintTooth(T: number, plaque = false, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(32 * u), Math.round(36 * u));
  p.ellipse(S(16), S(32), S(15), S(4), BODY.gum, { sep: true });
  // a rounded crown with two soft bumps on top, and the body of the tooth down to the gum
  const tooth = (x: number, y: number) => {
    const body = x > S(4) && x < S(28) && y > S(10) && y < S(31);
    const bump = Math.hypot((x - S(10)) / S(7), (y - S(11)) / S(6.5)) < 1 || Math.hypot((x - S(22)) / S(7), (y - S(11 + (seed % 2))) / S(6.5)) < 1;
    return body || bump;
  };
  p.shape(tooth, [S(3), S(3), S(26), S(29)], BODY.tooth, { form: 'sphere', sep: true, box: [S(3), S(4), S(26), S(27)] });
  p.line(S(16), S(9), S(16), S(14), BODY.tooth, 1, { onlyOver: true });
  if (plaque) {
    p.ellipse(S(9 + (seed % 3) * 5), S(24), S(5), S(3), BODY.plaqueFilm, { form: 'flat', level: 2, onlyOver: true });
    p.ellipse(S(21), S(14), S(3), S(2), BODY.plaqueFilm, { form: 'flat', level: 3, onlyOver: true });
  }
  return p.toBuffer();
}

/** A sugar crystal (a little sparkling cube). */
export function paintSugar(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(10 * u), Math.round(10 * u));
  p.rect(S(1.5), S(2), S(7), S(7), BODY.sugar, { form: 'sphere', sep: true });
  p.pix(S(3), S(3.4), '#ffffff');
  if (frame % 2) p.pix(S(6.6), S(6.4), '#ffffff');
  return p.toBuffer();
}

/** A hair growing out of the skin (a follicle and a strand). */
export function paintHair(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(12 * u), Math.round(30 * u));
  p.ellipse(S(6), S(28), S(3.4), S(1.6), BODY.skin2, { form: 'flat', level: 1 });
  const lean = seed % 2 ? 1 : -1;
  p.capsule(S(6), S(28), S(6 + lean * 4), S(3), S(1.3), BODY.hair, { form: 'cylH' });
  return p.toBuffer();
}

/** A drop of sweat coming out of a pore. */
export function paintSweat(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(8 * u), Math.round(10 * u));
  p.ellipse(S(4), S(6.5 - (frame % 2)), S(2.6), S(3), BODY.oxygen, { form: 'sphere', bias: 0.15 });
  p.pix(S(3.2), S(5), '#ffffff');
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the body's helpers

/** A red blood cell (a squashed disc with a dimple; they carry oxygen). Tilted by `tilt` 0-2. */
export function paintRedCell(T: number, tilt = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(12 * u));
  const ry = [4.6, 3.6, 2.6][tilt % 3];
  p.ellipse(S(7), S(6), S(6), S(ry), BODY.blood, { sep: true });
  p.ellipse(S(7.3), S(6.1), S(2.6), S(ry * 0.45), BODY.blood, { form: 'flat', level: 1, onlyOver: true });
  return p.toBuffer();
}

/** A white blood cell (a big, soft, lumpy friend with kind eyes; it fights germs). */
export function paintWhiteCell(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(22 * u), Math.round(20 * u));
  for (const [x, y, r] of [
    [7, 9, 5.5],
    [14, 8, 5.8],
    [11, 13, 6],
    [frame % 2 ? 17.5 : 17, 13, 3.4],
    [frame % 2 ? 4 : 4.6, 13.5, 3],
  ])
    p.ellipse(S(x), S(y), S(r), S(r * 0.92), BODY.wbc, { box: [S(2), S(2), S(18), S(16)] });
  p.ellipse(S(12), S(10.5), S(3.2), S(2.6), ramp('#c9b8e8'), { form: 'sphere', onlyOver: true });
  eyes(p, [S(9.4), S(14.4)], S(9.6), S(1.7), [0.4, 0.2]);
  for (let x = -1.5; x <= 1.5; x += 0.5) p.pix(S(11.9 + x), S(13) + Math.round((x * x) / 3) * u * 0.6, '#5a4a6a');
  return p.toBuffer();
}

/** A good gut bacterium (a green bean shape with a smile: most gut bacteria are helpers). */
export function paintGoodBacteria(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(18 * u), Math.round(14 * u));
  p.capsule(S(4.5), S(7), S(13.5), S(7), S(4), BODY.good, { sep: true });
  for (let k = 0; k < 4; k++) p.pix(S(4 + k * 3), S(frame % 2 ? 12.4 : 12), '#2f8a5a');
  eyes(p, [S(7.8), S(11.4)], S(6.2), S(1.5), [0.3, 0]);
  for (let x = -1.5; x <= 1.5; x += 0.5) p.pix(S(9.6 + x), S(8.6) + Math.round((x * x) / 3) * u * 0.6 + u, '#1f5a3a');
  return p.toBuffer();
}

/** A bubble of oxygen (it twinkles). */
export function paintOxygen(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(8 * u), Math.round(8 * u));
  p.ellipse(S(4), S(4), S(3), S(3), BODY.oxygen, { form: 'sphere', bias: 0.1 });
  p.pix(S(3), S(2.6), '#ffffff');
  if (frame % 2) p.pix(S(5.4), S(5.2), '#ffffff');
  return p.toBuffer({ outline: false });
}

/** A blob of mucus (sticky goo that traps germs in the airways). */
export function paintMucus(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(10 * u));
  p.ellipse(S(10), S(6), S(8.5), S(3.4), BODY.mucus, { form: 'sphere', bias: 0.1 });
  p.ellipse(S(seed % 2 ? 5 : 14), S(4), S(3), S(2.4), BODY.mucus, { form: 'sphere', bias: 0.15 });
  p.pix(S(7), S(4.6), '#ffffff');
  return p.toBuffer();
}

// ------------------------------------------------------------------ people

/** Dr. Ama Okafor, the station's doctor and inventor of the shrink beam (a white coat over teal). */
export const DR_AMA: Look16 = {
  build: 'adult',
  skin: '#6b3f26',
  hair: { style: 'wrap', color: '#2fb7a8' },
  top: { color: '#eef1f8', trim: '#2fb7a8', kind: 'robe' },
  legs: '#2c6a72',
  shoes: '#4a5266',
  sole: '#e7ecf6',
  belt: '#2fb7a8',
  badge: '#ff6f8a',
  headset: '#4a5266',
};

/** Commander Ayo, the patient (the same look as in Multiplication Space Quest). */
export const COMMANDER_AYO: Look16 = {
  build: 'adult',
  skin: '#5a3825',
  hair: { style: 'short', color: '#2a1f1d' },
  top: { color: '#3f4b9e', trim: '#f2c14c', kind: 'jumpsuit' },
  legs: '#3f4b9e',
  shoes: '#2c3350',
  sole: '#c9d1de',
  belt: '#2c3350',
  badge: '#f2c14c',
  headset: '#2c3350',
};

// ------------------------------------------------------------------ the med bay

/** The shrink beam: a ring arch with a cyan beam inside (about 3 tiles wide). `frame` pulses the beam. */
export function paintShrinkBeam(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(48 * u), Math.round(52 * u));
  p.rect(S(4), S(44), S(40), S(7), STAR.dark, { form: 'flat', level: 2, sep: true });
  p.rect(S(6), S(42), S(36), S(3), STAR.trim, { form: 'cylV', sep: true });
  // the ring
  const ring = (x: number, y: number) => {
    const d = Math.hypot((x - S(24)) / S(20), (y - S(24)) / S(20));
    return d <= 1 && d >= 0.78 && y < S(44);
  };
  p.shape((x, y) => ring(x, y), [0, 0, p.w, S(44)], STAR.trim, { form: 'sphere', box: [S(4), S(4), S(40), S(40)], sep: true });
  // lights round the ring
  for (let k = 0; k < 9; k++) {
    const a = Math.PI + (k / 8) * Math.PI;
    p.ellipse(S(24) + Math.cos(a) * S(18), S(24) + Math.sin(a) * S(18), S(1.1), S(1.1), (k + frame) % 3 ? STAR.cyan : STAR.magenta, { form: 'flat', level: 4 });
  }
  // the beam
  const beam = frame % 2 ? 3 : 2;
  for (let y = S(10); y < S(42); y++)
    for (let x = S(14); x < S(34); x++) {
      const d = Math.hypot((x - S(24)) / S(15.5), (y - S(24)) / S(15.5));
      if (d > 1) continue;
      if ((x + y + frame) % 3 === 0 || Math.abs(x - S(24)) < S(3)) p.dot(x, y, BODY.oxygen, d < 0.5 ? beam + 1 : beam);
    }
  return p.toBuffer();
}

/** A med bed (2.5 tiles wide) with a blanket. */
export function paintMedBed(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(40 * u), Math.round(22 * u));
  for (const x of [4, 34]) p.rect(S(x), S(12), S(2.5), S(10), STAR.trim, { form: 'cylV', box: [S(x), 0, S(2.5), S(22)] });
  p.rect(S(2), S(8), S(36), S(6), STAR.white, { form: 'cylV', box: [S(2), S(8), S(36), S(6)], sep: true });
  p.rect(S(2), S(4), S(9), S(6), STAR.white, { form: 'sphere', sep: true });
  p.rect(S(12), S(6.5), S(26), S(5), ramp('#5fbfe8'), { form: 'cylV', box: [S(12), S(6.5), S(26), S(5)], sep: true });
  for (let x = 14; x < 37; x += 4) p.line(S(x), S(7), S(x), S(11), ramp('#5fbfe8'), 1, { onlyOver: true });
  return p.toBuffer();
}

/** The body-map screen on the med bay wall: a body outline with the organs to visit (lit = healed). */
export function paintBodyMap(T: number, lit: number[] = [], frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(30 * u), Math.round(40 * u));
  p.rect(0, 0, S(30), S(40), STAR.trim, { form: 'flat', level: 1, sep: true });
  p.rect(S(1.5), S(1.5), S(27), S(37), STAR.glass, { form: 'flat', level: 1 });
  const line = ramp('#7ff0ff');
  // a simple body outline (head, body, arms, legs)
  p.ellipse(S(15), S(7), S(3.4), S(3.8), line, { form: 'flat', level: 1 });
  p.capsule(S(15), S(14), S(15), S(24), S(5.4), line, { form: 'flat', level: 1 });
  for (const k of [-1, 1]) {
    p.capsule(S(15) + k * S(5.6), S(13.5), S(15) + k * S(8.4), S(24), S(1.6), line, { form: 'flat', level: 1 });
    p.capsule(S(15) + k * S(2.6), S(28), S(15) + k * S(3.2), S(36), S(1.8), line, { form: 'flat', level: 1 });
  }
  // organ dots: brain, mouth, lungs, heart, gut, skin (knee)
  const organs: Array<[number, number, string]> = [
    [15, 6.4, '#ffcf6a'],
    [15, 9.4, '#ff9fb0'],
    [12.8, 15.4, '#ff8fd0'],
    [16.2, 16.6, '#ff6f6f'],
    [15, 21.6, '#7dea8a'],
    [17.4, 31.5, '#ffb547'],
  ];
  organs.forEach(([x, y, c], i) => {
    const on = lit.includes(i);
    p.ellipse(S(x), S(y), S(1.4), S(1.4), ramp(on ? c : '#4a5a7e'), { form: 'flat', level: on ? 4 : 2 });
    if (on && frame % 2) p.ellipse(S(x), S(y), S(0.6), S(0.6), ramp('#ffffff'), { form: 'flat', level: 2 });
  });
  return p.toBuffer({ outline: false });
}

export type { Ramp };
