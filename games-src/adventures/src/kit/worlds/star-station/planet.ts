import { PixelBuffer } from '../../art/pixel';
import { pixelTexture } from '../../world/sceneKit';
import { swapFrame } from '../figure';
import { placer } from '../place';
import { Paint, hash, mixHex, ramp } from '../shade';
import { billboard, glow, groundPiece, lightPool, shadow } from '../stage';
import { K } from '../../render/pixelRenderer';
import type { SceneCtx, Setting, SettingScene, TimeOfDay } from '../types';
import { STAR, paintBollard, paintCrates, paintDrone } from './art';

/**
 * Star Station setting: an outdoor alien planet (W1 proof that one world
 * style can hold many settings). The style is the same as the station deck:
 * 24 pixels per tile, the same shading, cool shadows, neon glows that wake up
 * on the night shift, and the cyan panel accent. The place is new: purple
 * dust and teal moss, glowing crystals, banded rock spires, mushroom trees,
 * a landing pad, a habitat dome and a rover, under a sky with two moons and
 * the ringed planet seen from the station window.
 */

const PLANET = {
  dust: ramp('#7a5aa8'),
  dust2: ramp('#6c4f9c'),
  moss: ramp('#2fa39a'),
  rock: ramp('#b26a8a'),
  rock2: ramp('#8a5aa0'),
  crystal: ramp('#5fe3ff'),
  crystal2: ramp('#ff6fc0'),
  cap: ramp('#ff8a4c'),
  cap2: ramp('#ffd04a'),
  stem: ramp('#e6d6f0'),
  bulb: ramp('#7dea8a'),
  hull: ramp('#e7ecf6'),
  metal: ramp('#8c98bd'),
} as const;

const U = (T: number) => T / 16;
export const PLANET_LAYOUT = { w: 26, h: 24, floorTop: 4, pad: { x: 6.5, y: 15.5, r: 2.6 }, path: [10.5, 12.5] as [number, number] };
const L = PLANET_LAYOUT;

// ------------------------------------------------------------------ ground

