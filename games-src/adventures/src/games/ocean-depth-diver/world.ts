import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { Stage, billboard, glow, shadow, swapFrame, type SceneCtx, type SettingScene, type TimeOfDay } from '../../kit/worlds';
import type { Look16 } from '../../kit/worlds/hero16';
import { Walker16, type Marker16 } from '../../kit/worlds/walker';
import { paintFinn } from '../../kit/worlds/wild-lands/art';
import { CAMP_SPOTS, FIELD_CAMP } from '../../kit/worlds/wild-lands/camp';
import { WILD_LANDS } from '../../kit/worlds/wild-lands/style';
import type { PersonId } from './content';

/** Everything the player can walk up to: the two scientists and the lab tent's Creature Designer. */
export type TargetId = PersonId | 'designer';
export const PEOPLE_IDS: PersonId[] = ['lani', 'tala'];

/** Dr. Lani waits on the boardwalk by the dock; Ranger Tala by the campfire. */
export const PEOPLE_SPOTS: Record<PersonId, { x: number; y: number }> = {
  lani: { x: 24.6, y: 9.6 },
  tala: { x: 14.8, y: 10.8 },
};
export const DESIGNER_SPOT = { x: CAMP_SPOTS.lab.x, y: CAMP_SPOTS.lab.y };
export const START = { x: 13.2, y: 11 };

export interface Target {
  id: TargetId;
  x: number;
  y: number;
  label: string;
}

/**
 * The field camp of Ocean Depth Diver, in the Wild Lands style (24 pixels
 * per tile, 16-bit characters). The player walks the camp; Dr. Lani Kahale
 * waits by the dock, where the little submarine bobs; Ranger Tala sits by
 * the campfire; the lab tent holds the Creature Designer. Finn, the robot
 * camera, hovers along behind the player.
 */
export class CampWorld {
  readonly stage: Stage;
  readonly style = WILD_LANDS;
  private scene!: THREE.Scene;
  private lighting!: Lighting;
  private setting!: SettingScene;
  private grid!: CollisionGrid;
  readonly targets: Target[] = [];
  player!: Walker16;
  readonly people = new Map<PersonId, Walker16>();
  private finn = {
    x: START.x + 1,
    y: START.y + 0.4,
    mesh: null as unknown as THREE.Mesh,
    shadow: null as unknown as THREE.Mesh,
    tex: { left: [] as THREE.CanvasTexture[], right: [] as THREE.CanvasTexture[] },
    face: 'right' as 'left' | 'right',
  };
  private finnSide = 1;
  private labGlow: THREE.Object3D | null = null;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  timeOfDay: TimeOfDay = 'day';
  reducedMotion = false;
  /** Show the camp from above (the forest and the sea) instead of following the player: the title and the opening. */
  establishing = false;
  onArrive: ((t: Target) => void) | null = null;

  constructor(host: HTMLElement) {
    this.stage = new Stage(host, this.style.px);
    this.stage.maxTilesTall = 20;
    this.stage.resize();
  }

