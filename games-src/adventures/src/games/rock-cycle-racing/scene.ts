import * as THREE from 'three';
import type { LowpolyRenderer } from '../../kit/render/lowpolyRenderer';
import type { Sample, TrackPath } from '../../kit/race/track';
import { mat, rand } from '../../kit/world/lowpoly/shapes';
import { C, boostPad, boulder, crystals, finishArch, gateArch, hoodoo, shrub } from './models';
import { VOLCANO, canyonHeight, type TestTrack } from './tracks';

/**
 * Builds the test track's world: the canyon floor and its red walls, the
 * volcano with its lava lake, the glowing tunnels underground, the roads,
 * and the props (crystals, speed pads, the question gate, the finish).
 */

export interface TrackWorld {
  /** Animate the lava and smoke. */
  update(dt: number, t: number): void;
  /** Where each finish line is. */
  finishes: Record<string, THREE.Vector3>;
}

const SAND = [0xd99a66, 0xcf8c5a, 0xe1a874, 0xc98352];
const WALL = [0xb4532f, 0xc96a3f, 0xe0a06a, 0xa8462a, 0xd9895a];
const ASH = [0x4a4240, 0x554b47, 0x3e3735, 0x5e5450];

function smooth(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/** The open-air stretches of track (lava flows), for flattening the ground under them. */
function openSamples(track: TestTrack): Sample[] {
  const out: Sample[] = [];
  for (const p of track.graph.paths.values()) for (const s of p.samples) if (s.kind !== 'tunnel') out.push(s);
  return out;
}

/** The ground: one mesh of flat-shaded triangles, each with its own color. */
function terrain(track: TestTrack, low: boolean): THREE.Mesh {
  const step = low ? 5 : 2.5;
  const x0 = -140;
  const x1 = 140;
  const z0 = -130;
  const z1 = 180;
  const nx = Math.round((x1 - x0) / step);
  const nz = Math.round((z1 - z0) / step);
  const open = openSamples(track);
  const r = rand(11);
  // Heights at the grid corners.
  const H: number[] = new Array((nx + 1) * (nz + 1));
  const burnt: boolean[] = new Array((nx + 1) * (nz + 1)).fill(false);
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = x0 + i * step;
      const z = z0 + j * step;
      const rr = Math.hypot(x, z);
      let y = canyonHeight(x, z);
      if (rr < VOLCANO.rim) y = VOLCANO.lake - 0.8;
      else if (rr < VOLCANO.rim + 1.5) y = VOLCANO.rimHeight + 0.4;
      // Flatten the ground under the lava flow so the road sits in a channel.
      let best = Infinity;
      let road: Sample | null = null;
      for (const s of open) {
        const d = (s.p.x - x) ** 2 + (s.p.z - z) ** 2;
        if (d < best) {
          best = d;
          road = s;
        }
      }
      if (road) {
        const d = Math.sqrt(best);
        const hw = road.width / 2 + 1;
        if (d < hw + 7) {
          const want = road.p.y - 0.25;
          y = d < hw ? want : want + (y - want) * smooth((d - hw) / 7);
          if (d < hw + 3) burnt[j * (nx + 1) + i] = true;
        }
      }
      H[j * (nx + 1) + i] = y + (rr > VOLCANO.base + 4 ? (r() - 0.5) * 0.25 : 0);
    }
  }
  const pos: number[] = [];
  const col: number[] = [];
  const c = new THREE.Color();
  const pickColor = (x: number, y: number, z: number, burn: boolean) => {
    const rr = Math.hypot(x, z);
    if (burn) return c.set(r() < 0.5 ? C.crust : 0x2a1f1c);
    if (rr < VOLCANO.base + 2 && y > 0.6) return c.set(ASH[Math.floor(r() * ASH.length)]).offsetHSL(0, 0, y > 16 ? 0.08 : 0);
    if (y > 1.2) return c.set(WALL[Math.floor(y / 2.2) % WALL.length]).offsetHSL(0, 0, (r() - 0.5) * 0.04);
    return c.set(SAND[Math.floor(r() * SAND.length)]);
  };
  const push = (a: number[], b: number[], d: number[], burn: boolean) => {
    pos.push(...a, ...b, ...d);
    const cx = (a[0] + b[0] + d[0]) / 3;
    const cy = (a[1] + b[1] + d[1]) / 3;
    const cz = (a[2] + b[2] + d[2]) / 3;
    pickColor(cx, cy, cz, burn);
    for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
  };
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const id = (ii: number, jj: number) => jj * (nx + 1) + ii;
      const P = (ii: number, jj: number) => [x0 + ii * step, H[id(ii, jj)], z0 + jj * step];
      const burn = burnt[id(i, j)] || burnt[id(i + 1, j + 1)];
      push(P(i, j), P(i, j + 1), P(i + 1, j), burn);
      push(P(i + 1, j), P(i, j + 1), P(i + 1, j + 1), burn);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  m.receiveShadow = true;
  m.castShadow = !low;
  return m;
}

