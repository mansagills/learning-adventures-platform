import type { PixelBuffer } from '../../kit/art/pixel';
import { Paint, hash, ramp, type Ramp } from '../../kit/worlds/shade';
import { WILD } from '../../kit/worlds/wild-lands/art';
import { DIG, paintFossil, paintSkeleton, type FossilId } from '../../kit/worlds/wild-lands/dig-art';
import type { Tool } from './dig-logic';
import { FOSSILS, type LayerId } from './fossils';

/**
 * Fossil Dig Adventure's own pictures for the logbook and the station
 * panels: how a fossil forms (four steps), the three digging tools, the
 * stack of newspapers, two far-apart cliffs with the same layer, the layer
 * cards' rock swatches and the badges. Labels are added by the page as text.
 */

const LAYER_RAMP: Record<LayerId, Ramp> = {
  sea: DIG.seaRock,
  swamp: DIG.swampRock,
  river: DIG.riverRock,
  ice: DIG.iceRock,
  today: DIG.topsoil,
};

function blit(p: Paint, b: PixelBuffer, x0: number, y0: number): void {
  for (let y = 0; y < b.h; y++)
    for (let x = 0; x < b.w; x++) {
      const c = b.get(x, y);
      if (c) p.pix(Math.round(x0) + x, Math.round(y0) + y, c);
    }
}

function sky(p: Paint, W: number, h: number, base = '#a8d4ee'): void {
  const r = ramp(base);
  for (let y = 0; y < h; y++) for (let x = 0; x < W; x++) p.dot(x, y, r, y < h * 0.4 ? 3 : 2);
}

/** A band of rock from y0 to y1 (striped a little, like real layers). */
function band(p: Paint, W: number, y0: number, y1: number, r: Ramp, seed = 0): void {
  for (let y = Math.round(y0); y < Math.round(y1); y++)
    for (let x = 0; x < W; x++) {
      let lv = 2;
      if ((y + Math.round(Math.sin(x / 9 + seed) * 1.2)) % 5 === 0) lv = 1;
      if (hash(x >> 1, y >> 1, 40 + seed) < 0.05) lv = 3;
      if (y === Math.round(y0)) lv = 1;
      p.dot(x, y, r, lv);
    }
}

/** A young Triceratops, alive and side on (simple shapes), facing right. */
function paintTrike(p: Paint, x: number, y: number, s: number): void {
  const S = (v: number) => v * s;
  const g = ramp('#6a8a4a');
  p.ellipse(x + S(16), y + S(10), S(12), S(7), g, { sep: true });
  p.capsule(x + S(4), y + S(9), x - S(3), y + S(14), S(2.2), g, {});
  for (const lx of [9, 13, 20, 24]) p.rect(x + S(lx - 1.6), y + S(14), S(3.2), S(6), g, { sep: true });
  // the frill, the head and the horns
  p.ellipse(x + S(27), y + S(5), S(4), S(6), ramp('#c26a44'), { sep: true });
  p.ellipse(x + S(31), y + S(9), S(4.6), S(3.4), g, { sep: true });
  p.line(x + S(31), y + S(6), x + S(36), y + S(1), ramp('#f2eee0'), 3);
  p.line(x + S(35), y + S(8), x + S(37), y + S(6), ramp('#f2eee0'), 3);
  p.pix(x + S(32), y + S(8), '#1a1a1a');
}

/**
 * How a fossil forms, one step: 0 a young Triceratops by a river; 1 it has
 * died and mud has buried its bones; 2 many layers pile on top and the bones
 * turn to stone; 3 the layers wear away and a bone peeks out of a hillside.
 */
