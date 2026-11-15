import { PixelBuffer } from '../../art/pixel';
import { paintHero, type Look16 } from '../hero16';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { paintHeron, WILD } from './art';

/**
 * Wild Lands art for Pollution Solution Squad, the first crafting adventure
 * (the "S4 Environment: Pollution Solution Squad" section of
 * docs/GAMES_3D_UPGRADE_PLAN.md), in the new `coastline` setting: a beach, a
 * harbor at the river mouth, a wetland and a farm town upstream, all drawn
 * side on like Weather Wizard Battle.
 *
 * - the cast: Marisol Vega, Rafi Haddad, Dr. Wen Li, Rosa Delgado, the player
 *   as a Squad cadet (a backpack and a grabber), and Ollie the river otter
 * - trash and the materials it becomes, natural things to leave alone
 * - the fixes you craft and build (the drain net, the oil boom, reeds, the
 *   filter, the buffer strip, the rain garden...)
 * - the four water gauges (trash, oil, mud, oxygen)
 * - the ground and layered backgrounds of each stretch, dirty and clean
 * - the Nature Center's pieces and the animals that visit them
 *
 * Same painter and rules as the rest of the world: designs are written at 16
 * pixels per tile and scaled by u = T / 16. Animals are friendly and never
 * shown hurt: a tangled otter looks worried, not injured.
 */

const U = (T: number) => T / 16;
const INK = '#1e1a24';

export const COAST = {
  sea: ramp('#2f8fc8', { cool: 0.9 }),
  river: ramp('#3aa6b8'),
  mudWater: ramp('#8a6a44'),
  algae: ramp('#3f8a6a', { cool: 0.5 }),
  oil: ramp('#2a2a34', { cool: 1.2 }),
  sand: WILD.sand,
  wetSand: ramp('#c8a86a'),
  dune: ramp('#e8d49a'),
  grass: WILD.grass,
  soil: ramp('#8a603c'),
  rich: ramp('#5a3a24'),
  clay: ramp('#a87050'),
  rock: ramp('#8a8a86'),
  road: ramp('#6a6a72', { cool: 1.1 }),
  curb: ramp('#b0aca0'),
  plank: WILD.plank,
  wood: WILD.wood,
  driftwood: ramp('#b89a78'),
  pipe: ramp('#8a9298', { cool: 1.1 }),
  rust: ramp('#a8603a'),
  net: ramp('#3a8a7a'),
  rope: ramp('#c8a060'),
  float: ramp('#f2b030'),
  bottle: ramp('#7ac8e0', { cool: 1.2 }),
  can: ramp('#c8cad0', { cool: 1.2 }),
  bag: ramp('#eef2f4', { cool: 1.4 }),
  tire: ramp('#3a3a40'),
  glass: ramp('#5aa86a'),
  ring: ramp('#e8e0c8'),
  battery: ramp('#e0503a'),
  otter: ramp('#8a5a36', { warm: 1.1 }),
  otterBelly: ramp('#d8b890', { warm: 1.2 }),
  blue: WILD.blue,
  green: ramp('#3aa65a'),
  grey: ramp('#8a8e98'),
  red: WILD.red,
  yellow: WILD.yellow,
  amber: '#ffb03a',
  white: WILD.white,
  brick: ramp('#b0583a'),
  roof: ramp('#3f7a9a'),
  wall: ramp('#ead8b0'),
  leaf: WILD.leaf,
  leaf2: WILD.leaf2,
  smoke: ramp('#8a8478', { cool: 1.1 }),
  steam: ramp('#e8ecf0', { cool: 1.3 }),
} as const;

// ------------------------------------------------------------------ the people (names the owner kept)

/** Marisol Vega, the Squad leader, a marine biologist at Beach Camp (the host). */
export const MARISOL_VEGA: Look16 = {
  build: 'adult',
  skin: '#c08a60',
  hair: { style: 'wrap', color: '#2a1d1a', tie: '#2f9ac8' },
  top: { color: '#2f9ac8', trim: '#f2c94c', kind: 'jumpsuit' },
  legs: '#3f4a6b',
  shoes: '#f2c94c',
  sole: '#f4efe6',
  belt: '#5a3a24',
  badge: '#f2c94c',
};

/** Rafi Haddad, the Squad's engineer, who runs the Workbench and gives the blueprints. */
export const RAFI_HADDAD: Look16 = {
  build: 'adult',
  skin: '#a8724a',
  hair: { style: 'short', color: '#2a201c' },
  top: { color: '#f2902f', trim: '#3a4a5a', kind: 'jumpsuit' },
  legs: '#4a4a5a',
  shoes: '#5a3a24',
  sole: '#2a2420',
  belt: '#3a4a5a',
  badge: '#9aa6b0',
};

/** Dr. Wen Li, a water scientist at the wetland, who runs the water tests. */
export const WEN_LI: Look16 = {
  build: 'adult',
  skin: '#e2b894',
  hair: { style: 'short', color: '#1a1416' },
  top: { color: '#f2f4ec', trim: '#3aa65a', kind: 'jumpsuit' },
  legs: '#3a6a5a',
  shoes: '#3aa65a',
  sole: '#f2f4ec',
  belt: '#3a6a5a',
  badge: '#3aa6b8',
};

/** Rosa Delgado, a farmer and town council member upstream. */
export const ROSA_DELGADO: Look16 = {
  build: 'adult',
  skin: '#8a5a3c',
  hair: { style: 'locs', color: '#3a2a20', tie: '#e0503a' },
  top: { color: '#5aa84a', trim: '#f2c94c', kind: 'dress' },
  legs: '#6a5a3a',
  shoes: '#5a3a24',
  beads: ['#e0503a', '#f2c94c'],
};

/** The player: a new Squad cadet (the default look; the game lets children change it). */
export const CADET: Look16 = {
  build: 'kid',
  skin: '#7a4a2e',
  hair: { style: 'puffs', color: '#2c2433', tie: '#2f9ac8' },
  top: { color: '#3aa65a', trim: '#f2c94c', kind: 'jumpsuit' },
  legs: '#3f4a6b',
  shoes: '#e0574f',
  sole: '#f4efe6',
  belt: '#5a3a24',
};

/** Townsfolk for Clean Coast Day and the town. */
export const TOWNSFOLK: Look16[] = [
  { build: 'adult', skin: '#6a4430', hair: { style: 'short', color: '#1e1814' }, top: { color: '#e0503a', trim: '#f2e6c8', kind: 'jumpsuit' }, legs: '#5a4a3a', shoes: '#3a2a20' },
  { build: 'kid', skin: '#e2b894', hair: { style: 'locs', color: '#5a3a24', tie: '#ff7fa8' }, top: { color: '#ff7fa8', trim: '#f2f4ec', kind: 'dress' }, legs: '#3a7ad8', shoes: '#f2c94c' },
  { build: 'adult', skin: '#c08a60', hair: { style: 'puffs', color: '#e8e8ec', tie: '#9a62d0' }, top: { color: '#9a62d0', trim: '#f2c94c', kind: 'dress' }, legs: '#3a3460', shoes: '#5a3a24' },
];

// ------------------------------------------------------------------ the cadet (backpack, grabber, poses)

export type CadetPose = 'stand' | 'run' | 'jump' | 'fall' | 'grab' | 'swim';

const PACK = ramp('#e0903a', { warm: 1.1 });
const GRAB = ramp('#9aa6b0', { cool: 1.1 });

/**
 * The cadet seen from the side, facing right (or left): the hero sprite with
 * a backpack and a litter grabber, in a pose. `grab` reaches the grabber
 * down to the ground; `swim` is the head and shoulders only (the scene draws
 * the water over the rest). The feet are at the bottom middle of the buffer.
 */
export function paintCadet(look: Look16, T: number, face: 'left' | 'right', o: { pose?: CadetPose; frame?: number; blink?: boolean } = {}): PixelBuffer {
  if (face === 'left') return paintCadet(look, T, 'right', o).flipX();
  const u = U(T);
  const S = (v: number) => v * u;
  const pose = o.pose ?? 'stand';
  const frame = o.frame ?? 0;
  const walk = pose === 'run' ? frame % 4 : pose === 'jump' ? 1 : pose === 'fall' ? 3 : 0;
  const hero = paintHero(look, u, 'right', { walk, blink: o.blink });
  const px = Math.round(7 * u);
  const W = hero.w + px * 2;
  const H = hero.h + Math.round(2 * u);
  const top = Math.round(2 * u);
  // the backpack behind the body
  const back = new Paint(W, H);
  const packX = px + hero.w * 0.12;
  const packY = top + hero.h * 0.36;
  back.rect(packX - S(2.6), packY, S(4.2), S(6.4), PACK, { form: 'cylV', sep: true });
  back.rect(packX - S(2.2), packY + S(0.6), S(3.4), S(1.4), ramp('#c8702a'), { form: 'flat', level: 1 });
  back.rect(packX - S(2.9), packY + S(4), S(1.2), S(2.4), ramp('#3a7ad8'), { form: 'cylV' });
  const out = back.toBuffer();
  out.blit(hero, px, top);
  // the grabber in front
  const q = new Paint(W, H);
  const hx = px + hero.w * 0.72;
  const hy = top + hero.h * 0.58;
  if (pose === 'grab') {
    const tipX = hx + S(6.5);
    const tipY = H - S(1.2);
    q.capsule(hx - S(1), hy - S(1), hx + S(1.6), hy + S(1), S(1), ramp(look.top.color), { sep: true });
    q.capsule(hx + S(1.4), hy + S(0.6), tipX, tipY - S(1), S(0.5), GRAB, { sep: true });
    const open = frame % 2 === 0 ? S(1.4) : S(0.5);
    q.line(tipX, tipY - S(1), tipX - open, tipY, GRAB, 1);
    q.line(tipX, tipY - S(1), tipX + open, tipY, GRAB, 1);
  } else if (pose !== 'swim') {
    const tilt = pose === 'run' ? (frame % 2 ? S(0.8) : -S(0.8)) : 0;
    q.capsule(hx, hy, hx + S(4.4), hy + S(6.6) + tilt, S(0.5), GRAB, { sep: true });
    q.line(hx + S(4.4), hy + S(6.6) + tilt, hx + S(3.6), hy + S(7.8) + tilt, GRAB, 1);
    q.line(hx + S(4.4), hy + S(6.6) + tilt, hx + S(5.4), hy + S(7.8) + tilt, GRAB, 1);
    q.rect(hx - S(0.4), hy - S(0.6), S(1.4), S(1.6), ramp('#f2c94c'), { form: 'flat', level: 2 });
  }
  out.blit(q.toBuffer(), 0, 0);
  if (pose === 'swim') {
    // only the head and shoulders above the water, with an arm stroke
    const keep = Math.round(top + hero.h * 0.46);
    const cut = new PixelBuffer(W, keep + Math.round(2 * u));
    for (let y = 0; y < keep; y++) for (let x = 0; x < W; x++) cut.set(x, y, out.get(x, y));
    const arm = new Paint(W, cut.h);
    const ax = px + hero.w * (frame % 2 ? 0.95 : 0.3);
    arm.capsule(px + hero.w * 0.6, keep - S(1), ax, keep - S(4 + (frame % 2) * 2), S(1), ramp(look.skin), { sep: true });
    cut.blit(arm.toBuffer(), 0, 0);
    for (let x = 0; x < W; x++) if ((x + frame) % 5 < 3) cut.set(x, keep, '#e8f8ff');
    return cut;
  }
  return out;
}

/** A kayak with the cadet paddling (frames 0-3 swing the paddle). */
export function paintKayak(look: Look16, T: number, face: 'left' | 'right' = 'right', frame = 0): PixelBuffer {
  if (face === 'left') return paintKayak(look, T, 'right', frame).flipX();
  const u = U(T);
  const S = (v: number) => v * u;
  const hero = paintHero(look, u, 'right', {});
  const W = Math.round(40 * u);
  const keep = Math.round(hero.h * 0.55);
  const H = keep + Math.round(6 * u);
  const out = new PixelBuffer(W, H);
  const sx = Math.round(W / 2 - hero.w / 2);
  for (let y = 0; y < keep; y++) for (let x = 0; x < hero.w; x++) out.set(sx + x, y, hero.get(x, y));
  const p = new Paint(W, H);
  const hull = ramp('#e0503a', { warm: 1.1 });
  p.poly(
    [
      [S(1), keep - S(1)],
      [W - S(1), keep - S(2)],
      [W - S(5), keep + S(4)],
      [S(5), keep + S(4)],
    ],
    hull,
    { sep: true },
  );
  p.rect(S(4), keep + S(1.4), W - S(9), S(0.8), ramp('#f2f4ec'), { form: 'flat', level: 3 });
  // the paddle, swung from side to side
  const a = [-0.6, -0.2, 0.6, 0.2][frame % 4];
  const cx = W / 2 + S(2);
  const cy = keep - S(3);
  const dx = Math.cos(a) * S(12);
  const dy = Math.sin(a) * S(5);
  p.capsule(cx - dx, cy - dy, cx + dx, cy + dy, S(0.5), ramp('#c8a060'), { sep: true });
  for (const s of [-1, 1]) p.ellipse(cx + s * dx * 1.05, cy + s * dy * 1.05, S(1.6), S(1), ramp('#f2c94c'), { sep: true });
  out.blit(p.toBuffer(), 0, 0);
  return out;
}

