import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { Stage, billboard, shadow, swapFrame, type SceneCtx, type Setting, type SettingScene, type TimeOfDay } from '../../kit/worlds';
import type { Look16 } from '../../kit/worlds/hero16';
import { placer } from '../../kit/worlds/place';
import { Walker16, type Marker16 } from '../../kit/worlds/walker';
import { paintHabitatMap, paintKiki, paintRescueTent, type Habitat } from '../../kit/worlds/wild-lands/animal-art';
import { CAMP_SPOTS, FIELD_CAMP } from '../../kit/worlds/wild-lands/camp';
import { DESERT, POLAR, POLAR_SEA, RAINFOREST, WETLAND, type Critter } from '../../kit/worlds/wild-lands/habitats';
import { paintSub } from '../../kit/worlds/wild-lands/art';
import { WILD_LANDS } from '../../kit/worlds/wild-lands/style';
import { TRIP_ANIMALS, type Trip } from './animals';
import type { PersonId } from './content';

export type Area = 'camp' | Trip;

/** Everything the player can walk up to: a person, the Wild Lands map, or an animal still to spot. */
export type TargetId = PersonId | 'map' | `animal:${number}` | 'ship-south' | 'ship-north';

/** The Poles: the research boat waits in the sea between the Arctic (left) and Antarctica (right). */
export const SHIP = { x: (POLAR_SEA.x0 + POLAR_SEA.x1) / 2, y: 11.8, north: { x: POLAR_SEA.x0 - 0.9, y: 11.2 }, south: { x: POLAR_SEA.x1 + 1.1, y: 11.2 } };

export interface Target {
  id: TargetId;
  x: number;
  y: number;
  label: string;
  /** For animals: which one. */
  who?: Critter;
}

const SETTINGS: Record<Trip, Setting> = { rainforest: RAINFOREST, desert: DESERT, poles: POLAR, wetland: WETLAND };

/** The camp: the Rescue Center tent by the beach path, the Wild Lands map by the campfire, Dr. Amara at the tent and Ranger Tala at the map. */
export const RESCUE_TENT = { x: 17.4, y: 13.2 };
export const MAP_SIGN = { x: 10.4, y: 14.2 };
export const CAMP_PEOPLE: Record<PersonId, { x: number; y: number }> = {
  tala: { x: 8.8, y: 12.9 },
  amara: { x: 15.2, y: 12.3 },
};
/** Where the player stands on arriving back at camp (by the campfire). */
export const CAMP_START = { x: CAMP_SPOTS.player.x, y: CAMP_SPOTS.player.y };

/**
 * The world of Animal Kingdom Match, in the Wild Lands style (24 pixels per
 * tile, 16-bit characters). It shows one area at a time: the field camp
 * (with the Wildlife Rescue Center tent and the Wild Lands map) or one of
 * the habitat trips, built from the habitat settings in the kit. Kiki the
 * kinkajou trots along behind the player, and points with her tail when an
 * animal still to spot is near.
 */
export class AnimalWorld {
  readonly stage: Stage;
  readonly style = WILD_LANDS;
  private scene = new THREE.Scene();
  private lighting = new Lighting();
  private setting!: SettingScene;
  private grid!: CollisionGrid;
  targets: Target[] = [];
  player!: Walker16;
  readonly people = new Map<PersonId, Walker16>();
  private mapMesh: THREE.Mesh | null = null;
  private kiki = {
    x: 0,
    y: 0,
    mesh: null as unknown as THREE.Mesh,
    shadow: null as unknown as THREE.Mesh,
    tex: { left: [] as THREE.CanvasTexture[], right: [] as THREE.CanvasTexture[] },
    face: 'right' as 'left' | 'right',
    walk: 0,
  };
  private kikiSide = 1;
  /** Kiki points with her tail (an animal still to spot is near). */
  kikiPoints = false;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  area: Area = 'camp';
  timeOfDay: TimeOfDay = 'day';
  reducedMotion = false;
  /** Show the whole camp from above instead of following the player: the title and the opening. */
  establishing = false;
  onArrive: ((t: Target) => void) | null = null;
  private playerLook!: Look16;
  private looks!: Record<PersonId, Look16>;
  private names!: Record<PersonId, string>;
  /** Animals already spotted on this trip (their index in the trip's list). */
  private spotted = new Set<number>();

