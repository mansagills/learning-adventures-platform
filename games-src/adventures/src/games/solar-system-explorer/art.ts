import { PixelBuffer } from '../../kit/art/pixel';
import { Paint, hash, mixHex, ramp } from '../../kit/worlds/shade';
import { paintHero, type Look16 } from '../../kit/worlds';
import { STAR } from '../../kit/worlds/star-station/art';
import { PLANET_ORDER, paintBigTelescope, paintPlanet, paintVee, type PlanetId } from '../../kit/worlds/star-station/space-art';
import { launch, ORBIT_R, SHOT_SPEED } from './physics';
import type { Season, Shot, Station } from './problems';

/**
 * Solar System Explorer's own pictures (the shared ones, like the planets,
 * the orrery and the globe, are in the world kit's space-art.ts): the
 * flagpole scene for shadows, the hint pictures, and the HUD icons.
 */

const GRASS = ramp('#5aa84a');

/** Where the Sun is in the sky scene (we face south, so east is on the left and west on the right). */
const SUN_AT: Record<'morning' | 'noon' | 'evening', [number, number]> = { morning: [0.12, 0.62], noon: [0.5, 0.14], evening: [0.88, 0.62] };

/**
 * A flagpole on the grass under the Sun (W x H art pixels). `shadow` draws
 * the pole's shadow; `rays` draws the sunlight skimming past the top of the
 * pole to where the shadow ends (the hint picture). Labels (East, West) are
 * put over it in HTML so they can be read aloud.
 */
export function paintSkyScene(W: number, H: number, sun: 'morning' | 'noon' | 'evening', shadow: boolean, rays = false): PixelBuffer {
  const p = new Paint(W, H);
  const ground = Math.round(H * 0.72);
  const evening = sun === 'evening';
  const morning = sun === 'morning';
  for (let y = 0; y < ground; y++)
    for (let x = 0; x < W; x++) {
      const t = y / ground;
      const base = morning ? mixHex('#78b6ec', '#ffd8a8', t * 0.7) : evening ? mixHex('#6a8ad8', '#ffb07a', t * 0.8) : mixHex('#4f9fe0', '#bfe3f5', t);
      p.pix(x, y, (x + y) % 2 && t > 0.5 ? mixHex(base, '#ffffff', 0.04) : base);
    }
  for (let y = ground; y < H; y++)
    for (let x = 0; x < W; x++) p.dot(x, y, GRASS, y === ground ? 3 : hash(x >> 1, y >> 1, 3) < 0.06 ? 1 : 2);
  // the pole
  const px = Math.round(W / 2);
  const top = Math.round(H * 0.3);
  const [sx, sy] = [SUN_AT[sun][0] * W, SUN_AT[sun][1] * H];
  // where the shadow ends: the line from the Sun past the top of the pole, down to the ground
  // (similar triangles: (px - sx) / (top - sy) = (tip - px) / (ground - top))
  const tipX = Math.max(2, Math.min(W - 3, px + ((px - sx) / Math.max(1, top - sy)) * (ground - top)));
  if (shadow) {
    const x0 = Math.min(px, tipX);
    const x1 = Math.max(px, tipX);
    for (let x = Math.floor(x0); x <= x1; x++) {
      p.pix(x, ground + 1, '#2f6a2a');
      p.pix(x, ground + 2, '#3a7a32');
    }
  }
  if (rays) {
    // two rays: one over the top of the pole to the shadow's tip, one hitting the pole lower down
    const ray = (x2: number, y2: number) => {
      const n = Math.ceil(Math.hypot(x2 - sx, y2 - sy));
      for (let i = 0; i < n; i += 2) p.pix(sx + ((x2 - sx) * i) / n, sy + ((y2 - sy) * i) / n, '#fff3a8');
    };
    ray(tipX, ground);
    ray(px, (top + ground) / 2);
    p.pix(tipX, ground, '#ff8fd0');
    p.pix(tipX, ground - 1, '#ff8fd0');
  }
  p.rect(px - 1, top, 2, ground - top + 1, ramp('#c9d1de'), { form: 'cylV', box: [px - 1, top, 2, ground - top] });
  p.rect(px + 1, top, 9, 6, STAR.magenta, { level: 3 });
  p.rect(px + 1, top + 2, 9, 1, STAR.amber, { level: 3 });
  p.ellipse(px, top - 1, 1.5, 1.5, STAR.amber, { form: 'flat', level: 4 });
  const out = p.toBuffer({ outline: false });
  const sunPic = paintPlanet('sun', Math.max(4, Math.round(H * 0.07)), 0);
  out.blit(sunPic, Math.round(sx - sunPic.w / 2), Math.round(sy - sunPic.h / 2));
  return out;
}