// ------------------------------------------------------------------ Ollie the river otter

export type OlliePose = 'stand' | 'run' | 'sniff' | 'swim' | 'tangled' | 'happy';

/**
 * Ollie the river otter, who joins the Squad after being freed from a
 * six-pack ring. Poses: standing, running (frames 0-1), sniffing out hidden
 * trash, swimming, tangled (worried, with the ring round the middle) and happy
 * (standing up tall).
 */
export function paintOllie(T: number, pose: OlliePose = 'stand', frame = 0, face: 'left' | 'right' = 'right'): PixelBuffer {
  if (face === 'left') return paintOllie(T, pose, frame, 'right').flipX();
  const u = U(T);
  const S = (v: number) => v * u;
  const fur = COAST.otter;
  const belly = COAST.otterBelly;
  if (pose === 'happy') {
    // standing up on the back legs, paws together
    const p = new Paint(Math.round(14 * u), Math.round(18 * u));
    p.capsule(S(3), S(16), S(1), S(12), S(1.4), fur, { sep: true });
    p.ellipse(S(7), S(11), S(3.6), S(5.6), fur, { sep: true });
    p.ellipse(S(7.6), S(11.6), S(2.2), S(4.2), belly, { form: 'flat', level: 2 });
    p.ellipse(S(7.4), S(4.8), S(3.4), S(3), fur, { sep: true });
    p.ellipse(S(8.6), S(5.8), S(2), S(1.4), belly, { sep: true });
    p.pix(S(10.2), S(5.4), INK);
    p.pix(S(8.4), S(4), INK);
    p.pix(S(6), S(4), INK);
    p.ellipse(S(4.6), S(2.4), S(0.9), S(0.8), fur, {});
    p.ellipse(S(9.8), S(2.4), S(0.9), S(0.8), fur, {});
    p.ellipse(S(9), S(9), S(1.2), S(1), fur, { sep: true });
    for (const x of [5.4, 8.8]) p.ellipse(S(x), S(16.6), S(1.4), S(0.8), ramp('#5a3a24'), { form: 'flat', level: 1 });
    return p.toBuffer();
  }
  const p = new Paint(Math.round(22 * u), Math.round(11 * u));
  const run = pose === 'run' ? frame % 2 : 0;
  const swim = pose === 'swim';
  const sniff = pose === 'sniff';
  const by = swim ? S(5) : S(5.6) - (run ? S(0.6) : 0);
  // the long, thick tail
  p.capsule(S(1.2), by + S(1.6), S(6), by + S(0.6), S(1.2), fur, { sep: true });
  // the body
  p.ellipse(S(10), by, S(6.4), S(3), fur, { sep: true });
  p.ellipse(S(11), by + S(1.4), S(4.4), S(1.4), belly, { form: 'flat', level: 2 });
  // the head (lower when sniffing)
  const hx = S(16.6) + (sniff ? S(0.8) : 0);
  const hy = by - S(1.6) + (sniff ? S(2.4) : 0);
  p.ellipse(hx, hy, S(3), S(2.5), fur, { sep: true });
  p.ellipse(hx + S(1.6), hy + S(0.9), S(1.8), S(1.3), belly, { sep: true });
  p.ellipse(hx + S(3.2), hy + S(0.4), S(0.7), S(0.6), ramp(INK), { form: 'flat', level: 1 });
  p.ellipse(hx - S(1.6), hy - S(2), S(0.8), S(0.7), fur, {});
  if (pose === 'tangled') {
    // worried eyebrows, eyes looking back at the ring
    p.pix(hx + S(0.4), hy - S(0.6), INK);
    p.pix(hx + S(0.4), hy - S(1.4), '#5a3a24');
    p.pix(hx + S(1.2), hy - S(1.8), '#5a3a24');
  } else {
    p.pix(hx + S(0.8), hy - S(0.8), INK);
    p.pix(hx + S(0.6), hy - S(1.0), '#ffffff');
  }
  // whiskers
  p.pix(hx + S(3.4), hy + S(1.6), '#f2e6c8');
  p.pix(hx + S(4.2), hy + S(1.8), '#f2e6c8');
  if (!swim) {
    const legs: Array<[number, number]> = run
      ? [
          [6.4, -0.8],
          [13, 0.8],
        ]
      : [
          [6.8, 0],
          [13.4, 0],
        ];
    for (const [lx, sh] of legs) {
      p.capsule(S(lx), by + S(1.6), S(lx + sh), by + S(4.4), S(1), fur, { sep: true });
      p.capsule(S(lx + 1.6), by + S(1.6), S(lx + 1.6 - sh), by + S(4.4), S(1), ramp('#6a4428'), { sep: true });
    }
  }
  if (sniff) {
    for (let k = 0; k < 3; k++) p.pix(hx + S(4.6 + k), hy + S(1.8 - k * 0.6), '#fff6a0');
  }
  const out0 = p.toBuffer();
  if (pose === 'tangled') {
    // the six-pack ring, loose round the middle: thin see-through loops
    for (let k = 0; k < 3; k++) {
      const rx = S(1.5);
      const ry = S(3.2);
      const cx0 = S(7.6 + k * 2.6);
      for (let a = 0; a < Math.PI * 2; a += 0.12) out0.set(Math.round(cx0 + Math.cos(a) * rx), Math.round(by - S(0.2) + Math.sin(a) * ry), a < Math.PI ? '#f4f0e0' : '#c8c0a8');
    }
  }
  if (swim) for (let x = 0; x < out0.w; x++) if ((x + frame) % 6 < 4) out0.set(x, Math.round(by + S(1.4)), '#e8f8ff');
  return out0;
}

/** Ollie's portrait for the talk box. */
export function paintOlliePortrait(happy = true): PixelBuffer {
  const p = new Paint(72, 72);
  const fur = COAST.otter;
  const belly = COAST.otterBelly;
  // a long neck and a broad, flat head with small low ears: an otter, not a bear
  p.ellipse(36, 66, 22, 14, fur, { sep: true });
  p.ellipse(36, 68, 12, 10, belly, { form: 'flat', level: 2 });
  p.ellipse(36, 38, 27, 17, fur, { sep: true });
  p.ellipse(11, 32, 3.4, 3, fur, { sep: true });
  p.ellipse(61, 32, 3.4, 3, fur, { sep: true });
  // the pale muzzle and chin
  p.ellipse(36, 47, 17, 10, belly, { sep: true });
  p.ellipse(36, 41, 6, 4, ramp(INK), { form: 'flat', level: 1 });
  p.pix(34, 39, '#6a6a7a');
  for (const ex of [23, 49]) {
    p.ellipse(ex, 33, 3, 3.4, ramp(INK), { form: 'flat', level: 1 });
    p.pix(ex - 1, 31, '#ffffff');
  }
  if (happy) for (let k = -5; k <= 5; k++) p.pix(36 + k, 50 + Math.round((25 - k * k) / 10), '#4a2a18');
  else for (let k = -4; k <= 4; k++) p.pix(36 + k, 52, '#4a2a18');
  // long whiskers
  for (const sx of [-1, 1])
    for (const [dy, len] of [
      [-1, 16],
      [2, 18],
      [5, 14],
    ])
      for (let k = 0; k < len; k += 2) p.pix(36 + sx * (14 + k), 45 + dy + Math.round(k / 8), '#f4ead0');
  return p.toBuffer();
}

// ------------------------------------------------------------------ trash, materials and natural things

export type TrashId = 'bottle' | 'can' | 'bag' | 'rope' | 'net' | 'wood' | 'tire' | 'glass' | 'ring' | 'battery' | 'wrapper' | 'cap';

export const TRASH: Record<TrashId, { name: string; material: string; bin: 'recycle' | 'trash' | 'hazard' | 'reuse' }> = {
  bottle: { name: 'Plastic bottle', material: 'Bottles: sealed, they float (for the oil boom)', bin: 'recycle' },
  can: { name: 'Drink can', material: 'Metal: recycled into new cans', bin: 'recycle' },
  bag: { name: 'Plastic bag', material: 'A turtle can mistake it for a jellyfish', bin: 'trash' },
  rope: { name: 'Old rope', material: 'Rope: for the boom and the nets', bin: 'reuse' },
  net: { name: 'Old fishing net', material: 'Netting: for the drain net', bin: 'reuse' },
  wood: { name: 'Scrap wood', material: 'Wood: frames, boxes and benches', bin: 'reuse' },
  tire: { name: 'Old tire', material: 'Rubber: recycled, not burned', bin: 'recycle' },
  glass: { name: 'Glass bottle', material: 'Glass: recycled again and again', bin: 'recycle' },
  ring: { name: 'Six-pack ring', material: 'Cut it up so it can’t catch an animal', bin: 'trash' },
  battery: { name: 'Battery', material: 'Hazardous: it goes in its own bin', bin: 'hazard' },
  wrapper: { name: 'Snack wrapper', material: 'Mixed materials: trash', bin: 'trash' },
  cap: { name: 'Bottle cap', material: 'Small plastic: easy for birds to swallow', bin: 'recycle' },
};

export const TRASH_IDS = Object.keys(TRASH) as TrashId[];

/** A piece of trash lying on the ground or floating (about half a tile). */
export function paintTrash(id: TrashId, T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(12 * u), Math.round(9 * u));
  const b = S(8.4);
  switch (id) {
    case 'bottle': {
      p.capsule(S(2), b - S(1.6), S(8.6), b - S(1.6), S(1.6), COAST.bottle, { sep: true });
      p.rect(S(8.6), b - S(2.4), S(1.8), S(1.6), COAST.bottle, { form: 'flat', level: 3 });
      p.rect(S(10.2), b - S(2.6), S(1), S(2), ramp('#3a7ad8'), { form: 'flat', level: 2 });
      p.rect(S(4), b - S(2.6), S(3), S(1.6), ramp('#e0503a'), { form: 'flat', level: 2, onlyOver: true });
      p.pix(S(3), b - S(2.4), '#ffffff');
      break;
    }
    case 'can': {
      p.capsule(S(3), b - S(1.6), S(8.6), b - S(1.6), S(1.7), COAST.can, { sep: true });
      p.rect(S(4.4), b - S(3.2), S(2.4), S(3.2), ramp('#3a7ad8'), { form: 'flat', level: 2, onlyOver: true });
      p.ellipse(S(8.6), b - S(1.6), S(0.8), S(1.6), ramp('#9aa0aa'), { form: 'flat', level: 1 });
      break;
    }
    case 'bag': {
      const sway = frame % 2 ? S(0.6) : 0;
      p.poly(
        [
          [S(2), b],
          [S(3 + sway), b - S(5)],
          [S(5), b - S(6.4)],
          [S(7.4), b - S(5.6)],
          [S(10 + sway), b - S(1.4)],
          [S(9), b],
        ],
        COAST.bag,
        { sep: true },
      );
      p.ellipse(S(5.2), b - S(6.6), S(0.9), S(0.7), COAST.bag, { form: 'flat', level: 2 });
      p.line(S(4), b - S(1), S(8), b - S(3.4), COAST.bag, 1);
      break;
    }
    case 'rope': {
      for (let k = 0; k < 3; k++) p.ellipse(S(6), b - S(2), S(4.6 - k * 1.4), S(1.8 - k * 0.4), COAST.rope, { form: 'flat', level: 3 - k });
      p.capsule(S(9.4), b - S(1.4), S(11.4), b - S(0.6), S(0.5), COAST.rope, {});
      break;
    }
    case 'net': {
      p.ellipse(S(6), b - S(2.4), S(5.4), S(2.4), COAST.net, { form: 'flat', level: 2 });
      for (let x = 1; x < 11; x += 2) p.line(S(x), b - S(4.4), S(x + 1.4), b - S(0.4), COAST.net, 0, { onlyOver: true });
      for (let x = 1; x < 11; x += 2) p.line(S(x + 1.4), b - S(4.4), S(x), b - S(0.4), COAST.net, 4, { onlyOver: true });
      p.ellipse(S(2), b - S(1.6), S(1), S(1), COAST.float, { sep: true });
      break;
    }
    case 'wood': {
      p.rect(S(1), b - S(2.6), S(10), S(2.2), COAST.driftwood, { form: 'cylH', sep: true });
      p.line(S(2), b - S(1.6), S(9), b - S(1.4), COAST.driftwood, 1, { onlyOver: true });
      p.pix(S(7.4), b - S(2), '#5a4030');
      break;
    }
    case 'tire': {
      p.ellipse(S(6), b - S(3.4), S(4.6), S(3.4), COAST.tire, { sep: true });
      p.ellipse(S(6), b - S(3.4), S(2), S(1.4), ramp('#7a6a5a'), { form: 'flat', level: 1 });
      for (let k = 0; k < 6; k++) p.pix(S(6) + Math.cos(k) * S(3.6), b - S(3.4) + Math.sin(k) * S(2.6), '#5a5a62');
      break;
    }
    case 'glass': {
      p.capsule(S(2), b - S(1.6), S(8), b - S(1.6), S(1.8), COAST.glass, { sep: true });
      p.rect(S(8), b - S(2.2), S(2.6), S(1.2), COAST.glass, { form: 'flat', level: 3 });
      p.pix(S(3), b - S(2.6), '#e8fff0');
      p.pix(S(4), b - S(2.6), '#e8fff0');
      break;
    }
    case 'ring': {
      for (let k = 0; k < 3; k++) {
        p.ellipse(S(3 + k * 3), b - S(2.4), S(1.8), S(1.6), COAST.ring, { form: 'flat', level: 3 });
        p.ellipse(S(3 + k * 3), b - S(2.4), S(0.8), S(0.7), ramp(INK), { form: 'flat', level: 4 });
      }
      break;
    }
    case 'battery': {
      p.rect(S(3), b - S(3.6), S(6), S(3.4), COAST.battery, { form: 'cylH', sep: true });
      p.rect(S(9), b - S(2.6), S(1), S(1.4), COAST.can, { form: 'flat', level: 3 });
      p.rect(S(3), b - S(3.6), S(1.6), S(3.4), ramp('#2a2a30'), { form: 'flat', level: 2 });
      p.pix(S(6.4), b - S(2.2), '#ffffff');
      break;
    }
    case 'wrapper': {
      p.poly(
        [
          [S(2), b - S(1)],
          [S(3), b - S(3.4)],
          [S(9), b - S(3.8)],
          [S(10), b - S(1.2)],
        ],
        ramp('#9a62d0'),
        { sep: true },
      );
      p.line(S(4), b - S(2.4), S(8), b - S(2.6), ramp('#f2c94c'), 3, { onlyOver: true });
      break;
    }
    case 'cap': {
      p.ellipse(S(6), b - S(1.4), S(2), S(1.2), ramp('#e0503a'), { sep: true });
      p.rect(S(4), b - S(1.8), S(4), S(0.6), ramp('#e0503a'), { form: 'flat', level: 3 });
      break;
    }
  }
  return p.toBuffer();
}