  build(playerLook: Look16, looks: Record<PersonId, Look16>, names: Record<PersonId, string>): void {
    const T = this.style.px;
    this.scene = new THREE.Scene();
    this.lighting = new Lighting();
    const ctx: SceneCtx = { scene: this.scene, lighting: this.lighting, px: T, time: 'day' };
    this.setting = FIELD_CAMP.build(ctx);
    this.lighting.set(this.style.tint.day, 0);
    const built = this.setting;
    const grid = new CollisionGrid(built.map.w, built.map.h);
    const blockRect = (x: number, y: number, w: number, h: number) => {
      const x0 = Math.floor(x + 0.15);
      const y0 = Math.floor(y + 0.15);
      const x1 = Math.max(x0 + 1, Math.ceil(x + w - 0.15));
      const y1 = Math.max(y0 + 1, Math.ceil(y + h - 0.15));
      grid.block(x0, y0, x1 - x0, y1 - y0);
    };
    const walk = built.walk ?? { x0: 0, y0: 0, x1: built.map.w, y1: built.map.h };
    blockRect(0, 0, walk.x0, built.map.h);
    blockRect(walk.x1, 0, built.map.w - walk.x1, built.map.h);
    blockRect(0, 0, built.map.w, walk.y0);
    blockRect(0, walk.y1, built.map.w, built.map.h - walk.y1);
    for (const b of built.blocks ?? []) blockRect(b.x, b.y, b.w, b.h);
    // the sea: only the boardwalk and the dock at its end go out over the water
    for (let ty = 0; ty < built.map.h; ty++)
      for (let tx = 24; tx < built.map.w; tx++) {
        const walkway = ty === 9 || (tx >= 26 && ty >= 8 && ty <= 10);
        if (!walkway) grid.block(tx, ty, 1, 1);
      }
    this.grid = grid;

    this.player = new Walker16(ctx, playerLook, START.x, START.y, 'up');
    this.scene.add(this.player.group);
    for (const id of PEOPLE_IDS) {
      const s = PEOPLE_SPOTS[id];
      const w = new Walker16(ctx, looks[id], s.x, s.y, 'down');
      this.people.set(id, w);
      this.scene.add(w.group);
      grid.setBlocker(id, s.x, s.y, 0.45);
      grid.setDynamic(id, [[Math.floor(s.x), Math.floor(s.y)]]);
      this.targets.push({ id, x: s.x, y: s.y, label: `Talk to ${names[id]}` });
    }
    this.targets.push({ id: 'designer', x: DESIGNER_SPOT.x, y: DESIGNER_SPOT.y, label: 'The Creature Designer' });
    // a warm glow over the lab table once the Creature Designer is open
    this.labGlow = glow(this.lighting, T, Math.round(T * 1.8), '#7dffb0', DESIGNER_SPOT.x, DESIGNER_SPOT.y - 0.4, 1.4, 0.9);
    this.labGlow.visible = false;
    this.scene.add(this.labGlow);
    // Finn hovers along behind the player
    this.finn.tex.right = [0, 1, 2].map((f) => pixelTexture(paintFinn(T, 'right', f).toCanvas()));
    this.finn.tex.left = [0, 1, 2].map((f) => pixelTexture(paintFinn(T, 'left', f).toCanvas()));
    this.finn.mesh = billboard(this.lighting, T, this.finn.tex.right[0].image as HTMLCanvasElement, this.finn.x, this.finn.y, 1.2);
    this.finn.shadow = shadow(T, 0.7);
    this.scene.add(this.finn.mesh, this.finn.shadow);
    this.stage.setBounds(built.map.w, built.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(built.clear), 1);
  }

  /** Day or dusk at the camp (the evening brings out the fireflies and the glowing sea). */
  setTime(t: TimeOfDay): void {
    this.timeOfDay = t;
    this.setting.setTime?.(t);
    this.lighting.set(this.style.tint[t], t === 'evening' ? 1 : 0);
    this.stage.renderer.setClearColor(new THREE.Color(t === 'evening' ? '#1f2a3a' : '#2f6a4a'), 1);
  }

  /** The lab tent's glow: on once the Creature Designer is open. */
  setLabOpen(open: boolean): void {
    if (this.labGlow) this.labGlow.visible = open;
  }

