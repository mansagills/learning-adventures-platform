import { PixelBuffer } from '../../art/pixel';
import type { Look16 } from '../hero16';
import { Paint, mixHex, ramp, type Ramp } from '../shade';
import { WILD } from './art';

/**
 * Animal Kingdom Match art (the S3 section of docs/GAMES_3D_UPGRADE_PLAN.md):
 * Dr. Amara Osei, Kiki the kinkajou, the Wildlife Rescue Center, and the
 * animals of the four habitat trips (the rainforest, the desert, the poles,
 * and the wetland and sea) plus the night animals of the Night Safari.
 *
 * Every animal is drawn side on, facing right, in the Wild Lands style
 * (designs at 16 pixels per tile, scaled by u = T / 16), with three frames:
 * 0 still, 1 moving (a step, a flap or a swish) and 2 blinking. Animals are
 * friendly and never shown hurt.
 *
 * In look development: kept out of the shared lists.
 */

const U = (T: number) => T / 16;
const INK = '#1a1414';

/** An eye: a dark dot with a shine, or a short line when blinking. */
function eye(p: Paint, x: number, y: number, r: number, blink: boolean, color = INK): void {
  if (blink) p.line(x - r, y, x + r, y, ramp(color), 1);
  else {
    p.ellipse(x, y, r, r, ramp(color), { form: 'flat', level: 1 });
    p.pix(x - r * 0.4, y - r * 0.4, '#ffffff');
  }
}

/** Four legs under a body, the near pair stepping on frame 1. */
function legs(p: Paint, xs: number[], top: number, bottom: number, w: number, r: Ramp, step: boolean, S: (v: number) => number): void {
  xs.forEach((x, i) => {
    const dx = step ? (i % 2 ? 1 : -1) * 0.8 : 0;
    p.capsule(S(x), S(top), S(x + dx), S(bottom), S(w), r, { sep: true });
  });
}

// ------------------------------------------------------------------ the people

/** Dr. Amara Osei, the wildlife vet who runs the Rescue Center (a draft name). */
export const AMARA_OSEI: Look16 = {
  build: 'adult',
  skin: '#5a3424',
  hair: { style: 'puffs', color: '#1a1414', tie: '#ff7fa8' },
  top: { color: '#5a8ad8', trim: '#f2f4ec', kind: 'jumpsuit' },
  legs: '#2f4a6a',
  shoes: '#f2f4ec',
  sole: '#5a8ad8',
  belt: '#2f4a6a',
  badge: '#ff7fa8',
};

// ------------------------------------------------------------------ Kiki the kinkajou

const KIKI = ramp('#c8884a', { warm: 1.3 });
const KIKI2 = ramp('#f2d0a0');

/**
 * Kiki, a kinkajou: a small, golden rainforest night animal with big dark
 * eyes, round ears and a long tail that can hold on to branches. She rides
 * on the child's backpack and points with her tail.
 * Frames: 0 sitting, 1 tail pointing up, 2 blinking, 3 walking.
 */
export function paintKiki(T: number, frame = 0, face: 'left' | 'right' = 'right'): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(16 * u));
  const step = frame === 3;
  // the long tail: curled behind, or held up to point
  if (frame === 1) {
    p.capsule(S(5), S(10), S(3), S(4), S(1.2), KIKI, {});
    p.capsule(S(3), S(4), S(6), S(1.4), S(1), KIKI, {});
  } else {
    p.capsule(S(5), S(11), S(1.6), S(9), S(1.2), KIKI, {});
    p.capsule(S(1.6), S(9), S(2.6), S(5.6), S(1), KIKI, {});
  }
  legs(p, [6.4, 8.6, 12.4, 14.4], 11, 15, 1, KIKI, step, S);
  p.ellipse(S(10), S(10), S(5.6), S(3.4), KIKI, { sep: true });
  p.ellipse(S(15), S(7), S(3.4), S(3), KIKI, { sep: true });
  p.ellipse(S(16.6), S(8), S(1.8), S(1.4), KIKI2, {});
  p.ellipse(S(18.2), S(7.8), S(0.7), S(0.6), ramp('#3a2418'), { form: 'flat', level: 1 });
  for (const x of [13.2, 16.2]) p.ellipse(S(x), S(4.2), S(1.2), S(1.2), KIKI, { sep: true });
  eye(p, S(16), S(6.4), S(1), frame === 2);
  const b = p.toBuffer();
  return face === 'left' ? b.flipX() : b;
}

