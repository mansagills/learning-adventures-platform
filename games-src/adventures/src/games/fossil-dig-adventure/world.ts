import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { Stage, billboard, shadow, swapFrame, type SceneCtx, type SettingScene, type TimeOfDay } from '../../kit/worlds';
import type { Look16 } from '../../kit/worlds/hero16';
import { Walker16, type Marker16 } from '../../kit/worlds/walker';
import { paintPebble } from '../../kit/worlds/wild-lands/dig-art';
import { DIG_SITE, DIG_SPOTS, QUARRY } from '../../kit/worlds/wild-lands/dig';
import { WILD_LANDS } from '../../kit/worlds/wild-lands/style';
import type { PersonId } from './content';

/** Everything the player can walk up to: the four people and the field museum. */
export type TargetId = PersonId | 'museum';
export const PEOPLE_IDS: PersonId[] = ['mateo', 'hana', 'sam', 'tala'];

/** Dr. Mateo by the quarry, Hana at the foot of the cliff, Sam outside the lab tent, Ranger Tala by the footprint slab. */
export const PEOPLE_SPOTS: Record<PersonId, { x: number; y: number }> = {
  mateo: DIG_SPOTS.host,
  hana: DIG_SPOTS.hana,
  sam: DIG_SPOTS.sam,
  tala: DIG_SPOTS.tala,
};
export const MUSEUM_SPOT = { x: DIG_SPOTS.museum.x, y: DIG_SPOTS.museum.y + 0.7 };
export const START = DIG_SPOTS.player;

export interface Target {
  id: TargetId;
  x: number;
  y: number;
  label: string;
}

/**
 * The dig site of Fossil Dig Adventure, in the Wild Lands style (24 pixels
 * per tile, 16-bit characters). The player walks the camp: Dr. Mateo waits
 * by the roped-off quarry, Hana at the Cliff Wall, Sam outside the lab tent
 * and Ranger Tala by the footprint slab. Pebble the sniffer dog trots along
 * behind the player.
 */
export class DigWorld {
  readonly stage: Stage;
  readonly style = WILD_LANDS;
  private scene!: THREE.Scene;
  private lighting!: Lighting;
  private setting!: SettingScene;
  private grid!: CollisionGrid;
  readonly targets: Target[] = [];
  player!: Walker16;
  readonly people = new Map<PersonId, Walker16>();
  private pebble = {
    x: START.x + 1,
    y: START.y + 0.4,
    mesh: null as unknown as THREE.Mesh,
    shadow: null as unknown as THREE.Mesh,
    tex: { left: [] as THREE.CanvasTexture[], right: [] as THREE.CanvasTexture[] },
    face: 'right' as 'left' | 'right',
    walk: 0,
  };
  private pebbleSide = 1;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  timeOfDay: TimeOfDay = 'day';
  reducedMotion = false;
  /** Show the whole valley from above instead of following the player: the title and the opening. */
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
    const ctx: SceneCtx = { scene: this.scene, lighting: this.lighting, px: T, time: 'day', omit: ['pebble'] };
    this.setting = DIG_SITE.build(ctx);
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
    // the quarry pit: walk round it, not through it (its top row stays open, so the path past the quarry reaches the cliff)
    blockRect(QUARRY.x0 + 0.3, QUARRY.y0 + 0.65, QUARRY.x1 - QUARRY.x0 - 0.6, QUARRY.y1 - QUARRY.y0 - 1.05);
    this.grid = grid;

    this.player = new Walker16(ctx, playerLook, START.x, START.y, 'left');
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
    this.targets.push({ id: 'museum', x: MUSEUM_SPOT.x, y: MUSEUM_SPOT.y, label: 'The field museum' });
    // Pebble trots along behind the player
    this.pebble.tex.right = [0, 1, 2, 3].map((f) => pixelTexture(paintPebble(T, f, 'right').toCanvas()));
    this.pebble.tex.left = [0, 1, 2, 3].map((f) => pixelTexture(paintPebble(T, f, 'left').toCanvas()));
    this.pebble.mesh = billboard(this.lighting, T, this.pebble.tex.right[0].image as HTMLCanvasElement, this.pebble.x, this.pebble.y, 0);
    this.pebble.shadow = shadow(T, 0.8);
    this.scene.add(this.pebble.mesh, this.pebble.shadow);
    this.stage.setBounds(built.map.w, built.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(built.clear), 1);
  }

  /** Day or dusk at the dig site (dusk lights the lanterns, the campfire and the museum's windows). */
  setTime(t: TimeOfDay): void {
    this.timeOfDay = t;
    this.setting.setTime?.(t);
    this.lighting.set(this.style.tint[t], t === 'evening' ? 1 : 0);
    this.stage.renderer.setClearColor(new THREE.Color(t === 'evening' ? '#2a1e3a' : '#c8a070'), 1);
  }

  setMarkers(marks: Partial<Record<PersonId, Marker16>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id as PersonId)?.setMarker(m ?? null);
  }

  // ------------------------------------------------------------ walking

  get me(): { x: number; y: number } {
    return this.player;
  }

  /** Put the player somewhere (and Pebble beside them). */
  placePlayer(x: number, y: number, face: 'left' | 'right' | 'up' | 'down' = 'left'): void {
    this.player.x = x;
    this.player.y = y;
    this.player.facing = face;
    this.pebble.x = x + 1;
    this.pebble.y = y;
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
    if (p.facing === 'left') this.pebbleSide = -1;
    else if (p.facing === 'right') this.pebbleSide = 1;
    this.updatePebble(p.x, p.y, this.pebbleSide, dt);
    this.follow(this.establishing ? 0 : this.reducedMotion ? 1 : 0.12);
  }

  /** Pebble trots to a spot just behind and beside the player (walking frames while moving, sitting still otherwise). */
  private updatePebble(px: number, py: number, face: number, dt: number): void {
    const T = this.style.px;
    const v = this.pebble;
    const gx = px - face * 1.0;
    const gy = py + 0.25;
    const k = Math.min(1, dt * 3.2);
    const ox = v.x;
    const oy = v.y;
    v.x += (gx - v.x) * k;
    v.y += (gy - v.y) * k;
    const moved = Math.hypot(v.x - ox, v.y - oy);
    if (Math.abs(gx - v.x) > 0.05) v.face = gx > v.x ? 'right' : 'left';
    else v.face = face > 0 ? 'right' : 'left';
    v.walk += moved * 3;
    const snap = (n: number) => Math.round(n * T) / T;
    v.mesh.position.set(snap(v.x), 0, snap(v.y) * K + 0.02);
    v.shadow.position.set(snap(v.x), 0.015, snap(v.y) * K);
    const frame = moved > dt * 0.4 && !this.reducedMotion ? Math.floor(v.walk) % 4 : 0;
    swapFrame(v.mesh, v.tex[v.face][frame]);
  }

  /** Keep the player in view, showing the buttes and the sky above row 0 when near the top. */
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

  debugMap(): string {
    const g = this.grid;
    const rows: string[] = [];
    for (let y = 0; y < this.setting.map.h; y++) {
      let r = '';
      for (let x = 0; x < this.setting.map.w; x++) r += g.isSolid(x, y) ? '#' : '.';
      rows.push(r);
    }
    return rows.join('\n');
  }

  resize(): void {
    this.stage.resize();
    this.follow();
  }

  render(): void {
    this.stage.render(this.scene);
  }
}