export function paintFormStep(step: 0 | 1 | 2 | 3, W = 120, H = 72): PixelBuffer {
  const p = new Paint(W, H);
  const ground = Math.round(H * (step === 0 ? 0.62 : step === 1 ? 0.5 : 0.24));
  sky(p, W, H);
  if (step === 3) {
    // a worn hillside of layers, with a bone sticking out
    const hill = (x: number) => H * 0.3 + Math.abs(x - W * 0.55) * 0.5;
    for (let x = 0; x < W; x++)
      for (let y = Math.round(hill(x)); y < H; y++) {
        const k = Math.floor((y - H * 0.3) / 9);
        const r = [DIG.cream, DIG.rust, DIG.tan, DIG.ash, DIG.clay, DIG.rust][Math.max(0, Math.min(5, k))];
        p.dot(x, y, r, hash(x >> 1, y >> 1, 50) < 0.05 ? 3 : y === Math.round(hill(x)) ? 3 : 2);
      }
    const bone = paintFossil('trike-horn', 1.2);
    blit(p, bone, W * 0.32 - bone.w / 2, H * 0.6);
    // a little brush at work
    p.line(W * 0.42, H * 0.56, W * 0.5, H * 0.44, WILD.wood, 2);
    p.rect(W * 0.4, H * 0.56, 3, 3, ramp('#f2c94c'), { level: 3 });
    return p.toBuffer({ outline: false });
  }
  if (step === 0) {
    // grass, a river and the living animal
    for (let y = ground; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, y > H * 0.82 ? DIG.creek : ramp('#7aa05a'), hash(x, y, 51) < 0.06 ? 3 : 2);
    paintTrike(p, W * 0.24, ground - 20, 1.3);
    for (let k = 0; k < 4; k++) p.ellipse(W * (0.12 + k * 0.25), ground - 2, 4, 6, ramp('#4a7a3a'), { sep: true });
    return p.toBuffer({ outline: false });
  }
  // steps 1 and 2: mud (and then rock) over the bones
  if (step === 1) band(p, W, ground, H, DIG.mudflat, 1);
  else {
    const layers: Ramp[] = [DIG.riverRock, DIG.iceRock, DIG.tan, DIG.topsoil];
    const hEach = (H - ground) / 5;
    band(p, W, H - hEach * 2, H, layers[0], 2);
    for (let k = 1; k < layers.length; k++) band(p, W, H - hEach * (k + 2), H - hEach * (k + 1), layers[k], k + 3);
  }
  // a thin creek on top of the new ground
  for (let x = 0; x < W; x++) p.dot(x, ground - 1, DIG.creek, 3);
  const bone = paintSkeleton(1.2);
  const by = step === 1 ? ground + (H - ground) * 0.3 : H - (H - ground) * 0.36;
  // the bones lie flat in the mud (only the skull and backbone; the stand left out)
  for (let y = 0; y < bone.h - 6; y++)
    for (let x = 0; x < bone.w; x++) {
      const c = bone.get(x, y);
      if (!c) continue;
      const px = W * 0.5 - bone.w / 2 + x;
      const py = by - bone.h * 0.32 + y * 0.5;
      p.pix(px, py, step === 2 ? (y % 3 === 0 ? '#6e5a48' : '#8a7a68') : c);
    }
  return p.toBuffer({ outline: false });
}

/** One digging tool, upright: the shovel, the rock pick or the soft brush. `s` 1 = about 16 x 24 pixels. */
export function paintTool(t: Tool, s = 1): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(16 * s), Math.round(24 * s));
  if (t === 'shovel') {
    p.rect(S(7), S(1), S(2), S(14), WILD.wood, { sep: true });
    p.rect(S(5), S(1), S(6), S(2), WILD.wood, { sep: true });
    p.poly(
      [
        [S(3), S(14)],
        [S(13), S(14)],
        [S(12), S(22)],
        [S(8), S(23.4)],
        [S(4), S(22)],
      ],
      WILD.metal,
      { sep: true },
    );
  } else if (t === 'pick') {
    p.rect(S(7), S(4), S(2), S(19), WILD.wood, { sep: true });
    p.poly(
      [
        [S(1), S(5)],
        [S(8), S(2)],
        [S(15), S(4)],
        [S(15), S(6)],
        [S(8), S(5)],
        [S(1), S(7)],
      ],
      WILD.metal,
      { sep: true },
    );
  } else {
    p.rect(S(7), S(1), S(2), S(14), WILD.wood, { sep: true });
    p.rect(S(6), S(14), S(4), S(2), WILD.metal, { sep: true });
    for (let k = 0; k < 6; k++) p.line(S(5.6 + k), S(16), S(5 + k * 1.2), S(23), ramp('#f2c94c'), k % 2 ? 3 : 2);
  }
  return p.toBuffer();
}

