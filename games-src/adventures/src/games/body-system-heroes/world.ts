import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { STAR_STATION, Stage, billboard, glow, lightPool, settingById, swapFrame, type SceneCtx, type SettingScene } from '../../kit/worlds';
import type { Look16 } from '../../kit/worlds/hero16';
import { paintMedBed, paintNib, paintShrinkBeam } from '../../kit/worlds/star-station/body-art';
import { Walker16, type Marker16 } from '../../kit/worlds/walker';
import { paintMapStand } from './art';

/** The people in the med bay: Dr. Ama Okafor (the host) and Commander Ayo (the patient). */
export type PersonId = 'ama' | 'ayo';
export const PEOPLE_IDS: PersonId[] = ['ama', 'ayo'];
/** Everything the player can walk up to. */
export type TargetId = PersonId | 'nib' | 'beam' | 'map';

export const START = { x: 12.4, y: 12.8 };
export const PEOPLE_SPOTS: Record<PersonId, { x: number; y: number }> = {
  ama: { x: 13.5, y: 10.5 },
  ayo: { x: 7.5, y: 11.5 },
};
/** The shrink beam stands on the docking ring; the bed is by the left wall; the body map by Dr. Ama. */
export const BEAM_SPOT = { x: 19.5, y: 14.6 };
const BED_SPOT = { x: 5.6, y: 11.2 };
const MAP_SPOT = { x: 15.6, y: 10.0 };

/** Nib floats between the beam and the middle of the room. */
const NIB_PATH = [
  { x: 17.2, y: 13.6 },
  { x: 14.4, y: 13.0 },
];

const SKY = '#141729';

export interface Target {
  id: TargetId;
  x: number;
  y: number;
  label: string;
}

/**
 * The med bay on the Star Station (the world kit's `station-deck` setting,
 * 24 pixels per tile, 16-bit characters): the game's home base. The game adds
 * the shrink beam on the docking ring, the med bed with Commander Ayo beside
 * it, the body map (organs light up as they heal), Dr. Ama and Nib.
 */
export class MedBayWorld {
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
  private beam!: THREE.Mesh;
  private beamTex: THREE.CanvasTexture[] = [];
  private map!: THREE.Mesh;
  private healed: number[] = [];
  private nib!: THREE.Mesh;
  private nibTex: THREE.CanvasTexture[] = [];
  private nibAt = { ...NIB_PATH[0] };
  private nibLeg = 1;
  private nibWait = 0;
  private nibHappy = 0;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  reducedMotion = false;
  /** Show the big window (the title and the opening) instead of following the player. */
  establishing = false;
  onArrive: ((t: Target) => void) | null = null;

  constructor(host: HTMLElement) {
    this.stage = new Stage(host, this.style.px);
    this.stage.maxTilesTall = 24;
    this.stage.resize();
    this.ctx = { scene: this.scene, lighting: this.lighting, px: this.style.px, time: 'day', omit: ['drone'] };
  }

  build(playerLook: Look16, looks: Record<PersonId, Look16>, names: Record<PersonId, string>, healed: number[]): void {
    const T = this.style.px;
    const ctx = this.ctx;
    this.setting = settingById('station-deck').build(ctx);
    const S = this.setting;
    this.stage.setBounds(S.map.w, S.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(SKY), 1);
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

    // the shrink beam on the docking ring
    this.beamTex = [0, 1, 2].map((f) => pixelTexture(paintShrinkBeam(T, f).toCanvas()));
    this.beam = billboard(this.lighting, T, this.beamTex[0].image as HTMLCanvasElement, BEAM_SPOT.x, BEAM_SPOT.y);
    this.scene.add(this.beam, glow(this.lighting, T, Math.round(T * 3), '#8fe6ff', BEAM_SPOT.x, BEAM_SPOT.y, 1.4, 0.7), lightPool(this.lighting, T, BEAM_SPOT.x, BEAM_SPOT.y, 2, '#8fe6ff', 0.4));
    blockRect(BEAM_SPOT.x - 1.4, BEAM_SPOT.y - 0.5, 2.8, 0.5);

    // the med bed, and the body map on its stand
    this.scene.add(billboard(this.lighting, T, paintMedBed(T).toCanvas(), BED_SPOT.x, BED_SPOT.y));
    blockRect(BED_SPOT.x - 1.2, BED_SPOT.y - 0.5, 2.4, 0.5);
    this.healed = healed;
    this.map = billboard(this.lighting, T, paintMapStand(T, healed, 0).toCanvas(), MAP_SPOT.x, MAP_SPOT.y);
    this.scene.add(this.map, glow(this.lighting, T, Math.round(T * 1.8), '#7ff0ff', MAP_SPOT.x, MAP_SPOT.y, 1.6, 0.6));
    blockRect(MAP_SPOT.x - 0.6, MAP_SPOT.y - 0.4, 1.2, 0.4);

    // Nib floats about
    this.nibTex = [0, 1].map((f) => pixelTexture(paintNib(T, f).toCanvas()));
    this.nib = billboard(this.lighting, T, this.nibTex[0].image as HTMLCanvasElement, this.nibAt.x, this.nibAt.y, 0.9);
    this.scene.add(this.nib);

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
    this.targets.push({ id: 'beam', x: BEAM_SPOT.x - 1.8, y: BEAM_SPOT.y + 0.3, label: 'Use the shrink beam' });
    this.targets.push({ id: 'map', x: MAP_SPOT.x, y: MAP_SPOT.y + 0.6, label: 'Look at the body map' });
    this.targets.push({ id: 'nib', x: this.nibAt.x, y: this.nibAt.y, label: 'Talk to Nib' });
  }

