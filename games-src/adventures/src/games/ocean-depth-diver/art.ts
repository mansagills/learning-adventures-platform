import { PixelBuffer } from '../../kit/art/pixel';
import { Paint, hash, mixHex, ramp, type Ramp } from '../../kit/worlds/shade';
import { WILD, paintClownfish, paintLanternfish, paintOctopus, paintRay, paintSub, paintTurtle } from '../../kit/worlds/wild-lands/art';
import type { AnimalId, Zone } from './animals';
import type { Parts } from './designer';
import type { ChainLink } from './problems';

/**
 * Ocean Depth Diver's own pictures, in the Wild Lands style: the twilight
 * animals not in the world's art (the hatchetfish, the comb jelly), the
 * phytoplankton under Finn's microscope camera, seagrass and a coral head,
 * the Creature Designer's creatures (built from parts), and the question
 * pictures (the zone chart, food chains, the colors of light going down, a
 * fish seen from below, the sub's dials and the nightly trip).
 */

// ------------------------------------------------------------------ animals

/** A hatchetfish: thin, silver, big upward eyes and a row of belly lights (frames: tail flick). */
export function paintHatchetfish(s: number, frame = 0, glow = true): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(14 * s), Math.round(14 * s));
  const silver = ramp('#b8c8d8', { spread: 1.2 });
  const t = frame % 2 ? 0.8 : -0.8;
  p.poly(
    [
      [S(3), S(6)],
      [S(0.4), S(4 + t)],
      [S(0.4), S(8 + t)],
    ],
    silver,
    {},
  );
  // the deep, hatchet-shaped body
  p.poly(
    [
      [S(3), S(4.5)],
      [S(11), S(2.5)],
      [S(13), S(5)],
      [S(9), S(12.5)],
      [S(4), S(8)],
    ],
    silver,
    { sep: true, form: 'sphere' },
  );
  // the big eye, looking up
  p.ellipse(S(10.4), S(4.4), S(2), S(2.2), ramp('#1a2a3a'), { sep: true });
  p.ellipse(S(10.6), S(3.6), S(1), S(1), ramp('#9ff0ff'), { form: 'flat', level: 4 });
  for (let i = 0; i < 4; i++) p.pix(S(5.6 + i * 1.2), S(8.6 + i * 0.9), glow ? '#9ff4ff' : '#4a6a8a');
  return p.toBuffer();
}

/** A comb jelly: a clear oval with eight rows of rainbow combs (frames shift the rainbow). */
export function paintCombJelly(s: number, frame = 0): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(10 * s), Math.round(14 * s));
  const glass = ramp('#cfe8f4');
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) {
      const d = ((x + 0.5 - S(5)) / S(4.4)) ** 2 + ((y + 0.5 - S(7)) / S(6.4)) ** 2;
      if (d > 1) continue;
      p.dot(x, y, glass, d > 0.8 ? 3 : (x + y) % 3 ? 1 : 2);
    }
  const rainbow = ['#ff6a6a', '#ffb547', '#fff36a', '#7dea8a', '#5fd8ff', '#b07aff'];
  for (const cx of [2.2, 4, 6, 7.8]) {
    for (let y = S(2); y < S(12); y++) {
      const k = Math.floor(y / Math.max(1, s * 0.8) + frame) % rainbow.length;
      const xx = Math.round(S(cx) + Math.sin((y / S(10)) * Math.PI) * (cx < 5 ? -S(0.6) : S(0.6)));
      if (p.filled(xx, y)) p.pix(xx, y, rainbow[k]);
    }
  }
  return p.toBuffer({ outline: false });
}

/** Phytoplankton as Finn's microscope camera sees them: little green and gold shapes in a round view. */
export function paintPlankton(size: number, frame = 0): PixelBuffer {
  const p = new Paint(size, size);
  const c = size / 2;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c) / c;
      if (d > 1) continue;
      p.pix(x, y, d > 0.92 ? '#2a3a4a' : mixHex('#bff0e8', '#7fd8d0', d));
    }
  const shapes: Array<[number, number, number, string]> = [
    [0.3, 0.32, 0.12, '#5ac04a'],
    [0.62, 0.28, 0.09, '#c8b040'],
    [0.42, 0.62, 0.14, '#4aa86a'],
    [0.7, 0.62, 0.1, '#7ad04a'],
    [0.22, 0.6, 0.07, '#c8a040'],
  ];
  shapes.forEach(([fx, fy, fr, col], i) => {
    const x = fx * size + Math.sin(frame * 0.3 + i) * 1.2;
    const y = fy * size;
    const r = fr * size;
    if (i % 2) {
      // a round diatom with a ring pattern
      p.ellipse(x, y, r, r, ramp(col), { sep: true });
      p.ellipse(x, y, r * 0.5, r * 0.5, ramp(col), { form: 'flat', level: 3 });
    } else {
      // a chain of little boxes
      for (let k = 0; k < 3; k++) p.rect(x - r * 1.5 + k * r, y - r * 0.4, r * 0.9, r * 0.8, ramp(col), { sep: true });
    }
  });
  return p.toBuffer({ outline: false });
}

