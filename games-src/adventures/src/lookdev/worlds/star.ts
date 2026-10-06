import { PixelBuffer } from '../../kit/art/pixel';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';

/**
 * Star Station (sci-fi world) test art for W0. Every painter takes `T`, the
 * world's pixels per tile (16, 24 or 32); designs are written at 16 per tile
 * and scaled by u = T / 16, so detail grows with T.
 *
 * The look: a friendly, bright space station. Steel-lavender deck plates,
 * a teal walkway with light strips, a huge window onto a purple nebula and
 * a ringed planet, neon accents (cyan, magenta, amber), and plants in domes.
 */

export const STAR = {
  deck: ramp('#5d6a8e'),
  deck2: ramp('#55628a'),
  wall: ramp('#3f4b72'),
  trim: ramp('#8c98bd'),
  dark: ramp('#262c45'),
  walk: ramp('#2e8f9c'),
  hazard: ramp('#f2c14c'),
  cyan: ramp('#4fd6ff'),
  magenta: ramp('#ff5fa8'),
  amber: ramp('#ffb547'),
  lime: ramp('#7dea8a'),
  white: ramp('#e7ecf6'),
  orange: ramp('#ef8a3c'),
  glass: ramp('#2a3a5e'),
  leaf: ramp('#3fae6a'),
  leaf2: ramp('#a463d8'),
  soil: ramp('#6a4a3a'),
  neonCyan: '#7ff0ff',
  neonPink: '#ff8fd0',
} as const;

const U = (T: number) => T / 16;

// ------------------------------------------------------------------ floor

export interface StarLayout {
  w: number;
  h: number;
  /** First floor row in front of the wall. */
  floorTop: number;
  walkways: Array<[number, number]>;
  ring: { x: number; y: number; r: number };
}

export const STAR_LAYOUT: StarLayout = { w: 26, h: 24, floorTop: 4, walkways: [[9, 10], [18, 19]], ring: { x: 19.5, y: 14.2, r: 1.9 } };

