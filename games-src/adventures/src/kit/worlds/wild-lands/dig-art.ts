import { PixelBuffer } from '../../art/pixel';
import type { Look16 } from '../hero16';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { WILD } from './art';

/**
 * Wild Lands art for the dig site (Fossil Dig Adventure, the second Wild
 * Lands game): the badlands palette, the people (Dr. Mateo Ruiz, Hana Sato,
 * Sam Bello; draft names), Pebble the camp's sniffer dog, the dig's props,
 * the 16 fossils of the Fossil Drawer and the young Triceratops skeleton.
 *
 * The same 16-bit painter and rules as the rest of the world: designs are
 * written at 16 pixels per tile and scaled by u = T / 16, warm sunlit edges
 * and cool shadows. Fossils are painted in stone colors (minerals have
 * replaced the bone), never as fresh bones.
 */

const U = (T: number) => T / 16;

export const DIG = {
  /** The badlands: striped clay hills in tan, rust, cream and gray. */
  tan: ramp('#d8a86a', { warm: 1.2 }),
  rust: ramp('#c26a44', { warm: 1.2 }),
  cream: ramp('#ead2a0'),
  ash: ramp('#a8a094'),
  clay: ramp('#b88a5a'),
  dust: ramp('#d8b884'),
  /** The rock layers of the cliff, oldest (bottom) first. */
  seaRock: ramp('#9aa8a8'),
  swampRock: ramp('#5a5850'),
  coal: ramp('#3a3834'),
  riverRock: ramp('#c8875a'),
  iceRock: ramp('#b0a088'),
  topsoil: ramp('#8a6a46'),
  /** Fossils: bone turned to stone (warm brown-gray), shells (cool gray), amber. */
  bone: ramp('#b89a74'),
  bone2: ramp('#8a6e52'),
  shell: ramp('#a8a49a'),
  amber: ramp('#f2a02f'),
  plaster: ramp('#f2eee0'),
  string: '#f2e6c8',
  sage: ramp('#8aa070'),
  creek: ramp('#5aa0b0'),
  mudflat: ramp('#9a8060'),
  uv: '#7a3cff',
} as const;

// ------------------------------------------------------------------ the people (draft names)

/** Dr. Mateo Ruiz, the paleontologist who runs the dig (Fossil Dig Adventure's host). */
export const MATEO_RUIZ: Look16 = {
  build: 'adult',
  skin: '#b5835a',
  hair: { style: 'short', color: '#2a201c' },
  top: { color: '#3f6a9a', trim: '#e6d2a0', kind: 'jumpsuit' },
  legs: '#8a7a5a',
  shoes: '#5a3a24',
  sole: '#2a2420',
  belt: '#5a3a24',
  badge: '#f2c94c',
};

/** Hana Sato, the geologist who reads the rock layers (the Cliff Wall). */
export const HANA_SATO: Look16 = {
  build: 'adult',
  skin: '#e2b894',
  hair: { style: 'wrap', color: '#1a1618', tie: '#f2902f' },
  top: { color: '#f2902f', trim: '#f2c94c', kind: 'jumpsuit' },
  legs: '#3f4a6b',
  shoes: '#6a4a2a',
  sole: '#2a2420',
  belt: '#3f4a6b',
  badge: '#f2f4ec',
};

/** Sam Bello, the fossil preparator in the lab tent (the Prep Lab). */
export const SAM_BELLO: Look16 = {
  build: 'adult',
  skin: '#6a4430',
  hair: { style: 'locs', color: '#1e1814', tie: '#3fae5a' },
  top: { color: '#f2f4ec', trim: '#2f8fa8', kind: 'robe' },
  legs: '#3a4a5a',
  shoes: '#2a2a2a',
  sole: '#f2f4ec',
  beads: ['#2f8fa8', '#f2c94c'],
};

// ------------------------------------------------------------------ Pebble the sniffer dog

const FUR = ramp('#c8925a', { warm: 1.2 });
const FUR2 = ramp('#f2e2c4');

/**
 * Pebble, the camp's dog: a sandy, scruffy terrier mix with a white chest,
 * one dark ear and a teal bandana. Side view facing right.
 * Frames: 0 standing, 1 tail wag, 2 sniffing (nose down), 3 walking.
 */
