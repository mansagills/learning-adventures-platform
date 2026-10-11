import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { STAR_STATION, Stage, billboard, glow, lightPool, settingById, swapFrame, type SceneCtx, type SettingScene } from '../../kit/worlds';
import type { Look16 } from '../../kit/worlds/hero16';
import { mixHex } from '../../kit/worlds/shade';
import { paintCritter } from '../../kit/worlds/star-station/planet';
import { Walker16, type Marker16 } from '../../kit/worlds/walker';
import { paintOutpostBeacon, paintWeighStation } from './art';
import type { PersonId } from './content';

/** Everything the player can walk up to: the three helpers and Gloop. */
export type TargetId = PersonId | 'gloop';
export const PEOPLE_IDS: PersonId[] = ['kiri', 'juno', 'pax'];

export const START = { x: 12.4, y: 12.6 };

/** Kiri stands in front of the weigh station, Juno by the rover, Pax at the habitat dome's door. */
export const PEOPLE_SPOTS: Record<PersonId, { x: number; y: number }> = {
  kiri: { x: 12.9, y: 10.1 },
  juno: { x: 16.2, y: 15.3 },
  pax: { x: 21.4, y: 13.4 },
};

const STATION_SPOT = { x: 12.8, y: 8.7 };
const BEACON_SPOT = { x: 9.6, y: 13.6 };

/** Gloop hops between these spots (by the beacon and the weigh station). */
const GLOOP_PATH = [
  { x: 9.9, y: 11.6 },
  { x: 11.6, y: 12.6 },
  { x: 10.6, y: 10.4 },
];

/** The sky behind everything (the planet setting's colors). */
const SKY = { day: '#6c4f9c', evening: '#2a1f4a' };

export interface Target {
  id: TargetId;
  x: number;
  y: number;
  label: string;
}

/**
 * The outpost on the alien planet (the world kit's `alien-planet` setting,
 * 24 pixels per tile, 16-bit characters). The game adds its own: Kiri's big
 * weigh-station scale, the outpost beacon (lit one lamp per finished job),
 * the three helpers and Gloop the critter, who hops about instead of the
 * setting's critter.
 */
export class OutpostWorld {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  readonly stage: Stage;
  readonly ctx: SceneCtx;
  readonly style = STAR_STATION;
  grid!: CollisionGrid;
  setting!: SettingScene;
  player!: Walker16;
  readonly people = new Map<PersonId, Walker16>();
  readonly targets: Target[] = [];
  private beacon!: THREE.Mesh;
  private beaconTex: THREE.CanvasTexture[][] = [];
  private beaconGlows: THREE.Object3D[] = [];
  private lit = 0;
  private station!: THREE.Mesh;
  private stationTex: THREE.CanvasTexture[] = [];
  private gloop!: THREE.Mesh;
  private gloopTex: THREE.CanvasTexture[] = [];
  private gloopAt = { ...GLOOP_PATH[0] };
  private gloopLeg = 1;
  private gloopWait = 1;
  private gloopHappy = 0;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  night = 0;
  reducedMotion = false;
  /** Show the outpost from the top (the sky and the habitat) instead of following the player: the title and the opening. */
  establishing = false;
  onArrive: ((t: Target) => void) | null = null;

  constructor(host: HTMLElement) {
    this.stage = new Stage(host, this.style.px);
    // the planet is 24 rows plus its sky: a tall phone should not see past it
    this.stage.maxTilesTall = 24;
    this.stage.resize();
    this.ctx = { scene: this.scene, lighting: this.lighting, px: this.style.px, time: 'day', omit: ['beacon', 'critter', 'drone'] };
  }

