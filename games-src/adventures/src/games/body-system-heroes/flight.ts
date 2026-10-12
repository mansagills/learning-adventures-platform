import * as THREE from 'three';
import type { PixelBuffer } from '../../kit/art/pixel';
import { K } from '../../kit/render/pixelRenderer';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { STAR_STATION, Stage, billboard, glow, lightPool, shadow, swapFrame, type SceneCtx, type SettingScene } from '../../kit/worlds';
import { Paint, ramp } from '../../kit/worlds/shade';
import { BODY_SETTINGS, type BodyArea } from '../../kit/worlds/star-station/body';
import { paintGoodBacteria, paintMicroScout, paintMucus, paintNib, paintWhiteCell } from '../../kit/worlds/star-station/body-art';
import { paintFactCard, paintGerm, paintRelayMarker, paintScanMarker, type GermId, type UpgradeId } from './art';

/**
 * The flight inside the body: the shrunk-down Micro-Scout flies freely, in
 * every direction, over one area of the body (the kit's inside-the-body
 * setting), with Nib riding alongside.
 *
 * - Glowing scan spots: flying onto one tells the game to ask a question.
 * - The germs' nest: it opens when every spot is scanned; flying onto it
 *   tells the game to ask the diagnose question.
 * - Healing: the germs come out and wander. The ship's cleaning beam zaps
 *   the nearest germ in range on its own, so the child steers to catch them.
 *   A germ that bumps the ship only nudges it (nobody loses).
 * - Upgrades: a white blood cell escort (it zaps germs too), the saliva wave
 *   (a button: zaps every germ close by) and the mucus net (every few
 *   seconds, sticky mucus catches the germs near the ship).
 * - In the lungs, the air flows one way and nudges the ship along with it;
 *   in the blood it flows faster, in pushes, with each heartbeat.
 * - Half 2 adds: good gut bacteria to protect (the beam zaps the nearest
 *   cell, helper or germ, so the child steers toward the germs), the gut
 *   buddies (good bacteria that crowd germs and slow them) and antibody
 *   darts (they stick to one germ so the beam clears it faster); the finale's
 *   nerve relays, lit one at a time, and its fever (germs slow down); and free
 *   exploring, where body fact cards float in a healed area.
 *
 * This class only draws, moves and reports; the game asks the questions,
 * gives the stars and decides what happens next (see game.ts).
 */

export type FlightEvent =
  | { type: 'scan'; index: number }
  | { type: 'nest' }
  | { type: 'nest-locked' }
  | { type: 'pop'; left: number }
  | { type: 'bump' }
  | { type: 'healed' }
  | { type: 'exit' }
  | { type: 'helper' }
  | { type: 'card'; index: number };

export interface FlightSetup {
  area: BodyArea;
  /** The germ of this mission (the finale passes several: they take turns). */
  germ: GermId | GermId[];
  scans: Array<{ x: number; y: number }>;
  nest: { x: number; y: number };
  start: { x: number; y: number };
  exit: { x: number; y: number };
  upgrades: UpgradeId[];
  /** Air or blood flowing one way (tiles per second). */
  flow?: { x: number; y: number };
  /** The flow comes in pushes, with each heartbeat (the blood). */
  pulse?: boolean;
  /** Good gut bacteria wandering about (the beam can hit them too). */
  helpers?: number;
  /** The spots light up one at a time, in order (the finale's nerve relays). */
  ordered?: boolean;
  /** The brain's fever slows every germ down (the finale). */
  fever?: boolean;
  /** Free exploring: no questions and no germs, the way home is open, and fact cards float about. */
  explore?: boolean;
  cards?: Array<{ x: number; y: number }>;
}

interface Scan {
  x: number;
  y: number;
  ring: THREE.Object3D[];
  marker: THREE.Mesh;
  state: 'open' | 'asking' | 'done';
  /** After the question closes without an answer: wait for the ship to fly away before asking again. */
  cool: boolean;
}

interface Germ {
  m: THREE.Mesh;
  sh: THREE.Mesh;
  x: number;
  y: number;
  hx: number;
  hy: number;
  tx: number;
  ty: number;
  hp: number;
  ph: number;
  stuck: number;
  goo: THREE.Mesh | null;
  kind: GermId;
  /** An antibody dart stuck to it (the beam clears it twice as fast). */
  tag: THREE.Mesh | null;
}

interface Helper {
  m: THREE.Mesh;
  sh: THREE.Mesh;
  x: number;
  y: number;
  hx: number;
  hy: number;
  ph: number;
  ouch: number;
}

interface Card {
  m: THREE.Mesh;
  x: number;
  y: number;
  got: boolean;
}

interface Dart {
  m: THREE.Mesh;
  x: number;
  y: number;
  target: Germ;
}

interface Spark {
  m: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  max: number;
}

const RANGE = 3.2;
const GERM_HP = 0.9;
const SPEED = 6;
const ACCEL = 26;

const tex = (b: PixelBuffer) => pixelTexture(b.toCanvas());

function dot(color: string, size: number): PixelBuffer {
  const p = new Paint(size, size);
  p.ellipse(size / 2, size / 2, size / 2 - 0.5, size / 2 - 0.5, ramp(color), { form: 'sphere', bias: 0.3 });
  return p.toBuffer({ outline: false });
}

