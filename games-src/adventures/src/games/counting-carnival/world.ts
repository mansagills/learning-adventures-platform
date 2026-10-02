import * as THREE from 'three';
import type { CharacterLook } from '../../kit/art/characters';
import { K, PX, type PixelRenderer } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Actor } from '../../kit/world/actor';
import { Lighting, billboard, blobShadow, glowSprite, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid, findPath } from '../../kit/world/walk';
import {
  paintArch,
  paintBackdrop,
  paintBalloons,
  paintBooth,
  paintCarriedBalloon,
  paintFairground,
  paintFlagString,
  paintLamp,
  paintMunch,
  paintPopcornCart,
  paintTree,
} from './art';
import type { Booth } from './problems';

export const MAP = { w: 30, h: 21 };
const PLAZA = { x0: 2, y0: 5, x1: 28, y1: 19 };

/** Where each booth stands: its left tile and the row of its front edge. */
export const BOOTH_SPOTS: Record<Booth, { x: number; y: number }> = {
  ducks: { x: 4, y: 8 },
  rings: { x: 22, y: 8 },
  snacks: { x: 4, y: 14 },
  tickets: { x: 22, y: 14 },
};
export const ROSA_SPOT = { x: 15, y: 10.6 };
export const MUNCH_SPOT = { x: 9.6, y: 14.4 };
const BOOTH_GLOW: Record<Booth, string> = { ducks: '#ffe58a', rings: '#ffb08a', snacks: '#e7b6ff', tickets: '#ffd27a' };
export const START = { x: 15, y: 15.6 };

export interface Target {
  kind: 'booth' | 'rosa' | 'munch';
  id: string;
  x: number;
  y: number;
  label: string;
}

/**
 * The fairground the player walks around: a sandy plaza, four booths, Rosa
 * by the middle path, Munch beside his snack stand. The sky darkens and the
 * lights come on as booths are completed.
 */
export class CarnivalWorld {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  readonly grid = new CollisionGrid(MAP.w, MAP.h);
  player!: Actor;
  rosa!: Actor;
  private munch!: THREE.Mesh;
  private munchTex: THREE.CanvasTexture[] = [];
  private booths = new Map<Booth, THREE.Mesh>();
  private balloon: THREE.Mesh | null = null;
  private backdrop!: THREE.Mesh;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private time = 0;
  night = 0;
  reducedMotion = false;
  /** Called when a click-to-walk reaches its target (for booths and characters). */
  onArrive: ((t: Target) => void) | null = null;
  private readonly boothGlows = new Map<Booth, THREE.Mesh>();
  readonly targets: Target[] = [];

  constructor(private readonly r: PixelRenderer) {}

