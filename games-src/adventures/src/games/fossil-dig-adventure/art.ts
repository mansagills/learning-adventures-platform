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
