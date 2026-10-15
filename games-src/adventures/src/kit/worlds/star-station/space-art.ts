import { PixelBuffer } from '../../art/pixel';
import type { Look16 } from '../hero16';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { STAR } from './art';

/**
 * Solar System Explorer art (Star Station world): the observatory crew, Vee
 * the probe, the Sun, the planets, the Moon and Pluto, and the observatory's
 * hands-on space models (the orrery, the globe lab, the star projector, the
 * launch cannon and the big telescope), plus the star map and the postcards.
 *
 * Designs are written at 16 pixels per tile and scaled by u = T / 16, like
 * the rest of the world. Planet colors follow NASA's true-color pictures,
 * simplified to a few shades.
 */

const U = (T: number) => T / 16;

export const SPACE = {
  brass: ramp('#d9a648'),
  wood: ramp('#8a5a3a'),
  night: ramp('#1a2048'),
  foil: ramp('#e0b04a'),
  dish: ramp('#eef1f8'),
  lamp: ramp('#ffd65a'),
} as const;

// ------------------------------------------------------------------ the crew

/** Navigator Sol, Keeper of the Star Map (the same look as in Multiplication Space Quest). */
export const NAVIGATOR_SOL: Look16 = {
  build: 'adult',
  skin: '#f0c8a0',
  hair: { style: 'short', color: '#d9d9d9' },
  top: { color: '#253a6e', trim: '#7ff0ff', kind: 'jumpsuit' },
  legs: '#253a6e',
  shoes: '#2c3350',
  sole: '#c9d1de',
  belt: '#2c3350',
  badge: '#7ff0ff',
  headset: '#2c3350',
};

/** Astronomer Lumi Reyes, who runs the Star Dome (a long navy coat with gold star trim). */
export const LUMI_REYES: Look16 = {
  build: 'adult',
  skin: '#c68a5e',
  hair: { style: 'puffs', color: '#2a1f3a', tie: '#f2c94c' },
  top: { color: '#24306a', trim: '#f2c94c', kind: 'robe' },
  legs: '#24306a',
  shoes: '#4a3a5e',
  sole: '#e7ecf6',
  badge: '#f2c94c',
};

/** Dr. Kofi Mensah, the Earth scientist at the Sunrise Lab. */
export const KOFI_MENSAH: Look16 = {
  build: 'adult',
  skin: '#5a3420',
  hair: { style: 'short', color: '#1e1820' },
  top: { color: '#2f8a5a', trim: '#f4efe6', kind: 'jumpsuit' },
  legs: '#3a4a6a',
  shoes: '#4a3a2e',
  sole: '#e7ecf6',
  belt: '#2a3048',
  badge: '#ffd65a',
};

/** Engineer Tess Rocket, who runs the Launch Bay. */
export const TESS_ROCKET: Look16 = {
  build: 'adult',
  skin: '#e8b48c',
  hair: { style: 'locs', color: '#b8502e', tie: '#4fd6ff' },
  top: { color: '#ef8a3c', trim: '#2c3350', kind: 'jumpsuit' },
  legs: '#ef8a3c',
  shoes: '#2c3350',
  sole: '#c9d1de',
  belt: '#2c3350',
  badge: '#f2c14c',
  headset: '#2c3350',
};

// ------------------------------------------------------------------ Vee the probe

/**
 * Vee, the observatory's little probe (about 1.4 tiles): a gold-foil body
 * with a friendly face screen, a big white dish antenna on top and a sensor
 * boom, like the real Voyager probes. `frame` 0 rests, 1 and 2 fire the
 * thruster; `blink` closes the eyes.
 */
