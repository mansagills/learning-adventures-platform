import * as THREE from 'three';
import { ModelBuilder, mat, rand, wobble } from '../../kit/world/lowpoly/shapes';
import type { Rock } from './cycle';
import { FORM_LOOK } from './content';

/**
 * The 3D models of Rock Cycle Racing, built in code from simple shapes in
 * the low-poly style of Kingdom Builders: Africa: the racer (a rolling rock
 * with goggles and a scarf), Blaze the rival, the cast, Scree the pika, and
 * the props along the track.
 */

export const C = {
  ink: 0x16100c,
  lens: 0xbfe8ff,
  strap: 0x2b2a33,
  scarf: 0x2f8f8a,
  khaki: 0xb8a170,
  ranger: 0x4f7a3a,
  navy: 0x24365c,
  red: 0xc0392b,
  orange: 0xef7d22,
  yellow: 0xf2c232,
  denim: 0x41597a,
  boot: 0x4a3426,
  white: 0xf5efe6,
  hair: 0x2a1d16,
  blond: 0xe0c27a,
  crystal: 0x9b7bff,
  crystal2: 0x56d6e8,
  lava: 0xff6a1f,
  lavaHot: 0xffc44a,
  crust: 0x3b2a26,
};

export const SKIN = { ana: 0x9a6a45, noor: 0x7a5236, bea: 0xf0c9a8, sione: 0x7d5034, tala: 0x8a5d3b };

