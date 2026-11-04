import { PixelBuffer } from '../../kit/art/pixel';
import {
  Cell,
  EASY,
  follow,
  newBody,
  NORMAL,
  parseLevel,
  placeAt,
  step,
  type Body,
  type Camera,
  type Controls,
  type Level,
  type LevelThing,
  type Platform,
  type Tuning,
} from '../../kit/scroller/physics';
import { settings, touchControlsVisible } from '../../kit/systems/settings';
import type { GearId } from './shop';
import { speak } from '../../kit/systems/speech';
import { h } from '../../kit/ui/dom';
import { paintHero, type Look16 } from '../../kit/worlds/hero16';
import { paintPalm, paintRainTree, paintTent, paintWeatherMast, RANGER_TALA, WILD } from '../../kit/worlds/wild-lands/art';
import {
  IRIS_OKORO,
  NIMBUS,
  paintBackdrop,
  paintBolt,
  paintLighthouse,
  paintRaft,
  paintCloud,
  paintCrab,
  paintDrip,
  paintDroplet,
  paintFlag,
  paintGust,
  paintHouse,
  paintIceBlock,
  paintPine,
  paintPowerIcon,
  paintRain,
  paintStormCloud,
  paintThermometer,
  paintTidePool,
  paintTile,
  paintVane,
  paintWaterfall,
  paintWizard,
  POWER_COLOR,
  POWER_NAME,
  SKY,
  VILLAGERS,
  type Backdrop,
  type DripForm,
  type Power,
  type Region,
  type TileKind,
  type WizardPose,
} from '../../kit/worlds/wild-lands/weather-art';
import { tempAt, type LevelDef } from './levels';
import { cast, POWER_ORDER, type CloudKind, type Spot } from './powers';

/**
 * The side-scrolling play screen: one level (or the field camp) drawn on a
 * small pixel canvas scaled up by whole numbers, with the wizard, Drip, the
 * weather powers and the level's puzzles. The game around it (talk, the
 * Weather Book, saving) listens through the callbacks.
 */

export const T = 24;
export const VW = 480;
export const VH = 270;
const VIEW_W = VW / T;
const VIEW_H = VH / T;
const DT = 1 / 60;
/** How far a power reaches in front of the wizard (tiles). */
const REACH = 4.5;
const CLOUD_REACH = 7;

export interface FinishResult {
  drops: number;
  total: number;
  falls: number;
  time: number;
}

export interface PlayCallbacks {
  onFinish(r: FinishResult): void;
  /** Camp: talk to someone (N, J, A) or open the map (X). */
  onTalk(id: string): void;
  onRequest(stage: 'ask' | 'done'): void;
  onEasy(on: boolean): void;
  onMenu(): void;
  onSound(kind: 'jump' | 'land' | 'drop' | 'cast' | 'fail' | 'splash' | 'vane' | 'bump' | 'thunder'): void;
  /** The Storm Front: Dr. Iris's count-the-seconds stop has been reached. */
  onCount?(): void;
}

export interface PlayOptions {
  easy: boolean;
  look: Look16;
  requestDone: boolean;
  /** Weather Shop power-ups switched on. */
  gear: GearId[];
}

interface Pickup {
  x: number;
  y: number;
  got: boolean;
  vy?: number;
}
interface Crab {
  x: number;
  y: number;
  x0: number;
  x1: number;
  dir: number;
}
interface Vapor {
  x: number;
  surface: number;
  t: number;
}
interface Cloud extends Platform {
  kind: CloudKind;
  vx: number;
  push: number;
  made: boolean;
  /** Someone has stood on it (the breeze only carries a cloud once you are aboard). */
  boarded: boolean;
  rain: number;
  snow: boolean;
  /** A level's own grey cloud that has rained grows full again after this many seconds (so no puzzle is ever lost). */
  refill?: number;
}
interface Raft extends Platform {
  moving: boolean;
  /** Where it starts (and comes back to after a fall before any weather vane). */
  x0: number;
  y0: number;
  /** The dry stretch it is waiting at (so the hint is said once). */
  waitingAt: number | null;
}
/** A dry stretch of riverbed or a dry well (V cells side by side): rain nearby fills it. */
interface DryBed {
  cells: LevelThing[];
  cx: number;
  filled: boolean;
  /** Seconds until the water arrives (the rain has to run in, or soak down). */
  fillT: number;
}
interface Folk {
  x: number;
  y: number;
  look: number;
  /** The house they are walking to, once told to go indoors. */
  goTo: number | null;
  inside: boolean;
}
interface Storm {
  x: number;
  y: number;
  w: number;
  h: number;
  x0: number;
  push: number;
  vx: number;
  /** Over the cold sea: it is raining itself out. */
  out: boolean;
  /** 1 while it is strong; it fades to 0 over the sea. */
  left: number;
  gone: boolean;
  rodStruck: boolean;
  pushed: number;
}

interface Fx {
  kind: Power;
  x: number;
  y: number;
  tx: number;
  ty: number;
  t: number;
}
interface Fall {
  x: number;
  top: number;
  bottom: number;
  frozen: boolean;
}

// ------------------------------------------------------------------ drawing helpers (cached canvases)

const cache = new Map<string, HTMLCanvasElement>();
function cached(key: string, make: () => PixelBuffer): HTMLCanvasElement {
  let c = cache.get(key);
  if (!c) cache.set(key, (c = make().toCanvas(1)));
  return c;
}

const backdrops = new Map<string, Backdrop>();
function backdropFor(r: Region, storm: boolean): Record<'sky' | 'far' | 'near', HTMLCanvasElement> {
  const key = `bd-${r}-${storm}`;
  let b = backdrops.get(key);
  if (!b) backdrops.set(key, (b = paintBackdrop(r, VW, VH, storm)));
  const bb = b;
  return { sky: cached(`${key}-sky`, () => bb.sky), far: cached(`${key}-far`, () => bb.far), near: cached(`${key}-near`, () => bb.near) };
}

function paintWindmill(frame: number): PixelBuffer {
  const b = new PixelBuffer(40, 64);
  for (let y = 22; y < 64; y++) {
    const half = Math.round(3 + (y - 22) * 0.12);
    for (let x = -half; x <= half; x++) b.set(20 + x, y, x === -half ? WILD.wood[1] : (y + x) % 9 ? WILD.wood[2] : WILD.wood[3]);
  }
  const a0 = frame * 0.35;
  for (let k = 0; k < 4; k++) {
    const a = a0 + (k * Math.PI) / 2;
    for (let r = 2; r < 18; r++) {
      const x = Math.round(20 + Math.cos(a) * r);
      const y = Math.round(20 + Math.sin(a) * r);
      b.set(x, y, '#f2f4ec');
      b.set(x + Math.round(Math.cos(a + 1.57)), y + Math.round(Math.sin(a + 1.57)), r > 6 ? '#e0503a' : '#f2f4ec');
    }
  }
  b.rect(18, 18, 5, 5, WILD.dark[2]);
  return b;
}

function paintLaundry(dry: boolean): PixelBuffer {
  const b = new PixelBuffer(56, 40);
  b.rect(2, 4, 2, 36, WILD.bark[2]);
  b.rect(52, 4, 2, 36, WILD.bark[2]);
  b.rect(3, 6, 50, 1, '#5a4a3a');
  const cloth = dry ? ['#e0503a', '#f2c94c', '#3a7ad8', '#f2f4ec'] : ['#a83a2a', '#b8962a', '#2a5aa8', '#c8ccc8'];
  cloth.forEach((c, i) => {
    const x = 7 + i * 11;
    b.rect(x, 7, 9, 14 + (i % 2) * 3, c);
    if (!dry) for (let k = 0; k < 3; k++) b.set(x + 2 + k * 3, 22 + (i % 2) * 3 + (k % 2), SKY.drop[3]);
  });
  return b;
}

function paintField(wet: boolean, w: number): PixelBuffer {
  const b = new PixelBuffer(w * T, 20);
  for (let x = 0; x < b.w; x++) {
    b.set(x, 19, wet ? WILD.mud[2] : '#c8a070');
    b.set(x, 18, wet ? WILD.mud[3] : '#d8b884');
  }
  for (let x = 4; x < b.w; x += 8) {
    const ht = wet ? 14 : 7;
    for (let k = 0; k < ht; k++) b.set(x, 18 - k, wet ? WILD.leaf[2] : '#b8a060');
    if (wet) {
      b.set(x - 1, 10, WILD.leaf[3]);
      b.set(x + 1, 8, WILD.leaf[3]);
      b.set(x - 1, 6, WILD.leaf[3]);
    } else b.set(x + 1, 12, '#a08850');
  }
  return b;
}

function paintSnowbank(left: number): PixelBuffer {
  const b = new PixelBuffer(56, 24);
  const ht = Math.max(1, Math.round(20 * left));
  for (let x = 0; x < 56; x++) {
    const top = 24 - Math.round(ht * Math.sin((x / 55) * Math.PI));
    for (let y = top; y < 24; y++) b.set(x, y, SKY.snow[y === top ? 4 : (x + y) % 7 ? 3 : 2]);
  }
  return b;
}

