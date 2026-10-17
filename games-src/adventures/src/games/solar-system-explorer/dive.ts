import { PixelBuffer } from '../../kit/art/pixel';
import { h } from '../../kit/ui/dom';
import { hash, mixHex } from '../../kit/worlds/shade';
import { paintVee } from '../../kit/worlds/star-station/space-art';
import { paintFind } from '../../kit/worlds/star-station/surfaces';
import type { PlanetId } from './problems';

/**
 * The giant planets' stop: a dive into the clouds (there is no ground to
 * land on). Vee sinks through the cloud bands; the child steers left and
 * right (arrow keys or A and D, or by holding a finger or the mouse on the
 * side to go to) to catch the three finds as they rise past: a sample, a fact
 * card and a question. It gets darker and warmer deeper down, with lightning.
 *
 * Drawn on a small 2D canvas scaled up with crisp pixels. The cloud bands are
 * painted once into a strip that repeats sideways; each frame only slides the
 * bands (neighbouring bands blow opposite ways, as on Jupiter) and lays a
 * darker tint over them, so it stays smooth on slow computers.
 */

export type FindKind = 'sample' | 'fact' | 'question';
export const FIND_ORDER: FindKind[] = ['sample', 'fact', 'question'];

const PALETTES: Record<'jupiter' | 'saturn' | 'uranus' | 'neptune', { bands: string[]; dark: string; streak: string }> = {
  jupiter: { bands: ['#efdcb8', '#c98f60', '#e2bb8c', '#b27450', '#f2e4c6', '#d49e6e'], dark: '#2a1a22', streak: '#ffffff' },
  saturn: { bands: ['#efe0b0', '#dcc488', '#e8d6a0', '#cdb47a', '#f4e8c2'], dark: '#2a2218', streak: '#fff6dc' },
  uranus: { bands: ['#b4e8ec', '#a3e0e6', '#c2eef0', '#98d8e0'], dark: '#10283a', streak: '#e8fbff' },
  neptune: { bands: ['#4a74e0', '#3d66da', '#5a82e6', '#3358c8'], dark: '#0a1440', streak: '#e8f0ff' },
};

const VW = 320;
const STRIP_W = 256;
const BANDS = 9;

interface Bubble {
  kind: FindKind;
  x: number;
  y: number;
  caught: boolean;
}

export class CloudDive {
  readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private strip!: HTMLCanvasElement;
  private bh = 24;
  private W = VW;
  private H = 180;
  private scale = 2;
  private t = 0;
  private scroll = 0;
  private veeX = VW / 2;
  private keys = { left: false, right: false };
  private pointerX: number | null = null;
  private bubbles: Bubble[] = [];
  private veeFrames: PixelBuffer[] = [];
  private findFrames: Record<FindKind, HTMLCanvasElement[]>;
  private veeCanvases: HTMLCanvasElement[] = [];
  private raf = 0;
  private last = performance.now();
  paused = false;
  reducedMotion = false;
  /** Called when Vee catches a find (the game opens it and calls `resume()`). */
  onFind: ((k: FindKind) => void) | null = null;
  private readonly onKey: (e: KeyboardEvent) => void;