  build(playerLook: CharacterLook, rosaLook: CharacterLook, lit: Set<Booth>): void {
    const L = this.lighting;
    this.r.setBounds(MAP.w, MAP.h);
    this.r.renderer.setClearColor(new THREE.Color('#8fd0ee'), 1);

    const ground = paintFairground(MAP.w, MAP.h, PLAZA);
    const gGeo = new THREE.PlaneGeometry(MAP.w, MAP.h * K);
    gGeo.rotateX(-Math.PI / 2);
    const g = new THREE.Mesh(gGeo, L.add(new THREE.MeshBasicMaterial({ map: pixelTexture(ground) })));
    g.position.set(MAP.w / 2, 0, (MAP.h / 2) * K);
    this.scene.add(g);

    this.backdrop = billboard(L, paintBackdrop(MAP.w * 16, 150, 0), MAP.w / 2, PLAZA.y0 - 0.6);
    this.scene.add(this.backdrop);

    // edges: trees on the grass, so the plaza feels enclosed
    for (let x = 0.5; x < MAP.w; x += 1.6) {
      if (x > 13 && x < 17) continue;
      this.scene.add(billboard(L, paintTree(Math.floor(x * 7), 0).toCanvas(), x, PLAZA.y0 - 0.2));
    }
    for (let y = PLAZA.y0 + 1; y < MAP.h; y += 2.2) {
      this.scene.add(billboard(L, paintTree(Math.floor(y * 13), 0).toCanvas(), 0.9, y));
      this.scene.add(billboard(L, paintTree(Math.floor(y * 17), 0).toCanvas(), MAP.w - 0.9, y));
    }
    this.grid.block(0, 0, MAP.w, PLAZA.y0);
    this.grid.block(0, 0, PLAZA.x0, MAP.h);
    this.grid.block(PLAZA.x1, 0, MAP.w - PLAZA.x1, MAP.h);
    this.grid.block(0, MAP.h - 1, MAP.w, 1);

    // the booths
    for (const [id, s] of Object.entries(BOOTH_SPOTS) as Array<[Booth, { x: number; y: number }]>) {
      const mesh = billboard(L, paintBooth(id, lit.has(id), 0).toCanvas(), s.x + 2, s.y);
      this.booths.set(id, mesh);
      this.scene.add(mesh);
      // a warm glow under the light bulbs, seen once evening falls on a finished booth
      const glow = glowSprite(L, 72, BOOTH_GLOW[id], s.x + 2, s.y + 0.1, 1.5, 0.75);
      glow.visible = lit.has(id);
      this.boothGlows.set(id, glow);
      this.scene.add(glow);
      this.grid.block(s.x, s.y - 2, 4, 2);
      this.targets.push({ kind: 'booth', id, x: s.x + 2, y: s.y + 0.9, label: '' });
    }

    // the entrance arch over the path at the bottom
    this.scene.add(billboard(L, paintArch().toCanvas(), 15, MAP.h - 1.2));
    this.grid.block(12, MAP.h - 2, 1, 1);
    this.grid.block(17, MAP.h - 2, 1, 1);

    // lamps with night glows, a popcorn cart, balloon stands, flag strings
    for (const [x, y] of [
      [3, 6],
      [27, 6],
      [3, 18],
      [27, 18],
      [12, 11],
      [18, 11],
    ]) {
      this.scene.add(billboard(L, paintLamp(true).toCanvas(), x, y));
      this.scene.add(glowSprite(L, 36, '#ffe7a3', x, y + 0.05, 1.7, 0.85));
      this.grid.block(Math.floor(x), Math.floor(y - 0.5), 1, 1);
    }
    this.scene.add(billboard(L, paintPopcornCart().toCanvas(), 19.5, 17));
    this.grid.block(18, 16, 3, 1);
    this.scene.add(billboard(L, paintBalloons(3).toCanvas(), 11, 17));
    this.scene.add(billboard(L, paintBalloons(9).toCanvas(), 26, 11.5));
    this.grid.block(10, 16, 2, 1);
    this.grid.block(25, 11, 2, 1);
    for (const [x, y] of [
      [8, 10.2],
      [22, 10.2],
    ]) {
      const flags = billboard(L, paintFlagString(16 * 9, Math.floor(x)).toCanvas(), x, y, { lift: 2.7 });
      this.scene.add(flags);
    }

    // the people
    this.player = new Actor(L, playerLook, START.x, START.y, 'up');
    this.rosa = new Actor(L, rosaLook, ROSA_SPOT.x, ROSA_SPOT.y, 'down');
    this.scene.add(this.player.group, this.rosa.group);
    this.grid.setBlocker('rosa', ROSA_SPOT.x, ROSA_SPOT.y, 0.45);
    this.targets.push({ kind: 'rosa', id: 'rosa', x: ROSA_SPOT.x, y: ROSA_SPOT.y, label: 'Talk to Rosa' });

    // Munch: a two-frame sprite with a shadow
    this.munchTex = [0, 1].map((f) => pixelTexture(paintMunch(f).toCanvas()));
    const mGeo = new THREE.PlaneGeometry(24 / PX, (26 / PX) * K);
    mGeo.translate(0, ((26 / PX) * K) / 2, 0);
    this.munch = new THREE.Mesh(mGeo, L.add(new THREE.MeshBasicMaterial({ map: this.munchTex[0], alphaTest: 0.5 })));
    this.munch.position.set(MUNCH_SPOT.x, 0, MUNCH_SPOT.y * K);
    const sh = blobShadow(1.3);
    sh.position.set(MUNCH_SPOT.x, 0.015, MUNCH_SPOT.y * K);
    this.scene.add(this.munch, sh);
    this.grid.setBlocker('munch', MUNCH_SPOT.x, MUNCH_SPOT.y, 0.6);
    this.targets.push({ kind: 'munch', id: 'munch', x: MUNCH_SPOT.x, y: MUNCH_SPOT.y, label: 'Say hi to Munch' });

    this.setNight(lit.size);
  }

