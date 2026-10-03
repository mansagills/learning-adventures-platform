import * as THREE from 'three';
import type { CharacterLook } from '../../kit/art/characters';
import { K, type PixelRenderer } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Actor } from '../../kit/world/actor';
import { Lighting, billboard, glowSprite, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { paintBakery, paintBench, paintBus, paintBusStop, paintLamp, paintSchool, paintSkyline, paintSmoke, paintSundial, paintTower, paintTown, paintTree, type TowerState } from './art';
import { addMinutes, type Station, type Time } from './problems';

// Everything sits 4 rows down from the top of the map, so the camera has room
// to show the whole clock tower above the square.
export const MAP = { w: 32, h: 26 };
const PLAZA = { x0: 2, y0: 10, x1: 30, y1: 22 };
const ROAD_Y = 23;
const TOWER = { x: 16, y: 12.8 };
const SCHOOL = { x: 6.5, y: 13 };
const BAKERY = { x: 25.5, y: 13 };
const STOP = { x: 6.5, y: 22.7 };
const BUS_STOP_X = 7.2;
export const START = { x: 16, y: 15.6 };

export const PEOPLE_SPOTS: Record<Station | 'tock', { x: number; y: number }> = {
  school: { x: 10.5, y: 14.5 },
  bakery: { x: 21.5, y: 14.5 },
  bus: { x: 10.5, y: 21.5 },
  tock: { x: 13.5, y: 13.5 },
};

export interface Target {
  kind: 'person';
  id: Station | 'tock';
  x: number;
  y: number;
  label: string;
}

/**
 * The town square: the clock tower in the middle, the school on the left,
 * the bakery on the right, the bus stop by the road. Each finished job brings
 * back part of the tower (hands, bell, lights) and the day moves on toward
 * evening.
 */
export class TownWorld {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  readonly grid = new CollisionGrid(MAP.w, MAP.h);
  player!: Actor;
  readonly people = new Map<Station | 'tock', Actor>();
  readonly targets: Target[] = [];
  private tower!: THREE.Mesh;
  private school!: THREE.Mesh;
  private bakery!: THREE.Mesh;
  private stop!: THREE.Mesh;
  private skyline!: THREE.Mesh;
  private bus!: THREE.Mesh;
  private towerGlow!: THREE.Mesh;
  private smoke: THREE.Mesh[] = [];
  private smokeTex: THREE.CanvasTexture[] = [];
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  /** The time on the tower clock (it runs once its hands are back: one town minute every second). */
  townTime: Time = { h: 8, m: 0 };
  private townAcc = 0;
  private towerState: TowerState = { hands: false, bell: false, lights: false };
  private busT = 6;
  private busPhase: 'away' | 'arriving' | 'waiting' | 'leaving' = 'away';
  private busX = -6;
  night = 0;
  reducedMotion = false;
  onArrive: ((t: Target) => void) | null = null;
  /** Called when the tower bell rings on the hour (once it is fixed). */
  onChime: ((hour: number) => void) | null = null;

  constructor(private readonly r: PixelRenderer) {}

  build(playerLook: CharacterLook, looks: Record<Station | 'tock', CharacterLook>, names: Record<Station | 'tock', string>, done: Station[]): void {
    const L = this.lighting;
    this.r.setBounds(MAP.w, MAP.h);
    this.r.renderer.setClearColor(new THREE.Color('#8fd0ee'), 1);

    const ground = paintTown(MAP.w, MAP.h, PLAZA, ROAD_Y);
    const gGeo = new THREE.PlaneGeometry(MAP.w, MAP.h * K);
    gGeo.rotateX(-Math.PI / 2);
    const g = new THREE.Mesh(gGeo, L.add(new THREE.MeshBasicMaterial({ map: pixelTexture(ground) })));
    g.position.set(MAP.w / 2, 0, (MAP.h / 2) * K);
    this.scene.add(g);

    this.skyline = billboard(L, paintSkyline(MAP.w * 16, 120, 0), MAP.w / 2, 8.2);
    this.scene.add(this.skyline);
    // trees behind and beside the square
    for (const x of [1, 3, 11.2, 12.8, 19.2, 20.8, 29, 31]) this.scene.add(billboard(L, paintTree(Math.floor(x * 7), 0).toCanvas(), x, 9.8));
    for (let y = 12; y < ROAD_Y; y += 2.4) {
      this.scene.add(billboard(L, paintTree(Math.floor(y * 13), 0).toCanvas(), 0.9, y));
      this.scene.add(billboard(L, paintTree(Math.floor(y * 17), 0).toCanvas(), MAP.w - 0.9, y));
    }
    this.grid.block(0, 0, MAP.w, PLAZA.y0);
    this.grid.block(0, 0, PLAZA.x0, MAP.h);
    this.grid.block(PLAZA.x1, 0, MAP.w - PLAZA.x1, MAP.h);
    this.grid.block(0, ROAD_Y - 1, MAP.w, MAP.h - ROAD_Y + 1);

    // the buildings
    this.school = billboard(L, paintSchool(done.includes('school'), 0).toCanvas(), SCHOOL.x, SCHOOL.y);
    this.bakery = billboard(L, paintBakery(done.includes('bakery'), 0).toCanvas(), BAKERY.x, BAKERY.y);
    this.scene.add(this.school, this.bakery);
    this.grid.block(2, 10, 9, 3);
    this.grid.block(21, 10, 9, 3);
    this.tower = billboard(L, paintTower(this.towerState, this.townTime, 0).toCanvas(), TOWER.x, TOWER.y);
    this.scene.add(this.tower);
    this.grid.block(14, 10, 4, 3);
    this.towerGlow = glowSprite(L, 64, '#ffe08a', TOWER.x, TOWER.y + 0.05, 4.3, 0.6);
    this.scene.add(this.towerGlow);
    this.stop = billboard(L, paintBusStop(null).toCanvas(), STOP.x, STOP.y);
    this.scene.add(this.stop);
    this.grid.block(4, 21, 6, 1);

    // chimney smoke over the bakery
    this.smokeTex = [0, 1, 2].map((s) => pixelTexture(paintSmoke(s).toCanvas()));
    for (let i = 0; i < 3; i++) {
      const m = billboard(L, paintSmoke(i).toCanvas(), BAKERY.x + 1.44, BAKERY.y, { lift: 4.8 + i * 0.7 });
      this.smoke.push(m);
      this.scene.add(m);
    }

    // the square: a sundial, benches and lamps
    this.scene.add(billboard(L, paintSundial().toCanvas(), 16, 18));
    this.grid.block(15, 17, 2, 1);
    for (const x of [12, 20]) {
      this.scene.add(billboard(L, paintBench().toCanvas(), x, 20.6));
      this.grid.block(x - 1, 20, 2, 1);
    }
    for (const [x, y] of [
      [3, 14.5],
      [29, 14.5],
      [3, 20.5],
      [29, 20.5],
      [12.5, 16.5],
      [19.5, 16.5],
    ]) {
      this.scene.add(billboard(L, paintLamp().toCanvas(), x, y));
      this.scene.add(glowSprite(L, 36, '#ffe7a3', x, y + 0.05, 1.7, 0.85));
      this.grid.block(Math.floor(x), Math.floor(y - 0.5), 1, 1);
    }

    // the bus on the road
    this.bus = billboard(L, paintBus().toCanvas(), this.busX, 24.7);
    this.scene.add(this.bus);

    // people
    this.player = new Actor(L, playerLook, START.x, START.y, 'up');
    this.scene.add(this.player.group);
    for (const id of ['school', 'bakery', 'bus', 'tock'] as const) {
      const s = PEOPLE_SPOTS[id];
      const a = new Actor(L, looks[id], s.x, s.y, 'down');
      this.people.set(id, a);
      this.scene.add(a.group);
      this.grid.setBlocker(id, s.x, s.y, 0.45);
      // people stand in the middle of a tile, and routes go round that tile
      this.grid.setDynamic(id, [[Math.floor(s.x), Math.floor(s.y)]]);
      this.targets.push({ kind: 'person', id, x: s.x, y: s.y, label: `Talk to ${names[id]}` });
    }
    this.setFixed(done);
  }

  /** Bring back the tower parts for the finished jobs, and move the day toward evening. */
  setFixed(done: Station[], finale = false): void {
    this.towerState = { hands: done.includes('school'), bell: done.includes('bus'), lights: done.includes('bakery') };
    this.repaintTower();
    this.repaint(this.school, paintSchool(done.includes('school'), this.night).toCanvas());
    this.repaint(this.bakery, paintBakery(done.includes('bakery'), this.night).toCanvas());
    this.setNight(finale ? 0.75 : Math.min(0.42, done.length * 0.14));
  }

  setMarkers(marks: Partial<Record<Station | 'tock', 'new' | 'turnin' | null>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id as Station | 'tock')?.setMarker(m ?? null);
  }

  private repaint(mesh: THREE.Mesh, cv: HTMLCanvasElement): void {
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = pixelTexture(cv);
    mat.needsUpdate = true;
  }

  private repaintTower(): void {
    this.repaint(this.tower, paintTower(this.towerState, this.townTime, this.night).toCanvas());
    this.repaint(this.stop, paintBusStop(this.towerState.hands ? this.townTime : null).toCanvas());
    this.towerGlow.visible = this.towerState.lights;
  }

  setNight(n: number): void {
    this.night = n;
    const tint: [number, number, number] = [1 - n * 0.42, 1 - n * 0.38, 1 - n * 0.12];
    this.lighting.set(tint, n);
    this.r.renderer.setClearColor(new THREE.Color().lerpColors(new THREE.Color('#8fd0ee'), new THREE.Color('#141a3a'), n), 1);
    this.repaint(this.skyline, paintSkyline(MAP.w * 16, 120, n));
  }

  get towerParts(): TowerState {
    return { ...this.towerState };
  }

  get busPosition(): number {
    return this.busX;
  }

  /** Send the bus round now (after a right answer at the bus stop). */
  callBus(): void {
    if (this.busPhase === 'away') this.busT = 0;
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
    const speed = 4.4;
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
    // people turn to face the player when close
    for (const a of this.people.values()) {
      const near = Math.hypot(p.x - a.x, p.y - a.y) < 3;
      a.facing = near ? (Math.abs(p.x - a.x) > Math.abs(p.y - a.y) ? (p.x > a.x ? 'right' : 'left') : p.y > a.y ? 'down' : 'up') : 'down';
      a.update(dt, this.reducedMotion);
    }
    this.updateTown(dt);
    this.r.lookAt(p.x, p.y - 3.4, 0.18);
  }

  private updateTown(dt: number): void {
    // the tower clock runs once its hands are back
    if (this.towerState.hands) {
      this.townAcc += dt;
      if (this.townAcc >= 1) {
        this.townAcc -= 1;
        this.townTime = addMinutes(this.townTime, 1);
        this.repaintTower();
        if (this.townTime.m === 0 && this.towerState.bell) this.onChime?.(this.townTime.h);
      }
    }
    // chimney smoke drifts up and fades round
    this.smoke.forEach((m, i) => {
      const t = (this.time * 0.35 + i / 3) % 1;
      m.position.y = (4.8 + t * 2.2) * K;
      m.position.x = 25.5 + 1.44 + Math.sin(t * 6) * 0.25;
      (m.material as THREE.MeshBasicMaterial).map = this.smokeTex[Math.min(2, Math.floor(t * 3))];
      m.visible = !this.reducedMotion || i === 0;
    });
    // the bus: comes in from the left, waits at the stop, drives off to the right
    const speed = 6;
    if (this.busPhase === 'away') {
      this.busT -= dt;
      if (this.busT <= 0) {
        this.busPhase = 'arriving';
        this.busX = -6;
      }
    } else if (this.busPhase === 'arriving') {
      this.busX += speed * dt * Math.max(0.25, Math.min(1, (BUS_STOP_X - this.busX) / 4));
      if (this.busX >= BUS_STOP_X - 0.05) {
        this.busX = BUS_STOP_X;
        this.busPhase = 'waiting';
        this.busT = 3;
      }
    } else if (this.busPhase === 'waiting') {
      this.busT -= dt;
      if (this.busT <= 0) this.busPhase = 'leaving';
    } else {
      this.busX += speed * dt;
      if (this.busX > MAP.w + 6) {
        this.busPhase = 'away';
        this.busT = 35;
      }
    }
    this.bus.position.x = this.busX;
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
