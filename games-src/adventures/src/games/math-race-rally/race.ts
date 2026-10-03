import * as THREE from 'three';
import { mulberry32 } from '../../kit/core/rng';
import { paintCar, paintFinish, paintGate, paintScenery, paintSky, THEMES, type Theme } from './art';
import type { CarLook } from './cosmetics';
import { speedFor } from './problems';
import { EDGE, LANES, ROAD_W, Track, laneOf } from './track';

/**
 * The race, seen from behind the car. Three.js draws the road in a small
 * canvas (about 230 pixels tall) that the browser scales up by a whole number
 * with crisp pixels, so it looks like a classic pixel-art racer.
 *
 * This class owns the road, the scenery, the two cars and the answer gates,
 * and it moves the cars. The game decides what the questions are and what
 * happens at each gate (see game.ts).
 */

const tex = (cv: HTMLCanvasElement): THREE.CanvasTexture => {
  const t = new THREE.CanvasTexture(cv);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export interface Car {
  s: number;
  /** -1 (left edge) to 1 (right edge). */
  x: number;
  speed: number;
}

export interface Gate {
  s: number;
  values: number[];
  mesh: THREE.Mesh;
  passed: boolean;
}

export type RaceEvent = { type: 'gate'; gate: Gate; lane: number } | { type: 'finish' } | { type: 'rival-finish' } | { type: 'bump' } | { type: 'pass'; ahead: boolean };

export class RaceScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.1, 420);
  track!: Track;
  theme: Theme = 'hills';
  readonly player: Car & { level: number; boostT: number; slowT: number; lean: number; targetLane: number | null; bumpT: number } = { s: 0, x: 0, speed: 0, level: 2, boostT: 0, slowT: 0, lean: 0, targetLane: null, bumpT: 0 };
  readonly rival: Car & { finished: boolean } = { s: 0, x: 0.5, speed: 0, finished: false };
  rivalSpeed = speedFor(3.6);
  finishS = 0;
  running = false;
  finished = false;
  reducedMotion = false;
  scale = 1;
  private sky!: THREE.Mesh;
  private playerSprite!: THREE.Sprite;
  private rivalSprite!: THREE.Sprite;
  private playerLook!: CarLook;
  private carTex = new Map<string, THREE.CanvasTexture>();
  private gates: Gate[] = [];
  private world = new THREE.Group();
  private time = 0;
  private wasAhead = false;
  private fovKick = 0;
  private shake = 0;

  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'default' });
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'game-canvas rr-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(this.canvas);
    this.scene.add(this.world);
    this.scene.add(this.camera);
    this.resize();
  }

  /** Pick a whole-number scale so the picture is about 230 pixels tall. */
  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const cssW = this.host.clientWidth || window.innerWidth;
    const cssH = this.host.clientHeight || window.innerHeight;
    const devW = Math.round(cssW * dpr);
    const devH = Math.round(cssH * dpr);
    const s = Math.max(1, Math.round(Math.min(devH / 230, devW / 300)));
    this.scale = s;
    const w = Math.ceil(devW / s);
    const h = Math.ceil(devH / s);
    this.renderer.setSize(w, h, false);
    Object.assign(this.canvas.style, { width: `${(w * s) / dpr}px`, height: `${(h * s) / dpr}px`, left: '0px', top: '0px' });
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.sky) this.fitSky();
  }

  // ------------------------------------------------------------ building

  build(opts: { theme: Theme; seed: number; finishS: number; playerLook: CarLook; rivalLook: CarLook; bendiness?: number }): void {
    this.clear();
    this.theme = opts.theme;
    const c = THEMES[opts.theme];
    this.track = new Track(opts.seed, Math.ceil(opts.finishS) + 80, { bendiness: opts.bendiness ?? (opts.theme === 'desert' ? 1.2 : 1), hilliness: opts.theme === 'seaside' ? 0.5 : 1 });
    this.finishS = opts.finishS;
    this.scene.fog = new THREE.Fog(c.fog, 60, 230);
    this.renderer.setClearColor(new THREE.Color(c.fog), 1);
    this.world.add(this.roadMesh());
    this.addScenery(opts.seed);
    this.addBanner(4);
    this.addBanner(opts.finishS);
    // sky: a big picture that rides along with the camera
    const skyTex = tex(paintSky(opts.theme).toCanvas());
    skyTex.wrapS = THREE.RepeatWrapping;
    this.sky = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: skyTex, fog: false, depthWrite: false }));
    this.sky.renderOrder = -10;
    this.camera.add(this.sky);
    this.fitSky();
    // cars
    this.playerLook = opts.playerLook;
    this.playerSprite = this.carSprite(this.carTexture(opts.playerLook, 0, false));
    this.rivalSprite = this.carSprite(this.carTexture(opts.rivalLook, 0, false, '#ffe08a'));
    this.world.add(this.playerSprite, this.rivalSprite);
    Object.assign(this.player, { s: 2, x: LANES[1], speed: 0, level: 2, boostT: 0, slowT: 0, lean: 0, targetLane: null, bumpT: 0 });
    Object.assign(this.rival, { s: 2.6, x: LANES[2], speed: 0, finished: false });
    this.running = false;
    this.finished = false;
    this.wasAhead = false;
    this.updateCamera(0);
  }

  private clear(): void {
    for (const g of this.gates) g.mesh.parent?.remove(g.mesh);
    this.gates = [];
    this.world.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
    this.world.clear();
    if (this.sky) this.camera.remove(this.sky);
  }

  private fitSky(): void {
    const d = 380;
    const h = 2 * d * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const w = h * this.camera.aspect;
    this.sky.scale.set(w * 1.02, h * 0.62, 1);
    this.sky.position.set(0, h * 0.2, -d);
    const map = (this.sky.material as THREE.MeshBasicMaterial).map!;
    map.repeat.set(Math.max(0.5, this.camera.aspect * 0.45), 1);
  }

  /** The road, rumble strips, grass and the land beyond, as flat-colored quads (one strip per segment). */
  private roadMesh(): THREE.Mesh {
    const c = THEMES[this.theme];
    const pts = this.track.points;
    const half = ROAD_W / 2;
    const bands: Array<{ a: number; b: number; color: (stripe: number) => string; lift?: number }> = [
      { a: -120, b: -18, color: () => c.far },
      { a: -18, b: -half - 0.7, color: (st) => c.grass[st] },
      { a: -half - 0.7, b: -half, color: (st) => c.rumble[st] },
      { a: -half, b: half, color: (st) => c.road[st] },
      { a: half, b: half + 0.7, color: (st) => c.rumble[st] },
      { a: half + 0.7, b: 18, color: (st) => c.grass[st] },
      { a: 18, b: 120, color: () => c.far },
    ];
    const pos: number[] = [];
    const col: number[] = [];
    const tmp = new THREE.Color();
    const quad = (i: number, a: number, b: number, color: string, lift = 0) => {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const r0 = [Math.cos(p0.heading), Math.sin(p0.heading)];
      const r1 = [Math.cos(p1.heading), Math.sin(p1.heading)];
      const v = (p: typeof p0, rv: number[], off: number) => [p.x + rv[0] * off, p.y + lift, p.z + rv[1] * off];
      const A = v(p0, r0, a);
      const B = v(p0, r0, b);
      const C = v(p1, r1, b);
      const D = v(p1, r1, a);
      pos.push(...A, ...B, ...C, ...A, ...C, ...D);
      tmp.set(color).convertSRGBToLinear();
      for (let k = 0; k < 6; k++) col.push(tmp.r, tmp.g, tmp.b);
    };
    for (let i = 0; i < pts.length - 1; i++) {
      const st = Math.floor(i / 3) % 2;
      for (const band of bands) quad(i, band.a, band.b, band.color(st));
      // dashed lane lines
      if (st === 0) {
        quad(i, -ROAD_W / 6 - 0.09, -ROAD_W / 6 + 0.09, c.lane, 0.01);
        quad(i, ROAD_W / 6 - 0.09, ROAD_W / 6 + 0.09, c.lane, 0.01);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  }

  private addScenery(seed: number): void {
    const r = mulberry32(seed + 99);
    const textures = [0, 1, 2, 3, 4, 5].map((v) => {
      const b = paintScenery(this.theme, v);
      return { t: tex(b.toCanvas()), w: b.w, h: b.h };
    });
    const unit = this.theme === 'city' ? 0.13 : 0.11;
    for (let s = 8; s < this.track.points.length - 2; s += 3 + Math.floor(r() * 4)) {
      for (const side of [-1, 1]) {
        if (r() < 0.35) continue;
        const v = textures[Math.floor(r() * textures.length)];
        const mat = new THREE.SpriteMaterial({ map: v.t, alphaTest: 0.5 });
        const sp = new THREE.Sprite(mat);
        sp.center.set(0.5, 0);
        sp.scale.set(v.w * unit, v.h * unit, 1);
        const dist = ROAD_W / 2 + 1.6 + r() * (this.theme === 'city' ? 4 : 9);
        const p = this.track.at(s);
        sp.position.set(p.x + Math.cos(p.heading) * dist * side, p.y, p.z + Math.sin(p.heading) * dist * side);
        this.world.add(sp);
      }
    }
  }

  /** A banner across the road (start and finish). */
  private addBanner(s: number): void {
    const b = paintFinish();
    const w = ROAD_W + 1.6;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, (w * b.h) / b.w), new THREE.MeshBasicMaterial({ map: tex(b.toCanvas()), alphaTest: 0.5, side: THREE.DoubleSide }));
    this.placeAcross(m, s, (w * b.h) / b.w);
    this.world.add(m);
  }

  private placeAcross(m: THREE.Mesh, s: number, height: number): void {
    const p = this.track.at(s);
    m.position.set(p.x, p.y + height / 2, p.z);
    m.rotation.y = -p.heading;
  }

  private carTexture(look: CarLook, lean: number, boost: boolean, helmet?: string): THREE.CanvasTexture {
    const key = `${JSON.stringify(look)}|${lean}|${boost}|${helmet ?? ''}`;
    let t = this.carTex.get(key);
    if (!t) {
      t = tex(paintCar(look, { lean, boost, helmet }).toCanvas());
      this.carTex.set(key, t);
    }
    return t;
  }

  private carSprite(t: THREE.CanvasTexture): THREE.Sprite {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, alphaTest: 0.5 }));
    sp.center.set(0.5, 0.06);
    sp.scale.set(3.3, (3.3 * 34) / 48, 1);
    return sp;
  }

  setPlayerLook(look: CarLook): void {
    this.playerLook = look;
  }

  // ------------------------------------------------------------ gates

  addGate(s: number, values: number[]): Gate {
    const b = paintGate(values);
    const w = ROAD_W + 1.2;
    const h = (w * b.h) / b.w;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(b.toCanvas()), alphaTest: 0.5, side: THREE.DoubleSide }));
    this.placeAcross(m, s, h);
    // high enough that the camera (2.5 above the road) passes under the panels
    m.position.y += 2.1;
    this.world.add(m);
    const g: Gate = { s, values, mesh: m, passed: false };
    this.gates.push(g);
    return g;
  }

  /** Repaint a gate (the picked panel turns green or red; a hint outlines the right one). */
  paintGateState(g: Gate, opts: { picked?: number; correct?: number; hint?: number }): void {
    const mat = g.mesh.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = tex(paintGate(g.values, opts).toCanvas());
    mat.needsUpdate = true;
  }

  removeOldGates(): void {
    this.gates = this.gates.filter((g) => {
      if (g.passed && g.s < this.player.s - 12) {
        g.mesh.parent?.remove(g.mesh);
        g.mesh.geometry.dispose();
        return false;
      }
      return true;
    });
  }

  // ------------------------------------------------------------ the race

  /** A right answer: up a speed level, with a burst of boost. */
  boost(level: number): void {
    this.player.level = level;
    this.player.boostT = 1.3;
    this.player.slowT = 0;
    if (!this.reducedMotion) this.fovKick = 8;
  }

  /** A wrong answer: down a level and a short wobble (the car never stops). */
  slow(level: number): void {
    this.player.level = level;
    this.player.slowT = 1.0;
    this.player.boostT = 0;
    if (!this.reducedMotion) this.shake = 0.35;
  }

  /**
   * Move everything. `steer` is -1..1 from the keys or buttons. Returns what
   * happened this frame (gates passed, the finish, bumps).
   */
  update(dt: number, steer: number): RaceEvent[] {
    const ev: RaceEvent[] = [];
    this.time += dt;
    const p = this.player;
    if (this.running) {
      // speed eases toward the level's speed, with boost and slow bursts
      p.boostT = Math.max(0, p.boostT - dt);
      p.slowT = Math.max(0, p.slowT - dt);
      p.bumpT = Math.max(0, p.bumpT - dt);
      const offRoad = Math.abs(p.x) > 0.97;
      let target = speedFor(p.level) * (p.boostT > 0 ? 1.3 : 1) * (p.slowT > 0 ? 0.62 : 1) * (offRoad ? 0.85 : 1);
      if (this.finished) target = speedFor(2);
      p.speed += (target - p.speed) * Math.min(1, dt * (p.boostT > 0 ? 3 : 1.6));
      // steering: the keys, or gliding to a chosen lane
      let sx = steer;
      if (steer !== 0) p.targetLane = null;
      else if (p.targetLane !== null) {
        const d = LANES[p.targetLane] - p.x;
        sx = Math.abs(d) < 0.03 ? 0 : Math.max(-1, Math.min(1, d * 5));
      }
      const pt = this.track.at(p.s);
      // bends push the car outward a little, so steering matters
      p.x += (sx * 1.7 - pt.curve * p.speed * 0.55) * dt;
      p.x = Math.max(-1.05, Math.min(1.05, p.x));
      p.lean += ((sx > 0.2 ? 1 : sx < -0.2 ? -1 : 0) - p.lean) * Math.min(1, dt * 10);
      const s0 = p.s;
      p.s += p.speed * dt;
      for (const g of this.gates)
        if (!g.passed && s0 < g.s && p.s >= g.s) {
          g.passed = true;
          ev.push({ type: 'gate', gate: g, lane: laneOf(p.x) });
        }
      if (!this.finished && s0 < this.finishS && p.s >= this.finishS) {
        this.finished = true;
        ev.push({ type: 'finish' });
      }
      // the rival: a steady pace, easing up a little when far ahead (so races stay close)
      const r = this.rival;
      const gapAhead = r.s - p.s;
      const rTarget = this.rivalSpeed * (gapAhead > 45 ? 0.9 : gapAhead < -45 ? 1.08 : 1) * (r.finished ? 0.6 : 1);
      r.speed += (rTarget - r.speed) * Math.min(1, dt * 1.2);
      const rs0 = r.s;
      r.s += r.speed * dt;
      // it weaves gently between lanes, and moves over rather than crash into you
      let rx = Math.sin(this.time * 0.35) * 0.62;
      if (Math.abs(r.s - p.s) < 3 && Math.abs(rx - p.x) < 0.5) rx = p.x > 0 ? p.x - 0.6 : p.x + 0.6;
      r.x += (rx - r.x) * Math.min(1, dt * 1.5);
      if (!r.finished && rs0 < this.finishS && r.s >= this.finishS) {
        r.finished = true;
        ev.push({ type: 'rival-finish' });
      }
      // bump into the rival: a small slow-down and a nudge
      if (p.bumpT === 0 && Math.abs(r.s - p.s) < 1.1 && Math.abs(r.x - p.x) < 0.32) {
        p.bumpT = 1;
        p.speed *= 0.8;
        p.x += p.x < r.x ? -0.25 : 0.25;
        if (!this.reducedMotion) this.shake = 0.25;
        ev.push({ type: 'bump' });
      }
      const ahead = p.s > r.s;
      if (ahead !== this.wasAhead && this.time > 2) ev.push({ type: 'pass', ahead });
      this.wasAhead = ahead;
    }
    this.syncSprites();
    this.updateCamera(dt);
    return ev;
  }

  private syncSprites(): void {
    const p = this.player;
    const pp = this.track.pos(p.s, p.x);
    this.playerSprite.position.set(pp.x, pp.y, pp.z);
    const lean = Math.round(p.lean);
    (this.playerSprite.material as THREE.SpriteMaterial).map = this.carTexture(this.playerLook, lean, p.boostT > 0);
    this.playerSprite.material.rotation = this.reducedMotion ? 0 : -p.lean * 0.04 + (p.slowT > 0 ? Math.sin(this.time * 30) * 0.05 : 0);
    const r = this.rival;
    const rp = this.track.pos(r.s, r.x);
    this.rivalSprite.position.set(rp.x, rp.y, rp.z);
  }

  private updateCamera(dt: number): void {
    const p = this.player;
    // a tall phone screen is narrow: pull the camera back and follow the car sideways more
    const portrait = this.camera.aspect < 1;
    const back = this.track.pos(Math.max(0, p.s - (portrait ? 5.2 : 3.6)), p.x * (portrait ? 0.85 : 0.55), portrait ? 3.1 : 2.5);
    const ahead = this.track.pos(p.s + 9, p.x * (portrait ? 0.7 : 0.3), 0.6);
    this.shake = Math.max(0, this.shake - dt);
    const sh = this.shake > 0 ? (Math.sin(this.time * 70) * this.shake) / 3 : 0;
    this.camera.position.set(back.x + sh, back.y, back.z);
    this.camera.lookAt(ahead.x, ahead.y, ahead.z);
    this.fovKick = Math.max(0, this.fovKick - dt * 10);
    const fov = (portrait ? 74 : 62) + this.fovKick + (p.boostT > 0 && !this.reducedMotion ? 3 : 0);
    if (Math.abs(this.camera.fov - fov) > 0.05) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.fitSky();
    }
    // the sky slides as the road turns
    const map = (this.sky.material as THREE.MeshBasicMaterial).map!;
    map.offset.x = -this.track.at(p.s).heading * 0.35;
  }

  /** Screen position (CSS pixels) of a point on the road, for floating text. */
  project(s: number, lateral: number, up: number): { x: number; y: number; visible: boolean } {
    const w = this.track.pos(s, lateral, up);
    const v = new THREE.Vector3(w.x, w.y, w.z).project(this.camera);
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    return { x: ((v.x + 1) / 2) * cw, y: ((1 - v.y) / 2) * ch, visible: v.z < 1 && v.z > -1 };
  }

  /** How far through the race each car is (0-1). */
  progress(): { player: number; rival: number } {
    return { player: Math.min(1, this.player.s / this.finishS), rival: Math.min(1, this.rival.s / this.finishS) };
  }

  /** Gates still ahead of the player. */
  get openGates(): Gate[] {
    return this.gates.filter((g) => !g.passed);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}

export { EDGE, LANES };
