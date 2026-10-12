import type * as THREE from 'three';
import { PixelBuffer } from '../../art/pixel';
import { K } from '../../render/pixelRenderer';
import { pixelTexture } from '../../world/sceneKit';
import { swapFrame } from '../figure';
import { placer } from '../place';
import { Paint, hash, ramp, type Ramp } from '../shade';
import { billboard, glow, groundPiece, lightPool } from '../stage';
import type { SceneCtx, Setting, SettingScene } from '../types';
import { BODY, paintGoodBacteria, paintMucus, paintOxygen, paintRedCell, paintWhiteCell } from './body-art';

/**
 * Star Station setting: inside the body (look development for Body System
 * Heroes). The same world style as the deck and the planet (24 pixels per
 * tile, the 16-bit painter, glows), in soft body colors. The ship is shrunk
 * down and flies freely over the floor of each area, so every area is a wide
 * open space with a wall at the back:
 *
 *   - `body-lungs`: an airway lined with cilia (tiny brushing hairs), opening
 *     into grape-like bunches of air sacs, with oxygen bubbles drifting by
 *   - `body-blood`: inside a blood vessel, red blood cells streaming one way
 *   - `body-stomach`: soft folds, a glowing pool of stomach acid, bits of
 *     food, and the round valve that opens into the small intestine
 *
 * Not in the shared SETTINGS list yet (so the finished games' built files
 * stay byte-for-byte the same); the look development page imports it
 * directly.
 */

export type BodyArea = 'lungs' | 'blood' | 'stomach';
const U = (T: number) => T / 16;
export const BODY_LAYOUT = { w: 26, h: 18, floorTop: 3 };
const L = BODY_LAYOUT;

/** Smooth value noise (0-1) for soft tissue patterns. */
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

/** A branching line of tiny vessels (capillaries) drawn on tissue. */
function capillaries(p: Paint, T: number, seed: number, r: Ramp, count: number): void {
  const u = U(T);
  for (let i = 0; i < count; i++) {
    let x = hash(i, 1, seed) * p.w;
    let y = L.floorTop * T + hash(i, 2, seed) * (p.h - L.floorTop * T);
    let a = hash(i, 3, seed) * Math.PI * 2;
    const len = (4 + hash(i, 4, seed) * 6) * T;
    for (let s = 0; s < len; s += 1) {
      a += (hash(i, s >> 3, seed + 9) - 0.5) * 0.12;
      x += Math.cos(a);
      y += Math.sin(a) * 0.8;
      p.dot(x, y, r, 1);
      if (u >= 1.5 && s % 2) p.dot(x + 1, y, r, 2);
      // little side branches
      if (s % Math.round(T * 1.3) === 0 && s > 0) {
        let bx = x;
        let by = y;
        const ba = a + (hash(i, s, seed + 3) > 0.5 ? 0.9 : -0.9);
        for (let k = 0; k < T * 0.9; k++) {
          bx += Math.cos(ba);
          by += Math.sin(ba) * 0.8;
          p.dot(bx, by, r, 2);
        }
      }
    }
  }
}

// ------------------------------------------------------------------ floors