function shadowed<T extends THREE.Object3D>(g: T): T {
  g.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

// ── The racer ─────────────────────────────────────────────────────────────

/** A rock ball with speckles painted into its corners (vertex colors). */
function rockBall(rock: Rock, radius: number, seed: number): THREE.Mesh {
  const look = FORM_LOOK[rock] ?? FORM_LOOK.basalt!;
  const g = wobble(new THREE.IcosahedronGeometry(radius, 1), radius * 0.12, seed).toNonIndexed();
  g.computeVertexNormals();
  const r = rand(seed * 7 + 3);
  const base = new THREE.Color(look.base);
  const speck = new THREE.Color(look.speck);
  const colors: number[] = [];
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i += 3) {
    // One color per face, so the speckles stay crisp.
    const pick = r();
    const c = pick < (rock === 'granite' ? 0.32 : 0.22) ? speck : base.clone().offsetHSL(0, 0, (r() - 0.5) * 0.08);
    for (let k = 0; k < 3; k++) colors.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const m = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: look.shine ? 0.25 : 0.85,
    metalness: look.shine ? 0.15 : 0,
    emissive: look.glow ?? 0x000000,
    emissiveIntensity: look.glow ? 0.9 : 0,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.castShadow = true;
  return mesh;
}

export interface Racer {
  group: THREE.Group;
  /** The rock itself; it spins as it rolls. */
  body: THREE.Mesh;
  /** Goggles and scarf: they stay facing forward. */
  face: THREE.Group;
  /** A warm light that magma gives off (dims as it cools). */
  light: THREE.PointLight;
  form: Rock;
  setForm(rock: Rock): void;
  /** Glow from 0 (cold rock) to 1 (fresh magma). */
  setHeat(heat: number): void;
}

export function racer(radius = 0.62, opts: { scarf?: number; light?: boolean } = {}): Racer {
  const group = new THREE.Group();
  const holder = new THREE.Group();
  holder.position.y = radius;
  group.add(holder);
  let body = rockBall('magma', radius, 5);
  holder.add(body);
  // Goggles on a strap, and a scarf that streams behind.
  const face = new ModelBuilder()
    .add(C.strap, new THREE.TorusGeometry(radius * 1.02, 0.05, 4, 16), { rx: 0.12 })
    .add(C.strap, new THREE.TorusGeometry(0.17, 0.05, 5, 10), { x: -0.2, y: 0.12, z: radius * 0.93 })
    .add(C.strap, new THREE.TorusGeometry(0.17, 0.05, 5, 10), { x: 0.2, y: 0.12, z: radius * 0.93 })
    .add(C.lens, new THREE.CircleGeometry(0.14, 10), { x: -0.2, y: 0.12, z: radius * 0.95 })
    .add(C.lens, new THREE.CircleGeometry(0.14, 10), { x: 0.2, y: 0.12, z: radius * 0.95 })
    .add(C.ink, new THREE.CircleGeometry(0.055, 8), { x: -0.18, y: 0.1, z: radius * 0.96 })
    .add(C.ink, new THREE.CircleGeometry(0.055, 8), { x: 0.22, y: 0.1, z: radius * 0.96 })
    .add(opts.scarf ?? C.scarf, new THREE.TorusGeometry(radius * 0.86, 0.09, 4, 14), { y: -radius * 0.48, rx: Math.PI / 2 })
    .box(opts.scarf ?? C.scarf, 0.16, 0.06, 0.6, { y: -radius * 0.5, z: -radius - 0.25, rx: 0.25, x: 0.12 })
    .build({ shadows: false });
  holder.add(face);
  const light = new THREE.PointLight(0xff7a2a, opts.light === false ? 0 : 14, 16, 1.6);
  light.position.y = radius * 1.5;
  group.add(light);
  const out: Racer = {
    group,
    body,
    face,
    light,
    form: 'magma',
    setForm(rock: Rock) {
      if (rock === out.form) return;
      const spin = body.rotation.clone();
      holder.remove(body);
      body.geometry.dispose();
      (body.material as THREE.Material).dispose();
      body = rockBall(rock, radius, rock.length + 5);
      body.rotation.copy(spin);
      holder.add(body);
      out.body = body;
      out.form = rock;
    },
    setHeat(heat: number) {
      const m = body.material as THREE.MeshStandardMaterial;
      if (out.form === 'magma') m.emissiveIntensity = 0.25 + heat * 0.75;
      light.intensity = opts.light === false ? 0 : 3 + heat * 11;
    },
  };
  return out;
}

/** Blaze, the rival: a scoria-red rock with a crest of flame-colored spikes. */
export function blaze(): Racer {
  const r = racer(0.66, { scarf: C.yellow, light: false });
  const crest = new ModelBuilder();
  for (let i = 0; i < 5; i++) {
    const a = -0.5 + i * 0.25;
    crest.cyl(i % 2 ? C.yellow : C.orange, 0, 0.1, 0.42 - Math.abs(i - 2) * 0.06, 5, { x: 0, y: 0.5, z: -0.1 + i * 0.05, rx: a });
  }
  r.face.add(crest.build({ shadows: false, emissive: { [C.orange]: 0x6a2a00, [C.yellow]: 0x5a4400 } }));
  r.setForm('basalt');
  // Scoria: a red, bubbly lava rock.
  const m = r.body.material as THREE.MeshStandardMaterial;
  m.color = new THREE.Color(0xa8432c);
  return r;
}

// ── People ────────────────────────────────────────────────────────────────

export type Hat = 'helmet' | 'sunhat' | 'captain' | 'hardhat' | 'ranger';

export interface ExplorerLook {
  skin: number;
  coat: number;
  pants: number;
  hat: Hat;
  hatColor: number;
  hair?: number;
  /** A tool to carry: a rock hammer, a map or none. */
  carry?: 'hammer' | 'map' | 'none';
  scale?: number;
}

function limb(color: number, w: number, h: number, d: number, extra?: (b: ModelBuilder) => void): THREE.Group {
  const b = new ModelBuilder().box(color, w, h, d, { y: -h });
  extra?.(b);
  return b.build();
}

export interface Explorer {
  group: THREE.Group;
  legs: [THREE.Object3D, THREE.Object3D];
  arms: [THREE.Object3D, THREE.Object3D];
}

/** A field scientist or guide, about 1.2 units tall. */
export function explorer(look: ExplorerLook): Explorer {
  const group = new THREE.Group();
  const b = new ModelBuilder();
  const s = look.skin;
  b.cyl(look.coat, 0.19, 0.25, 0.4, 7, { y: 0.34 });
  b.cyl(look.coat, 0.24, 0.26, 0.06, 7, { y: 0.33 }); // coat hem
  b.box(C.white, 0.12, 0.2, 0.02, { y: 0.52, z: 0.18 }); // shirt at the collar
  b.cyl(s, 0.05, 0.06, 0.08, 6, { y: 0.74 });
  b.add(s, wobble(new THREE.IcosahedronGeometry(0.15, 1), 0.02, 3), { y: 0.92 });
  b.add(look.hair ?? C.hair, new THREE.SphereGeometry(0.158, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2.1), { y: 0.92, rx: -0.15 });
  b.box(C.ink, 0.035, 0.04, 0.02, { x: -0.055, y: 0.92, z: 0.14 }).box(C.ink, 0.035, 0.04, 0.02, { x: 0.055, y: 0.92, z: 0.14 });
  const hc = look.hatColor;
  if (look.hat === 'helmet' || look.hat === 'hardhat') {
    b.add(hc, new THREE.SphereGeometry(0.18, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), { y: 0.97 });
    b.cyl(hc, 0.22, 0.22, 0.03, 10, { y: 0.96, z: look.hat === 'hardhat' ? 0.02 : 0 });
    if (look.hat === 'helmet') b.box(0xfff6c8, 0.08, 0.06, 0.04, { y: 1.05, z: 0.16 }); // headlamp
  }
  if (look.hat === 'sunhat') {
    b.cyl(hc, 0.34, 0.34, 0.03, 12, { y: 1.0 });
    b.cyl(hc, 0.13, 0.16, 0.14, 10, { y: 1.02 });
    b.cyl(C.orange, 0.165, 0.165, 0.035, 10, { y: 1.03 });
  }
  if (look.hat === 'captain') {
    b.cyl(C.white, 0.19, 0.16, 0.12, 10, { y: 1.0 });
    b.cyl(hc, 0.165, 0.165, 0.04, 10, { y: 1.0 });
    b.box(C.ink, 0.22, 0.02, 0.12, { y: 1.0, z: 0.12, rx: 0.2 });
    b.box(C.yellow, 0.06, 0.04, 0.02, { y: 1.06, z: 0.19 });
  }
  if (look.hat === 'ranger') {
    b.cyl(hc, 0.3, 0.3, 0.03, 12, { y: 1.0 });
    b.cyl(hc, 0.12, 0.15, 0.16, 4, { y: 1.02, ry: Math.PI / 4 });
  }
  if (look.carry === 'map') b.box(0xf3e2b0, 0.28, 0.2, 0.02, { x: 0.05, y: 0.42, z: 0.28, rx: -0.6 });
  group.add(b.build());

  const legL = limb(look.pants, 0.1, 0.32, 0.11, (l) => l.box(C.boot, 0.12, 0.07, 0.17, { y: -0.39, z: 0.02 }));
  const legR = limb(look.pants, 0.1, 0.32, 0.11, (l) => l.box(C.boot, 0.12, 0.07, 0.17, { y: -0.39, z: 0.02 }));
  legL.position.set(-0.08, 0.36, 0);
  legR.position.set(0.08, 0.36, 0);
  const armL = limb(look.coat, 0.08, 0.32, 0.08, (l) => l.box(s, 0.07, 0.07, 0.07, { y: -0.36 }));
  const armR = limb(look.coat, 0.08, 0.32, 0.08, (l) => {
    l.box(s, 0.07, 0.07, 0.07, { y: -0.36 });
    if (look.carry === 'hammer') l.box(0x7a5230, 0.03, 0.3, 0.03, { y: -0.52, z: 0.06 }).box(0x8f969c, 0.16, 0.05, 0.05, { y: -0.4, z: 0.06 });
  });
  armL.position.set(-0.22, 0.68, 0);
  armR.position.set(0.22, 0.68, 0);
  armL.rotation.z = -0.12;
  armR.rotation.z = 0.12;
  if (look.carry === 'map') {
    armL.rotation.x = -0.9;
    armR.rotation.x = -0.9;
  }
  group.add(legL, legR, armL, armR);
  group.scale.setScalar(look.scale ?? 1.15);
  shadowed(group);
  return { group, legs: [legL, legR], arms: [armL, armR] };
}

export const anaQuispe = () => explorer({ skin: SKIN.ana, coat: C.red, pants: C.denim, hat: 'helmet', hatColor: C.orange, carry: 'hammer' });
export const noorRahman = () => explorer({ skin: SKIN.noor, coat: 0xe7d6b0, pants: 0x8a6e4b, hat: 'sunhat', hatColor: 0xf0dfb0, carry: 'map' });
export const beaLindqvist = () => explorer({ skin: SKIN.bea, coat: C.navy, pants: 0x2b2f3a, hat: 'captain', hatColor: C.navy, hair: C.blond });
export const sioneTaufa = () => explorer({ skin: SKIN.sione, coat: 0x3f8f4e, pants: 0x5a4a3a, hat: 'hardhat', hatColor: C.yellow, carry: 'hammer' });
export const rangerTala = () => explorer({ skin: SKIN.tala, coat: C.khaki, pants: 0x6b5a3a, hat: 'ranger', hatColor: C.ranger });

/** Scree the pika: a small round mountain animal with big round ears. */
export function scree(): THREE.Group {
  const fur = 0x9a7a5c;
  const g = new ModelBuilder()
    .add(fur, wobble(new THREE.IcosahedronGeometry(0.28, 1), 0.03, 4), { y: 0.26, sz: 1.15 })
    .add(fur, wobble(new THREE.IcosahedronGeometry(0.2, 1), 0.02, 5), { y: 0.42, z: 0.2 })
    .add(0xc9a98a, new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10), { x: -0.13, y: 0.6, z: 0.16, rz: 0.4, rx: Math.PI / 2 })
    .add(0xc9a98a, new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10), { x: 0.13, y: 0.6, z: 0.16, rz: -0.4, rx: Math.PI / 2 })
    .box(C.ink, 0.04, 0.05, 0.02, { x: -0.08, y: 0.45, z: 0.38 })
    .box(C.ink, 0.04, 0.05, 0.02, { x: 0.08, y: 0.45, z: 0.38 })
    .box(0x4a3020, 0.05, 0.03, 0.02, { y: 0.4, z: 0.4 })
    .build();
  return shadowed(g);
}

