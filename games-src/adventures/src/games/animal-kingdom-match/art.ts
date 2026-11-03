import { PixelBuffer } from '../../kit/art/pixel';
import { Paint, hash, ramp, type Ramp } from '../../kit/worlds/shade';
import { paintSaguaro, type Habitat } from '../../kit/worlds/wild-lands/animal-art';
import { WILD, paintPalm, paintRainTree } from '../../kit/worlds/wild-lands/art';
import { paintCritter, type Critter } from '../../kit/worlds/wild-lands/habitats';

/**
 * Animal Kingdom Match's own pictures for the Ranger Journal, the Rescue
 * Center and the binoculars: an animal on its home's colors, two animals
 * side by side, a habitat card for each of the four homes, the rainforest's
 * three layers, the desert by day and by night, the four needs (food, water,
 * shelter, space) and the Junior Ranger patches. Labels are added by the
 * page as text.
 */

interface Look {
  sky: string;
  ground: Ramp;
  far: Ramp;
}

const LOOK: Record<Habitat, Look> = {
  rainforest: { sky: '#bfe2dc', ground: ramp('#4a7a3a'), far: ramp('#2f7a4a') },
  desert: { sky: '#d8e8ee', ground: ramp('#e8c088', { warm: 1.2 }), far: ramp('#c8784a', { warm: 1.2 }) },
  poles: { sky: '#d8ecf8', ground: ramp('#f2f6fa'), far: ramp('#a8c8e0', { cool: 1 }) },
  wetland: { sky: '#a8d4ee', ground: ramp('#6aa84a'), far: ramp('#3a8a5a') },
};

/** Which home a critter comes from (for its card's colors). */
const HOME_OF: Partial<Record<Critter, Habitat>> = {
  jaguar: 'rainforest',
  tapir: 'rainforest',
  'dart-frog': 'rainforest',
  frog: 'rainforest',
  monkey: 'rainforest',
  sloth: 'rainforest',
  toucan: 'rainforest',
  butterfly: 'rainforest',
  camel: 'desert',
  fennec: 'desert',
  gecko: 'desert',
  tortoise: 'desert',
  roadrunner: 'desert',
  'polar-bear': 'poles',
  'arctic-fox': 'poles',
  walrus: 'poles',
  penguin: 'poles',
  seal: 'poles',
  'snowy-owl': 'poles',
};

function put(p: Paint, b: PixelBuffer, x0: number, y0: number): void {
  for (let y = 0; y < b.h; y++)
    for (let x = 0; x < b.w; x++) {
      const c = b.get(x, y);
      if (c) p.pix(Math.round(x0) + x, Math.round(y0) + y, c);
    }
}

/** A critter painted as big as fits in a w x h box (whole pixels per design pixel when it can). */
export function fitCritter(id: Critter, w: number, h: number, frame = 0): PixelBuffer {
  for (let T = 48; T >= 10; T -= 2) {
    const b = paintCritter(id, T, frame);
    if (b.w <= w && b.h <= h) return b;
  }
  return paintCritter(id, 10, frame);
}

/** A sky fading down to a horizon, with a far ridge, and ground below. */
function backdrop(p: Paint, W: number, H: number, look: Look, horizon: number, seed: number): void {
  const sky = ramp(look.sky);
  for (let y = 0; y < horizon; y++) for (let x = 0; x < W; x++) p.dot(x, y, sky, y < horizon * 0.4 ? 4 : 3);
  for (let x = 0; x < W; x++) {
    const top = horizon - 4 - Math.round(hash(x >> 3, 0, seed) * 6);
    for (let y = top; y < horizon; y++) p.dot(x, y, look.far, y === top ? 3 : 2);
  }
  for (let y = horizon; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, look.ground, hash(x >> 1, y >> 1, seed + 1) < 0.08 ? 1 : y < horizon + 2 ? 3 : 2);
}

/** One animal standing on its home's colors (the journal card and the Rescue Center). */
export function paintAnimalCard(id: Critter, W = 96, H = 72, frame = 0): PixelBuffer {
  const p = new Paint(W, H);
  const look = LOOK[HOME_OF[id] ?? 'rainforest'];
  backdrop(p, W, H, look, Math.round(H * 0.55), 3);
  const b = fitCritter(id, W - 10, H - 8, frame);
  put(p, b, (W - b.w) / 2, H - 4 - b.h);
  return p.toBuffer({ outline: false });
}

