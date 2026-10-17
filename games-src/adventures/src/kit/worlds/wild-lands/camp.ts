import type * as THREE from 'three';
import { PixelBuffer } from '../../art/pixel';
import { K } from '../../render/pixelRenderer';
import { pixelTexture } from '../../world/sceneKit';
import { swapFrame } from '../figure';
import { placer } from '../place';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { billboard, glow, groundPiece, lightPool } from '../stage';
import type { SceneCtx, Setting, SettingScene, TimeOfDay } from '../types';
import {
  WILD,
  paintButterfly,
  paintFern,
  paintFrog,
  paintHeron,
  paintJaguar,
  paintJeep,
  paintLabTent,
  paintLanternPost,
  paintMonkey,
  paintMushrooms,
  paintPalm,
  paintRainTree,
  paintSloth,
  paintSub,
  paintSupplies,
  paintTent,
  paintToucan,
  paintTouchTank,
  paintWeatherMast,
  paintZoneChart,
} from './art';

/**
 * Wild Lands setting: Ranger Tala's field camp, the world's home base, where
 * a rainforest river meets the sea. Tents and a lab tent in a sunny
 * clearing, a touch tank, the ocean-zone chart, a weather mast and the jeep;
 * a boardwalk runs over the sand to the dock, where the little submarine
 * floats. Rain trees and palms round the edge, a river along the bottom with
 * a heron in the shallows and a calm jaguar on the far bank.
 *
 * Day: dappled sunlight on the grass. Dusk: the lanterns and the campfire
 * glow, fireflies drift over the clearing, mushrooms glow in the shade and
 * the sea sparkles blue with plankton (the world's living light).
 *
 * In look development: kept out of the shared settings list (index.ts).
 */

const U = (T: number) => T / 16;
export const CAMP_LAYOUT = { w: 30, h: 18, floorTop: 3 } as const;
const L = CAMP_LAYOUT;

/** Where the river's near bank is, at tile x (the river runs along the bottom to the sea). */
const riverTop = (x: number) => 14.3 + Math.sin(x / 3.1) * 0.35 + Math.sin(x / 1.3) * 0.12;
/** Where the river's far bank is. */
const riverBottom = (x: number) => riverTop(x) + 2.3 + Math.sin(x / 2.3 + 1) * 0.25;
/** Where the sand gives way to the sea, at tile y (the sea is on the right). */
const seaEdge = (y: number) => 23.6 + Math.sin(y / 2.2) * 0.4 + Math.sin(y / 0.9) * 0.12;
/** Where the grass gives way to the sand. */
const sandEdge = (y: number) => 20.6 + Math.sin(y / 1.7 + 1) * 0.5;
/** The boardwalk to the dock (tile rows) and how far out the dock reaches. */
const WALK = { y0: 9.1, y1: 10.1, x0: 18.6, x1: 28.4 };

/** Where the people and the camp's stations stand (tiles). */
export const CAMP_SPOTS = {
  player: { x: 13.2, y: 11 },
  host: { x: 14.8, y: 10.8 },
  lab: { x: 10.4, y: 8.3 },
  labTent: { x: 10.4, y: 7.2 },
  tank: { x: 15.4, y: 8.6 },
  chart: { x: 19.2, y: 7.6 },
  dock: { x: 25.8, y: 9.6 },
  sub: { x: 27.4, y: 11.8 },
  fire: { x: 13, y: 12.5 },
} as const;

// ------------------------------------------------------------------ helpers

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

/** Is pixel (x, y) in the camp's dirt clearing or on a path? */
function onDirt(tx: number, ty: number): boolean {
  // the clearing in the middle
  if (((tx - 12.8) / 4.6) ** 2 + ((ty - 10.6) / 2.9) ** 2 < 1) return true;
  // the path to the boardwalk
  if (tx > 15 && tx < 19.2 && Math.abs(ty - (9.6 + Math.sin(tx / 1.6) * 0.15)) < 0.55) return true;
  // the path to the tents and the jeep
  if (tx > 2.4 && tx < 9 && Math.abs(ty - (10.4 - (tx - 9) * 0.12)) < 0.5) return true;
  if (Math.abs(tx - 10.4) < 0.6 && ty > 7.4 && ty < 9) return true;
  return false;
}

// ------------------------------------------------------------------ the ground