/** Phytoplankton in the water as the sub sees them: a drifting cloud of tiny green and gold specks (frames twinkle). */
export function paintPlanktonCloud(frame = 0): PixelBuffer {
  const out = new PixelBuffer(28, 18);
  for (let i = 0; i < 46; i++) {
    const a = hash(i, 1, 61) * Math.PI * 2;
    const r = Math.sqrt(hash(i, 2, 61));
    const x = Math.round(14 + Math.cos(a) * r * 13 + Math.sin(frame + i) * 0.6);
    const y = Math.round(9 + Math.sin(a) * r * 8);
    const c = i % 5 === 0 ? '#e8d870' : (i + frame) % 4 === 0 ? '#c8ff9a' : '#6ad05a';
    out.set(x, y, c);
  }
  return out;
}

/** A clump of seagrass blades on the sand (frames sway). */
export function paintSeagrass(s: number, frame = 0): PixelBuffer {
  const p = new Paint(Math.round(16 * s), Math.round(20 * s));
  const g = ramp('#5ab04a');
  for (let b = 0; b < 6; b++) {
    const x0 = (2 + b * 2.4) * s;
    const h = (12 + hash(b, 1, 5) * 7) * s;
    for (let y = 0; y < h; y++) {
      const k = y / h;
      const x = x0 + Math.sin(frame * 0.6 + b) * k * k * 2 * s;
      p.dot(x, p.h - 1 - y, g, y % 4 === 0 ? 3 : b % 2 ? 2 : 1);
      if (s > 1.4) p.dot(x + 1, p.h - 1 - y, g, 2);
    }
  }
  p.rect(0, p.h - 2 * s, p.w, 2 * s, WILD.sand, { level: 2 });
  return p.toBuffer();
}

/** A coral head close up: branches with little polyps, each a tiny animal with arms. */
export function paintCoralHead(W: number, H: number): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.pix(x, y, mixHex('#5ad8e6', '#2a9ad0', y / H));
  const coral = ramp('#ff9a6a');
  const arm = (x: number, y: number, a: number, len: number, d: number) => {
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    p.capsule(x, y, x2, y2, Math.max(1.4, 3.2 - d * 0.7), coral, { sep: true });
    if (d < 3) {
      arm(x2, y2, a - 0.45, len * 0.72, d + 1);
      arm(x2, y2, a + 0.45, len * 0.72, d + 1);
    } else {
      // a polyp at the tip, with tiny arms
      for (let k = 0; k < 6; k++) p.pix(x2 + Math.cos((k / 6) * Math.PI * 2) * 2, y2 + Math.sin((k / 6) * Math.PI * 2) * 2, '#ffe0c8');
    }
  };
  arm(W / 2, H, -Math.PI / 2, H * 0.32, 0);
  p.rect(0, H - 4, W, 4, WILD.sand, { level: 2 });
  // the tiny algae living inside, shown as specks of green-gold in a zoomed bubble
  const bx = W * 0.8;
  const by = H * 0.26;
  p.ellipse(bx, by, 11, 11, ramp('#e8f6f0'), { form: 'flat', level: 3 });
  for (let i = 0; i < 9; i++) p.ellipse(bx - 6 + hash(i, 1, 3) * 12, by - 6 + hash(i, 2, 3) * 12, 1.4, 1.4, ramp('#a8a040'), { form: 'flat', level: 2 });
  p.line(bx - 9, by + 7, W * 0.62, H * 0.42, ramp('#2a3a4a'), 2);
  return p.toBuffer();
}

