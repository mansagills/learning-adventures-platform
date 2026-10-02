import * as THREE from 'three';
import { K, PX, type PixelRenderer } from '../../kit/render/pixelRenderer';
import { PixelBuffer } from '../../kit/art/pixel';
import type { CharacterLook } from '../../kit/art/characters';
import { paintSparkle } from '../../kit/art/sparkle';
import { mulberry32 } from '../../kit/core/rng';
import { Actor } from '../../kit/world/actor';
import { Lighting, billboard, glowSprite, pixelTexture } from '../../kit/world/sceneKit';
import {
  THEMES,
  paintArc,
  paintBackdrop,
  paintDojo,
  paintFirefly,
  paintFlag,
  paintGround,
  paintKoi,
  paintLantern,
  paintLily,
  paintPetal,
  paintPop,
  paintPuff,
  paintReeds,
  paintRock,
  paintStar,
  paintStone,
  paintTree,
  paintWaterTile,
  type StoneLook,
  type Theme,
} from './art';
import { isLabelled, type BeltId, type Problem } from './problems';

/** Tile layout of every riverside place (rows run toward the camera). */
export const LAYOUT = {
  /** Empty tiles left of stone 0 and right of the last stone. */
  margin: 4,
  waterTop: 5,
  waterBottom: 10,
  /** The center of the stepping stones' top faces. */
  stoneY: 7.5,
  /** Where Sensei walks along the near bank. */
  senseiY: 11.3,
  /** Rows the camera keeps inside. */
  rows: 14,
  /** Extra ground below, for tall phone screens. */
  groundRows: 26,
};

/** The ninja stands on the back half of a stone, so the stone's number stays visible. */
const NINJA_BACK = 0.22;

interface Hop {
  dist: number;
  t: number;
  dur: number;
  from: number;
  to: number;
  height: number;
  resolve: () => void;
}

interface Effect {
  mesh: THREE.Mesh;
  t: number;
  life: number;
  vx: number;
  vy: number;
  grow?: number;
}

/**
 * The riverside world for one belt: backdrop, banks, flowing water, a row
 * of stepping stones 0..lineMax, the player's ninja, Sensei Rio, and the
 * hop arcs. Positions are in tile units, like Seeds of Genius.
 */
export class NinjaScene {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  ninja!: Actor;
  sensei!: Actor;
  theme: Theme = THEMES.white;
  lineMax = 20;
  private world = new THREE.Group();
  private stonesTex: THREE.CanvasTexture | null = null;
  private stonesBuf: PixelBuffer | null = null;
  private waterTex: THREE.CanvasTexture | null = null;
  private arcs = new THREE.Group();
  private ghosts = new THREE.Group();
  private fx = new THREE.Group();
  private effects: Effect[] = [];
  private queue: Array<Omit<Hop, 't' | 'from' | 'to'>> = [];
  private hop: Hop | null = null;
  private squashT = 0;
  private koi: Array<{ mesh: THREE.Mesh; frames: THREE.CanvasTexture[]; speed: number; t: number }> = [];
  private petals: Array<{ mesh: THREE.Mesh; vx: number; vy: number; ph: number }> = [];
  private flag: THREE.Mesh | null = null;
  private sparkle: THREE.Mesh | null = null;
  private sparkleTex: THREE.CanvasTexture[] = [];
  private time = 0;
  private camX = 0;
  private problem: Problem | null = null;
  private stoneLooks = new Map<number, Partial<StoneLook>>();
  reducedMotion = false;
  /** Called on every landing with the stone number. */
  onLand: ((n: number) => void) | null = null;

  constructor(private readonly r: PixelRenderer) {
    this.scene.add(this.world, this.arcs, this.ghosts, this.fx);
  }

  get widthTiles(): number {
    return this.lineMax + 1 + LAYOUT.margin * 2;
  }

  /** World x (tile units) of the center of stone n. */
  stoneX(n: number): number {
    return LAYOUT.margin + n + 0.5;
  }

  /** The stone the ninja is standing on (rounded). */
  get ninjaStone(): number {
    return Math.round(this.ninja.x - LAYOUT.margin - 0.5);
  }

  get busy(): boolean {
    return !!this.hop || this.queue.length > 0;
  }

  // ------------------------------------------------------------ building