export class BodyFlight {
  readonly stage: Stage;
  readonly px = STAR_STATION.px;
  scene = new THREE.Scene();
  lighting = new Lighting();
  /** Each body area is built once and kept (its pictures are reused on every dive there). */
  private areas = new Map<BodyArea, { scene: THREE.Scene; built: SettingScene }>();
  /** Everything that belongs to one dive (the ship, germs, spots, sparkles), freed when the dive ends. */
  private dive = new THREE.Group();
  built!: SettingScene;
  private setup!: FlightSetup;
  private ship!: THREE.Mesh;
  private shipShadow!: THREE.Mesh;
  private shipTex!: Record<'left' | 'right', THREE.Texture[]>;
  private nib!: THREE.Mesh;
  private nibTex: THREE.Texture[] = [];
  private germTex = new Map<GermId, THREE.Texture[]>();
  private germKinds: GermId[] = [];
  private helperTex: THREE.Texture[] = [];
  private helpers: Helper[] = [];
  private buddies: Array<{ m: THREE.Mesh; x: number; y: number }> = [];
  private darts: Dart[] = [];
  private dartTex!: THREE.Texture;
  private tagTex!: THREE.Texture;
  private dartTimer = 1.5;
  private cards: Card[] = [];
  private cardTex: THREE.Texture[] = [];
  private helperCool = 0;
  /** Seconds the beam rests after hitting a helper. */
  private beamRest = 0;
  helperHits = 0;
  private beamTex!: THREE.Texture;
  private sparkTex: THREE.Texture[] = [];
  private gooTex!: THREE.Texture;
  private escortTex: THREE.Texture[] = [];
  private beams: THREE.Mesh[] = [];
  private sparks: Spark[] = [];
  private escort: { m: THREE.Mesh; x: number; y: number; target: Germ | null } | null = null;
  private nestIdle: Germ[] = [];
  private nestMarker!: THREE.Mesh;
  private exitMarker!: THREE.Mesh;
  private exitGlow: THREE.Object3D[] = [];
  private waveRing!: THREE.Mesh;
  private waveT = -1;
  private scans: Scan[] = [];
  germs: Germ[] = [];
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  facing: 'left' | 'right' = 'right';
  phase: 'explore' | 'asking-nest' | 'heal' | 'healed' | 'free' = 'explore';
  paused = false;
  reducedMotion = false;
  /** The point (in tiles) the ship steers toward while the pointer is held down. */
  pointer: { x: number; y: number } | null = null;
  waveCooldown = 0;
  private netTimer = 3;
  private bumpCool = 0;
  private lockedCool = 0;
  private time = 0;
  onEvent: ((e: FlightEvent) => void) | null = null;

  constructor(host: HTMLElement) {
    this.stage = new Stage(host, this.px);
    this.stage.maxTilesTall = 16;
    this.stage.resize();
    this.setVisible(false);
  }

  setVisible(on: boolean): void {
    this.stage.canvas.style.display = on ? '' : 'none';
  }

  get scansLeft(): number {
    return this.scans.filter((s) => s.state !== 'done').length;
  }

  get cardsLeft(): number {
    return this.cards.filter((c) => !c.got).length;
  }

  // ------------------------------------------------------------ building a dive

