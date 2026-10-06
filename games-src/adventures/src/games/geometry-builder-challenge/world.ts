import * as THREE from 'three';
import type { CharacterLook } from '../../kit/art/characters';
import { K, PX, type PixelRenderer } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Actor } from '../../kit/world/actor';
import { Lighting, billboard, blobShadow, glowSprite, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import { paintArcade, paintBlockShop, paintChip, paintClubhouse, paintCrates, paintGardenYard, paintSkyline, paintSoonSign, paintTrafficCone, paintTree, paintWheelbarrow, paintWorkshop, paintYard, type ClubParts, type YardLayout } from './art';
import type { Station } from './problems';

export const MAP = { w: 34, h: 28 };
const SITE = { x0: 13, y0: 6, x1: 22, y1: 12 };
const LAYOUT: YardLayout = {
  w: MAP.w,
  h: MAP.h,
  site: SITE,
  paths: [
    [17.5, 16, 17.5, 12],
    [17.5, 16, 9, 12.5],
    [17.5, 16, 9, 20.5],
    [17.5, 16, 25.5, 12.5],
    [17.5, 16, 25.5, 20.5],
    [17.5, 16, 17.5, 23],
  ],
};
const CLUB = { x: 17.5, y: 11.4 };
const PLACE: Record<Station, { x: number; y: number }> = {
  arcade: { x: 6, y: 11.6 },
  blocks: { x: 6, y: 20.2 },
  blueprint: { x: 28.6, y: 11.4 },
  garden: { x: 28.2, y: 21.6 },
};
export type Who = Station | 'odette';
export const PEOPLE: Record<Who, { x: number; y: number }> = {
  arcade: { x: 10.5, y: 13.5 },
  blocks: { x: 10.5, y: 21.5 },
  blueprint: { x: 24.5, y: 13.5 },
  garden: { x: 24.5, y: 21.5 },
  odette: { x: 20.5, y: 13.5 },
};
const CHIP = { x: 14.5, y: 15.5 };
export const START = { x: 17.5, y: 17 };

export interface Target {
  kind: 'person' | 'chip';
  id: Who | 'chip';
  x: number;
  y: number;
  label: string;
}

/**
 * The building yard: the clubhouse site in the middle, Kofi's arcade and
 * Lupe's block shop on the left, Mr. Haruto's workshop and Priya's garden
 * yard on the right. Each finished job delivers a part of the clubhouse.
 */
export class YardWorld {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  readonly grid = new CollisionGrid(MAP.w, MAP.h);
  player!: Actor;
  readonly people = new Map<Who, Actor>();
  readonly targets: Target[] = [];
  private club!: THREE.Mesh;
  private arcade!: THREE.Mesh;
  private shop!: THREE.Mesh;
  private workshop!: THREE.Mesh;
  private gardenYard!: THREE.Mesh;
  private skyline!: THREE.Mesh;
  private soon: THREE.Mesh[] = [];
  private lanterns: THREE.Mesh[] = [];
  private chip!: THREE.Mesh;
  private chipTex: THREE.CanvasTexture[] = [];
  private parts: ClubParts = { walls: false, pillars: false, roof: false, garden: false };
  private opened = false;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  night = 0;
  reducedMotion = false;
  onArrive: ((t: Target) => void) | null = null;

  constructor(private readonly r: PixelRenderer) {}

  build(playerLook: CharacterLook, looks: Record<Who, CharacterLook>, names: Record<Who, string>, parts: ClubParts, open: Station[]): void {
    const L = this.lighting;
    this.r.setBounds(MAP.w, MAP.h);
    this.r.renderer.setClearColor(new THREE.Color('#8fd0ee'), 1);
    const ground = paintYard(LAYOUT);
    const gGeo = new THREE.PlaneGeometry(MAP.w, MAP.h * K);
    gGeo.rotateX(-Math.PI / 2);
    const g = new THREE.Mesh(gGeo, L.add(new THREE.MeshBasicMaterial({ map: pixelTexture(ground) })));
    g.position.set(MAP.w / 2, 0, (MAP.h / 2) * K);
    this.scene.add(g);
    this.skyline = billboard(L, paintSkyline(MAP.w * 16, 120, 0), MAP.w / 2, 4.2);
    this.scene.add(this.skyline);

    // the edges of the yard: trees along the top and sides, fence at the bottom
    this.grid.block(0, 0, MAP.w, 6);
    this.grid.block(0, 0, 2, MAP.h);
    this.grid.block(MAP.w - 2, 0, 2, MAP.h);
    this.grid.block(0, MAP.h - 3, MAP.w, 3);
    for (let x = 1; x < MAP.w; x += 2.6) if (x < SITE.x0 - 1 || x > SITE.x1) this.scene.add(billboard(L, paintTree(Math.floor(x * 7), 0).toCanvas(), x, 5.8));
    for (let y = 8; y < MAP.h - 3; y += 2.8) {
      this.scene.add(billboard(L, paintTree(Math.floor(y * 13), 0).toCanvas(), 1, y));
      this.scene.add(billboard(L, paintTree(Math.floor(y * 17), 0).toCanvas(), MAP.w - 1, y));
    }
    for (let x = 1; x < MAP.w; x += 2.6) this.scene.add(billboard(L, paintTree(Math.floor(x * 11), 0).toCanvas(), x, MAP.h - 1.6));

    // the clubhouse on its site
    this.club = billboard(L, paintClubhouse(parts, 0).toCanvas(), CLUB.x, CLUB.y);
    this.scene.add(this.club);
    this.grid.block(SITE.x0 + 1, SITE.y0, SITE.x1 - SITE.x0 - 2, SITE.y1 - SITE.y0);
    for (const x of [12.2, 22.8]) {
      const l = glowSprite(L, 40, '#ffcf5a', x, 11.6, 2.2, 0.9);
      l.visible = false;
      this.lanterns.push(l);
      this.scene.add(l);
    }

    // the four places
    this.arcade = billboard(L, paintArcade(true).toCanvas(), PLACE.arcade.x, PLACE.arcade.y);
    this.shop = billboard(L, paintBlockShop(true).toCanvas(), PLACE.blocks.x, PLACE.blocks.y);
    this.workshop = billboard(L, paintWorkshop(open.includes('blueprint')).toCanvas(), PLACE.blueprint.x, PLACE.blueprint.y);
    this.gardenYard = billboard(L, paintGardenYard(open.includes('garden')).toCanvas(), PLACE.garden.x, PLACE.garden.y);
    this.scene.add(this.arcade, this.shop, this.workshop, this.gardenYard);
    this.grid.block(2, 9, 8, 3);
    this.grid.block(2, 18, 7, 3);
    this.grid.block(25, 9, 7, 3);
    this.grid.block(24, 19, 8, 3);
    for (const st of ['blueprint', 'garden'] as const)
      if (!open.includes(st)) {
        const p = PEOPLE[st];
        const m = billboard(L, paintSoonSign().toCanvas(), p.x + 1.4, p.y + 0.3);
        this.soon.push(m);
        this.scene.add(m);
      }

    // props
    for (const [x, y] of [
      [13.2, 12.6],
      [21.8, 12.6],
      [12.6, 19.5],
      [22.4, 18.6],
    ]) {
      this.scene.add(billboard(L, paintTrafficCone().toCanvas(), x, y));
    }
    this.scene.add(billboard(L, paintCrates().toCanvas(), 3.6, 15.2));
    this.grid.block(2, 14, 2, 1);
    this.scene.add(billboard(L, paintCrates().toCanvas(), 30.4, 16.2));
    this.grid.block(30, 15, 2, 1);
    this.scene.add(billboard(L, paintWheelbarrow().toCanvas(), 21.2, 23.4));
    this.grid.block(20, 23, 2, 1);

    // Chip the beaver
    this.chipTex = [0, 1].map((f) => pixelTexture(paintChip(f).toCanvas()));
    const cGeo = new THREE.PlaneGeometry(18 / PX, (16 / PX) * K);
    cGeo.translate(0, ((16 / PX) * K) / 2, 0);
    this.chip = new THREE.Mesh(cGeo, L.add(new THREE.MeshBasicMaterial({ map: this.chipTex[0], alphaTest: 0.5 })));
    this.chip.position.set(CHIP.x, 0, CHIP.y * K + 0.05);
    this.scene.add(this.chip);
    const sh = blobShadow(0.9);
    sh.position.set(CHIP.x, 0.015, CHIP.y * K);
    this.scene.add(sh);
    this.grid.setBlocker('chip', CHIP.x, CHIP.y, 0.4);
    this.grid.setDynamic('chip', [[Math.floor(CHIP.x), Math.floor(CHIP.y)]]);
    this.targets.push({ kind: 'chip', id: 'chip', x: CHIP.x, y: CHIP.y, label: 'Talk to Chip' });

    // people
    this.player = new Actor(L, playerLook, START.x, START.y, 'up');
    this.scene.add(this.player.group);
    for (const id of ['arcade', 'blocks', 'blueprint', 'garden', 'odette'] as const) {
      const s = PEOPLE[id];
      const a = new Actor(L, looks[id], s.x, s.y, 'down');
      this.people.set(id, a);
      this.scene.add(a.group);
      this.grid.setBlocker(id, s.x, s.y, 0.45);
      this.grid.setDynamic(id, [[Math.floor(s.x), Math.floor(s.y)]]);
      this.targets.push({ kind: 'person', id, x: s.x, y: s.y, label: `Talk to ${names[id]}` });
    }
    this.setParts(parts);
  }

  /** Show the clubhouse with the delivered parts (and the evening once it opens). */
  setParts(parts: ClubParts, open = false): void {
    this.parts = { ...parts };
    this.opened = open;
    this.repaint(this.club, paintClubhouse(this.parts, this.night, open).toCanvas());
    this.lanterns.forEach((l) => (l.visible = open));
  }

  setNight(n: number): void {
    this.night = n;
    const tint: [number, number, number] = [1 - n * 0.42, 1 - n * 0.38, 1 - n * 0.12];
    this.lighting.set(tint, n);
    this.r.renderer.setClearColor(new THREE.Color().lerpColors(new THREE.Color('#8fd0ee'), new THREE.Color('#141a3a'), n), 1);
    this.repaint(this.skyline, paintSkyline(MAP.w * 16, 120, n));
    this.repaint(this.club, paintClubhouse(this.parts, n, this.opened).toCanvas());
  }

  setMarkers(marks: Partial<Record<Who, 'new' | 'turnin' | null>>): void {
    for (const [id, m] of Object.entries(marks)) this.people.get(id as Who)?.setMarker(m ?? null);
  }

  private repaint(mesh: THREE.Mesh, cv: HTMLCanvasElement): void {
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = pixelTexture(cv);
    mat.needsUpdate = true;
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
    if (!this.reducedMotion) (this.chip.material as THREE.MeshBasicMaterial).map = this.chipTex[Math.floor(this.time * 2) % 4 === 0 ? 1 : 0];
    this.r.lookAt(p.x, p.y - 3.4, 0.18);
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
