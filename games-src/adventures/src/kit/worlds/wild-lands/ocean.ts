import { PixelBuffer } from '../../art/pixel';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { WILD, paintAnglerfish, paintClownfish, paintJelly, paintLanternfish, paintOctopus, paintRay, paintSub, paintTurtle } from './art';

/**
 * Wild Lands: the side view under the sea (Ocean Depth Diver's dives). A
 * coral reef on a sunny shelf near the surface, then a rock wall that drops
 * away into the deep. The water fades from bright turquoise to deep blue to
 * black as sunlight runs out. Animals live in their real zones, and below
 * the sunlight the only lights are the ones animals make (living light) and
 * the submarine's headlamp.
 *
 * A small picture, painted every frame and scaled up with crisp pixels (like
 * the cloud dive in Solar System Explorer). The view is centred on `depth`
 * (meters). Near the surface the screen shows about 60 m from top to bottom;
 * deeper down it shows more, so the long trip down does not take forever.
 */

export interface OceanZone {
  id: 'sunlight' | 'twilight' | 'midnight';
  name: string;
  /** Where the zone starts and ends (meters below the surface). */
  top: number;
  bottom: number;
  /** A good camera depth for showing the zone. */
  view: number;
}

/** The ocean's layers, as scientists name them. */
export const OCEAN_ZONES: OceanZone[] = [
  { id: 'sunlight', name: 'sunlight zone', top: 0, bottom: 200, view: 27 },
  { id: 'twilight', name: 'twilight zone', top: 200, bottom: 1000, view: 520 },
  {
    id: 'midnight',
    name: 'midnight zone',
    top: 1000,
    bottom: 4000,
    view: 1900,
  },
];

/** How many meters the screen shows, top to bottom, at this depth. */
export function viewSpan(depth: number): number {
  return Math.min(1100, Math.max(60, depth * 0.55));
}

/** The depth (meters) at screen row y. */
export function depthAtRow(y: number, H: number, depth: number): number {
  return depth + ((y - H / 2) / H) * viewSpan(depth);
}

/** The screen row of a depth (meters). */
export function rowOfDepth(m: number, H: number, depth: number): number {
  return H / 2 + ((m - depth) / viewSpan(depth)) * H;
}

/** How much sunlight reaches this depth (1 at the top, a little in the twilight zone, none in the midnight zone). */
export function sunlightAt(m: number): number {
  if (m <= 0) return 1;
  if (m < 200) return 1 - 0.86 * Math.pow(m / 200, 1.1);
  return Math.max(0, 0.14 * (1 - (m - 200) / 800));
}

// the water's color by depth: turquoise, blue, deep blue, navy, black
const WATER: Array<[number, string]> = [
  [0, '#5ad8e6'],
  [25, '#3ec0dc'],
  [70, '#2a9ad0'],
  [140, '#1f6fb4'],
  [220, '#1a4a8e'],
  [420, '#142e66'],
  [700, '#0c1a40'],
  [1000, '#070d24'],
  [1600, '#040814'],
];

/** The water color at depth m, in a few flat bands with a checkered edge (the 16-bit look). */
function waterAt(m: number, x: number, y: number): string {
  if (m <= WATER[0][0]) return WATER[0][1];
  for (let i = 1; i < WATER.length; i++) {
    const [d1, c1] = WATER[i];
    const [d0, c0] = WATER[i - 1];
    if (m < d1) {
      const t = (m - d0) / (d1 - d0);
      // two flat steps between stops, with a checkerboard where they meet
      const k = t < 0.45 ? 0 : t < 0.55 ? ((x + y) % 2 ? 0 : 0.5) : t < 0.95 ? 0.5 : (x + y) % 2 ? 0.5 : 1;
      return k === 0 ? c0 : k === 1 ? c1 : mixHex(c0, c1, 0.5);
    }
  }
  return WATER[WATER.length - 1][1];
}