export function paintVee(T: number, face: 'left' | 'right' = 'right', frame = 0, blink = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(26 * u), Math.round(24 * u));
  // design facing right; mirrored at the end for left
  if (frame > 0) {
    const len = frame === 1 ? 3 : 4.5;
    p.ellipse(S(11), S(20 + len / 2), S(2.4), S(len / 2 + 0.8), ramp('#ffcf6a'), { form: 'flat', level: 3 });
    p.ellipse(S(11), S(20 + len / 3), S(1.2), S(len / 3 + 0.4), ramp('#ffffff'), { form: 'flat', level: 2 });
  }
  // the sensor boom out to the right, with a little sensor ball
  p.line(S(16), S(14), S(24), S(10), STAR.trim, 2);
  p.ellipse(S(24), S(10), S(1.4), S(1.4), STAR.magenta, { form: 'sphere' });
  // the body: a gold-foil box with a dark face screen
  p.rect(S(5), S(10), S(12), S(9), SPACE.foil, { form: 'sphere', box: [S(5), S(10), S(12), S(9)], sep: true });
  for (let y = 11; y < 18; y += 2) p.line(S(6), S(y), S(16), S(y + 0.5), SPACE.foil, 3, { onlyOver: true });
  p.rect(S(7), S(12), S(9), S(5), STAR.dark, { level: 1 });
  // two happy eyes (or closed lines when blinking) and a smile
  for (const ex of [S(9.5), S(13.5)]) {
    if (blink) p.fillPix(ex - u, S(14), Math.max(2, Math.round(2 * u)), Math.max(1, Math.round(u * 0.7)), STAR.neonCyan);
    else {
      p.fillPix(ex - u * 0.5, S(13.3), Math.max(1, Math.round(u * 1.2)), Math.max(1, Math.round(u * 1.6)), STAR.neonCyan);
      p.pix(ex, S(13.3), '#ffffff');
    }
  }
  for (let x = -1.5; x <= 1.5; x += 0.5) p.pix(S(11.5 + x), S(15.6) + (Math.abs(x) > 1 ? -u * 0.6 : 0), STAR.neonCyan);
  // the leg that holds the dish, and the dish itself, tilted toward the viewer
  p.line(S(11), S(10), S(11), S(7), STAR.trim, 2);
  p.ellipse(S(11), S(5), S(8.5), S(3.6), SPACE.dish, { sep: true });
  p.ellipse(S(11), S(5.4), S(6.4), S(2.4), SPACE.dish, { form: 'flat', level: 1 });
  p.ellipse(S(11), S(5.4), S(1.2), S(1), STAR.trim, { form: 'flat', level: 3 });
  p.dot(S(11), S(4.6), STAR.amber, 4);
  const b = p.toBuffer();
  return face === 'left' ? b.flipX() : b;
}

/** Vee's face in the talk box (72 x 72). */
export function paintVeePortrait(happy = true): PixelBuffer {
  const p = new Paint(72, 72);
  p.rect(0, 0, 72, 72, ramp('#26324f'), { level: 2 });
  for (let y = 0; y < 72; y += 6) p.line(0, y, 71, y, ramp('#2e3c5e'), 2);
  // the dish behind and above
  p.line(36, 30, 36, 18, STAR.trim, 2);
  p.ellipse(36, 13, 30, 11, SPACE.dish, { sep: true });
  p.ellipse(36, 14, 23, 7, SPACE.dish, { form: 'flat', level: 1 });
  p.ellipse(36, 14, 3, 2.4, STAR.trim, { form: 'flat', level: 3 });
  p.dot(36, 12, STAR.amber, 4);
  // the gold body with the face screen
  p.rect(10, 28, 52, 40, SPACE.foil, { form: 'sphere', box: [10, 28, 52, 40], sep: true });
  for (let y = 31; y < 66; y += 5) p.line(11, y, 61, y + 1, SPACE.foil, 3, { onlyOver: true });
  p.rect(16, 34, 40, 26, STAR.dark, { level: 1 });
  for (const ex of [27, 45]) {
    if (happy) {
      p.fillPix(ex - 3, 40, 6, 8, STAR.neonCyan);
      p.fillPix(ex - 2, 41, 2, 2, '#ffffff');
    } else p.fillPix(ex - 3, 44, 6, 2, STAR.neonCyan);
  }
  for (let x = -8; x <= 8; x++) p.pix(36 + x, 54 + (happy ? Math.round(-(x * x) / 22) + 2 : 0), STAR.neonCyan);
  return p.toBuffer();
}

// ------------------------------------------------------------------ the Sun, the planets, the Moon and Pluto

export type SkyBody = 'sun' | 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'moon' | 'pluto';

/** The eight planets, in order from the Sun. */
export const PLANET_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'] as const;
export type PlanetId = (typeof PLANET_ORDER)[number];

/** Average distance from the Sun in astronomical units (Earth = 1), from NASA's planetary fact sheet. */
export const PLANET_AU: Record<PlanetId, number> = { mercury: 0.39, venus: 0.72, earth: 1, mars: 1.52, jupiter: 5.2, saturn: 9.54, uranus: 19.2, neptune: 30.1 };

