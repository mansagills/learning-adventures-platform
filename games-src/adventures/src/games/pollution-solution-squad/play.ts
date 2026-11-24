import { iconImg } from '../../kit/art/icons';
import { PixelBuffer } from '../../kit/art/pixel';
import { add, canCraft, count, craft, missing, takeDown, type Inventory } from '../../kit/craft/workbench';
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
import { touchControlsVisible } from '../../kit/systems/settings';
import { speak } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { paintHero, type Look16 } from '../../kit/worlds/hero16';
import { paintPalm, paintHeron, RANGER_TALA } from '../../kit/worlds/wild-lands/art';
import {
  GAUGE_NAME,
  MARISOL_VEGA,
  NATURE,
  RAFI_HADDAD,
  ROSA_DELGADO,
  TRASH,
  WEN_LI,
  VISITOR_NAME,
  VISITOR_NEEDS,
  paintBoat,
  paintBoom,
  paintBus,
  paintCadet,
  paintCoastBackdrop,
  paintCoastTile,
  paintDrainPipe,
  paintField,
  paintFish,
  paintGaugeIcon,
  paintGhostNet,
  paintGull,
  paintKayak,
  paintLotTile,
  paintMill,
  paintNatural,
  paintNature,
  paintOilSlick,
  paintOllie,
  paintSparkle,
  paintSquadFlag,
  paintSquadHut,
  paintStake,
  paintStormDrain,
  paintTownHouse,
  paintTrash,
  paintVisitor,
  paintWorkbench,
  type CadetPose,
  type CoastBackdrop,
  type CoastTileKind,
  type Murk,
  type NatureId,
  type NetDesign,
  type OlliePose,
  type TrashId,
  type VisitorId,
} from '../../kit/worlds/wild-lands/coast-art';
import { paintBoard, paintCrate, paintFix, paintLidBins, paintSortStation, paintTankFix } from './art';
import { artStretch, BURIED, LITTER, LOT, type LevelDef } from './levels';
import { canAfford, NATURE_COST, pay, pieceAt, placeProblem, visitors, type Placed } from './nature';
import { RECIPES, type RecipeId } from './problems';
import { paintCrab } from '../../kit/worlds/wild-lands/weather-art';

/**
 * The side-scrolling play screen: one level (or Beach Camp) drawn on a small
 * pixel canvas scaled up by whole numbers, with the cadet, Ollie, the trash,
 * the Workbench, the blueprint stakes and their tests, the kayak and, at camp,
 * the Nature Center. The game around it (talk, the Squad Journal, saving)
 * listens through the callbacks.
 */

export const T = 24;
export const VW = 480;
export const VH = 270;
const VIEW_W = VW / T;
const VIEW_H = VH / T;
const DT = 1 / 60;
/** How long a fix is tested (seconds). */
const TEST_TIME = 4.5;
/** The half-2 fixes, drawn with paintFix. */
type Fix2 = 'reeds' | 'filter' | 'buffer' | 'rain-garden' | 'mill-filter';
const FIX2: readonly RecipeId[] = ['reeds', 'filter', 'buffer', 'rain-garden', 'mill-filter'];
/** Fixes tested in a rainstorm. */
const RAINY: readonly RecipeId[] = ['reeds', 'filter', 'buffer', 'rain-garden', 'drain-net'];

export interface FinishResult {
  /** The backpack at the flag. */
  bag: Inventory;
  /** What was picked up this time (for the sorting station). */
  picked: TrashId[];
  time: number;
  falls: number;
}

export type SoundKind = 'jump' | 'land' | 'grab' | 'build' | 'works' | 'half' | 'splash' | 'flag' | 'bump' | 'nope' | 'place';

export interface PlayCallbacks {
  onFinish(r: FinishResult): void;
  /** Camp: someone or something to talk to or use (M R T S J Q). */
  onTalk(id: string): void;
  /** A story moment the game shows in the talk box. */
  onStory(key: 'ollie' | 'built', recipe?: RecipeId): void;
  /** A design was built and tested. */
  onTested(recipe: RecipeId, design: string, works: boolean): void;
  onPickup(id: TrashId): void;
  /** The Nature Center changed (camp). */
  onNature(placed: Placed[], bag: Inventory, newVisitors: VisitorId[]): void;
  onEasy(on: boolean): void;
  onMenu(): void;
  onSound(kind: SoundKind): void;
}

export interface PlayOptions {
  easy: boolean;
  look: Look16;
  bag: Inventory;
  /** Ollie comes along (freed in the first level). */
  ollie: boolean;
  /** The level has been finished before: its fixes are already built. */
  levelDone: boolean;
  /** Camp: the Nature Center. */
  nature?: { placed: Placed[]; unlocked: NatureId[]; seen: VisitorId[] };
}

interface Pick {
  id: TrashId;
  x: number;
  y: number;
  got: boolean;
  buried: boolean;
  vx?: number;
}
interface Crab {
  x: number;
  y: number;
  x0: number;
  x1: number;
  dir: number;
}
interface Stake {
  x: number;
  y: number;
  recipe: RecipeId;
  design: string | null;
  works: boolean;
  /** Seconds left in the test (0 when not testing). */
  testing: number;
}
interface Kayak extends Platform {
  x0: number;
  min: number;
  max: number;
  vx: number;
}

const cache = new Map<string, HTMLCanvasElement>();
function cached(key: string, make: () => PixelBuffer): HTMLCanvasElement {
  let c = cache.get(key);
  if (!c) cache.set(key, (c = make().toCanvas(1)));
  return c;
}
const backdrops = new Map<string, CoastBackdrop>();

export class Play {
  readonly el: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  readonly level: Level;
  readonly body: Body;
  paused = false;
  private tuning: Tuning;
  private easy: boolean;
  private look: Look16;
  private cam: Camera = { x: 0, y: 0 };
  private respawn: { x: number; y: number };
  private picks: Pick[] = [];
  private crabs: Crab[] = [];
  private flags: Array<{ x: number; y: number; lit: boolean }> = [];
  private stakes: Stake[] = [];
  private shells: LevelThing[];
  private benches: LevelThing[];
  private people: LevelThing[];
  private decor: LevelThing[];
  private ghosts: Array<{ x: number; y: number; got: boolean }> = [];
  private kayak: Kayak | null = null;
  private drain: LevelThing | null;
  private boat: LevelThing | null;
  private bins: LevelThing | null;
  private flag: LevelThing;
  bag: Inventory;
  private picked: TrashId[] = [];
  private carrying: { recipe: RecipeId; design: string } | null = null;
  private ollie: { free: boolean; x: number; y: number; face: 1 | -1; sniff: number; tangled: LevelThing | null };
  private washT = 0;
  private washed = 0;
  private time = 0;
  private falls = 0;
  private done = false;
  private grabT = 0;
  private bump = 0;
  private frame = 0;
  private tipsShown = new Set<number>();
  private target: { id: string; x: number; y: number; label: string } | null = null;
  private total: number;
  // the Nature Center (camp)
  private nature: { placed: Placed[]; unlocked: NatureId[]; seen: VisitorId[] } | null;
  private building = false;
  private pickPiece: NatureId | 'remove' = 'beachgrass';
  private cursor = 3;
  private buildBar: HTMLElement | null = null;
  // input
  private held = { left: false, right: false, jump: false };
  private jumpPressed = false;
  private raf = 0;
  private acc = 0;
  private last = performance.now();
  private readonly offs: Array<() => void> = [];
  private modal: Modal | null = null;
  // HUD
  private bagText!: HTMLElement;
  private gaugeFill!: HTMLElement;
  private msg!: HTMLElement;
  private msgT = 0;
  private prompt!: HTMLButtonElement;
  private pad!: HTMLElement;
  private bar!: HTMLElement;
  private easyBtn: HTMLButtonElement | null = null;
  private scale = 2;