/** One animal as a sprite (for the dive and the field guide). */
export function paintAnimal(id: AnimalId, s: number, frame = 0): PixelBuffer {
  switch (id) {
    case 'seagrass':
      return paintSeagrass(s, frame);
    case 'plankton':
      return paintPlankton(Math.round(18 * s), frame);
    case 'clownfish':
      return paintClownfish(s, frame);
    case 'octopus':
      return paintOctopus(s, frame);
    case 'turtle':
      return paintTurtle(s, frame % 3);
    case 'ray':
      return paintRay(s, frame % 3);
    case 'lanternfish':
      return paintLanternfish(s, frame);
    case 'hatchetfish':
      return paintHatchetfish(s, frame);
    case 'combjelly':
      return paintCombJelly(s, frame);
  }
}

const WATER: Record<Zone, [string, string]> = {
  sunlight: ['#5ad8e6', '#2a9ad0'],
  twilight: ['#1a4a8e', '#0c1a40'],
  midnight: ['#070d24', '#02040a'],
  vents: ['#070d24', '#2a1a10'],
};

/** A field guide card picture: the animal on a patch of its zone's water. */
export function paintAnimalCard(id: AnimalId, zone: Zone, W = 96, H = 64): PixelBuffer {
  const out = new PixelBuffer(W, H);
  const [a, b] = WATER[zone];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.set(x, y, (x + y) % 2 && y > H * 0.5 ? mixHex(a, b, y / H + 0.04) : mixHex(a, b, y / H));
  if (zone === 'sunlight')
    for (let i = 0; i < 4; i++)
      for (let y = 0; y < H * 0.7; y++) out.set(Math.round(W * (0.15 + i * 0.22) + y * 0.4), y, mixHex(out.get(Math.round(W * (0.15 + i * 0.22) + y * 0.4), y) ?? a, '#e6fbff', 0.18));
  const sp = paintAnimal(id, id === 'plankton' ? 2.8 : id === 'seagrass' ? 2.4 : id === 'turtle' || id === 'ray' ? 2.6 : 3.4, 0);
  const s = Math.min(1, (W - 6) / sp.w, (H - 6) / sp.h);
  const small = s < 1 ? shrink(sp, s) : sp;
  out.blit(small, Math.round((W - small.w) / 2), Math.round((H - small.h) / 2));
  if (zone !== 'sunlight' && (id === 'lanternfish' || id === 'hatchetfish' || id === 'combjelly')) halo(out, W / 2, H / 2, Math.min(W, H) * 0.45, id === 'combjelly' ? '#c8a8ff' : '#7ff0ff', 0.25);
  return out;
}

function shrink(b: PixelBuffer, s: number): PixelBuffer {
  const out = new PixelBuffer(Math.max(1, Math.round(b.w * s)), Math.max(1, Math.round(b.h * s)));
  for (let y = 0; y < out.h; y++) for (let x = 0; x < out.w; x++) out.set(x, y, b.get(Math.floor(x / s), Math.floor(y / s)));
  return out;
}

/** A soft glow laid over a picture (living light). */
function halo(b: PixelBuffer, cx: number, cy: number, r: number, c: string, max: number): void {
  for (let y = Math.floor(cy - r); y <= cy + r; y++)
    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const d = Math.hypot(x - cx, y - cy) / r;
      const cur = b.get(x, y);
      if (d > 1 || !cur) continue;
      const k = d < 0.4 ? max : d < 0.75 ? max * 0.55 : (x + y) % 2 ? max * 0.3 : 0;
      if (k) b.set(x, y, mixHex(cur, c, k));
    }
}

// ------------------------------------------------------------------ the Creature Designer's creatures

const SKIN: Record<Parts['skin'], Ramp> = {
  bright: ramp('#ffb03a'),
  silver: ramp('#b8c8d8', { spread: 1.2 }),
  red: ramp('#c8302a'),
  clear: ramp('#d8eef6'),
};

/**
 * A creature built from the designer's parts, side view facing right.
 * `s` scales it (1 = 24 x 18 pixels). Frames flick the tail; `glowOn` lights
 * its belly or lure.
 */