/** Smooth value noise in 0..1. */
function vnoise(x: number, y: number, seed: number): number {
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

const COL = {
  sun: ramp('#ffc23a', { spread: 0.8 }),
  mercury: ramp('#a39c94'),
  mercury2: ramp('#7f7a74'),
  venus: ramp('#e9cf96'),
  venus2: ramp('#f6e2b4'),
  ocean: ramp('#2f7fd0'),
  land: ramp('#4aa65a'),
  desert: ramp('#c9a46a'),
  ice: ramp('#f2f6fa'),
  mars: ramp('#c8643a'),
  mars2: ramp('#8f4630'),
  jupiter: ramp('#e6cfa8'),
  jupiter2: ramp('#bf8a5e'),
  jupiter3: ramp('#d8ae80'),
  spot: ramp('#cc5a3e'),
  saturn: ramp('#e8d29a'),
  saturn2: ramp('#d2b678'),
  ring: ramp('#dccaa2'),
  uranus: ramp('#a3e2e8'),
  neptune: ramp('#3d66da'),
  neptune2: ramp('#25409c'),
  moon: ramp('#b9b8b6'),
  moon2: ramp('#8c8b8e'),
  pluto: ramp('#d2ab82'),
  pluto2: ramp('#f2e4cc'),
  pluto3: ramp('#7a4a38'),
} as const;

/**
 * One sky body, `r` pixels in radius (not to scale: the game says so where
 * sizes matter). `spin` (0..1) turns it, so features slide across.
 */
export function paintPlanet(id: SkyBody, r: number, spin = 0): PixelBuffer {
  const wide = id === 'saturn' ? 2.35 : 1;
  const tall = id === 'uranus' ? 1.7 : 1;
  const W = Math.ceil(r * 2 * wide) + 4;
  const H = Math.ceil(r * 2 * tall) + 4;
  const p = new Paint(W, H);
  const cx = W / 2;
  const cy = H / 2;
  if (id === 'sun') return paintSun(r);

  // rings that pass behind the planet are drawn first, the front half last
  const ringPass = (front: boolean) => {
    if (id === 'saturn') {
      for (let y = Math.floor(cy - r); y < cy + r; y++)
        for (let x = Math.floor(cx - r * 2.3); x < cx + r * 2.3; x++) {
          const d = ((x + 0.5 - cx) / (r * 2.25)) ** 2 + ((y + 0.5 - cy) / (r * 0.5)) ** 2;
          const i = ((x + 0.5 - cx) / (r * 1.35)) ** 2 + ((y + 0.5 - cy) / (r * 0.3)) ** 2;
          if (d > 1 || i < 1 || front !== y + 0.5 > cy) continue;
          if (Math.abs(d - 0.72) < 0.05) continue; // the Cassini Division, the dark gap in the rings
          if (!front && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < r) continue;
          p.dot(x, y, COL.ring, d > 0.85 ? 1 : x < cx ? 3 : 2);
        }
    }
    if (id === 'uranus') {
      // Uranus is tipped on its side, so its faint rings stand up and down
      for (let y = Math.floor(cy - r * 1.7); y < cy + r * 1.7; y++)
        for (let x = Math.floor(cx - r); x < cx + r; x++) {
          const d = ((x + 0.5 - cx) / (r * 0.42)) ** 2 + ((y + 0.5 - cy) / (r * 1.62)) ** 2;
          if (Math.abs(d - 1) > 0.09 || front !== x + 0.5 > cx) continue;
          if (!front && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < r) continue;
          p.pix(x, y, '#cfeef2');
        }
    }
  };
  ringPass(false);

  const base: Record<string, Ramp> = { mercury: COL.mercury, venus: COL.venus, earth: COL.ocean, mars: COL.mars, jupiter: COL.jupiter, saturn: COL.saturn, uranus: COL.uranus, neptune: COL.neptune, moon: COL.moon, pluto: COL.pluto };
  p.ellipse(cx, cy, r, r, base[id], { dither: r > 10 });
  for (let y = Math.floor(cy - r); y <= cy + r; y++)
    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const nx = (x + 0.5 - cx) / r;
      const ny = (y + 0.5 - cy) / r;
      if (nx * nx + ny * ny > 1) continue;
      // a longitude that turns with `spin`, so the surface slides across
      const lon = Math.asin(Math.max(-1, Math.min(1, nx / Math.sqrt(Math.max(0.01, 1 - ny * ny))))) / Math.PI + spin * 2;
      const lv = p.levelAt(x, y);
      const n = vnoise(lon * 6, ny * 3 + 4, 3) * 0.65 + vnoise(lon * 14, ny * 7, 5) * 0.35;
      const put = (rr: Ramp, d = 0) => p.dot(x, y, rr, Math.max(0, Math.min(4, lv + d)));
      switch (id) {
        case 'mercury':
          if (n > 0.62) put(COL.mercury2);
          break;
        case 'venus':
          if (Math.sin(ny * 9 + n * 4) > 0.55) put(COL.venus2);
          break;
        case 'earth':
          if (n > 0.56) put(n > 0.7 && Math.abs(ny) < 0.45 ? COL.desert : COL.land);
          if (Math.abs(ny) > 0.84) put(COL.ice);
          if (vnoise(lon * 9 + 30, ny * 5, 8) > 0.68) put(COL.ice, 1);
          break;
        case 'mars':
          if (n > 0.64) put(COL.mars2);
          if (ny < -0.82) put(COL.ice);
          break;
        case 'jupiter': {
          const band = Math.floor((ny + 1) * 5.5 + Math.sin(lon * 9) * 0.25);
          put(band % 3 === 0 ? COL.jupiter2 : band % 3 === 1 ? COL.jupiter : COL.jupiter3);
          break;
        }
        case 'saturn':
          if (Math.floor((ny + 1) * 6) % 2) put(COL.saturn2);
          break;
        case 'neptune':
          if (vnoise(lon * 5 + 9, ny * 9, 6) > 0.74) put(COL.ice, 1);
          break;
        case 'moon':
          if (n > 0.6) put(COL.moon2);
          break;
        case 'pluto': {
          // the bright heart-shaped plain (Tombaugh Regio) and the dark band near the equator
          const hx = (nx + 0.12 - spin * 0.5) / 0.4;
          const hy = -(ny - 0.18) / 0.4;
          const heart = (hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3 <= 0;
          if (heart) put(COL.pluto2, 1);
          else if (Math.abs(ny - 0.15) < 0.2 && n > 0.45) put(COL.pluto3);
          break;
        }
      }
    }
  // craters on the rocky worlds without thick air
  if (id === 'mercury' || id === 'moon') {
    for (let k = 0; k < 7; k++) {
      const a = hash(k, 1, id === 'moon' ? 41 : 43) * Math.PI * 2;
      const d = Math.sqrt(hash(k, 2, 41)) * r * 0.75;
      const cr = Math.max(1, r * (0.08 + hash(k, 3, 41) * 0.12));
      p.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, cr, cr, base[id], { onlyOver: true, bias: -0.55 });
    }
  }
  // Jupiter's Great Red Spot (in the southern half) and Neptune's dark spot
  if (id === 'jupiter') {
    p.ellipse(cx + r * 0.3 - spin * r, cy + r * 0.38, Math.max(1.5, r * 0.3), Math.max(1, r * 0.17), COL.jupiter, { onlyOver: true, form: 'flat', level: 4 });
    p.ellipse(cx + r * 0.3 - spin * r, cy + r * 0.38, Math.max(1, r * 0.24), Math.max(1, r * 0.12), COL.spot, { onlyOver: true, bias: 0.2 });
  }
  if (id === 'neptune') p.ellipse(cx - r * 0.25, cy - r * 0.2, r * 0.2, r * 0.12, COL.neptune2, { onlyOver: true, form: 'flat', level: 1 });
  ringPass(true);
  return p.toBuffer();
}