export function paintStarFloor(T: number, L: StarLayout = STAR_LAYOUT): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = L.h * T;
  const p = new Paint(W, H);
  const s = STAR;
  const bev = Math.max(1, Math.round(u));
  for (let y = 0; y < H; y++) {
    const ty = Math.floor(y / T);
    for (let x = 0; x < W; x++) {
      const tx = Math.floor(x / T);
      if (ty < L.floorTop) {
        p.dot(x, y, s.dark, 0);
        continue;
      }
      const wk = L.walkways.find(([a, b]) => ty >= a && ty <= b);
      const walk = !!wk && tx >= 1 && tx < L.w - 1;
      // panels are 2x2 tiles (1x1 on the walkway), with a bevel and a seam
      const pw = walk ? T : T * 2;
      const lx = walk ? x % T : x % pw;
      const ly = walk ? y % T : (y - L.floorTop * T) % pw;
      const r: Ramp = walk ? s.walk : ((Math.floor(x / pw) + Math.floor((y - L.floorTop * T) / pw)) % 2 ? s.deck : s.deck2);
      let lv = 2;
      if (lx < bev || ly < bev) lv = 3;
      if (lx >= pw - bev * 2 || ly >= pw - bev * 2) lv = 1;
      if (lx === pw - 1 || ly === pw - 1) lv = 0;
      // a brushed-metal speckle on big plates
      if (lv === 2 && !walk) {
        if (hash(x, y, 3) < 0.012) lv = 3;
      }
      p.dot(x, y, r, lv);
    }
  }
  // a soft shadow along the foot of the wall
  for (let y = L.floorTop * T; y < (L.floorTop + 0.45) * T; y++)
    for (let x = 0; x < W; x++) {
      const k = (y - L.floorTop * T) / (0.45 * T);
      if (k < 0.5 || (k < 0.85 && (x + y) % 2 === 0)) p.setLevel(x, y, Math.max(0, p.levelAt(x, y) - 1));
    }
  // light inlays: some panels have a glowing colored square in the middle
  const inlay = [STAR.cyan, STAR.magenta, STAR.amber, STAR.lime];
  for (let py = L.floorTop; py < L.h; py += 2)
    for (let px = 0; px < L.w; px += 2) {
      if (L.walkways.some(([a, b]) => py <= b && py + 1 >= a)) continue;
      if (hash(px, py, 21) > 0.22) continue;
      const r = inlay[Math.floor(hash(px, py, 22) * 4)];
      const x0 = px * T + T - 5 * u;
      const y0 = py * T + T - 5 * u;
      p.rect(x0 - u, y0 - u, 12 * u, 12 * u, s.dark, { level: 1 });
      p.rect(x0, y0, 10 * u, 10 * u, r, { form: 'sphere', box: [x0, y0, 10 * u, 10 * u], bias: 0.2 });
      p.rect(x0 + 2 * u, y0 + 2 * u, 2 * u, 2 * u, r, { level: 4 });
    }
  // floor arrows pointing to the door and the dock
  for (const [ax, ay] of [
    [21.5, 6.5],
    [8.5, 21.5],
  ]) {
    const cx = ax * T;
    const cy = ay * T;
    for (let i = 0; i < 7 * u; i++)
      for (let k = 0; k < 2 * u; k++) {
        p.dot(cx + i - k, cy - 7 * u + i, s.hazard, 2);
        p.dot(cx + i - k, cy + 7 * u - i, s.hazard, 2);
      }
  }
  // rivets at the panel corners
  const step = T * 2;
  for (let py = L.floorTop * T; py < H; py += step)
    for (let px = 0; px < W; px += step)
      for (const [cx, cy] of [
        [px + 3 * u, py + 3 * u],
        [px + step - 4 * u, py + 3 * u],
        [px + 3 * u, py + step - 4 * u],
        [px + step - 4 * u, py + step - 4 * u],
      ]) {
        const ty = Math.floor(cy / T);
        if (L.walkways.some(([a, b]) => ty >= a && ty <= b)) continue;
        p.dot(cx, cy, s.trim, 4);
        if (u >= 1.5) {
          p.dot(cx + 1, cy + 1, s.deck, 0);
          p.dot(cx + 1, cy, s.trim, 2);
        }
      }
  // floor grates near the wall
  for (const gx of [2, 5, 15, 22]) {
    const x0 = gx * T + 2 * u;
    const y0 = (L.floorTop + 1) * T + 2 * u;
    const gw = T - 4 * u;
    p.rect(x0, y0, gw, gw, s.dark, { level: 1 });
    for (let yy = y0 + u; yy < y0 + gw - u; yy += Math.max(2, Math.round(2 * u))) p.line(x0 + u, yy, x0 + gw - u - 1, yy, s.dark, 0);
    p.line(x0, y0, x0 + gw - 1, y0, s.trim, 1);
  }
  // walkways: chevrons and light strips along both edges
  for (const [r0, r1] of L.walkways) {
    const wy0 = r0 * T;
    const wy1 = (r1 + 1) * T;
    for (let tx = 2; tx < L.w - 2; tx += 2) {
      const cx = tx * T + T / 2;
      const cy = (wy0 + wy1) / 2;
      for (let i = 0; i < 4 * u; i++) {
        p.dot(cx + i - 2 * u, cy - 3 * u + i, s.walk, 4);
        p.dot(cx + i - 2 * u, cy + 3 * u - i, s.walk, 4);
      }
    }
    const strip = Math.max(1, Math.round(u));
    for (let x = T; x < W - T; x++) {
      const c = x % (T / 2) < T / 4 ? STAR.neonCyan : mixHex(STAR.neonCyan, '#3d9bc0', 0.4);
      for (let k = 0; k < strip; k++) {
        p.pix(x, wy0 + k, c);
        p.pix(x, wy1 - 1 - k, c);
      }
    }
  }
  // the docking ring: hazard stripes around a dark pad with a planet badge
  const rc = L.ring;
  const cx = rc.x * T;
  const cy = rc.y * T;
  const R1 = rc.r * T;
  const R0 = R1 - 4 * u;
  for (let y = Math.floor(cy - R1); y <= cy + R1; y++)
    for (let x = Math.floor(cx - R1); x <= cx + R1; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > R1) continue;
      if (d > R0) {
        const stripe = Math.floor((x + y) / Math.max(3, Math.round(3 * u))) % 2;
        const lit = y < cy - R0 * 0.3 ? 1 : x > cx ? -1 : 0;
        p.dot(x, y, stripe ? s.hazard : s.dark, (stripe ? 2 : 1) + lit);
      } else p.dot(x, y, s.dark, d > R0 - 2 * u ? 1 : 2);
    }
  const pr = Math.round(R0 * 0.38);
  p.ellipse(cx, cy, pr, pr, s.cyan, { form: 'sphere' });
  for (let x = -pr * 1.7; x <= pr * 1.7; x++) p.dot(cx + x, cy + x * 0.25, s.cyan, 4);
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the back wall with its window

