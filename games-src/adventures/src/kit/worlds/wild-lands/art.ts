import { PixelBuffer } from '../../art/pixel';
import type { Look16 } from '../hero16';
import { Paint, hash, mixHex, ramp } from '../shade';

/**
 * Wild Lands art (the nature world, docs/GAME_WORLDS_PROPOSAL.md 7c): the
 * palette, the people (Ranger Tala, the test guide, and Dr. Lani Kahale, the
 * marine biologist of Ocean Depth Diver), Finn the robot camera, the little
 * submarine, the friendly animals and the field camp's props.
 *
 * The world's style: 24 pixels per tile, the same 16-bit painter as the
 * other new worlds, leaf greens, earth browns and sea blues with bright
 * accents, cool blue-green shadows and warm sunlit edges. Designs are written
 * at 16 pixels per tile and scaled by u = T / 16. Animals are friendly and
 * never shown hurt.
 */

const U = (T: number) => T / 16;

export const WILD = {
  grass: ramp('#5aa84a', { cool: 0.6 }),
  grass2: ramp('#4a9a52', { cool: 0.6 }),
  moss: ramp('#3f8f4a'),
  leaf: ramp('#3fae5a'),
  leaf2: ramp('#2f8f62'),
  leaf3: ramp('#7cc44a'),
  dirt: ramp('#a8784a'),
  sand: ramp('#e6cc90'),
  mud: ramp('#7a5a3a'),
  bark: ramp('#7a5236'),
  bark2: ramp('#9c7a5a'),
  wood: ramp('#b07a48'),
  plank: ramp('#c49460'),
  river: ramp('#3aa6b8'),
  sea: ramp('#2f8fc8'),
  canvas: ramp('#7f9a5a'),
  canvas2: ramp('#d8c48a'),
  khaki: ramp('#c8b07a'),
  stone: ramp('#9a9a8a'),
  red: ramp('#e0503a'),
  orange: ramp('#f2902f'),
  yellow: ramp('#f2c94c'),
  pink: ramp('#ff7fa8'),
  purple: ramp('#9a62d0'),
  blue: ramp('#3a7ad8'),
  white: ramp('#f2f4ec'),
  dark: ramp('#2a3a3a'),
  metal: ramp('#9aa6b0'),
  glow: '#c8ff7a',
  firefly: '#f6ff8a',
} as const;

// ------------------------------------------------------------------ the people

/** Ranger Tala, the Wild Lands test guide (each game still has its own host). */
export const RANGER_TALA: Look16 = {
  build: 'adult',
  skin: '#b07850',
  hair: { style: 'locs', color: '#2a1d1a', tie: '#3fae5a' },
  top: { color: '#c8b07a', trim: '#3f7a3a', kind: 'jumpsuit' },
  legs: '#6a5a3a',
  shoes: '#5a3a24',
  sole: '#2a2420',
  belt: '#5a3a24',
  badge: '#f2c94c',
  beads: ['#3fae5a', '#f2902f'],
};

/** Dr. Lani Kahale, the marine biologist at the camp's dock lab (Ocean Depth Diver's host; a draft name). */
export const LANI_KAHALE: Look16 = {
  build: 'adult',
  skin: '#c89064',
  hair: { style: 'wrap', color: '#1e1a24', tie: '#ff7fa8' },
  top: { color: '#2f8fa8', trim: '#ff8a5a', kind: 'jumpsuit' },
  legs: '#24506a',
  shoes: '#f2f4ec',
  sole: '#2f8fa8',
  belt: '#24506a',
  badge: '#ff8a5a',
};

// ------------------------------------------------------------------ Finn and the submarine

/**
 * Finn, the robot camera: a round yellow body with one big lens eye, two
 * little fins for steering and a blinking light. Side view; `face` turns it.
 * Frames: 0 still, 1 and 2 fins flapping.
 */
export function paintFinn(T: number, face: 'left' | 'right' = 'right', frame = 0, blink = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(18 * u), Math.round(16 * u));
  const body = ramp('#f2c94c');
  const fin = ramp('#ff8a5a');
  const flap = frame === 1 ? -1.5 : frame === 2 ? 1.5 : 0;
  // the tail fins
  p.poly(
    [
      [S(3.5), S(7)],
      [S(0.5), S(4 + flap)],
      [S(1.2), S(8)],
      [S(0.5), S(12 - flap)],
    ],
    fin,
    { sep: true },
  );
  p.ellipse(S(9), S(8), S(6.5), S(5.6), body, { sep: true });
  // the lens: dark ring, glass and a sparkle
  p.ellipse(S(12), S(7.6), S(3.4), S(3.4), ramp('#2a3a4a'), { sep: true });
  p.ellipse(S(12), S(7.6), S(2.4), S(2.4), ramp('#5ad0ff'), { bias: 0.2 });
  if (blink) p.rect(S(9.6), S(7.2), S(4.8), S(0.9), ramp('#2a3a4a'), { level: 1 });
  else {
    p.ellipse(S(12.2), S(7.8), S(1.1), S(1.1), ramp('#1a2a3a'), {
      form: 'flat',
      level: 1,
    });
    p.pix(S(11.2), S(6.6), '#ffffff');
  }
  // a little smile under the lens, a top light and a side fin
  p.line(S(10.6), S(11.4), S(13), S(11.4), ramp('#7a5a2a'), 1);
  p.line(S(9), S(2.4), S(9), S(0.8), ramp('#7a5a2a'), 1);
  p.ellipse(S(9), S(0.9), S(1), S(1), ramp('#7dffb0'), {
    form: 'flat',
    level: frame === 1 ? 4 : 3,
  });
  p.ellipse(S(6.5), S(11.6 + flap * 0.3), S(2.2), S(1.2), fin, { sep: true });
  const out = p.toBuffer();
  return face === 'left' ? out.flipX() : out;
}

