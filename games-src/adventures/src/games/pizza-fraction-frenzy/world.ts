import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { ANCIENT_KINGDOMS, Stage, billboard, glow, lightPool, settingById, swapFrame, type SceneCtx, type SettingScene } from '../../kit/worlds';
import { paintBrazier } from '../../kit/worlds/ancient-kingdoms/forum';
import type { Look16 } from '../../kit/worlds/hero16';
import { mixHex } from '../../kit/worlds/shade';
import { Walker16, type Marker16 } from '../../kit/worlds/walker';
import { paintGoose, paintGroma, paintMilestone, paintOven, paintTileBasket } from './art';
import { STATIONS, type Station } from './problems';

/** Everyone the player can talk to (Livia runs the bakery and hosts the festival). */
export type PersonId = Station | 'anser';

export const START = { x: 12.5, y: 12.6 };

/** The top color of the Ancient Kingdoms sky (behind everything, above the painted sky). */
const SKY_TOP = { day: '#5fb6e4', evening: '#2c2a62' };

export const PEOPLE_SPOTS: Record<Station, { x: number; y: number }> = {
  bakery: { x: 5.5, y: 14.5 },
  road: { x: 13.5, y: 18.5 },
  market: { x: 19.5, y: 14.7 },
  mosaic: { x: 12.5, y: 6.9 },
};

/** The four braziers round the mosaic: each job lights one. */
export const BRAZIERS: Array<{ x: number; y: number; job: Station }> = [
  { x: 8.7, y: 11.9, job: 'bakery' },
  { x: 8.7, y: 7.7, job: 'road' },
  { x: 17.3, y: 7.7, job: 'mosaic' },
  { x: 17.3, y: 11.9, job: 'market' },
];

/** Anser waddles between these two spots by the bakery, when not following the player. */
const GOOSE_PATH = [
  { x: 7.4, y: 14.9 },
  { x: 11.2, y: 15.0 },
];

export interface Target {
  kind: 'person';
  id: PersonId;
  x: number;
  y: number;
  label: string;
}

/**
 * The Roman forum on festival day, built from the Ancient Kingdoms world
 * kit's `roman-forum` setting (24 pixels per tile, 16-bit characters). The
 * game adds what is its own: Livia's bread oven, the Golden Milestone and
 * milestone I by the road, Marcus's surveying pole, Anser the goose, and four
 * braziers that light up one by one as jobs are finished.
 */
export class ForumWorld {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  readonly stage: Stage;
  readonly ctx: SceneCtx;
  readonly style = ANCIENT_KINGDOMS;
  grid!: CollisionGrid;
  setting!: SettingScene;
  player!: Walker16;
  readonly people = new Map<Station, Walker16>();
  readonly targets: Target[] = [];
  private braziers: Array<{ mesh: THREE.Mesh; lit: boolean; glowMeshes: THREE.Object3D[] }> = [];
  private brazierLit: THREE.CanvasTexture[] = [];
  private brazierCold!: THREE.CanvasTexture;
  private oven!: THREE.Mesh;
  private ovenTex: THREE.CanvasTexture[] = [];
  private goose!: THREE.Mesh;
  private gooseTex: THREE.CanvasTexture[] = [];
  private gooseAt = { ...GOOSE_PATH[0] };
  private gooseLeg = 1;
  private gooseHonk = 0;
  private gooseWait = 0;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  night = 0;
  reducedMotion = false;
  /** Show the whole forum from the top (the temple and basilica) instead of following the player: the title and the opening. */
  establishing = false;
  onArrive: ((t: Target) => void) | null = null;

  constructor(host: HTMLElement) {
    this.stage = new Stage(host, this.style.px);
    this.ctx = { scene: this.scene, lighting: this.lighting, px: this.style.px, time: 'day', omit: ['braziers'] };
  }

