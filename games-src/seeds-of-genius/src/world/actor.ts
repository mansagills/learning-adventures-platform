import * as THREE from 'three';
import { DIRS, WALK_FRAMES, paintSheet, spriteHeight, type CharacterLook, type Dir } from '../art/characters';
import { PixelBuffer } from '../art/pixel';
import { P } from '../art/palette';
import { K, PX } from '../render/pixelRenderer';
import { blobShadow, pixelTexture, type Lighting } from './sceneKit';
import type { NpcMarker } from '../quests/engine';

/** A walking character: the player or an NPC. Positions are in tile units. */
export class Actor {
  readonly group = new THREE.Group();
  private mesh!: THREE.Mesh;
  private tex!: THREE.CanvasTexture;
  private readonly mat: THREE.MeshBasicMaterial;
  private marker: THREE.Mesh | null = null;
  private markerKind: NpcMarker = null;
  x: number;
  y: number;
  facing: Dir;
  moving = false;
  private anim = 0;
  private idleT = Math.random() * 10;
  private stepCallback: (() => void) | null = null;
  private lastFrame = 0;

  constructor(
    lighting: Lighting,
    look: CharacterLook,
    x: number,
    y: number,
    facing: Dir = 'down',
  ) {
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.mat = lighting.add(new THREE.MeshBasicMaterial({ alphaTest: 0.5 }));
    const shadow = blobShadow(0.9);
    shadow.position.y = 0.015;
    this.group.add(shadow);
    this.setLook(look);
    this.sync();
  }

  setLook(look: CharacterLook): void {
    const sheet = paintSheet(look);
    this.tex?.dispose();
    this.tex = pixelTexture(sheet);
    this.tex.repeat.set(1 / WALK_FRAMES, 1 / DIRS.length);
    this.mat.map = this.tex;
    this.mat.needsUpdate = true;
    const h = (spriteHeight(look) / PX) * K;
    const w = 16 / PX;
    if (this.mesh) {
      this.group.remove(this.mesh);
      this.mesh.geometry.dispose();
    }
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(0, h / 2, 0);
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.group.add(this.mesh);
    this.setFrame(0);
  }

  get material(): THREE.MeshBasicMaterial {
    return this.mat;
  }

  onStep(cb: () => void): void {
    this.stepCallback = cb;
  }

  private setFrame(frame: number): void {
    const row = DIRS.indexOf(this.facing);
    this.tex.offset.set(frame / WALK_FRAMES, 1 - (row + 1) / DIRS.length);
  }

  update(dt: number, reducedMotion: boolean): void {
    if (this.moving) {
      this.anim += dt * 8;
      const seq = [1, 0, 2, 0];
      const f = seq[Math.floor(this.anim) % 4];
      if (f !== 0 && f !== this.lastFrame) this.stepCallback?.();
      this.lastFrame = f;
      this.setFrame(f);
      this.mesh.position.y = 0;
    } else {
      this.anim = 0;
      this.lastFrame = 0;
      this.setFrame(0);
      // A tiny breathing bob makes idle characters feel alive.
      this.idleT += dt;
      this.mesh.position.y = !reducedMotion && Math.sin(this.idleT * 2.2) > 0.6 ? K / PX : 0;
    }
    if (this.marker) {
      const bob = reducedMotion ? 0 : Math.round(Math.sin(this.idleT * 3) * 1.5) / PX;
      this.marker.position.y = this.markerBase + bob * K;
    }
    this.sync();
  }

  private markerBase = 0;

  setMarker(kind: NpcMarker): void {
    if (kind === this.markerKind) return;
    this.markerKind = kind;
    if (this.marker) {
      this.group.remove(this.marker);
      this.marker = null;
    }
    if (!kind) return;
    const cv = paintMarker(kind).toCanvas();
    const geo = new THREE.PlaneGeometry(cv.width / PX, cv.height / PX);
    const mat = new THREE.MeshBasicMaterial({ map: pixelTexture(cv), transparent: true, depthTest: false });
    this.marker = new THREE.Mesh(geo, mat);
    this.marker.rotation.x = -Math.PI / 4;
    this.marker.renderOrder = 20;
    const bb = new THREE.Box3().setFromObject(this.mesh);
    this.markerBase = bb.max.y + 0.55;
    this.marker.position.set(0, this.markerBase, -0.3);
    this.group.add(this.marker);
  }

  get marked(): NpcMarker {
    return this.markerKind;
  }

  /** World-space point above the head (for prompts and arrows). */
  headPoint(): THREE.Vector3 {
    const bb = new THREE.Box3().setFromObject(this.mesh);
    return new THREE.Vector3(this.group.position.x, bb.max.y + 0.2, this.group.position.z);
  }

  sync(): void {
    // Snap to whole screen pixels so sprites never shimmer.
    const sx = Math.round(this.x * PX) / PX;
    const sy = Math.round(this.y * PX) / PX;
    this.group.position.set(sx, 0, sy * K);
  }

  setVisible(v: boolean): void {
    this.group.visible = v;
  }
}

/** Quest markers: a gold "!" (new quest or lead) or "?" (ready to report back). */
export function paintMarker(kind: Exclude<NpcMarker, null>): PixelBuffer {
  const inner = new PixelBuffer(13, 17);
  inner.ellipse(0, 0, 13, 13, P.gold);
  inner.ellipse(1, 1, 10, 10, '#ffd35e');
  inner.rect(5, 12, 3, 2, P.gold);
  inner.set(6, 14, P.gold);
  const ink = P.outline;
  if (kind === 'turnin') {
    inner.hline(4, 8, 2, ink);
    inner.rect(8, 3, 2, 3, ink);
    inner.rect(6, 6, 2, 2, ink);
    inner.rect(6, 9, 2, 2, ink);
    inner.rect(3, 3, 2, 1, ink);
  } else {
    inner.rect(5, 2, 3, 6, ink);
    inner.rect(5, 9, 3, 2, ink);
  }
  // Leave a 1px margin so the outline can wrap the whole bubble.
  const b = new PixelBuffer(15, 19);
  b.blit(inner, 1, 1);
  return b.outline();
}
