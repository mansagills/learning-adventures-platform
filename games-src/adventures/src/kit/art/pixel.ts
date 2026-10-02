import { P } from './palette';

/**
 * A small grid of colored pixels. All the game's art (characters, props,
 * tiles, icons, portraits) is painted into these in code, then turned into
 * canvases/textures. That keeps every asset original and lets the player's
 * look be recombined from parts at runtime.
 */
export class PixelBuffer {
  readonly px: (string | null)[];

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.px = new Array(w * h).fill(null);
  }

  get(x: number, y: number): string | null {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.px[y * this.w + x];
  }

  set(x: number, y: number, c: string | null): void {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px[y * this.w + x] = c;
  }

  rect(x: number, y: number, w: number, h: number, c: string | null): void {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }

  /** Horizontal run from x0 to x1 inclusive. */
  hline(x0: number, x1: number, y: number, c: string): void {
    for (let x = x0; x <= x1; x++) this.set(x, y, c);
  }

  vline(x: number, y0: number, y1: number, c: string): void {
    for (let y = y0; y <= y1; y++) this.set(x, y, c);
  }

  /** Filled ellipse inside the box (x, y, w, h). */
  ellipse(x: number, y: number, w: number, h: number, c: string | null): void {
    const cx = x + w / 2 - 0.5;
    const cy = y + h / 2 - 0.5;
    const rx = w / 2;
    const ry = h / 2;
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const dx = (x + i - cx) / rx;
        const dy = (y + j - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) this.set(x + i, y + j, c);
      }
  }

  /** Only paint where something is already painted (for shading a shape). */
  shadeWhere(test: (x: number, y: number, c: string) => boolean, c: string): void {
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const cur = this.get(x, y);
        if (cur && test(x, y, cur)) this.set(x, y, c);
      }
  }

  /** Draw a 1px dark outline around every painted shape (the 16-bit look). */
  outline(color: string = P.outline): this {
    const add: number[] = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push(y * this.w + x);
      }
    add.forEach((i) => (this.px[i] = color));
    return this;
  }

  flipX(): PixelBuffer {
    const out = new PixelBuffer(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) out.set(this.w - 1 - x, y, this.get(x, y));
    return out;
  }

  /** Copy another buffer on top of this one (null pixels are transparent). */
  blit(src: PixelBuffer, dx: number, dy: number): void {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const c = src.get(x, y);
        if (c) this.set(dx + x, dy + y, c);
      }
  }

  drawTo(ctx: CanvasRenderingContext2D, dx: number, dy: number, scale = 1): void {
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const c = this.get(x, y);
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(dx + x * scale, dy + y * scale, scale, scale);
      }
  }

  toCanvas(scale = 1): HTMLCanvasElement {
    const cv = document.createElement('canvas');
    cv.width = this.w * scale;
    cv.height = this.h * scale;
    const ctx = cv.getContext('2d')!;
    if (scale === 1 && typeof ImageData !== 'undefined') {
      // Large buffers (a whole river bank) are written in one go, which is
      // far faster than one fillRect per pixel.
      const img = ctx.createImageData(this.w, this.h);
      const d = img.data;
      let slow = false;
      for (let i = 0; i < this.px.length; i++) {
        const c = this.px[i];
        if (!c) continue;
        const rgb = hexRGB(c);
        if (rgb < 0) {
          slow = true;
          continue;
        }
        d[i * 4] = (rgb >> 16) & 255;
        d[i * 4 + 1] = (rgb >> 8) & 255;
        d[i * 4 + 2] = rgb & 255;
        d[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      if (slow)
        for (let y = 0; y < this.h; y++)
          for (let x = 0; x < this.w; x++) {
            const c = this.get(x, y);
            if (c && hexRGB(c) < 0) {
              ctx.fillStyle = c;
              ctx.fillRect(x, y, 1, 1);
            }
          }
      return cv;
    }
    this.drawTo(ctx, 0, 0, scale);
    return cv;
  }

  toDataURL(scale = 1): string {
    return this.toCanvas(scale).toDataURL('image/png');
  }
}

const rgbCache = new Map<string, number>();
/** #rrggbb → 0xRRGGBB, or -1 for anything else (rgba(), names). */
function hexRGB(c: string): number {
  let v = rgbCache.get(c);
  if (v === undefined) {
    v = /^#[0-9a-f]{6}$/i.test(c) ? parseInt(c.slice(1), 16) : -1;
    rgbCache.set(c, v);
  }
  return v;
}

/** Mix two #rrggbb colors (t = 0 gives a, t = 1 gives b). */
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