/** Finn in the talk box: a close-up of the friendly lens face. */
export function paintFinnPortrait(happy = true): PixelBuffer {
  const p = new Paint(72, 72);
  for (let y = 0; y < 72; y++) for (let x = 0; x < 72; x++) p.pix(x, y, mixHex('#2fa8c8', '#1a5a8a', y / 72));
  for (let i = 0; i < 9; i++) p.ellipse(8 + hash(i, 1, 4) * 56, 6 + hash(i, 2, 4) * 60, 1.4, 1.4, ramp('#bff0ff'), { form: 'flat', level: 4 });
  const body = ramp('#f2c94c');
  p.ellipse(36, 40, 26, 23, body, { sep: true });
  p.ellipse(38, 36, 14, 14, ramp('#2a3a4a'), { sep: true });
  p.ellipse(38, 36, 10, 10, ramp('#5ad0ff'), { bias: 0.2 });
  p.ellipse(39, 37, 4.6, 4.6, ramp('#1a2a3a'), { form: 'flat', level: 1 });
  p.ellipse(34, 32, 2.2, 2.2, ramp('#ffffff'), { form: 'flat', level: 4 });
  // the smile (two pixels thick so it reads in the talk box)
  const mouth = '#5a3a1a';
  if (happy) for (let k = -7; k <= 7; k++) for (const d of [0, 1]) p.pix(38 + k, 54 + Math.round((49 - k * k) / 16) + d, mouth);
  else for (const d of [0, 1]) for (let k = -5; k <= 5; k++) p.pix(38 + k, 56 + d, mouth);
  p.line(36, 17, 36, 9, ramp('#7a5a2a'), 1);
  p.ellipse(36, 8, 3, 3, ramp('#7dffb0'), { form: 'flat', level: 4 });
  return p.toBuffer();
}

/**
 * The little research submarine (a draft name: the Little Nautilus), side
 * view: a round sunny-orange hull, a big front window, a propeller and a
 * headlamp. Frames turn the propeller. `face` turns it.
 */
export function paintSub(T: number, face: 'left' | 'right' = 'right', frame = 0, lampOn = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(40 * u), Math.round(26 * u));
  const hull = ramp('#f2902f');
  const trim = ramp('#f2c94c');
  // the propeller behind
  const blade = frame % 3;
  p.rect(S(1.5), S(12), S(4), S(2), WILD.metal, {});
  p.ellipse(S(2.2), S(13) - S(blade === 0 ? 4 : blade === 1 ? 1 : 2.5), S(1.1), S(3.2), WILD.metal, { sep: true });
  p.ellipse(S(2.2), S(13) + S(blade === 0 ? 3 : blade === 1 ? 4 : 1.5), S(1.1), S(3.2), WILD.metal, { sep: true });
  // the hull, a stripe, the conning tower and two skids
  p.ellipse(S(20), S(13), S(15.5), S(9.5), hull, { sep: true });
  p.shape((x, y) => Math.abs(y - S(15.5)) < S(1.2) && ((x - S(20)) / S(15.5)) ** 2 + ((y - S(13)) / S(9.5)) ** 2 < 1, [S(4), S(14), S(32), S(3)], trim, { form: 'flat', level: 3 });
  p.rect(S(15), S(1.8), S(9), S(4), hull, {
    form: 'cylV',
    box: [S(15), S(1.8), S(9), S(4)],
    sep: true,
  });
  p.rect(S(19), S(0.4), S(1.2), S(2), WILD.metal, {});
  for (const x of [11, 25]) p.rect(S(x), S(21.5), S(4), S(3.2), WILD.metal, { sep: true });
  p.rect(S(9), S(24), S(20), S(1.6), WILD.metal, { sep: true });
  // the big window with a reflection, and two little portholes
  p.ellipse(S(28), S(11.5), S(5.4), S(5.4), ramp('#5a6a7a'), { sep: true });
  p.ellipse(S(28), S(11.5), S(4.2), S(4.2), ramp('#7fdcff'), { bias: 0.25 });
  p.line(S(25.6), S(9.6), S(27.4), S(8.2), ramp('#ffffff'), 4);
  for (const x of [12, 17.5]) {
    p.ellipse(S(x), S(11), S(1.8), S(1.8), ramp('#5a6a7a'), { sep: true });
    p.ellipse(S(x), S(11), S(1.1), S(1.1), ramp('#7fdcff'), {
      form: 'flat',
      level: 3,
    });
  }
  // the headlamp at the nose
  p.ellipse(S(35.6), S(15.5), S(1.8), S(1.8), lampOn ? ramp('#fff6b0') : ramp('#c8c8b0'), { form: 'flat', level: lampOn ? 4 : 2 });
  const out = p.toBuffer();
  return face === 'left' ? out.flipX() : out;
}

