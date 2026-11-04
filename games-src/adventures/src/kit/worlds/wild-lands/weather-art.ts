import { PixelBuffer } from '../../art/pixel';
import { paintHero, type Look16 } from '../hero16';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { WILD } from './art';

/**
 * Wild Lands art for Weather Wizard Battle, the first side-scroller (the
 * "S2 Earth: Weather Wizard Battle" section of docs/GAMES_3D_UPGRADE_PLAN.md):
 * the cast (Professor Nimbus, Dr. Iris Okoro, the player as a young wizard,
 * Drip the droplet in five forms), the tiles and layered backgrounds of the
 * five regions, the props and the weather effects.
 *
 * Same painter and rules as the rest of the world: designs are written at 16
 * pixels per tile and scaled by u = T / 16. Water vapor is invisible, so it
 * is only ever drawn as a faint shimmer; clouds are drawn as what they are
 * (tiny drops), white and grey.
 */

const U = (T: number) => T / 16;

export const SKY = {
  ice: ramp('#bfe8f2', { cool: 1.2 }),
  cloud: ramp('#f2f6fa', { cool: 1.3 }),
  grey: ramp('#a8b0bc', { cool: 1.2 }),
  storm: ramp('#5a6070', { cool: 1.2 }),
  drop: ramp('#4ab4ea', { cool: 0.8 }),
  rock: ramp('#8a8a92', { cool: 1.1 }),
  rock2: ramp('#6a6a78', { cool: 1.1 }),
  snow: ramp('#f4f8fc', { cool: 1.4 }),
  driftwood: ramp('#b89a78'),
  roof: ramp('#c8584a'),
  roof2: ramp('#3f7a9a'),
  wall: ramp('#ead8b0'),
  night: ramp('#3a3a6a'),
  indigo: ramp('#4a3f9a'),
  teal: ramp('#2f9a94'),
  bolt: '#fff6a0',
} as const;

// ------------------------------------------------------------------ the people (draft names)

/** Professor Nimbus, the old weather wizard (make-believe) who teaches each power. */
export const NIMBUS: Look16 = {
  build: 'adult',
  skin: '#8a5a3c',
  hair: { style: 'short', color: '#e8e8ec' },
  top: { color: '#4a3f9a', trim: '#f2c94c', kind: 'robe' },
  legs: '#3a3460',
  shoes: '#5a3a24',
  sole: '#2a2420',
  mudcloth: '#f2c94c',
  beads: ['#7fd0f2', '#f2c94c'],
};

/** Dr. Iris Okoro, the meteorologist at the weather station by the field camp. */
export const IRIS_OKORO: Look16 = {
  build: 'adult',
  skin: '#5a3626',
  hair: { style: 'puffs', color: '#1a1416', tie: '#3a7ad8' },
  top: { color: '#f2c94c', trim: '#3a7ad8', kind: 'jumpsuit' },
  legs: '#3f4a6b',
  shoes: '#3a7ad8',
  sole: '#f2f4ec',
  belt: '#3a4a5a',
  badge: '#f2f4ec',
};

/** The player, a young weather wizard (Professor Nimbus's apprentice). */
export const APPRENTICE: Look16 = {
  build: 'kid',
  skin: '#7a4a2e',
  hair: { style: 'puffs', color: '#2c2433', tie: '#f2c94c' },
  top: { color: '#2f9a94', trim: '#f2c94c', kind: 'robe' },
  legs: '#3f4a6b',
  shoes: '#e0574f',
  sole: '#f4efe6',
};

/** Villagers by the sea (Storm Front, and the village requests). */
export const VILLAGERS: Look16[] = [
  {
    build: 'adult',
    skin: '#c08a60',
    hair: { style: 'wrap', color: '#2a201c', tie: '#e0503a' },
    top: { color: '#e0503a', trim: '#f2e6c8', kind: 'dress' },
    legs: '#5a4a3a',
    shoes: '#5a3a24',
  },
  {
    build: 'adult',
    skin: '#6a4430',
    hair: { style: 'short', color: '#1e1814' },
    top: { color: '#5aa84a', trim: '#f2c94c', kind: 'jumpsuit' },
    legs: '#6a5a3a',
    shoes: '#3a2a20',
    belt: '#5a3a24',
  },
  {
    build: 'kid',
    skin: '#e2b894',
    hair: { style: 'locs', color: '#5a3a24', tie: '#ff7fa8' },
    top: { color: '#ff7fa8', trim: '#f2f4ec', kind: 'dress' },
    legs: '#3a7ad8',
    shoes: '#f2c94c',
  },
];

// ------------------------------------------------------------------ the wizards (hat, staff, poses)

export type Power = 'sun' | 'cool' | 'wind' | 'cold' | 'rain';
export type WizardPose = 'stand' | 'run' | 'jump' | 'fall' | 'cast';

export const POWER_COLOR: Record<Power, string> = {
  sun: '#ffc23a',
  cool: '#9ad8ff',
  wind: '#c8f0d8',
  cold: '#e8f6ff',
  rain: '#4ab4ea',
};

export const POWER_NAME: Record<Power, string> = {
  sun: 'Sun',
  cool: 'Cool air',
  wind: 'Wind',
  cold: 'Cold',
  rain: 'Rain',
};

/** Padding round the hero so the hat and staff fit (design pixels). */
const PAD_X = 8;
const PAD_TOP = 13;

/**
 * A wizard seen from the side, facing right (or left): the hero sprite with a
 * pointed hat (tall for Professor Nimbus, small for the apprentice) and a
 * staff, in a pose. The feet are at the bottom middle of the buffer.
 */