export function paintBodyFloor(T: number, area: BodyArea): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  const top = L.floorTop * T;
  if (area === 'lungs') {
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const n = blob(x, y, 2 * T, 3) * 0.6 + blob(x, y, 0.5 * T, 4) * 0.4;
        const dith = (x + y) % 2 ? 0.03 : -0.03;
        // a bubbly texture: rings of tiny air sacs
        const cell = 0.7 * T;
        const cx = (x % cell) - cell / 2;
        const cy = (y % cell) - cell / 2;
        const ring = Math.abs(Math.hypot(cx, cy) - cell * 0.36) < 0.6 * u && blob(x, y, 1.2 * T, 13) > 0.55;
        let lv = n + dith > 0.62 ? 3 : n + dith < 0.34 ? 1 : 2;
        if (ring && lv === 3) lv = 2;
        p.dot(x, y, n > 0.5 ? BODY.lung : BODY.tissue, lv);
      }
    capillaries(p, T, 11, BODY.vein, 14);
    // the airway: a darker channel across the middle, lined with cilia
    const mid = (x: number) => top + 7.6 * T + Math.sin(x / (5 * T)) * 1.2 * T;
    for (let x = 0; x < W; x++) {
      const m = mid(x);
      for (let y = Math.round(m - 1.4 * T); y < m + 1.4 * T; y++) {
        const d = Math.abs(y - m) / (1.4 * T);
        p.dot(x, y, BODY.tissue2, d > 0.85 ? 1 : d > 0.6 ? 2 : 3);
      }
      // cilia: rows of tiny hairs leaning the same way (they sweep mucus out)
      if (x % Math.round(2 * u) === 0)
        for (const side of [-1, 1]) {
          const y0 = m + side * 1.25 * T;
          for (let k = 0; k < Math.round(4 * u); k++) p.dot(x + Math.round(k * 0.4), y0 - side * k, BODY.lung, 4);
        }
    }
  } else if (area === 'blood') {
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const n = blob(x, y, 2.5 * T, 5) * 0.7 + blob(x, y, 0.8 * T, 6) * 0.3;
        const dith = (x + y) % 2 ? 0.03 : -0.03;
        // smooth ridges along the vessel, the way the blood flows
        const ridge = Math.sin(y / (1.1 * T) + Math.sin(x / (7 * T)) * 1.5);
        let lv = n + dith > 0.6 ? 2 : 1;
        if (ridge > 0.82) lv += 1;
        if (ridge < -0.9) lv -= 1;
        p.dot(x, y, n > 0.45 ? BODY.vessel : BODY.vessel2, Math.max(0, lv));
      }
    // flow streaks (which way the blood goes: to the right)
    for (let i = 0; i < 70; i++) {
      const x = hash(i, 1, 31) * W;
      const y = top + hash(i, 2, 31) * (H - top);
      const len = (1 + hash(i, 3, 31)) * T;
      for (let k = 0; k < len; k++) p.dot(x + k, y, BODY.vessel, k > len - 3 * u ? 4 : 3);
    }
  } else {
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const n = blob(x, y, 2 * T, 7) * 0.6 + blob(x, y, 0.6 * T, 8) * 0.4;
        const dith = (x + y) % 2 ? 0.03 : -0.03;
        // rugae: the stomach's soft folds, which let it stretch when it is full
        const fold = Math.sin(x / (1.5 * T) + Math.sin(y / (3 * T)) * 2.2);
        let lv = n + dith > 0.6 ? 3 : n + dith < 0.32 ? 1 : 2;
        if (fold > 0.9) lv = Math.min(4, lv + 1);
        else if (fold < -0.92) lv = Math.max(1, lv - 1);
        // mostly one color; the deeper red only in the folds' creases
        p.dot(x, y, fold < -0.85 ? BODY.stomach2 : BODY.stomach, Math.max(1, Math.min(3, lv)));
      }
    // the pool of stomach acid (strong enough to help break down food)
    const ax = 13 * T;
    const ay = top + 9.6 * T;
    for (let y = Math.round(ay - 3 * T); y < ay + 3 * T; y++)
      for (let x = Math.round(ax - 6 * T); x < ax + 6 * T; x++) {
        const d = Math.hypot((x - ax) / (5.4 * T), (y - ay) / (2.5 * T)) + (blob(x, y, T, 12) - 0.5) * 0.12;
        if (d > 1) continue;
        const ripple = Math.sin(Math.hypot(x - ax, (y - ay) * 2) / (2.2 * u));
        p.dot(x, y, BODY.acid, d > 0.92 ? 1 : ripple > 0.85 ? 4 : d < 0.5 ? 3 : 2);
      }
  }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the back walls

