import { PixelBuffer } from '../../art/pixel';
import { pixelTexture } from '../../world/sceneKit';
import { swapFrame } from '../figure';
import { placer } from '../place';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { billboard, glow, groundPiece, lightPool } from '../stage';
import type { SceneCtx, Setting, SettingScene } from '../types';
import { STAR } from './art';
import { paintRover } from './planet';
import { paintPlanet } from './space-art';

/**
 * Solar System Explorer: the planet stops. The rocky planets get a small
 * patch of real ground to drive the probe's rover over (people could not
 * survive on Mercury or Venus, but robots have landed on Venus and Mars, and
 * a spacecraft has mapped all of Mercury). The giant planets have no ground
 * at all, so they get a cloud dive instead (`paintCloudDive`).
 *
 * Colors and features follow NASA pictures: Mars has rusty dust, dark rocks,
 * a butterscotch sky in the daytime and the broad shield volcano Olympus Mons;
 * Mercury has grey craters, cliffs, no air to make a blue sky (so the sky is
 * black even in the day), and a Sun that looks two to three times bigger than
 * it does from Earth (Mercury's path round the Sun is stretched, so it changes).
 */

const U = (T: number) => T / 16;
export const SURFACE_LAYOUT = { w: 24, h: 18, floorTop: 4 };
const L = SURFACE_LAYOUT;

export interface SurfaceLook {
  id: 'mars' | 'mercury' | 'venus' | 'moon';
  name: string;
  dust: Ramp;
  dust2: Ramp;
  rock: Ramp;
  /** Sky colors from the top down to the horizon. */
  sky: string[];
  /** How big the Sun looks, in tiles (radius). */
  sunR: number;
  sunAt: [number, number];
  stars: number;
  craters: number;
  /** Shape of the far horizon. */
  horizon: 'shield-volcano' | 'cliffs';
  far: Ramp;
  inspiredBy: string;
}

export const MARS_LOOK: SurfaceLook = {
  id: 'mars',
  name: 'Mars',
  dust: ramp('#c2643a'),
  dust2: ramp('#a8522f'),
  rock: ramp('#6e3a2a'),
  sky: ['#c8956a', '#d4a47a', '#ddb48a', '#e6c49c', '#ecd2ae'],
  sunR: 0.32,
  sunAt: [0.78, 0.58],
  stars: 0,
  craters: 3,
  horizon: 'shield-volcano',
  far: ramp('#b8704c', { spread: 0.5 }),
  inspiredBy: 'NASA rover pictures of Mars: rusty dust, dark rocks and a butterscotch daytime sky, with Olympus Mons on the horizon.',
};

export const MERCURY_LOOK: SurfaceLook = {
  id: 'mercury',
  name: 'Mercury',
  dust: ramp('#8f8a84'),
  dust2: ramp('#7a7570'),
  rock: ramp('#5e5a58'),
  sky: ['#04050c', '#060712', '#080a18', '#0a0c1c', '#0c0f22'],
  sunR: 1.05,
  sunAt: [0.66, 0.5],
  stars: 0.0015,
  craters: 9,
  horizon: 'cliffs',
  far: ramp('#6a6662', { spread: 0.5 }),
  inspiredBy: 'NASA MESSENGER pictures of Mercury: grey craters and long cliffs, no air (so a black sky), and a Sun two to three times bigger than from Earth.',
};

function blob(x: number, y: number, sc: number, seed: number): number {
  const xi = Math.floor(x / sc);
  const yi = Math.floor(y / sc);
  const fx = x / sc - xi;
  const fy = y / sc - yi;
  const s = (t: number) => t * t * (3 - 2 * t);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy);
}