/** A road ribbon with low walls (curbs) along a path, split into stretches by kind. */
function roads(path: TrackPath, mats: Record<string, THREE.Material>, floor: (s: Sample) => string): THREE.Group {
  const group = new THREE.Group();
  const buckets = new Map<string, number[]>();
  const curbs: number[] = [];
  const tri = (list: number[], ...pts: THREE.Vector3[]) => {
    for (const p of pts) list.push(p.x, p.y, p.z);
  };
  const V = (p: { x: number; y: number; z: number }) => new THREE.Vector3(p.x, p.y, p.z);
  const n = path.samples.length;
  for (let i = 0; i < n - 1; i++) {
    const s0 = path.samples[i].d;
    const s1 = path.samples[i + 1].d;
    const f0 = path.at(s0);
    const f1 = path.at(s1);
    const key = floor(path.samples[i]);
    const list = buckets.get(key) ?? [];
    buckets.set(key, list);
    const L0 = V(path.point(s0, -f0.halfWidth, 0.03));
    const R0 = V(path.point(s0, f0.halfWidth, 0.03));
    const L1 = V(path.point(s1, -f1.halfWidth, 0.03));
    const R1 = V(path.point(s1, f1.halfWidth, 0.03));
    tri(list, L0, L1, R0, R0, L1, R1);
    // Curbs: a low slanted wall on each side.
    for (const side of [-1, 1]) {
      const a0 = V(path.point(s0, side * f0.halfWidth, 0.03));
      const b0 = V(path.point(s0, side * (f0.halfWidth + 0.45), 0.45));
      const a1 = V(path.point(s1, side * f1.halfWidth, 0.03));
      const b1 = V(path.point(s1, side * (f1.halfWidth + 0.45), 0.45));
      if (side < 0) tri(curbs, a0, b0, a1, a1, b0, b1);
      else tri(curbs, a0, a1, b0, b0, a1, b1);
    }
  }
  for (const [key, list] of buckets) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(list, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mats[key]);
    m.receiveShadow = true;
    group.add(m);
  }
  const cg = new THREE.BufferGeometry();
  cg.setAttribute('position', new THREE.Float32BufferAttribute(curbs, 3));
  cg.computeVertexNormals();
  const cm = new THREE.Mesh(cg, mats.curb);
  cm.receiveShadow = true;
  group.add(cm);
  return group;
}

/** The rock around a tunnel: rings of corners around the road, seen from inside. */
function tube(path: TrackPath, color: number, seed: number, low: boolean): THREE.Mesh {
  const r = rand(seed);
  const sides = low ? 8 : 12;
  const rings: THREE.Vector3[][] = [];
  const ringAt: number[] = [];
  const stepEvery = 2;
  for (let i = 0; i < path.samples.length; i += stepEvery) {
    const smp = path.samples[i];
    if (smp.kind !== 'tunnel') continue;
    const f = path.at(smp.d);
    const cx = f.pos.x + f.up.x * 1.3;
    const cy = f.pos.y + f.up.y * 1.3;
    const cz = f.pos.z + f.up.z * 1.3;
    const rw = f.halfWidth + 1.6;
    const rh = 3.8;
    const ring: THREE.Vector3[] = [];
    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * Math.PI * 2;
      const jit = 1 + (r() - 0.5) * 0.18;
      const ox = Math.cos(a) * rw * jit;
      const oy = Math.sin(a) * rh * jit;
      ring.push(new THREE.Vector3(cx + f.right.x * ox + f.up.x * oy, cy + f.right.y * ox + f.up.y * oy, cz + f.right.z * ox + f.up.z * oy));
    }
    rings.push(ring);
    ringAt.push(i);
  }
  const pos: number[] = [];
  const col: number[] = [];
  const base = new THREE.Color(color);
  const c = new THREE.Color();
  for (let i = 0; i < rings.length - 1; i++) {
    if (ringAt[i + 1] - ringAt[i] > stepEvery) continue; // a gap: the tunnel opened up
    for (let k = 0; k < sides; k++) {
      const a = rings[i][k];
      const b = rings[i][(k + 1) % sides];
      const d = rings[i + 1][k];
      const e = rings[i + 1][(k + 1) % sides];
      for (const [p, q, s] of [
        [a, d, b],
        [b, d, e],
      ] as const) {
        pos.push(p.x, p.y, p.z, q.x, q.y, q.z, s.x, s.y, s.z);
        c.copy(base).offsetHSL(0, 0, (r() - 0.5) * 0.1);
        for (let t = 0; t < 3; t++) col.push(c.r, c.g, c.b);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide, roughness: 1 }));
}