/** Kiki in the talk box. */
export function paintKikiPortrait(happy = true): PixelBuffer {
  const p = new Paint(72, 72);
  for (let y = 0; y < 72; y++) for (let x = 0; x < 72; x++) p.pix(x, y, mixHex('#9ad08a', '#2f6b4c', y / 72));
  p.ellipse(36, 72, 24, 14, KIKI, { sep: true });
  p.ellipse(36, 42, 21, 19, KIKI, { sep: true });
  for (const x of [16, 56]) {
    p.ellipse(x, 24, 7, 7, KIKI, { sep: true });
    p.ellipse(x, 24, 4, 4, ramp('#8a5a3a'), { form: 'flat', level: 2 });
  }
  p.ellipse(36, 52, 11, 8, KIKI2, { sep: true });
  p.ellipse(36, 48, 4, 3, ramp('#3a2418'), { form: 'flat', level: 1 });
  for (const x of [27, 45]) {
    p.ellipse(x, 38, 5, 5.4, ramp(INK), { form: 'flat', level: 1 });
    p.pix(x - 2, 36, '#ffffff');
    p.pix(x - 1, 36, '#ffffff');
  }
  if (happy) for (let k = -5; k <= 5; k++) p.pix(36 + k, 56 + Math.round((25 - k * k) / 10), '#5a3418');
  else for (let k = -4; k <= 4; k++) p.pix(36 + k, 58, '#5a3418');
  return p.toBuffer();
}

// ------------------------------------------------------------------ the animals

export type AnimalId =
  // the rainforest (the frog, toucan, monkey, sloth, jaguar and butterfly are in art.ts)
  | 'dart-frog'
  | 'tapir'
  // the desert
  | 'camel'
  | 'fennec'
  | 'gecko'
  | 'tortoise'
  | 'roadrunner'
  // the poles
  | 'polar-bear'
  | 'arctic-fox'
  | 'walrus'
  | 'penguin'
  | 'seal'
  | 'snowy-owl'
  // the wetland and the sea
  | 'beaver'
  | 'crocodile'
  | 'duck'
  | 'dolphin'
  | 'whale'
  // night animals (the Night Safari)
  | 'owl'
  | 'bat';

export const ANIMAL_IDS: AnimalId[] = [
  'dart-frog',
  'tapir',
  'camel',
  'fennec',
  'gecko',
  'tortoise',
  'roadrunner',
  'polar-bear',
  'arctic-fox',
  'walrus',
  'penguin',
  'seal',
  'snowy-owl',
  'beaver',
  'crocodile',
  'duck',
  'dolphin',
  'whale',
  'owl',
  'bat',
];

/** Which habitat each new animal belongs to (the night animals belong to the forest by the camp). */
export const ANIMAL_HOME: Record<AnimalId, 'rainforest' | 'desert' | 'arctic' | 'antarctic' | 'wetland' | 'sea' | 'night'> = {
  'dart-frog': 'rainforest',
  tapir: 'rainforest',
  camel: 'desert',
  fennec: 'desert',
  gecko: 'desert',
  tortoise: 'desert',
  roadrunner: 'desert',
  'polar-bear': 'arctic',
  'arctic-fox': 'arctic',
  walrus: 'arctic',
  'snowy-owl': 'arctic',
  penguin: 'antarctic',
  seal: 'antarctic',
  beaver: 'wetland',
  crocodile: 'wetland',
  duck: 'wetland',
  dolphin: 'sea',
  whale: 'sea',
  owl: 'night',
  bat: 'night',
};

