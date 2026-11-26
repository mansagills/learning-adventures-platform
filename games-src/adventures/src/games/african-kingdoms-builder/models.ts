import * as THREE from 'three';
import { ModelBuilder, mat, rand, wobble } from '../../kit/world/lowpoly/shapes';

/**
 * Low-poly models for Kingdom Builders: Africa, all built in code. One unit
 * is about one map tile; a person is a little under one unit tall.
 */

export const C = {
  mudBrick: 0xc99c66,
  mudDark: 0xa97c4c,
  mudLight: 0xdcc39a,
  plaster: 0xe7d6b1,
  limestone: 0xeadcb8,
  sandstone: 0xd9b37a,
  doorway: 0x3a281c,
  wood: 0x8b6a45,
  woodDark: 0x5e4630,
  palmTrunk: 0x8a6c48,
  palmLeaf: 0x5f9440,
  palmLeafDark: 0x4a7a32,
  dates: 0xc4702a,
  papyrus: 0x6f9e3c,
  papyrusTop: 0x9cc456,
  reed: 0xc9a75a,
  linen: 0xf2ecdc,
  linenShade: 0xe0d6bf,
  hair: 0x1e1712,
  jar: 0xb8663a,
  turquoise: 0x3db3a4,
  gold: 0xe2b23c,
  indigo: 0x2f4f93,
  orange: 0xe2792c,
  saffron: 0xf3b733,
  kora: 0xa5672f,
  black: 0x1f1f24,
  red: 0xd23b2f,
  white: 0xf4f4f0,
  greyLeg: 0x3a3a40,
  soil: 0x4e3a2a,
  wheatGreen: 0x7db33f,
  wheatGold: 0xe3b94b,
  water: 0x3d93b5,
  acacia: 0x7f9a3c,
  forest: 0x2f7c3f,
  forestLight: 0x4a9a4a,
  olive: 0x8aa05a,
};

export const SKIN = [0x5a3720, 0x6e4426, 0x83552f, 0x4a2c18, 0x936239];