/** The Sun's path across the sky in one day: low in the east, highest at midday, low in the west (a hint picture). */
export function paintSunArc(W: number, H: number): PixelBuffer {
  const p = new Paint(W, H);
  const ground = Math.round(H * 0.78);
  for (let y = 0; y < ground; y++) for (let x = 0; x < W; x++) p.pix(x, y, mixHex('#4f9fe0', '#bfe3f5', y / ground));
  for (let y = ground; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, GRASS, y === ground ? 3 : 2);
  for (let x = W * 0.1; x < W * 0.9; x += 3) {
    const t = (x - W * 0.1) / (W * 0.8);
    p.pix(x, ground - Math.sin(t * Math.PI) * H * 0.62 - 4, '#fff3a8');
  }
  const out = p.toBuffer({ outline: false });
  for (const [t] of [[0.04], [0.5], [0.96]]) {
    const x = W * 0.1 + W * 0.8 * t;
    const y = ground - Math.sin(t * Math.PI) * H * 0.62 - 4;
    const s = paintPlanet('sun', Math.max(3, Math.round(H * 0.06)), 0);
    out.blit(s, Math.round(x - s.w / 2), Math.round(y - s.h / 2));
  }
  return out;
}

/**
 * The planets in a row, in order from the Sun (a hint picture; not to scale).
 * The planet at `focus` is hidden behind a "?" ring; with `dimAfter`, the
 * planets after it are faded. Returns the x of each planet's middle (for the
 * HTML labels).
 */
export function paintPlanetRow(W: number, H: number, focus = 8, dimAfter = true): { buf: PixelBuffer; xs: number[] } {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.pix(x, y, (x + y) % 2 ? '#121638' : '#161b44');
  for (let i = 0; i < W * H * 0.004; i++) p.pix(hash(i, 1, 5) * W, hash(i, 2, 5) * H, '#cfe8ff');
  const out = p.toBuffer({ outline: false });
  const sun = paintPlanet('sun', H * 0.42, 0);
  out.blit(sun, Math.round(-sun.w * 0.55), Math.round(H / 2 - sun.h / 2));
  const sizes: Record<PlanetId, number> = { mercury: 0.1, venus: 0.14, earth: 0.15, mars: 0.12, jupiter: 0.3, saturn: 0.25, uranus: 0.2, neptune: 0.2 };
  const xs: number[] = [];
  const x0 = H * 0.55;
  const step = (W - x0 - H * 0.2) / 7.4;
  PLANET_ORDER.forEach((id, i) => {
    const x = x0 + step * (i + (i >= 4 ? 0.4 : 0));
    xs.push(x);
    if (i === focus) {
      for (let a = 0; a < Math.PI * 2; a += 0.12) out.set(Math.round(x + Math.cos(a) * H * 0.16), Math.round(H / 2 + Math.sin(a) * H * 0.16), STAR.neonCyan);
      return;
    }
    const b = paintPlanet(id, Math.max(2, H * sizes[id]), 0);
    if (dimAfter && i > focus) for (let k = 0; k < b.px.length; k++) if (b.px[k]) b.px[k] = mixHex(b.px[k]!, '#20264f', 0.6);
    out.blit(b, Math.round(x - b.w / 2), Math.round(H / 2 - b.h / 2));
  });
  return { buf: out, xs };
}

/** The four telescope lenses for the HUD: lit ones glow in their station's color. */
export function paintLensIcon(lit: boolean[]): PixelBuffer {
  const p = new Paint(40, 12);
  const cols = [STAR.cyan, STAR.amber, STAR.magenta, STAR.lime];
  lit.forEach((on, i) => {
    p.ellipse(5 + i * 10, 6, 4.2, 4.2, on ? cols[i] : STAR.dark, { sep: true, bias: on ? 0.3 : -0.2 });
    p.ellipse(5 + i * 10, 6, 2, 2, on ? ramp('#ffffff') : STAR.wall, { form: 'flat', level: on ? 2 : 1 });
  });
  return p.toBuffer();
}

/** A small icon for each station (the job list). */
export function paintStationIcon(s: Station, open: boolean): PixelBuffer {
  const p = new Paint(24, 24);
  const dim = (c: string) => (open ? c : mixHex(c, '#3a3f58', 0.6));
  if (s === 'orrery') {
    p.ellipse(12, 13, 10, 4, ramp(dim('#d9a648')), { form: 'flat', level: 1 });
    p.ellipse(12, 13, 6, 2.4, ramp(dim('#1a2048')), { form: 'flat', level: 2 });
    p.ellipse(12, 12, 3, 3, ramp(dim('#ffc23a')), { form: 'flat', level: 4 });
    p.ellipse(20, 12, 1.6, 1.6, ramp(dim('#c8643a')), {});
    p.ellipse(5, 14, 2, 2, ramp(dim('#2f7fd0')), {});
  } else if (s === 'sunrise') {
    p.ellipse(10, 13, 8, 8, ramp(dim('#2f7fd0')), {});
    p.ellipse(10, 13, 8, 8, ramp(dim('#4aa65a')), { onlyOver: true, clip: (x, y) => (x + y * 0.4) % 6 < 2.5 });
    p.shape((x) => x < 10, [2, 5, 8, 16], ramp(dim('#1a2048')), { onlyOver: true, form: 'flat', level: 1 });
    p.ellipse(21, 8, 2.6, 2.6, ramp(dim('#ffd65a')), { form: 'flat', level: 4 });
  } else if (s === 'dome') {
    p.ellipse(12, 16, 10, 8, ramp(dim('#1a2048')), { clip: (_x, y) => y < 17 });
    for (let k = 0; k < 7; k++) p.pix(5 + hash(k, 1, 2) * 14, 10 + hash(k, 2, 2) * 6, dim('#fff1c4'));
    p.rect(2, 16, 20, 3, ramp(dim('#8c98bd')), {});
  } else {
    p.ellipse(12, 15, 6, 6, ramp(dim('#8a6ad6')), {});
    for (let a = 0; a < Math.PI * 2; a += 0.4) p.pix(12 + Math.cos(a) * 9, 15 + Math.sin(a) * 9, dim('#7ff0ff'));
    p.rect(11, 3, 5, 3, ramp(dim('#262c45')), {});
  }
  return p.toBuffer();
}