/** The back wall of each area (a curved tissue wall above row 0, with openings). */
export function paintBodyWall(T: number, area: BodyArea, frame = 0): PixelBuffer {
  const W = (L.w + 12) * T;
  const H = 7 * T;
  const p = new Paint(W, H);
  const base = area === 'lungs' ? BODY.lung : area === 'blood' ? BODY.vessel : BODY.stomach;
  const base2 = area === 'lungs' ? BODY.tissue : area === 'blood' ? BODY.vessel2 : BODY.stomach2;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = blob(x, y, 1.5 * T, 21) * 0.7 + blob(x, y, 0.5 * T, 22) * 0.3;
      // darker toward the top (the wall curves away), lit near the floor
      const v = y / H;
      let lv = v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.8 ? 2 : 3;
      if (n > 0.66) lv = Math.min(4, lv + 1);
      p.dot(x, y, n > 0.5 ? base : base2, lv);
    }
  // openings into the next part of the body: dark round tunnels with a glow at the rim
  const holes: Array<[number, number, number]> =
    area === 'lungs'
      ? [
          [8, 3.4, 1.6],
          [19, 3.0, 2.2],
          [30, 3.6, 1.4],
        ]
      : area === 'blood'
        ? [
            [12, 3.2, 2.4],
            [27, 3.6, 1.6],
          ]
        : [[9, 2.6, 2.0]];
  for (const [hx, hy, r] of holes) {
    const cx = hx * T;
    const cy = hy * T;
    for (let y = Math.round(cy - r * T * 1.2); y < cy + r * T * 1.2; y++)
      for (let x = Math.round(cx - r * T * 1.2); x < cx + r * T * 1.2; x++) {
        const d = Math.hypot((x - cx) / (r * T), (y - cy) / (r * T * 0.8));
        if (d > 1.15) continue;
        if (d > 0.95) p.dot(x, y, base, 4);
        else p.dot(x, y, base2, d > 0.75 ? 1 : 0);
      }
  }
  // glistening highlights (the inside of the body is wet)
  for (let i = 0; i < 80; i++) {
    const x = hash(i, 1, 41) * W;
    const y = (0.3 + hash(i, 2, 41) * 0.65) * H;
    if ((i + frame) % 5 === 0) p.pix(x, y, '#ffffff');
    else p.dot(x, y, base, 4);
  }
  // the vessel wall pulses with each heartbeat: a lighter band on frame 1
  if (area === 'blood' && frame % 2) p.relevel((_x, y, lv) => y > H * 0.55 && lv < 4, 1);
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ props

/** A bunch of air sacs (alveoli): where oxygen goes from the air into the blood (about 2.5 tiles). */
export function paintAlveoli(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(40 * u), Math.round(40 * u));
  // a tiny airway leads in from the side
  p.capsule(S(2), S(30), S(12), S(26), S(2.6), BODY.tissue2, { sep: true });
  const sacs: Array<[number, number, number]> = [];
  for (let k = 0; k < 11; k++) {
    const a = (k / 11) * Math.PI * 2 + seed;
    const r = k % 3 === 0 ? 0 : 7 + (k % 2) * 4;
    sacs.push([20 + Math.cos(a) * r * 1.15, 24 + Math.sin(a) * r * 0.7, 6 + (k % 3)]);
  }
  sacs.sort((a, b) => a[1] - b[1]);
  for (const [x, y, r] of sacs) p.ellipse(S(x), S(y), S(r), S(r), BODY.lung, { sep: true, box: [S(x - r), S(y - r), S(r * 2), S(r * 2)] });
  // capillaries wrapped round the sacs (blue-violet: blood picking up oxygen)
  for (const [x, y, r] of sacs.slice(-6)) for (let a = 0; a < Math.PI; a += 0.08) p.dot(S(x) + Math.cos(a + seed) * S(r * 0.8), S(y) + Math.sin(a + seed) * S(r * 0.5), BODY.vein, 2);
  return p.toBuffer();
}

/** A bit of food in the stomach: 0 = bread, 1 = apple, 2 = carrot. */
export function paintFoodBit(T: number, kind = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(16 * u), Math.round(14 * u));
  if (kind === 0) {
    p.poly(
      [
        [S(2), S(11)],
        [S(4), S(3)],
        [S(12), S(2)],
        [S(14), S(10)],
      ],
      ramp('#e8b86a'),
      { sep: true },
    );
    p.line(S(4), S(3), S(12), S(2), ramp('#a8662a'), 2);
  } else if (kind === 1) {
    p.ellipse(S(8), S(8), S(6), S(4.6), ramp('#fff1c4'), { sep: true });
    p.rect(S(2), S(3.6), S(12), S(2), ramp('#e04a4a'), { form: 'flat', level: 2, onlyOver: true });
  } else {
    p.capsule(S(3), S(9), S(13), S(6), S(3), ramp('#ff8a3c'), { sep: true });
    for (const x of [6, 9]) p.line(S(x), S(6), S(x + 0.6), S(10), ramp('#ff8a3c'), 1, { onlyOver: true });
  }
  return p.toBuffer();
}