export function paintPlanetGround(T: number): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  const A = PLANET;
  const blob = (x: number, y: number, sc: number, seed: number) => {
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
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = blob(x, y, 3 * T, 3) * 0.7 + blob(x, y, T, 4) * 0.3;
      const dith = (x + y) % 2 ? 0.02 : -0.02;
      // dust, darker in hollows, with ripples blown by the wind
      const rip = Math.sin(x / (6 * u) + y / (2.4 * u) + Math.sin(y / (11 * u)) * 2);
      let lv = n + dith > 0.62 ? 3 : n + dith < 0.3 ? 1 : 2;
      if (rip > 0.93 && lv === 2) lv = 3;
      p.dot(x, y, n > 0.5 ? A.dust : A.dust2, lv);
      // teal moss patches
      const m = blob(x + 400, y, 2 * T, 7);
      if (m + dith > 0.76) p.dot(x, y, A.moss, m > 0.84 ? 3 : 2);
      // pebbles
      if (hash(x >> 1, y >> 1, 9) < 0.006) p.dot(x, y, A.rock2, 1);
    }
  // small craters: a dark ring with a lit rim
  for (const [cx, cy, r] of [
    [3, 8, 1.1],
    [20.5, 17, 1.4],
    [15, 21.5, 0.9],
    [23, 7.4, 0.8],
  ]) {
    const R0 = r * T;
    for (let y = Math.floor(cy * T - R0 * 1.2); y < cy * T + R0 * 1.2; y++)
      for (let x = Math.floor(cx * T - R0 * 1.2); x < cx * T + R0 * 1.2; x++) {
        const d = Math.hypot(x - cx * T, (y - cy * T) * 1.3) / R0;
        if (d > 1.15) continue;
        const lit = y < cy * T;
        if (d > 0.95) p.dot(x, y, A.dust, lit ? 1 : 4);
        else if (d > 0.8) p.dot(x, y, A.dust2, lit ? 0 : 3);
        else p.dot(x, y, A.dust2, 1);
      }
  }
  // glowing crystal shards poking out of the ground
  for (let i = 0; i < 40; i++) {
    const x = hash(i, 1, 21) * W;
    const y = (L.floorTop + 0.5) * T + hash(i, 2, 21) * (H - (L.floorTop + 1) * T);
    const r = i % 3 ? A.crystal : A.crystal2;
    p.dot(x, y, r, 4);
    p.dot(x + 1, y, r, 2);
    if (u >= 1.5) p.dot(x, y - 1, r, 3);
  }
  // the landing pad: a hexagon of metal plates with a hazard ring and lights
  const pc = L.pad;
  const px0 = pc.x * T;
  const py0 = pc.y * T;
  const R1 = pc.r * T;
  const hex = (x: number, y: number) => {
    const dx = Math.abs(x - px0);
    const dy = Math.abs((y - py0) * 1.25);
    return Math.max(dx * 0.866 + dy * 0.5, dy) <= R1 * 0.866;
  };
  for (let y = Math.floor(py0 - R1); y < py0 + R1; y++)
    for (let x = Math.floor(px0 - R1); x < px0 + R1; x++) {
      if (!hex(x, y)) continue;
      const inner = hex(px0 + (x - px0) * 1.18, py0 + (y - py0) * 1.18);
      if (!inner) {
        const stripe = Math.floor((x + y) / Math.max(3, Math.round(3 * u))) % 2;
        p.dot(x, y, stripe ? STAR.hazard : STAR.dark, 2);
      } else {
        const lx = Math.floor((x - px0 + R1) / (T * 0.9));
        const ly = Math.floor((y - py0 + R1) / (T * 0.9));
        const seam = (x - px0 + R1) % (T * 0.9) < 1 || (y - py0 + R1) % (T * 0.9) < 1;
        p.dot(x, y, (lx + ly) % 2 ? STAR.deck : STAR.deck2, seam ? 0 : 2);
      }
    }
  p.ellipse(px0, py0, 0.7 * T, 0.56 * T, STAR.cyan, { form: 'flat', level: 1 });
  p.ellipse(px0, py0, 0.45 * T, 0.36 * T, STAR.dark, { form: 'flat', level: 2 });
  // a metal walkway from the pad to the habitat
  const [w0, w1] = L.path;
  for (let y = Math.round(w0 * T); y < w1 * T; y++)
    for (let x = Math.round((pc.x + 1.8) * T); x < 21 * T; x++) {
      const lx = x % Math.round(T / 2);
      const edge = y < w0 * T + 1.5 * u || y > w1 * T - 1.5 * u;
      p.dot(x, y, STAR.deck, edge ? 3 : lx === 0 ? 0 : 2);
    }
  for (let x = Math.round((pc.x + 1.8) * T); x < 21 * T; x++) {
    if (Math.floor(x / (T / 2)) % 2) continue;
    p.pix(x, Math.round(w0 * T) + Math.round(u), STAR.neonCyan);
    p.pix(x, Math.round(w1 * T) - Math.round(u) - 1, STAR.neonCyan);
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the sky and the far horizon

export function paintPlanetSky(T: number, wTiles: number, hTiles: number, time: TimeOfDay, frame = 0): PixelBuffer {
  const u = U(T);
  const W = Math.round(wTiles * T);
  const H = Math.round(hTiles * T);
  const p = new Paint(W, H);
  const night = time === 'evening';
  const sky = night ? ['#0d0c2a', '#151338', '#1d1846', '#291c55', '#3a2162', '#4a2a6a'] : ['#3fb0c8', '#5cc0cc', '#86cfc8', '#b4d6c4', '#e6c8c0', '#f4b8b8'];
  const horizon = H - 1.5 * T;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = Math.min(1, y / horizon) * (sky.length - 1);
      let band = Math.floor(t);
      if (t - band > 0.6 && (x + y) % 2) band++;
      if (t - band > 0.85) band++;
      p.pix(x, y, sky[Math.min(sky.length - 1, band)]);
    }
  if (night) {
    // stars, some twinkling, and a green-and-pink aurora
    for (let i = 0; i < W * H * 0.003; i++) {
      const x = Math.floor(hash(i, 1, 31) * W);
      const y = Math.floor(hash(i, 2, 31) * horizon);
      const tw = hash(i, 4, 31) > 0.6 && (frame + i) % 3 === 0;
      p.pix(x, y, tw ? '#6a6aa0' : ['#ffffff', '#cfe8ff', '#ffe2f4'][i % 3]);
    }
    for (let x = 0; x < W; x++) {
      const yc = H * 0.32 + Math.sin(x / (18 * u) + frame * 0.3) * 0.5 * T + Math.sin(x / (7 * u)) * 3 * u;
      for (let k = 0; k < 0.9 * T; k++) {
        const y = Math.floor(yc + k);
        if ((x + y) % 2 && k > 0.5 * T) continue;
        p.pix(x, y, mixHex(p.color(x, y) ?? sky[0], k < 0.3 * T ? '#7dea8a' : '#ff8fd0', k < 0.3 * T ? 0.45 : 0.3));
      }
    }
  }
  // the ringed planet from the station window, big in the sky, and two moons
  const pcx = W * 0.3;
  const pcy = H * 0.3;
  const pr = 1.3 * T;
  const ringR = ramp('#f2d39a');
  const ring = (front: boolean) => {
    for (let y = Math.floor(pcy - pr); y < pcy + pr; y++)
      for (let x = Math.floor(pcx - pr * 2); x < pcx + pr * 2; x++) {
        const d = ((x + 0.5 - pcx) / (pr * 1.85)) ** 2 + ((y + 0.5 - pcy) / (pr * 0.42)) ** 2;
        const i = ((x + 0.5 - pcx) / (pr * 1.35)) ** 2 + ((y + 0.5 - pcy) / (pr * 0.28)) ** 2;
        if (d > 1 || i < 1 || front !== y + 0.5 > pcy) continue;
        p.dot(x, y, ringR, d > 0.8 ? 1 : x < pcx ? 3 : 2);
      }
  };
  ring(false);
  p.ellipse(pcx, pcy, pr, pr, ramp(night ? '#d87a48' : '#ef9a5c'), { dither: true, bias: night ? -0.1 : 0.1 });
  for (let y = Math.floor(pcy - pr); y < pcy + pr; y++)
    if (Math.floor((y - pcy) / (2.2 * u) + 10) % 3 === 0)
      for (let x = Math.floor(pcx - pr); x < pcx + pr; x++) if (p.filled(x, y) && Math.hypot(x - pcx, y - pcy) < pr) p.dot(x, y, ramp('#c95f3a'), p.levelAt(x, y));
  ring(true);
  p.ellipse(W * 0.66, H * 0.18, 0.4 * T, 0.4 * T, ramp('#c9d4f0'), { dither: true });
  p.ellipse(W * 0.76, H * 0.34, 0.22 * T, 0.22 * T, ramp('#f0c9e0'), { dither: true });
  // far rock spires with stripes, faded toward the sky
  const far = (c: string, k: number) => ramp(mixHex(c, night ? '#2a1f5a' : '#c8d6d6', k), { spread: 0.7 });
  const mesa = ramp(mixHex('#a86a8a', night ? '#2a1f5a' : '#c8d6d6', 0.4), { spread: 0.35 });
  for (let x = 0; x < W; x++) {
    const top = horizon - (0.3 + Math.abs(Math.sin(x / (21 * u))) * 0.55) * T - (hash(Math.floor(x / (9 * u)), 0, 5) > 0.75 ? 0.9 * T : 0);
    for (let y = Math.floor(top); y < H; y++) p.dot(x, y, mesa, y < top + 2 * u ? 3 : Math.floor((y - top) / (6 * u)) % 2 ? 1 : 2);
  }
  // the station's dome base on the horizon, with lit windows
  const dx = W * 0.78;
  const dome = far('#e7ecf6', 0.3);
  p.ellipse(dx, horizon + 0.1 * T, 1.3 * T, 0.8 * T, dome, { form: 'sphere' });
  p.rect(dx - 1.5 * T, horizon + 0.1 * T, 3 * T, 0.3 * T, dome, { level: 1 });
  for (let i = -2; i <= 2; i++) p.fillPix(dx + i * 0.45 * T, horizon - 0.25 * T, Math.max(1, Math.round(2 * u)), Math.max(1, Math.round(u)), night ? '#ffe9a8' : '#9fdcea');
  p.line(dx, horizon - 0.7 * T, dx, horizon - 1.3 * T, dome, 1);
  p.pix(dx, horizon - 1.35 * T, frame % 2 ? STAR.neonPink : '#ff5f5f');
  // near ground, the same dust as the plain, with a lit ridge and pebbles
  const hill = far('#6c4f9c', 0.15);
  for (let x = 0; x < W; x++) {
    const top = horizon + 0.25 * T + Math.sin(x / (30 * u)) * 0.25 * T;
    for (let y = Math.floor(top); y < H; y++) p.dot(x, y, hill, y < top + 2 * u ? 3 : hash(x >> 1, y >> 1, 41) < 0.03 ? 1 : 2);
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ props

/** A habitat module: a white dome with round windows, a door, a light and an antenna. */
export function paintHabitat(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(64 * u), Math.round(48 * u));
  const A = PLANET;
  p.rect(S(4), S(34), S(56), S(12), A.metal, { form: 'cylV', box: [S(4), S(34), S(56), S(12)] });
  p.ellipse(S(32), S(34), S(28), S(26), A.hull, { sep: true, clip: (_x, y) => y < S(35) });
  for (let k = 1; k < 4; k++) p.line(S(32) - S(28) * Math.cos(k * 0.4), S(34) - S(26) * Math.sin(k * 0.4), S(32) + S(28) * Math.cos(k * 0.4), S(34) - S(26) * Math.sin(k * 0.4), A.hull, 1, { onlyOver: true });
  for (const wx of [14, 50]) {
    p.ellipse(S(wx), S(28), S(4), S(4), A.metal, {});
    p.ellipse(S(wx), S(28), S(2.8), S(2.8), ramp('#ffe9a8'), { form: 'flat', level: frame % 2 ? 3 : 2 });
  }
  // door with a light strip
  p.rect(S(25), S(26), S(14), S(20), A.metal, { form: 'cylV', box: [S(25), 0, S(14), S(48)], sep: true });
  p.rect(S(27), S(28), S(10), S(18), STAR.dark, { level: 2 });
  p.line(S(32), S(28), S(32), S(45), STAR.dark, 0);
  p.fillPix(S(27), S(28), S(10), Math.max(1, Math.round(u)), STAR.neonCyan);
  p.ellipse(S(32), S(23.5), S(1.6), S(1.2), frame % 2 ? STAR.lime : STAR.amber, { form: 'flat', level: 4 });
  // antenna dish on top
  p.line(S(40), S(10), S(44), S(2), A.metal, 1);
  p.ellipse(S(44), S(3), S(4), S(2), A.hull, {});
  p.dot(S(44), S(1), frame % 2 ? STAR.magenta : STAR.amber, 4);
  return p.toBuffer();
}

/** A six-wheeled rover with a solar panel and a camera mast. */
export function paintRover(T: number): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(44 * u), Math.round(30 * u));
  const A = PLANET;
  p.rect(S(4), S(6), S(28), S(3), STAR.cyan, { level: 2 });
  for (let x = 6; x < 32; x += 4) p.line(S(x), S(6), S(x), S(8.5), STAR.dark, 1);
  p.line(S(30), S(6), S(34), S(1), A.metal, 1);
  p.rect(S(32.5), S(0), S(4), S(3), A.hull, { level: 3 });
  p.dot(S(35.5), S(1.5), STAR.dark, 0);
  p.rect(S(4), S(10), S(34), S(10), A.hull, { form: 'cylV', box: [S(4), S(10), S(34), S(10)], sep: true });
  p.rect(S(8), S(12), S(10), S(4), STAR.orange, { level: 2 });
  p.rect(S(24), S(12), S(10), S(3), STAR.glass, { level: 1 });
  for (const wx of [8, 21, 34]) {
    p.ellipse(S(wx), S(24), S(4.6), S(4.6), STAR.dark, { sep: true });
    p.ellipse(S(wx), S(24), S(2), S(2), A.metal, { form: 'flat', level: 3 });
  }
  return p.toBuffer();
}