export function paintCreature(parts: Parts, s: number, frame = 0, glowOn = true): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(30 * s), Math.round(24 * s));
  const r = SKIN[parts.skin];
  const clear = parts.skin === 'clear';
  const t = frame % 2 ? 1 : -1;
  // the body's size and place
  const shape = parts.body === 'sleek' ? { cx: 15, cy: 13, rx: 9, ry: 4 } : parts.body === 'flat' ? { cx: 15, cy: 15, rx: 10, ry: 2.6 } : { cx: 15, cy: 12.5, rx: 7, ry: 6.2 };
  const { cx, cy, rx, ry } = shape;
  // tail and fins
  p.poly(
    [
      [S(cx - rx + 1.5), S(cy)],
      [S(cx - rx - 4), S(cy - 3.5 + t)],
      [S(cx - rx - 3), S(cy)],
      [S(cx - rx - 4), S(cy + 3.5 + t)],
    ],
    r,
    { sep: true },
  );
  if (parts.body === 'flat') {
    // wide wing-like fins
    p.poly(
      [
        [S(cx - 4), S(cy)],
        [S(cx + 1), S(cy - 6 - t)],
        [S(cx + 5), S(cy)],
      ],
      r,
      { sep: true },
    );
  } else {
    p.poly(
      [
        [S(cx - 2), S(cy - ry + 0.5)],
        [S(cx + 1), S(cy - ry - 3)],
        [S(cx + 3), S(cy - ry + 0.5)],
      ],
      r,
      { sep: true },
    );
  }
  // the body
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) {
      const nx = (x + 0.5 - S(cx)) / S(rx);
      const ny = (y + 0.5 - S(cy)) / S(ry);
      // sleek bodies come to a point at the nose
      const d = parts.body === 'sleek' ? nx * nx + ny * ny * (1 + Math.max(0, nx) * 0.8) : nx * nx + ny * ny;
      if (d > 1) continue;
      let lv = ny < -0.45 ? 3 : ny > 0.5 ? 1 : 2;
      if (clear) lv = d > 0.75 ? 3 : (x + y) % 3 ? 1 : 2;
      if (parts.skin === 'silver' && ny < 0.1 && (x + y) % 5 === 0) lv = 4;
      p.dot(x, y, r, lv);
      if (parts.skin === 'bright' && Math.floor((x / s - cx + 30) / 3.2) % 2 === 0 && d < 0.85) p.dot(x, y, ramp('#3a7ad8'), lv);
    }
  // the mouth
  const mx = cx + rx - (parts.body === 'round' ? 1.2 : 0.6);
  if (parts.mouth === 'wide') {
    p.line(S(mx - 4), S(cy + 1.2), S(mx), S(cy + 0.2), ramp('#2a1a2a'), 1);
    for (const k of [0, 1.4, 2.8]) p.pix(S(mx - 1 - k), S(cy + 0.9 + k * 0.1), '#f2f4ec');
  } else p.ellipse(S(mx), S(cy + 0.6), S(0.7), S(0.5), ramp('#2a1a2a'), { form: 'flat', level: 1 });
  // the eye
  const er = parts.eyes === 'big' ? 2.2 : 1;
  const ex = cx + rx * 0.45;
  const ey = cy - ry * 0.35 - (parts.eyes === 'big' ? 0.4 : 0);
  p.ellipse(S(ex), S(ey), S(er), S(er), WILD.white, { sep: true, form: 'flat', level: 4 });
  p.ellipse(S(ex + er * 0.25), S(ey), S(er * 0.55), S(er * 0.55), ramp('#1a1a2a'), { form: 'flat', level: 1 });
  // the lights
  if (parts.light === 'belly') for (let i = 0; i < 5; i++) p.pix(S(cx - rx * 0.6 + i * rx * 0.3), S(cy + ry * 0.75), glowOn ? '#bff8ff' : '#5a7a8a');
  if (parts.light === 'lure') {
    p.line(S(cx + rx * 0.2), S(cy - ry), S(cx + rx + 2), S(cy - ry - 4), ramp('#6a5a7a'), 2);
    p.ellipse(S(cx + rx + 2.4), S(cy - ry - 4.2), S(1.4), S(1.4), ramp(glowOn ? '#e8ff8a' : '#8a9a6a'), { form: 'flat', level: 4 });
  }
  return p.toBuffer({ outline: !clear });
}

// ------------------------------------------------------------------ question pictures

const ZONE_BANDS: Array<[Zone, string, string]> = [
  ['sunlight', '#5ad8e6', '#2f9ad0'],
  ['twilight', '#1f5aa0', '#132e66'],
  ['midnight', '#0a1438', '#050a1c'],
  ['vents', '#04060e', '#02030a'],
];