/** The valve at the end of the stomach (it opens to let food into the small intestine). */
export function paintValve(T: number, open = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(32 * u), Math.round(30 * u));
  p.ellipse(S(16), S(16), S(14), S(12.5), BODY.stomach2, { sep: true });
  for (let a = 0; a < Math.PI * 2; a += 0.35) p.line(S(16) + Math.cos(a) * S(5), S(16) + Math.sin(a) * S(4.5), S(16) + Math.cos(a) * S(12.5), S(16) + Math.sin(a) * S(11), BODY.stomach2, 3, { onlyOver: true });
  p.ellipse(S(16), S(16), S(open ? 6 : 3.2), S(open ? 5.2 : 2.6), BODY.vessel2, { form: 'flat', level: 0 });
  return p.toBuffer();
}

/** A bubble rising out of the stomach acid. */
function paintAcidBubble(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(8 * u), Math.round(8 * u));
  p.ellipse(S(4), S(4), S(frame ? 3 : 2), S(frame ? 3 : 2), BODY.acid, { form: 'sphere', bias: 0.15 });
  p.pix(S(3), S(3), '#ffffff');
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the settings

function setting(area: BodyArea, name: string): Setting {
  return {
    id: `body-${area}`,
    world: 'star-station',
    name,
    inspiredBy: 'The human body, shown much bigger than life and simplified for children (checked against NIH MedlinePlus and Nemours KidsHealth).',
    build: (ctx) => buildBody(ctx, area),
  };
}

export const BODY_LUNGS = setting('lungs', 'Inside the body: the lungs');
export const BODY_BLOOD = setting('blood', 'Inside the body: a blood vessel');
export const BODY_STOMACH = setting('stomach', 'Inside the body: the stomach');
export const BODY_SETTINGS = [BODY_LUNGS, BODY_BLOOD, BODY_STOMACH];

interface Drifter {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  lift: number;
  speed: number;
  frames: THREE.Texture[];
  phase: number;
}

