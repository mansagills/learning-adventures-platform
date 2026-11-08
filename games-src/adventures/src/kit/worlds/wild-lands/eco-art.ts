import { PixelBuffer } from '../../art/pixel';
import type { Look16 } from '../hero16';
import { Paint, mixHex, ramp } from '../shade';
import { paintAnimal } from './animal-art';
import { paintButterfly, paintFrog, paintHeron, paintMushrooms, WILD } from './art';

/**
 * Ecosystem Building Tycoon art (the fifth Wild Lands game, a roguelike
 * ecosystem builder; the plan is in docs/GAMES_3D_UPGRADE_PLAN.md):
 * the cast (Warden Nia Achieng, Lupe Fonoti, Theo Park and Bramble the
 * hedgehog), the island's ground tiles and the tile pieces: plants,
 * animals, decomposers and features. Each piece fits on one 24-pixel tile
 * (trees and the deer stand a little taller). Designs are written at 16
 * pixels per tile and scaled by u = T / 16, like the rest of the world.
 * Animals are friendly and never shown hurt. Kept out of the shared lists.
 */

const U = (T: number) => T / 16;
const INK = '#1e1a24';

// ------------------------------------------------------------------ the people

/** Warden Nia Achieng, the ecologist who runs the island restoration program (the host). */
export const NIA_ACHIENG: Look16 = {
  build: 'adult',
  skin: '#5a3626',
  hair: { style: 'wrap', color: '#1a1416', tie: '#2f8f62' },
  top: { color: '#5a7a3a', trim: '#f2c94c', kind: 'jumpsuit' },
  legs: '#4a4030',
  shoes: '#5a3a24',
  sole: '#2a2420',
  belt: '#5a3a24',
  badge: '#f2c94c',
  beads: ['#f2902f', '#3fae5a'],
};

/** Lupe Fonoti, the botanist (plants and the Sun). */
export const LUPE_FONOTI: Look16 = {
  build: 'adult',
  skin: '#9a6440',
  hair: { style: 'puffs', color: '#1e1814', tie: '#ff7fa8' },
  top: { color: '#e05a6a', trim: '#f6ecd0', kind: 'dress' },
  legs: '#3a6a4a',
  shoes: '#7a5236',
  beads: ['#ff7fa8', '#f2f4ec'],
};

/** Theo Park, the pond biologist (food chains and webs), in waders. */
export const THEO_PARK: Look16 = {
  build: 'adult',
  skin: '#e0b48c',
  hair: { style: 'short', color: '#2a2220' },
  top: { color: '#3a7ad8', trim: '#f2f4ec', kind: 'jumpsuit' },
  legs: '#3f6a5a',
  shoes: '#2f4a3a',
  sole: '#1a2a20',
  belt: '#2f4a3a',
};

const SPINE = ramp('#8a6a4a', { warm: 1.1 });
const BELLY = ramp('#e8d0a8', { warm: 1.2 });

/** Bramble the hedgehog, who comes on every run (frames: 0 still, 1 sniffing). */
export function paintBramble(T: number, frame = 0, face: 'left' | 'right' = 'right'): PixelBuffer {
  if (face === 'left') return paintBramble(T, frame, 'right').flipX();
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(11 * u));
  // spines: a round back of little points
  p.ellipse(S(7), S(6.4), S(6), S(4.2), SPINE, { sep: true });
  for (let k = 0; k < 9; k++) {
    const a = Math.PI * (0.95 - k * 0.11);
    p.line(S(7) + Math.cos(a) * S(5), S(6.6) - Math.sin(a) * S(3.6), S(7) + Math.cos(a) * S(6.6), S(6.6) - Math.sin(a) * S(5.2), ramp('#5a4030'), 1);
  }
  // face and nose
  const nose = frame === 1 ? 0.6 : 0;
  p.ellipse(S(12), S(7.6), S(3), S(2.4), BELLY, { sep: true });
  p.ellipse(S(14.6 + nose), S(8.2), S(0.9), S(0.8), ramp(INK), { form: 'flat', level: 1 });
  p.ellipse(S(12.2), S(6.8), S(0.7), S(0.8), ramp(INK), { form: 'flat', level: 1 });
  p.pix(Math.round(S(12)), Math.round(S(6.5)), '#ffffff');
  p.ellipse(S(10.4), S(5.4), S(1), S(0.9), BELLY, { form: 'flat', level: 1 });
  // feet
  for (const x of [4, 9.6]) p.ellipse(S(x), S(10.2), S(1.2), S(0.7), ramp('#6a4a3a'), { form: 'flat', level: 1 });
  return p.toBuffer();
}

