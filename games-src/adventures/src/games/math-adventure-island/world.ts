import * as THREE from 'three';
import type { CharacterLook } from '../../kit/art/characters';
import { mulberry32 } from '../../kit/core/rng';
import { K, PX, type PixelRenderer } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Actor } from '../../kit/world/actor';
import { Lighting, billboard, blobShadow, glowSprite, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { isLand, paintChest, paintDigMark, paintHorizon, paintIsland, paintPalm, paintPerch, paintPip, paintStage, paintTorch, paintZone, type IslandLayout } from './art';
import { GRID, ZONES, type Square, type Zone } from './problems';

export const MAP = { w: 36, h: 30 };
const GRID_AT = { x: 15, y: 20 };
const LAYOUT: IslandLayout = {
  w: MAP.w,
  h: MAP.h,
  grid: GRID_AT,
  paths: [
    [18, 16, 18, 11],
    [18, 16, 9, 14.5],
    [18, 16, 28, 15],
    [18, 16, 11, 21.5],
    [18, 16, 25, 22],
    [18, 16, 17.5, 19.5],
  ],
};
const STAGE = { x: 18, y: 9.6 };
const TORCH_X = [13.6, 15.4, 20.6, 22.4];
const ZONE_PLACE: Record<Zone, { x: number; y: number }> = {
  add: { x: 6.6, y: 13.4 },
  sub: { x: 33.6, y: 15.2 },
  mul: { x: 8.4, y: 21.4 },
  div: { x: 27.6, y: 21.2 },
};
export const PEOPLE: Record<Zone | 'zuri', { x: number; y: number }> = {
  add: { x: 9.5, y: 14.5 },
  sub: { x: 29.5, y: 15.5 },
  mul: { x: 11.5, y: 21.5 },
  div: { x: 25.5, y: 22.5 },
  zuri: { x: 20.5, y: 13.5 },
};
const PERCH = { x: 21.5, y: 22.5 };
const STAGE_FRONT = { x: 18, y: 11.5 };
export const START = { x: 17.5, y: 15 };

export interface Target {
  kind: 'person' | 'pip' | 'stage' | 'dig';
  id: string;
  x: number;
  y: number;
  label: string;
}

/**
 * The island the player walks around: four zones with a helper each, Captain
 * Zuri in the middle, Pip the parrot by the treasure grid, and the quiz show
 * stage at the top with a torch for each zone.
 */
export class IslandWorld {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  readonly grid = new CollisionGrid(MAP.w, MAP.h);
  player!: Actor;
  readonly people = new Map<string, Actor>();
  readonly targets: Target[] = [];
  private torches: THREE.Mesh[] = [];
  private torchGlows: THREE.Mesh[] = [];
  private zoneMeshes = new Map<Zone, THREE.Mesh>();
  private stage!: THREE.Mesh;
  private horizon!: THREE.Mesh;
  private pip!: THREE.Mesh;
  private pipTex: THREE.CanvasTexture[] = [];
  private holes = new Map<string, THREE.Mesh>();
  private chest: THREE.Mesh | null = null;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  night = 0;
  reducedMotion = false;
  onArrive: ((t: Target) => void) | null = null;

  constructor(private readonly r: PixelRenderer) {}

  build(playerLook: CharacterLook, looks: Record<Zone | 'zuri', CharacterLook>, names: Record<Zone | 'zuri', string>, lit: Zone[]): void {
    const L = this.lighting;
    this.r.setBounds(MAP.w, MAP.h);
    this.r.renderer.setClearColor(new THREE.Color('#4f9fcf'), 1);
    const ground = paintIsland(LAYOUT);
    const gGeo = new THREE.PlaneGeometry(MAP.w, MAP.h * K);
    gGeo.rotateX(-Math.PI / 2);
    const g = new THREE.Mesh(gGeo, L.add(new THREE.MeshBasicMaterial({ map: pixelTexture(ground) })));
    g.position.set(MAP.w / 2, 0, (MAP.h / 2) * K);
    this.scene.add(g);
    this.horizon = billboard(L, paintHorizon(MAP.w * 16, 90, 0), MAP.w / 2, 2.6);
    this.scene.add(this.horizon);
    // the sea is not walkable
    for (let y = 0; y < MAP.h; y++) for (let x = 0; x < MAP.w; x++) if (!isLand(x, y, MAP.w, MAP.h)) this.grid.block(x, y, 1, 1);

    // palms around the island
    const rnd = mulberry32(12);
    for (let i = 0; i < 70; i++) {
      const x = 2 + rnd() * (MAP.w - 4);
      const y = 4 + rnd() * (MAP.h - 6);
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (!isLand(tx, ty, MAP.w, MAP.h)) continue;
      // keep the middle, paths, the grid and the zones clear: only near the shore
      const edge = !isLand(tx + 2, ty, MAP.w, MAP.h) || !isLand(tx - 2, ty, MAP.w, MAP.h) || !isLand(tx, ty + 2, MAP.w, MAP.h) || !isLand(tx, ty - 2, MAP.w, MAP.h);
      if (!edge) continue;
      if (Math.abs(x - ZONE_PLACE.sub.x) < 5 && Math.abs(y - ZONE_PLACE.sub.y) < 3) continue;
      // keep the treasure grid and its labels in view
      if (x > GRID_AT.x - 2.5 && x < GRID_AT.x + GRID.cols + 2.5 && y > GRID_AT.y - 1) continue;
      this.scene.add(billboard(L, paintPalm(i).toCanvas(), x, y));
    }
    // the coconut grove: palms in rows (an array!)
    for (let rr = 0; rr < 2; rr++)
      for (let c = 0; c < 3; c++) {
        const x = 4.6 + c * 2;
        const y = 18.6 + rr * 4.4;
        this.scene.add(billboard(L, paintPalm(c + rr * 3, true).toCanvas(), x, y));
        this.grid.block(Math.floor(x), Math.floor(y - 0.5), 1, 1);
      }

    // the four zones
    for (const z of ZONES) {
      const p = ZONE_PLACE[z];
      const m = billboard(L, paintZone(z, lit.includes(z)).toCanvas(), p.x, p.y);
      this.zoneMeshes.set(z, m);
      this.scene.add(m);
      if (z === 'add') this.grid.block(4, 11, 5, 2);
      if (z === 'mul') this.grid.block(7, 20, 3, 1);
      if (z === 'div') this.grid.block(25, 19, 5, 2);
    }

    // the quiz show stage and its four torches
    this.stage = billboard(L, paintStage(lit.length === 4).toCanvas(), STAGE.x, STAGE.y);
    this.scene.add(this.stage);
    this.grid.block(15, 7, 6, 2);
    TORCH_X.forEach((x, i) => {
      const t = billboard(L, paintTorch(lit.includes(ZONES[i])).toCanvas(), x, STAGE.y + 0.9);
      this.torches.push(t);
      this.scene.add(t);
      const gl = glowSprite(L, 40, '#ffb04a', x, STAGE.y + 0.95, 2.1, 0.9);
      this.torchGlows.push(gl);
      this.scene.add(gl);
      this.grid.block(Math.floor(x), Math.floor(STAGE.y + 0.4), 1, 1);
    });
    this.targets.push({ kind: 'stage', id: 'stage', x: STAGE_FRONT.x, y: STAGE_FRONT.y, label: 'Quiz Show stage' });

    // Pip on a perch by the treasure grid
    this.scene.add(billboard(L, paintPerch().toCanvas(), PERCH.x, PERCH.y));
    this.pipTex = [0, 1].map((f) => pixelTexture(paintPip(f).toCanvas()));
    const pGeo = new THREE.PlaneGeometry(16 / PX, (18 / PX) * K);
    pGeo.translate(0, ((18 / PX) * K) / 2, 0);
    this.pip = new THREE.Mesh(pGeo, L.add(new THREE.MeshBasicMaterial({ map: this.pipTex[0], alphaTest: 0.5 })));
    this.pip.position.set(PERCH.x, (28 / PX) * K, PERCH.y * K + 0.05);
    this.scene.add(this.pip);
    this.grid.setBlocker('pip', PERCH.x, PERCH.y, 0.45);
    this.grid.setDynamic('pip', [[Math.floor(PERCH.x), Math.floor(PERCH.y)]]);
    this.targets.push({ kind: 'pip', id: 'pip', x: PERCH.x, y: PERCH.y, label: 'Talk to Pip' });

    // people
    this.player = new Actor(L, playerLook, START.x, START.y, 'up');
    this.scene.add(this.player.group);
    for (const id of ['add', 'sub', 'mul', 'div', 'zuri'] as const) {
      const s = PEOPLE[id];
      const a = new Actor(L, looks[id], s.x, s.y, 'down');
      this.people.set(id, a);
      this.scene.add(a.group);
      this.grid.setBlocker(id, s.x, s.y, 0.45);
      this.grid.setDynamic(id, [[Math.floor(s.x), Math.floor(s.y)]]);
      this.targets.push({ kind: 'person', id, x: s.x, y: s.y, label: `Talk to ${names[id]}` });
    }
    const sh = blobShadow(0.8);
    sh.position.set(PERCH.x, 0.015, PERCH.y * K);
    this.scene.add(sh);
    this.setLit(lit);
  }

  /** Light a zone's torch (and the stage once all four are lit). */
  setLit(lit: Zone[]): void {
    ZONES.forEach((z, i) => {
      this.repaint(this.torches[i], paintTorch(lit.includes(z)).toCanvas());
      this.torchGlows[i].visible = lit.includes(z);
      const m = this.zoneMeshes.get(z);
      if (m) this.repaint(m, paintZone(z, lit.includes(z)).toCanvas());
    });
    this.repaint(this.stage, paintStage(lit.length === 4).toCanvas());
  }

  setNight(n: number): void {
    this.night = n;
    const tint: [number, number, number] = [1 - n * 0.45, 1 - n * 0.4, 1 - n * 0.12];
    this.lighting.set(tint, n);
    this.r.renderer.setClearColor(new THREE.Color().lerpColors(new THREE.Color('#4f9fcf'), new THREE.Color('#141a3a'), n), 1);
    this.repaint(this.horizon, paintHorizon(MAP.w * 16, 90, n));
  }

  setMarkers(marks: Partial<Record<string, 'new' | 'turnin' | null>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id)?.setMarker(m ?? null);
  }

  private repaint(mesh: THREE.Mesh, cv: HTMLCanvasElement): void {
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = pixelTexture(cv);
    mat.needsUpdate = true;
  }

  // ------------------------------------------------------------ the treasure grid

  /** The grid square under the player, if they stand on the grid. */
  squareUnderPlayer(): Square | null {
    const tx = Math.floor(this.player.x) - GRID_AT.x;
    const ty = Math.floor(this.player.y) - GRID_AT.y;
    if (tx < 0 || ty < 0 || tx >= GRID.cols || ty >= GRID.rows) return null;
    return { col: tx, row: GRID.rows - 1 - ty };
  }

  /** The middle of a grid square in tile coordinates. */
  squareCenter(s: Square): { x: number; y: number } {
    return { x: GRID_AT.x + s.col + 0.5, y: GRID_AT.y + (GRID.rows - 1 - s.row) + 0.5 };
  }

  /** Mark a dug hole on a square. */
  addHole(s: Square): void {
    const key = `${s.col},${s.row}`;
    if (this.holes.has(key)) return;
    const c = this.squareCenter(s);
    const m = billboard(this.lighting, paintDigMark(true).toCanvas(), c.x, c.y + 0.3);
    this.holes.set(key, m);
    this.scene.add(m);
  }

  clearHoles(): void {
    for (const m of this.holes.values()) this.scene.remove(m);
    this.holes.clear();
  }

  /** The treasure chest (shown once every map piece is found). */
  showChest(open: boolean): void {
    if (this.chest) this.scene.remove(this.chest);
    this.chest = billboard(this.lighting, paintChest(open).toCanvas(), PERCH.x + 1.7, PERCH.y + 0.2);
    this.scene.add(this.chest);
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
    let d = 1.6;
    for (const t of this.targets) {
      const dd = Math.hypot(t.x - this.player.x, t.y - this.player.y);
      if (dd < d) {
        d = dd;
        best = t;
      }
    }
    return best;
  }

  update(dt: number, input: Input | null): void {
    this.time += dt;
    const p = this.player;
    const dir = input ? input.direction() : { x: 0, y: 0 };
    const speed = 4.6;
    if (dir.x || dir.y) {
      this.path = null;
      this.pathGoal = null;
      const n = this.grid.move(p.x, p.y, dir.x * speed * dt, dir.y * speed * dt, 0.3);
      p.moving = Math.hypot(n.x - p.x, n.y - p.y) > 0.0005;
      if (Math.abs(dir.x) > Math.abs(dir.y)) p.facing = dir.x > 0 ? 'right' : 'left';
      else p.facing = dir.y > 0 ? 'down' : 'up';
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
            p.facing = Math.abs(goal.x - p.x) > Math.abs(goal.y - p.y) ? (goal.x > p.x ? 'right' : 'left') : goal.y > p.y ? 'down' : 'up';
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
          if (goal && Math.hypot(goal.x - p.x, goal.y - p.y) < 1.6) this.onArrive?.(goal);
        } else {
          p.moving = true;
          p.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        }
      }
    } else p.moving = false;
    p.update(dt, this.reducedMotion);
    for (const a of this.people.values()) {
      const near = Math.hypot(p.x - a.x, p.y - a.y) < 3;
      a.facing = near ? (Math.abs(p.x - a.x) > Math.abs(p.y - a.y) ? (p.x > a.x ? 'right' : 'left') : p.y > a.y ? 'down' : 'up') : 'down';
      a.update(dt, this.reducedMotion);
    }
    if (!this.reducedMotion) (this.pip.material as THREE.MeshBasicMaterial).map = this.pipTex[Math.floor(this.time * 2.2) % 3 === 0 ? 1 : 0];
    // look ahead up the island, but less on the beach grid so its letters stay in view
    this.r.lookAt(p.x, p.y - 3.8 + Math.max(0, Math.min(1, (p.y - 16) / 5)) * 3, 0.18);
  }

  tileAt(cx: number, cy: number): { x: number; y: number } | null {
    return this.r.screenToTile(cx, cy);
  }

  screenOf(t: { x: number; y: number }, lift = 2.2): { x: number; y: number; visible: boolean } {
    return this.r.project(new THREE.Vector3(t.x, lift * K, t.y * K - 0.4));
  }

  render(): void {
    this.r.render(this.scene);
  }
}
