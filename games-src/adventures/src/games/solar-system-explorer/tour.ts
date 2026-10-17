import { audio } from '../../kit/systems/audio';
import { h } from '../../kit/ui/dom';
import { hash } from '../../kit/worlds/shade';
import { paintPlanet, paintVee } from '../../kit/worlds/star-station/space-art';
import type { PlanetId } from './problems';

/**
 * The Grand Tour's flight: Vee flies out from the Sun past every planet in
 * order. Each planet glides in from the right; when it is in the middle the
 * child takes its photo (Space or Enter, a click or a tap, or the button).
 * At the end, past Neptune, Vee turns round to photograph Earth as a tiny
 * dot in a sunbeam, like the real Voyager 1 "Pale Blue Dot" photo (1990).
 *
 * Drawn on a small 2D canvas scaled up with crisp pixels (like the cloud
 * dive). The game drives it step by step: `arrive(p)`, then `snap()`
 * (resolves when the photo is taken), then `leave()`; and `turnRound()` for
 * the last photo.
 */

const VW = 320;
type Phase = 'cruise' | 'in' | 'ready' | 'flash' | 'out' | 'dot';

/** How big each planet looks as it goes by, as a part of the screen's height (not to scale). */
const SIZE: Record<PlanetId, number> = { mercury: 0.09, venus: 0.13, earth: 0.14, mars: 0.11, jupiter: 0.26, saturn: 0.14, uranus: 0.16, neptune: 0.16 };

export class Flyby {
  readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private readonly snapBtn: HTMLButtonElement;
  private W = VW;
  private H = 180;
  private scale = 2;
  private t = 0;
  private last = performance.now();
  private raf = 0;
  private phase: Phase = 'cruise';
  private phaseT = 0;
  private planet: PlanetId | null = null;
  private sprite: HTMLCanvasElement | null = null;
  private px = 0;
  private flash = 0;
  private veeRight: HTMLCanvasElement[];
  private veeLeft: HTMLCanvasElement[];
  private stars: Array<{ x: number; y: number; z: number; c: string }> = [];
  private waiters: Array<() => void> = [];
  private snapWaiter: (() => void) | null = null;
  /** The game turns this off while a talk box or a question is open. */
  listening = false;
  reducedMotion = false;
  /** How many photos have been taken (for tests). */
  photos = 0;
  /** "End the flight" (the game decides if it can stop now). */
  onQuit: (() => void) | null = null;
  /** When the photo became possible (a key press that closed a talk box must not take it too). */
  private readyAt = 0;
  private readonly onKey: (e: KeyboardEvent) => void;