  start(setup: FlightSetup): void {
    this.setup = setup;
    const T = this.px;
    this.disposeDive();
    let area = this.areas.get(setup.area);
    if (!area) {
      const scene = new THREE.Scene();
      const lighting = new Lighting();
      const ctx: SceneCtx = { scene, lighting, px: T, time: 'day' };
      const built = BODY_SETTINGS.find((s) => s.id === `body-${setup.area}`)!.build(ctx);
      lighting.set(STAR_STATION.tint.day, 0);
      area = { scene, built };
      this.areas.set(setup.area, area);
    }
    this.scene = area.scene;
    this.built = area.built;
    this.stage.setBounds(this.built.map.w, this.built.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(this.built.clear), 1);
    this.lighting = new Lighting();
    this.lighting.set(STAR_STATION.tint.day, 0);
    this.dive = new THREE.Group();
    this.scene.add(this.dive);
    const add = <O extends THREE.Object3D>(o: O): O => {
      this.dive.add(o);
      return o;
    };

    this.shipTex = { right: [0, 1, 2].map((f) => tex(paintMicroScout(T, 'right', f))), left: [0, 1, 2].map((f) => tex(paintMicroScout(T, 'left', f))) };
    this.ship = add(billboard(this.lighting, T, paintMicroScout(T, 'right', 0).toCanvas(), setup.start.x, setup.start.y, 1.2));
    this.shipShadow = add(shadow(T, 1.4));
    this.nibTex = [0, 1].map((f) => tex(paintNib(T, f)));
    this.nib = add(billboard(this.lighting, T, paintNib(T, 0).toCanvas(), setup.start.x - 1.3, setup.start.y, 2));
    this.germKinds = Array.isArray(setup.germ) ? setup.germ : [setup.germ];
    this.germTex = new Map(this.germKinds.map((g) => [g, [0, 1].map((f) => tex(paintGerm(g, T, f)))]));
    this.helperTex = [0, 1].map((f) => tex(paintGoodBacteria(T, f)));
    this.dartTex = tex(dot('#ffcf6a', 5));
    this.tagTex = tex(dot('#ff6fc0', 6));
    this.cardTex = [0, 1].map((f) => tex(paintFactCard(T, f)));
    this.beamTex = tex(dot('#8fe6ff', 5));
    this.sparkTex = ['#ffffff', '#8fe6ff', '#ffcf6a'].map((c) => tex(dot(c, 4)));
    this.gooTex = tex(paintMucus(T, 0));
    this.beams = Array.from({ length: 16 }, () => {
      const m = add(billboard(null, T, this.beamTex.image as HTMLCanvasElement, 0, 0, 1));
      m.visible = false;
      return m;
    });
    this.sparks = [];
    this.x = setup.start.x;
    this.y = setup.start.y;
    this.vx = 0;
    this.vy = 0;
    this.phase = 'explore';
    this.pointer = null;
    this.waveCooldown = 0;
    this.netTimer = 3;
    this.dartTimer = 1.5;
    this.waveT = -1;
    this.helperHits = 0;
    this.helperCool = 0;
    this.beamRest = 0;
    this.darts = [];

    // scan spots: a glowing ring on the floor and a bobbing marker
    this.scans = setup.scans.map((s) => {
      const ring = [add(glow(this.lighting, T, Math.round(T * 2.2), '#5fe3ff', s.x, s.y, 0.1, 0.8)), add(lightPool(this.lighting, T, s.x, s.y, 1.1, '#5fe3ff', 0.45))];
      const marker = add(billboard(this.lighting, T, (setup.ordered ? paintRelayMarker(T, 0) : paintScanMarker(T, 0)).toCanvas(), s.x, s.y, 1.6));
      return { x: s.x, y: s.y, ring, marker, state: 'open' as const, cool: false };
    });
    const markerTex = [0, 1].map((f) => tex(setup.ordered ? paintRelayMarker(T, f) : paintScanMarker(T, f)));
    (this.scans as unknown as { markerTex: THREE.Texture[] }).markerTex = markerTex;
    this.showNextRelay();

    // the nest: three germs huddled, and a marker once it opens
    this.germs = [];
    this.nestIdle = [];
    if (!setup.explore) {
      add(lightPool(this.lighting, T, setup.nest.x, setup.nest.y, 1.8, '#ff6f8a', 0.35));
      this.nestIdle = [
        [-0.7, 0],
        [0.7, 0.2],
        [0, -0.6],
      ].map(([dx, dy], i) => this.makeGerm(setup.nest.x + dx, setup.nest.y + dy, i));
    }
    // the brain's fever: a warm glow over the whole area
    if (setup.fever) add(feverPool(this.lighting, T, 13, 10, 12, '#ff9f43', 0.18));
    this.nestMarker = add(billboard(this.lighting, T, paintScanMarker(T, 1).toCanvas(), setup.nest.x, setup.nest.y, 2.4));
    this.nestMarker.visible = false;

    // the way home: a shrink-beam ring that appears when the area is healed
    this.exitGlow = [add(glow(this.lighting, T, Math.round(T * 2.6), '#8fe6ff', setup.exit.x, setup.exit.y, 0.1, 0.9)), add(lightPool(this.lighting, T, setup.exit.x, setup.exit.y, 1.4, '#8fe6ff', 0.5))];
    this.exitMarker = add(billboard(this.lighting, T, paintScanMarker(T, 0).toCanvas(), setup.exit.x, setup.exit.y, 1.8));
    this.showExit(!!setup.explore);
    if (setup.explore) this.phase = 'free';

    // body fact cards (free exploring)
    this.cards = (setup.cards ?? []).map((c) => ({ m: add(billboard(this.lighting, T, paintFactCard(T, 0).toCanvas(), c.x, c.y, 1.2)), x: c.x, y: c.y, got: false }));

    // good gut bacteria wandering (helpers: do not zap them)
    this.helpers = Array.from({ length: setup.helpers ?? 0 }, (_, i) => {
      const a = (i / (setup.helpers ?? 1)) * Math.PI * 2 + 0.4;
      const hx = setup.nest.x + Math.cos(a) * 3.2;
      const hy = Math.min(16.5, Math.max(4.5, setup.nest.y + Math.sin(a) * 2.4));
      const m = add(billboard(this.lighting, T, paintGoodBacteria(T, 0).toCanvas(), hx, hy, 0.5));
      const sh = add(shadow(T, 0.9));
      return { m, sh, x: hx, y: hy, hx, hy, ph: i * 2.1, ouch: 0 };
    });

    // the saliva wave's ring
    const ringPaint = new Paint(T * 7, T * 7);
    for (let a = 0; a < Math.PI * 2; a += 0.02) ringPaint.ellipse(T * 3.5 + Math.cos(a) * T * 3.2, T * 3.5 + Math.sin(a) * T * 3.2, 1.4, 1.4, ramp('#8fe6ff'), { form: 'flat', level: 3 });
    this.waveRing = add(new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: pixelTexture(ringPaint.toBuffer({ outline: false }).toCanvas()), transparent: true, depthWrite: false })));
    this.waveRing.rotation.x = -Math.PI / 2;
    this.waveRing.visible = false;

    // the white blood cell escort
    this.escort = null;
    if (setup.upgrades.includes('escort')) {
      this.escortTex = [0, 1].map((f) => tex(paintWhiteCell(T, f)));
      const m = add(billboard(this.lighting, T, paintWhiteCell(T, 0).toCanvas(), this.x + 1.5, this.y, 0.8));
      this.escort = { m, x: this.x + 1.5, y: this.y, target: null };
    }
    // the gut buddies: two good bacteria flying with the ship
    this.buddies = setup.upgrades.includes('buddies') ? [0, 1].map(() => ({ m: add(billboard(this.lighting, T, paintGoodBacteria(T, 0).toCanvas(), this.x, this.y, 0.9)), x: this.x, y: this.y })) : [];
    this.follow(true);
  }

  /** The finale's nerve relays light up one at a time: only the next one shows. */
  private showNextRelay(): void {
    if (!this.setup.ordered) return;
    const next = this.scans.find((s) => s.state !== 'done');
    for (const s of this.scans) {
      const on = s === next;
      s.marker.visible = on;
      for (const r of s.ring) r.visible = on;
    }
  }

  /** Which scan spot is lit next (the finale), or -1. */
  get nextRelay(): number {
    return this.setup?.ordered ? this.scans.findIndex((s) => s.state !== 'done') : -1;
  }

  /**
   * Free the last dive's graphics memory (without this, a long play session
   * slowly fills the graphics card and gets slower). The body area itself is
   * kept for the next dive there. three.js re-uploads anything disposed if it
   * is ever drawn again.
   */
  private disposeDive(): void {
    const textures = new Set<THREE.Texture>([...this.germTex.values()].flat());
    for (const t of [...this.helperTex, ...this.sparkTex, ...this.cardTex, ...this.nibTex, ...this.escortTex]) textures.add(t);
    if (this.shipTex) for (const t of [...this.shipTex.left, ...this.shipTex.right]) textures.add(t);
    for (const t of [this.beamTex, this.gooTex, this.dartTex, this.tagTex]) if (t) textures.add(t);
    this.dive.removeFromParent();
    this.dive.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry?.dispose();
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        const map = (mat as THREE.MeshBasicMaterial).map;
        if (map) textures.add(map);
        mat.dispose();
      }
    });
    for (const t of textures) t.dispose();
  }

  /** Take a short-lived object (a sparkle, a popped germ, a dart) out of the scene and free its memory. */
  private drop(...objs: Array<THREE.Object3D | null | undefined>): void {
    for (const o of objs) {
      if (!o) continue;
      o.removeFromParent();
      const m = o as THREE.Mesh;
      if (!m.isMesh) continue;
      m.geometry?.dispose();
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        (mat as THREE.MeshBasicMaterial).map?.dispose();
        mat.dispose();
      }
    }
  }

  private makeGerm(x: number, y: number, i: number): Germ {
    const T = this.px;
    const kind = this.germKinds[i % this.germKinds.length];
    const m = billboard(this.lighting, T, this.germTex.get(kind)![0].image as HTMLCanvasElement, x, y, 0.6);
    const sh = shadow(T, 1);
    sh.position.set(x, 0.015, y * K);
    this.dive.add(m, sh);
    return { m, sh, x, y, hx: x, hy: y, tx: x, ty: y, hp: GERM_HP, ph: i * 1.7, stuck: 0, goo: null, kind, tag: null };
  }

  private showExit(on: boolean): void {
    this.exitMarker.visible = on;
    for (const g of this.exitGlow) g.visible = on;
  }

  // ------------------------------------------------------------ the game tells the flight what happened

  /** The scan question was answered: the spot is done. */
  completeScan(i: number): void {
    const s = this.scans[i];
    if (!s) return;
    s.state = 'done';
    for (const r of s.ring) r.visible = false;
    s.marker.visible = false;
    this.burst(s.x, s.y, 14);
    this.showNextRelay();
    if (this.scansLeft === 0) this.nestMarker.visible = true;
  }

  /** The scan question was left without an answer: ask again after the ship flies away. */
  reopenScan(i: number): void {
    const s = this.scans[i];
    if (!s || s.state === 'done') return;
    s.state = 'open';
    s.cool = true;
  }

  /** The diagnose question was left without an answer. */
  reopenNest(): void {
    if (this.phase === 'asking-nest') this.phase = 'explore';
    this.lockedCool = 2;
  }

  /** The diagnose question was answered: the germs come out. */
  startHeal(count: number): void {
    this.phase = 'heal';
    this.nestMarker.visible = false;
    const n = this.setup.nest;
    this.germs = [...this.nestIdle];
    this.nestIdle = [];
    for (let i = this.germs.length; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const r = 1.5 + (i % 3) * 1.1;
      const map = this.built.walk!;
      const x = Math.min(map.x1 - 1, Math.max(map.x0 + 1, n.x + Math.cos(a) * r));
      const y = Math.min(map.y1 - 1, Math.max(map.y0 + 1, n.y + Math.sin(a) * r * 0.8));
      this.germs.push(this.makeGerm(x, y, i));
    }
    for (const g of this.germs) {
      g.hx = g.x;
      g.hy = g.y;
    }
  }

  /** The saliva wave: zaps every germ close by (returns false while it recharges). */
  useWave(): boolean {
    if (!this.setup.upgrades.includes('wave') || this.waveCooldown > 0 || this.phase !== 'heal') return false;
    this.waveCooldown = 5;
    this.waveT = 0;
    for (const g of this.germs) if (Math.hypot(g.x - this.x, g.y - this.y) < 3.5) g.hp -= 1.2;
    return true;
  }

  get hasWave(): boolean {
    return this.setup?.upgrades.includes('wave') ?? false;
  }

  // ------------------------------------------------------------ every frame

  update(dt: number, dir: { x: number; y: number }): void {
    if (this.paused) {
      this.animate(dt, false);
      return;
    }
    this.time += dt;
    // steering: keys or the touch pad, or toward the held pointer
    let ax = dir.x;
    let ay = dir.y;
    if (!ax && !ay && this.pointer) {
      const dx = this.pointer.x - this.x;
      const dy = this.pointer.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.3) {
        ax = dx / d;
        ay = dy / d;
      }
    }
    const len = Math.hypot(ax, ay);
    if (len > 0) {
      this.vx += (ax / len) * ACCEL * dt;
      this.vy += (ay / len) * ACCEL * dt;
    } else {
      const damp = Math.max(0, 1 - 5 * dt);
      this.vx *= damp;
      this.vy *= damp;
    }
    const sp = Math.hypot(this.vx, this.vy);
    if (sp > SPEED) {
      this.vx *= SPEED / sp;
      this.vy *= SPEED / sp;
    }
    const flow = this.flowNow();
    const w = this.built.walk!;
    this.x = Math.min(w.x1 - 0.6, Math.max(w.x0 + 0.6, this.x + (this.vx + flow.x) * dt));
    this.y = Math.min(w.y1 - 0.3, Math.max(w.y0 + 0.3, this.y + (this.vy + flow.y) * dt));
    if (Math.abs(this.vx) > 0.4) this.facing = this.vx > 0 ? 'right' : 'left';

    this.checkSpots(dt);
    this.updateHelpers(dt);
    if (this.phase === 'heal') this.updateGerms(dt);
    this.animate(dt, true);
    this.follow(false);
  }

  /** The flow right now: in the blood it surges with each heartbeat (about 72 beats a minute). */
  private flowNow(): { x: number; y: number } {
    const f = this.setup.flow ?? { x: 0, y: 0 };
    if (!this.setup.pulse) return f;
    const beat = Math.max(0, Math.sin(this.time * Math.PI * 2 * 1.2));
    const k = 0.35 + 1.6 * beat * beat;
    return { x: f.x * k, y: f.y * k };
  }

  /** The heartbeat (0-1) for the HUD and the screen shake-free pulse. */
  get beat(): number {
    return this.setup?.pulse ? Math.max(0, Math.sin(this.time * Math.PI * 2 * 1.2)) : 0;
  }

  private updateHelpers(dt: number): void {
    const t = this.time;
    const w = this.built.walk!;
    for (const h of this.helpers) {
      h.ouch = Math.max(0, h.ouch - dt);
      const tx = h.hx + Math.sin(t * 0.4 + h.ph) * 1.6;
      const ty = h.hy + Math.cos(t * 0.33 + h.ph * 1.3) * 1.1;
      // a zapped helper scoots away from the ship for a moment
      let mx = tx - h.x;
      let my = ty - h.y;
      if (h.ouch > 0) {
        const d = Math.hypot(h.x - this.x, h.y - this.y) || 1;
        mx = ((h.x - this.x) / d) * 3;
        my = ((h.y - this.y) / d) * 3;
      }
      const ml = Math.hypot(mx, my);
      if (ml > 0.05) {
        const sp = h.ouch > 0 ? 3 : 0.8;
        h.x = Math.min(w.x1 - 0.5, Math.max(w.x0 + 0.5, h.x + (mx / ml) * sp * dt));
        h.y = Math.min(w.y1 - 0.4, Math.max(w.y0 + 0.4, h.y + (my / ml) * sp * dt));
      }
    }
    // free exploring: fly into a fact card to collect it
    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i];
      if (c.got || Math.hypot(c.x - this.x, c.y - this.y) > 1) continue;
      c.got = true;
      c.m.visible = false;
      this.burst(c.x, c.y, 16);
      this.onEvent?.({ type: 'card', index: i });
    }
  }

  private checkSpots(dt: number): void {
    for (let i = 0; i < this.scans.length; i++) {
      const s = this.scans[i];
      const d = Math.hypot(s.x - this.x, s.y - this.y);
      if (s.cool && d > 2) s.cool = false;
      if (this.setup.ordered && i !== this.nextRelay) continue;
      if (s.state === 'open' && !s.cool && d < 1.1) {
        s.state = 'asking';
        this.vx *= 0.2;
        this.vy *= 0.2;
        this.onEvent?.({ type: 'scan', index: i });
        return;
      }
    }
    const n = this.setup.nest;
    const dn = Math.hypot(n.x - this.x, n.y - this.y);
    this.lockedCool = Math.max(0, this.lockedCool - dt);
    if (this.phase === 'explore' && !this.setup.explore && dn < 1.4 && this.lockedCool <= 0) {
      if (this.scansLeft > 0) {
        this.lockedCool = 4;
        this.onEvent?.({ type: 'nest-locked' });
      } else {
        this.phase = 'asking-nest';
        this.vx *= 0.2;
        this.vy *= 0.2;
        this.onEvent?.({ type: 'nest' });
      }
    }
    if ((this.phase === 'healed' || this.phase === 'free') && Math.hypot(this.setup.exit.x - this.x, this.setup.exit.y - this.y) < 1.2) {
      this.phase = 'explore';
      this.onEvent?.({ type: 'exit' });
    }
  }

  private updateGerms(dt: number): void {
    const t = this.time;
    this.bumpCool = Math.max(0, this.bumpCool - dt);
    this.waveCooldown = Math.max(0, this.waveCooldown - dt);
    // the mucus net: every few seconds, sticky mucus catches the germs near the ship
    if (this.setup.upgrades.includes('net')) {
      this.netTimer -= dt;
      if (this.netTimer <= 0) {
        this.netTimer = 5;
        for (const g of this.germs)
          if (Math.hypot(g.x - this.x, g.y - this.y) < 2.8) {
            g.stuck = 2.5;
            if (!g.goo) {
              g.goo = billboard(this.lighting, this.px, this.gooTex.image as HTMLCanvasElement, g.x, g.y, 0.3);
              this.dive.add(g.goo);
            }
          }
      }
    }
    const w = this.built.walk!;
    for (const g of this.germs) {
      // wander round home, scooting away from the ship when it gets close
      if (g.stuck > 0) g.stuck -= dt;
      else {
        if (Math.hypot(g.tx - g.x, g.ty - g.y) < 0.2 || hashT(t, g.ph) < dt * 0.6) {
          g.tx = g.hx + Math.sin(t * 0.7 + g.ph * 3) * 2.2;
          g.ty = g.hy + Math.cos(t * 0.5 + g.ph * 2) * 1.6;
        }
        let mx = g.tx - g.x;
        let my = g.ty - g.y;
        const dShip = Math.hypot(this.x - g.x, this.y - g.y);
        if (dShip < 2.2) {
          mx -= ((this.x - g.x) / dShip) * 2;
          my -= ((this.y - g.y) / dShip) * 2;
        }
        const ml = Math.hypot(mx, my) || 1;
        // the brain's fever slows every germ; the gut buddies crowd the ones close to them
        const crowded = this.buddies.some((b) => Math.hypot(b.x - g.x, b.y - g.y) < 2.2);
        const gs = 1.3 * (this.setup.fever ? 0.55 : 1) * (crowded ? 0.4 : 1);
        g.x = Math.min(w.x1 - 0.5, Math.max(w.x0 + 0.5, g.x + (mx / ml) * gs * dt));
        g.y = Math.min(w.y1 - 0.4, Math.max(w.y0 + 0.4, g.y + (my / ml) * gs * dt));
      }
      if (g.goo) {
        if (g.stuck > 0) g.goo.position.set(g.x, 0.3 * K, g.y * K + 0.02);
        else {
          this.drop(g.goo);
          g.goo = null;
        }
      }
      // a bump only nudges the ship
      if (this.bumpCool <= 0 && Math.hypot(g.x - this.x, g.y - this.y) < 0.7) {
        this.bumpCool = 1.5;
        const d = Math.hypot(this.x - g.x, this.y - g.y) || 1;
        this.vx = ((this.x - g.x) / d) * 6;
        this.vy = ((this.y - g.y) / d) * 6;
        this.onEvent?.({ type: 'bump' });
      }
    }
    // the cleaning beam (and the escort's) zap the nearest germ in range
    const nearest = (x: number, y: number, skip?: Germ | null): Germ | null => {
      let best: Germ | null = null;
      let bd = RANGE;
      for (const g of this.germs) {
        if (g === skip) continue;
        const d = Math.hypot(g.x - x, g.y - y);
        if (d < bd) {
          bd = d;
          best = g;
        }
      }
      return best;
    };
    let used = 0;
    const drawBeam = (fx: number, fy: number, gx: number, gy: number, n: number) => {
      for (let k = 0; k < n && used < this.beams.length; k++, used++) {
        const f = (k + 1) / (n + 1) + (Math.sin(t * 30 + k) * 0.03);
        const m = this.beams[used];
        m.visible = true;
        m.position.set(fx + (gx - fx) * f, (1.1 - 0.5 * f) * K, (fy + (gy - fy) * f) * K + 0.05);
      }
    };
    this.beamRest = Math.max(0, this.beamRest - dt);
    this.helperCool = Math.max(0, this.helperCool - dt);
    const target = nearest(this.x, this.y);
    // the ship's beam takes the nearest cell: if a helper is closer than every germ, it hits the helper
    let helper: Helper | null = null;
    let hd = target ? Math.hypot(target.x - this.x, target.y - this.y) : RANGE;
    for (const h of this.helpers) {
      const d = Math.hypot(h.x - this.x, h.y - this.y);
      if (d < hd) {
        hd = d;
        helper = h;
      }
    }
    if (this.beamRest <= 0) {
      if (helper) {
        drawBeam(this.x, this.y, helper.x, helper.y, 8);
        helper.ouch = 1.2;
        this.beamRest = 1;
        this.helperHits++;
        if (this.helperCool <= 0) {
          this.helperCool = 3;
          this.onEvent?.({ type: 'helper' });
        }
      } else if (target) {
        target.hp -= dt * (target.tag ? 2 : 1);
        drawBeam(this.x, this.y, target.x, target.y, 8);
      }
    }
    if (this.escort) {
      const e = this.escort;
      const a = t * 1.6;
      e.x = this.x + Math.cos(a) * 1.6;
      e.y = this.y + Math.sin(a) * 1.1;
      e.target = nearest(e.x, e.y, target);
      if (e.target) {
        e.target.hp -= dt * 0.7 * (e.target.tag ? 2 : 1);
        drawBeam(e.x, e.y, e.target.x, e.target.y, 6);
      }
    }
    // antibody darts: every few seconds one flies to a germ and sticks to it
    if (this.setup.upgrades.includes('darts')) {
      this.dartTimer -= dt;
      if (this.dartTimer <= 0) {
        this.dartTimer = 2.5;
        let best: Germ | null = null;
        let bd = 7;
        for (const g of this.germs) {
          const d = Math.hypot(g.x - this.x, g.y - this.y);
          if (!g.tag && d < bd && !this.darts.some((x) => x.target === g)) {
            bd = d;
            best = g;
          }
        }
        if (best) {
          const m = billboard(null, this.px, this.dartTex.image as HTMLCanvasElement, this.x, this.y, 1);
          this.dive.add(m);
          this.darts.push({ m, x: this.x, y: this.y, target: best });
        }
      }
    }
    for (const d of [...this.darts]) {
      const g = d.target;
      const dx = g.x - d.x;
      const dy = g.y - d.y;
      const dist = Math.hypot(dx, dy);
      if (!this.germs.includes(g) || dist < 0.3) {
        this.drop(d.m);
        this.darts.splice(this.darts.indexOf(d), 1);
        if (this.germs.includes(g) && !g.tag) {
          g.tag = billboard(null, this.px, this.tagTex.image as HTMLCanvasElement, g.x, g.y, 1.4);
          this.dive.add(g.tag);
        }
        continue;
      }
      d.x += (dx / dist) * 10 * dt;
      d.y += (dy / dist) * 10 * dt;
      d.m.position.set(d.x, 1 * K, d.y * K + 0.05);
    }
    for (let k = used; k < this.beams.length; k++) this.beams[k].visible = false;
    // germs with no strength left pop into sparkles
    for (const g of [...this.germs]) {
      if (g.hp > 0) continue;
      this.drop(g.m, g.sh, g.goo, g.tag);
      this.germs.splice(this.germs.indexOf(g), 1);
      this.burst(g.x, g.y, 12);
      this.onEvent?.({ type: 'pop', left: this.germs.length });
    }
    if (!this.germs.length) {
      this.phase = 'healed';
      for (const b of this.beams) b.visible = false;
      for (const d of this.darts) this.drop(d.m);
      this.darts = [];
      this.showExit(true);
      // the healed spot glows a warm, healthy green, with a big burst of sparkles
      const nest = this.setup.nest;
      this.dive.add(lightPool(this.lighting, this.px, nest.x, nest.y, 3.6, '#9cf0a0', 0.5));
      this.burst(nest.x, nest.y, 24);
      this.onEvent?.({ type: 'healed' });
    }
  }

  private burst(x: number, y: number, n: number): void {
    if (this.reducedMotion) n = Math.ceil(n / 3);
    for (let i = 0; i < n; i++) {
      const m = billboard(null, this.px, this.sparkTex[i % 3].image as HTMLCanvasElement, x, y, 0.8);
      this.dive.add(m);
      const a = (i / n) * Math.PI * 2;
      this.sparks.push({ m, vx: Math.cos(a) * 2.4, vy: Math.sin(a) * 1.8, vz: 1.5 + (i % 3) * 0.4, life: 0.7, max: 0.7 });
    }
  }

  private animate(dt: number, moving: boolean): void {
    const t = this.time;
    const T = this.px;
    const snap = (v: number) => Math.round(v * T) / T;
    this.built.update(t, this.stage.target.x);
    const thrust = moving && Math.hypot(this.vx, this.vy) > 0.6;
    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(t * 3) * 1.5) / T;
    this.ship.position.set(snap(this.x), (1.2 + bob) * K, snap(this.y) * K);
    swapFrame(this.ship, this.shipTex[this.facing][thrust ? 1 + (Math.floor(t * 12) % 2) : 0]);
    this.shipShadow.position.set(snap(this.x), 0.015, snap(this.y) * K);
    this.nib.position.set(snap(this.x + (this.facing === 'right' ? -1.3 : 1.3)), (2 + (this.reducedMotion ? 0 : Math.round(Math.sin(t * 4 + 1) * 2) / T)) * K, snap(this.y - 0.2) * K);
    swapFrame(this.nib, this.nibTex[Math.floor(t * 3) % 2]);
    const markerTex = (this.scans as unknown as { markerTex: THREE.Texture[] }).markerTex;
    for (const s of this.scans) {
      if (!s.marker.visible) continue;
      s.marker.position.y = (1.6 + (this.reducedMotion ? 0 : Math.round(Math.sin(t * 3 + s.x) * 3) / T)) * K;
      swapFrame(s.marker, markerTex[Math.floor(t * 2) % 2]);
    }
    if (this.nestMarker.visible) this.nestMarker.position.y = (2.4 + (this.reducedMotion ? 0 : Math.round(Math.sin(t * 3) * 3) / T)) * K;
    if (this.exitMarker.visible) this.exitMarker.position.y = (1.8 + (this.reducedMotion ? 0 : Math.round(Math.sin(t * 3) * 3) / T)) * K;
    for (const g of [...this.nestIdle, ...this.germs]) {
      g.m.position.set(snap(g.x), (0.6 + (this.reducedMotion ? 0 : Math.round(Math.sin(t * 2 + g.ph) * 2) / T)) * K, snap(g.y) * K);
      g.sh.position.set(snap(g.x), 0.015, snap(g.y) * K);
      swapFrame(g.m, this.germTex.get(g.kind)![Math.floor(t * 2 + g.ph) % 2]);
      if (g.tag) g.tag.position.set(snap(g.x + 0.3), 1.5 * K, snap(g.y) * K + 0.03);
    }
    for (const h of this.helpers) {
      h.m.position.set(snap(h.x), (0.5 + (h.ouch > 0 && !this.reducedMotion ? Math.round(Math.sin(t * 30) * 2) / T : 0)) * K, snap(h.y) * K);
      h.sh.position.set(snap(h.x), 0.015, snap(h.y) * K);
      swapFrame(h.m, this.helperTex[Math.floor(t * 2 + h.ph) % 2]);
    }
    this.buddies.forEach((b, i) => {
      const a = t * 1.1 + i * Math.PI;
      b.x = this.x + Math.cos(a) * 2;
      b.y = this.y + Math.sin(a) * 1.3;
      b.m.position.set(snap(b.x), 0.9 * K, snap(b.y) * K);
      swapFrame(b.m, this.helperTex[Math.floor(t * 2 + i) % 2]);
    });
    for (const c of this.cards) {
      if (c.got) continue;
      c.m.position.y = (1.2 + (this.reducedMotion ? 0 : Math.round(Math.sin(t * 2.4 + c.x) * 3) / T)) * K;
      swapFrame(c.m, this.cardTex[Math.floor(t * 2 + c.x) % 2]);
    }
    if (this.escort) {
      this.escort.m.position.set(snap(this.escort.x), 0.8 * K, snap(this.escort.y) * K);
      swapFrame(this.escort.m, this.escortTex[Math.floor(t * 2) % 2]);
    }
    if (this.waveT >= 0) {
      this.waveT += dt;
      const k = Math.min(1, this.waveT / 0.5);
      this.waveRing.visible = this.waveT < 0.5;
      this.waveRing.position.set(this.x, 0.05, this.y * K);
      this.waveRing.scale.setScalar(0.2 + k);
      if (this.waveT >= 0.5) this.waveT = -1;
    }
    for (const s of [...this.sparks]) {
      s.life -= dt;
      if (s.life <= 0) {
        this.drop(s.m);
        this.sparks.splice(this.sparks.indexOf(s), 1);
        continue;
      }
      s.m.position.x += s.vx * dt;
      s.m.position.z += s.vy * dt * K;
      s.m.position.y += s.vz * dt * K;
      s.vz -= 4 * dt;
    }
  }

  /** Keep the ship in view, and show a little of the back wall near the top. */
  follow(snapNow: boolean): void {
    const { w: vw, h: vh } = this.stage.viewTiles;
    const map = this.built.map;
    const x = vw >= map.w ? map.w / 2 : Math.min(map.w - vw / 2, Math.max(vw / 2, this.x));
    const y = vh >= map.h + 2.5 ? (map.h - 2.5) / 2 : Math.min(map.h - vh / 2, Math.max(-2.5 + vh / 2, this.y));
    this.stage.lookAt(x, y, false, snapNow || this.reducedMotion ? 0 : 0.12);
  }

  screenOf(x: number, y: number, lift = 2): { x: number; y: number; visible: boolean } {
    return this.stage.project(new THREE.Vector3(x, lift * K, y * K - 0.4));
  }

  tileAt(cx: number, cy: number): { x: number; y: number } | null {
    return this.stage.screenToTile(cx, cy);
  }

  resize(): void {
    this.stage.resize();
    if (this.built) this.follow(true);
  }

  render(): void {
    this.stage.render(this.scene);
  }

  debug() {
    return {
      ship: { x: this.x, y: this.y },
      phase: this.phase,
      scans: this.scans.map((s) => ({ x: s.x, y: s.y, state: s.state })),
      nest: this.setup?.nest,
      exit: this.setup?.exit,
      germs: this.germs.map((g) => ({ x: g.x, y: g.y, hp: g.hp, kind: g.kind, tagged: !!g.tag })),
      waveCooldown: this.waveCooldown,
      escort: !!this.escort,
      buddies: this.buddies.length,
      helpers: this.helpers.map((h) => ({ x: h.x, y: h.y })),
      helperHits: this.helperHits,
      nextRelay: this.nextRelay,
      time: this.time,
      paused: this.paused,
      gpu: { ...this.stage.renderer.info.memory, programs: this.stage.renderer.info.programs?.length ?? 0, calls: this.stage.renderer.info.render.calls, objects: this.scene.children.length, dive: this.dive.children.length },
      cards: this.cards.map((c) => ({ x: c.x, y: c.y, got: c.got })),
    };
  }

  /** Test helper: put the ship somewhere. */
  teleport(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.follow(true);
  }
}