export type NaturalId = 'shell' | 'driftlog' | 'seaweed' | 'stone';

/** Natural things on the beach that stay where they are ("take only trash"). */
export function paintNatural(id: NaturalId, T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(8 * u));
  const b = S(7.6);
  if (id === 'shell') {
    const r = ramp(seed % 2 ? '#ffb0a0' : '#f2e0c8', { warm: 1.2 });
    p.ellipse(S(7), b - S(1.8), S(3.2), S(2), r, { sep: true });
    for (let k = -2; k <= 2; k++) p.line(S(7), b - S(0.2), S(7 + k * 1.4), b - S(3.4), r, 1, { onlyOver: true });
  } else if (id === 'driftlog') {
    p.rect(S(0.6), b - S(3.6), S(12.6), S(3.4), COAST.driftwood, { form: 'cylH', sep: true });
    p.capsule(S(9), b - S(3.4), S(11.4), b - S(6.6), S(0.8), COAST.driftwood, { sep: true });
    p.ellipse(S(1), b - S(1.9), S(1), S(1.6), ramp('#d8c0a0'), { form: 'flat', level: 3 });
  } else if (id === 'seaweed') {
    for (let k = 0; k < 4; k++) p.capsule(S(3 + k * 2.4), b - S(0.4), S(4 + k * 2.4 + ((k + seed) % 2)), b - S(2.4), S(0.8), ramp('#3a6a3a'), {});
  } else {
    p.ellipse(S(7), b - S(2), S(4), S(2.4), COAST.rock, { sep: true });
  }
  return p.toBuffer();
}

/** A glint in the sand: hidden trash that Ollie can sniff out (frames 0-3). */
export function paintSparkle(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const n = Math.round(8 * u);
  const b = new PixelBuffer(n, n);
  const c = Math.floor(n / 2);
  const r = [1, 2, 3, 2][frame % 4] * Math.max(1, Math.round(u));
  for (let k = -r; k <= r; k++) {
    b.set(c + k, c, k === 0 ? '#ffffff' : '#fff6a0');
    b.set(c, c + k, k === 0 ? '#ffffff' : '#fff6a0');
  }
  return b;
}

// ------------------------------------------------------------------ the beach: the drain pipe and its nets

export type NetDesign = 'none' | 'big' | 'small' | 'medium';

/**
 * The storm drain pipe that comes out of the dune onto the beach, with the
 * net across its mouth (or none). `flow` runs water out of it; `clog` (0-1)
 * piles leaves and sand behind a fine net until the water spills over the top.
 */
export function paintDrainPipe(T: number, net: NetDesign = 'none', frame = 0, flow = true, clog = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(48 * u);
  const H = Math.round(40 * u);
  const p = new Paint(W, H);
  // the dune bank it comes out of
  p.poly(
    [
      [0, H],
      [0, S(6)],
      [S(12), S(4)],
      [S(22), S(10)],
      [S(26), H],
    ],
    COAST.dune,
    { form: 'flat', level: 2 },
  );
  for (let k = 0; k < 6; k++) p.capsule(S(3 + k * 3.4), S(5 + (k % 2)), S(4 + k * 3.4), S(-1 + (k % 3)), S(0.5), WILD.grass, {});
  // the concrete pipe
  const py = S(22);
  p.rect(0, py - S(7), S(26), S(14), ramp('#a8a8a0', { cool: 1.1 }), { form: 'cylH', sep: true });
  p.ellipse(S(26), py, S(3.4), S(7), ramp('#a8a8a0'), { sep: true });
  p.ellipse(S(26.4), py, S(2.2), S(5.6), ramp('#2a2a30'), { form: 'flat', level: 1 });
  for (let k = 0; k < 3; k++) p.rect(S(4 + k * 8), py - S(7), S(0.8), S(14), ramp('#8a8a84'), { form: 'flat', level: 1, onlyOver: true });
  // the net: a frame with mesh across the mouth
  if (net !== 'none') {
    const gap = net === 'big' ? 3.4 : net === 'small' ? 0.9 : 1.8;
    const fx = S(28.6);
    p.rect(fx - S(0.6), py - S(7.6), S(1.4), S(15.2), COAST.driftwood, { form: 'cylV', sep: true });
    for (let y = -7; y <= 7; y += gap) p.line(fx - S(2.2), py + S(y), fx + S(3), py + S(y), COAST.net, 2);
    for (let x = -2; x <= 3; x += gap) p.line(fx + S(x), py - S(7), fx + S(x), py + S(7), COAST.net, 3);
    if (clog > 0) {
      const n = Math.round(clog * 20);
      for (let k = 0; k < n; k++) {
        const ly = py + S(6.6) - Math.floor(k / 4) * S(1.6);
        p.ellipse(fx - S(1) - (k % 4) * S(1.2), ly, S(1), S(0.7), ramp(k % 3 ? '#8a6a2a' : '#5a8a3a'), { form: 'flat', level: 2 });
      }
    }
  }
  // the water running out over the sand
  if (flow) {
    const spill = net === 'small' && clog > 0.7;
    const w = ramp('#7ab4c8', { cool: 1 });
    const outX = spill ? S(27) : S(29);
    const outY = spill ? py - S(7) : py + S(3);
    for (let k = 0; k < 14; k++) {
      const t = ((k + frame * 0.5) % 14) / 14;
      const x = outX + t * S(16);
      const y = outY + t * t * S(spill ? 22 : 12);
      p.ellipse(x, y, S(1.2), S(0.9), w, { form: 'flat', level: (k + frame) % 3 ? 3 : 4 });
    }
    p.ellipse(S(40), H - S(1.4), S(8), S(1.4), w, { form: 'flat', level: 2 });
  }
  return p.toBuffer();
}

/** A blueprint stake: a build spot for a fix (glows when you can build there). */
export function paintStake(T: number, lit = false, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(10 * u), Math.round(20 * u));
  p.rect(S(4.2), S(6), S(1.4), S(14), COAST.wood, { form: 'cylV', sep: true });
  p.rect(S(1), S(1), S(8), S(6), ramp('#3a6ac8', { cool: 0.8 }), { form: 'flat', level: 2, sep: true });
  for (let x = 2; x < 9; x += 2) p.line(S(x), S(1.6), S(x), S(6.4), ramp('#9ac8ff'), 3, { onlyOver: true });
  p.line(S(1.6), S(4), S(8.4), S(4), ramp('#9ac8ff'), 3, { onlyOver: true });
  const out = p.toBuffer();
  if (lit) {
    const r = [2, 3, 4, 3][frame % 4];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + frame * 0.3;
      out.set(Math.round(S(5) + Math.cos(a) * S(r + 2)), Math.round(S(4) + Math.sin(a) * S(r + 1)), '#fff6a0');
    }
  }
  return out;
}

// ------------------------------------------------------------------ Beach Camp

/** The Workbench at Beach Camp: a sturdy table with tools and a blueprint pinned up. */
export function paintWorkbench(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(44 * u);
  const H = Math.round(34 * u);
  const p = new Paint(W, H);
  // the pegboard behind, with a blueprint and tools
  p.rect(S(4), S(1), S(36), S(16), ramp('#c49460'), { form: 'flat', level: 2, sep: true });
  for (let y = 3; y < 16; y += 3) for (let x = 6; x < 40; x += 3) p.pix(S(x), S(y), '#8a6a44');
  p.rect(S(7), S(3), S(13), S(10), ramp('#3a6ac8', { cool: 0.8 }), { form: 'flat', level: 2, sep: true });
  for (let x = 8; x < 20; x += 2) p.line(S(x), S(4), S(x), S(12), ramp('#9ac8ff'), 3, { onlyOver: true });
  p.line(S(9), S(10), S(18), S(5), ramp('#ffffff'), 4, { onlyOver: true });
  p.rect(S(24), S(4), S(1.4), S(9), COAST.pipe, { form: 'cylV' }); // a screwdriver
  p.rect(S(23.6), S(3), S(2.2), S(3), ramp('#e0503a'), { form: 'cylV' });
  p.rect(S(29), S(4), S(6), S(2), COAST.pipe, { form: 'cylH' }); // a hammer
  p.rect(S(31.4), S(6), S(1.4), S(7), COAST.wood, { form: 'cylV' });
  p.ellipse(S(37), S(9), S(2.4), S(2.4), COAST.rope, { form: 'flat', level: 3 }); // a coil of rope
  // the bench
  p.rect(S(1), S(18), S(42), S(3), COAST.plank, { form: 'flat', level: 3, sep: true });
  for (const x of [3, 38]) p.rect(S(x), S(21), S(2.6), S(13), COAST.wood, { form: 'cylV', sep: true });
  p.rect(S(4), S(27), S(36), S(1.6), COAST.wood, { form: 'flat', level: 1 });
  // on the bench: a jar of bottle caps and a vise
  p.rect(S(8), S(13), S(5), S(5), ramp('#bfe8f2', { cool: 1.2 }), { form: 'cylV', sep: true });
  for (let k = 0; k < 4; k++) p.pix(S(9 + k), S(16), ['#e0503a', '#3a7ad8', '#f2c94c', '#3aa65a'][k]);
  p.rect(S(30), S(14), S(7), S(4), COAST.pipe, { form: 'flat', level: 2, sep: true });
  return p.toBuffer();
}

/** The Squad hut at Beach Camp, on stilts above the sand. */
export function paintSquadHut(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(64 * u);
  const H = Math.round(56 * u);
  const p = new Paint(W, H);
  for (const x of [6, 30, 56]) p.rect(S(x), S(38), S(2.6), S(18), COAST.wood, { form: 'cylV', sep: true });
  p.rect(S(2), S(36), S(60), S(3), COAST.plank, { form: 'flat', level: 3, sep: true });
  p.rect(S(6), S(16), S(52), S(20), ramp('#e8d4a8'), { form: 'flat', level: 2, sep: true });
  for (let x = 8; x < 58; x += 4) p.line(S(x), S(17), S(x), S(35), ramp('#c8b080'), 1, { onlyOver: true });
  p.poly(
    [
      [S(0), S(17)],
      [S(32), S(2)],
      [S(64), S(17)],
    ],
    ramp('#2f8fa8'),
    { sep: true },
  );
  for (let k = 0; k < 6; k++) p.line(S(4 + k * 5), S(16 - k * 2.2), S(60 - k * 5), S(16 - k * 2.2), ramp('#2f8fa8'), 1, { onlyOver: true });
  p.rect(S(12), S(20), S(12), S(9), ramp('#9ad0f2', { cool: 1.2 }), { form: 'flat', level: 3, sep: true });
  p.rect(S(17.4), S(20), S(1), S(9), COAST.wood, { form: 'flat', level: 1 });
  p.rect(S(34), S(21), S(10), S(15), ramp('#3f7a9a'), { form: 'flat', level: 2, sep: true });
  p.pix(S(42), S(29), '#f2c94c');
  // the Squad sign: a wave and a leaf
  p.rect(S(46), S(19), S(10), S(7), ramp('#f2f4ec'), { form: 'flat', level: 3, sep: true });
  for (let k = 0; k < 8; k++) p.pix(S(47 + k), S(23) + Math.round(Math.sin(k) * u), '#2f8fc8');
  p.ellipse(S(51), S(21), S(1.6), S(1), ramp('#3aa65a'), { form: 'flat', level: 2 });
  // steps up
  for (let k = 0; k < 4; k++) p.rect(S(58 - k * 0), S(40 + k * 4), S(5), S(1.4), COAST.plank, { form: 'flat', level: 3 });
  return p.toBuffer();
}

