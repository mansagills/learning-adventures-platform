import * as THREE from 'three';
import { PixelBuffer } from '../art/pixel';
import { K } from '../render/pixelRenderer';
import { pixelTexture } from '../world/sceneKit';
import { paintHero, type Dir16, type Look16 } from './hero16';
import { Paint, ramp } from './shade';
import { shadow } from './stage';
import type { SceneCtx } from './types';

/** A gold bubble over a character: "!" (talk to me) or "?" (come back to me). */
export type Marker16 = 'new' | 'turnin' | null;

const DIRS: Dir16[] = ['down', 'left', 'right', 'up'];
/** The standing frame (both feet down) and the four walking frames. */
const STAND = 1;

/**
 * A walking 16-bit character for the new worlds (the player or a person in
 * the world), the same job as the kit's Actor in Sunny Town. Positions are in
 * tiles; the sprite is painted at the world's own pixel size (`u` = px / 16,
 * so 24 px per tile gives a 24x36 child).
 */
export class Walker16 {
  readonly group = new THREE.Group();
  readonly mesh: THREE.Mesh;
  private readonly mat: THREE.MeshBasicMaterial;
  private frames = new Map<string, THREE.CanvasTexture>();
  private marker: THREE.Mesh | null = null;
  private markerKind: Marker16 = null;
  private markerBase = 0;
  private anim = 0;
  private idleT = Math.random() * 10;
  private blinkT = 2 + Math.random() * 3;
  private stepCallback: (() => void) | null = null;
  private lastStep = -1;
  private look: Look16;
  x: number;
  y: number;
  facing: Dir16;
  moving = false;
  /** Height of a hop in tiles (the shadow stays on the ground). */
  bodyLift = 0;

  constructor(
    private readonly ctx: SceneCtx,
    look: Look16,
    x: number,
    y: number,
    facing: Dir16 = 'down',
  ) {
    this.look = look;
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.mat = ctx.lighting.add(new THREE.MeshBasicMaterial({ alphaTest: 0.5 }));
    const first = this.tex(facing, STAND, false);
    const w = first.image.width / ctx.px;
    const hgt = (first.image.height / ctx.px) * K;
    const geo = new THREE.PlaneGeometry(w, hgt);
    geo.translate(0, hgt / 2, 0);
    this.mesh = new THREE.Mesh(geo, this.mat);
    const sh = shadow(ctx.px, Math.min(1.0, w * 0.8));
    sh.position.y = 0.015;
    this.group.add(sh, this.mesh);
    this.show(facing, STAND, false);
    this.sync();
  }

  /** Change how the character looks (for example after the player customizes). */
  setLook(look: Look16): void {
    this.look = look;
    this.frames.forEach((t) => t.dispose());
    this.frames.clear();
    this.show(this.facing, STAND, false);
  }

  onStep(cb: () => void): void {
    this.stepCallback = cb;
  }

  private tex(dir: Dir16, walk: number, blink: boolean): THREE.CanvasTexture {
    const key = `${dir}${walk}${blink ? 'b' : ''}`;
    let t = this.frames.get(key);
    if (!t) {
      t = pixelTexture(paintHero(this.look, this.ctx.px / 16, dir, { walk, blink }).toCanvas());
      this.frames.set(key, t);
    }
    return t;
  }

  private show(dir: Dir16, walk: number, blink: boolean): void {
    const t = this.tex(dir, walk, blink && dir !== 'up');
    if (this.mat.map !== t) {
      this.mat.map = t;
      this.mat.needsUpdate = true;
    }
  }