  constructor(host: HTMLElement, before: Element | null = null) {
    this.canvas = h('canvas', { class: 'sse-dive-canvas', 'aria-label': 'Vee flying past the planets' }) as HTMLCanvasElement;
    this.snapBtn = h('button', { class: 'btn primary sse-snap', type: 'button', hidden: true, text: 'Take the photo', onclick: () => this.snap() });
    const quit = h('button', { class: 'btn small sse-fly-quit', type: 'button', text: 'End the flight', onclick: () => this.onQuit?.() });
    this.root = h('div', { class: 'sse-dive sse-fly' }, this.canvas, this.snapBtn, quit);
    host.insertBefore(this.root, before);
    this.g = this.canvas.getContext('2d')!;
    this.veeRight = [0, 1, 2].map((f) => paintVee(16, 'right', f).toCanvas());
    this.veeLeft = [0, 1, 2].map((f) => paintVee(16, 'left', f).toCanvas());
    for (let i = 0; i < 140; i++) {
      const z = hash(i, 3, 17) < 0.7 ? 1 : 2;
      this.stars.push({ x: hash(i, 1, 17), y: hash(i, 2, 17), z, c: z === 2 ? '#ffffff' : hash(i, 4, 17) < 0.5 ? '#8a9ad8' : '#cfe8ff' });
    }
    this.onKey = (e) => {
      if (!this.listening || this.phase !== 'ready' || performance.now() - this.readyAt < 300) return;
      if ((e.key === ' ' || e.key === 'Enter') && document.activeElement !== this.snapBtn) {
        e.preventDefault();
        this.snap();
      }
    };
    window.addEventListener('keydown', this.onKey);
    this.canvas.addEventListener('pointerdown', () => this.listening && performance.now() - this.readyAt > 300 && this.snap());
    this.resize();
    this.loop();
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

  get state(): { phase: Phase; planet: PlanetId | null; photos: number } {
    return { phase: this.phase, planet: this.planet, photos: this.photos };
  }

  private setPhase(p: Phase): void {
    this.phase = p;
    this.phaseT = 0;
  }

  private wait(): Promise<void> {
    return new Promise((r) => this.waiters.push(r));
  }

  private wake(): void {
    const w = this.waiters;
    this.waiters = [];
    w.forEach((f) => f());
  }

  /** The next planet glides in to the middle. */
  arrive(p: PlanetId): Promise<void> {
    this.planet = p;
    const r = Math.max(4, Math.round(this.H * SIZE[p]));
    this.sprite = paintPlanet(p, r, 0.15).toCanvas();
    this.px = this.W + this.sprite.width;
    this.setPhase('in');
    return this.wait();
  }

  /** Waits for the child to take the photo. */
  waitForSnap(): Promise<void> {
    this.setPhase('ready');
    this.listening = true;
    this.readyAt = performance.now();
    this.snapBtn.hidden = false;
    this.snapBtn.textContent = 'Take the photo';
    return new Promise((r) => (this.snapWaiter = r));
  }

  /** Takes the photo (a click, a tap, Space or Enter, the button, or a test). */
  snap(): void {
    if (this.phase !== 'ready' || !this.snapWaiter || performance.now() - this.readyAt < 300) return;
    this.listening = false;
    this.snapBtn.hidden = true;
    this.photos++;
    this.flash = 1;
    audio.fx(
      [
        [84, 0, 0.04],
        [72, 0.05, 0.08],
      ],
      'square',
      0.05,
    );
    const w = this.snapWaiter;
    this.snapWaiter = null;
    this.setPhase('flash');
    setTimeout(w, this.reducedMotion ? 120 : 380);
  }

  /** The planet glides off to the left. */
  leave(): Promise<void> {
    this.setPhase('out');
    return this.wait();
  }

  /** Past Neptune: Vee turns round to look back at the Sun and the tiny dot of Earth. */
  turnRound(): void {
    this.planet = null;
    this.sprite = null;
    this.setPhase('dot');
  }

  private loop = (): void => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private step(dt: number): void {
    this.t += dt;
    this.phaseT += dt;
    this.flash = Math.max(0, this.flash - dt * 3);
    const slow = this.reducedMotion ? 0.15 : 1;
    const mid = this.W * 0.62;
    if (this.phase === 'in' && this.sprite) {
      const dur = this.reducedMotion ? 0.2 : 1.5;
      const k = Math.min(1, this.phaseT / dur);
      const ease = 1 - (1 - k) ** 3;
      this.px = this.W + this.sprite.width - (this.W + this.sprite.width - mid) * ease;
      if (k >= 1) {
        this.setPhase('cruise');
        this.wake();
      }
    } else if (this.phase === 'out' && this.sprite) {
      const dur = this.reducedMotion ? 0.15 : 0.9;
      const k = Math.min(1, this.phaseT / dur);
      this.px = mid - (mid + this.sprite.width) * k * k;
      if (k >= 1) {
        this.sprite = null;
        this.setPhase('cruise');
        this.wake();
      }
    }
    // stars stream past (faster while a planet glides in or out)
    const fast = this.phase === 'in' || this.phase === 'out' ? 3 : 1;
    for (const s of this.stars) {
      s.x -= dt * 0.02 * s.z * fast * slow;
      if (s.x < 0) s.x += 1;
    }
  }

  private draw(): void {
    const { g, W, H } = this;
    const lookingBack = this.planet === null && (this.phase === 'dot' || this.phase === 'ready' || this.phase === 'flash');
    g.fillStyle = '#05071a';
    g.fillRect(0, 0, W, H);
    for (const s of this.stars) {
      g.fillStyle = s.c;
      g.fillRect(Math.floor(s.x * W), Math.floor(s.y * H), 1, 1);
    }
    if (lookingBack) this.drawPaleDot();
    else if (this.sprite) {
      g.drawImage(this.sprite, Math.round(this.px - this.sprite.width / 2), Math.round(H * 0.46 - this.sprite.height / 2));
      if (this.phase === 'ready') this.brackets(this.px, H * 0.46, this.sprite.width / 2 + 6, this.sprite.height / 2 + 6);
    }
    // Vee, bobbing, thrusters on (facing back toward the Sun for the last photo)
    const frames = lookingBack ? this.veeLeft : this.veeRight;
    const v = frames[this.phase === 'ready' ? 0 : 1 + (Math.floor(this.t * 8) % 2)];
    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(this.t * 3) * 2);
    const vx = lookingBack ? W * 0.78 : W * 0.2;
    g.drawImage(v, Math.round(vx - v.width / 2), Math.round(H * 0.62 - v.height / 2 + bob));
    if (this.flash > 0) {
      g.fillStyle = '#ffffff';
      g.globalAlpha = Math.min(1, this.flash);
      g.fillRect(0, 0, W, H);
      g.globalAlpha = 1;
    }
  }