/** A postcard stamp mark: the planet with a little check. */
export function paintPlanetButton(id: PlanetId, visited: boolean): PixelBuffer {
  const p = new Paint(28, 28);
  const out0 = p.toBuffer({ outline: false });
  const b = paintPlanet(id, id === 'saturn' ? 6 : 9, 0);
  out0.blit(b, Math.round(14 - b.w / 2), Math.round(13 - b.h / 2));
  if (visited) {
    const c = new Paint(28, 28);
    c.ellipse(22, 22, 5, 5, STAR.lime, { sep: true });
    c.line(19.5, 22, 21.5, 24, ramp('#1d3a20'), 1);
    c.line(21.5, 24, 24.5, 19.5, ramp('#1d3a20'), 1);
    out0.blit(c.toBuffer(), 0, 0);
  }
  return out0;
}

// ------------------------------------------------------------------ the Star Dome's pictures

/** A soft round glow laid over a picture (bright in the middle, fading out). */
function glow(out: PixelBuffer, cx: number, cy: number, R: number, color: string, strength = 0.85): void {
  for (let y = Math.floor(cy - R); y <= cy + R; y++)
    for (let x = Math.floor(cx - R); x <= cx + R; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / R;
      if (d >= 1) continue;
      const under = out.get(x, y);
      if (!under) continue;
      const k = (1 - d) ** 2 * strength;
      out.set(x, y, mixHex(under, color, (x + y) % 2 && k < 0.15 ? k * 0.5 : k));
    }
}

/** A sprinkle of faint background stars (the same every time). */
function starfield(p: Paint, W: number, H: number, n: number, seed: number, color = '#cfe8ff', dim = '#6a78b8'): void {
  for (let i = 0; i < n; i++) p.pix(hash(i, 1, seed) * W, hash(i, 2, seed) * H, hash(i, 3, seed) < 0.3 ? color : dim);
}

/**
 * Two lamps that are just the same: one close to you (big and bright) and one
 * far away across the dark room (small and dim). Words go on top in HTML.
 */
export function paintLamps(W: number, H: number): PixelBuffer {
  const p = new Paint(W, H);
  const floor = Math.round(H * 0.6);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (y < floor) p.pix(x, y, mixHex('#141a40', '#232a5c', y / floor));
      else {
        // a floor whose boards run off toward the far wall
        const t = (y - floor) / (H - floor);
        const board = Math.floor(((x - W / 2) / (0.2 + t * 0.8) + W) / 12) % 2;
        p.pix(x, y, mixHex(board ? '#2c2850' : '#332e5c', '#3d3870', t * 0.5));
      }
    }
  const lamp = (x: number, base: number, s: number) => {
    const top = base - 26 * s;
    p.rect(x - 0.6 * s, top, Math.max(1, 1.2 * s), base - top, STAR.trim, { form: 'cylV', box: [x - 0.6 * s, top, 1.2 * s, base - top] });
    p.ellipse(x, base, 4 * s, 1.2 * s, STAR.dark, { form: 'flat', level: 2 });
    return top - 3 * s;
  };
  const farY = lamp(W * 0.27, floor + 4, 0.35);
  const nearY = lamp(W * 0.7, H - 3, 1.45);
  const out = p.toBuffer({ outline: false });
  glow(out, W * 0.27, farY, 6, '#fff3b0', 0.55);
  glow(out, W * 0.7, nearY, 30, '#fff3b0', 0.85);
  const bulb = (cx: number, cy: number, r: number) => {
    for (let y = Math.floor(cy - r); y <= cy + r; y++)
      for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r;
        if (d <= 1) out.set(x, y, d < 0.55 ? '#ffffff' : '#fff6c4');
      }
  };
  bulb(W * 0.27, farY, 1.3);
  bulb(W * 0.7, nearY, 5.5);
  return out;
}

/** Where the tags go on the lamps picture (as fractions of its size). */
export const LAMP_TAGS = { near: [0.7, 0.18], far: [0.27, 0.38] } as const;

/**
 * A little town under the sky. At night the stars and the Moon are out and
 * windows glow. In the day the sky is bright blue with the Sun; with
 * `ghosts`, the stars are drawn faintly in the day sky too (they are still
 * there, just hidden by the bright sky).
 */