function shadowed(g: THREE.Object3D): THREE.Object3D {
  g.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

// ── People ────────────────────────────────────────────────────────────────

export interface Person {
  group: THREE.Group;
  legs: [THREE.Object3D, THREE.Object3D];
  arms: [THREE.Object3D, THREE.Object3D];
}

export interface PersonLook {
  skin: number;
  /** Main clothing color, and an optional band or sash color. */
  cloth: number;
  band?: number;
  /** 'kilt' (a short wrap), 'dress' (to the ankle), 'robe' (a wide boubou). */
  outfit: 'kilt' | 'dress' | 'robe';
  hair?: 'short' | 'bob' | 'wrap' | 'none';
  wrap?: number;
  collar?: number;
  carry?: 'jar' | 'basket' | 'none';
  scale?: number;
}

function limb(color: number, w: number, h: number, d: number, extra?: (b: ModelBuilder) => void): THREE.Group {
  const b = new ModelBuilder().box(color, w, h, d, { y: -h });
  extra?.(b);
  return b.build();
}

/** A villager or guide. Legs and arms are separate so they can swing. */
export function person(look: PersonLook): Person {
  const group = new THREE.Group();
  const body = new ModelBuilder();
  const s = look.skin;
  const long = look.outfit !== 'kilt';
  const wide = look.outfit === 'robe';
  // Body: a tapered tunic, longer for a dress or robe.
  if (long) {
    body.cyl(look.cloth, 0.17, wide ? 0.34 : 0.24, 0.62, 7, { y: 0.06 });
    if (look.band) body.cyl(look.band, wide ? 0.3 : 0.22, wide ? 0.33 : 0.235, 0.07, 7, { y: 0.14 });
  } else {
    body.cyl(look.cloth, 0.2, 0.25, 0.2, 7, { y: 0.32 });
    body.cyl(s, 0.15, 0.19, 0.26, 7, { y: 0.52 });
    if (look.band) body.cyl(look.band, 0.205, 0.205, 0.04, 7, { y: 0.5 });
  }
  if (long) body.cyl(s, 0.12, 0.15, 0.08, 7, { y: 0.68 });
  if (look.collar) body.cyl(look.collar, 0.18, 0.19, 0.05, 8, { y: 0.66 });
  body.cyl(s, 0.05, 0.06, 0.08, 6, { y: 0.74 }); // neck
  body.add(s, wobble(new THREE.IcosahedronGeometry(0.15, 1), 0.02, 3), { y: 0.92 });
  const hair = look.hair ?? 'short';
  if (hair === 'short') body.add(C.hair, new THREE.SphereGeometry(0.158, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2.1), { y: 0.93 });
  if (hair === 'bob') {
    body.add(C.hair, new THREE.SphereGeometry(0.17, 8, 6, 0, Math.PI * 2, 0, Math.PI / 1.7), { y: 0.93 });
    body.cyl(C.hair, 0.17, 0.16, 0.14, 8, { y: 0.8, z: -0.03 });
  }
  if (hair === 'wrap') {
    body.cyl(look.wrap ?? C.saffron, 0.17, 0.155, 0.12, 8, { y: 0.98 });
    body.cyl(look.wrap ?? C.saffron, 0.2, 0.17, 0.12, 8, { y: 1.08, rx: -0.2 });
  }
  // Eyes, so you can tell which way someone is facing.
  body.box(0x16100c, 0.035, 0.04, 0.02, { x: -0.055, y: 0.92, z: 0.14 }).box(0x16100c, 0.035, 0.04, 0.02, { x: 0.055, y: 0.92, z: 0.14 });
  if (look.carry === 'jar') {
    body.cyl(C.jar, 0.1, 0.07, 0.2, 7, { y: 1.06 }).cyl(C.jar, 0.06, 0.1, 0.06, 7, { y: 1.24 });
  }
  if (look.carry === 'basket') body.cyl(C.reed, 0.2, 0.14, 0.13, 8, { y: 1.06 });
  group.add(body.build());

  const legColor = look.outfit === 'kilt' ? s : look.cloth;
  const legL = limb(legColor, 0.09, 0.32, 0.1, (b) => b.box(s, 0.1, 0.04, 0.14, { y: -0.36, z: 0.02 }));
  const legR = limb(legColor, 0.09, 0.32, 0.1, (b) => b.box(s, 0.1, 0.04, 0.14, { y: -0.36, z: 0.02 }));
  legL.position.set(-0.08, 0.36, 0);
  legR.position.set(0.08, 0.36, 0);
  if (long) {
    legL.scale.y = 0.5;
    legR.scale.y = 0.5;
    legL.position.y = 0.18;
    legR.position.y = 0.18;
  }
  const armL = limb(look.cloth === C.linen && look.outfit === 'kilt' ? s : wide ? look.cloth : s, 0.07, 0.32, 0.07);
  const armR = limb(look.cloth === C.linen && look.outfit === 'kilt' ? s : wide ? look.cloth : s, 0.07, 0.32, 0.07);
  armL.position.set(-(wide ? 0.21 : 0.19), 0.7, 0);
  armR.position.set(wide ? 0.21 : 0.19, 0.7, 0);
  if (look.carry && look.carry !== 'none') {
    armL.rotation.x = Math.PI * 0.92;
    armR.rotation.x = Math.PI * 0.92;
  }
  group.add(legL, legR, armL, armR);
  group.scale.setScalar(look.scale ?? 1);
  shadowed(group);
  return { group, legs: [legL, legR], arms: [armL, armR] };
}

/** Swing legs and arms for walking; `phase` grows with distance walked. */
export function walkPose(p: Person, phase: number, moving: boolean): void {
  const a = moving ? Math.sin(phase) * 0.6 : 0;
  p.legs[0].rotation.x = a;
  p.legs[1].rotation.x = -a;
  if (p.arms[0].rotation.x < 2) {
    p.arms[0].rotation.x = -a * 0.7;
    p.arms[1].rotation.x = a * 0.7;
  }
  p.group.children[0].position.y = moving ? Math.abs(Math.sin(phase)) * 0.04 : 0;
}

/** Jeli Awa: a young griot in an indigo boubou with her kora. */
export function jeliAwa(): Person {
  const p = person({ skin: SKIN[1], cloth: C.indigo, band: C.orange, outfit: 'robe', hair: 'wrap', wrap: C.saffron, collar: C.orange, scale: 1.2 });
  const kora = new ModelBuilder()
    .add(C.kora, new THREE.SphereGeometry(0.15, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2), { rx: Math.PI / 2, y: -0.12, z: 0.02 })
    .add(0xf0e2c0, new THREE.CircleGeometry(0.15, 9), { y: -0.12, z: 0.025 })
    .cyl(C.woodDark, 0.02, 0.025, 0.95, 5, { y: -0.2 })
    .box(0xf5efe0, 0.005, 0.62, 0.005, { x: -0.03, y: 0.02, z: 0.04 })
    .box(0xf5efe0, 0.005, 0.62, 0.005, { x: 0.03, y: 0.02, z: 0.04 })
    .build();
  kora.position.set(0.12, 0.42, 0.26);
  kora.rotation.z = -0.35;
  p.group.add(kora);
  p.arms[0].rotation.set(-0.9, 0, -0.3);
  p.arms[1].rotation.set(-1.1, 0, 0.35);
  return p;
}

/** Nebet, the Egypt chapter's guide: a farmer in white linen with a broad collar. */
export function nebet(): Person {
  return person({ skin: SKIN[2], cloth: C.linen, outfit: 'dress', hair: 'bob', collar: C.turquoise, carry: 'basket', scale: 1.08 });
}

/** Koko, the ground hornbill. Returns the bird; `wings` can flap. */
export function koko(): { group: THREE.Group; wings: [THREE.Object3D, THREE.Object3D]; head: THREE.Object3D } {
  const group = new THREE.Group();
  const body = new ModelBuilder()
    .add(C.black, wobble(new THREE.IcosahedronGeometry(0.32, 1), 0.03, 7), { y: 0.62, sx: 0.85, sz: 1.25 })
    .add(C.black, new THREE.ConeGeometry(0.14, 0.4, 6), { y: 0.62, z: -0.45, rx: -Math.PI / 2 - 0.3 })
    .cyl(C.greyLeg, 0.03, 0.03, 0.36, 5, { x: -0.1, y: 0.0 })
    .cyl(C.greyLeg, 0.03, 0.03, 0.36, 5, { x: 0.1, y: 0.0 })
    .box(C.greyLeg, 0.1, 0.03, 0.16, { x: -0.1, z: 0.04 })
    .box(C.greyLeg, 0.1, 0.03, 0.16, { x: 0.1, z: 0.04 })
    .build();
  const head = new ModelBuilder()
    .cyl(C.black, 0.08, 0.11, 0.3, 6, { y: 0 })
    .add(C.black, wobble(new THREE.IcosahedronGeometry(0.15, 1), 0.02, 11), { y: 0.33 })
    .add(C.red, new THREE.IcosahedronGeometry(0.1, 0), { y: 0.2, z: 0.07, sx: 1.1, sy: 1.2 })
    .add(C.red, new THREE.TorusGeometry(0.05, 0.02, 4, 8), { x: -0.11, y: 0.36, z: 0.04, ry: Math.PI / 2 })
    .add(C.red, new THREE.TorusGeometry(0.05, 0.02, 4, 8), { x: 0.11, y: 0.36, z: 0.04, ry: Math.PI / 2 })
    .add(0x0c0c0c, new THREE.IcosahedronGeometry(0.03, 0), { x: -0.125, y: 0.36, z: 0.04 })
    .add(0x0c0c0c, new THREE.IcosahedronGeometry(0.03, 0), { x: 0.125, y: 0.36, z: 0.04 })
    .add(0x2b2b2b, new THREE.ConeGeometry(0.075, 0.46, 6), { y: 0.3, z: 0.3, rx: Math.PI / 2 + 0.35 })
    .add(0x2b2b2b, new THREE.BoxGeometry(0.05, 0.06, 0.18), { y: 0.43, z: 0.16, rx: 0.2 })
    .build();
  head.position.set(0, 0.8, 0.28);
  const wing = () =>
    new ModelBuilder()
      .add(C.black, new THREE.BoxGeometry(0.06, 0.32, 0.6), { y: -0.12, z: -0.05 })
      .add(C.white, new THREE.BoxGeometry(0.065, 0.12, 0.3), { y: -0.26, z: -0.25 })
      .build();
  const wl = wing();
  const wr = wing();
  wl.position.set(-0.28, 0.78, 0);
  wr.position.set(0.28, 0.78, 0);
  group.add(body, head, wl, wr);
  shadowed(group);
  return { group, wings: [wl, wr], head };
}

// ── Plants ────────────────────────────────────────────────────────────────

export function datePalm(seed: number, height = 2.4): THREE.Group {
  const r = rand(seed);
  const b = new ModelBuilder();
  const segs = 6;
  const lean = (r() - 0.5) * 0.3;
  let x = 0;
  for (let i = 0; i < segs; i++) {
    const h = height / segs;
    x += lean * h;
    b.cyl(i % 2 ? C.palmTrunk : 0x7a5e3e, 0.07, 0.09, h * 1.02, 6, { x, y: i * h, rz: -lean });
  }
  const top = { x, y: height };
  const fronds = 8;
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + r();
    const droop = 0.5 + r() * 0.5;
    const leaf = new THREE.ConeGeometry(0.16, 1.3, 3);
    leaf.translate(0, 0.65, 0);
    leaf.scale(1, 1, 0.25);
    // Tilt the leaf out from upright, then spin it around the trunk.
    leaf.rotateX(Math.PI / 2 - droop);
    leaf.rotateY(a);
    b.add(i % 2 ? C.palmLeaf : C.palmLeafDark, leaf, { x: top.x, y: top.y });
  }
  b.ball(C.dates, 0.12, 0, { x: top.x + 0.1, y: top.y - 0.12 });
  b.ball(C.dates, 0.1, 0, { x: top.x - 0.08, y: top.y - 0.15, z: 0.06 });
  return b.build();
}