/** A round cave (seen from inside), for the magma chamber and the crystal cave. */
function cave(radius: number, color: number, seed: number): THREE.Mesh {
  const g = new THREE.IcosahedronGeometry(radius, 2);
  const p = g.getAttribute('position');
  const r = rand(seed);
  for (let i = 0; i < p.count; i++) {
    const k = 1 + (r() - 0.5) * 0.25;
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.62, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, flatShading: true, side: THREE.BackSide, roughness: 1 }));
}

/** A puff of smoke over the crater. */
function plume(): { group: THREE.Group; update(dt: number): void } {
  const group = new THREE.Group();
  const puffs: Array<{ m: THREE.Mesh; age: number }> = [];
  const material = new THREE.MeshStandardMaterial({ color: 0x8c8480, flatShading: true, transparent: true, opacity: 0.55, depthWrite: false });
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 0), material);
    group.add(m);
    puffs.push({ m, age: i / 9 });
  }
  return {
    group,
    update(dt: number) {
      for (const p of puffs) {
        p.age = (p.age + dt * 0.05) % 1;
        const a = p.age;
        p.m.position.set(Math.sin(a * 5 + p.age) * 3 + a * 12, VOLCANO.rimHeight + 2 + a * 34, -a * 8);
        p.m.scale.setScalar(0.8 + a * 3);
      }
    },
  };
}