/** A communications beacon: a lattice mast with a blinking light (2 frames). */
export function paintBeacon(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(18 * u), Math.round(56 * u));
  const A = PLANET;
  p.line(S(4), S(54), S(8), S(8), A.metal, 1);
  p.line(S(14), S(54), S(10), S(8), A.metal, 2);
  for (let y = 12; y < 54; y += 6) {
    const t = (y - 8) / 46;
    p.line(S(8 - t * 4), S(y), S(10 + t * 4), S(y + 5), A.metal, 1);
    p.line(S(10 + t * 4), S(y), S(8 - t * 4), S(y + 5), A.metal, 2);
  }
  p.rect(S(2), S(52), S(14), S(3), A.metal, { level: 2 });
  p.ellipse(S(9), S(6), S(3), S(3), frame % 2 ? STAR.magenta : ramp('#ff5f5f'), { form: 'flat', level: 4 });
  return p.toBuffer();
}

/** A cluster of glowing crystals. */
export function paintCrystals(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(28 * u), Math.round(30 * u));
  const r = seed % 2 ? PLANET.crystal2 : PLANET.crystal;
  const spikes = [
    [14, 29, 0, 26],
    [8, 29, -0.4, 16],
    [20, 29, 0.35, 19],
    [11, 29, -0.15, 11],
    [18, 29, 0.6, 10],
  ];
  for (const [bx, by, lean, hgt] of spikes) {
    const tx = bx + lean * hgt;
    const ty = by - hgt;
    const w = 2.6;
    p.poly(
      [
        [S(bx - w), S(by)],
        [S(bx + w), S(by)],
        [S(tx + w * 0.6), S(ty + 3)],
        [S(tx), S(ty)],
        [S(tx - w * 0.6), S(ty + 3)],
      ],
      r,
      { sep: true, bias: 0.15 },
    );
    p.line(S(bx - w * 0.3), S(by - 1), S(tx - w * 0.2), S(ty + 2), r, 4, { onlyOver: true });
  }
  p.ellipse(S(14), S(29), S(11), S(2), PLANET.rock2, { form: 'flat', level: 1 });
  return p.toBuffer();
}