  constructor(host: HTMLElement) {
    this.stage = new Stage(host, this.style.px);
    this.stage.maxTilesTall = 20;
    this.stage.resize();
  }

  /** Who the player is and who the people are (call once, before `load`). */
  setCast(playerLook: Look16, looks: Record<PersonId, Look16>, names: Record<PersonId, string>): void {
    this.playerLook = playerLook;
    this.looks = looks;
    this.names = names;
  }

  /** Throw away the old area's meshes and textures. */
  private dispose(): void {
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry?.dispose();
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.dispose();
    });
  }

  /**
   * Show an area: the camp (with the map's habitats lit for finished trips),
   * or a trip (with the host waiting at the start and the animals already
   * spotted left out of the targets).
   */
  load(area: Area, opts: { lit?: readonly Habitat[]; host?: PersonId; spotted?: readonly number[]; at?: { x: number; y: number } } = {}): void {
    this.dispose();
    this.area = area;
    this.stopWalking();
    this.scene = new THREE.Scene();
    this.lighting = new Lighting();
    this.people.clear();
    this.targets = [];
    this.spotted = new Set(opts.spotted ?? []);
    const T = this.style.px;
    const ctx: SceneCtx = { scene: this.scene, lighting: this.lighting, px: T, time: this.timeOfDay, omit: area === 'camp' ? ['sub'] : [] };
    this.setting = area === 'camp' ? FIELD_CAMP.build(ctx) : SETTINGS[area].build(ctx);
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
    this.grid = grid;
    const { prop } = placer(ctx);
    const start = opts.at ?? (area === 'camp' ? CAMP_START : built.spots.player);
    this.player = new Walker16(ctx, this.playerLook, start.x, start.y, area === 'camp' ? 'down' : 'right');
    this.scene.add(this.player.group);
    const person = (id: PersonId, x: number, y: number) => {
      const w = new Walker16(ctx, this.looks[id], x, y, 'down');
      this.people.set(id, w);
      this.scene.add(w.group);
      grid.setBlocker(id, x, y, 0.45);
      grid.setDynamic(id, [[Math.floor(x), Math.floor(y)]]);
      this.targets.push({ id, x, y, label: `Talk to ${this.names[id]}` });
    };
    if (area === 'camp') {
      // the Rescue Center tent and the Wild Lands map (each habitat lit once its trip is done)
      prop(paintRescueTent(T).toCanvas(), RESCUE_TENT.x, RESCUE_TENT.y, 3.4);
      blockRect(RESCUE_TENT.x - 1.6, RESCUE_TENT.y - 1, 3.2, 1);
      this.mapMesh = prop(paintHabitatMap(T, opts.lit ?? []).toCanvas(), MAP_SIGN.x, MAP_SIGN.y, 1);
      this.targets.push({ id: 'map', x: MAP_SIGN.x, y: MAP_SIGN.y - 0.6, label: 'The Wild Lands map' });
      person('tala', CAMP_PEOPLE.tala.x, CAMP_PEOPLE.tala.y);
      person('amara', CAMP_PEOPLE.amara.x, CAMP_PEOPLE.amara.y);
    } else {
      this.mapMesh = null;
      const host = opts.host ?? 'tala';
      person(host, built.spots.host.x, built.spots.host.y);
      TRIP_ANIMALS[area].forEach((a, i) => {
        // stand below an animal up a tree, or on the beach for one out at sea; others can be walked right up to
        const y = a.lift ? Math.max(walk.y0 + 0.3, a.y + 0.6) : Math.min(walk.y1 - 0.3, a.y + 0.5);
        const x = Math.max(walk.x0 + 0.4, Math.min(walk.x1 - 0.5, a.x));
        this.targets.push({ id: `animal:${i}`, x, y, label: 'Look with the binoculars', who: a.who });
      });
      if (area === 'poles') {
        // the research boat crosses the sea between the north and the south
        prop(paintSub(T, 'left', 0).toCanvas(), SHIP.x, SHIP.y, 1.6);
        this.targets.push(
          { id: 'ship-south', x: SHIP.north.x, y: SHIP.north.y, label: 'Sail south to Antarctica' },
          { id: 'ship-north', x: SHIP.south.x, y: SHIP.south.y, label: 'Sail north to the Arctic' },
        );
      }
    }
    // Kiki trots along behind the player
    this.kiki.tex.right = [0, 1, 2, 3].map((f) => pixelTexture(paintKiki(T, f, 'right').toCanvas()));
    this.kiki.tex.left = [0, 1, 2, 3].map((f) => pixelTexture(paintKiki(T, f, 'left').toCanvas()));
    this.kiki.x = start.x - 1;
    this.kiki.y = start.y + 0.25;
    this.kiki.mesh = billboard(this.lighting, T, this.kiki.tex.right[0].image as HTMLCanvasElement, this.kiki.x, this.kiki.y, 0);
    this.kiki.shadow = shadow(T, 0.7);
    this.scene.add(this.kiki.mesh, this.kiki.shadow);
    this.stage.setBounds(built.map.w, built.map.h);
    this.lighting.set(this.style.tint[this.timeOfDay], this.timeOfDay === 'evening' ? 1 : 0);
    this.stage.renderer.setClearColor(new THREE.Color(built.clear), 1);
    this.follow();
  }

  /** Light the map's habitats (a trip was just finished). */
  setMapLit(lit: readonly Habitat[]): void {
    if (!this.mapMesh) return;
    swapFrame(this.mapMesh, pixelTexture(paintHabitatMap(this.style.px, lit).toCanvas()));
  }

  /** An animal was spotted: it is no longer a target. */
  markSpotted(i: number): void {
    this.spotted.add(i);
  }

  /** The animals still to spot on this trip, nearest first. */
  unspotted(): Target[] {
    const me = this.me;
    return this.targets.filter((t) => t.who && !this.spotted.has(Number(t.id.split(':')[1]))).sort((a, b) => Math.hypot(a.x - me.x, a.y - me.y) - Math.hypot(b.x - me.x, b.y - me.y));
  }

  setTime(t: TimeOfDay): void {
    this.timeOfDay = t;
    this.setting.setTime?.(t);
    this.lighting.set(this.style.tint[t], t === 'evening' ? 1 : 0);
  }

  setMarkers(marks: Partial<Record<PersonId, Marker16>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id as PersonId)?.setMarker(m ?? null);
  }

  setPlayerLook(look: Look16): void {
    this.playerLook = look;
    this.player.setLook(look);
  }

  // ------------------------------------------------------------ walking

  get me(): { x: number; y: number } {
    return this.player;
  }

  placePlayer(x: number, y: number, face: 'left' | 'right' | 'up' | 'down' = 'right'): void {
    this.player.x = x;
    this.player.y = y;
    this.player.facing = face;
    this.kiki.x = x - 1;
    this.kiki.y = y;
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
    if (this.player) this.player.moving = false;
  }

  /** The nearest thing to use (animals still to spot reach a little further, as they can be high up). */
  nearest(): Target | null {
    let best: Target | null = null;
    let d = 99;
    const me = this.me;
    for (const t of this.targets) {
      if (t.who && this.spotted.has(Number(t.id.split(':')[1]))) continue;
      const dd = Math.hypot(t.x - me.x, t.y - me.y);
      if (dd < (t.who ? 2 : 1.7) && dd < d) {
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
          if (goal && Math.hypot(goal.x - me.x, goal.y - me.y) < 2) this.arrive();
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
    if (p.facing === 'left') this.kikiSide = -1;
    else if (p.facing === 'right') this.kikiSide = 1;
    const near = this.unspotted()[0];
    this.kikiPoints = !!near && Math.hypot(near.x - p.x, near.y - p.y) < 4.5;
    this.updateKiki(p.x, p.y, this.kikiSide, dt);
    this.follow(this.establishing ? 0 : this.reducedMotion ? 1 : 0.12);
  }

  /** Kiki trots to a spot behind the player: walking while moving, then sitting, blinking now and then, or pointing her tail when an animal is near. */
  private updateKiki(px: number, py: number, face: number, dt: number): void {
    const T = this.style.px;
    const v = this.kiki;
    const gx = px - face * 0.95;
    const gy = py + 0.25;
    const k = Math.min(1, dt * 3.4);
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
    const walking = moved > dt * 0.4 && !this.reducedMotion;
    const blink = this.time % 4.6 > 4.45;
    const pointing = this.kikiPoints && (this.reducedMotion || this.time % 1.2 < 0.8);
    const frame = walking ? (Math.floor(v.walk) % 2 ? 3 : 0) : pointing ? 1 : blink ? 2 : 0;
    swapFrame(v.mesh, v.tex[v.face][frame]);
  }

  /** Keep the player in view, showing the sky above row 0 when near the top. */
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
