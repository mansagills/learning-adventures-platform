import type * as THREE from 'three';
import { PixelBuffer } from '../../art/pixel';
import { pixelTexture } from '../../world/sceneKit';
import { swapFrame } from '../figure';
import { placer } from '../place';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { billboard, glow, groundPiece, lightPool } from '../stage';
import type { SceneCtx, Setting, SettingScene, TimeOfDay } from '../types';
import { WILD, paintJeep, paintLabTent, paintLanternPost, paintTent } from './art';
import { paintCampfire } from './camp';
import { DIG, paintJacket, paintJuniper, paintMuseum, paintPebble, paintSage, paintSieve, paintSignPost, paintToolRack, paintWheelbarrow } from './dig-art';

/**
 * Wild Lands setting: the dig site (Fossil Dig Adventure), a field camp in
 * dry, striped badlands. A tall cliff shows its rock layers on the left; the
 * roped-off quarry, marked with grid strings, is in the middle; the lab tent
 * and the little field museum are on the right; a creek runs along the
 * bottom past a flat rock slab with dinosaur footprints. Tents, a jeep, a
 * campfire, sagebrush and junipers.
 *
 * Day: sun-baked and dusty under a hot pale sky. Dusk: the cliffs glow
 * orange, the sky turns purple and fills with stars, and the lanterns, the
 * campfire and the museum's windows light up.
 *
 * In look development: kept out of the shared settings list (index.ts).
 */

const U = (T: number) => T / 16;
export const DIG_LAYOUT = { w: 30, h: 18, floorTop: 3 } as const;
const L = DIG_LAYOUT;

/** The quarry pit (tiles). */
export const QUARRY = { x0: 9.6, y0: 8.4, x1: 15.6, y1: 11.4 } as const;
/** The footprint slab by the creek (tiles). */
export const SLAB = { x0: 18.2, y0: 12.6, x1: 25.4, y1: 14.4 } as const;
/** Where the creek's near bank is, at tile x. */
const creekTop = (x: number) => 15 + Math.sin(x / 3.4) * 0.3 + Math.sin(x / 1.2) * 0.1;
const creekBottom = (x: number) => creekTop(x) + 1.3 + Math.sin(x / 2.1 + 1) * 0.2;

/** Where the people and the stations are (tiles). */
export const DIG_SPOTS = {
  player: { x: 18.6, y: 10.8 },
  host: { x: 13, y: 12.2 },
  hana: { x: 6.4, y: 8.4 },
  sam: { x: 21.6, y: 7.2 },
  tala: { x: 21.4, y: 12.1 },
  pebble: { x: 15.2, y: 12.4 },
  cliff: { x: 5.6, y: 7.2 },
  quarry: { x: 12.6, y: 9.9 },
  lab: { x: 21.6, y: 6.1 },
  museum: { x: 26.4, y: 6.4 },
  trackway: { x: 21.8, y: 13.5 },
  fire: { x: 18.8, y: 8.6 },
} as const;

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

/** Is tile point (tx, ty) on a footpath? */
function onPath(tx: number, ty: number): boolean {
  // the main path from the cliff past the quarry to the museum
  if (tx > 9.4 && tx < 28 && Math.abs(ty - (7.4 + Math.sin(tx / 2.6) * 0.3)) < 0.45) return true;
  // and along the foot of the cliff
  if (tx > 2 && tx < 9.6 && Math.abs(ty - (8.9 + Math.sin(tx / 1.8) * 0.15)) < 0.42) return true;
  // down from the camp to the slab
  if (Math.abs(tx - (19.4 + Math.sin(ty) * 0.2)) < 0.42 && ty > 7.4 && ty < 12.8) return true;
  return false;
}

// ------------------------------------------------------------------ the ground