/** Bramble's portrait for the talk box. */
export function paintBramblePortrait(happy = true): PixelBuffer {
  const p = new Paint(72, 72);
  p.ellipse(32, 40, 26, 22, SPINE, { sep: true });
  for (let k = 0; k < 14; k++) {
    const a = Math.PI * (1.05 - k * 0.075);
    p.line(32 + Math.cos(a) * 20, 42 - Math.sin(a) * 16, 32 + Math.cos(a) * 30, 42 - Math.sin(a) * 26, ramp('#5a4030'), 1);
  }
  p.ellipse(46, 46, 18, 15, BELLY, { sep: true });
  p.ellipse(60, 50, 4, 3.4, ramp(INK), { form: 'flat', level: 1 });
  p.ellipse(44, 40, 3.2, 3.6, ramp(INK), { form: 'flat', level: 1 });
  p.pix(43, 38, '#ffffff');
  p.pix(44, 38, '#ffffff');
  p.ellipse(38, 30, 4, 3.4, BELLY, { form: 'flat', level: 1 });
  if (happy) for (let k = -4; k <= 4; k++) p.pix(52 + k, 57 + Math.round((16 - k * k) / 8), '#5a3418');
  else for (let k = -3; k <= 3; k++) p.pix(52 + k, 58, '#5a3418');
  return p.toBuffer();
}

// ------------------------------------------------------------------ the ground

export type Ground = 'mud' | 'soil' | 'rich' | 'grass' | 'sand' | 'rock' | 'water';

const GROUND: Record<Ground, ReturnType<typeof ramp>> = {
  mud: ramp('#8a6a4a'),
  soil: ramp('#a8784a'),
  rich: ramp('#5a3a24'),
  grass: ramp('#5aa84a', { cool: 0.6 }),
  sand: ramp('#e6cc90'),
  rock: ramp('#9a9a8a'),
  water: ramp('#3aa6b8'),
};

/**
 * One ground tile seen from above at the world's angle: the top face, and a
 * darker front edge (`edge` pixels tall) when the tile is at the island's
 * front, so the island reads as a raised piece of land.
 */
export function paintGround(T: number, kind: Ground, seed = 0, edge = 0, frame = 0): PixelBuffer {
  const b = new PixelBuffer(T, T + edge);
  const r = GROUND[kind];
  const h = (x: number, y: number) => {
    let n = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      let c = r[2];
      const v = h(x, y);
      if (kind === 'water') {
        const wave = Math.sin((x + seed * 7) * 0.5 + y * 0.9 + frame * 0.8);
        c = wave > 0.85 && (x + y) % 3 === 0 ? '#bff4f2' : y < 2 ? r[3] : r[2];
      } else if (kind === 'grass') {
        c = v > 0.92 ? r[4] : v > 0.78 ? r[3] : v < 0.08 ? r[1] : r[2];
      } else if (kind === 'rock') {
        c = v > 0.85 ? r[3] : v < 0.2 ? r[1] : r[2];
        if ((x + y * 3 + seed) % 11 === 0) c = r[0];
      } else if (kind === 'sand') {
        c = v > 0.9 ? r[3] : v < 0.06 ? r[1] : r[2];
      } else {
        // mud, soil and rich soil: speckled, rich soil with little pale bits (old leaves breaking down)
        c = v > 0.9 ? r[3] : v < 0.12 ? r[1] : r[2];
        if (kind === 'rich' && v > 0.965) c = '#c8a46a';
        if (kind === 'mud' && (x * 3 + y * 5 + seed) % 17 === 0) c = r[0];
      }
      // a soft light top-left edge, a darker bottom-right
      if (kind !== 'water' && (x === 0 || y === 0)) c = mixHex(c, '#ffffff', 0.12);
      if (kind !== 'water' && (x === T - 1 || y === T - 1)) c = mixHex(c, '#000000', 0.12);
      b.set(x, y, c);
    }
  if (kind === 'grass')
    for (let k = 0; k < 6; k++) {
      const x = Math.floor(h(k, 99) * (T - 2)) + 1;
      const y = Math.floor(h(99, k) * (T - 4)) + 3;
      b.set(x, y, r[4]);
      b.set(x, y - 1, r[3]);
    }
  for (let y = T; y < T + edge; y++)
    for (let x = 0; x < T; x++) {
      const base = kind === 'water' ? '#2a6a7a' : kind === 'sand' ? '#b89a60' : kind === 'rock' ? '#6a6a62' : '#6a4a30';
      b.set(x, y, mixHex(base, '#000000', ((y - T) / Math.max(1, edge)) * 0.35));
    }
  return b;
}

// ------------------------------------------------------------------ the tile pieces

export type Role = 'producer' | 'herbivore' | 'carnivore' | 'omnivore' | 'decomposer' | 'feature' | 'invasive';