export type BinKind = 'recycle' | 'compost' | 'trash' | 'hazard';

export const BIN_NAME: Record<BinKind, string> = { recycle: 'Recycling', compost: 'Compost', trash: 'Trash', hazard: 'Hazardous waste' };
const BIN_RAMP: Record<BinKind, Ramp> = { recycle: ramp('#3a7ad8'), compost: ramp('#3aa65a'), trash: ramp('#6a6a72'), hazard: ramp('#e0503a') };

/** One sorting bin with a lid (an icon painted on the front). */
export function paintBin(T: number, kind: BinKind): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(18 * u));
  const r = BIN_RAMP[kind];
  p.rect(S(2), S(4), S(10), S(14), r, { form: 'cylV', sep: true });
  p.rect(S(1), S(2), S(12), S(2.4), r, { form: 'flat', level: 3, sep: true });
  p.rect(S(5.6), S(1), S(2.8), S(1.4), r, { form: 'flat', level: 1 });
  const w = ramp('#f2f4ec');
  const cx = S(7);
  const cy = S(10.6);
  if (kind === 'recycle') {
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 - Math.PI / 2;
      const b2 = a + 1.6;
      p.line(cx + Math.cos(a) * S(3), cy + Math.sin(a) * S(3), cx + Math.cos(b2) * S(3), cy + Math.sin(b2) * S(3), w, 4);
      p.pix(cx + Math.cos(b2) * S(3), cy + Math.sin(b2) * S(3) - 1, '#ffffff');
    }
  } else if (kind === 'compost') {
    p.ellipse(cx, cy, S(2.6), S(1.6), w, { form: 'flat', level: 4 });
    p.line(cx - S(2.4), cy + S(1.4), cx + S(2.4), cy - S(1.4), r, 0);
  } else if (kind === 'trash') {
    p.rect(cx - S(2), cy - S(2), S(4), S(4.4), w, { form: 'flat', level: 4 });
    p.rect(cx - S(2.6), cy - S(2.8), S(5.2), S(0.8), w, { form: 'flat', level: 4 });
  } else {
    p.poly(
      [
        [cx, cy - S(3)],
        [cx + S(3), cy + S(2.4)],
        [cx - S(3), cy + S(2.4)],
      ],
      ramp('#f2c94c'),
      { form: 'flat', level: 3 },
    );
    p.line(cx, cy - S(1.4), cx, cy + S(0.6), ramp(INK), 1);
    p.pix(cx, cy + S(1.6), INK);
  }
  return p.toBuffer();
}

/** The Squad flag: the checkpoint. It waves when you touch it. */
export function paintSquadFlag(T: number, lit = false, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(26 * u));
  p.rect(S(2), S(2), S(1.2), S(24), COAST.pipe, { form: 'cylV', sep: true });
  p.ellipse(S(2.6), S(1.6), S(1), S(1), ramp('#f2c94c'), {});
  if (lit) {
    const w = (x: number) => Math.round(Math.sin(x * 0.7 + frame) * u);
    for (let x = 0; x < 10; x++) for (let y = 0; y < 6; y++) p.dot(S(3.2 + x), S(3 + y) + w(x), y < 2 ? ramp('#2f8fc8') : y < 4 ? ramp('#3aa65a') : ramp('#f2c94c'), 2 + ((x + y) % 2));
  } else for (let y = 0; y < 8; y++) p.dot(S(3.4), S(4 + y), ramp('#9aa0aa'), 2);
  return p.toBuffer();
}

// ------------------------------------------------------------------ the water gauges

export type GaugeKind = 'trash' | 'oil' | 'mud' | 'oxygen';

export const GAUGE_NAME: Record<GaugeKind, string> = { trash: 'Trash', oil: 'Oil', mud: 'Cloudiness', oxygen: 'Oxygen' };

/** The icon for one gauge (shown beside its bar in the water test). */
export function paintGaugeIcon(T: number, kind: GaugeKind): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(12 * u), Math.round(12 * u));
  p.ellipse(S(6), S(6), S(5.6), S(5.6), ramp('#f2f4ec', { cool: 1.2 }), { sep: true });
  if (kind === 'trash') {
    p.capsule(S(3.2), S(7), S(7.6), S(5), S(1.2), COAST.bottle, { sep: true });
    p.rect(S(7.6), S(4), S(1.4), S(1.4), ramp('#3a7ad8'), {});
  } else if (kind === 'oil') {
    p.poly(
      [
        [S(6), S(2)],
        [S(9), S(7)],
        [S(3), S(7)],
      ],
      COAST.oil,
      {},
    );
    p.ellipse(S(6), S(7.4), S(3), S(2.4), COAST.oil, {});
    for (const [x, c] of [
      [4.6, '#ff7fa8'],
      [5.6, '#f2c94c'],
      [6.6, '#7fd0f2'],
    ] as const)
      p.pix(S(x), S(6.4), c);
  } else if (kind === 'mud') {
    p.ellipse(S(6), S(6.6), S(4), S(3), COAST.mudWater, {});
    for (let k = 0; k < 5; k++) p.pix(S(4 + k * 1.1), S(5.6 + (k % 2)), '#c8a070');
  } else {
    for (const [x, y, r] of [
      [4.4, 7.6, 1.8],
      [7.4, 5.2, 1.4],
      [5.6, 3.6, 0.9],
    ])
      p.ellipse(S(x), S(y), S(r), S(r), ramp('#7fd0f2', { cool: 0.8 }), { sep: true });
  }
  return p.toBuffer();
}

/** The water test kit, a little case with test tubes (a prop for Dr. Wen Li). */
export function paintTestKit(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(12 * u));
  p.rect(S(1), S(5), S(14), S(7), ramp('#f2f4ec', { cool: 1.2 }), { form: 'flat', level: 2, sep: true });
  p.rect(S(1), S(5), S(14), S(1.4), ramp('#3aa65a'), { form: 'flat', level: 2 });
  for (const [k, c] of ['#7fd0f2', '#c8a070', '#5a9a3a', '#f2c94c'].entries()) {
    p.rect(S(3 + k * 3), S(1), S(1.6), S(6), ramp('#e8f4f8', { cool: 1.3 }), { form: 'cylV', sep: true });
    p.rect(S(3 + k * 3), S(4), S(1.6), S(3), ramp(c), { form: 'cylV' });
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ the harbor: boat, boom, pads, nets

/** The fishing boat moored in the harbor; `patched` fixes the leaking fuel tank (the source). */
export function paintBoat(T: number, patched = false, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(72 * u);
  const H = Math.round(44 * u);
  const p = new Paint(W, H);
  const bob = frame % 2 ? S(0.6) : 0;
  const hull = ramp('#f2f4ec', { cool: 1.2 });
  p.poly(
    [
      [S(2), S(24) + bob],
      [S(70), S(22) + bob],
      [S(62), S(38) + bob],
      [S(10), S(38) + bob],
    ],
    hull,
    { sep: true },
  );
  p.rect(S(6), S(30) + bob, S(58), S(2.4), ramp('#2f8fc8'), { form: 'flat', level: 2, onlyOver: true });
  p.rect(S(30), S(8) + bob, S(22), S(15), ramp('#e8d4a8'), { form: 'flat', level: 2, sep: true });
  p.rect(S(33), S(11) + bob, S(7), S(5), ramp('#9ad0f2', { cool: 1.2 }), { form: 'flat', level: 3 });
  p.rect(S(42), S(11) + bob, S(7), S(5), ramp('#9ad0f2', { cool: 1.2 }), { form: 'flat', level: 3 });
  p.rect(S(28), S(6) + bob, S(26), S(2.4), ramp('#e0503a'), { form: 'flat', level: 2, sep: true });
  p.rect(S(16), S(0) + bob, S(1.4), S(24), COAST.wood, { form: 'cylV', sep: true });
  p.line(S(17), S(1) + bob, S(30), S(8) + bob, ramp('#5a4030'), 1);
  // the fuel tank at the back, dripping until it is patched
  p.rect(S(56), S(16) + bob, S(10), S(7), COAST.rust, { form: 'cylH', sep: true });
  if (patched) {
    p.rect(S(59), S(19) + bob, S(4), S(3), ramp('#9aa6b0'), { form: 'flat', level: 3, sep: true });
    for (const [x, y] of [
      [59.4, 19.4],
      [62.4, 19.4],
      [59.4, 21.4],
      [62.4, 21.4],
    ])
      p.pix(S(x), S(y) + bob, '#4a4a52');
  } else {
    const t = (frame % 6) / 6;
    p.ellipse(S(61), S(23) + bob + t * S(10), S(0.9), S(1.2), COAST.oil, { form: 'flat', level: 1 });
    p.pix(S(61), S(22.6) + bob, '#1a1a20');
  }
  return p.toBuffer();
}

/** An oil boom: a floating fence of rope and sealed bottles, `wTiles` long. */
export function paintBoom(T: number, wTiles = 6, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = wTiles * T;
  const p = new Paint(W, Math.round(8 * u));
  for (let x = 0; x < W; x += S(5)) {
    const y = S(4) + Math.sin((x / W) * 8 + frame * 0.6) * u;
    p.capsule(x + S(0.6), y, x + S(4.2), y, S(1.6), COAST.float, { sep: true });
    p.rect(x + S(1.6), y - S(1.6), S(1), S(3.2), ramp('#e0503a'), { form: 'flat', level: 2, onlyOver: true });
  }
  p.line(0, S(4.2), W, S(4.2), COAST.rope, 1);
  return p.toBuffer();
}

/** A patch of oil floating on the water, `wTiles` wide: dark, with a rainbow sheen at its edges. */
export function paintOilSlick(T: number, wTiles = 3, frame = 0): PixelBuffer {
  const u = U(T);
  const W = wTiles * T;
  const H = Math.round(7 * u);
  const b = new PixelBuffer(W, H);
  const sheen = ['#7a5aa0', '#5a8ab0', '#8aa04a', '#a87a3a', '#a05a7a'];
  for (let x = 0; x < W; x++) {
    const edge = Math.min(x, W - 1 - x) / W;
    const thick = Math.max(1, Math.round(H * Math.min(1, edge * 5) * (0.7 + 0.3 * Math.sin(x * 0.3 + frame))));
    for (let y = 0; y < thick; y++) b.set(x, y, edge < 0.12 || y === 0 ? sheen[Math.floor((x + frame * 2) / 3) % 5] : y < 2 ? '#3a3a48' : '#24242e');
  }
  return b;
}

/** Absorbent pads soaking up oil (white turning grey). */
export function paintPads(T: number, soaked = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(5 * u));
  const r = ramp(mixHex('#f2f4ec', '#4a4a52', soaked), { cool: 1.2 });
  for (let k = 0; k < 3; k++) p.rect(S(1 + k * 6.4), S(1.4), S(5.6), S(2.6), r, { form: 'flat', level: 3, sep: true });
  return p.toBuffer();
}

/** A ghost net caught on the rocks (old fishing gear that keeps catching animals). */
export function paintGhostNet(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(28 * u), Math.round(18 * u));
  p.ellipse(S(8), S(13), S(8), S(5), COAST.rock, { sep: true });
  p.ellipse(S(20), S(14), S(7), S(4), ramp('#7a7a76'), { sep: true });
  for (let k = 0; k < 9; k++) {
    const x = S(3 + k * 2.6);
    p.line(x, S(4 + (k % 2) * 2), x + S(3), S(16), COAST.net, 2);
    p.line(x + S(3), S(4 + ((k + 1) % 2) * 2), x, S(16), COAST.net, 3);
  }
  for (let k = 0; k < 3; k++) p.ellipse(S(5 + k * 8 + (seed % 2)), S(4 + (k % 2) * 2), S(1.2), S(1.2), COAST.float, { sep: true });
  return p.toBuffer();
}

/** The dock's bin for old nets and rope (they go back to be recycled). */
export function paintNetBin(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(18 * u));
  p.rect(S(1), S(4), S(18), S(14), ramp('#3a8a7a'), { form: 'flat', level: 2, sep: true });
  for (let x = 2; x < 19; x += 2.4) p.line(S(x), S(5), S(x), S(17), ramp('#2a6a5a'), 1, { onlyOver: true });
  p.ellipse(S(10), S(4.4), S(8), S(2.4), COAST.net, { form: 'flat', level: 3 });
  p.ellipse(S(6), S(3.6), S(1.2), S(1.2), COAST.float, { sep: true });
  return p.toBuffer();
}

// ------------------------------------------------------------------ the wetland: reeds, filter, algae

/** Native reeds and cattails (frames sway). */
export function paintReeds(T: number, seed = 0, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(30 * u));
  const sway = Math.sin(frame * 0.5 + seed) * S(0.8);
  for (let k = 0; k < 6; k++) {
    const x = S(2 + k * 2.4 + (hash(k, seed, 3) - 0.5));
    const top = S(4 + hash(k, seed, 5) * 8);
    p.capsule(x, S(30), x + sway * (1 - top / S(30)), top, S(0.5), k % 2 ? ramp('#5a9a3a') : ramp('#7cb04a'), {});
    if (k % 2 === 0) p.capsule(x + sway, top + S(1), x + sway, top + S(5), S(1.1), ramp('#8a5a30'), { sep: true });
  }
  return p.toBuffer();
}

