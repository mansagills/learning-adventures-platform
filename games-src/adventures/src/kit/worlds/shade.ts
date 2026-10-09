import { PixelBuffer } from '../art/pixel';

/**
 * The 16-bit shading painter (look development for the new worlds).
 *
 * Today's kit paints each color in 2 or 3 shades with one dark outline. The
 * new worlds use 5 shades per material: cool, slightly blue shadows, warm
 * highlights, and "colored outlines" (each part is outlined in a darker shade
 * of its own color, not in one flat brown).
 *
 * Shapes are given in pixel coordinates (decimals allowed) and are shaded
 * from a light in the top left, as if each shape were a ball (sphere), a
 * tube (cylV / cylH) or a flat board. Because shapes are drawn from numbers,
 * the same design can be painted at 16, 24 or 32 pixels per tile.
 */

// ------------------------------------------------------------------ colors

export type Ramp = readonly string[]; // 5 shades, darkest first; [2] is the base color

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return '#' + ((1 << 24) | (c(r) << 16) | (c(g) << 8) | c(b)).toString(16).slice(1);
}

export function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((n) => n / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h, s, l];
}

export function fromHsl(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/** Turn hue `h` toward `target` by up to `deg` degrees (the short way round). */
function hueToward(h: number, target: number, deg: number): number {
  let d = ((target - h + 540) % 360) - 180;
  if (Math.abs(d) < deg) return target;
  return h + Math.sign(d) * deg;
}

/**
 * Five shades from one base color. Shadows get darker, a little more
 * saturated and turn toward blue-violet; highlights get lighter and turn
 * toward warm yellow. That "hue shifting" is what makes 16-bit art glow
 * instead of looking grey.
 */
export function ramp(base: string, opts: { spread?: number; warm?: number; cool?: number; hiHue?: number } = {}): Ramp {
  const [h, s, l] = toHsl(base);
  const spread = opts.spread ?? 1;
  const warm = opts.warm ?? 1;
  const cool = opts.cool ?? 1;
  const out: string[] = [];
  for (let i = -2; i <= 2; i++) {
    if (i === 0) {
      out.push(base);
      continue;
    }
    if (i < 0) {
      const k = -i;
      const hh = s < 0.06 ? h : hueToward(h, 245, 9 * k * cool);
      out.push(fromHsl(hh, Math.min(1, s + 0.05 * k), l - (0.105 * k + 0.01 * k * k) * spread));
    } else {
      const hh = s < 0.06 && opts.hiHue === undefined ? h : hueToward(h, opts.hiHue ?? 52, 7 * i * warm);
      // near-white colors get smaller steps, so the two highlights never both turn pure white
      const up = Math.min((0.085 * i - 0.005 * i * i) * spread, ((0.985 - l) * i) / 2);
      out.push(fromHsl(hh, s - 0.02 * i, l + up));
    }
  }
  return out;
}

/** The colored outline for a ramp: its darkest shade, darker again. */
export function selout(r: Ramp): string {
  const [h, s, l] = toHsl(r[0]);
  return fromHsl(h, Math.min(1, s + 0.05), l * 0.55);
}

export function mixHex(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  return rgbToHex(pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t);
}

// ------------------------------------------------------------------ painter

export type Form = 'sphere' | 'cylV' | 'cylH' | 'flat';

export interface DrawOpts {
  form?: Form;
  /** Added to the light amount: positive is brighter, negative darker. */
  bias?: number;
  /** A flat shape uses this shade (0-4). */
  level?: number;
  /** Darken the edge of whatever this shape covers, so overlapping parts read apart (2 = a stronger edge). */
  sep?: boolean | 2;
  /** Only paint where this test passes (for clipping hair to the head, and so on). */
  clip?: (x: number, y: number) => boolean;
  /** Only paint over pixels that are already painted. */
  onlyOver?: boolean;
  /** Box (x, y, w, h) whose middle and size decide the shading, if not the shape itself. */
  box?: [number, number, number, number];
  /** Soften the border between two shades with a checkerboard (for big surfaces). */
  dither?: boolean;
  /** Keep the darkest and brightest shades for small details (limits to 1-3). */
  soft?: boolean;
}

const LIGHT = (() => {
  const v = [-0.55, -0.68, 0.5];
  const n = Math.hypot(v[0], v[1], v[2]);
  return v.map((x) => x / n) as [number, number, number];
})();

const EDGES = [-0.2, 0.2, 0.56, 0.84];

export class Paint {
  readonly ramp: (Ramp | null)[];
  readonly lv: Uint8Array;
  readonly fixed: (string | null)[];
  readonly part: Int32Array;
  private nextPart = 1;

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.ramp = new Array(w * h).fill(null);
    this.lv = new Uint8Array(w * h);
    this.fixed = new Array(w * h).fill(null);
    this.part = new Int32Array(w * h);
  }

  filled(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return false;
    const i = y * this.w + x;
    return this.ramp[i] !== null || this.fixed[i] !== null;
  }

  /** Paint every pixel whose middle is inside `inside`, shaded by `form`. */
  shape(inside: (fx: number, fy: number) => boolean, bounds: [number, number, number, number], r: Ramp, o: DrawOpts = {}): number {
    const [bx, by, bw, bh] = bounds;
    const x0 = Math.max(0, Math.floor(bx));
    const y0 = Math.max(0, Math.floor(by));
    const x1 = Math.min(this.w - 1, Math.ceil(bx + bw));
    const y1 = Math.min(this.h - 1, Math.ceil(by + bh));
    const pixels: number[] = [];
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        if (!inside(x + 0.5, y + 0.5)) continue;
        if (o.clip && !o.clip(x + 0.5, y + 0.5)) continue;
        if (o.onlyOver && !this.filled(x, y)) continue;
        pixels.push(x, y);
      }
    if (!pixels.length) return 0;
    const [cx, cy, rx, ry] = o.box
      ? [o.box[0] + o.box[2] / 2, o.box[1] + o.box[3] / 2, o.box[2] / 2, o.box[3] / 2]
      : [bx + bw / 2, by + bh / 2, bw / 2, bh / 2];
    const id = this.nextPart++;
    const form = o.form ?? 'sphere';
    const mine = new Set<number>();
    for (let k = 0; k < pixels.length; k += 2) {
      const x = pixels[k];
      const y = pixels[k + 1];
      const i = y * this.w + x;
      let level: number;
      if (form === 'flat') level = o.level ?? 2;
      else {
        let nx = (x + 0.5 - cx) / Math.max(0.5, rx);
        let ny = (y + 0.5 - cy) / Math.max(0.5, ry);
        if (form === 'cylV') ny = -0.15;
        if (form === 'cylH') nx = -0.1;
        nx = Math.max(-1, Math.min(1, nx));
        ny = Math.max(-1, Math.min(1, ny));
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const d = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2] + (o.bias ?? 0);
        level = 0;
        for (let e = 0; e < EDGES.length; e++) {
          let edge = EDGES[e];
          if (o.dither && Math.abs(d - edge) < 0.05) edge += (x + y) % 2 ? 0.05 : -0.05;
          if (d > edge) level = e + 1;
        }
      }
      if (o.soft) level = Math.max(1, Math.min(3, level));
      this.ramp[i] = r;
      this.fixed[i] = null;
      this.lv[i] = level;
      this.part[i] = id;
      mine.add(i);
    }
    if (o.sep) this.separate(mine, o.sep === 2 ? 2 : 1);
    return id;
  }

  /** Darken the pixels just outside a freshly painted part (a soft seam). */
  private separate(mine: Set<number>, amount: number): void {
    const done = new Set<number>();
    mine.forEach((i) => {
      const x = i % this.w;
      const y = (i - x) / this.w;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= this.w || ny >= this.h) continue;
        const j = ny * this.w + nx;
        if (mine.has(j) || done.has(j) || !this.ramp[j]) continue;
        done.add(j);
        this.lv[j] = Math.max(0, this.lv[j] - amount);
      }
    });
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, r: Ramp, o: DrawOpts = {}): number {
    return this.shape(
      (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1,
      [cx - rx, cy - ry, rx * 2, ry * 2],
      r,
      o,
    );
  }

  rect(x: number, y: number, w: number, h: number, r: Ramp, o: DrawOpts = {}): number {
    return this.shape((fx, fy) => fx >= x && fx < x + w && fy >= y && fy < y + h, [x, y, w, h], r, { form: 'flat', ...o });
  }

  /** A rounded tube between two points (arms, legs, pipes). */
  capsule(x1: number, y1: number, x2: number, y2: number, rad: number, r: Ramp, o: DrawOpts = {}): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1e-6;
    const inside = (x: number, y: number) => {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2));
      return (x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2 <= rad * rad;
    };
    const bx = Math.min(x1, x2) - rad;
    const by = Math.min(y1, y2) - rad;
    return this.shape(inside, [bx, by, Math.abs(dx) + rad * 2, Math.abs(dy) + rad * 2], r, { form: 'cylV', ...o });
  }

  /** A filled polygon (points in order). */
  poly(pts: Array<[number, number]>, r: Ramp, o: DrawOpts = {}): number {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const bx = Math.min(...xs);
    const by = Math.min(...ys);
    const inside = (x: number, y: number) => {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    return this.shape(inside, [bx, by, Math.max(...xs) - bx, Math.max(...ys) - by], r, { form: 'cylV', ...o });
  }

  /** One pixel in a ramp shade. */
  dot(x: number, y: number, r: Ramp, level: number): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    this.ramp[i] = r;
    this.fixed[i] = null;
    this.lv[i] = Math.max(0, Math.min(4, level));
    if (!this.part[i]) this.part[i] = this.nextPart++;
  }

  /** One pixel in an exact color (eyes, sparkles, screen text). */
  pix(x: number, y: number, c: string): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    this.fixed[i] = c;
    if (!this.part[i]) this.part[i] = this.nextPart++;
  }

  fillPix(x: number, y: number, w: number, h: number, c: string): void {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.pix(x + i, y + j, c);
  }

  /** A 1px line (Bresenham) in a ramp shade. */
  line(x1: number, y1: number, x2: number, y2: number, r: Ramp, level: number, o: { onlyOver?: boolean } = {}): void {
    let x = Math.floor(x1);
    let y = Math.floor(y1);
    const xe = Math.floor(x2);
    const ye = Math.floor(y2);
    const dx = Math.abs(xe - x);
    const dy = -Math.abs(ye - y);
    const sx = x < xe ? 1 : -1;
    const sy = y < ye ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      if (!o.onlyOver || this.filled(x, y)) this.dot(x, y, r, level);
      if (x === xe && y === ye) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /** Change the shade of painted pixels where `test` passes. */
  relevel(test: (x: number, y: number, level: number, r: Ramp) => boolean, delta: number): void {
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = y * this.w + x;
        const r = this.ramp[i];
        if (!r || this.fixed[i]) continue;
        if (test(x, y, this.lv[i], r)) this.lv[i] = Math.max(0, Math.min(4, this.lv[i] + delta));
      }
  }

  /** Set the shade of the pixel at (x, y) if it is painted. */
  setLevel(x: number, y: number, level: number): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    if (this.ramp[i]) this.lv[i] = Math.max(0, Math.min(4, level));
  }

  levelAt(x: number, y: number): number {
    return this.lv[y * this.w + x];
  }

  rampAt(x: number, y: number): Ramp | null {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.ramp[y * this.w + x];
  }

  color(x: number, y: number): string | null {
    const i = y * this.w + x;
    return this.fixed[i] ?? (this.ramp[i] ? this.ramp[i]![this.lv[i]] : null);
  }

  /**
   * Finish: colored outline around every shape. On the lit side (top and
   * left) the outline is the part's darkest shade; on the shadow side it is
   * darker still, which gives sprites a soft, rounded edge.
   */
  toBuffer(opts: { outline?: boolean; outlineColor?: string } = {}): PixelBuffer {
    const b = new PixelBuffer(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) b.px[y * this.w + x] = this.color(x, y);
    if (opts.outline === false) return b;
    const add: Array<[number, string]> = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.filled(x, y)) continue;
        // neighbors in order: below, right (we are on the lit side), above, left (shadow side)
        const n: Array<[number, number, boolean]> = [
          [x, y + 1, true],
          [x + 1, y, true],
          [x, y - 1, false],
          [x - 1, y, false],
        ];
        const hit = n.find(([nx, ny]) => this.filled(nx, ny));
        if (!hit) continue;
        const [nx, ny, lit] = hit;
        const r = this.rampAt(nx, ny);
        const c = opts.outlineColor ?? (r ? (lit ? mixHex(r[0], selout(r), 0.45) : selout(r)) : '#24161c');
        add.push([y * this.w + x, c]);
      }
    add.forEach(([i, c]) => (b.px[i] = c));
    return b;
  }
}

/** A small repeatable random number from a position (for scattered details). */
export function hash(x: number, y: number, seed = 0): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
