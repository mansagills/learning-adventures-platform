import * as THREE from 'three';
import { lookFromAppearance, type Appearance, type CharacterLook } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { paintSparkle } from '../../kit/art/sparkle';
import { mulberry32 } from '../../kit/core/rng';
import { K, PX, type PixelRenderer } from '../../kit/render/pixelRenderer';
import { Actor } from '../../kit/world/actor';
import { Lighting, billboard, glowSprite, pixelTexture } from '../../kit/world/sceneKit';
import { paintBunting, paintChalkboard, paintItem, paintLampPost, paintMood, paintSquare, paintStall, paintStreet } from './art';

export const MAP = { w: 40, h: 26 };
const STALL = { x: 20, y: 9 };
/** Where the line forms: the first spot is at the counter. */
const QUEUE = [
  { x: 20, y: 10.5 },
  { x: 18.3, y: 11.7 },
  { x: 16.6, y: 12.5 },
  { x: 14.9, y: 13.1 },
  { x: 13.2, y: 13.5 },
];
const ENTER = { x: 1, y: 13.8 };
const EXIT = { x: 39, y: 12.8 };

export type CustomerState = 'arriving' | 'waiting' | 'leaving';

export interface Customer {
  id: number;
  actor: Actor;
  state: CustomerState;
  /** Place in line (0 = at the counter). */
  spot: number;
  /** Seconds of patience left while waiting in line. */
  patience: number;
  patienceMax: number;
  mood: THREE.Mesh;
  moodLevel: number;
  carry: THREE.Mesh | null;
  happy: boolean;
}

/**
 * The market square: the player's stand in the middle, shops behind, and a
 * line of customers. The rules (orders, money, patience running out) live
 * in game.ts; this file draws and moves things.
 */
export class MarketWorld {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  player!: Actor;
  readonly customers: Customer[] = [];
  private stall!: THREE.Mesh;
  private sign: THREE.Mesh | null = null;
  private lightGlows: THREE.Mesh[] = [];
  private moodTex: THREE.CanvasTexture[] = [];
  private sparkleTex: THREE.CanvasTexture[] = [];
  private effects: Array<{ mesh: THREE.Mesh; t: number; life: number }> = [];
  private pool: Actor[] = [];
  private nextId = 1;
  private rnd = mulberry32(17);
  private time = 0;
  reducedMotion = false;
  /** Camera offset in tiles, so the stand sits beside (or above) the till panel. */
  camOffset = { x: 0, y: 0 };

  constructor(private readonly r: PixelRenderer) {}

  build(playerLook: CharacterLook, owned: string[]): void {
    const L = this.lighting;
    this.r.setBounds(MAP.w, MAP.h);
    this.r.renderer.setClearColor(new THREE.Color('#8fd0ee'), 1);
    const ground = paintSquare(MAP.w, MAP.h);
    const gGeo = new THREE.PlaneGeometry(MAP.w, MAP.h * K);
    gGeo.rotateX(-Math.PI / 2);
    const g = new THREE.Mesh(gGeo, L.add(new THREE.MeshBasicMaterial({ map: pixelTexture(ground) })));
    g.position.set(MAP.w / 2, 0, (MAP.h / 2) * K);
    this.scene.add(g);
    this.scene.add(billboard(L, paintStreet(MAP.w), MAP.w / 2, 4));
    this.scene.add(billboard(L, paintBunting(MAP.w).toCanvas(), MAP.w / 2, 4.2, { lift: 3.6 }));
    for (const x of [8, 32, 13, 27]) {
      this.scene.add(billboard(L, paintLampPost().toCanvas(), x, x === 13 || x === 27 ? 15.5 : 7));
      this.scene.add(glowSprite(L, 32, '#ffe7a3', x, x === 13 || x === 27 ? 15.55 : 7.05, 2.4, 0.6));
    }
    // neighbouring stands (just for looks)
    this.scene.add(billboard(L, paintStall({ owned: ['awning', 'water', 'lemonade', 'punch'] }).toCanvas(), 6, 8.6));
    this.scene.add(billboard(L, paintStall({ owned: ['awning', 'pretzel', 'popcorn', 'plants'] }).toCanvas(), 34, 8.6));

    // the player behind the counter
    this.player = new Actor(L, playerLook, STALL.x, STALL.y - 2.6, 'down');
    this.scene.add(this.player.group);
    this.stall = billboard(L, paintStall({ owned }).toCanvas(), STALL.x, STALL.y);
    this.scene.add(this.stall);
    this.refreshStall(owned);

    this.moodTex = [0, 1, 2].map((m) => pixelTexture(paintMood(m as 0 | 1 | 2).toCanvas()));
    this.sparkleTex = [0, 1, 2].map((f) => pixelTexture(paintSparkle(f).toCanvas()));
    this.lighting.set([1, 1, 1], 0);
  }

