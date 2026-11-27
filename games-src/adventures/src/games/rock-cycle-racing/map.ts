import * as THREE from 'three';
import type { LowpolyRenderer } from '../../kit/render/lowpolyRenderer';
import { rand } from '../../kit/world/lowpoly/shapes';

/**
 * The race map: a cut-away block of the Earth (a "block diagram", as in a
 * geology book) that you can turn. The top shows the four race legs: the
 * volcano, the desert canyon, the river down to the bay, and the mountains.
 * The cut sides show what is underneath: layers of sedimentary rock, the
 * magma chamber and the volcano's pipe, folded metamorphic rock under the
 * mountains, and granite at the bottom. Arrows show the rock cycle.
 */

export interface MapPin {
  id: 'lava' | 'canyon' | 'river' | 'deep';
  label: string;
  color: string;
  pos: THREE.Vector3;
}

export interface MapLabel {
  label: string;
  pos: THREE.Vector3;
}

const W = 30; // half width (x)
const D = 18; // half depth (z)
const BOTTOM = -22;
const VOLC = { x: -10, z: 13, r: 9, h: 9, crater: 1.6 };
const CHAMBER = { x: -10, y: -12.5, rx: 6, ry: 3.4 };
const RIVER = new THREE.CatmullRomCurve3([
  new THREE.Vector3(26, 0, -6),
  new THREE.Vector3(17, 0, -1),
  new THREE.Vector3(8, 0, 3),
  new THREE.Vector3(-2, 0, 1),
  new THREE.Vector3(-12, 0, -3),
  new THREE.Vector3(-21, 0, -1),
]);
const riverPts = RIVER.getSpacedPoints(80);

function riverDist(x: number, z: number): number {
  let best = Infinity;
  for (const p of riverPts) best = Math.min(best, (p.x - x) ** 2 + (p.z - z) ** 2);
  return Math.sqrt(best);
}