export const WALL_TILES = 5;
export const WINDOW = { x0: 3.5, x1: 21.5, y0: 0.85, y1: 3.95 };

export function paintStarWall(T: number, frame = 0, L: StarLayout = STAR_LAYOUT): PixelBuffer {
  const u = U(T);
  const W = L.w * T;
  const H = WALL_TILES * T;
  const p = new Paint(W, H);
  const s = STAR;
  const bev = Math.max(1, Math.round(u));
  const inWindow = (x: number, y: number) => x >= WINDOW.x0 * T && x < WINDOW.x1 * T && y >= WINDOW.y0 * T && y < WINDOW.y1 * T;
  // wall panels, 2 tiles wide
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (inWindow(x, y)) continue;
      const lx = x % (T * 2);
      let lv = 2;
      if (lx < bev) lv = 3;
      if (lx >= T * 2 - bev * 2) lv = 1;
      if (lx === T * 2 - 1) lv = 0;
      if (y > H - T * 0.55) lv = Math.max(0, lv - 1);
      p.dot(x, y, s.wall, lv);
    }
  // ceiling band with little lights
  p.rect(0, 0, W, Math.round(0.55 * T), s.dark, { level: 1 });
  p.rect(0, Math.round(0.55 * T), W, bev, s.trim, { level: 2 });
  for (let x = T / 2; x < W; x += T) p.fillPix(x, Math.round(0.25 * T), Math.max(1, Math.round(2 * u)), Math.max(1, Math.round(u)), frame % 2 && x % (T * 3) === T / 2 ? '#ffe9a8' : STAR.neonCyan);
  // floor kick plate with a hazard edge
  const ky = H - Math.round(0.45 * T);
  for (let y = ky; y < H; y++)
    for (let x = 0; x < W; x++) {
      const stripe = Math.floor((x + y) / Math.max(3, Math.round(4 * u))) % 2;
      p.dot(x, y, stripe ? s.hazard : s.dark, y === ky ? 3 : 1);
    }
  // the window frame: thick, light steel, with rivets and mullions
  const fx0 = WINDOW.x0 * T;
  const fx1 = WINDOW.x1 * T;
  const fy0 = WINDOW.y0 * T;
  const fy1 = WINDOW.y1 * T;
  const fw = Math.round(3 * u);
  const frameRect = (x: number, y: number, w: number, h: number) => p.rect(x, y, w, h, s.trim, { form: 'cylV', box: [x, y, w, h] });
  frameRect(fx0 - fw, fy0 - fw, fx1 - fx0 + fw * 2, fw);
  frameRect(fx0 - fw, fy1, fx1 - fx0 + fw * 2, fw);
  frameRect(fx0 - fw, fy0, fw, fy1 - fy0);
  frameRect(fx1, fy0, fw, fy1 - fy0);
  for (let k = 1; k < 4; k++) {
    const mx = Math.round(fx0 + ((fx1 - fx0) * k) / 4 - fw / 2);
    frameRect(mx, fy0, fw, fy1 - fy0);
  }
  for (let x = fx0; x < fx1; x += T) {
    p.dot(x, fy0 - fw + 1, s.trim, 4);
    p.dot(x, fy1 + 1, s.trim, 4);
  }
  // a neon strip under the window
  for (let x = fx0 - fw; x < fx1 + fw; x++) for (let k = 0; k < Math.max(1, Math.round(u)); k++) p.pix(x, fy1 + fw + k, STAR.neonPink);

  // pipes and a gauge on the left
  const pipe = (x: number, r: Ramp) => p.rect(x, 0.6 * T, 2.2 * u, H - 1.1 * T, r, { form: 'cylV', box: [x, 0, 2.2 * u, H] });
  pipe(0.5 * T, s.trim);
  pipe(0.5 * T + 3.5 * u, s.orange);
  for (const y of [1.6 * T, 3.2 * T]) p.rect(0.5 * T - u, y, 6.5 * u, 2 * u, s.dark, { form: 'cylH', box: [0, y, 1, 2 * u] });
  p.ellipse(2.2 * T, 2.0 * T, 5 * u, 5 * u, s.white, { sep: true });
  p.ellipse(2.2 * T, 2.0 * T, 3.6 * u, 3.6 * u, s.dark, { form: 'flat', level: 3 });
  p.line(2.2 * T, 2.0 * T, 2.2 * T + 2.5 * u, 2.0 * T - 1.5 * u, s.magenta, 3);
  // a wall screen showing a little chart
  const sx = 1.2 * T;
  const sy = 2.9 * T;
  p.rect(sx - u, sy - u, 2.1 * T + 2 * u, 0.85 * T + 2 * u, s.trim, { level: 1 });
  p.rect(sx, sy, 2.1 * T, 0.85 * T, s.glass, { level: 1 });
  for (let i = 0; i < 6; i++) {
    const bh = Math.round((0.2 + ((i * 37 + frame * 13) % 10) / 16) * 0.7 * T);
    p.rect(sx + 2 * u + i * 5 * u, sy + 0.8 * T - bh, 3 * u, bh, i % 2 ? s.cyan : s.lime, { level: 3 });
  }

  // the sliding door on the right, with a light above it
  const dx0 = 22.8 * T;
  const dx1 = 25.2 * T;
  const dy0 = 1.35 * T;
  p.rect(dx0 - fw, dy0 - fw, dx1 - dx0 + fw * 2, H - dy0 + fw, s.trim, { form: 'cylV', box: [dx0 - fw, 0, dx1 - dx0 + fw * 2, H] });
  const half = (dx1 - dx0) / 2;
  [0, 1].forEach((k) => {
    const x0 = dx0 + k * half;
    p.rect(x0, dy0, half - u, H - dy0, s.white, { form: 'cylV', box: [x0, dy0, half, H - dy0] });
    for (let y = dy0 + 0.9 * T; y < dy0 + 1.25 * T; y++) for (let x = x0; x < x0 + half - u; x++) p.dot(x, y, Math.floor((x + y) / (3 * u)) % 2 ? s.hazard : s.dark, 2);
    p.rect(x0 + (k ? 2 * u : half - 5 * u), dy0 + 1.6 * T, 2 * u, 0.7 * T, s.trim, { level: 1 });
  });
  p.line(dx0 + half - u, dy0, dx0 + half - u, H - 1, s.dark, 0);
  p.fillPix(dx0 + half - 3 * u, dy0 - fw - 3 * u, 5 * u, 2 * u, frame % 2 ? STAR.neonCyan : '#8dffb0');
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ space, seen through the window

