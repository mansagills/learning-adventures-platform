import type * as THREE from 'three';
import { PixelBuffer } from '../../art/pixel';
import { K } from '../../render/pixelRenderer';
import { pixelTexture } from '../../world/sceneKit';
import { swapFrame } from '../figure';
import { placer } from '../place';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { billboard, glow, groundPiece } from '../stage';
import type { SceneCtx, Setting, SettingScene, TimeOfDay } from '../types';
import { paintAnimal, paintBarrelCactus, paintBeaverLodge, paintIce, paintLilyPads, paintPolarHut, paintSaguaro, type AnimalId } from './animal-art';
import { WILD, paintButterfly, paintFern, paintFrog, paintHeron, paintJaguar, paintMonkey, paintMushrooms, paintPalm, paintRainTree, paintSloth, paintToucan } from './art';

/**
 * Wild Lands settings for Animal Kingdom Match's four habitat trips (the S3
 * section of docs/GAMES_3D_UPGRADE_PLAN.md), each a walkable scene seen from
 * above at a slant like the field camp, by day and at dusk:
 *   `rainforest`: the forest floor under giant trees, a stream, ferns and
 *     glowing mushrooms, with the canopy and a rope bridge behind
 *   `desert`: red dunes and rocks, saguaros and a small water hole
 *   `polar`: the Arctic (north) on the left and Antarctica (south) on the
 *     right, with the sea between them, so polar bears and penguins are
 *     never seen together
 *   `wetland`: a pond with lily pads and a beaver lodge, reeds, and the
 *     river mouth opening into the sea, where a dolphin and a whale swim
 *
 * In look development: kept out of the shared settings list (index.ts).
 */

export const HABITAT_LAYOUT = { w: 30, h: 18, floorTop: 3 } as const;
const L = HABITAT_LAYOUT;