/** The view through the binoculars: the animal in the middle, so the round lenses never cut it off. */
export function paintLensView(id: Critter, W = 128, H = 96): PixelBuffer {
  const p = new Paint(W, H);
  const look = LOOK[HOME_OF[id] ?? 'rainforest'];
  backdrop(p, W, H, look, Math.round(H * 0.5), 3);
  const b = fitCritter(id, Math.round(W * 0.56), Math.round(H * 0.6));
  put(p, b, (W - b.w) / 2, Math.round(H * 0.8) - b.h);
  return p.toBuffer({ outline: false });
}

/** Two animals side by side, each on its own home's colors. */
export function paintPair(a: Critter, b: Critter, W = 160, H = 72): PixelBuffer {
  const out = new PixelBuffer(W, H);
  const half = Math.floor(W / 2) - 2;
  out.blit(paintAnimalCard(a, half, H), 0, 0);
  out.blit(paintAnimalCard(b, half, H), W - half, 0);
  return out;
}

/** A habitat card: the land, the weather and its plants. */
export function paintHabitatCard(hab: Habitat, W = 128, H = 80): PixelBuffer {
  const p = new Paint(W, H);
  const look = LOOK[hab];
  const horizon = Math.round(H * 0.5);
  backdrop(p, W, H, look, horizon, 7);
  if (hab === 'rainforest') {
    // rain, a stream and giant trees
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(hash(i, 1, 9) * W);
      const y = Math.floor(hash(i, 2, 9) * horizon);
      p.pix(x, y, '#e8f4f8');
      p.pix(x, y + 1, '#e8f4f8');
    }
    for (let x = 0; x < W; x++) {
      const y = Math.round(H * 0.78 + Math.sin(x / 9) * 2);
      for (let k = 0; k < 4; k++) p.dot(x, y + k, WILD.river, k === 0 ? 3 : 2);
    }
    put(p, paintRainTree(16, 0), -8, H * 0.78 - 46);
    put(p, paintRainTree(16, 2), W - 40, H * 0.72 - 46);
    put(p, paintPalm(16, 1), W * 0.42, H * 0.6 - 24);
  } else if (hab === 'desert') {
    p.ellipse(W * 0.8, H * 0.2, 7, 7, ramp('#fff6c0'), { form: 'flat', level: 3 });
    for (let x = 0; x < W; x++) if (Math.sin(x / 6 + 1) > 0.6) p.pix(x, Math.round(H * 0.7 + Math.sin(x / 13) * 3), '#c8a070');
    p.ellipse(W * 0.72, H * 0.82, 14, 4, WILD.river, { sep: true });
    put(p, paintSaguaro(16, 0), W * 0.12, H * 0.92 - 30);
    put(p, paintSaguaro(16, 1), W * 0.42, H * 0.85 - 30);
  } else if (hab === 'poles') {
    for (let x = 0; x < W; x++) for (let y = Math.round(H * 0.62); y < Math.round(H * 0.74); y++) p.dot(x, y, WILD.sea, y === Math.round(H * 0.62) ? 3 : 2);
    p.poly(
      [
        [W * 0.1, H * 0.62],
        [W * 0.22, H * 0.36],
        [W * 0.34, H * 0.62],
      ],
      ramp('#d8ecf8', { cool: 1 }),
      { sep: true },
    );
    for (let i = 0; i < 24; i++) p.pix(Math.floor(hash(i, 1, 4) * W), Math.floor(hash(i, 2, 4) * H * 0.5), '#ffffff');
  } else {
    p.ellipse(W * 0.38, H * 0.78, W * 0.3, H * 0.13, WILD.river, { sep: true });
    for (const [x, y] of [
      [W * 0.3, H * 0.76],
      [W * 0.46, H * 0.8],
    ])
      p.ellipse(x, y, 4, 2, ramp('#4aa05a'), { sep: true });
    for (let k = 0; k < 9; k++) p.line(W * 0.75 + k * 3, H * 0.9, W * 0.75 + k * 3 + 1, H * 0.62, ramp('#7a9a3a'), 2);
  }
  return p.toBuffer({ outline: false });
}