// ------------------------------------------------------------------ land animals (16-bit, friendly)

/** A red-eyed tree frog on a leaf (frames: 0 sitting, 1 throat puffed). */
export function paintFrog(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(11 * u));
  const g = ramp('#5ad04a');
  p.ellipse(S(7), S(7), S(5), S(3.4), g, { sep: true });
  for (const x of [4.2, 9.8]) {
    p.ellipse(S(x), S(3.4), S(2), S(2), g, { sep: true });
    p.ellipse(S(x), S(3.4), S(1.3), S(1.3), WILD.red, {
      form: 'flat',
      level: 3,
    });
    p.rect(S(x - 0.3), S(2.5), S(0.7), S(1.8), ramp('#1a1a1a'), { level: 1 });
  }
  if (frame === 1) p.ellipse(S(7), S(8.6), S(2.4), S(1.6), ramp('#f2f0c0'), { sep: true });
  // blue sides and orange toes
  p.rect(S(3.2), S(7.6), S(7.6), S(0.9), WILD.blue, {
    onlyOver: true,
    level: 2,
  });
  for (const x of [1.6, 12.4, 4.4, 9.6])
    p.ellipse(S(x), S(10), S(1.1), S(0.8), WILD.orange, {
      form: 'flat',
      level: 3,
    });
  return p.toBuffer();
}

/** A toucan on a branch (frames: 0 still, 1 head tilted). */
export function paintToucan(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(18 * u), Math.round(20 * u));
  const black = ramp('#2a2a34');
  const tilt = frame === 1 ? 1 : 0;
  p.capsule(S(1), S(18.5), S(17), S(18.5), S(1.2), WILD.bark, { form: 'cylH' });
  p.poly(
    [
      [S(6), S(17)],
      [S(4), S(21)],
      [S(8), S(17)],
    ],
    black,
    {},
  );
  p.ellipse(S(7), S(12), S(4.4), S(5.6), black, { sep: true });
  p.ellipse(S(8), S(9.6 - tilt), S(2.6), S(2.4), ramp('#fff2a0'), {
    sep: true,
  });
  p.ellipse(S(7.4), S(6.4 - tilt), S(3), S(2.8), black, { sep: true });
  // the big bill: orange and yellow with a red tip
  p.poly(
    [
      [S(9.4), S(5 - tilt)],
      [S(17.4), S(6.6 - tilt)],
      [S(16.6), S(8.2 - tilt)],
      [S(9.4), S(8 - tilt)],
    ],
    WILD.orange,
    { sep: true, form: 'sphere', box: [S(9.4), S(5), S(8), S(3.2)] },
  );
  p.rect(S(9.6), S(5.2 - tilt), S(4), S(1.2), WILD.yellow, {
    onlyOver: true,
    level: 3,
  });
  p.ellipse(S(17), S(7.2 - tilt), S(0.9), S(0.9), WILD.red, {
    onlyOver: true,
    form: 'flat',
    level: 3,
  });
  p.ellipse(S(8), S(5.8 - tilt), S(1.1), S(1.1), ramp('#5ad0ff'), {
    form: 'flat',
    level: 3,
  });
  p.pix(S(8.2), S(5.8 - tilt), '#111111');
  return p.toBuffer();
}

/** A capuchin monkey sitting (frames: 0 still, 1 tail curled up). */
export function paintMonkey(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(18 * u), Math.round(20 * u));
  const fur = ramp('#7a5236');
  const face = ramp('#f0d2a8');
  const tail = frame === 1 ? [16, 6] : [17, 14];
  p.capsule(S(12), S(16), S(tail[0]), S(tail[1]), S(1), fur, { form: 'cylV' });
  p.ellipse(S(8), S(14), S(5), S(5.4), fur, { sep: true });
  p.ellipse(S(8), S(15), S(3), S(3.4), face, { bias: -0.1 });
  p.ellipse(S(8), S(6.6), S(4.6), S(4.4), fur, { sep: true });
  p.ellipse(S(8), S(7.2), S(3.3), S(3.1), face, {});
  p.ellipse(S(8), S(4), S(3), S(1.6), ramp('#2a1d1a'), {
    onlyOver: true,
    form: 'flat',
    level: 1,
  });
  for (const x of [6.6, 9.4]) p.pix(S(x), S(7), '#1a1414');
  p.line(S(7.2), S(9.2), S(8.8), S(9.2), ramp('#a06a4a'), 1);
  for (const x of [3.4, 12.6]) p.ellipse(S(x), S(6.6), S(1.3), S(1.6), face, { sep: true });
  for (const x of [5, 11]) p.ellipse(S(x), S(19), S(1.6), S(1), fur, { sep: true });
  return p.toBuffer();
}