export function paintWizard(look: Look16, T: number, face: 'left' | 'right', o: { pose?: WizardPose; frame?: number; hat?: 'tall' | 'small'; power?: Power; blink?: boolean } = {}): PixelBuffer {
  if (face === 'left') return paintWizard(look, T, 'right', o).flipX();
  const u = U(T);
  const pose = o.pose ?? 'stand';
  const frame = o.frame ?? 0;
  const walk = pose === 'run' ? frame % 4 : pose === 'jump' ? 1 : pose === 'fall' ? 3 : 0;
  const hero = paintHero(look, u, 'right', { walk, blink: o.blink });
  const px = Math.round(PAD_X * u);
  const pt = Math.round(PAD_TOP * u);
  const W = hero.w + px * 2;
  const H = hero.h + pt;
  // find the top of the head and its middle, so the hat sits on any hairstyle
  let top = 0;
  for (; top < hero.h; top++) if (hero.px.slice(top * hero.w, (top + 1) * hero.w).some((c) => c)) break;
  let sx = 0;
  let n = 0;
  for (let y = top; y < top + Math.round(4 * u); y++)
    for (let x = 0; x < hero.w; x++)
      if (hero.get(x, y)) {
        sx += x;
        n++;
      }
  const headX = px + (n ? sx / n : hero.w / 2);
  const headY = pt + top;
  const p = new Paint(W, H);
  const S = (v: number) => v * u;
  // the staff behind the body when standing or running; held out in front when casting
  const handY = pt + hero.h * 0.58;
  const staffWood = ramp('#8a5a36', { warm: 1.2 });
  const orb = ramp(o.power ? POWER_COLOR[o.power] : '#7fd0f2', { spread: 0.8 });
  if (pose !== 'cast') {
    const x = headX - S(4.5);
    p.rect(x, handY - S(12), S(1.4), S(15), staffWood, { form: 'cylV' });
    p.ellipse(x + S(0.7), handY - S(13), S(1.8), S(1.8), orb, { sep: true });
  }
  const out = p.toBuffer();
  out.blit(hero, px, pt);
  // the hat and the staff in front go on a second layer, over the hero
  const q = new Paint(W, H);
  const tall = o.hat === 'tall';
  const hatR = tall ? SKY.indigo : ramp(look.top.color);
  const band = ramp(look.top.trim);
  const brimY = headY + S(tall ? 2.6 : 2.2);
  const brimW = S(tall ? 8.2 : 6.4);
  const coneH = S(tall ? 13 : 9);
  const lean = pose === 'run' || pose === 'jump' ? -S(2) : -S(1);
  q.poly(
    [
      [headX - brimW * 0.62, brimY],
      [headX + brimW * 0.62, brimY],
      [headX + lean + S(1.2), brimY - coneH * 0.7],
      [headX + lean - S(1.6), brimY - coneH],
      [headX + lean - S(0.6), brimY - coneH * 0.62],
    ],
    hatR,
    { sep: true },
  );
  q.rect(headX - brimW * 0.56, brimY - S(1.8), brimW * 1.12, S(1.2), band, { form: 'flat', level: 2 });
  q.ellipse(headX, brimY + S(0.2), brimW, S(1.2), hatR, { sep: true, form: 'flat', level: 1 });
  if (tall) {
    for (const [sx2, sy2] of [
      [-1.6, -5],
      [1.2, -8],
      [-0.4, -10.6],
    ])
      q.pix(headX + S(sx2), brimY + S(sy2), '#f2c94c');
    q.pix(headX + S(1.2) + 1, brimY + S(-8), '#fff6c0');
  } else q.pix(headX - S(0.6), brimY - S(4.4), '#f2f4ec');
  if (pose === 'cast') {
    // arm out, staff tipped forward, the orb glowing in the power's color
    const hx = headX + S(4);
    q.capsule(headX + S(1), handY - S(2), hx, handY - S(3), S(1.1), ramp(look.top.color), { sep: true });
    q.capsule(hx - S(1), handY + S(2), hx + S(4), handY - S(10), S(0.7), staffWood, { sep: true });
    q.ellipse(hx + S(4.3), handY - S(11), S(2.2), S(2.2), orb, { sep: true });
    const glow = o.power ? POWER_COLOR[o.power] : '#7fd0f2';
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + frame * 0.5;
      q.pix(hx + S(4.3) + Math.cos(a) * S(4), handY - S(11) + Math.sin(a) * S(4), glow);
    }
  }
  out.blit(q.toBuffer(), 0, 0);
  return out;
}

/** Portrait-free helper: the size of a wizard buffer, for laying out a scene. */
export function wizardSize(look: Look16, T: number): { w: number; h: number } {
  const b = paintWizard(look, T, 'right');
  return { w: b.w, h: b.h };
}

// ------------------------------------------------------------------ Drip the droplet

export type DripForm = 'drop' | 'vapor' | 'cloud' | 'snow' | 'river';

export const DRIP_FORM_NAME: Record<DripForm, string> = {
  drop: 'Drip, a drop of sea water',
  vapor: 'Drip as water vapor (invisible, so just a shimmer)',
  cloud: 'Drip as a tiny cloud drop',
  snow: 'Drip as a snowflake',
  river: 'Drip in the river',
};

function dripFace(p: Paint, cx: number, cy: number, u: number, blink: boolean, dark = '#1a3040'): void {
  const S = (v: number) => v * u;
  for (const ex of [-2, 2]) {
    if (blink) p.fillPix(Math.floor(cx + S(ex) - S(0.6)), Math.floor(cy), Math.max(1, Math.round(S(1.2))), 1, dark);
    else {
      p.fillPix(Math.floor(cx + S(ex) - S(0.5)), Math.floor(cy - S(0.6)), Math.max(1, Math.round(S(1))), Math.max(2, Math.round(S(1.6))), dark);
      p.pix(cx + S(ex) - S(0.3), cy - S(0.6), '#ffffff');
    }
  }
  p.pix(cx - S(1), cy + S(2), dark);
  p.pix(cx, cy + S(2.4), dark);
  p.pix(cx + S(1), cy + S(2), dark);
  p.pix(cx - S(3.4), cy + S(1.4), '#ff9ab8');
  p.pix(cx + S(3.4), cy + S(1.4), '#ff9ab8');
}

/**
 * Drip, the water droplet who travels round the water cycle with the player.
 * Frames: 0 rest, 1 squash (landing), 2 stretch (jumping or falling), 3 bob.
 */