/** The dig site's ground: dusty clay, footpaths, the quarry with its grid strings, the footprint slab and the creek. */
export function paintDigGround(T: number): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  const Q = QUARRY;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const tx = x / T;
      const ty = y / T;
      if (ty < L.floorTop) {
        p.dot(x, y, DIG.clay, 1);
        continue;
      }
      // the creek: shallow water over pebbles, with a muddy edge
      if (ty > creekTop(tx) && ty < creekBottom(tx)) {
        const d = Math.min(ty - creekTop(tx), creekBottom(tx) - ty);
        let lv = d < 0.12 ? 4 : d < 0.4 ? 3 : 2;
        if (hash(x >> 1, y >> 1, 41) < 0.05) lv = 1;
        if (Math.sin(x / (4 * u) + Math.sin(y / (3 * u)) * 2) > 0.95) lv = 4;
        p.dot(x, y, DIG.creek, lv);
        continue;
      }
      if (ty > creekBottom(tx)) {
        // the far bank: dry grass
        p.dot(x, y, DIG.sage, noise(x, y, 6 * u, 2) > 0.6 ? 3 : 2);
        continue;
      }
      if (ty > creekTop(tx) - 0.35) {
        p.dot(x, y, DIG.mudflat, (x + y) % 3 ? 2 : 1);
        continue;
      }
      // the quarry: dug down into darker rock, with a lit top edge and a shadowed far wall
      if (tx > Q.x0 && tx < Q.x1 && ty > Q.y0 && ty < Q.y1) {
        const inTop = ty < Q.y0 + 0.35;
        const inLeft = tx < Q.x0 + 0.2;
        let lv = inTop ? 1 : inLeft ? 1 : noise(x, y, 4 * u, 13) > 0.62 ? 3 : 2;
        if (hash(x >> 1, y >> 1, 15) < 0.02) lv = 4;
        p.dot(x, y, inTop ? DIG.rust : DIG.clay, lv);
        continue;
      }
      // the footprint slab: flat gray-tan rock with cracks
      if (tx > SLAB.x0 && tx < SLAB.x1 && ty > SLAB.y0 && ty < SLAB.y1 + Math.sin(tx * 2) * 0.1) {
        let lv = noise(x, y, 5 * u, 17) > 0.6 ? 3 : 2;
        if (Math.abs(Math.sin(tx * 1.7 + ty * 3)) < 0.03) lv = 1;
        p.dot(x, y, DIG.ash, lv);
        continue;
      }
      if (onPath(tx, ty)) {
        p.dot(x, y, DIG.cream, noise(x, y, 5 * u, 5) > 0.7 ? 3 : 2);
        continue;
      }
      // dusty clay: tan with rusty patches, little pebbles and dry cracks
      const n = noise(x, y, 22 * u, 1);
      const r: Ramp = n > 0.68 || (n > 0.64 && (x + y) % 2) ? DIG.rust : DIG.dust;
      let lv = 2;
      const sun = noise(x, y, 7 * u, 21);
      if (sun > 0.74 || (sun > 0.7 && (x + y) % 2)) lv = 3;
      if (hash(x, y, 7) < 0.012) lv = 1;
      if (hash(x >> 1, y >> 1, 8) < 0.006) lv = 4;
      p.dot(x, y, r, lv);
    }
  // the quarry's grid strings (one square per tile), and its pegs
  for (let gx = Math.ceil(Q.x0); gx < Q.x1; gx++) for (let y = Math.floor(Q.y0 * T); y < Q.y1 * T; y++) if (y % 2 === 0) p.pix(gx * T, y, DIG.string);
  for (let gy = Math.ceil(Q.y0); gy < Q.y1; gy++) for (let x = Math.floor(Q.x0 * T); x < Q.x1 * T; x++) if (x % 2 === 0) p.pix(x, gy * T, DIG.string);
  for (const [x, y] of [
    [Q.x0, Q.y0],
    [Q.x1, Q.y0],
    [Q.x0, Q.y1],
    [Q.x1, Q.y1],
  ])
    p.rect(x * T - u, y * T - 2 * u, 2 * u, 3 * u, WILD.wood, { sep: true });
  // bones showing in the quarry floor
  const bone = DIG.bone;
  p.capsule(11.2 * T, 10.4 * T, 12.6 * T, 9.9 * T, 1.6 * u, bone, { sep: true });
  p.ellipse(12.7 * T, 9.85 * T, 2.4 * u, 1.8 * u, bone, { sep: true });
  p.ellipse(14.4 * T, 10.6 * T, 3.4 * u, 2.2 * u, bone, { sep: true });
  p.ellipse(14.4 * T, 10.6 * T, 1.2 * u, 0.8 * u, DIG.bone2, { form: 'flat', level: 1 });
  // the trackway: three-toed prints walking across the slab, and big round prints crossing them
  const dk = ramp('#7a7066');
  for (let k = 0; k < 6; k++) {
    const x = (SLAB.x0 + 0.6 + k * 1.15) * T;
    const y = (13.1 + (k % 2) * 0.5) * T;
    p.ellipse(x, y + 1.5 * u, 2 * u, 1.6 * u, dk, { form: 'flat', level: 1 });
    for (const a of [-0.6, 0, 0.6]) p.capsule(x, y + u, x + Math.cos(a) * 4.2 * u, y + Math.sin(a) * 3 * u, 0.9 * u, dk, { form: 'flat', level: 1 });
  }
  for (let k = 0; k < 3; k++) p.ellipse((SLAB.x0 + 2 + k * 1.9) * T, (14 - k * 0.3) * T, 4 * u, 3.2 * u, dk, { form: 'flat', level: 2 });
  return p.toBuffer({ outline: false });
}