  build(playerLook: Look16, looks: Record<Station, Look16>, names: Record<Station, string>, lit: Station[]): void {
    const T = this.style.px;
    const ctx = this.ctx;
    this.setting = settingById('roman-forum').build(ctx);
    const S = this.setting;
    this.stage.setBounds(S.map.w, S.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(SKY_TOP.day), 1);
    // a wide grass floor under the map, so a tall phone screen or a wide one never sees past the forum's edges
    const turf = document.createElement('canvas');
    turf.width = turf.height = 1;
    const tc = turf.getContext('2d')!;
    tc.fillStyle = '#7fa64c';
    tc.fillRect(0, 0, 1, 1);
    const floorGeo = new THREE.PlaneGeometry(S.map.w + 40, (S.map.h + 20) * K);
    floorGeo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(floorGeo, this.lighting.add(new THREE.MeshBasicMaterial({ map: pixelTexture(turf) })));
    floor.position.set(S.map.w / 2, -0.02, ((S.map.h + 20) / 2) * K);
    this.scene.add(floor);
    this.grid = new CollisionGrid(S.map.w, S.map.h);
    const blockRect = (x: number, y: number, w: number, h: number) => {
      const x0 = Math.floor(x + 0.15);
      const y0 = Math.floor(y + 0.15);
      const x1 = Math.max(x0 + 1, Math.ceil(x + w - 0.15));
      const y1 = Math.max(y0 + 1, Math.ceil(y + h - 0.15));
      this.grid.block(x0, y0, x1 - x0, y1 - y0);
    };
    const walk = S.walk ?? { x0: 0, y0: 0, x1: S.map.w, y1: S.map.h };
    blockRect(0, 0, walk.x0, S.map.h);
    blockRect(walk.x1, 0, S.map.w - walk.x1, S.map.h);
    blockRect(0, 0, S.map.w, walk.y0);
    blockRect(0, walk.y1, S.map.w, S.map.h - walk.y1);
    for (const b of S.blocks ?? []) blockRect(b.x, b.y, b.w, b.h);

    const prop = (cv: HTMLCanvasElement, x: number, y: number) => {
      const m = billboard(this.lighting, T, cv, x, y);
      this.scene.add(m);
      return m;
    };

    // Livia's bread oven, with a warm glow from its mouth after dark
    this.ovenTex = [0, 1, 2].map((f) => pixelTexture(paintOven(T, f).toCanvas()));
    this.oven = prop(this.ovenTex[0].image as HTMLCanvasElement, 2.7, 13.8);
    this.scene.add(glow(this.lighting, T, Math.round(T * 1.6), this.style.glow.ember ?? '#ff8a40', 2.7, 13.8, 0.5, 0.6));
    blockRect(1.5, 12.9, 2.5, 0.9);

    // the Golden Milestone (where Roman roads were counted from) and milestone I
    prop(paintMilestone(T, 0).toCanvas(), 8.4, 18.3);
    prop(paintMilestone(T, 1).toCanvas(), 18.6, 18.3);
    blockRect(8.0, 17.8, 0.8, 0.5);
    blockRect(18.2, 17.8, 0.8, 0.5);
    prop(paintGroma(T).toCanvas(), 15.0, 18.4);
    blockRect(14.7, 18.0, 0.6, 0.4);

    // the four festival braziers (cold until their job is done)
    this.brazierLit = [0, 1, 2].map((f) => pixelTexture(paintBrazier(T, f, true).toCanvas()));
    this.brazierCold = pixelTexture(paintBrazier(T, 0, false).toCanvas());
    this.braziers = BRAZIERS.map((b) => {
      const mesh = prop(this.brazierCold.image as HTMLCanvasElement, b.x, b.y);
      const g = glow(this.lighting, T, Math.round(T * 1.8), '#ffb050', b.x, b.y, 1.4, 0.7);
      const pool = lightPool(this.lighting, T, b.x, b.y + 0.2, 1.8, '#ff9a40', 0.32);
      this.scene.add(g, pool);
      blockRect(b.x - 0.3, b.y - 0.4, 0.6, 0.4);
      return { mesh, lit: false, glowMeshes: [g, pool] };
    });

    // Anser the goose
    this.gooseTex = [0, 1, 2, 3].map((f) => pixelTexture(paintGoose(T, f).toCanvas()));
    this.goose = prop(this.gooseTex[0].image as HTMLCanvasElement, this.gooseAt.x, this.gooseAt.y);

    // people
    this.player = new Walker16(ctx, playerLook, START.x, START.y, 'down');
    this.scene.add(this.player.group);
    // Tullia's basket of tiles by the mosaic
    prop(paintTileBasket(T).toCanvas(), 14.0, 7.0);
    for (const id of STATIONS) {
      const s = PEOPLE_SPOTS[id];
      const w = new Walker16(ctx, looks[id], s.x, s.y, 'down');
      this.people.set(id, w);
      this.scene.add(w.group);
      this.grid.setBlocker(id, s.x, s.y, 0.45);
      this.grid.setDynamic(id, [[Math.floor(s.x), Math.floor(s.y)]]);
      this.targets.push({ kind: 'person', id, x: s.x, y: s.y, label: `Talk to ${names[id]}` });
    }
    this.targets.push({ kind: 'person', id: 'anser', x: this.gooseAt.x, y: this.gooseAt.y, label: 'Say hello to Anser' });
    this.setLit(lit);
  }