/** The ground: dust with darker patches, pebbles and craters (more on Mercury, which has no air or weather to wear them away). */
export function paintSurfaceGround(T: number, look: SurfaceLook): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = blob(x, y, 3 * T, 3) * 0.7 + blob(x, y, T, 4) * 0.3;
      const dith = (x + y) % 2 ? 0.02 : -0.02;
      let lv = n + dith > 0.62 ? 3 : n + dith < 0.3 ? 1 : 2;
      if (look.id === 'mars' && Math.sin(x / (5 * u) + y / (2 * u) + Math.sin(y / (9 * u)) * 2) > 0.94 && lv === 2) lv = 3;
      p.dot(x, y, n > 0.5 ? look.dust : look.dust2, lv);
      if (hash(x >> 1, y >> 1, 9) < 0.008) p.dot(x, y, look.rock, 1);
    }
  for (let k = 0; k < look.craters; k++) {
    const cx = (1.5 + hash(k, 1, 51) * (L.w - 3)) * T;
    const cy = (L.floorTop + 1 + hash(k, 2, 51) * (L.h - L.floorTop - 2)) * T;
    const R0 = (0.5 + hash(k, 3, 51) * 1.1) * T;
    for (let y = Math.floor(cy - R0 * 1.2); y < cy + R0 * 1.2; y++)
      for (let x = Math.floor(cx - R0 * 1.2); x < cx + R0 * 1.2; x++) {
        const d = Math.hypot(x - cx, (y - cy) * 1.3) / R0;
        if (d > 1.15) continue;
        const lit = y < cy;
        if (d > 0.95) p.dot(x, y, look.dust, lit ? 1 : 4);
        else if (d > 0.8) p.dot(x, y, look.dust2, lit ? 0 : 3);
        else p.dot(x, y, look.dust2, 1);
      }
  }
  // rover tracks across the ground
  for (let x = 2 * T; x < 15 * T; x++) {
    const y = 12.2 * T + Math.sin(x / (40 * u)) * 0.4 * T;
    for (const off of [0, 0.7 * T]) if (Math.floor(x / (2 * u)) % 2) p.dot(x, y + off, look.dust2, 0);
  }
  return p.toBuffer({ outline: false });
}

/** The sky and the far horizon. */
export function paintSurfaceSky(T: number, look: SurfaceLook, wTiles: number, hTiles: number, frame = 0): PixelBuffer {
  const u = U(T);
  const W = Math.round(wTiles * T);
  const H = Math.round(hTiles * T);
  const p = new Paint(W, H);
  const horizon = H - 1.3 * T;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = Math.min(1, y / horizon) * (look.sky.length - 1);
      let band = Math.floor(t);
      if (t - band > 0.6 && (x + y) % 2) band++;
      p.pix(x, y, look.sky[Math.min(look.sky.length - 1, band)]);
    }
  for (let i = 0; i < W * H * look.stars; i++) {
    const tw = (frame + i) % 4 === 0;
    p.pix(hash(i, 1, 61) * W, hash(i, 2, 61) * horizon, tw ? '#3a3f60' : '#e6ecff');
  }
  // the far horizon
  for (let x = 0; x < W; x++) {
    let top: number;
    if (look.horizon === 'shield-volcano') {
      // Olympus Mons: so wide and gently sloped that from the ground it looks like a long, low hill
      const k = (x - W * 0.62) / (W * 0.3);
      top = horizon - 0.25 * T - Math.max(0, 1 - k * k) * 1.1 * T;
    } else {
      // Mercury's long cliffs (scarps), made as the planet shrank when its core cooled
      top = horizon - 0.3 * T - (Math.floor(x / (11 * T)) % 2 ? 0.6 * T : 0.2 * T) - Math.abs(Math.sin(x / (17 * u))) * 0.2 * T;
    }
    for (let y = Math.floor(top); y < H; y++) p.dot(x, y, look.far, y < top + 2 * u ? 3 : 2);
  }
  for (let x = 0; x < W; x++) {
    const top = horizon + 0.3 * T + Math.sin(x / (30 * u)) * 0.2 * T;
    for (let y = Math.floor(top); y < H; y++) p.dot(x, y, look.dust2, y < top + 2 * u ? 3 : 2);
  }
  const out = p.toBuffer({ outline: false });
  const sun = paintPlanet('sun', look.sunR * T, 0);
  out.blit(sun, Math.round(W * look.sunAt[0] - sun.w / 2), Math.round(H * look.sunAt[1] - sun.h / 2));
  if (look.id === 'mars') {
    // Mars's two little moons, Phobos and Deimos, faint in the day sky
    for (const [mx, my, r] of [
      [0.36, 0.5, 0.12],
      [0.5, 0.44, 0.07],
    ]) {
      const m = paintPlanet('moon', Math.max(1.5, r * T), 0);
      for (let i = 0; i < m.px.length; i++) if (m.px[i]) m.px[i] = mixHex(m.px[i]!, look.sky[1], 0.45);
      out.blit(m, Math.round(W * mx), Math.round(H * my));
    }
  }
  return out;
}