export function paintStarSky(W: number, H: number, day: boolean, ghosts = false): PixelBuffer {
  const p = new Paint(W, H);
  const ground = Math.round(H * 0.8);
  for (let y = 0; y < ground; y++)
    for (let x = 0; x < W; x++) p.pix(x, y, day ? mixHex('#4f9fe0', '#bfe3f5', y / ground) : mixHex('#0a0f2e', '#26336e', y / ground));
  if (!day || ghosts)
    for (let i = 0; i < 46; i++) {
      const x = hash(i, 1, 21) * W;
      const y = hash(i, 2, 21) * (ground - 6);
      const big = hash(i, 3, 21) < 0.25;
      const c = day ? mixHex(mixHex('#4f9fe0', '#bfe3f5', y / ground), '#ffffff', 0.55) : big ? '#ffffff' : '#a9c4ff';
      p.pix(x, y, c);
      if (big && !day) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) p.pix(x + dx, y + dy, '#7f98d8');
    }
  // hills and houses
  for (let x = 0; x < W; x++) {
    const hy = ground - 2 - Math.round(Math.sin(x / 9) * 1.5 + Math.sin(x / 23) * 2);
    for (let y = hy; y < H; y++) p.dot(x, y, day ? ramp('#4f9a44') : ramp('#1d3326'), y === hy ? 3 : 2);
  }
  const houses: Array<[number, number, string]> = [
    [0.12, 9, '#c8645a'],
    [0.3, 7, '#e2b25a'],
    [0.56, 10, '#6a8ad0'],
    [0.84, 8, '#b06ad0'],
  ];
  for (const [fx, hw, col] of houses) {
    const x = Math.round(W * fx);
    const top = ground - hw;
    const wall = day ? ramp(col) : ramp(mixHex(col, '#0a0f2e', 0.6));
    p.rect(x, top, hw, hw + 2, wall, { form: 'flat', level: 2 });
    p.poly(
      [
        [x - 1, top],
        [x + hw / 2, top - hw * 0.6],
        [x + hw + 1, top],
      ],
      day ? ramp('#7a4a3a') : ramp('#2a1f2a'),
      { form: 'flat', level: 2 },
    );
    p.pix(x + 2, top + 3, day ? '#cfe8ff' : '#ffd36a');
    p.pix(x + hw - 3, top + 3, day ? '#cfe8ff' : '#ffd36a');
  }
  const out = p.toBuffer({ outline: false });
  const body = day ? paintPlanet('sun', Math.max(5, Math.round(H * 0.09)), 0) : paintPlanet('moon', Math.max(4, Math.round(H * 0.06)), 0);
  out.blit(body, Math.round(W * 0.8 - body.w / 2), Math.round(H * 0.2 - body.h / 2));
  return out;
}

/** Star pictures (constellations), as stars in 0..1 boxes and the lines that join them. */
const CONSTELLATIONS: Record<Season, { name: string; stars: Array<[number, number, number?]>; lines: Array<[number, number]> }> = {
  // Orion, the hunter: shoulders, the three belt stars, knees, and his head
  winter: {
    name: 'Orion',
    stars: [
      [0.32, 0.22, 2], // Betelgeuse (red)
      [0.64, 0.26, 1], // Bellatrix
      [0.43, 0.52, 1],
      [0.5, 0.49, 1],
      [0.57, 0.46, 1], // the belt
      [0.38, 0.84, 1], // Saiph
      [0.68, 0.8, 3], // Rigel (blue-white)
      [0.48, 0.1, 0], // the head
    ],
    lines: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [7, 0], [7, 1]],
  },
  // Leo, the lion: the backward question mark of his head, and his back
  spring: {
    name: 'Leo',
    stars: [
      [0.36, 0.56, 1], // Regulus
      [0.34, 0.4, 0],
      [0.38, 0.27, 0],
      [0.47, 0.22, 0],
      [0.52, 0.32, 0],
      [0.66, 0.42, 0],
      [0.82, 0.52, 1], // Denebola
      [0.62, 0.6, 0],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 7], [7, 0]],
  },
  // Scorpius, the scorpion: the claws, red Antares, and the long curled tail
  summer: {
    name: 'Scorpius',
    stars: [
      [0.2, 0.14, 0],
      [0.26, 0.24, 0],
      [0.18, 0.32, 0],
      [0.34, 0.36, 2], // Antares (red)
      [0.4, 0.48, 0],
      [0.44, 0.62, 0],
      [0.5, 0.74, 0],
      [0.6, 0.82, 0],
      [0.72, 0.8, 0],
      [0.78, 0.7, 0],
      [0.74, 0.6, 1], // the stinger
    ],
    lines: [[0, 1], [2, 1], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]],
  },
  // Pegasus, the winged horse: the Great Square and the neck
  autumn: {
    name: 'Pegasus',
    stars: [
      [0.36, 0.28, 1],
      [0.66, 0.26, 1],
      [0.68, 0.6, 1],
      [0.38, 0.62, 1],
      [0.24, 0.72, 0],
      [0.12, 0.7, 0],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5]],
  },
};

export const CONSTELLATION_NAME: Record<Season, string> = { winter: 'Orion', spring: 'Leo', summer: 'Scorpius', autumn: 'Pegasus' };

function drawConstellation(out: PixelBuffer, s: Season, x0: number, y0: number, w: number, h: number, lines: boolean, small = false): void {
  const c = CONSTELLATIONS[s];
  const at = (i: number): [number, number] => [x0 + c.stars[i][0] * w, y0 + c.stars[i][1] * h];
  if (lines)
    for (const [a, b] of c.lines) {
      const [ax, ay] = at(a);
      const [bx, by] = at(b);
      const n = Math.ceil(Math.hypot(bx - ax, by - ay));
      for (let k = 2; k < n - 1; k++) if (small || k % 2 === 0) out.set(Math.round(ax + ((bx - ax) * k) / n), Math.round(ay + ((by - ay) * k) / n), small ? '#4a5aa0' : '#6f86c8');
    }
  c.stars.forEach((st, i) => {
    const [x, y] = at(i).map(Math.round);
    const col = st[2] === 2 ? '#ffb07a' : st[2] === 3 ? '#cfe4ff' : '#fff8e0';
    out.set(x, y, '#ffffff');
    if (!small && (st[2] ?? 0) > 0) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) out.set(x + dx, y + dy, col);
    else if (!small) out.set(x + 1, y, col);
  });
}