export type PieceId =
  // producers
  | 'grass'
  | 'flowers'
  | 'berries'
  | 'oak'
  | 'reeds'
  | 'lilies'
  // plant-eaters
  | 'rabbit'
  | 'deer'
  | 'mouse'
  | 'bee'
  | 'butterfly'
  | 'snail'
  | 'duck'
  // meat-eaters and omnivores
  | 'fox'
  | 'hawk'
  | 'owl'
  | 'frog'
  | 'fish'
  | 'heron'
  // decomposers
  | 'mushrooms'
  | 'worms'
  | 'beetle'
  // features
  | 'log'
  | 'leaves'
  | 'stones'
  // an invasive plant
  | 'vine';

export interface PieceInfo {
  name: string;
  role: Role;
  /** Placed on water (true), on land (false). */
  water: boolean;
}

export const PIECES: Record<PieceId, PieceInfo> = {
  grass: { name: 'Meadow grass', role: 'producer', water: false },
  flowers: { name: 'Wildflowers', role: 'producer', water: false },
  berries: { name: 'Berry bush', role: 'producer', water: false },
  oak: { name: 'Oak tree', role: 'producer', water: false },
  reeds: { name: 'Cattails', role: 'producer', water: true },
  lilies: { name: 'Water lilies', role: 'producer', water: true },
  rabbit: { name: 'Rabbit', role: 'herbivore', water: false },
  deer: { name: 'Deer', role: 'herbivore', water: false },
  mouse: { name: 'Field mouse', role: 'herbivore', water: false },
  bee: { name: 'Honeybee', role: 'herbivore', water: false },
  butterfly: { name: 'Butterfly', role: 'herbivore', water: false },
  snail: { name: 'Pond snail', role: 'herbivore', water: true },
  duck: { name: 'Duck', role: 'omnivore', water: true },
  fox: { name: 'Red fox', role: 'carnivore', water: false },
  hawk: { name: 'Hawk', role: 'carnivore', water: false },
  owl: { name: 'Owl', role: 'carnivore', water: false },
  frog: { name: 'Frog', role: 'carnivore', water: true },
  fish: { name: 'Sunfish', role: 'carnivore', water: true },
  heron: { name: 'Heron', role: 'carnivore', water: true },
  mushrooms: { name: 'Mushrooms', role: 'decomposer', water: false },
  worms: { name: 'Earthworms', role: 'decomposer', water: false },
  beetle: { name: 'Dung beetle', role: 'decomposer', water: false },
  log: { name: 'Fallen log', role: 'feature', water: false },
  leaves: { name: 'Fallen leaves', role: 'feature', water: false },
  stones: { name: 'Rock pile', role: 'feature', water: false },
  vine: { name: 'Creeping vine', role: 'invasive', water: false },
};

export const PIECE_IDS = Object.keys(PIECES) as PieceId[];

/** The role's color: on the card's edge and in the Field Guide. */
export const ROLE_COLOR: Record<Role, string> = {
  producer: '#3fae5a',
  herbivore: '#f2c94c',
  carnivore: '#e0503a',
  omnivore: '#f2902f',
  decomposer: '#9a62d0',
  feature: '#9a7a5a',
  invasive: '#c8306a',
};

export const ROLE_NAME: Record<Role, string> = {
  producer: 'Producer (makes its own food from sunlight)',
  herbivore: 'Plant-eater',
  carnivore: 'Meat-eater',
  omnivore: 'Eats plants and animals',
  decomposer: 'Decomposer (turns dead things into soil)',
  feature: 'Feature',
  invasive: 'Invasive plant',
};