export type FilterLayer = 'gravel' | 'sand' | 'charcoal' | 'stones';

/**
 * A sand-and-gravel filter seen cut away, the layers from top to bottom
 * (the right order lets water through and leaves the mud behind). `dirty`
 * shows brown water going in at the top; the bottom pipe runs clear when the
 * order works.
 */
export function paintFilter(T: number, layers: readonly FilterLayer[], dirty = true, works = true, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(22 * u);
  const H = Math.round(34 * u);
  const p = new Paint(W, H);
  p.rect(S(2), S(4), S(18), S(26), ramp('#bfe8f2', { cool: 1.3 }), { form: 'flat', level: 3, sep: true });
  const lh = 22 / layers.length;
  layers.forEach((l, i) => {
    const y = S(6 + i * lh);
    const r = l === 'gravel' ? ramp('#9a9a8a') : l === 'sand' ? COAST.sand : l === 'charcoal' ? ramp('#3a3a40') : ramp('#7a7a76');
    p.rect(S(3), y, S(16), S(lh), r, { form: 'flat', level: 2 });
    for (let k = 0; k < 18; k++) {
      const gx = S(3) + hash(k, i, 7) * S(16);
      const gy = y + hash(k, i, 8) * S(lh);
      p.dot(gx, gy, r, l === 'sand' ? 3 : l === 'stones' ? 4 : 1);
    }
  });
  // water going in, and coming out of the pipe at the bottom
  const top = dirty ? COAST.mudWater : COAST.river;
  p.rect(S(3), S(4.4), S(16), S(1.6), top, { form: 'flat', level: 3 });
  p.rect(S(20), S(26), S(2), S(2.4), COAST.pipe, { form: 'cylH' });
  const out = works ? ramp('#9ad8f0', { cool: 1 }) : COAST.mudWater;
  for (let k = 0; k < 4; k++) {
    const t = ((k + frame * 0.4) % 4) / 4;
    p.ellipse(S(21.4), S(28.6) + t * S(5), S(0.7), S(0.9), out, { form: 'flat', level: 3 });
  }
  return p.toBuffer();
}

/** A fish: swimming happily, or gasping at the surface when the water has too little oxygen. */
export function paintFish(T: number, frame = 0, gasping = false, color = '#f2902f'): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(9 * u));
  const r = ramp(color, { warm: 1.1 });
  const tail = frame % 2 ? S(1) : -S(1);
  p.poly(
    [
      [S(3), S(4.6)],
      [S(0.4), S(1.8) + tail],
      [S(0.4), S(7.4) + tail],
    ],
    r,
    { sep: true },
  );
  p.ellipse(S(7.4), S(4.6), S(4.6), S(2.8), r, { sep: true });
  p.ellipse(S(8), S(5.8), S(3), S(1.2), ramp('#f2e6c8'), { form: 'flat', level: 3, onlyOver: true });
  p.pix(S(10), S(3.8), INK);
  if (gasping) {
    p.ellipse(S(12), S(4.6), S(0.8), S(1), ramp(INK), { form: 'flat', level: 1 });
    p.pix(S(12.6), S(1.4), '#e8f8ff');
    p.pix(S(13), S(0.4), '#e8f8ff');
  }
  return p.toBuffer();
}

/** A gull flying or standing (frames 0-1 flap). */
export function paintGull(T: number, frame = 0, standing = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(18 * u), Math.round(12 * u));
  const w = ramp('#f2f4ec', { cool: 1.3 });
  const g = ramp('#9aa6b0', { cool: 1.1 });
  if (standing) {
    p.ellipse(S(8), S(7), S(4), S(2.6), w, { sep: true });
    p.ellipse(S(7), S(6.4), S(3), S(1.6), g, { form: 'flat', level: 2, onlyOver: true });
    p.ellipse(S(12), S(4.2), S(1.8), S(1.6), w, { sep: true });
    p.rect(S(13.4), S(4.2), S(2), S(0.8), ramp('#f2c94c'), {});
    p.pix(S(12.6), S(3.6), INK);
    for (const x of [7, 9]) p.rect(S(x), S(9.4), S(0.6), S(2.6), ramp('#f2a040'), {});
  } else {
    const up = frame % 2 === 0;
    p.ellipse(S(9), S(7), S(4.4), S(1.8), w, { sep: true });
    p.poly(
      [
        [S(8), S(6.4)],
        [S(2), up ? S(1) : S(10)],
        [S(5), up ? S(2) : S(9)],
      ],
      g,
      { sep: true },
    );
    p.poly(
      [
        [S(10), S(6.4)],
        [S(16), up ? S(1) : S(10)],
        [S(13), up ? S(2) : S(9)],
      ],
      g,
      { sep: true },
    );
    p.ellipse(S(13.4), S(6.4), S(1.6), S(1.4), w, { sep: true });
    p.rect(S(14.8), S(6.4), S(1.6), S(0.6), ramp('#f2c94c'), {});
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ the farm and town: the sources and their fixes

/** A farm field, `wTiles` wide: bare soil (it washes away in the rain) or a green cover crop. */
export function paintField(T: number, wTiles = 6, kind: 'bare' | 'cover' | 'crop' = 'bare', frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = wTiles * T;
  const p = new Paint(W, Math.round(12 * u));
  p.rect(0, S(6), W, S(6), kind === 'bare' ? COAST.clay : COAST.soil, { form: 'flat', level: 2 });
  for (let x = 0; x < W; x += S(4)) {
    p.line(x, S(6), x + S(2), S(6), COAST.soil, 0);
    if (kind === 'cover') {
      for (let k = 0; k < 3; k++) p.capsule(x + S(k * 1.3), S(6.4), x + S(k * 1.3 + (frame % 2 ? 0.4 : -0.2)), S(2.6 + (k % 2)), S(0.6), k % 2 ? ramp('#5aa84a') : ramp('#7cc44a'), {});
      p.ellipse(x + S(2), S(2.4), S(0.8), S(0.6), ramp('#c89ae0'), {});
    } else if (kind === 'crop') {
      p.capsule(x + S(2), S(6.4), x + S(2), S(0), S(0.5), ramp('#7cb04a'), {});
      p.ellipse(x + S(2.6), S(1.4), S(0.8), S(1.6), ramp('#f2c94c'), {});
    }
  }
  return p.toBuffer();
}

/** A buffer strip: tall native plants along the riverbank that catch soil and fertilizer. */
export function paintBufferStrip(T: number, wTiles = 4, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = wTiles * T;
  const p = new Paint(W, Math.round(20 * u));
  for (let x = 0; x < W; x += S(2.2)) {
    const k = Math.round(x / S(2.2));
    const top = S(4 + hash(k, 1, 4) * 7);
    const sway = Math.sin(frame * 0.4 + k) * S(0.5);
    p.capsule(x, S(20), x + sway, top, S(0.6), k % 3 ? ramp('#5aa84a') : ramp('#3f8f4a'), {});
    if (k % 4 === 0) p.ellipse(x + sway, top, S(1.2), S(1.2), k % 8 ? ramp('#f2c94c') : ramp('#c89ae0'), { sep: true });
  }
  return p.toBuffer();
}

/** A rain garden: a planted dip by the street that soaks up the runoff. */
export function paintRainGarden(T: number, wet = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(48 * u);
  const p = new Paint(W, Math.round(22 * u));
  p.ellipse(S(24), S(18), S(22), S(5), COAST.rich, { form: 'flat', level: 2 });
  if (wet) p.ellipse(S(24), S(18.6), S(14), S(2.2), COAST.river, { form: 'flat', level: 3 });
  for (let k = 0; k < 10; k++) {
    const x = S(6 + k * 4);
    const top = S(5 + hash(k, 3, 9) * 6);
    p.capsule(x, S(18), x, top, S(0.7), ramp('#4a9a52'), {});
    p.ellipse(x, top, S(1.6), S(1.4), [ramp('#9a62d0'), ramp('#f2c94c'), ramp('#ff7fa8')][k % 3], { sep: true });
  }
  for (const x of [2, 44]) p.ellipse(S(x), S(17), S(2.4), S(1.8), COAST.rock, { sep: true });
  return p.toBuffer();
}

/** A rain barrel under a downspout (it saves rain for the garden). */
export function paintRainBarrel(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(20 * u));
  p.rect(S(2), S(6), S(10), S(14), ramp('#3a7ad8'), { form: 'cylV', sep: true });
  for (const y of [8, 17]) p.rect(S(2), S(y), S(10), S(1), ramp('#2a5aa8'), { form: 'flat', level: 1 });
  p.rect(S(5.6), S(0), S(2.4), S(7), COAST.pipe, { form: 'cylV', sep: true });
  p.rect(S(10.6), S(15), S(2.4), S(1.2), COAST.pipe, { form: 'flat', level: 3 });
  return p.toBuffer();
}

/** A storm drain in the curb. With `marked`, the painted fish and "drains to river" line beside it. */
export function paintStormDrain(T: number, marked = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(24 * u), Math.round(10 * u));
  p.rect(0, S(2), S(24), S(4), COAST.curb, { form: 'flat', level: 3, sep: true });
  p.rect(S(6), S(5), S(12), S(4), ramp('#2a2a30'), { form: 'flat', level: 1 });
  for (let x = 7; x < 18; x += 2) p.rect(S(x), S(5), S(1), S(4), ramp('#6a6a72'), { form: 'flat', level: 2 });
  if (marked) {
    const f = ramp('#2f8fc8');
    p.ellipse(S(12), S(3.6), S(3), S(1.2), f, { form: 'flat', level: 3 });
    p.poly(
      [
        [S(8.4), S(3.6)],
        [S(7), S(2.4)],
        [S(7), S(4.8)],
      ],
      f,
      { form: 'flat', level: 3 },
    );
    p.pix(S(14), S(3.2), '#ffffff');
    for (let k = 0; k < 4; k++) p.pix(S(2 + k * 1.2), S(3.6), '#f2f4ec');
  }
  return p.toBuffer();
}

/** The mill by the river, its chimney smoking (or clean, with a filter fitted). */
export function paintMill(T: number, filtered = false, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(64 * u);
  const H = Math.round(76 * u);
  const p = new Paint(W, H);
  p.rect(S(4), S(40), S(48), S(36), COAST.brick, { form: 'flat', level: 2, sep: true });
  for (let y = 42; y < 76; y += 3) p.line(S(4), S(y), S(52), S(y), COAST.brick, 1, { onlyOver: true });
  p.poly(
    [
      [S(2), S(41)],
      [S(28), S(28)],
      [S(54), S(41)],
    ],
    ramp('#6a6a72'),
    { sep: true },
  );
  for (const x of [9, 22, 36]) p.rect(S(x), S(48), S(8), S(8), ramp('#f2d890'), { form: 'flat', level: 3, sep: true });
  p.rect(S(22), S(62), S(10), S(14), ramp('#5a3a24'), { form: 'flat', level: 2, sep: true });
  // the chimney
  p.rect(S(46), S(14), S(8), S(30), COAST.brick, { form: 'cylV', sep: true });
  if (filtered) p.rect(S(45), S(10), S(10), S(5), ramp('#9aa6b0'), { form: 'cylV', sep: true });
  const smoke = filtered ? COAST.steam : COAST.smoke;
  const n = filtered ? 3 : 7;
  for (let k = 0; k < n; k++) {
    const t = ((k + frame * 0.25) % n) / n;
    const r = S(2.4 + t * (filtered ? 3 : 6));
    p.ellipse(S(50) + t * S(10), S(10) - t * S(10), r, r * 0.8, smoke, { form: 'flat', level: filtered ? 4 : 2 + (k % 2) });
  }
  return p.toBuffer();
}

/** A town bus (part of the air story: buses that don't sit idling). */
export function paintBus(T: number, idling = false, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(56 * u);
  const p = new Paint(W, Math.round(26 * u));
  p.rect(S(2), S(2), S(52), S(18), ramp('#f2c94c'), { form: 'flat', level: 2, sep: true });
  for (let k = 0; k < 5; k++) p.rect(S(6 + k * 9), S(5), S(7), S(6), ramp('#9ad0f2', { cool: 1.2 }), { form: 'flat', level: 3 });
  p.rect(S(2), S(14), S(52), S(1.4), ramp('#3a3a40'), { form: 'flat', level: 2 });
  for (const x of [12, 44]) {
    p.ellipse(S(x), S(21), S(4), S(4), COAST.tire, { sep: true });
    p.ellipse(S(x), S(21), S(1.6), S(1.6), ramp('#9aa6b0'), {});
  }
  if (idling) for (let k = 0; k < 3; k++) p.ellipse(S(1) - ((k + frame) % 3) * S(1.6), S(18) - k * S(1.2), S(1.4 + k * 0.6), S(1.2 + k * 0.4), COAST.smoke, { form: 'flat', level: 2 });
  return p.toBuffer();
}