/** Smooth value noise (0-1) at scale `sc` pixels. */
function noise(x: number, y: number, sc: number, seed: number): number {
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

// ------------------------------------------------------------------ the shared backdrop

interface Ridge {
  /** Height above the horizon (tiles): base, plus up to `amp` from noise at scale `sc` (tiles). */
  base: number;
  amp: number;
  sc: number;
  seed: number;
  r: Ramp;
  /** Haze toward the sky color (0-1). */
  haze: number;
}

/** A sky (day or dusk) with rows of hills, dunes, trees or ice behind a setting. */
function paintBackdrop(
  T: number,
  wTiles: number,
  hTiles: number,
  time: TimeOfDay,
  frame: number,
  skies: { day: string[]; evening: string[] },
  ridges: Ridge[],
  extra?: (p: Paint, W: number, H: number, horizon: number) => void,
): PixelBuffer {
  const W = Math.round(wTiles * T);
  const H = Math.round(hTiles * T);
  const p = new Paint(W, H);
  const dusk = time === 'evening';
  const sky = dusk ? skies.evening : skies.day;
  const horizon = H - 0.3 * T;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = Math.min(1, y / horizon) * (sky.length - 1);
      let band = Math.floor(t);
      if (t - band > 0.6 && (x + y) % 2) band++;
      if (t - band > 0.85) band++;
      p.pix(x, y, sky[Math.min(sky.length - 1, band)]);
    }
  if (dusk)
    for (let i = 0; i < W * H * 0.003; i++) {
      const x = Math.floor(hash(i, 1, 71) * W);
      const y = Math.floor(hash(i, 2, 71) * horizon * 0.6);
      p.pix(x, y, (frame + i) % 4 === 0 ? '#8a7ab8' : '#fff6e0');
    }
  else
    for (let c = 0; c < 4; c++) {
      const cx = ((hash(c, 1, 72) * W + frame * 0.2 * T) % (W + 4 * T)) - 2 * T;
      p.ellipse(cx, H * (0.08 + hash(c, 2, 72) * 0.2), (1.4 + hash(c, 3, 72)) * T, 0.14 * T, ramp('#ffffff'), { dither: true, bias: 0.4 });
    }
  extra?.(p, W, H, horizon);
  const skyMid = sky[Math.floor(sky.length / 2)];
  for (const rg of ridges) {
    const r = rg.haze ? (rg.r.map((c) => mixHex(c, skyMid, rg.haze)) as unknown as Ramp) : rg.r;
    for (let x = 0; x < W; x++) {
      const top = horizon - (rg.base + noise(x, 0, rg.sc * T, rg.seed) * rg.amp) * T;
      for (let y = Math.floor(top); y < H; y++) p.dot(x, y, r, y - top < 0.12 * T ? (dusk ? 3 : 4) : (x >> 2) % 5 === 0 ? 1 : 2);
    }
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ building a habitat scene

type Painter = (T: number, frame: number) => PixelBuffer;

/** The legacy rainforest animals (art.ts) and the new ones (animal-art.ts), each as frames. */
function framesOf(who: AnimalId | 'toucan' | 'monkey' | 'sloth' | 'jaguar' | 'frog' | 'heron' | 'butterfly', T: number): HTMLCanvasElement[] {
  const old: Record<string, [Painter, number]> = {
    toucan: [paintToucan, 2],
    monkey: [paintMonkey, 2],
    sloth: [paintSloth, 2],
    jaguar: [paintJaguar, 2],
    frog: [paintFrog, 2],
    heron: [paintHeron, 2],
    butterfly: [paintButterfly, 3],
  };
  if (old[who]) {
    const [f, n] = old[who];
    return Array.from({ length: n }, (_, i) => f(T, i).toCanvas());
  }
  // big animals are drawn bigger, so they look right next to a child
  const big = BIG[who as AnimalId] ?? 1;
  return [0, 1, 2].map((i) => paintAnimal(who as AnimalId, Math.round(T * big), i).toCanvas());
}

/** Animals drawn larger than one tile per 16 design pixels (a camel is taller than a child). */
const BIG: Partial<Record<AnimalId, number>> = { camel: 1.5, 'polar-bear': 1.35, walrus: 1.2, whale: 1.5, crocodile: 1.15, tapir: 1.15 };

interface Placed {
  m: THREE.Mesh;
  tex: THREE.Texture[];
  ph: number;
  /** Seconds per frame cycle (the animal moves now and then, and blinks). */
  rate: number;
}

function sceneKit(ctx: SceneCtx) {
  const { lighting, px: T } = ctx;
  const { add, prop } = placer(ctx);
  const blocks: Array<{ x: number; y: number; w: number; h: number }> = [];
  const solid = (cv: HTMLCanvasElement, x: number, y: number, shadowW = 0, depth = 0.5) => {
    const w = cv.width / T;
    blocks.push({ x: x - w / 2 + 0.1, y: y - depth, w: Math.max(0.4, w - 0.2), h: depth });
    return prop(cv, x, y, shadowW);
  };
  const animals: Placed[] = [];
  /** An animal at tile (x, y), lifted `lift` tiles (for a bird on a branch or a sloth in a tree). */
  const animal = (who: Parameters<typeof framesOf>[0], x: number, y: number, lift = 0, shadowW = 0.8) => {
    const frames = framesOf(who, T);
    const m = prop(frames[0], x, y, lift ? 0 : shadowW, lift);
    animals.push({ m, tex: frames.map((c) => pixelTexture(c)), ph: hash(Math.round(x * 10), Math.round(y * 10), 5) * 7, rate: 3 + hash(Math.round(x), 3, 6) * 3 });
    return m;
  };
  const animate = (t: number) => {
    for (const a of animals) {
      const k = (t + a.ph) % a.rate;
      // mostly still, a short move now and then, and a blink (when the animal has a blink frame)
      const f = k > a.rate - 0.35 && a.tex.length > 2 ? 2 : k > a.rate - 1.2 ? 1 : 0;
      swapFrame(a.m, a.tex[Math.min(f, a.tex.length - 1)]);
    }
  };
  const fireflies = (n: number, x0: number, x1: number, y0: number, y1: number, color = '#f6ff8a', seed = 81) =>
    Array.from({ length: n }, (_, i) => {
      const x = x0 + hash(i, 1, seed) * (x1 - x0);
      const y = y0 + hash(i, 2, seed) * (y1 - y0);
      return { m: add(glow(lighting, T, Math.round(T * 0.5), color, x, y, 0.8, 0.95)), x, y, ph: hash(i, 3, seed) * 6.3, sp: 0.4 + hash(i, 4, seed) * 0.5 };
    });
  const flyFireflies = (list: ReturnType<typeof fireflies>, t: number, on: boolean) => {
    for (const ff of list) {
      ff.m.position.x = ff.x + Math.sin(t * ff.sp + ff.ph) * 0.9;
      ff.m.position.z = (ff.y + Math.cos(t * ff.sp * 0.7 + ff.ph) * 0.6) * K + 0.4;
      ff.m.position.y = (0.8 + Math.sin(t * ff.sp * 2 + ff.ph) * 0.35) * K;
      ff.m.visible = on && Math.sin(t * 1.7 + ff.ph * 3) > -0.4;
    }
  };
  return { T, lighting, add, prop, solid, blocks, animal, animate, fireflies, flyFireflies };
}

/** A backdrop billboard that redraws for day and dusk and drifts with the camera. */
function backdrop(ctx: SceneCtx, paint: (T: number, w: number, h: number, time: TimeOfDay, frame: number) => PixelBuffer) {
  const T = ctx.px;
  const frames: Partial<Record<TimeOfDay, THREE.Texture[]>> = {};
  const framesFor = (t: TimeOfDay) => (frames[t] ??= [0, 1, 2].map((f) => pixelTexture(paint(T, L.w + 12, 9, t, f).toCanvas())));
  const { add } = placer(ctx);
  const m = add(billboard(null, T, paint(T, L.w + 12, 9, ctx.time, 0).toCanvas(), L.w / 2, L.floorTop - 0.3));
  return {
    m,
    update: (time: TimeOfDay, t: number, camX: number) => {
      swapFrame(m, framesFor(time)[Math.floor(t * 1.5) % 3]);
      m.position.x = L.w / 2 + (camX - L.w / 2) * 0.5;
    },
  };
}

/** A ground painter: each pixel's ramp and shade from a function of its tile position. */
function paintGround(T: number, at: (tx: number, ty: number, x: number, y: number) => [Ramp, number]): PixelBuffer {
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const [r, lv] = at(x / T, y / T, x, y);
      p.dot(x, y, r, lv);
    }
  return p.toBuffer({ outline: false });
}

const spots = (o: Record<string, [number, number]>) => Object.fromEntries(Object.entries(o).map(([k, [x, y]]) => [k, { x, y }]));

// ------------------------------------------------------------------ the rainforest

const streamY = (x: number) => 12.4 + Math.sin(x / 3.4) * 0.6 + Math.sin(x / 1.3) * 0.15;

/** The rainforest floor: dark leaf litter and moss in the shade, sun flecks, roots and a stream. */
export function paintRainforestGround(T: number): PixelBuffer {
  return paintGround(T, (tx, ty, x, y) => {
    if (ty < L.floorTop) return [WILD.moss, 0];
    const s = streamY(tx);
    if (Math.abs(ty - s) < 0.55) return [WILD.river, Math.abs(ty - s) > 0.42 ? 1 : (x + y * 3) % 23 === 0 ? 4 : 2];
    const n = noise(x, y, 0.8 * T, 11);
    const fleck = noise(x, y, 0.5 * T, 12) > 0.72;
    const r = n > 0.62 ? WILD.moss : n > 0.4 ? ramp('#5a7a3a') : ramp('#6a5a3a');
    return [r, fleck ? 3 : hash(x >> 1, y >> 1, 13) < 0.06 ? 1 : 2];
  });
}

/** The canopy behind: layer on layer of treetops, and a rope bridge slung between two giant trees. */
export function paintRainforestBackdrop(T: number, wTiles: number, hTiles: number, time: TimeOfDay, frame = 0): PixelBuffer {
  return paintBackdrop(
    T,
    wTiles,
    hTiles,
    time,
    frame,
    { day: ['#7ac0e6', '#8acce8', '#a0d6e6', '#bfe2dc'], evening: ['#1e2448', '#2e2e5a', '#5a3a6a', '#a05a6a'] },
    [
      { base: 4.6, amp: 2.4, sc: 1.4, seed: 21, r: ramp('#2f7a4a'), haze: 0.45 },
      { base: 2.8, amp: 2.2, sc: 1.1, seed: 22, r: ramp('#3f9a4a'), haze: 0.22 },
      { base: 0.8, amp: 1.8, sc: 0.8, seed: 23, r: WILD.leaf, haze: 0 },
    ],
    (p, W, H, horizon) => {
      // two giant tree trunks and the rope bridge between them, high in the canopy
      for (const x of [W * 0.3, W * 0.7]) p.rect(x - 0.4 * T, horizon - 7.8 * T, 0.8 * T, 8 * T, WILD.bark, { form: 'cylV', box: [x - 0.4 * T, 0, 0.8 * T, H] });
      const y0 = horizon - 6.4 * T;
      for (let x = W * 0.3; x < W * 0.7; x += 2) {
        const k = (x - W * 0.3) / (W * 0.4);
        const sag = Math.sin(k * Math.PI) * 0.7 * T;
        p.pix(x, y0 + sag, '#5a3a24');
        p.pix(x, y0 + sag - 0.5 * T, '#7a5a3a');
        if (Math.round(x) % 10 < 2) for (let y = 0; y < 0.5 * T; y++) p.pix(x, y0 + sag - y, '#7a5a3a');
      }
    },
  );
}

export const RAINFOREST_SPOTS = spots({
  player: [14.6, 10.6],
  host: [12.6, 10.2],
  stream: [16, 12.4],
  canopy: [21.8, 6.4],
});

export const RAINFOREST: Setting = {
  id: 'rainforest',
  world: 'wild-lands',
  name: 'The rainforest',
  inspiredBy:
    'Tropical rainforests of Central and South America (such as Costa Rica and the Amazon): giant trees with buttress roots, ferns, a stream, and animals in every layer from the floor to the canopy.',
  build(ctx) {
    const k = sceneKit(ctx);
    const { T } = k;
    let time = ctx.time;
    k.add(groundPiece(k.lighting, T, paintRainforestGround(T).toCanvas(), 0, 0));
    const back = backdrop(ctx, paintRainforestBackdrop);
    // giant trees along the back and the sides, palms and ferns
    for (const [x, y, s] of [
      [3, 6.4, 0],
      [9.6, 5.6, 1],
      [21.4, 5.4, 2],
      [27.4, 6.8, 1],
      [1.8, 14.6, 2],
      [28.4, 14.8, 0],
    ])
      k.solid(paintRainTree(T, s).toCanvas(), x, y, 3, 0.8);
    for (const [x, y, s] of [
      [6.2, 9.6, 0],
      [24.6, 9.8, 1],
    ])
      k.solid(paintPalm(T, s).toCanvas(), x, y, 1.6, 0.4);
    for (const [x, y, s] of [
      [4.8, 11.6, 0],
      [8.4, 14.6, 1],
      [12.2, 7.4, 2],
      [17.6, 7.6, 0],
      [19.6, 15, 1],
      [25.8, 12.6, 2],
      [11, 15.4, 0],
    ])
      k.solid(paintFern(T, s).toCanvas(), x, y, 0, 0.3);
    const mush = [
      [7.4, 12.6],
      [23, 14.2],
      [15.6, 7.2],
    ].map(([x, y]) => {
      k.prop(paintMushrooms(T).toCanvas(), x, y);
      return k.add(glow(k.lighting, T, Math.round(T * 1.1), WILD.glow, x, y, 0.4, 0.7));
    });
    // the animals, each in its layer: the floor, the understory and the canopy
    k.animal('jaguar', 25.4, 15.2);
    k.animal('tapir', 6.6, 15.6);
    k.animal('dart-frog', 13.4, 13.6);
    k.animal('frog', 17.8, 11.4);
    k.animal('monkey', 9.8, 5.7, 2.4);
    k.animal('sloth', 21.2, 5.5, 3.2);
    k.animal('toucan', 3.2, 6.5, 3.4);
    const flies = [5, 11, 20].map((x, i) => ({ m: k.prop(paintButterfly(T, 0).toCanvas(), x, 9 + i, 0, 1.2), x, y: 9 + i, ph: i * 2 }));
    const flyTex = [0, 1, 2].map((f) => pixelTexture(paintButterfly(T, f).toCanvas()));
    const ff = k.fireflies(18, 3, 27, 6, 15);
    const setGlow = () => mush.forEach((m) => (m.visible = time === 'evening'));
    setGlow();
    return {
      map: { w: L.w, h: L.h },
      focus: { x: 15, feet: 11, top: 0.6 },
      clear: time === 'evening' ? '#141e2a' : '#2a5a3a',
      walk: { x0: 1, y0: 6.6, x1: 29, y1: 16.6 },
      blocks: k.blocks,
      spots: { ...RAINFOREST_SPOTS },
      update(t, camX) {
        back.update(time, t, camX);
        k.animate(t);
        for (const b of flies) {
          swapFrame(b.m, flyTex[Math.floor(t * 10 + b.ph) % 3]);
          b.m.position.x = b.x + Math.sin(t * 0.5 + b.ph) * 1.6;
          b.m.position.y = (1.2 + Math.sin(t * 2 + b.ph) * 0.3) * K;
        }
        k.flyFireflies(ff, t, time === 'evening');
      },
      setTime(t) {
        time = t;
        setGlow();
      },
    } satisfies SettingScene;
  },
};

// ------------------------------------------------------------------ the desert

const HOLE = { x: 22.4, y: 12.8, rx: 2.4, ry: 1.2 };

/** The desert floor: rippled sand, rocky red ground, and a small water hole. */
export function paintDesertGround(T: number): PixelBuffer {
  const sand = ramp('#e8c088', { warm: 1.2 });
  const red = ramp('#c8784a', { warm: 1.2 });
  return paintGround(T, (tx, ty, x, y) => {
    if (ty < L.floorTop) return [sand, 1];
    const hole = ((tx - HOLE.x) / HOLE.rx) ** 2 + ((ty - HOLE.y) / HOLE.ry) ** 2;
    if (hole < 1) return [WILD.river, hole > 0.75 ? 1 : (x + y * 3) % 19 === 0 ? 4 : 2];
    if (hole < 1.5) return [WILD.mud, 2];
    const rocky = noise(x, y, 1.6 * T, 31) > 0.62;
    const ripple = Math.sin(x / (0.22 * T) + Math.sin(y / (0.6 * T)) * 2) > 0.8;
    return [rocky ? red : sand, ripple && !rocky ? 3 : hash(x >> 1, y >> 1, 32) < 0.05 ? 1 : 2];
  });
}

/** Red mesas and dunes under a hot pale sky (purple and starry at dusk). */
export function paintDesertBackdrop(T: number, wTiles: number, hTiles: number, time: TimeOfDay, frame = 0): PixelBuffer {
  return paintBackdrop(
    T,
    wTiles,
    hTiles,
    time,
    frame,
    { day: ['#8ac0e6', '#a8d0ea', '#c8e0ea', '#f2ead0'], evening: ['#1e1a48', '#3a2a6a', '#7a3a78', '#e07a5a'] },
    [
      { base: 1.2, amp: 2.4, sc: 3.2, seed: 41, r: ramp('#c26a44', { warm: 1.2 }), haze: 0.5 },
      { base: 0.4, amp: 1.2, sc: 1.8, seed: 42, r: ramp('#e0a060', { warm: 1.2 }), haze: 0.2 },
      { base: 0, amp: 0.6, sc: 1.2, seed: 43, r: ramp('#ecc890'), haze: 0 },
    ],
    (p, W, H) => {
      // the sun (low and orange at dusk)
      const dusk = time === 'evening';
      p.ellipse(W * 0.82, H * (dusk ? 0.62 : 0.2), 0.7 * T, 0.7 * T, ramp(dusk ? '#ff9a5a' : '#fff6c0'), { form: 'flat', level: 3 });
    },
  );
}

export const DESERT_SPOTS = spots({
  player: [14.4, 10.8],
  host: [12.4, 10.6],
  hole: [HOLE.x, HOLE.y],
});

export const DESERT: Setting = {
  id: 'desert',
  world: 'wild-lands',
  name: 'The desert',
  inspiredBy:
    'Hot deserts such as the Sonoran Desert (saguaro cactus, roadrunners, tortoises, geckos) and the Sahara (dromedary camels, fennec foxes), shown together: deserts get very little rain, are hot by day and cool at night.',
  build(ctx) {
    const k = sceneKit(ctx);
    const { T } = k;
    let time = ctx.time;
    k.add(groundPiece(k.lighting, T, paintDesertGround(T).toCanvas(), 0, 0));
    const back = backdrop(ctx, paintDesertBackdrop);
    for (const [x, y, s] of [
      [3.6, 7.6, 0],
      [9.4, 6.6, 1],
      [19, 6.8, 2],
      [27, 8.4, 3],
      [5.4, 15.6, 1],
      [17.4, 15.8, 0],
    ])
      k.solid(paintSaguaro(T, s).toCanvas(), x, y, 1.2, 0.4);
    for (const [x, y] of [
      [7.4, 11.2],
      [12.6, 14.6],
      [25.4, 15.4],
      [15.6, 7.2],
    ])
      k.solid(paintBarrelCactus(T).toCanvas(), x, y, 0.6, 0.3);
    // the water hole's palms
    for (const [x, y, s] of [
      [24.8, 11.6, 0],
      [20.4, 11.4, 1],
    ])
      k.solid(paintPalm(T, s).toCanvas(), x, y, 1.6, 0.4);
    k.animal('camel', 9.4, 12.6, 0, 2);
    k.animal('fennec', 4.6, 12.6);
    k.animal('tortoise', 14.2, 13.4);
    k.animal('gecko', 18.6, 9.8);
    k.animal('roadrunner', 27.2, 13.4);
    return {
      map: { w: L.w, h: L.h },
      focus: { x: 15, feet: 11, top: 0.6 },
      clear: time === 'evening' ? '#2a1e3a' : '#e0b880',
      walk: { x0: 1, y0: 6.6, x1: 29, y1: 16.6 },
      blocks: k.blocks,
      spots: { ...DESERT_SPOTS },
      update(t, camX) {
        back.update(time, t, camX);
        k.animate(t);
      },
      setTime(t) {
        time = t;
      },
    } satisfies SettingScene;
  },
};

// ------------------------------------------------------------------ the poles

/** The sea between the Arctic (left) and Antarctica (right), at tile x. */
export const POLAR_SEA = { x0: 13.6, x1: 16.4 } as const;

/** Snow and sea ice on both sides, tundra tufts in the Arctic, and the dark sea between. */
export function paintPolarGround(T: number): PixelBuffer {
  const snow = ramp('#eef4fa', { cool: 1 });
  const ice = ramp('#cfe4f2', { cool: 1 });
  return paintGround(T, (tx, ty, x, y) => {
    if (ty < L.floorTop) return [snow, 3];
    const edge = Math.sin(ty * 1.3) * 0.2;
    if (tx > POLAR_SEA.x0 + edge && tx < POLAR_SEA.x1 + edge) return [ramp('#2a5a8a'), (x * 3 + y) % 29 === 0 ? 4 : tx < POLAR_SEA.x0 + 0.3 + edge || tx > POLAR_SEA.x1 - 0.3 + edge ? 3 : 2];
    const n = noise(x, y, 1.2 * T, 51);
    // the Arctic's tundra shows through the snow in patches near the bottom
    if (tx < POLAR_SEA.x0 && ty > 13 && n > 0.6) return [ramp('#8a9a6a'), hash(x, y, 52) < 0.2 ? 3 : 2];
    return [n > 0.55 ? ice : snow, hash(x >> 1, y >> 1, 53) < 0.04 ? 1 : n > 0.75 ? 3 : 2];
  });
}

/** Icebergs and white mountains; at dusk a green aurora ripples across the sky. */
export function paintPolarBackdrop(T: number, wTiles: number, hTiles: number, time: TimeOfDay, frame = 0): PixelBuffer {
  return paintBackdrop(
    T,
    wTiles,
    hTiles,
    time,
    frame,
    { day: ['#7ab0e0', '#9ac4e8', '#bcd8ee', '#dcecf4'], evening: ['#0e1430', '#18204a', '#24305a', '#3a4a7a'] },
    [
      { base: 0.6, amp: 1.4, sc: 2.2, seed: 61, r: ramp('#e8f0f8', { cool: 1 }), haze: 0.35 },
      { base: 0, amp: 0.8, sc: 1.4, seed: 62, r: ramp('#d0e4f2', { cool: 1 }), haze: 0 },
    ],
    (p, W, _H, horizon) => {
      if (time !== 'evening') return;
      // the aurora: wavy green curtains, low over the ice so they show above the mountains
      for (let x = 0; x < W; x++) {
        const y0 = horizon - (2.9 + Math.sin(x / (2.4 * T) + frame * 0.6) * 0.35) * T;
        for (let y = 0; y < 1.8 * T; y++) if ((x + y) % 2 === 0 || y < 0.9 * T) p.pix(x, y0 + y, mixHex('#7affb0', '#18204a', (y / (1.8 * T)) ** 1.5));
      }
    },
  );
}

export const POLAR_SPOTS = spots({
  player: [8, 10.8],
  host: [6, 10.4],
  north: [6.8, 9],
  south: [22.4, 9],
});

export const POLAR: Setting = {
  id: 'polar',
  world: 'wild-lands',
  name: 'The poles',
  inspiredBy:
    'The Arctic (polar bears, Arctic foxes, walruses and snowy owls on the sea ice and tundra of the far north) and Antarctica (emperor penguins and Weddell seals on the ice of the far south), shown side by side with the sea between them, because they are at opposite ends of the Earth.',
  build(ctx) {
    const k = sceneKit(ctx);
    const { T } = k;
    let time = ctx.time;
    k.add(groundPiece(k.lighting, T, paintPolarGround(T).toCanvas(), 0, 0));
    const back = backdrop(ctx, paintPolarBackdrop);
    // the sea between the two sides can't be walked on
    k.blocks.push({ x: POLAR_SEA.x0 - 0.2, y: 0, w: POLAR_SEA.x1 - POLAR_SEA.x0 + 0.4, h: L.h });
    // a research hut on each side, and ice
    const huts = [
      [4, 7.8],
      [25.6, 7.6],
    ].map(([x, y]) => k.solid(paintPolarHut(T).toCanvas(), x, y, 2.4, 0.8));
    const hutLit = pixelTexture(paintPolarHut(T, true).toCanvas());
    const hutDay = pixelTexture(paintPolarHut(T, false).toCanvas());
    for (const [x, y, kind] of [
      [10.6, 7.4, 0],
      [2.2, 14.6, 1],
      [19.4, 7.2, 0],
      [27.6, 14.8, 1],
      [12.2, 15.4, 1],
    ])
      k.solid(paintIce(T, kind).toCanvas(), x, y, 0, 0.4);
    // the north: the Arctic
    k.animal('polar-bear', 9.4, 13.6, 0, 2.4);
    k.animal('arctic-fox', 4.2, 12.4);
    k.animal('walrus', 11.6, 10.4, 0, 2);
    k.animal('snowy-owl', 2.4, 9.6);
    // the south: Antarctica
    for (const [x, y] of [
      [20, 11.6],
      [21.4, 12.2],
      [22.6, 11.4],
      [24, 12.4],
    ])
      k.animal('penguin', x, y);
    k.animal('seal', 25.6, 14.6, 0, 2);
    const setLights = () => huts.forEach((m) => swapFrame(m, time === 'evening' ? hutLit : hutDay));
    setLights();
    const lamps = [
      [4, 7.8],
      [25.6, 7.6],
    ].map(([x, y]) => k.add(glow(k.lighting, T, Math.round(T * 1.6), '#ffd07a', x, y, 0.9, 0.6)));
    const showLamps = () => lamps.forEach((m) => (m.visible = time === 'evening'));
    showLamps();
    return {
      map: { w: L.w, h: L.h },
      focus: { x: 15, feet: 11, top: 0.6 },
      clear: time === 'evening' ? '#0e1430' : '#bcd8ee',
      walk: { x0: 1, y0: 6.6, x1: 29, y1: 16.6 },
      blocks: k.blocks,
      spots: { ...POLAR_SPOTS },
      update(t, camX) {
        back.update(time, t, camX);
        k.animate(t);
      },
      setTime(t) {
        time = t;
        setLights();
        showLamps();
      },
    } satisfies SettingScene;
  },
};

// ------------------------------------------------------------------ the wetland and the sea

const POND = { x: 9.4, y: 11.6, rx: 4.6, ry: 2.2 };
/** Where the land gives way to the sea, at tile y (the sea is on the right). */
const shore = (y: number) => 20.6 + Math.sin(y / 2.2) * 0.4;

/** Marsh grass, a pond, the river running to the sea, the beach and the sea. */
export function paintWetlandGround(T: number): PixelBuffer {
  const marsh = ramp('#6aa84a', { cool: 0.6 });
  return paintGround(T, (tx, ty, x, y) => {
    if (ty < L.floorTop) return [WILD.moss, 0];
    const sea = shore(ty);
    if (tx > sea + 1.2) return [WILD.sea, (x + y * 3) % 31 === 0 ? 4 : tx < sea + 1.5 ? 3 : 2];
    if (tx > sea) return [WILD.sand, hash(x, y, 61) < 0.05 ? 1 : 2];
    const pond = ((tx - POND.x) / POND.rx) ** 2 + ((ty - POND.y) / POND.ry) ** 2;
    if (pond < 1) return [ramp('#3a8aa0'), pond > 0.8 ? 1 : (x * 3 + y) % 27 === 0 ? 4 : 2];
    if (pond < 1.25) return [WILD.mud, 2];
    // the river from the pond to the sea
    const ry = 13.6 + (tx - 14) * 0.08 + Math.sin(tx / 1.8) * 0.2;
    if (tx > 13.4 && Math.abs(ty - ry) < 0.5) return [WILD.river, Math.abs(ty - ry) > 0.38 ? 1 : 2];
    return [marsh, noise(x, y, 0.7 * T, 62) > 0.7 ? 3 : hash(x >> 1, y >> 1, 63) < 0.05 ? 1 : 2];
  });
}

/** Low green hills and the open sea; a whale's spout far out by day. */
export function paintWetlandBackdrop(T: number, wTiles: number, hTiles: number, time: TimeOfDay, frame = 0): PixelBuffer {
  return paintBackdrop(
    T,
    wTiles,
    hTiles,
    time,
    frame,
    { day: ['#6ab4e6', '#86c4ea', '#a6d4ee', '#cfe6ee'], evening: ['#1e1a48', '#2e2e5a', '#6a3a6a', '#d06a5a'] },
    [{ base: 0.4, amp: 1.4, sc: 2.4, seed: 71, r: ramp('#4a8a4a'), haze: 0.4 }],
    (p, W, H, horizon) => {
      // the sea on the right of the backdrop, with a whale's spout far out
      for (let x = Math.round(W * 0.6); x < W; x++) for (let y = Math.round(horizon - 0.5 * T); y < H; y++) p.dot(x, y, WILD.sea, (x + y) % 9 === 0 ? 3 : 2);
      if (time === 'day' && frame !== 1) for (let k = 0; k < 6; k++) p.pix(W * 0.82 + Math.sin(k) * 2, horizon - 0.6 * T - k * 2, '#f2f8fa');
    },
  );
}

export const WETLAND_SPOTS = spots({
  player: [15.6, 10.6],
  host: [14, 10.2],
  pond: [POND.x, POND.y],
  beach: [21.4, 9],
});

export const WETLAND: Setting = {
  id: 'wetland',
  world: 'wild-lands',
  name: 'The wetland and the sea',
  inspiredBy:
    'Freshwater wetlands and a river mouth on a warm coast (such as the Everglades and the Gulf Coast): a pond with lily pads, reeds, a beaver lodge, ducks, herons and crocodiles, and the salty sea beyond, with dolphins and a humpback whale. Fresh water and salt water are kept apart on purpose.',
  build(ctx) {
    const k = sceneKit(ctx);
    const { T } = k;
    let time = ctx.time;
    k.add(groundPiece(k.lighting, T, paintWetlandGround(T).toCanvas(), 0, 0));
    const back = backdrop(ctx, paintWetlandBackdrop);
    for (const [x, y, s] of [
      [7.4, 10.6, 0],
      [10.6, 12.2, 1],
      [8.6, 12.8, 2],
    ])
      k.add(groundPiece(k.lighting, T, paintLilyPads(T, s).toCanvas(), x - 1, y - 0.6)).position.y = 0.012;
    k.solid(paintBeaverLodge(T).toCanvas(), 12.6, 10.4, 2, 0.6);
    for (const [x, y, s] of [
      [2.4, 7.6, 0],
      [17.6, 6.8, 1],
      [2.4, 15.2, 2],
    ])
      k.solid(paintRainTree(T, s).toCanvas(), x, y, 3, 0.8);
    for (const [x, y, s] of [
      [4.6, 9.6, 0],
      [14.6, 15.2, 1],
      [6.4, 14.8, 2],
    ])
      k.solid(paintFern(T, s).toCanvas(), x, y, 0, 0.3);
    k.animal('beaver', 13.4, 12.2);
    k.animal('duck', 9.4, 11.2);
    k.animal('heron', 5.4, 12.2);
    k.animal('crocodile', 17, 14.4, 0, 2.4);
    k.animal('frog', 11.6, 13.6);
    k.animal('dolphin', 25.2, 11.4);
    k.animal('whale', 26.6, 15.2);
    // blue plankton glow in the sea at dusk, fireflies over the marsh
    const plankton = k.fireflies(14, 22, 29, 6, 16, '#7ad8ff', 91);
    const ff = k.fireflies(12, 2, 18, 7, 15);
    return {
      map: { w: L.w, h: L.h },
      focus: { x: 15, feet: 11, top: 0.6 },
      clear: time === 'evening' ? '#141e2a' : '#2f6a4a',
      walk: { x0: 1, y0: 6.6, x1: 21.6, y1: 16.6 },
      blocks: k.blocks,
      spots: { ...WETLAND_SPOTS },
      update(t, camX) {
        back.update(time, t, camX);
        k.animate(t);
        k.flyFireflies(ff, t, time === 'evening');
        k.flyFireflies(plankton, t * 0.5, time === 'evening');
      },
      setTime(t) {
        time = t;
      },
    } satisfies SettingScene;
  },
};

export const HABITAT_SETTINGS: Setting[] = [RAINFOREST, DESERT, POLAR, WETLAND];