export function paintDrip(T: number, form: DripForm = 'drop', frame = 0, blink = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(18 * u));
  const sq = frame === 1 ? 1.18 : frame === 2 ? 0.86 : 1;
  const bob = frame === 3 ? -1 : 0;
  const cx = S(8);
  if (form === 'drop' || form === 'river') {
    const r = form === 'river' ? ramp('#3ac0c8', { cool: 0.8 }) : SKY.drop;
    const cy = S(11.4 + bob + (sq > 1 ? 0.8 : 0));
    const rx = S(5.2) * sq;
    const ry = S(5) / sq;
    p.poly(
      [
        [cx - rx * 0.62, cy - ry * 0.6],
        [cx, cy - ry - S(5.4) / sq],
        [cx + rx * 0.62, cy - ry * 0.6],
      ],
      r,
      { box: [cx - rx, cy - ry - S(5), rx * 2, ry * 2 + S(5)] },
    );
    p.ellipse(cx, cy, rx, ry, r, { box: [cx - rx, cy - ry - S(5), rx * 2, ry * 2 + S(5)] });
    p.ellipse(cx - S(2.2), cy - S(2.6), S(1.1), S(1.6), WILD.white, { form: 'flat', level: 4 });
    dripFace(p, cx + S(0.4), cy - S(0.2), u, blink);
    if (form === 'river') for (let i = -2; i <= 2; i++) p.pix(cx + S(i), cy + ry - S(1.4), '#bff4f2');
  } else if (form === 'cloud') {
    const r = SKY.cloud;
    const cy = S(11 + bob);
    for (const [ox, oy, rr] of [
      [-3.6, 1, 3.2],
      [3.6, 1, 3.2],
      [-1.4, -1.6, 3.8],
      [2, -2.2, 3.4],
      [0, 1.4, 4],
    ])
      p.ellipse(cx + S(ox) * sq, cy + S(oy), S(rr) * sq, S(rr) / sq, r, { box: [cx - S(7), cy - S(6), S(14), S(10)] });
    dripFace(p, cx, cy, u, blink, '#3a4a60');
    // tiny drops inside: what a cloud really is
    for (const [dx, dy] of [
      [-5, 2],
      [5, 3],
      [3.6, -3.6],
    ])
      p.pix(cx + S(dx), cy + S(dy), SKY.drop[2]);
  } else if (form === 'snow') {
    const r = SKY.ice;
    const cy = S(9.6 + bob);
    const turn = frame * 0.18;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + turn;
      const ex = cx + Math.cos(a) * S(6.6);
      const ey = cy + Math.sin(a) * S(6.6);
      p.line(cx, cy, ex, ey, r, 3);
      p.line(cx + 1, cy, ex + 1, ey, r, 2);
      for (const t of [0.55, 0.78]) {
        const bx = cx + Math.cos(a) * S(6.6) * t;
        const by = cy + Math.sin(a) * S(6.6) * t;
        for (const s of [-1, 1]) p.line(bx, by, bx + Math.cos(a + s * 0.9) * S(1.8), by + Math.sin(a + s * 0.9) * S(1.8), r, 3);
      }
    }
    p.ellipse(cx, cy, S(3.6), S(3.4), r, { sep: true });
    dripFace(p, cx, cy - S(0.4), u, blink, '#2a4a70');
  } else {
    // vapor: invisible, so only a faint shimmer with two eyes, so the player can follow it
    const cy = S(9 + bob);
    const sh = ramp('#e8f4ff', { cool: 1.2 });
    for (let k = -1; k <= 1; k++)
      for (let t = 0; t < 1; t += 0.06) {
        const y = cy + S(6) - t * S(12);
        const x = cx + S(k * 3.4) + Math.sin(t * 9 + frame + k) * S(1.2);
        if (hash(Math.floor(t * 40), k + 2, frame) < 0.75) p.dot(x, y, sh, 3);
      }
    for (const ex of [-1.6, 1.6]) {
      p.fillPix(Math.floor(cx + S(ex) - 1), Math.floor(cy), 2, 2, '#4a6a8a');
      p.pix(cx + S(ex) - 1, cy, '#ffffff');
    }
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ regions: tiles and backgrounds

export type Region = 'shore' | 'clouds' | 'mountain' | 'river' | 'storm';
export const REGIONS: Region[] = ['shore', 'clouds', 'mountain', 'river', 'storm'];

export const REGION_NAME: Record<Region, string> = {
  shore: 'Sunny Shore',
  clouds: 'Cloud Heights',
  mountain: 'Mountain Pass',
  river: 'River Run',
  storm: 'Storm Front',
};

export const REGION_STAGE: Record<Region, string> = {
  shore: 'Evaporation',
  clouds: 'Condensation',
  mountain: 'Precipitation',
  river: 'Collection',
  storm: 'The storm',
};

interface Ground {
  top: Ramp;
  fill: Ramp;
  fill2: Ramp;
  speck: string;
  water: Ramp;
  ledge: Ramp;
}

const GROUND: Record<Region, Ground> = {
  shore: { top: WILD.sand, fill: ramp('#d8b070'), fill2: ramp('#c49a5a'), speck: '#f2e6c8', water: WILD.sea, ledge: SKY.driftwood },
  clouds: { top: WILD.grass, fill: SKY.rock, fill2: SKY.rock2, speck: '#c8c8d0', water: WILD.river, ledge: SKY.cloud },
  mountain: { top: SKY.snow, fill: SKY.rock2, fill2: ramp('#5a5868', { cool: 1.1 }), speck: '#a8a8b8', water: ramp('#5ab0d0'), ledge: WILD.plank },
  river: { top: WILD.grass2, fill: WILD.dirt, fill2: WILD.mud, speck: '#c49460', water: WILD.river, ledge: WILD.plank },
  storm: {
    top: ramp('#3f7a4a', { cool: 1.2 }),
    fill: ramp('#6a5a4a', { cool: 1.2 }),
    fill2: ramp('#4a4038', { cool: 1.2 }),
    speck: '#8a7a6a',
    water: ramp('#3a6a8a', { cool: 1.2 }),
    ledge: ramp('#7a6a58', { cool: 1.2 }),
  },
};

export type TileKind = 'top' | 'fill' | 'ledge' | 'water' | 'waterTop' | 'ice';

/** One tile of a region's ground. `seed` varies the look (use the tile's x); `frame` animates water. */
export function paintTile(T: number, region: Region, kind: TileKind, seed = 0, frame = 0): PixelBuffer {
  const g = GROUND[region];
  const b = new PixelBuffer(T, T);
  const u = U(T);
  if (kind === 'fill' || kind === 'top') {
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const n = hash(x + seed * T, y, 7);
        const band = Math.floor((y + seed * 3) / (5 * u)) % 2;
        let c = (band ? g.fill2 : g.fill)[n < 0.12 ? 1 : n > 0.9 ? 3 : 2];
        if (n > 0.97) c = g.speck;
        b.set(x, y, c);
      }
    if (kind === 'top') {
      const edge = Math.round(4 * u);
      for (let x = 0; x < T; x++) {
        const d = edge + Math.round(Math.sin((x + seed * T) * 0.7) * u) + (hash(x + seed * T, 0, 3) > 0.7 ? 1 : 0);
        for (let y = 0; y < d; y++) b.set(x, y, g.top[y === 0 ? 4 : y < 2 ? 3 : y === d - 1 ? 1 : 2]);
        if (region !== 'mountain' && region !== 'shore' && hash(x + seed * T, 1, 9) > 0.8) b.set(x, 0, g.top[1]);
        if (region !== 'mountain' && region !== 'shore' && hash(x + seed * T, 2, 9) > 0.86) {
          b.set(x, -1, g.top[3]);
        }
      }
      if (region === 'shore' && hash(seed, 5, 1) > 0.6) {
        // a shell
        const sx = Math.floor(hash(seed, 6, 1) * (T - 4)) + 2;
        b.set(sx, 2, '#ffb0a0');
        b.set(sx + 1, 2, '#ffd8c8');
      }
    }
  } else if (kind === 'ledge') {
    if (region === 'clouds') {
      for (let y = 0; y < Math.round(7 * u); y++)
        for (let x = 0; x < T; x++) {
          const bump = Math.sin(((x + seed * T) / T) * Math.PI * 2) * u * 1.5;
          if (y + bump < 0.5) continue;
          b.set(x, y, SKY.cloud[y < 2 * u ? 4 : y < 4 * u ? 3 : 2]);
        }
    } else {
      const h = Math.round(5 * u);
      for (let y = 0; y < h; y++) for (let x = 0; x < T; x++) b.set(x, y, g.ledge[y === 0 ? 4 : y === h - 1 ? 0 : (x + seed * 5) % Math.round(8 * u) === 0 ? 1 : 2]);
      for (const x of [Math.round(2 * u), T - Math.round(3 * u)]) b.set(x, Math.round(2 * u), g.ledge[0]);
    }
  } else if (kind === 'water' || kind === 'waterTop') {
    const w = g.water;
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const deep = kind === 'water' ? 1 : y < 3 * u ? 3 : 2;
        let c = w[deep];
        const wave = Math.sin((x + seed * T) * 0.4 + frame * 0.8 + y * 0.3);
        if (kind === 'waterTop' && y < Math.round(1.5 * u) + (wave > 0 ? 1 : 0)) c = mixHex(w[4], '#ffffff', 0.5);
        else if (wave > 0.92 && (y + frame) % 5 === 0) c = w[deep + 1] ?? w[4];
        b.set(x, y, c);
      }
  } else {
    // ice: pale blue with a bright top and cracks
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        let c = SKY.ice[y < 2 * u ? 4 : (x + y + seed) % Math.round(9 * u) === 0 ? 3 : 2];
        if (y === T - 1 || x === 0) c = SKY.ice[1];
        b.set(x, y, c);
      }
    for (let k = 0; k < 4 * u; k++) b.set(Math.round(6 * u + k), Math.round(5 * u + k * 0.6), '#ffffff');
  }
  return b;
}