/** A mushroom tree with a spotted cap (it glows on the night shift). */
export function paintMushroomTree(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(36 * u), Math.round(52 * u));
  const A = PLANET;
  const capR = seed % 2 ? A.cap2 : A.cap;
  const lean = (seed % 3) - 1;
  p.capsule(S(18), S(51), S(18 + lean * 3), S(16), S(2.6), A.stem, { form: 'cylV', sep: true });
  for (let y = 22; y < 48; y += 7) p.line(S(15 + lean), S(y), S(21 + lean), S(y + 1), A.stem, 1, { onlyOver: true });
  p.ellipse(S(18 + lean * 3), S(13), S(16), S(9), capR, { sep: true, clip: (_x, y) => y < S(16) });
  p.ellipse(S(18 + lean * 3), S(16), S(15), S(2.4), capR, { form: 'flat', level: 0 });
  for (const [ox, oy, r] of [
    [-8, 9, 2],
    [-1, 7, 2.4],
    [7, 10, 1.8],
    [2, 12, 1.4],
    [-5, 13, 1.2],
  ]) p.ellipse(S(18 + lean * 3 + ox), S(oy), S(r), S(r * 0.8), ramp('#fff4e0'), { form: 'flat', level: 2 });
  return p.toBuffer();
}

/** A glowing bulb plant. */
export function paintBulbPlant(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(20 * u), Math.round(24 * u));
  const A = PLANET;
  for (let i = 0; i < 3; i++) {
    const x = S(5 + i * 5);
    const top = S(8 + (i % 2) * 5 + (seed % 2) * 2);
    p.line(x, S(23), x + S((i - 1) * 1.5), top + S(3), A.moss, 2);
    p.ellipse(x + S((i - 1) * 1.5), top, S(2.6), S(3), i === 1 ? A.bulb : STAR.cyan, { sep: true, bias: 0.25 });
  }
  for (const k of [-1, 1]) p.capsule(S(10), S(23), S(10 + k * 7), S(18), S(1.4), A.moss, {});
  return p.toBuffer();
}