/** Paint a tile piece; its bottom middle sits on the middle of its tile. */
export function paintPiece(id: PieceId, T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const P = (w: number, h: number) => new Paint(Math.round(w * u), Math.round(h * u));
  switch (id) {
    case 'grass': {
      const p = P(16, 10);
      for (let k = 0; k < 9; k++) {
        const x = 1.6 + k * 1.6;
        const h = 4 + ((k * 7) % 5);
        const lean = (k % 3) - 1 + (frame ? 0.4 : 0);
        p.line(S(x), S(9.6), S(x + lean), S(9.6 - h), k % 2 ? WILD.grass : WILD.leaf3, 2);
        p.line(S(x + 0.5), S(9.6), S(x + lean + 0.4), S(10 - h), k % 2 ? WILD.grass : WILD.leaf3, 3);
      }
      return p.toBuffer();
    }
    case 'flowers': {
      const p = P(16, 11);
      const cols = [WILD.pink, WILD.yellow, WILD.purple, WILD.white, WILD.orange];
      for (let k = 0; k < 5; k++) {
        const x = 2.4 + k * 2.8;
        const top = 3.6 + ((k * 5) % 4);
        p.line(S(x), S(10.6), S(x), S(top), WILD.leaf2, 2);
        p.ellipse(S(x - 1), S(top + 2.6), S(1), S(0.5), WILD.leaf, { form: 'flat', level: 2 });
        p.ellipse(S(x), S(top), S(1.5), S(1.3), cols[k], { sep: true });
        p.ellipse(S(x), S(top), S(0.5), S(0.5), WILD.yellow, { form: 'flat', level: 4 });
      }
      return p.toBuffer();
    }
    case 'berries': {
      const p = P(16, 13);
      p.ellipse(S(8), S(7.6), S(6.6), S(5), WILD.leaf2, { sep: true, dither: true });
      p.ellipse(S(5), S(6), S(3.4), S(3), WILD.leaf, { sep: true });
      p.ellipse(S(11), S(6.6), S(3.4), S(3), WILD.leaf, { sep: true });
      for (const [x, y] of [
        [4, 8],
        [7, 5],
        [9.6, 9],
        [12, 6.4],
        [6, 10.4],
        [10.4, 3.6],
      ])
        p.ellipse(S(x), S(y), S(0.9), S(0.9), ramp('#d8304a'), { form: 'sphere' });
      return p.toBuffer();
    }
    case 'oak': {
      const p = P(22, 30);
      p.rect(S(9.4), S(16), S(3.2), S(13.4), WILD.bark, { form: 'cylV' });
      p.capsule(S(11), S(20), S(6), S(15), S(1), WILD.bark, { sep: true });
      p.capsule(S(11), S(19), S(16), S(14), S(1), WILD.bark, { sep: true });
      for (const [x, y, rx, ry, c] of [
        [11, 10, 9, 7.4, WILD.leaf2],
        [5.6, 13, 4.6, 3.8, WILD.leaf],
        [16.4, 12.6, 4.8, 3.8, WILD.leaf],
        [11, 6, 6, 4.4, WILD.leaf],
      ] as const)
        p.ellipse(S(x), S(y), S(rx), S(ry), c, { sep: true, dither: true });
      for (const [x, y] of [
        [8, 12],
        [14, 9],
        [12.4, 14.4],
      ])
        p.ellipse(S(x), S(y), S(0.7), S(0.9), ramp('#b07a2a'), { form: 'flat', level: 3 });
      return p.toBuffer();
    }
    case 'reeds': {
      const p = P(16, 16);
      for (let k = 0; k < 5; k++) {
        const x = 3 + k * 2.6;
        const top = 2 + ((k * 3) % 4);
        p.line(S(x), S(15.6), S(x + (k % 2 ? 0.6 : -0.4)), S(top + 3), WILD.leaf3, 2);
        p.capsule(S(x), S(top + 1), S(x), S(top + 4), S(0.8), ramp('#7a4a2a'), { sep: true });
      }
      for (let k = 0; k < 3; k++) p.line(S(2 + k * 5), S(15.6), S(4 + k * 5), S(8), WILD.leaf, 2);
      return p.toBuffer();
    }
    case 'lilies': {
      const p = P(16, 8);
      for (const [x, y, r] of [
        [5, 4.4, 3.4],
        [11.4, 5.4, 3],
        [9, 2.6, 2],
      ]) {
        p.ellipse(S(x), S(y), S(r), S(r * 0.55), WILD.leaf, { form: 'flat', level: 2, sep: true });
        p.line(S(x), S(y), S(x + r * 0.8), S(y - r * 0.2), WILD.leaf2, 1);
      }
      p.ellipse(S(5.6), S(3.2), S(1.6), S(1.2), WILD.pink, { sep: true });
      p.ellipse(S(5.6), S(3), S(0.5), S(0.4), WILD.yellow, { form: 'flat', level: 4 });
      return p.toBuffer();
    }
    case 'rabbit': {
      const p = P(14, 12);
      const fur = ramp('#b8a088', { warm: 1.1 });
      p.ellipse(S(6), S(8.2), S(4.6), S(3.4), fur, { sep: true });
      p.ellipse(S(10.4), S(6), S(2.6), S(2.4), fur, { sep: true });
      for (const [x, lean] of [
        [9.6, -0.6],
        [11, 0.6],
      ])
        p.capsule(S(x), S(4.4), S(x + lean), S(frame ? 0.8 : 0.4), S(0.8), fur, { sep: true });
      p.capsule(S(11), S(3.6), S(11.2), S(1.2), S(0.35), ramp('#f2b0b8'), { onlyOver: true, level: 3 });
      p.ellipse(S(1.8), S(7.4), S(1.4), S(1.4), WILD.white, { sep: true });
      p.ellipse(S(11), S(5.6), S(0.5), S(0.6), ramp(INK), { form: 'flat', level: 1 });
      p.ellipse(S(12.8), S(6.8), S(0.4), S(0.3), ramp('#f28a9a'), { form: 'flat', level: 2 });
      p.ellipse(S(4), S(11.2), S(1.6), S(0.6), fur, { form: 'flat', level: 1 });
      return p.toBuffer();
    }
    case 'deer': {
      const p = P(18, 20);
      const fur = ramp('#b8784a', { warm: 1.2 });
      for (const x of [5, 7, 12, 14]) p.rect(S(x), S(12), S(1.1), S(7.4), fur, { form: 'cylV' });
      p.ellipse(S(9.4), S(11), S(6.6), S(3.6), fur, { sep: true });
      p.ellipse(S(9), S(12.6), S(4), S(1.4), WILD.white, { onlyOver: true, form: 'flat', level: 3 });
      p.capsule(S(14.4), S(10), S(15.6), S(5.4), S(1.2), fur, { sep: true });
      p.ellipse(S(16), S(4.4), S(1.8), S(1.6), fur, { sep: true });
      p.ellipse(S(14.6), S(2.6), S(0.9), S(1.3), fur, { sep: true });
      p.ellipse(S(16.6), S(4.2), S(0.4), S(0.5), ramp(INK), { form: 'flat', level: 1 });
      p.ellipse(S(17.6), S(5), S(0.4), S(0.4), ramp(INK), { form: 'flat', level: 1 });
      for (const [x, y] of [
        [6.4, 9.6],
        [8.4, 10.4],
        [10.8, 9.4],
      ])
        p.ellipse(S(x), S(y), S(0.4), S(0.4), WILD.white, { form: 'flat', level: 4 });
      p.ellipse(S(3), S(9.4), S(0.8), S(0.7), WILD.white, { sep: true });
      return p.toBuffer();
    }
    case 'mouse': {
      const p = P(12, 7);
      const fur = ramp('#a8907a');
      p.ellipse(S(5.6), S(4.4), S(3.6), S(2.2), fur, { sep: true });
      p.ellipse(S(9), S(4), S(1.8), S(1.5), fur, { sep: true });
      p.ellipse(S(8.6), S(2.4), S(1), S(1), ramp('#e8b0a8'), { sep: true });
      p.ellipse(S(9.4), S(3.6), S(0.35), S(0.4), ramp(INK), { form: 'flat', level: 1 });
      p.line(S(2), S(5), S(0.4), S(3.6 + (frame ? 0.6 : 0)), ramp('#d8a8a0'), 2);
      return p.toBuffer();
    }
    case 'bee': {
      const p = P(10, 8);
      const y = frame ? 0.5 : 0;
      p.ellipse(S(5), S(4.6 + y), S(3), S(2), WILD.yellow, { sep: true });
      for (const x of [4, 6]) p.rect(S(x - 0.4), S(2.8 + y), S(0.8), S(3.6), ramp(INK), { onlyOver: true, level: 1 });
      p.ellipse(S(8), S(4.4 + y), S(1.2), S(1.2), ramp('#3a3030'), { sep: true });
      p.ellipse(S(4), S(2 + y), S(1.6), S(1.1), ramp('#e8f4ff'), { form: 'flat', level: 3, sep: true });
      p.ellipse(S(6), S(1.6 + y), S(1.4), S(1), ramp('#e8f4ff'), { form: 'flat', level: 3, sep: true });
      return p.toBuffer();
    }
    case 'butterfly':
      return paintButterfly(T, frame);
    case 'snail': {
      const p = P(12, 8);
      p.capsule(S(1.4), S(6.6), S(10), S(6.6), S(1), ramp('#c8b090'), { sep: true });
      p.capsule(S(9.6), S(6), S(10.4), S(3.4), S(0.35), ramp('#c8b090'), { sep: true });
      p.ellipse(S(5), S(4.4), S(3.2), S(3), ramp('#b06a3a', { warm: 1.2 }), { sep: true });
      for (let k = 0; k < 10; k++) {
        const a = k * 0.9;
        const r = 2.4 - k * 0.22;
        p.pix(Math.round(S(5) + Math.cos(a) * S(r)), Math.round(S(4.4) + Math.sin(a) * S(r)), '#6a3a1a');
      }
      return p.toBuffer();
    }
    case 'duck':
      return paintAnimal('duck', T, frame);
    case 'fox': {
      const p = P(18, 12);
      const fur = ramp('#e0702a', { warm: 1.2 });
      for (const x of [5, 7.4, 11.4, 13.4]) p.rect(S(x), S(7.6), S(1), S(4), ramp('#3a2a20'), { form: 'cylV' });
      p.ellipse(S(9.6), S(6.8), S(5.4), S(2.8), fur, { sep: true });
      p.capsule(S(4.4), S(6), S(1), S(frame ? 3.6 : 4.4), S(1.6), fur, { sep: true });
      p.ellipse(S(0.8), S(frame ? 3.4 : 4.2), S(1.2), S(1.1), WILD.white, { sep: true });
      p.ellipse(S(14.6), S(4.6), S(2.6), S(2.2), fur, { sep: true });
      p.poly(
        [
          [S(16.2), S(4.4)],
          [S(18), S(5.4)],
          [S(16.4), S(6.2)],
        ],
        fur,
        { sep: true },
      );
      for (const x of [13.4, 15.2])
        p.poly(
          [
            [S(x - 0.9), S(3)],
            [S(x), S(0.6)],
            [S(x + 0.9), S(3)],
          ],
          fur,
          { sep: true },
        );
      p.ellipse(S(15.6), S(5.6), S(1.4), S(0.8), WILD.white, { onlyOver: true, form: 'flat', level: 3 });
      p.ellipse(S(15.2), S(4), S(0.45), S(0.5), ramp(INK), { form: 'flat', level: 1 });
      p.ellipse(S(17.8), S(5.2), S(0.45), S(0.4), ramp(INK), { form: 'flat', level: 1 });
      return p.toBuffer();
    }
    case 'hawk': {
      const p = P(18, 11);
      const brown = ramp('#8a5a3a');
      const up = frame ? -1 : 0;
      p.poly(
        [
          [S(9), S(5)],
          [S(1), S(2 + up)],
          [S(3), S(6)],
          [S(8), S(7)],
        ],
        brown,
        { sep: true },
      );
      p.poly(
        [
          [S(9), S(5)],
          [S(17), S(2 + up)],
          [S(15), S(6)],
          [S(10), S(7)],
        ],
        brown,
        { sep: true },
      );
      p.ellipse(S(9), S(6), S(2), S(3), ramp('#e8d8b8'), { sep: true });
      p.poly(
        [
          [S(7.6), S(8.4)],
          [S(10.4), S(8.4)],
          [S(11), S(10.6)],
          [S(7), S(10.6)],
        ],
        ramp('#c8602a'),
        { sep: true },
      );
      p.ellipse(S(9), S(3.4), S(1.4), S(1.3), brown, { sep: true });
      p.pix(Math.round(S(9.4)), Math.round(S(3.2)), INK);
      p.pix(Math.round(S(9)), Math.round(S(4.4)), '#f2c94c');
      return p.toBuffer();
    }
    case 'owl':
      return paintAnimal('owl', T, frame);
    case 'frog':
      return paintFrog(T, frame);
    case 'fish': {
      const p = P(14, 8);
      const body = ramp('#3a8ac8');
      p.ellipse(S(6.6), S(4), S(4.6), S(3), body, { sep: true });
      p.ellipse(S(7), S(5.4), S(3.4), S(1.4), ramp('#f2902f'), { onlyOver: true, form: 'flat', level: 3 });
      p.poly(
        [
          [S(2.4), S(4)],
          [S(0.2), S(frame ? 1.4 : 2)],
          [S(0.2), S(frame ? 6.6 : 6)],
        ],
        body,
        { sep: true },
      );
      p.ellipse(S(9.6), S(3.4), S(0.6), S(0.6), ramp(INK), { form: 'flat', level: 1 });
      p.ellipse(S(8.6), S(3.4), S(0.8), S(1.4), ramp('#2a4a6a'), { form: 'flat', level: 1 });
      return p.toBuffer();
    }
    case 'heron':
      return paintHeron(T, frame);
    case 'mushrooms':
      return paintMushroomsBrown(T);
    case 'worms': {
      const p = P(16, 9);
      p.ellipse(S(8), S(6.6), S(7), S(2.2), ramp('#7a5236'), { form: 'flat', level: 2 });
      for (const [x0, y0, ph] of [
        [2.4, 6, 0],
        [8, 7, 1.6],
      ])
        for (let k = 0; k <= 10; k++) {
          const x = x0 + k * 0.6;
          const y = y0 - Math.sin(k * 0.7 + ph + frame) * 1.2 - (k > 7 ? (k - 7) * 0.8 : 0);
          p.ellipse(S(x), S(y), S(0.75), S(0.7), ramp('#e8908a'), { form: 'sphere' });
        }
      return p.toBuffer();
    }
    case 'beetle': {
      const p = P(12, 8);
      p.ellipse(S(7), S(4.6), S(3.6), S(2.6), ramp('#2a3a5a', { cool: 1.2 }), { sep: true });
      p.line(S(7), S(2.2), S(7), S(7), ramp('#1a2030'), 1);
      p.ellipse(S(10.4), S(4.8), S(1.4), S(1.3), ramp('#1a2030'), { sep: true });
      for (const x of [4.6, 7, 9.2]) p.line(S(x), S(6.6), S(x + (frame ? 0.6 : -0.6)), S(7.8), ramp('#1a2030'), 1);
      p.ellipse(S(5.6), S(3.6), S(1.2), S(0.6), ramp('#7a9ad8'), { form: 'flat', level: 4 });
      return p.toBuffer();
    }
    case 'log': {
      const p = P(18, 9);
      p.capsule(S(2), S(5.4), S(15.4), S(5.4), S(3), WILD.bark, { form: 'cylH', sep: true });
      p.ellipse(S(15.6), S(5.4), S(2.2), S(2.8), ramp('#c49a6a'), { sep: true });
      for (let r = 0.8; r < 2.4; r += 0.8) for (let a = 0; a < 6.3; a += 0.5) p.pix(Math.round(S(15.6) + Math.cos(a) * S(r) * 0.8), Math.round(S(5.4) + Math.sin(a) * S(r)), '#8a6a4a');
      p.ellipse(S(6), S(3), S(1.6), S(0.8), WILD.moss, { onlyOver: true, form: 'flat', level: 3 });
      p.ellipse(S(10.4), S(2.8), S(2), S(0.7), WILD.moss, { onlyOver: true, form: 'flat', level: 2 });
      return p.toBuffer();
    }
    case 'leaves': {
      const p = P(16, 8);
      const cols = [WILD.orange, WILD.yellow, ramp('#b0482a'), ramp('#8a6a3a')];
      for (let k = 0; k < 9; k++) {
        const x = 2 + ((k * 5) % 12);
        const y = 3 + ((k * 3) % 4);
        p.ellipse(S(x), S(y), S(1.6), S(0.9), cols[k % 4], { form: 'flat', level: 2 + (k % 2), sep: true });
      }
      return p.toBuffer();
    }
    case 'stones': {
      const p = P(16, 10);
      for (const [x, y, rx, ry] of [
        [5, 7, 4, 2.6],
        [11, 7.4, 3.6, 2.2],
        [8, 4.4, 3.2, 2.4],
      ])
        p.ellipse(S(x), S(y), S(rx), S(ry), WILD.stone, { sep: true });
      p.ellipse(S(4), S(8.4), S(1.6), S(0.6), WILD.moss, { onlyOver: true, form: 'flat', level: 3 });
      return p.toBuffer();
    }
    case 'vine': {
      const p = P(16, 12);
      const v = ramp('#6a9a2a', { warm: 1.2 });
      for (let k = 0; k < 4; k++) {
        const x0 = 1 + k * 4;
        for (let i = 0; i < 10; i++) {
          const x = x0 + Math.sin(i * 0.9 + k) * 1.4;
          const y = 11.4 - i * 1.1;
          p.ellipse(S(x), S(y), S(0.5), S(0.5), v, { form: 'sphere' });
          if (i % 3 === 1) p.ellipse(S(x + 1.2), S(y), S(1.3), S(0.8), ramp('#8ac83a'), { form: 'flat', level: 3, sep: true });
        }
      }
      for (const [x, y] of [
        [3, 3],
        [10, 2],
      ])
        p.ellipse(S(x), S(y), S(1), S(1), ramp('#c858a8'), { sep: true });
      return p.toBuffer();
    }
  }
}