export function paintPebble(T: number, frame = 0, face: 'left' | 'right' = 'right'): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(22 * u), Math.round(17 * u));
  const sniff = frame === 2;
  const step = frame === 3 ? 1 : 0;
  // the tail (up and curly; wags on frame 1)
  const tail = frame === 1 ? 2 : 0;
  p.capsule(S(3.6), S(8), S(1.4 + tail * 0.3), S(3.4 - tail * 0.5), S(1.1), FUR, { sep: true });
  // the legs behind, then the body
  p.capsule(S(6 - step), S(11), S(5.4 - step), S(15.6), S(1.1), FUR, {});
  p.capsule(S(14 + step), S(11), S(14.6 + step), S(15.6), S(1.1), FUR, {});
  p.ellipse(S(10), S(10), S(6.6), S(3.6), FUR, { sep: true });
  p.ellipse(S(13.6), S(11.6), S(2.4), S(2.2), FUR2, { form: 'flat', level: 3 });
  p.capsule(S(7.6 + step), S(12), S(7.8 + step), S(15.8), S(1.1), FUR, { sep: true });
  p.capsule(S(12.6 - step), S(12), S(12.4 - step), S(15.8), S(1.1), FUR, { sep: true });
  for (const x of [5.4 - step, 7.8 + step, 12.4 - step, 14.6 + step]) p.ellipse(S(x + 0.4), S(15.8), S(1.2), S(0.7), FUR2, { form: 'flat', level: 3 });
  // the head (lowered when sniffing)
  const hx = sniff ? 17.6 : 16.6;
  const hy = sniff ? 10.6 : 6.4;
  p.capsule(S(14), S(8), S(hx - 1), S(hy + 1), S(2.2), FUR, { sep: true });
  p.ellipse(S(hx), S(hy), S(3.2), S(2.8), FUR, { sep: true });
  p.ellipse(S(hx + 2.6), S(hy + 1), S(1.8), S(1.4), FUR2, { sep: true });
  p.ellipse(S(hx + 4.1), S(hy + 0.6), S(0.9), S(0.8), WILD.dark, { form: 'flat', level: 1 });
  p.pix(S(hx + 0.8), S(hy - 0.6), '#1a1210');
  p.pix(S(hx + 0.8) + 1, S(hy - 0.6) - 1, '#ffffff');
  // ears: one sandy, one dark
  p.poly(
    [
      [S(hx - 2.6), S(hy - 1.4)],
      [S(hx - 1.6), S(hy - 4.4)],
      [S(hx - 0.4), S(hy - 1.8)],
    ],
    ramp('#5a3a24'),
    { sep: true },
  );
  // the teal bandana
  p.poly(
    [
      [S(13.6), S(7.4)],
      [S(16.4), S(9.2)],
      [S(14), S(11.2)],
    ],
    ramp('#2f8fa8'),
    { sep: true },
  );
  if (sniff) for (let k = 0; k < 3; k++) p.pix(S(hx + 5 + k), S(hy + 3 - k), '#ead2a0');
  const out = p.toBuffer();
  return face === 'left' ? out.flipX() : out;
}

/** Pebble in the talk box: a happy, tongue-out close-up. */
export function paintPebblePortrait(happy = true): PixelBuffer {
  const p = new Paint(72, 72);
  for (let y = 0; y < 72; y++) for (let x = 0; x < 72; x++) p.pix(x, y, mixHex('#f2c08a', '#c26a44', y / 72));
  p.ellipse(36, 70, 26, 14, ramp('#2f8fa8'), { sep: true });
  p.ellipse(36, 42, 22, 20, FUR, { sep: true });
  p.ellipse(36, 52, 12, 9, FUR2, { sep: true });
  p.ellipse(36, 46, 4.4, 3.2, ramp('#2a1d1a'), { form: 'flat', level: 1 });
  p.pix(35, 45, '#ffffff');
  // ears: sandy flop on the left, dark on the right
  p.poly(
    [
      [16, 30],
      [10, 46],
      [22, 38],
    ],
    FUR,
    { sep: true },
  );
  p.poly(
    [
      [56, 30],
      [62, 46],
      [50, 38],
    ],
    ramp('#5a3a24'),
    { sep: true },
  );
  for (const x of [27, 45]) {
    p.ellipse(x, 36, 3, 3.4, ramp('#1a1210'), { form: 'flat', level: 1 });
    p.pix(x - 1, 34, '#ffffff');
  }
  const mouth = '#5a3a1a';
  if (happy) {
    for (let k = -5; k <= 5; k++) p.pix(36 + k, 55 + Math.round((25 - k * k) / 10), mouth);
    p.ellipse(37, 60, 3, 3.6, ramp('#ff7fa8'), { form: 'flat', level: 3 });
  } else for (let k = -4; k <= 4; k++) p.pix(36 + k, 57, mouth);
  return p.toBuffer();
}