  /** Repaint the stand after an upgrade (and add the sign or the evening glow of the lights). */
  refreshStall(owned: string[]): void {
    const mat = this.stall.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = pixelTexture(paintStall({ owned }).toCanvas());
    mat.needsUpdate = true;
    if (owned.includes('sign') && !this.sign) {
      this.sign = billboard(this.lighting, paintChalkboard().toCanvas(), STALL.x + 5, STALL.y + 0.6);
      this.scene.add(this.sign);
    }
    if (owned.includes('lights') && !this.lightGlows.length) {
      for (const dx of [-2.4, 0, 2.4]) {
        const gl = glowSprite(this.lighting, 28, '#ffe08a', STALL.x + dx, STALL.y + 0.02, 3.3, 0.7);
        this.lightGlows.push(gl);
        this.scene.add(gl);
      }
    }
  }

  /** The day gets later: a warm evening tint (the string lights glow). */
  setEvening(t: number): void {
    const k = Math.max(0, Math.min(1, t)) * 0.45;
    this.lighting.set([1 - k * 0.25, 1 - k * 0.35, 1 - k * 0.15], k);
    this.r.renderer.setClearColor(new THREE.Color().lerpColors(new THREE.Color('#8fd0ee'), new THREE.Color('#f2a88a'), k * 1.6), 1);
  }

  private randomLook(): CharacterLook {
    const pick = <T>(a: readonly T[]) => a[Math.floor(this.rnd() * a.length)];
    const a: Appearance = {
      body: this.rnd() < 0.5 ? 'girl' : 'boy',
      skin: pick(SKIN_TONES).id,
      hairStyle: pick(HAIR_STYLES).id,
      hairColor: pick(HAIR_COLORS).id,
      outfit: pick(OUTFIT_COLORS).id,
      accessory: this.rnd() < 0.55 ? 'none' : pick(ACCESSORIES).id,
    };
    const look = lookFromAppearance(a);
    if (this.rnd() < 0.3) look.build = 'adult';
    return look;
  }