/** Woodland mushrooms (brown caps, unlike the camp's glowing ones; at night the island uses those). */
function paintMushroomsBrown(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(10 * u));
  for (const [x, y, r, c] of [
    [4, 5, 2.8, '#b0603a'],
    [9, 6.4, 2.2, '#c8803a'],
    [11.6, 4.4, 1.5, '#b0603a'],
  ] as const) {
    p.rect(S(x - 0.55), S(y), S(1.1), S(9.6 - y), WILD.white, { form: 'cylV' });
    p.ellipse(S(x), S(y), S(r), S(r * 0.66), ramp(c, { warm: 1.2 }), { sep: true, bias: 0.15 });
    p.ellipse(S(x - r * 0.3), S(y - r * 0.2), S(0.5), S(0.4), WILD.white, { form: 'flat', level: 4 });
  }
  return p.toBuffer();
}

/** The camp's glowing mushrooms, for the island at night. */
export function paintGlowMushrooms(T: number): PixelBuffer {
  return paintMushrooms(T);
}

/** The open sea round an island: deep blue-green with moving wave glints, and paler shallows near land (`shallow(x, y)` says where). */
export function paintSea(w: number, h: number, frame = 0, shallow: (x: number, y: number) => boolean = () => false): PixelBuffer {
  const b = new PixelBuffer(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const near = shallow(x, y);
      let c = near ? '#4cb8c4' : (Math.floor(x / 9) + Math.floor(y / 7)) % 5 === 0 ? '#2c8ea4' : '#2f96aa';
      const wave = Math.sin(x * 0.21 + Math.sin(y * 0.13) * 2 + frame * 0.7) + Math.sin(y * 0.37 - frame * 0.4);
      if (wave > 1.75 && (x + y) % 2 === 0) c = near ? '#d8fbf6' : '#9ee0e6';
      b.set(x, y, c);
    }
  return b;
}