// ------------------------------------------------------------------ the dig's props

/** A tool rack: a long-handled shovel, a rock pick and a fan of brushes in a bucket. */
export function paintToolRack(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(22 * u), Math.round(28 * u));
  for (const x of [3, 19]) p.rect(S(x - 0.8), S(6), S(1.6), S(22), WILD.wood, { form: 'cylV', box: [S(x - 0.8), S(6), S(1.6), S(22)] });
  p.rect(S(1.4), S(6), S(19), S(1.6), WILD.wood, { sep: true });
  // the shovel
  p.rect(S(6.4), S(7), S(1.2), S(14), WILD.wood, {});
  p.poly(
    [
      [S(4.8), S(20)],
      [S(9.2), S(20)],
      [S(8.4), S(26)],
      [S(5.6), S(26)],
    ],
    WILD.metal,
    { sep: true },
  );
  // the rock pick
  p.rect(S(12), S(9), S(1.2), S(13), WILD.wood, {});
  p.poly(
    [
      [S(9), S(9)],
      [S(16), S(8)],
      [S(16.4), S(9.4)],
      [S(9), S(10.2)],
    ],
    WILD.metal,
    { sep: true },
  );
  // the bucket of brushes
  p.rect(S(14), S(21), S(6), S(6.4), ramp('#c26a44'), { sep: true, form: 'cylV', box: [S(14), S(21), S(6), S(6.4)] });
  for (const [x, c] of [
    [15, '#f2c94c'],
    [17, '#e0503a'],
    [19, '#3a7ad8'],
  ] as const) {
    p.line(S(x), S(21), S(x + 0.3), S(16), WILD.wood, 2);
    p.rect(S(x - 0.6), S(14.4), S(1.6), S(2), ramp(c), { level: 3 });
  }
  return p.toBuffer();
}

/** A sieve on legs for sifting dirt (tiny teeth and bones turn up in the screen). */
export function paintSieve(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(22 * u), Math.round(16 * u));
  for (const x of [3, 19]) p.line(S(x), S(6), S(x + (x < 10 ? -1 : 1)), S(15.6), WILD.wood, 2);
  p.rect(S(1), S(4), S(20), S(4), WILD.wood, { sep: true });
  for (let x = 2; x < 20; x += 1.4) for (let y = 4.6; y < 7.6; y += 1.4) p.pix(S(x), S(y), '#5a4a3a');
  p.ellipse(S(11), S(5.4), S(4), S(1), DIG.dust, { form: 'flat', level: 3 });
  return p.toBuffer();
}

/** A fossil wrapped in a white plaster jacket (to carry it safely), labeled with the find's number. */
export function paintJacket(T: number, n = 7): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(12 * u));
  p.ellipse(S(10), S(7), S(9), S(4.6), DIG.plaster, { sep: true, form: 'sphere' });
  for (let k = 0; k < 4; k++) p.line(S(3 + k * 4.4), S(3.2), S(2 + k * 4.4), S(10.8), DIG.plaster, 2);
  // the find number, written in marker
  const dk = ramp('#2a2a3a');
  p.rect(S(7), S(5.4), S(1), S(3), dk, { level: 1 });
  p.rect(S(9.4), S(5.4), S(3), S(1), dk, { level: 1 });
  p.rect(S(11.4), S(5.4), S(1), S(3 + (n % 2)), dk, { level: 1 });
  return p.toBuffer();
}

/** A wheelbarrow of dirt. */
export function paintWheelbarrow(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(26 * u), Math.round(16 * u));
  p.line(S(12), S(9), S(25), S(13), WILD.wood, 2);
  p.poly(
    [
      [S(1), S(4)],
      [S(17), S(4)],
      [S(14), S(11)],
      [S(4), S(11)],
    ],
    ramp('#3f7a5a'),
    { sep: true, form: 'cylH', box: [S(1), S(4), S(16), S(7)] },
  );
  p.ellipse(S(9), S(4), S(7), S(2.4), DIG.dust, { sep: true });
  p.ellipse(S(8), S(13), S(2.6), S(2.6), WILD.dark, { sep: true });
  p.ellipse(S(8), S(13), S(1), S(1), WILD.metal, { form: 'flat', level: 3 });
  return p.toBuffer();
}