/** A shade tree (for the town, the riverbank and the Nature Center). */
export function paintShadeTree(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(36 * u), Math.round(48 * u));
  p.capsule(S(18), S(48), S(18), S(22), S(2.4), WILD.bark, { sep: true });
  p.capsule(S(18), S(30), S(11), S(22), S(1.2), WILD.bark, { sep: true });
  for (const [x, y, r] of [
    [10, 18, 9],
    [26, 18, 9],
    [18, 11, 10],
    [14, 25, 7],
    [24, 25, 7],
  ])
    p.ellipse(S(x + (seed % 2)), S(y), S(r), S(r * 0.85), seed % 2 ? WILD.leaf2 : WILD.leaf, { sep: true });
  return p.toBuffer();
}

/** A house in town (with a gutter and downspout). */
export function paintTownHouse(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(40 * u), Math.round(40 * u));
  const wall = [ramp('#ead8b0'), ramp('#bfe0d0'), ramp('#f2c8b0')][seed % 3];
  p.rect(S(4), S(16), S(32), S(24), wall, { form: 'flat', level: 2, sep: true });
  p.poly(
    [
      [S(1), S(17)],
      [S(20), S(3)],
      [S(39), S(17)],
    ],
    [COAST.roof, ramp('#c8584a'), ramp('#6a5a8a')][seed % 3],
    { sep: true },
  );
  p.rect(S(8), S(21), S(8), S(7), ramp('#9ad0f2', { cool: 1.2 }), { form: 'flat', level: 3, sep: true });
  p.rect(S(22), S(26), S(8), S(14), ramp('#5a3a24'), { form: 'flat', level: 2, sep: true });
  p.rect(S(35), S(17), S(1.6), S(23), COAST.pipe, { form: 'cylV' });
  return p.toBuffer();
}

// ------------------------------------------------------------------ the stretches: ground and backgrounds

export type Stretch = 'camp' | 'beach' | 'harbor' | 'wetland' | 'town';
export const STRETCHES: Exclude<Stretch, 'camp'>[] = ['beach', 'harbor', 'wetland', 'town'];

export const STRETCH_NAME: Record<Stretch, string> = {
  camp: 'Beach Camp',
  beach: 'Turtle Beach',
  harbor: 'The Harbor and River Mouth',
  wetland: 'The Wetland',
  town: 'Farm and Town',
};

export const STRETCH_PROBLEM: Record<Stretch, string> = {
  camp: 'Home base',
  beach: 'Trash and plastic',
  harbor: 'Oil and ghost nets',
  wetland: 'Muddy water and algae',
  town: 'The sources',
};

/** What the water looks like: clean, or the stretch's kind of pollution. */
export type Murk = 'clear' | 'trash' | 'oil' | 'algae' | 'mud';

export const DIRTY_MURK: Record<Stretch, Murk> = { camp: 'clear', beach: 'trash', harbor: 'oil', wetland: 'algae', town: 'mud' };

interface CoastGround {
  top: Ramp;
  fill: Ramp;
  fill2: Ramp;
  speck: string;
  water: Ramp;
  ledge: Ramp;
}

const GROUND: Record<Stretch, CoastGround> = {
  camp: { top: COAST.sand, fill: ramp('#d8b070'), fill2: ramp('#c49a5a'), speck: '#f2e6c8', water: COAST.sea, ledge: COAST.plank },
  beach: { top: COAST.sand, fill: ramp('#d8b070'), fill2: ramp('#c49a5a'), speck: '#f2e6c8', water: COAST.sea, ledge: COAST.driftwood },
  harbor: { top: COAST.plank, fill: COAST.rock, fill2: ramp('#6a6a6a'), speck: '#b0b0a8', water: ramp('#2f80a8'), ledge: COAST.plank },
  wetland: { top: WILD.grass2, fill: WILD.mud, fill2: COAST.rich, speck: '#a8885a', water: COAST.river, ledge: COAST.plank },
  town: { top: WILD.grass, fill: COAST.soil, fill2: COAST.clay, speck: '#c49460', water: COAST.river, ledge: COAST.plank },
};

const MURK: Record<Murk, Ramp | null> = { clear: null, trash: null, oil: null, algae: COAST.algae, mud: COAST.mudWater };

export type CoastTileKind = 'top' | 'fill' | 'ledge' | 'water' | 'waterTop' | 'road';

/**
 * One tile of a stretch's ground. `seed` varies the look (use the tile's x),
 * `frame` animates water, `murk` dirties it (an oily rainbow sheen, green
 * algae or brown mud; trash is drawn as separate pieces).
 */
export function paintCoastTile(T: number, stretch: Stretch, kind: CoastTileKind, seed = 0, frame = 0, murk: Murk = 'clear'): PixelBuffer {
  const g = GROUND[stretch];
  const b = new PixelBuffer(T, T);
  const u = U(T);
  if (kind === 'fill' || kind === 'top' || kind === 'road') {
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const n = hash(x + seed * T, y, 7);
        const band = Math.floor((y + seed * 3) / (5 * u)) % 2;
        let c = (band ? g.fill2 : g.fill)[n < 0.12 ? 1 : n > 0.9 ? 3 : 2];
        if (n > 0.97) c = g.speck;
        b.set(x, y, c);
      }
    if (kind === 'road') {
      const r = COAST.road;
      for (let y = 0; y < Math.round(6 * u); y++) for (let x = 0; x < T; x++) b.set(x, y, r[y === 0 ? 4 : hash(x + seed * T, y, 2) > 0.9 ? 3 : 2]);
      if (seed % 2 === 0) for (let x = Math.round(4 * u); x < Math.round(12 * u); x++) b.set(x, Math.round(3 * u), '#f2e6a0');
    } else if (kind === 'top') {
      const top = stretch === 'harbor' ? COAST.plank : g.top;
      const edge = Math.round((stretch === 'harbor' ? 5 : 4) * u);
      for (let x = 0; x < T; x++) {
        const d = stretch === 'harbor' ? edge : edge + Math.round(Math.sin((x + seed * T) * 0.7) * u) + (hash(x + seed * T, 0, 3) > 0.7 ? 1 : 0);
        for (let y = 0; y < d; y++) b.set(x, y, top[y === 0 ? 4 : y < 2 ? 3 : y === d - 1 ? 1 : 2]);
        if (stretch === 'harbor' && (x + seed * 7) % Math.round(8 * u) === 0) for (let y = 0; y < d; y++) b.set(x, y, top[1]);
        if ((stretch === 'wetland' || stretch === 'town') && hash(x + seed * T, 2, 9) > 0.84) b.set(x, 0, g.top[1]);
      }
    }
  } else if (kind === 'ledge') {
    const h = Math.round(5 * u);
    for (let y = 0; y < h; y++) for (let x = 0; x < T; x++) b.set(x, y, g.ledge[y === 0 ? 4 : y === h - 1 ? 0 : (x + seed * 5) % Math.round(8 * u) === 0 ? 1 : 2]);
    for (const x of [Math.round(2 * u), T - Math.round(3 * u)]) b.set(x, Math.round(2 * u), g.ledge[0]);
  } else {
    const w = MURK[murk] ?? g.water;
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const deep = kind === 'water' ? 1 : y < 3 * u ? 3 : 2;
        let c = w[deep];
        const wave = Math.sin((x + seed * T) * 0.4 + frame * 0.8 + y * 0.3);
        if (kind === 'waterTop' && y < Math.round(1.5 * u) + (wave > 0 ? 1 : 0)) {
          if (murk === 'oil') {
            const k = Math.floor((x + seed * T + frame) / 3) % 5;
            c = ['#3a3a48', '#7a5aa0', '#5a8ab0', '#8aa04a', '#a87a3a'][k];
          } else c = mixHex(w[4], '#ffffff', murk === 'clear' || murk === 'trash' ? 0.5 : 0.2);
        } else if (murk === 'oil' && kind === 'waterTop' && y < Math.round(3 * u)) c = mixHex(w[deep], '#2a2a34', 0.55);
        else if (murk === 'algae' && kind === 'waterTop' && y < Math.round(4 * u) && hash(x + seed * T, y, 4) > 0.55) c = hash(x, y, 8) > 0.5 ? '#8ac04a' : '#6aa83a';
        else if (murk === 'algae' && hash(x + seed * T, y + frame, 4) > 0.97) c = '#7cb04a';
        else if (wave > 0.92 && (y + frame) % 5 === 0) c = w[deep + 1] ?? w[4];
        b.set(x, y, c);
      }
  }
  return b;
}

/** Banded sky with checkerboard dithering between the bands. */
function sky(b: PixelBuffer, colors: string[]): void {
  const n = colors.length;
  for (let y = 0; y < b.h; y++) {
    const t = (y / b.h) * (n - 1);
    const i = Math.min(n - 2, Math.floor(t));
    const f = t - i;
    for (let x = 0; x < b.w; x++) b.set(x, y, colors[f > 0.75 || (f > 0.5 && (x + y) % 2 === 0) ? i + 1 : i]);
  }
}

/** A silhouette band: a height for every column, shaded with a bright top edge (seamless). */
function ridge(b: PixelBuffer, height: (x: number) => number, r: Ramp, lit = 3): void {
  for (let x = 0; x < b.w; x++) {
    const top = Math.round(b.h - height(x));
    for (let y = Math.max(0, top); y < b.h; y++) {
      const d = y - top;
      b.set(x, y, d < 1 ? (r[lit + 1] ?? r[4]) : d < 3 ? r[lit] : r[lit - 1]);
    }
  }
}

function puff(b: PixelBuffer, cx: number, cy: number, rad: number, r: Ramp): void {
  for (let y = -rad; y <= rad; y++)
    for (let x = -rad; x <= rad; x++) {
      if (Math.hypot(x, y * 1.15) > rad) continue;
      const light = -x * 0.4 - y * 0.8;
      const xx = (((cx + x) % b.w) + b.w) % b.w;
      b.set(xx, cy + y, r[light > rad * 0.45 ? 4 : light > -rad * 0.1 ? 3 : 2]);
    }
}

function mixRamp(r: Ramp, toward: string, t: number): Ramp {
  return r.map((c) => mixHex(c, toward, t));
}

export interface CoastBackdrop {
  sky: PixelBuffer;
  far: PixelBuffer;
  near: PixelBuffer;
}

/**
 * The layered background of a stretch at w x h pixels. Dirty stretches get a
 * hazier sky (the town's smoke) and duller colors; clean ones are bright.
 */