/** An animal's picture, frame 0 still, 1 moving, 2 blinking. Sizes are in tiles of T pixels (most are 1 to 2 tiles). */
export function paintAnimal(id: AnimalId, T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const move = frame === 1;
  const blink = frame === 2;
  switch (id) {
    case 'dart-frog': {
      // a tiny, bright blue poison dart frog (bright colors warn "don't eat me")
      const p = new Paint(Math.round(12 * u), Math.round(9 * u));
      const b = ramp('#2a7ae8');
      p.ellipse(S(6), S(5.6), S(4.2), S(2.8), b, { sep: true });
      p.ellipse(S(8.6), S(3.6), S(2), S(1.8), b, { sep: true });
      for (const [x, y] of [
        [4, 5],
        [6.4, 6.4],
        [7.4, 4.4],
      ])
        p.ellipse(S(x), S(y), S(0.7), S(0.6), ramp('#1a1a2a'), { form: 'flat', level: 1 });
      for (const x of [2, 4.6, 7.6, 10.2]) p.ellipse(S(x), S(move && x > 6 ? 7.6 : 8.2), S(1), S(0.6), b, { sep: true });
      eye(p, S(9.2), S(3), S(0.7), blink);
      return p.toBuffer();
    }
    case 'tapir': {
      // a Baird's tapir: a round, dark body, a short trunk-like snout
      const p = new Paint(Math.round(24 * u), Math.round(16 * u));
      const r = ramp('#5a4a4a');
      legs(p, [6, 8.6, 16, 18.4], 10, 15, 1.4, r, move, S);
      p.ellipse(S(12), S(8.6), S(8.6), S(4.6), r, { sep: true });
      p.ellipse(S(19.6), S(7.4), S(3.4), S(3), r, { sep: true });
      p.capsule(S(21.6), S(8), S(23.2), S(9.6), S(1), ramp('#4a3a3a'), {});
      p.ellipse(S(18.4), S(4.6), S(1), S(1.2), r, { sep: true });
      p.rect(S(19.2), S(9.2), S(1.6), S(0.8), ramp('#f2eee0'), { level: 3 });
      eye(p, S(20.4), S(6.4), S(0.6), blink);
      return p.toBuffer();
    }
    case 'camel': {
      // a dromedary with one hump (the hump stores fat, not water)
      const p = new Paint(Math.round(26 * u), Math.round(26 * u));
      const r = ramp('#c8965a', { warm: 1.2 });
      legs(p, [7, 9.2, 16.4, 18.6], 14, 25, 1.1, r, move, S);
      p.ellipse(S(12.6), S(12), S(8), S(4.4), r, { sep: true });
      p.ellipse(S(12), S(7.4), S(4), S(3.6), r, { sep: true });
      p.capsule(S(19), S(11), S(21.6), S(4), S(1.6), r, {});
      p.ellipse(S(23), S(3.6), S(3), S(2), r, { sep: true });
      p.ellipse(S(21.4), S(1.8), S(0.8), S(0.8), r, { sep: true });
      eye(p, S(23), S(3), S(0.6), blink);
      p.line(S(25), S(4.6), S(25.6), S(4.6), ramp('#5a3a24'), 1);
      return p.toBuffer();
    }
    case 'fennec': {
      // a fennec fox with huge ears that let out heat
      const p = new Paint(Math.round(18 * u), Math.round(14 * u));
      const r = ramp('#ead2a0');
      p.capsule(S(5), S(9), S(1.6), S(6.4), S(1.6), r, {});
      p.ellipse(S(1.2), S(6), S(1.2), S(1.2), ramp('#3a2a1a'), { form: 'flat', level: 1 });
      legs(p, [6, 7.8, 11.2, 13], 10, 13.4, 0.8, r, move, S);
      p.ellipse(S(9.4), S(9), S(4.6), S(2.6), r, { sep: true });
      p.ellipse(S(13.6), S(6.4), S(2.6), S(2.2), r, { sep: true });
      for (const x of [12.2, 15]) {
        p.poly(
          [
            [S(x - 1.6), S(5.4)],
            [S(x + 0.2), S(0.4)],
            [S(x + 1.6), S(5.4)],
          ],
          r,
          { sep: true },
        );
        p.poly(
          [
            [S(x - 0.8), S(5)],
            [S(x + 0.2), S(1.6)],
            [S(x + 0.9), S(5)],
          ],
          ramp('#f2b0a0'),
          { form: 'flat', level: 3 },
        );
      }
      p.ellipse(S(16.4), S(7.2), S(0.6), S(0.5), ramp(INK), { form: 'flat', level: 1 });
      eye(p, S(14.4), S(6), S(0.6), blink);
      return p.toBuffer();
    }
    case 'gecko': {
      // a desert gecko on a warm rock, big-eyed (it hunts at night)
      const p = new Paint(Math.round(16 * u), Math.round(8 * u));
      const r = ramp('#d8b86a');
      p.capsule(S(1), S(5), S(6), S(5), S(1), r, {});
      p.ellipse(S(8), S(5), S(3.6), S(1.6), r, { sep: true });
      p.ellipse(S(12.4), S(4.4), S(2), S(1.4), r, { sep: true });
      for (const [x, y] of [
        [6, 7],
        [10, 7],
      ])
        p.line(S(x), S(5.6), S(x + (move ? 1.2 : 0.4)), S(y), r, 2);
      for (let k = 0; k < 4; k++) p.ellipse(S(5 + k * 1.6), S(4.4), S(0.5), S(0.4), ramp('#8a6a3a'), { form: 'flat', level: 1 });
      eye(p, S(13), S(3.8), S(0.8), blink);
      return p.toBuffer();
    }
    case 'tortoise': {
      // a desert tortoise: a high domed shell, it can go a long time without drinking
      const p = new Paint(Math.round(18 * u), Math.round(11 * u));
      const sk = ramp('#9a8a6a');
      legs(p, [5, 7, 11.4, 13.2], 7, 10.4, 1, sk, move, S);
      p.ellipse(S(9), S(6), S(6.4), S(4.4), ramp('#8a6a3a'), { sep: true, form: 'sphere' });
      for (const [x, y] of [
        [7, 4],
        [10.4, 4],
        [8.6, 6.6],
        [5.4, 6.6],
        [12, 6.6],
      ])
        p.ellipse(S(x), S(y), S(1.4), S(1.1), ramp('#b0905a'), { onlyOver: true, form: 'flat', level: 3 });
      p.ellipse(S(15.6), S(6.6 + (move ? -0.6 : 0)), S(2), S(1.6), sk, { sep: true });
      eye(p, S(16.2), S(6.2), S(0.5), blink);
      return p.toBuffer();
    }
    case 'roadrunner': {
      // a roadrunner: a fast desert bird with a long tail and a crest
      const p = new Paint(Math.round(20 * u), Math.round(16 * u));
      const r = ramp('#8a7a5a');
      p.capsule(S(8), S(8), S(1.4), S(move ? 3 : 5), S(1.2), ramp('#5a4a3a'), {});
      p.ellipse(S(10), S(8.4), S(4.4), S(2.6), r, { sep: true });
      p.ellipse(S(10.6), S(9.4), S(2.6), S(1.4), ramp('#ead8b0'), { onlyOver: true, form: 'flat', level: 3 });
      p.capsule(S(13), S(7), S(14.6), S(4.4), S(1.2), r, {});
      p.ellipse(S(15.2), S(4), S(1.8), S(1.6), r, { sep: true });
      p.poly(
        [
          [S(14), S(2.8)],
          [S(14.8), S(0.6)],
          [S(16), S(2.6)],
        ],
        ramp('#3a3a4a'),
        {},
      );
      p.poly(
        [
          [S(16.6), S(3.6)],
          [S(19.6), S(4.2)],
          [S(16.6), S(4.8)],
        ],
        ramp('#3a3a3a'),
        {},
      );
      for (const x of [9, 11]) p.line(S(x), S(10.6), S(x + (move ? (x === 9 ? -2 : 2) : 0)), S(15), ramp('#6a8aa0'), 2);
      eye(p, S(15.6), S(3.8), S(0.5), blink);
      return p.toBuffer();
    }
    case 'polar-bear': {
      // a polar bear: thick white fur and a layer of blubber for the cold
      const p = new Paint(Math.round(28 * u), Math.round(17 * u));
      const r = ramp('#f2eedc', { cool: 0.4 });
      legs(p, [7, 10, 18, 21], 11, 16, 2, r, move, S);
      p.ellipse(S(13.6), S(9), S(10), S(5.4), r, { sep: true });
      p.ellipse(S(23.4), S(9), S(3.6), S(3), r, { sep: true });
      p.ellipse(S(26.2), S(10), S(1.6), S(1.4), r, { sep: true });
      p.ellipse(S(27.2), S(9.6), S(0.6), S(0.6), ramp(INK), { form: 'flat', level: 1 });
      p.ellipse(S(21.8), S(6.4), S(1), S(1), r, { sep: true });
      eye(p, S(24.4), S(8.2), S(0.6), blink);
      return p.toBuffer();
    }
    case 'arctic-fox': {
      // an Arctic fox in its white winter coat, with a big bushy tail
      const p = new Paint(Math.round(20 * u), Math.round(13 * u));
      const r = ramp('#f2f2ee', { cool: 0.5 });
      p.ellipse(S(4), S(8), S(3.6), S(2.4), r, { sep: true });
      legs(p, [7, 8.6, 12.4, 14], 9, 12.4, 0.8, r, move, S);
      p.ellipse(S(10.4), S(8), S(4.6), S(2.6), r, { sep: true });
      p.ellipse(S(15.4), S(6), S(2.6), S(2.2), r, { sep: true });
      p.poly(
        [
          [S(17.4), S(5.6)],
          [S(19.4), S(6.8)],
          [S(17.4), S(7.4)],
        ],
        r,
        { sep: true },
      );
      for (const x of [14.2, 16])
        p.poly(
          [
            [S(x - 0.8), S(4.4)],
            [S(x), S(2.2)],
            [S(x + 0.8), S(4.4)],
          ],
          r,
          { sep: true },
        );
      p.pix(S(19.2), S(6.8), INK);
      eye(p, S(16), S(5.6), S(0.5), blink);
      return p.toBuffer();
    }
    case 'walrus': {
      // a walrus: a big brown body, whiskers and two long tusks
      const p = new Paint(Math.round(26 * u), Math.round(16 * u));
      const r = ramp('#b07a5a');
      p.poly(
        [
          [S(2), S(13)],
          [S(5), S(9)],
          [S(6), S(14)],
        ],
        r,
        { sep: true },
      );
      p.ellipse(S(12), S(10), S(9), S(5), r, { sep: true });
      p.ellipse(S(20), S(7.4), S(4.4), S(4), r, { sep: true });
      p.ellipse(S(22.4), S(9.4), S(2.4), S(1.8), ramp('#d8a888'), { sep: true });
      for (const x of [21.6, 23]) p.capsule(S(x), S(10.4), S(x + 0.4), S(15.4), S(0.6), ramp('#f2eee0'), {});
      p.ellipse(S(16), S(14), S(2.4), S(1.2), r, { sep: true });
      p.ellipse(S(13 + (move ? 1 : 0)), S(14.4), S(2), S(1), r, { sep: true });
      eye(p, S(20.6), S(6), S(0.6), blink);
      return p.toBuffer();
    }
    case 'penguin': {
      // an emperor penguin: wings are flippers for swimming; it lives in the far south
      const p = new Paint(Math.round(12 * u), Math.round(22 * u));
      const black = ramp('#2a2a34');
      p.ellipse(S(6), S(12.6), S(5), S(8.4), black, { sep: true });
      p.ellipse(S(7), S(13.4), S(3.4), S(7), ramp('#f2f2ee'), { sep: true });
      p.ellipse(S(7), S(7.6), S(2.4), S(1.6), ramp('#f2c94c'), { onlyOver: true, form: 'flat', level: 3 });
      p.ellipse(S(6), S(3.6), S(3.4), S(3), black, { sep: true });
      p.ellipse(S(8), S(4.6), S(1.2), S(1.6), ramp('#f2b03a'), { form: 'flat', level: 3 });
      p.poly(
        [
          [S(8.6), S(3.6)],
          [S(11.6), S(4.4)],
          [S(8.6), S(5)],
        ],
        ramp('#2a2a34'),
        {},
      );
      p.capsule(S(2), S(10), S(move ? 0.6 : 1.4), S(move ? 13 : 16), S(1), black, {});
      for (const x of [4.6, 7.4]) p.ellipse(S(x), S(21.2), S(1.6), S(0.7), ramp('#3a3a3a'), { form: 'flat', level: 1 });
      eye(p, S(7.4), S(3), S(0.5), blink, '#f2f2ee');
      return p.toBuffer();
    }
    case 'seal': {
      // a Weddell seal of Antarctica, lying on the ice
      const p = new Paint(Math.round(24 * u), Math.round(10 * u));
      const r = ramp('#7a8a9a');
      p.poly(
        [
          [S(1), S(4)],
          [S(5), S(6.4)],
          [S(1.6), S(8.6)],
        ],
        r,
        { sep: true },
      );
      p.ellipse(S(12), S(6.4), S(9.6), S(3.2), r, { sep: true });
      p.ellipse(S(20.6), S(5), S(3), S(2.6), r, { sep: true });
      for (let k = 0; k < 6; k++) p.ellipse(S(8 + k * 2.2), S(5 + (k % 2)), S(0.6), S(0.5), ramp('#5a6a7a'), { onlyOver: true, form: 'flat', level: 1 });
      p.ellipse(S(14 + (move ? 1 : 0)), S(9), S(1.8), S(0.8), r, { sep: true });
      eye(p, S(21.4), S(4.4), S(0.7), blink);
      p.line(S(22.6), S(6), S(23.8), S(6.4), ramp('#c8c8c8'), 1);
      return p.toBuffer();
    }
    case 'snowy-owl': {
      // a snowy owl of the Arctic tundra, white with dark flecks
      const p = new Paint(Math.round(14 * u), Math.round(16 * u));
      const r = ramp('#f2f2ee', { cool: 0.4 });
      p.ellipse(S(7), S(9.6), S(5.4), S(6), r, { sep: true });
      p.ellipse(S(7), S(4.6), S(4.4), S(3.8), r, { sep: true });
      for (let k = 0; k < 7; k++) p.pix(S(4 + (k % 4) * 2), S(9 + Math.floor(k / 4) * 2.4), '#3a3a3a');
      if (move) p.ellipse(S(12), S(9), S(2.6), S(4), r, { sep: true });
      for (const x of [5.2, 8.8]) eye(p, S(x), S(4.6), S(0.9), blink, '#f2c94c');
      p.pix(S(7), S(6), '#3a3a3a');
      return p.toBuffer();
    }
    case 'beaver': {
      // a beaver with a flat tail and big front teeth (it builds dams and lodges)
      const p = new Paint(Math.round(22 * u), Math.round(12 * u));
      const r = ramp('#8a5a36');
      p.ellipse(S(3.6), S(9.4), S(3.4), S(1.4), ramp('#5a4a4a'), { sep: true });
      legs(p, [8, 14], 9, 11.6, 1, r, move, S);
      p.ellipse(S(11), S(7.4), S(5.6), S(3.6), r, { sep: true });
      p.ellipse(S(17), S(6.4), S(3), S(2.6), r, { sep: true });
      p.rect(S(19), S(7.6), S(1), S(1.4), ramp('#f2a83a'), { level: 3 });
      p.ellipse(S(19.6), S(6), S(0.6), S(0.5), ramp(INK), { form: 'flat', level: 1 });
      p.ellipse(S(15.6), S(4), S(0.8), S(0.8), r, { sep: true });
      eye(p, S(17.6), S(5.4), S(0.5), blink);
      return p.toBuffer();
    }
    case 'crocodile': {
      // a crocodile resting in the shallows, a friendly half smile
      const p = new Paint(Math.round(32 * u), Math.round(9 * u));
      const r = ramp('#5a7a4a');
      p.poly(
        [
          [S(1), S(6)],
          [S(10), S(4)],
          [S(10), S(7.4)],
        ],
        r,
        { sep: true },
      );
      p.ellipse(S(15), S(5.6), S(6.6), S(2.4), r, { sep: true });
      p.poly(
        [
          [S(20), S(4.4)],
          [S(31), S(5.4)],
          [S(31), S(6.6)],
          [S(20), S(7.4)],
        ],
        r,
        { sep: true },
      );
      for (let k = 0; k < 8; k++) p.pix(S(4 + k * 2.4), S(3.8 + (k > 3 ? 0.6 : 1.2)), '#3a5a2a');
      for (let k = 0; k < 4; k++) p.pix(S(23 + k * 2), S(6.6), '#f2f2e0');
      for (const x of [12, 18]) p.capsule(S(x), S(7), S(x + (move ? 1 : 0)), S(8.6), S(0.8), r, {});
      eye(p, S(21), S(4), S(0.6), blink, '#c8a83a');
      return p.toBuffer();
    }
    case 'duck': {
      // a mallard duck paddling
      const p = new Paint(Math.round(16 * u), Math.round(12 * u));
      p.ellipse(S(7), S(8), S(6), S(3), ramp('#a89a8a'), { sep: true });
      p.ellipse(S(5.4), S(7.4), S(3), S(1.6), ramp('#7a6a5a'), { onlyOver: true, form: 'flat', level: 2 });
      p.capsule(S(11), S(7), S(12), S(4.4), S(1.4), ramp('#2f8a5a'), {});
      p.ellipse(S(12.2), S(3.4), S(2), S(1.8), ramp('#2f8a5a'), { sep: true });
      p.ellipse(S(14.6), S(3.8 + (move ? 0.6 : 0)), S(1.6), S(0.8), ramp('#f2c94c'), { sep: true });
      p.rect(S(10.4), S(5.6), S(2), S(0.6), WILD.white, { level: 3 });
      eye(p, S(12.6), S(3), S(0.5), blink);
      return p.toBuffer();
    }
    case 'dolphin': {
      // a bottlenose dolphin: a mammal that breathes air through a blowhole
      const p = new Paint(Math.round(28 * u), Math.round(12 * u));
      const r = ramp('#7a9ab0');
      const bend = move ? 1 : 0;
      p.poly(
        [
          [S(2), S(3 + bend)],
          [S(5), S(6)],
          [S(2), S(9 - bend)],
        ],
        r,
        { sep: true },
      );
      p.ellipse(S(13), S(6), S(9), S(3.4), r, { sep: true });
      p.ellipse(S(14), S(7.4), S(6), S(1.6), ramp('#d8e4ea'), { onlyOver: true, form: 'flat', level: 3 });
      p.capsule(S(21), S(6.4), S(26.4), S(7), S(1.2), r, {});
      p.poly(
        [
          [S(11), S(2.8)],
          [S(14), S(0.4)],
          [S(15), S(3)],
        ],
        r,
        { sep: true },
      );
      p.ellipse(S(17), S(3), S(0.5), S(0.4), ramp('#3a4a5a'), { form: 'flat', level: 1 });
      eye(p, S(20.6), S(5.4), S(0.5), blink);
      return p.toBuffer();
    }
    case 'whale': {
      // a humpback whale: huge, gentle, it breathes air at the surface
      const p = new Paint(Math.round(44 * u), Math.round(16 * u));
      const r = ramp('#3a4a6a');
      const flap = move ? -1.4 : 0;
      p.poly(
        [
          [S(1), S(3 + flap)],
          [S(7), S(8)],
          [S(1), S(12 - flap)],
          [S(3), S(8)],
        ],
        r,
        { sep: true },
      );
      p.ellipse(S(22), S(8), S(16), S(5.6), r, { sep: true });
      // soft grooves under the throat, and the long white flipper pointing back
      for (let k = 0; k < 5; k++) p.line(S(27 + k * 1.6), S(11.6), S(30 + k * 1.6), S(12.2), ramp('#2a3a58'), 1);
      p.capsule(S(24), S(10.6), S(15), S(14.6), S(1.4), ramp('#c8d4e0'), { sep: true });
      for (let k = 0; k < 4; k++) p.ellipse(S(33 + k * 2), S(4.4 + (k % 2)), S(0.6), S(0.6), ramp('#5a6a8a'), { form: 'flat', level: 3 });
      eye(p, S(33), S(8.6), S(0.6), blink);
      return p.toBuffer();
    }
    case 'owl': {
      // a spectacled owl (a rainforest owl), out at night
      const p = new Paint(Math.round(14 * u), Math.round(17 * u));
      const r = ramp('#6a4a32');
      p.capsule(S(1), S(16), S(13), S(16), S(0.9), WILD.bark, { form: 'cylH' });
      p.ellipse(S(7), S(10), S(5), S(5.6), r, { sep: true });
      p.ellipse(S(7), S(11), S(3), S(4), ramp('#f2d88a'), { onlyOver: true, form: 'flat', level: 3 });
      p.ellipse(S(7), S(4.6), S(4.4), S(3.8), r, { sep: true });
      if (move) p.ellipse(S(11.6), S(9), S(2.4), S(4), r, { sep: true });
      for (const x of [5.2, 8.8]) {
        p.ellipse(S(x), S(4.6), S(1.6), S(1.6), ramp('#f2f2ee'), { form: 'flat', level: 3 });
        eye(p, S(x), S(4.6), S(0.9), blink, '#f2b03a');
      }
      return p.toBuffer();
    }
    case 'bat': {
      // a fruit bat, wings out (bats are not blind; many also find their way by sound)
      const p = new Paint(Math.round(20 * u), Math.round(12 * u));
      const r = ramp('#4a3a3a');
      const up = move ? -2.4 : 0;
      for (const side of [-1, 1]) {
        p.poly(
          [
            [S(10), S(5)],
            [S(10 + side * 9), S(2 + up)],
            [S(10 + side * 7), S(7)],
            [S(10 + side * 4), S(6)],
          ],
          r,
          { sep: true },
        );
      }
      p.ellipse(S(10), S(6), S(2.4), S(3.4), ramp('#8a5a3a'), { sep: true });
      p.ellipse(S(10), S(3), S(1.8), S(1.6), ramp('#8a5a3a'), { sep: true });
      for (const x of [8.8, 11.2])
        p.poly(
          [
            [S(x - 0.6), S(2)],
            [S(x), S(0.4)],
            [S(x + 0.6), S(2)],
          ],
          ramp('#8a5a3a'),
          {},
        );
      for (const x of [9.4, 10.6]) eye(p, S(x), S(3), S(0.4), blink);
      return p.toBuffer();
    }
  }
}