function paintVine(rows: number, grown: number): PixelBuffer {
  const b = new PixelBuffer(2 * T, rows * T);
  const top = Math.round(b.h * (1 - grown));
  for (let y = top; y < b.h; y++) {
    const x = Math.round(T + Math.sin(y * 0.18) * 6);
    b.set(x, y, WILD.leaf2[2]);
    b.set(x + 1, y, WILD.leaf2[1]);
  }
  for (let r = 0; r < rows; r += 2) {
    const y = r * T;
    if (y < top) continue;
    for (let x = 2; x < 2 * T - 2; x++) {
      b.set(x, y, WILD.leaf[3]);
      b.set(x, y + 1, WILD.leaf[2]);
      b.set(x, y + 2, (x % 5) - 2 ? WILD.leaf[1] : WILD.leaf[2]);
    }
  }
  return b;
}

function paintMapBoard(): PixelBuffer {
  const b = new PixelBuffer(36, 44);
  b.rect(6, 20, 3, 24, WILD.bark[2]);
  b.rect(27, 20, 3, 24, WILD.bark[2]);
  b.rect(1, 2, 34, 24, WILD.plank[1]);
  b.rect(3, 4, 30, 20, '#e8d8a8');
  const pts = [
    [6, 18],
    [12, 9],
    [20, 15],
    [27, 7],
    [30, 18],
  ];
  pts.forEach(([x, y], i) => {
    b.rect(x - 1, y - 1, 3, 3, ['#2f8fc8', '#f2f4ec', '#8a8a92', '#3aa6b8', '#5a6070'][i]);
    if (i) {
      const [px, py] = pts[i - 1];
      for (let k = 0; k < 6; k++) b.set(Math.round(px + ((x - px) * k) / 6), Math.round(py + ((y - py) * k) / 6), '#c8584a');
    }
  });
  return b;
}

// ------------------------------------------------------------------ the play screen

export class Play {
  readonly el: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  readonly level: Level;
  readonly body: Body;
  paused = false;
  private tuning: Tuning;
  private easy: boolean;
  private readonly gear: Set<GearId>;
  private cam: Camera = { x: 0, y: 0 };
  private respawn: { x: number; y: number };
  private pickups: Pickup[] = [];
  private loose: Pickup[] = [];
  private crabs: Crab[] = [];
  private vanes: Array<{ x: number; y: number; lit: boolean }> = [];
  private vapors: Vapor[] = [];
  private clouds: Cloud[] = [];
  private ice: Array<Platform & { melt: number; melting: boolean }> = [];
  private falls: Fall[] = [];
  private seeds: Array<{ x: number; y: number; grown: number; rows: number }> = [];
  private snowbank: { x: number; y: number; left: number; melting: boolean } | null = null;
  private stream: LevelThing[] = [];
  private field: { x: number; y: number; w: number; wet: boolean } | null = null;
  private laundry: { x: number; y: number; dry: boolean } | null = null;
  private windmill: { x: number; y: number; spin: number } | null = null;
  private villager: { x: number; y: number; look: number; asked: boolean } | null = null;
  private people: Array<{ id: string; x: number; y: number }> = [];
  private raft: Raft | null = null;
  private beds: DryBed[] = [];
  private trees: LevelThing[] = [];
  private folks: Folk[] = [];
  private storm: Storm | null = null;
  private lighthouse: LevelThing | null = null;
  /** Lightning: the white flash fading, the bolt drawn, the time to the next one. */
  private flashA = 0;
  private bolt: { x: number; y0: number; y1: number; t: number } | null = null;
  private nextFlash = 4;
  /** Counting from the flash to the thunder. */
  private count: { t: number; delay: number; after: number } | null = null;
  private countEl!: HTMLElement;
  private countAsked = false;
  /** Dr. Iris's count-the-seconds question is answered (the Storm Front, level 1). */
  countDone = false;
  private gateT = 0;
  private calm = false;
  private decor: LevelThing[] = [];
  /** Cells drawn by something else (a vine, a frozen waterfall), not as plain tiles. */
  private skip = new Set<number>();
  private flag: LevelThing;
  private carried = 0;
  private readonly total: number;
  private falls_ = 0;
  private time = 0;
  private done = false;
  requestDone: boolean;
  private castT = 0;
  private castPower: Power = 'sun';
  private bump = 0;
  private frame = 0;
  private fx: Fx[] = [];
  private dripX = 0;
  private dripY = 0;
  private dripSquash = 0;
  private tipsShown = new Set<number>();
  private target: string | null = null;
  // input
  private held = { left: false, right: false, jump: false };
  private jumpPressed = false;
  private raf = 0;
  private acc = 0;
  private last = performance.now();
  private readonly offs: Array<() => void> = [];
  // HUD
  private dropText!: HTMLElement;
  private thermBox!: HTMLElement;
  private tempText!: HTMLElement;
  private msg!: HTMLElement;
  private msgT = 0;
  private prompt!: HTMLButtonElement;
  private pad!: HTMLElement;
  private easyBtn!: HTMLButtonElement | null;
  private scale = 2;