// ── Props ─────────────────────────────────────────────────────────────────

/** A cluster of glowing crystals, as found in a cave where rock cooled slowly. */
export function crystals(seed: number, size = 1): THREE.Group {
  const r = rand(seed);
  const b = new ModelBuilder();
  const n = 4 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const h = (0.6 + r() * 1.3) * size;
    const color = r() < 0.65 ? C.crystal : C.crystal2;
    b.cyl(color, 0, 0.16 * size + r() * 0.12 * size, h, 6, { x: (r() - 0.5) * size, z: (r() - 0.5) * size, rx: (r() - 0.5) * 0.9, rz: (r() - 0.5) * 0.9 });
  }
  return b.build({ shadows: false, emissive: { [C.crystal]: 0x3a1f99, [C.crystal2]: 0x0f6a7a } });
}

/** A speed pad: three glowing arrows on the road. */
export function boostPad(): THREE.Group {
  const b = new ModelBuilder();
  for (let i = 0; i < 3; i++) {
    const z = -0.9 + i * 0.9;
    b.box(C.lavaHot, 0.9, 0.06, 0.22, { x: -0.36, z, ry: -0.7 });
    b.box(C.lavaHot, 0.9, 0.06, 0.22, { x: 0.36, z, ry: 0.7 });
  }
  return b.build({ shadows: false, emissive: { [C.lavaHot]: 0xff9a20 } });
}