/** An animal's eye shine in the flashlight beam at night (for the Night Safari): two glowing dots. */
export function paintEyeShine(T: number, color = '#f6ff8a', gap = 4): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round((gap + 6) * u), Math.round(6 * u));
  for (const x of [3, 3 + gap]) {
    p.ellipse(S(x), S(3), S(1.8), S(1.8), ramp(mixHex(color, '#000000', 0.5)), { form: 'flat', level: 1 });
    p.ellipse(S(x), S(3), S(1), S(1), ramp(color), { form: 'flat', level: 4 });
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the Rescue Center and the trips' props

/** The Wildlife Rescue Center: a big green tent with a paw-print sign and a fenced run at the side. */
export function paintRescueTent(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(64 * u), Math.round(40 * u));
  const can = ramp('#5a9a6a');
  // the fenced run on the left
  for (let x = 2; x < 20; x += 4) p.rect(S(x), S(26), S(1.2), S(12), WILD.wood, { sep: true });
  for (const y of [28, 33]) p.rect(S(2), S(y), S(18), S(1), WILD.wood, {});
  p.ellipse(S(11), S(37), S(9), S(1.6), ramp('#c8b06a'), { form: 'flat', level: 2 });
  // the tent
  p.poly(
    [
      [S(18), S(38)],
      [S(24), S(10)],
      [S(56), S(10)],
      [S(62), S(38)],
    ],
    can,
    { sep: true },
  );
  p.poly(
    [
      [S(24), S(10)],
      [S(40), S(2)],
      [S(56), S(10)],
    ],
    ramp('#4a8a5a'),
    { sep: true },
  );
  for (let x = 26; x < 56; x += 6) p.line(S(x), S(11), S(x - 2), S(37), ramp('#4a8a5a'), 1);
  // the open doorway
  p.poly(
    [
      [S(34), S(38)],
      [S(37), S(20)],
      [S(43), S(20)],
      [S(46), S(38)],
    ],
    ramp('#2a3a2a'),
    { form: 'flat', level: 1 },
  );
  // the sign with a paw print
  p.rect(S(30), S(12), S(20), S(7), ramp('#f2f4ec'), { sep: true });
  p.ellipse(S(40), S(16.4), S(1.8), S(1.4), ramp('#e0503a'), { form: 'flat', level: 3 });
  for (const [x, y] of [
    [37.6, 14],
    [39.2, 13.2],
    [40.8, 13.2],
    [42.4, 14],
  ])
    p.ellipse(S(x), S(y), S(0.7), S(0.7), ramp('#e0503a'), { form: 'flat', level: 3 });
  return p.toBuffer();
}