/** The Sun: a glowing ball, darker toward its edge, with a soft halo and two sunspots. */
function paintSun(r: number): PixelBuffer {
  const halo = Math.ceil(r * 0.35) + 2;
  const W = Math.ceil(r * 2) + halo * 2;
  const p = new Paint(W, W);
  const c = W / 2;
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c) / r;
      if (d <= 1) {
        const dith = (x + y) % 2 ? 0.03 : -0.03;
        p.dot(x, y, COL.sun, d + dith < 0.45 ? 4 : d + dith < 0.75 ? 3 : d + dith < 0.92 ? 2 : 1);
      } else if (d < 1 + halo / r) {
        const k = (d - 1) / (halo / r);
        if (k < 0.5 || (k < 0.8 && (x + y) % 2 === 0)) p.pix(x, y, k < 0.35 ? '#ffe28a' : '#ffb84a');
      }
    }
  p.ellipse(c - r * 0.3, c + r * 0.15, Math.max(1, r * 0.08), Math.max(1, r * 0.06), COL.sun, { form: 'flat', level: 0, onlyOver: true });
  p.ellipse(c + r * 0.25, c - r * 0.3, Math.max(1, r * 0.06), Math.max(1, r * 0.05), COL.sun, { form: 'flat', level: 0, onlyOver: true });
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the observatory's space models

/**
 * The orrery (about 5 tiles wide): a brass model of the solar system on a
 * round table, the Sun glowing in the middle and all eight planets on their
 * rings. `t` is the model's time in years; close planets go round faster
 * (one turn per planet year), which is what the child sees when it runs.
 */