/** The camp's ground: grass with dappled sunlight, dirt paths, the river, the sand, the sea and the boardwalk. */
export function paintCampGround(T: number): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  const A = WILD;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const tx = x / T;
      const ty = y / T;
      if (ty < L.floorTop) {
        p.dot(x, y, A.moss, 0);
        continue;
      }
      const sea = tx > seaEdge(ty);
      const river = ty > riverTop(tx) && ty < riverBottom(tx);
      if (sea || river) {
        // water: deeper away from the shore, with ripple lines
        const depth = sea ? tx - seaEdge(ty) : Math.min(ty - riverTop(tx), (riverBottom(tx) - ty) * 1.5);
        const r: Ramp = sea ? A.sea : A.river;
        let lv = depth < 0.25 ? 4 : depth < 0.8 ? 3 : 2;
        if (depth > 2.4) lv = 1;
        if (lv >= 2 && lv < 4 && Math.sin(x / (5 * u) + Math.sin(y / (4 * u)) * 2) > 0.94) lv++;
        if (depth > 0.8 && (x + y) % 2 && depth < 0.95) lv = 3;
        p.dot(x, y, r, lv);
        continue;
      }
      const farBank = ty >= riverBottom(tx);
      if (tx > sandEdge(ty) || (ty > riverTop(tx) - 0.35 && ty < riverTop(tx) + 1 && tx > 15) || (farBank && ty < riverBottom(tx) + 0.3)) {
        // sand with little shells and a damp edge by the water
        const damp = tx > seaEdge(ty) - 0.35 || (ty > riverTop(tx) - 0.2 && !farBank) || (farBank && ty < riverBottom(tx) + 0.12);
        let lv = damp ? 1 : 2 + (noise(x, y, 6 * u, 9) > 0.62 ? 1 : 0);
        if (hash(x, y, 77) < 0.004) lv = 4;
        p.dot(x, y, A.sand, lv);
        continue;
      }
      if (onDirt(tx, ty)) {
        let lv = 2;
        const n = noise(x, y, 6 * u, 3);
        if (n > 0.72 || (n > 0.66 && (x + y) % 2)) lv = 3;
        if (hash(x >> 1, y >> 1, 12) < 0.012) lv = 1;
        // the clearing's edge is a little darker where it meets the grass
        if (!onDirt((x + 2 * u) / T, ty) || !onDirt((x - 2 * u) / T, ty) || !onDirt(tx, (y + 2 * u) / T) || !onDirt(tx, (y - 2 * u) / T)) lv = (x + y) % 2 ? 1 : lv;
        p.dot(x, y, A.dirt, lv);
        continue;
      }
      // grass: two greens in big soft patches, sun flecks coming through the canopy
      const gn = noise(x, y, 26 * u, 1);
      const g = gn > 0.55 || (gn > 0.5 && (x + y) % 2) ? A.grass : A.grass2;
      let lv = 2;
      const sun = noise(x, y, 8 * u, 21);
      if (sun > 0.72 || (sun > 0.68 && (x + y) % 2)) lv = 3;
      if (sun > 0.84 && (x + y) % 2 === 0) lv = 4;
      // shade near the forest edge at the top and the trees at the sides
      const shadeK = Math.max(0, 1 - (ty - L.floorTop) / 2.2) + Math.max(0, 1 - tx / 2) * 0.8;
      if (shadeK > 0.55 || (shadeK > 0.3 && (x + y) % 2)) lv = Math.max(0, lv - 1);
      // grass blades
      if (hash(x, y, 5) < 0.04) lv = Math.min(4, lv + 1);
      p.dot(x, y, g, lv);
    }
  // the edge of the sand by the grass: a few tufts
  for (let y = L.floorTop * T; y < H; y += Math.round(2 * u)) {
    const ex = sandEdge(y / T) * T;
    if (y / T > riverTop(ex / T) - 0.4) continue;
    for (let k = 0; k < 3 * u; k++) if (hash(k, y, 33) < 0.6) p.dot(ex + k, y, A.grass, 3);
  }
  // foam where the sea meets the sand
  for (let y = L.floorTop * T; y < H; y++) {
    const ex = Math.floor(seaEdge(y / T) * T);
    for (let k = 0; k < Math.max(1, Math.round(1.5 * u)); k++) p.pix(ex + k, y, '#f2fbff');
  }
  // the boardwalk: planks across, a darker gap between planks, and posts at the sides
  const bx0 = WALK.x0 * T;
  const bx1 = WALK.x1 * T;
  const by0 = WALK.y0 * T;
  const by1 = WALK.y1 * T;
  const plank = Math.max(3, Math.round(4 * u));
  for (let y = Math.floor(by0); y < by1; y++)
    for (let x = Math.floor(bx0); x < bx1; x++) {
      const gap = (x - bx0) % plank === plank - 1;
      const edge = y < by0 + u || y > by1 - u - 1;
      const knot = hash(Math.floor((x - bx0) / plank), 0, 14) < 0.15 && (y - by0) % Math.round(6 * u) === 3 && (x - bx0) % plank === 1;
      p.dot(x, y, A.plank, gap ? 1 : edge ? 3 : knot ? 1 : 2);
    }
  // the dock at the end: a wider deck
  for (let y = Math.floor(by0 - 0.8 * T); y < by1 + 0.6 * T; y++)
    for (let x = Math.floor(bx1 - 2.6 * T); x < bx1; x++) {
      const gap = (y - by0) % plank === plank - 1;
      p.dot(x, y, A.plank, gap ? 1 : x > bx1 - u - 1 ? 1 : (y - by0) % plank === 0 ? 3 : 2);
    }
  for (let x = bx0 + T; x < bx1; x += 2 * T) for (const y of [by0 - u, by1]) p.rect(x, y, 1.6 * u, 1.6 * u, A.bark, { sep: true });
  // the fire ring in the clearing (the fire itself is a standing prop)
  const fx = CAMP_SPOTS.fire.x * T;
  const fy = CAMP_SPOTS.fire.y * T;
  p.ellipse(fx, fy, 1.1 * T, 0.55 * T, A.mud, { form: 'flat', level: 1 });
  return p.toBuffer({ outline: false });
}