/** Banded sky with checkerboard dithering between the bands (the 16-bit look). */
function sky(b: PixelBuffer, colors: string[]): void {
  const n = colors.length;
  for (let y = 0; y < b.h; y++) {
    const t = (y / b.h) * (n - 1);
    const i = Math.min(n - 2, Math.floor(t));
    const f = t - i;
    for (let x = 0; x < b.w; x++) {
      const pick = f > 0.75 || (f > 0.5 && (x + y) % 2 === 0) ? i + 1 : i;
      b.set(x, y, colors[pick]);
    }
  }
}

/** A silhouette band: a height for every column, shaded with a bright top edge (seamless left to right). */
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
      const d = Math.hypot(x, y * 1.15);
      if (d > rad) continue;
      const light = -x * 0.4 - y * 0.8;
      const lv = light > rad * 0.45 ? 4 : light > -rad * 0.1 ? 3 : 2;
      const xx = (((cx + x) % b.w) + b.w) % b.w;
      b.set(xx, cy + y, r[lv]);
    }
}

export interface Backdrop {
  /** The sky (does not scroll). */
  sky: PixelBuffer;
  /** The far layer (scrolls slowly; seamless left to right). */
  far: PixelBuffer;
  /** The near layer (scrolls faster; seamless left to right). */
  near: PixelBuffer;
}