/** The rainforest's three layers, top to bottom, with animals in each. The layer bands' middles (0-1) are returned for labels. */
export function paintLayers(W = 136, H = 120): { buf: PixelBuffer; labels: Record<'canopy' | 'understory' | 'floor', [number, number]> } {
  const p = new Paint(W, H);
  const sky = ramp('#bfe2dc');
  const y1 = Math.round(H * 0.4);
  const y2 = Math.round(H * 0.72);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (y < 8) p.dot(x, y, sky, 3);
      else if (y < y1) p.dot(x, y, WILD.leaf, hash(x >> 2, y >> 2, 3) < 0.3 ? 3 : 2);
      else if (y < y2) p.dot(x, y, ramp('#2f6a4a'), hash(x >> 2, y >> 2, 4) < 0.2 ? 3 : 2);
      else p.dot(x, y, ramp('#6a5a3a'), hash(x >> 1, y >> 1, 5) < 0.12 ? 1 : 2);
    }
  for (const x of [W * 0.2, W * 0.78]) p.rect(x - 3, 10, 6, H - 12, WILD.bark, { form: 'cylV' });
  for (let x = 4; x < W; x += 13) p.ellipse(x, 10, 9, 6, WILD.leaf3, { sep: true });
  for (const [x, y] of [
    [W * 0.42, y1 + 10],
    [W * 0.62, y1 + 16],
  ])
    p.ellipse(x, y, 10, 4, ramp('#3a8a4a'), { sep: true });
  put(p, fitCritter('toucan', 26, 26), W * 0.06, y1 - 30);
  put(p, fitCritter('monkey', 30, 30), W * 0.38, y1 - 34);
  put(p, fitCritter('sloth', 28, 28), W * 0.72, y1 - 32);
  put(p, fitCritter('frog', 18, 14), W * 0.5, y1 + 4);
  put(p, fitCritter('tapir', 36, 26), W * 0.08, H - 28);
  put(p, fitCritter('dart-frog', 14, 10), W * 0.62, H - 14);
  // label spots (0-1, the middle of each label), clear of the animals: above the treetops, left of the frog, above the floor's animals
  return { buf: p.toBuffer({ outline: false }), labels: { canopy: [0.5, 0.0], understory: [0.27, (y1 + 14) / H], floor: [0.5, (y2 + 4) / H] } };
}

/** The desert by day (hot sun, a fox asleep in its burrow) and by night (moon, stars, the fox out hunting). */
export function paintDayNight(W = 168, H = 80): PixelBuffer {
  const p = new Paint(W, H);
  const half = Math.floor(W / 2);
  const horizon = Math.round(H * 0.56);
  const sand = ramp('#e8c088', { warm: 1.2 });
  const nightSand = ramp('#7a6a8a');
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const night = x >= half;
      if (y < horizon) p.dot(x, y, ramp(night ? '#2a2a5a' : '#cfe4ee'), y < horizon * 0.5 ? 3 : 2);
      else p.dot(x, y, night ? nightSand : sand, hash(x >> 1, y >> 1, 6) < 0.08 ? 1 : 2);
    }
  p.ellipse(half * 0.5, H * 0.24, 8, 8, ramp('#fff2a0'), { form: 'flat', level: 4 });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    p.pix(half * 0.5 + Math.cos(a) * 11, H * 0.24 + Math.sin(a) * 11, '#ffd040');
  }
  p.ellipse(half + half * 0.7, H * 0.22, 6, 6, ramp('#f2f0d8'), { form: 'flat', level: 3 });
  p.ellipse(half + half * 0.7 + 3, H * 0.2, 5, 5, ramp('#2a2a5a'), { form: 'flat', level: 2 });
  for (let i = 0; i < 18; i++) p.pix(half + Math.floor(hash(i, 1, 8) * half), Math.floor(hash(i, 2, 8) * horizon * 0.8), '#fff6e0');
  // by day: a burrow with the fox asleep in it; by night: the fox out on the sand
  p.ellipse(half * 0.5, H * 0.82, 16, 7, ramp('#8a5a3a'), { sep: true });
  const sleeping = fitCritter('fennec', 22, 14, 2);
  put(p, sleeping, half * 0.5 - sleeping.w / 2, H * 0.84 - sleeping.h + 2);
  const out = fitCritter('fennec', 34, 26, 1);
  put(p, out, half + half * 0.4, H - 4 - out.h);
  for (let y = 0; y < H; y++) p.pix(half, y, '#1a1414');
  return p.toBuffer({ outline: false });
}