function buildBody(ctx: SceneCtx, area: BodyArea): SettingScene {
  const { lighting, px: T } = ctx;
  const { add, prop } = placer(ctx);
  const tex = (b: PixelBuffer) => pixelTexture(b.toCanvas());

  add(groundPiece(lighting, T, paintBodyFloor(T, area).toCanvas(), 0, 0));
  const wallTex = [0, 1].map((f) => tex(paintBodyWall(T, area, f)));
  const wall = add(billboard(lighting, T, paintBodyWall(T, area, 0).toCanvas(), L.w / 2, L.floorTop - 0.3));

  const drifters: Drifter[] = [];
  const drift = (frames: PixelBuffer[], x: number, y: number, lift: number, speed: number, phase: number) => {
    const m = prop(frames[0].toCanvas(), x, y, 0, lift);
    drifters.push({ mesh: m, x, y, lift, speed, frames: frames.map(tex), phase });
  };
  const anim: Array<(t: number) => void> = [];

  if (area === 'lungs') {
    for (const [x, y, s] of [
      [3.2, 6.2, 0],
      [9.4, 5.6, 1],
      [17.6, 5.8, 2],
      [23.4, 6.4, 3],
      [5.2, 16.6, 4],
      [14.4, 17.2, 5],
      [22.0, 16.8, 6],
    ]) {
      prop(paintAlveoli(T, s).toCanvas(), x, y, 2.0);
      add(lightPool(lighting, T, x, y - 0.6, 1.4, '#ff9fb0', 0.25));
    }
    for (const [x, y, s] of [
      [7.4, 10.8, 0],
      [19.6, 11.6, 1],
    ])
      prop(paintMucus(T, s).toCanvas(), x, y, 1.1);
    // oxygen bubbles drifting along the airway
    for (let i = 0; i < 14; i++) drift([paintOxygen(T, 0), paintOxygen(T, 1)], hash(i, 1, 51) * L.w, L.floorTop + 5.5 + hash(i, 2, 51) * 4.5, 0.6 + hash(i, 3, 51) * 1.4, 0.6 + hash(i, 4, 51) * 0.5, i);
  } else if (area === 'blood') {
    // red blood cells streaming to the right (blood flows one way), a white blood cell on patrol
    for (let i = 0; i < 26; i++) drift([0, 1, 2].map((k) => paintRedCell(T, (k + i) % 3)), hash(i, 1, 61) * L.w, L.floorTop + 1.5 + hash(i, 2, 61) * 13, 0.3 + hash(i, 3, 61) * 1.6, 1.4 + hash(i, 4, 61) * 1.2, i);
    const wbcTex = [0, 1].map((f) => tex(paintWhiteCell(T, f)));
    const wbc = prop(paintWhiteCell(T, 0).toCanvas(), 6, 12, 1.2, 0.4);
    anim.push((t) => {
      swapFrame(wbc, wbcTex[Math.floor(t * 2) % 2]);
      wbc.position.x = Math.round((6 + Math.sin(t * 0.3) * 3) * T) / T;
    });
  } else {
    for (const [x, y, k] of [
      [5.6, 7.6, 0],
      [20.4, 7.2, 1],
      [8.2, 16.6, 2],
      [18.8, 16.2, 0],
      [3.4, 12.4, 1],
    ])
      prop(paintFoodBit(T, k).toCanvas(), x, y, 0.9);
    const valveTex = [0, 1].map((f) => tex(paintValve(T, f)));
    const valve = prop(paintValve(T, 0).toCanvas(), 24.4, 11.2, 1.6);
    anim.push((t) => swapFrame(valve, valveTex[t % 6 > 4.5 ? 1 : 0]));
    add(glow(lighting, T, Math.round(T * 6), '#c6e85a', 13, L.floorTop + 9.6, 0.2, 0.45));
    add(lightPool(lighting, T, 13, L.floorTop + 9.6, 5, '#c6e85a', 0.3));
    // bubbles rising out of the acid
    for (let i = 0; i < 8; i++) {
      const bx = 9 + hash(i, 1, 71) * 8;
      const by = L.floorTop + 8.4 + hash(i, 2, 71) * 2.4;
      const frames = [0, 1].map((f) => tex(paintAcidBubble(T, f)));
      const m = prop(paintAcidBubble(T, 0).toCanvas(), bx, by, 0, 0);
      anim.push((t) => {
        const c = (t * 0.6 + hash(i, 3, 71) * 3) % 3;
        m.position.y = (Math.round(c * 0.5 * T) / T) * K;
        swapFrame(m, frames[c > 1.6 ? 1 : 0]);
        m.visible = c < 2.4;
      });
    }
    // good gut bacteria wait by the valve, where the small intestine starts
    for (const [x, y] of [
      [22.0, 14.2],
      [23.4, 15.6],
    ]) {
      const f = [0, 1].map((k) => tex(paintGoodBacteria(T, k)));
      const m = prop(paintGoodBacteria(T, 0).toCanvas(), x, y, 0.8, 0.3);
      anim.push((t) => swapFrame(m, f[Math.floor(t * 2 + y) % 2]));
    }
  }

  return {
    map: { w: L.w, h: L.h },
    focus: { x: 13, feet: 15.5, top: -1.2 },
    clear: area === 'blood' ? '#4a1424' : '#5a2236',
    walk: { x0: 0.6, y0: L.floorTop + 0.6, x1: L.w - 0.6, y1: L.h - 0.4 },
    blocks: [],
    spots: { player: { x: 12, y: L.floorTop + 7.4 }, host: { x: 13.6, y: L.floorTop + 6.8 } },
    update(t) {
      swapFrame(wall, wallTex[area === 'blood' ? (t % 1 < 0.18 ? 1 : 0) : Math.floor(t * 1.2) % 2]);
      for (const d of drifters) {
        const x = (((d.x + t * d.speed) % (L.w + 2)) + L.w + 2) % (L.w + 2) - 1;
        const bob = Math.round(Math.sin(t * 1.4 + d.phase) * 0.15 * T) / T;
        d.mesh.position.set(Math.round(x * T) / T, (d.lift + bob) * K, d.y * K);
        swapFrame(d.mesh, d.frames[Math.floor(t * 3 + d.phase) % d.frames.length]);
      }
      for (const a of anim) a(t);
    },
  };
}