/** A sagebrush clump. */
export function paintSage(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(11 * u));
  for (let k = 0; k < 7; k++) {
    const x = 3 + hash(k, seed, 3) * 10;
    const y = 3 + hash(k, seed, 4) * 4;
    p.ellipse(S(x), S(y), S(2.6), S(2), DIG.sage, { sep: true, dither: true });
  }
  p.line(S(8), S(9), S(8), S(11), WILD.bark, 1);
  return p.toBuffer();
}

/** A juniper bush: dark green and twisty, the one tree that grows in the badlands. */
export function paintJuniper(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(24 * u), Math.round(30 * u));
  p.capsule(S(12), S(29), S(11 + hash(seed, 1, 7) * 2), S(16), S(1.6), WILD.bark, { sep: true });
  p.capsule(S(12), S(22), S(7), S(15), S(1), WILD.bark, {});
  const g = ramp('#4a7a52');
  for (let k = 0; k < 9; k++) p.ellipse(S(5 + hash(k, seed, 8) * 14), S(5 + hash(k, seed, 9) * 12), S(4), S(3.4), g, { sep: true, dither: true });
  return p.toBuffer();
}

/** The field museum: a small wooden building with a sign and big windows (its display cases light up as stations are finished). */
export function paintMuseum(T: number, lit = 0, night = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(60 * u), Math.round(44 * u));
  const wall = ramp('#c8a070');
  p.rect(S(4), S(14), S(52), S(29), wall, { sep: true, form: 'cylH', box: [S(4), S(14), S(52), S(29)] });
  for (let y = 16; y < 43; y += 3) p.line(S(4), S(y), S(56), S(y), wall, 1, { onlyOver: true });
  p.poly(
    [
      [S(0), S(15)],
      [S(30), S(2)],
      [S(60), S(15)],
    ],
    ramp('#8a4a3a'),
    { sep: true, form: 'sphere', box: [S(0), S(2), S(60), S(13)] },
  );
  // the sign
  p.rect(S(18), S(9), S(24), S(5), ramp('#f2e6c8'), { sep: true });
  const ink = ramp('#5a3a24');
  for (let k = 0; k < 7; k++) p.rect(S(20 + k * 2.9), S(10.4), S(1.8), S(2.2), ink, { level: 1 });
  // four windows (display cases) that glow when lit, and the door
  for (let k = 0; k < 4; k++) {
    const x = 7 + k * (k < 2 ? 9 : 9) + (k >= 2 ? 16 : 0);
    const on = k < lit;
    p.rect(S(x), S(20), S(7), S(9), ramp(on ? (night ? '#ffe08a' : '#fff2c0') : night ? '#2a3a5a' : '#7a9ab0'), { sep: true, level: on ? 4 : 2 });
    p.line(S(x), S(24.5), S(x + 7), S(24.5), wall, 1);
  }
  p.rect(S(26), S(28), S(8), S(15), ramp('#7a5236'), { sep: true });
  p.pix(S(32.6), S(36), '#f2c94c');
  return p.toBuffer();
}

/** A trackway sign post by the creek. */
export function paintSignPost(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(22 * u));
  p.rect(S(7.2), S(8), S(1.6), S(14), WILD.wood, { form: 'cylV', box: [S(7.2), S(8), S(1.6), S(14)] });
  p.rect(S(1), S(2), S(14), S(7), WILD.plank, { sep: true });
  // a three-toed footprint painted on the sign
  const ink = ramp('#5a3a24');
  p.ellipse(S(8), S(6.6), S(1.4), S(1.1), ink, { level: 1 });
  for (const a of [-0.6, 0, 0.6]) p.line(S(8), S(6), S(8 + Math.sin(a) * 2.6), S(6 - Math.cos(a) * 2.6), ink, 1);
  return p.toBuffer();
}

// ------------------------------------------------------------------ the fossils (the Fossil Drawer)

export type FossilId =
  | 'trex-tooth'
  | 'trike-horn'
  | 'raptor-claw'
  | 'pterosaur-bone'
  | 'trilobite'
  | 'ammonite'
  | 'fern'
  | 'fish'
  | 'mammoth-tusk'
  | 'shark-tooth'
  | 'coprolite'
  | 'footprint'
  | 'burrow'
  | 'amber'
  | 'petrified-wood'
  | 'eggshell';

export const FOSSIL_IDS: FossilId[] = [
  'trilobite',
  'fish',
  'ammonite',
  'shark-tooth',
  'fern',
  'petrified-wood',
  'amber',
  'trex-tooth',
  'trike-horn',
  'raptor-claw',
  'pterosaur-bone',
  'eggshell',
  'footprint',
  'burrow',
  'coprolite',
  'mammoth-tusk',
];