export function paintOrrery(T: number, t = 0, placed = 8, glow = -1): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(80 * u);
  const H = Math.round(60 * u);
  const p = new Paint(W, H);
  const cx = W / 2;
  const cy = S(30);
  // the pedestal and the table top
  p.rect(cx - S(5), cy + S(10), S(10), S(16), SPACE.wood, { form: 'cylV', box: [cx - S(5), 0, S(10), H] });
  p.ellipse(cx, S(57), S(14), S(2.6), STAR.dark, { form: 'flat', level: 1 });
  p.ellipse(cx, cy + S(2), S(39), S(13), SPACE.wood, { sep: true });
  p.ellipse(cx, cy, S(38), S(12), SPACE.night, { form: 'flat', level: 1 });
  // the orbit rings (brass), spaced so the gaps grow farther out, like the real ones
  const rings = PLANET_ORDER.map((_, i) => S(7 + i * 4.1 + i * i * 0.08));
  rings.forEach((rr, i) => {
    for (let a = 0; a < Math.PI * 2; a += 0.6 / rr) {
      if (i === glow) {
        // the glowing ring: where the next planet goes
        p.pix(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.32, STAR.neonCyan);
        p.pix(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.32 + 1, '#2f9ac0');
      } else p.dot(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.32, SPACE.brass, 1);
    }
  });
  // the Sun in the middle
  const sun = paintSun(S(3.6));
  const bufs: Array<{ b: PixelBuffer; x: number; y: number }> = [];
  bufs.push({ b: sun, x: cx - sun.w / 2, y: cy - S(3) - sun.h / 2 });
  // the planets on little brass arms (one turn per planet year)
  const sizes = [1.3, 1.9, 2, 1.6, 3.6, 3.1, 2.4, 2.4];
  PLANET_ORDER.forEach((id, i) => {
    if (i >= placed) return;
    const yearsPerTurn = Math.pow(PLANET_AU[id], 1.5);
    const a = 0.6 + i * 1.7 + (t / yearsPerTurn) * Math.PI * 2;
    const x = cx + Math.cos(a) * rings[i];
    const y = cy + Math.sin(a) * rings[i] * 0.32;
    p.line(x, y, x, y - S(3), SPACE.brass, 3);
    const b = paintPlanet(id, S(sizes[i]), 0);
    bufs.push({ b, x: x - b.w / 2, y: y - S(3) - b.h / 2 });
  });
  const out = p.toBuffer();
  // draw the far planets first, so nearer ones overlap them
  bufs.sort((a, b) => a.y + a.b.h - (b.y + b.b.h));
  for (const { b, x, y } of bufs) out.blit(b, Math.round(x), Math.round(y));
  return out;
}

/**
 * The globe lab (about 4 tiles wide): a big Earth globe on a stand, lit by a
 * lamp on the right that stands in for the Sun, so one half has day and the
 * other night. The crank turns it the way the real Earth turns (toward the
 * east: the front moves left to right), so the town comes out of the night
 * into the lamp's light at the front: a sunrise. `spin` 0..1 is one full day;
 * at 0 the town is in the middle of its day. `rays` draws the lamp's light
 * (a hint picture).
 */