/** Sun sparkles (day) or plankton sparkles (dusk) on the water, as a see-through layer over the ground. */
export function paintWaterShine(T: number, time: TimeOfDay, frame: number): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  const n = Math.round((W * H) / (90 * u * u));
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i, frame, 51) * W);
    const y = Math.floor(L.floorTop * T + hash(i, frame + 7, 51) * (H - L.floorTop * T));
    const tx = x / T;
    const ty = y / T;
    const sea = tx > seaEdge(ty) + 0.3;
    const river = ty > riverTop(tx) + 0.3 && ty < riverBottom(tx) - 0.2;
    if (!sea && !river) continue;
    if (tx > WALK.x0 && tx < WALK.x1 && ty > WALK.y0 - 0.9 && ty < WALK.y1 + 0.7) continue;
    if (time === 'evening' && sea) p.fillPix(x, y, Math.max(1, Math.round(u)), Math.max(1, Math.round(u)), hash(i, 3, 52) > 0.5 ? '#9ff4ff' : '#5fd8ff');
    else if (time === 'day') p.fillPix(x, y, Math.max(1, Math.round(2 * u)), Math.max(1, Math.round(u * 0.6)), '#ffffff');
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the backdrop

/**
 * Behind the camp: the sky, misty far hills and layers of rainforest canopy,
 * with the sea's horizon and a little island on the right. Day: a bright
 * blue sky with puffy clouds. Dusk: orange and pink fading to purple, with
 * the first stars and a crescent moon.
 */