/** The three tools laid out on a board, biggest to gentlest. */
export function paintTools(W = 120, H = 60): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, WILD.wood, y % 8 === 0 ? 1 : hash(x, y, 60) < 0.05 ? 3 : 2);
  (['shovel', 'pick', 'brush'] as Tool[]).forEach((t, i) => {
    const b = paintTool(t, 1.8);
    blit(p, b, W * (0.2 + i * 0.3) - b.w / 2, (H - b.h) / 2 - 2);
  });
  return p.toBuffer({ outline: false });
}

/** A stack of five newspapers, one for each day: Monday's at the bottom, Friday's on top. Returns each paper's middle (0-1 from the top). */
export function paintStack(W = 100, H = 72): { buf: PixelBuffer; mids: number[] } {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, ramp('#c8b89a'), 2);
  const mids: number[] = [];
  const paper = ramp('#f2eee0');
  const h = 10;
  for (let k = 0; k < 5; k++) {
    // bottom first
    const y = H - 8 - (k + 1) * h;
    const x = W * 0.2 + (k % 2 ? 3 : -2);
    p.rect(x, y, W * 0.6, h - 1, paper, { sep: true });
    for (let r = 0; r < 3; r++) p.line(x + 4, y + 2 + r * 2.4, x + W * 0.6 - 4 - (r === 2 ? 10 : 0), y + 2 + r * 2.4, ramp('#8a8a8a'), 2);
    mids.push((y + h / 2) / H);
  }
  return { buf: p.toBuffer({ outline: false }), mids };
}

/**
 * Two cliffs far apart, across a wide valley, with the same fossil in the
 * same layer of each (ammonites unless told otherwise). Layers bottom first:
 * sea, swamp, river, Ice Age. Returns each layer's middle (0-1 from the top).
 */
export function paintMatch(id: FossilId = 'ammonite', W = 140, H = 72): { buf: PixelBuffer; mids: Record<LayerId, number> } {
  const p = new Paint(W, H);
  sky(p, W, H);
  const order: LayerId[] = ['sea', 'swamp', 'river', 'ice'];
  const top = H * 0.22;
  const bandH = (H - top) / order.length;
  const k0 = Math.max(0, order.indexOf(FOSSILS[id].layer));
  // the valley floor in the middle
  for (let y = Math.round(H * 0.82); y < H; y++) for (let x = Math.round(W * 0.34); x < W * 0.66; x++) p.dot(x, y, ramp('#9aaa6a'), 2);
  const mids = { today: top / H } as Record<LayerId, number>;
  for (const [x0, x1] of [
    [0, W * 0.34],
    [W * 0.66, W],
  ]) {
    order.forEach((layer, k) => {
      const y1 = H - k * bandH;
      mids[layer] = (y1 - bandH / 2) / H;
      for (let y = Math.round(y1 - bandH); y < Math.round(y1); y++)
        for (let x = Math.round(x0); x < Math.round(x1); x++) p.dot(x, y, LAYER_RAMP[layer], (y + Math.round(Math.sin(x / 7))) % 5 === 0 ? 1 : 2);
    });
    for (let x = Math.round(x0); x < Math.round(x1); x++) p.dot(x, Math.round(top) - 1, DIG.sage, 3);
    const f = paintFossil(id, 0.8);
    blit(p, f, (x0 + x1) / 2 - f.w / 2, H - k0 * bandH - bandH / 2 - f.h / 2);
  }
  return { buf: p.toBuffer({ outline: false }), mids };
}