export const HABITATS = ['rainforest', 'desert', 'poles', 'wetland'] as const;
export type Habitat = (typeof HABITATS)[number];

/** The Wild Lands map on the Rescue Center's wall: four habitat patches, each lit once its trip is done. */
export function paintHabitatMap(T: number, lit: readonly Habitat[] = []): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(28 * u), Math.round(22 * u));
  p.rect(S(1), S(1), S(26), S(17), WILD.wood, { sep: true });
  p.rect(S(2.4), S(2.4), S(23.2), S(14.2), ramp('#e8dcb8'), { level: 2 });
  const patch: Record<Habitat, [number, number, string]> = {
    rainforest: [8, 6, '#3fae5a'],
    desert: [19, 6, '#e0b060'],
    poles: [8, 12.6, '#e8f0f8'],
    wetland: [19, 12.6, '#3aa6b8'],
  };
  for (const h of HABITATS) {
    const [x, y, c] = patch[h];
    const on = lit.includes(h);
    p.ellipse(S(x), S(y), S(4.4), S(2.6), ramp(on ? c : mixHex(c, '#b8b0a0', 0.65)), { sep: true });
    if (on)
      for (const [dx, dy] of [
        [-4.6, -2.4],
        [4.6, -2.4],
        [0, 3],
      ])
        p.pix(S(x + dx), S(y + dy), '#ffe14a');
  }
  for (const x of [5, 23]) p.rect(S(x), S(18), S(1.4), S(4), WILD.wood, {});
  return p.toBuffer();
}