export function paintGlobeLab(T: number, spin = 0, rays = false): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(64 * u);
  const H = Math.round(54 * u);
  const p = new Paint(W, H);
  // the lamp on the right (the Sun)
  p.rect(S(56), S(28), S(4), S(22), STAR.trim, { form: 'cylV', box: [S(56), 0, S(4), H] });
  p.ellipse(S(58), S(51), S(6), S(2), STAR.dark, { form: 'flat', level: 1 });
  p.ellipse(S(56), S(24), S(7), S(7), SPACE.lamp, { form: 'flat', level: 4 });
  p.ellipse(S(56), S(24), S(4.5), S(4.5), ramp('#ffffff'), { form: 'flat', level: 2 });
  // the stand and the crank (on the left)
  p.rect(S(21), S(42), S(6), S(9), SPACE.wood, { form: 'cylV', box: [S(21), 0, S(6), H] });
  p.ellipse(S(24), S(51), S(10), S(2.2), SPACE.wood, { sep: true });
  p.line(S(10), S(26), S(4), S(26), STAR.trim, 2);
  p.line(S(4), S(26), S(4), S(31), STAR.trim, 2);
  p.ellipse(S(4), S(32), S(1.6), S(1.6), STAR.magenta, { form: 'sphere' });
  // the brass ring round the globe
  for (let a = 0; a < Math.PI * 2; a += 0.02) p.dot(S(24) + Math.cos(a) * S(15.5), S(25) + Math.sin(a) * S(15.5), SPACE.brass, a > Math.PI ? 3 : 1);
  // the globe itself, lit from the lamp's side
  const gx = S(24);
  const gy = S(25);
  const R = S(14);
  for (let y = Math.floor(gy - R); y <= gy + R; y++)
    for (let x = Math.floor(gx - R); x <= gx + R; x++) {
      const nx = (x + 0.5 - gx) / R;
      const ny = (y + 0.5 - gy) / R;
      if (nx * nx + ny * ny > 1) continue;
      const nz = Math.sqrt(1 - nx * nx - ny * ny);
      const lon = Math.atan2(nx, nz) / Math.PI - spin * 2;
      const n = vnoise(lon * 4 + 10, ny * 2.5 + 3, 7) * 0.7 + vnoise(lon * 10, ny * 6, 9) * 0.3;
      const r: Ramp = Math.abs(ny) > 0.86 ? COL.ice : n > 0.55 ? (n > 0.7 && Math.abs(ny) < 0.4 ? COL.desert : COL.land) : COL.ocean;
      const light = nx * 0.95 + nz * 0.3 - ny * 0.1;
      const dith = (x + y) % 2 ? 0.04 : -0.04;
      const lv = light + dith > 0.55 ? 4 : light + dith > 0.25 ? 3 : light + dith > 0 ? 2 : light + dith > -0.2 ? 1 : 0;
      p.dot(x, y, r, lv);
      // the night side is darker still, with a few city lights
      if (light + dith < -0.2 && r !== COL.ocean && hash(x, y, 77) < 0.04) p.pix(x, y, '#ffe9a8');
    }
  // the lamp's light (a hint picture): rays from the lamp to the lit half
  if (rays)
    for (let k = -3; k <= 3; k++) {
      const y0 = S(24) + k * S(1.6);
      const y1 = gy + k * S(3.6);
      for (let x = S(50); x > gx + Math.sqrt(Math.max(0, R * R - (y1 - gy) ** 2)) + S(1); x -= 2) {
        const t = (S(50) - x) / (S(50) - gx);
        p.pix(x, y0 + (y1 - y0) * t, '#fff3a8');
      }
    }
  // the town marker rides round with the globe (only on the side facing us)
  const ta = 0.6 + spin * Math.PI * 2;
  if (Math.cos(ta) > 0.15) {
    const tx = gx + Math.sin(ta) * R * 0.92;
    const ty = gy - R * 0.25;
    p.line(tx, ty, tx, ty - S(5), STAR.white, 4);
    p.rect(tx, ty - S(5), S(3), S(2), STAR.magenta, { level: 3 });
    p.ellipse(tx, ty, S(1.3), S(1), STAR.magenta, { form: 'flat', level: 3 });
  }
  return p.toBuffer();
}

/**
 * The star projector in the Star Dome (about 3 tiles wide): a dumbbell of two
 * starry balls on a pedestal, like real planetarium projectors, with pin-prick
 * lights that twinkle (`frame`).
 */
export function paintStarProjector(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(48 * u), Math.round(46 * u));
  p.rect(S(20), S(26), S(8), S(16), STAR.trim, { form: 'cylV', box: [S(20), 0, S(8), S(46)] });
  p.ellipse(S(24), S(43), S(12), S(2.6), STAR.dark, { form: 'flat', level: 1 });
  p.capsule(S(9), S(20), S(39), S(12), S(2.2), STAR.trim, { form: 'cylH' });
  for (const [bx, by] of [
    [9, 20],
    [39, 12],
  ]) {
    p.ellipse(S(bx), S(by), S(8), S(8), SPACE.night, { sep: true });
    for (let k = 0; k < 14; k++) {
      const a = hash(k, bx, 5) * Math.PI * 2;
      const d = Math.sqrt(hash(k, by, 6)) * S(6.5);
      const on = (k + frame) % 3 !== 0;
      p.pix(S(bx) + Math.cos(a) * d, S(by) + Math.sin(a) * d, on ? '#fff6c8' : '#6a74b0');
    }
  }
  p.ellipse(S(24), S(16), S(3), S(3), STAR.cyan, { form: 'sphere' });
  return p.toBuffer();
}

/**
 * The launch cannon model in the Launch Bay (about 4 tiles wide), after
 * Isaac Newton's famous drawing: a little planet in a glass case with a
 * mountain on top and a cannon. Dotted paths show a slow shot falling back
 * and a fast one that goes all the way round (an orbit). `frame` moves a
 * shot along the orbit.
 */