/** A boulder in the planet's own rock color. */
export function paintBoulder(T: number, r: Ramp, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(26 * u), Math.round(20 * u));
  p.poly(
    [
      [S(2), S(19)],
      [S(4), S(9)],
      [S(10), S(3 + (seed % 3))],
      [S(18), S(4)],
      [S(24), S(11)],
      [S(25), S(19)],
    ],
    r,
    { sep: true, form: 'sphere', box: [S(2), S(3), S(23), S(16)] },
  );
  for (let k = 0; k < 4; k++) p.dot(S(6 + k * 4), S(10 + (k % 2) * 4), r, 0);
  return p.toBuffer();
}

/** A glowing find on the ground: a rock sample, a fact card or a question (the three things to find at each stop). */
export function paintFind(T: number, kind: 'sample' | 'fact' | 'question', frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(22 * u));
  const c = kind === 'sample' ? STAR.lime : kind === 'fact' ? STAR.cyan : STAR.amber;
  const bob = frame % 2 ? 1 : 0;
  p.ellipse(S(8), S(20), S(5), S(1.6), c, { form: 'flat', level: 1 });
  if (kind === 'sample') {
    p.capsule(S(8), S(15 - bob), S(8), S(8 - bob), S(3), STAR.white, { form: 'cylV' });
    p.rect(S(5), S(8 - bob), S(6), S(2), c, { level: 3 });
    p.ellipse(S(8), S(13 - bob), S(1.6), S(1.6), ramp('#8f4630'), { form: 'sphere' });
  } else if (kind === 'fact') {
    p.rect(S(3), S(6 - bob), S(10), S(12), STAR.white, { form: 'cylV', box: [S(3), S(6), S(10), S(12)], sep: true });
    for (let k = 0; k < 3; k++) p.line(S(5), S(9 + k * 3 - bob), S(11), S(9 + k * 3 - bob), c, 2);
  } else {
    p.ellipse(S(8), S(11 - bob), S(5), S(5), c, { sep: true });
    // a question mark in pixels
    const q = ['.###.', '#...#', '...#.', '..#..', '.....', '..#..'];
    q.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && p.fillPix(S(5.5 + i), S(8 + j - bob), Math.max(1, Math.round(u)), Math.max(1, Math.round(u)), '#3a2a10')));
  }
  return p.toBuffer();
}

function surfaceSetting(look: SurfaceLook): Setting {
  return {
    id: `surface-${look.id}`,
    world: 'star-station',
    name: look.name,
    inspiredBy: look.inspiredBy,
    build: (ctx) => buildSurface(ctx, look),
  };
}

export const SURFACE_MARS = surfaceSetting(MARS_LOOK);
export const SURFACE_MERCURY = surfaceSetting(MERCURY_LOOK);

function buildSurface(ctx: SceneCtx, look: SurfaceLook): SettingScene {
  const { lighting, px: T } = ctx;
  const { add, prop } = placer(ctx);
  const blocks: Array<{ x: number; y: number; w: number; h: number }> = [];
  const solid = (cv: HTMLCanvasElement, x: number, y: number, shadowW = 0, depth = 0.5) => {
    const w = cv.width / T;
    blocks.push({ x: x - w / 2 + 0.1, y: y - depth, w: Math.max(0.4, w - 0.2), h: depth });
    return prop(cv, x, y, shadowW);
  };
  add(groundPiece(lighting, T, paintSurfaceGround(T, look).toCanvas(), 0, 0));
  const skyW = L.w + 12;
  const skyFrames = [0, 1].map((f) => pixelTexture(paintSurfaceSky(T, look, skyW, 9, f).toCanvas()));
  const sky = add(billboard(null, T, paintSurfaceSky(T, look, skyW, 9, 0).toCanvas(), L.w / 2, L.floorTop - 0.4));
  for (const [x, y, s] of [
    [3, 6, 0],
    [19.5, 6.5, 1],
    [11, 16.5, 2],
    [21.5, 15, 0],
    [6.5, 14.5, 1],
  ]) solid(paintBoulder(T, look.rock, s).toCanvas(), x, y, 1.4);
  // the three finds (a game draws its own with omit: ['finds'])
  const finds: Array<{ m: ReturnType<typeof prop>; tex: ReturnType<typeof pixelTexture>[] }> = [];
  if (!ctx.omit?.includes('finds'))
    for (const [kind, x, y] of [
      ['sample', 8.5, 8.5],
      ['fact', 17, 10.5],
      ['question', 13.5, 14.5],
    ] as const) {
      const tex = [0, 1].map((f) => pixelTexture(paintFind(T, kind, f).toCanvas()));
      const m = prop(paintFind(T, kind, 0).toCanvas(), x, y);
      const col = kind === 'sample' ? '#7dea8a' : kind === 'fact' ? '#4fd6ff' : '#ffb547';
      add(glow(lighting, T, Math.round(T * 1.4), col, x, y, 0.6, 0.6));
      add(lightPool(lighting, T, x, y, 0.9, col, 0.35));
      finds.push({ m, tex });
    }
  if (!ctx.omit?.includes('rover')) solid(paintRover(T).toCanvas(), 11.2, 11.4, 2.4, 0.8);
  return {
    map: { w: L.w, h: L.h },
    focus: { x: 12, feet: 11.4, top: -3.2 },
    clear: look.sky[0],
    walk: { x0: 1.2, y0: 4.9, x1: L.w - 1.2, y1: L.h - 0.6 },
    blocks,
    spots: { player: { x: 11.2, y: 11.4 }, host: { x: 12.6, y: 10.4 } },
    update(t, camX) {
      swapFrame(sky, skyFrames[Math.floor(t * 1.2) % 2]);
      finds.forEach((f, i) => swapFrame(f.m, f.tex[Math.floor(t * 2 + i) % 2]));
      sky.position.x = L.w / 2 + (camX - L.w / 2) * 0.5;
    },
  };
}