/** The four needs, each in a square: food (fruit), water (a drop), shelter (a tree hole) and space (open land). */
export function paintNeeds(S = 34): PixelBuffer {
  const W = S * 4 + 6;
  const p = new Paint(W, S);
  const card = ramp('#f2ecd8');
  for (let i = 0; i < 4; i++) {
    const x0 = i * (S + 2);
    p.rect(x0, 0, S, S, card, { level: 3 });
    const cx = x0 + S / 2;
    const cy = S / 2;
    if (i === 0) {
      p.ellipse(cx - 4, cy + 3, 6, 6, WILD.red, { sep: true, form: 'sphere' });
      p.ellipse(cx + 5, cy + 2, 5, 6, WILD.yellow, { sep: true, form: 'sphere' });
      p.ellipse(cx - 2, cy - 5, 3, 2, WILD.leaf, { sep: true });
    } else if (i === 1)
      p.poly(
        [
          [cx, cy - 11],
          [cx + 8, cy + 3],
          [cx + 5, cy + 9],
          [cx - 5, cy + 9],
          [cx - 8, cy + 3],
        ],
        ramp('#3a9ad8'),
        { sep: true, form: 'sphere' },
      );
    else if (i === 2) {
      p.rect(cx - 7, cy - 12, 14, 24, WILD.bark, { form: 'cylV', sep: true });
      p.ellipse(cx, cy - 1, 4, 5, ramp('#2a1a10'), { form: 'flat', level: 1 });
    } else {
      p.rect(x0 + 3, cy + 2, S - 6, S / 2 - 5, WILD.grass, { sep: true });
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
      ]) {
        const tip = cx + dx * 11;
        p.line(cx + dx * 2, cy - 5 + dy, tip, cy - 5, ramp('#2a3a3a'), 1);
        p.line(tip, cy - 5, tip - dx * 3, cy - 8, ramp('#2a3a3a'), 1);
        p.line(tip, cy - 5, tip - dx * 3, cy - 2, ramp('#2a3a3a'), 1);
      }
    }
  }
  return p.toBuffer({ outline: false });
}

/** A Junior Ranger patch for a trip (grey until the trip is done, faded until it is open). */
export function paintPatch(hab: Habitat, lit: boolean, open = true): PixelBuffer {
  const p = new Paint(24, 24);
  const rim = ramp(lit ? '#c8a040' : '#8a8a80');
  const inner = lit ? { rainforest: '#3fae5a', desert: '#e0b060', poles: '#cfe6f6', wetland: '#3aa6b8' }[hab] : open ? '#c8c4b4' : '#a8a498';
  p.ellipse(12, 12, 11, 11, rim, { sep: true, form: 'flat', level: 2 });
  p.ellipse(12, 12, 8.6, 8.6, ramp(inner), { form: 'flat', level: 3 });
  const ink = ramp(lit ? '#2a3a2a' : '#6a6a60');
  if (hab === 'rainforest') {
    p.rect(11, 12, 2, 6, ink, { level: 1 });
    p.ellipse(12, 10, 5, 4, ink, { level: 1 });
  } else if (hab === 'desert') {
    p.rect(11, 7, 2, 11, ink, { level: 1 });
    p.rect(8, 10, 2, 4, ink, { level: 1 });
    p.rect(14, 9, 2, 4, ink, { level: 1 });
  } else if (hab === 'poles') {
    for (const [a, b, c, d] of [
      [12, 6, 12, 18],
      [7, 9, 17, 15],
      [7, 15, 17, 9],
    ])
      p.line(a, b, c, d, ink, 1);
  } else
    p.poly(
      [
        [12, 6],
        [16, 13],
        [14, 17],
        [10, 17],
        [8, 13],
      ],
      ink,
      { level: 1 },
    );
  return p.toBuffer({ outline: false });
}