// ------------------------------------------------------------------ reef pieces (cached sprites)

const cache = new Map<string, PixelBuffer>();
const once = (key: string, make: () => PixelBuffer) => {
  let b = cache.get(key);
  if (!b) cache.set(key, (b = make()));
  return b;
};

/** Branching coral (like staghorn coral). */
function branchCoral(r: Ramp, seed: number): PixelBuffer {
  return once(`branch${seed}${r[2]}`, () => {
    const p = new Paint(18, 16);
    const arm = (x: number, y: number, a: number, len: number, d: number) => {
      const x2 = x + Math.cos(a) * len;
      const y2 = y + Math.sin(a) * len;
      p.capsule(x, y, x2, y2, Math.max(0.8, 1.6 - d * 0.4), r, { sep: true });
      if (d < 2) {
        arm(x2, y2, a - 0.5 - hash(d, seed, 1) * 0.3, len * 0.7, d + 1);
        arm(x2, y2, a + 0.5 + hash(d, seed, 2) * 0.3, len * 0.7, d + 1);
      }
    };
    arm(9, 16, -Math.PI / 2, 6, 0);
    return p.toBuffer();
  });
}

/** A round brain coral with wiggly grooves. */
function brainCoral(r: Ramp): PixelBuffer {
  return once(`brain${r[2]}`, () => {
    const p = new Paint(16, 10);
    p.ellipse(8, 9, 7.5, 7, r, { sep: true, clip: (_x, y) => y < 10 });
    for (let y = 3; y < 10; y += 2) for (let x = 1; x < 16; x++) if (Math.sin(x * 0.9 + y) > 0.6) p.dot(x, y, r, 1);
    return p.toBuffer();
  });
}

/** A sea fan: a flat lacy fan on a short stalk. */
function seaFan(r: Ramp): PixelBuffer {
  return once(`fan${r[2]}`, () => {
    const p = new Paint(16, 18);
    p.ellipse(8, 8, 7, 7.5, r, { form: 'flat', level: 2 });
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI + (k / 6) * Math.PI;
      p.line(8, 17, 8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, r, 3);
    }
    for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) if (hash(x, y, 9) < 0.25) p.dot(x, y, r, 1);
    p.line(8, 12, 8, 18, r, 1);
    return p.toBuffer();
  });
}

/** A sea anemone, its arms swaying (frames 0-1). */
function anemone(frame: number): PixelBuffer {
  return once(`anem${frame % 2}`, () => {
    const p = new Paint(18, 12);
    const arms = ramp('#ff9ac8');
    for (let k = 0; k < 9; k++) {
      const x = 2 + k * 1.75;
      const sway = (frame % 2 ? 1 : -1) * (k % 2 ? 1 : 0.5);
      p.capsule(x, 9, x + sway, 2 + Math.abs(k - 4) * 0.6, 0.8, arms, {});
    }
    p.ellipse(9, 10.5, 7, 2, ramp('#c8507a'), { sep: true });
    return p.toBuffer();
  });
}

/** Seagrass or kelp, swaying (height in pixels). */
function kelp(h: number, frame: number, seed: number): PixelBuffer {
  return once(`kelp${h}${frame % 4}${seed % 3}`, () => {
    const p = new Paint(8, h);
    const g = seed % 2 ? WILD.leaf3 : WILD.moss;
    for (let y = 0; y < h; y++) {
      const k = 1 - y / h;
      const x = 4 + Math.sin(y / 4 + frame * 0.8 + seed) * 1.6 * k;
      p.dot(x, y, g, y % 5 === 0 ? 3 : 2);
      if (y % 6 === 3) p.dot(x + (seed % 2 ? 1 : -1), y, g, 3);
    }
    return p.toBuffer();
  });
}

const sprite = (key: string, make: () => PixelBuffer) => once(key, make);

// ------------------------------------------------------------------ the painter