/** A steam vent in the ground (3 frames of puffs). */
export function paintVent(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(24 * u), Math.round(40 * u));
  p.ellipse(S(12), S(36), S(9), S(3.4), PLANET.rock, { sep: true });
  p.ellipse(S(12), S(35.5), S(5), S(1.6), STAR.dark, { form: 'flat', level: 0 });
  const steam = ramp('#eef0ff', { spread: 0.5 });
  for (let k = 0; k < 4; k++) {
    const t = ((frame + k * 0.75) % 3) / 3;
    const y = S(32) - (k * 7 + t * 7) * u;
    const r = S(3 + k * 1.4);
    p.ellipse(S(12) + Math.sin(k + frame) * S(2), y, r, r * 0.8, steam, { form: 'flat', level: k % 2 ? 3 : 4, dither: true });
  }
  return p.toBuffer();
}

/** A friendly little critter: a round fuzzy creature with an antenna (2 frames: sitting and hopping). */
export function paintCritter(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(18 * u));
  const fur = ramp('#7dd0ff');
  const hop = frame % 2 ? 2 : 0;
  p.line(S(9), S(6 - hop), S(11), S(1.5 - hop), fur, 1);
  p.ellipse(S(11.4), S(1.5 - hop), S(1.3), S(1.3), STAR.amber, { form: 'flat', level: 4 });
  p.ellipse(S(8), S(11 - hop), S(6.5), S(5.6), fur, { sep: true });
  p.pix(S(6), S(10 - hop), '#1d1a30');
  p.pix(S(10), S(10 - hop), '#1d1a30');
  p.pix(S(6), S(9 - hop), '#ffffff');
  p.pix(S(10), S(9 - hop), '#ffffff');
  p.pix(S(8), S(12.5 - hop), '#c0506a');
  for (const k of [-1, 1]) p.ellipse(S(8 + k * 3.5), S(16.4), S(1.8), S(1.1), ramp('#5ab0e0'), {});
  return p.toBuffer();
}