/** A rock swatch for a layer card: the layer's rock, with its look (shells, coal, ripples, pebbles, roots). */
export function paintLayerSwatch(id: LayerId, W = 36, H = 20): PixelBuffer {
  const p = new Paint(W, H);
  const r = LAYER_RAMP[id];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let lv = (y + Math.round(Math.sin(x / 5) * 1)) % 5 === 0 ? 1 : 2;
      if (hash(x >> 1, y >> 1, 70) < 0.06) lv = 3;
      let rr = r;
      if (id === 'swamp' && y >= H * 0.4 && y < H * 0.55) rr = DIG.coal;
      if (id === 'river' && (y + Math.round(Math.sin(x / 3) * 1.5)) % 6 === 0) lv = 3;
      p.dot(x, y, rr, lv);
    }
  if (id === 'sea')
    for (const [x, y] of [
      [8, 8],
      [24, 13],
    ])
      p.ellipse(x, y, 3, 2.4, DIG.shell, { sep: true });
  if (id === 'ice') for (let k = 0; k < 7; k++) p.ellipse(4 + hash(k, 1, 71) * (W - 8), 4 + hash(k, 2, 71) * (H - 8), 1.6, 1.4, DIG.ash, { level: 3 });
  if (id === 'today') {
    for (let x = 0; x < W; x++) if (hash(x, 0, 72) < 0.7) p.dot(x, 0, DIG.sage, 3);
    for (let k = 0; k < 4; k++) p.line(6 + k * 8, 1, 7 + k * 8, H * 0.6, ramp('#5a4030'), 1);
  }
  return p.toBuffer({ outline: false });
}

/** A station's badge: the quarry (a bone), the cliff (rock layers), the lab, the trackway, the museum. Lit when finished; gray while closed. */
export function paintBadge(kind: 'quarry' | 'cliff' | 'lab' | 'trackway' | 'museum', lit: boolean, open = true): PixelBuffer {
  const p = new Paint(16, 16);
  const ring = ramp(lit ? '#f2c94c' : open ? '#c8b89a' : '#8a8a8a');
  p.ellipse(8, 8, 7.5, 7.5, ring, { sep: true });
  p.ellipse(8, 8, 6, 6, ramp(lit ? '#fff4d0' : '#e8e0d0'), { form: 'flat', level: 2 });
  const gray = !open;
  const R = (r: Ramp) => (gray ? ramp('#9a9a9a') : r);
  if (kind === 'quarry') {
    p.capsule(5, 10, 11, 6, 1.1, R(DIG.bone), {});
    for (const [x, y] of [
      [4.6, 9.2],
      [5.6, 11],
      [10.4, 5],
      [11.6, 6.8],
    ])
      p.ellipse(x, y, 1.4, 1.4, R(DIG.bone), {});
  } else if (kind === 'cliff') {
    const rs = [DIG.topsoil, DIG.riverRock, DIG.swampRock, DIG.seaRock];
    rs.forEach((r, k) => p.rect(4, 4 + k * 2.2, 8, 2.2, R(r), { form: 'flat', level: 2 }));
  } else if (kind === 'lab') {
    p.rect(6, 4, 4, 2, R(DIG.bone), { level: 3 });
    p.rect(5, 6, 6, 5, R(ramp('#7aa0d8')), { sep: true });
  } else if (kind === 'trackway') {
    for (const [x, y] of [
      [6, 10],
      [10, 6],
    ]) {
      p.ellipse(x, y, 1.4, 1.4, R(DIG.bone2), {});
      p.line(x, y, x - 1.6, y - 2.4, R(DIG.bone2), 2);
      p.line(x, y, x, y - 2.8, R(DIG.bone2), 2);
      p.line(x, y, x + 1.6, y - 2.4, R(DIG.bone2), 2);
    }
  } else {
    p.poly(
      [
        [3, 7],
        [8, 3],
        [13, 7],
      ],
      R(ramp('#c26a44')),
      { sep: true },
    );
    p.rect(4, 7, 8, 5, R(ramp('#ead2a0')), { sep: true });
  }
  return p.toBuffer();
}