export function paintCoastBackdrop(stretch: Stretch, w: number, h: number, clean = false): CoastBackdrop {
  const s = new PixelBuffer(w, h);
  const far = new PixelBuffer(w, h);
  const near = new PixelBuffer(w, h);
  const wave = (x: number, k: number, ph = 0) => Math.sin((x / w) * Math.PI * 2 * k + ph);
  const hazy = !clean && stretch === 'town';
  const skies: Record<Stretch, string[]> = {
    camp: ['#4a9ae0', '#62b0ea', '#80c4f0', '#a8d8f2', '#d8eef2', '#f6e8c8'],
    beach: ['#4a9ae0', '#62b0ea', '#80c4f0', '#a8d8f2', '#d8eef2', '#f6e8c8'],
    harbor: ['#4a92d8', '#5aa6e6', '#78bcf0', '#a0d2f2', '#c8e4f0', '#eaf0e0'],
    wetland: ['#5a9ad8', '#6ab0e6', '#86c4ec', '#acd8ee', '#d0e8e4', '#e8f0d8'],
    town: ['#5a9ae0', '#70b0ea', '#8cc4f0', '#b0d8f2', '#d4eaf0', '#f2ecd8'],
  };
  const haze = ['#8a94a8', '#98a0b0', '#a8aeb8', '#b8bcc0', '#c8c8c4', '#d8d4c8'];
  sky(s, hazy ? haze : skies[stretch]);
  // the Sun and a few clouds
  const sx = Math.round(w * 0.8);
  const sy = Math.round(h * 0.16);
  const sr = Math.round(h * 0.055);
  for (let y = -sr * 2; y <= sr * 2; y++)
    for (let x = -sr * 2; x <= sr * 2; x++) {
      const d = Math.hypot(x, y);
      if (d <= sr) s.set(sx + x, sy + y, hazy ? '#f2e0b0' : d < sr * 0.6 ? '#fff8d0' : '#ffe27a');
      else if (!hazy && d <= sr * 1.5 && (x + y) % 2 === 0) s.set(sx + x, sy + y, '#fff0b0');
    }
  const cloud = ramp('#f2f6fa', { cool: 1.3 });
  for (let k = 0; k < 4; k++) {
    const cx = Math.round(hash(k, 1, 5) * w);
    const cy = Math.round(h * (0.08 + hash(k, 2, 5) * 0.2));
    for (let j = 0; j < 4; j++) puff(s, cx + j * 7, cy + (j % 2) * 2, 6 + (j % 2) * 2, hazy ? mixRamp(cloud, '#9a9a9a', 0.4) : cloud);
  }
  if (stretch === 'beach' || stretch === 'camp') {
    const hz = Math.round(h * 0.6);
    for (let y = hz; y < h; y++) for (let x = 0; x < w; x++) far.set(x, y, COAST.sea[y < hz + 2 ? 4 : (x * 3 + y * 7) % 23 === 0 ? 4 : y < hz + 20 ? 3 : 2]);
    // a headland with the lighthouse far off
    ridge(
      far,
      (x) => {
        const d = Math.abs(x - w * 0.18) / 60;
        return d < 1 ? h - hz + 18 * Math.sqrt(1 - d * d) : 0;
      },
      mixRamp(WILD.leaf2, '#9ac8e8', 0.4),
    );
    const lx = Math.round(w * 0.16);
    for (let y = hz - 30; y < hz - 14; y++) for (let x = -2; x <= 2; x++) far.set(lx + x, y, Math.floor(y / 5) % 2 ? '#e8e0d0' : '#c8584a');
    // the dunes with beach grass
    ridge(near, (x) => h * 0.14 + wave(x, 3) * 8 + wave(x, 7, 1) * 3, COAST.dune);
    for (let x = 0; x < w; x += 8) {
      const top = Math.round(h - (h * 0.14 + wave(x, 3) * 8 + wave(x, 7, 1) * 3));
      for (let k = 0; k < 7; k++) near.set(x + (k % 3) - 1, top - k, WILD.grass[k < 3 ? 2 : 3]);
    }
  } else if (stretch === 'harbor') {
    const hz = Math.round(h * 0.58);
    const sea = clean ? COAST.sea : mixRamp(COAST.sea, '#4a5a6a', 0.3);
    for (let y = hz; y < h; y++) for (let x = 0; x < w; x++) far.set(x, y, sea[y < hz + 2 ? 4 : (x * 5 + y * 3) % 19 === 0 ? 4 : 2]);
    // the town across the river mouth, and boats at anchor
    ridge(far, (x) => h - hz + 10 + wave(x, 2) * 4, mixRamp(WILD.leaf2, '#a0c0d8', 0.45));
    for (let k = 0; k < 7; k++) {
      const bx = Math.round((k / 7) * w + 12);
      const by = hz - 8 - Math.round(wave(bx, 2) * 4);
      for (let y = 0; y < 7; y++) for (let x = 0; x < 9; x++) far.set(bx + x, by + y, ['#ead8b0', '#bfe0d0', '#f2c8b0'][k % 3]);
      for (let y = 0; y < 4; y++) for (let x = -1; x < 10 - y; x++) if (x >= y - 1) far.set(bx + x, by - 4 + y, ['#c8584a', '#3f7a9a'][k % 2]);
    }
    for (let k = 0; k < 3; k++) {
      const bx = Math.round(w * (0.2 + k * 0.3));
      for (let x = 0; x < 16; x++) near.set(bx + x, Math.round(h * 0.7) + (x < 2 || x > 13 ? -1 : 0), '#f2f4ec');
      for (let y = 0; y < 14; y++) near.set(bx + 7, Math.round(h * 0.7) - y, '#8a6a4a');
    }
    // the dock posts close up
    for (let x = 0; x < w; x += 40) for (let y = Math.round(h * 0.76); y < h; y++) for (let k = 0; k < 4; k++) near.set(x + k, y, COAST.wood[k === 0 ? 3 : 1]);
  } else if (stretch === 'wetland') {
    ridge(far, (x) => h * 0.36 + wave(x, 2, 1) * 10 + wave(x, 6) * 4, mixRamp(WILD.leaf2, '#a0c8d8', 0.45));
    ridge(near, (x) => h * 0.2 + wave(x, 5) * 5, clean ? WILD.leaf2 : mixRamp(WILD.leaf2, '#8a8a5a', 0.35));
    for (let x = 0; x < w; x += 5) {
      const top = Math.round(h - (h * 0.2 + wave(x, 5) * 5));
      const tall = 8 + Math.round(hash(x, 3, 1) * 8);
      for (let k = 0; k < tall; k++) near.set(x, top - k, (clean ? WILD.grass : COAST.algae)[k < 3 ? 2 : 3]);
      if (x % 15 === 0) for (let k = 0; k < 4; k++) near.set(x, top - tall - k, '#8a5a30');
    }
  } else {
    // hills of fields, the farm, the town and the mill's chimney
    ridge(far, (x) => h * 0.42 + wave(x, 2) * 12 + wave(x, 5, 1) * 4, mixRamp(WILD.grass, hazy ? '#a8a8a0' : '#a0c8d8', 0.45));
    for (let x = 0; x < w; x++) {
      const top = Math.round(h - (h * 0.42 + wave(x, 2) * 12 + wave(x, 5, 1) * 4));
      for (let y = top + 4; y < top + 30; y += 5) if (x % 3 !== 0) far.set(x, y, clean ? '#7cb04a' : '#b08a5a');
    }
    const cx = Math.round(w * 0.7);
    for (let y = Math.round(h * 0.28); y < Math.round(h * 0.6); y++) for (let k = 0; k < 6; k++) far.set(cx + k, y, '#a0584a');
    if (!clean) for (let k = 0; k < 6; k++) puff(far, cx + 4 + k * 8, Math.round(h * 0.24) - k * 5, 6 + k * 2, mixRamp(COAST.smoke, '#a8a8a0', 0.3));
    ridge(near, (x) => h * 0.16 + wave(x, 4) * 3, ramp('#5a8a4a'));
    for (let x = 10; x < w; x += 54) {
      const base = Math.round(h - (h * 0.16 + wave(x, 4) * 3)) + 2;
      for (let y = base - 14; y < base; y++) for (let k = 0; k < 18; k++) near.set(x + k, y, COAST.wall[k === 0 ? 1 : 2]);
      for (let k = 0; k < 11; k++) for (let j = 0; j <= k; j++) near.set(x + 9 - j, base - 25 + k, COAST.roof[2]);
      for (let k = 0; k < 11; k++) for (let j = 0; j <= k; j++) near.set(x + 9 + j, base - 25 + k, COAST.roof[1]);
    }
  }
  return { sky: s, far, near };
}

// ------------------------------------------------------------------ the Nature Center (the free-building area)

export type NatureId =
  | 'beachgrass'
  | 'milkweed'
  | 'sunflower'
  | 'shadetree'
  | 'cattails'
  | 'birdbox'
  | 'batbox'
  | 'beehotel'
  | 'dunefence'
  | 'compost'
  | 'rainbarrel'
  | 'amberlight'
  | 'bench'
  | 'sign'
  | 'lookout'
  | 'logpile';

export type NatureLayer = 'ground' | 'pond' | 'high';

export interface NatureInfo {
  name: string;
  /** Where it can go: on the ground, in the pond, or up a post (boxes and lights). */
  layer: NatureLayer;
  /** Width in tiles. */
  w: number;
  /** How it helps (its card). */
  helps: string;
}

export const NATURE: Record<NatureId, NatureInfo> = {
  beachgrass: { name: 'Beach grass', layer: 'ground', w: 1, helps: 'Its long roots hold the dune together, so the wind and waves can’t carry the sand away.' },
  milkweed: { name: 'Milkweed', layer: 'ground', w: 1, helps: 'Monarch butterflies lay their eggs on milkweed, and their caterpillars eat only milkweed.' },
  sunflower: { name: 'Sunflowers', layer: 'ground', w: 1, helps: 'Bees drink their nectar, and birds eat the seeds in autumn.' },
  shadetree: { name: 'Shade tree', layer: 'ground', w: 2, helps: 'Shade keeps the ground cool, and its roots hold the soil when it rains.' },
  cattails: { name: 'Cattails', layer: 'pond', w: 1, helps: 'Their roots clean the water, and birds and frogs hide among them.' },
  birdbox: { name: 'Bird box', layer: 'high', w: 1, helps: 'A safe place for small birds to raise their chicks. Made from scrap wood.' },
  batbox: { name: 'Bat box', layer: 'high', w: 1, helps: 'Bats sleep in it by day. At night one bat can eat hundreds of insects.' },
  beehotel: { name: 'Bee hotel', layer: 'high', w: 1, helps: 'Hollow stems where wild bees lay their eggs. Wild bees carry pollen too.' },
  dunefence: { name: 'Dune fence', layer: 'ground', w: 2, helps: 'It slows the wind, so sand piles up and the dune grows back.' },
  compost: { name: 'Compost bin', layer: 'ground', w: 1, helps: 'Worms and tiny decomposers turn food scraps into rich soil.' },
  rainbarrel: { name: 'Rain barrel', layer: 'ground', w: 1, helps: 'It saves rain from the roof to water the garden later.' },
  amberlight: { name: 'Amber path light', layer: 'high', w: 1, helps: 'Turtle-safe light: dim and amber, so hatchlings head to the bright sea, not the land. Solar powered.' },
  bench: { name: 'Recycled bench', layer: 'ground', w: 2, helps: 'Made from old plastic bottles, so they never reach the sea.' },
  sign: { name: 'Leave no trace sign', layer: 'ground', w: 1, helps: 'It reminds visitors: take your trash home, and leave shells and plants where they are.' },
  lookout: { name: 'Bird lookout', layer: 'ground', w: 2, helps: 'A quiet place to watch birds without scaring them.' },
  logpile: { name: 'Log pile', layer: 'ground', w: 1, helps: 'Beetles, worms and fungi live in old wood and break it down into soil.' },
};

export const NATURE_IDS = Object.keys(NATURE) as NatureId[];