/** The layered background of a region at w x h pixels. `storm` darkens the sky (the storm sky). */
export function paintBackdrop(region: Region, w: number, h: number, storm = false): Backdrop {
  const s = new PixelBuffer(w, h);
  const far = new PixelBuffer(w, h);
  const near = new PixelBuffer(w, h);
  const wave = (x: number, k: number, ph = 0) => Math.sin((x / w) * Math.PI * 2 * k + ph);
  const dark = storm || region === 'storm';
  const skies: Record<Region, string[]> = {
    shore: ['#4a9ae0', '#62b0ea', '#80c4f0', '#a8d8f2', '#d8eef2', '#f6e8c8'],
    clouds: ['#3a7ad8', '#4a90e0', '#62a8ea', '#86c0f0', '#b0d8f6', '#e0f0fa'],
    mountain: ['#3a6ac8', '#4a84d8', '#6aa0e0', '#90bcea', '#c0daf2', '#e8f2fa'],
    river: ['#4a9ae0', '#5aaaea', '#78bcf0', '#a0d0f2', '#c8e6f0', '#e8f2e0'],
    storm: ['#2a2e44', '#363a52', '#444a62', '#545a72', '#686e84', '#7c8294'],
  };
  sky(s, dark ? skies.storm : skies[region]);
  if (!dark) {
    // the Sun (it powers the whole water cycle)
    const sx = Math.round(w * 0.78);
    const sy = Math.round(h * 0.16);
    const sr = Math.round(h * 0.06);
    for (let y = -sr * 2; y <= sr * 2; y++)
      for (let x = -sr * 2; x <= sr * 2; x++) {
        const d = Math.hypot(x, y);
        if (d <= sr) s.set(sx + x, sy + y, d < sr * 0.6 ? '#fff8d0' : '#ffe27a');
        else if (d <= sr * 1.5 && (x + y) % 2 === 0) s.set(sx + x, sy + y, '#fff0b0');
      }
    // small high clouds
    for (let k = 0; k < 4; k++) {
      const cx = Math.round(hash(k, 1, 4) * w);
      const cy = Math.round(h * (0.1 + hash(k, 2, 4) * 0.2));
      for (let j = 0; j < 4; j++) puff(s, cx + j * 7, cy + (j % 2) * 2, 6 + (j % 2) * 2, SKY.cloud);
    }
  } else {
    // heavy cloud bands and rain streaks
    for (let k = 0; k < 14; k++) puff(s, Math.round((k / 14) * w), Math.round(h * 0.08 + hash(k, 3, 2) * 18), 20 + Math.round(hash(k, 4, 2) * 12), SKY.storm);
    for (let i = 0; i < w * 0.6; i++) {
      const x = Math.floor(hash(i, 1, 11) * w);
      const y = Math.floor(hash(i, 2, 11) * h);
      for (let k = 0; k < 6; k++) if (x - k >= 0) s.set(x - Math.floor(k / 2), y + k, '#8a92a8');
    }
  }
  if (region === 'shore') {
    // the sea to the horizon, an island, then dunes with sea grass
    const hz = Math.round(h * 0.62);
    for (let y = hz; y < h; y++) for (let x = 0; x < w; x++) far.set(x, y, WILD.sea[y < hz + 2 ? 4 : (x * 3 + y * 7) % 23 === 0 ? 4 : y < hz + 20 ? 3 : 2]);
    ridge(
      far,
      (x) => {
        const d = Math.abs(x - w * 0.3) / 46;
        return d < 1 ? h - hz + 16 * Math.sqrt(1 - d * d) + Math.sin(x * 0.4) * (1 - d) : 0;
      },
      mixRamp(WILD.leaf2, '#9ac8e8', 0.35),
    );
    ridge(near, (x) => h * 0.14 + wave(x, 3) * 8 + wave(x, 7, 1) * 3, WILD.sand);
    for (let x = 0; x < w; x += 9) {
      const top = Math.round(h - (h * 0.14 + wave(x, 3) * 8 + wave(x, 7, 1) * 3));
      for (let k = 0; k < 7; k++) near.set(x + (k % 3) - 1, top - k, WILD.grass[k < 3 ? 2 : 3]);
    }
  } else if (region === 'clouds') {
    // far below: the camp's green hills; around: banks of cumulus
    ridge(far, (x) => h * 0.22 + wave(x, 2) * 10 + wave(x, 5, 2) * 4, mixRamp(WILD.grass, '#9ac8e8', 0.55));
    for (let k = 0; k < 10; k++) puff(far, Math.round((k / 10) * w), Math.round(h * 0.7 + hash(k, 5, 6) * 10), 16 + Math.round(hash(k, 6, 6) * 10), SKY.cloud);
    for (let k = 0; k < 6; k++) {
      const cx = Math.round((k / 6) * w + 20);
      const cy = Math.round(h * 0.82);
      for (let j = 0; j < 5; j++) puff(near, cx + j * 12, cy - (j === 2 ? 10 : j % 2 ? 6 : 0), 12 + (j === 2 ? 4 : 0), SKY.cloud);
    }
  } else if (region === 'mountain') {
    const peaks = (x: number) => h * 0.45 + wave(x, 3) * 30 + Math.abs(wave(x, 7, 1)) * 18;
    ridge(far, peaks, mixRamp(SKY.rock, '#a0b8e0', 0.45));
    for (let x = 0; x < w; x++) {
      const top = Math.round(h - peaks(x));
      for (let y = top; y < top + 10 + wave(x, 11) * 4; y++) far.set(x, y, SKY.snow[y < top + 2 ? 4 : 3]);
    }
    ridge(near, (x) => h * 0.22 + wave(x, 4, 2) * 10, mixRamp(SKY.rock2, '#7a90b8', 0.3));
    for (let x = 6; x < w; x += 22) pineSilhouette(near, x, Math.round(h - (h * 0.22 + wave(x, 4, 2) * 10)) + 4, 22, '#3a5a5a');
  } else if (region === 'river') {
    ridge(far, (x) => h * 0.4 + wave(x, 2, 1) * 14 + wave(x, 6) * 5, mixRamp(WILD.leaf2, '#a0c8d8', 0.45));
    ridge(near, (x) => h * 0.24 + wave(x, 5) * 6, WILD.leaf2);
    for (let x = 0; x < w; x += 26) {
      const top = Math.round(h - (h * 0.24 + wave(x, 5) * 6));
      puff(near, x, top - 12, 14, WILD.leaf);
      for (let y = top - 4; y < top + 6; y++) near.set(x, y, WILD.bark[1]);
    }
  } else {
    // the stormy sea with a lighthouse, then the village roofs
    const hz = Math.round(h * 0.6);
    const sea = ramp('#3a5a7a', { cool: 1.2 });
    for (let y = hz; y < h; y++) for (let x = 0; x < w; x++) far.set(x, y, sea[(x * 5 + y * 3) % 17 === 0 ? 4 : y < hz + 2 ? 3 : 2]);
    const lx = Math.round(w * 0.62);
    for (let y = hz - 40; y < hz; y++) for (let x = -3; x <= 3; x++) far.set(lx + x, y, Math.floor((y - hz) / 8) % 2 ? '#e8e0d0' : '#c8584a');
    for (let x = -5; x <= 5; x++) far.set(lx + x, hz - 41, '#3a3a4a');
    for (let y = hz - 46; y < hz - 41; y++) for (let x = -3; x <= 3; x++) far.set(lx + x, y, x === 0 ? '#fff0a0' : '#3a3a4a');
    ridge(near, (x) => h * 0.16 + wave(x, 4) * 4, ramp('#3f5a4a', { cool: 1.2 }));
    for (let x = 10; x < w; x += 46) {
      const base = Math.round(h - (h * 0.16 + wave(x, 4) * 4)) + 2;
      for (let y = base - 14; y < base; y++) for (let k = 0; k < 18; k++) near.set(x + k, y, SKY.wall[k === 0 ? 1 : 2]);
      for (let k = 0; k < 12; k++)
        for (let j = 0; j <= k; j++) {
          near.set(x + 9 - j - 1, base - 14 - (12 - k) + 1, SKY.roof[2]);
          near.set(x + 9 + j, base - 14 - (12 - k) + 1, SKY.roof[1]);
        }
      near.set(x + 5, base - 9, '#fff0a0');
      near.set(x + 6, base - 9, '#fff0a0');
      near.set(x + 12, base - 9, '#fff0a0');
    }
  }
  return { sky: s, far, near };
}

function mixRamp(r: Ramp, toward: string, t: number): Ramp {
  return r.map((c) => mixHex(c, toward, t));
}

function pineSilhouette(b: PixelBuffer, cx: number, base: number, ht: number, c: string): void {
  for (let y = 0; y < ht; y++) {
    const half = Math.round(((y % 6) + 2 + y * 0.3) * 0.6);
    for (let x = -half; x <= half; x++) b.set(cx + x, base - ht + y, c);
  }
}

// ------------------------------------------------------------------ props

/** A beach crab (to jump over; it scuttles side to side). Frames 0-1. */
export function paintCrab(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(11 * u));
  const r = ramp('#e8603a', { warm: 1.2 });
  const lift = frame % 2;
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) p.line(S(8 + s * 3), S(7), S(8 + s * (5.5 + k * 1.2)), S(10 - (k === lift ? 1 : 0)), r, 1);
    p.capsule(S(8 + s * 4), S(5), S(8 + s * 6), S(3), S(0.8), r, {});
    p.ellipse(S(8 + s * 6.4), S(2.6), S(1.8), S(1.6), r, { sep: true });
  }
  p.ellipse(S(8), S(6.4), S(4.6), S(3), r, { sep: true });
  for (const s of [-1, 1]) {
    p.line(S(8 + s * 1.4), S(4), S(8 + s * 1.6), S(2), r, 1);
    p.pix(S(8 + s * 1.6), S(1.6), '#1a1210');
  }
  return p.toBuffer();
}