  /** Build the place for a belt (rebuilds only when the belt or line length changes). */
  build(belt: BeltId, lineMax: number, ninjaLook: CharacterLook, senseiLook: CharacterLook): void {
    const theme = THEMES[belt];
    if (this.theme === theme && this.lineMax === lineMax && this.ninja) {
      this.ninja.setLook(ninjaLook);
      return;
    }
    this.theme = theme;
    this.lineMax = lineMax;
    this.dispose();
    const W = this.widthTiles;
    const L = LAYOUT;
    this.r.setBounds(W, L.rows);
    this.r.renderer.setClearColor(new THREE.Color(theme.sky[0]), 1);
    this.lighting.set(theme.tint, theme.night ? 1 : 0);

    // Ground (banks, flowers) for every row, including the extra rows phones see.
    const ground = paintGround(theme, W, L.groundRows, [L.waterTop, L.waterBottom]);
    const gGeo = new THREE.PlaneGeometry(W, L.groundRows * K);
    gGeo.rotateX(-Math.PI / 2);
    const gMesh = new THREE.Mesh(gGeo, this.lighting.add(new THREE.MeshBasicMaterial({ map: pixelTexture(ground) })));
    gMesh.position.set(W / 2, 0, (L.groundRows / 2) * K);
    this.world.add(gMesh);

    // Flowing water: a small tile that scrolls.
    this.waterTex = pixelTexture(paintWaterTile(theme));
    this.waterTex.wrapS = THREE.RepeatWrapping;
    this.waterTex.wrapT = THREE.RepeatWrapping;
    const wh = L.waterBottom - L.waterTop;
    this.waterTex.repeat.set((W * 16) / 32, wh);
    const wGeo = new THREE.PlaneGeometry(W, wh * K);
    wGeo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(wGeo, this.lighting.add(new THREE.MeshBasicMaterial({ map: this.waterTex })));
    water.position.set(W / 2, 0.01, (L.waterTop + wh / 2) * K);
    this.world.add(water);

    // Sky, mountains and the far treeline, standing behind the far bank.
    const backH = 160;
    const back = billboard(this.lighting, paintBackdrop(theme, W * 16, backH, lineMax), W / 2, L.waterTop - 0.95);
    this.world.add(back);

    const rand = mulberry32(lineMax * 31 + belt.length);
    // Far bank: trees and lanterns.
    for (let x = 0.5; x < W; x += 1.3 + rand() * 1.6) {
      if (x > 0.5 && x < 4.6) continue; // the dojo stands here
      const tree = paintTree(theme.tree, Math.floor(rand() * 1000), theme.night);
      this.world.add(billboard(this.lighting, tree.toCanvas(), x, L.waterTop - 0.35 - rand() * 0.25));
    }
    this.world.add(billboard(this.lighting, paintDojo(theme.night).toCanvas(), 2.6, L.waterTop - 0.3));
    // Near bank: lanterns every few stones, rocks and reeds at the water's edge.
    for (let n = 0; n <= lineMax; n += lineMax === 20 ? 5 : 10) {
      const x = this.stoneX(n) + 0.5;
      this.world.add(billboard(this.lighting, paintLantern(theme.night).toCanvas(), x, L.waterBottom + 1.2));
      if (theme.night) this.world.add(glowSprite(this.lighting, 40, '#ffd27a', x, L.waterBottom + 1.25, 0.95, 0.75));
    }
    for (let x = 0.4; x < W; x += 0.9 + rand() * 2.2) {
      const near = rand() < 0.55;
      const y = near ? L.waterBottom + 0.25 : L.waterTop - 0.05;
      const thing = rand() < 0.6 ? paintReeds(Math.floor(rand() * 999), theme.night) : paintRock(Math.floor(rand() * 999));
      this.world.add(billboard(this.lighting, thing.toCanvas(), x, y));
    }
    // Lily pads and koi in the water, away from the stones.
    for (let i = 0; i < W / 3; i++) {
      const lily = this.flat(paintLily(i).toCanvas());
      lily.position.set(rand() * W, 0.015, (rand() < 0.5 ? L.waterTop + 0.6 + rand() * 0.9 : L.waterBottom - 0.5 - rand() * 0.8) * K);
      this.world.add(lily);
    }
    const koiColors = ['#f08a4b', '#fdfbf5', '#e0574f'];
    for (let i = 0; i < 3 + Math.floor(W / 30); i++) {
      const color = koiColors[i % koiColors.length];
      const frames = [0, 1].map((f) => pixelTexture(paintKoi(f, color).toCanvas()));
      const mesh = this.flat(paintKoi(0, color).toCanvas());
      (mesh.material as THREE.MeshBasicMaterial).map = frames[0];
      const lane = [L.waterTop + 0.9, L.waterBottom - 0.8, L.waterTop + 1.6, L.waterBottom - 1.5][i % 4];
      mesh.position.set(rand() * W, 0.016, lane * K);
      const speed = (0.6 + rand() * 0.6) * (i % 2 ? -1 : 1);
      mesh.scale.x = speed < 0 ? -1 : 1;
      this.koi.push({ mesh, frames, speed, t: rand() * 10 });
      this.world.add(mesh);
    }

    // The stepping stones: one canvas redrawn whenever labels change.
    this.stonesBuf = new PixelBuffer(W * 16, 48);
    this.stonesTex = pixelTexture(this.stonesBuf.toCanvas());
    const sGeo = new THREE.PlaneGeometry(W, 3 * K);
    sGeo.rotateX(-Math.PI / 2);
    const stones = new THREE.Mesh(sGeo, this.lighting.add(new THREE.MeshBasicMaterial({ map: this.stonesTex, transparent: true, alphaTest: 0.5 })));
    stones.position.set(W / 2, 0.03, (L.stoneY) * K);
    stones.renderOrder = 2;
    this.world.add(stones);

    // Petals, leaves or fireflies.
    const pc = theme.night ? null : theme.petal;
    const fly = theme.night ? pixelTexture(paintFirefly().toCanvas()) : null;
    const pTex = pc ? pixelTexture(paintPetal(pc).toCanvas()) : null;
    if (pTex || fly)
      for (let i = 0; i < 16; i++) {
        const tex = (pTex ?? fly)!;
        const geo = new THREE.PlaneGeometry(3 / PX, (2 / PX) * K);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: fly ? THREE.AdditiveBlending : THREE.NormalBlending });
        const m = new THREE.Mesh(geo, mat);
        m.renderOrder = 30;
        m.position.set(rand() * W, 1 + rand() * 3, (L.waterTop + rand() * 8) * K);
        this.petals.push({ mesh: m, vx: fly ? 0 : 0.25 + rand() * 0.3, vy: fly ? 0 : -0.35 - rand() * 0.2, ph: rand() * 6 });
        this.world.add(m);
      }

    // The people.
    this.ninja = new Actor(this.lighting, ninjaLook, this.stoneX(0), L.stoneY - NINJA_BACK, 'right');
    this.sensei = new Actor(this.lighting, senseiLook, this.stoneX(0) - 1, L.senseiY, 'up');
    this.world.add(this.ninja.group, this.sensei.group);
    this.sparkleTex = [0, 1].map((f) => pixelTexture(paintSparkle(f).toCanvas()));
    this.camX = this.ninja.x;
  }

  private flat(canvas: HTMLCanvasElement): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(canvas.width / PX, (canvas.height / PX) * K);
    geo.rotateX(-Math.PI / 2);
    const mat = this.lighting.add(new THREE.MeshBasicMaterial({ map: pixelTexture(canvas), transparent: true, alphaTest: 0.5 }));
    return new THREE.Mesh(geo, mat);
  }

  private dispose(): void {
    this.koi = [];
    this.petals = [];
    this.flag = null;
    this.sparkle = null;
    this.queue = [];
    this.hop = null;
    for (const g of [this.world, this.arcs, this.ghosts, this.fx])
      g.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material as THREE.MeshBasicMaterial;
          m.map?.dispose();
          m.dispose();
        }
      });
    this.world.clear();
    this.arcs.clear();
    this.ghosts.clear();
    this.fx.clear();
    this.effects = [];
  }

  // ------------------------------------------------------------ a challenge

  /** Show a challenge: labels, the start stone, the flag, and the ninja on the start. */
  setProblem(p: Problem): void {
    this.problem = p;
    this.stoneLooks.clear();
    this.clearArcs();
    this.clearGhosts();
    this.setFlag(p.kind === 'gap' ? p.target : null);
    this.ninja.x = this.stoneX(p.start);
    this.ninja.y = LAYOUT.stoneY - NINJA_BACK;
    this.ninja.facing = p.change < 0 ? 'left' : 'right';
    this.ninja.bodyLift = 0;
    this.ninja.sync();
    this.redrawStones();
    this.puff(this.ninja.x, this.ninja.y, 3);
  }

  /** Put the ninja back on the start stone (after a wrong landing). */
  backToStart(): void {
    if (!this.problem) return;
    this.queue = [];
    this.hop = null;
    this.ninja.bodyLift = 0;
    this.ninja.x = this.stoneX(this.problem.start);
    this.ninja.facing = this.problem.change < 0 ? 'left' : 'right';
    this.ninja.sync();
    this.clearArcs();
    this.puff(this.ninja.x, this.ninja.y, 3);
  }

  /** Make a stone glow (the worked-example hint) or show its number. */
  markStone(n: number, look: Partial<StoneLook>): void {
    this.stoneLooks.set(n, { ...(this.stoneLooks.get(n) ?? {}), ...look });
    this.redrawStones();
    if (look.glow) this.setSparkle(n);
  }

  private redrawStones(): void {
    const b = this.stonesBuf;
    const p = this.problem;
    if (!b || !this.stonesTex) return;
    b.px.fill(null);
    for (let n = 0; n <= this.lineMax; n++) {
      const extra = this.stoneLooks.get(n) ?? {};
      const look: StoneLook = {
        label: p && !isLabelled(p, n) && !extra.label ? null : String(n),
        start: p?.start === n,
        ...extra,
      };
      paintStone(b, Math.round((this.stoneX(n) - 0.5) * 16), 18, look, this.theme);
    }
    const cv = this.stonesTex.image as HTMLCanvasElement;
    const fresh = b.toCanvas();
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(fresh, 0, 0);
    this.stonesTex.needsUpdate = true;
  }

  private setFlag(n: number | null): void {
    if (this.flag) {
      this.world.remove(this.flag);
      this.flag = null;
    }
    if (n === null) return;
    // Planted at the back corner of the stone, so the ninja stands in front of it.
    this.flag = billboard(this.lighting, paintFlag().toCanvas(), this.stoneX(n) + 0.45, LAYOUT.stoneY - 0.5);
    this.world.add(this.flag);
  }

  private setSparkle(n: number): void {
    if (this.sparkle) this.fx.remove(this.sparkle);
    const geo = new THREE.PlaneGeometry(11 / PX, (11 / PX) * K);
    geo.translate(0, ((11 / PX) * K) / 2, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.sparkleTex[0], transparent: true, depthTest: false }));
    m.renderOrder = 25;
    m.position.set(this.stoneX(n), 1.5 * K, (LAYOUT.stoneY + 0.2) * K);
    this.sparkle = m;
    this.fx.add(m);
  }

  // ------------------------------------------------------------ hopping

  /**
   * Queue a hop of `dist` stones. Resolves when the ninja lands. Hops that
   * would leave the line are refused (returns false).
   */
  queueHop(dist: number): Promise<boolean> {
    const landing = this.finalStone + dist;
    if (landing < 0 || landing > this.lineMax) return Promise.resolve(false);
    return new Promise((resolve) => {
      const big = Math.abs(dist) > 1;
      const dur = this.reducedMotion ? 0.12 : big ? 0.42 + Math.abs(dist) * 0.012 : 0.26;
      this.queue.push({ dist, dur, height: this.reducedMotion ? 0 : big ? 1.6 : 0.8, resolve: () => resolve(true) });
    });
  }

  /** The stone the ninja will be on once every queued hop is done. */
  get finalStone(): number {
    const base = this.hop ? this.hop.to : this.ninjaStone;
    return base + this.queue.reduce((a, h) => a + h.dist, 0);
  }

  /** Hops drawn so far for this try (sizes, signed). */
  get hopsMade(): number[] {
    return this.arcs.children.map((c) => (c.userData.dist as number) ?? 0);
  }

  clearArcs(): void {
    this.disposeGroup(this.arcs);
  }

  clearGhosts(): void {
    this.disposeGroup(this.ghosts);
    if (this.sparkle) {
      this.fx.remove(this.sparkle);
      this.sparkle = null;
    }
  }

  private disposeGroup(g: THREE.Group): void {
    g.children.forEach((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const m = o.material as THREE.MeshBasicMaterial;
        m.map?.dispose();
        m.dispose();
      }
    });
    g.clear();
  }

  /** Draw an arc from stone a by `dist` (solid for real hops, dashed gold for hints). */
  private addArc(from: number, dist: number, ghost: boolean): void {
    const { canvas } = paintArc(dist, ghost);
    const mid = this.stoneX(from) + dist / 2;
    // Arcs stand just behind the ninja, rising from the stone tops.
    const mesh = billboard(this.lighting, canvas, mid, LAYOUT.stoneY - NINJA_BACK - (ghost ? 0.12 : 0.06), { lift: 0.12 });
    const mat = mesh.material as THREE.MeshBasicMaterial;
    if (ghost) {
      mat.transparent = true;
      mat.opacity = 0.9;
    }
    mesh.renderOrder = ghost ? 6 : 7;
    mesh.userData.dist = dist;
    (ghost ? this.ghosts : this.arcs).add(mesh);
  }

  /** Sensei's hint: dotted arcs for these hops, starting at stone `from`. */
  showGhostHops(from: number, hops: number[]): void {
    this.clearGhosts();
    let at = from;
    for (const h of hops) {
      this.addArc(at, h, true);
      at += h;
    }
  }

  // ------------------------------------------------------------ effects

  puff(x: number, y: number, n = 3): void {
    if (this.reducedMotion) return;
    for (let i = 0; i < n; i++) {
      const cv = paintPuff(6 + (i % 2) * 2).toCanvas();
      const m = billboard(this.lighting, cv, x + (i - (n - 1) / 2) * 0.35, y + 0.05);
      m.renderOrder = 12;
      (m.material as THREE.MeshBasicMaterial).transparent = true;
      this.fx.add(m);
      this.effects.push({ mesh: m, t: 0, life: 0.35, vx: (i - (n - 1) / 2) * 0.9, vy: 0.4, grow: 0.8 });
    }
  }

  /** A number that floats up from a stone (the running total, or "+10"). */
  pop(text: string, n: number, color?: string): void {
    const cv = paintPop(text, color).toCanvas();
    const m = billboard(this.lighting, cv, this.stoneX(n), LAYOUT.stoneY + 0.3, { lift: 1.9 });
    m.renderOrder = 26;
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.transparent = true;
    mat.depthTest = false;
    this.fx.add(m);
    this.effects.push({ mesh: m, t: 0, life: this.reducedMotion ? 0.9 : 0.9, vx: 0, vy: this.reducedMotion ? 0 : 0.9 });
  }

  /** Stars burst from the ninja after a clean landing. */
  celebrate(): void {
    const n = this.reducedMotion ? 0 : 10;
    for (let i = 0; i < n; i++) {
      const m = billboard(this.lighting, paintStar().toCanvas(), this.ninja.x, this.ninja.y, { lift: 1.2 });
      m.renderOrder = 27;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.transparent = true;
      mat.depthTest = false;
      this.fx.add(m);
      const a = (i / n) * Math.PI * 2;
      this.effects.push({ mesh: m, t: 0, life: 0.8, vx: Math.cos(a) * 2.4, vy: 1.6 + Math.sin(a) * 1.6 });
    }
  }

  // ------------------------------------------------------------ frame

  update(dt: number): void {
    this.time += dt;
    // start the next hop
    if (!this.hop && this.queue.length) {
      const q = this.queue.shift()!;
      const from = this.ninjaStone;
      this.hop = { ...q, t: 0, from, to: from + q.dist };
      this.ninja.facing = q.dist > 0 ? 'right' : 'left';
      this.onHopStart?.(q.dist);
    }
    if (this.hop) {
      const h = this.hop;
      h.t += dt / h.dur;
      const t = Math.min(1, h.t);
      this.ninja.x = this.stoneX(h.from) + (this.stoneX(h.to) - this.stoneX(h.from)) * t;
      this.ninja.bodyLift = 4 * h.height * t * (1 - t);
      if (t >= 1) {
        this.ninja.bodyLift = 0;
        this.ninja.x = this.stoneX(h.to);
        this.addArc(h.from, h.dist, false);
        this.hop = null;
        if (!this.reducedMotion) this.squashT = 0.14;
        this.puff(this.ninja.x, this.ninja.y, 2);
        this.onLand?.(h.to);
        h.resolve();
      }
    }
    if (this.squashT > 0) {
      this.squashT = Math.max(0, this.squashT - dt);
      this.ninja.squash = 1 - Math.sin((this.squashT / 0.14) * Math.PI) * 0.18;
    } else this.ninja.squash = 1;
    this.ninja.update(dt, this.reducedMotion);

    // Sensei strolls along the bank to stay near the ninja.
    const want = Math.max(1.2, Math.min(this.widthTiles - 1.2, this.ninja.x - 1.4));
    const d = want - this.sensei.x;
    if (Math.abs(d) > 2.2 || (this.sensei.moving && Math.abs(d) > 0.1)) {
      this.sensei.moving = true;
      this.sensei.facing = d > 0 ? 'right' : 'left';
      this.sensei.x += Math.sign(d) * Math.min(Math.abs(d), dt * (Math.abs(d) > 6 ? 9 : 3.2));
    } else {
      this.sensei.moving = false;
      this.sensei.facing = 'up';
    }
    this.sensei.update(dt, this.reducedMotion);

    // water flows, koi swim, petals drift
    if (this.waterTex && !this.reducedMotion) this.waterTex.offset.x = Math.floor(this.time * 6) / 32;
    const W = this.widthTiles;
    for (const k of this.koi) {
      if (this.reducedMotion) break;
      k.t += dt;
      k.mesh.position.x += k.speed * dt;
      if (k.mesh.position.x > W + 1) k.mesh.position.x = -1;
      if (k.mesh.position.x < -1) k.mesh.position.x = W + 1;
      (k.mesh.material as THREE.MeshBasicMaterial).map = k.frames[Math.floor(k.t * 4) % 2];
    }
    for (const p of this.petals) {
      p.mesh.visible = !this.reducedMotion;
      if (this.reducedMotion) continue;
      p.ph += dt;
      if (p.vx === 0) {
        // fireflies wander and blink
        p.mesh.position.x += Math.sin(p.ph * 0.7) * dt * 0.4;
        p.mesh.position.y = (1.2 + Math.sin(p.ph * 1.3) * 0.6) * K;
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(p.ph * 3) * 0.5;
      } else {
        p.mesh.position.x += (p.vx + Math.sin(p.ph * 2) * 0.2) * dt;
        p.mesh.position.y += p.vy * dt;
        if (p.mesh.position.y < 0.05) {
          p.mesh.position.y = 3 + Math.random() * 1.5;
          p.mesh.position.x = this.camX - 12 + Math.random() * 20;
        }
      }
    }
    // sparkle on a hinted stone
    if (this.sparkle) {
      (this.sparkle.material as THREE.MeshBasicMaterial).map = this.sparkleTex[Math.floor(this.time * 3) % 2];
      if (!this.reducedMotion) this.sparkle.position.y = (1.5 + Math.round(Math.sin(this.time * 4) * 2) / PX) * K;
    }
    // short-lived effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.t += dt;
      e.mesh.position.x += e.vx * dt;
      e.mesh.position.y += e.vy * dt * K;
      if (e.grow) e.mesh.scale.setScalar(1 + (e.t / e.life) * e.grow);
      (e.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - Math.pow(e.t / e.life, 2));
      if (e.t >= e.life) {
        this.fx.remove(e.mesh);
        e.mesh.geometry.dispose();
        const m = e.mesh.material as THREE.MeshBasicMaterial;
        m.map?.dispose();
        m.dispose();
        this.effects.splice(i, 1);
      }
    }

    // camera: follow the ninja smoothly, with the stones a little below center
    this.camX += (this.ninja.x - this.camX) * Math.min(1, dt * (this.reducedMotion ? 20 : 5));
    this.r.lookAt(this.camX, LAYOUT.stoneY - this.cameraLift);
  }

  /** Raise the view a little when the HUD covers the top of a phone screen. */
  cameraLift = 0;

  /** Called when a hop starts (for sounds). */
  onHopStart: ((dist: number) => void) | null = null;

  /** Which stone (if any) is under a screen point. */
  stoneAt(cx: number, cy: number): number | null {
    const t = this.r.screenToTile(cx, cy);
    if (!t) return null;
    if (Math.abs(t.y - LAYOUT.stoneY) > 1.1) return null;
    const n = Math.round(t.x - LAYOUT.margin - 0.5);
    return n >= 0 && n <= this.lineMax ? n : null;
  }

  /** Screen position (CSS pixels in the game area) of a stone's center. */
  stoneScreen(n: number): { x: number; y: number } {
    const p = this.r.project(new THREE.Vector3(this.stoneX(n), 0, LAYOUT.stoneY * K));
    return { x: p.x, y: p.y };
  }

  render(): void {
    this.r.render(this.scene);
  }
}
