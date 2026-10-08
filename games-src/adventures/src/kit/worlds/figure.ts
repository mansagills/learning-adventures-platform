import * as THREE from 'three';
import { K } from '../render/pixelRenderer';
import { pixelTexture } from '../world/sceneKit';
import { shadow } from './stage';
import type { SceneCtx } from './types';

/** A character standing in a world scene, with frames to flip through (for example standing and blinking). */
export class Figure {
  readonly mesh: THREE.Mesh;
  private readonly tex: THREE.CanvasTexture[];
  private readonly mat: THREE.MeshBasicMaterial;

  constructor(ctx: SceneCtx, frames: HTMLCanvasElement[], x: number, y: number) {
    const { px, lighting, scene } = ctx;
    this.tex = frames.map((c) => pixelTexture(c));
    const w = frames[0].width / px;
    const hgt = (frames[0].height / px) * K;
    const geo = new THREE.PlaneGeometry(w, hgt);
    geo.translate(0, hgt / 2, 0);
    this.mat = lighting.add(new THREE.MeshBasicMaterial({ map: this.tex[0], alphaTest: 0.5 }));
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.position.set(Math.round(x * px) / px, 0, y * K);
    const sh = shadow(px, Math.min(1.1, w * 0.85));
    sh.position.set(this.mesh.position.x, 0.015, y * K);
    scene.add(this.mesh, sh);
  }

  frame(i: number): void {
    swapFrame(this.mesh, this.tex[i % this.tex.length]);
  }
}

/** Show another animation frame on a billboard or figure. */
export function swapFrame(m: THREE.Mesh, tex: THREE.Texture): void {
  const mat = m.material as THREE.MeshBasicMaterial;
  if (mat.map !== tex) {
    mat.map = tex;
    mat.needsUpdate = true;
  }
}