/** A three-toed sloth hanging from a branch, smiling (frames: 0 still, 1 slow blink). */
export function paintSloth(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(18 * u));
  const fur = ramp('#a8906a');
  p.capsule(S(0.5), S(2), S(19.5), S(2), S(1.2), WILD.bark, { form: 'cylH' });
  for (const x of [5, 15]) p.capsule(S(x), S(2.6), S(x + (x < 10 ? 1.5 : -1.5)), S(8), S(1.1), fur, {});
  p.ellipse(S(10), S(10), S(6.6), S(5), fur, { sep: true });
  p.ellipse(S(10), S(13), S(3.6), S(3.4), fur, { sep: true });
  p.ellipse(S(10), S(13.4), S(2.8), S(2.4), ramp('#f0e0c0'), {});
  // the dark eye patches and a gentle smile
  for (const x of [8.6, 11.4]) {
    p.ellipse(S(x), S(13), S(1.1), S(0.7), ramp('#4a3a2a'), {
      form: 'flat',
      level: 1,
    });
    if (frame !== 1) p.pix(S(x), S(13), '#111111');
  }
  p.line(S(9.2), S(15), S(10.8), S(15), ramp('#7a5a3a'), 1);
  return p.toBuffer();
}

/** A blue morpho butterfly (frames: wings open, half, closed). */
export function paintButterfly(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(12 * u), Math.round(10 * u));
  const open = [1, 0.55, 0.15][frame % 3];
  const wing = ramp('#3a8ae8');
  for (const k of [-1, 1]) {
    p.ellipse(S(6 + k * 3 * open), S(4), S(3 * open + 0.5), S(3), wing, {
      sep: true,
    });
    p.ellipse(S(6 + k * 2.4 * open), S(7.4), S(2.2 * open + 0.4), S(2), wing, {
      sep: true,
    });
    if (open > 0.5)
      p.ellipse(S(6 + k * 4.4 * open), S(3), S(1), S(1), ramp('#1a2a5a'), {
        onlyOver: true,
        form: 'flat',
        level: 1,
      });
  }
  p.capsule(S(6), S(2.5), S(6), S(8.5), S(0.6), ramp('#2a2a34'), {});
  return p.toBuffer();
}

/** A jaguar resting calmly on a rock, eyes half closed (frames: 0 still, 1 tail flick). */
export function paintJaguar(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(30 * u), Math.round(18 * u));
  const coat = ramp('#e8a84a');
  const spot = ramp('#4a3020');
  p.ellipse(S(15), S(16), S(14), S(3), WILD.stone, { sep: true });
  const tailEnd: [number, number] = frame === 1 ? [3, 7] : [1.5, 13];
  p.capsule(S(6), S(12), tailEnd[0] * u, tailEnd[1] * u, S(1), coat, {
    form: 'cylV',
  });
  p.ellipse(S(14), S(11), S(8.5), S(3.8), coat, { sep: true });
  for (const x of [20, 23.6]) p.capsule(S(x), S(13), S(x + 2), S(14.4), S(1.1), coat, {});
  p.ellipse(S(23.4), S(7.6), S(4), S(3.6), coat, { sep: true });
  for (const x of [21, 25.6]) p.ellipse(S(x), S(4.4), S(1.1), S(1.2), coat, { sep: true });
  p.ellipse(S(25.4), S(9), S(1.8), S(1.3), ramp('#f6e6c8'), {});
  p.pix(S(26.6), S(8.4), '#2a1a14');
  // eyes half closed: content and calm
  for (const x of [22.4, 24.8]) p.line(S(x - 0.6), S(7), S(x + 0.6), S(7), spot, 1);
  // rosettes
  for (let i = 0; i < 14; i++) {
    const x = 7.5 + hash(i, 1, 30) * 13;
    const y = 8.6 + hash(i, 2, 30) * 4.6;
    p.ellipse(S(x), S(y), S(0.8), S(0.7), spot, {
      onlyOver: true,
      form: 'flat',
      level: 1,
    });
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ ocean animals (side view, used in the dive)

/** A green sea turtle swimming (frames: flippers up, level, down). */
export function paintTurtle(s: number, frame = 0): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(26 * s), Math.round(16 * s));
  const skin = ramp('#7aa86a');
  const shell = ramp('#6a7a3a');
  const fl = [-3, 0, 3][frame % 3];
  p.poly(
    [
      [S(11), S(8)],
      [S(6), S(2 + fl)],
      [S(15), S(6)],
    ],
    skin,
    { sep: true },
  );
  p.ellipse(S(12), S(9), S(8), S(4.6), shell, { sep: true });
  for (let i = 0; i < 5; i++)
    p.ellipse(S(7 + i * 2.6), S(8.6), S(1.1), S(1.8), ramp('#8a9a4a'), {
      onlyOver: true,
      form: 'flat',
      level: 3,
    });
  p.ellipse(S(21.5), S(9), S(3), S(2.2), skin, { sep: true });
  p.pix(S(22.6), S(8.4), '#111111');
  p.poly(
    [
      [S(14), S(11)],
      [S(18), S(15 - fl)],
      [S(11), S(12)],
    ],
    skin,
    { sep: true },
  );
  p.ellipse(S(4), S(10), S(1.6), S(1), skin, {});
  return p.toBuffer();
}