  constructor(
    host: HTMLElement,
    readonly planet: PlanetId,
    readonly have: FindKind[] = [],
    /** The dive goes in under this element (the HUD), so the talk box, panels and HUD stay on top. */
    before: Element | null = null,
  ) {
    const pal = PALETTES[(['jupiter', 'saturn', 'uranus', 'neptune'].includes(planet) ? planet : 'jupiter') as keyof typeof PALETTES];
    this.canvas = h('canvas', { class: 'sse-dive-canvas', 'aria-label': 'Diving into the clouds' }) as HTMLCanvasElement;
    this.root = h('div', { class: 'sse-dive' }, this.canvas);
    host.insertBefore(this.root, before);
    this.g = this.canvas.getContext('2d')!;
    this.veeFrames = [0, 1, 2].map((f) => paintVee(16, 'right', f));
    this.veeCanvases = this.veeFrames.map((b) => b.toCanvas());
    this.findFrames = { sample: [0, 1].map((f) => paintFind(16, 'sample', f).toCanvas()), fact: [0, 1].map((f) => paintFind(16, 'fact', f).toCanvas()), question: [0, 1].map((f) => paintFind(16, 'question', f).toCanvas()) };
    this.paintStrip(pal);
    this.palette = pal;
    // the finds still to catch rise from below, one after another
    let y = 1.2;
    for (const kind of FIND_ORDER)
      if (!have.includes(kind)) {
        this.bubbles.push({ kind, x: 0.25 + hash(y * 10, 3, 9) * 0.5, y, caught: false });
        y += 0.9;
      }
    this.onKey = (e) => {
      const k = e.key.toLowerCase();
      const down = e.type === 'keydown';
      if (k === 'arrowleft' || k === 'a') this.keys.left = down;
      else if (k === 'arrowright' || k === 'd') this.keys.right = down;
      else return;
      if (!this.paused) e.preventDefault();
    };
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKey);
    this.canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    this.canvas.addEventListener('pointermove', (e) => this.pointerX !== null && this.onPointer(e));
    const up = () => (this.pointerX = null);
    this.canvas.addEventListener('pointerup', up);
    this.canvas.addEventListener('pointerleave', up);
    this.canvas.addEventListener('pointercancel', up);
    this.resize();
    this.loop();
  }

  private palette: { bands: string[]; dark: string; streak: string };

  /**
   * The cloud bands, painted once: one band per row of the strip, each a base
   * color with wavy streaks inside it, repeating every STRIP_W pixels
   * sideways. Band edges are straight, so bands can slide past each other.
   */
  private paintStrip(pal: { bands: string[]; streak: string }): void {
    const bh = this.bh;
    const b = new PixelBuffer(STRIP_W, bh * BANDS);
    const TAU = Math.PI * 2;
    for (let bi = 0; bi < BANDS; bi++) {
      const base = pal.bands[bi % pal.bands.length];
      const deep = mixHex(base, '#000000', 0.12);
      const lite = mixHex(base, pal.streak, 0.35);
      for (let y = 0; y < bh; y++)
        for (let x = 0; x < STRIP_W; x++) {
          const f = x / STRIP_W;
          let c = base;
          // two wavy streaks inside the band, and soft darker edges
          const w1 = bh * 0.3 + Math.sin(f * TAU * 3 + bi) * bh * 0.12;
          const w2 = bh * 0.68 + Math.sin(f * TAU * 5 + bi * 2) * bh * 0.1;
          if (Math.abs(y - w1) < 1.2) c = lite;
          else if (Math.abs(y - w2) < 0.8 && hash(x >> 2, bi, 4) > 0.3) c = lite;
          else if (y < 2 || y >= bh - 2) c = (x + y) % 2 ? deep : base;
          // little swirls (storms) here and there
          // (distance measured the short way round, so a swirl near the strip's edge stays round)
          const sx = (bi * 97 + 40) % STRIP_W;
          const ddx = ((x - sx + STRIP_W * 1.5) % STRIP_W) - STRIP_W / 2;
          const dd = Math.hypot(ddx, (y - bh / 2) * 1.6);
          if (bi % 3 === 1 && dd < bh * 0.3) c = dd < bh * 0.16 ? mixHex(base, '#000000', 0.18) : mixHex(base, pal.streak, 0.45);
          b.set(x, bi * bh + y, c);
        }
    }
    this.strip = b.toCanvas();
  }

  private onPointer(e: PointerEvent): void {
    const r = this.canvas.getBoundingClientRect();
    this.pointerX = ((e.clientX - r.left) / r.width) * this.W;
  }

  resize(): void {
    const w = this.root.clientWidth || window.innerWidth;
    const hh = this.root.clientHeight || window.innerHeight;
    this.scale = Math.max(1, Math.round(Math.min(w / VW, hh / 180)));
    this.W = Math.ceil(w / this.scale);
    this.H = Math.ceil(hh / this.scale);
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.canvas.style.width = `${this.W * this.scale}px`;
    this.canvas.style.height = `${this.H * this.scale}px`;
    this.g.imageSmoothingEnabled = false;
  }

  /** How deep Vee has dived, 0 (the cloud tops) to 1 (deep down). */
  get depth(): number {
    return Math.min(1, this.scroll / (this.bh * 26));
  }

  get finds(): Array<{ kind: FindKind; x: number; y: number }> {
    return this.bubbles.filter((b) => !b.caught).map((b) => ({ kind: b.kind, x: b.x * this.W, y: b.y * this.H }));
  }

  get vee(): number {
    return this.veeX;
  }

  /** Test helper: steer Vee straight to a spot. */
  setVee(x: number): void {
    this.veeX = Math.max(12, Math.min(this.W - 12, x));
  }

  /** A find that was caught but not finished (the child left its panel): it floats back up from below. */
  release(kind: FindKind): void {
    const b = this.bubbles.find((x) => x.kind === kind);
    if (b) {
      b.caught = false;
      b.y = 1.15;
    }
  }

  resume(): void {
    this.paused = false;
    this.last = performance.now();
  }

  private loop = (): void => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.paused) this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private step(dt: number): void {
    this.t += dt;
    const sink = 26 * dt;
    this.scroll += sink;
    // steering: keys, or toward the finger or mouse
    const speed = 110;
    let dx = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    if (this.pointerX !== null && Math.abs(this.pointerX - this.veeX) > 3) dx = Math.sign(this.pointerX - this.veeX);
    this.veeX = Math.max(12, Math.min(this.W - 12, this.veeX + dx * speed * dt));
    // the finds rise past; a missed one comes round again
    const veeY = this.H * 0.42;
    for (const b of this.bubbles) {
      if (b.caught) continue;
      b.y -= (sink * 1.4) / this.H;
      if (b.y < -0.1) {
        b.y = 1.15;
        b.x = 0.2 + hash(Math.floor(this.t * 10), 5, 3) * 0.6;
      }
      const bx = b.x * this.W;
      const by = b.y * this.H;
      if (Math.abs(bx - this.veeX) < 16 && Math.abs(by - veeY) < 16) {
        b.caught = true;
        this.paused = true;
        this.onFind?.(b.kind);
        return;
      }
    }
  }

  private draw(): void {
    const { g, W, H } = this;
    // the bands, each sliding its own way (neighbours blow in opposite directions)
    const bh = this.bh;
    const first = Math.floor(this.scroll / bh);
    const startY = first * bh - this.scroll;
    for (let i = 0; startY + i * bh < H; i++) {
      const band = first + i;
      const y = Math.round(startY + i * bh);
      const srcY = (((band % BANDS) + BANDS) % BANDS) * bh;
      const dir = band % 2 ? 1 : -1;
      const off = this.reducedMotion ? 0 : Math.floor((((dir * this.t * (14 + (Math.abs(band) % 3) * 8)) % STRIP_W) + STRIP_W) % STRIP_W);
      for (let x = -off; x < W; x += STRIP_W) g.drawImage(this.strip, 0, srcY, STRIP_W, bh, x, y, STRIP_W, bh);
    }
    // darker and warmer deeper down
    const d = this.depth;
    g.fillStyle = this.palette.dark;
    g.globalAlpha = d * 0.7;
    g.fillRect(0, 0, W, H);
    g.globalAlpha = 1;
    // lightning, now and then, deep down
    if (d > 0.5 && !this.reducedMotion && Math.floor(this.t * 10) % 37 < 2) {
      let x = (hash(Math.floor(this.t / 3.7), 1, 7) * 0.6 + 0.2) * W;
      g.fillStyle = '#ffffff';
      for (let y = Math.floor(H * 0.55); y < H * 0.85; y++) {
        x += (hash(y, Math.floor(this.t), 3) - 0.5) * 3;
        g.fillRect(Math.round(x), y, 2, 1);
      }
    }
    // the finds, glowing
    const fr = Math.floor(this.t * 3) % 2;
    for (const b of this.bubbles) {
      if (b.caught) continue;
      const img = this.findFrames[b.kind][fr];
      const bx = Math.round(b.x * W - img.width / 2);
      const by = Math.round(b.y * H - img.height / 2);
      g.fillStyle = b.kind === 'sample' ? 'rgba(125,234,138,0.35)' : b.kind === 'fact' ? 'rgba(79,214,255,0.35)' : 'rgba(255,181,71,0.35)';
      g.beginPath();
      g.arc(bx + img.width / 2, by + img.height / 2, 13, 0, Math.PI * 2);
      g.fill();
      g.drawImage(img, bx, by);
    }
    // Vee, bobbing, with the thruster on
    const v = this.veeCanvases[this.paused ? 0 : 1 + (Math.floor(this.t * 8) % 2)];
    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(this.t * 3) * 2);
    g.drawImage(v, Math.round(this.veeX - v.width / 2), Math.round(H * 0.42 - v.height / 2 + bob));
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKey);
    this.root.remove();
  }
}