  /** A new customer walks in from the left and joins the end of the line. */
  addCustomer(patience: number): Customer {
    let actor = this.pool.pop();
    if (actor) {
      actor.setLook(this.randomLook());
      actor.setVisible(true);
    } else {
      actor = new Actor(this.lighting, this.randomLook(), ENTER.x, ENTER.y, 'right');
      this.scene.add(actor.group);
    }
    actor.x = ENTER.x;
    actor.y = ENTER.y;
    const geo = new THREE.PlaneGeometry(11 / PX, (11 / PX) * K);
    const mood = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.moodTex[2], transparent: true, alphaTest: 0.5 }));
    mood.position.set(0, 1.95 * K, 0.05);
    mood.visible = false;
    actor.group.add(mood);
    const c: Customer = { id: this.nextId++, actor, state: 'arriving', spot: this.customers.filter((x) => x.state !== 'leaving').length, patience, patienceMax: patience, mood, moodLevel: 2, carry: null, happy: true };
    this.customers.push(c);
    return c;
  }

  /** The customer at the counter (if they have arrived). */
  get front(): Customer | null {
    return this.customers.find((c) => c.spot === 0 && c.state === 'waiting') ?? null;
  }

  get waiting(): Customer[] {
    return this.customers.filter((c) => c.state !== 'leaving');
  }

  /** Send a customer away (with what they bought, or empty-handed), and move the line up. */
  leave(c: Customer, itemId: string | null, happy: boolean): void {
    c.state = 'leaving';
    c.happy = happy;
    c.mood.visible = true;
    (c.mood.material as THREE.MeshBasicMaterial).map = this.moodTex[happy ? 2 : 0];
    if (itemId) {
      const cv = paintItem(itemId).toCanvas();
      const m = billboard(this.lighting, cv, 0.35, 0.1, { lift: 0.55 });
      c.actor.group.add(m);
      c.carry = m;
    }
    const left = this.customers.filter((x) => x.state !== 'leaving').sort((a, b) => a.spot - b.spot);
    left.forEach((x, i) => (x.spot = i));
    if (happy) this.sparkle(c.actor.x, c.actor.y);
  }

  sparkle(x: number, y: number): void {
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.PlaneGeometry(9 / PX, (9 / PX) * K);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.sparkleTex[0], transparent: true, depthWrite: false }));
      mesh.rotation.x = -Math.PI / 4;
      mesh.position.set(x + (this.rnd() - 0.5) * 1.2, (1.2 + this.rnd()) * K, y * K + 0.3);
      mesh.renderOrder = 8;
      this.scene.add(mesh);
      this.effects.push({ mesh, t: -i * 0.07, life: 0.5 });
    }
  }

  update(dt: number, drainPatience: boolean): Customer[] {
    this.time += dt;
    const ranOut: Customer[] = [];
    for (const c of [...this.customers]) {
      const a = c.actor;
      let tx: number;
      let ty: number;
      if (c.state === 'leaving') {
        tx = EXIT.x;
        ty = EXIT.y;
      } else {
        const q = QUEUE[Math.min(c.spot, QUEUE.length - 1)];
        tx = q.x - (c.spot >= QUEUE.length ? (c.spot - QUEUE.length + 1) * 1.5 : 0);
        ty = q.y;
      }
      const dx = tx - a.x;
      const dy = ty - a.y;
      const d = Math.hypot(dx, dy);
      const speed = c.state === 'leaving' ? 3.6 : 3;
      if (d > 0.05) {
        const step = Math.min(d, speed * dt);
        a.x += (dx / d) * step;
        a.y += (dy / d) * step;
        a.moving = true;
        a.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      } else {
        a.moving = false;
        if (c.state === 'arriving') c.state = 'waiting';
        if (c.state === 'waiting') a.facing = 'up';
      }
      if (c.state === 'leaving' && a.x > MAP.w - 1.5) {
        a.setVisible(false);
        a.group.remove(c.mood);
        if (c.carry) a.group.remove(c.carry);
        this.pool.push(a);
        this.customers.splice(this.customers.indexOf(c), 1);
        continue;
      }
      // patience runs down only for people waiting in line (not the one being served)
      if (c.state !== 'leaving' && drainPatience && c.spot > 0) {
        c.patience -= dt;
        if (c.patience <= 0) ranOut.push(c);
      }
      if (c.state !== 'leaving') {
        const f = c.patience / c.patienceMax;
        const lvl = f > 0.55 ? 2 : f > 0.25 ? 1 : 0;
        c.mood.visible = c.spot > 0 && f < 0.85;
        if (lvl !== c.moodLevel) {
          c.moodLevel = lvl;
          (c.mood.material as THREE.MeshBasicMaterial).map = this.moodTex[lvl];
        }
      }
      a.update(dt, this.reducedMotion);
    }
    this.player.update(dt, this.reducedMotion);
    for (const e of [...this.effects]) {
      e.t += dt;
      e.mesh.visible = e.t >= 0;
      if (e.t < 0) continue;
      (e.mesh.material as THREE.MeshBasicMaterial).map = this.sparkleTex[Math.min(2, Math.floor((e.t / e.life) * 3))];
      e.mesh.position.y += dt * 0.8;
      if (e.t >= e.life) {
        this.scene.remove(e.mesh);
        this.effects.splice(this.effects.indexOf(e), 1);
      }
    }
    this.r.lookAt(STALL.x + this.camOffset.x, STALL.y - 0.4 + this.camOffset.y, 0.15);
    return ranOut;
  }

  screenOf(x: number, y: number, lift = 0): { x: number; y: number; visible: boolean } {
    return this.r.project(new THREE.Vector3(x, lift * K, y * K));
  }

  /** Where the front customer's order bubble goes. */
  counterPoint(): { x: number; y: number } {
    return { x: QUEUE[0].x, y: QUEUE[0].y };
  }

  clearCustomers(): void {
    for (const c of [...this.customers]) {
      c.actor.setVisible(false);
      c.actor.group.remove(c.mood);
      if (c.carry) c.actor.group.remove(c.carry);
      this.pool.push(c.actor);
    }
    this.customers.length = 0;
  }

  render(): void {
    this.r.render(this.scene);
  }
}
