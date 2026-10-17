import * as THREE from 'three';
import { K } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Lighting, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { STAR_STATION, Stage, billboard, glow, shadow, swapFrame, type SceneCtx, type Setting, type SettingScene } from '../../kit/worlds';
import type { Look16 } from '../../kit/worlds/hero16';
import { OBSERVATORY, OBS_SPOTS } from '../../kit/worlds/star-station/observatory';
import { paintRover } from '../../kit/worlds/star-station/planet';
import { paintBigTelescope, paintVee } from '../../kit/worlds/star-station/space-art';
import { SURFACE_EARTH, SURFACE_MARS, SURFACE_MERCURY, SURFACE_VENUS, paintFind } from '../../kit/worlds/star-station/surfaces';
import { Walker16, type Marker16 } from '../../kit/worlds/walker';
import type { FindKind } from './dive';
import type { PersonId } from './content';
import type { PlanetId } from './problems';

/** Everything the player can walk (or drive) up to. */
export type TargetId = PersonId | FindKind;
export const PEOPLE_IDS: PersonId[] = ['sol', 'kofi', 'lumi', 'tess'];

/** Sol by the telescope, Kofi by the globe lab, Lumi by the star projector, Tess by the launch cannon. */
export const PEOPLE_SPOTS: Record<PersonId, { x: number; y: number }> = {
  sol: { x: 15.5, y: 8.8 },
  kofi: { x: 17.5, y: 12.8 },
  lumi: { x: 6.5, y: 7.8 },
  tess: { x: 19.5, y: 8.2 },
};

export const START = { x: 13, y: 12.4 };

/** Where the three finds lie at a rocky planet stop (tiles). */
export const FIND_SPOTS: Record<FindKind, { x: number; y: number }> = {
  sample: { x: 8.5, y: 8.5 },
  fact: { x: 17, y: 11.5 },
  question: { x: 13.5, y: 15 },
};
const ROVER_START = { x: 11.5, y: 12.2 };

const SURFACES: Partial<Record<PlanetId, Setting>> = { mercury: SURFACE_MERCURY, venus: SURFACE_VENUS, earth: SURFACE_EARTH, mars: SURFACE_MARS };

export interface Target {
  id: TargetId;
  x: number;
  y: number;
  label: string;
}

interface Place {
  scene: THREE.Scene;
  lighting: Lighting;
  ctx: SceneCtx;
  setting: SettingScene;
  grid: CollisionGrid;
  targets: Target[];
}

/**
 * The world of Solar System Explorer, in the Star Station style (24 pixels
 * per tile, 16-bit characters): the observatory, where the player walks and
 * the crew stand by their space models, and the rocky planets' stops, where
 * the player drives the probe's rover to three finds. Vee hovers along
 * behind the player (or the rover) everywhere.
 */
export class ExplorerWorld {
  readonly stage: Stage;
  readonly style = STAR_STATION;
  private obs!: Place;
  private stop: (Place & { planet: PlanetId; rover: THREE.Mesh; roverTex: THREE.CanvasTexture[]; finds: Map<FindKind, THREE.Mesh[]> }) | null = null;
  player!: Walker16;
  readonly people = new Map<PersonId, Walker16>();
  private telescope!: THREE.Mesh;
  private telescopeTex = new Map<string, THREE.CanvasTexture>();
  private lensGlows: THREE.Object3D[] = [];
  private vee = { x: START.x + 1, y: START.y + 0.4, mesh: null as unknown as THREE.Mesh, shadow: null as unknown as THREE.Mesh, tex: { left: [] as THREE.CanvasTexture[], right: [] as THREE.CanvasTexture[] }, face: 'right' as 'left' | 'right' };
  private veeStop: { mesh: THREE.Mesh; shadow: THREE.Mesh } | null = null;
  /** Which side of the player Vee keeps to (1: Vee on the left, behind a player facing right). */
  private veeSide = 1;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  /** The rover on a planet stop (the player drives it). */
  private car = { x: ROVER_START.x, y: ROVER_START.y, face: 1, moving: false };
  reducedMotion = false;
  /** Show the observatory from the top (the dome and the window) instead of following the player: the title and the opening. */
  establishing = false;
  onArrive: ((t: Target) => void) | null = null;

  constructor(host: HTMLElement) {
    this.stage = new Stage(host, this.style.px);
    this.stage.maxTilesTall = 20;
    this.stage.resize();
  }

  get onStop(): PlanetId | null {
    return this.stop?.planet ?? null;
  }