export function papyrus(seed: number): THREE.Group {
  const r = rand(seed);
  const b = new ModelBuilder();
  for (let i = 0; i < 9; i++) {
    const x = (r() - 0.5) * 0.6;
    const z = (r() - 0.5) * 0.6;
    const h = 0.8 + r() * 0.7;
    const tilt = (r() - 0.5) * 0.4;
    b.cyl(C.papyrus, 0.012, 0.02, h, 4, { x, z, rz: tilt, rx: tilt * 0.5 });
    const top = new THREE.ConeGeometry(0.16, 0.2, 6);
    top.rotateX(Math.PI);
    b.add(C.papyrusTop, top, { x: x - Math.sin(tilt) * h, y: h, z: z + Math.sin(tilt * 0.5) * h });
  }
  return b.build();
}

export function acacia(seed: number): THREE.Group {
  const r = rand(seed);
  return new ModelBuilder()
    .cyl(C.woodDark, 0.05, 0.08, 1.1, 5, { rz: (r() - 0.5) * 0.3 })
    .add(C.acacia, wobble(new THREE.IcosahedronGeometry(0.7, 0), 0.15, seed), { y: 1.25, sy: 0.28 })
    .build();
}

// ── Buildings ─────────────────────────────────────────────────────────────

/** An Egyptian mud-brick house with a flat roof, a roof shade and steps. */
export function mudHouse(seed: number): THREE.Group {
  const r = rand(seed);
  const w = 1.3 + r() * 0.4;
  const d = 1.1 + r() * 0.3;
  const h = 0.9 + r() * 0.25;
  const b = new ModelBuilder();
  b.add(C.mudBrick, wobble(new THREE.BoxGeometry(w, h, d, 2, 1, 2), 0.04, seed), { y: h / 2 });
  b.box(C.mudDark, w + 0.06, 0.1, d + 0.06, { y: h });
  b.box(C.mudBrick, w, 0.12, 0.08, { y: h + 0.1, z: d / 2 - 0.04 });
  b.box(C.mudBrick, w, 0.12, 0.08, { y: h + 0.1, z: -d / 2 + 0.04 });
  b.box(C.doorway, 0.3, 0.55, 0.04, { y: 0, z: d / 2 + 0.01, x: -w * 0.18 });
  b.box(C.doorway, 0.16, 0.14, 0.04, { y: h * 0.55, z: d / 2 + 0.01, x: w * 0.25 });
  // Steps up to the roof, where families slept on hot nights.
  for (let i = 0; i < 3; i++) b.box(C.mudDark, 0.3, 0.25 * (i + 1), 0.25, { x: w / 2 + 0.15, z: d / 2 - 0.15 - i * 0.25 });
  if (r() > 0.35) {
    // A shade of palm leaves on four poles.
    for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) b.cyl(C.wood, 0.025, 0.025, 0.5, 4, { x: px * w * 0.3, y: h + 0.1, z: pz * d * 0.25 });
    b.box(C.palmLeafDark, w * 0.7, 0.05, d * 0.6, { y: h + 0.6 });
  } else {
    b.cyl(C.jar, 0.1, 0.08, 0.22, 6, { x: w * 0.25, y: h + 0.1, z: 0 });
  }
  return b.build();
}