  constructor(
    private readonly host: HTMLElement,
    readonly def: LevelDef,
    opts: PlayOptions,
    private readonly cb: PlayCallbacks,
  ) {
    this.level = parseLevel(def.rows);
    this.easy = opts.easy;
    this.tuning = this.easy ? EASY : NORMAL;
    this.look = opts.look;
    this.bag = { ...opts.bag };
    this.body = newBody(0, 0);
    this.respawn = { ...this.level.spawn };
    const th = this.level.things;
    const of = (k: string) => th.filter((t) => t.kind === k);
    this.picks = th.filter((t) => LITTER[t.kind]).map((t) => ({ id: LITTER[t.kind], x: t.x + 0.5, y: t.y + 1, got: false, buried: BURIED.includes(t.kind) }));
    this.total = this.picks.length;
    this.flags = of('C').map((t) => ({ x: t.x, y: t.y, lit: false }));
    this.crabs = of('K').map((t) => ({ x: t.x + 0.5, y: t.y + 1, x0: t.x - 2, x1: t.x + 3, dir: 1 }));
    this.stakes = of('X').map((t, i) => {
      const recipe = def.builds[i];
      const best = RECIPES[recipe].designs.find((d) => d.outcome === 'works')!.id;
      return { x: t.x, y: t.y, recipe, design: opts.levelDone ? best : null, works: opts.levelDone, testing: 0 };
    });
    this.shells = of('s');
    this.benches = of('W');
    this.people = th.filter((t) => 'MRTSJQN'.includes(t.kind));
    this.decor = th.filter((t) => 'puHrtzLUVZnwo'.includes(t.kind));
    this.ghosts = of('G').map((t) => ({ x: t.x + 0.5, y: t.y + 1, got: opts.levelDone }));
    this.drain = of('D')[0] ?? null;
    this.boat = of('B')[0] ?? null;
    this.bins = of('Y')[0] ?? null;
    this.flag = of('F')[0] ?? { kind: 'F', x: -10, y: -10 };
    const k = of('k')[0];
    if (k && def.kayak) this.kayak = { id: 'kayak', x: k.x, y: k.y + 1, w: 2.2, h: 0.4, oneWay: true, x0: k.x, min: def.kayak[0], max: def.kayak[1] - 1.2, vx: 0 };
    const tangled = def.num === 1 && def.stretch === 'beach' ? (of('O')[0] ?? null) : null;
    this.ollie = {
      free: opts.ollie,
      x: 0,
      y: 0,
      face: 1,
      sniff: 0,
      tangled: opts.ollie ? null : tangled,
    };
    if (!this.ollie.free && tangled) {
      this.ollie.x = tangled.x + 0.5;
      this.ollie.y = tangled.y + 1;
    }
    this.nature = opts.nature ? { placed: [...opts.nature.placed], unlocked: [...opts.nature.unlocked], seen: [...opts.nature.seen] } : null;
    placeAt(this.body, this.respawn.x, this.respawn.y);
    if (this.ollie.free) {
      this.ollie.x = this.body.x - 1;
      this.ollie.y = this.body.y + this.body.h;
    }
    this.cam = follow(this.cam, this.body, VIEW_W, VIEW_H, this.level.map, 0, true);

    this.canvas = h('canvas', { class: 'pss-canvas', width: VW, height: VH, 'aria-label': def.num ? `${def.name}: the level` : 'Beach Camp' }) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.el = h('div', { class: 'pss-play' });
    const box = h('div', { class: 'pss-box' }, this.canvas);
    this.el.append(box);
    this.buildHud(box);
    host.prepend(this.el);
    this.fit();
    this.listen();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  setLook(look: Look16): void {
    this.look = look;
    for (const key of [...cache.keys()]) if (key.startsWith('me-') || key.startsWith('kayak-')) cache.delete(key);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    for (const off of this.offs) off();
    this.modal?.close();
    this.el.remove();
  }

  // ---------------------------------------------------------------- HUD and controls

  private buildHud(box: HTMLElement): void {
    const camp = this.def.num === 0;
    this.bagText = h('span', { class: 'pss-bag' });
    const fill = h('b', {});
    this.gaugeFill = fill;
    const gauge = camp
      ? null
      : h(
          'span',
          { class: 'pss-gauge', title: GAUGE_NAME[this.def.gauge] },
          h('img', { src: paintGaugeIcon(16, this.def.gauge).toDataURL(1), alt: '', width: 12, height: 12, class: 'px' }),
          h('span', { text: GAUGE_NAME[this.def.gauge] }),
          h('i', {}, fill),
        );
    const hud = h('div', { class: 'pss-hud', 'aria-live': 'off' }, this.bagText, h('span', { class: 'gap' }), h('span', { class: 'pss-level', text: camp ? 'Beach Camp' : this.def.name }), gauge);
    this.msg = h('div', { class: 'pss-msg', role: 'status', 'aria-live': 'polite' });
    this.msg.style.opacity = '0';
    this.prompt = h('button', { class: 'panel prompt pss-talkbtn', type: 'button', hidden: true, onclick: () => this.use() }) as HTMLButtonElement;
    box.append(hud, this.msg, this.prompt);

    this.bar = h('div', { class: 'pss-bar' });
    const hold = (icon: string, aria: string, key: 'left' | 'right' | 'jump') => {
      const btn = h('button', { class: 'btn pss-padbtn', type: 'button', 'aria-label': aria }, iconImg(icon, '', 24));
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
    this.pad = h('div', { class: 'pss-pad' }, hold('arrowLeft', 'Run left', 'left'), hold('arrowRight', 'Run right', 'right'), hold('arrowUp', 'Jump', 'jump'));
    const grabBtn = h(
      'button',
      { class: 'btn pss-act', type: 'button', 'aria-label': 'Grab (key G)', onclick: () => this.grab() },
      h('span', { text: 'Grab' }),
      h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'G' }),
    );
    const useBtn = h(
      'button',
      { class: 'btn pss-act', type: 'button', 'aria-label': 'Use (key E)', onclick: () => this.use() },
      h('span', { text: 'Use' }),
      h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'E' }),
    );
    this.bar.append(this.pad, ...(camp ? [useBtn] : [grabBtn, useBtn]));
    if (!camp) {
      this.easyBtn = h('button', {
        class: 'btn pss-easy',
        type: 'button',
        'aria-pressed': String(this.easy),
        text: `Easy jumps: ${this.easy ? 'on' : 'off'}`,
        onclick: () => this.setEasy(!this.easy),
      }) as HTMLButtonElement;
      this.bar.append(this.easyBtn);
    }
    this.el.append(this.bar);
    this.pad.hidden = !touchControlsVisible();
  }

  setEasy(on: boolean): void {
    this.easy = on;
    this.tuning = on ? EASY : NORMAL;
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
    const reserve = 70 + (this.building ? 210 : 0);
    const room = Math.min(window.innerWidth / VW, (window.innerHeight - reserve) / VH);
    this.scale = room >= 2 ? Math.floor(room) : Math.max(0.5, room);
    this.canvas.style.width = `${Math.round(VW * this.scale)}px`;
    this.canvas.style.height = `${Math.round(VH * this.scale)}px`;
  }

  private listen(): void {
    const KEYS: Record<string, 'left' | 'right' | 'jump'> = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump' };
    const down = (e: KeyboardEvent) => {
      if (this.paused || this.modal || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement)?.closest?.('input, select, textarea')) return;
      if (this.building) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.cursor = Math.max(LOT.x0 + 1, this.cursor - 1);
        else if (e.code === 'ArrowRight' || e.code === 'KeyD') this.cursor = Math.min(LOT.x1 - 1, this.cursor + 1);
        else if (e.code === 'Enter' || e.code === 'Space') this.placeAt(this.cursor);
        else if (e.code === 'Escape' || e.code === 'KeyE') this.leaveBuild();
        else return;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const k = KEYS[e.code];
      if (k) {
        e.preventDefault();
        if (k === 'jump' && !this.held.jump) this.jumpPressed = true;
        this.held[k] = true;
        return;
      }
      if (e.repeat) return;
      if (e.code === 'KeyG' || e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        this.grab();
      } else if (e.code === 'KeyE' || e.code === 'Enter') {
        e.preventDefault();
        this.use();
      } else if (e.code === 'Escape') this.cb.onMenu();
    };
    const up = (e: KeyboardEvent) => {
      const k = KEYS[e.code];
      if (k) this.held[k] = false;
    };
    const resize = () => this.fit();
    const point = (e: PointerEvent) => {
      if (!this.building) return;
      const r = this.canvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * VIEW_W + this.cam.x);
      this.cursor = Math.max(LOT.x0 + 1, Math.min(LOT.x1 - 1, x));
      if (e.type === 'pointerdown') this.placeAt(this.cursor);
    };
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up);
    window.addEventListener('resize', resize);
    this.canvas.addEventListener('pointerdown', point);
    this.canvas.addEventListener('pointermove', point);
    this.offs.push(
      () => window.removeEventListener('keydown', down, true),
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

  private get cx(): number {
    return this.body.x + this.body.w / 2;
  }

  private near(x: number, r = 1.4): boolean {
    return Math.abs(x - this.cx) <= r;
  }

  private get inKayak(): boolean {
    return this.body.standingOn === 'kayak';
  }

  // ---------------------------------------------------------------- grabbing

  grab(): void {
    if (this.paused || this.modal || this.done || this.def.num === 0) return;
    this.grabT = 0.35;
    const reach = this.cx + this.body.facing * 0.7;
    const o = this.ollie;
    if (!o.free && o.tangled && Math.abs(o.x - reach) < 1.3 && this.body.onGround) {
      o.free = true;
      o.tangled = null;
      this.bag = add(this.bag, 'ring');
      this.picked.push('ring');
      this.cb.onPickup('ring');
      this.cb.onSound('grab');
      this.cb.onStory('ollie');
      return;
    }
    if (this.inKayak) {
      const g = this.ghosts.find((q) => !q.got && Math.abs(q.x - reach) < 1.6);
      if (g) {
        g.got = true;
        this.bag = add(add(this.bag, 'net'), 'rope');
        this.cb.onPickup('net');
        this.cb.onSound('grab');
        const left = this.ghosts.filter((q) => !q.got).length;
        this.say(left ? `A ghost net! It goes in the backpack: an old net and its rope. ${left} more to find.` : 'That’s every ghost net! Paddle on to the far dock.', 4);
        return;
      }
    }
    const p = this.picks
      .filter((q) => !q.got && Math.abs(q.x - reach) < 0.9 && Math.abs(q.y - (this.body.y + this.body.h)) < 1.2 && (!q.buried || o.sniff > 0))
      .sort((a, b) => Math.abs(a.x - reach) - Math.abs(b.x - reach))[0];
    if (p) {
      p.got = true;
      this.bag = add(this.bag, p.id);
      this.picked.push(p.id);
      this.cb.onPickup(p.id);
      this.cb.onSound('grab');
      const extra = p.id === 'bag' ? ' A sea turtle could mistake it for a jellyfish.' : p.id === 'cap' ? ' Small pieces are easy for birds to swallow.' : '';
      this.say(`${TRASH[p.id].name}! ${TRASH[p.id].material}.${extra}`, 3.5);
      return;
    }
    if (this.shells.some((s) => Math.abs(s.x + 0.5 - reach) < 0.9)) {
      this.cb.onSound('nope');
      this.say('Leave that shell! Shells are homes and food for beach animals. Take only trash.', 4.5);
      return;
    }
    const hidden = this.picks.find((q) => !q.got && q.buried && Math.abs(q.x - reach) < 0.9);
    if (hidden) this.say('Something is buried here. Ollie could sniff it out!', 3);
  }

  // ---------------------------------------------------------------- using things

  use(): void {
    if (this.paused || this.modal || this.done) return;
    if (this.def.num === 0) {
      const t = this.target;
      if (!t) return;
      if (t.id === 'N') return this.enterBuild();
      this.cb.onTalk(t.id);
      return;
    }
    const bench = this.benches.find((b) => this.near(b.x + 0.5, 1.8));
    if (bench) return this.openBench();
    const stake = this.stakes.find((s) => this.near(s.x + 0.5, 1.6));
    if (stake) return this.useStake(stake);
    this.say('Nothing to use here. Look for Rafi’s Workbench and the blueprint stakes.', 3);
  }

  /** The first stake whose fix doesn’t work yet. */
  private get activeStake(): Stake | null {
    return this.stakes.find((s) => !s.works) ?? null;
  }

  private bagLine(): string {
    const items = Object.entries(this.bag)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => `${n} ${plural(TRASH[id as TrashId].name.toLowerCase(), n)}`);
    return items.length ? items.join(', ') : 'nothing yet';
  }

  private openBench(): void {
    const st = this.activeStake;
    if (!st) {
      this.say('Every fix here is built and working. Head for the flag!', 3);
      return;
    }
    const r = RECIPES[st.recipe];
    const can = canCraft(this.bag, r);
    const m = missing(this.bag, r);
    this.release();
    const needs = h(
      'div',
      { class: 'pss-needs' },
      h('strong', { text: 'Needs:' }),
      ...Object.entries(r.needs).map(([id, n]) => {
        const have = Math.min(n, count(this.bag, id));
        return h(
          'span',
          { class: have < n ? 'short' : '' },
          h('img', { src: paintTrash(id as TrashId, 16).toDataURL(1), alt: '', width: 12, height: 9, class: 'px' }),
          h('span', { text: `${TRASH[id as TrashId].name} ${have}/${n}` }),
        );
      }),
    );
    const tried = new Set(st.design ? [st.design] : []);
    const cards = h(
      'div',
      { class: 'pss-designs' },
      ...r.designs.map((d) => {
        const btn = h(
          'button',
          { class: 'btn pss-design', type: 'button', 'data-design': d.id },
          h('img', { src: designPic(st.recipe, d.id).toDataURL(1), alt: '', class: 'px pss-design-pic' }),
          h('strong', { text: d.name }),
          h('small', { text: d.note }),
          tried.has(d.id) ? h('small', { class: 'tried', text: 'Tried: it only half works' }) : null,
        ) as HTMLButtonElement;
        btn.disabled = !can || !!this.carrying || st.design !== null;
        btn.addEventListener('click', () => {
          this.bag = craft(this.bag, r);
          this.carrying = { recipe: st.recipe, design: d.id };
          this.cb.onSound('build');
          this.modal?.close();
          this.say(`A ${r.name.toLowerCase()}: ${d.name.toLowerCase()}. Take it to the blueprint stake and build it (E). Then we test it!`, 5);
        });
        return btn;
      }),
    );
    const notes: HTMLElement[] = [];
    if (this.carrying) notes.push(h('p', { text: 'You are carrying a fix already. Build it at the blueprint stake, or take it apart here.' }));
    else if (st.design) notes.push(h('p', { text: 'A design is on the stake. Take it down at the stake to get the materials back, then try another design.' }));
    else if (!can) notes.push(h('p', { class: 'short', text: `Still to find: ${amounts(m)}. Look along the way, and up high.` }));
    const foot = h('div', { class: 'pss-row' });
    if (this.carrying) {
      foot.append(
        h('button', {
          class: 'btn',
          type: 'button',
          text: 'Take it apart',
          onclick: () => {
            this.bag = takeDown(this.bag, RECIPES[this.carrying!.recipe]);
            this.carrying = null;
            this.modal?.close();
            this.say('Taken apart. Pick a design whenever you are ready.', 3);
          },
        }),
      );
    }
    foot.append(h('button', { class: 'btn primary', type: 'button', text: 'Close', onclick: () => this.modal?.close() }));
    const root = h(
      'div',
      { class: 'panel modal pss-bench', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bench-title' },
      h('header', {}, h('h2', { id: 'bench-title', text: `Rafi’s Workbench: ${r.name.toLowerCase()}` })),
      h(
        'div',
        { class: 'content' },
        h(
          'div',
          { class: 'pss-cols' },
          h('div', {}, h('strong', { text: 'Goals: what it must do' }), h('ul', {}, ...r.goals.map((g) => h('li', { text: g })))),
          h('div', {}, h('strong', { text: 'Limits: what we have' }), h('ul', {}, ...r.limits.map((g) => h('li', { text: g })))),
        ),
        needs,
        h('p', { class: 'pss-pickline', text: 'Pick a design. Which one meets every goal?' }),
        cards,
        ...notes,
        foot,
      ),
    );
    this.openModal(root);
  }

  private openModal(root: HTMLElement): void {
    this.release();
    this.modal = new Modal(this.host, root, () => {
      this.modal = null;
      this.canvas.focus({ preventScroll: true });
    });
  }

  private useStake(st: Stake): void {
    if (st.testing > 0) return;
    const first = this.activeStake;
    if (st.works) {
      this.say(st.recipe === 'drain-net' ? 'The net is doing its job. The Squad empties it after every big rain.' : 'This fix works. Well built!', 3);
      return;
    }
    if (first && first !== st) {
      this.say(st.recipe === 'boom' ? 'Stop the leak first! While the boat leaks, more fuel keeps coming.' : `Build the ${RECIPES[first.recipe].name.toLowerCase()} first.`, 4);
      return;
    }
    if (this.carrying && this.carrying.recipe === st.recipe) {
      st.design = this.carrying.design;
      this.carrying = null;
      st.testing = TEST_TIME;
      this.cb.onSound('build');
      this.say(`Built! Now the test. Watch what happens...`, 3);
      return;
    }
    if (st.design) {
      this.bag = takeDown(this.bag, RECIPES[st.recipe]);
      st.design = null;
      this.say('Taken down: the materials are back in your backpack. Pick a better design at the Workbench.', 4.5);
      return;
    }
    this.say(`This blueprint stake is for the ${RECIPES[st.recipe].name.toLowerCase()}. Craft it at Rafi’s Workbench first.`, 4);
  }

  private showResult(st: Stake): void {
    const r = RECIPES[st.recipe];
    const d = r.designs.find((x) => x.id === st.design)!;
    const works = d.outcome === 'works';
    st.works = works;
    this.cb.onTested(st.recipe, d.id, works);
    this.cb.onSound(works ? 'works' : 'half');
    const foot = h('div', { class: 'pss-row' });
    const body: HTMLElement[] = [h('p', { text: d.why })];
    if (works) {
      foot.append(
        h('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Great!',
          onclick: () => {
            this.modal?.close();
            this.cb.onStory('built', st.recipe);
          },
        }),
      );
    } else {
      body.push(h('p', { text: 'Engineers test, look at what went wrong, and improve the design. Take it down to get the materials back, and try another design at the Workbench.' }));
      foot.append(
        h('button', { class: 'btn', type: 'button', text: 'Leave it for now', onclick: () => this.modal?.close() }),
        h('button', {
          class: 'btn primary',
          type: 'button',
          text: 'Take it down',
          onclick: () => {
            this.bag = takeDown(this.bag, r);
            st.design = null;
            this.modal?.close();
            this.say('The materials are back in your backpack. Back to the Workbench!', 3.5);
          },
        }),
      );
    }
    const root = h(
      'div',
      { class: 'panel modal pss-result', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'res-title' },
      h('header', {}, h('h2', { id: 'res-title', text: works ? `Test result: it works!` : 'Test result: it only half works' })),
      h('div', { class: 'content' }, h('img', { src: designPic(st.recipe, d.id).toDataURL(2), alt: '', class: 'px pss-result-pic' }), ...body, foot),
    );
    this.openModal(root);
    speak(`${works ? 'It works!' : 'It only half works.'} ${d.why}`);
  }

  // ---------------------------------------------------------------- the Nature Center (camp)

  private enterBuild(): void {
    if (!this.nature) return;
    this.building = true;
    this.cursor = 3;
    const n = this.nature;
    const names = (inv: Inventory) =>
      Object.entries(inv)
        .map(([id, k]) => `${k} ${plural(TRASH[id as TrashId].name.toLowerCase(), k)}`)
        .join(', ');
    const palette = h('div', { class: 'pss-palette', role: 'toolbar', 'aria-label': 'Nature Center pieces' });
    const refresh = () => {
      palette.replaceChildren(
        ...n.unlocked.map((id) => {
          const cost = NATURE_COST[id];
          const free = !Object.keys(cost).length;
          const btn = h(
            'button',
            { class: `btn pss-piece${this.pickPiece === id ? ' on' : ''}`, type: 'button', 'data-piece': id, 'aria-pressed': String(this.pickPiece === id) },
            h('img', { src: paintNature(id, 16).toDataURL(1), alt: '', class: 'px' }),
            h('span', { text: NATURE[id].name }),
            h('small', { text: free ? 'Free' : names(cost) }),
          ) as HTMLButtonElement;
          btn.addEventListener('click', () => {
            this.pickPiece = id;
            refresh();
            this.say(`${NATURE[id].name}: ${NATURE[id].helps}`, 6);
          });
          return btn;
        }),
        h('button', {
          class: `btn pss-piece${this.pickPiece === 'remove' ? ' on' : ''}`,
          type: 'button',
          'data-piece': 'remove',
          text: 'Take away',
          onclick: () => {
            this.pickPiece = 'remove';
            refresh();
          },
        }),
      );
    };
    if (!n.unlocked.includes(this.pickPiece as NatureId)) this.pickPiece = n.unlocked[0] ?? 'remove';
    refresh();
    const book = h('span', { class: 'pss-book' });
    const updateBook = () => (book.textContent = `Visitor Book: ${n.seen.length} of ${Object.keys(VISITOR_NAME).length}. Backpack: ${this.bagLine()}.`);
    updateBook();
    this.buildBar = h(
      'div',
      { class: 'pss-buildbar' },
      n.unlocked.length ? palette : h('p', { class: 'small-note', text: 'Finish a level to unlock your first plants and pieces.' }),
      h('div', { class: 'pss-row' }, book, h('button', { class: 'btn primary', type: 'button', text: 'Done building (Esc)', onclick: () => this.leaveBuild() })),
    );
    (this.buildBar as HTMLElement & { refresh?: () => void }).refresh = () => {
      refresh();
      updateBook();
    };
    this.bar.hidden = true;
    this.el.append(this.buildBar);
    this.fit();
    this.say(
      n.unlocked.length ? 'The Nature Center lot is yours. Pick a piece, then click a spot on the lot (or use the arrow keys and Enter).' : 'Finish a level to unlock your first plants and pieces.',
      6,
    );
  }

  leaveBuild(): void {
    if (!this.building) return;
    this.building = false;
    this.buildBar?.remove();
    this.buildBar = null;
    this.bar.hidden = false;
    this.fit();
  }

  /** Place the picked piece (or take one away) at column x of the lot. */
  placeAt(x: number): void {
    const n = this.nature;
    if (!n || !this.building) return;
    if (this.pickPiece === 'remove') {
      const i = pieceAt(n.placed, x);
      if (i < 0) {
        this.say('Nothing to take away there.', 2.5);
        return;
      }
      this.bag = pay(this.bag, n.placed[i].id, -1);
      n.placed.splice(i, 1);
    } else {
      const id = this.pickPiece;
      const why = placeProblem(n.placed, id, x);
      if (why) {
        this.cb.onSound('nope');
        this.say(why, 3);
        return;
      }
      if (!canAfford(this.bag, id)) {
        this.cb.onSound('nope');
        const m = missing(this.bag, { id, name: id, needs: NATURE_COST[id], goals: [], limits: [], designs: [] });
        this.say(`${NATURE[id].name} needs ${amounts(m)} more. Collect spare materials in the levels.`, 4.5);
        return;
      }
      this.bag = pay(this.bag, id);
      n.placed.push({ id, x });
      this.cb.onSound('place');
    }
    const now = visitors(n.placed);
    const fresh = now.filter((v) => !n.seen.includes(v));
    n.seen.push(...fresh);
    if (fresh.length) this.say(`A visitor! A ${VISITOR_NAME[fresh[0]].toLowerCase()}. ${VISITOR_NEEDS[fresh[0]].fact}`, 7);
    this.cb.onNature([...n.placed], { ...this.bag }, fresh);
    (this.buildBar as (HTMLElement & { refresh?: () => void }) | null)?.refresh?.();
  }

  // ---------------------------------------------------------------- one step of the game

  private stepGame(dt: number): void {
    if (this.done) return;
    this.time += dt;
    this.frame++;
    if (this.building) {
      this.cam = { x: this.cam.x + (-1.5 - this.cam.x) * Math.min(1, dt * 4), y: this.level.map.h - VIEW_H };
      return;
    }
    const c: Controls = { left: this.held.left, right: this.held.right, jump: this.jumpPressed, jumpHeld: this.held.jump };
    this.jumpPressed = false;
    if (this.bump > 0) {
      this.bump -= dt;
      c.left = c.right = false;
    }
    const plats: Platform[] = [];
    if (this.kayak) {
      const k = this.kayak;
      k.dx = 0;
      if (this.inKayak) {
        const want = (c.right ? 1 : 0) - (c.left ? 1 : 0);
        // at either end, pushing on steps out onto the dock
        const stepOut = (want > 0 && k.x >= k.max - 0.01) || (want < 0 && k.x <= k.min + 0.01);
        if (!stepOut) {
          k.vx += (want * 3.6 - k.vx) * Math.min(1, dt * 3);
          if (want) this.body.facing = want > 0 ? 1 : -1;
          c.left = c.right = false;
          this.body.vx = 0;
        } else k.vx = 0;
      } else k.vx *= Math.pow(0.05, dt);
      const nx = Math.max(k.min, Math.min(k.max, k.x + k.vx * dt));
      k.dx = nx - k.x;
      k.x = nx;
      if (nx === k.min || nx === k.max) k.vx = 0;
      plats.push(k);
    }
    const wasGround = this.body.onGround;
    const ev = step(this.body, c, this.level.map, plats, this.tuning, dt);
    if (ev.jumped) this.cb.onSound('jump');
    if (ev.landed && !wasGround) this.cb.onSound('land');
    if (ev.fell) this.fell();
    // Squad flags (checkpoints)
    for (const f of this.flags)
      if (!f.lit && this.near(f.x + 0.5, 0.8)) {
        f.lit = true;
        this.respawn = { x: f.x, y: f.y };
        this.cb.onSound('flag');
        this.say('A Squad flag! If you fall in, you start again here.', 3);
      }
    // crabs scuttle; touching one bumps you back (no harm done)
    for (const k of this.crabs) {
      k.x += k.dir * 1.3 * dt;
      if (k.x < k.x0 || k.x > k.x1) k.dir *= -1;
      if (this.bump <= 0 && Math.abs(k.x - this.cx) < 0.7 && this.body.y + this.body.h > k.y - 0.5 && this.body.y < k.y) {
        this.body.vx = (this.cx < k.x ? -1 : 1) * 7;
        this.body.vy = -7;
        this.bump = 0.4;
        this.cb.onSound('bump');
        this.say('Pinch! Crabs scuttle side to side. Jump over them.', 3);
      }
    }
    this.stepOllie(dt);
    // the drain keeps washing trash out until it has a net that works
    if (this.drain) {
      const st = this.stakes.find((s) => s.recipe === 'drain-net');
      const leaks = !st?.works && st?.design !== 'medium' && !(st?.design === 'small' && (st.testing ?? 0) > 2.5);
      this.washT += dt;
      const every = st && st.testing > 0 ? 1.1 : 9;
      if (leaks && this.washT > every && this.washed < 14) {
        this.washT = 0;
        const kinds: TrashId[] = st?.design === 'big' ? ['cap', 'wrapper'] : ['bottle', 'can', 'bag', 'wrapper', 'cap'];
        const mouth = this.drain.x + 1.3;
        this.picks.push({ id: kinds[this.washed % kinds.length], x: mouth, y: 10, got: false, buried: false, vx: 2 + (this.washed % 3) * 0.5 });
        this.washed++;
      }
    }
    for (const p of this.picks)
      if (p.vx) {
        p.x += p.vx * dt;
        p.vx *= Math.pow(0.4, dt);
        if (Math.abs(p.vx) < 0.2) p.vx = 0;
      }
    // stakes being tested
    for (const st of this.stakes)
      if (st.testing > 0) {
        st.testing -= dt;
        if (st.testing <= 0) {
          st.testing = 0;
          this.showResult(st);
        }
      }
    // tips
    for (const [x, text] of this.def.tips)
      if (!this.tipsShown.has(x) && this.cx >= x) {
        this.tipsShown.add(x);
        if (text.startsWith('Ollie') && !this.ollie.free) continue;
        this.say(text, 5);
      }
    // the flag
    if (this.def.num && Math.abs(this.flag.x + 0.5 - this.cx) < 0.8 && this.body.onGround) {
      const block = this.finishBlocked();
      if (block) {
        if (this.msgT <= 0) this.say(block, 4);
        this.body.x -= 0.15 * Math.sign(this.flag.x + 0.5 - this.cx || 1);
      } else {
        this.done = true;
        this.cb.onSound('flag');
        this.cb.onFinish({ bag: { ...this.bag }, picked: [...this.picked], time: this.time, falls: this.falls });
      }
    }
    if (this.grabT > 0) this.grabT -= dt;
    this.cam = follow(this.cam, this.body, VIEW_W, VIEW_H, this.level.map, dt);
  }

  private finishBlocked(): string | null {
    const st = this.activeStake;
    if (st) return st.recipe === 'drain-net' ? 'The drain is still washing trash onto the beach. Build a net that works first!' : `Build a ${RECIPES[st.recipe].name.toLowerCase()} that works first.`;
    if (this.ghosts.some((g) => !g.got)) return 'There are still ghost nets in the river mouth. Paddle back and grab them all.';
    return null;
  }

  private stepOllie(dt: number): void {
    const o = this.ollie;
    if (!o.free) return;
    const tx = this.cx - this.body.facing * 1.3;
    const d = tx - o.x;
    o.x += Math.sign(d) * Math.min(Math.abs(d), dt * (Math.abs(d) > 4 ? 12 : 6.5));
    if (Math.abs(d) > 0.1) o.face = d > 0 ? 1 : -1;
    // Ollie runs along the ground under them (or swims at the water's surface)
    const gy = this.surfaceBelow(o.x, Math.min(o.y, this.body.y + this.body.h) - 1.5);
    o.y += (gy - o.y) * Math.min(1, dt * 10);
    const hid = this.picks.find((p) => p.buried && !p.got && Math.abs(p.x - o.x) < 2.6);
    if (hid && this.def.num) {
      if (o.sniff <= 0) {
        this.say('Sniff sniff! Ollie found something buried in the sand. Grab it (G)!', 4);
        this.cb.onSound('grab');
      }
      o.sniff = 2.5;
    } else if (o.sniff > 0) o.sniff -= dt;
  }

  /** The top of the first ground, ledge or water below (x, fromY), in tiles. */
  private surfaceBelow(x: number, fromY: number): number {
    const map = this.level.map;
    const cx = Math.floor(x);
    for (let y = Math.max(0, Math.floor(fromY)); y < map.h; y++) {
      const c = map.get(cx, y);
      if (c !== Cell.Air) return y;
    }
    return map.h;
  }

  private fell(): void {
    this.falls++;
    placeAt(this.body, this.respawn.x, this.respawn.y);
    if (this.kayak && this.respawn.x < this.kayak.min + 1) {
      this.kayak.x = this.kayak.x0;
      this.kayak.vx = 0;
    }
    if (this.ollie.free) {
      this.ollie.x = this.body.x - 1;
      this.ollie.y = this.body.y + this.body.h;
    }
    this.cb.onSound('splash');
    this.say('Splash! Back to the Squad flag.', 2.5);
    this.cam = follow(this.cam, this.body, VIEW_W, VIEW_H, this.level.map, 0, true);
  }

  // ---------------------------------------------------------------- the loop and drawing

  private loop(now: number): void {
    this.acc += Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (this.paused || this.modal) this.acc = 0;
    while (this.acc >= DT) {
      this.stepGame(DT);
      this.acc -= DT;
    }
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
    if (!this.paused && !this.done && !this.building && !this.modal) {
      if (this.def.num === 0) {
        const LABEL: Record<string, string> = { M: 'Talk', R: 'Talk', T: 'Talk', S: 'Sort', J: 'Journal', Q: 'Map', N: 'Build' };
        for (const p of this.people) if (this.near(p.x + 0.5, 1.4)) best = { id: p.kind, x: p.x + 0.5, y: p.y - 0.8, label: LABEL[p.kind] };
      } else {
        for (const b of this.benches) if (this.near(b.x + 0.5, 1.8)) best = { id: 'W', x: b.x + 0.5, y: b.y - 0.9, label: 'Workbench' };
        for (const s of this.stakes)
          if (this.near(s.x + 0.5, 1.6) && s.testing <= 0)
            best = { id: 'X', x: s.x + 0.5, y: s.y - 0.9, label: s.works ? 'Look' : this.carrying?.recipe === s.recipe ? 'Build' : s.design ? 'Take down' : 'Stake' };
      }
    }
    this.target = best;
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

  private put(key: string, make: () => PixelBuffer, x: number, y: number): void {
    const img = cached(key, make);
    this.ctx.drawImage(img, Math.round((x - this.cam.x) * T - img.width / 2), Math.round((y - this.cam.y) * T - img.height));
  }

  private get clean(): boolean {
    return this.def.num > 0 && this.stakes.length > 0 && this.stakes.every((s) => s.works) && this.ghosts.every((g) => g.got);
  }

  private murk(x: number): Murk {
    const sl = this.def.slick;
    const boom = this.stakes.find((s) => s.recipe === 'boom');
    if (sl && x >= sl[0] && x <= sl[1] && !boom?.works) return 'oil';
    const m = this.def.murky;
    if (m && x >= m.x[0] && x <= m.x[1] && !this.works(m.fixedBy)) return m.kind;
    return 'clear';
  }

  /** A fix in this level that works (or the level was finished before). */
  private works(r: RecipeId): boolean {
    return !!this.stakes.find((s) => s.recipe === r)?.works;
  }

  private drawBackdrop(): void {
    const ctx = this.ctx;
    const st = artStretch(this.def);
    const clean = this.def.num === 0 || this.clean;
    const key = `${st}-${clean}`;
    let bd = backdrops.get(key);
    if (!bd) backdrops.set(key, (bd = paintCoastBackdrop(st, VW, VH, clean)));
    const b = bd;
    ctx.drawImage(
      cached(`bd-${key}-sky`, () => b.sky),
      0,
      0,
    );
    for (const [layer, k, name] of [
      [b.far, 0.2, 'far'],
      [b.near, 0.45, 'near'],
    ] as const) {
      const img = cached(`bd-${key}-${name}`, () => layer);
      const off = Math.floor((((this.cam.x * T * k) % VW) + VW) % VW);
      const dy = Math.round(-this.cam.y * T * k * 0.3);
      ctx.drawImage(img, -off, dy);
      ctx.drawImage(img, VW - off, dy);
    }
  }

  private drawTiles(): void {
    const ctx = this.ctx;
    const map = this.level.map;
    const st = artStretch(this.def);
    const x0 = Math.floor(this.cam.x);
    const y0 = Math.floor(this.cam.y);
    const anim = Math.floor(this.frame / 8) % 4;
    const camp = this.def.num === 0;
    for (let y = y0; y <= y0 + Math.ceil(VIEW_H) + 1; y++)
      for (let x = x0; x <= x0 + VIEW_W + 1; x++) {
        if (x < 0 || x >= map.w || y < 0 || y >= map.h) continue;
        const c = map.get(x, y);
        if (c === Cell.Air) continue;
        const px = Math.round((x - this.cam.x) * T);
        const py = Math.round((y - this.cam.y) * T);
        const above = map.get(x, y - 1);
        if (camp && x >= LOT.x0 && x <= LOT.x1 && c === Cell.Solid) {
          const pond = x >= LOT.pond[0] && x <= LOT.pond[1];
          const top = above !== Cell.Solid;
          const kind = pond ? (top ? 'pondTop' : 'pond') : top ? 'grass' : 'deep';
          ctx.drawImage(
            cached(`lot-${kind}-${x % 4}-${pond ? anim : 0}`, () => paintLotTile(T, kind, x % 4, anim)),
            px,
            py,
          );
          if (pond && top)
            ctx.drawImage(
              cached('boardwalk', () => paintCoastTile(T, 'camp', 'ledge', 1)),
              px,
              py - Math.round(T * 0.2),
            );
          continue;
        }
        let kind: CoastTileKind;
        if (c === Cell.Solid) kind = above === Cell.Solid ? 'fill' : 'top';
        else if (c === Cell.Ledge) kind = 'ledge';
        else kind = above === Cell.Water ? 'water' : 'waterTop';
        const murk = c === Cell.Water ? this.murk(x) : 'clear';
        const a = kind === 'water' || kind === 'waterTop' ? anim : 0;
        ctx.drawImage(
          cached(`t-${st}-${kind}-${x % 4}-${a}-${murk}`, () => paintCoastTile(T, st, kind, x % 4, a, murk)),
          px,
          py,
        );
      }
  }

  private draw(): void {
    const ctx = this.ctx;
    const f = Math.floor(this.frame / 8);
    this.drawBackdrop();
    // scenery behind the ground
    for (const d of this.decor) {
      if (d.kind === 'p') this.put(`palm-${d.x % 2}`, () => paintPalm(T, d.x % 2), d.x + 0.5, d.y + 1);
      else if (d.kind === 'H') this.put('hut', () => paintSquadHut(T), d.x + 0.5, d.y + 1);
      else if (d.kind === 'U') this.put(`house-${d.x % 4}`, () => paintTownHouse(T, d.x % 4), d.x + 0.5, d.y + 1);
      else if (d.kind === 'Z') this.drawMill(d.x, f);
      else if (d.kind === 'L') {
        const cover = this.works('buffer');
        this.put(`field-${cover}-${f % 2}`, () => paintField(T, 6, cover ? 'cover' : 'bare', f % 2), d.x + 3, d.y + 1);
      }
    }
    if (this.boat) {
      const patch = this.stakes.find((s) => s.recipe === 'tank-patch');
      const fixed = !!patch?.works;
      this.put(`boat-${fixed}-${f % 6}`, () => paintBoat(T, fixed, f % 6), this.boat.x + 0.5, 10.9);
      if (patch?.design && patch.design !== 'patch') {
        const peel = patch.design === 'tape' ? (patch.testing > 0 ? 1 - patch.testing / TEST_TIME : patch.works ? 0 : 1) : 0;
        const fill = patch.design === 'bucket' ? (patch.testing > 0 ? 1 - patch.testing / TEST_TIME : 1) : 0;
        this.put(
          `tank-${patch.design}-${Math.round(peel * 4)}-${Math.round(fill * 4)}`,
          () => paintTankFix(T, patch.design as 'tape' | 'bucket', Math.round(fill * 4) / 4, Math.round(peel * 4) / 4),
          this.boat.x + 2.3,
          10.2,
        );
      }
    }
    this.drawTiles();
    // the oil slick and the boom
    if (this.def.slick) {
      const boom = this.stakes.find((s) => s.recipe === 'boom');
      const [a, b] = this.def.slick;
      const w = b - a - 1;
      if (!boom?.works) this.put(`slick-${w}-${f % 4}`, () => paintOilSlick(T, w, f % 4), (a + b + 1) / 2, 10.3);
      if (boom?.design) {
        const sink = boom.design === 'sealed' ? 0 : boom.testing > 0 ? (1 - boom.testing / TEST_TIME) * 0.8 : boom.works ? 0 : 0.8;
        if (boom.design === 'rope') {
          ctx.fillStyle = '#c8a060';
          ctx.fillRect(Math.round((a + 0.5 - this.cam.x) * T), Math.round((10.15 + sink - this.cam.y) * T), Math.round(w * T), 2);
        } else this.put(`boom-${w}-${f % 4}`, () => paintBoom(T, w, f % 4), (a + b + 1) / 2, 10.45 + sink);
      }
    }
    // things on the ground
    if (this.drain) {
      const st = this.stakes.find((s) => s.recipe === 'drain-net');
      const net = (st?.design ?? 'none') as NetDesign;
      const clog = net === 'small' ? (st!.testing > 0 ? Math.min(1, (1 - st!.testing / TEST_TIME) * 1.6) : st!.works ? 0 : 1) : net === 'medium' ? 0.2 : 0;
      this.put(`drain-${net}-${f % 14}-${Math.round(clog * 10)}`, () => paintDrainPipe(T, net, f % 14, true, clog), this.drain.x + 0.5, 10);
    }
    if (this.bins) {
      const st = this.stakes.find((s) => s.recipe === 'bin-lids');
      const lid = (st?.design ?? 'none') as 'none' | 'loose' | 'clip';
      const lift = st && st.testing > 0 && lid !== 'clip' ? Math.max(0, Math.sin((1 - st.testing / TEST_TIME) * Math.PI * 3)) : 0;
      this.put(`bins-${lid}-${Math.round(lift * 4)}`, () => paintLidBins(T, lid, Math.round(lift * 4) / 4), this.bins.x + 0.5, 10);
      if (st && st.testing > 0) {
        this.put(`gull-${f % 2}`, () => paintGull(T, f % 2), this.bins.x + 0.5 + Math.sin(this.frame / 20) * 1.5, 7.5);
        if (lid !== 'clip' && this.frame % 40 < 20) this.put(`fly-${f % 2}`, () => paintTrash('wrapper', T, f % 2), this.bins.x + 1.4 + (this.frame % 40) / 10, 8.5 - (this.frame % 40) / 30);
      }
    }
    for (const s of this.stakes) {
      if (FIX2.includes(s.recipe) && s.design) {
        this.drawFix(s, f);
        continue;
      }
      if (s.recipe === 'net-bin' && s.design) {
        const d = s.design as 'crate' | 'sack' | 'lid';
        const t = s.testing > 0 ? 1 - s.testing / TEST_TIME : s.works ? 0 : 1;
        this.put(`netbin-${d}-${Math.round(t * 4)}`, () => paintCrate(T, d, Math.round(t * 4) / 4), s.x + 0.5, s.y + 1);
      } else if (!(s.works && (s.recipe === 'bin-lids' || s.recipe === 'drain-net' || s.recipe === 'tank-patch' || s.recipe === 'boom')))
        this.put(`stake-${!!this.carrying && this.carrying.recipe === s.recipe}-${f % 4}`, () => paintStake(T, !!this.carrying && this.carrying.recipe === s.recipe, f % 4), s.x + 0.5, s.y + 1);
    }
    for (const b of this.benches) {
      this.put('bench', () => paintWorkbench(T), b.x + 0.5, b.y + 1);
      this.put('rafi-f', () => paintHero(RAFI_HADDAD, 1.5, 'left'), b.x + 2.4, b.y + 1);
    }
    for (const fl of this.flags) this.put(`flag-${fl.lit}-${fl.lit ? f % 8 : 0}`, () => paintSquadFlag(T, fl.lit, f % 8), fl.x + 0.5, fl.y + 1);
    if (this.def.num) this.put(`fin-${f % 8}`, () => paintSquadFlag(T, true, f % 8), this.flag.x + 0.5, this.flag.y + 1);
    for (const s of this.shells) this.put(`shell-${s.x % 2}`, () => paintNatural('shell', T, s.x % 2), s.x + 0.5, s.y + 1);
    for (const g of this.ghosts) if (!g.got) this.put(`ghost-${g.x % 2}`, () => paintGhostNet(T, Math.floor(g.x) % 2), g.x, 10.8);
    for (const d of this.decor) {
      if (d.kind === 'u') this.put(`gull-${f % 2}`, () => paintGull(T, f % 2), d.x + 0.5 + Math.sin(this.frame / 50 + d.x) * 2, d.y + 1);
      else if (d.kind === 'r') this.put(`rock-${d.x % 2}`, () => paintNatural('stone', T, d.x % 2), d.x + 0.5, 10.4);
      else if (d.kind === 'z') {
        const ok = this.murk(d.x) === 'clear';
        const sx = d.x + 0.5 + (ok ? Math.sin(this.frame / 40 + d.x) * 0.8 : 0);
        this.put(`fish-${ok}-${f % 2}-${d.x % 2}`, () => paintFish(T, f % 2, !ok, d.x % 2 ? '#e8c060' : '#f2902f'), sx, ok ? 10.95 : 10.35);
      } else if (d.kind === 'w') this.put('wen', () => paintHero(WEN_LI, 1.5, 'right'), d.x + 0.5, d.y + 1);
      else if (d.kind === 'o') this.put('rosa', () => paintHero(ROSA_DELGADO, 1.5, 'right'), d.x + 0.5, d.y + 1);
      else if (d.kind === 'V') {
        const marked = this.works('rain-garden') || this.def.stretch !== 'town' || this.def.num !== 2;
        this.put(`sdrain-${marked}`, () => paintStormDrain(T, marked), d.x + 0.5, d.y + 1.15);
      } else if (d.kind === 'n') {
        const idle = !this.works('mill-filter');
        this.put(`bus-${idle}-${idle ? f % 3 : 0}`, () => paintBus(T, idle, f % 3), d.x + 0.5, d.y + 1);
      }
      else if (d.kind === 't') {
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(Math.round((d.x + 0.35 - this.cam.x) * T), Math.round((d.y + 0.1 - this.cam.y) * T), 7, Math.round(T * 0.9));
      }
    }
    for (const p of this.picks) {
      if (p.got) continue;
      if (p.buried) {
        if (this.ollie.sniff > 0) this.put(`spark-${f % 4}`, () => paintSparkle(T, f % 4), p.x, p.y - 0.1);
        continue;
      }
      this.put(`tr-${p.id}-${f % 2}`, () => paintTrash(p.id, T, f % 2), p.x, p.y);
    }
    for (const k of this.crabs) this.put(`crab-${f % 2}`, () => paintCrab(T, f % 2), k.x, k.y);
    // camp people and boards
    if (this.def.num === 0) {
      for (const p of this.people) {
        const x = p.x + 0.5;
        const y = p.y + 1;
        if (p.kind === 'M') this.put('mar', () => paintHero(MARISOL_VEGA, 1.5, 'right'), x, y);
        else if (p.kind === 'R') {
          this.put('bench-c', () => paintWorkbench(T), x + 1.2, y);
          this.put('rafi', () => paintHero(RAFI_HADDAD, 1.5, 'left'), x, y);
        } else if (p.kind === 'T') this.put('tala', () => paintHero(RANGER_TALA, 1.5, 'left'), x, y);
        else if (p.kind === 'S') this.put('sort', () => paintSortStation(T), x, y);
        else if (p.kind === 'J') this.put('journal', () => paintBoard(T, 'journal'), x, y);
        else if (p.kind === 'Q') this.put('map', () => paintBoard(T, 'map'), x, y);
        else if (p.kind === 'N') this.put('nsign', () => paintBoard(T, 'nature'), x, y);
      }
      this.drawNature();
    }
    // the kayak (with the cadet in it when aboard)
    if (this.kayak) {
      const k = this.kayak;
      const aboard = this.inKayak;
      const face = this.body.facing > 0 ? 'right' : 'left';
      const pf = Math.abs(k.vx) > 0.3 ? Math.floor(this.frame / 7) % 4 : 0;
      if (aboard) this.put(`kayak-${face}-${pf}`, () => paintKayak(this.look, T, face, pf), k.x + k.w / 2, k.y + 0.35);
      else this.put('kayak-empty', () => emptyKayak(), k.x + k.w / 2, k.y + 0.35);
    }
    // Ollie
    const o = this.ollie;
    if (o.tangled || o.free) {
      const overWater = this.level.map.get(Math.floor(o.x), Math.floor(o.y)) === Cell.Water || (this.inKayak && o.free);
      const opose: OlliePose = o.tangled ? 'tangled' : overWater ? 'swim' : o.sniff > 0 ? 'sniff' : Math.abs(o.x - (this.cx - this.body.facing * 1.3)) > 0.2 ? 'run' : 'stand';
      const oy = overWater ? 10.45 : o.y;
      this.put(`ollie-${opose}-${o.face}-${f % 2}`, () => paintOllie(T, opose, f % 2, o.face > 0 ? 'right' : 'left'), o.x, oy);
    }
    // the cadet
    if (!this.inKayak && !this.building) {
      const face = this.body.facing > 0 ? 'right' : 'left';
      let pose: CadetPose = 'stand';
      if (this.grabT > 0) pose = 'grab';
      else if (!this.body.onGround) pose = this.body.vy < 0 ? 'jump' : 'fall';
      else if (Math.abs(this.body.vx) > 0.4) pose = 'run';
      const wf = pose === 'run' ? Math.floor(this.frame / 6) % 4 : pose === 'grab' ? (this.grabT > 0.18 ? 0 : 1) : 0;
      const blink = pose === 'stand' && this.frame % 200 < 8;
      this.put(`me-${pose}-${face}-${wf}-${blink}`, () => paintCadet(this.look, T, face, { pose, frame: wf, blink }), this.cx, this.body.y + this.body.h);
      if (this.carrying) this.put('carry', () => designPic(this.carrying!.recipe, this.carrying!.design, true), this.cx, this.body.y - 0.05);
    }
    // a rainstorm while a fix is tested in the rain
    if (this.stakes.some((st) => st.testing > 0 && RAINY.includes(st.recipe))) this.drawRain();
    // the HUD
    const line = `Backpack: ${this.bagLine()}${this.carrying ? `, and a ${RECIPES[this.carrying.recipe].name.toLowerCase()}` : ''}`;
    if (this.bagText.dataset.t !== line) {
      this.bagText.dataset.t = line;
      this.bagText.textContent = line;
    }
    if (this.def.num) {
      const v = this.gaugeValue();
      this.gaugeFill.style.width = `${Math.round(v * 100)}%`;
      this.gaugeFill.style.background = v > 0.6 ? '#e0503a' : v > 0.25 ? '#f2c94c' : '#3aa65a';
    }
  }

  /** The gauge: how much trash (or oil) is left here, 0 to 1. */
  private gaugeValue(): number {
    if (this.def.murky) return this.works(this.def.murky.fixedBy) ? 0.05 : 0.85;
    if (this.def.stretch === 'town') {
      const n = this.stakes.filter((s) => s.works).length;
      return n >= this.stakes.length ? 0.05 : n ? 0.45 : 0.85;
    }
    if (this.def.gauge === 'oil') {
      const patch = this.stakes.find((s) => s.recipe === 'tank-patch');
      const boom = this.stakes.find((s) => s.recipe === 'boom');
      return boom?.works ? 0.05 : patch?.works ? 0.5 : 0.9;
    }
    const left = this.picks.filter((p) => !p.got).length + this.ghosts.filter((g) => !g.got).length * 2;
    return Math.min(1, left / Math.max(8, this.total));
  }

  /** A half-2 fix at its stake (the wetland plants go in around the pond). */
  private drawFix(s: Stake, f: number): void {
    const r = s.recipe as Fix2;
    const d = s.design!;
    const wet = s.testing > 0 || s.works;
    if (r === 'mill-filter') return; // drawn on the mill
    if (r === 'reeds') {
      const m = this.def.murky;
      const spots = m ? [m.x[0] + 1.5, (m.x[0] + m.x[1]) / 2 + 0.5, m.x[1] - 0.5] : [s.x + 0.5];
      for (const x of spots) this.put(`fix-reeds-${d}-${f % 4}`, () => paintFix('reeds', d, T, f % 4), x, 10.55);
      this.put(`fix-reeds-${d}-${f % 4}`, () => paintFix('reeds', d, T, f % 4), s.x + 0.5, s.y + 1);
      return;
    }
    this.put(`fix-${r}-${d}-${f % 4}-${wet}`, () => paintFix(r, d, T, f % 4, wet), s.x + 0.5, s.y + 1);
  }

  /** The mill, with the chimney fix on it (a taller chimney, white paint, or the smoke filter). */
  private drawMill(x: number, f: number): void {
    const st = this.stakes.find((s) => s.recipe === 'mill-filter');
    const d = st?.design ?? null;
    const filtered = d === 'filter';
    this.put(`mill-${filtered}-${f % 8}`, () => paintMill(T, filtered, f % 8), x + 0.5, 10);
    if (d !== 'tall' && d !== 'paint') return;
    const ctx = this.ctx;
    const cx = x + 1.625;
    const px = (v: number) => Math.round((v - this.cam.x) * T);
    const py = (v: number) => Math.round((v - this.cam.y) * T);
    if (d === 'paint') {
      ctx.fillStyle = '#eef0f2';
      ctx.fillRect(px(cx - 0.25), py(6.15), Math.round(T * 0.5), Math.round(T * 1.85));
    } else {
      ctx.fillStyle = '#b0583a';
      ctx.fillRect(px(cx - 0.25), py(4.4), Math.round(T * 0.5), Math.round(T * 1.8));
      ctx.fillStyle = '#8a8478';
      for (let k = 0; k < 4; k++) {
        const t = ((k + this.frame / 30) % 4) / 4;
        ctx.beginPath();
        ctx.arc(px(cx + t * 0.9), py(4.2 - t * 1.4), 3 + t * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /** Rain streaks over the view. */
  private drawRain(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(40,50,70,0.18)';
    ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = '#cfe6f6';
    for (let k = 0; k < 90; k++) {
      const x = (k * 53 + this.frame * 2) % (VW + 40);
      const y = (k * 97 + this.frame * 9) % VH;
      ctx.fillRect(x - 20, y, 1, 6);
    }
  }

  private drawNature(): void {
    const n = this.nature;
    if (!n) return;
    const f = Math.floor(this.frame / 8);
    const groundY = 10;
    for (const p of n.placed) {
      const info = NATURE[p.id];
      const cx = p.x + info.w / 2;
      this.put(`nat-${p.id}-${f % 4}`, () => paintNature(p.id, T, f % 4), cx, info.layer === 'pond' ? groundY + 0.9 : groundY);
      if (p.id === 'compost') this.put(`vis-worm-${f % 2}`, () => paintVisitor('worm', T, f % 2), cx, groundY + 1.4);
    }
    for (const v of visitors(n.placed)) {
      if (v === 'worm') continue;
      const need = n.placed.find((p) => VISITOR_NEEDS[v].needs.includes(p.id));
      if (!need) continue;
      const cx = need.x + NATURE[need.id].w / 2;
      const bob = Math.sin(this.frame / 12 + cx) * 0.3;
      const at: Record<VisitorId, [number, number]> = {
        butterfly: [cx + Math.sin(this.frame / 30) * 0.8, groundY - 1.6 + bob],
        bee: [cx + 0.6 + Math.sin(this.frame / 18) * 0.5, groundY - 1.2 + bob],
        wren: [cx + 0.5, groundY - 1.25],
        bat: [cx + Math.sin(this.frame / 22) * 1.2, groundY - 2.2 + bob],
        frog: [cx - 0.4, groundY + 0.1],
        heron: [cx + 0.6, groundY + 0.2],
        worm: [cx, groundY],
        beetle: [cx + 0.6, groundY],
      };
      const [vx, vy] = at[v];
      this.put(`vis-${v}-${f % 2}`, () => (v === 'heron' ? paintHeron(T, 0) : paintVisitor(v, T, f % 2)), vx, vy);
    }
    if (this.building) {
      const w = this.pickPiece === 'remove' ? 1 : NATURE[this.pickPiece].w;
      const ok = this.pickPiece === 'remove' ? pieceAt(n.placed, this.cursor) >= 0 : !placeProblem(n.placed, this.pickPiece, this.cursor) && canAfford(this.bag, this.pickPiece);
      const ctx = this.ctx;
      ctx.strokeStyle = ok ? '#ffd84a' : '#ff6a5a';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(Math.round((this.cursor - this.cam.x) * T) + 1, Math.round((groundY - 3 - this.cam.y) * T), w * T - 2, 3 * T);
      ctx.setLineDash([]);
    }
  }

  // ---------------------------------------------------------------- for the game and the tests

  get isBuilding(): boolean {
    return this.building;
  }

  openNature(): void {
    if (this.def.num === 0 && !this.building) this.enterBuild();
  }

  pickNature(id: NatureId | 'remove'): void {
    this.pickPiece = id;
  }

  state() {
    const b = this.body;
    return {
      level: this.def.id,
      x: b.x,
      y: b.y,
      onGround: b.onGround,
      standingOn: b.standingOn,
      bag: { ...this.bag },
      picked: [...this.picked],
      left: this.picks.filter((p) => !p.got).length,
      buried: this.picks.filter((p) => p.buried && !p.got).map((p) => p.x),
      carrying: this.carrying,
      stakes: this.stakes.map((s) => ({ x: s.x, recipe: s.recipe, design: s.design, works: s.works, testing: s.testing > 0 })),
      ghosts: this.ghosts.filter((g) => !g.got).map((g) => g.x),
      kayak: this.kayak ? { x: this.kayak.x, aboard: this.inKayak } : null,
      ollie: { free: this.ollie.free, x: this.ollie.x, sniff: this.ollie.sniff > 0 },
      respawn: { ...this.respawn },
      falls: this.falls,
      gauge: this.def.num ? this.gaugeValue() : 0,
      done: this.done,
      building: this.building,
      modal: !!this.modal,
      target: this.target?.id ?? null,
      paused: this.paused,
      easy: this.easy,
      nature: this.nature ? { placed: [...this.nature.placed], seen: [...this.nature.seen] } : null,
    };
  }

  teleport(x: number, y = 9): void {
    placeAt(this.body, x, y);
    this.cam = follow(this.cam, this.body, VIEW_W, VIEW_H, this.level.map, 0, true);
    if (this.ollie.free) {
      this.ollie.x = this.body.x - 1;
      this.ollie.y = this.body.y + this.body.h;
    }
  }

  face(dir: 1 | -1): void {
    this.body.facing = dir;
  }
}

/** The kayak with no one in it. */
function emptyKayak(): PixelBuffer {
  const full = paintKayak({ ...MARISOL_VEGA, build: 'kid' }, T, 'right', 0);
  // keep only the hull and paddle rows (the bottom part)
  const out = new PixelBuffer(full.w, full.h);
  const from = Math.round(full.h * 0.62);
  for (let y = from; y < full.h; y++) for (let x = 0; x < full.w; x++) out.set(x, y, full.get(x, y));
  return out;
}

/** A small picture of a design (on the Workbench cards, the result panel, and carried over the cadet’s head). */
export function designPic(recipe: RecipeId, design: string, small = false): PixelBuffer {
  const s = small ? 16 : T;
  if (recipe === 'drain-net') return netCloseUp(design as NetDesign, s);
  if (recipe === 'bin-lids') return paintLidBins(s, design as 'none' | 'loose' | 'clip', 0);
  if (recipe === 'tank-patch') return paintTankFix(s, design as 'tape' | 'bucket' | 'patch', 0.4, 0);
  if (recipe === 'boom') return boomPic(design, s);
  if (FIX2.includes(recipe)) return paintFix(recipe as Fix2, design, s, 0);
  return paintCrate(s, design as 'crate' | 'sack' | 'lid', 0);
}

function netCloseUp(design: NetDesign, s: number): PixelBuffer {
  const full = paintDrainPipe(s, design, 0, false);
  const x0 = Math.round(s * 1.5);
  const y0 = Math.round(s * 0.65);
  const w = Math.round(s * 0.85);
  const hh = Math.round(s * 0.9);
  const out = new PixelBuffer(w, hh);
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) out.set(x, y, full.get(x0 + x, y0 + y) ?? '#cfe6ef');
  return out;
}

function boomPic(design: string, s: number): PixelBuffer {
  const w = s * 3;
  const out = new PixelBuffer(w, Math.round(s * 0.9));
  const water = Math.round(s * 0.45);
  for (let y = water; y < out.h; y++) for (let x = 0; x < w; x++) out.set(x, y, y === water ? '#bfe8f2' : '#3a8ac0');
  if (design === 'rope') {
    for (let x = 2; x < w - 2; x++) out.set(x, water + Math.round(s * 0.25), '#c8a060');
    return out;
  }
  const boom = paintBoom(s, 3, 0);
  const sink = design === 'open' ? Math.round(s * 0.3) : 0;
  for (let y = 0; y < boom.h; y++)
    for (let x = 0; x < boom.w; x++) {
      const c = boom.get(x, y);
      if (c) out.set(x, water - Math.round(boom.h / 2) + y + sink, c);
    }
  if (design === 'open') for (let k = 0; k < 4; k++) out.set(Math.round(s * 0.5 + k * s * 0.6), water + 1, '#ffffff');
  return out;
}

/** "2 plastic bottles", "2 batteries", "2 scrap wood". */
function plural(name: string, n: number): string {
  if (n === 1 || name.endsWith('wood')) return name;
  return name.endsWith('y') ? `${name.slice(0, -1)}ies` : `${name}s`;
}

/** "2 scrap wood and 1 old rope", for what is still missing. */
function amounts(m: Inventory): string {
  const parts = Object.entries(m).map(([id, n]) => `${n} ${plural(TRASH[id as TrashId].name.toLowerCase(), n)}`);
  return parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}