  /** Camera corners round the thing to photograph (blinking). */
  private brackets(cx: number, cy: number, rx: number, ry: number): void {
    if (!this.reducedMotion && Math.floor(this.t * 3) % 2) return;
    const g = this.g;
    g.fillStyle = '#7ff0ff';
    const L = 5;
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const x = Math.round(cx + sx * rx);
      const y = Math.round(cy + sy * ry);
      g.fillRect(sx < 0 ? x : x - L + 1, y, L, 1);
      g.fillRect(x, sy < 0 ? y : y - L + 1, 1, L);
    }
  }

  /** The view back home: the Sun a bright star, sunbeams scattered in the camera, and Earth a tiny blue dot in one of them. */
  private drawPaleDot(): void {
    const { g, W, H } = this;
    const sx = W * 0.12;
    const sy = H * 0.3;
    // the beams of scattered sunlight: soft, warm stripes with fuzzy edges (as in the real photo)
    const beams = [0.3, 0.45, 0.6, 0.74];
    beams.forEach((b, i) => {
      const x0 = Math.round(W * b);
      const w = Math.max(3, Math.round(W * 0.022));
      for (let k = -2; k <= w + 2; k++) {
        const edge = k < 0 || k > w ? 0.35 : 1;
        g.fillStyle = `rgba(214, 150, 110, ${(i % 2 ? 0.1 : 0.15) * edge})`;
        g.fillRect(x0 + k, 0, 1, H);
      }
    });
    g.fillStyle = '#fff6d0';
    g.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
    g.fillStyle = 'rgba(255, 240, 200, 0.35)';
    g.fillRect(Math.round(sx) - 3, Math.round(sy), 7, 1);
    g.fillRect(Math.round(sx), Math.round(sy) - 3, 1, 7);
    // Earth: one blue pixel in the second beam, with the faintest glow round it
    const ex = Math.round(W * 0.455);
    const ey = Math.round(H * 0.42);
    g.fillStyle = 'rgba(143, 196, 255, 0.3)';
    g.fillRect(ex - 1, ey, 3, 1);
    g.fillRect(ex, ey - 1, 1, 3);
    g.fillStyle = '#a8d4ff';
    g.fillRect(ex, ey, 1, 1);
    if (this.phase === 'ready') this.brackets(ex, ey, 6, 6);
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKey);
    this.wake();
    this.snapWaiter?.();
    this.root.remove();
  }
}