export function paintCampBackdrop(T: number, wTiles: number, hTiles: number, time: TimeOfDay, frame = 0): PixelBuffer {
  const u = U(T);
  const W = Math.round(wTiles * T);
  const H = Math.round(hTiles * T);
  const p = new Paint(W, H);
  const dusk = time === 'evening';
  const sky = dusk ? ['#2a2458', '#4a3270', '#7a3f7a', '#c25a72', '#f08a5a', '#ffc070'] : ['#3a9ae0', '#4fa8e6', '#68b8ea', '#86c8ee', '#a6d8f0', '#cdeaf2'];
  const horizon = H - 2.2 * T;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = Math.min(1, y / horizon) * (sky.length - 1);
      let band = Math.floor(t);
      if (t - band > 0.6 && (x + y) % 2) band++;
      if (t - band > 0.85) band++;
      p.pix(x, y, sky[Math.min(sky.length - 1, band)]);
    }
  if (dusk) {
    for (let i = 0; i < W * H * 0.0016; i++) {
      const x = Math.floor(hash(i, 1, 61) * W);
      const y = Math.floor(hash(i, 2, 61) * horizon * 0.5);
      p.pix(x, y, hash(i, 4, 61) > 0.6 && (frame + i) % 3 === 0 ? '#6a5a9a' : '#fff6e0');
    }
    // a crescent moon
    const mx = W * 0.2;
    const my = H * 0.16;
    for (let y = Math.floor(my - 0.5 * T); y < my + 0.5 * T; y++)
      for (let x = Math.floor(mx - 0.5 * T); x < mx + 0.5 * T; x++) if (Math.hypot(x - mx, y - my) < 0.42 * T && Math.hypot(x - mx - 0.18 * T, y - my + 0.08 * T) > 0.36 * T) p.pix(x, y, '#fff4cc');
  } else {
    // puffy clouds drifting
    for (let c = 0; c < 6; c++) {
      const cx = ((hash(c, 1, 62) * W + frame * 2 * u) % (W + 4 * T)) - 2 * T;
      const cy = H * (0.1 + hash(c, 2, 62) * 0.3);
      const cw = (1.2 + hash(c, 3, 62)) * T;
      for (let k = 0; k < 4; k++) p.ellipse(cx + (k - 1.5) * cw * 0.45, cy - (k % 2) * 0.2 * T, cw * 0.4, 0.32 * T, ramp('#ffffff'), { dither: true, bias: 0.3 });
    }
  }
  // the sea's horizon on the right, behind everything, with a little island
  const seaX = W * 0.78;
  for (let y = Math.floor(horizon - 0.2 * T); y < H; y++)
    for (let x = Math.floor(seaX); x < W; x++) {
      const k = (y - (horizon - 0.2 * T)) / (2.4 * T);
      p.pix(x, y, mixHex(dusk ? '#c86a7a' : '#5ab8e0', dusk ? '#2a3a6a' : '#2f8fc8', Math.min(1, k * 1.4)));
      if (hash(x >> 2, y, 63) < 0.05) p.pix(x, y, dusk ? '#ffb07a' : '#e6f8ff');
    }
  const isl = ramp(mixHex('#3f8f4a', dusk ? '#3a2a5a' : '#a6c8d8', 0.45), {
    spread: 0.5,
  });
  p.ellipse(W * 0.9, horizon - 0.1 * T, 1.4 * T, 0.5 * T, isl, {
    clip: (_x, y) => y < horizon - 0.1 * T,
  });
  // far misty hills
  const far = (c: string, k: number) => ramp(mixHex(c, dusk ? '#4a3a7a' : '#b8d8e0', k), { spread: 0.45 });
  const hills = far('#2f8f62', 0.6);
  for (let x = 0; x < seaX + T; x++) {
    const top = horizon - (1.2 + Math.sin(x / (40 * u)) * 0.6 + Math.sin(x / (13 * u)) * 0.2) * T;
    for (let y = Math.floor(top); y < H; y++) p.dot(x, y, hills, y < top + u ? 3 : 2);
  }
  // three layers of canopy: far (misty), middle, near (darkest, with sunlit tops)
  const layers: Array<[Ramp, number, number, number]> = [
    [far('#3f8f4a', 0.35), 0.75, 5, 71],
    [far('#2f8f62', 0.15), 0.25, 4, 72],
    [WILD.leaf2, -0.35, 3, 73],
  ];
  for (const [r, base, lump, seed] of layers) {
    for (let x = 0; x < W; x++) {
      const fade = x > seaX ? Math.min(1, (x - seaX) / (1.4 * T)) : 0;
      const bumps = Math.abs(Math.sin(x / (lump * 2.2 * u) + seed)) * 0.6 + noise(x, 0, lump * 3 * u, seed) * 0.5;
      const top = horizon - (base + bumps) * T + fade * 3 * T;
      for (let y = Math.floor(top); y < H; y++) {
        let lv = y < top + 1.5 * u ? (dusk ? 2 : 3) : 2;
        // leafy clumps: a lit edge on top of each clump, a darker gap under it
        const cl = noise(x, y, 5 * u, seed + 9);
        if (cl > 0.74) lv = Math.min(4, lv + 1);
        else if (cl < 0.2 && (x + y) % 2) lv = Math.max(0, lv - 1);
        if (y > top + 0.9 * T) lv = Math.max(0, lv - 1);
        p.dot(x, y, r, lv);
      }
    }
  }
  // tall emergent trees poking above the canopy, and a few tree trunks in the near layer
  for (let k = 0; k < 7; k++) {
    const tx = (k + 0.5 + hash(k, 1, 74) * 0.6) * (seaX / 7);
    const top = horizon - (2 + hash(k, 2, 74) * 0.8) * T;
    const crown = far(k % 2 ? '#3fae5a' : '#2f8f62', 0.3);
    p.rect(tx - 1.2 * u, top + 0.4 * T, 2.4 * u, horizon - top, far('#7a5236', 0.3), { form: 'cylV', box: [tx - 1.2 * u, 0, 2.4 * u, H] });
    for (const [dx, dy, rx] of [
      [-0.5, 0.15, 0.5],
      [0.5, 0.18, 0.55],
      [0, 0, 0.6],
    ])
      p.ellipse(tx + dx * T, top + (0.3 + dy) * T, rx * T, 0.32 * T, crown, {
        dither: true,
        sep: true,
      });
  }
  for (let x = 0; x < seaX; x += 2.2 * T) {
    const tx = x + hash(Math.floor(x), 3, 75) * T;
    p.rect(tx, horizon - 0.3 * T, 2.2 * u, H - horizon + 0.3 * T, WILD.bark, {
      form: 'cylV',
      box: [tx, 0, 2.2 * u, H],
    });
    for (let y = horizon - 0.3 * T; y < H; y += 2 * u) p.dot(tx + 3 * u + Math.sin(y / (3 * u)) * u, y, WILD.leaf, 2);
  }
  // birds far off (day) and the dusk glow on the bottom
  if (!dusk)
    for (let b = 0; b < 3; b++) {
      const bx = W * (0.35 + b * 0.06) + ((frame * 3 * u) % (3 * T));
      const by = H * (0.25 + (b % 2) * 0.05);
      p.pix(bx - u, by - u, '#2a3a4a');
      p.pix(bx, by, '#2a3a4a');
      p.pix(bx + u, by - u, '#2a3a4a');
    }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the campfire