/** Domed grain stores on a raised floor, like the models found in Egyptian tombs. */
export function granary(): THREE.Group {
  const b = new ModelBuilder();
  b.box(C.mudDark, 2.4, 0.25, 1.1);
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.75;
    b.cyl(C.plaster, 0.33, 0.36, 0.8, 9, { x, y: 0.25 });
    b.dome(C.plaster, 0.33, 9, 4, { x, y: 1.05 });
    b.box(C.doorway, 0.14, 0.16, 0.04, { x, y: 0.42, z: 0.35 });
    b.cyl(C.mudDark, 0.08, 0.08, 0.06, 6, { x, y: 1.36 });
  }
  b.box(C.wheatGold, 0.4, 0.18, 0.3, { x: 1.4, z: 0.4 });
  return b.build();
}

/**
 * A shaduf: a long pole on a frame, with a mud weight on one end and a
 * bucket on the other, used to lift river water into the canals.
 */
export function shaduf(): { group: THREE.Group; arm: THREE.Group } {
  const group = new THREE.Group();
  const frame = new ModelBuilder()
    .cyl(C.wood, 0.05, 0.06, 1.3, 5, { x: -0.25 })
    .cyl(C.wood, 0.05, 0.06, 1.3, 5, { x: 0.25 })
    .box(C.woodDark, 0.65, 0.08, 0.08, { y: 1.25 })
    .build();
  const arm = new THREE.Group();
  arm.add(
    new ModelBuilder()
      .box(C.wood, 0.06, 0.06, 3, { y: -0.03, z: 0 })
      .ball(C.mudDark, 0.2, 0, { z: -1.45 })
      .box(C.reed, 0.01, 0.9, 0.01, { y: -0.9, z: 1.45 })
      .cyl(C.jar, 0.11, 0.08, 0.16, 6, { y: -1.05, z: 1.45 })
      .build(),
  );
  arm.position.set(0, 1.3, 0);
  group.add(frame, arm);
  shadowed(group);
  return { group, arm };
}

