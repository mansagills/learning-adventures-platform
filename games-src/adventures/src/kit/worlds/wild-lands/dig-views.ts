import { PixelBuffer } from '../../art/pixel';
import { Paint, hash, mixHex, ramp, type Ramp } from '../shade';
import { WILD } from './art';
import { DIG, glowsUnderUV, paintFossil, paintPebble, paintSkeleton, paintUVLamp, type FossilId } from './dig-art';
import { CLIFF_LAYERS } from './dig';

/**
 * The close-up views of Fossil Dig Adventure's stations, painted as flat
 * pictures (like Ocean Depth Diver's dive): the quarry square from above,
 * the cliff's rock layers up close, the footprint slab with a tape measure,
 * and the Glow Room with its ultraviolet lamp. Labels are added by the page
 * as text, so they can be read aloud and translated.
 */

// ------------------------------------------------------------------ the quarry from above

/** One square of the quarry grid: how much dirt is left (3 = untouched, 0 = dug down to the find), and what is under it. */
export interface QuarryCell {
  left: 0 | 1 | 2 | 3;
  find: FossilId | null;
  /** A bone dug with the shovel or pick next to it: still found, but chipped. */
  chipped?: boolean;
  /** Pebble has sniffed here (paw marks). */
  sniffed?: boolean;
}

/** A preview dig in progress: some squares untouched, some half dug, a few finds showing. */
export function sampleQuarry(cols = 8, rows = 6): QuarryCell[] {
  const finds: Record<string, FossilId> = { '2,1': 'trex-tooth', '5,2': 'trike-horn', '1,4': 'eggshell', '6,4': 'raptor-claw' };
  const out: QuarryCell[] = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const key = `${x},${y}`;
      const find = finds[key] ?? null;
      const d = Math.abs(x - 3) + Math.abs(y - 2);
      const left = (find ? (key === '2,1' || key === '5,2' ? 0 : key === '6,4' ? 1 : 2) : d < 2 ? 0 : d < 4 ? 1 : d < 5 ? 2 : 3) as QuarryCell['left'];
      out.push({ left, find, chipped: key === '5,2', sniffed: key === '6,4' || key === '1,4' });
    }
  return out;
}

const LAYER_COL: Ramp[] = [DIG.clay, DIG.riverRock, DIG.tan, DIG.dust];

/** Where the grid squares sit in a quarry view W x H pixels (so a page can lay its buttons over them). */
export function quarryGrid(W: number, H: number, cols = 8, rows = 6): { cw: number; ch: number; ox: number; oy: number } {
  const cw = Math.floor((W - 16) / cols);
  const ch = Math.floor((H - 16) / rows);
  return { cw, ch, ox: Math.floor((W - cw * cols) / 2), oy: Math.floor((H - ch * rows) / 2) };
}

/** The quarry square seen from above, `cols` x `rows` grid squares, with the tool chosen highlighted by the page. */
export function paintQuarryView(W: number, H: number, cells: QuarryCell[], cols = 8, rows = 6): PixelBuffer {
  const p = new Paint(W, H);
  // the quarry's rim of dusty ground
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, DIG.dust, hash(x >> 1, y >> 1, 3) < 0.05 ? 1 : (x + y) % 7 === 0 ? 3 : 2);
  const { cw, ch, ox, oy } = quarryGrid(W, H, cols, rows);
  cells.forEach((c, i) => {
    const gx = i % cols;
    const gy = Math.floor(i / cols);
    const x0 = ox + gx * cw;
    const y0 = oy + gy * ch;
    const r = LAYER_COL[c.left];
    for (let y = y0; y < y0 + ch; y++)
      for (let x = x0; x < x0 + cw; x++) {
        let lv = 2;
        if (hash(x, y, 11 + c.left) < 0.06) lv = 1;
        if (hash(x >> 1, y >> 1, 12) < 0.03) lv = 3;
        // dug squares sit lower: a shadow along their top and left edges
        if (c.left < 3 && (y < y0 + 3 || x < x0 + 2)) lv = 1;
        p.dot(x, y, r, lv);
      }
    if (c.find && c.left <= 1) {
      const f = paintFossil(c.find, Math.min(cw, ch) / 22);
      const alpha = c.left === 0 ? 1 : 0.5;
      for (let y = 0; y < f.h; y++)
        for (let x = 0; x < f.w; x++) {
          const col = f.get(x, y);
          if (!col) continue;
          const px = x0 + Math.round((cw - f.w) / 2) + x;
          const py = y0 + Math.round((ch - f.h) / 2) + y;
          p.pix(px, py, alpha === 1 ? col : (px + py) % 2 ? col : (p.color(px, py) ?? col));
        }
      if (c.chipped) for (let k = 0; k < 5; k++) p.pix(x0 + cw * 0.55 + k * 2, y0 + ch * 0.4 + (k % 2) * 2, '#5a3a24');
    }
    if (c.sniffed) {
      // little paw marks where Pebble sniffed
      const pr = ramp('#7a5236');
      for (let k = 0; k < 3; k++) {
        const px = x0 + cw * 0.2 + k * cw * 0.25;
        const py = y0 + ch * 0.82 - (k % 2) * 4;
        p.ellipse(px, py, 2, 1.6, pr, { form: 'flat', level: 1 });
        for (let t = -1; t <= 1; t++) p.pix(px + t * 2, py - 3, '#7a5236');
      }
    }
  });
  // the grid strings and the pegs at the corners
  for (let gx = 0; gx <= cols; gx++) for (let y = oy; y <= oy + rows * ch; y++) if (y % 2 === 0) p.pix(ox + gx * cw, y, DIG.string);
  for (let gy = 0; gy <= rows; gy++) for (let x = ox; x <= ox + cols * cw; x++) if (x % 2 === 0) p.pix(x, oy + gy * ch, DIG.string);
  for (const [x, y] of [
    [ox, oy],
    [ox + cols * cw, oy],
    [ox, oy + rows * ch],
    [ox + cols * cw, oy + rows * ch],
  ])
    p.rect(x - 2, y - 2, 5, 5, WILD.wood, { sep: true });
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the cliff's rock layers up close