/** One Nature Center piece, its feet at the bottom middle (`w` tiles wide). */
export function paintNature(id: NatureId, T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const info = NATURE[id];
  const W = Math.round(info.w * 16 * u);
  const tall = id === 'shadetree' ? 44 : id === 'lookout' ? 36 : info.layer === 'high' ? 34 : id === 'sunflower' || id === 'cattails' ? 28 : 22;
  const H = Math.round(tall * u);
  const p = new Paint(W, H);
  const B = H;
  const post = () => p.rect(W / 2 - S(0.8), B - S(20), S(1.6), S(20), COAST.wood, { form: 'cylV', sep: true });
  const sway = Math.sin(frame * 0.5) * S(0.5);
  switch (id) {
    case 'beachgrass':
      for (let k = 0; k < 7; k++) p.capsule(S(2 + k * 2), B, S(1 + k * 2.2) + sway, B - S(8 + (k % 3) * 3), S(0.5), k % 2 ? ramp('#8ab04a') : ramp('#a8c060'), {});
      break;
    case 'milkweed':
      p.capsule(S(8), B, S(8) + sway, B - S(16), S(0.7), ramp('#5a9a4a'), {});
      for (const [x, y] of [
        [5, 10],
        [11, 8],
      ])
        p.ellipse(S(x) + sway, B - S(y), S(2.4), S(1.2), ramp('#5aa84a'), { sep: true });
      for (let k = 0; k < 5; k++) p.ellipse(S(6.6 + k * 0.7) + sway, B - S(17 + (k % 2)), S(1), S(1), ramp('#e08ab0'), { sep: true });
      break;
    case 'sunflower':
      p.capsule(S(8), B, S(8) + sway, B - S(20), S(0.8), ramp('#5a9a4a'), {});
      p.ellipse(S(6), B - S(10), S(2.4), S(1.4), ramp('#5aa84a'), { sep: true });
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        p.ellipse(S(8) + sway + Math.cos(a) * S(3.4), B - S(22) + Math.sin(a) * S(3.4), S(1.6), S(1.6), ramp('#f2c94c'), { sep: true });
      }
      p.ellipse(S(8) + sway, B - S(22), S(2.4), S(2.4), ramp('#6a4428'), { sep: true });
      break;
    case 'shadetree':
      return paintShadeTree(T, 1);
    case 'cattails':
      return paintReeds(T, 2, frame);
    case 'birdbox':
      post();
      p.rect(S(3), B - S(30), S(10), S(11), COAST.driftwood, { form: 'flat', level: 2, sep: true });
      p.poly(
        [
          [S(2), B - S(29)],
          [S(8), B - S(34)],
          [S(14), B - S(29)],
        ],
        COAST.wood,
        { sep: true },
      );
      p.ellipse(S(8), B - S(25), S(1.6), S(1.6), ramp(INK), { form: 'flat', level: 1 });
      p.rect(S(7.4), B - S(22), S(1.2), S(1.6), COAST.wood, {});
      break;
    case 'batbox':
      post();
      p.rect(S(3), B - S(33), S(10), S(14), ramp('#5a4030'), { form: 'flat', level: 2, sep: true });
      for (let y = 30; y > 20; y -= 2.4) p.line(S(3.6), B - S(y), S(12.4), B - S(y), ramp('#3a2a20'), 1, { onlyOver: true });
      p.rect(S(4.6), B - S(20.6), S(6.8), S(1), ramp(INK), { form: 'flat', level: 1 });
      break;
    case 'beehotel':
      post();
      p.rect(S(2), B - S(31), S(12), S(12), COAST.wood, { form: 'flat', level: 2, sep: true });
      p.poly(
        [
          [S(1), B - S(30)],
          [S(8), B - S(34)],
          [S(15), B - S(30)],
        ],
        ramp('#c8584a'),
        { sep: true },
      );
      for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) p.ellipse(S(4 + x * 2.6), B - S(27 - y * 3), S(1), S(1), ramp('#c8a060'), { form: 'flat', level: 1 });
      break;
    case 'dunefence':
      for (let x = 1; x < 32; x += 3.2) p.rect(S(x), B - S(11), S(1.4), S(11), COAST.driftwood, { form: 'cylV', sep: true });
      for (const y of [8, 4]) p.line(S(0), B - S(y), S(32), B - S(y), ramp('#8a6a44'), 1);
      p.ellipse(S(8), B - S(1), S(8), S(2), COAST.dune, { form: 'flat', level: 3 });
      break;
    case 'compost':
      p.rect(S(2), B - S(12), S(12), S(12), ramp('#3aa65a'), { form: 'flat', level: 2, sep: true });
      for (let y = 10; y > 0; y -= 3) p.line(S(2.4), B - S(y), S(13.6), B - S(y), ramp('#2a7a3a'), 1, { onlyOver: true });
      p.rect(S(1.4), B - S(13.6), S(13.2), S(2), ramp('#2a7a3a'), { form: 'flat', level: 2 });
      for (let k = 0; k < 4; k++) p.pix(S(4 + k * 2.4), B - S(14.6), ['#f2902f', '#7cb04a', '#c8a070', '#e0503a'][k]);
      break;
    case 'rainbarrel':
      return paintRainBarrel(T);
    case 'amberlight': {
      p.rect(W / 2 - S(0.6), B - S(16), S(1.2), S(16), ramp('#3a3a40'), { form: 'cylV', sep: true });
      p.rect(S(5), B - S(20), S(6), S(4), ramp('#3a3a40'), { form: 'flat', level: 2, sep: true });
      p.rect(S(5.6), B - S(22), S(4.8), S(1.4), ramp('#3a5a9a'), { form: 'flat', level: 3 });
      const out = p.toBuffer();
      const lamp = new Paint(W, H);
      lamp.rect(S(6), B - S(19.4), S(4), S(2.6), ramp(COAST.amber), { form: 'flat', level: 3 });
      out.blit(lamp.toBuffer({ outline: false }), 0, 0);
      return out;
    }
    case 'bench':
      p.rect(S(2), B - S(9), S(28), S(2.4), ramp('#3a8ac8'), { form: 'flat', level: 3, sep: true });
      p.rect(S(2), B - S(15), S(28), S(2), ramp('#3a8ac8'), { form: 'flat', level: 2, sep: true });
      for (const x of [4, 26]) p.rect(S(x), B - S(15), S(2), S(15), ramp('#2a6aa8'), { form: 'cylV', sep: true });
      for (let k = 0; k < 3; k++) p.pix(S(10 + k * 5), B - S(8), '#f2f4ec');
      break;
    case 'sign':
      p.rect(S(7.2), B - S(14), S(1.6), S(14), COAST.wood, { form: 'cylV', sep: true });
      p.rect(S(1), B - S(20), S(14), S(8), COAST.plank, { form: 'flat', level: 3, sep: true });
      p.ellipse(S(5), B - S(16), S(2), S(1.4), ramp('#ffb0a0'), { form: 'flat', level: 2 });
      p.line(S(3), B - S(18), S(7), B - S(14), ramp('#e0503a'), 2);
      p.capsule(S(10), B - S(17.4), S(13), B - S(15), S(0.8), ramp('#3aa65a'), {});
      break;
    case 'lookout':
      for (const x of [3, 28]) p.rect(S(x), B - S(22), S(1.8), S(22), COAST.wood, { form: 'cylV', sep: true });
      p.rect(S(1), B - S(22), S(30), S(2), COAST.plank, { form: 'flat', level: 3, sep: true });
      p.rect(S(2), B - S(34), S(28), S(12), COAST.plank, { form: 'flat', level: 2, sep: true });
      p.rect(S(7), B - S(30), S(18), S(4), ramp('#3a2a20'), { form: 'flat', level: 1 });
      for (let k = 0; k < 6; k++) p.rect(S(4 + k * 4), B - S(20 - k * 3.4), S(4), S(1), COAST.plank, { form: 'flat', level: 3 });
      break;
    case 'logpile':
      for (const [x, y] of [
        [4, 3],
        [12, 3],
        [8, 7.6],
      ])
        p.ellipse(S(x), B - S(y), S(3.6), S(2.6), COAST.wood, { form: 'cylH', sep: true });
      for (const [x, y] of [
        [4, 3],
        [12, 3],
        [8, 7.6],
      ])
        p.ellipse(S(x + 2.6), B - S(y), S(1), S(2.2), ramp('#d8b080'), { form: 'flat', level: 3 });
      p.ellipse(S(13), B - S(6.6), S(1.4), S(1), ramp('#e0503a'), {});
      break;
  }
  return p.toBuffer();
}

/** The Nature Center lot's tiles, seen cut away: the surface, the soil, deep soil with roots, the pond. */
export type LotTile = 'grass' | 'sand' | 'soil' | 'deep' | 'pondEdge' | 'pond' | 'pondTop';

export function paintLotTile(T: number, kind: LotTile, seed = 0, frame = 0): PixelBuffer {
  const b = new PixelBuffer(T, T);
  const u = U(T);
  const pick = (r: Ramp, x: number, y: number) => r[hash(x + seed * T, y, 5) < 0.12 ? 1 : hash(x + seed * T, y, 6) > 0.92 ? 3 : 2];
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      let c: string;
      if (kind === 'pond' || kind === 'pondTop') {
        c = COAST.river[kind === 'pond' ? 1 : 2];
        const wv = Math.sin((x + seed * T) * 0.4 + frame * 0.8);
        if (kind === 'pondTop' && y < Math.round(1.5 * u) + (wv > 0 ? 1 : 0)) c = mixHex(COAST.river[4], '#ffffff', 0.45);
      } else if (kind === 'deep') c = pick(COAST.rich, x, y);
      else c = pick(kind === 'sand' ? ramp('#d8b070') : COAST.soil, x, y);
      b.set(x, y, c);
    }
  if (kind === 'grass' || kind === 'sand') {
    const top = kind === 'grass' ? WILD.grass : COAST.sand;
    for (let x = 0; x < T; x++) {
      const d = Math.round(4 * u) + (hash(x + seed * T, 0, 3) > 0.7 ? 1 : 0);
      for (let y = 0; y < d; y++) b.set(x, y, top[y === 0 ? 4 : y < 2 ? 3 : y === d - 1 ? 1 : 2]);
    }
  }
  if (kind === 'deep' || kind === 'soil') {
    // little roots and stones in the cut-away soil
    for (let k = 0; k < 3; k++) {
      const x0 = Math.floor(hash(seed, k, 9) * T);
      const y0 = Math.floor(hash(seed, k, 10) * T);
      if (kind === 'deep') for (let j = 0; j < 5 * u; j++) b.set(x0 + j, y0 + Math.round(Math.sin(j) * u), '#c8a070');
      else b.set(x0, y0, '#b0a090');
    }
  }
  if (kind === 'pondEdge') for (let y = 0; y < T; y++) for (let x = 0; x < Math.round(4 * u); x++) b.set(x, y, COAST.rock[(x + y) % 3 ? 2 : 3]);
  return b;
}

export type VisitorId = 'butterfly' | 'bee' | 'wren' | 'bat' | 'frog' | 'heron' | 'worm' | 'beetle';

export const VISITOR_NAME: Record<VisitorId, string> = {
  butterfly: 'Monarch butterfly',
  bee: 'Wild bee',
  wren: 'Wren',
  bat: 'Little brown bat',
  frog: 'Leopard frog',
  heron: 'Great blue heron',
  worm: 'Earthworm',
  beetle: 'Ground beetle',
};

/** What a visitor needs to come (one piece is enough), and one fact for the Visitor Book. */
export const VISITOR_NEEDS: Record<VisitorId, { needs: NatureId[]; pond?: boolean; fact: string }> = {
  butterfly: { needs: ['milkweed'], fact: 'Monarchs fly thousands of kilometers each autumn, and they need milkweed all along the way.' },
  bee: { needs: ['sunflower', 'beehotel'], fact: 'Most wild bees live alone, not in hives, and they rarely sting.' },
  wren: { needs: ['birdbox'], fact: 'A wren can feed its chicks hundreds of insects a day.' },
  bat: { needs: ['batbox'], fact: 'Bats find insects in the dark by listening to the echoes of their own calls.' },
  frog: { needs: ['cattails'], pond: true, fact: 'Frogs breathe partly through their skin, so they need clean water.' },
  heron: { needs: ['cattails'], pond: true, fact: 'A heron stands perfectly still in the shallows, then strikes fast to catch a fish.' },
  worm: { needs: ['compost'], fact: 'Earthworms mix the soil and leave tunnels that let air and water in.' },
  beetle: { needs: ['logpile'], fact: 'Ground beetles hunt slugs at night, which helps the garden.' },
};

/** The visitors that would come to a Nature Center with these pieces (and a pond, if it has one). */
export function visitorsFor(pieces: readonly NatureId[], hasPond: boolean): VisitorId[] {
  return (Object.keys(VISITOR_NEEDS) as VisitorId[]).filter((v) => {
    const n = VISITOR_NEEDS[v];
    if (n.pond && !hasPond) return false;
    if (v === 'heron') return hasPond && pieces.filter((p) => p === 'cattails').length >= 2;
    return n.needs.some((id) => pieces.includes(id));
  });
}

/** A small visitor (frames animate). */
export function paintVisitor(id: VisitorId, T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(12 * u), Math.round(10 * u));
  switch (id) {
    case 'butterfly': {
      const open = frame % 2 === 0;
      const w = ramp('#f2902f');
      for (const s of [-1, 1]) {
        p.ellipse(S(6) + s * S(open ? 2.6 : 1.4), S(4), S(open ? 2.4 : 1.2), S(2.4), w, { sep: true });
        p.ellipse(S(6) + s * S(open ? 2 : 1), S(7), S(open ? 1.6 : 0.8), S(1.6), w, { sep: true });
      }
      p.rect(S(5.6), S(2.6), S(0.8), S(6), ramp(INK), {});
      p.pix(S(3.6), S(4), '#ffffff');
      break;
    }
    case 'bee': {
      p.ellipse(S(6), S(6), S(3), S(2), ramp('#f2c94c'), { sep: true });
      for (const x of [5, 7]) p.rect(S(x), S(4.2), S(0.8), S(3.6), ramp(INK), { form: 'flat', level: 2, onlyOver: true });
      p.ellipse(S(5.4), S(3.4), S(1.6), S(1.2), ramp('#e8f4ff', { cool: 1.3 }), { form: 'flat', level: frame % 2 ? 3 : 4 });
      p.pix(S(8.6), S(5.4), INK);
      break;
    }
    case 'wren': {
      const b = ramp('#8a6a44');
      p.ellipse(S(6), S(6), S(3.4), S(2.6), b, { sep: true });
      p.capsule(S(3), S(5), S(1.4), S(2 + (frame % 2)), S(0.7), b, {});
      p.ellipse(S(9), S(4.4), S(1.8), S(1.6), b, { sep: true });
      p.rect(S(10.4), S(4.4), S(1.2), S(0.6), ramp('#3a3a3a'), {});
      p.pix(S(9.4), S(3.8), INK);
      p.ellipse(S(6.4), S(7), S(1.6), S(1), ramp('#d8b890'), { form: 'flat', level: 3, onlyOver: true });
      break;
    }
    case 'bat': {
      const b = ramp('#5a4a40');
      const up = frame % 2 === 0;
      p.ellipse(S(6), S(5), S(1.6), S(2), b, { sep: true });
      for (const s of [-1, 1])
        p.poly(
          [
            [S(6), S(4)],
            [S(6) + s * S(5.6), up ? S(2) : S(6)],
            [S(6) + s * S(3), S(7)],
          ],
          b,
          { sep: true },
        );
      p.pix(S(5.4), S(4), '#f2e6a0');
      p.pix(S(6.6), S(4), '#f2e6a0');
      break;
    }
    case 'frog': {
      const g = ramp('#5aa84a');
      p.ellipse(S(6), S(6.6), S(4), S(2.4), g, { sep: true });
      for (const x of [4, 8]) p.ellipse(S(x), S(4), S(1.2), S(1.2), g, { sep: true });
      for (const x of [4, 8]) p.pix(S(x), S(3.8), INK);
      for (const [x, y] of [
        [4.6, 6],
        [7.6, 7],
      ])
        p.ellipse(S(x), S(y), S(0.8), S(0.6), ramp('#3a7a3a'), { form: 'flat', level: 1, onlyOver: true });
      p.line(S(4), S(7.6), S(8), S(7.6), ramp('#3a7a3a'), 0);
      break;
    }
    case 'heron':
      return paintHeron(T, frame);
    case 'worm': {
      const w = ramp('#e08a8a');
      for (let k = 0; k < 6; k++) p.ellipse(S(2 + k * 1.6), S(6 + Math.sin(k + frame) * 0.8), S(1.1), S(1), w, { sep: true });
      break;
    }
    case 'beetle': {
      const b = ramp('#3a3a5a', { cool: 1.2 });
      p.ellipse(S(6), S(6), S(3.4), S(2.2), b, { sep: true });
      p.line(S(6), S(4), S(6), S(8), ramp('#6a6a9a'), 3, { onlyOver: true });
      p.ellipse(S(9.4), S(6), S(1.2), S(1), b, { sep: true });
      for (const x of [4, 6, 8]) p.line(S(x), S(7.6), S(x - 0.6), S(9), ramp(INK), 1);
      break;
    }
  }
  return p.toBuffer();
}

export { PixelBuffer };