/** Smooth value noise in 0..1 (for nebula clouds). */
function noise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const sm = (t: number) => t * t * (3 - 2 * t);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * sm(xf) + (c - a) * sm(yf) + (a - b - c + d) * sm(xf) * sm(yf);
}

export function paintSpace(T: number, wTiles: number, hTiles: number, frame = 0): PixelBuffer {
  const u = U(T);
  const W = Math.round(wTiles * T);
  const H = Math.round(hTiles * T);
  const p = new Paint(W, H);
  const sky = ['#0a0c24', '#0f1130', '#15163d', '#1c1a4a', '#241e56'];
  const neb = ramp('#7a3fa8', { spread: 1.1 });
  const neb2 = ramp('#d0609e');
  const neb3 = ramp('#2f8fb0');
  const cell = 9 * u;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      // dithered bands from deep navy to violet
      const t = (y / H) * (sky.length - 1);
      let band = Math.floor(t);
      if (t - band > 0.75 && (x + y) % 2) band++;
      p.pix(x, y, sky[Math.min(sky.length - 1, band)]);
      // nebula clouds: fractal noise stretched sideways into wisps
      const n = noise(x / (cell * 5), y / (cell * 2), 5) * 0.55 + noise(x / (cell * 2), y / cell, 9) * 0.3 + noise(x / cell, y / (cell * 0.6), 13) * 0.15;
      const m = noise(x / (cell * 6) + 7, y / (cell * 3), 2);
      const dith = (x + y) % 2 ? 0.012 : -0.012;
      const v = n + dith;
      if (v > 0.56) p.dot(x, y, m > 0.62 ? neb3 : neb, v > 0.72 ? 2 : v > 0.64 ? 1 : 0);
      if (v > 0.7 && m < 0.45) p.dot(x, y, neb2, v > 0.78 ? 2 : 1);
    }
  // stars, some twinkling
  for (let i = 0; i < W * H * 0.004; i++) {
    const x = Math.floor(hash(i, 1, 11) * W);
    const y = Math.floor(hash(i, 2, 11) * H);
    const big = hash(i, 3, 11) > 0.93 && u >= 1;
    const tw = hash(i, 4, 11) > 0.6 && (frame + i) % 3 === 0;
    const c = ['#ffffff', '#cfe8ff', '#fff1c4', '#ffd0f0'][i % 4];
    p.pix(x, y, tw ? mixHex(c, '#3a3a70', 0.5) : c);
    if (big && !tw) {
      p.pix(x - 1, y, mixHex(c, '#3a3a70', 0.4));
      p.pix(x + 1, y, mixHex(c, '#3a3a70', 0.4));
      p.pix(x, y - 1, mixHex(c, '#3a3a70', 0.4));
      p.pix(x, y + 1, mixHex(c, '#3a3a70', 0.4));
    }
  }
  // a ringed planet
  const pcx = W * 0.62;
  const pcy = H * 0.5;
  const pr = 1.45 * T;
  const ringR = ramp('#f2d39a');
  const ring = (front: boolean) => {
    for (let y = Math.floor(pcy - pr); y < pcy + pr; y++)
      for (let x = Math.floor(pcx - pr * 2); x < pcx + pr * 2; x++) {
        const dx = (x + 0.5 - pcx) / (pr * 1.85);
        const dy = (y + 0.5 - pcy) / (pr * 0.42);
        const d = dx * dx + dy * dy;
        const ix = (x + 0.5 - pcx) / (pr * 1.35);
        const iy = (y + 0.5 - pcy) / (pr * 0.28);
        if (d > 1 || ix * ix + iy * iy < 1) continue;
        if (front !== y + 0.5 > pcy) continue;
        p.dot(x, y, ringR, d > 0.8 ? 1 : x < pcx ? 3 : 2);
      }
  };
  ring(false);
  const planet = ramp('#e8894a');
  const bands = ramp('#c95f3a');
  p.ellipse(pcx, pcy, pr, pr, planet, { dither: true });
  for (let y = Math.floor(pcy - pr); y < pcy + pr; y++)
    if (Math.floor((y - pcy) / (2.2 * u) + 10) % 3 === 0)
      for (let x = Math.floor(pcx - pr); x < pcx + pr; x++) {
        const r = p.rampAt(x, y);
        if (r === planet) p.dot(x, y, bands, p.levelAt(x, y));
      }
  ring(true);
  // a little moon with craters
  const mx = W * 0.22;
  const my = H * 0.3;
  const mr = 0.55 * T;
  const moon = ramp('#a9b4d6');
  p.ellipse(mx, my, mr, mr, moon, { dither: true });
  [
    [-0.3, -0.2, 0.22],
    [0.25, 0.25, 0.16],
    [0.1, -0.4, 0.1],
  ].forEach(([ox, oy, r]) => p.ellipse(mx + ox * mr, my + oy * mr, r * mr, r * mr, moon, { onlyOver: true, bias: -0.5 }));
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ props