  build(playerLook: Look16, looks: Record<PersonId, Look16>, names: Record<PersonId, string>, lit: number): void {
    const T = this.style.px;
    const ctx = this.ctx;
    this.setting = settingById('alien-planet').build(ctx);
    const S = this.setting;
    this.stage.setBounds(S.map.w, S.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(SKY.day), 1);
    this.lighting.set(this.style.tint.day, 0);
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

    // Kiri's big weigh-station scale (it rocks gently, as scales do)
    this.stationTex = [0, 1, -1].map((tip) => pixelTexture(paintWeighStation(T, tip * 0.4).toCanvas()));
    this.station = billboard(this.lighting, T, this.stationTex[0].image as HTMLCanvasElement, STATION_SPOT.x, STATION_SPOT.y);
    this.scene.add(this.station, lightPool(this.lighting, T, STATION_SPOT.x, STATION_SPOT.y + 0.2, 1.8, '#ffcf6a', 0.25));
    blockRect(STATION_SPOT.x - 2.2, STATION_SPOT.y - 0.6, 4.4, 0.6);

    // the outpost beacon: three lamps, lit one per finished job
    this.beaconTex = [0, 1, 2, 3].map((n) => [0, 1].map((f) => pixelTexture(paintOutpostBeacon(T, n, f).toCanvas())));
    this.beacon = billboard(this.lighting, T, this.beaconTex[0][0].image as HTMLCanvasElement, BEACON_SPOT.x, BEACON_SPOT.y);
    this.scene.add(this.beacon);
    blockRect(BEACON_SPOT.x - 0.4, BEACON_SPOT.y - 0.4, 0.8, 0.4);
    const lampColors = ['#5fe3ff', '#ff6fc0', '#ffcf6a'];
    // the lamps sit 18, 34 and 52 art pixels up the 62-pixel mast (1.5 screen pixels each, 24 to a tile)
    const lampHeights = [1.13, 2.13, 3.25];
    this.beaconGlows = lampColors.map((c, i) => {
      const g = glow(this.lighting, T, Math.round(T * 1.5), c, BEACON_SPOT.x, BEACON_SPOT.y, lampHeights[i], 0.85);
      this.scene.add(g);
      return g;
    });
    this.scene.add(lightPool(this.lighting, T, BEACON_SPOT.x, BEACON_SPOT.y + 0.2, 1.6, '#ff6fc0', 0.25));

    // Gloop, the planet's critter
    this.gloopTex = [0, 1].map((f) => pixelTexture(paintCritter(T, f).toCanvas()));
    this.gloop = billboard(this.lighting, T, this.gloopTex[0].image as HTMLCanvasElement, this.gloopAt.x, this.gloopAt.y);
    this.scene.add(this.gloop);

    // people
    this.player = new Walker16(ctx, playerLook, START.x, START.y, 'down');
    this.scene.add(this.player.group);
    for (const id of PEOPLE_IDS) {
      const s = PEOPLE_SPOTS[id];
      const w = new Walker16(ctx, looks[id], s.x, s.y, 'down');
      this.people.set(id, w);
      this.scene.add(w.group);
      this.grid.setBlocker(id, s.x, s.y, 0.45);
      this.grid.setDynamic(id, [[Math.floor(s.x), Math.floor(s.y)]]);
      this.targets.push({ id, x: s.x, y: s.y, label: `Talk to ${names[id]}` });
    }
    this.targets.push({ id: 'gloop', x: this.gloopAt.x, y: this.gloopAt.y, label: 'Say hello to Gloop' });
    this.setLit(lit);
  }

  /** Light the beacon's lamps for the finished jobs, and move the day a little toward evening. */
  setLit(n: number, evening = false): void {
    this.lit = n;
    swapFrame(this.beacon, this.beaconTex[n][0]);
    this.beaconGlows.forEach((g, i) => (g.visible = i < n));
    this.setting.setTime?.(evening ? 'evening' : 'day');
    this.setNight(evening ? 1 : Math.min(0.3, n * 0.1));
  }

  get litCount(): number {
    return this.lit;
  }

  setNight(n: number): void {
    this.night = n;
    const day = this.style.tint.day;
    const eve = this.style.tint.evening;
    const tint = day.map((v, i) => v + (eve[i] - v) * n) as [number, number, number];
    this.lighting.set(tint, n);
    this.stage.renderer.setClearColor(new THREE.Color(mixHex(SKY.day, SKY.evening, n)), 1);
  }