/** A small repeatable "random" number from the time and a germ (so germs pick new spots now and then). */
function hashT(t: number, ph: number): number {
  const v = Math.sin(t * 12.9898 + ph * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * A big pool of light on the floor, like the kit's `lightPool` (same rings of light), but its
 * pixels are written in one go. The kit draws a glow one pixel at a time; on a picture 256 pixels
 * or wider, the browser hands that drawing to the graphics chip, and hundreds of thousands of tiny
 * squares jam it for many seconds on computers without a strong graphics chip.
 */
function feverPool(lighting: Lighting, px: number, x: number, y: number, radiusTiles: number, color: string, max: number): THREE.Mesh {
  const size = Math.round(radiusTiles * 2 * px);
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const img = new ImageData(size, size);
  const n = parseInt(color.slice(1), 16);
  const r = size / 2;
  const bands: Array<[number, number]> = [
    [0.3, 0.85],
    [0.55, 0.5],
    [0.8, 0.26],
    [1, 0.1],
  ];
  for (let py = 0; py < size; py++)
    for (let pxl = 0; pxl < size; pxl++) {
      const d = Math.hypot(pxl + 0.5 - r, py + 0.5 - r) / r;
      const band = bands.find(([edge]) => d <= edge);
      if (!band) continue;
      const i = (py * size + pxl) * 4;
      img.data[i] = (n >> 16) & 255;
      img.data[i + 1] = (n >> 8) & 255;
      img.data[i + 2] = n & 255;
      img.data[i + 3] = Math.round(band[1] * 255);
    }
  cv.getContext('2d')!.putImageData(img, 0, 0);
  const geo = new THREE.PlaneGeometry(radiusTiles * 2, radiusTiles * 2 * K);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ map: pixelTexture(cv), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  lighting.addGlow(mat, max);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, 0.02, y * K);
  m.renderOrder = 1;
  return m;
}