/** The ocean's layers as bands, with the sub drawn in one of them. Returns where each band's middle is (0-1), for labels. */
export function paintZoneChart(W: number, H: number, mark: Zone | null, lit: Zone[] = []): { buf: PixelBuffer; mids: Record<Zone, number> } {
  const out = new PixelBuffer(W, H);
  // the bands are not to scale: the top ones are given more room so they can be seen
  const heights = [0.27, 0.27, 0.26, 0.2];
  const mids = {} as Record<Zone, number>;
  let y0 = 0;
  ZONE_BANDS.forEach(([z, a, b], i) => {
    const h = Math.round(heights[i] * H);
    for (let y = y0; y < Math.min(H, y0 + h + (i === 3 ? H : 0)); y++)
      for (let x = 0; x < W; x++) {
        let c = mixHex(a, b, (y - y0) / h);
        if (y === y0 && i > 0) c = (x >> 1) % 2 ? mixHex(c, '#ffffff', 0.25) : c;
        if (lit.includes(z) && x < 4) c = '#f2c94c';
        out.set(x, y, c);
      }
    mids[z] = (y0 + h / 2) / H;
    y0 += h;
  });
  // sunbeams in the top band, glows in the twilight band
  for (let i = 0; i < 5; i++)
    for (let y = 0; y < H * 0.25; y++) out.set(Math.round(W * 0.12 + i * W * 0.18 + y * 0.5), y, mixHex(out.get(Math.round(W * 0.12 + i * W * 0.18 + y * 0.5), y) ?? '#fff', '#ffffff', 0.25));
  for (let i = 0; i < 7; i++) out.set(Math.round(hash(i, 1, 4) * W), Math.round(H * (0.32 + hash(i, 2, 4) * 0.2)), '#9ff4ff');
  for (let i = 0; i < 5; i++) out.set(Math.round(hash(i, 3, 4) * W), Math.round(H * (0.6 + hash(i, 4, 4) * 0.18)), '#d8ff8a');
  if (mark) {
    const sub = paintSub(8, 'right', 0, mark !== 'sunlight');
    const my = Math.round(mids[mark] * H - sub.h / 2);
    out.blit(sub, Math.round(W * 0.78 - sub.w / 2), my);
  }
  return { buf: out, mids };
}

/** A food chain: the Sun, then each link, with arrows between ("is eaten by"). Returns each link's middle (0-1) for labels. */
export function paintChain(W: number, H: number, links: ChainLink[], blank = -1): { buf: PixelBuffer; xs: number[] } {
  const out = new PixelBuffer(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.set(x, y, mixHex('#5ad8e6', '#2f9ad0', y / H));
  const n = links.length;
  const xs: number[] = [];
  const step = W / n;
  links.forEach((l, i) => {
    const cx = step * (i + 0.5);
    xs.push(cx / W);
    const cy = H * 0.45;
    if (i === blank) {
      const q = new Paint(22, 22);
      q.ellipse(11, 11, 10, 10, ramp('#f2f4ec'), { sep: true });
      out.blit(q.toBuffer(), Math.round(cx - 11), Math.round(cy - 11));
    } else {
      const b = chainSprite(l);
      out.blit(b, Math.round(cx - b.w / 2), Math.round(cy - b.h / 2));
    }
    if (i < n - 1) {
      // an arrow to the next link
      const ax0 = Math.round(cx + step * 0.3);
      const ax1 = Math.round(cx + step * 0.7);
      for (let x = ax0; x <= ax1; x++) for (const dy of [0, 1]) out.set(x, Math.round(cy) + dy, '#ffffff');
      for (let k = 1; k <= 3; k++) {
        out.set(ax1 - k, Math.round(cy) - k, '#ffffff');
        out.set(ax1 - k, Math.round(cy) + 1 + k, '#ffffff');
      }
    }
  });
  return { buf: out, xs };
}

function chainSprite(l: ChainLink): PixelBuffer {
  switch (l) {
    case 'sun': {
      const p = new Paint(24, 24);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        p.line(12 + Math.cos(a) * 8, 12 + Math.sin(a) * 8, 12 + Math.cos(a) * 11, 12 + Math.sin(a) * 11, ramp('#ffd04a'), 3);
      }
      p.ellipse(12, 12, 7, 7, ramp('#ffd04a'), { sep: true, bias: 0.3 });
      return p.toBuffer();
    }
    case 'plankton':
      return paintPlankton(22, 0);
    case 'smallfish': {
      const p = new Paint(18, 10);
      for (const [x, y] of [
        [3, 3],
        [10, 2],
        [7, 7],
      ]) {
        p.ellipse(x + 2, y, 3, 1.4, ramp('#c8d8e8'), { sep: true });
        p.pix(x + 4, y - 0.4, '#111111');
      }
      return p.toBuffer();
    }
    case 'bigfish': {
      const p = new Paint(26, 14);
      p.poly(
        [
          [4, 7],
          [0, 2],
          [0, 12],
        ],
        ramp('#3a7ad8'),
        {},
      );
      p.ellipse(14, 7, 11, 5, ramp('#3a7ad8'), { sep: true });
      p.ellipse(14, 9, 9, 2, ramp('#d8e8f0'), { onlyOver: true, form: 'flat', level: 3 });
      p.pix(21, 5.5, '#111111');
      return p.toBuffer();
    }
    case 'seagrass':
      return paintSeagrass(1.1, 0);
    case 'turtle':
      return paintTurtle(1, 0);
    case 'lanternfish':
      return paintLanternfish(2, 0);
  }
}

