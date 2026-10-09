import * as THREE from 'three';
import type { PixelBuffer } from '../../kit/art/pixel';
import { mulberry32 } from '../../kit/core/rng';
import { h } from '../../kit/ui/dom';
import { paintAnswerRock, paintNebula, paintPebble, paintShip, paintSpark, paintStaticCore, paintSupply, type PaintId } from './art';
import type { Choice, Picture } from './problems';

/**
 * The flight: a vertical space shooter drawn with Three.js in a small canvas
 * that the browser scales up by a whole number, so its pixels match the
 * station deck's.
 *
 * - The player's ship sits near the bottom and steers left and right.
 * - Its blaster fires on its own at the gray Static pebbles drifting down
 *   (they burst into sparkles; bumping one costs a bit of shield).
 * - Questions arrive as three big answer rocks that fly in and wait. The
 *   blaster can't break them: the charge beam does (Space under a rock,
 *   keys 1-3, or a tap or click on the rock). So an answer is always a
 *   choice, never an accident.
 * - The stranded supply ships fly in above the rocks in the shape the
 *   question is about (equal groups, a formation, a split formation). The
 *   right answer lights them up and they join the player's fleet.
 *
 * This class draws and moves things and reports what happened; the game
 * decides the questions, the stars and the hints (see game.ts).
 */

const tex = (b: PixelBuffer | HTMLCanvasElement): THREE.CanvasTexture => {
  const t = new THREE.CanvasTexture(b instanceof HTMLCanvasElement ? b : b.toCanvas());
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

class Spr {
  readonly mesh: THREE.Mesh;
  readonly mat: THREE.MeshBasicMaterial;
  w: number;
  h: number;
  x = 0;
  y = 0;
  constructor(t: THREE.Texture, z = 0) {
    const img = t.image as { width: number; height: number };
    this.w = img.width;
    this.h = img.height;
    this.mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(this.w, this.h), this.mat);
    this.mesh.position.z = z;
  }
  at(x: number, y: number): this {
    this.x = x;
    this.y = y;
    // whole pixels (odd sizes sit on half pixels so their edges stay on the grid)
    this.mesh.position.x = Math.round(x) + (this.w % 2) / 2;
    this.mesh.position.y = Math.round(y) + (this.h % 2) / 2;
    return this;
  }
  setTex(t: THREE.Texture): void {
    if (this.mat.map === t) return;
    this.mat.map = t;
    this.mat.needsUpdate = true;
  }
  dispose(): void {
    this.mesh.geometry.dispose();
    this.mat.dispose();
    this.mesh.parent?.remove(this.mesh);
  }
}

interface Pebble {
  s: Spr;
  vy: number;
  vx: number;
  r: number;
  shape: number;
  t: number;
}

interface Bolt {
  s: Spr;
}

interface Rock {
  s: Spr;
  label: HTMLButtonElement;
  slot: number;
  from: number;
  t: number;
  gone: boolean;
  nope: boolean;
}

interface Supply {
  s: Spr;
  x: number;
  y: number;
  lit: boolean;
  hue: number;
  small: boolean;
  /** After lighting up: flying down to join the fleet. */
  leaving: number;
}