// ------------------------------------------------------------------ the giant planets: a cloud dive

/**
 * Diving into a giant planet's clouds (a flat pixel picture, W x H): there
 * is no solid ground, only deeper and deeper cloud. Bands stream sideways
 * (Jupiter's winds blow in opposite directions in neighbouring bands), the
 * light fades and warms with `depth` (0 at the cloud tops, 1 deep down), and
 * at depth there are lightning flashes, as NASA's Juno probe has seen.
 */
export function paintCloudDive(W: number, H: number, depth: number, frame = 0, planet: 'jupiter' | 'saturn' = 'jupiter'): PixelBuffer {
  const p = new Paint(W, H);
  const bands = planet === 'jupiter' ? ['#efdcb8', '#c98f60', '#e2bb8c', '#b27450', '#f2e4c6', '#d49e6e'] : ['#efe0b0', '#dcc488', '#e8d6a0', '#cdb47a'];
  const dark = '#2a1a22';
  const bh = H / 7;
  for (let y = 0; y < H; y++) {
    const yy = y + depth * H * 2.2;
    const bi = Math.floor(yy / bh);
    const dir = bi % 2 ? 1 : -1;
    const speed = 0.6 + (bi % 3) * 0.35;
    for (let x = 0; x < W; x++) {
      const xx = x + dir * frame * speed * 2;
      const wob = Math.sin(xx / 23 + bi) * bh * 0.25 + Math.sin(xx / 7 + bi * 3) * bh * 0.06;
      const b = Math.floor((yy + wob) / bh);
      let c = bands[((b % bands.length) + bands.length) % bands.length];
      // swirls along the band edges
      const edge = Math.abs(((yy + wob) % bh) - bh / 2) / (bh / 2);
      if (edge > 0.85 && hash(Math.floor(xx / 3), y >> 1, b) > 0.5) c = mixHex(c, '#ffffff', 0.25);
      // the deeper you go, the darker and redder it gets (less sunlight gets down)
      const shade = Math.min(0.85, depth * 0.8 + (y / H) * depth * 0.25);
      const dith = (x + y) % 2 ? 0.02 : -0.02;
      p.pix(x, y, mixHex(c, dark, Math.max(0, shade + dith)));
    }
  }
  // lightning deep down, now and then
  if (depth > 0.55 && frame % 9 < 2) {
    const lx = (hash(Math.floor(frame / 9), 1, 7) * 0.6 + 0.2) * W;
    let x = lx;
    for (let y = Math.floor(H * 0.55); y < H * 0.85; y++) {
      x += (hash(y, Math.floor(frame / 9), 3) - 0.5) * 3;
      p.pix(x, y, '#ffffff');
      p.pix(x + 1, y, '#cfe8ff');
    }
  }
  return p.toBuffer({ outline: false });
}