/** Which fossil sits in which layer of the cliff (bottom, oldest, first). */
export const LAYER_FOSSILS: Record<string, FossilId[]> = {
  sea: ['trilobite', 'ammonite'],
  swamp: ['fern'],
  river: ['trike-horn', 'raptor-claw'],
  ice: ['mammoth-tusk'],
  today: [],
};

/**
 * The cliff up close: the five layers (bottom oldest), each with its fossils
 * set into the rock, a thin coal seam in the swamp layer, ripple marks in the
 * river sandstone, a crack (fault) cutting down through them on the right,
 * and a time arrow down the left edge. Returns where each layer's middle is
 * (0-1 from the top), for the page's labels.
 */
export function paintCliffView(W: number, H: number, opts: { fossils?: boolean; mark?: string | null } = {}): { buf: PixelBuffer; mids: Record<string, number> } {
  const showFossils = opts.fossils ?? true;
  const bounds: Record<string, [number, number]> = {};
  const p = new Paint(W, H);
  const sky = ramp('#a8d4ee');
  const top = Math.round(H * 0.08);
  for (let y = 0; y < top; y++) for (let x = 0; x < W; x++) p.dot(x, y, sky, 3);
  const mids: Record<string, number> = {};
  let y0 = H;
  const ripple = (x: number) => Math.sin(x / 5) * 1.5;
  for (const layer of CLIFF_LAYERS) {
    const h = Math.round((H - top) * layer.h);
    const yTop = y0 - h;
    mids[layer.id] = (yTop + h / 2) / H;
    bounds[layer.id] = [Math.max(top, yTop), y0];
    for (let y = Math.max(top, yTop); y < y0; y++)
      for (let x = 0; x < W; x++) {
        let lv = 2;
        if ((y + Math.round(Math.sin(x / 13) * 1.5)) % 6 === 0) lv = 1;
        if (hash(x >> 1, y >> 1, 21) < 0.04) lv = 3;
        let r = layer.r;
        if (layer.id === 'swamp' && Math.abs(y - (yTop + h * 0.4)) < 3) r = DIG.coal;
        if (layer.id === 'river' && (y - yTop + Math.round(ripple(x))) % 7 === 0) lv = 3;
        if (y === yTop || y === yTop + 1) lv = 1;
        p.dot(x, y, r, lv);
      }
    // the fossils in this layer
    if (showFossils)
      LAYER_FOSSILS[layer.id].forEach((id, k) => {
        const f = paintFossil(id, Math.min(h / 20, 2.2));
        const fx = Math.round(W * (0.28 + k * 0.3) - f.w / 2);
        const fy = Math.round(yTop + (h - f.h) / 2);
        for (let y = 0; y < f.h; y++)
          for (let x = 0; x < f.w; x++) {
            const c = f.get(x, y);
            if (c) p.pix(fx + x, fy + y, c);
          }
      });
    y0 = yTop;
  }
  // the grassy top with sage
  for (let y = top - 3; y < top + 2; y++) for (let x = 0; x < W; x++) if (hash(x, y, 31) < 0.7) p.dot(x, y, DIG.sage, 3);
  // the fault: a crack running down through every layer (it came after them, so it is younger)
  for (let y = top; y < H; y++) {
    const fx = Math.round(W * 0.84 - (y / H) * W * 0.08);
    p.pix(fx, y, '#2a1e18');
    p.pix(fx + 1, y, '#5a4a3a');
  }
  // a marked layer (or the crack) gets a bright dashed outline
  const mark = opts.mark ?? null;
  if (mark === 'fault')
    for (let y = top; y < H; y++) {
      const fx = Math.round(W * 0.84 - (y / H) * W * 0.08);
      if ((y >> 1) % 2 === 0) {
        p.pix(fx - 2, y, '#ffe14a');
        p.pix(fx + 3, y, '#ffe14a');
      }
    }
  else if (mark && bounds[mark]) {
    const [a, b] = bounds[mark];
    for (let x = 1; x < W - 1; x++)
      if ((x >> 1) % 2 === 0) {
        p.pix(x, a + 1, '#ffe14a');
        p.pix(x, b - 2, '#ffe14a');
      }
    for (let y = a + 1; y < b - 1; y++)
      if ((y >> 1) % 2 === 0) {
        p.pix(1, y, '#ffe14a');
        p.pix(W - 2, y, '#ffe14a');
      }
  }
  // the time arrow down the left edge: "older" at the bottom
  const ar = ramp('#f2f4ec');
  for (let y = top + 6; y < H - 10; y++) p.dot(6, y, ar, 3);
  p.poly(
    [
      [1, H - 12],
      [11, H - 12],
      [6, H - 4],
    ],
    ar,
    { form: 'flat', level: 3 },
  );
  return { buf: p.toBuffer({ outline: false }), mids };
}