/** A saguaro cactus (it stores water in its stem). */
export function paintSaguaro(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(30 * u));
  const g = ramp('#5a9a5a');
  p.capsule(S(7), S(29), S(7), S(3), S(2.4), g, { form: 'cylV' });
  const arm = seed % 2 ? [3, 12] : [11, 16];
  p.capsule(S(7), S(arm[1]), S(arm[0]), S(arm[1]), S(1.4), g, {});
  p.capsule(S(arm[0]), S(arm[1]), S(arm[0]), S(arm[1] - 6), S(1.4), g, { form: 'cylV' });
  for (let y = 5; y < 28; y += 3) p.pix(S(6), S(y), '#3a6a3a');
  if (seed % 3 === 0) p.ellipse(S(7), S(2), S(1.4), S(1.2), ramp('#ff9ab8'), { form: 'flat', level: 3 });
  return p.toBuffer();
}

/** A small round barrel cactus with a flower. */
export function paintBarrelCactus(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(10 * u), Math.round(10 * u));
  p.ellipse(S(5), S(6), S(4), S(3.6), ramp('#6aa05a'), { sep: true, form: 'sphere' });
  for (let k = 0; k < 4; k++) p.line(S(2 + k * 2), S(3.4), S(2 + k * 2), S(9), ramp('#4a7a4a'), 1);
  p.ellipse(S(5), S(2.4), S(1.6), S(1.2), ramp('#f2c94c'), { form: 'flat', level: 3 });
  return p.toBuffer();
}

