import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Helpers for building low-poly models in code: flat-shaded materials shared
 * by color, small "hand-made" wobbles so shapes don't look machine-perfect,
 * and merging many parts of one color into a single mesh (fewer draw calls).
 */

const materials = new Map<string, THREE.MeshStandardMaterial>();

/** A shared flat-shaded material for a color. */
export function mat(color: number, opts: { emissive?: number; roughness?: number; transparent?: number } = {}): THREE.MeshStandardMaterial {
  const key = `${color}|${opts.emissive ?? 0}|${opts.roughness ?? 0.92}|${opts.transparent ?? 1}`;
  let m = materials.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      flatShading: true,
      roughness: opts.roughness ?? 0.92,
      metalness: 0,
      emissive: opts.emissive ?? 0,
      emissiveIntensity: opts.emissive ? 1 : 0,
      transparent: (opts.transparent ?? 1) < 1,
      opacity: opts.transparent ?? 1,
    });
    materials.set(key, m);
  }
  return m;
}

/** A small seeded random number generator (same seed, same model). */
export function rand(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/** Nudge every corner a little, the same amount for corners that touch. */
export function wobble<T extends THREE.BufferGeometry>(g: T, amount: number, seed = 1): T {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const seen = new Map<string, [number, number, number]>();
  const r = rand(seed);
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    let d = seen.get(key);
    if (!d) {
      d = [(r() - 0.5) * amount, (r() - 0.5) * amount, (r() - 0.5) * amount];
      seen.set(key, d);
    }
    pos.setXYZ(i, pos.getX(i) + d[0], pos.getY(i) + d[1], pos.getZ(i) + d[2]);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

/** Collects parts by color and builds one mesh per color. */
export class ModelBuilder {
  private parts = new Map<number, THREE.BufferGeometry[]>();

  add(color: number, geom: THREE.BufferGeometry, at?: { x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number; sx?: number; sy?: number; sz?: number }): this {
    const g = geom.index ? geom.toNonIndexed() : geom;
    if (g.getAttribute('uv')) g.deleteAttribute('uv');
    if (at) {
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(at.x ?? 0, at.y ?? 0, at.z ?? 0),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(at.rx ?? 0, at.ry ?? 0, at.rz ?? 0)),
        new THREE.Vector3(at.sx ?? 1, at.sy ?? 1, at.sz ?? 1),
      );
      g.applyMatrix4(m);
    }
    const list = this.parts.get(color) ?? [];
    list.push(g);
    this.parts.set(color, list);
    return this;
  }

  box(color: number, w: number, h: number, d: number, at: Parameters<ModelBuilder['add']>[2] = {}): this {
    return this.add(color, new THREE.BoxGeometry(w, h, d), { ...at, y: (at.y ?? 0) + h / 2 });
  }

  /** A cylinder (or cone when `top` is 0) standing on y. */
  cyl(color: number, top: number, bottom: number, h: number, sides: number, at: Parameters<ModelBuilder['add']>[2] = {}): this {
    return this.add(color, new THREE.CylinderGeometry(top, bottom, h, sides), { ...at, y: (at.y ?? 0) + h / 2 });
  }

  ball(color: number, r: number, detail = 0, at: Parameters<ModelBuilder['add']>[2] = {}): this {
    return this.add(color, new THREE.IcosahedronGeometry(r, detail), at);
  }

  /** A half dome sitting on y. */
  dome(color: number, r: number, sides: number, rings: number, at: Parameters<ModelBuilder['add']>[2] = {}): this {
    return this.add(color, new THREE.SphereGeometry(r, sides, rings, 0, Math.PI * 2, 0, Math.PI / 2), at);
  }

  build(opts: { shadows?: boolean; emissive?: Record<number, number> } = {}): THREE.Group {
    const group = new THREE.Group();
    for (const [color, list] of this.parts) {
      const merged = mergeGeometries(list, false);
      if (!merged) continue;
      merged.computeVertexNormals();
      const mesh = new THREE.Mesh(merged, mat(color, { emissive: opts.emissive?.[color] }));
      mesh.castShadow = opts.shadows !== false;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
}