/** A control console with a tilted screen and blinking buttons (2 tiles wide). */
export function paintConsole(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(34 * u), Math.round(32 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  // the desk body
  p.poly(
    [
      [S(2), S(15)],
      [S(32), S(15)],
      [S(31), S(31)],
      [S(3), S(31)],
    ],
    s.trim,
    { form: 'cylV', box: [S(2), S(15), S(30), S(16)] },
  );
  p.rect(S(2), S(13), S(30), S(3), s.white, { form: 'cylV', box: [S(2), S(13), S(30), S(3)] });
  p.rect(S(5), S(20), S(24), S(8), s.dark, { level: 2 });
  for (let i = 0; i < 5; i++) p.rect(S(7 + i * 4.5), S(22), S(2.5), S(4), s.wall, { level: 3 });
  // buttons on top
  const btn = [s.magenta, s.amber, s.lime, s.cyan];
  for (let i = 0; i < 6; i++) {
    const on = (i + frame) % 3 !== 0;
    p.ellipse(S(6 + i * 4.4), S(14.4), S(1.2), S(0.9), btn[i % 4], { form: 'flat', level: on ? 4 : 1 });
  }
  // the tilted screen with a graph and a planet icon
  p.poly(
    [
      [S(5), S(2)],
      [S(29), S(2)],
      [S(30), S(13)],
      [S(4), S(13)],
    ],
    s.trim,
    { sep: true, form: 'cylV' },
  );
  p.poly(
    [
      [S(6.5), S(3.5)],
      [S(27.5), S(3.5)],
      [S(28.3), S(11.8)],
      [S(5.7), S(11.8)],
    ],
    s.glass,
    { form: 'flat', level: 1 },
  );
  for (let x = S(8); x < S(20); x++) {
    const y = S(8.5) + Math.sin((x / u + frame * 3) / 2.2) * S(1.8);
    p.pix(x, y, STAR.neonCyan);
  }
  p.ellipse(S(24), S(7.6), S(2.4), S(2.4), s.lime, { form: 'sphere' });
  p.line(S(21), S(8.4), S(27), S(6.8), s.amber, 4);
  for (let y = S(4); y < S(11.5); y += Math.max(2, Math.round(2 * u))) p.line(S(7), y, S(27), y, s.glass, 2, { onlyOver: true });
  return p.toBuffer();
}

/** A round table that projects a hologram of a planet. */
export function paintHoloTable(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(34 * u), Math.round(44 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  p.capsule(S(17), S(31), S(17), S(41), S(4), s.trim, { form: 'cylV' });
  p.ellipse(S(17), S(42), S(9), S(2.2), s.dark, { form: 'flat', level: 1 });
  p.ellipse(S(17), S(30), S(14), S(4), s.white, { sep: true });
  p.ellipse(S(17), S(30), S(10), S(2.6), s.dark, { form: 'flat', level: 2 });
  p.ellipse(S(17), S(30), S(6), S(1.4), s.cyan, { form: 'flat', level: 4 });
  // the hologram: a planet drawn in scanlines, with a ring and a tiny moon
  const hc = S(15);
  const hr = S(8);
  for (let y = Math.floor(hc - hr); y <= hc + hr; y++) {
    if ((y + frame) % 2) continue;
    for (let x = Math.floor(S(17) - hr); x <= S(17) + hr; x++) {
      const d = Math.hypot(x + 0.5 - S(17), y + 0.5 - hc) / hr;
      if (d > 1) continue;
      const edge = d > 0.82;
      const land = noise(x / (3 * u) + frame * 0.6, y / (3 * u), 4) > 0.55;
      p.pix(x, y, edge ? '#bff6ff' : land ? '#8be6ff' : '#3fb6e0');
    }
  }
  for (let x = -hr * 1.5; x <= hr * 1.5; x++) p.pix(S(17) + x, hc + x * 0.18, '#dffbff');
  const a = frame * 0.9;
  p.pix(S(17) + Math.cos(a) * hr * 1.3, hc - S(6) + Math.sin(a) * S(1.5), '#ffffff');
  // projector beams
  for (let k = -1; k <= 1; k += 2) p.line(S(17) + k * S(5), S(29), S(17) + k * S(8), hc + S(3), s.cyan, 3);
  return p.toBuffer();
}

/** A glass growing dome with plants, flowers and a little tree. */
export function paintDome(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(40 * u), Math.round(42 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  const cx = S(20);
  // base ring and soil
  p.ellipse(cx, S(36), S(18), S(5), s.white, { sep: true });
  p.rect(S(2), S(36), S(36), S(4), s.trim, { form: 'cylV', box: [S(2), S(36), S(36), S(4)] });
  p.ellipse(cx, S(35), S(15.5), S(3.6), s.soil, { form: 'flat', level: 1 });
  // plants: a small fruit tree, leafy plants and flowers
  p.capsule(cx + S(3), S(34), cx + S(3), S(20), S(1.2), ramp('#8a5a3a'), {});
  p.ellipse(cx + S(3), S(16), S(8), S(7), s.leaf, { sep: true });
  [
    [-3, -2],
    [2, -4],
    [5, 1],
    [-1, 2],
  ].forEach(([ox, oy]) => p.ellipse(cx + S(3 + ox), S(16 + oy), S(1.3), S(1.3), s.amber, { bias: 0.2 }));
  for (let i = 0; i < 5; i++) {
    const lx = cx - S(11) + i * S(3);
    p.capsule(lx, S(34), lx - S(2) + i * S(0.8), S(26 - (i % 2) * 3), S(1.1), i % 2 ? s.leaf2 : s.leaf, { sep: true });
  }
  [
    [-12, 27, s.magenta],
    [-6, 25, s.amber],
    [10, 28, s.magenta],
    [13, 31, s.cyan],
  ].forEach(([ox, oy, r]) => p.ellipse(cx + S(ox as number), S(oy as number), S(1.6), S(1.6), r as Ramp, { bias: 0.15, sep: true }));
  // the glass: a rim and two shiny streaks (the inside stays see-through)
  const R = S(17);
  const cy = S(35);
  for (let a = Math.PI; a <= Math.PI * 2; a += 0.6 / R) {
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R * 1.62;
    p.dot(x, y, s.cyan, a < Math.PI * 1.5 ? 4 : 3);
  }
  for (let a = Math.PI * 1.15; a <= Math.PI * 1.42; a += 0.5 / R) {
    p.pix(cx + Math.cos(a) * R * 0.82, cy + Math.sin(a) * R * 1.62 * 0.82, '#f2feff');
    if (u >= 1.5) p.pix(cx + Math.cos(a) * R * 0.74, cy + Math.sin(a) * R * 1.62 * 0.74, '#bdf3ff');
  }
  return p.toBuffer();
}

/** Two stacked cargo crates. */
export function paintCrates(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(36 * u), Math.round(34 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  const crate = (x: number, y: number, w: number, h: number, r: Ramp) => {
    p.rect(S(x), S(y), S(w), S(4), r, { level: 3 });
    p.rect(S(x), S(y + 4), S(w), S(h - 4), r, { form: 'cylV', box: [S(x), S(y + 4), S(w), S(h - 4)], sep: true });
    p.rect(S(x + 2), S(y + 6), S(w - 4), S(2), s.dark, { level: 1 });
    for (let xx = S(x + 2); xx < S(x + w - 2); xx++) if (Math.floor(xx / (3 * u)) % 2) p.dot(xx, S(y + 6.5), s.hazard, 2);
    p.rect(S(x + w / 2 - 3), S(y + 10), S(6), S(3), s.white, { level: 3 });
  };
  crate(2, 14, 20, 19, s.orange);
  crate(18, 18, 16, 15, ramp('#3aa59a'));
  crate(6, 0, 14, 14, ramp('#8a6ad6'));
  return p.toBuffer();
}

/** A friendly helper drone that hovers (2 frames). */
export function paintDrone(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(22 * u), Math.round(24 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  p.capsule(S(11), S(5), S(11), S(1.5), S(0.6), s.trim, { form: 'flat', level: 2 });
  p.ellipse(S(11), S(1.5), S(1.3), S(1.3), frame % 2 ? s.magenta : s.amber, { form: 'flat', level: 4 });
  p.ellipse(S(11), S(12), S(9), S(8), s.white, { sep: true });
  p.ellipse(S(11), S(12.5), S(6.5), S(4.2), s.glass, { form: 'flat', level: 0 });
  // two happy eyes on the visor
  for (const ex of [S(8.2), S(13.8)]) {
    p.pix(ex - u, S(12.5), STAR.neonCyan);
    p.pix(ex, S(11.5), STAR.neonCyan);
    p.pix(ex + u, S(12.5), STAR.neonCyan);
    if (u >= 1.5) p.pix(ex, S(12), STAR.neonCyan);
  }
  [-1, 1].forEach((k) => p.ellipse(S(11) + k * S(9.3), S(12), S(1.6), S(3), s.orange, { sep: true }));
  p.ellipse(S(11), S(20.5), S(3), S(1.4), s.trim, { form: 'flat', level: 1 });
  p.ellipse(S(11), S(22), S(2), S(frame % 2 ? 1.6 : 1.1), s.cyan, { form: 'flat', level: 4 });
  return p.toBuffer();
}

/** A metal bench (2 tiles wide). */
export function paintBench(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(32 * u), Math.round(16 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  for (const lx of [5, 27]) p.rect(S(lx - 1.5), S(8), S(3), S(8), s.trim, { form: 'cylV', box: [S(lx - 1.5), 0, S(3), S(16)] });
  p.rect(S(1), S(5), S(30), S(4), s.magenta, { form: 'cylV', box: [S(1), S(5), S(30), S(4)], sep: true });
  p.rect(S(1), S(4), S(30), S(1.5), s.magenta, { level: 4 });
  p.rect(S(1), S(0), S(30), S(3), s.trim, { form: 'cylV', box: [S(1), 0, S(30), S(3)] });
  return p.toBuffer();
}

/** An alien houseplant in a pot, with a glowing bud. */
export function paintAlienPlant(T: number, seed = 0): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(16 * u), Math.round(24 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  const leaf = seed % 2 ? s.leaf2 : s.leaf;
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 2 + (i - 1.5) * 0.55;
    p.capsule(S(8), S(15), S(8) + Math.cos(a) * S(6), S(15) + Math.sin(a) * S(10), S(1.3), leaf, { sep: true });
  }
  p.ellipse(S(8), S(4.2), S(2), S(2), seed % 2 ? s.amber : s.magenta, { form: 'flat', level: 4 });
  p.poly(
    [
      [S(3), S(15)],
      [S(13), S(15)],
      [S(12), S(23)],
      [S(4), S(23)],
    ],
    s.white,
    { sep: true },
  );
  p.rect(S(3), S(15), S(10), S(1.5), s.cyan, { level: 3 });
  return p.toBuffer();
}

/** A short light post. */
export function paintBollard(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(10 * u), Math.round(20 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  p.capsule(S(5), S(6), S(5), S(18), S(2.6), s.trim, { form: 'cylV' });
  p.rect(S(2.4), S(7), S(5.2), S(2), s.cyan, { level: 4 });
  p.ellipse(S(5), S(5), S(2.6), S(1.4), s.white, {});
  return p.toBuffer();
}

/** An info kiosk with a big friendly screen. */
export function paintKiosk(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(20 * u), Math.round(36 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  p.rect(S(7), S(20), S(6), S(14), s.trim, { form: 'cylV', box: [S(7), S(20), S(6), S(14)] });
  p.ellipse(S(10), S(34), S(7), S(1.8), s.dark, { form: 'flat', level: 2 });
  p.rect(S(1), S(1), S(18), S(20), s.white, { form: 'cylV', box: [S(1), S(1), S(18), S(20)], sep: true });
  p.rect(S(3), S(3), S(14), S(14), s.glass, { level: 1 });
  // a little map of the station on the screen
  p.ellipse(S(10), S(10), S(4), S(4), s.cyan, { form: 'flat', level: 1 });
  p.ellipse(S(10), S(10), S(2), S(2), s.glass, { form: 'flat', level: 1 });
  for (let a = 0; a < 4; a++) p.dot(S(10) + Math.cos(a * 1.57 + frame * 0.4) * S(5.5), S(10) + Math.sin(a * 1.57 + frame * 0.4) * S(5.5), a % 2 ? s.magenta : s.lime, 4);
  p.rect(S(4), S(18), S(12), S(1.5), s.magenta, { level: 3 });
  return p.toBuffer();
}

/** A telescope on a tripod, pointed at the window. */
export function paintTelescope(T: number): PixelBuffer {
  const u = U(T);
  const p = new Paint(Math.round(28 * u), Math.round(32 * u));
  const s = STAR;
  const S = (v: number) => v * u;
  for (const fx of [5, 14, 23]) p.capsule(S(14), S(17), S(fx), S(31), S(0.9), s.trim, {});
  p.capsule(S(4), S(15), S(23), S(5), S(3), s.white, { form: 'cylH', sep: true });
  p.ellipse(S(23.5), S(5), S(2.4), S(3.2), s.orange, { sep: true });
  p.rect(S(9), S(9), S(4), S(4), s.orange, { level: 2 });
  p.ellipse(S(14), S(16), S(2.2), S(2.2), s.dark, { level: 2 });
  return p.toBuffer();
}