/**
 * White sunlight going down into the sea: one column per color (red,
 * orange, yellow, green, blue), each fading out at its own depth, red first
 * and blue last.
 */
export function paintColors(W: number, H: number): PixelBuffer {
  const out = new PixelBuffer(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.set(x, y, mixHex('#3ec0dc', '#050a1c', Math.min(1, (y / H) ** 0.8)));
  const cols: Array<[string, number]> = [
    ['#ff4a3a', 0.16],
    ['#ff9a2a', 0.3],
    ['#ffe04a', 0.46],
    ['#5ad04a', 0.62],
    ['#4a8aff', 0.92],
  ];
  const cw = Math.floor(W / (cols.length * 1.6));
  cols.forEach(([c, end], i) => {
    const x0 = Math.round(W * 0.14 + i * cw * 1.6);
    for (let y = 2; y < end * H; y++) {
      const fade = y / (end * H);
      for (let x = x0; x < x0 + cw; x++) if (fade < 0.75 || (x + y) % 2) out.set(x, y, mixHex(c, out.get(x, y) ?? '#000', fade * 0.6));
    }
  });
  // the surface and the Sun
  for (let x = 0; x < W; x++) out.set(x, 0, '#ffffff');
  return out;
}

/**
 * A fish seen from below, against the dim light from above. Without belly
 * lights it shows as a dark shape; with them, its shape all but disappears.
 */
export function paintBelow(W: number, H: number, glow: boolean): PixelBuffer {
  const out = new PixelBuffer(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - W / 2, y + H * 0.4) / (H * 1.4);
      out.set(x, y, mixHex('#3a6ab0', '#0a1430', Math.min(1, d)));
    }
  // the fish, seen from underneath
  const fx = W / 2;
  const fy = H * 0.4;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const nx = (x - fx) / (W * 0.18);
      const ny = (y - fy) / (H * 0.08);
      const tail = x < fx - W * 0.17 && x > fx - W * 0.26 && Math.abs(y - fy) < (fx - W * 0.17 - x) * 0.8 + 1;
      if (nx * nx + ny * ny > 1 && !tail) continue;
      const bg = out.get(x, y)!;
      out.set(x, y, glow ? ((x + y) % 4 === 0 ? mixHex(bg, '#9ff4ff', 0.35) : mixHex(bg, '#0a1430', 0.08)) : '#0a1222');
    }
  // a hunter far below, looking up
  const h = new Paint(40, 18);
  h.ellipse(20, 9, 16, 7, ramp('#2a3a5a'), { sep: true });
  h.ellipse(30, 7, 2, 2, ramp('#f2f4ec'), { form: 'flat', level: 4 });
  out.blit(h.toBuffer(), Math.round(W * 0.66), Math.round(H * 0.74));
  return out;
}