/** A clownfish (frames: tail left, tail right). */
export function paintClownfish(s: number, frame = 0): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(12 * s), Math.round(8 * s));
  const orange = ramp('#ff8a2a');
  const t = frame % 2 ? 1 : -1;
  p.poly(
    [
      [S(2.4), S(4)],
      [S(0.2), S(1.4 + t * 0.4)],
      [S(0.2), S(6.6 + t * 0.4)],
    ],
    orange,
    { sep: true },
  );
  p.ellipse(S(6.4), S(4), S(4.4), S(2.8), orange, { sep: true });
  for (const x of [4, 7.6]) p.rect(S(x), S(1), S(1.2), S(6), WILD.white, { onlyOver: true, level: 3 });
  p.pix(S(9.4), S(3.4), '#111111');
  return p.toBuffer();
}

/** A spotted eagle ray gliding (frames: wings up, level, down). */
export function paintRay(s: number, frame = 0): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(28 * s), Math.round(14 * s));
  const top = ramp('#3a4a6a');
  const w = [-2, 0, 2][frame % 3];
  p.poly(
    [
      [S(4), S(7 + w)],
      [S(14), S(4)],
      [S(22), S(6)],
      [S(14), S(10)],
    ],
    top,
    { sep: true },
  );
  p.capsule(S(4), S(7.5), S(0), S(8.5), S(0.3), top, {});
  for (let i = 0; i < 8; i++) p.pix(S(8 + hash(i, 1, 6) * 12), S(5.6 + hash(i, 2, 6) * 3), '#f2f4ec');
  p.ellipse(S(22.5), S(6.6), S(2), S(1.4), top, { sep: true });
  return p.toBuffer();
}

/** A friendly octopus (frames: arms curled, arms out). */
export function paintOctopus(s: number, frame = 0): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(18 * s), Math.round(18 * s));
  const c = ramp('#e8706a');
  const sp = frame % 2 ? 1.4 : 0;
  for (let k = 0; k < 6; k++) {
    const x = 3 + k * 2.4;
    p.capsule(S(x + 0.5), S(10), S(x + (k - 2.5) * sp * 0.6), S(16 - Math.abs(k - 2.5) * 0.6), S(0.9), c, {});
  }
  p.ellipse(S(9), S(6.6), S(5.6), S(5.4), c, { sep: true });
  for (const x of [7, 11]) {
    p.ellipse(S(x), S(8), S(1.2), S(1.2), WILD.white, {
      form: 'flat',
      level: 4,
    });
    p.pix(S(x + 0.3), S(8.2), '#111111');
  }
  return p.toBuffer();
}

/** A lanternfish with a row of glowing spots (the glow is drawn by the scene). */
export function paintLanternfish(s: number, frame = 0): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(12 * s), Math.round(6 * s));
  const b = ramp('#4a5a7a');
  const t = frame % 2 ? 0.6 : -0.6;
  p.poly(
    [
      [S(2), S(3)],
      [S(0), S(1 + t)],
      [S(0), S(5 + t)],
    ],
    b,
    {},
  );
  p.ellipse(S(6.6), S(3), S(4.6), S(2), b, { sep: true });
  p.ellipse(S(9.4), S(2.6), S(1.2), S(1.2), ramp('#bfe0ff'), {
    form: 'flat',
    level: 3,
  });
  for (let i = 0; i < 4; i++) p.pix(S(4 + i * 1.4), S(4.2), '#9ff0ff');
  return p.toBuffer();
}

/** A deep-sea anglerfish with its glowing lure (small and goofy, never scary). */
export function paintAnglerfish(s: number, frame = 0): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(18 * s), Math.round(14 * s));
  const b = ramp('#4a3a5a');
  p.poly(
    [
      [S(3), S(8)],
      [S(0), S(5)],
      [S(0), S(11)],
    ],
    b,
    {},
  );
  p.ellipse(S(9), S(8.4), S(6.4), S(5), b, { sep: true });
  // the lure on its stalk
  p.line(S(10), S(3.6), S(13.4), S(1.4), ramp('#6a5a7a'), 2);
  p.ellipse(S(14), S(1.6 + (frame % 2) * 0.4), S(1.3), S(1.3), ramp('#d8ff8a'), { form: 'flat', level: 4 });
  // a wide grin with little teeth, and a round eye
  p.line(S(11), S(10.6), S(15.4), S(9.4), ramp('#2a1a2a'), 1);
  for (const x of [12, 13.4, 14.6]) p.pix(S(x), S(10.2 - (x - 12) * 0.25), '#f2f4ec');
  p.ellipse(S(12.6), S(6.4), S(1.2), S(1.2), WILD.white, {
    form: 'flat',
    level: 4,
  });
  p.pix(S(12.9), S(6.5), '#111111');
  return p.toBuffer();
}

/** A drifting deep-sea jelly (its glow is drawn by the scene). */
export function paintJelly(s: number, frame = 0): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(10 * s), Math.round(14 * s));
  const bell = ramp('#c8a8ff');
  const sq = frame % 2 ? 0.6 : 0;
  p.ellipse(S(5), S(4), S(4 - sq), S(3.4 + sq * 0.5), bell, { sep: true });
  for (let k = 0; k < 4; k++) p.line(S(2.4 + k * 1.7), S(7), S(2.4 + k * 1.7 + Math.sin(k + frame) * 0.8), S(13), ramp('#e8d8ff'), 2);
  p.line(S(5), S(1.2), S(5), S(6.6), ramp('#ffffff'), 3);
  return p.toBuffer();
}