/** The campfire: a ring of stones, crossed logs and flickering flames (frames 0-3). */
export function paintCampfire(T: number, frame = 0, lit = true): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(24 * u), Math.round(20 * u));
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    p.ellipse(S(12 + Math.cos(a) * 9), S(15 + Math.sin(a) * 3.4), S(2.2), S(1.6), WILD.stone, { sep: true });
  }
  p.capsule(S(6), S(16), S(18), S(13.6), S(1.3), WILD.bark, { sep: true });
  p.capsule(S(6), S(13.6), S(18), S(16), S(1.3), WILD.bark2, { sep: true });
  if (lit) {
    const f = frame % 4;
    const sway = [0, 1, 0, -1][f];
    p.poly(
      [
        [S(6.5), S(15)],
        [S(9 + sway), S(7)],
        [S(12 + sway * 1.5), S(1 + (f % 2))],
        [S(15 + sway), S(7)],
        [S(17.5), S(15)],
      ],
      WILD.orange,
      { form: 'flat', level: 3 },
    );
    p.poly(
      [
        [S(9), S(15)],
        [S(11 + sway), S(9)],
        [S(12 + sway), S(5 + (f % 2))],
        [S(13.4 + sway), S(9)],
        [S(15), S(15)],
      ],
      WILD.yellow,
      { form: 'flat', level: 4 },
    );
    p.pix(S(8 + f * 2), S(3 - (f % 2)), '#ffe08a');
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ the setting

export const FIELD_CAMP: Setting = {
  id: 'field-camp',
  world: 'wild-lands',
  name: 'The field camp',
  inspiredBy:
    'Real rainforest field stations where scientists live and work (tents, a lab, a weather mast), at a river mouth on a tropical coast. The animals are real rainforest and coast animals: red-eyed tree frogs, toucans, spider monkeys, sloths, blue morpho butterflies, herons and jaguars.',
  build: buildCamp,
};

function buildCamp(ctx: SceneCtx): SettingScene {
  const { lighting, px: T } = ctx;
  let time = ctx.time;
  const { add, prop } = placer(ctx);
  const leave = (part: string) => !!ctx.omit?.includes(part);
  const blocks: Array<{ x: number; y: number; w: number; h: number }> = [];
  const solid = (cv: HTMLCanvasElement, x: number, y: number, shadowW = 0, depth = 0.5) => {
    const w = cv.width / T;
    blocks.push({
      x: x - w / 2 + 0.1,
      y: y - depth,
      w: Math.max(0.4, w - 0.2),
      h: depth,
    });
    return prop(cv, x, y, shadowW);
  };

  add(groundPiece(lighting, T, paintCampGround(T).toCanvas(), 0, 0));
  // the water's sparkles: sunlight by day, blue plankton at dusk (three frames each, painted when first needed)
  const shineFrames: Partial<Record<TimeOfDay, THREE.Texture[]>> = {};
  const shineFor = (t: TimeOfDay) => (shineFrames[t] ??= [0, 1, 2].map((f) => pixelTexture(paintWaterShine(T, t, f).toCanvas())));
  const shine = add(groundPiece(lighting, T, paintWaterShine(T, time, 0).toCanvas(), 0, 0));
  shine.position.y = 0.012;
  const backFrames: Partial<Record<TimeOfDay, THREE.Texture[]>> = {};
  const backFor = (t: TimeOfDay) => (backFrames[t] ??= [0, 1, 2].map((f) => pixelTexture(paintCampBackdrop(T, L.w + 12, 9, t, f).toCanvas())));
  const back = add(billboard(null, T, paintCampBackdrop(T, L.w + 12, 9, time, 0).toCanvas(), L.w / 2, L.floorTop - 0.3));
  // the plankton's blue glow over the sea after dusk
  for (let y = 5; y < L.h; y += 3) for (let x = 25.2; x < L.w; x += 2.6) add(lightPool(lighting, T, x + (y % 2), y, 1.4, '#5fd8ff', 0.28));

  // trees round the edge (rain trees at the back and sides, palms by the beach)
  const trees: Array<[number, number, number]> = [
    [1.4, 4.2, 0],
    [5.6, 3.6, 1],
    [16.6, 3.8, 2],
    [0.9, 11.4, 3],
  ];
  for (const [x, y, s] of trees) solid(paintRainTree(T, s).toCanvas(), x, y, 2.4, 0.6);
  for (const [x, y, s] of [
    [20.4, 4.4, 0],
    [22.4, 6.2, 1],
    [21.4, 13.2, 0],
  ])
    solid(paintPalm(T, s).toCanvas(), x, y, 1.6, 0.4);
  for (const [x, y, s] of [
    [3.2, 4.6, 0],
    [8.4, 4.2, 1],
    [13.6, 4.1, 2],
    [18.4, 4.6, 1],
    [1.8, 13.7, 0],
    [9.4, 13.8, 2],
    [17.6, 13.6, 1],
    [6.4, 8.6, 1],
  ])
    solid(paintFern(T, s).toCanvas(), x, y, 0, 0.3);
  // glowing mushrooms in the shade (living light at dusk)
  for (const [x, y] of [
    [2.4, 6.2],
    [7.4, 13.6],
    [15.6, 4.6],
    [1.6, 12.8],
  ]) {
    prop(paintMushrooms(T).toCanvas(), x, y);
    add(glow(lighting, T, Math.round(T * 1.3), '#7dffb0', x, y, 0.3, 0.75));
    add(lightPool(lighting, T, x, y, 0.8, '#7dffb0', 0.32));
  }

  // the tents, the lab tent, the touch tank, the zone chart, the weather mast, the jeep and supplies
  solid(paintTent(T, 0).toCanvas(), 3.4, 8.2, 2.6, 1.2);
  solid(paintTent(T, 1).toCanvas(), 6.8, 7.0, 2.6, 1.2);
  solid(paintLabTent(T).toCanvas(), CAMP_SPOTS.labTent.x, CAMP_SPOTS.labTent.y, 3.6, 1.4);
  add(glow(lighting, T, Math.round(T * 2.2), '#ffd07a', CAMP_SPOTS.labTent.x, CAMP_SPOTS.labTent.y, 0.9, 0.55));
  const tankTex = [0, 1].map((f) => pixelTexture(paintTouchTank(T, f).toCanvas()));
  const tank = solid(paintTouchTank(T, 0).toCanvas(), CAMP_SPOTS.tank.x, CAMP_SPOTS.tank.y, 2.2, 0.6);
  solid(paintZoneChart(T).toCanvas(), CAMP_SPOTS.chart.x, CAMP_SPOTS.chart.y, 1, 0.3);
  const mastTex = [0, 1, 2].map((f) => pixelTexture(paintWeatherMast(T, f).toCanvas()));
  const mast = solid(paintWeatherMast(T, 0).toCanvas(), 9.2, 4.6, 0.6, 0.3);
  solid(paintJeep(T).toCanvas(), 4.2, 12.4, 2.8, 1);
  solid(paintSupplies(T).toCanvas(), 7.6, 12.2, 1.6, 0.6);

  // lantern posts along the paths, warm at dusk
  for (const [x, y] of [
    [8.6, 9.6],
    [17, 8.8],
    [19, 10.8],
    [12.4, 8.0],
    [23.4, 8.6],
  ]) {
    solid(paintLanternPost(T).toCanvas(), x, y, 0, 0.3);
    add(glow(lighting, T, Math.round(T * 1.4), '#ffd07a', x + 0.2, y, 1.4, 0.8));
    add(lightPool(lighting, T, x + 0.2, y + 0.2, 1.3, '#ffc070', 0.35));
  }
  // the campfire (a game can light it itself with omit: ['fire'])
  const fireTex = [0, 1, 2, 3].map((f) => pixelTexture(paintCampfire(T, f, true).toCanvas()));
  const fire = leave('fire') ? null : solid(paintCampfire(T, 0, true).toCanvas(), CAMP_SPOTS.fire.x, CAMP_SPOTS.fire.y, 0, 0.6);
  if (fire) {
    add(glow(lighting, T, Math.round(T * 2.6), '#ffa040', CAMP_SPOTS.fire.x, CAMP_SPOTS.fire.y, 0.5, 0.85));
    add(lightPool(lighting, T, CAMP_SPOTS.fire.x, CAMP_SPOTS.fire.y, 2.4, '#ff9a40', 0.4));
  }

  // the little submarine at the dock, bobbing (a game draws its own with omit: ['sub'])
  const subTex = [0, 1, 2].map((f) => pixelTexture(paintSub(T, 'left', f, time === 'evening').toCanvas()));
  const subLampTex = [0, 1, 2].map((f) => pixelTexture(paintSub(T, 'left', f, true).toCanvas()));
  const sub = leave('sub') ? null : prop(paintSub(T, 'left', 0).toCanvas(), CAMP_SPOTS.sub.x, CAMP_SPOTS.sub.y);
  if (sub) add(glow(lighting, T, Math.round(T * 1.2), '#fff6b0', CAMP_SPOTS.sub.x - 1.1, CAMP_SPOTS.sub.y, 0.6, 0.8));

  // the animals (a game can leave them out with omit: ['animals'])
  const animals = !leave('animals');
  const frogTex = [0, 1].map((f) => pixelTexture(paintFrog(T, f).toCanvas()));
  const frog = animals ? prop(paintFrog(T, 0).toCanvas(), 6.5, 8.75, 0, 0.55) : null;
  const toucanTex = [0, 1].map((f) => pixelTexture(paintToucan(T, f).toCanvas()));
  const toucan = animals ? prop(paintToucan(T, 0).toCanvas(), 5.2, 3.7, 0, 2.9) : null;
  const monkeyTex = [0, 1].map((f) => pixelTexture(paintMonkey(T, f).toCanvas()));
  const monkey = animals ? prop(paintMonkey(T, 0).toCanvas(), 16.9, 3.9, 0, 2.6) : null;
  const slothTex = [0, 1].map((f) => pixelTexture(paintSloth(T, f).toCanvas()));
  const sloth = animals ? prop(paintSloth(T, 0).toCanvas(), 1.1, 11.5, 0, 2.7) : null;
  const heronTex = [0, 1].map((f) => pixelTexture(paintHeron(T, f).toCanvas()));
  const heron = animals ? prop(paintHeron(T, 0).toCanvas(), 15.8, 15.3, 0.8) : null;
  const jaguarTex = [0, 1].map((f) => pixelTexture(paintJaguar(T, f).toCanvas()));
  const jaguar = animals ? prop(paintJaguar(T, 0).toCanvas(), 6.4, 17.4) : null;
  const flyTex = [0, 1, 2].map((f) => pixelTexture(paintButterfly(T, f).toCanvas()));
  const flies = animals
    ? [
        [11.8, 6.0, 0],
        [18.2, 11.6, 2.1],
        [4.4, 10.6, 4.2],
      ].map(([x, y, ph]) => ({
        m: prop(paintButterfly(T, 0).toCanvas(), x, y, 0, 1.2),
        x,
        y,
        ph,
      }))
    : [];

  // fireflies over the clearing (they glow only after dusk)
  const fireflies = Array.from({ length: 16 }, (_, i) => {
    const x = 2.5 + hash(i, 1, 81) * 19;
    const y = 4.6 + hash(i, 2, 81) * 9.6;
    const m = add(glow(lighting, T, Math.round(T * 0.5), '#f6ff8a', x, y, 0.8, 0.95));
    return {
      m,
      x,
      y,
      ph: hash(i, 3, 81) * 6.3,
      sp: 0.4 + hash(i, 4, 81) * 0.5,
    };
  });

  const lampOn = () => time === 'evening';
  return {
    map: { w: L.w, h: L.h },
    focus: { x: 15, feet: 11, top: 0.6 },
    clear: time === 'evening' ? '#1f2a3a' : '#2f6a4a',
    walk: { x0: 1.2, y0: 4.4, x1: 28.2, y1: 14 },
    blocks,
    spots: { ...CAMP_SPOTS },
    update(t, camX) {
      const f3 = Math.floor(t * 1.5) % 3;
      swapFrame(back, backFor(time)[f3]);
      swapFrame(shine, shineFor(time)[Math.floor(t * 2) % 3]);
      swapFrame(tank, tankTex[Math.floor(t * 2) % 2]);
      swapFrame(mast, mastTex[Math.floor(t * 4) % 3]);
      if (fire) swapFrame(fire, fireTex[Math.floor(t * 8) % 4]);
      if (sub) {
        swapFrame(sub, (lampOn() ? subLampTex : subTex)[Math.floor(t * 6) % 3]);
        sub.position.y = (Math.round(Math.sin(t * 1.6) * 1.5) / T) * K;
      }
      if (frog) swapFrame(frog, frogTex[t % 3 > 2.5 ? 1 : 0]);
      if (toucan) swapFrame(toucan, toucanTex[t % 4 > 3.4 ? 1 : 0]);
      if (monkey) swapFrame(monkey, monkeyTex[Math.floor(t * 1.2) % 2]);
      if (sloth) swapFrame(sloth, slothTex[t % 7 > 6 ? 1 : 0]);
      if (heron) swapFrame(heron, heronTex[t % 5 > 3.8 ? 1 : 0]);
      if (jaguar) swapFrame(jaguar, jaguarTex[t % 4 > 3.5 ? 1 : 0]);
      for (const b of flies) {
        swapFrame(b.m, flyTex[Math.floor(t * 10 + b.ph) % 3]);
        b.m.position.x = b.x + Math.sin(t * 0.5 + b.ph) * 1.6;
        b.m.position.z = (b.y + Math.sin(t * 0.8 + b.ph) * 0.8) * K;
        b.m.position.y = (1.2 + Math.sin(t * 2 + b.ph) * 0.3) * K;
      }
      for (const ff of fireflies) {
        ff.m.position.x = ff.x + Math.sin(t * ff.sp + ff.ph) * 0.9;
        ff.m.position.z = (ff.y + Math.cos(t * ff.sp * 0.7 + ff.ph) * 0.6) * K + 0.4;
        ff.m.position.y = (0.8 + Math.sin(t * ff.sp * 2 + ff.ph) * 0.35) * K;
        ff.m.visible = Math.sin(t * 1.7 + ff.ph * 3) > -0.4;
      }
      back.position.x = L.w / 2 + (camX - L.w / 2) * 0.5;
    },
    setTime(t) {
      time = t;
      swapFrame(back, backFor(t)[0]);
      swapFrame(shine, shineFor(t)[0]);
    },
  };
}