export function paintLaunchCannon(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(64 * u);
  const H = Math.round(60 * u);
  const p = new Paint(W, H);
  const cx = W / 2;
  const cy = S(28);
  // the base and the glass case
  p.rect(cx - S(22), S(50), S(44), S(8), STAR.trim, { form: 'cylV', box: [cx - S(22), S(50), S(44), S(8)], sep: true });
  p.rect(cx - S(20), S(52), S(40), S(2), STAR.orange, { level: 3 });
  // the orbit path (fast shot) and the falling path (slow shot)
  const orbitR = S(19.5);
  for (let a = 0; a < Math.PI * 2; a += 0.12) p.dot(cx + Math.cos(a) * orbitR, cy + Math.sin(a) * orbitR, STAR.cyan, 4);
  for (let k = 0; k < 9; k++) {
    const t = k / 8;
    p.dot(cx + S(5.5) + t * S(9), cy - S(19.5) + t * t * S(13), STAR.amber, 4);
  }
  // the little planet with oceans and land, and the mountain with the cannon
  // a little made-up planet (purple and teal, so it is not mistaken for the Earth globe) with a tall mountain and the cannon
  const R = S(11);
  p.ellipse(cx, cy, R, R, ramp('#8a6ad6'), { dither: true });
  for (let y = Math.floor(cy - R); y < cy + R; y++)
    for (let x = Math.floor(cx - R); x < cx + R; x++)
      if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < R && vnoise(x / (4 * u), y / (4 * u), 12) > 0.58) p.dot(x, y, ramp('#3aa59a'), p.levelAt(x, y));
  p.poly(
    [
      [cx - S(6), cy - R + S(3)],
      [cx, cy - R - S(7)],
      [cx + S(6), cy - R + S(3)],
    ],
    ramp('#b8a898'),
    { sep: true },
  );
  p.poly(
    [
      [cx - S(1.6), cy - R - S(4.5)],
      [cx, cy - R - S(7)],
      [cx + S(1.6), cy - R - S(4.5)],
    ],
    ramp('#f2f6fa'),
    { form: 'flat', level: 3 },
  );
  p.rect(cx - S(1), cy - R - S(9.4), S(6), S(2.8), STAR.dark, { form: 'cylH', box: [cx - S(1), cy - R - S(9.4), S(6), S(2.8)], sep: true });
  p.ellipse(cx - S(0.5), cy - R - S(7), S(1.8), S(1.8), STAR.orange, { sep: true });
  // the shot on its orbit
  const a = -Math.PI / 2 + (frame / 12) * Math.PI * 2;
  p.ellipse(cx + Math.cos(a) * orbitR, cy + Math.sin(a) * orbitR, S(1.4), S(1.4), STAR.magenta, { form: 'sphere' });
  // the glass dome over it all
  const out = p.toBuffer();
  const R2 = S(26);
  for (let ang = Math.PI; ang <= Math.PI * 2; ang += 0.5 / R2) {
    const x = Math.round(cx + Math.cos(ang) * R2);
    const y = Math.round(S(50) + Math.sin(ang) * R2 * 1.4);
    if (y >= 0) out.set(x, y, ang < Math.PI * 1.5 ? '#dffbff' : '#8fd8ee');
  }
  for (let ang = Math.PI * 1.15; ang <= Math.PI * 1.35; ang += 0.5 / R2) {
    const x = Math.round(cx + Math.cos(ang) * R2 * 0.85);
    const y = Math.round(S(50) + Math.sin(ang) * R2 * 1.4 * 0.85);
    if (y >= 0) out.set(x, y, '#ffffff');
  }
  return out;
}

/**
 * The big telescope (about 5 tiles tall), the centrepiece of the observatory:
 * a long white tube on a sturdy mount, with four lens rings that light up one
 * by one as the stations are finished (`lit` 0..4 lights the first ones, or
 * one true or false per lens, in station order).
 */