  /** Light the braziers for the finished jobs, and move the day a little toward dusk. */
  setLit(done: Station[], dusk = false): void {
    this.braziers.forEach((b, i) => {
      b.lit = done.includes(BRAZIERS[i].job);
      swapFrame(b.mesh, b.lit ? this.brazierLit[0] : this.brazierCold);
      b.glowMeshes.forEach((m) => (m.visible = b.lit));
    });
    this.setting.setTime?.(dusk ? 'evening' : 'day');
    this.setNight(dusk ? 1 : Math.min(0.36, done.length * 0.09));
  }

  get litCount(): number {
    return this.braziers.filter((b) => b.lit).length;
  }

  setNight(n: number): void {
    this.night = n;
    const day = this.style.tint.day;
    const eve = this.style.tint.evening;
    const tint = day.map((v, i) => v + (eve[i] - v) * n) as [number, number, number];
    this.lighting.set(tint, n);
    this.stage.renderer.setClearColor(new THREE.Color(mixHex(SKY_TOP.day, SKY_TOP.evening, n)), 1);
  }

  setMarkers(marks: Partial<Record<Station, Marker16>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id as Station)?.setMarker(m ?? null);
  }

  /** Anser honks and flaps (when a piece of bread goes missing, or on hello). */
  honk(): void {
    this.gooseHonk = 0.8;
  }

  // ------------------------------------------------------------ walking

  walkTo(goal: Target | null, tile?: { x: number; y: number }): void {
    const dest = goal ? { x: goal.x, y: goal.y } : tile!;
    const path = findPath(this.grid, this.player, dest);
    if (!path) return;
    this.path = path.length ? path : null;
    this.pathGoal = goal;
    if (!path.length && goal) this.onArrive?.(goal);
  }

  stopWalking(): void {
    this.path = null;
    this.pathGoal = null;
    this.player.moving = false;
  }

  nearest(): Target | null {
    let best: Target | null = null;
    let d = 1.7;
    for (const t of this.targets) {
      const dd = Math.hypot(t.x - this.player.x, t.y - this.player.y);
      if (dd < d) {
        d = dd;
        best = t;
      }
    }
    return best;
  }

  private face(dx: number, dy: number): void {
    this.player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }

  update(dt: number, input: Input | null): void {
    this.time += dt;
    const p = this.player;
    const dir = input ? input.direction() : { x: 0, y: 0 };
    const speed = 4.4;
    if (dir.x || dir.y) {
      this.path = null;
      this.pathGoal = null;
      const n = this.grid.move(p.x, p.y, dir.x * speed * dt, dir.y * speed * dt, 0.3);
      p.moving = Math.hypot(n.x - p.x, n.y - p.y) > 0.0005;
      this.face(dir.x, dir.y);
      p.x = n.x;
      p.y = n.y;
    } else if (this.path) {
      const wp = this.path[0];
      const dx = wp.x - p.x;
      const dy = wp.y - p.y;
      const dist = Math.hypot(dx, dy);
      const step = speed * dt;
      if (dist <= step) {
        p.x = wp.x;
        p.y = wp.y;
        this.path.shift();
        if (!this.path.length) {
          this.path = null;
          const goal = this.pathGoal;
          this.pathGoal = null;
          p.moving = false;
          if (goal) {
            this.face(goal.x - p.x, goal.y - p.y);
            this.onArrive?.(goal);
          }
        }
      } else {
        const n = this.grid.move(p.x, p.y, (dx / dist) * step, (dy / dist) * step, 0.3);
        const stuck = Math.hypot(n.x - p.x, n.y - p.y) < step * 0.2;
        p.x = n.x;
        p.y = n.y;
        if (stuck) {
          const goal = this.pathGoal;
          this.path = null;
          this.pathGoal = null;
          p.moving = false;
          if (goal && Math.hypot(goal.x - p.x, goal.y - p.y) < 1.7) this.onArrive?.(goal);
        } else {
          p.moving = true;
          this.face(dx, dy);
        }
      }
    } else p.moving = false;
    p.update(dt, this.reducedMotion);
    // people turn to face the player when close
    for (const a of this.people.values()) {
      const near = Math.hypot(p.x - a.x, p.y - a.y) < 3;
      a.facing = near ? (Math.abs(p.x - a.x) > Math.abs(p.y - a.y) ? (p.x > a.x ? 'right' : 'left') : p.y > a.y ? 'down' : 'up') : 'down';
      a.update(dt, this.reducedMotion);
    }
    this.updateForum(dt);
    this.follow(this.establishing ? 0 : this.reducedMotion ? 1 : 0.12);
  }

  /** Keep the player in view, showing the forum's buildings and sky above row 0 when near the top. */
  follow(smooth = 0): void {
    const { w: vw, h: vh } = this.stage.viewTiles;
    const S = this.setting;
    const p = this.player;
    const x = vw >= S.map.w ? S.map.w / 2 : Math.min(S.map.w - vw / 2, Math.max(vw / 2, p.x));
    const top = S.focus.top + vh / 2;
    const y = this.establishing ? top : Math.min(S.map.h - vh / 2, Math.max(top, p.y - 1.6));
    this.stage.lookAt(x, y, false, smooth);
  }

  private updateForum(dt: number): void {
    const t = this.time;
    this.setting.update(t, this.stage.target.x);
    swapFrame(this.oven, this.ovenTex[Math.floor(t * 4) % 3]);
    this.braziers.forEach((b, i) => b.lit && swapFrame(b.mesh, this.brazierLit[(Math.floor(t * 7) + i) % 3]));
    // Anser waddles back and forth by the bakery, pausing now and then
    const g = this.gooseAt;
    const goal = GOOSE_PATH[this.gooseLeg];
    let frame = 0;
    if (this.gooseHonk > 0) {
      this.gooseHonk -= dt;
      frame = 3;
    } else if (this.gooseWait > 0) this.gooseWait -= dt;
    else {
      const dx = goal.x - g.x;
      const dy = goal.y - g.y;
      const d = Math.hypot(dx, dy);
      const step = 0.9 * dt;
      if (d <= step) {
        g.x = goal.x;
        g.y = goal.y;
        this.gooseLeg = 1 - this.gooseLeg;
        this.gooseWait = 2 + ((t * 7) % 3);
      } else {
        g.x += (dx / d) * step;
        g.y += (dy / d) * step;
        frame = this.reducedMotion ? 0 : 1 + (Math.floor(t * 6) % 2);
      }
      this.goose.scale.x = dx < 0 ? -1 : 1;
    }
    swapFrame(this.goose, this.gooseTex[frame]);
    const px = this.style.px;
    this.goose.position.set(Math.round(g.x * px) / px, 0, (Math.round(g.y * px) / px) * K);
    const anser = this.targets.find((x) => x.id === 'anser');
    if (anser) {
      anser.x = g.x;
      anser.y = g.y;
    }
  }

  tileAt(cx: number, cy: number): { x: number; y: number } | null {
    return this.stage.screenToTile(cx, cy);
  }

  screenOf(t: { x: number; y: number }, lift = 2.2): { x: number; y: number; visible: boolean } {
    return this.stage.project(new THREE.Vector3(t.x, lift * K, t.y * K - 0.4));
  }

  resize(): void {
    this.stage.resize();
    this.follow();
  }

  render(): void {
    this.stage.render(this.scene);
  }
}