  setMarkers(marks: Partial<Record<PersonId, Marker16>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id as PersonId)?.setMarker(m ?? null);
  }

  // ------------------------------------------------------------ walking

  get me(): { x: number; y: number } {
    return this.player;
  }

  /** Put the player back somewhere (after a dive, back on the boardwalk). */
  placePlayer(x: number, y: number, face: 'left' | 'right' | 'up' | 'down' = 'left'): void {
    this.player.x = x;
    this.player.y = y;
    this.player.facing = face;
    this.finn.x = x + 1;
    this.finn.y = y;
    this.stopWalking();
    this.follow();
  }

  walkTo(goal: Target | null, tile?: { x: number; y: number }): void {
    const dest = goal ? { x: goal.x, y: goal.y } : tile!;
    const path = findPath(this.grid, this.me, dest);
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
    const me = this.me;
    for (const t of this.targets) {
      const dd = Math.hypot(t.x - me.x, t.y - me.y);
      if (dd < d) {
        d = dd;
        best = t;
      }
    }
    return best;
  }

  private faceTo(dx: number, dy: number): void {
    this.player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }

  private arrive(): void {
    const goal = this.pathGoal;
    this.path = null;
    this.pathGoal = null;
    this.player.moving = false;
    if (goal) {
      this.faceTo(goal.x - this.me.x, goal.y - this.me.y);
      this.onArrive?.(goal);
    }
  }

  private setMe(x: number, y: number, moving: boolean): void {
    this.player.x = x;
    this.player.y = y;
    this.player.moving = moving;
  }

  update(dt: number, input: Input | null): void {
    this.time += dt;
    const me = this.me;
    const grid = this.grid;
    const dir = input ? input.direction() : { x: 0, y: 0 };
    const speed = 4.4;
    const r = 0.3;
    if (dir.x || dir.y) {
      this.path = null;
      this.pathGoal = null;
      const n = grid.move(me.x, me.y, dir.x * speed * dt, dir.y * speed * dt, r);
      this.setMe(n.x, n.y, Math.hypot(n.x - me.x, n.y - me.y) > 0.0005);
      this.faceTo(dir.x, dir.y);
    } else if (this.path && this.pathGoal && Math.hypot(this.pathGoal.x - me.x, this.pathGoal.y - me.y) < 1.2) {
      this.arrive();
    } else if (this.path) {
      const wp = this.path[0];
      const dx = wp.x - me.x;
      const dy = wp.y - me.y;
      const dist = Math.hypot(dx, dy);
      const step = speed * dt;
      if (dist <= step) {
        this.setMe(wp.x, wp.y, true);
        this.path.shift();
        if (!this.path.length) this.arrive();
      } else {
        const n = grid.move(me.x, me.y, (dx / dist) * step, (dy / dist) * step, r);
        const stuck = Math.hypot(n.x - me.x, n.y - me.y) < step * 0.2;
        this.setMe(n.x, n.y, !stuck);
        if (stuck) {
          const goal = this.pathGoal;
          if (goal && Math.hypot(goal.x - me.x, goal.y - me.y) < 1.7) this.arrive();
          else this.stopWalking();
        } else this.faceTo(dx, dy);
      }
    } else this.setMe(me.x, me.y, false);

    const p = this.player;
    p.update(dt, this.reducedMotion);
    for (const a of this.people.values()) {
      const near = Math.hypot(p.x - a.x, p.y - a.y) < 3;
      a.facing = near ? (Math.abs(p.x - a.x) > Math.abs(p.y - a.y) ? (p.x > a.x ? 'right' : 'left') : p.y > a.y ? 'down' : 'up') : 'down';
      a.update(dt, this.reducedMotion);
    }
    this.setting.update(this.reducedMotion ? 0 : this.time, this.stage.target.x);
    if (p.facing === 'left') this.finnSide = -1;
    else if (p.facing === 'right') this.finnSide = 1;
    this.updateFinn(p.x, p.y, this.finnSide, dt);
    this.follow(this.establishing ? 0 : this.reducedMotion ? 1 : 0.12);
  }

  /** Finn drifts to a spot just behind and beside the player, bobbing. */
  private updateFinn(px: number, py: number, face: number, dt: number): void {
    const T = this.style.px;
    const v = this.finn;
    const gx = px - face * 1.1;
    const gy = py - 0.15;
    const k = Math.min(1, dt * 3);
    v.x += (gx - v.x) * k;
    v.y += (gy - v.y) * k;
    if (Math.abs(gx - v.x) > 0.05) v.face = gx > v.x ? 'right' : 'left';
    else v.face = face > 0 ? 'right' : 'left';
    const snap = (n: number) => Math.round(n * T) / T;
    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(this.time * 2.4) * 2) / T;
    v.mesh.position.set(snap(v.x), (1.2 + bob) * K, snap(v.y) * K + 0.02);
    v.shadow.position.set(snap(v.x), 0.015, snap(v.y) * K);
    swapFrame(v.mesh, v.tex[v.face][this.reducedMotion ? 0 : 1 + (Math.floor(this.time * 8) % 2)]);
  }

  /** Keep the player in view, showing the forest and the sky above row 0 when near the top. */
  follow(smooth = 0): void {
    const { w: vw, h: vh } = this.stage.viewTiles;
    const S = this.setting;
    const me = this.me;
    const x = vw >= S.map.w ? S.map.w / 2 : Math.min(S.map.w - vw / 2, Math.max(vw / 2, me.x));
    const top = S.focus.top + vh / 2;
    const y = this.establishing ? top : Math.min(S.map.h - vh / 2, Math.max(top, me.y - 1.6));
    this.stage.lookAt(x, y, false, smooth);
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