  get targets(): Target[] {
    return (this.stop ?? this.obs).targets;
  }

  private place(setting: Setting, omit: string[]): Place {
    const scene = new THREE.Scene();
    const lighting = new Lighting();
    const ctx: SceneCtx = { scene, lighting, px: this.style.px, time: 'day', omit };
    const built = setting.build(ctx);
    lighting.set(this.style.tint.day, 0);
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
    return { scene, lighting, ctx, setting: built, grid, targets: [] };
  }

  build(playerLook: Look16, looks: Record<PersonId, Look16>, names: Record<PersonId, string>, lit: boolean[]): void {
    const T = this.style.px;
    this.obs = this.place(OBSERVATORY, ['telescope']);
    const { scene, lighting, ctx, grid } = this.obs;
    // the big telescope, with a lens lit for each finished station
    this.telescope = billboard(lighting, T, paintBigTelescope(T, 0).toCanvas(), OBS_SPOTS.telescope.x, OBS_SPOTS.telescope.y);
    scene.add(this.telescope);
    const sh = shadow(T, 2.6);
    sh.position.set(OBS_SPOTS.telescope.x, 0.015, OBS_SPOTS.telescope.y * K);
    scene.add(sh);
    grid.block(Math.floor(OBS_SPOTS.telescope.x - 1.2), Math.floor(OBS_SPOTS.telescope.y - 1), 3, 1);
    const lensColors = ['#4fd6ff', '#ffb547', '#ff5fa8', '#7dea8a'];
    const u = T / 16;
    this.lensGlows = lensColors.map((c, i) => {
      // lens i sits along the tube at art pixel (12 + 40t, 58 - 48t) of the 64 x 84 picture
      const t = 0.25 + i * 0.17;
      const dx = ((12 + 40 * t - 32) * u) / T;
      const lift = ((84 - (58 - 48 * t)) * u) / T;
      const g = glow(lighting, T, Math.round(T * 1.2), c, OBS_SPOTS.telescope.x + dx, OBS_SPOTS.telescope.y, lift, 0.7);
      scene.add(g);
      return g;
    });

    this.player = new Walker16(ctx, playerLook, START.x, START.y, 'up');
    scene.add(this.player.group);
    for (const id of PEOPLE_IDS) {
      const s = PEOPLE_SPOTS[id];
      const w = new Walker16(ctx, looks[id], s.x, s.y, 'down');
      this.people.set(id, w);
      scene.add(w.group);
      grid.setBlocker(id, s.x, s.y, 0.45);
      grid.setDynamic(id, [[Math.floor(s.x), Math.floor(s.y)]]);
      this.obs.targets.push({ id, x: s.x, y: s.y, label: `Talk to ${names[id]}` });
    }
    // Vee hovers along behind the player
    this.vee.tex.right = [0, 1, 2].map((f) => pixelTexture(paintVee(T, 'right', f).toCanvas()));
    this.vee.tex.left = [0, 1, 2].map((f) => pixelTexture(paintVee(T, 'left', f).toCanvas()));
    this.vee.mesh = billboard(lighting, T, this.vee.tex.right[0].image as HTMLCanvasElement, this.vee.x, this.vee.y, 1.1);
    this.vee.shadow = shadow(T, 0.8);
    scene.add(this.vee.mesh, this.vee.shadow);
    this.setLit(lit);
    this.stage.setBounds(this.obs.setting.map.w, this.obs.setting.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(this.obs.setting.clear), 1);
  }

  /** Light the telescope's lenses for the finished stations (one lens per station, in station order). */
  setLit(lit: boolean[]): void {
    const key = lit.map((b) => (b ? 1 : 0)).join('');
    let tex = this.telescopeTex.get(key);
    if (!tex) this.telescopeTex.set(key, (tex = pixelTexture(paintBigTelescope(this.style.px, lit).toCanvas())));
    swapFrame(this.telescope, tex);
    this.lensGlows.forEach((g, i) => (g.visible = !!lit[i]));
    this.litMask = key;
  }

  /** Which lenses are lit, as "1100" (for tests). */
  litMask = '0000';