/** The Fossil Drawer's icon: a wooden drawer with a shell peeking out. */
export function paintDrawerIcon(): PixelBuffer {
  const p = new Paint(18, 16);
  p.rect(1, 4, 16, 11, WILD.wood, { sep: true });
  p.rect(3, 6, 12, 7, ramp('#5a3a24'), { level: 1 });
  p.rect(7, 9, 4, 1.6, WILD.metal, { level: 3 });
  p.ellipse(9, 4, 3, 2.4, DIG.shell, { sep: true });
  return p.toBuffer();
}

// ------------------------------------------------------------------ half 2: the Prep Lab and the Trackway

/** A living cousin (or look-alike) of a fossil, facing right: the elephant, the nautilus, the horseshoe crab, or a fern today. About 40 x 32 pixels at s = 1. */
export function paintCousin(id: 'mammoth-tusk' | 'ammonite' | 'trilobite' | 'fern', s = 1): PixelBuffer {
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(40 * s), Math.round(32 * s));
  if (id === 'mammoth-tusk') {
    // an elephant: big body, big ear, trunk and tusk
    const g = ramp('#9a9aa4');
    for (const x of [10, 16, 25, 31]) p.rect(S(x - 2), S(20), S(4.4), S(10), g, { sep: true });
    p.ellipse(S(20), S(17), S(13), S(8), g, { sep: true });
    p.ellipse(S(32), S(12), S(6), S(6), g, { sep: true });
    p.ellipse(S(29), S(13), S(4), S(5.4), ramp('#86868f'), { sep: true });
    p.capsule(S(37), S(14), S(38), S(26), S(1.6), g, { sep: true });
    p.capsule(S(35), S(18), S(39), S(21), S(0.9), ramp('#f2eee0'), {});
    p.pix(S(34), S(10), '#1a1a1a');
  } else if (id === 'ammonite') {
    // a nautilus: a striped coiled shell with tentacles in front
    const sh = ramp('#f2e6d0');
    p.ellipse(S(18), S(16), S(12), S(12), sh, { sep: true });
    for (let k = 0; k < 7; k++) p.line(S(18), S(16), S(18 + Math.cos(-1.2 - k * 0.5) * 12), S(16 + Math.sin(-1.2 - k * 0.5) * 12), ramp('#c26a44'), 2);
    p.ellipse(S(18), S(16), S(4), S(4), ramp('#e0c8a0'), { sep: true });
    for (let k = 0; k < 5; k++) p.capsule(S(29), S(18 + k), S(37), S(16 + k * 2.4), S(0.7), ramp('#e8b48a'), {});
    p.ellipse(S(29), S(16), S(2.6), S(2.6), ramp('#d89a70'), { sep: true });
  } else if (id === 'trilobite') {
    // a horseshoe crab from above: a curved shell, a body and a long spike tail
    const g = ramp('#8a6a4a');
    p.capsule(S(4), S(16), S(14), S(16), S(0.9), g, {});
    p.ellipse(S(26), S(16), S(11), S(11), g, { sep: true });
    p.ellipse(S(18), S(16), S(5), S(6), ramp('#7a5a3c'), { sep: true });
    for (const y of [11, 21]) p.pix(S(30), S(y), '#1a1a1a');
  } else {
    // a fern growing today: one frond curling at the tip
    const g = ramp('#4a8a3a');
    p.line(S(6), S(30), S(32), S(6), g, 2);
    for (let k = 1; k < 10; k++) {
      const x = S(6 + k * 2.6);
      const y = S(30 - k * 2.4);
      const l = S(7 - k * 0.5);
      p.capsule(x, y, x - l * 0.7, y - l, S(0.8), g, {});
      p.capsule(x, y, x + l, y + l * 0.3, S(0.8), g, {});
    }
  }
  return p.toBuffer();
}

/** A fossil (left) next to its living cousin (right), on a plain table. */
export function paintRelative(id: 'mammoth-tusk' | 'ammonite' | 'trilobite' | 'fern', W = 120, H = 64): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, ramp('#e8dcc0'), y > H * 0.82 ? 1 : 2);
  const f = paintFossil(id, 2);
  blit(p, f, W * 0.25 - f.w / 2, H * 0.48 - f.h / 2);
  const c = paintCousin(id, 1.2);
  blit(p, c, W * 0.72 - c.w / 2, H * 0.48 - c.h / 2);
  for (let y = H * 0.2; y < H * 0.78; y += 2) p.pix(W / 2, y, '#b8a888');
  return p.toBuffer({ outline: false });
}