export function buildWorld(lp: LowpolyRenderer, track: TestTrack, opts: { low?: boolean } = {}): TrackWorld {
  const low = !!opts.low;
  const scene = lp.scene;
  const magma = new THREE.MeshStandardMaterial({ color: C.lava, emissive: C.lava, emissiveIntensity: 0.9, flatShading: true, roughness: 0.6 });
  const lavaFlow = new THREE.MeshStandardMaterial({ color: 0xff7a22, emissive: 0xff5a10, emissiveIntensity: 1, flatShading: true, roughness: 0.7 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x5a4c6a, flatShading: true, roughness: 0.9 });
  const mats: Record<string, THREE.Material> = { magma, lava: lavaFlow, stone, curb: mat(0x3a2c28) };

  scene.add(terrain(track, low));

  // The roads and the rock around the tunnels.
  for (const path of track.graph.paths.values()) {
    const id = path.spec.id;
    scene.add(roads(path, mats, (s) => (s.kind === 'lava' ? 'lava' : id === 'deep' ? 'stone' : 'magma')));
    scene.add(tube(path, id === 'deep' ? 0x463c52 : 0x5a2e22, id.length * 13, low));
  }

  // The lava lake in the crater.
  const lake = new THREE.Mesh(new THREE.CircleGeometry(VOLCANO.rim + 0.6, 18), lavaFlow);
  lake.rotation.x = -Math.PI / 2;
  lake.position.y = VOLCANO.lake - 0.3;
  scene.add(lake);

  // The magma chamber where the race starts.
  const vent = track.graph.path('vent');
  const start = vent.point(0, 0, 0);
  const chamber = cave(16, 0x4a2219, 3);
  chamber.position.set(start.x, start.y + 2, start.z + 6);
  scene.add(chamber);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(12, 14), magma);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(start.x, start.y - 0.5, start.z + 6);
  scene.add(pool);

  // Veins of magma in the vent walls (small glowing chips).
  const r = rand(21);
  const chips = new THREE.Group();
  for (let s = 6; s < vent.length; s += 5) {
    const f = vent.at(s);
    const side = r() < 0.5 ? -1 : 1;
    const p = vent.point(s, side * (f.halfWidth + 1.3), 0.8 + r() * 2.2);
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.35 + r() * 0.3, 0), magma);
    m.position.set(p.x, p.y, p.z);
    chips.add(m);
  }
  scene.add(chips);

  // The crystal tunnel: crystals grow where magma cooled slowly.
  const deep = track.graph.path('deep');
  for (let s = 10; s < deep.length - 6; s += low ? 9 : 5.5) {
    const f = deep.at(s);
    const side = r() < 0.5 ? -1 : 1;
    const p = deep.point(s, side * (f.halfWidth + 0.9), -0.1);
    const cr = crystals(Math.floor(s * 7), 0.9 + r() * 0.6);
    cr.position.set(p.x, p.y, p.z);
    cr.rotation.y = r() * 6;
    cr.rotation.z = side * -0.5;
    scene.add(cr);
  }
  const deepEnd = deep.point(deep.length, 0, 0);
  const crystalCave = cave(13, 0x3c3350, 7);
  crystalCave.position.set(deepEnd.x, deepEnd.y + 2.5, deepEnd.z);
  scene.add(crystalCave);
  for (let i = 0; i < (low ? 6 : 12); i++) {
    const a = (i / 12) * Math.PI * 2;
    const cr = crystals(100 + i, 2.2 + r());
    cr.position.set(deepEnd.x + Math.cos(a) * 9, deepEnd.y - 1, deepEnd.z + Math.sin(a) * 9);
    cr.rotation.z = Math.cos(a) * 0.5;
    cr.rotation.x = -Math.sin(a) * 0.5;
    scene.add(cr);
  }
  const caveLight = new THREE.PointLight(0x9b7bff, 40, 30, 1.4);
  caveLight.position.set(deepEnd.x, deepEnd.y + 5, deepEnd.z);
  scene.add(caveLight);

  // Speed pads, the question gate and the finish lines.
  for (const b of track.boosts) {
    const path = track.graph.path(b.path);
    const f = path.at(b.s);
    const pad = boostPad();
    const p = path.point(b.s, 0, 0.05);
    pad.position.set(p.x, p.y, p.z);
    pad.lookAt(p.x + f.tangent.x, p.y + f.tangent.y, p.z + f.tangent.z);
    scene.add(pad);
  }
  const gp = track.graph.path(track.gate.path);
  const gf = gp.at(track.gate.s);
  const gate = gateArch(gf.halfWidth * 2);
  const gpos = gp.point(track.gate.s, 0, 0);
  gate.position.set(gpos.x, gpos.y, gpos.z);
  gate.lookAt(gpos.x + gf.tangent.x, gpos.y, gpos.z + gf.tangent.z);
  scene.add(gate);

  const finishes: Record<string, THREE.Vector3> = {};
  for (const id of ['deep', 'erupt']) {
    const path = track.graph.path(id);
    const s = path.length - 3;
    const f = path.at(s);
    const arch = finishArch(f.halfWidth * 2);
    const p = path.point(s, 0, 0);
    arch.position.set(p.x, p.y, p.z);
    arch.lookAt(p.x + f.tangent.x, p.y, p.z + f.tangent.z);
    scene.add(arch);
    finishes[id] = new THREE.Vector3(p.x, p.y, p.z);
  }

  // The fork's divider: a rock pillar with a violet and an orange board.
  const ventEnd = vent.at(vent.length);
  const fp = vent.point(vent.length, 0, 0);
  const divider = new THREE.Group();
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1, 4.4, 6), mat(0x4a3a34));
  pillar.position.y = 2.2;
  const boardL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 0.12), mat(C.crystal, { emissive: 0x2a1470 }));
  boardL.position.set(-1.3, 3.6, 0.2);
  const boardR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 0.12), mat(C.orange, { emissive: 0x7a2a00 }));
  boardR.position.set(1.3, 3.6, 0.2);
  divider.add(pillar, boardL, boardR);
  divider.position.set(fp.x + ventEnd.tangent.x * 3, fp.y, fp.z + ventEnd.tangent.z * 3);
  divider.lookAt(divider.position.x - ventEnd.tangent.x, divider.position.y, divider.position.z - ventEnd.tangent.z);
  scene.add(divider);

  // The canyon: hoodoos, boulders and shrubs, away from the volcano and the roads.
  const flowSamples = openSamples(track);
  const clear = (x: number, z: number, room: number) => flowSamples.every((s) => (s.p.x - x) ** 2 + (s.p.z - z) ** 2 > room * room);
  let placed = 0;
  for (let i = 0; i < (low ? 60 : 160) && placed < (low ? 30 : 80); i++) {
    const x = (r() - 0.5) * 230;
    const z = -110 + r() * 270;
    const rr = Math.hypot(x, z);
    if (rr < VOLCANO.base + 6 || !clear(x, z, 9)) continue;
    const y = canyonHeight(x, z);
    if (y > 1) continue;
    const pick = r();
    const obj = pick < 0.22 ? hoodoo(i + 1, 4 + r() * 9) : pick < 0.6 ? boulder(i + 3, 0.8 + r() * 1.8, WALL[i % WALL.length]) : shrub(i + 5);
    obj.position.set(x, y, z);
    obj.rotation.y = r() * 6;
    scene.add(obj);
    placed++;
  }

  const smoke = plume();
  scene.add(smoke.group);

  return {
    finishes,
    update(dt: number, t: number) {
      lavaFlow.emissiveIntensity = 0.85 + Math.sin(t * 2.1) * 0.15;
      magma.emissiveIntensity = 0.8 + Math.sin(t * 1.7 + 1) * 0.15;
      smoke.update(dt);
    },
  };
}