// ------------------------------------------------------------------ the footprint slab with a tape measure

/**
 * The trackway from above: a three-toed dinosaur walking, then running (its
 * steps get longer), with a plant-eater's round prints crossing later (they
 * are pressed on top), Pebble's walking and running prints in the creek mud
 * at the bottom for comparing, and a tape measure laid from print to print.
 */
export function paintTrackwayView(W: number, H: number): PixelBuffer {
  const p = new Paint(W, H);
  const mudTop = Math.round(H * 0.8);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (y >= mudTop) {
        p.dot(x, y, DIG.mudflat, hash(x, y, 4) < 0.05 ? 1 : 2);
        continue;
      }
      let lv = 2;
      if (Math.abs(Math.sin(x / 31 + y / 17) * 40 - (x % 40)) < 0.6) lv = 1;
      if (hash(x >> 1, y >> 1, 5) < 0.03) lv = 3;
      p.dot(x, y, DIG.ash, lv);
    }
  const dk = ramp('#6a6058');
  // a three-toed print: the heel pad, and three toes pointing the way the animal walked (to the right)
  const three = (x: number, y: number, s: number) => {
    p.ellipse(x, y, 2 * s, 2 * s, dk, { form: 'flat', level: 1 });
    for (const a of [-0.6, 0, 0.6]) p.capsule(x + Math.cos(a) * 2.4 * s, y + Math.sin(a) * 2.4 * s, x + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s, 0.9 * s, dk, { form: 'flat', level: 1 });
  };
  // the meat-eater's trackway along the slab: steps get longer as it starts to run
  let x = W * 0.06;
  const steps: number[] = [];
  for (let k = 0; k < 9; k++) {
    const y = H * 0.38 + (k % 2 ? -H * 0.06 : H * 0.06);
    three(x, y, 1.8);
    steps.push(x);
    x += k < 4 ? W * 0.07 : W * 0.13;
    if (x > W * 0.94) break;
  }
  // a plant-eater's big round prints crossing later, pressed over one of the three-toed prints
  for (let k = 0; k < 4; k++) {
    const px = W * 0.5 + k * W * 0.04;
    const py = H * 0.1 + k * H * 0.17;
    p.ellipse(px, py, 7, 6, ramp('#5a5048'), { form: 'flat', level: 1 });
    for (let t = 0; t < 4; t++) p.ellipse(px - 5 + t * 3.4, py - 6, 1.4, 1.2, ramp('#5a5048'), { form: 'flat', level: 1 });
  }
  // the tape measure from one print to the next
  if (steps.length > 6) {
    const a = steps[5];
    const b = steps[6];
    const ty = H * 0.38 - 2;
    p.rect(a, ty, b - a, 4, ramp('#f2c94c'), { level: 3, sep: true });
    for (let t = a; t < b; t += 4) p.pix(t, ty + 1, '#5a3a24');
    p.rect(a - 4, ty - 2, 6, 8, ramp('#e0503a'), { sep: true });
  }
  // Pebble's prints in the mud: close together walking (left), far apart running (right)
  const paw = (x: number, y: number) => {
    p.ellipse(x, y, 1.8, 1.6, ramp('#5a4434'), { form: 'flat', level: 1 });
    for (let t = -1; t <= 1; t++) p.pix(x + t * 2, y - 3, '#5a4434');
  };
  for (let k = 0; k < 6; k++) paw(W * 0.06 + k * W * 0.035, mudTop + H * 0.06 + (k % 2) * 5);
  for (let k = 0; k < 4; k++) paw(W * 0.55 + k * W * 0.1, mudTop + H * 0.06 + (k % 2) * 5);
  const dog = paintPebble(16, 3);
  for (let y = 0; y < dog.h; y++)
    for (let xx = 0; xx < dog.w; xx++) {
      const c = dog.get(xx, y);
      if (c) p.pix(Math.round(W * 0.9) + xx - dog.w, mudTop - dog.h + 12 + y, c);
    }
  return p.toBuffer({ outline: false });
}

