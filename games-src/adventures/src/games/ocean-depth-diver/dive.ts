import type { PixelBuffer } from '../../kit/art/pixel';
import { iconImg } from '../../kit/art/icons';
import { h } from '../../kit/ui/dom';
import { hash } from '../../kit/worlds/shade';
import { paintFinn, paintSub } from '../../kit/worlds/wild-lands/art';
import { oceanRock, paintOcean, sunlightAt } from '../../kit/worlds/wild-lands/ocean';
import { ANIMALS, ANIMALS_IN, dials, TRENCH_FLOOR, VENT_FLOOR, type AnimalId } from './animals';
import { paintAnimal, paintAtolla, paintPlanktonCloud, paintVentChimney } from './art';
import type { Station } from './problems';

/**
 * A dive in the Little Nautilus (side view). The child steers the sub in
 * every direction (arrow keys or WASD, or by holding a finger or the mouse
 * where it should go). The sea is the Wild Lands ocean painter, painted once
 * in tiles at a fixed scale so it scrolls smoothly; the animals, the
 * headlamp, the living light and the marine snow are drawn on top each frame.
 *
 * Finn takes photos: steer close to an animal and press Space (or tap it).
 * Finn's sonar arrow points to the next animal still to find. Below the
 * sunlight, things fade into the dark unless the headlamp or their own
 * living light shows them.
 *
 * The twilight dive ends with the night trip: after dusk up top, a school of
 * lanternfish swims up to feed, and the child follows them all the way.
 * The midnight dive goes down past 2,000 meters into the dark. The sea floor
 * dive ends on the bottom at the hot vents, where Finn also takes a sample
 * of the vent water. The Trench Dive (the finale) goes all the way down a
 * trench to about 10,900 meters, stopping at checkpoints for questions.
 */

/** Where a dive goes: one of the four expeditions, or the Trench Dive. */
export type DiveZone = Station | 'trench';

/** The Trench Dive's checkpoints (meters): the bottom of each zone, then the trench floor. */
export const CHECKPOINTS = [200, 1000, 4000, 6000, TRENCH_FLOOR - 70];
const FLOORS: Record<DiveZone, number> = { sunlight: 190, twilight: 980, midnight: 2400, vents: VENT_FLOOR, trench: TRENCH_FLOOR };

const VW = 320;
const VH = 180;
/** Meters from the top to the bottom of a 180-pixel-tall view. The scale is fixed (pixels per meter), so the tiles fit together; a tall phone screen just sees more of the sea. */
const SPAN = 64;
const PPM = VH / SPAN;
const TILE_M = SPAN / 2;
const PHOTO_R = 46;

interface Critter {
  id: AnimalId;
  /** Home position: x in screen pixels (0 to W), depth in meters. */
  x0: number;
  m: number;
  /** How far it wanders sideways (pixels), and how fast. */
  range: number;
  speed: number;
  phase: number;
  /** Where it is now. */
  x: number;
  face: 1 | -1;
  frames: HTMLCanvasElement[];
  glow: string | null;
  /** Where the glow is, as a share of the sprite's size from its middle (facing right). */
  glowAt: [number, number];
  done: boolean;
}

interface Ambient {
  kind: 'school' | 'lantern' | 'jelly' | 'spark';
  x: number;
  m: number;
  phase: number;
}

export interface DiveState {
  depth: number;
  x: number;
  photos: AnimalId[];
  chase: { on: boolean; m: number; x: number; progress: number; near: boolean } | null;
  /** The sea floor dive: has Finn taken the vent water sample? */
  sample: boolean;
  /** The Trench Dive: how many checkpoints are passed. */
  checkpoint: number;
  paused: boolean;
}

export class OceanDive {
  readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private readonly dialsEl: HTMLElement;
  private readonly promptEl: HTMLButtonElement;
  private readonly sonarEl: HTMLElement;
  private W = VW;
  private H = VH;
  private scale = 2;
  private readonly ppm = PPM;
  private tiles = new Map<number, HTMLCanvasElement>();
  private rock: ReturnType<typeof oceanRock>;
  private t = 0;
  private sub = { x: VW * 0.6, m: 3, face: 1 as 1 | -1, vx: 0, vm: 0 };
  private cam = 0;
  private keys = { left: false, right: false, up: false, down: false };
  private pointer: { x: number; y: number } | null = null;
  private critters: Critter[] = [];
  private ambient: Ambient[] = [];
  private snow: Array<{ x: number; m: number; v: number }> = [];
  private subFrames: Record<string, HTMLCanvasElement[]> = {};
  private finnFrames: Record<string, HTMLCanvasElement[]> = {};
  private lanternFrames: HTMLCanvasElement[] = [];
  private schoolFrames: HTMLCanvasElement[] = [];
  private flash = 0;
  private raf = 0;
  private last = performance.now();
  private near: Critter | null = null;
  /** The sea floor dive: the hot water sample (near the top of the big chimney). */
  private sampleSpot: { x: number; m: number } | null = null;
  private sampleTaken = false;
  private nearSample = false;
  private chimneys: Array<{ x: number; m: number; frames: HTMLCanvasElement[] }> = [];
  /** The Trench Dive: the next checkpoint. */
  private nextCp = 0;
  /** The night trip: the school's depth, how much of the way the child has kept up, and whether the sub is close now. */
  private chaseState: { on: boolean; m: number; x: number; progress: number; near: boolean; wait: number } | null = null;
  paused = false;
  reducedMotion = false;
  /** The deepest the sub can go on this dive (meters). */
  readonly floor: number;
  onPhoto: ((id: AnimalId) => void) | null = null;
  /** Every photo is taken (the game then tells the child what comes next). */
  onAllPhotos: (() => void) | null = null;
  /** The sub is back at the top after the work is done. */
  onSurface: (() => void) | null = null;
  /** The night trip is finished. */
  onChaseDone: (() => void) | null = null;
  /** The vent water sample is taken. */
  onSample: (() => void) | null = null;
  /** The Trench Dive reached a checkpoint (its index in CHECKPOINTS). */
  onCheckpoint: ((i: number) => void) | null = null;
  private readonly onKey: (e: KeyboardEvent) => void;
  private allPhotosSaid = false;