// ------------------------------------------------------------------ camp props

/** A big rainforest tree with buttress roots and a leafy crown (seed varies the crown). */
export function paintRainTree(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(48 * u);
  const H = Math.round(80 * u);
  const p = new Paint(W, H);
  // the trunk and the buttress roots
  p.rect(S(20), S(30), S(8), S(46), WILD.bark, {
    form: 'cylV',
    box: [S(20), S(30), S(8), S(46)],
  });
  for (const [x1, x2] of [
    [21, 12],
    [27, 36],
    [23, 18],
  ])
    p.poly(
      [
        [S(x1), S(60)],
        [S(x2), S(78)],
        [S(x1 + (x2 > x1 ? 3 : -3)), S(78)],
      ],
      WILD.bark,
      { sep: true },
    );
  // vines hanging down
  for (const vx of [18, 30]) for (let y = 30; y < 58; y += 2) p.dot(S(vx + Math.sin(y / 3) * 0.8), S(y), WILD.leaf2, 2);
  // the crown: overlapping clumps of leaves
  const clumps = [
    [24, 18, 16, 12],
    [12, 24, 10, 8],
    [36, 23, 11, 8],
    [24, 8, 12, 8],
    [16, 12, 9, 7],
    [33, 12, 9, 7],
  ];
  clumps.forEach(([cx, cy, rx, ry], i) =>
    p.ellipse(S(cx), S(cy), S(rx), S(ry), i % 2 ? WILD.leaf : WILD.leaf2, {
      sep: true,
      dither: true,
    }),
  );
  for (let i = 0; i < 60; i++) {
    const x = S(6 + hash(i, 1, 40 + seed) * 36);
    const y = S(3 + hash(i, 2, 40 + seed) * 26);
    p.dot(x, y, WILD.leaf3, 3);
  }
  // a flowering bromeliad on a branch
  if (seed % 2 === 0)
    p.ellipse(S(16), S(32), S(2), S(1.4), WILD.pink, {
      form: 'flat',
      level: 3,
    });
  return p.toBuffer();
}

/** A tall palm. */
export function paintPalm(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(30 * u), Math.round(56 * u));
  const bend = seed % 2 ? 1 : -1;
  for (let y = 18; y < 56; y++) {
    const x = 15 + bend * Math.sin((y - 18) / 24) * 3;
    p.rect(S(x - 1.6), S(y), S(3.2), S(1), y % 4 < 1 ? WILD.bark2 : WILD.bark, {
      form: 'cylV',
      box: [S(x - 1.6), S(y), S(3.2), S(1)],
    });
  }
  for (let k = 0; k < 7; k++) {
    const a = Math.PI + (k / 6) * Math.PI;
    for (let t = 0; t < 1; t += 0.04) {
      const x = 15 + Math.cos(a) * 14 * t;
      const y = 18 + Math.sin(a) * 9 * t + t * t * 9;
      p.dot(S(x), S(y), k % 2 ? WILD.leaf : WILD.leaf2, t < 0.7 ? 2 : 3);
      p.dot(S(x), S(y) + 1, k % 2 ? WILD.leaf : WILD.leaf2, 1);
    }
  }
  p.ellipse(S(14), S(19), S(2.2), S(2), WILD.mud, { sep: true });
  return p.toBuffer();
}

/** A clump of ferns and big leaves (seed varies them; some have flowers). */
export function paintFern(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(22 * u), Math.round(16 * u));
  for (let k = 0; k < 7; k++) {
    const a = Math.PI + 0.25 + (k / 6) * (Math.PI - 0.5);
    p.capsule(S(11), S(15), S(11) + Math.cos(a) * S(10), S(15) + Math.sin(a) * S(12), S(1.4), k % 2 ? WILD.leaf : WILD.leaf3, { sep: true });
  }
  if (seed % 3 === 1)
    for (const [x, y] of [
      [6, 6],
      [15, 5],
    ])
      p.ellipse(S(x), S(y), S(1.6), S(2.2), WILD.red, {
        sep: true,
        form: 'sphere',
      });
  if (seed % 3 === 2)
    for (const [x, y] of [
      [8, 7],
      [14, 8],
    ])
      p.ellipse(S(x), S(y), S(1.4), S(1.4), WILD.yellow, {
        form: 'flat',
        level: 3,
      });
  return p.toBuffer();
}

/** Little glowing mushrooms (they glow at dusk; living light). */
export function paintMushrooms(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(12 * u), Math.round(9 * u));
  for (const [x, y, r] of [
    [3.5, 5, 2.6],
    [8, 6, 2],
    [10.4, 4, 1.4],
  ]) {
    p.rect(S(x - 0.5), S(y), S(1), S(8.6 - y), WILD.white, {});
    p.ellipse(S(x), S(y), S(r), S(r * 0.7), ramp('#9aff8a'), {
      sep: true,
      bias: 0.2,
    });
  }
  return p.toBuffer();
}