/** A rolling coconut (frame turns it). */
export function paintCoconut(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(10 * u), Math.round(10 * u));
  p.ellipse(S(5), S(5), S(4.4), S(4.4), ramp('#7a5236'), { sep: true });
  const a = frame * 0.8;
  for (let k = 0; k < 3; k++) {
    const b = a + (k * Math.PI * 2) / 3;
    p.pix(S(5) + Math.cos(b) * S(2), S(5) + Math.sin(b) * S(2), '#3a2418');
  }
  return p.toBuffer();
}

/** A tide pool, `wTiles` wide. `warm` shows it in the sun with the shimmer of evaporation. */
export function paintTidePool(T: number, wTiles = 2, warm = false, frame = 0): PixelBuffer {
  const u = U(T);
  const W = T * wTiles;
  const p = new Paint(W, Math.round(10 * u));
  const rock = SKY.rock;
  p.ellipse(W / 2, 6 * u, W / 2 - 1, 4 * u, rock, { sep: true });
  p.ellipse(W / 2, 5.4 * u, W / 2 - 4 * u, 2.6 * u, warm ? ramp('#5ac8d8') : WILD.sea, { form: 'flat', level: 3 });
  for (let k = 0; k < 3; k++) p.pix(W / 2 - 6 * u + k * 6 * u, 5 * u, '#ffffff');
  const b = p.toBuffer();
  if (warm) {
    const q = new PixelBuffer(W, Math.round(30 * u));
    for (let k = 0; k < 5; k++)
      for (let t = 0; t < 14 * u; t++) {
        const x = Math.round(W / 2 - 8 * u + k * 4 * u + Math.sin(t * 0.5 + frame + k) * u);
        if ((t + frame + k) % 3) q.set(x, Math.round(q.h - 10 * u - t), 'rgba(255,255,255,0.55)');
      }
    q.blit(b, 0, q.h - b.h);
    return q;
  }
  return b;
}

/** A pine tree (snowy on Mountain Pass). */
export function paintPine(T: number, snowy = false, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(18 * u), Math.round(34 * u));
  p.rect(S(8), S(26), S(2), S(8), WILD.bark, { form: 'cylV' });
  const leaf = ramp(seed % 2 ? '#2f7a5a' : '#2f6a52');
  for (let k = 0; k < 4; k++) {
    const y = 4 + k * 6;
    const half = 3 + k * 1.6;
    p.poly(
      [
        [S(9), S(y - 3)],
        [S(9 + half), S(y + 6)],
        [S(9 - half), S(y + 6)],
      ],
      leaf,
      { sep: true },
    );
    if (snowy)
      p.poly(
        [
          [S(9), S(y - 3)],
          [S(9 + half * 0.7), S(y + 2.4)],
          [S(9), S(y + 1.4)],
          [S(9 - half * 0.7), S(y + 2.4)],
        ],
        SKY.snow,
        { form: 'flat', level: 3 },
      );
  }
  return p.toBuffer();
}

/** A waterfall, `hTiles` tall and one tile wide: falling water, or frozen into an ice ladder. */
export function paintWaterfall(T: number, hTiles = 4, frame = 0, frozen = false): PixelBuffer {
  const H = T * hTiles;
  const b = new PixelBuffer(T, H);
  const u = U(T);
  for (let y = 0; y < H; y++)
    for (let x = Math.round(2 * u); x < T - Math.round(2 * u); x++) {
      if (frozen) {
        const rung = y % Math.round(8 * u) < Math.round(2 * u);
        b.set(x, y, SKY.ice[rung ? 4 : x < 5 * u ? 3 : (x + y) % 11 === 0 ? 4 : 2]);
      } else {
        const streak = (x * 7 + Math.floor((y - frame * 4 * u) / (3 * u)) * 3) % 5;
        b.set(x, y, streak === 0 ? '#e8fbff' : streak === 1 ? WILD.river[3] : WILD.river[2]);
      }
    }
  if (!frozen) for (let x = 0; x < T; x++) if ((x + frame) % 3) b.set(x, H - 1 - (x % 2), '#ffffff');
  return b;
}

/** The river raft (River Run). */
export function paintRaft(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(40 * u), Math.round(10 * u));
  for (let k = 0; k < 5; k++) p.capsule(S(3), S(4 + k * 0.2), S(37), S(4 + k * 0.2), S(1.6), k % 2 ? WILD.wood : WILD.plank, { sep: true });
  p.rect(S(2), S(6), S(36), S(2.4), WILD.bark, { form: 'cylH' });
  for (const x of [6, 20, 34]) p.rect(S(x), S(2), S(1.2), S(7), ramp('#d8c48a'), { form: 'flat', level: 2 });
  return p.toBuffer();
}

/** A village house by the sea (seed picks the roof color). */
export function paintHouse(T: number, seed = 0, lit = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(34 * u), Math.round(34 * u));
  const roof = seed % 2 ? SKY.roof2 : SKY.roof;
  p.rect(S(4), S(16), S(26), S(18), SKY.wall, { form: 'flat', level: 2 });
  p.rect(S(4), S(16), S(4), S(18), SKY.wall, { form: 'flat', level: 1 });
  p.poly(
    [
      [S(1), S(17)],
      [S(17), S(3)],
      [S(33), S(17)],
    ],
    roof,
    { sep: true },
  );
  p.rect(S(14), S(24), S(6), S(10), WILD.wood, { form: 'flat', level: 1 });
  for (const x of [7, 23]) p.rect(S(x), S(21), S(4), S(4), ramp(lit ? '#ffe27a' : '#5a7a9a'), { form: 'flat', level: lit ? 3 : 2 });
  return p.toBuffer();
}

/** The lighthouse on the point (Storm Front). */
export function paintLighthouse(T: number, lit = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(60 * u));
  for (let k = 0; k < 6; k++)
    p.poly(
      [
        [S(5 - k * 0.3), S(16 + k * 7)],
        [S(15 + k * 0.3), S(16 + k * 7)],
        [S(15 + (k + 1) * 0.3), S(23 + k * 7)],
        [S(5 - (k + 1) * 0.3), S(23 + k * 7)],
      ],
      k % 2 ? WILD.white : WILD.red,
      { box: [S(3), S(16), S(14), S(44)], form: 'cylV' },
    );
  p.rect(S(4), S(13), S(12), S(3), WILD.dark, { form: 'flat', level: 1 });
  p.rect(S(6), S(6), S(8), S(7), ramp(lit ? '#fff0a0' : '#5a7a9a'), { form: 'flat', level: lit ? 4 : 2 });
  p.poly(
    [
      [S(4), S(6)],
      [S(10), S(1)],
      [S(16), S(6)],
    ],
    WILD.dark,
    { sep: true },
  );
  return p.toBuffer();
}

