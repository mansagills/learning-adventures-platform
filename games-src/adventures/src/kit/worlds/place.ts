import type * as THREE from 'three';
import { K } from '../render/pixelRenderer';
import { billboard, shadow } from './stage';
import type { SceneCtx } from './types';

/** Shortcuts for putting things into a world scene at the world's pixel size. */
export function placer(ctx: SceneCtx) {
  const { scene, lighting, px } = ctx;
  const add = <T extends THREE.Object3D>(o: T): T => {
    scene.add(o);
    return o;
  };
  /** A standing prop with its bottom-centre at tile (x, y), with an optional shadow and lift (hovering). */
  const prop = (canvas: HTMLCanvasElement, x: number, y: number, shadowW = 0, lift = 0): THREE.Mesh => {
    const m = add(billboard(lighting, px, canvas, x, y, lift));
    if (shadowW) {
      const sh = shadow(px, shadowW);
      sh.position.set(x, 0.015, y * K);
      add(sh);
    }
    return m;
  };
  return { add, prop };
}