interface Particle {
  s: Spr;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

export type FlightEvent = { type: 'hit'; index: number } | { type: 'bump'; shield: number } | { type: 'pebble' } | { type: 'empty' } | { type: 'arrived' };

export interface FlightOptions {
  paint: PaintId;
  twin: boolean;
  rapid: boolean;
  thrusters: boolean;
  shieldMax: number;
  /** Rescued ships shown flying with the player (up to 6 wingmen). */
  wingmen: number;
}

const ROCK_Y = 0.42; // where answer rocks hover, as a share of the field height

export class FlightScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  readonly layer: HTMLElement;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);
  W = 320;
  H = 360;
  scale = 2;
  /** The play column (the whole width on a phone, a centred column on a wide screen). */
  x0 = 0;
  x1 = 320;
  running = false;
  paused = false;
  reducedMotion = false;
  shield = 3;
  onEvent: ((e: FlightEvent) => void) | null = null;
  private opts: FlightOptions = { paint: 'teal', twin: false, rapid: false, thrusters: false, shieldMax: 3, wingmen: 0 };
  private ship!: Spr;
  private shipTex: THREE.CanvasTexture[] = [];
  private shipX = 160;
  private steerTo: number | null = null;
  private wingmen: Spr[] = [];
  private pebbles: Pebble[] = [];
  private bolts: Bolt[] = [];
  private rocks: Rock[] = [];
  private supplies: Supply[] = [];
  private parts: Particle[] = [];
  private splitLine: THREE.Mesh | null = null;
  private groupRings: THREE.Mesh[] = [];
  private beam: { mesh: THREE.Mesh; t: number; index: number; fired: boolean } | null = null;
  private pendingFire: number | null = null;
  private core: Spr | null = null;
  private coreTex: THREE.CanvasTexture[] = [];
  private stars: Array<{ mesh: THREE.Mesh; tex: THREE.CanvasTexture; speed: number }> = [];
  private haze!: THREE.Mesh;
  private texCache = new Map<string, THREE.CanvasTexture>();
  private time = 0;
  private fireT = 0;
  private spawnT = 1.2;
  private hurtT = 0;
  private shake = 0;
  private rand = mulberry32(7);
  /** How busy the pebbles are (0.6 calm to 1.4 busy). */
  intensity = 1;
  /** Field pixels at the top hidden by the question banner (the game measures it). */
  topReserve = 44;
  /** 0 (thick Static cloud) to 1 (clear space): the haze at the top thins as the flight goes on. */
  clearness = 0;
  private dpr = 1;

  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'default' });
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(new THREE.Color('#0e1024'), 1);
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'game-canvas msq-flight-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.layer = h('div', { class: 'msq-rock-layer' });
    host.append(this.canvas, this.layer);
    this.setVisible(false);
    this.canvas.addEventListener('pointerdown', (e) => this.pointer(e, true));
    this.canvas.addEventListener('pointermove', (e) => e.buttons && this.pointer(e, false));
  }

  setVisible(on: boolean): void {
    this.canvas.hidden = !on;
    this.layer.hidden = !on;
  }

  private cached(key: string, paint: () => PixelBuffer): THREE.CanvasTexture {
    let t = this.texCache.get(key);
    if (!t) this.texCache.set(key, (t = tex(paint())));
    return t;
  }

  /** Pick a whole-number scale: the field is about 300 pixels tall and at least 190 wide (about 195 on a phone). */
  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.dpr = dpr;
    const cssW = this.host.clientWidth || window.innerWidth;
    const cssH = this.host.clientHeight || window.innerHeight;
    const devW = Math.round(cssW * dpr);
    const devH = Math.round(cssH * dpr);
    const s = Math.max(1, Math.floor(Math.min(devH / 300, devW / 190)));
    this.scale = s;
    this.W = Math.ceil(devW / s);
    this.H = Math.ceil(devH / s);
    this.renderer.setSize(this.W, this.H, false);
    Object.assign(this.canvas.style, { width: `${(this.W * s) / dpr}px`, height: `${(this.H * s) / dpr}px`, left: '0px', top: '0px' });
    const cw = Math.min(this.W, 330);
    this.x0 = Math.floor((this.W - cw) / 2);
    this.x1 = this.x0 + cw;
    this.camera.left = 0;
    this.camera.right = this.W;
    this.camera.top = this.H;
    this.camera.bottom = 0;
    this.camera.updateProjectionMatrix();
    this.buildBackdrop();
    this.layoutRocks();
  }

  /** CSS position (in the host) of a field point. */
  toCss(x: number, y: number): { x: number; y: number } {
    return { x: (x * this.scale) / this.dpr, y: ((this.H - y) * this.scale) / this.dpr };
  }

  get shipY(): number {
    return 34;
  }

  private slotX(i: number): number {
    return this.x0 + ((this.x1 - this.x0) * (i + 0.5)) / 3;
  }

  // ------------------------------------------------------------ the backdrop

  private buildBackdrop(): void {
    for (const s of this.stars) {
      this.scene.remove(s.mesh);
      s.tex.dispose();
    }
    this.stars = [];
    if (this.haze) this.scene.remove(this.haze);
    const W = this.W;
    const H = this.H;
    // nebula, then two layers of stars that move faster (parallax)
    const layers: Array<{ paint: () => HTMLCanvasElement; speed: number }> = [
      { paint: () => paintNebula(W, 256).toCanvas(), speed: 4 },
      { paint: () => this.starCanvas(W, 256, 70, 1, 11), speed: 12 },
      { paint: () => this.starCanvas(W, 256, 26, 2, 23), speed: 26 },
    ];
    layers.forEach((l, i) => {
      const t = tex(l.paint());
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1, H / 256);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: t, transparent: i > 0, depthWrite: false }));
      m.position.set(W / 2, H / 2, -5 + i * 0.1);
      this.scene.add(m);
      this.stars.push({ mesh: m, tex: t, speed: l.speed });
    });
    // the Static cloud: a gray haze at the top that thins as the flight clears it
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 64;
    const g = c.getContext('2d')!;
    for (let y = 0; y < 64; y++) {
      g.fillStyle = `rgba(150,146,170,${(((64 - y) / 64) ** 1.6).toFixed(3)})`;
      g.fillRect(0, y, 1, 1);
    }
    const hz = new THREE.CanvasTexture(c);
    this.haze = new THREE.Mesh(new THREE.PlaneGeometry(W, H * 0.45), new THREE.MeshBasicMaterial({ map: hz, transparent: true, depthWrite: false, opacity: 0.35 }));
    this.haze.position.set(W / 2, H - (H * 0.45) / 2, -4.5);
    this.scene.add(this.haze);
    // the edges of the play column on a wide screen
    if (this.x0 > 0)
      for (const x of [this.x0, this.x1]) {
        const edge = new THREE.Mesh(new THREE.PlaneGeometry(1, H), new THREE.MeshBasicMaterial({ color: '#3a3f6e', transparent: true, opacity: 0.6 }));
        edge.position.set(x + 0.5, H / 2, -4);
        this.scene.add(edge);
      }
  }

  private starCanvas(w: number, h: number, count: number, size: number, seed: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    const r = mulberry32(seed + w);
    const colors = ['#ffffff', '#bff6ff', '#ffe7a3', '#ffc2e4'];
    for (let i = 0; i < Math.round((count * w) / 320); i++) {
      g.fillStyle = colors[Math.floor(r() * colors.length)];
      g.fillRect(Math.floor(r() * w), Math.floor(r() * h), size, size);
    }
    return c;
  }

  // ------------------------------------------------------------ a flight

  start(opts: FlightOptions, seed: number): void {
    this.clearAll();
    this.opts = opts;
    this.rand = mulberry32(seed);
    this.shield = opts.shieldMax;
    this.shipTex = [0, 1, 2].map((f) => this.cached(`ship-${opts.paint}-${f}-${opts.twin}`, () => paintShip(opts.paint, f, { twin: opts.twin })));
    this.ship = new Spr(this.shipTex[0], 1);
    this.scene.add(this.ship.mesh);
    this.shipX = (this.x0 + this.x1) / 2;
    this.ship.at(this.shipX, this.shipY);
    const wingTex = this.cached('supply-lit-0', () => paintSupply(true, 0));
    for (let i = 0; i < Math.min(6, opts.wingmen); i++) {
      const s = new Spr(i % 2 ? this.cached(`supply-lit-${i % 5}`, () => paintSupply(true, i % 5)) : wingTex, 0.9);
      this.scene.add(s.mesh);
      this.wingmen.push(s);
    }
    this.coreTex = [0, 1].map((f) => this.cached(`core-${f}`, () => paintStaticCore(f)));
    this.time = 0;
    this.fireT = 0;
    this.spawnT = 1;
    this.hurtT = 0;
    this.clearness = 0;
    this.running = true;
    this.paused = false;
  }

  stop(): void {
    this.running = false;
    this.clearAll();
  }

  private clearAll(): void {
    this.ship?.dispose();
    this.wingmen.forEach((w) => w.dispose());
    this.wingmen = [];
    this.pebbles.forEach((p) => p.s.dispose());
    this.pebbles = [];
    this.bolts.forEach((b) => b.s.dispose());
    this.bolts = [];
    this.clearRocks();
    this.clearSupplies();
    this.parts.forEach((p) => p.s.dispose());
    this.parts = [];
    this.core?.dispose();
    this.core = null;
    if (this.beam) this.scene.remove(this.beam.mesh);
    this.beam = null;
    this.pendingFire = null;
    this.steerTo = null;
  }

  private clearRocks(): void {
    this.rocks.forEach((r) => {
      r.s.dispose();
      r.label.remove();
    });
    this.rocks = [];
  }

  private clearSupplies(): void {
    this.supplies.forEach((s) => s.s.dispose());
    this.supplies = [];
    this.groupRings.forEach((m) => this.scene.remove(m));
    this.groupRings = [];
    if (this.splitLine) this.scene.remove(this.splitLine);
    this.splitLine = null;
  }

  // ------------------------------------------------------------ questions

  /** Three answer rocks fly in from the top and wait. `boss` puts the Static core behind them. */
  showRocks(choices: Choice[], boss = false): void {
    this.clearRocks();
    this.pendingFire = null;
    choices.forEach((c, i) => {
      const s = new Spr(this.cached(`rock-${i}`, () => paintAnswerRock(0, i * 3 + 1)), 0.5);
      this.scene.add(s.mesh);
      const label = h('button', { class: 'msq-rock', type: 'button', 'data-value': c.value, 'aria-label': `Rock ${i + 1}: ${c.label}` }, h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }), h('span', { class: 'msq-rock-text', text: c.label }));
      label.addEventListener('click', () => this.fireAt(i));
      this.layer.append(label);
      this.rocks.push({ s, label, slot: i, from: this.H + 30 + i * 14, t: 0, gone: false, nope: false });
    });
    if (boss && !this.core) {
      this.core = new Spr(this.coreTex[0], 0.2);
      this.scene.add(this.core.mesh);
    }
    this.layoutRocks();
  }

  get rocksReady(): boolean {
    return this.rocks.length > 0 && this.rocks.every((r) => r.t >= 1);
  }

  /** The supply ships the question is about fly in above the rocks, gray and powered down. */
  showPicture(pic: Picture): void {
    this.clearSupplies();
    if (!pic) return;
    const top = this.H - this.topReserve - 4;
    const bottom = this.H * ROCK_Y + 26;
    const cw = this.x1 - this.x0;
    const cx = (this.x0 + this.x1) / 2;
    // a big ship when there is room, a small one for big formations (never shrunk: shrinking smears the pixels)
    let small = false;
    const put = (x: number, y: number, hue: number) => {
      const s = new Spr(this.cached(`supply-gray-${small}`, () => paintSupply(false, 0, small)), 0.4);
      this.scene.add(s.mesh);
      this.supplies.push({ s, x, y, lit: false, hue, small, leaving: 0 });
      s.at(x, y + this.H * 0.5);
    };
    if (pic.kind === 'array' || pic.kind === 'split') {
      const gap = pic.kind === 'split' ? 8 : 0;
      const c = Math.max(12, Math.min(22, Math.floor((cw - 12 - gap) / pic.cols), Math.floor((top - bottom) / pic.rows)));
      small = c < 20;
      const w = pic.cols * c + gap;
      const yTop = Math.min(top, bottom + pic.rows * c + Math.floor((top - bottom - pic.rows * c) / 2));
      for (let r = 0; r < pic.rows; r++)
        for (let k = 0; k < pic.cols; k++) {
          const extra = pic.kind === 'split' && k >= pic.at ? gap : 0;
          put(cx - w / 2 + c * (k + 0.5) + extra, yTop - c * (r + 0.5), pic.kind === 'split' && k >= pic.at ? 2 : 0);
        }
      if (pic.kind === 'split') {
        const x = cx - w / 2 + c * pic.at + gap / 2;
        this.splitLine = new THREE.Mesh(new THREE.PlaneGeometry(2, pic.rows * c + 6), new THREE.MeshBasicMaterial({ color: '#7ff0ff', transparent: true, opacity: 0.85 }));
        this.splitLine.position.set(Math.round(x), Math.round(yTop - (pic.rows * c) / 2), 0.3);
        this.scene.add(this.splitLine);
      }
      return;
    }
    // equal groups: each group in its own glowing docking ring, up to 3 groups to a row
    const perRow = Math.min(3, pic.groups);
    const rowsOfGroups = Math.ceil(pic.groups / perRow);
    const inCols = pic.each <= 3 ? pic.each : Math.ceil(pic.each / 2);
    const inRows = Math.ceil(pic.each / inCols);
    const c = Math.max(13, Math.min(21, Math.floor((cw - 12) / (perRow * (inCols + 0.8))), Math.floor((top - bottom) / (rowsOfGroups * (inRows + 0.9)))));
    small = c < 20;
    const gw = (inCols + 0.5) * c;
    const gh = (inRows + 0.5) * c;
    const gapX = Math.max(4, Math.min(14, (cw - 8 - perRow * gw) / Math.max(1, perRow)));
    const blockH = rowsOfGroups * gh + (rowsOfGroups - 1) * 6;
    const yTop = top - Math.max(0, Math.floor((top - bottom - blockH) / 2));
    for (let g = 0; g < pic.groups; g++) {
      const row = Math.floor(g / perRow);
      const inRow = Math.min(perRow, pic.groups - row * perRow);
      const rowW = inRow * gw + (inRow - 1) * gapX;
      const gx = cx - rowW / 2 + (g % perRow) * (gw + gapX) + gw / 2;
      const gy = yTop - row * (gh + 6) - gh / 2;
      this.groupRings.push(this.ring(gx, gy, gw, gh));
      for (let k = 0; k < pic.each; k++) {
        const kc = k % inCols;
        const kr = Math.floor(k / inCols);
        const rowCount = Math.min(inCols, pic.each - kr * inCols);
        put(gx + (kc - (rowCount - 1) / 2) * c, gy + ((inRows - 1) / 2 - kr) * c, g % 5);
      }
    }
  }

  private ring(x: number, y: number, w: number, hgt: number): THREE.Mesh {
    const cv = document.createElement('canvas');
    cv.width = Math.round(w);
    cv.height = Math.round(hgt);
    const g = cv.getContext('2d')!;
    g.fillStyle = 'rgba(95,227,255,0.10)';
    g.fillRect(1, 1, cv.width - 2, cv.height - 2);
    g.fillStyle = '#5fe3ff';
    for (let i = 2; i < cv.width - 2; i += 2) {
      g.fillRect(i, 0, 1, 1);
      g.fillRect(i, cv.height - 1, 1, 1);
    }
    for (let i = 2; i < cv.height - 2; i += 2) {
      g.fillRect(0, i, 1, 1);
      g.fillRect(cv.width - 1, i, 1, 1);
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(cv.width, cv.height), new THREE.MeshBasicMaterial({ map: tex(cv), transparent: true, depthWrite: false }));
    m.position.set(Math.round(x) + (cv.width % 2) / 2, Math.round(y) + (cv.height % 2) / 2, 0.35);
    this.scene.add(m);
    return m;
  }

  /** Light the stranded ships in two colors (rung 2 of the hint for a split formation, or to show the groups). */
  tintPicture(): void {
    for (const s of this.supplies) s.s.setTex(this.cached(`supply-lit-${s.hue}-${s.small}`, () => paintSupply(true, s.hue, s.small)));
  }

  /** The beam hit the right rock: it bursts, the stranded ships light up and fly down to join the fleet. */
  win(index: number, keepPicture = false): void {
    const r = this.rocks[index];
    if (r) this.burst(r.s.x, r.s.y, ['#7ff0ff', '#ffd36a', '#ffffff', '#ff8fd0'], 26);
    this.rocks.forEach((rr) => {
      rr.gone = true;
      rr.label.remove();
      rr.s.mesh.visible = false;
    });
    if (!keepPicture) {
      this.supplies.forEach((s, i) => {
        s.lit = true;
        s.s.setTex(this.cached(`supply-lit-${s.hue}-${s.small}`, () => paintSupply(true, s.hue, s.small)));
        s.leaving = 0.6 + i * 0.012;
      });
      this.groupRings.forEach((m) => this.scene.remove(m));
      this.groupRings = [];
      if (this.splitLine) this.scene.remove(this.splitLine);
      this.splitLine = null;
    }
    if (this.core && !keepPicture) {
      this.burst(this.core.x, this.core.y, ['#e1dcff', '#a59fcf', '#ffffff', '#7ff0ff'], 60);
      this.core.dispose();
      this.core = null;
      this.shake = this.reducedMotion ? 0 : 0.4;
    }
  }

  /** The beam bounced off a wrong rock: the rock stays, crossed out. */
  miss(index: number): void {
    const r = this.rocks[index];
    if (!r) return;
    r.nope = true;
    r.label.classList.add('nope');
    r.label.disabled = true;
    this.burst(r.s.x, r.s.y - 14, ['#a59fcf', '#d7d4e8'], 8);
    this.shake = this.reducedMotion ? 0 : 0.15;
  }

  /** Rung 3 of the hint: outline the right rock. */
  outline(index: number): void {
    this.rocks[index]?.label.classList.add('worked');
  }

  /** Slide under rock `i` and fire the charge beam at it. */
  fireAt(i: number): void {
    const r = this.rocks[i];
    if (!this.running || this.paused || !r || r.gone || r.nope || !this.rocksReady || this.beam) return;
    this.pendingFire = i;
    this.steerTo = this.slotX(i);
  }

  /** Space: fire the beam at the rock above the ship, if there is one. */
  fireAbove(): void {
    const i = this.rocks.findIndex((r) => !r.gone && Math.abs(this.slotX(r.slot) - this.shipX) < r.s.w / 2);
    if (i >= 0) this.fireAt(i);
    else this.onEvent?.({ type: 'empty' });
  }

  /** Steer toward a point (a tap or a drag on the field). */
  steer(x: number | null): void {
    this.steerTo = x === null ? null : Math.max(this.x0 + 14, Math.min(this.x1 - 14, x));
  }

  private pointer(e: PointerEvent, down: boolean): void {
    if (!this.running || this.paused) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * this.W;
    if (down) this.pendingFire = null;
    this.steer(x);
  }

  private layoutRocks(): void {
    for (const r of this.rocks) {
      const c = this.toCss(this.slotX(r.slot), r.s.y || this.H);
      const w = (r.s.w * this.scale) / this.dpr;
      const hh = (r.s.h * this.scale) / this.dpr;
      Object.assign(r.label.style, { left: `${c.x}px`, top: `${c.y}px`, width: `${Math.max(64, w)}px`, height: `${Math.max(44, hh)}px` });
    }
  }

  // ------------------------------------------------------------ effects

  private burst(x: number, y: number, colors: string[], n: number): void {
    const count = this.reducedMotion ? Math.ceil(n / 3) : n;
    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      const s = new Spr(this.cached(`spark-${color}-${i % 2 ? 2 : 3}`, () => paintSpark(color, i % 2 ? 2 : 3)), 2);
      this.scene.add(s.mesh);
      const a = this.rand() * Math.PI * 2;
      const v = 30 + this.rand() * 70;
      s.at(x, y);
      this.parts.push({ s, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 0.45 + this.rand() * 0.4 });
    }
  }

  // ------------------------------------------------------------ the frame

  update(dt: number, steerX: number): void {
    if (!this.running) return;
    const realDt = dt;
    if (this.paused) dt = 0;
    this.time += dt;
    // the backdrop scrolls (slower with reduced motion)
    const m = this.reducedMotion ? 0.3 : 1;
    for (const s of this.stars) s.tex.offset.y = (s.tex.offset.y + (dt * s.speed * m) / 256) % 1;
    (this.haze.material as THREE.MeshBasicMaterial).opacity = 0.38 * (1 - this.clearness);

    // steering: keys move the ship, a tap or drag sets a point to fly to, a rock pick slides it under the rock
    // a picked rock: the ship slides under it quickly (at most about half a second)
    const speed = (this.opts.thrusters ? 230 : 170) * (this.pendingFire !== null ? 2.4 : 1);
    if (steerX && !this.paused) {
      this.steerTo = null;
      this.pendingFire = null;
      this.shipX += steerX * speed * dt;
    } else if (this.steerTo !== null) {
      const d = this.steerTo - this.shipX;
      const step = speed * dt;
      if (Math.abs(d) <= step) {
        this.shipX = this.steerTo;
        this.steerTo = null;
      } else this.shipX += Math.sign(d) * step;
    }
    this.shipX = Math.max(this.x0 + 14, Math.min(this.x1 - 14, this.shipX));
    // the charge beam fires once the ship is under the picked rock
    if (this.pendingFire !== null && this.steerTo === null && !this.beam && !this.paused) {
      const i = this.pendingFire;
      this.pendingFire = null;
      const r = this.rocks[i];
      if (r && !r.gone && !r.nope) {
        const top = r.s.y - r.s.h / 2;
        const len = Math.max(4, top - (this.shipY + 18));
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5, len), new THREE.MeshBasicMaterial({ color: '#bff6ff', transparent: true, opacity: 0.95 }));
        mesh.position.set(Math.round(this.shipX) + 0.5, this.shipY + 18 + len / 2, 1.5);
        this.scene.add(mesh);
        this.beam = { mesh, t: 0, index: i, fired: false };
      }
    }
    if (this.beam) {
      this.beam.t += realDt;
      (this.beam.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.95 - this.beam.t * 3);
      this.beam.mesh.scale.x = 1 + Math.sin(this.beam.t * 40) * 0.3;
      if (!this.beam.fired && this.beam.t > 0.08) {
        this.beam.fired = true;
        this.onEvent?.({ type: 'hit', index: this.beam.index });
      }
      if (this.beam.t > 0.32) {
        this.scene.remove(this.beam.mesh);
        this.beam = null;
      }
    }

    // ship and wingmen
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.ship.setTex(this.shipTex[Math.floor(this.time * 12) % 3]);
    this.ship.mesh.visible = this.hurtT <= 0 || Math.floor(this.hurtT * 12) % 2 === 0;
    const sh = this.shake > 0 ? Math.round((this.rand() - 0.5) * 4 * this.shake * 4) : 0;
    this.shake = Math.max(0, this.shake - realDt);
    this.ship.at(this.shipX + sh, this.shipY);
    this.wingmen.forEach((w, i) => {
      const side = i % 2 ? 1 : -1;
      const rank = Math.floor(i / 2) + 1;
      w.at(this.shipX + side * (14 + rank * 9), this.shipY - 6 - rank * 7 + Math.round(Math.sin(this.time * 3 + i) * 1.2));
    });

    // the blaster fires on its own
    this.fireT -= dt;
    if (this.fireT <= 0 && !this.paused) {
      this.fireT = this.opts.rapid ? 0.2 : 0.32;
      const xs = this.opts.twin ? [-9, 9] : [0];
      for (const ox of xs) {
        const s = new Spr(this.cached('bolt', () => paintSpark('#7ff0ff', 2)), 1.2);
        s.mesh.scale.set(1, 3, 1);
        s.at(this.shipX + ox, this.shipY + 20);
        this.scene.add(s.mesh);
        this.bolts.push({ s });
      }
    }
    for (const b of this.bolts) b.s.at(b.s.x, b.s.y + 260 * dt);
    // bolts stop at an answer rock (a tiny "tink": only the beam can break those)
    for (const b of this.bolts) {
      for (const r of this.rocks)
        if (!r.gone && Math.abs(b.s.x - r.s.x) < r.s.w / 2 - 2 && Math.abs(b.s.y - r.s.y) < r.s.h / 2) {
          b.s.y = this.H + 99;
          if (this.rand() < 0.4) this.burst(b.s.x, r.s.y - r.s.h / 2, ['#7ff0ff'], 1);
        }
    }

    // Static pebbles drift down (calmer while a new question is waiting)
    this.spawnT -= dt;
    const calm = this.rocks.length && !this.rocksReady ? 0.5 : 1;
    if (this.spawnT <= 0 && !this.paused) {
      this.spawnT = (1.25 / this.intensity) * (this.reducedMotion ? 1.4 : 1) * (0.7 + this.rand() * 0.6);
      const shape = Math.floor(this.rand() * 3);
      const s = new Spr(this.cached(`pebble-${shape}-0`, () => paintPebble(shape, 0)), 0.8);
      this.scene.add(s.mesh);
      s.at(this.x0 + 12 + this.rand() * (this.x1 - this.x0 - 24), this.H + 12);
      this.pebbles.push({ s, vy: -(28 + this.rand() * 26) * this.intensity, vx: (this.rand() - 0.5) * 14, r: s.w / 2 - 1, shape, t: this.rand() * 4 });
    }
    const slow = this.reducedMotion ? 0.65 : 1;
    for (const p of this.pebbles) {
      p.t += dt;
      p.s.at(Math.max(this.x0 + 8, Math.min(this.x1 - 8, p.s.x + p.vx * dt)), p.s.y + p.vy * dt * calm * slow);
      p.s.setTex(this.cached(`pebble-${p.shape}-${Math.floor(p.t * 6) % 2}`, () => paintPebble(p.shape, Math.floor(p.t * 6) % 2)));
    }
    // blaster hits
    for (const b of this.bolts)
      for (const p of this.pebbles)
        if (p.s.y < this.H + 50 && Math.abs(b.s.x - p.s.x) < p.r + 2 && Math.abs(b.s.y - p.s.y) < p.r + 4) {
          b.s.y = this.H + 99;
          this.burstAt(p);
          p.s.y = -99;
          this.onEvent?.({ type: 'pebble' });
        }
    // bumps
    for (const p of this.pebbles)
      if (p.s.y > 0 && this.hurtT <= 0 && Math.abs(p.s.x - this.shipX) < p.r + 9 && Math.abs(p.s.y - this.shipY) < p.r + 12) {
        this.burstAt(p);
        p.s.y = -99;
        this.shield = Math.max(0, this.shield - 1);
        this.hurtT = 1.6;
        this.shake = this.reducedMotion ? 0 : 0.35;
        this.onEvent?.({ type: 'bump', shield: this.shield });
      }
    this.bolts = this.bolts.filter((b) => (b.s.y > this.H + 20 ? (b.s.dispose(), false) : true));
    this.pebbles = this.pebbles.filter((p) => (p.s.y < -20 ? (p.s.dispose(), false) : true));

    // answer rocks fly in and bob
    let arrivedNow = false;
    for (const r of this.rocks) {
      const was = r.t;
      r.t = Math.min(1, r.t + dt / 1.1);
      if (was < 1 && r.t >= 1) arrivedNow = true;
      const e = 1 - (1 - r.t) ** 3;
      const target = this.H * ROCK_Y;
      const bob = this.reducedMotion ? 0 : Math.round(Math.sin(this.time * 2 + r.slot) * 2);
      r.s.at(this.slotX(r.slot), r.from + (target - r.from) * e + bob);
      r.s.setTex(this.cached(`rock-${r.slot}-${Math.floor(this.time * 4) % 2}`, () => paintAnswerRock(Math.floor(this.time * 4) % 2, r.slot * 3 + 1)));
      if (r.nope) r.s.mesh.visible = true;
    }
    if (arrivedNow && this.rocksReady) this.onEvent?.({ type: 'arrived' });
    this.layoutRocks();
    if (this.core) {
      this.core.setTex(this.coreTex[Math.floor(this.time * 3) % 2]);
      // the core sits behind the row of answer rocks (they are pieces of it)
      this.core.at((this.x0 + this.x1) / 2, this.H * ROCK_Y + (this.reducedMotion ? 0 : Math.round(Math.sin(this.time) * 2)));
    }

    // stranded ships drift into place; once lit they fly down to the fleet
    for (const s of this.supplies) {
      if (s.leaving > 0) {
        s.leaving -= dt;
        if (s.leaving <= 0) {
          s.s.mesh.visible = false;
          continue;
        }
        const k = Math.min(1, dt * 5);
        s.s.at(s.s.x + (this.shipX - s.s.x) * k * 0.6, s.s.y + (this.shipY - s.s.y) * k * (s.leaving < 0.35 ? 1 : 0.15));
      } else s.s.at(s.x, s.s.y + (s.y - s.s.y) * Math.min(1, dt * 4));
    }
    this.supplies = this.supplies.filter((s) => (s.leaving < 0 || (s.lit && !s.s.mesh.visible) ? (s.s.dispose(), false) : true));

    // sparkles
    for (const p of this.parts) {
      p.life += realDt;
      p.vy -= 40 * realDt;
      p.s.at(p.s.x + p.vx * realDt, p.s.y + p.vy * realDt);
      p.s.mat.opacity = Math.max(0, 1 - p.life / p.max);
    }
    this.parts = this.parts.filter((p) => (p.life >= p.max ? (p.s.dispose(), false) : true));
  }

  private burstAt(p: Pebble): void {
    this.burst(p.s.x, p.s.y, ['#e1dcff', '#ffd36a', '#7ff0ff', '#ff8fd0'], 10);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /** For tests and the tour: where things are. */
  debug() {
    return {
      shipX: this.shipX,
      x0: this.x0,
      x1: this.x1,
      W: this.W,
      H: this.H,
      shield: this.shield,
      pebbles: this.pebbles.length,
      rocks: this.rocks.map((r) => ({ x: this.slotX(r.slot), y: r.s.y, nope: r.nope, gone: r.gone })),
      ready: this.rocksReady,
      supplies: this.supplies.length,
      paused: this.paused,
    };
  }
}
