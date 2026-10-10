import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { STAR_STATION, Stage, billboard, glow, lightPool, settingById, swapFrame, type SceneCtx, type SettingScene } from '../../kit/worlds';
import type { Look16 } from '../../kit/worlds/hero16';
import { mixHex } from '../../kit/worlds/shade';
import { Walker16, type Marker16 } from '../../kit/worlds/walker';
import { paintBlip, paintParkedShip, type PaintId } from './art';

/** The crew on the deck: Commander Ayo (the host) and the four sector chiefs. */
export type CrewId = 'ayo' | 'mei' | 'rafi' | 'dot' | 'sol';
export const CREW: CrewId[] = ['ayo', 'mei', 'rafi', 'dot', 'sol'];
/** Everything the player can walk up to. */
export type TargetId = CrewId | 'blip' | 'ship';

export const START = { x: 12.4, y: 12.8 };

export const CREW_SPOTS: Record<CrewId, { x: number; y: number }> = {
  ayo: { x: 11.5, y: 10.5 },
  mei: { x: 16.5, y: 13.5 },
  rafi: { x: 5.5, y: 7.6 },
  dot: { x: 4.5, y: 16.5 },
  sol: { x: 15.5, y: 7.6 },
};

/** The player's ship, parked on the docking ring. */
export const SHIP_SPOT = { x: 19.5, y: 14.8 };

/** Blip drifts between these two spots when nobody is talking. */
const BLIP_PATH = [
  { x: 9.6, y: 13.6 },
  { x: 13.8, y: 14.6 },
];

const SKY = { day: '#141729', night: '#0b0c1c' };

export interface Target {
  id: TargetId;
  x: number;
  y: number;
  label: string;
}

/**
 * The observation deck of the Star Station (the world kit's `station-deck`
 * setting, 24 pixels per tile, 16-bit characters): the game's home base.
 * The game adds its own crew, Blip the alien (instead of the setting's
 * drone) and the player's ship parked on the docking ring.
 */
export class DeckWorld {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  readonly stage: Stage;
  readonly ctx: SceneCtx;
  readonly style = STAR_STATION;
  grid!: CollisionGrid;
  setting!: SettingScene;
  player!: Walker16;
  readonly crew = new Map<CrewId, Walker16>();
  readonly targets: Target[] = [];
  private ship!: THREE.Mesh;
  private shipGlow!: THREE.Object3D;
  private blip!: THREE.Mesh;
  private blipTex: THREE.CanvasTexture[] = [];
  private blipAt = { ...BLIP_PATH[0] };
  private blipLeg = 1;
  private blipWait = 0;
  private blipHappy = 0;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  night = 0;
  reducedMotion = false;
  /** Show the window and the planet (the title and the opening) instead of following the player. */
  establishing = false;
  onArrive: ((t: Target) => void) | null = null;

  constructor(host: HTMLElement) {
    this.stage = new Stage(host, this.style.px);
    // the deck is 24 rows plus its wall: a tall phone should not see past it
    this.stage.maxTilesTall = 24;
    this.stage.resize();
    this.ctx = { scene: this.scene, lighting: this.lighting, px: this.style.px, time: 'day', omit: ['drone'] };
  }

  build(playerLook: Look16, looks: Record<CrewId, Look16>, names: Record<CrewId, string>, paint: PaintId): void {
    const T = this.style.px;
    const ctx = this.ctx;
    this.setting = settingById('station-deck').build(ctx);
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

    // the player's ship on the docking ring, with a glow under it on the night shift
    this.ship = billboard(this.lighting, T, paintParkedShip(paint).toCanvas(), SHIP_SPOT.x, SHIP_SPOT.y);
    this.scene.add(this.ship);
    this.shipGlow = glow(this.lighting, T, Math.round(T * 2.4), '#5fe3ff', SHIP_SPOT.x, SHIP_SPOT.y, 0.5, 0.7);
    this.scene.add(this.shipGlow, lightPool(this.lighting, T, SHIP_SPOT.x, SHIP_SPOT.y, 2, '#5fe3ff', 0.3));
    blockRect(SHIP_SPOT.x - 1, SHIP_SPOT.y - 0.8, 2, 0.8);

    // Blip floats about (instead of the setting's drone)
    this.blipTex = [0, 1, 2, 3].map((f) => pixelTexture(paintBlip(f % 2, f >= 2).toCanvas()));
    this.blip = billboard(this.lighting, T, this.blipTex[0].image as HTMLCanvasElement, this.blipAt.x, this.blipAt.y, 0.5);
    this.scene.add(this.blip);

    this.player = new Walker16(ctx, playerLook, START.x, START.y, 'down');
    this.scene.add(this.player.group);
    for (const id of CREW) {
      const s = CREW_SPOTS[id];
      const w = new Walker16(ctx, looks[id], s.x, s.y, 'down');
      this.crew.set(id, w);
      this.scene.add(w.group);
      this.grid.setBlocker(id, s.x, s.y, 0.45);
      this.grid.setDynamic(id, [[Math.floor(s.x), Math.floor(s.y)]]);
      this.targets.push({ id, x: s.x, y: s.y, label: `Talk to ${names[id]}` });
    }
    this.targets.push({ id: 'ship', x: SHIP_SPOT.x - 1.6, y: SHIP_SPOT.y + 0.2, label: 'Launch the ship' });
    this.targets.push({ id: 'blip', x: this.blipAt.x, y: this.blipAt.y, label: 'Say hello to Blip' });
  }