/** A field tent (canvas, rope lines and an open flap). */
export function paintTent(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(40 * u), Math.round(30 * u));
  const c = seed % 2 ? WILD.canvas2 : WILD.canvas;
  p.poly(
    [
      [S(20), S(2)],
      [S(38), S(28)],
      [S(2), S(28)],
    ],
    c,
    { sep: true, form: 'sphere', box: [S(2), S(2), S(36), S(26)] },
  );
  // the open door flap and the dark inside
  p.poly(
    [
      [S(20), S(9)],
      [S(26), S(28)],
      [S(14), S(28)],
    ],
    WILD.dark,
    { form: 'flat', level: 1 },
  );
  p.poly(
    [
      [S(20), S(9)],
      [S(14), S(28)],
      [S(11), S(28)],
    ],
    c,
    { sep: true, form: 'flat', level: 3 },
  );
  p.line(S(20), S(2), S(20), S(0), WILD.wood, 1);
  for (const x of [0.5, 39.5]) p.line(S(20), S(3), S(x), S(29), ramp('#e6d8b0'), 3);
  return p.toBuffer();
}

/** The dock lab: an open-sided tent with a table, a microscope, jars and a laptop-like field notebook. */
export function paintLabTent(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(56 * u), Math.round(40 * u));
  // the roof on four poles
  for (const x of [4, 52])
    p.rect(S(x - 0.8), S(10), S(1.6), S(30), WILD.wood, {
      form: 'cylV',
      box: [S(x - 0.8), S(10), S(1.6), S(30)],
    });
  p.poly(
    [
      [S(0), S(13)],
      [S(10), S(2)],
      [S(46), S(2)],
      [S(56), S(13)],
    ],
    WILD.canvas2,
    { sep: true, form: 'sphere', box: [S(0), S(2), S(56), S(11)] },
  );
  for (let x = 2; x < 54; x += 6)
    p.rect(S(x), S(12), S(3), S(2), x % 12 < 6 ? WILD.orange : WILD.canvas2, {
      level: 3,
    });
  // the table and what is on it
  p.rect(S(10), S(26), S(36), S(3), WILD.wood, {
    sep: true,
    form: 'cylH',
    box: [S(10), S(26), S(36), S(3)],
  });
  for (const x of [12, 44]) p.rect(S(x), S(29), S(1.6), S(10), WILD.wood, {});
  p.rect(S(14), S(19), S(3), S(7), WILD.metal, { sep: true });
  p.rect(S(12.6), S(17), S(6), S(2.4), WILD.dark, { sep: true });
  for (const [x, c] of [
    [24, '#7fdcff'],
    [28, '#9aff8a'],
    [32, '#ffb07a'],
  ] as const) {
    p.rect(S(x), S(21), S(3), S(5), ramp(c), {
      sep: true,
      form: 'cylV',
      box: [S(x), S(21), S(3), S(5)],
    });
    p.rect(S(x - 0.3), S(20), S(3.6), S(1.2), WILD.dark, {});
  }
  p.rect(S(37), S(22), S(7), S(4), ramp('#e6d8b0'), { sep: true });
  p.line(S(38), S(23.4), S(43), S(23.4), WILD.dark, 1);
  return p.toBuffer();
}

/** The touch tank: a low wooden tank with water, a starfish and a sea urchin. */
export function paintTouchTank(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(32 * u), Math.round(16 * u));
  p.rect(S(1), S(4), S(30), S(11), WILD.wood, {
    sep: true,
    form: 'cylH',
    box: [S(1), S(4), S(30), S(11)],
  });
  p.rect(S(3), S(5), S(26), S(6), WILD.sea, { form: 'flat', level: 2 });
  for (let x = 4; x < 28; x += 3) p.pix(S(x + (frame % 2)), S(6), '#bff0ff');
  // a starfish and an urchin
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + (k / 5) * Math.PI * 2;
    p.line(S(10), S(8.4), S(10 + Math.cos(a) * 2.4), S(8.4 + Math.sin(a) * 1.6), WILD.orange, 3);
  }
  p.ellipse(S(21), S(8.6), S(1.6), S(1.2), WILD.purple, {
    form: 'flat',
    level: 2,
  });
  for (let k = 0; k < 8; k++) p.pix(S(21 + Math.cos(k) * 2.2), S(8.6 + Math.sin(k) * 1.6), '#5a3a7a');
  return p.toBuffer();
}

/** The ocean-zone chart on an easel: bands from bright turquoise to black, with little animal marks. */
export function paintZoneChart(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(34 * u));
  for (const [x1, x2] of [
    [4, 2],
    [16, 18],
  ])
    p.line(S(x1), S(22), S(x2), S(34), WILD.wood, 2);
  p.rect(S(2), S(1), S(16), S(22), WILD.wood, { sep: true });
  const bands = ['#5ad0f0', '#2f8fc8', '#1f4f9a', '#141e4a', '#0a0c1e'];
  bands.forEach((c, i) => p.rect(S(3), S(2 + i * 4), S(14), S(4), ramp(c), { form: 'flat', level: 2 }));
  p.ellipse(S(7), S(4), S(1.6), S(1), WILD.orange, { form: 'flat', level: 3 });
  p.pix(S(12), S(10), '#9ff0ff');
  p.pix(S(13), S(10), '#9ff0ff');
  p.ellipse(S(10), S(15), S(1), S(1), ramp('#d8ff8a'), {
    form: 'flat',
    level: 4,
  });
  return p.toBuffer();
}