  constructor(
    host: HTMLElement,
    readonly def: LevelDef,
    opts: PlayOptions,
    private readonly cb: PlayCallbacks,
  ) {
    this.level = parseLevel(def.rows);
    this.easy = opts.easy;
    this.gear = new Set(opts.gear);
    this.tuning = this.tune();
    this.requestDone = opts.requestDone;
    this.look = opts.look;
    this.body = newBody(0, 0);
    this.respawn = { ...this.level.spawn };
    const th = this.level.things;
    const of = (k: string) => th.filter((t) => t.kind === k);
    this.pickups = of('D').map((t) => ({ x: t.x + 0.5, y: t.y + 0.8, got: false }));
    this.total = this.pickups.length;
    this.vanes = of('C').map((t) => ({ x: t.x, y: t.y, lit: false }));
    this.crabs = of('K').map((t) => ({ x: t.x + 0.5, y: t.y + 1, x0: t.x - 2, x1: t.x + 4, dir: 1 }));
    this.clouds = [...of('U'), ...of('G')].map((t, i) => ({
      id: `cloud${i}`,
      x: t.x,
      y: t.y,
      w: 3,
      h: 0.6,
      oneWay: true,
      kind: t.kind === 'G' ? 'grey' : 'cumulus',
      vx: 0,
      push: 0,
      made: false,
      boarded: false,
      rain: 0,
      snow: false,
    }));
    this.ice = of('B').map((t, i) => ({ id: `ice${i}`, x: t.x, y: t.y - 3, w: 1, h: 4, oneWay: false, melt: 0, melting: false }));
    for (const t of of('W')) {
      let bottom = t.y;
      while (bottom + 1 < this.level.map.h && this.level.map.get(t.x, bottom + 1) === Cell.Air) bottom++;
      this.falls.push({ x: t.x, top: t.y, bottom, frozen: false });
    }
    this.seeds = of('S').map((t) => ({ x: t.x, y: t.y, grown: 0, rows: 0 }));
    const z = of('Z')[0];
    if (z) this.snowbank = { x: z.x, y: z.y, left: 1, melting: false };
    this.stream = of('V');
    const y = of('Y')[0];
    if (y) this.field = { x: y.x, y: y.y, w: 5, wet: this.requestDone };
    const l = of('L')[0];
    if (l) this.laundry = { x: l.x, y: l.y, dry: this.requestDone };
    const m = of('M')[0];
    if (m) this.windmill = { x: m.x, y: m.y, spin: this.requestDone ? 1 : 0 };
    const r = of('R')[0];
    if (r) this.villager = { x: r.x, y: r.y, look: def.request?.look ?? 0, asked: this.requestDone };
    this.people = th.filter((t) => 'NJAX'.includes(t.kind)).map((t) => ({ id: t.kind, x: t.x, y: t.y }));
    this.decor = th.filter((t) => 'pnhtwQ'.includes(t.kind));
    const rf = of('r')[0];
    if (rf) this.raft = { id: 'raft', x: rf.x, y: rf.y + 1, w: 2.5, h: 0.4, oneWay: true, moving: false, x0: rf.x, y0: rf.y + 1, waitingAt: null };
    this.trees = of('E');
    this.folks = of('e').map((t, i) => ({ x: t.x, y: t.y, look: i % 3, goTo: null, inside: false }));
    this.lighthouse = of('u')[0] ?? null;
    const so = of('O')[0];
    if (so) this.storm = { x: so.x, y: so.y, w: 7.5, h: 6, x0: so.x, push: 0, vx: 0, out: false, left: 1, gone: false, rodStruck: false, pushed: 0 };
    if (def.region === 'river') {
      // group the dry cells side by side into stretches (each fills on its own)
      const vs = this.stream.slice().sort((a, b) => a.x - b.x || a.y - b.y);
      for (const v of vs) {
        const last = this.beds[this.beds.length - 1];
        if (last && v.x - Math.max(...last.cells.map((c) => c.x)) <= 1) last.cells.push(v);
        else this.beds.push({ cells: [v], cx: 0, filled: false, fillT: 0 });
      }
      for (const bd of this.beds) bd.cx = (Math.min(...bd.cells.map((c) => c.x)) + Math.max(...bd.cells.map((c) => c.x)) + 1) / 2;
    }
    this.calm = settings.reducedMotion;
    this.flag = of('F')[0] ?? { kind: 'F', x: -10, y: -10 };
    placeAt(this.body, this.respawn.x, this.respawn.y);
    this.cam = follow(this.cam, this.body, VIEW_W, VIEW_H, this.level.map, 0, true);
    this.dripX = this.body.x - 0.6;
    this.dripY = this.body.y;

    this.canvas = h('canvas', { class: 'wwb-canvas', width: VW, height: VH, 'aria-label': def.num ? `${def.name}: the level` : 'The field camp' }) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.el = h('div', { class: 'wwb-play' });
    const box = h('div', { class: 'wwb-box' }, this.canvas);
    this.el.append(box);
    this.buildHud(box);
    host.prepend(this.el);
    this.fit();
    this.listen();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private look: Look16;

  setLook(look: Look16): void {
    this.look = look;
    for (const k of [...cache.keys()]) if (k.startsWith('me-')) cache.delete(k);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    for (const off of this.offs) off();
    this.el.remove();
  }

  // ---------------------------------------------------------------- HUD and controls

  private buildHud(box: HTMLElement): void {
    const camp = this.def.num === 0;
    this.dropText = h('span', {});
    this.thermBox = h('span', { class: 'wwb-therm' });
    this.tempText = h('span', {});
    const hud = h(
      'div',
      { class: 'wwb-hud', 'aria-live': 'off' },
      ...(camp ? [] : [h('img', { src: paintDroplet(T, 0).toDataURL(1), alt: '', width: 12, height: 15, class: 'px' }), this.dropText]),
      h('span', { class: 'gap' }),
      h('span', { class: 'wwb-level', text: camp ? 'The field camp' : this.def.name }),
      this.thermBox,
      this.tempText,
    );
    this.msg = h('div', { class: 'wwb-msg', role: 'status', 'aria-live': 'polite' });
    this.msg.style.opacity = '0';
    this.prompt = h('button', { class: 'panel prompt wwb-talkbtn', type: 'button', hidden: true, onclick: () => this.interact() }) as HTMLButtonElement;
    this.countEl = h('div', { class: 'wwb-count', role: 'status', 'aria-live': 'polite', hidden: true });
    box.append(hud, this.msg, this.prompt, this.countEl);

    const bar = h('div', { class: 'wwb-bar' });
    const hold = (label: string, aria: string, key: 'left' | 'right' | 'jump') => {
      const btn = h('button', { class: 'btn wwb-padbtn', type: 'button', 'aria-label': aria, text: label });
      const on = (e: Event) => {
        e.preventDefault();
        if (key === 'jump' && !this.held.jump) this.jumpPressed = true;
        this.held[key] = true;
      };
      const off = (e: Event) => {
        e.preventDefault();
        this.held[key] = false;
      };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointerleave', off);
      btn.addEventListener('pointercancel', off);
      return btn;
    };
    this.pad = h('div', { class: 'wwb-pad' }, hold('◀', 'Run left', 'left'), hold('▶', 'Run right', 'right'), hold('▲', 'Jump', 'jump'));
    bar.append(this.pad);
    for (const p of this.def.powers) {
      const n = POWER_ORDER.indexOf(p) + 1;
      const btn = h(
        'button',
        { class: 'btn wwb-power', type: 'button', 'aria-label': `${POWER_NAME[p]} (key ${n})`, 'data-power': p, onclick: () => this.use(p) },
        h('img', { src: paintPowerIcon(T, p).toDataURL(1), alt: '', width: 24, height: 24, class: 'px' }),
        h('span', { text: POWER_NAME[p] }),
        h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(n) }),
      );
      bar.append(btn);
    }
    this.easyBtn = camp
      ? null
      : (h('button', {
          class: 'btn wwb-easy',
          type: 'button',
          'aria-pressed': String(this.easy),
          text: `Easy jumps: ${this.easy ? 'on' : 'off'}`,
          onclick: () => this.setEasy(!this.easy),
        }) as HTMLButtonElement);
    if (this.easyBtn) bar.append(this.easyBtn);
    this.el.append(bar);
    this.pad.hidden = !touchControlsVisible();
  }

  /** Grip Boots stop you on ice as fast as on the ground. */
  private tune(): Tuning {
    const t = this.easy ? EASY : NORMAL;
    return this.gear.has('grip') ? { ...t, iceStop: t.stop } : t;
  }

  setEasy(on: boolean): void {
    this.easy = on;
    this.tuning = this.tune();
    if (this.easyBtn) {
      this.easyBtn.textContent = `Easy jumps: ${on ? 'on' : 'off'}`;
      this.easyBtn.setAttribute('aria-pressed', String(on));
    }
    this.say(on ? 'Easy jumps: a slower run, and you can jump again in the air.' : 'Easy jumps off.');
    this.cb.onEasy(on);
  }

  showTouch(on: boolean): void {
    this.pad.hidden = !on;
  }

  fit(): void {
    const bar = 64;
    const room = Math.min(window.innerWidth / VW, (window.innerHeight - bar) / VH);
    this.scale = room >= 2 ? Math.floor(room) : Math.max(0.5, room);
    this.canvas.style.width = `${Math.round(VW * this.scale)}px`;
    this.canvas.style.height = `${Math.round(VH * this.scale)}px`;
  }

  private listen(): void {
    const KEYS: Record<string, 'left' | 'right' | 'jump'> = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump' };
    const down = (e: KeyboardEvent) => {
      if (this.paused || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement)?.closest?.('input, select, textarea')) return;
      const k = KEYS[e.code];
      if (k) {
        e.preventDefault();
        if (k === 'jump' && !this.held.jump) this.jumpPressed = true;
        this.held[k] = true;
        return;
      }
      if (e.repeat) return;
      const n = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].indexOf(e.code);
      if (n >= 0) {
        const p = POWER_ORDER[n];
        if (this.def.powers.includes(p)) this.use(p);
        else if (this.def.num) this.say(`You have not learned ${POWER_NAME[p]} yet.`);
      } else if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'ArrowDown' || e.code === 'KeyS') {
        if (this.target) {
          e.preventDefault();
          this.interact();
        }
      } else if (e.code === 'Escape') this.cb.onMenu();
    };
    const up = (e: KeyboardEvent) => {
      const k = KEYS[e.code];
      if (k) this.held[k] = false;
    };
    const resize = () => this.fit();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('resize', resize);
    this.offs.push(
      () => window.removeEventListener('keydown', down),
      () => window.removeEventListener('keyup', up),
      () => window.removeEventListener('resize', resize),
    );
  }

  /** Let go of every key (when a talk box or a panel opens). */
  release(): void {
    this.held.left = this.held.right = this.held.jump = false;
    this.jumpPressed = false;
  }

  say(text: string, secs = 4.5): void {
    this.msg.textContent = text;
    this.msg.style.opacity = '1';
    this.msgT = secs;
    speak(text);
  }

  private interact(): void {
    if (this.paused || !this.target) return;
    if (this.target === 'R') {
      this.cb.onRequest('ask');
      return;
    }
    this.cb.onTalk(this.target);
  }

  // ---------------------------------------------------------------- the powers

  private get cx(): number {
    return this.body.x + this.body.w / 2;
  }

  private ahead(x: number, range = REACH): boolean {
    const d = (x - this.cx) * this.body.facing;
    return d > -1.5 && d < range;
  }

  private tempHere(): number {
    return tempAt(this.def, this.cx);
  }

  /** The nearest water surface in front: a tide pool, or a water cell with air above. */
  private waterAhead(): { x: number; y: number } | null {
    const map = this.level.map;
    const feet = Math.floor(this.body.y + this.body.h);
    for (let i = 0; i <= 4; i++) {
      const x = Math.floor(this.cx + this.body.facing * (i + 0.5));
      for (let y = feet - 2; y <= feet + 3; y++) if (map.get(x, y) === Cell.Water && map.get(x, y - 1) !== Cell.Water && map.get(x, y - 1) !== Cell.Solid) return { x: x + 0.5, y };
    }
    return null;
  }

  /**
   * The cloud a power acts on. Wind pushes the cloud you stand on, else the
   * level's own clouds (the puzzle pieces) before ones you made. Rain looks
   * for a grey cloud first.
   */
  private nearestCloud(forPower: 'wind' | 'rain' | 'any' = 'any'): Cloud | null {
    const near = this.clouds.filter((c) => !c.gone && Math.abs(c.x + c.w / 2 - this.cx) < CLOUD_REACH && Math.abs(c.y - this.body.y) < 9);
    if (!near.length) return null;
    const dist = (c: Cloud) => Math.abs(c.x + c.w / 2 - this.cx);
    const closest = (list: Cloud[]) => list.sort((a, b) => dist(a) - dist(b))[0] ?? null;
    if (forPower === 'wind') {
      const on = near.find((c) => c.id === this.body.standingOn);
      if (on) return on;
      return closest(near.filter((c) => !c.made)) ?? closest(near);
    }
    if (forPower === 'rain') return closest(near.filter((c) => c.kind === 'grey')) ?? closest(near);
    return closest(near);
  }

  use(p: Power): void {
    if (this.paused || this.done || !this.def.powers.includes(p)) return;
    this.castT = 0.4;
    this.castPower = p;
    this.cb.onSound('cast');
    const from = { x: this.cx + this.body.facing * 0.9, y: this.body.y + 0.2 };
    const effect = (tx: number, ty: number) => this.fx.push({ kind: p, x: from.x, y: from.y, tx, ty, t: 0 });
    const temp = this.tempHere();
    // the wet washing and the windmill (the village requests)
    if (p === 'sun' && this.laundry && !this.laundry.dry && this.ahead(this.laundry.x + 1.2)) {
      this.laundry.dry = true;
      effect(this.laundry.x + 1.2, this.laundry.y);
      this.say('The Sun warms the wet washing. The water evaporates into the air.');
      this.completeRequest();
      return;
    }
    if (p === 'wind' && this.windmill && this.ahead(this.windmill.x + 0.5, 5) && !this.body.standingOn) {
      this.windmill.spin = 1;
      effect(this.windmill.x + 0.5, this.windmill.y - 1);
      this.say('The wind pushes the windmill’s blades round.');
      this.completeRequest();
      return;
    }
    // Wind and the storm cloud (the Storm Front)
    const st = this.storm;
    if (p === 'wind' && st && !st.out && !st.gone && Math.abs(st.x + st.w / 2 - this.cx) < 11) {
      st.push = 2.4;
      st.vx = this.body.facing * 4;
      st.pushed++;
      effect(st.x + st.w / 2, st.y + st.h * 0.6);
      this.say(
        st.pushed === 1
          ? 'The wind pushes the storm cloud along. (Make-believe! Real storms are steered by winds high up, and no one can push one.)'
          : this.body.facing < 0
            ? 'Oops, that pushes it back toward the village. The sea is the other way!'
            : 'Whoosh! Keep it moving toward the sea.',
      );
      return;
    }
    const pool = this.level.things.find((t) => t.kind === 'T' && this.ahead(t.x + 1));
    const tree = p === 'sun' ? this.trees.find((t) => this.ahead(t.x + 0.5)) : undefined;
    const water = pool ? { x: pool.x + 1, y: pool.y + 1 } : tree ? { x: tree.x + 0.5, y: tree.y + 1 } : this.waterAhead();
    const fall = this.falls.find((f) => !f.frozen && this.ahead(f.x + 0.5, 3.5));
    const iceWall = this.ice.find((b) => !b.gone && !b.melting && this.ahead(b.x + 0.5));
    const bank = this.snowbank && this.snowbank.left > 0 && !this.snowbank.melting && this.ahead(this.snowbank.x + 1) ? this.snowbank : null;
    const vapor = this.vapors.find((v) => v.t > 0 && this.ahead(v.x, 5.5));
    const cloud = this.nearestCloud(p === 'wind' || p === 'rain' ? p : 'any');
    const spot: Spot = { temp, water: !!water || !!fall, ice: !!iceWall || !!bank, vapor: !!vapor, cloud: cloud ? cloud.kind : null };
    const res = cast(p, spot);
    let say = res.say;
    switch (res.effect) {
      case 'melt':
        if (iceWall) {
          iceWall.melting = true;
          effect(iceWall.x + 0.5, iceWall.y + 2);
        } else if (bank) {
          bank.melting = true;
          effect(bank.x + 1, bank.y + 0.5);
          say = 'The Sun warms the snow. It melts, and the water runs downhill.';
        }
        break;
      case 'evaporate': {
        if (tree && !pool) say = 'The Sun warms the tree’s leaves. They give off water vapor, and the warm, damp air rises.';
        const at = water ?? { x: fall!.x + 0.5, y: fall!.bottom + 1 };
        this.vapors = this.vapors.filter((v) => Math.abs(v.x - at.x) > 1.5);
        this.vapors.push({ x: at.x, surface: at.y, t: 9 });
        effect(at.x, at.y);
        break;
      }
      case 'condense': {
        const v = vapor!;
        const cw = this.gear.has('bigcloud') ? 4.5 : 3;
        const c: Cloud = { id: `made${this.frame}`, x: v.x - cw / 2, y: v.surface - 2, w: cw, h: 0.6, oneWay: true, kind: 'cumulus', vx: 0, push: 0, made: true, boarded: false, rain: 0, snow: false };
        // if the warm air has lifted the wizard out over the water, below where the cloud would form, it forms under their feet
        const feet = this.body.y + this.body.h;
        const over = this.body.x + this.body.w > c.x && this.body.x < c.x + c.w;
        let overWater = true;
        for (let y = Math.floor(feet); y <= v.surface; y++) {
          const below = this.level.map.get(Math.floor(this.cx), y);
          if (below === Cell.Solid || below === Cell.Ice) overWater = false;
        }
        if (over && overWater && !this.body.onGround && feet > c.y && feet < v.surface - 0.3) {
          c.y = feet;
          this.body.vy = 0;
        }
        this.clouds.push(c);
        v.t = 0;
        effect(v.x, v.surface - 1.5);
        if (this.def.request?.kind === 'shade' && this.villager && Math.abs(this.villager.x + 0.5 - v.x) < 4.5) this.completeRequest();
        break;
      }
      case 'push':
        cloud!.push = 2.4;
        cloud!.vx = this.body.facing * 2.6;
        effect(cloud!.x + cloud!.w / 2, cloud!.y);
        break;
      case 'freeze': {
        const map = this.level.map;
        const x0 = Math.floor(this.cx);
        for (let i = -2; i <= 10; i++) {
          const x = x0 + this.body.facing * i;
          for (let y = 0; y < map.h; y++) if (map.get(x, y) === Cell.Water) map.set(x, y, Cell.Ice);
        }
        for (const f of this.falls) if (!f.frozen && Math.abs(f.x + 0.5 - this.cx) < 4.5) this.freezeFall(f);
        effect(from.x + this.body.facing * 3, from.y + 1.5);
        break;
      }
      case 'rain':
      case 'snow': {
        const c = cloud!;
        c.rain = 2.6;
        c.snow = res.effect === 'snow';
        effect(c.x + c.w / 2, c.y);
        const under = (x: number) => x >= c.x - 0.5 && x <= c.x + c.w + 0.5;
        if (res.effect === 'rain') {
          for (const s of this.seeds) if (!s.rows && under(s.x + 1)) this.growVine(s);
          for (const bd of this.beds) if (!bd.filled && !bd.fillT && Math.abs(bd.cx - (c.x + c.w / 2)) < 7) bd.fillT = 1.2;
          if (this.field && !this.field.wet && (under(this.field.x + 1) || under(this.field.x + 4))) {
            this.field.wet = true;
            this.completeRequest();
          }
        } else if (this.def.request?.kind === 'snow' && this.villager && Math.abs(this.villager.x - (c.x + 1.5)) < 8) this.completeRequest();
        say += ' Now the cloud has dropped its water. It is small and white again.';
        break;
      }
      case 'none':
        effect(from.x + this.body.facing * 3, from.y);
        this.cb.onSound('fail');
        break;
    }
    this.say(say, res.effect === 'none' ? 5 : 4.5);
  }

  private freezeFall(f: Fall): void {
    f.frozen = true;
    // icy steps every two tiles, from just above the ground up to the top
    for (let y = f.bottom - 1; y >= f.top; y -= 2) {
      this.level.map.set(f.x, y, Cell.Ledge);
      this.skip.add(y * this.level.map.w + f.x);
    }
  }

  private growVine(s: { x: number; y: number; grown: number; rows: number }): void {
    const map = this.level.map;
    let rows = 0;
    for (let k = 1; k <= 8; k++) {
      const y = s.y - k;
      if (y < 0 || map.get(s.x, y) === Cell.Solid) break;
      rows = k;
      if (k % 2 === 1)
        for (const x of [s.x, s.x + 1]) {
          map.set(x, y, Cell.Ledge);
          this.skip.add(y * map.w + x);
        }
    }
    s.rows = rows;
  }

  private completeRequest(): void {
    if (this.requestDone) return;
    this.requestDone = true;
    this.cb.onSound('vane');
    window.setTimeout(() => this.cb.onRequest('done'), 900);
  }

  // ---------------------------------------------------------------- one step

  private stepGame(dt: number): void {
    if (this.done) return;
    const b = this.body;
    this.time += dt;
    const c: Controls = { left: this.held.left, right: this.held.right, jump: this.jumpPressed, jumpHeld: this.held.jump };
    this.jumpPressed = false;
    if (this.bump > 0) {
      this.bump -= dt;
      c.left = c.right = false;
    }
    const map = this.level.map;
    // clouds: pushed by the wind, carried by the breeze, raining
    const plats: Platform[] = [];
    if (this.raft) {
      this.stepRaft(dt);
      plats.push(this.raft);
    }
    for (const bd of this.beds)
      if (!bd.filled && bd.fillT > 0) {
        bd.fillT -= dt;
        if (bd.fillT <= 0) {
          bd.filled = true;
          for (const v of bd.cells) map.set(v.x, v.y, Cell.Water);
          const well = this.def.request?.kind === 'well' && this.villager && Math.abs(this.villager.x - bd.cx) < 10;
          this.say(
            well
              ? 'The rain soaks into the ground and fills the gaps in the rock. The groundwater rises, and the well fills up.'
              : 'The rain runs into the dry riverbed and fills it. The river flows again!',
            6,
          );
          if (this.villager && Math.abs(this.villager.x - bd.cx) < 12 && (this.def.request?.kind === 'fill' || well)) this.completeRequest();
        }
      }
    this.stepFolks(dt);
    this.stepStorm(dt);
    if (this.def.stormy) this.stepLightning(dt);
    if (this.def.countAt !== undefined && !this.countAsked && this.cx >= this.def.countAt) {
      this.countAsked = true;
      this.release();
      this.cb.onCount?.();
    }
    for (const cl of this.clouds) {
      cl.dx = 0;
      let vx = 0;
      if (cl.push > 0) {
        cl.push -= dt;
        vx = cl.vx;
      } else if (cl.made && cl.boarded && this.def.breeze) vx = this.def.breeze;
      if (this.body.standingOn === cl.id) cl.boarded = true;
      if (vx) {
        const nx = Math.max(0, Math.min(map.w - cl.w, cl.x + vx * dt));
        if (!this.blocked(nx, cl.y, cl.w, cl.h)) {
          cl.dx = nx - cl.x;
          cl.x = nx;
        } else cl.push = 0;
      }
      if (cl.rain > 0) {
        cl.rain -= dt;
        if (cl.rain <= 0) {
          if (cl.kind === 'grey' && !cl.made) cl.refill = 6;
          cl.kind = 'cumulus';
        }
      }
      if (cl.refill !== undefined) {
        cl.refill -= dt;
        if (cl.refill <= 0) {
          cl.refill = undefined;
          cl.kind = 'grey';
          if (Math.abs(cl.x + cl.w / 2 - this.cx) < 14) this.say('More water vapor has condensed into the cloud. It is full and grey again.', 4);
        }
      }
      plats.push(cl);
    }
    for (const ib of this.ice) {
      if (ib.gone) continue;
      if (ib.melting) {
        ib.melt += dt / 1.6;
        if (ib.melt >= 1) ib.gone = true;
      }
      plats.push(ib);
    }
    if (this.snowbank?.melting && this.snowbank.left > 0) {
      this.snowbank.left = Math.max(0, this.snowbank.left - dt / 1.6);
      if (this.snowbank.left === 0) {
        for (const v of this.stream) map.set(v.x, v.y, Cell.Water);
        if (this.def.request?.kind === 'melt') this.completeRequest();
      }
    }
    for (const s of this.seeds) if (s.rows && s.grown < 1) s.grown = Math.min(1, s.grown + dt / 1.2);
    for (const v of this.vapors) v.t -= dt;
    this.vapors = this.vapors.filter((v) => v.t > 0);
    // warm air rises: inside a shimmer, you are lifted
    for (const v of this.vapors) {
      const feet = b.y + b.h;
      if (Math.abs(v.x - this.cx) < 2 && feet > v.surface - 7.5 && feet < v.surface + 0.5) b.vy = Math.max(b.vy - 120 * dt, -7.5);
    }
    const ev = step(b, c, map, plats, this.tuning, dt);
    // Maple Wings: holding jump while falling floats you down slowly
    if (this.gear.has('glider') && this.held.jump && !b.onGround && b.vy > 2.6) b.vy = 2.6;
    if ((window as unknown as { __wwbTrace?: unknown[] }).__wwbTrace) {
      const tr = (window as unknown as { __wwbTrace: unknown[] }).__wwbTrace;
      tr.push([
        +this.time.toFixed(2),
        +b.x.toFixed(2),
        +b.y.toFixed(3),
        b.standingOn,
        +b.vy.toFixed(2),
        c.left,
        c.right,
        c.jump,
        c.jumpHeld,
        this.clouds.map((q) => [q.id, +q.x.toFixed(2), +(q.dx ?? 0).toFixed(3), +q.push.toFixed(2)]),
      ]);
      if (tr.length > 400) tr.shift();
    }
    if (ev.jumped) this.cb.onSound('jump');
    if (ev.landed) {
      this.dripSquash = 0.15;
      this.cb.onSound('land');
    }
    if (ev.fell) this.fell();
    // crabs scuttle; touching one bumps you back (no harm done)
    for (const k of this.crabs) {
      k.x += k.dir * 1.4 * dt;
      if (k.x < k.x0 || k.x > k.x1) k.dir *= -1;
      if (this.bump <= 0 && Math.abs(k.x - this.cx) < 0.7 && b.y + b.h > k.y - 0.5 && b.y < k.y) {
        b.vx = (this.cx < k.x ? -1 : 1) * 7;
        b.vy = -7;
        this.bump = 0.4;
        this.cb.onSound('bump');
        this.say('Pinch! Crabs scuttle side to side. Jump over them.');
      }
    }
    // droplets
    for (const p of [...this.pickups, ...this.loose]) {
      if (p.got) continue;
      if (p.vy !== undefined) {
        p.vy += 20 * dt;
        p.y += p.vy * dt;
        const below = map.get(Math.floor(p.x), Math.floor(p.y + 0.2));
        if (below === Cell.Solid || below === Cell.Ice) {
          p.y = Math.floor(p.y + 0.2) - 0.05;
          p.vy = undefined;
        }
      }
      // Sticky Drops: droplets close by float over and join you
      if (this.gear.has('magnet') && p.vy === undefined) {
        const dx = this.cx - p.x;
        const dy = b.y + b.h / 2 - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 2.6 && d > 0.05) {
          const k = Math.min(1, (9 * dt) / d);
          p.x += dx * k;
          p.y += dy * k;
        }
      }
      if (Math.abs(p.x - this.cx) < 0.7 && p.y > b.y && p.y < b.y + b.h + 0.4) {
        p.got = true;
        this.carried++;
        this.cb.onSound('drop');
      }
    }
    // weather vanes
    for (const k of this.vanes)
      if (!k.lit && Math.abs(k.x + 0.5 - this.cx) < 0.9 && b.y < k.y + 1 && b.y + b.h > k.y - 2) {
        k.lit = true;
        this.respawn = { x: k.x, y: k.y };
        this.cb.onSound('vane');
      }
    // tips along the way
    this.def.tips.forEach(([x, text], i) => {
      if (!this.tipsShown.has(i) && this.cx >= x) {
        this.tipsShown.add(i);
        this.say(text, 6);
      }
    });
    // the villager asks once, the first time you come near
    if (this.villager && !this.villager.asked && Math.abs(this.villager.x + 0.5 - this.cx) < 2.2 && Math.abs(this.villager.y - b.y) < 3) {
      this.villager.asked = true;
      this.release();
      this.cb.onRequest('ask');
    }
    // the finish
    if (this.gateT > 0) this.gateT -= dt;
    const atFlag = Math.abs(this.flag.x + 0.5 - this.cx) < 0.8 && Math.abs(this.flag.y + 1 - (b.y + b.h)) < 1.5;
    const wait = atFlag ? this.finishBlocked() : null;
    if (wait) {
      if (this.gateT <= 0) {
        this.say(wait, 5);
        this.gateT = 5;
      }
    } else if (atFlag) {
      this.done = true;
      this.release();
      this.cb.onFinish({ drops: this.carried, total: this.total, falls: this.falls_, time: this.time });
    }
    this.cam = follow(this.cam, b, VIEW_W, VIEW_H, map, dt);
    const tx = this.cx - b.facing * 0.9;
    const ty = b.y - 0.1 + Math.sin(this.time * 3) * 0.12;
    this.dripX += (tx - this.dripX) * Math.min(1, dt * 6);
    this.dripY += (ty - this.dripY) * Math.min(1, dt * 6);
    if (this.dripSquash > 0) this.dripSquash -= dt;
    if (this.castT > 0) this.castT -= dt;
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter((f) => f.t < 0.7);
    if (this.windmill && this.windmill.spin) this.windmill.spin += dt;
  }

  /** The top row of the water at column x, looking down from row y0 (null if ground or a dry bed comes first). */
  private surfaceAt(x: number, y0: number): number | null {
    const map = this.level.map;
    const cx = Math.floor(x);
    for (let y = Math.max(0, y0); y < map.h; y++) {
      const c = map.get(cx, y);
      if (c === Cell.Water) return y;
      if (c === Cell.Solid || c === Cell.Ice || c === Cell.Ledge) {
        if (c === Cell.Ledge) continue;
        return null;
      }
    }
    return null;
  }

  /** The raft floats on the water, and once you stand on it the river carries it downstream, until a dry stretch or the bank. */
  private stepRaft(dt: number): void {
    const r = this.raft!;
    r.dx = 0;
    r.dy = 0;
    if (this.body.standingOn === r.id) r.moving = true;
    const row = Math.floor(r.y + 0.01);
    const here = this.surfaceAt(r.x + r.w / 2, row);
    if (here !== null && Math.abs(here - r.y) > 0.001) {
      // over the waterfall: drop down to the lower river
      const ny = r.y + Math.sign(here - r.y) * Math.min(Math.abs(here - r.y), 7 * dt);
      r.dy = ny - r.y;
      r.y = ny;
    }
    if (!r.moving) return;
    const ahead = this.surfaceAt(r.x + r.w + 0.15, row);
    if (ahead !== null && ahead >= row) {
      r.dx = 3 * dt;
      r.x += r.dx;
      r.waitingAt = null;
    } else {
      // stopped: a dry stretch (air, then the riverbed) or the bank
      const map = this.level.map;
      const fx = Math.floor(r.x + r.w + 0.15);
      const dry = map.get(fx, row) === Cell.Air;
      if (dry && r.waitingAt !== fx) {
        r.waitingAt = fx;
        this.say('The raft is stuck! The riverbed ahead is dry. Can a full, grey cloud rain on it?', 6);
      }
    }
  }

  /** Villagers outside in the storm hurry indoors when you reach them. */
  private stepFolks(dt: number): void {
    if (!this.folks.length) return;
    const houses = this.decor.filter((d) => d.kind === 'h');
    for (const f of this.folks) {
      if (f.inside) continue;
      if (f.goTo === null && Math.abs(f.x + 0.5 - this.cx) < 1.2 && Math.abs(f.y - this.body.y) < 2.5) {
        const home = houses.slice().sort((a, b) => Math.abs(a.x - f.x) - Math.abs(b.x - f.x))[0];
        f.goTo = home ? home.x : f.x;
        const left = this.folks.filter((o) => o.goTo === null).length;
        this.say(left ? `“Thank you! Going indoors!” ${left} more to go. When thunder roars, go indoors.` : 'Everyone is heading indoors. A building keeps you safe from lightning.', 5);
        this.cb.onSound('vane');
      }
      if (f.goTo !== null) {
        const d = f.goTo - f.x;
        if (Math.abs(d) < 0.15) {
          f.inside = true;
          if (this.def.request?.kind === 'shelter' && this.folks.every((o) => o.inside)) this.completeRequest();
        } else f.x += Math.sign(d) * Math.min(Math.abs(d), 4 * dt);
      }
    }
  }

  /** The storm cloud: pushed by Wind; over the cold sea it rains itself out and fades away. */
  private stepStorm(dt: number): void {
    const st = this.storm;
    if (!st || st.gone) return;
    if (!st.out && st.push > 0) {
      st.push -= dt;
      st.x = Math.max(st.x0 - 2, Math.min(this.level.map.w - st.w, st.x + st.vx * dt));
    }
    // the lighthouse's lightning rod
    if (this.lighthouse && !st.rodStruck && Math.abs(st.x + st.w / 2 - (this.lighthouse.x + 0.5)) < 2) {
      st.rodStruck = true;
      this.strikeAt(this.lighthouse.x + 0.5, this.lighthouse.y - 1.5, 0);
      this.say('Lightning hits the lighthouse’s rod! The thick wire carries it safely down into the ground. That is what a lightning rod is for.', 7);
    }
    if (!st.out && this.def.seaAt !== undefined && st.x + st.w / 2 > this.def.seaAt) {
      st.out = true;
      this.say('Over the cold sea, the storm gets less warm, wet air. It rains itself out and grows weaker.', 6);
    }
    if (st.out) {
      st.x += 0.6 * dt;
      st.left = Math.max(0, st.left - dt / 5);
      if (st.left === 0) {
        st.gone = true;
        if (this.def.request?.kind === 'storm') this.completeRequest();
        this.say('The storm has rained itself out! Its water has fallen back into the sea. Drip is home. Head for the end of the pier.', 7);
        this.cb.onSound('vane');
      }
    }
  }

  /** Lightning now and then on the Storm Front, with the seconds counted until the thunder. */
  private stepLightning(dt: number): void {
    const st = this.storm;
    if (st?.gone) return;
    this.nextFlash -= dt;
    if (this.nextFlash > 0 || this.count) return;
    this.nextFlash = 7 + Math.random() * 4;
    let delay: number;
    let x: number;
    if (st) {
      x = st.x + st.w / 2;
      delay = Math.round(Math.min(9, Math.abs(x - this.cx) / 4));
    } else {
      const far = this.decor.find((d) => d.kind === 'Q');
      x = far ? far.x + 0.5 : this.cx + 20;
      delay = Math.max(4, Math.round(9 - (4 * this.cx) / this.level.map.w));
    }
    this.strikeAt(x, (st ? st.y + st.h : 5) + 4, delay);
  }

  /** A flash at (x, y), with the thunder after this many seconds (the counter on screen counts them). */
  strikeAt(x: number, y: number, delay: number): void {
    const top = this.storm && !this.storm.gone ? this.storm.y + this.storm.h * 0.8 : 3;
    this.bolt = { x, y0: top, y1: y, t: 0.35 };
    this.flashA = this.calm ? 0.12 : 0.45;
    this.count = { t: 0, delay, after: 0 };
    if (delay === 0) this.cb.onSound('thunder');
  }

  /** Flash, count and thunder for Dr. Iris's question (it runs while the game is paused). */
  strike(delay: number): void {
    const far = this.decor.find((d) => d.kind === 'Q');
    this.strikeAt(far ? far.x + 0.5 : this.cx + 18, 8, delay);
  }

  /** The flash and the seconds counter, every frame (also while paused, for Dr. Iris's count). */
  private tickFlash(dt: number): void {
    if (this.flashA > 0) this.flashA = Math.max(0, this.flashA - dt * 2.5);
    if (this.bolt) {
      this.bolt.t -= dt;
      if (this.bolt.t <= 0) this.bolt = null;
    }
    const c = this.count;
    if (!c) {
      this.countEl.hidden = true;
      return;
    }
    if (c.t < c.delay) {
      c.t += dt;
      this.countEl.hidden = false;
      const n = Math.min(c.delay, Math.floor(c.t) + 1);
      const text = `Flash! Counting: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}…`;
      if (this.countEl.textContent !== text) this.countEl.textContent = text;
      if (c.t >= c.delay) this.cb.onSound('thunder');
    } else {
      c.after += dt;
      const km = c.delay / 3;
      const kmText = c.delay === 0 ? 'Right overhead!' : `${c.delay} second${c.delay === 1 ? '' : 's'}: about ${Number.isInteger(km) ? km : km.toFixed(1)} km away.`;
      const text = `Boom! Thunder. ${kmText}`;
      if (this.countEl.textContent !== text) this.countEl.textContent = text;
      this.countEl.hidden = false;
      if (c.after > 3) this.count = null;
    }
  }

  /** Why the flag cannot be reached yet, if it cannot. */
  private finishBlocked(): string | null {
    if (this.def.request?.kind === 'shelter' && this.folks.some((f) => f.goTo === null)) return 'Wait! Some people are still outside. Get everyone indoors first.';
    if (this.def.countAt !== undefined && !this.countDone) return 'Stop at Dr. Iris’s weather station first.';
    if (this.storm && !this.storm.gone) return 'The storm is still here. Push it out over the cold sea with Wind (3).';
    return null;
  }

  private blocked(x: number, y: number, w: number, hh: number): boolean {
    const map = this.level.map;
    for (let cy = Math.floor(y); cy <= Math.floor(y + hh - 0.01); cy++)
      for (let cx = Math.floor(x); cx <= Math.floor(x + w - 0.01); cx++) {
        const c = map.get(cx, cy);
        if (c === Cell.Solid || c === Cell.Ice) return true;
      }
    return false;
  }

  private fell(): void {
    this.falls_++;
    const lost = Math.min(3, this.carried);
    this.carried -= lost;
    placeAt(this.body, this.respawn.x, this.respawn.y);
    if (this.raft) {
      const r = this.raft;
      const s = this.surfaceAt(this.respawn.x + 0.5, 0);
      if (s === null) {
        r.x = r.x0;
        r.y = r.y0;
      } else {
        r.x = this.respawn.x + 0.5 - r.w / 2;
        r.y = s;
        this.body.y = s - this.body.h;
      }
      r.moving = false;
      r.waitingAt = null;
    }
    // a cloud made before the vane drifts back to where it can be reached again
    for (const c of this.clouds)
      if (c.made && Math.abs(c.x - this.respawn.x) > 12) {
        c.gone = true;
      }
    this.clouds = this.clouds.filter((c) => !c.gone);
    for (let i = 0; i < lost; i++) this.loose.push({ x: this.respawn.x + 1.6 + i * 0.9, y: this.respawn.y - 0.5, got: false, vy: -5 - i });
    this.cb.onSound('splash');
    this.say(lost ? `Splash! Drip dropped ${lost} droplet${lost > 1 ? 's' : ''}. Collect them again.` : 'Whoosh! Back to the weather vane.');
    this.cam = follow(this.cam, this.body, VIEW_W, VIEW_H, this.level.map, 0, true);
  }

  // ---------------------------------------------------------------- the loop and drawing

  private loop(now: number): void {
    this.acc += Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (this.paused) this.acc = 0;
    while (this.acc >= DT) {
      this.stepGame(DT);
      this.acc -= DT;
    }
    this.tickFlash(1 / 60);
    if (this.msgT > 0) {
      this.msgT -= 1 / 60;
      if (this.msgT <= 0) this.msg.style.opacity = '0';
    }
    this.draw();
    this.updatePrompt();
    this.raf = requestAnimationFrame(this.loop);
  }

  private updatePrompt(): void {
    let best: { id: string; x: number; y: number; label: string } | null = null;
    if (!this.paused && !this.done) {
      for (const p of this.people) if (Math.abs(p.x + 0.5 - this.cx) < 1.6) best = { id: p.id, x: p.x + 0.5, y: p.y - 0.6, label: p.id === 'X' ? 'Map' : 'Talk' };
      if (this.villager && this.villager.asked && Math.abs(this.villager.x + 0.5 - this.cx) < 1.8) best = { id: 'R', x: this.villager.x + 0.5, y: this.villager.y - 0.6, label: 'Talk' };
    }
    this.target = best?.id ?? null;
    if (!best) {
      this.prompt.hidden = true;
      return;
    }
    if (this.prompt.dataset.label !== best.label) {
      this.prompt.dataset.label = best.label;
      this.prompt.replaceChildren(h('span', { text: best.label }), h('span', { class: 'kbd', text: 'E' }));
    }
    this.prompt.style.left = `${(best.x - this.cam.x) * T * this.scale}px`;
    this.prompt.style.top = `${(best.y - this.cam.y) * T * this.scale}px`;
    this.prompt.hidden = false;
  }

  private drawBackdrop(r: Region, alpha = 1): void {
    const ctx = this.ctx;
    const bd = backdropFor(r, false);
    ctx.globalAlpha = alpha;
    ctx.drawImage(bd.sky, 0, 0);
    for (const [layer, k] of [
      [bd.far, 0.2],
      [bd.near, 0.45],
    ] as const) {
      const off = Math.floor((this.cam.x * T * k) % VW);
      const dy = Math.round(-this.cam.y * T * k * 0.3);
      ctx.drawImage(layer, -off, dy);
      ctx.drawImage(layer, VW - off, dy);
    }
    ctx.globalAlpha = 1;
  }

  private drawTiles(): void {
    const map = this.level.map;
    const region = this.def.region;
    const x0 = Math.floor(this.cam.x);
    const y0 = Math.floor(this.cam.y);
    for (let y = y0; y <= y0 + Math.ceil(VIEW_H) + 1; y++)
      for (let x = x0; x <= x0 + VIEW_W + 1; x++) {
        if (x < 0 || x >= map.w || y < 0 || y >= map.h) continue;
        const c = map.get(x, y);
        if (c === Cell.Air || this.skip.has(y * map.w + x)) continue;
        const above = map.get(x, y - 1);
        let kind: TileKind;
        if (c === Cell.Solid) kind = above === Cell.Solid || above === Cell.Ice ? 'fill' : 'top';
        else if (c === Cell.Ledge) kind = 'ledge';
        else if (c === Cell.Water) kind = above === Cell.Water ? 'water' : 'waterTop';
        else kind = 'ice';
        const anim = kind === 'water' || kind === 'waterTop' ? Math.floor(this.frame / 8) % 4 : 0;
        const img = cached(`t-${region}-${kind}-${x % 4}-${anim}`, () => paintTile(T, region, kind, x % 4, anim));
        this.ctx.drawImage(img, Math.round((x - this.cam.x) * T), Math.round((y - this.cam.y) * T));
      }
  }

  /** Draw a sprite with its bottom middle at (x, y) in tiles. */
  private put(key: string, make: () => PixelBuffer, x: number, y: number): void {
    const img = cached(key, make);
    this.ctx.drawImage(img, Math.round((x - this.cam.x) * T - img.width / 2), Math.round((y - this.cam.y) * T - img.height));
  }

  private draw(): void {
    this.frame++;
    const f = Math.floor(this.frame / 8);
    const ctx = this.ctx;
    const b = this.body;
    const temp = this.tempHere();
    if (this.storm?.gone) this.drawBackdrop('shore');
    else this.drawBackdrop(this.def.region);
    const put = this.put.bind(this);
    for (const [x0, y0, x1, y1] of this.def.caves ?? []) {
      ctx.fillStyle = '#2e2620';
      ctx.fillRect(Math.round((x0 - this.cam.x) * T), Math.round((y0 - this.cam.y) * T), (x1 - x0 + 1) * T, (y1 - y0 + 1) * T);
      ctx.fillStyle = '#3a3028';
      for (let x = x0; x <= x1; x += 3) ctx.fillRect(Math.round((x + 0.4 - this.cam.x) * T), Math.round((y0 + ((x * 7) % 4) - this.cam.y) * T), 3, 3);
    }
    for (const t of this.trees) put(`tree-${t.x % 2}`, () => paintRainTree(T, t.x % 2), t.x + 0.5, t.y + 1);
    if (this.lighthouse) put(`lighthouse-${!!this.storm?.gone}`, () => paintLighthouse(T, !!this.storm?.gone), this.lighthouse.x + 0.5, this.lighthouse.y + 1);
    // scenery behind
    for (const d of this.decor) {
      if (d.kind === 'p') put(`palm-${d.x % 2}`, () => paintPalm(T, d.x % 2), d.x + 0.5, d.y + 1);
      else if (d.kind === 'n') put(`pine-${d.x % 2}-${tempAt(this.def, d.x) < 0}`, () => paintPine(T, tempAt(this.def, d.x) < 0, d.x % 2), d.x + 0.5, d.y + 1);
      else if (d.kind === 'h') put(`house-${d.x % 2}`, () => paintHouse(T, d.x % 2), d.x + 0.5, d.y + 1);
      else if (d.kind === 't') put(`tent-${d.x % 2}`, () => paintTent(T, d.x % 2), d.x + 0.5, d.y + 1);
      else if (d.kind === 'w') put(`mast-${f % 4}`, () => paintWeatherMast(T, f % 4), d.x + 0.5, d.y + 1);
      else if (d.kind === 'Q') put(`storm-${f % 4}`, () => paintStormCloud(T, f), d.x + 0.5, d.y + 4);
    }
    if (this.windmill) {
      const w = this.windmill;
      const fr = w.spin ? Math.floor(this.frame / 3) : 0;
      put(`mill-${fr % 9}`, () => paintWindmill(fr % 9), w.x + 0.5, w.y + 1);
    }
    for (const p of this.people) if (p.id === 'X') put('mapboard', paintMapBoard, p.x + 0.5, p.y + 1);
    this.drawTiles();
    // waterfalls (flowing, or frozen into steps)
    for (const fl of this.falls) {
      const hh = fl.bottom - fl.top + 1;
      put(`fall-${hh}-${fl.frozen}-${fl.frozen ? 0 : f % 4}`, () => paintWaterfall(T, hh, f, fl.frozen), fl.x + 0.5, fl.bottom + 1);
    }
    // tide pools, with the shimmer of warm air while the Sun warms them
    for (const t of this.level.things)
      if (t.kind === 'T') {
        const warm = this.vapors.some((v) => Math.abs(v.x - (t.x + 1)) < 1);
        put(warm ? `pool-w-${f % 4}` : 'pool', () => paintTidePool(T, 2, warm, f % 4), t.x + 1, t.y + 1.05);
      }
    for (const v of this.vapors) {
      const pool = this.level.things.some((t) => t.kind === 'T' && Math.abs(t.x + 1 - v.x) < 1);
      if (!pool) this.drawShimmer(v);
    }
    if (this.field) {
      const fd = this.field;
      put(`field-${fd.wet}`, () => paintField(fd.wet, fd.w), fd.x + fd.w / 2, fd.y + 1);
    }
    for (const s of this.seeds) {
      if (!s.rows) {
        ctx.fillStyle = WILD.leaf[2];
        const sx = Math.round((s.x + 1 - this.cam.x) * T);
        const sy = Math.round((s.y + 1 - this.cam.y) * T);
        ctx.fillRect(sx - 1, sy - 6, 2, 6);
        ctx.fillRect(sx - 4, sy - 7, 3, 2);
        ctx.fillRect(sx + 1, sy - 8, 3, 2);
        ctx.fillStyle = WILD.mud[2];
        ctx.fillRect(sx - 8, sy - 2, 16, 2);
      } else {
        const g = Math.round(s.grown * 8) / 8;
        put(`vine-${s.rows}-${g}`, () => paintVine(s.rows, g), s.x + 1, s.y);
      }
    }
    if (this.laundry) {
      const l = this.laundry;
      put(`laundry-${l.dry}`, () => paintLaundry(l.dry), l.x + 1.2, l.y + 1);
    }
    if (this.snowbank && this.snowbank.left > 0) {
      const lf = Math.round(this.snowbank.left * 8) / 8;
      put(`bank-${lf}`, () => paintSnowbank(lf), this.snowbank.x + 1, this.snowbank.y + 1);
    }
    for (const ib of this.ice)
      if (!ib.gone) {
        const m = Math.round(ib.melt * 8) / 8;
        put(`ice-${m}`, () => paintIceBlock(T, 4, m), ib.x + 0.5, ib.y + 4);
      }
    for (const cl of this.clouds) {
      put(`cloud-${cl.kind}-${f % 2}`, () => paintCloud(T, 3, cl.kind, f % 2), cl.x + cl.w / 2, cl.y + (cl.kind === 'grey' ? 0.75 : 0.65));
      if (cl.rain > 0) {
        const below = 6;
        put(`rain-${cl.snow}-${f % 8}`, () => paintRain(3 * T, below * T, f % 8, cl.snow), cl.x + cl.w / 2, cl.y + 0.6 + below);
      }
    }
    for (const k of this.vanes) put(`vane-${k.lit}-${k.lit ? f % 8 : 0}`, () => paintVane(T, k.lit, f % 8), k.x + 0.5, k.y + 1);
    if (this.raft) put('raft', () => paintRaft(T), this.raft.x + this.raft.w / 2, this.raft.y + 0.4);
    for (const fk of this.folks)
      if (!fk.inside) {
        const face = fk.goTo !== null ? (fk.goTo < fk.x ? 'left' : 'right') : this.cx < fk.x + 0.5 ? 'left' : 'right';
        put(`folk-${fk.look}-${face}`, () => paintHero(VILLAGERS[fk.look], 1.5, face), fk.x + 0.5, fk.y + 1);
      }
    put(`flag-${f % 4}`, () => paintFlag(T, f % 4), this.flag.x + 0.5, this.flag.y + 1);
    // people
    if (this.villager) {
      const v = this.villager;
      const face = this.cx < v.x + 0.5 ? 'left' : 'right';
      put(`villager-${v.look}-${face}`, () => paintHero(VILLAGERS[v.look], 1.5, face), v.x + 0.5, v.y + 1);
    }
    for (const p of this.people) {
      const face = this.cx < p.x + 0.5 ? 'left' : 'right';
      if (p.id === 'N') put(`nimbus-${face}`, () => paintWizard(NIMBUS, T, face, { hat: 'tall' }), p.x + 0.5, p.y + 1);
      else if (p.id === 'J') put(`iris-${face}`, () => paintHero(IRIS_OKORO, 1.5, face), p.x + 0.5, p.y + 1);
      else if (p.id === 'A') put(`tala-${face}`, () => paintHero(RANGER_TALA, 1.5, face), p.x + 0.5, p.y + 1);
    }
    for (const p of [...this.pickups, ...this.loose]) if (!p.got) put(`drop-${f % 4}`, () => paintDroplet(T, f % 4), p.x, p.y);
    for (const k of this.crabs) put(`crab-${f % 2}`, () => paintCrab(T, f % 2), k.x, k.y);
    // the wizard
    const face = b.facing > 0 ? 'right' : 'left';
    let pose: WizardPose = 'stand';
    if (this.castT > 0) pose = 'cast';
    else if (!b.onGround) pose = b.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(b.vx) > 0.4) pose = 'run';
    const wf = pose === 'run' ? Math.floor(this.frame / 6) % 4 : pose === 'cast' ? f % 4 : 0;
    const blink = pose === 'stand' && this.frame % 200 < 8;
    put(`me-${pose}-${face}-${wf}-${pose === 'cast' ? this.castPower : ''}-${blink}`, () => paintWizard(this.look, T, face, { pose, frame: wf, power: this.castPower, blink }), this.cx, b.y + b.h);
    // Drip
    if (this.def.num) {
      const lifted = this.vapors.some((v) => Math.abs(v.x - this.cx) < 2) && !b.onGround;
      const form: DripForm = lifted ? 'vapor' : this.def.region === 'clouds' ? 'cloud' : this.def.region === 'mountain' && temp < 0 ? 'snow' : this.def.region === 'river' ? 'river' : 'drop';
      const df = this.dripSquash > 0 ? 1 : !b.onGround ? 2 : f % 6 === 5 ? 3 : 0;
      put(`drip-${form}-${df}-${form === 'vapor' ? f % 4 : 0}`, () => paintDrip(T, form, form === 'vapor' ? f % 4 : df, false), this.dripX, this.dripY + 0.7);
    }
    for (const e of this.fx) this.drawFx(e);
    const st = this.storm;
    if (st && !st.gone) {
      ctx.globalAlpha = st.left;
      put(`rain-storm-${f % 8}`, () => paintRain(5 * T, 8 * T, f % 8), st.x + st.w / 2, st.y + st.h + 7);
      put(`stormcloud-${f % 4}-${this.flashA > 0.2}`, () => paintStormCloud(T, f, this.flashA > 0.2), st.x + st.w / 2, st.y + st.h);
      ctx.globalAlpha = 1;
    }
    if (this.bolt) {
      const hh = Math.max(2, Math.round((this.bolt.y1 - this.bolt.y0) * T));
      put(`bolt-${hh}`, () => paintBolt(hh, 3), this.bolt.x, this.bolt.y1);
    }
    if (this.flashA > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashA.toFixed(3)})`;
      ctx.fillRect(0, 0, VW, VH);
    }
    if (temp < 0 && this.def.num)
      ctx.drawImage(
        cached(`snow-${f % 16}`, () => paintRain(VW, VH, f % 16, true)),
        0,
        0,
      );
    if (this.gear.has('radar') && this.def.num) this.drawRadar();
    // HUD text
    if (this.def.num) this.dropText.textContent = `${this.carried} / ${this.total}`;
    if (this.thermBox.dataset.t !== String(temp)) {
      this.thermBox.dataset.t = String(temp);
      this.thermBox.replaceChildren(h('img', { src: paintThermometer(16, temp).toDataURL(1), alt: '', width: 8, height: 28, class: 'px' }));
      this.tempText.textContent = `${temp < 0 ? '−' : ''}${Math.abs(temp)} °C`;
    }
  }

  /** Weather Radar: an arrow at the edge of the screen points to the nearest droplet still to collect, when it is off screen. */
  private drawRadar(): void {
    let best: Pickup | null = null;
    let bd = Infinity;
    for (const p of [...this.pickups, ...this.loose]) {
      if (p.got) continue;
      const d = Math.hypot(p.x - this.cx, p.y - this.body.y);
      if (d < bd) ((bd = d), (best = p));
    }
    if (!best) return;
    const sx = (best.x - this.cam.x) * T;
    const sy = (best.y - this.cam.y) * T;
    const m = 14;
    if (sx > m && sx < VW - m && sy > m && sy < VH - m) return;
    const px = Math.max(m, Math.min(VW - m, sx));
    const py = Math.max(m, Math.min(VH - m, sy));
    const a = Math.atan2(sy - VH / 2, sx - VW / 2);
    const ctx = this.ctx;
    const pulse = 0.65 + 0.35 * Math.sin(this.frame * 0.15);
    ctx.save();
    ctx.translate(Math.round(px), Math.round(py));
    ctx.rotate(a);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#123247';
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-6, -7);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7fe0ff';
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, -5);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawShimmer(v: Vapor): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let k = 0; k < 5; k++)
      for (let t = 0; t < 30; t += 1) {
        if ((t + this.frame / 4 + k) % 3 < 1) continue;
        const x = (v.x - 1.2 + k * 0.6 - this.cam.x) * T + Math.sin(t * 0.4 + this.frame * 0.1 + k) * 1.5;
        const y = (v.surface - this.cam.y) * T - t * 4;
        ctx.fillRect(Math.round(x), Math.round(y), 1, 2);
      }
  }

  private drawFx(e: Fx): void {
    const ctx = this.ctx;
    const k = e.t / 0.7;
    const sx = (e.x - this.cam.x) * T;
    const sy = (e.y - this.cam.y) * T;
    const tx = (e.tx - this.cam.x) * T;
    const ty = (e.ty - this.cam.y) * T;
    ctx.fillStyle = POWER_COLOR[e.kind];
    if (e.kind === 'sun') {
      for (let i = 0; i < 14; i++) {
        const t = (i / 14 + k) % 1;
        ctx.fillRect(Math.round(sx + (tx - sx) * t), Math.round(sy + (ty - sy) * t + Math.sin(i) * 2), 2, 2);
      }
      ctx.globalAlpha = 1 - k;
      ctx.beginPath();
      ctx.arc(tx, ty, 6 + k * 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (e.kind === 'wind') {
      ctx.globalAlpha = 1 - k;
      const fr = Math.floor(e.t * 12) % 6;
      ctx.drawImage(
        cached(`gust-${fr}`, () => paintGust(T, 3, fr)),
        Math.round(tx - T * 1.5 - (1 - k) * 20 * Math.sign(tx - sx || 1)),
        Math.round(ty - 8),
      );
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = 1 - k;
      for (let i = 0; i < 18; i++) {
        const a = i * 2.4;
        const d = k * 26 * ((i % 3) + 1) * 0.5;
        ctx.fillRect(Math.round(tx + Math.cos(a) * d), Math.round(ty + Math.sin(a) * d * 0.6), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---------------------------------------------------------------- for the browser test

  state() {
    const b = this.body;
    return {
      level: this.def.id,
      x: b.x,
      y: b.y,
      onGround: b.onGround,
      standingOn: b.standingOn,
      carried: this.carried,
      total: this.total,
      falls: this.falls_,
      done: this.done,
      requestDone: this.requestDone,
      respawn: { ...this.respawn },
      temp: this.tempHere(),
      vapors: this.vapors.length,
      clouds: this.clouds.map((c) => ({ id: c.id, x: c.x, y: c.y, kind: c.kind, made: c.made })),
      iceGone: this.ice.map((i) => !!i.gone),
      fallsFrozen: this.falls.map((f) => f.frozen),
      vines: this.seeds.map((s) => s.rows),
      melted: this.snowbank ? this.snowbank.left === 0 : null,
      target: this.target,
      paused: this.paused,
      easy: this.easy,
      gear: [...this.gear],
      raft: this.raft ? { x: this.raft.x, y: this.raft.y, moving: this.raft.moving } : null,
      beds: this.beds.map((b) => b.filled),
      folks: this.folks.map((f) => ({ x: f.x, going: f.goTo !== null, inside: f.inside })),
      storm: this.storm ? { x: this.storm.x, cx: this.storm.x + this.storm.w / 2, out: this.storm.out, gone: this.storm.gone, rod: this.storm.rodStruck } : null,
      countDone: this.countDone,
      counting: this.count ? { t: this.count.t, delay: this.count.delay } : null,
    };
  }

  teleport(x: number, y: number): void {
    placeAt(this.body, x, y);
    this.cam = follow(this.cam, this.body, VIEW_W, VIEW_H, this.level.map, 0, true);
  }

  face(dir: 1 | -1): void {
    this.body.facing = dir;
  }
}