/** The sub's three dials (depth, temperature, pressure) as a picture; the numbers are added as text. */
export function paintDialFaces(W: number, H: number): PixelBuffer {
  const out = new PixelBuffer(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.set(x, y, mixHex('#3a4a5a', '#2a3440', y / H));
  const r = Math.min(W / 7, H * 0.36);
  for (let i = 0; i < 3; i++) {
    const cx = W * (0.18 + i * 0.32);
    const cy = H * 0.44;
    for (let y = Math.floor(cy - r - 2); y <= cy + r + 2; y++)
      for (let x = Math.floor(cx - r - 2); x <= cx + r + 2; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= r + 2) out.set(x, y, d > r ? '#c8a040' : d > r - 1 ? '#8a7030' : '#f2ecd8');
      }
  }
  return out;
}

/**
 * The nightly trip: on the left, day (the lanternfish deep down, the top
 * bright); on the right, night (the lanternfish near the top, the top dark,
 * with the Moon). An arrow shows them swimming up.
 */
export function paintMigrate(W: number, H: number): PixelBuffer {
  const out = new PixelBuffer(W, H);
  const half = Math.floor(W / 2);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const night = x >= half;
      const sky = y < H * 0.12;
      let c: string;
      if (sky) c = night ? '#1a1a4a' : '#9fdcf6';
      else c = night ? mixHex('#14305a', '#050a1c', y / H) : mixHex('#3ec0dc', '#0a1a44', (y / H) ** 0.8);
      if (x === half || x === half - 1) c = '#f2f4ec';
      out.set(x, y, c);
    }
  // the Sun and the Moon
  const sun = new Paint(12, 12);
  sun.ellipse(6, 6, 5, 5, ramp('#ffd04a'), { sep: true, bias: 0.3 });
  out.blit(sun.toBuffer(), Math.round(half * 0.8), 1);
  const moon = new Paint(10, 10);
  moon.ellipse(5, 5, 4, 4, ramp('#f2ecd8'), { sep: true });
  out.blit(moon.toBuffer(), Math.round(half + half * 0.75), 2);
  const fish = paintLanternfish(1.4, 0);
  for (let i = 0; i < 4; i++) {
    const dx = (i % 2) * 14 + i * 6;
    out.blit(fish, Math.round(half * 0.25 + dx), Math.round(H * 0.72 + (i % 2) * 6));
    out.blit(fish, Math.round(half + half * 0.25 + dx), Math.round(H * 0.18 + (i % 2) * 6));
  }
  halo(out, half * 0.5, H * 0.76, 22, '#7ff0ff', 0.25);
  halo(out, half + half * 0.5, H * 0.22, 22, '#7ff0ff', 0.25);
  // an arrow up, on the night side
  const ax = Math.round(half + half * 0.88);
  for (let y = Math.round(H * 0.3); y < H * 0.8; y++) out.set(ax, y, '#ffffff');
  for (let k = 1; k <= 3; k++) {
    out.set(ax - k, Math.round(H * 0.3) + k, '#ffffff');
    out.set(ax + k, Math.round(H * 0.3) + k, '#ffffff');
  }
  return out;
}

// ------------------------------------------------------------------ icons

/** A zone badge for the HUD and the expedition list: the zone's color with a little sign (lit when done). */
export function paintZoneBadge(z: Zone, lit: boolean, open = true): PixelBuffer {
  const p = new Paint(16, 16);
  const col = z === 'sunlight' ? '#5ad8e6' : z === 'twilight' ? '#2f6ac0' : z === 'midnight' ? '#1a2450' : '#3a2a20';
  p.ellipse(8, 8, 7, 7, ramp(lit ? col : mixHex(col, '#6a6a6a', 0.6)), { sep: true });
  if (z === 'sunlight') p.ellipse(8, 7, 3, 3, ramp(lit ? '#ffd04a' : '#a8a8a0'), { form: 'flat', level: 3 });
  else if (z === 'twilight') for (let i = 0; i < 3; i++) p.pix(5 + i * 3, 9 - (i % 2), lit ? '#9ff4ff' : '#9aa0a8');
  else p.ellipse(8, 8, 1.6, 1.6, ramp(lit ? '#d8ff8a' : '#9aa0a8'), { form: 'flat', level: 3 });
  const b = p.toBuffer();
  if (!open) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (b.get(x, y)) b.set(x, y, mixHex(b.get(x, y)!, '#2a2a2a', 0.5));
  return b;
}

/** The Creature Designer's icon: a little fish built from parts. */
export function paintDesignerIcon(lit: boolean): PixelBuffer {
  return paintCreature({ body: 'round', eyes: 'big', skin: lit ? 'bright' : 'silver', light: 'lure', mouth: 'wide' }, 0.6, 0, lit);
}