  update(dt: number, reducedMotion: boolean): void {
    const px = this.ctx.px;
    if (this.moving) {
      this.anim += dt * 8;
      const f = Math.floor(this.anim) % 4;
      if ((f === 0 || f === 2) && f !== this.lastStep) this.stepCallback?.();
      this.lastStep = f;
      this.show(this.facing, f, false);
      this.mesh.position.y = this.bodyLift * K;
    } else {
      this.anim = 0;
      this.lastStep = -1;
      this.idleT += dt;
      this.blinkT -= dt;
      if (this.blinkT < -0.14) this.blinkT = 2.5 + Math.random() * 3;
      this.show(this.facing, STAND, this.blinkT < 0);
      // a tiny breathing bob makes standing characters feel alive
      const bob = this.bodyLift === 0 && !reducedMotion && Math.sin(this.idleT * 2.2) > 0.6 ? K / px : 0;
      this.mesh.position.y = this.bodyLift * K + bob;
    }
    if (this.marker) {
      const bob = reducedMotion ? 0 : Math.round(Math.sin(this.idleT * 3) * 1.5) / px;
      this.marker.position.y = this.markerBase + bob * K;
    }
    this.sync();
  }

  setMarker(kind: Marker16): void {
    if (kind === this.markerKind) return;
    this.markerKind = kind;
    if (this.marker) {
      this.group.remove(this.marker);
      this.marker = null;
    }
    if (!kind) return;
    const cv = paintMarker16(kind, this.ctx.px / 16).toCanvas();
    const geo = new THREE.PlaneGeometry(cv.width / this.ctx.px, cv.height / this.ctx.px);
    const mat = new THREE.MeshBasicMaterial({ map: pixelTexture(cv), transparent: true, depthTest: false });
    this.marker = new THREE.Mesh(geo, mat);
    this.marker.rotation.x = -Math.PI / 4;
    this.marker.renderOrder = 20;
    const bb = new THREE.Box3().setFromObject(this.mesh);
    this.markerBase = bb.max.y + 0.55;
    this.marker.position.set(0, this.markerBase, -0.3);
    this.group.add(this.marker);
  }

  get marked(): Marker16 {
    return this.markerKind;
  }

  /** World-space point above the head (for labels and arrows). */
  headPoint(): THREE.Vector3 {
    const bb = new THREE.Box3().setFromObject(this.mesh);
    return new THREE.Vector3(this.group.position.x, bb.max.y + 0.2, this.group.position.z);
  }

  sync(): void {
    // snap to whole screen pixels so sprites never shimmer
    const px = this.ctx.px;
    this.group.position.set(Math.round(this.x * px) / px, 0, (Math.round(this.y * px) / px) * K);
  }

  setVisible(v: boolean): void {
    this.group.visible = v;
  }

  static get directions(): Dir16[] {
    return DIRS;
  }
}

/** The "!" and "?" bubbles in the 16-bit style: a shaded gold coin with a dark mark. */
export function paintMarker16(kind: Exclude<Marker16, null>, u: number): PixelBuffer {
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(15 * u), Math.round(19 * u));
  const gold = ramp('#f2c94c');
  p.ellipse(S(7.5), S(7.5), S(6.6), S(6.6), gold, { sep: true });
  p.poly(
    [
      [S(5.5), S(12.5)],
      [S(9.5), S(12.5)],
      [S(7.5), S(16.5)],
    ],
    gold,
    { form: 'flat', level: 1 },
  );
  const ink = ramp('#3a2a24');
  if (kind === 'turnin') {
    p.capsule(S(5.6), S(5), S(7.5), S(3.6), S(1.2), ink, { form: 'flat', level: 2 });
    p.capsule(S(7.5), S(3.6), S(9.4), S(5), S(1.2), ink, { form: 'flat', level: 2 });
    p.capsule(S(9.4), S(5), S(7.6), S(8.2), S(1.2), ink, { form: 'flat', level: 2 });
    p.ellipse(S(7.6), S(11), S(1.3), S(1.3), ink, { form: 'flat', level: 2 });
  } else {
    p.capsule(S(7.5), S(3.4), S(7.5), S(8.4), S(1.4), ink, { form: 'flat', level: 2 });
    p.ellipse(S(7.5), S(11), S(1.4), S(1.4), ink, { form: 'flat', level: 2 });
  }
  return p.toBuffer();
}