/** A star picture in the evening sky over dark trees: Orion in winter, Leo in spring, Scorpius in summer, Pegasus in autumn. */
export function paintConstellation(W: number, H: number, s: Season, lines = true): PixelBuffer {
  const p = new Paint(W, H);
  const ground = Math.round(H * 0.86);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.pix(x, y, mixHex('#070b26', '#1e2a62', y / H));
  starfield(p, W, ground, Math.round(W * H * 0.012), 33);
  for (let x = 0; x < W; x++) {
    const tree = Math.abs(Math.sin(x / 3.1) * 3 + Math.sin(x / 7) * 2);
    for (let y = Math.round(ground - tree); y < H; y++) p.pix(x, y, '#060a18');
  }
  const out = p.toBuffer({ outline: false });
  drawConstellation(out, s, W * 0.2, H * 0.08, W * 0.6, H * 0.74, lines);
  return out;
}

/**
 * Earth's trip round the Sun, seen from above, with four star pictures far
 * out beyond it. Earth sits where it is in the chosen season, its night side
 * (away from the Sun) facing that season's star picture. Returns where each
 * star picture and Earth are (for HTML labels).
 */
export function paintSeasonOrbit(W: number, H: number, season: Season): { buf: PixelBuffer; spots: Record<Season, [number, number]>; earth: [number, number] } {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.pix(x, y, (x + y) % 2 ? '#0a0e28' : '#0c112e');
  starfield(p, W, H, Math.round(W * H * 0.006), 51, '#8a9ad8', '#3a4580');
  const out = p.toBuffer({ outline: false });
  const cx = W / 2;
  const cy = H / 2;
  const rx = W * 0.2;
  const ry = H * 0.27;
  for (let a = 0; a < Math.PI * 2; a += 0.06) out.set(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), '#3f5aa8');
  const sun = paintPlanet('sun', Math.max(4, Math.round(H * 0.08)), 0);
  out.blit(sun, Math.round(cx - sun.w / 2), Math.round(cy - sun.h / 2));
  // winter on the left, spring at the bottom, summer on the right, autumn at the top
  const ANG: Record<Season, number> = { winter: Math.PI, spring: Math.PI / 2, summer: 0, autumn: -Math.PI / 2 };
  const spots = {} as Record<Season, [number, number]>;
  for (const s of Object.keys(ANG) as Season[]) {
    const a = ANG[s];
    const bw = W * 0.16;
    const bh = H * 0.24;
    const sx = cx + Math.cos(a) * W * 0.4;
    const sy = cy + Math.sin(a) * H * 0.38;
    spots[s] = [sx, sy];
    drawConstellation(out, s, sx - bw / 2, sy - bh / 2, bw, bh, true, true);
  }
  // Earth, lit on the side facing the Sun, and a dotted look-out line from its night side
  const a = ANG[season];
  const ex = cx + Math.cos(a) * rx;
  const ey = cy + Math.sin(a) * ry;
  const [tx, ty] = spots[season];
  const n = Math.ceil(Math.hypot(tx - ex, ty - ey));
  for (let k = 6; k < n - 8; k += 2) out.set(Math.round(ex + ((tx - ex) * k) / n), Math.round(ey + ((ty - ey) * k) / n), STAR.neonPink);
  const er = Math.max(3, Math.round(H * 0.05));
  const earth = paintPlanet('earth', er, 0.2);
  const lx = Math.cos(a);
  const ly = Math.sin(a);
  for (let y = 0; y < earth.h; y++)
    for (let x = 0; x < earth.w; x++) {
      const c = earth.get(x, y);
      if (!c) continue;
      // the half facing away from the Sun is night
      const dx = x + 0.5 - earth.w / 2;
      const dy = y + 0.5 - earth.h / 2;
      if (dx * lx + dy * ly > 0) earth.set(x, y, mixHex(c, '#020414', 0.62));
    }
  out.blit(earth, Math.round(ex - earth.w / 2), Math.round(ey - earth.h / 2));
  return { buf: out, spots, earth: [ex, ey] };
}

/**
 * The Sun shining on the Moon (or on Venus), lit on the side facing the Sun.
 * With `rays`, dotted lines show sunlight going to it and bouncing on to
 * Earth. With `orbit`, the Moon's path round Earth and the pull of Earth's
 * gravity are drawn instead.
 */