  setMarkers(marks: Partial<Record<PersonId, Marker16>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id as PersonId)?.setMarker(m ?? null);
  }

  // ------------------------------------------------------------ planet stops

  /** Land on a rocky planet: its surface, the rover to drive and the finds not yet collected. */
  enterSurface(planet: PlanetId, have: FindKind[]): void {
    this.leaveSurface();
    const setting = SURFACES[planet];
    if (!setting) return;
    const T = this.style.px;
    const pl = this.place(setting, ['rover', 'finds']);
    const roverTex = [pixelTexture(paintRover(T).toCanvas()), pixelTexture(paintRover(T).flipX().toCanvas())];
    const rover = billboard(pl.lighting, T, roverTex[0].image as HTMLCanvasElement, ROVER_START.x, ROVER_START.y);
    const rs = shadow(T, 2.2);
    pl.scene.add(rover, rs);
    rover.userData.shadow = rs;
    const finds = new Map<FindKind, THREE.Mesh[]>();
    const label: Record<FindKind, string> = { sample: 'Pick up the sample', fact: 'Read the fact card', question: 'Answer the question' };
    for (const kind of ['sample', 'fact', 'question'] as FindKind[]) {
      if (have.includes(kind)) continue;
      const s = FIND_SPOTS[kind];
      const tex = [0, 1].map((f) => pixelTexture(paintFind(T, kind, f).toCanvas()));
      const m = billboard(pl.lighting, T, tex[0].image as HTMLCanvasElement, s.x, s.y);
      m.userData.tex = tex;
      const col = kind === 'sample' ? '#7dea8a' : kind === 'fact' ? '#4fd6ff' : '#ffb547';
      const g = glow(pl.lighting, T, Math.round(T * 1.4), col, s.x, s.y, 0.6, 0.6);
      pl.scene.add(m, g);
      finds.set(kind, [m, g]);
      pl.targets.push({ id: kind, x: s.x, y: s.y, label: label[kind] });
    }
    // Vee comes along
    const vm = billboard(pl.lighting, T, this.vee.tex.right[0].image as HTMLCanvasElement, ROVER_START.x + 1, ROVER_START.y, 1.1);
    const vs = shadow(T, 0.8);
    pl.scene.add(vm, vs);
    this.veeStop = { mesh: vm, shadow: vs };
    this.car = { x: ROVER_START.x, y: ROVER_START.y, face: 1, moving: false };
    this.stop = { ...pl, planet, rover, roverTex, finds };
    this.path = null;
    this.pathGoal = null;
    this.stage.setBounds(pl.setting.map.w, pl.setting.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(pl.setting.clear), 1);
    this.follow();
  }

  /** A find has been collected: it disappears from the ground. */
  collect(kind: FindKind): void {
    const s = this.stop;
    if (!s) return;
    for (const m of s.finds.get(kind) ?? []) m.visible = false;
    s.finds.delete(kind);
    s.targets = s.targets.filter((t) => t.id !== kind);
  }

  leaveSurface(): void {
    const s = this.stop;
    if (!s) return;
    s.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.MeshBasicMaterial | undefined;
      if (mat) {
        mat.map?.dispose();
        mat.dispose();
      }
    });
    this.stop = null;
    this.veeStop = null;
    this.path = null;
    this.pathGoal = null;
    this.stage.setBounds(this.obs.setting.map.w, this.obs.setting.map.h);
    this.stage.renderer.setClearColor(new THREE.Color(this.obs.setting.clear), 1);
    this.follow();
  }

  // ------------------------------------------------------------ walking and driving

  /** Where the player is now (the rover on a stop). */
  get me(): { x: number; y: number } {
    return this.stop ? this.car : this.player;
  }

  walkTo(goal: Target | null, tile?: { x: number; y: number }): void {
    const dest = goal ? { x: goal.x, y: goal.y } : tile!;
    const grid = (this.stop ?? this.obs).grid;
    const path = findPath(grid, this.me, dest);
    if (!path) return;
    this.path = path.length ? path : null;
    this.pathGoal = goal;
    if (!path.length && goal) this.onArrive?.(goal);
  }

  stopWalking(): void {
    this.path = null;
    this.pathGoal = null;
    this.player.moving = false;
    this.car.moving = false;
  }

  nearest(): Target | null {
    let best: Target | null = null;
    let d = this.stop ? 1.5 : 1.7;
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
    if (this.stop) {
      if (Math.abs(dx) > 0.01) this.car.face = dx > 0 ? 1 : -1;
      return;
    }
    this.player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }

  private arrive(): void {
    const goal = this.pathGoal;
    this.path = null;
    this.pathGoal = null;
    this.player.moving = false;
    this.car.moving = false;
    if (goal) {
      this.faceTo(goal.x - this.me.x, goal.y - this.me.y);
      this.onArrive?.(goal);
    }
  }

  private setMe(x: number, y: number, moving: boolean): void {
    if (this.stop) {
      this.car.x = x;
      this.car.y = y;
      this.car.moving = moving;
    } else {
      this.player.x = x;
      this.player.y = y;
      this.player.moving = moving;
    }
  }

  update(dt: number, input: Input | null): void {
    this.time += dt;
    const me = this.me;
    const grid = (this.stop ?? this.obs).grid;
    const dir = input ? input.direction() : { x: 0, y: 0 };
    const speed = this.stop ? 4.8 : 4.4;
    const r = this.stop ? 0.55 : 0.3;
    if (dir.x || dir.y) {
      this.path = null;
      this.pathGoal = null;
      const n = grid.move(me.x, me.y, dir.x * speed * dt, dir.y * speed * dt, r);
      this.setMe(n.x, n.y, Math.hypot(n.x - me.x, n.y - me.y) > 0.0005);
      this.faceTo(dir.x, dir.y);
    } else if (this.path && this.pathGoal && Math.hypot(this.pathGoal.x - me.x, this.pathGoal.y - me.y) < (this.stop ? 1.1 : 1.2)) {
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

    const T = this.style.px;
    const snap = (v: number) => Math.round(v * T) / T;
    if (this.stop) {
      const s = this.stop;
      s.setting.update(this.time, this.stage.target.x);
      swapFrame(s.rover, s.roverTex[this.car.face > 0 ? 0 : 1]);
      const bump = this.car.moving && !this.reducedMotion && Math.floor(this.time * 10) % 2 ? 1 / T : 0;
      s.rover.position.set(snap(this.car.x), bump * K, snap(this.car.y) * K);
      (s.rover.userData.shadow as THREE.Mesh).position.set(snap(this.car.x), 0.015, snap(this.car.y) * K);
      for (const [, [m]] of s.finds) swapFrame(m, (m.userData.tex as THREE.CanvasTexture[])[this.reducedMotion ? 0 : Math.floor(this.time * 2) % 2]);
      this.updateVee(this.car.x, this.car.y, this.car.face, this.veeStop!.mesh, this.veeStop!.shadow, dt);
    } else {
      const p = this.player;
      p.update(dt, this.reducedMotion);
      for (const a of this.people.values()) {
        const near = Math.hypot(p.x - a.x, p.y - a.y) < 3;
        a.facing = near ? (Math.abs(p.x - a.x) > Math.abs(p.y - a.y) ? (p.x > a.x ? 'right' : 'left') : p.y > a.y ? 'down' : 'up') : 'down';
        a.update(dt, this.reducedMotion);
      }
      this.obs.setting.update(this.time, this.stage.target.x);
      // Vee keeps to the side behind the player; walking up or down keeps the side it is on
      if (p.facing === 'left') this.veeSide = -1;
      else if (p.facing === 'right') this.veeSide = 1;
      this.updateVee(p.x, p.y, this.veeSide, this.vee.mesh, this.vee.shadow, dt);
    }
    this.follow(this.establishing ? 0 : this.reducedMotion ? 1 : 0.12);
  }

  /** Vee drifts to a spot just behind and beside the player, bobbing. */
  private updateVee(px: number, py: number, face: number, mesh: THREE.Mesh, sh: THREE.Mesh, dt: number): void {
    const T = this.style.px;
    const v = this.vee;
    const gx = px - face * 1.2;
    const gy = py - 0.15;
    const k = Math.min(1, dt * 3);
    v.x += (gx - v.x) * k;
    v.y += (gy - v.y) * k;
    if (Math.abs(gx - v.x) > 0.05) v.face = gx > v.x ? 'right' : 'left';
    else v.face = face > 0 ? 'right' : 'left';
    const snap = (n: number) => Math.round(n * T) / T;
    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(this.time * 2.6) * 2) / T;
    mesh.position.set(snap(v.x), (1.1 + bob) * K, snap(v.y) * K + 0.02);
    sh.position.set(snap(v.x), 0.015, snap(v.y) * K);
    swapFrame(mesh, v.tex[v.face][this.reducedMotion ? 0 : 1 + (Math.floor(this.time * 8) % 2)]);
  }

  /** Keep the player in view, showing the dome (or the sky) above row 0 when near the top. */
  follow(smooth = 0): void {
    const { w: vw, h: vh } = this.stage.viewTiles;
    const S = (this.stop ?? this.obs).setting;
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
    this.stage.render((this.stop ?? this.obs).scene);
  }
}