/** A reed boat with a square sail, as on the Nile. */
export function reedBoat(): THREE.Group {
  const hull = new THREE.SphereGeometry(0.5, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const b = new ModelBuilder()
    .add(C.reed, hull, { y: 0.18, sx: 3, sy: 0.5, sz: 0.8 })
    .cyl(0xb8964c, 0.5, 0.5, 0.05, 10, { y: 0.15, sx: 3, sz: 0.8 })
    .box(0xa8873f, 2.6, 0.03, 0.04, { y: 0.2, z: 0.15 })
    .box(0xa8873f, 2.6, 0.03, 0.04, { y: 0.2, z: -0.15 })
    .add(C.reed, new THREE.ConeGeometry(0.12, 0.7, 5), { x: -1.55, y: 0.35, rz: Math.PI / 2 + 0.6 })
    .add(C.reed, new THREE.ConeGeometry(0.12, 0.7, 5), { x: 1.55, y: 0.35, rz: -Math.PI / 2 - 0.6 })
    .cyl(C.wood, 0.03, 0.03, 1.7, 4, { y: 0.15 })
    .box(C.linen, 0.04, 1.1, 1.0, { y: 0.55, x: 0.05 })
    .box(C.woodDark, 0.05, 0.05, 1.1, { y: 1.67 });
  return b.build();
}

/** A field of wheat: the soil and rows of stalks (green, gold, or none in the flood). */
export function wheatField(w: number, d: number, stage: 'none' | 'green' | 'gold', seed: number): THREE.Group {
  const group = new THREE.Group();
  const soil = new ModelBuilder().box(C.soil, w, 0.06, d).build();
  group.add(soil);
  // Low mud walls between basins hold the water in.
  group.add(
    new ModelBuilder()
      .box(0x6a4c34, w, 0.12, 0.08, { z: d / 2 })
      .box(0x6a4c34, w, 0.12, 0.08, { z: -d / 2 })
      .box(0x6a4c34, 0.08, 0.12, d, { x: w / 2 })
      .box(0x6a4c34, 0.08, 0.12, d, { x: -w / 2 })
      .build(),
  );
  if (stage === 'none') return group;
  const r = rand(seed);
  const stalk = new THREE.ConeGeometry(0.06, 0.45, 4);
  stalk.translate(0, 0.27, 0);
  const n = Math.round(w * d * 14);
  const mesh = new THREE.InstancedMesh(stalk, mat(stage === 'gold' ? C.wheatGold : C.wheatGreen), n);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    const x = (r() - 0.5) * (w - 0.2);
    const z = (Math.floor(r() * Math.round(d * 4)) / Math.round(d * 4) - 0.5) * (d - 0.2) + 0.1;
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.25, r() * 3, (r() - 0.5) * 0.25));
    const sy = stage === 'gold' ? 1 + r() * 0.3 : 0.7 + r() * 0.3;
    m.compose(new THREE.Vector3(x, 0.03, z), q, new THREE.Vector3(1, sy, 1));
    mesh.setMatrixAt(i, m);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