function smooth(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/** Height of the ground at (x, z). */
export function mapHeight(x: number, z: number): number {
  // The bay on the left.
  if (x < -21) return -1.8 + smooth((x + 30) / 9) * 1.6;
  let y = 0.6 + Math.sin(x * 0.4) * Math.cos(z * 0.35) * 0.2;
  // The desert plateau with its canyon (back middle).
  const plateau = smooth((x + 1) / 3) * smooth((15 - x) / 3) * smooth((-3 - z) / 3);
  if (plateau > 0) {
    const canyon = Math.abs(z + 11 - Math.sin(x * 0.5) * 1.5) < 1.6 ? 1 : 0;
    y += plateau * (canyon ? 1 : 4.5);
  }
  // The mountains on the right.
  const m = smooth((x - 13) / 6);
  if (m > 0) y += m * (6 + Math.sin(z * 0.7 + 1) * 3 + Math.cos(x * 0.9) * 2.4);
  // The volcano near the front edge (the cut goes through its middle).
  const dv = Math.hypot(x - VOLC.x, z - VOLC.z);
  if (dv < VOLC.r) {
    const cone = VOLC.h * Math.pow(1 - dv / VOLC.r, 1.15);
    y = Math.max(y, dv < VOLC.crater ? VOLC.h * 0.72 : cone);
  }
  // The river valley.
  const dr = riverDist(x, z);
  if (dr < 2.4 && x > -21) y = Math.min(y, -0.3 + (dr / 2.4) * 1.2);
  return y;
}

const SED = [0xe7c487, 0xc96d3c, 0xa59c8e, 0xecd9ad, 0xb45a34];
const META = [0x8d8a92, 0x55525c, 0xb7b2b8, 0x6e6a76];

/** The color of the rock at a point underground. */
function rockAt(x: number, y: number, z: number, surf: number, r: () => number): number {
  if (y > surf) return y < 0 ? 0x3f8fc0 : 0x5a3a2a; // sea water in the bay
  // The magma chamber and the pipe up to the crater.
  const ch = ((x - CHAMBER.x) / CHAMBER.rx) ** 2 + ((y - CHAMBER.y) / CHAMBER.ry) ** 2;
  if (z > 8 && (ch < 1 || (Math.abs(x - VOLC.x - (y - CHAMBER.y) * 0.04) < 0.85 && y > CHAMBER.y))) return r() < 0.3 ? 0xffc44a : 0xff6a1f;
  if (z > 8 && ch < 1.5) return 0x7a3a26; // baked rock around the chamber
  if (y > surf - 0.45) return 0x7a5a3a; // soil
  // Folded, striped rock under the mountains.
  const fold = Math.sin(x * 0.55 + z * 0.2) * 1.4;
  if (x > 11 + Math.max(0, -y) * 0.15) return META[Math.floor(Math.abs((y + fold + x * 0.35) / 0.9)) % META.length];
  // Pink granite at the bottom, speckled.
  if (y < -10 + Math.sin(x * 0.3) * 1.2) return r() < 0.18 ? 0x2b2624 : r() < 0.4 ? 0xe6c3b8 : 0xd29d90;
  // Layers of sedimentary rock.
  return SED[Math.floor((y + 30 + Math.sin(x * 0.12) * 0.6) / 1.4) % SED.length];
}

function surfaceColor(x: number, y: number, z: number, r: () => number): number {
  const dv = Math.hypot(x - VOLC.x, z - VOLC.z);
  if (dv < VOLC.crater + 0.4) return 0xff6a1f;
  if (dv < VOLC.r * 0.95) return r() < 0.5 ? 0x4a4240 : 0x5a504c;
  if (x < -21) return 0xe2c48a;
  if (riverDist(x, z) < 1.7) return 0x3f8fc0;
  if (x > 13 && y > 9.5) return 0xf4f6f8;
  if (x > 13 && y > 3) return r() < 0.5 ? 0x8d8a92 : 0x7b7882;
  if (y > 2.5) return r() < 0.5 ? 0xd2834f : 0xe0a06a; // plateau
  return r() < 0.5 ? 0x8fb35a : 0x7fa34c;
}

function arrow(points: THREE.Vector3[], color: number): THREE.Group {
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(points);
  const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, flatShading: true });
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.28, 6), m));
  const end = curve.getPoint(1);
  const dir = curve.getTangent(1);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.6, 8), m);
  head.position.copy(end);
  head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  g.add(head);
  return g;
}