/** A meat eater's knife tooth (sharp), or a plant eater's jaw with a beak and rows of slicing teeth (flat). */
export function paintTeeth(kind: 'sharp' | 'flat', W = 100, H = 60): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, ramp('#e8dcc0'), 2);
  if (kind === 'sharp') {
    const t = paintFossil('trex-tooth', 2.8);
    blit(p, t, (W - t.w) / 2, (H - t.h) / 2);
    return p.toBuffer({ outline: false });
  }
  const jaw = DIG.bone;
  p.poly(
    [
      [W * 0.12, H * 0.35],
      [W * 0.78, H * 0.3],
      [W * 0.92, H * 0.5],
      [W * 0.78, H * 0.72],
      [W * 0.12, H * 0.68],
    ],
    jaw,
    { sep: true },
  );
  // the beak at the front
  p.poly(
    [
      [W * 0.78, H * 0.3],
      [W * 0.97, H * 0.46],
      [W * 0.86, H * 0.62],
    ],
    ramp('#6a5a48'),
    { sep: true },
  );
  // rows of small teeth packed together
  for (let k = 0; k < 12; k++) p.rect(W * 0.18 + k * W * 0.045, H * 0.42, W * 0.035, H * 0.16, ramp('#f2eee0'), { sep: true });
  return p.toBuffer({ outline: false });
}

/** A three-toed print (left) and a big round print (right), from above. */
export function paintPrints(W = 120, H = 60): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, DIG.ash, hash(x >> 1, y >> 1, 80) < 0.05 ? 3 : 2);
  const dk = ramp('#6a6058');
  const cx = W * 0.22;
  const cy = H * 0.55;
  p.ellipse(cx, cy, 5, 5, dk, { form: 'flat', level: 1 });
  for (const a of [-0.6, 0, 0.6]) p.capsule(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, cx + Math.cos(a) * 20, cy + Math.sin(a) * 20, 2.2, dk, { form: 'flat', level: 1 });
  const rx = W * 0.75;
  p.ellipse(rx, H * 0.55, 16, 14, dk, { form: 'flat', level: 1 });
  for (let t = 0; t < 4; t++) p.ellipse(rx - 12 + t * 8, H * 0.55 - 15, 3, 2.6, dk, { form: 'flat', level: 1 });
  return p.toBuffer({ outline: false });
}

/** Pebble's prints in the creek mud: walking (close together, top) and running (far apart, bottom). */
export function paintStride(W = 140, H = 60): PixelBuffer {
  const p = new Paint(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, DIG.mudflat, hash(x, y, 81) < 0.05 ? 1 : 2);
  const paw = (x: number, y: number) => {
    p.ellipse(x, y, 2.4, 2, ramp('#5a4434'), { form: 'flat', level: 1 });
    for (let t = -1; t <= 1; t++) p.ellipse(x + t * 2.4, y - 3.6, 0.9, 0.9, ramp('#5a4434'), { form: 'flat', level: 1 });
  };
  for (let k = 0; k < 9; k++) paw(10 + k * 13, H * 0.3 + (k % 2) * 5);
  for (let k = 0; k < 4; k++) paw(10 + k * 38, H * 0.75 + (k % 2) * 5);
  return p.toBuffer({ outline: false });
}