  setMarkers(marks: Partial<Record<PersonId, Marker16>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id as PersonId)?.setMarker(m ?? null);
  }

  /** Gloop bounces for joy for a moment. */
  cheer(): void {
    this.gloopHappy = 1.2;
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

  private arrive(): void {
    const goal = this.pathGoal;
    this.path = null;
    this.pathGoal = null;
    this.player.moving = false;
    if (goal) {
      this.face(goal.x - this.player.x, goal.y - this.player.y);
      this.onArrive?.(goal);
    }
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
    } else if (this.path && this.pathGoal && Math.hypot(this.pathGoal.x - p.x, this.pathGoal.y - p.y) < 1.2) {
      // close enough to talk: arrive now (walking on would press against the person and slide round them)
      this.arrive();
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
        if (!this.path.length) this.arrive();
      } else {
        const n = this.grid.move(p.x, p.y, (dx / dist) * step, (dy / dist) * step, 0.3);
        const stuck = Math.hypot(n.x - p.x, n.y - p.y) < step * 0.2;
        p.x = n.x;
        p.y = n.y;
        if (stuck) {
          const goal = this.pathGoal;
          if (goal && Math.hypot(goal.x - p.x, goal.y - p.y) < 1.7) this.arrive();
          else this.stopWalking();
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
    this.updateOutpost(dt);
    this.follow(this.establishing ? 0 : this.reducedMotion ? 1 : 0.12);
  }

  /** Keep the player in view, showing the sky and the habitat above row 0 when near the top. */
  follow(smooth = 0): void {
    const { w: vw, h: vh } = this.stage.viewTiles;
    const S = this.setting;
    const p = this.player;
    const x = vw >= S.map.w ? S.map.w / 2 : Math.min(S.map.w - vw / 2, Math.max(vw / 2, p.x));
    const top = S.focus.top + vh / 2;
    const y = this.establishing ? top : Math.min(S.map.h - vh / 2, Math.max(top, p.y - 1.6));
    this.stage.lookAt(x, y, false, smooth);
  }

  private updateOutpost(dt: number): void {
    const t = this.time;
    this.setting.update(t, this.stage.target.x);
    swapFrame(this.beacon, this.beaconTex[this.lit][this.reducedMotion ? 0 : Math.floor(t * 2) % 2]);
    // the weigh-station scale rocks gently now and then
    const rock = this.reducedMotion ? 0 : Math.floor(t * 0.8) % 4;
    swapFrame(this.station, this.stationTex[rock === 1 ? 1 : rock === 3 ? 2 : 0]);
    // Gloop hops from spot to spot, resting in between
    const g = this.gloopAt;
    const goal = GLOOP_PATH[this.gloopLeg];
    let hop = false;
    if (this.gloopHappy > 0) {
      this.gloopHappy -= dt;
      hop = !this.reducedMotion && Math.floor(t * 6) % 2 === 0;
    } else if (this.gloopWait > 0) this.gloopWait -= dt;
    else {
      const dx = goal.x - g.x;
      const dy = goal.y - g.y;
      const d = Math.hypot(dx, dy);
      const step = 1.1 * dt;
      if (d <= step) {
        g.x = goal.x;
        g.y = goal.y;
        this.gloopLeg = (this.gloopLeg + 1) % GLOOP_PATH.length;
        this.gloopWait = 2.5 + ((t * 7) % 3);
      } else {
        g.x += (dx / d) * step;
        g.y += (dy / d) * step;
        hop = !this.reducedMotion && Math.floor(t * 5) % 2 === 0;
      }
      this.gloop.scale.x = dx < 0 ? -1 : 1;
    }
    swapFrame(this.gloop, this.gloopTex[hop ? 1 : 0]);
    const px = this.style.px;
    this.gloop.position.set(Math.round(g.x * px) / px, 0, (Math.round(g.y * px) / px) * K);
    const target = this.targets.find((x) => x.id === 'gloop');
    if (target) {
      target.x = g.x;
      target.y = g.y;
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
