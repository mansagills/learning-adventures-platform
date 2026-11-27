import * as THREE from 'three';
import type { LowpolyRenderer } from '../../kit/render/lowpolyRenderer';
import { mat, rand } from '../../kit/world/lowpoly/shapes';
import type { Season } from './content';
import { FLOODPLAIN_HALF_WIDTH, MAP_HALF, MOUNDS, WATER_LEVEL, heightAt, riverX, zoneAt } from './egyptMap';
import {
  C,
  SKIN,
  bakery,
  datePalm,
  granary,
  jeliAwa,
  koko,
  mudHouse,
  nebet,
  papyrus,
  person,
  pyramidBuild,
  reedBoat,
  shaduf,
  sledge,
  walkPose,
  wheatField,
  workersRow,
  type Person,
} from './models';

/**
 * The Egypt chapter's map as a 3D diorama: the Nile, Kemet (the black land)
 * and Deshret (the red land), villages on mounds above the flood, fields,
 * shadufs, boats, and a pyramid going up on the west-bank plateau.
 */

export interface EgyptSceneOptions {
  season: Season;
  evening?: boolean;
}

const N = 112;

function terrainColor(x: number, z: number, h: number, season: Season, r: () => number): THREE.Color {
  const zone = zoneAt(x, z);
  const c = new THREE.Color();
  const d = Math.abs(x - riverX(z));
  if (zone === 'river') c.set(0x6b5a44);
  else if (zone === 'kemet') {
    // The black land: dark mud, with grass along the banks and canals in the growing season.
    const green = season === 'peret' ? 0.55 : season === 'shemu' ? 0.25 : 0;
    const bank = d < 3 ? 1 : 0;
    c.set(0x4e3c2c).lerp(new THREE.Color(0x6f9640), Math.min(1, green * (0.45 + bank * 0.6) + (r() < 0.12 ? green * 0.6 : 0)));
    // Toward the desert the mud thins out.
    c.lerp(new THREE.Color(0xc9a06a), Math.max(0, (d - FLOODPLAIN_HALF_WIDTH + 2.5) / 2.5) * 0.9);
  } else if (zone === 'mound') c.set(0x9a7a56);
  else if (zone === 'plateau') c.set(h > 2 ? 0xd8b27c : 0xc0905e);
  else c.set(0xe2b77c).lerp(new THREE.Color(0xd08e55), Math.min(1, Math.max(0, (d - 12) / 10)));
  c.offsetHSL(0, 0, (r() - 0.5) * 0.04);
  return c;
}

function buildTerrain(season: Season): THREE.Mesh {
  const size = MAP_HALF * 2;
  const geo = new THREE.PlaneGeometry(size, size, N, N);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  const flat = geo.toNonIndexed();
  const fp = flat.getAttribute('position') as THREE.BufferAttribute;
  const colors = new Float32Array(fp.count * 3);
  const r = rand(9);
  for (let i = 0; i < fp.count; i += 3) {
    const cx = (fp.getX(i) + fp.getX(i + 1) + fp.getX(i + 2)) / 3;
    const cz = (fp.getZ(i) + fp.getZ(i + 1) + fp.getZ(i + 2)) / 3;
    const cy = (fp.getY(i) + fp.getY(i + 1) + fp.getY(i + 2)) / 3;
    const col = terrainColor(cx, cz, cy, season, r);
    for (let k = 0; k < 3; k++) col.toArray(colors, (i + k) * 3);
  }
  flat.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  flat.computeVertexNormals();
  const mesh = new THREE.Mesh(flat, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  mesh.receiveShadow = true;
  return mesh;
}

/** The sides of the diorama: earth layers below the map's edge. */
function buildSkirt(): THREE.Mesh {
  const verts: number[] = [];
  const colors: number[] = [];
  const steps = 56;
  const bottom = -3.2;
  const layer = (y: number) => new THREE.Color(y > -0.6 ? 0x8a6440 : y > -1.8 ? 0x7a5636 : 0x5e432c);
  const edge = (fn: (t: number) => [number, number]) => {
    for (let i = 0; i < steps; i++) {
      const [x1, z1] = fn(i / steps);
      const [x2, z2] = fn((i + 1) / steps);
      const h1 = heightAt(x1, z1);
      const h2 = heightAt(x2, z2);
      for (const [ya1, ya2, yb] of [
        [h1, h2, -0.6],
        [-0.6, -0.6, -1.8],
        [-1.8, -1.8, bottom],
      ] as const) {
        const top1 = Math.max(ya1, yb);
        const top2 = Math.max(ya2, yb);
        verts.push(x1, top1, z1, x1, yb, z1, x2, top2, z2, x2, top2, z2, x1, yb, z1, x2, yb, z2);
        const c = layer(yb + 0.1);
        for (let k = 0; k < 6; k++) colors.push(c.r, c.g, c.b);
      }
    }
  };
  const H = MAP_HALF;
  edge((t) => [-H + t * 2 * H, H]);
  edge((t) => [H, H - t * 2 * H]);
  edge((t) => [H - t * 2 * H, -H]);
  edge((t) => [-H, -H + t * 2 * H]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide }));
}