/** The weather mast: a pole with spinning wind cups and a vane (frames spin the cups). */
export function paintWeatherMast(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(44 * u));
  p.rect(S(6.2), S(8), S(1.6), S(36), WILD.metal, {
    form: 'cylV',
    box: [S(6.2), S(8), S(1.6), S(36)],
  });
  const a = (frame % 4) * (Math.PI / 6);
  for (let k = 0; k < 3; k++) {
    const ang = a + (k / 3) * Math.PI * 2;
    const x = 7 + Math.cos(ang) * 5;
    const y = 6 + Math.sin(ang) * 1.4;
    p.line(S(7), S(6), S(x), S(y), WILD.metal, 2);
    p.ellipse(S(x), S(y), S(1.2), S(1), WILD.white, { sep: true });
  }
  p.poly(
    [
      [S(7), S(12)],
      [S(13), S(13)],
      [S(7), S(14)],
    ],
    WILD.red,
    {},
  );
  p.rect(S(4), S(34), S(6), S(4), WILD.white, { sep: true });
  return p.toBuffer();
}

/** The camp jeep (green, with a spare tire). */
export function paintJeep(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(40 * u), Math.round(24 * u));
  const body = ramp('#5a8a4a');
  for (const x of [9, 31]) p.ellipse(S(x), S(19.5), S(4.2), S(4.2), WILD.dark, { sep: true });
  p.rect(S(2), S(9), S(36), S(9), body, {
    sep: true,
    form: 'sphere',
    box: [S(2), S(9), S(36), S(9)],
  });
  p.rect(S(8), S(3), S(18), S(7), body, { sep: true });
  p.rect(S(10), S(4.4), S(6), S(4.6), ramp('#9adcf0'), { level: 3 });
  p.rect(S(18), S(4.4), S(6), S(4.6), ramp('#9adcf0'), { level: 3 });
  p.ellipse(S(1.8), S(13), S(2), S(3.4), WILD.dark, { sep: true });
  p.rect(S(34), S(11), S(3), S(2), WILD.yellow, { level: 4 });
  for (const x of [9, 31])
    p.ellipse(S(x), S(19.5), S(1.6), S(1.6), WILD.metal, {
      form: 'flat',
      level: 3,
    });
  return p.toBuffer();
}

/** A lantern on a post (it glows at dusk). */
export function paintLanternPost(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(10 * u), Math.round(30 * u));
  p.rect(S(4.2), S(6), S(1.6), S(24), WILD.wood, {
    form: 'cylV',
    box: [S(4.2), S(6), S(1.6), S(24)],
  });
  p.line(S(5), S(6), S(8), S(6), WILD.wood, 2);
  p.rect(S(6.6), S(6.6), S(3), S(4), WILD.dark, { sep: true });
  p.rect(S(7.1), S(7.4), S(2), S(2.6), WILD.yellow, { level: 4 });
  return p.toBuffer();
}

/** A stack of supply crates and a coiled rope. */
export function paintSupplies(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(24 * u), Math.round(18 * u));
  p.rect(S(1), S(7), S(11), S(10), WILD.wood, {
    sep: true,
    form: 'sphere',
    box: [S(1), S(7), S(11), S(10)],
  });
  p.rect(S(12), S(9), S(10), S(8), WILD.plank, {
    sep: true,
    form: 'sphere',
    box: [S(12), S(9), S(10), S(8)],
  });
  p.rect(S(4), S(1), S(9), S(7), WILD.plank, {
    sep: true,
    form: 'sphere',
    box: [S(4), S(1), S(9), S(7)],
  });
  for (const [x, y, w] of [
    [1, 11, 11],
    [12, 12, 10],
    [4, 4, 9],
  ])
    p.rect(S(x), S(y), S(w), S(1), WILD.bark, { level: 1 });
  p.ellipse(S(19), S(6), S(3.4), S(2.2), WILD.khaki, { sep: true });
  p.ellipse(S(19), S(6), S(1.6), S(1), WILD.dirt, { form: 'flat', level: 1 });
  return p.toBuffer();
}

/** A heron standing in the shallows (frames: 0 still, 1 looking down). */
export function paintHeron(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(28 * u));
  const feather = ramp('#e8eef0');
  for (const x of [6, 8]) p.line(S(x), S(18), S(x), S(28), ramp('#c8a040'), 2);
  p.ellipse(S(7), S(15), S(4.4), S(3.6), feather, { sep: true });
  const nx = frame === 1 ? 10 : 8;
  const ny = frame === 1 ? 10 : 5;
  p.capsule(S(8), S(13), S(nx), S(ny + 2), S(0.9), feather, {});
  p.ellipse(S(nx), S(ny), S(1.8), S(1.6), feather, { sep: true });
  p.line(S(nx + 1.4), S(ny + 0.2), S(nx + 4.4), S(ny + 1), ramp('#f2c94c'), 3);
  p.pix(S(nx + 0.4), S(ny - 0.4), '#111111');
  return p.toBuffer();
}

export { PixelBuffer };