/** Small icons for what a plant needs (the Field Notebook pictures): the Sun, rain water and moving air. */
export function paintNeedIcon(T: number, kind: 'sun' | 'water' | 'air'): PixelBuffer {
  const u = T / 16;
  const S = (v: number) => v * u;
  const p = new Paint(T, T);
  if (kind === 'sun') {
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      p.line(S(8 + Math.cos(a) * 4.5), S(8 + Math.sin(a) * 4.5), S(8 + Math.cos(a) * 7.2), S(8 + Math.sin(a) * 7.2), ramp('#ffb627'), 2);
    }
    p.ellipse(S(8), S(8), S(4), S(4), ramp('#ffd23a'), { sep: true });
  } else if (kind === 'water') {
    for (const [x, y] of [
      [5, 4],
      [10, 6],
      [6, 10],
      [11, 12],
    ])
      p.poly(
        [
          [S(x), S(y - 2.4)],
          [S(x + 1.6), S(y + 0.6)],
          [S(x), S(y + 1.8)],
          [S(x - 1.6), S(y + 0.6)],
        ],
        ramp('#4ab4ea'),
        { sep: true },
      );
  } else {
    for (const [y, x0, x1] of [
      [5, 2, 12],
      [9, 4, 14],
      [13, 2, 10],
    ]) {
      p.line(S(x0), S(y), S(x1), S(y), ramp('#9ab8d0'), 2);
      p.ellipse(S(x1), S(y - 1), S(1.4), S(1.4), ramp('#9ab8d0'), { level: 2 });
    }
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ props for the board

/** A card in the hand: a parchment card with a colored top band for the role, the piece in the middle. Text is added by the page. */
export function paintCard(T: number, id: PieceId, chosen = false): PixelBuffer {
  const W = Math.round(T * 2.6);
  const H = Math.round(T * 3.2);
  const b = new PixelBuffer(W, H);
  const role = ROLE_COLOR[PIECES[id].role];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const edge = x < 2 || y < 2 || x >= W - 2 || y >= H - 2;
      const band = y < Math.round(T * 0.5);
      b.set(x, y, edge ? (chosen ? '#ffe27a' : '#5a3a24') : band ? role : (x + y) % 7 ? '#f6ecd0' : '#efe2c0');
    }
  const art = paintPiece(id, Math.round(T * 1.4));
  b.blit(art, Math.round((W - art.w) / 2), Math.round(H * 0.55 - art.h / 2 + T * 0.25));
  return b;
}