/** A big rock with stripes, like the spires on the horizon. */
export function paintRock(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(30 * u), Math.round(30 * u));
  const r = seed % 2 ? PLANET.rock : PLANET.rock2;
  p.poly(
    [
      [S(2), S(29)],
      [S(5), S(12)],
      [S(11), S(4 + (seed % 3) * 2)],
      [S(19), S(6)],
      [S(26), S(14)],
      [S(28), S(29)],
    ],
    r,
    { sep: true, form: 'sphere', box: [S(2), S(4), S(26), S(26)] },
  );
  for (let y = 12; y < 29; y += 5) p.line(S(4), S(y), S(27), S(y + 1), r, 1, { onlyOver: true });
  return p.toBuffer();
}

// ------------------------------------------------------------------ the setting

export const ALIEN_PLANET: Setting = {
  id: 'alien-planet',
  world: 'star-station',
  name: 'Alien planet',
  inspiredBy: 'Made up: an outpost on the moon of a ringed planet, with ideas from real places (craters, mesas, steam vents) and from science fiction.',
  build: buildPlanet,
};

function buildPlanet(ctx: SceneCtx): SettingScene {
  const { lighting, px: T, time } = ctx;
  const { add, prop } = placer(ctx);

  add(groundPiece(lighting, T, paintPlanetGround(T).toCanvas(), 0, 0));
  const skyTex = [0, 1, 2].map((f) => pixelTexture(paintPlanetSky(T, L.w + 12, 9, time, f).toCanvas()));
  const sky = add(billboard(null, T, paintPlanetSky(T, L.w + 12, 9, time, 0).toCanvas(), L.w / 2, L.floorTop - 0.4));

  // the habitat at the end of the walkway, with lit windows after dark
  const habTex = [0, 1].map((f) => pixelTexture(paintHabitat(T, f).toCanvas()));
  const hab = prop(paintHabitat(T, 0).toCanvas(), 21.4, 12.2, 3.6);
  for (const x of [19.6, 23.2]) add(glow(lighting, T, Math.round(T * 1.2), '#ffe9a8', x, 12.2, 1.6, 0.6));
  add(lightPool(lighting, T, 21.4, 12.6, 1.6, '#5fe3ff', 0.3));

  // rocks, crystals and plants
  for (const [x, y, s] of [
    [2.2, 5.6, 0],
    [24.4, 5.2, 1],
    [11.2, 5.4, 2],
    [17.6, 19.6, 1],
    [1.6, 21.6, 0],
  ]) prop(paintRock(T, s).toCanvas(), x, y, 1.6);
  const crystalSpots = [
    [6.2, 6.8, 0],
    [15.4, 6.2, 1],
    [23.6, 17.6, 0],
    [10.2, 19.8, 1],
    [3.4, 12.6, 1],
  ];
  for (const [x, y, s] of crystalSpots) {
    prop(paintCrystals(T, s).toCanvas(), x, y, 1.2);
    add(glow(lighting, T, Math.round(T * 1.6), s % 2 ? '#ff7fc8' : '#5fe3ff', x, y, 0.6, 0.65));
    add(lightPool(lighting, T, x, y, 1.1, s % 2 ? '#ff7fc8' : '#5fe3ff', 0.3));
  }
  for (const [x, y, s] of [
    [8.8, 7.2, 0],
    [19.2, 7.4, 1],
    [13.6, 19.4, 2],
    [24.6, 22.2, 1],
  ]) {
    prop(paintMushroomTree(T, s).toCanvas(), x, y, 1.8);
    add(glow(lighting, T, Math.round(T * 2.2), s % 2 ? '#ffd04a' : '#ff8a4c', x, y, 2.4, 0.45));
  }
  for (const [x, y, s] of [
    [4.6, 9.4, 0],
    [16.6, 9.2, 1],
    [11.6, 16.2, 0],
    [20.6, 15.6, 1],
    [7.6, 21.4, 0],
  ]) {
    prop(paintBulbPlant(T, s).toCanvas(), x, y);
    add(glow(lighting, T, Math.round(T * 0.9), '#7dea8a', x, y, 0.7, 0.7));
  }

  // the landing pad's lights, a rover, crates, the beacon and a vent
  const pad = L.pad;
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    const x = pad.x + Math.cos(a) * pad.r * 0.92;
    const y = pad.y + Math.sin(a) * pad.r * 0.74;
    prop(paintBollard(T).toCanvas(), x, y);
    add(glow(lighting, T, Math.round(T * 0.9), '#5fe3ff', x, y, 0.75, 0.6));
  }
  prop(paintRover(T).toCanvas(), 14.4, 14.4, 2.4);
  prop(paintCrates(T).toCanvas(), 3.0, 17.4, 2.0);
  const beaconTex = [0, 1].map((f) => pixelTexture(paintBeacon(T, f).toCanvas()));
  const beacon = prop(paintBeacon(T, 0).toCanvas(), 9.6, 13.6, 0.8);
  add(glow(lighting, T, Math.round(T * 1.4), '#ff7fc8', 9.6, 13.6, 3.1, 0.8));
  const ventTex = [0, 1, 2].map((f) => pixelTexture(paintVent(T, f).toCanvas()));
  const vent = prop(paintVent(T, 0).toCanvas(), 18.0, 22.4);

  // the helper drone and a friendly critter
  const droneTex = [0, 1].map((f) => pixelTexture(paintDrone(T, f).toCanvas()));
  const drone = prop(paintDrone(T, 0).toCanvas(), 16.2, 11.6, 0, 0.9);
  const droneShadow = add(shadow(T, 0.7));
  droneShadow.position.set(16.2, 0.015, 11.6 * K);
  add(glow(lighting, T, Math.round(T * 1.1), '#5fe3ff', 16.2, 11.6, 0.85, 0.7));
  const critterTex = [0, 1].map((f) => pixelTexture(paintCritter(T, f).toCanvas()));
  const critter = prop(paintCritter(T, 0).toCanvas(), 10.8, 11.2, 0.6);

  return {
    map: { w: L.w, h: L.h },
    focus: { x: 13, feet: 11.6, top: -3.2 },
    clear: time === 'evening' ? '#2a1f4a' : '#6c4f9c',
    spots: { player: { x: 12.4, y: 11.2 }, host: { x: 14.1, y: 10.8 } },
    update(t, camX) {
      swapFrame(sky, skyTex[Math.floor(t * 1.5) % 3]);
      swapFrame(hab, habTex[Math.floor(t * 1.2) % 2]);
      swapFrame(beacon, beaconTex[Math.floor(t * 2) % 2]);
      swapFrame(vent, ventTex[Math.floor(t * 4) % 3]);
      swapFrame(drone, droneTex[Math.floor(t * 8) % 2]);
      drone.position.y = (0.9 + Math.round(Math.sin(t * 2.4) * 2) / T) * K;
      swapFrame(critter, critterTex[t % 2.2 > 1.9 ? 1 : 0]);
      sky.position.x = L.w / 2 + (camX - L.w / 2) * 0.5;
    },
  };
}