  constructor(
    host: HTMLElement,
    readonly zone: DiveZone,
    have: AnimalId[] = [],
    before: Element | null = null,
  ) {
    this.floor = FLOORS[zone];
    this.rock = oceanRock(VW, { floor: this.seaFloor, trench: zone === 'trench' });
    this.canvas = h('canvas', { class: 'odd-dive-canvas', 'aria-label': 'The view from the submarine' }) as HTMLCanvasElement;
    this.dialsEl = h('div', { class: 'odd-dials panel', role: 'status' });
    this.promptEl = h('button', { class: 'panel prompt odd-photo', type: 'button', hidden: true, onclick: () => this.photo() }) as HTMLButtonElement;
    this.sonarEl = h('div', { class: 'odd-sonar', 'aria-hidden': 'true', hidden: true });
    this.root = h('div', { class: 'odd-dive' }, this.canvas, this.sonarEl, this.dialsEl, this.promptEl);
    host.insertBefore(this.root, before);
    this.g = this.canvas.getContext('2d')!;
    const cv = (b: PixelBuffer) => b.toCanvas();
    for (const face of ['left', 'right'] as const) for (const lamp of [false, true]) this.subFrames[`${face}${lamp}`] = [0, 1, 2].map((f) => cv(paintSub(16, face, f, lamp)));
    for (const face of ['left', 'right'] as const) this.finnFrames[face] = [0, 1, 2].map((f) => cv(paintFinn(12, face, f)));
    this.lanternFrames = [0, 1].map((f) => cv(paintAnimal('lanternfish', 1.2, f)));
    this.schoolFrames = this.lanternFrames;
    this.makeCritters(have);
    this.onKey = (e) => {
      const k = e.key.toLowerCase();
      const down = e.type === 'keydown';
      if (k === 'arrowleft' || k === 'a') this.keys.left = down;
      else if (k === 'arrowright' || k === 'd') this.keys.right = down;
      else if (k === 'arrowup' || k === 'w') this.keys.up = down;
      else if (k === 'arrowdown' || k === 's') this.keys.down = down;
      else if ((k === ' ' || k === 'enter') && down) {
        if (this.paused || document.querySelector('.modal-back')) return;
        if (this.near || this.nearSample) {
          e.preventDefault();
          this.photo();
        }
        return;
      } else return;
      if (!this.paused) e.preventDefault();
    };
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKey);
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.canvas.addEventListener('pointermove', (e) => this.pointer && this.setPointer(e));
    const up = () => (this.pointer = null);
    this.canvas.addEventListener('pointerup', up);
    this.canvas.addEventListener('pointerleave', up);
    this.canvas.addEventListener('pointercancel', up);
    this.resize();
    this.loop();
  }

  // ------------------------------------------------------------ the animals

  private makeCritters(have: AnimalId[]): void {
    const W = VW;
    const shelf = (fx: number) => this.rock.shelfFloor(fx * W);
    const bed = (fx: number) => this.rock.floorAt(fx * W);
    type Place = { x: number; m: number; range: number; speed: number; glow: string | null; s: number; glowAt?: [number, number] };
    const place: Record<AnimalId, Place> = {
      plankton: { x: 0.7, m: 12, range: 10, speed: 0.4, glow: null, s: 0.8 },
      turtle: { x: 0.55, m: 9, range: 90, speed: 0.25, glow: null, s: 1.2 },
      seagrass: { x: 0.08, m: shelf(0.08) + 0.5, range: 0, speed: 0, glow: null, s: 1.1 },
      clownfish: { x: 0.26, m: shelf(0.26) - 2.4, range: 6, speed: 1.2, glow: null, s: 1.2 },
      octopus: { x: 0.37, m: shelf(0.37) + 0.3, range: 3, speed: 0.6, glow: null, s: 1.1 },
      ray: { x: 0.72, m: 52, range: 70, speed: 0.3, glow: null, s: 1.2 },
      combjelly: { x: 0.7, m: 320, range: 30, speed: 0.2, glow: '#c8a8ff', s: 1.6 },
      lanternfish: { x: 0.45, m: 450, range: 80, speed: 0.35, glow: '#7ff0ff', s: 1.6 },
      hatchetfish: { x: 0.68, m: 600, range: 50, speed: 0.3, glow: '#9ff4ff', s: 1.6 },
      atolla: { x: 0.3, m: 1300, range: 24, speed: 0.15, glow: null, s: 1.6 },
      anglerfish: { x: 0.7, m: 1800, range: 40, speed: 0.2, glow: '#d8ff8a', s: 1.4, glowAt: [0.28, -0.39] },
      gulpereel: { x: 0.45, m: 2250, range: 60, speed: 0.25, glow: '#ff8ab0', s: 1.2, glowAt: [-0.46, 0] },
      // the vent animals live round the big chimney (its middle is at 0.7 of the width)
      ventshrimp: { x: 0.7 + 9 / W, m: bed(0.7) - 15, range: 0, speed: 0, glow: null, s: 1.2 },
      tubeworm: { x: 0.56, m: bed(0.56) - 6.4, range: 0, speed: 0, glow: null, s: 1.4 },
      yeticrab: { x: 0.84, m: bed(0.84) - 2.6, range: 8, speed: 0.4, glow: null, s: 1.3 },
      snailfish: { x: 0.55, m: 8300, range: 22, speed: 0.2, glow: null, s: 1.4 },
    };
    for (const id of ANIMALS_IN[this.zone]) {
      const p = place[id];
      this.critters.push({
        id,
        x0: p.x * W,
        m: p.m,
        range: p.range,
        speed: p.speed,
        phase: hash(id.length, 3, 7) * 6,
        x: p.x * W,
        face: 1,
        frames: [0, 1, 2].map((f) => (id === 'plankton' ? paintPlanktonCloud(f) : paintAnimal(id, p.s, f)).toCanvas()),
        glow: p.glow,
        glowAt: p.glowAt ?? [0, 0],
        done: have.includes(id),
      });
    }
    // the hot vents: two chimneys on the sea floor, and the water sample at the top of the big one
    if (this.zone === 'vents') {
      for (const [fx, sc] of [
        [0.7, 2],
        [0.36, 1.4],
      ] as const) {
        const frames = Array.from({ length: 8 }, (_, f) => paintVentChimney(sc, f).toCanvas());
        this.chimneys.push({ x: fx * W, m: bed(fx) + 1, frames });
      }
      const big = this.chimneys[0];
      this.sampleSpot = { x: big.x, m: big.m - ((44 - 18) * 2) / this.ppm - 4 };
    }
    // fish and lights that are just there to see
    if (this.zone === 'sunlight' || this.zone === 'trench') this.ambient.push({ kind: 'school', x: W * 0.4, m: 18, phase: 0 }, { kind: 'school', x: W * 0.8, m: 70, phase: 2 });
    for (const [m, x] of [
      [380, 0.3],
      [520, 0.8],
      [700, 0.35],
      [820, 0.75],
      [930, 0.5],
    ])
      if (this.zone !== 'sunlight') this.ambient.push({ kind: 'lantern', x: W * x, m, phase: m });
    if (this.zone !== 'sunlight') this.ambient.push({ kind: 'jelly', x: W * 0.25, m: 760, phase: 1 });
    // flashes of living light in the dark below 1,000 meters
    if (this.zone !== 'sunlight' && this.zone !== 'twilight')
      for (let i = 0; i < 40; i++) {
        const m = 1050 + hash(i, 1, 33) * (Math.min(this.floor, 9000) - 1100);
        this.ambient.push({ kind: 'spark', x: W * hash(i, 2, 33), m, phase: hash(i, 3, 33) * 10 });
      }
    for (let i = 0; i < 70; i++) this.snow.push({ x: hash(i, 1, 21) * W, m: 150 + hash(i, 2, 21) * 70, v: 0.6 + hash(i, 3, 21) * 0.8 });
  }

  // ------------------------------------------------------------ input and size

  private toScreen(e: PointerEvent): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * this.W, y: ((e.clientY - r.top) / r.height) * this.H };
  }

  private setPointer(e: PointerEvent): void {
    this.pointer = this.toScreen(e);
  }

  private onPointerDown(e: PointerEvent): void {
    if (this.paused) return;
    const p = this.toScreen(e);
    // a tap on the animal Finn can photograph (or the vent water) takes the photo
    if (this.nearSample && this.sampleSpot && Math.hypot(p.x - this.sampleSpot.x, p.y - this.rowOf(this.sampleSpot.m)) < 30) {
      this.photo();
      return;
    }
    if (this.near) {
      const sx = this.near.x;
      const sy = this.rowOf(this.near.m);
      if (Math.hypot(p.x - sx, p.y - sy) < 26) {
        this.photo();
        return;
      }
    }
    this.pointer = p;
  }

  resize(): void {
    const w = this.root.clientWidth || window.innerWidth;
    const hh = this.root.clientHeight || window.innerHeight;
    // the sea is always VW pixels wide, stretched to the screen's width; a taller screen sees more of the sea
    this.W = VW;
    this.scale = w / VW;
    this.H = Math.max(VH / 2, Math.ceil(hh / this.scale));
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${this.H * this.scale}px`;
    this.g.imageSmoothingEnabled = false;
  }

  // ------------------------------------------------------------ the sea tiles

  private tile(i: number): HTMLCanvasElement | null {
    let t = this.tiles.get(i);
    if (t) return t;
    const th = Math.round(TILE_M * this.ppm);
    t = paintOcean(this.W, th, { depth: (i + 0.5) * TILE_M, span: TILE_M, noAnimals: true, noSnow: true, frame: 0, floor: this.seaFloor, trench: this.zone === 'trench' }).toCanvas();
    this.tiles.set(i, t);
    return t;
  }

  /** The rock floor under this dive, if it has one (the hot vents, the trench). */
  private get seaFloor(): number | undefined {
    return this.zone === 'vents' ? VENT_FLOOR : this.zone === 'trench' ? TRENCH_FLOOR : undefined;
  }

  /** The screen row of a depth (meters). */
  private rowOf(m: number): number {
    return (m - this.cam) * this.ppm;
  }

  // ------------------------------------------------------------ public state

  get state(): DiveState {
    const c = this.chaseState;
    return {
      depth: Math.round(this.sub.m),
      x: Math.round(this.sub.x),
      photos: this.critters.filter((k) => k.done).map((k) => k.id),
      chase: c ? { on: c.on, m: Math.round(c.m), x: Math.round(c.x), progress: Math.round(c.progress * 100) / 100, near: c.near } : null,
      sample: this.sampleTaken,
      checkpoint: this.nextCp,
      paused: this.paused,
    };
  }

  /** Where an animal is on the screen (for tests): null if it is already photographed. */
  critterAt(id: AnimalId): { x: number; m: number } | null {
    const k = this.critters.find((c) => c.id === id && !c.done);
    return k ? { x: k.x, m: k.m } : null;
  }

  /** Where the vent water sample is (for tests): null if there is none, or it is taken. */
  sampleAt(): { x: number; m: number } | null {
    return this.sampleSpot && !this.sampleTaken ? { ...this.sampleSpot } : null;
  }

  /** Test helper: move the sub straight to a spot. */
  teleport(x: number, m: number): void {
    this.sub.x = Math.max(16, Math.min(this.W - 16, x));
    this.sub.m = Math.max(2, Math.min(this.floor, m));
    this.cam = Math.max(this.camTop, this.sub.m - (this.H / this.ppm) * 0.45);
  }

  /** How far above the surface the camera may look: a little sky on a wide screen; on a tall phone, enough to keep the sub below the bars at the top. */
  private get camTop(): number {
    return -(this.H > 300 ? this.H * 0.3 : 17) / this.ppm;
  }

  /** Every photo is taken (and, at the hot vents, the water sample too). */
  get allPhotos(): boolean {
    return this.critters.every((c) => c.done) && (!this.sampleSpot || this.sampleTaken);
  }

  resume(): void {
    this.paused = false;
    this.last = performance.now();
    this.keys = { left: false, right: false, up: false, down: false };
  }

  /** Start the night trip: dusk falls up top and the lanternfish swim up to feed. */
  startChase(): void {
    this.chaseState = { on: true, m: Math.max(600, this.sub.m + 20), x: this.sub.x, progress: 0, near: false, wait: 0 };
    this.allPhotosSaid = true;
  }

  // ------------------------------------------------------------ the loop

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
    const s = this.sub;
    // steering: keys, or toward the finger or mouse
    let ax = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    let am = (this.keys.down ? 1 : 0) - (this.keys.up ? 1 : 0);
    if (this.pointer) {
      const dx = this.pointer.x - s.x;
      const dy = this.pointer.y - this.rowOf(s.m);
      if (Math.abs(dx) > 4) ax = Math.sign(dx);
      if (Math.abs(dy) > 4) am = Math.sign(dy);
    }
    // the sub sinks and climbs faster the deeper it is, so the long trip down does not take forever
    // (with a top speed, and slower close to an animal still to photograph, so nobody shoots past it)
    let vSpeed = Math.min(250, 14 * (1 + s.m / 250));
    if (this.critters.some((c) => !c.done && Math.abs(c.m - s.m) < 120)) vSpeed = Math.min(vSpeed, 45);
    const hSpeed = 70;
    s.vx += (ax * hSpeed - s.vx) * Math.min(1, dt * 4);
    s.vm += (am * vSpeed - s.vm) * Math.min(1, dt * 4);
    if (ax) s.face = ax > 0 ? 1 : -1;
    // in the trench, a gentle current keeps the sub away from the walls when it is not steering sideways
    if (this.zone === 'trench' && s.m > 5600 && !ax) s.vx += (this.W * 0.55 - s.x) * Math.min(1, dt * 1.5);
    let nx = Math.max(16, Math.min(this.W - 16, s.x + s.vx * dt));
    let nm = Math.max(2, Math.min(this.floor, s.m + s.vm * dt));
    // the sub cannot go into the rock: try the move, then each half of it
    const bottom = 12 / this.ppm;
    const free = (x: number, m: number) =>
      !this.rock.isRock(x + 16, m) && !this.rock.isRock(x - 16, m) && !this.rock.isRock(x, m + bottom) && !this.rock.isRock(x + 12, m + bottom) && !this.rock.isRock(x - 12, m + bottom);
    if (!free(nx, nm)) {
      if (free(nx, s.m)) nm = s.m;
      else if (free(s.x, nm)) nx = s.x;
      else {
        nx = s.x;
        nm = s.m;
      }
    }
    s.x = nx;
    s.m = nm;
    // the camera keeps the sub a little above the middle
    let goal = Math.max(this.camTop, s.m - (this.H / this.ppm) * 0.45);
    // over a sea floor, a tall phone screen should not fill up with rock: keep the floor near the bottom of the view
    if (this.seaFloor !== undefined) goal = Math.max(this.camTop, Math.min(goal, this.seaFloor + 30 - this.H / this.ppm));
    this.cam += (goal - this.cam) * (this.reducedMotion ? 1 : Math.min(1, dt * 5));
    // the animals wander
    for (const c of this.critters) {
      if (!c.range) continue;
      const nxp = c.x0 + Math.sin(this.t * c.speed + c.phase) * c.range;
      if (Math.abs(nxp - c.x) > 0.01) c.face = nxp > c.x ? 1 : -1;
      c.x = nxp;
    }
    // the snow drifts down past the sub; flakes that leave the view come back in at the other side
    const viewM = this.H / this.ppm;
    for (const sn of this.snow) {
      sn.m += sn.v * dt * 2;
      if (sn.m > this.cam + viewM + 4) sn.m -= viewM + 8;
      else if (sn.m < this.cam - 4) sn.m += viewM + 8;
    }
    // which animal is close enough for a photo?
    let best: Critter | null = null;
    let bd = PHOTO_R;
    for (const c of this.critters) {
      if (c.done) continue;
      const d = Math.hypot(c.x - s.x, (c.m - s.m) * this.ppm);
      if (d < bd) {
        bd = d;
        best = c;
      }
    }
    this.near = best;
    this.nearSample = false;
    if (this.sampleSpot && !this.sampleTaken && Math.hypot(this.sampleSpot.x - s.x, (this.sampleSpot.m - s.m) * this.ppm) < Math.min(bd, PHOTO_R)) {
      this.near = null;
      this.nearSample = true;
    }
    this.flash = Math.max(0, this.flash - dt * 4);
    // the night trip
    const ch = this.chaseState;
    if (ch && ch.on) {
      const d = Math.hypot(ch.x - s.x, (ch.m - s.m) * this.ppm);
      ch.near = d < 60;
      if (ch.near) {
        ch.wait = 0;
        ch.m -= 18 * (1 + ch.m / 300) * dt;
      } else {
        // the school waits a moment if the sub falls behind, then drifts slowly on
        ch.wait += dt;
        if (ch.wait > 3) ch.m -= 4 * dt;
      }
      ch.x += (this.W * 0.5 + Math.sin(this.t * 0.6) * this.W * 0.25 - ch.x) * Math.min(1, dt * 0.8);
      const start = 600;
      const end = 60;
      ch.progress = Math.max(0, Math.min(1, (start - ch.m) / (start - end)));
      if (ch.m <= end) {
        ch.on = false;
        this.paused = true;
        this.onChaseDone?.();
        return;
      }
    }
    // the Trench Dive's checkpoints (the last one, on the bottom, waits for the snailfish photo)
    if (this.zone === 'trench' && this.nextCp < CHECKPOINTS.length) {
      const last = this.nextCp === CHECKPOINTS.length - 1;
      if (s.m >= CHECKPOINTS[this.nextCp] - (last ? 12 : 0) && (!last || this.allPhotos)) {
        this.paused = true;
        this.onCheckpoint?.(this.nextCp++);
        return;
      }
    }
    if (this.zone !== 'trench' && !this.allPhotosSaid && this.allPhotos) {
      this.allPhotosSaid = true;
      this.paused = true;
      this.onAllPhotos?.();
      return;
    }
    if (this.zone === 'sunlight' && this.allPhotosSaid && this.allPhotos && s.m <= 3) {
      this.paused = true;
      this.onSurface?.();
    }
  }

  /** Finn takes the photo of the animal close by. */
  photo(): void {
    if (this.nearSample && !this.paused) {
      this.sampleTaken = true;
      this.nearSample = false;
      this.flash = 0.5;
      this.paused = true;
      this.onSample?.();
      return;
    }
    const c = this.near;
    if (!c || this.paused) return;
    c.done = true;
    // the atolla jelly's burglar alarm: its ring of blue lights flashes
    if (c.id === 'atolla') {
      c.frames = [0, 1, 0].map((f) => paintAtolla(1.6, f, true).toCanvas());
      c.glow = '#7ad8ff';
    }
    this.near = null;
    this.flash = 1;
    this.paused = true;
    this.onPhoto?.(c.id);
  }

  /** The light at a spot (0 dark to 1 fully lit): sunlight from above, or the headlamp. */
  private lightAt(x: number, m: number): number {
    const night = !!this.chaseState?.on;
    let amb = Math.min(1, sunlightAt(m) * 1.6);
    if (night && m < 200) amb = Math.min(amb, 0.18);
    return Math.max(amb, this.lampAt(x, this.rowOf(m)));
  }

  private get lampOn(): boolean {
    return this.sub.m > 120 || !!this.chaseState?.on;
  }

  private lampAt(x: number, y: number): number {
    if (!this.lampOn) return 0;
    const s = this.sub;
    const lx = s.x + s.face * 16;
    const ly = this.rowOf(s.m) + 3;
    const dx = (x - lx) * s.face;
    if (dx <= 0) return 0;
    const dy = y - ly;
    const d = Math.hypot(dx, dy);
    const R = this.W * 0.5;
    const ang = Math.abs(Math.atan2(dy, dx));
    if (ang > 0.36 || d > R) return 0;
    return Math.min(1, (1 - d / R) * Math.sqrt(1 - ang / 0.36) * 1.6);
  }

  // ------------------------------------------------------------ drawing

  private draw(): void {
    const { g, W, H } = this;
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.fillStyle = '#040814';
    g.fillRect(0, 0, W, H);
    // the sea, tile by tile (only one new tile is painted per frame, so it stays smooth)
    const first = Math.floor(this.cam / TILE_M);
    const last = Math.floor((this.cam + H / this.ppm) / TILE_M);
    let painted = 0;
    for (let i = first; i <= last; i++) {
      let t: HTMLCanvasElement | null | undefined = this.tiles.get(i);
      if (!t && painted === 0) {
        t = this.tile(i);
        painted++;
      }
      if (t) g.drawImage(t, 0, Math.round(this.rowOf(i * TILE_M)));
    }
    // paint the next tile below ahead of time, when this frame painted none
    if (!painted && !this.tiles.has(last + 1) && (last + 1) * TILE_M < this.floor + this.H / this.ppm) this.tile(last + 1);
    // forget tiles far from the view (the Trench Dive is long)
    if (this.tiles.size > 60) for (const k of this.tiles.keys()) if (k < first - 20 || k > last + 20) this.tiles.delete(k);
    const night = !!this.chaseState?.on;
    if (night) {
      // dusk up top: the sunlight zone goes dark
      const yb = Math.min(H, this.rowOf(200));
      if (yb > 0) {
        g.fillStyle = 'rgba(4,8,24,0.72)';
        g.fillRect(0, 0, W, yb);
      }
    }
    const fr = this.reducedMotion ? 0 : Math.floor(this.t * 4) % 2;
    // marine snow, drifting down
    g.fillStyle = '#a8c0d8';
    for (const sn of this.snow) {
      if (sn.m < 150) continue;
      const y = Math.round(this.rowOf(sn.m));
      if (y < 0 || y >= H) continue;
      g.globalAlpha = Math.max(0.35, this.lightAt(sn.x, sn.m));
      g.fillRect(Math.round(sn.x), y, 1, 1);
    }
    g.globalAlpha = 1;
    const glows: Array<[number, number, number, string]> = [];
    // the little fish, lanterns and jellies that are just part of the sea
    for (const a of this.ambient) {
      const y = this.rowOf(a.m);
      if (y < -30 || y > H + 30) continue;
      if (a.kind === 'school') {
        g.fillStyle = '#e6f4ff';
        for (let i = 0; i < 14; i++) {
          const x = ((a.x + i * 7 + this.t * 18 + (i % 3) * 5) % (W + 40)) - 20;
          const yy = y + Math.sin(i * 1.7) * 6 + Math.sin(this.t * 2 + i) * 2;
          g.globalAlpha = this.lightAt(x, a.m);
          g.fillRect(Math.round(x), Math.round(yy), 3, 1);
        }
        g.globalAlpha = 1;
      } else if (a.kind === 'lantern') {
        for (let i = 0; i < 4; i++) {
          const x = a.x + Math.sin(this.t * 0.4 + a.phase + i * 1.3) * 30 + i * 9 - 14;
          const yy = y + (i % 2) * 7 - 3;
          glows.push([x, yy, 3, '#7ff0ff']);
        }
      } else if (a.kind === 'spark') {
        // a short flash now and then, like a startled animal
        if ((this.t * 0.5 + a.phase) % 4 < 0.5) glows.push([a.x + Math.sin(a.phase) * 10, y, 3, a.phase % 2 < 1 ? '#5fd8ff' : '#9ff4b0']);
      } else {
        glows.push([a.x + Math.sin(this.t * 0.3) * 8, y + Math.sin(this.t * 0.5) * 4, 7, '#c8a8ff']);
      }
    }
    // the hot vent chimneys, smoking (seen in the headlamp, and a little in the dark)
    for (const v of this.chimneys) {
      const img = v.frames[this.reducedMotion ? 0 : Math.floor(this.t * 6) % v.frames.length];
      const yb = this.rowOf(v.m);
      if (yb < -10 || yb - img.height > H + 10) continue;
      g.globalAlpha = Math.max(0.5, this.lightAt(v.x, v.m - 12));
      g.drawImage(img, Math.round(v.x - img.width / 2), Math.round(yb - img.height));
      g.globalAlpha = 1;
    }
    if (this.sampleSpot && !this.sampleTaken && this.nearSample) {
      const y = this.rowOf(this.sampleSpot.m);
      g.strokeStyle = fr ? '#fff6b0' : '#ffd04a';
      g.lineWidth = 1;
      g.strokeRect(Math.round(this.sampleSpot.x - 9), Math.round(y - 9), 18, 18);
    }
    // the animals to photograph
    for (const c of this.critters) {
      const y = this.rowOf(c.m);
      if (y < -40 || y > H + 40) continue;
      const img = c.frames[this.reducedMotion ? 0 : Math.floor(this.t * 3 + c.phase) % c.frames.length];
      const flip = c.face < 0 && c.id !== 'seagrass' && c.id !== 'plankton';
      const x = Math.round(c.x - img.width / 2);
      const yy = Math.round(y - img.height / 2);
      const l = this.lightAt(c.x, c.m);
      const a = l > 0.85 ? 1 : l > 0.5 ? 0.7 : l > 0.2 ? 0.45 : 0.18;
      g.globalAlpha = a;
      if (flip) {
        g.save();
        g.translate(x + img.width, yy);
        g.scale(-1, 1);
        g.drawImage(img, 0, 0);
        g.restore();
      } else g.drawImage(img, x, yy);
      g.globalAlpha = 1;
      if (c.glow) glows.push([c.x + c.glowAt[0] * img.width * (flip ? -1 : 1), y + c.glowAt[1] * img.height, c.id === 'combjelly' ? 10 : c.id === 'atolla' ? 12 : 6, c.glow]);
      // a soft ring round an animal still to photograph, once it is close
      if (!c.done && c === this.near) {
        g.strokeStyle = fr ? '#fff6b0' : '#ffd04a';
        g.lineWidth = 1;
        g.strokeRect(x - 3, yy - 3, img.width + 6, img.height + 6);
      }
    }
    // the night trip's school
    const ch = this.chaseState;
    if (ch && ch.on) {
      const y = this.rowOf(ch.m);
      for (let i = 0; i < 12; i++) {
        const fx = ch.x + Math.cos(i * 2.4 + this.t * 0.8) * (16 + (i % 3) * 8);
        const fy = y + Math.sin(i * 1.9 + this.t * 0.9) * 12;
        const img = this.schoolFrames[(i + fr) % 2];
        g.drawImage(img, Math.round(fx - img.width / 2), Math.round(fy - img.height / 2));
        glows.push([fx, fy, 3, '#7ff0ff']);
      }
    }
    // living light and the headlamp, added on top
    g.globalCompositeOperation = 'lighter';
    for (const [x, y, r, c] of glows) {
      if (y < -r || y > H + r) continue;
      const grad = g.createRadialGradient(x, y, 0, x, y, r * 2.2);
      grad.addColorStop(0, c);
      grad.addColorStop(0.3, hexA(c, 0.5));
      grad.addColorStop(1, hexA(c, 0));
      g.fillStyle = grad;
      g.fillRect(Math.floor(x - r * 2.2), Math.floor(y - r * 2.2), Math.ceil(r * 4.4), Math.ceil(r * 4.4));
    }
    const s = this.sub;
    const sy = this.rowOf(s.m);
    if (this.lampOn) {
      const lx = s.x + s.face * 16;
      const ly = sy + 3;
      const R = W * 0.5;
      const grad = g.createLinearGradient(lx, ly, lx + s.face * R, ly);
      grad.addColorStop(0, 'rgba(170,220,255,0.34)');
      grad.addColorStop(1, 'rgba(170,220,255,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(lx, ly);
      g.lineTo(lx + s.face * R, ly - Math.tan(0.36) * R);
      g.lineTo(lx + s.face * R, ly + Math.tan(0.36) * R);
      g.closePath();
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    // bubbles from the propeller
    if (!this.reducedMotion && (Math.abs(s.vx) > 5 || Math.abs(s.vm) > 3)) {
      g.fillStyle = 'rgba(220,245,255,0.8)';
      for (let i = 0; i < 4; i++) {
        const k = (this.t * 2 + i * 0.25) % 1;
        g.fillRect(Math.round(s.x - s.face * (20 + k * 8)), Math.round(sy - k * 10 + i), 1, 1);
      }
    }
    // the sub, and Finn riding just above it
    const sub = this.subFrames[`${s.face > 0 ? 'right' : 'left'}${this.lampOn}`][this.reducedMotion ? 0 : Math.floor(this.t * 10) % 3];
    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(this.t * 2) * 1);
    g.drawImage(sub, Math.round(s.x - sub.width / 2), Math.round(sy - sub.height / 2 + bob));
    const finn = this.finnFrames[s.face > 0 ? 'right' : 'left'][this.reducedMotion ? 0 : 1 + (Math.floor(this.t * 8) % 2)];
    g.drawImage(finn, Math.round(s.x - s.face * 6 - finn.width / 2), Math.round(sy - sub.height / 2 - finn.height + 2 + bob));
    // the photo flash
    if (this.flash > 0) {
      g.fillStyle = `rgba(255,255,255,${this.flash * 0.8})`;
      g.fillRect(0, 0, W, H);
    }
    this.drawHud();
  }

  private drawHud(): void {
    const d = dials(this.sub.m);
    const m = this.sub.m;
    const zone =
      m < 200
        ? 'Sunlight zone'
        : m < 1000
          ? 'Twilight zone'
          : this.zone === 'vents' && m > VENT_FLOOR - 120
            ? 'Sea floor: hot vents'
            : m < 4000
              ? 'Midnight zone'
              : m < 6000
                ? 'Deep sea'
                : 'The trench';
    const key = `${d.depth}|${d.temp}|${d.pressure}|${zone}`;
    if (this.dialsEl.dataset.key !== key) {
      this.dialsEl.dataset.key = key;
      this.dialsEl.replaceChildren(
        h('strong', { class: 'odd-zone', text: zone }),
        h('span', { class: 'odd-dial' }, h('b', { text: `${d.depth} m` }), h('small', { text: 'Depth' })),
        h('span', { class: 'odd-dial' }, h('b', { text: `${d.temp} °C` }), h('small', { text: 'Water' })),
        h('span', { class: 'odd-dial' }, h('b', { text: `${d.pressure}×` }), h('small', { text: 'Pressure' })),
      );
      this.dialsEl.setAttribute('aria-label', `${zone}. ${d.depth} meters down. Water ${d.temp} degrees. Pressure ${d.pressure} times the air at the top.`);
    }
    // the photo prompt, next to the animal
    const n = this.near ?? (this.nearSample && this.sampleSpot ? { id: null, x: this.sampleSpot.x, m: this.sampleSpot.m } : null);
    if (n && !this.paused) {
      const label = n.id ? `Photo: ${ANIMALS[n.id].name}` : 'Sample: hot vent water';
      if (this.promptEl.dataset.label !== label) {
        this.promptEl.dataset.label = label;
        this.promptEl.replaceChildren(h('span', { text: label }), h('span', { class: 'kbd', text: 'Space' }));
      }
      const r = this.canvas.getBoundingClientRect();
      const host = this.root.getBoundingClientRect();
      const k = r.width / this.W;
      this.promptEl.style.left = `${r.left - host.left + n.x * k}px`;
      this.promptEl.style.top = `${r.top - host.top + (this.rowOf(n.m) - 20) * k}px`;
      this.promptEl.hidden = false;
    } else this.promptEl.hidden = true;
    // Finn's sonar: points to the next animal still to find, when it is off the screen
    const left = this.critters.filter((c) => !c.done);
    const ch = this.chaseState;
    let goal: { x: number; m: number; name: string } | null = null;
    if (ch && ch.on) goal = { x: ch.x, m: ch.m, name: 'the lanternfish' };
    else if (left.length) {
      const c = left.reduce((a, b) => (Math.abs(a.m - this.sub.m) <= Math.abs(b.m - this.sub.m) ? a : b));
      goal = { x: c.x, m: c.m, name: ANIMALS[c.id].name };
    } else if (this.sampleSpot && !this.sampleTaken) goal = { ...this.sampleSpot, name: 'the hot vent' };
    else if (this.zone === 'trench' && this.nextCp < CHECKPOINTS.length)
      goal = { x: this.sub.x, m: CHECKPOINTS[this.nextCp], name: this.nextCp === CHECKPOINTS.length - 1 ? 'the bottom' : 'the next checkpoint' };
    else if (this.zone === 'sunlight' && this.allPhotosSaid && this.sub.m > 3) goal = { x: this.sub.x, m: 0, name: 'the surface' };
    const y = goal ? this.rowOf(goal.m) : 0;
    if (goal && (y < 4 || y > this.H - 4)) {
      const dm = Math.round(goal.m - this.sub.m);
      const up = dm < 0;
      const text = `${goal.name}: ${Math.abs(dm)} m ${up ? 'up' : 'down'}`;
      if (this.sonarEl.dataset.text !== text) {
        this.sonarEl.dataset.text = text;
        this.sonarEl.replaceChildren(iconImg(up ? 'arrowUp' : 'arrowDown', '', 18), h('span', { text }));
      }
      this.sonarEl.classList.toggle('down', !up);
      this.sonarEl.hidden = false;
    } else this.sonarEl.hidden = true;
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKey);
    this.root.remove();
    this.tiles.clear();
  }
}

function hexA(c: string, a: number): string {
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