export function paintMoonlight(W: number, H: number, body: 'moon' | 'venus', rays: boolean, orbit = false): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.pix(x, y, '#090c24');
  starfield(p, W, H, Math.round(W * H * 0.01), 61);
  const out = p.toBuffer({ outline: false });
  const sun = paintPlanet('sun', Math.round(H * 0.42), 0);
  out.blit(sun, Math.round(-sun.w * 0.62), Math.round(H * 0.42 - sun.h / 2));
  const sunEdge = sun.w * 0.38 - 3;
  const [bx, by] = [W * 0.56, H * 0.3];
  const [ex, ey] = [W * 0.84, H * 0.68];
  const dotted = (x1: number, y1: number, x2: number, y2: number, c: string, step = 3) => {
    const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
    for (let k = 0; k < n; k += step) out.set(Math.round(x1 + ((x2 - x1) * k) / n), Math.round(y1 + ((y2 - y1) * k) / n), c);
  };
  if (orbit) {
    const r = Math.hypot(bx - ex, by - ey);
    for (let a = 0; a < Math.PI * 2; a += 1.5 / r) out.set(Math.round(ex + Math.cos(a) * r), Math.round(ey + Math.sin(a) * r), '#5f78c8');
    // Earth's pull on the Moon: an arrow toward Earth
    const ux = (ex - bx) / r;
    const uy = (ey - by) / r;
    for (let k = 7; k < 17; k++) out.set(Math.round(bx + ux * k), Math.round(by + uy * k), STAR.neonPink);
    const hx = bx + ux * 17;
    const hy = by + uy * 17;
    out.set(Math.round(hx - ux * 2 - uy * 2), Math.round(hy - uy * 2 + ux * 2), STAR.neonPink);
    out.set(Math.round(hx - ux * 2 + uy * 2), Math.round(hy - uy * 2 - ux * 2), STAR.neonPink);
  }
  if (rays) {
    dotted(sunEdge, H * 0.3, bx - 5, by, '#fff3a8');
    dotted(sunEdge, H * 0.42, bx - 5, by + 2, '#fff3a8');
    dotted(bx + 4, by + 3, ex - 6, ey - 4, '#cfe8ff', 2);
  }
  const br = body === 'moon' ? 5 : 6;
  const b = paintPlanet(body, br, 0.1);
  for (let y = 0; y < b.h; y++)
    for (let x = 0; x < b.w; x++) {
      const c = b.get(x, y);
      if (c && x + 0.5 - b.w / 2 > 0.6) b.set(x, y, mixHex(c, '#020414', 0.7));
    }
  out.blit(b, Math.round(bx - b.w / 2), Math.round(by - b.h / 2));
  const e = paintPlanet('earth', 8, 0.3);
  for (let y = 0; y < e.h; y++)
    for (let x = 0; x < e.w; x++) {
      const c = e.get(x, y);
      if (c && x + 0.5 - e.w / 2 > 1) e.set(x, y, mixHex(c, '#020414', 0.6));
    }
  out.blit(e, Math.round(ex - e.w / 2), Math.round(ey - e.h / 2));
  return out;
}

// ------------------------------------------------------------------ the Launch Bay's pictures

/** Where the little planet sits in a W x H cannon picture, and how a point on a shot's path (in planet radii) maps onto it. */
export function cannonFrame(W: number, H: number): { cx: number; cy: number; R: number; at: (x: number, y: number) => [number, number] } {
  const cx = W * 0.44;
  const cy = H * 0.56;
  const R = H * 0.27;
  return { cx, cy, R, at: (x, y) => [cx + x * R, cy + y * R - 1.5] };
}

/**
 * Tess's cannon on a little made-up planet (after Isaac Newton's drawing).
 * `show` draws one shot's path (worked out with real gravity), or all three:
 * too slow (it lands), just right (an orbit) and too fast (it flies away).
 * Returns where the end of each drawn path is (for HTML labels).
 */
export function paintCannon(W: number, H: number, show: Shot | 'all' | 'none'): { buf: PixelBuffer; ends: Partial<Record<Shot, [number, number]>> } {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.pix(x, y, '#090c24');
  starfield(p, W, H, Math.round(W * H * 0.01), 71);
  const { cx, cy, R, at } = cannonFrame(W, H);
  p.ellipse(cx, cy, R, R, ramp('#8a6ad6'), { dither: true });
  for (let y = Math.floor(cy - R); y < cy + R; y++)
    for (let x = Math.floor(cx - R); x < cx + R; x++)
      if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < R - 0.5 && hash(x >> 2, y >> 2, 12) > 0.62) p.dot(x, y, ramp('#3aa59a'), p.levelAt(x, y));
  const top = cy - R * ORBIT_R;
  p.poly(
    [
      [cx - R * 0.32, cy - R * 0.92],
      [cx, top + 1],
      [cx + R * 0.32, cy - R * 0.92],
    ],
    ramp('#b8a898'),
    { sep: true },
  );
  p.poly(
    [
      [cx - R * 0.09, top + R * 0.12],
      [cx, top + 1],
      [cx + R * 0.09, top + R * 0.12],
    ],
    ramp('#f2f6fa'),
    { form: 'flat', level: 3 },
  );
  p.rect(cx - 1, top - 2.5, 6, 2.5, STAR.dark, { form: 'cylH', box: [cx - 1, top - 2.5, 6, 2.5], sep: true });
  p.ellipse(cx - 0.5, top - 0.6, 1.6, 1.6, STAR.orange, { sep: true });
  const out = p.toBuffer();
  const ends: Partial<Record<Shot, [number, number]>> = {};
  const COLORS: Record<Shot, string> = { slow: '#ffb547', orbit: '#7ff0ff', escape: '#ff8fd0' };
  const shots: Shot[] = show === 'all' ? ['slow', 'orbit', 'escape'] : show === 'none' ? [] : [show];
  for (const s of shots) {
    const f = launch(SHOT_SPEED[s]);
    const pts = f.path.map(([x, y]) => at(x, y));
    pts.forEach(([x, y], i) => {
      if (i % 2 === 0 && x >= 0 && y >= 0 && x < W && y < H) out.set(Math.round(x), Math.round(y), COLORS[s]);
    });
    const inside = pts.filter(([x, y]) => x >= 2 && y >= 2 && x < W - 2 && y < H - 2);
    const last = s === 'orbit' ? pts[Math.floor(pts.length * 0.5)] : (inside[inside.length - 1] ?? pts[pts.length - 1]);
    ends[s] = last;
    // the probe at the end of its path
    if (show !== 'all') {
      const [px, py] = last.map(Math.round);
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) out.set(px + dx, py + dy, STAR.neonPink);
    }
  }
  return { buf: out, ends };
}