export interface OceanOpts {
  /** Camera depth, in meters (the middle of the screen). */
  depth: number;
  frame?: number;
  /** The submarine, in screen pixels (its middle). Its headlamp comes on below 150 m. */
  sub?: { x: number; y: number; face: 'left' | 'right'; lamp?: boolean };
  /** Leave the animals out (a game draws its own). */
  noAnimals?: boolean;
}

/** A glowing point: living light, a lamp, a lure. */
interface Glow {
  x: number;
  y: number;
  r: number;
  c: string;
}

/** The ocean scene at one depth, W x H pixels. */
export function paintOcean(W: number, H: number, opts: OceanOpts): PixelBuffer {
  const { depth } = opts;
  const frame = opts.frame ?? 0;
  const out = new PixelBuffer(W, H);
  const rows = Array.from({ length: H }, (_, y) => depthAtRow(y, H, depth));
  const mOf = (y: number) => rows[Math.max(0, Math.min(H - 1, Math.round(y)))];
  const row = (m: number) => rowOfDepth(m, H, depth);
  const sea = W / 360;

  // the rock: the reef shelf near the top on the left, its edge dropping away and curving back into a wall that goes down into the deep
  const shelfEdge = W * 0.46;
  const shelfFloor = (x: number) => 30 + Math.sin(x / 11) * 2 + Math.sin(x / 4.3) * 0.8;
  const wallX = (m: number) => W * (0.12 + 0.035 * Math.sin(m / 41) + 0.02 * Math.sin(m / 13));
  const edgeAt = (m: number) => {
    const k = Math.min(1, Math.max(0, (m - 34) / 140));
    const ease = k * k * (3 - 2 * k);
    return shelfEdge + (wallX(m) - shelfEdge) * ease + Math.sin(m / 3.7) * 2 * sea + Math.sin(m / 9.1 + 2) * 1.5 * sea;
  };
  const isRock = (x: number, m: number) => m > shelfFloor(x) && x < edgeAt(m);
  const sun = sunlightAt(depth);

  // 1. water (and a sliver of sky above the surface), with sunbeams near the top
  for (let y = 0; y < H; y++) {
    const m = rows[y];
    for (let x = 0; x < W; x++) {
      if (m < 0) {
        out.set(x, y, mixHex('#cfeef6', '#a6dcef', Math.min(1, -m / 8)));
        continue;
      }
      if (isRock(x, m)) continue;
      let c = waterAt(m, x, y);
      // sunbeams: slanted lighter stripes that fade out by 120 m
      if (m < 120) {
        const beam = Math.sin((x + y * 0.45 + frame * 0.6) / (9 * sea)) + Math.sin((x * 0.7 - y * 0.2) / (23 * sea) + frame * 0.03);
        if (beam > 1.35 && (x + y) % 2 === 0) c = mixHex(c, '#e6fbff', 0.22 * (1 - m / 120));
      }
      out.set(x, y, c);
    }
  }
  // the surface: a wavy bright line with the sky above
  const sy = row(0);
  if (sy > -2 && sy < H)
    for (let x = 0; x < W; x++) {
      const yy = Math.round(sy + Math.sin(x / 6 + frame * 0.4) * 1.2);
      out.set(x, yy, '#ffffff');
      out.set(x, yy + 1, '#9cf0f8');
    }

  // 2. the rock: lumpy boulders with lit tops, dark cracks, a sandy top on the shelf and little sponges stuck to the wall
  const rock = ramp('#8a7a6a');
  const sponge = [WILD.orange[3], WILD.purple[3], WILD.yellow[3], WILD.pink[3]];
  const lump = (x: number, m: number) => {
    const sc = 10 * sea;
    // in screen pixels, but fixed to the rock (so the boulders move with it as the camera sinks)
    const yy = m * (H / viewSpan(depth));
    const cx = Math.floor(x / sc);
    const cy = Math.floor(yy / sc);
    let best = 9;
    let second = 9;
    for (let j = -1; j <= 1; j++)
      for (let i = -1; i <= 1; i++) {
        const px = (cx + i + hash(cx + i, cy + j, 41)) * sc;
        const py = (cy + j + hash(cx + i, cy + j, 42)) * sc;
        const d = Math.hypot(x - px, yy - py) / sc;
        if (d < best) {
          second = best;
          best = d;
        } else if (d < second) second = d;
      }
    return { edge: second - best, best, cell: hash(cx, cy, 45) };
  };
  for (let y = 0; y < H; y++) {
    const m = rows[y];
    for (let x = 0; x < W; x++) {
      if (!isRock(x, m)) continue;
      const { edge, best, cell } = lump(x, m);
      // each boulder has its own shade, a lit middle and a soft dark crack round it
      let lv = cell < 0.3 ? 1 : 2;
      if (best < 0.3 && cell > 0.15) lv++;
      if (edge < 0.05) lv = 0;
      else if (edge < 0.1 && (x + y) % 2) lv = Math.max(0, lv - 1);
      if (!isRock(x, mOf(y - 1)) || !isRock(x, mOf(y - 2))) lv = 3;
      if (!isRock(x + 1, m) || !isRock(x + 2, m)) lv = Math.min(lv, 1);
      let c = rock[lv];
      // the shelf's sandy top
      if (m < 40 && !isRock(x, mOf(y - 3))) c = WILD.sand[!isRock(x, mOf(y - 1)) ? 3 : 2];
      else if (lv >= 2 && hash(x >> 2, Math.floor(m * (H / viewSpan(depth))) >> 2, 43) < 0.04 && (x + y) % 3 !== 0)
        c = sponge[Math.floor(hash(x >> 2, Math.floor(m * (H / viewSpan(depth))) >> 2, 44) * 4)];
      out.set(x, y, c);
    }
  }

  const glows: Glow[] = [];
  const put = (b: PixelBuffer, x: number, y: number) => out.blit(b, Math.round(x - b.w / 2), Math.round(y - b.h));

  // 3. the reef on the shelf: corals, sea fans, an anemone with clownfish, seagrass
  const shelfY = (x: number) => row(shelfFloor(x));
  if (row(30) < H + 20 && row(30) > -20) {
    const corals: Array<[number, PixelBuffer]> = [
      [0.04, branchCoral(WILD.orange, 1)],
      [0.09, kelp(Math.round(24 * sea), frame, 1)],
      [0.13, brainCoral(WILD.yellow)],
      [0.18, seaFan(WILD.purple)],
      [0.22, kelp(Math.round(18 * sea), frame + 1, 2)],
      [0.26, anemone(Math.floor(frame / 4))],
      [0.31, branchCoral(WILD.pink, 2)],
      [0.35, brainCoral(ramp('#7ac08a'))],
      [0.39, kelp(Math.round(14 * sea), frame + 2, 3)],
      [0.42, branchCoral(WILD.purple, 3)],
    ];
    for (const [fx, b] of corals) put(b, fx * W, shelfY(fx * W) + 3);
    if (!opts.noAnimals) {
      const ax = 0.26 * W;
      const ay = shelfY(ax) - 6;
      for (let k = 0; k < 2; k++) {
        const fish = sprite(`clown${(frame + k) % 2}`, () => paintClownfish(1, (frame + k) % 2));
        const fx = ax + Math.sin(frame * 0.08 + k * 3) * 8 - 6;
        put(k ? fish.flipX() : fish, fx, ay - 4 - k * 5 + Math.sin(frame * 0.2 + k) * 1.5);
      }
      put(
        sprite(`octo${Math.floor(frame / 10) % 2}`, () => paintOctopus(1, Math.floor(frame / 10) % 2)),
        0.36 * W,
        shelfY(0.36 * W) - 6,
      );
    }
  }

  // 4. animals in their zones (positions in meters, moving across the screen)
  const swim = (m: number) => row(m) > -30 && row(m) < H + 30;
  if (!opts.noAnimals) {
    // sunlight zone: a school of little silver fish, a turtle, a ray
    if (swim(18))
      for (let i = 0; i < 18; i++) {
        const t = frame * 0.6 + i * 4;
        const x = ((W * 0.5 + i * 7 + t) % (W + 40)) - 20;
        const y = row(16 + Math.sin(i * 1.7) * 3) + Math.sin(t * 0.08 + i) * 3;
        out.set(x, y, '#e6f4ff');
        out.set(x + 1, y, '#bcd8ea');
        out.set(x - 1, y, '#7aa4c4');
      }
    if (swim(12)) {
      const f = Math.floor(frame / 5) % 3;
      put(
        sprite(`turtle${f}`, () => paintTurtle(1.2, f)),
        ((frame * 0.5) % (W + 60)) - 30,
        row(11),
      );
    }
    if (swim(55)) {
      const f = Math.floor(frame / 6) % 3;
      put(
        sprite(`ray${f}`, () => paintRay(1, f)),
        W - ((frame * 0.4) % (W + 60)) + 30,
        row(55),
      );
    }
    // twilight zone: lanternfish with glowing spots, and drifting jellies
    for (const [m, n, seed] of [
      [330, 6, 1],
      [520, 7, 2],
      [760, 6, 3],
    ] as const) {
      if (!swim(m)) continue;
      for (let i = 0; i < n; i++) {
        const f = (frame + i) % 2;
        const fish = sprite(`lantern${f}`, () => paintLanternfish(1.5, f));
        const x = ((W * hash(i, seed, 3) + frame * (0.5 + hash(i, seed, 4) * 0.4)) % (W + 30)) - 15;
        const y = row(m + (hash(i, seed, 5) - 0.5) * 50) + Math.sin(frame * 0.1 + i) * 2;
        put(fish, x, y);
        glows.push({ x: x - 1, y: y - 2, r: 5, c: '#7ff0ff' });
      }
    }
    for (const [m, xk] of [
      [430, 0.74],
      [690, 0.3],
      [1250, 0.8],
    ] as const) {
      if (!swim(m)) continue;
      const f = Math.floor(frame / 6) % 2;
      const x = W * xk + Math.sin(frame * 0.03) * 10;
      const y = row(m) + Math.sin(frame * 0.05) * 6;
      put(
        sprite(`jelly${f}`, () => paintJelly(1.5, f)),
        x,
        y,
      );
      glows.push({ x, y: y - 14, r: 12, c: '#c8a8ff' });
    }
    // midnight zone: anglerfish, each with a glowing lure
    for (const [m, xk, dir] of [
      [1880, 0.78, -1],
      [2250, 0.3, 1],
      [3100, 0.6, 1],
    ] as const) {
      if (!swim(m)) continue;
      const f = Math.floor(frame / 8) % 2;
      const fish = sprite(`angler${f}`, () => paintAnglerfish(2, f));
      const b = dir > 0 ? fish : sprite(`anglerL${f}`, () => fish.flipX());
      const x = W * xk + Math.sin(frame * 0.02 + m) * 14;
      const y = row(m);
      put(b, x, y);
      glows.push({
        x: x + (dir > 0 ? 10 : -10),
        y: y - b.h + 3,
        r: 12,
        c: '#d8ff8a',
      });
    }
  }

  // 5. marine snow (bits of food drifting down) and living-light sparkles in the dark
  for (let i = 0; i < W * H * 0.004; i++) {
    const x = Math.floor(hash(i, 1, 91) * W);
    const y = Math.floor((hash(i, 2, 91) * H + frame * (0.3 + hash(i, 3, 91) * 0.3)) % H);
    const m = rows[y];
    if (m < 150 || isRock(x, m)) continue;
    out.set(x, y, m < 400 ? '#8ab0d0' : '#c8d8e8');
  }
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(hash(i, 4, 92) * W);
    const y = Math.floor(hash(i, 5, 92) * H);
    if (rows[y] < 500 || isRock(x, rows[y])) continue;
    if ((frame + i * 7) % 23 < 4) glows.push({ x, y, r: 3, c: '#5fd8ff' });
  }

  // 6. darkness: things fade into the water as sunlight runs out, except near living light and in the headlamp
  const sub = opts.sub;
  const lamp = !!sub && (sub.lamp ?? depth > 150);
  const dir = sub?.face === 'left' ? -1 : 1;
  const lampX = sub ? sub.x + dir * 16 : 0;
  const lampY = sub ? sub.y + 3 : 0;
  const R = W * 0.5;
  const lampAt = (x: number, y: number) => {
    if (!lamp) return 0;
    const dx = (x - lampX) * dir;
    if (dx <= 0) return 0;
    const dy = y - lampY;
    const d = Math.hypot(dx, dy);
    const ang = Math.abs(Math.atan2(dy, dx));
    if (ang > 0.36 || d > R) return 0;
    return (1 - d / R) * Math.sqrt(1 - ang / 0.36);
  };
  if (sun < 0.98)
    for (let y = 0; y < H; y++) {
      const m = rows[y];
      const amb = sunlightAt(m);
      for (let x = 0; x < W; x++) {
        const c = out.get(x, y);
        if (!c) continue;
        const water = isRock(x, m) ? null : waterAt(m, x, y);
        const l = Math.min(1, amb * 1.6 + lampAt(x, y) * 1.4);
        if (water && c === water) {
          // open water: the headlamp's beam shows as lighter, in three steps
          const b = lampAt(x, y);
          if (b > 0.02) {
            const step = b > 0.45 ? 0.32 : b > 0.18 ? 0.2 : (x + y) % 2 ? 0.1 : 0;
            if (step) out.set(x, y, mixHex(c, '#6ab8d8', step));
          }
          continue;
        }
        if (l >= 0.98) continue;
        const k = l > 0.66 ? 0.25 : l > 0.4 ? 0.5 : l > 0.2 ? 0.72 : l > 0.08 ? 0.86 : 0.95;
        out.set(x, y, mixHex(c, water ?? mixHex(waterAt(m, x, y), '#000000', 0.35), k));
      }
    }

  // 7. living light on top: soft halos and a bright middle
  for (const g of glows) {
    for (let y = Math.floor(g.y - g.r); y <= g.y + g.r; y++)
      for (let x = Math.floor(g.x - g.r); x <= g.x + g.r; x++) {
        const d = Math.hypot(x - g.x, y - g.y) / g.r;
        const c = out.get(x, y);
        if (d > 1 || !c) continue;
        const k = d < 0.25 ? 0.9 : d < 0.55 ? 0.45 : (x + y) % 2 ? 0.2 : 0;
        if (k) out.set(x, y, mixHex(c, g.c, k));
      }
  }

  // 8. the submarine on top, with its lamp
  if (sub) {
    const f = frame % 3;
    const b = sprite(`sub${sub.face}${f}${lamp}`, () => paintSub(16, sub.face, f, lamp));
    const dim = sun < 0.3 ? 0.35 : 0;
    for (let y = 0; y < b.h; y++)
      for (let x = 0; x < b.w; x++) {
        const c = b.get(x, y);
        if (!c) continue;
        const px = Math.round(sub.x - b.w / 2 + x);
        const py = Math.round(sub.y - b.h / 2 + y);
        out.set(px, py, dim ? mixHex(c, '#0c1a40', dim) : c);
      }
    if (lamp) {
      for (let y = -2; y <= 2; y++)
        for (let x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) < 3) out.set(lampX + x - dir * 2, lampY + y, mixHex(out.get(lampX + x - dir * 2, lampY + y) ?? '#000', '#fff6b0', 0.6));
    }
  }
  return out;
}