export function buildMap(lp: LowpolyRenderer, opts: { low?: boolean } = {}): { pins: MapPin[]; labels: MapLabel[] } {
  const step = opts.low ? 1.5 : 1;
  const r = rand(5);
  const pos: number[] = [];
  const col: number[] = [];
  const c = new THREE.Color();
  const tri = (pts: number[][], color: number) => {
    for (const p of pts) pos.push(p[0], p[1], p[2]);
    c.set(color);
    for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
  };
  const nx = Math.round((2 * W) / step);
  const nz = Math.round((2 * D) / step);
  const X = (i: number) => -W + i * step;
  const Z = (j: number) => -D + j * step;
  // The top.
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const p = (ii: number, jj: number) => [X(ii), mapHeight(X(ii), Z(jj)), Z(jj)];
      const a = p(i, j);
      const b = p(i, j + 1);
      const d = p(i + 1, j);
      const e = p(i + 1, j + 1);
      const cx = X(i) + step / 2;
      const cz = Z(j) + step / 2;
      const color = surfaceColor(cx, (a[1] + e[1]) / 2, cz, r);
      tri([a, b, d], color);
      tri([d, b, e], color);
    }
  }
  // The four cut sides: columns along the edge, rows going down.
  const side = (count: number, at: (u: number) => [number, number]) => {
    for (let i = 0; i < count; i++) {
      const [x0, z0] = at(i);
      const [x1, z1] = at(i + 1);
      const s0 = mapHeight(x0, z0);
      const s1 = mapHeight(x1, z1);
      const top0 = Math.max(s0, x0 < -21 ? 0 : s0);
      const top1 = Math.max(s1, x1 < -21 ? 0 : s1);
      const rowH = opts.low ? 1.2 : 0.7;
      let y = BOTTOM;
      while (y < Math.min(top0, top1) - 0.01) {
        const yn = Math.min(y + rowH, Math.min(top0, top1));
        const color = rockAt((x0 + x1) / 2, (y + yn) / 2, (z0 + z1) / 2, (s0 + s1) / 2, r);
        tri([[x0, y, z0], [x1, y, z1], [x0, yn, z0]], color);
        tri([[x1, y, z1], [x1, yn, z1], [x0, yn, z0]], color);
        y = yn;
      }
      // The sloping top piece.
      const lo = Math.min(top0, top1);
      const color = rockAt((x0 + x1) / 2, (lo + Math.max(top0, top1)) / 2 - 0.05, (z0 + z1) / 2, Math.max(s0, s1), r);
      tri([[x0, lo, z0], [x1, lo, z1], [x0, top0, z0]], color);
      tri([[x1, lo, z1], [x1, top1, z1], [x0, top0, z0]], color);
    }
  };
  side(nx, (i) => [X(i), D]);
  side(nx, (i) => [X(i), -D]);
  side(nz, (j) => [-W, Z(j)]);
  side(nz, (j) => [W, Z(j)]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const block = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide, roughness: 0.95 }));
  block.castShadow = true;
  block.receiveShadow = true;
  lp.scene.add(block);
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(2 * W, 0.4, 2 * D), new THREE.MeshStandardMaterial({ color: 0x3a2c26 }));
  bottom.position.y = BOTTOM - 0.2;
  lp.scene.add(bottom);

  // The sea in the bay.
  const sea = new THREE.Mesh(new THREE.BoxGeometry(9.2, 1.9, 2 * D), new THREE.MeshStandardMaterial({ color: 0x4aa3d8, transparent: true, opacity: 0.55, flatShading: true }));
  sea.position.set(-W + 4.6, -0.95, 0);
  lp.scene.add(sea);

  // The rock cycle, as arrows.
  const above = (x: number, z: number, lift: number) => new THREE.Vector3(x, mapHeight(x, z) + lift, z);
  lp.scene.add(arrow([above(-8.5, 11, 10.5), above(-2, 2, 9), above(5, -6, 7.5)], 0xff8a3a));
  lp.scene.add(arrow([above(7, -9, 7), above(10, -3, 5.5), above(10, 2.5, 3)], 0xe0b070));
  lp.scene.add(arrow([above(2, 2, 3), above(-8, -2, 3), above(-19, 0, 2.6)], 0x4aa3d8));
  // Underground, drawn on the front cut: down under the bay, across to the mountain roots, then melting.
  const front = (x: number, y: number) => new THREE.Vector3(x, y, D + 0.4);
  lp.scene.add(arrow([front(-25, -2), front(-22, -7), front(-8, -6.5), front(10, -9), front(18, -12)], 0x9a96a6));
  lp.scene.add(arrow([front(20, -15), front(10, -18.5), front(-2, -17), front(-5.5, -14)], 0xd65a2a));

  const pins: MapPin[] = [
    { id: 'lava', label: 'Lava Run', color: '#e8622a', pos: above(VOLC.x, VOLC.z, 2.4) },
    { id: 'canyon', label: 'Canyon Run', color: '#d9a04a', pos: above(7, -11, 5) },
    { id: 'river', label: 'River Run', color: '#3f8fc0', pos: above(-14, -3, 2.5) },
    { id: 'deep', label: 'Deep Squeeze', color: '#8a7fa8', pos: above(22, 4, 2) },
  ];
  const labels: MapLabel[] = [
    { label: 'Cools into rock', pos: above(-2, 2, 10.5) },
    { label: 'Weathering', pos: above(11, -3, 7) },
    { label: 'Erosion and deposition', pos: above(-8, -2, 4.6) },
    { label: 'Pressed into layers', pos: front(-14, -6) },
    { label: 'Heat and pressure', pos: front(14, -9) },
    { label: 'Melting', pos: front(6, -19.5) },
  ];
  return { pins, labels };
}