/** A weather vane on a post: the checkpoint. `lit` once touched (it spins and glows). */
export function paintVane(T: number, lit = false, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(32 * u));
  p.rect(S(7.4), S(8), S(1.4), S(24), WILD.metal, { form: 'cylV' });
  p.ellipse(S(8), S(30.6), S(4), S(1.4), WILD.stone, { form: 'flat', level: 1 });
  const turn = lit ? Math.cos(frame * 0.6) : 1;
  const metal = lit ? ramp('#f2c94c', { warm: 1.2 }) : WILD.metal;
  p.line(S(8 - 6 * turn), S(8), S(8 + 6 * turn), S(8), metal, 3);
  p.poly(
    [
      [S(8 + 6 * turn), S(8)],
      [S(8 + 4 * turn), S(6.4)],
      [S(8 + 4 * turn), S(9.6)],
    ],
    metal,
    { form: 'flat', level: 3 },
  );
  p.rect(S(8 - 6.4 * turn) - (turn < 0 ? S(2) : 0), S(5.6), S(2) * Math.abs(turn) + 1, S(4.6), metal, { form: 'flat', level: 2 });
  p.ellipse(S(8), S(8), S(1.4), S(1.4), metal, { sep: true });
  // N E S W letters are too small to read at this size; a little ball on top instead
  p.ellipse(S(8), S(3.4), S(1.2), S(1.2), lit ? ramp('#ffe27a') : WILD.metal, { sep: true });
  return p.toBuffer();
}

/** A droplet to collect: a small shining drop. Frames 0-3 shimmer. */
export function paintDroplet(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(8 * u), Math.round(10 * u));
  const bob = frame % 4 === 1 || frame % 4 === 2 ? -1 : 0;
  p.poly(
    [
      [S(4), S(1) + bob],
      [S(6.4), S(5.4) + bob],
      [S(1.6), S(5.4) + bob],
    ],
    SKY.drop,
    { box: [S(1), S(1), S(6), S(8)] },
  );
  p.ellipse(S(4), S(6) + bob, S(2.6), S(2.6), SKY.drop, { box: [S(1), S(1), S(6), S(8)] });
  p.pix(S(3), S(5) + bob, '#ffffff');
  if (frame % 4 === 0) p.pix(S(6.6), S(2), '#ffffff');
  return p.toBuffer();
}

export type CloudKind = 'cumulus' | 'grey' | 'storm';

/** A cloud platform `wTiles` wide (stood on from above). Grey clouds are full and heavy: only they can rain. */
export function paintCloud(T: number, wTiles = 3, kind: CloudKind = 'cumulus', frame = 0): PixelBuffer {
  const W = T * wTiles;
  const u = U(T);
  const H = Math.round((kind === 'storm' ? 30 : 16) * u);
  const b = new PixelBuffer(W, H);
  const r = kind === 'cumulus' ? SKY.cloud : kind === 'grey' ? SKY.grey : SKY.storm;
  const n = Math.max(3, Math.round(wTiles * 1.6));
  for (let k = 0; k < n; k++) {
    const cx = Math.round(((k + 0.5) / n) * W);
    const rad = Math.round((kind === 'storm' ? 10 : 6) * u * (k % 2 ? 1 : 1.25));
    const cy = H - rad - Math.round(u) + (k % 2 ? 0 : -Math.round(u * 1.4)) + (frame % 2 && k % 3 === 0 ? 1 : 0);
    for (let y = -rad; y <= rad; y++)
      for (let x = -rad; x <= rad; x++) {
        if (Math.hypot(x, y * 1.1) > rad) continue;
        const light = -x * 0.3 - y;
        const lv = light > rad * 0.5 ? 4 : light > -rad * 0.2 ? 3 : 2;
        b.set(cx + x, cy + y, r[lv]);
      }
  }
  for (let x = Math.round(2 * u); x < W - Math.round(2 * u); x++) {
    b.set(x, H - 1, r[1]);
    b.set(x, H - 2, r[2]);
  }
  return b;
}

/** A solid block of ice, `hTiles` tall (the Sun melts it). `melt` 0-1 shows it shrinking. */
export function paintIceBlock(T: number, hTiles = 2, melt = 0): PixelBuffer {
  const H = T * hTiles;
  const b = new PixelBuffer(T, H);
  const top = Math.round(H * melt);
  for (let y = top; y < H; y++)
    for (let x = 0; x < T; x++) {
      const edge = x === 0 || x === T - 1 || y === top;
      b.set(x, y, edge ? SKY.ice[y === top ? 4 : 1] : SKY.ice[(x * 3 + y * 5) % 19 === 0 ? 4 : x < T * 0.3 ? 3 : 2]);
    }
  if (melt > 0) for (let x = 2; x < T; x += 5) b.set(x, Math.min(H - 1, top + 2 + (x % 3)), SKY.drop[3]);
  return b;
}

/** A gust of wind (swirls), `wTiles` wide. Frames move the swirls along. */
export function paintGust(T: number, wTiles = 3, frame = 0): PixelBuffer {
  const W = T * wTiles;
  const u = U(T);
  const b = new PixelBuffer(W, Math.round(16 * u));
  for (let k = 0; k < 3; k++) {
    const y0 = Math.round((3 + k * 5) * u);
    for (let x = 0; x < W; x++) {
      const t = ((x + frame * 6 * u + k * 20) % W) / W;
      if (t > 0.65) continue;
      const y = y0 + Math.round(Math.sin(t * 10) * u);
      b.set(x, y, t > 0.55 ? 'rgba(232,248,240,0.5)' : 'rgba(232,248,240,0.9)');
    }
  }
  return b;
}

/** Rain (or snow) falling over an area w x h in pixels. Frames move it down. */
export function paintRain(w: number, h: number, frame = 0, snow = false): PixelBuffer {
  const b = new PixelBuffer(w, h);
  const n = Math.round((w * h) / (snow ? 260 : 140));
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i, 1, 21) * w);
    const y = Math.floor((hash(i, 2, 21) * h + frame * (snow ? 1.5 : 6)) % h);
    if (snow) {
      const dx = Math.round(Math.sin(frame * 0.2 + i) * 1.5);
      b.set(x + dx, y, '#ffffff');
      b.set(x + dx + 1, y, '#e0f0ff');
    } else for (let k = 0; k < 5; k++) b.set(x - Math.floor(k / 3), (y + k) % h, k < 2 ? '#a8d8f2' : '#6ab8e8');
  }
  return b;
}