/** Sparkles of sunlight on the creek (day only), as a see-through layer. */
export function paintCreekShine(T: number, frame: number): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(hash(i, frame, 51) * W);
    const tx = x / T;
    const y = Math.floor((creekTop(tx) + 0.2 + hash(i, frame + 3, 51) * 0.9) * T);
    p.fillPix(x, y, Math.max(1, Math.round(2 * u)), Math.max(1, Math.round(u * 0.6)), '#ffffff');
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the backdrop

/**
 * Behind the dig: the sky and the badlands, rows of striped clay buttes with
 * flat tops and fluted sides (rust, cream, tan and gray bands). Day: a hot
 * pale sky with thin clouds and a hawk. Dusk: the buttes glow orange under a
 * purple sky full of stars, with the Moon rising.
 */
export function paintDigBackdrop(T: number, wTiles: number, hTiles: number, time: TimeOfDay, frame = 0): PixelBuffer {
  const u = U(T);
  const W = Math.round(wTiles * T);
  const H = Math.round(hTiles * T);
  const p = new Paint(W, H);
  const dusk = time === 'evening';
  const sky = dusk ? ['#1e1a48', '#2e2460', '#4a2e72', '#7a3a78', '#c25a6a', '#f08a5a'] : ['#5aa8e6', '#72b8ea', '#8ac6ee', '#a8d4ee', '#c8e2ee', '#ecead8'];
  const horizon = H - 0.3 * T;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = Math.min(1, y / horizon) * (sky.length - 1);
      let band = Math.floor(t);
      if (t - band > 0.6 && (x + y) % 2) band++;
      if (t - band > 0.85) band++;
      p.pix(x, y, sky[Math.min(sky.length - 1, band)]);
    }
  if (dusk) {
    for (let i = 0; i < W * H * 0.003; i++) {
      const x = Math.floor(hash(i, 1, 61) * W);
      const y = Math.floor(hash(i, 2, 61) * horizon * 0.7);
      p.pix(x, y, hash(i, 4, 61) > 0.7 && (frame + i) % 3 === 0 ? '#8a7ab8' : '#fff6e0');
    }
    // the Moon rising
    p.ellipse(W * 0.78, H * 0.22, 0.42 * T, 0.42 * T, ramp('#fff4cc'), { form: 'flat', level: 3 });
    p.ellipse(W * 0.78 - 0.12 * T, H * 0.22 - 0.08 * T, 0.1 * T, 0.1 * T, ramp('#e6d8a8'), { form: 'flat', level: 2 });
  } else {
    for (let c = 0; c < 5; c++) {
      const cx = ((hash(c, 1, 62) * W + frame * 2 * u) % (W + 4 * T)) - 2 * T;
      const cy = H * (0.08 + hash(c, 2, 62) * 0.22);
      const cw = (1.6 + hash(c, 3, 62)) * T;
      p.ellipse(cx, cy, cw, 0.14 * T, ramp('#ffffff'), { dither: true, bias: 0.4 });
    }
    // a hawk circling
    const hx = W * 0.4 + Math.cos(frame * 0.3) * 1.4 * T;
    const hy = H * 0.2 + Math.sin(frame * 0.3) * 0.4 * T;
    for (const [dx, dy] of [
      [-2, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, -1],
    ])
      p.fillPix(hx + dx * u, hy + dy * u, Math.ceil(u), Math.ceil(u), '#3a2a2a');
  }
  // three rows of buttes: far (hazy), middle, near (brightest, with clear stripes)
  const bands: Ramp[] = [DIG.rust, DIG.cream, DIG.tan, DIG.ash, DIG.rust, DIG.cream, DIG.clay];
  const haze = (r: Ramp, k: number): Ramp => r.map((c) => mixHex(c, dusk ? '#8a4a7a' : '#c8d8e6', k)) as unknown as Ramp;
  const rows: Array<[number, number, number, number]> = [
    // base height (tiles above the horizon), height of the tops, haze, seed
    [0.9, 1.7, 0.55, 3],
    [0.5, 1.4, 0.28, 5],
    [0, 1.1, 0, 7],
  ];
  for (const [base, tall, hz, seed] of rows) {
    for (let x = 0; x < W; x++) {
      // flat-topped buttes with steep sides, and lower rolling hills between them
      const k = noise(x, 0, 9 * T * 0.4, seed);
      const mesa = k > 0.55 ? 1 : k > 0.48 ? (k - 0.48) / 0.07 : 0;
      const hill = 0.2 + noise(x, 0, 2.2 * T, seed + 1) * 0.4;
      const top = horizon - (base + Math.max(hill, mesa * tall)) * T;
      for (let y = Math.floor(top); y < H; y++) {
        const depth = (y - top) / T;
        // horizontal stripes of colored clay, wavy, and the same height across the buttes (the layers line up)
        const bandH = 0.32;
        const yy = (horizon - y) / T + Math.sin(x / (14 * u)) * 0.05;
        const bi = Math.floor((yy + 10) / bandH) % bands.length;
        let r = bands[(bi + bands.length) % bands.length];
        if (hz) r = haze(r, hz);
        // fluted sides: little vertical gullies
        let lv = Math.sin(x / (2.2 * u) + Math.sin(y / (5 * u))) > 0.7 ? 1 : 2;
        if (depth < 0.12) lv = dusk ? 4 : 3;
        if (dusk && hz < 0.3 && lv >= 2) r = r.map((c) => mixHex(c, '#ff9a5a', 0.25)) as unknown as Ramp;
        p.dot(x, y, r, lv);
      }
    }
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the cliff wall (a standing prop)

/** The cliff's rock layers, bottom (oldest) first, with their share of the cliff's height. */
export const CLIFF_LAYERS: Array<{ id: string; r: Ramp; h: number }> = [
  { id: 'sea', r: DIG.seaRock, h: 0.22 },
  { id: 'swamp', r: DIG.swampRock, h: 0.18 },
  { id: 'river', r: DIG.riverRock, h: 0.26 },
  { id: 'ice', r: DIG.iceRock, h: 0.18 },
  { id: 'today', r: DIG.topsoil, h: 0.16 },
];

/**
 * The Cliff Wall: a tall face of rock layers, oldest at the bottom (a gray
 * sea layer with shells, dark swamp shale with a coal seam, rusty river
 * sandstone, Ice Age gravel and today's soil with sage on top). `wT` and `hT`
 * are in tiles.
 */
export function paintCliffFace(T: number, wT = 8, hT = 5.4, dusk = false): PixelBuffer {
  const u = U(T);
  const W = Math.round(wT * T);
  const H = Math.round(hT * T);
  const p = new Paint(W, H);
  const edge = (y: number) => 0.6 * T * Math.abs(Math.sin(y / (9 * u))) + 0.25 * T * hash(Math.floor(y / (3 * u)), 1, 91);
  for (let y = Math.round(0.5 * T); y < H; y++) {
    const fromBottom = (H - y) / (H - 0.5 * T);
    let acc = 0;
    let li = 0;
    for (; li < CLIFF_LAYERS.length - 1; li++) {
      acc += CLIFF_LAYERS[li].h;
      if (fromBottom < acc) break;
    }
    const layer = CLIFF_LAYERS[li];
    const l0 = edge(y);
    const r0 = W - edge(y + 31);
    for (let x = Math.floor(l0); x < r0; x++) {
      let lv = 2;
      if (Math.sin(x / (3 * u) + y / (11 * u)) > 0.86) lv = 1;
      if (x < l0 + 2 * u) lv = 1;
      if (x > r0 - 3 * u) lv = 3;
      // the coal seam in the swamp layer
      let r = layer.r;
      if (layer.id === 'swamp' && Math.abs(fromBottom - 0.31) < 0.025) r = DIG.coal;
      // thin bedding lines in each layer
      if ((y + Math.round(Math.sin(x / (9 * u)) * u)) % Math.round(4 * u) === 0) lv = Math.max(1, lv - 1);
      if (dusk) r = r.map((c) => mixHex(c, '#ff9a5a', 0.18)) as unknown as Ramp;
      p.dot(x, y, r, lv);
    }
  }
  // the grassy top with sage, and little things in the layers: shells low down, a fern print, a bone
  for (let x = Math.round(0.4 * T); x < W - 0.4 * T; x++) for (let y = Math.round(0.4 * T); y < 0.66 * T; y++) if (hash(x, y, 92) < 0.6) p.dot(x, y, DIG.sage, y < 0.5 * T ? 3 : 2);
  const sh = DIG.shell;
  for (let k = 0; k < 6; k++) p.ellipse(W * (0.18 + k * 0.12), H * (0.88 + (k % 2) * 0.04), 1.6 * u, 1.2 * u, sh, { sep: true });
  p.line(W * 0.3, H * 0.68, W * 0.36, H * 0.62, DIG.coal, 1);
  p.capsule(W * 0.62, H * 0.5, W * 0.72, H * 0.47, 1.2 * u, DIG.bone, { sep: true });
  // a crack (fault) running down through the layers on the right
  for (let y = Math.round(0.7 * T); y < H; y++) p.pix(W * 0.82 + Math.sin(y / (6 * u)) * u - (y / H) * 0.6 * T, y, '#3a2a24');
  return p.toBuffer();
}

// ------------------------------------------------------------------ the setting

export const DIG_SITE: Setting = {
  id: 'dig-site',
  world: 'wild-lands',
  name: 'The dig site',
  inspiredBy:
    'Real dinosaur digs in the badlands of the American West and Canada (such as Hell Creek in Montana and Dinosaur Provincial Park in Alberta): striped clay hills, a quarry marked with grid strings, plaster jackets, a field lab and a trackway of footprints by a creek. The valley’s rock layers are made up but true to life.',
  build: buildDigSite,
};

function buildDigSite(ctx: SceneCtx): SettingScene {
  const { lighting, px: T } = ctx;
  let time = ctx.time;
  const { add, prop } = placer(ctx);
  const leave = (part: string) => !!ctx.omit?.includes(part);
  const blocks: Array<{ x: number; y: number; w: number; h: number }> = [];
  const solid = (cv: HTMLCanvasElement, x: number, y: number, shadowW = 0, depth = 0.5) => {
    const w = cv.width / T;
    blocks.push({ x: x - w / 2 + 0.1, y: y - depth, w: Math.max(0.4, w - 0.2), h: depth });
    return prop(cv, x, y, shadowW);
  };

  add(groundPiece(lighting, T, paintDigGround(T).toCanvas(), 0, 0));
  const shineTex = [0, 1, 2].map((f) => pixelTexture(paintCreekShine(T, f).toCanvas()));
  const shine = add(groundPiece(lighting, T, paintCreekShine(T, 0).toCanvas(), 0, 0));
  shine.position.y = 0.012;
  shine.visible = time === 'day';
  const backFrames: Partial<Record<TimeOfDay, THREE.Texture[]>> = {};
  const backFor = (t: TimeOfDay) => (backFrames[t] ??= [0, 1, 2].map((f) => pixelTexture(paintDigBackdrop(T, L.w + 12, 9, t, f).toCanvas())));
  const back = add(billboard(null, T, paintDigBackdrop(T, L.w + 12, 9, time, 0).toCanvas(), L.w / 2, L.floorTop - 0.3));

  // the Cliff Wall (Hana's station), with its own dusk glow
  const cliffTex = { day: pixelTexture(paintCliffFace(T, 8.4, 4.2).toCanvas()), evening: pixelTexture(paintCliffFace(T, 8.4, 4.2, true).toCanvas()) };
  const cliff = solid(cliffTex[time === 'evening' ? 'evening' : 'day'].image as HTMLCanvasElement, DIG_SPOTS.cliff.x, DIG_SPOTS.cliff.y, 0, 0.8);

  // junipers and sagebrush
  for (const [x, y, s] of [
    [1.2, 7.6, 0],
    [11.2, 4.6, 1],
    [28.6, 9.6, 2],
    [2.4, 13.6, 1],
  ])
    solid(paintJuniper(T, s).toCanvas(), x, y, 1.6, 0.4);
  for (const [x, y, s] of [
    [3.4, 10.4, 0],
    [8.2, 13.4, 1],
    [16.4, 6.2, 2],
    [24.4, 8.4, 0],
    [27.6, 12.6, 1],
    [5.6, 11.6, 2],
    [17.2, 14.2, 0],
  ])
    solid(paintSage(T, s).toCanvas(), x, y, 0, 0.3);

  // the camp: tents, the lab tent (Sam's prep lab), the museum, the jeep
  solid(paintTent(T, 1).toCanvas(), 13.4, 5.2, 2.6, 1.2);
  solid(paintTent(T, 0).toCanvas(), 16.9, 4.7, 2.6, 1.2);
  solid(paintLabTent(T).toCanvas(), DIG_SPOTS.lab.x, DIG_SPOTS.lab.y, 3.6, 1.4);
  add(glow(lighting, T, Math.round(T * 2.2), '#ffd07a', DIG_SPOTS.lab.x, DIG_SPOTS.lab.y, 0.9, 0.55));
  const museumTex = { day: pixelTexture(paintMuseum(T, 0).toCanvas()), evening: pixelTexture(paintMuseum(T, 4, true).toCanvas()) };
  const museum = solid(museumTex[time === 'evening' ? 'evening' : 'day'].image as HTMLCanvasElement, DIG_SPOTS.museum.x, DIG_SPOTS.museum.y, 4, 1.4);
  add(glow(lighting, T, Math.round(T * 3), '#ffd07a', DIG_SPOTS.museum.x, DIG_SPOTS.museum.y, 1.2, 0.5));
  solid(paintJeep(T).toCanvas(), 26, 10.6, 2.8, 1);

  // the quarry's tools: the rack, the sieve, a wheelbarrow and two plaster jackets waiting to go to the lab
  solid(paintToolRack(T).toCanvas(), 8.6, 9.8, 1.4, 0.4);
  solid(paintSieve(T).toCanvas(), 16.8, 9.6, 1.4, 0.4);
  solid(paintWheelbarrow(T).toCanvas(), 16.6, 11.8, 1.6, 0.5);
  for (const [x, y, n] of [
    [8.4, 11.6, 7],
    [9.4, 12.2, 8],
  ])
    solid(paintJacket(T, n).toCanvas(), x, y, 1.2, 0.4);

  // the trackway sign by the slab
  solid(paintSignPost(T).toCanvas(), 17.6, 13.4, 0, 0.3);

  // lantern posts, warm at dusk
  for (const [x, y] of [
    [10.2, 7.0],
    [17.6, 7.0],
    [24.2, 7.2],
    [20.2, 11.6],
  ]) {
    solid(paintLanternPost(T).toCanvas(), x, y, 0, 0.3);
    add(glow(lighting, T, Math.round(T * 1.4), '#ffd07a', x + 0.2, y, 1.4, 0.8));
    add(lightPool(lighting, T, x + 0.2, y + 0.2, 1.3, '#ffc070', 0.35));
  }
  // the campfire
  const fireTex = [0, 1, 2, 3].map((f) => pixelTexture(paintCampfire(T, f, true).toCanvas()));
  const fire = leave('fire') ? null : solid(paintCampfire(T, 0, true).toCanvas(), DIG_SPOTS.fire.x, DIG_SPOTS.fire.y, 0, 0.6);
  if (fire) {
    add(glow(lighting, T, Math.round(T * 2.6), '#ffa040', DIG_SPOTS.fire.x, DIG_SPOTS.fire.y, 0.5, 0.85));
    add(lightPool(lighting, T, DIG_SPOTS.fire.x, DIG_SPOTS.fire.y, 2.4, '#ff9a40', 0.4));
  }

  // Pebble the dog (a game draws its own with omit: ['pebble'])
  const pebbleTex = [0, 1, 2, 3].map((f) => pixelTexture(paintPebble(T, f).toCanvas()));
  const pebble = leave('pebble') ? null : prop(paintPebble(T, 0).toCanvas(), DIG_SPOTS.pebble.x, DIG_SPOTS.pebble.y, 0.9);

  return {
    map: { w: L.w, h: L.h },
    focus: { x: 15, feet: 11, top: 0.6 },
    clear: time === 'evening' ? '#2a1e3a' : '#c8a070',
    walk: { x0: 1.2, y0: 5.4, x1: 28.6, y1: 14.6 },
    blocks,
    spots: { ...DIG_SPOTS },
    update(t, camX) {
      swapFrame(back, backFor(time)[Math.floor(t * 1.5) % 3]);
      swapFrame(shine, shineTex[Math.floor(t * 2) % 3]);
      if (fire) swapFrame(fire, fireTex[Math.floor(t * 8) % 4]);
      if (pebble) {
        // Pebble sniffs round the quarry's edge, wags, and sniffs again
        const ph = t % 6;
        swapFrame(pebble, pebbleTex[ph < 2 ? 2 : ph < 3 ? 1 : ph < 3.4 ? 0 : 2 + (Math.floor(t * 4) % 2)]);
      }
      back.position.x = L.w / 2 + (camX - L.w / 2) * 0.5;
    },
    setTime(t) {
      time = t;
      swapFrame(back, backFor(t)[0]);
      swapFrame(cliff, cliffTex[t]);
      swapFrame(museum, museumTex[t]);
      shine.visible = t === 'day';
    },
  };
}