/** The boat that drops the player off (and the research hut's sign on it). */
export function paintBoat(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(30 * u), Math.round(18 * u));
  p.poly(
    [
      [S(1), S(10)],
      [S(29), S(10)],
      [S(25), S(16)],
      [S(4), S(16)],
    ],
    ramp('#f2f4ec'),
    { sep: true },
  );
  p.rect(S(3), S(12.4), S(24), S(1.2), WILD.blue, { onlyOver: true, level: 2 });
  p.rect(S(9), S(3), S(10), S(7), ramp('#e8d8b8'), { sep: true });
  p.rect(S(11), S(5), S(2.4), S(2.4), ramp('#9ad8ff'), { form: 'flat', level: 3 });
  p.rect(S(15), S(5), S(2.4), S(2.4), ramp('#9ad8ff'), { form: 'flat', level: 3 });
  p.poly(
    [
      [S(8), S(3.4)],
      [S(14), S(0.6)],
      [S(20), S(3.4)],
    ],
    WILD.leaf2,
    { sep: true },
  );
  return p.toBuffer();
}

/** A firefly glow (a soft dot), for the island at night. */
export function paintFirefly(size = 5): PixelBuffer {
  const b = new PixelBuffer(size * 2 + 1, size * 2 + 1);
  for (let y = -size; y <= size; y++)
    for (let x = -size; x <= size; x++) {
      const d = Math.hypot(x, y);
      if (d <= 1) b.set(size + x, size + y, '#ffffff');
      else if (d <= 2) b.set(size + x, size + y, WILD.firefly);
      else if (d <= size && (x + y) % 2 === 0) b.set(size + x, size + y, '#c8e05a');
    }
  return b;
}