function buildWater(season: Season): THREE.Mesh {
  const level = WATER_LEVEL[season];
  const bottom = -3.2;
  const geo = new THREE.BoxGeometry(MAP_HALF * 2 - 0.02, level - bottom, MAP_HALF * 2 - 0.02);
  geo.translate(0, (level + bottom) / 2, 0);
  // Flood water carries mud, so it is brown; the rest of the year it is clearer.
  const color = season === 'akhet' ? 0x7f9088 : 0x3d8fb2;
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.08, transparent: true, opacity: season === 'akhet' ? 0.88 : 0.86, flatShading: true });
  const mesh = new THREE.Mesh(geo, m);
  mesh.receiveShadow = true;
  return mesh;
}

interface Walker {
  p: Person;
  path: THREE.Vector3[];
  i: number;
  dir: 1 | -1;
  speed: number;
  phase: number;
  wait: number;
}

function at(x: number, z: number, lift = 0): THREE.Vector3 {
  return new THREE.Vector3(x, heightAt(x, z) + lift, z);
}

export function buildEgypt(lp: LowpolyRenderer, opts: EgyptSceneOptions): { focus: Record<string, THREE.Vector3> } {
  const { season } = opts;
  const scene = lp.scene;
  const root = new THREE.Group();
  scene.add(root);
  root.add(buildTerrain(season), buildSkirt(), buildWater(season));
  const r = rand(21);
  const place = (obj: THREE.Object3D, x: number, z: number, rotY = 0, lift = 0) => {
    obj.position.copy(at(x, z, lift));
    obj.rotation.y = rotY;
    root.add(obj);
    return obj;
  };
  const updaters: Array<(dt: number, t: number) => void> = [];

  // ── Fields on the floodplain ──
  const stage = season === 'peret' ? 'green' : season === 'shemu' ? 'gold' : 'none';
  const fields: THREE.Vector3[] = [];
  for (let z = -24; z <= 24; z += 3.1) {
    for (const side of [-1, 1] as const) {
      for (let k = 0; k < 2; k++) {
        const x = riverX(z) + side * (3.9 + k * 3);
        const ok = [-1.3, 1.3].every((dx) => [-1.3, 1.3].every((dz) => zoneAt(x + dx, z + dz) === 'kemet'));
        if (!ok || r() < 0.12) continue;
        const f = wheatField(2.6, 2.6, stage, Math.round(z * 10 + k * 3 + side));
        place(f, x, z, 0, -0.02);
        fields.push(new THREE.Vector3(x, heightAt(x, z), z));
      }
    }
    // A canal running from the river between the fields.
    if (season === 'peret' && Math.round(z / 3.1) % 3 === 0) {
      for (const side of [-1, 1]) {
        const canal = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.05, 0.35), mat(C.water, { roughness: 0.3 }));
        place(canal, riverX(z + 1.55) + side * 4.5, z + 1.55, 0, 0.03);
      }
    }
  }

  // ── Villages on the mounds ──
  const east = MOUNDS[0];
  const west = MOUNDS[1];
  const houseSpots: Array<[number, number, number]> = [
    [east.x - 1.6, east.z - 1.6, 0.1], [east.x + 0.4, east.z - 2.1, -0.15], [east.x + 2.1, east.z - 0.6, -1.5], [east.x + 1.9, east.z + 1.5, -1.7],
    [east.x - 2.2, east.z + 0.6, 1.55], [east.x - 0.4, east.z + 2.3, 3.1],
    [west.x - 1, west.z - 1.2, 0.2], [west.x + 1.1, west.z - 0.9, -0.2], [west.x - 1.1, west.z + 1, 3.0],
  ];
  houseSpots.forEach(([x, z, ry], i) => place(mudHouse(100 + i), x, z, ry));
  place(granary(), west.x + 1.2, west.z + 1.1, -0.6);
  place(granary(), east.x + 0.1, east.z - 0.2, 0.3).scale.setScalar(0.85);

  // ── Palms and papyrus ──
  for (let i = 0; i < 70; i++) {
    const z = -26 + r() * 52;
    const side = r() < 0.5 ? -1 : 1;
    const nearBank = r() < 0.55;
    const d = nearBank ? 2.2 + r() * 0.8 : FLOODPLAIN_HALF_WIDTH - 1.5 + r() * 1.5;
    const x = riverX(z) + side * d;
    if (Math.abs(x) > MAP_HALF - 1 || zoneAt(x, z) === 'river') continue;
    if (fields.some((f) => Math.abs(f.x - x) < 1.6 && Math.abs(f.z - z) < 1.6)) continue;
    place(datePalm(i + 1, 1.9 + r() * 1.1), x, z, r() * 6);
  }
  for (const m of MOUNDS)
    for (let i = 0; i < 4; i++) {
      const a = r() * Math.PI * 2;
      place(datePalm(200 + i, 2.2 + r()), m.x + Math.cos(a) * (m.r - 0.4), m.z + Math.sin(a) * (m.r - 0.4));
    }
  for (let i = 0; i < 26; i++) {
    const z = -26 + r() * 52;
    const side = r() < 0.5 ? -1 : 1;
    const x = riverX(z) + side * (1.45 + r() * 0.25);
    const pap = papyrus(i + 50);
    pap.position.set(x, Math.max(heightAt(x, z), WATER_LEVEL.peret - 0.05), z);
    root.add(pap);
  }

  // ── Shadufs on the bank, lifting water ──
  for (const [z, side, ph] of [[-2.5, 1, 0], [8, 1, 1.8], [-14, -1, 3.1]] as const) {
    const s = shaduf();
    const x = riverX(z) + side * 2.05;
    place(s.group, x, z, side > 0 ? -Math.PI / 2 : Math.PI / 2);
    const worker = person({ skin: SKIN[3], cloth: C.linen, outfit: 'kilt', hair: 'short' });
    place(worker.group, x + side * 1.6, z, side > 0 ? -Math.PI / 2 : Math.PI / 2);
    worker.arms[0].rotation.x = -2.2;
    worker.arms[1].rotation.x = -2.2;
    updaters.push((_dt, t) => {
      const swing = Math.sin(t * 1.1 + ph);
      s.arm.rotation.x = 0.28 * swing;
      worker.arms[0].rotation.x = -2 - swing * 0.3;
      worker.arms[1].rotation.x = -2 - swing * 0.3;
    });
  }

  // ── Boats on the river ──
  for (const [z0, speed] of [[-10, 1.3], [14, -1.0]] as const) {
    const boat = reedBoat();
    boat.scale.setScalar(0.8);
    root.add(boat);
    let z = z0;
    updaters.push((dt, t) => {
      z += speed * dt;
      if (z > MAP_HALF - 3) z = -MAP_HALF + 3;
      if (z < -MAP_HALF + 3) z = MAP_HALF - 3;
      const x = riverX(z) + (speed > 0 ? -0.5 : 0.5);
      boat.position.set(x, WATER_LEVEL[season] + 0.02 + Math.sin(t * 2 + z0) * 0.03, z);
      const ahead = riverX(z + Math.sign(speed)) - riverX(z);
      boat.rotation.y = Math.atan2(Math.sign(speed), ahead) - Math.PI / 2;
    });
  }

  // ── The pyramid on the plateau, with the builders' town and bakery ──
  const pz = -6;
  const px = riverX(pz) - 17.3;
  const levels = season === 'akhet' ? 6 : season === 'peret' ? 5 : 5;
  const pyramid = place(pyramidBuild(levels), px, pz);
  pyramid.position.y = heightAt(px, pz) - 0.1;
  for (let i = 0; i < 3; i++) place(workersRow(300 + i * 4), px - 3 + i * 0.2, pz + 10.5 + i * 1.6, 0);
  place(bakery(), px + 3.6, pz + 11.5, 0.2);
  const baseY = pyramid.position.y;
  const topY = baseY + levels * 0.75;
  const rampFoot = new THREE.Vector3(px + 1.5, baseY + 0.2, pz + 4.5 + 7);
  const rampTop = new THREE.Vector3(px + 1.5, topY + 0.1, pz + 4.5 + 0.3);
  // Workers pull a block up the ramp; in the flood season more people come to build.
  const crews = season === 'akhet' ? 2 : 1;
  for (let c = 0; c < crews; c++) {
    const sl = sledge();
    root.add(sl);
    const crew: Person[] = [];
    for (let i = 0; i < 4; i++) {
      const w = person({ skin: SKIN[(i + c) % SKIN.length], cloth: C.linen, outfit: 'kilt', hair: i % 2 ? 'short' : 'none' });
      w.arms[0].rotation.x = -1.3;
      w.arms[1].rotation.x = -1.3;
      root.add(w.group);
      crew.push(w);
    }
    updaters.push((dt, t) => {
      const k = ((t * 0.05 + c * 0.5) % 1) * 1.0;
      const p = rampFoot.clone().lerp(rampTop, k);
      const slope = Math.atan2(rampTop.y - rampFoot.y, rampFoot.z - rampTop.z);
      sl.position.copy(p).add(new THREE.Vector3(c ? -0.5 : 0, 0.2, 0));
      sl.rotation.set(slope, 0, 0);
      crew.forEach((w, i) => {
        const off = -0.9 - Math.floor(i / 2) * 0.55;
        const q = rampFoot.clone().lerp(rampTop, Math.min(1, k + (-off / rampFoot.distanceTo(rampTop))));
        w.group.position.set(p.x + (i % 2 ? 0.3 : -0.3) + (c ? -0.5 : 0), q.y + 0.2, q.z);
        w.group.rotation.set(-0.25, Math.PI, 0);
        walkPose(w, t * 5 + i, true);
        w.arms[0].rotation.x = -1.2;
        w.arms[1].rotation.x = -1.2;
        void dt;
      });
    });
  }

  // ── Villagers going about their day ──
  const walkers: Walker[] = [];
  const addWalker = (look: Parameters<typeof person>[0], path: THREE.Vector3[], speed = 1.1) => {
    const p = person(look);
    root.add(p.group);
    p.group.position.copy(path[0]);
    walkers.push({ p, path, i: 0, dir: 1, speed, phase: r() * 6, wait: r() * 2 });
  };
  // Water carriers between the river bank and the east village.
  for (let i = 0; i < 4; i++) {
    const z = east.z - 1.5 + i;
    const bank = at(riverX(z) + 1.9, z);
    addWalker({ skin: SKIN[i % SKIN.length], cloth: i % 2 ? C.linen : C.linenShade, outfit: i % 2 ? 'dress' : 'kilt', hair: i % 2 ? 'bob' : 'short', carry: 'jar' }, [bank, at(east.x - 2.6, z + 0.3), at(east.x - 0.8, east.z + 0.6 + i * 0.2)], 0.9 + i * 0.1);
  }
  // People walking between the two villages and the fields (in the flood, they stay on the mounds).
  if (season !== 'akhet') {
    fields.slice(0, 10).forEach((f, i) => {
      if (i % 2) return;
      addWalker({ skin: SKIN[(i + 2) % SKIN.length], cloth: C.linen, outfit: 'kilt', hair: 'short', carry: season === 'shemu' ? 'basket' : 'none' }, [at(f.x - 1, f.z - 0.6), at(f.x + 1, f.z + 0.6), at(f.x - 0.8, f.z + 0.9)], 0.6);
    });
  } else {
    for (let i = 0; i < 4; i++)
      addWalker({ skin: SKIN[i % SKIN.length], cloth: C.linen, outfit: 'dress', hair: 'bob' }, [at(east.x - 1.8 + i * 0.6, east.z + 1), at(east.x + 1.2, east.z - 1 + i * 0.4)], 0.5);
  }
  // Builders walking from their town to the pyramid.
  for (let i = 0; i < 3; i++)
    addWalker({ skin: SKIN[(i + 1) % SKIN.length], cloth: C.linen, outfit: 'kilt', hair: 'short' }, [at(px - 2 + i, pz + 9.4), at(px - 2.5 + i * 1.5, pz + 6)], 0.8);

  updaters.push((dt, t) => {
    for (const w of walkers) {
      if (w.wait > 0) {
        w.wait -= dt;
        walkPose(w.p, 0, false);
        continue;
      }
      const target = w.path[w.i + w.dir] ?? w.path[w.i];
      const pos = w.p.group.position;
      const to = target.clone().sub(pos);
      const dist = Math.hypot(to.x, to.z);
      if (dist < 0.05) {
        w.i += w.dir;
        if (w.i <= 0 || w.i >= w.path.length - 1) {
          w.dir = w.i <= 0 ? 1 : -1;
          w.wait = 1 + (Math.sin(t + w.phase) + 1);
        }
        continue;
      }
      const step = Math.min(dist, w.speed * dt);
      pos.x += (to.x / dist) * step;
      pos.z += (to.z / dist) * step;
      pos.y = heightAt(pos.x, pos.z);
      w.p.group.rotation.y = Math.atan2(to.x, to.z);
      w.phase += step * 7;
      walkPose(w.p, w.phase, true);
    }
  });

  // ── Jeli Awa, Koko and Nebet at the east village ──
  const awa = jeliAwa();
  place(awa.group, east.x - 2.9, east.z - 2.1, 0.5);
  const bird = koko();
  place(bird.group, east.x - 2.1, east.z - 2.7, -0.4);
  bird.group.scale.setScalar(0.85);
  const neb = nebet();
  place(neb.group, east.x - 3.6, east.z - 1.4, 0.9);
  updaters.push((_dt, t) => {
    bird.head.rotation.x = Math.max(0, Math.sin(t * 1.7)) * 0.5;
    bird.wings[0].rotation.z = Math.sin(t * 9) > 0.92 ? -0.4 : 0;
    bird.wings[1].rotation.z = -bird.wings[0].rotation.z;
    awa.group.children[0].position.y = Math.sin(t * 2) * 0.015;
  });

  // ── Evening lamps ──
  if (opts.evening) {
    for (const [x, z] of [[east.x - 0.8, east.z + 0.6], [east.x + 1.2, east.z - 1], [west.x, west.z], [px + 3.6, pz + 11]] as const) {
      const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), mat(0xffc46b, { emissive: 0xffa040 }));
      place(lamp, x, z, 0, 0.5);
      const light = new THREE.PointLight(0xffa860, 6, 7, 1.6);
      light.position.copy(at(x, z, 1));
      root.add(light);
      updaters.push((_dt, t) => (light.intensity = 5.5 + Math.sin(t * 7 + x) * 0.6));
    }
  }

  for (const u of updaters) lp.onFrame(u);
  return {
    focus: {
      village: at(east.x - 2.5, east.z - 2),
      pyramid: at(px, pz),
      river: at(riverX(0), 0),
    },
  };
}