/**
 * Earth with children standing on it, dropping balls: one on top, or one on
 * every side (even the bottom). With `arrows`, an arrow from each ball shows
 * which way gravity pulls: toward the middle of Earth.
 */
export function paintDown(W: number, H: number, all: boolean, arrows: boolean): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.pix(x, y, '#090c24');
  starfield(p, W, H, Math.round(W * H * 0.01), 81);
  const out = p.toBuffer({ outline: false });
  const cx = W / 2;
  const cy = H / 2 + (all ? 0 : H * 0.16);
  const r = Math.round(H * (all ? 0.24 : 0.3));
  const e = paintPlanet('earth', r, 0.15);
  out.blit(e, Math.round(cx - e.w / 2), Math.round(cy - e.h / 2));
  const angles = all ? [-Math.PI / 2, 0, Math.PI / 2, Math.PI] : [-Math.PI / 2];
  const skins = ['#8d5a3b', '#f1c27d', '#5b3a29', '#c68642'];
  const shirts = ['#ff5fa8', '#4fd6ff', '#7dea8a', '#ffb547'];
  // each child is drawn standing straight out from the ground, so the one at the bottom is upside down in the picture
  const k = all ? 1.5 : 1.8;
  angles.forEach((a, i) => {
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const vx = -uy;
    const vy = ux;
    const at = (out1: number, side = 0): [number, number] => [cx + ux * (r + out1 * k) + vx * side * k, cy + uy * (r + out1 * k) + vy * side * k];
    const blob = (o: number, sd: number, rad: number, c: string) => {
      const [bx, by] = at(o, sd);
      const R = rad * k;
      for (let y = Math.floor(by - R); y <= by + R; y++) for (let x = Math.floor(bx - R); x <= bx + R; x++) if (Math.hypot(x + 0.5 - bx, y + 0.5 - by) <= R) out.set(x, y, c);
    };
    // legs, body and head
    for (let s2 = 0; s2 <= 7 * k; s2 += 0.5) {
      const o = s2 / k;
      const c = o < 3 ? '#2b2f55' : shirts[i];
      for (const sd of [-0.6, 0, 0.6]) {
        const [x, y] = at(o, sd);
        out.set(Math.round(x), Math.round(y), c);
      }
    }
    blob(9.2, 0, 1.9, skins[i]);
    // the arm out to one side, and the ball just let go
    for (let s2 = 0.5; s2 <= 3.2; s2 += 0.25) {
      const [x, y] = at(6.2, s2);
      out.set(Math.round(x), Math.round(y), skins[i]);
    }
    blob(4.6, 5.2, 1.2, '#ff8a3c');
    const [bx, by] = at(4.6, 5.2);
    if (arrows) {
      // an arrow from the ball toward the middle of Earth
      const dx = cx - bx;
      const dy = cy - by;
      const d = Math.hypot(dx, dy);
      const nx = dx / d;
      const ny = dy / d;
      // the arrow runs all the way in, so every arrow meets at the middle
      const len = d - 4;
      for (let s2 = 3; s2 < len; s2++) out.set(Math.round(bx + nx * s2), Math.round(by + ny * s2), s2 % 4 === 3 ? '#ffffff' : STAR.neonPink);
      const hx = bx + nx * len;
      const hy = by + ny * len;
      for (let s2 = 1; s2 <= 2; s2++) {
        out.set(Math.round(hx - nx * s2 - ny * s2), Math.round(hy - ny * s2 + nx * s2), STAR.neonPink);
        out.set(Math.round(hx - nx * s2 + ny * s2), Math.round(hy - ny * s2 - nx * s2), STAR.neonPink);
      }
    }
  });
  if (arrows) for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1]]) out.set(Math.round(cx) + dx, Math.round(cy) + dy, '#ffffff');
  return out;
}

/**
 * Tilted Earth on both sides of the Sun: in December (left) the northern
 * half leans away from the Sun, and in June (right) it leans toward it. The
 * tilt points the same way in space all year. North is marked with a white
 * cap and the axis is a line through the poles.
 */