  /** Light the healed organs on the body map. */
  setHealed(healed: number[]): void {
    this.healed = healed;
    swapFrame(this.map, pixelTexture(paintMapStand(this.style.px, healed, 0).toCanvas()));
  }

  setMarkers(marks: Partial<Record<PersonId, Marker16>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id as PersonId)?.setMarker(m ?? null);
  }

  /** Nib bounces for joy for a moment. */
  cheer(): void {
    this.nibHappy = 1.2;
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
      // close enough to talk: arrive now (walking on would press against the person)
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
    for (const a of this.people.values()) {
      const near = Math.hypot(p.x - a.x, p.y - a.y) < 3;
      a.facing = near ? (Math.abs(p.x - a.x) > Math.abs(p.y - a.y) ? (p.x > a.x ? 'right' : 'left') : p.y > a.y ? 'down' : 'up') : 'down';
      a.update(dt, this.reducedMotion);
    }
    this.updateBay(dt);
    this.follow(this.establishing ? 0 : this.reducedMotion ? 1 : 0.12);
  }

  follow(smooth = 0): void {
    const { w: vw, h: vh } = this.stage.viewTiles;
    const S = this.setting;
    const p = this.player;
    const x = vw >= S.map.w ? S.map.w / 2 : Math.min(S.map.w - vw / 2, Math.max(vw / 2, this.establishing ? S.focus.x : p.x));
    const top = S.focus.top + vh / 2;
    const y = this.establishing ? top : Math.min(S.map.h - vh / 2, Math.max(top, p.y - 1.6));
    this.stage.lookAt(x, y, false, smooth);
  }

  private updateBay(dt: number): void {
    const t = this.time;
    this.setting.update(t, this.stage.target.x);
    swapFrame(this.beam, this.beamTex[this.reducedMotion ? 0 : Math.floor(t * 3) % 3]);
    if (!this.reducedMotion && Math.floor(t * 1.5) % 2 !== Math.floor((t - dt) * 1.5) % 2) swapFrame(this.map, pixelTexture(paintMapStand(this.style.px, this.healed, Math.floor(t * 1.5) % 2).toCanvas()));
    // Nib drifts back and forth, pausing now and then
    const b = this.nibAt;
    const goal = NIB_PATH[this.nibLeg];
    if (this.nibHappy > 0) this.nibHappy -= dt;
    else if (this.nibWait > 0) this.nibWait -= dt;
    else {
      const dx = goal.x - b.x;
      const dy = goal.y - b.y;
      const d = Math.hypot(dx, dy);
      const step = 0.8 * dt;
      if (d <= step) {
        b.x = goal.x;
        b.y = goal.y;
        this.nibLeg = 1 - this.nibLeg;
        this.nibWait = 2 + ((t * 7) % 3);
      } else {
        b.x += (dx / d) * step;
        b.y += (dy / d) * step;
      }
    }
    swapFrame(this.nib, this.nibTex[this.reducedMotion ? 0 : Math.floor(t * 3) % 2]);
    const px = this.style.px;
    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(t * 2.2) * 2) / px;
    this.nib.position.set(Math.round(b.x * px) / px, (0.9 + bob + (this.nibHappy > 0 ? Math.abs(Math.sin(t * 12)) * 0.25 : 0)) * K, (Math.round(b.y * px) / px) * K);
    const nib = this.targets.find((x) => x.id === 'nib');
    if (nib) {
      nib.x = b.x;
      nib.y = b.y;
    }
  }

  tileAt(cx: number, cy: number): { x: number; y: number } | null {
    return this.stage.screenToTile(cx, cy);
  }

  screenOf(t: { x: number; y: number }, lift = 2.2): { x: number; y: number; visible: boolean } {
    return this.stage.project(new THREE.Vector3(t.x, lift * K, t.y * K - 0.4));
  }

  setVisible(on: boolean): void {
    this.stage.canvas.style.display = on ? '' : 'none';
  }

  resize(): void {
    this.stage.resize();
    this.follow();
  }

  render(): void {
    this.stage.render(this.scene);
  }
}