/** A two-legged dinosaur side on, with its footprint below its foot, a dashed line at its hip, and four print-lengths stacked up to it. Returns where the hip line is (0-1 from the top). */
export function paintHip(W = 120, H = 80): { buf: PixelBuffer; hip: number } {
  const p = new Paint(W, H);
  sky(p, W, H);
  const ground = H * 0.86;
  for (let y = Math.round(ground); y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, DIG.tan, 2);
  const g = ramp('#6a8a4a');
  const hip = H * 0.42;
  // legs, body, tail, neck and head
  p.capsule(W * 0.5, hip, W * 0.48, ground - 2, 3, g, { sep: true });
  p.capsule(W * 0.56, hip, W * 0.6, ground - 2, 3, g, { sep: true });
  p.ellipse(W * 0.55, hip - 4, 14, 9, g, { sep: true });
  p.capsule(W * 0.42, hip - 2, W * 0.12, hip + 6, 3, g, {});
  p.capsule(W * 0.64, hip - 8, W * 0.74, H * 0.18, 3, g, {});
  p.ellipse(W * 0.78, H * 0.16, 7, 4.4, g, { sep: true });
  p.pix(W * 0.8, H * 0.15, '#1a1a1a');
  // the dashed hip line
  for (let x = W * 0.2; x < W * 0.94; x += 3) p.pix(x, hip, '#e0503a');
  // four print-lengths stacked from the ground to the hip
  const step = (ground - hip) / 4;
  for (let k = 0; k < 4; k++) p.rect(W * 0.86, ground - (k + 1) * step + 1, 6, step - 2, ramp(k % 2 ? '#f2c94c' : '#e8a83a'), { sep: true });
  return { buf: p.toBuffer({ outline: false }), hip: hip / H };
}

/** The fossil's own squares for the prep bench: a fossil drawn to fit a cols x rows grid of cell px pixels, and which squares it covers. */
export function prepFossil(id: FossilId, cols: number, rows: number, cell: number): { mask: boolean[]; fossil: PixelBuffer; ox: number; oy: number } {
  const size = Math.min(cols, rows) * cell * 0.92;
  const fossil = paintFossil(id, size / 18);
  const ox = Math.round((cols * cell - fossil.w) / 2);
  const oy = Math.round((rows * cell - fossil.h) / 2);
  const mask: boolean[] = [];
  for (let gy = 0; gy < rows; gy++)
    for (let gx = 0; gx < cols; gx++) {
      let n = 0;
      for (let y = gy * cell; y < (gy + 1) * cell; y++) for (let x = gx * cell; x < (gx + 1) * cell; x++) if (fossil.get(x - ox, y - oy)) n++;
      mask.push(n > cell * cell * 0.18);
    }
  return { mask, fossil, ox, oy };
}

/** The prep bench: the fossil in its block of rock, square by square (rock, dust, the clean fossil, cracks and glue). */
export function paintPrepBench(
  id: FossilId,
  cells: ReadonlyArray<{ kind: 'rock' | 'near' | 'bone'; covered: boolean; cracked: boolean; glued: boolean }>,
  cols: number,
  rows: number,
  cell: number,
): PixelBuffer {
  const W = cols * cell;
  const H = rows * cell;
  const { fossil, ox, oy } = prepFossil(id, cols, rows, cell);
  const p = new Paint(W, H);
  // the cleaned tray under the fossil
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, ramp('#d8ccb4'), (x + y) % 11 === 0 ? 3 : 2);
  blit(p, fossil, ox, oy);
  cells.forEach((c, i) => {
    const x0 = (i % cols) * cell;
    const y0 = Math.floor(i / cols) * cell;
    if (c.covered) {
      const r = c.kind === 'bone' ? ramp('#c8b89a') : DIG.riverRock;
      for (let y = y0; y < y0 + cell; y++)
        for (let x = x0; x < x0 + cell; x++) {
          if (c.kind === 'bone' && (x + y) % 2) continue;
          p.dot(x, y, r, hash(x >> 1, y >> 1, 82 + i) < 0.12 ? 1 : c.kind === 'near' && (x + y) % 5 === 0 ? 3 : 2);
        }
    }
    if (c.cracked || c.glued) {
      const col = c.glued ? '#f2e6a0' : '#2a1e18';
      for (let k = 0; k < cell * 0.7; k++) p.pix(x0 + cell * 0.15 + k, y0 + cell * 0.3 + Math.round(Math.sin(k * 0.9) * 2) + k * 0.3, col);
    }
  });
  return p.toBuffer({ outline: false });
}