export function paintTilt(W: number, H: number): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.pix(x, y, '#090c24');
  starfield(p, W, H, Math.round(W * H * 0.008), 91);
  const out = p.toBuffer({ outline: false });
  const cx = W / 2;
  const cy = H / 2;
  for (let a = 0; a < Math.PI * 2; a += 0.05) out.set(Math.round(cx + Math.cos(a) * W * 0.33), Math.round(cy + Math.sin(a) * H * 0.18), '#3f5aa8');
  const sun = paintPlanet('sun', Math.max(5, Math.round(H * 0.12)), 0);
  out.blit(sun, Math.round(cx - sun.w / 2), Math.round(cy - sun.h / 2));
  const tilt = (23.4 * Math.PI) / 180;
  // the axis leans the same way (top to the left) in both places
  const ax = -Math.sin(tilt);
  const ay = -Math.cos(tilt);
  for (const side of [-1, 1]) {
    const ex = cx + side * W * 0.33;
    const ey = cy;
    const r = Math.max(5, Math.round(H * 0.13));
    const e = paintPlanet('earth', r, side > 0 ? 0.1 : 0.6);
    for (let y = 0; y < e.h; y++)
      for (let x = 0; x < e.w; x++) {
        const c = e.get(x, y);
        if (!c) continue;
        const dx = x + 0.5 - e.w / 2;
        const dy = y + 0.5 - e.h / 2;
        // north cap (white) and the night half, away from the Sun
        if (dx * ax + dy * ay > r * 0.78) e.set(x, y, '#f4f8ff');
        if (dx * side > 0.5) e.set(x, y, mixHex(e.get(x, y)!, '#020414', 0.6));
      }
    out.blit(e, Math.round(ex - e.w / 2), Math.round(ey - e.h / 2));
    for (let k = -r - 4; k <= r + 4; k++) if (Math.abs(k) > r - 1) out.set(Math.round(ex + ax * k), Math.round(ey + ay * k), '#ffffff');
  }
  return out;
}

/** The years of the planets, for the hint picture under the row of planets (NASA). */
export const YEARS = ['88 days', '225 days', '1 year', '1.9 years', '12 years', '29 years', '84 years', '165 years'];

// ------------------------------------------------------------------ the finale

/**
 * The star party: the observatory's dome open to the night, the Milky Way
 * across the sky, the big telescope with all four lenses lit, and the crew
 * and the player standing on the deck with Vee hovering over them.
 */
export function paintStarParty(W: number, H: number, crew: Look16[]): PixelBuffer {
  const p = new Paint(W, H);
  const deck = Math.round(H * 0.8);
  for (let y = 0; y < deck; y++)
    for (let x = 0; x < W; x++) {
      // the Milky Way: a soft, speckled band from top left to bottom right
      const band = Math.abs(y - (x * 0.42 + H * 0.02)) / (H * 0.14);
      let c = mixHex('#04061a', '#16205a', y / deck);
      if (band < 1) c = mixHex(c, '#6a6aa8', (1 - band) * 0.35 * (0.6 + hash(x >> 1, y >> 1, 101) * 0.4));
      p.pix(x, y, c);
    }
  starfield(p, W, deck, Math.round(W * H * 0.02), 103, '#ffffff', '#8a94c8');
  for (let i = 0; i < W * H * 0.01; i++) {
    const x = hash(i, 1, 105) * W;
    const y = x * 0.42 + H * 0.02 + (hash(i, 2, 105) - 0.5) * H * 0.22;
    if (y < deck) p.pix(x, y, '#e8e8ff');
  }
  // the open dome's rim, and the deck
  for (let x = 0; x < W; x++) {
    const rim = deck - Math.round(Math.sqrt(Math.max(0, 1 - ((x - W / 2) / (W * 0.62)) ** 2)) * H * 0.08);
    for (let y = rim; y < deck; y++) p.dot(x, y, STAR.wall, y === rim ? 3 : 1);
  }
  p.rect(0, deck, W, H - deck, STAR.deck, { form: 'flat', level: 2 });
  for (let x = 0; x < W; x += 12) p.rect(x, deck, 1, H - deck, STAR.deck2, { form: 'flat', level: 1 });
  p.rect(0, deck, W, 1, STAR.trim, { form: 'flat', level: 3 });
  const out = p.toBuffer({ outline: false });
  // a few planets in the sky, not to scale
  for (const [id, fx, fy, r] of [
    ['jupiter', 0.12, 0.18, 5],
    ['saturn', 0.86, 0.14, 4],
    ['moon', 0.7, 0.3, 4],
  ] as const) {
    const b = paintPlanet(id, r, 0.2);
    out.blit(b, Math.round(W * fx - b.w / 2), Math.round(H * fy - b.h / 2));
  }
  const scope = paintBigTelescope(16, [true, true, true, true]);
  out.blit(scope, Math.round(W * 0.16 - scope.w / 2), deck - scope.h + 4);
  // the crew in a row, looking out at you
  const gap = W * 0.12;
  const x0 = W / 2 - (gap * (crew.length - 1)) / 2;
  crew.forEach((l, i) => {
    const b = paintHero(l, 1, 'down');
    out.blit(b, Math.round(x0 + gap * i - b.w / 2), deck - b.h + 6);
  });
  const vee = paintVee(16, 'right', 1);
  out.blit(vee, Math.round(W * 0.82 - vee.w / 2), Math.round(deck - H * 0.32));
  return out;
}

export { PixelBuffer };