/** The question gate: a stone arch with a glowing ring. */
export function gateArch(width: number): THREE.Group {
  const b = new ModelBuilder()
    .box(0x6a5a52, 0.7, 4.2, 0.7, { x: -width / 2 - 0.4 })
    .box(0x6a5a52, 0.7, 4.2, 0.7, { x: width / 2 + 0.4 })
    .box(0x7a6a60, width + 2, 0.7, 0.8, { y: 4.1 })
    .box(C.yellow, width * 0.5, 0.35, 0.1, { y: 4.25, z: 0.42 });
  return b.build({ emissive: { [C.yellow]: 0x6a5000 } });
}

/** The finish arch, with a checkered banner. */
export function finishArch(width: number): THREE.Group {
  const b = new ModelBuilder().box(0x5a4638, 0.6, 4.6, 0.6, { x: -width / 2 - 0.4 }).box(0x5a4638, 0.6, 4.6, 0.6, { x: width / 2 + 0.4 });
  const cells = 10;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < 2; j++) {
      const color = (i + j) % 2 ? C.white : C.ink;
      b.box(color, (width + 1) / cells, 0.4, 0.15, { x: -(width + 1) / 2 + ((i + 0.5) * (width + 1)) / cells, y: 3.6 + j * 0.4 });
    }
  }
  return b.build();
}

/** A big boulder for the canyon floor. */
export function boulder(seed: number, size: number, color: number): THREE.Mesh {
  const g = wobble(new THREE.DodecahedronGeometry(size, 0), size * 0.35, seed);
  const m = new THREE.Mesh(g, mat(color));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** A tall sandstone column (a hoodoo), striped by its layers. */
export function hoodoo(seed: number, height: number): THREE.Group {
  const r = rand(seed);
  const bands = [0xc96a3f, 0xe0a06a, 0xb4532f, 0xd9895a];
  const b = new ModelBuilder();
  let y = 0;
  let w = 1.3 + r() * 0.5;
  while (y < height) {
    const h = 0.6 + r() * 0.8;
    const c = bands[Math.floor(r() * bands.length)];
    b.add(c, wobble(new THREE.CylinderGeometry(w * (0.85 + r() * 0.2), w, h, 7), 0.12, seed + y * 10), { y: y + h / 2 });
    y += h;
    w *= 0.92;
  }
  b.add(0x8a5a40, wobble(new THREE.CylinderGeometry(w * 1.4, w * 1.2, 0.6, 7), 0.15, seed + 99), { y: y + 0.3 });
  return shadowed(b.build());
}

/** A desert shrub. */
export function shrub(seed: number): THREE.Group {
  const r = rand(seed);
  const b = new ModelBuilder();
  for (let i = 0; i < 3; i++) b.add(i % 2 ? 0x7f8f4a : 0x99a35a, wobble(new THREE.IcosahedronGeometry(0.35 + r() * 0.2, 0), 0.08, seed + i), { x: (r() - 0.5) * 0.6, y: 0.3, z: (r() - 0.5) * 0.6 });
  return shadowed(b.build());
}

/** A puff of steam (grows and fades; see `race.ts`). */
export function steamPuff(): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, transparent: true, opacity: 0.7, flatShading: true, depthWrite: false }));
  return m;
}