/** A chunk of rock for a fossil to sit in (the "matrix"). */
function matrix(p: Paint, S: (v: number) => number, w: number, h: number, r: Ramp, seed: number): void {
  p.shape(
    (x, y) => {
      const nx = (x - S(w / 2)) / S(w / 2);
      const ny = (y - S(h / 2)) / S(h / 2);
      const a = Math.atan2(ny, nx);
      const rr = 0.92 + Math.sin(a * 3 + seed) * 0.05 + Math.sin(a * 7 + seed * 2) * 0.03;
      return nx * nx + ny * ny < rr * rr;
    },
    [0, 0, S(w), S(h)],
    r,
    { sep: true, form: 'sphere', dither: true },
  );
  for (let k = 0; k < 10; k++) p.dot(S(hash(k, seed, 5) * w), S(hash(k, seed, 6) * h), r, 1);
}

/**
 * One fossil, painted at scale `s` (1 = about 16 x 16 pixels). `uv` paints it
 * as it looks under the ultraviolet lamp in the Glow Room: the room dark
 * purple, and the parts that glow (minerals in some bones, shells and
 * amber) lit in their glow color.
 */
export function paintFossil(id: FossilId, s = 1, uv = false): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(18 * s), Math.round(18 * s));
  const B = uv ? ramp('#3a2a6a') : DIG.bone;
  const B2 = uv ? ramp('#2a1e52') : DIG.bone2;
  const SH = uv ? ramp('#2a2058') : DIG.shell;
  const glowC = (c: string) => (uv ? ramp(c) : null);
  switch (id) {
    case 'trex-tooth': {
      // a long, curved tooth with saw-edges (serrations) along the back
      p.poly(
        [
          [S(6), S(16)],
          [S(12), S(16)],
          [S(11), S(9)],
          [S(8), S(1.6)],
          [S(6.4), S(8)],
        ],
        glowC('#7dffb0') ?? ramp('#c8b08a'),
        { sep: true, form: 'sphere' },
      );
      for (let y = 4; y < 14; y += 1.6) p.pix(S(10.6 + (y - 4) * 0.08), S(y), uv ? '#bfffd8' : '#7a6a52');
      p.rect(S(5.6), S(15), S(7), S(2.4), B2, { sep: true });
      break;
    }
    case 'trike-horn': {
      // a brow horn: long, pointed and a little curved, with its base
      p.poly(
        [
          [S(2), S(16)],
          [S(9), S(16.4)],
          [S(15.6), S(2)],
          [S(13), S(3.4)],
        ],
        glowC('#ffd07a') ?? B,
        { sep: true, form: 'sphere' },
      );
      for (let k = 0; k < 4; k++) p.line(S(4 + k * 2), S(15), S(12 + k * 0.6), S(5), B2, 2, { onlyOver: true });
      break;
    }
    case 'raptor-claw': {
      // the big curved killing claw from the second toe (about as long as a finger)
      for (let t = 0; t <= 1; t += 0.02) {
        const a = Math.PI * (0.9 + t * 0.9);
        const r = S(6.4);
        const w = S(2.6 * (1 - t) + 0.4);
        p.ellipse(S(10) + Math.cos(a) * r, S(10) + Math.sin(a) * r, w, w, glowC('#ff9af2') ?? B, {});
      }
      p.ellipse(S(4.6), S(12.6), S(3), S(2.4), B2, { sep: true });
      break;
    }
    case 'pterosaur-bone': {
      // a long, thin, hollow wing bone with knobby ends
      p.capsule(S(2.4), S(14), S(15.6), S(4), S(1.4), B, { sep: true });
      p.ellipse(S(2.6), S(14), S(2.2), S(1.8), B, { sep: true });
      p.ellipse(S(15.4), S(4), S(2.2), S(1.8), B, { sep: true });
      p.ellipse(S(15.4), S(4), S(0.8), S(0.6), B2, { form: 'flat', level: 1 });
      break;
    }
    case 'trilobite': {
      // three lobes from side to side, three parts head to tail, in a gray stone
      matrix(p, S, 18, 18, uv ? ramp('#241a44') : ramp('#7a7a72'), 1);
      const tb = glowC('#7af0ff') ?? SH;
      p.ellipse(S(9), S(5.4), S(5), S(2.8), tb, { sep: true });
      for (let k = 0; k < 6; k++) p.ellipse(S(9), S(8 + k * 1.2), S(4.6 - k * 0.5), S(0.9), tb, { sep: true });
      p.line(S(9), S(4.4), S(9), S(14.6), ramp(uv ? '#2a2058' : '#6a665e'), 1);
      p.line(S(7.4), S(7), S(7.6), S(14), ramp(uv ? '#2a2058' : '#6a665e'), 1);
      p.line(S(10.6), S(7), S(10.4), S(14), ramp(uv ? '#2a2058' : '#6a665e'), 1);
      for (const x of [6.6, 11.4]) p.ellipse(S(x), S(5), S(0.9), S(0.7), ramp('#2a2a2a'), { form: 'flat', level: 1 });
      break;
    }
    case 'ammonite': {
      // a coiled shell with ribs, the coils getting smaller toward the middle
      const c = glowC('#ffb04a') ?? ramp('#b89a7a');
      p.ellipse(S(9), S(9), S(8), S(8), c, { sep: true, form: 'sphere' });
      for (let t = 0; t < 1; t += 0.004) {
        const a = t * Math.PI * 6;
        const r = S(7.6) * (1 - t);
        p.dot(S(9) + Math.cos(a) * r, S(9) + Math.sin(a) * r, c, 1);
      }
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        p.line(S(9) + Math.cos(a) * S(5.4), S(9) + Math.sin(a) * S(5.4), S(9) + Math.cos(a) * S(7.6), S(9) + Math.sin(a) * S(7.6), c, 3, { onlyOver: true });
      }
      break;
    }
    case 'fern': {
      // a fern frond pressed into dark shale
      matrix(p, S, 18, 18, uv ? ramp('#1e1640') : ramp('#6a6860'), 3);
      const f = glowC('#c8ff7a') ?? ramp('#c8c4b0');
      p.line(S(4), S(15), S(14), S(3), f, 3);
      for (let k = 1; k < 9; k++) {
        const x = S(4 + k * 1.1);
        const y = S(15 - k * 1.33);
        const len = S(3.4 - k * 0.25);
        p.line(x, y, x - len, y - len * 0.5, f, 2);
        p.line(x, y, x + len * 0.6, y + len * 0.2 + S(0.4), f, 2);
      }
      break;
    }
    case 'fish': {
      // a whole fish skeleton in a flat slab of stone
      matrix(p, S, 18, 14, uv ? ramp('#241a44') : ramp('#c8b08a'), 4);
      const f = glowC('#7af0ff') ?? ramp('#6a5a46');
      p.ellipse(S(9.6), S(7), S(5.6), S(2.4), f, { form: 'flat', level: 2 });
      p.ellipse(S(9.6), S(7), S(4.8), S(1.6), uv ? ramp('#241a44') : ramp('#c8b08a'), { form: 'flat', level: 2 });
      p.line(S(4), S(7), S(15), S(7), f, 1);
      for (let x = 5.6; x < 14; x += 1.2) p.line(S(x), S(5.2), S(x), S(8.8), f, 2);
      p.poly(
        [
          [S(3.6), S(7)],
          [S(1.4), S(4.6)],
          [S(1.4), S(9.4)],
        ],
        f,
        { form: 'flat', level: 2 },
      );
      p.ellipse(S(14.6), S(6.4), S(0.8), S(0.8), f, { form: 'flat', level: 1 });
      break;
    }
    case 'mammoth-tusk': {
      // a long, spiraling tusk (it is ivory, a tooth that kept growing)
      for (let t = 0; t <= 1; t += 0.015) {
        const x = S(1.6 + t * 14);
        const y = S(14 - Math.sin(t * Math.PI * 0.9) * 10 + t * 2);
        const w = S(2.2 * (1 - t * 0.7) + 0.3);
        p.ellipse(x, y, w, w, glowC('#bfe8ff') ?? ramp('#e6d8b4'), {});
      }
      for (let k = 0; k < 6; k++) p.pix(S(3 + k * 2.2), S(12.6 - Math.sin(k * 0.4) * 6), uv ? '#e6f6ff' : '#b8a684');
      break;
    }
    case 'shark-tooth': {
      // a wide, triangle tooth with a dark root, from an ancient sea
      p.poly(
        [
          [S(3), S(13)],
          [S(15), S(13)],
          [S(9), S(1.6)],
        ],
        glowC('#7af0ff') ?? ramp('#5a5a62'),
        { sep: true, form: 'sphere' },
      );
      p.rect(S(3), S(12.4), S(12), S(3.6), uv ? ramp('#2a1e52') : ramp('#8a6e52'), { sep: true });
      break;
    }
    case 'coprolite': {
      // fossil poop: a lumpy brown stone (it shows what an animal ate)
      const c = uv ? ramp('#3a2a6a') : ramp('#8a6a4a');
      p.ellipse(S(6), S(11), S(4.6), S(3.6), c, { sep: true });
      p.ellipse(S(11), S(10), S(4.4), S(3.4), c, { sep: true });
      p.ellipse(S(9), S(6.8), S(3.4), S(2.8), c, { sep: true });
      for (let k = 0; k < 6; k++) p.pix(S(5 + hash(k, 1, 8) * 9), S(7 + hash(k, 2, 8) * 5), uv ? '#ffd07a' : '#c8b08a');
      break;
    }
    case 'footprint': {
      // a three-toed dinosaur footprint pressed into a slab of mudstone
      matrix(p, S, 18, 18, uv ? ramp('#241a44') : ramp('#b88a5a'), 5);
      const dk = uv ? ramp('#120c28') : ramp('#7a5236');
      p.ellipse(S(9), S(12.6), S(2.6), S(2.4), dk, { form: 'flat', level: 1 });
      for (const a of [-0.55, 0, 0.55]) p.capsule(S(9), S(11.6), S(9 + Math.sin(a) * 6.4), S(11.6 - Math.cos(a) * 6.4), S(1.2), dk, { form: 'flat', level: 1 });
      break;
    }
    case 'burrow': {
      // a tube where a worm or a little animal dug through the sand (a trace fossil)
      matrix(p, S, 18, 18, uv ? ramp('#241a44') : ramp('#d8b884'), 6);
      const c = glowC('#c8ff7a') ?? ramp('#9a7a52');
      for (let t = 0; t <= 1; t += 0.02) p.ellipse(S(3 + t * 12), S(4 + Math.sin(t * 7) * 2 + t * 9), S(1.3), S(1.3), c, { form: 'flat', level: 2 });
      break;
    }
    case 'amber': {
      // a drop of golden amber (old tree sap turned hard) with a tiny insect inside
      p.ellipse(S(9), S(9.6), S(7), S(6.4), uv ? ramp('#5a8aff') : DIG.amber, { sep: true, form: 'sphere', bias: 0.2 });
      p.ellipse(S(9.4), S(10), S(1.6), S(0.9), ramp('#3a1e0a'), { form: 'flat', level: 1 });
      for (const [dx, dy] of [
        [-1.4, -0.6],
        [1.6, -0.8],
        [-1.2, 1],
        [1.6, 1],
      ])
        p.pix(S(9.4 + dx), S(10 + dy), '#3a1e0a');
      p.pix(S(6.4), S(6.4), '#ffffff');
      break;
    }
    case 'petrified-wood': {
      // a slice of a tree trunk turned to stone, its rings now colored minerals
      p.ellipse(S(9), S(9), S(8), S(7.4), uv ? ramp('#2a1e52') : ramp('#8a5a3a'), { sep: true });
      const ringCols = uv ? ['#5affb0', '#7a3cff', '#5affb0', '#9a62ff'] : ['#c87a4a', '#e0a070', '#a86a8a', '#d89a6a'];
      for (let k = 0; k < 4; k++) p.ellipse(S(9), S(9), S(6.4 - k * 1.5), S(5.8 - k * 1.4), ramp(ringCols[k]), { form: 'flat', level: 2 });
      p.line(S(9), S(9), S(15), S(6), ramp(uv ? '#bfffd8' : '#5a3a24'), 1);
      break;
    }
    case 'eggshell': {
      // pieces of a dinosaur egg's shell, bumpy on the outside
      const c = glowC('#ffd07a') ?? ramp('#a8987a');
      const bits: Array<[number, number, number]> = [
        [5, 7, 3.6],
        [11, 6, 3],
        [8, 12, 3.4],
        [13.6, 12, 2.4],
      ];
      for (const [x, y, r] of bits) {
        p.poly(
          [
            [S(x - r), S(y)],
            [S(x - r * 0.3), S(y - r)],
            [S(x + r), S(y - r * 0.4)],
            [S(x + r * 0.5), S(y + r * 0.8)],
          ],
          c,
          { sep: true, form: 'sphere' },
        );
        for (let k = 0; k < 4; k++) p.pix(S(x - 1 + k * 0.8), S(y - 0.4 + (k % 2)), uv ? '#ffe8a0' : '#7a6a52');
      }
      break;
    }
  }
  return p.toBuffer();
}