  /** Repaint a booth (its lights come on when it is complete). */
  setBoothLit(id: Booth, lit: boolean): void {
    const mesh = this.booths.get(id);
    if (!mesh) return;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = pixelTexture(paintBooth(id, lit, 0).toCanvas());
    mat.needsUpdate = true;
    const glow = this.boothGlows.get(id);
    if (glow) glow.visible = lit;
  }

  /** Evening falls a little with each booth finished; all four (or the finale) bring night and the lights. */
  setNight(boothsDone: number, finale = false): void {
    this.night = finale ? 1 : Math.min(0.55, boothsDone * 0.14);
    const n = this.night;
    const tint: [number, number, number] = [1 - n * 0.42, 1 - n * 0.38, 1 - n * 0.12];
    this.lighting.set(tint, n);
    this.r.renderer.setClearColor(new THREE.Color().lerpColors(new THREE.Color('#8fd0ee'), new THREE.Color('#141a3a'), n), 1);
    const mat = this.backdrop.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = pixelTexture(paintBackdrop(MAP.w * 16, 150, n));
    mat.needsUpdate = true;
  }

  /** Carry a balloon (a prize bought with tickets), or nothing. */
  setBalloon(color: string | null): void {
    if (this.balloon) {
      this.player.group.remove(this.balloon);
      this.balloon = null;
    }
    if (!color) return;
    const cv = paintCarriedBalloon(color).toCanvas();
    const geo = new THREE.PlaneGeometry(cv.width / PX, (cv.height / PX) * K);
    geo.translate(0, ((cv.height / PX) * K) / 2, 0);
    this.balloon = new THREE.Mesh(geo, this.lighting.add(new THREE.MeshBasicMaterial({ map: pixelTexture(cv), alphaTest: 0.5 })));
    this.balloon.position.set(0.45, 0.5 * K, -0.05);
    this.player.group.add(this.balloon);
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

  /** The thing the player is standing next to, if any. */
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
          // Blocked a step short (people keep a little space around them).
          // Close enough to talk counts as arriving; otherwise give up.
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
    // Rosa turns to face the player when they are close
    const near = Math.hypot(p.x - this.rosa.x, p.y - this.rosa.y) < 3;
    this.rosa.facing = near ? (Math.abs(p.x - this.rosa.x) > Math.abs(p.y - this.rosa.y) ? (p.x > this.rosa.x ? 'right' : 'left') : p.y > this.rosa.y ? 'down' : 'up') : 'down';
    this.rosa.update(dt, this.reducedMotion);
    // Munch chomps now and then
    if (!this.reducedMotion) (this.munch.material as THREE.MeshBasicMaterial).map = this.munchTex[Math.floor(this.time * 1.6) % 4 === 0 ? 1 : 0];
    if (this.balloon && !this.reducedMotion) this.balloon.position.y = (0.5 + Math.round(Math.sin(this.time * 2) * 1.5) / PX) * K;
    this.r.lookAt(p.x, p.y - 2.5, 0.18);
  }

  /** Which ground tile is under a screen point. */
  tileAt(cx: number, cy: number): { x: number; y: number } | null {
    return this.r.screenToTile(cx, cy);
  }

  /** Screen position of a target (for the "Play" prompt over a booth). */
  screenOf(t: Target, lift = 2.2): { x: number; y: number; visible: boolean } {
    return this.r.project(new THREE.Vector3(t.x, lift * K, t.y * K - 0.4));
  }

  render(): void {
    this.r.render(this.scene);
  }
}