// ------------------------------------------------------------------ the Glow Room

/**
 * The Glow Room in the field museum: shelves of fossils and the Triceratops
 * on its stand. With the ordinary light on it is a plain museum room; with
 * the ultraviolet lamp on, the room goes dark violet and some fossils glow
 * (minerals that took the place of bone and shell give off visible light
 * under ultraviolet light).
 */
export function paintGlowRoom(W: number, H: number, uv: boolean): PixelBuffer {
  const p = new Paint(W, H);
  const wall = uv ? ramp('#1e1638') : ramp('#e6d2a8');
  const floor = uv ? ramp('#140e28') : ramp('#a87a4a');
  const floorY = Math.round(H * 0.74);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.dot(x, y, y < floorY ? wall : floor, y < floorY ? ((x >> 3) % 2 ? 2 : 3) : (x + y) % 9 === 0 ? 1 : 2);
  // two shelves of fossils on the left and right
  const shelf = uv ? ramp('#2a2048') : WILD.wood;
  const rows: Array<[number, number, FossilId[]]> = [
    [W * 0.04, H * 0.3, ['trilobite', 'ammonite', 'fern']],
    [W * 0.04, H * 0.56, ['amber', 'petrified-wood', 'coprolite']],
    [W * 0.7, H * 0.3, ['shark-tooth', 'fish', 'eggshell']],
    [W * 0.7, H * 0.56, ['trex-tooth', 'mammoth-tusk', 'footprint']],
  ];
  for (const [sx, sy, ids] of rows) {
    p.rect(sx, sy, W * 0.26, 3, shelf, { sep: true });
    ids.forEach((id, k) => {
      const lit = uv && glowsUnderUV(id);
      const f = paintFossil(id, 1, uv);
      const fx = Math.round(sx + 4 + (k * (W * 0.26 - 8)) / 3);
      const fy = Math.round(sy - f.h);
      for (let y = 0; y < f.h; y++)
        for (let x = 0; x < f.w; x++) {
          const c = f.get(x, y);
          if (c) p.pix(fx + x, fy + y, c);
        }
      if (lit)
        for (let y = fy - 3; y < fy + f.h + 3; y++)
          for (let x = fx - 3; x < fx + f.w + 3; x++) {
            const c = p.color(x, y);
            if (c && !f.get(x - fx, y - fy) && (x + y) % 2 === 0) p.pix(x, y, mixHex(c, '#7a3cff', 0.35));
          }
    });
  }
  // the Triceratops in the middle
  const sk = paintSkeleton(Math.min(2, W / 140), undefined, uv);
  const kx = Math.round((W - sk.w) / 2);
  const ky = floorY - sk.h + 6;
  for (let y = 0; y < sk.h; y++)
    for (let x = 0; x < sk.w; x++) {
      const c = sk.get(x, y);
      if (c) p.pix(kx + x, ky + y, c);
    }
  // the lamp: overhead lights, or the ultraviolet lamp on a stand
  if (uv) {
    const lamp = paintUVLamp(24, true);
    const lx = Math.round(W * 0.5 - lamp.w / 2);
    for (let y = 0; y < lamp.h; y++)
      for (let x = 0; x < lamp.w; x++) {
        const c = lamp.get(x, y);
        if (c) p.pix(lx + x, 6 + y, c);
      }
    for (let y = 6 + lamp.h; y < floorY; y++)
      for (let x = 0; x < W; x++) {
        const spread = (y - 6) * 0.9 + 6;
        if (Math.abs(x - W / 2) < spread && (x + y) % 3 === 0) {
          const c = p.color(x, y);
          if (c) p.pix(x, y, mixHex(c, '#7a3cff', 0.18));
        }
      }
  } else for (const lx of [W * 0.3, W * 0.7]) p.ellipse(lx, 4, 10, 3, ramp('#fff6d0'), { form: 'flat', level: 4 });
  return p.toBuffer({ outline: false });
}