/** A lightning bolt `h` pixels tall (seed changes its shape). */
export function paintBolt(h: number, seed = 0): PixelBuffer {
  const w = Math.round(h * 0.4);
  const b = new PixelBuffer(w, h);
  let x = w / 2;
  for (let y = 0; y < h; y++) {
    if (y % 8 === 0) x += (hash(y, seed, 31) - 0.5) * 10;
    x = Math.max(2, Math.min(w - 3, x));
    for (let k = -1; k <= 1; k++) b.set(Math.round(x) + k, y, k === 0 ? '#ffffff' : SKY.bolt);
    if (y % 23 === 11) for (let k = 0; k < 8; k++) b.set(Math.round(x) + k, y + k, SKY.bolt);
  }
  return b;
}

/** The thermometer on the screen (it says why snow or rain): -10 to 30 °C. */
export function paintThermometer(T: number, celsius: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(8 * u), Math.round(28 * u));
  p.rect(S(2.6), S(1), S(2.8), S(21), WILD.white, { form: 'cylV' });
  p.ellipse(S(4), S(24), S(3.2), S(3.2), WILD.white, { sep: true });
  const cold = celsius <= 0;
  const fluid = ramp(cold ? '#3a7ad8' : '#e0503a');
  const t = Math.max(0, Math.min(1, (celsius + 10) / 40));
  const top = S(20) - t * S(18);
  p.rect(S(3.4), top, S(1.2), S(22) - top, fluid, { form: 'flat', level: 2 });
  p.ellipse(S(4), S(24), S(2.2), S(2.2), fluid, { sep: true });
  // the freezing line at 0 °C
  const zero = S(20) - 0.25 * S(18);
  for (let x = 0; x < S(2.2); x++) p.pix(S(5.6) + x, zero, '#1a2a3a');
  return p.toBuffer();
}

/** A HUD button picture for each power. */
export function paintPowerIcon(T: number, power: Power): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(16 * u));
  if (power === 'sun') {
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      p.line(S(8) + Math.cos(a) * S(4.6), S(8) + Math.sin(a) * S(4.6), S(8) + Math.cos(a) * S(7), S(8) + Math.sin(a) * S(7), ramp('#ffc23a'), 3);
    }
    p.ellipse(S(8), S(8), S(4), S(4), ramp('#ffc23a', { warm: 1.3 }), { sep: true });
  } else if (power === 'cool') {
    for (const [x, y, r] of [
      [5, 9, 3.4],
      [9, 7, 4],
      [12, 10, 2.8],
    ])
      p.ellipse(S(x), S(y), S(r), S(r), SKY.cloud, { box: [S(1.6), S(3), S(13), S(10)] });
    for (let k = 0; k < 3; k++) p.line(S(4 + k * 4), S(13), S(3 + k * 4), S(15), ramp('#9ad8ff'), 3);
  } else if (power === 'wind') {
    const r = ramp('#8ad0b0');
    for (let k = 0; k < 3; k++) {
      const y = 4 + k * 4;
      for (let x = 1; x < 13 - k * 2; x++) p.dot(S(x), S(y) + Math.sin(x * 0.6) * u * 0.6, r, 3);
      p.dot(S(13 - k * 2), S(y - 1), r, 3);
    }
  } else if (power === 'cold') {
    const r = SKY.ice;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      p.line(S(8), S(8), S(8) + Math.cos(a) * S(6.4), S(8) + Math.sin(a) * S(6.4), r, 3);
      p.line(S(8) + 1, S(8), S(8) + Math.cos(a) * S(6.4) + 1, S(8) + Math.sin(a) * S(6.4), r, 2);
    }
  } else {
    for (const [x, y, r] of [
      [5, 6, 3.4],
      [9, 4.6, 4],
      [12, 7, 2.8],
    ])
      p.ellipse(S(x), S(y), S(r), S(r), SKY.grey, { box: [S(1.6), S(1), S(13), S(9)] });
    for (let k = 0; k < 4; k++) p.line(S(3.6 + k * 3), S(11), S(2.8 + k * 3), S(14.6), SKY.drop, 3);
  }
  return p.toBuffer();
}

/** The big storm cloud of the finale: a tall, dark cumulonimbus with an anvil top. */
export function paintStormCloud(T: number, frame = 0, flash = false): PixelBuffer {
  const u = U(T);
  const W = Math.round(120 * u);
  const H = Math.round(96 * u);
  const b = new PixelBuffer(W, H);
  const r = flash ? SKY.grey : SKY.storm;
  const blob = (cx: number, cy: number, rad: number) => {
    for (let y = -rad; y <= rad; y++)
      for (let x = -rad; x <= rad; x++) {
        if (Math.hypot(x, y) > rad) continue;
        const light = -x * 0.3 - y;
        b.set(cx + x, cy + y, r[light > rad * 0.5 ? 4 : light > -rad * 0.2 ? 3 : light > -rad * 0.7 ? 2 : 1]);
      }
  };
  const S = (v: number) => Math.round(v * u);
  // the anvil (flat, spread top), the tower, then the heavy base
  for (let k = 0; k < 9; k++) blob(S(14 + k * 11.5), S(14 + (k % 2) * 2), S(9));
  for (let k = 0; k < 4; k++) blob(S(46 + (k % 2) * 16), S(30 + k * 10), S(14));
  for (let k = 0; k < 7; k++) blob(S(16 + k * 15), S(68 + (k % 2) * 3), S(14));
  for (let x = S(6); x < W - S(6); x++) for (let y = S(80); y < S(84); y++) b.set(x, y, r[0]);
  // rain falling from the base
  for (let i = 0; i < 160; i++) {
    const x = S(8) + Math.floor(hash(i, 3, 41) * (W - S(16)));
    const y = S(84) + Math.floor((hash(i, 4, 41) * S(12) + frame * 3) % S(12));
    b.set(x, y, '#8ab0d0');
    b.set(x, y + 1, '#6a90b8');
  }
  // two eyes? No: a storm is weather, not a monster. It stays a cloud.
  return b;
}

/** The finish flag at the end of a level. */
export function paintFlag(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(32 * u));
  p.rect(S(3), S(2), S(1.4), S(30), WILD.metal, { form: 'cylV' });
  const wv = (x: number) => Math.sin(x * 0.6 + frame) * u;
  for (let x = 0; x < S(10); x++) for (let y = 0; y < S(7); y++) p.pix(S(4.4) + x, S(3) + y + wv(x), (Math.floor(x / S(2.5)) + Math.floor(y / S(2.33))) % 2 ? WILD.yellow[3] : SKY.teal[2]);
  p.ellipse(S(3.7), S(2), S(1.2), S(1.2), WILD.yellow, { sep: true });
  return p.toBuffer();
}

export { PixelBuffer };