  setPaint(paint: PaintId): void {
    swapFrame(this.ship, pixelTexture(paintParkedShip(paint).toCanvas()));
  }

  setNight(n: number): void {
    this.night = n;
    const day = this.style.tint.day;
    const eve = this.style.tint.evening;
    const tint = day.map((v, i) => v + (eve[i] - v) * n) as [number, number, number];
    this.lighting.set(tint, n);
    this.stage.renderer.setClearColor(new THREE.Color(mixHex(SKY.day, SKY.night, n)), 1);
  }

  setMarkers(marks: Partial<Record<CrewId, Marker16>>): void {
    for (const [id, m] of Object.entries(marks)) this.crew.get(id as CrewId)?.setMarker(m ?? null);
  }

  /** Blip bounces with a big smile for a moment. */
  cheer(): void {
    this.blipHappy = 1.2;
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
    for (const a of this.crew.values()) {
      const near = Math.hypot(p.x - a.x, p.y - a.y) < 3;
      a.facing = near ? (Math.abs(p.x - a.x) > Math.abs(p.y - a.y) ? (p.x > a.x ? 'right' : 'left') : p.y > a.y ? 'down' : 'up') : 'down';
      a.update(dt, this.reducedMotion);
    }
    this.updateDeck(dt);
    this.follow(this.establishing ? 0 : this.reducedMotion ? 1 : 0.12);
  }

  /** Keep the player in view, showing the big window when near the top. */
  follow(smooth = 0): void {
    const { w: vw, h: vh } = this.stage.viewTiles;
    const S = this.setting;
    const p = this.player;
    const x = vw >= S.map.w ? S.map.w / 2 : Math.min(S.map.w - vw / 2, Math.max(vw / 2, this.establishing ? S.focus.x : p.x));
    const top = S.focus.top + vh / 2;
    const y = this.establishing ? top : Math.min(S.map.h - vh / 2, Math.max(top, p.y - 1.6));
    this.stage.lookAt(x, y, false, smooth);
  }

  private updateDeck(dt: number): void {
    const t = this.time;
    this.setting.update(t, this.stage.target.x);
    // Blip drifts back and forth, pausing now and then, and bobs up and down
    const b = this.blipAt;
    const goal = BLIP_PATH[this.blipLeg];
    if (this.blipHappy > 0) this.blipHappy -= dt;
    else if (this.blipWait > 0) this.blipWait -= dt;
    else {
      const dx = goal.x - b.x;
      const dy = goal.y - b.y;
      const d = Math.hypot(dx, dy);
      const step = 0.8 * dt;
      if (d <= step) {
        b.x = goal.x;
        b.y = goal.y;
        this.blipLeg = 1 - this.blipLeg;
        this.blipWait = 2 + ((t * 7) % 3);
      } else {
        b.x += (dx / d) * step;
        b.y += (dy / d) * step;
      }
    }
    const happy = this.blipHappy > 0 ? 2 : 0;
    swapFrame(this.blip, this.blipTex[happy + (this.reducedMotion ? 0 : Math.floor(t * 3) % 2)]);
    const px = this.style.px;
    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(t * 2.2) * 2) / px;
    this.blip.position.set(Math.round(b.x * px) / px, (0.5 + bob + (this.blipHappy > 0 ? Math.abs(Math.sin(t * 12)) * 0.25 : 0)) * K, (Math.round(b.y * px) / px) * K);
    const blip = this.targets.find((x) => x.id === 'blip');
    if (blip) {
      blip.x = b.x;
      blip.y = b.y;
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