export function paintBigTelescope(T: number, lit: number | boolean[] = 0): PixelBuffer {
  const on = (k: number) => (typeof lit === 'number' ? k < lit : !!lit[k]);
  const u = U(T);
  const S = (v: number) => v * u;
  const W = Math.round(64 * u);
  const H = Math.round(84 * u);
  const p = new Paint(W, H);
  // the pier and its base
  p.rect(S(26), S(48), S(12), S(30), STAR.trim, { form: 'cylV', box: [S(26), 0, S(12), H], sep: true });
  p.ellipse(S(32), S(79), S(18), S(4), STAR.dark, { sep: true });
  p.ellipse(S(32), S(78), S(15), S(3), STAR.trim, { form: 'flat', level: 2 });
  // the mount
  p.ellipse(S(32), S(46), S(7), S(6), STAR.orange, { sep: true });
  // the tube, pointing up and to the right at the dome's slit
  p.capsule(S(12), S(58), S(52), S(10), S(6.5), STAR.white, { form: 'cylH', sep: true });
  p.capsule(S(47), S(16), S(55), S(6.5), S(7.5), STAR.trim, { form: 'cylH', sep: true });
  p.ellipse(S(55.5), S(6), S(5), S(3), STAR.glass, { form: 'flat', level: 2 });
  p.ellipse(S(54.5), S(5.4), S(2), S(1.1), ramp('#bdf3ff'), { form: 'flat', level: 3 });
  // the eyepiece near the bottom
  p.capsule(S(14), S(54), S(10), S(50), S(1.8), STAR.dark, {});
  // the four lens rings along the tube
  const ringC = [STAR.cyan, STAR.amber, STAR.magenta, STAR.lime];
  for (let k = 0; k < 4; k++) {
    const t = 0.25 + k * 0.17;
    const x = S(12) + (S(52) - S(12)) * t;
    const y = S(58) + (S(10) - S(58)) * t;
    // a band round the tube, square to it
    const nx = 48 / 62.5;
    const ny = 40 / 62.5;
    p.capsule(x - nx * S(6.4), y - ny * S(6.4), x + nx * S(6.4), y + ny * S(6.4), S(1.5), on(k) ? ringC[k] : STAR.dark, { form: 'cylV', sep: true, bias: on(k) ? 0.3 : 0 });
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ the star map and the postcards

/**
 * Navigator Sol's star map: the Sun at the left and the eight planets along
 * a line in order. The gaps are squeezed to fit (square-root scale) but keep
 * growing farther out, as the real ones do. Visited planets glow; `here`
 * marks where the ship is.
 */
export function paintStarMap(W: number, H: number, visited: readonly PlanetId[] = [], here: PlanetId | null = null, frame = 0): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = y / H;
      p.pix(x, y, t < 0.33 ? '#121638' : t < 0.66 ? (x + y) % 2 ? '#121638' : '#161b44' : '#161b44');
    }
  for (let i = 0; i < W * H * 0.004; i++) {
    const tw = (i + frame) % 5 === 0;
    p.pix(hash(i, 1, 3) * W, hash(i, 2, 3) * H, tw ? '#5a64a0' : ['#ffffff', '#cfe8ff', '#fff1c4'][i % 3]);
  }
  const midY = H * 0.55;
  const sunR = H * 0.32;
  const sun = paintSun(sunR);
  const x0 = sunR * 1.3;
  const x1 = W - H * 0.12;
  // the path line, dotted
  for (let x = x0; x < x1; x += 3) p.pix(x, midY, '#3d4a8a');
  const out = p.toBuffer({ outline: false });
  out.blit(sun, Math.round(-sun.w * 0.35), Math.round(midY - sun.h / 2));
  const maxS = Math.sqrt(PLANET_AU.neptune);
  const sizes: Record<PlanetId, number> = { mercury: 0.05, venus: 0.075, earth: 0.08, mars: 0.06, jupiter: 0.16, saturn: 0.14, uranus: 0.1, neptune: 0.1 };
  for (const id of PLANET_ORDER) {
    const x = x0 + (x1 - x0) * (Math.sqrt(PLANET_AU[id]) / maxS) * 0.97;
    const r = Math.max(2, H * sizes[id]);
    const b = paintPlanet(id, r, 0);
    const seen = visited.includes(id);
    if (!seen)
      for (let i = 0; i < b.px.length; i++) {
        const c = b.px[i];
        if (c) b.px[i] = mixHex(c, '#20264f', 0.55);
      }
    out.blit(b, Math.round(x - b.w / 2), Math.round(midY - b.h / 2));
    if (here === id) {
      const ry = Math.round(midY - r - H * 0.12);
      for (let k = -2; k <= 2; k++) out.set(Math.round(x + k), ry - (2 - Math.abs(k)), frame % 2 ? '#ff8fd0' : '#7ff0ff');
    }
  }
  return out;
}

/** A planet postcard for the album: the planet in a frame with a stamp in the corner. */
export function paintPostcard(id: SkyBody, w = 96, h = 64): PixelBuffer {
  const p = new Paint(w, h);
  p.rect(0, 0, w, h, ramp('#f4ead2'), { level: 2 });
  p.rect(3, 3, w - 6, h - 6, ramp('#e6d6b0'), { level: 2 });
  p.rect(5, 5, Math.round(h - 10), h - 10, SPACE.night, { level: 1 });
  for (let i = 0; i < 30; i++) p.pix(6 + hash(i, 1, 9) * (h - 12), 6 + hash(i, 2, 9) * (h - 12), '#cfe8ff');
  // a stamp with a little rocket
  p.rect(w - 22, 7, 15, 18, ramp('#ffffff'), { level: 2 });
  p.rect(w - 20, 9, 11, 14, STAR.cyan, { level: 2 });
  p.line(w - 15, 20, w - 13, 11, STAR.white, 4);
  for (let k = 0; k < 4; k++) p.line(w - 30, 32 + k * 7, w - 8, 32 + k * 7, ramp('#b8a882'), 2);
  const out = p.toBuffer();
  const r = id === 'saturn' ? (h - 14) / 4.8 : id === 'sun' ? (h - 14) / 2.9 : (h - 14) / 2.3;
  const b = paintPlanet(id, r, 0.1);
  out.blit(b, Math.round(5 + (h - 10) / 2 - b.w / 2), Math.round(h / 2 - b.h / 2));
  return out;
}