/** An ice block or small iceberg (frame 0), or a snowy ridge (frame 1). */
export function paintIce(T: number, kind = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(22 * u), Math.round(14 * u));
  const ice = ramp('#d8ecf8', { cool: 1 });
  if (kind === 0)
    p.poly(
      [
        [S(1), S(13)],
        [S(5), S(4)],
        [S(10), S(1)],
        [S(16), S(5)],
        [S(21), S(13)],
      ],
      ice,
      { sep: true },
    );
  else p.ellipse(S(11), S(10), S(10), S(4), ramp('#f2f6fa'), { sep: true });
  p.line(S(7), S(5), S(9), S(12), ramp('#a8c8e0'), 1);
  return p.toBuffer();
}

/** The polar research hut: a small red cabin on stilts with a weather vane. */
export function paintPolarHut(T: number, lit = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(28 * u), Math.round(24 * u));
  for (const x of [5, 23]) p.rect(S(x), S(18), S(1.4), S(6), WILD.metal, {});
  p.rect(S(3), S(9), S(22), S(10), ramp('#c8483a'), { sep: true });
  p.poly(
    [
      [S(1), S(10)],
      [S(14), S(2)],
      [S(27), S(10)],
    ],
    ramp('#f2f6fa'),
    { sep: true },
  );
  for (const x of [7, 17]) p.rect(S(x), S(11.6), S(4), S(3.4), ramp(lit ? '#ffd07a' : '#5a7a9a'), { sep: true });
  p.line(S(14), S(2), S(14), S(0), WILD.metal, 2);
  return p.toBuffer();
}