/** Does this fossil glow under the ultraviolet lamp? (Many shells, bones, amber and petrified wood do; dull stones don't.) */
export function glowsUnderUV(id: FossilId): boolean {
  return id !== 'coprolite' && id !== 'footprint' && id !== 'pterosaur-bone';
}

// ------------------------------------------------------------------ the young Triceratops skeleton

/** The skeleton's bones, in the order the four stations add them, then the rest. */
export const SKELETON_PARTS = ['skull', 'backbone', 'legs', 'tail'] as const;
export type SkeletonPart = (typeof SKELETON_PARTS)[number];

/**
 * The young Triceratops skeleton in the field museum, side view facing right,
 * on a little stand. Parts not yet found are drawn as a faint dashed outline.
 * Scale `s`: 1 = about 64 x 36 pixels.
 */
export function paintSkeleton(s = 1, have: readonly SkeletonPart[] = SKELETON_PARTS, uv = false): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(66 * s), Math.round(40 * s));
  const B = uv ? ramp('#ffd07a') : DIG.bone;
  const ghost = ramp(uv ? '#3a2a6a' : '#d8ccb4');
  const got = (k: SkeletonPart) => have.includes(k);
  const r = (k: SkeletonPart) => (got(k) ? B : ghost);
  const o = (k: SkeletonPart) => (got(k) ? { sep: true as const } : { form: 'flat' as const, level: 3 });
  // the stand
  p.rect(S(10), S(37), S(46), S(2.4), ramp('#7a5236'), { sep: true });
  for (const x of [24, 40]) p.rect(S(x), S(26), S(1.2), S(11), ramp('#5a5a62'), {});
  // the tail: a row of shrinking bones
  for (let k = 0; k < 9; k++) p.ellipse(S(16 - k * 1.7), S(22 + k * 1.1), S(1.6 - k * 0.1), S(1.2 - k * 0.08), r('tail'), o('tail'));
  // the backbone and ribs
  for (let k = 0; k < 12; k++) {
    const x = S(17 + k * 2.4);
    const y = S(19 - Math.sin((k / 11) * Math.PI) * 3);
    p.ellipse(x, y, S(1.3), S(1.2), r('backbone'), o('backbone'));
    if (k > 1 && k < 11) p.line(x, y + S(1), x - S(0.6), y + S(7 - Math.abs(k - 6) * 0.4), r('backbone'), 2);
  }
  // the hips and the legs (thick, for a heavy plant-eater)
  p.ellipse(S(20), S(20), S(4), S(3), r('legs'), o('legs'));
  for (const [x, back] of [
    [19, true],
    [22, true],
    [41, false],
    [44, false],
  ] as const) {
    p.capsule(S(x), S(back ? 22 : 24), S(x + (back ? -0.6 : 0.6)), S(30), S(1.4), r('legs'), o('legs'));
    p.capsule(S(x + (back ? -0.6 : 0.6)), S(30), S(x), S(36), S(1.1), r('legs'), o('legs'));
    p.rect(S(x - 1.4), S(35.6), S(3.4), S(1.4), r('legs'), o('legs'));
  }
  // the skull: a big frill, two long brow horns, a short nose horn and a beak
  p.poly(
    [
      [S(46), S(14)],
      [S(49), S(3)],
      [S(55), S(9)],
      [S(54), S(19)],
    ],
    r('skull'),
    o('skull'),
  );
  for (let k = 0; k < 5; k++) p.pix(S(49 + k * 1.1), S(4 + k * 1.2), uv ? '#ffe8a0' : '#8a6e52');
  p.poly(
    [
      [S(51), S(13)],
      [S(62), S(15)],
      [S(64), S(19)],
      [S(57), S(22)],
      [S(51), S(20)],
    ],
    r('skull'),
    o('skull'),
  );
  p.line(S(55), S(12), S(62), S(5), r('skull'), 3);
  p.line(S(56), S(13), S(63), S(7), r('skull'), 2);
  p.line(S(61), S(15), S(63), S(12.6), r('skull'), 3);
  if (got('skull')) p.ellipse(S(55.6), S(15.4), S(1.2), S(1), ramp('#2a2420'), { form: 'flat', level: 1 });
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the ultraviolet lamp

/** A hand-held ultraviolet lamp: a black tube with a violet glowing window. */
export function paintUVLamp(T: number, on = true): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(8 * u));
  p.rect(S(1), S(2), S(14), S(4.6), ramp('#2a2a32'), { sep: true, form: 'cylH', box: [S(1), S(2), S(14), S(4.6)] });
  p.rect(S(4), S(3), S(9), S(2.6), ramp(on ? DIG.uv : '#4a4a5a'), { level: on ? 4 : 2 });
  return p.toBuffer();
}