/** The prep bench's tools, upright: the tiny air chisel (a pen-shaped tool with a hose), the brush and the glue bottle. */
export function paintPrepTool(t: 'chisel' | 'brush' | 'glue', s = 1): PixelBuffer {
  if (t === 'brush') return paintTool('brush', s);
  const S = (v: number) => v * s;
  const p = new Paint(Math.round(16 * s), Math.round(24 * s));
  if (t === 'chisel') {
    p.capsule(S(8), S(4), S(8), S(18), S(2), ramp('#5a8ad8'), { sep: true });
    p.poly(
      [
        [S(6.4), S(18)],
        [S(9.6), S(18)],
        [S(8), S(23)],
      ],
      WILD.metal,
      { sep: true },
    );
    p.line(S(8), S(4), S(13), S(1), ramp('#3a3a3a'), 2);
  } else {
    p.rect(S(4), S(9), S(8), S(14), ramp('#f2eee0'), { sep: true });
    p.rect(S(5), S(13), S(6), S(5), ramp('#e0503a'), { level: 3 });
    p.poly(
      [
        [S(5), S(9)],
        [S(11), S(9)],
        [S(8.6), S(4)],
        [S(7.4), S(4)],
      ],
      ramp('#f2c94c'),
      { sep: true },
    );
    p.rect(S(7.4), S(1), S(1.2), S(3), ramp('#f2c94c'), {});
  }
  return p.toBuffer();
}

// ------------------------------------------------------------------ Museum Night

/** One scene of Hana's mural of the valley's story: the old sea, the swamp forest, the dinosaur river plain, the Ice Age, and today's badlands. */
export function paintMuralScene(layer: LayerId, W = 72, H = 48): PixelBuffer {
  const p = new Paint(W, H);
  if (layer === 'sea') {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, ramp('#3a8ab8'), y < H * 0.15 ? 3 : y > H * 0.8 ? 1 : 2);
    for (let y = Math.round(H * 0.82); y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, ramp('#c8b88a'), 2);
    blit(p, paintCousin('trilobite', 0.6), W * 0.12, H * 0.62);
    blit(p, paintCousin('ammonite', 0.7), W * 0.5, H * 0.3);
  } else if (layer === 'swamp') {
    sky(p, W, H, '#b8d8a0');
    for (let y = Math.round(H * 0.75); y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, ramp('#4a6a48'), (x + y) % 6 ? 2 : 1);
    for (const x of [0, 0.3, 0.62]) blit(p, paintCousin('fern', 0.8), W * x, H * 0.2);
  } else if (layer === 'river') {
    sky(p, W, H);
    for (let y = Math.round(H * 0.7); y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, y > H * 0.88 ? DIG.creek : ramp('#7aa05a'), 2);
    paintTrike(p, W * 0.18, H * 0.38, 1);
  } else if (layer === 'ice') {
    sky(p, W, H, '#d8e8f2');
    for (let y = Math.round(H * 0.72); y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, ramp('#e8eef2'), (x * 3 + y) % 7 ? 3 : 2);
    // a woolly mammoth: the elephant shape in shaggy brown
    const m = paintCousin('mammoth-tusk', 1.1);
    for (let y = 0; y < m.h; y++)
      for (let x = 0; x < m.w; x++) {
        const c = m.get(x, y);
        if (c) p.pix(W * 0.15 + x, H * 0.18 + y, c === '#f2eee0' || c.startsWith('#f') ? c : (x + y) % 3 ? '#7a4a2a' : '#5a3418');
      }
  } else {
    sky(p, W, H);
    for (let x = 0; x < W; x++) {
      const top = H * 0.45 + Math.sin(x / 7) * 4;
      for (let y = Math.round(top); y < H; y++) p.dot(x, y, [DIG.cream, DIG.rust, DIG.tan][Math.floor((y - top) / 5) % 3], 2);
    }
    p.poly(
      [
        [W * 0.6, H * 0.62],
        [W * 0.72, H * 0.4],
        [W * 0.84, H * 0.62],
      ],
      ramp('#d8a86a'),
      { sep: true },
    );
  }
  return p.toBuffer();
}