/** A beaver lodge of sticks and mud at the pond's edge. */
export function paintBeaverLodge(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(26 * u), Math.round(14 * u));
  p.ellipse(S(13), S(10), S(12), S(7), ramp('#6a4a32'), { sep: true, form: 'sphere' });
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI;
    const x = 13 + Math.cos(a) * 10;
    const y = 10 - Math.sin(a) * 5.4;
    p.line(S(x - 2), S(y), S(x + 2), S(y - 0.6), WILD.bark2, 2);
  }
  return p.toBuffer();
}

/** Lily pads (ground decoration on a pond), some with a pink flower. */
export function paintLilyPads(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(10 * u));
  for (let k = 0; k < 4; k++) {
    const x = 3 + ((k * 7 + seed * 3) % 15);
    const y = 3 + ((k * 5 + seed) % 5);
    p.ellipse(S(x), S(y), S(2.6), S(1.6), ramp('#4aa05a'), { sep: true });
    if ((k + seed) % 3 === 0) p.ellipse(S(x), S(y - 0.6), S(1), S(0.8), ramp('#ff9ac8'), { form: 'flat', level: 3 });
  }
  return p.toBuffer();
}

/** The child's binoculars (the spotting tool). */
export function paintBinoculars(s = 1): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(16 * s), Math.round(12 * s));
  for (const x of [4, 12]) p.capsule(S(x), S(3), S(x), S(9), S(2.4), ramp('#2a3a3a'), { sep: true });
  p.rect(S(6), S(4), S(4), S(2), ramp('#4a5a5a'), {});
  for (const x of [4, 12]) p.ellipse(S(x), S(9.4), S(1.6), S(1), ramp('#7ac8f2'), { form: 'flat', level: 3 });
  return p.toBuffer();
}

/** A flashlight with its beam (for the Night Safari). */
export function paintFlashlight(s = 1, on = true): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(20 * s), Math.round(8 * s));
  if (on)
    p.poly(
      [
        [S(9), S(3)],
        [S(20), S(0)],
        [S(20), S(8)],
        [S(9), S(5)],
      ],
      ramp('#fff6b0'),
      { form: 'flat', level: 4 },
    );
  p.capsule(S(1), S(4), S(7), S(4), S(1.6), ramp('#e0503a'), { sep: true });
  p.rect(S(7), S(2), S(2.4), S(4), WILD.metal, { sep: true });
  return p.toBuffer();
}