/**
 * A pyramid part way built: stepped core of stone, a mud-brick ramp,
 * and blocks waiting to be dragged up. `levels` of 8 are done.
 */
export function pyramidBuild(levels: number): THREE.Group {
  const b = new ModelBuilder();
  const total = 8;
  const base = 9;
  for (let i = 0; i < levels; i++) {
    const s = base * (1 - i / total);
    const finished = i < levels - 1;
    b.add(finished ? C.limestone : C.sandstone, wobble(new THREE.BoxGeometry(s, 0.75, s, 3, 1, 3), 0.05, 40 + i), { y: 0.375 + i * 0.75 });
  }
  const topY = levels * 0.75;
  // The ramp, built of mud brick, goes up one face.
  const rampLen = Math.hypot(topY, 7);
  b.add(C.mudBrick, new THREE.BoxGeometry(1.5, 0.4, rampLen), { x: 1.5, y: topY / 2, z: base / 2 + 3.2 - 0.3, rx: Math.atan2(topY, 7) });
  // Blocks waiting at the foot of the ramp.
  for (let i = 0; i < 6; i++) b.box(C.sandstone, 0.55, 0.4, 0.55, { x: -1.5 + (i % 3) * 0.7, z: base / 2 + 4.2 + Math.floor(i / 3) * 0.7 });
  return b.build();
}

/** A sledge with a stone block on it, pulled by workers up the ramp. */
export function sledge(): THREE.Group {
  return new ModelBuilder()
    .box(C.woodDark, 0.6, 0.08, 1, {})
    .box(C.sandstone, 0.55, 0.45, 0.55, { y: 0.08 })
    .build();
}

/** A row house in the pyramid builders' town. */
export function workersRow(seed: number): THREE.Group {
  const b = new ModelBuilder();
  for (let i = 0; i < 4; i++) {
    b.add(C.mudLight, wobble(new THREE.BoxGeometry(1, 0.8, 1.2), 0.03, seed + i), { x: i * 1.02, y: 0.4 });
    b.box(C.doorway, 0.25, 0.45, 0.03, { x: i * 1.02, z: 0.6 });
  }
  b.box(C.mudDark, 4.2, 0.08, 1.3, { x: 1.53, y: 0.8 });
  return b.build();
}

/** A bakery with round ovens and a cooking fire: the workers were fed bread every day. */
export function bakery(): THREE.Group {
  return new ModelBuilder()
    .box(C.mudLight, 2, 0.35, 1.2)
    .dome(C.mudDark, 0.35, 7, 3, { x: -0.5, y: 0.35 })
    .dome(C.mudDark, 0.35, 7, 3, { x: 0.4, y: 0.35 })
    .cyl(C.jar, 0.15, 0.12, 0.3, 6, { x: 0.9, z: 0.6 })
    .cyl(C.jar, 0.12, 0.1, 0.25, 6, { x: 1.15, z: 0.4 })
    .build();
}

/** A tiny pyramid group for the hub map. */
export function miniPyramids(): THREE.Group {
  const p = (s: number) => {
    const g = new THREE.ConeGeometry(s * 0.71, s * 0.64, 4);
    g.rotateY(Math.PI / 4);
    return g;
  };
  return new ModelBuilder()
    .add(C.limestone, p(1), { y: 0.32 })
    .add(C.limestone, p(0.8), { x: -0.9, z: 0.5, y: 0.26 })
    .add(C.sandstone, p(0.5), { x: -1.5, z: 0.9, y: 0.16 })
    .build();
}

export function rainforestTree(seed: number): THREE.Group {
  const r = rand(seed);
  return new ModelBuilder()
    .cyl(C.woodDark, 0.06, 0.09, 0.9, 5)
    .add(r() > 0.5 ? C.forest : C.forestLight, wobble(new THREE.IcosahedronGeometry(0.5, 0), 0.12, seed), { y: 1.05 })
    .build();
}
