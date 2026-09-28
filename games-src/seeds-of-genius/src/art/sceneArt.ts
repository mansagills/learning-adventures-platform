import { PixelBuffer, mix } from './pixel';
import { P } from './palette';
import { paintCharacter, type CharacterLook } from './characters';
import { paintProp } from './props';
import { hash2 } from '../core/rng';

/**
 * Larger storybook paintings (96x64 pixels): the memory pages from Carver's
 * life and the close-up views of each garden spot. Shown scaled up with
 * pixelated rendering.
 */

export const PAINT_W = 96;
export const PAINT_H = 64;

/** Young George: drawn as a child, never as the adult Carver. */
const YOUNG_GEORGE: CharacterLook = {
  build: 'kid',
  skin: { base: '#6e4329', shade: '#573320' },
  hair: { style: 'short', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
  shirt: { base: '#b89a68', shade: '#9a7f52' },
  pants: '#5a4a3a',
  shoes: '#3a2a22',
  accessory: 'none',
  accent: P.flowerYellow,
};

const NEIGHBOR: CharacterLook = {
  build: 'adult',
  skin: { base: '#c08a5c', shade: '#a47049' },
  hair: { style: 'wrap', base: '#4a2f22', shade: '#352016', light: '#664335' },
  shirt: { base: '#8a5cc4', shade: '#6d469e' },
  pants: '#4a4038',
  shoes: '#2f2521',
  accessory: 'none',
  accent: '#dc6f9c',
};

function sky(b: PixelBuffer, top: string, bottom: string, horizon: number): void {
  for (let y = 0; y < horizon; y++) b.hline(0, PAINT_W - 1, y, mix(top, bottom, y / Math.max(1, horizon - 1)));
}

function grassField(b: PixelBuffer, fromY: number, seed: number): void {
  b.rect(0, fromY, PAINT_W, PAINT_H - fromY, P.grass1);
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(hash2(i, 1, seed) * PAINT_W);
    const y = fromY + Math.floor(hash2(i, 2, seed) * (PAINT_H - fromY));
    b.set(x, y, i % 3 ? P.grass2 : P.grass3);
  }
}

function hills(b: PixelBuffer, y: number, color: string, seed: number): void {
  for (let x = 0; x < PAINT_W; x++) {
    const h = Math.round(4 + Math.sin(x / 11 + seed) * 3 + Math.sin(x / 5 + seed * 2) * 1.5);
    b.vline(x, y - h, y, color);
  }
}

function flower(b: PixelBuffer, x: number, y: number, c: string): void {
  b.vline(x, y + 1, y + 4, P.leaf1);
  b.set(x - 1, y, c);
  b.set(x + 1, y, c);
  b.set(x, y - 1, c);
  b.set(x, y + 1, c);
  b.set(x, y, P.flowerYellow);
}

function blitScaled(dst: PixelBuffer, src: PixelBuffer, dx: number, dy: number): void {
  dst.blit(src, dx, dy);
}

// ------------------------------------------------------------ memories

function memoryFarm(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#9fd3ee', '#f6e2b8', 30);
  hills(b, 30, '#7fae66', 1);
  grassField(b, 30, 3);
  // log cabin
  b.rect(8, 22, 30, 18, '#8a5a3a');
  for (let y = 23; y < 40; y += 3) b.hline(8, 37, y, '#6e472e');
  for (let j = 0; j < 9; j++) b.hline(6 + j, 39 - j, 21 - j, j % 2 ? '#6e472e' : '#5c3822');
  b.rect(19, 30, 7, 10, '#3a2a22');
  b.rect(11, 26, 5, 5, P.windowDark);
  b.rect(30, 26, 5, 5, P.windowDark);
  b.rect(32, 8, 4, 9, P.cobble2);
  // rail fence
  for (let x = 44; x < 96; x += 10) b.rect(x, 34, 2, 9, P.wood2);
  b.hline(42, 95, 36, P.wood1);
  b.hline(42, 95, 40, P.wood1);
  // garden rows
  for (let x = 50; x < 92; x += 6) for (let y = 48; y < 60; y += 5) b.rect(x, y, 3, 2, P.leaf2);
  b.rect(46, 46, 48, 1, P.soil2);
  // young George by the garden
  blitScaled(b, paintCharacter(YOUNG_GEORGE, 'right', 0), 40, 38);
  flower(b, 60, 44, P.flowerRed);
  return b;
}

function memoryWoods(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#bfe3c8', '#e8f2d8', 20);
  // back trees
  for (let i = 0; i < 6; i++) {
    const t = paintProp('tree', i % 3);
    b.blit(t, -8 + i * 18, -6 + (i % 2) * 4);
  }
  grassField(b, 36, 7);
  // forest floor: leaves, rocks
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(hash2(i, 5, 2) * PAINT_W);
    const y = 38 + Math.floor(hash2(i, 6, 2) * 24);
    b.set(x, y, i % 2 ? '#c98c4a' : '#a4553d');
  }
  b.ellipse(66, 50, 12, 7, P.cobble2);
  b.ellipse(68, 50, 6, 3, P.cobble3);
  // flowers and a butterfly
  [
    [30, 50, P.flowerPurple],
    [36, 54, P.flowerWhite],
    [44, 48, P.flowerPink],
  ].forEach(([x, y, c]) => flower(b, x as number, y as number, c as string));
  b.rect(52, 30, 2, 2, P.flowerYellow);
  b.rect(55, 30, 2, 2, P.flowerYellow);
  b.set(54, 31, P.outline);
  // George looking closely at a flower
  blitScaled(b, paintCharacter(YOUNG_GEORGE, 'right', 0), 14, 34);
  return b;
}

function memoryDoctor(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#a8dcf0', '#fbeec8', 26);
  hills(b, 26, '#8cc463', 4);
  grassField(b, 26, 9);
  // little garden bed with healthy plants
  b.rect(8, 44, 46, 12, P.soil1);
  for (let x = 10; x < 52; x += 4) b.hline(8, 53, 47 + ((x / 4) % 2), P.soil2);
  for (let x = 12; x < 52; x += 8) {
    b.vline(x, 36, 45, P.leaf1);
    b.ellipse(x - 3, 34, 7, 5, P.leaf2);
    b.set(x, 33, P.flowerRed);
  }
  // neighbor holding a drooping plant in a pot
  blitScaled(b, paintCharacter(NEIGHBOR, 'left', 0), 70, 30);
  b.rect(64, 44, 6, 5, '#b8634a');
  b.vline(66, 38, 43, '#9a9a52');
  b.hline(62, 66, 38, '#b5a95a');
  b.set(61, 39, '#b5a95a');
  // George with a watering can
  blitScaled(b, paintCharacter(YOUNG_GEORGE, 'right', 0), 50, 34);
  b.rect(46, 46, 5, 4, P.metalLight);
  b.hline(43, 46, 45, P.metalLight);
  [[42, 47], [41, 49], [42, 51]].forEach(([x, y]) => b.set(x, y, P.water2));
  return b;
}

// ------------------------------------------------------------ garden close-ups

function soilBase(b: PixelBuffer, fromY: number, seed: number, dry = false): void {
  const base = dry ? '#b08a62' : P.soil1;
  b.rect(0, fromY, PAINT_W, PAINT_H - fromY, base);
  for (let i = 0; i < 160; i++) {
    const x = Math.floor(hash2(i, 3, seed) * PAINT_W);
    const y = fromY + Math.floor(hash2(i, 4, seed) * (PAINT_H - fromY));
    b.set(x, y, i % 2 ? mix(base, P.outline, 0.25) : mix(base, P.white, 0.12));
  }
}

function leaf(b: PixelBuffer, x: number, y: number, w: number, h: number, c: string, vein: string): void {
  b.ellipse(x, y, w, h, c);
  b.hline(x + 2, x + w - 3, y + Math.floor(h / 2), vein);
}

function spotBeans(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#cfe8c0', '#e7f2d2', 50);
  soilBase(b, 50, 1);
  b.rect(46, 4, 3, 50, P.wood2); // bean pole
  leaf(b, 18, 12, 30, 20, P.leaf2, P.leaf1); // the big leaf
  leaf(b, 50, 20, 24, 16, P.leaf3, P.leaf2);
  leaf(b, 30, 34, 20, 13, P.leaf2, P.leaf1);
  // three round holes in the big leaf
  [
    [26, 16],
    [34, 20],
    [29, 25],
  ].forEach(([x, y]) => {
    b.ellipse(x, y, 4, 4, '#dcebc9');
    b.set(x, y + 1, '#8a7a4a');
  });
  // leaf shadow + tiny caterpillar on the underside
  b.hline(20, 45, 32, P.leaf4);
  b.rect(30, 33, 7, 2, '#7ec850');
  b.set(36, 33, P.outline);
  b.set(31, 35, '#5aa23a');
  b.set(33, 35, '#5aa23a');
  // pods
  b.rect(52, 38, 2, 9, P.leaf1);
  b.rect(56, 40, 2, 8, P.leaf1);
  return b;
}

function spotSoil(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  soilBase(b, 0, 2);
  // fence post and its shade
  b.rect(70, 0, 10, 40, P.wood3);
  b.vline(70, 0, 39, P.wood1);
  b.rect(60, 30, 36, 34, mix(P.soil1, P.outline, 0.25));
  // dark damp patch with a shine
  b.ellipse(18, 30, 44, 22, '#4e3222');
  b.ellipse(24, 34, 30, 12, '#432b1d');
  b.set(30, 36, '#9ab8c8');
  b.set(44, 40, '#9ab8c8');
  // earthworm
  const worm = [
    [30, 44], [31, 43], [32, 43], [33, 44], [34, 45], [35, 45], [36, 44], [37, 43], [38, 43], [39, 44],
  ];
  worm.forEach(([x, y]) => {
    b.set(x, y - 1, '#f0a0a0');
    b.set(x, y, '#e08a8a');
    b.set(x, y + 1, '#c86a70');
  });
  // pebbles
  [[8, 10], [52, 12], [12, 54], [80, 52]].forEach(([x, y]) => b.ellipse(x, y, 5, 3, P.cobble1));
  return b;
}

function spotLadybug(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  soilBase(b, 0, 3);
  b.ellipse(4, 4, 88, 58, P.leaf3); // lettuce leaf
  b.ellipse(10, 8, 76, 48, '#8fd06a');
  for (let i = 0; i < 6; i++) b.hline(20 + i * 2, 76 - i * 3, 12 + i * 7, P.leaf2);
  b.vline(48, 8, 58, P.leaf2);
  // ladybug: red, 7 black spots
  b.ellipse(26, 24, 16, 13, '#d8403a');
  b.ellipse(29, 21, 10, 5, P.outline); // head
  b.vline(34, 26, 36, '#7a1e1a');
  [[29, 28], [38, 28], [31, 32], [37, 32], [33, 35], [28, 34], [39, 34]].forEach(([x, y]) => b.rect(x, y, 2, 2, P.outline));
  b.set(31, 26, '#ff9a8a');
  // aphids
  [[60, 30], [63, 32], [66, 30], [62, 35], [67, 34], [70, 32]].forEach(([x, y]) => {
    b.rect(x, y, 2, 2, '#cfe8a0');
    b.set(x + 2, y + 1, '#a8c878');
  });
  return b;
}

function spotCarrots(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#d8eccb', '#eef4de', 40);
  soilBase(b, 40, 4, true);
  // cracks in dry soil
  [[10, 48, 22], [40, 52, 18], [66, 46, 20]].forEach(([x, y, w]) => {
    for (let i = 0; i < w; i++) b.set(x + i, y + Math.round(Math.sin(i / 2) * 1.5), '#7d5f40');
  });
  // feathery carrot tops
  for (const cx of [18, 42, 70]) {
    for (let i = -8; i <= 8; i += 2) {
      const tipY = 10 + Math.abs(i);
      for (let y = tipY; y < 40; y++) b.set(cx + Math.round((i * (40 - y)) / 30), y, P.leaf1);
      b.set(cx + Math.round((i * (40 - tipY)) / 30), tipY, i % 4 === 0 ? '#d8c24a' : P.leaf3);
      b.set(cx + Math.round((i * (40 - tipY - 1)) / 30), tipY + 1, i % 4 === 0 ? '#c9a83a' : P.leaf2);
    }
    b.rect(cx - 2, 40, 5, 3, '#e0823a');
  }
  return b;
}

function spotBee(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#bfe3f0', '#e6f4f8', PAINT_H);
  // stems and leaves
  b.vline(40, 34, 63, P.leaf1);
  b.ellipse(26, 46, 14, 6, P.leaf2);
  // five white petals around a yellow middle
  const cx = 40;
  const cy = 26;
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    b.ellipse(Math.round(cx + Math.cos(a) * 11) - 6, Math.round(cy + Math.sin(a) * 11) - 6, 13, 13, P.flowerWhite);
  }
  b.ellipse(cx - 6, cy - 6, 13, 13, P.flowerYellow);
  b.ellipse(cx - 3, cy - 3, 6, 6, '#e0a93a');
  // bee
  b.ellipse(56, 16, 18, 11, '#f2c94c');
  [60, 64, 68].forEach((x) => b.vline(x, 17, 25, P.outline));
  b.ellipse(71, 17, 7, 8, P.outline);
  b.ellipse(56, 8, 10, 7, '#e8f4ff'); // wings
  b.ellipse(62, 7, 9, 6, '#dcecff');
  // pollen on the back legs
  b.rect(55, 27, 4, 3, '#f0a020');
  b.rect(62, 28, 4, 3, '#f0a020');
  b.vline(57, 25, 27, P.outline);
  b.vline(64, 26, 28, P.outline);
  return b;
}

function spotSnail(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  soilBase(b, 0, 6);
  b.rect(4, 4, 88, 14, P.wood1); // the board, lifted
  b.hline(4, 91, 17, P.wood2);
  b.rect(4, 18, 88, 6, mix(P.soil1, P.outline, 0.35));
  // slime trail
  for (let x = 10; x < 46; x++) b.set(x, 44 + Math.round(Math.sin(x / 4)), '#cfe3ea');
  // snail
  b.ellipse(46, 34, 18, 16, '#b8864a');
  b.ellipse(50, 38, 10, 9, '#9a6a36');
  b.ellipse(53, 41, 4, 4, '#b8864a');
  b.rect(40, 46, 28, 4, '#a89a8a');
  b.vline(66, 40, 46, '#a89a8a');
  b.vline(69, 41, 46, '#a89a8a');
  b.set(66, 39, P.outline);
  b.set(69, 40, P.outline);
  return b;
}

function spotMushrooms(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  grassField(b, 0, 11);
  b.rect(0, 0, 30, 64, P.trunk); // tree trunk
  b.vline(10, 0, 63, mix(P.trunk, P.outline, 0.3));
  b.ellipse(22, 44, 30, 16, P.trunk); // root
  [[40, 30, 16], [58, 36, 12], [72, 28, 18]].forEach(([x, y, w]) => {
    b.rect(x + w / 2 - 2, y + 6, 5, 12, '#f1e3c6');
    b.ellipse(x, y, w, 10, '#c9483f');
    b.set(x + 4, y + 3, P.white);
    b.set(x + w - 5, y + 4, P.white);
    b.set(x + w / 2, y + 2, P.white);
  });
  return b;
}

// ------------------------------------------------------------ Chapter 2: the journey

/** George as a teenager and as a young man (dark hair: he is not yet the gray-haired guide). */
const TEEN_GEORGE: CharacterLook = { ...YOUNG_GEORGE, build: 'adult', shirt: { base: '#c9b27a', shade: '#a8925e' } };
const YOUNG_MAN_GEORGE: CharacterLook = {
  ...YOUNG_GEORGE,
  build: 'adult',
  shirt: { base: '#f4efe4', shade: '#d9d2c2' },
  pants: '#4a4038',
  extras: { jacket: { base: '#5a4a6b', shade: '#46394f' }, tie: '#2f2521', mustache: '#2a1f1d' },
};
const TEACHER: CharacterLook = {
  build: 'adult',
  skin: { base: '#f0c9a4', shade: '#d9ab86' },
  hair: { style: 'bun', base: '#7a4a2a', shade: '#5d371e', light: '#96603a' },
  shirt: { base: '#2f7a6a', shade: '#235e51' },
  pants: '#3a3a44',
  shoes: '#2f2521',
  accessory: 'none',
  accent: P.flowerYellow,
};

function room(b: PixelBuffer, wall: string, floor: string): void {
  b.rect(0, 0, PAINT_W, 44, wall);
  b.rect(0, 44, PAINT_W, 20, floor);
  for (let x = 0; x < PAINT_W; x += 8) b.vline(x, 44, 63, mix(floor, P.outline, 0.2));
  b.hline(0, PAINT_W - 1, 44, mix(wall, P.outline, 0.3));
}

function ch2Reading(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  room(b, '#8a5a3a', '#6e472e');
  for (let y = 4; y < 44; y += 6) b.hline(0, PAINT_W - 1, y, '#7a4f33'); // log walls
  b.rect(60, 8, 20, 16, '#f2d38a'); // window light
  b.vline(70, 8, 23, P.wood2);
  b.rect(10, 34, 30, 4, P.wood3); // table
  b.rect(12, 38, 2, 10, P.wood2);
  b.rect(36, 38, 2, 10, P.wood2);
  b.rect(20, 30, 10, 4, P.paper); // open book
  b.vline(25, 30, 33, P.paper2);
  b.rect(32, 26, 3, 8, '#e0a93a'); // lamp
  b.set(33, 25, P.lampGlow);
  b.blit(paintCharacter(YOUNG_GEORGE, 'right', 0), 44, 30);
  return b;
}

function ch2Neosho(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#a8dcf0', '#f6e2b8', 30);
  hills(b, 30, '#8cc463', 2);
  grassField(b, 30, 4);
  for (let y = 36; y < 64; y++) b.hline(40 - Math.floor((y - 36) / 2), 52 + Math.floor((y - 36) / 2), y, P.path1); // road
  b.rect(62, 14, 26, 18, P.plaster); // small schoolhouse
  for (let j = 0; j < 7; j++) b.hline(60 + j, 89 - j, 13 - j, P.roofRed2);
  b.rect(72, 22, 6, 10, P.wood2);
  b.rect(73, 2, 3, 4, P.gold); // bell
  b.blit(paintCharacter(YOUNG_GEORGE, 'up', 1), 38, 40);
  b.rect(52, 50, 4, 3, '#b89a68'); // bundle
  return b;
}

function ch2Kansas(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#bfe3f0', '#f8ecc8', 34);
  grassField(b, 34, 6);
  for (let x = 0; x < PAINT_W; x += 3) b.vline(x, 30 + (x % 2), 34, '#d9c26a'); // prairie grass
  b.rect(6, 12, 30, 22, '#d8c4a0'); // small town building
  b.rect(6, 10, 30, 3, P.wood2);
  b.rect(14, 22, 6, 12, P.wood2);
  b.rect(24, 18, 8, 6, P.windowDark);
  b.hline(50, 92, 24, P.ink); // clothesline
  [54, 62, 70, 80].forEach((x, i) => b.rect(x, 25, 6, 8, [P.white, '#9fd3ee', P.flowerYellow, P.white][i]));
  b.rect(44, 44, 14, 8, P.metalLight); // wash tub
  b.hline(44, 57, 44, P.metal);
  b.blit(paintCharacter(TEEN_GEORGE, 'left', 0), 58, 32);
  b.rect(76, 50, 8, 3, '#7a3f2c'); // books on a crate
  b.rect(76, 47, 8, 3, '#3e5a88');
  return b;
}

function ch2Highland(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#c8d4e0', '#e8e4dc', 40);
  grassField(b, 40, 8);
  b.rect(30, 4, 60, 36, P.brick1); // college building
  for (let y = 6; y < 40; y += 4) b.hline(30, 89, y, P.brick2);
  b.rect(54, 22, 12, 18, '#4a3326'); // closed doors
  b.vline(60, 22, 39, P.outline);
  [36, 76].forEach((x) => b.rect(x, 12, 8, 8, P.windowDark));
  b.rect(50, 40, 20, 3, P.cobble2); // steps
  b.blit(paintCharacter(YOUNG_MAN_GEORGE, 'right', 0), 20, 34);
  b.rect(10, 52, 8, 7, '#8a5a3a'); // suitcase
  b.rect(12, 50, 4, 2, P.outline);
  b.rect(32, 44, 5, 4, P.paper); // letter in hand
  return b;
}

function ch2Simpson(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  room(b, '#efe0bf', '#a0643c');
  b.rect(8, 6, 22, 16, P.wood2); // window
  b.rect(10, 8, 18, 12, '#9fd3ee');
  b.rect(48, 14, 22, 20, P.wood1); // easel canvas with a painted flower
  b.rect(50, 16, 18, 16, P.paper);
  b.vline(59, 22, 31, P.leaf1);
  b.ellipse(54, 17, 10, 8, '#dc6f9c');
  b.ellipse(57, 19, 4, 4, P.flowerYellow);
  b.vline(52, 34, 50, P.wood2);
  b.vline(66, 34, 50, P.wood2);
  b.blit(paintCharacter(YOUNG_MAN_GEORGE, 'right', 0), 28, 30);
  b.blit(paintCharacter(TEACHER, 'left', 0), 72, 30);
  b.rect(80, 50, 10, 6, '#b8634a'); // potted plant model
  b.ellipse(80, 42, 10, 9, P.leaf2);
  return b;
}

function ch2IowaState(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#a8dcf0', '#eaf6e8', 28);
  grassField(b, 28, 10);
  b.rect(46, 6, 44, 24, P.glass1); // greenhouse
  for (let x = 46; x < 90; x += 6) b.vline(x, 6, 29, P.glassFrame);
  b.hline(46, 89, 6, P.glassFrame);
  for (let x = 48; x < 88; x += 5) b.vline(x, 22, 28, P.leaf2);
  for (let x = 4; x < 40; x += 6) for (let y = 40; y < 62; y += 6) b.rect(x, y, 3, 3, P.leaf2); // test plots
  b.blit(paintCharacter(YOUNG_MAN_GEORGE, 'down', 0), 22, 26);
  b.rect(38, 36, 6, 8, P.paper); // diploma scroll
  b.hline(38, 43, 40, '#c9483f');
  return b;
}

function ch2Tuskegee(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#9fd3ee', '#fbeec8', 30);
  grassField(b, 30, 12);
  b.rect(12, 6, 58, 26, P.brick1);
  for (let y = 8; y < 32; y += 4) b.hline(12, 69, y, P.brick2);
  for (const x of [18, 32, 46, 60]) b.rect(x, 12, 6, 8, P.windowDark);
  b.rect(36, 22, 10, 10, P.wood2);
  for (let j = 0; j < 6; j++) b.hline(10 + j, 71 - j, 5 - j, P.roofRed2);
  b.blit(paintCharacter({ ...YOUNG_MAN_GEORGE, extras: { ...YOUNG_MAN_GEORGE.extras, lapelFlower: '#e0574f' } }, 'down', 0), 74, 34);
  return b;
}

// ------------------------------------------------------------------ Chapter 3

/** Magnified soil from the tired west plot: pale, crusted, almost lifeless. */
function soilWest(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  soilBase(b, 0, 31, true);
  // the crust on top, split by cracks
  b.rect(40, 4, 50, 20, '#c7a57a');
  const crack = (pts: Array<[number, number]>) => pts.forEach(([x, y]) => b.set(x, y, '#6e5236'));
  for (let i = 0; i < 12; i++) crack([[46 + i, 8 + (i % 3)], [60 + (i % 4), 6 + i], [70 + i, 14 + (i % 2)]]);
  for (let i = 0; i < 8; i++) crack([[80 + (i % 3), 6 + i * 2], [52 + i, 18 + (i % 2)]]);
  // sandy specks
  for (let i = 0; i < 40; i++) b.set(4 + Math.floor(hash2(i, 5, 7) * 30), 4 + Math.floor(hash2(i, 6, 7) * 22), '#e2cda4');
  // a lower, dusty layer with one thin cotton root
  b.rect(0, 30, PAINT_W, 34, '#a4815a');
  for (let i = 0; i < 70; i++) b.set(Math.floor(hash2(i, 8, 3) * PAINT_W), 30 + Math.floor(hash2(i, 9, 3) * 34), '#8e6e4c');
  for (let y = 30; y < 60; y++) b.set(52 + Math.round(Math.sin(y / 5) * 2), y, '#e6dcc0');
  b.hline(0, PAINT_W - 1, 29, '#8a6a48');
  return b;
}

/** Magnified soil from the rotated east plot: dark, crumbly, full of life. */
function soilEast(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  soilBase(b, 0, 32);
  b.rect(0, 0, PAINT_W, 30, '#5a3a26');
  // crumbs
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(hash2(i, 1, 11) * 90);
    const y = Math.floor(hash2(i, 2, 11) * 26);
    b.ellipse(x, y, 4, 3, i % 2 ? '#6e4a30' : '#432b1d');
  }
  // bits of old leaves
  [[8, 20], [30, 6], [84, 22]].forEach(([x, y]) => b.rect(x, y, 3, 2, '#8a7a3a'));
  // earthworm
  for (let i = 0; i < 24; i++) {
    const x = 42 + i;
    const y = 14 + Math.round(Math.sin(i / 3) * 2);
    b.set(x, y - 1, '#f0a0a0');
    b.set(x, y, '#e08a8a');
    b.set(x, y + 1, '#c86a70');
  }
  // lower layer with an old cowpea root and its nodules
  b.rect(0, 30, PAINT_W, 34, '#4e3222');
  for (let i = 0; i < 60; i++) b.set(Math.floor(hash2(i, 8, 5) * PAINT_W), 30 + Math.floor(hash2(i, 9, 5) * 34), '#65402a');
  for (let t = 0; t <= 30; t++) {
    const x = 36 + t;
    const y = 34 + Math.round(t * 0.7);
    b.set(x, y, '#e6d2a8');
    b.set(x, y + 1, '#cdb88c');
  }
  for (let t = 0; t < 12; t++) b.set(50 + t, 44 - Math.round(t * 0.4), '#e6d2a8');
  [[42, 38], [49, 42], [56, 45], [63, 51], [55, 38], [60, 36]].forEach(([x, y]) => {
    b.ellipse(x, y, 4, 4, '#e6a98a');
    b.set(x + 1, y + 1, '#fbd2b8');
  });
  b.hline(0, PAINT_W - 1, 29, '#3a2418');
  return b;
}

/** A farmer Carver worked with (an imagined figure). */
const TUSKEGEE_FARMER: CharacterLook = {
  build: 'adult',
  skin: { base: '#5a3825', shade: '#462a1b' },
  hair: { style: 'short', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
  shirt: { base: '#e7d9b8', shade: '#cdbd98' },
  pants: '#3e5a88',
  shoes: '#3a2a22',
  accessory: 'cap',
  accent: '#8a6a48',
};

/** Memory: Carver's test plots at Tuskegee's experiment station. */
function memStation(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#9fd3ee', '#fbeec8', 22);
  hills(b, 22, '#8fbf6a', 3);
  b.rect(0, 22, PAINT_W, 42, '#b89468');
  // test plots in rows: some pale and tired, some dark and green
  const plots: Array<[number, number, boolean]> = [
    [4, 28, false], [28, 28, true], [52, 28, false], [76, 28, true],
    [4, 46, true], [28, 46, false], [52, 46, true],
  ];
  plots.forEach(([x, y, good]) => {
    b.rect(x, y, 18, 12, good ? '#5a3a26' : '#c7a57a');
    for (let i = 0; i < 4; i++) b.rect(x + 2 + i * 4, y + 3, 2, good ? 6 : 3, good ? P.leaf2 : '#b8b060');
    b.vline(x, y - 4, y + 1, P.wood2); // stake
    b.rect(x - 1, y - 6, 5, 3, P.paper);
  });
  b.blit(paintCharacter({ ...YOUNG_MAN_GEORGE, extras: { ...YOUNG_MAN_GEORGE.extras, lapelFlower: '#e0574f' } }, 'down', 0), 76, 40);
  return b;
}

/** Memory: a plain-language bulletin for farmers. */
function memBulletin(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#a8dcf0', '#f6eecb', 30);
  grassField(b, 30, 14);
  // a farmhouse porch
  b.rect(0, 8, 34, 26, P.wood1);
  for (let y = 10; y < 34; y += 3) b.hline(0, 33, y, P.wood2);
  b.rect(8, 16, 8, 10, P.windowDark);
  // Carver hands a booklet to a farmer
  b.blit(paintCharacter({ ...YOUNG_MAN_GEORGE, extras: { ...YOUNG_MAN_GEORGE.extras, lapelFlower: '#e0574f' } }, 'right', 0), 40, 30);
  b.blit(paintCharacter(TUSKEGEE_FARMER, 'left', 0), 60, 30);
  b.rect(55, 40, 6, 7, P.paper);
  b.hline(56, 59, 42, P.ink);
  b.hline(56, 58, 44, P.ink);
  // rows of young crops
  for (let x = 4; x < 92; x += 8) b.rect(x, 56, 4, 3, P.leaf2);
  return b;
}

// ------------------------------------------------------------------ Chapter 4

/** Carver in his later years: gray hair and mustache, suit and lapel flower. */
const OLDER_CARVER: CharacterLook = {
  ...YOUNG_MAN_GEORGE,
  hair: { style: 'short', base: '#b9b7b4', shade: '#98968f', light: '#dcdad6' },
  extras: { jacket: { base: '#6b5a4a', shade: '#54463a' }, tie: '#7a2f38', mustache: '#c9c5bf', lapelFlower: '#e0574f' },
};

/** Memory: Carver's laboratory, with jars of crop products. */
function memLab(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  room(b, '#d9cfb8', P.wood1);
  // shelves of jars and bottles
  for (const y of [8, 22]) {
    b.rect(4, y + 10, 52, 2, P.wood2);
    for (let x = 6; x < 54; x += 7) {
      const c = ['#d9a45a', '#c8643a', '#e8dcc0', '#8a6a3a', '#f0d890', '#b8513a', '#e8e0a0'][(x + y) % 7];
      b.rect(x, y + 2, 5, 8, '#cfe3ea');
      b.rect(x + 1, y + 5, 3, 5, c);
      b.rect(x, y + 1, 5, 2, P.wood2);
    }
  }
  // lab bench with a flask and a burner
  b.rect(52, 40, 42, 5, P.wood3);
  b.rect(54, 45, 3, 14, P.wood2);
  b.rect(89, 45, 3, 14, P.wood2);
  b.ellipse(66, 30, 9, 10, '#cfe3ea');
  b.rect(69, 26, 3, 5, '#cfe3ea');
  b.ellipse(67, 34, 7, 5, '#d9a45a');
  b.rect(80, 34, 6, 6, P.metal);
  b.blit(paintCharacter(OLDER_CARVER, 'left', 0), 60, 28);
  return b;
}

/** Memory: speaking to a committee of Congress in 1921. */
function memCongress(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  room(b, '#e8e0cc', '#7a5a3a');
  // tall columns and windows
  for (const x of [6, 30, 66, 88]) {
    b.rect(x, 0, 5, 44, '#f4efe4');
    b.vline(x + 4, 0, 43, '#d9d2c2');
  }
  for (const x of [14, 72]) b.rect(x, 6, 12, 22, '#a8cce0');
  // committee table in the back
  b.rect(8, 30, 80, 6, P.woodDark);
  for (let x = 14; x < 84; x += 12) b.ellipse(x, 24, 6, 7, '#6b5a4a');
  // Carver at a small table with peanuts and jars of products
  b.rect(52, 48, 30, 4, P.wood3);
  b.rect(54, 52, 2, 10, P.wood2);
  b.rect(78, 52, 2, 10, P.wood2);
  for (let x = 56; x < 80; x += 6) {
    b.rect(x, 42, 4, 6, '#cfe3ea');
    b.rect(x + 1, 44, 2, 4, ['#d9a45a', '#e8dcc0', '#8a6a3a', '#f0d890'][(x / 6) % 4 | 0]);
  }
  b.blit(paintCharacter(OLDER_CARVER, 'down', 0), 36, 36);
  return b;
}

// ------------------------------------------------------------------ Chapter 5

/** Carver around 1906: dark hair, suit and his lapel flower. */
const MIDDLE_CARVER: CharacterLook = { ...YOUNG_MAN_GEORGE, extras: { ...YOUNG_MAN_GEORGE.extras, lapelFlower: '#e0574f' } };

/** A farm woman at the wagon (an imagined figure). */
const WAGON_FARMER: CharacterLook = {
  build: 'adult',
  skin: { base: '#6e4329', shade: '#573320' },
  hair: { style: 'bun', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
  shirt: { base: '#b8913e', shade: '#96742c' },
  pants: '#4a4038',
  shoes: '#2f2521',
  accessory: 'none',
  accent: '#e8d49a',
  extras: { apron: '#e7d9b8' },
};

/** Memory: the Jesup Wagon, a movable school, at a farm crossroads. */
function memWagon(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#9fd3ee', '#fbeec8', 24);
  hills(b, 24, '#8fbf6a', 5);
  grassField(b, 24, 21);
  b.rect(0, 44, PAINT_W, 8, '#c9a878'); // a dirt road
  for (let x = 0; x < PAINT_W; x += 7) b.set(x + 3, 47, '#b08e60');
  // the wagon, drawn bigger than the map prop
  b.blit(paintProp('wagon'), 56, 22);
  // a demonstration: a plow and a basket of seed by the wagon
  b.rect(12, 42, 12, 2, P.wood2);
  b.vline(14, 36, 42, P.wood2);
  b.ellipse(24, 52, 5, 4, '#b8913e');
  b.blit(paintCharacter(MIDDLE_CARVER, 'right', 0), 4, 38);
  b.blit(paintCharacter(TUSKEGEE_FARMER, 'left', 0), 30, 38);
  b.blit(paintCharacter(WAGON_FARMER, 'left', 0), 42, 40);
  return b;
}

/** Memory: showing farmers how to make compost from free things. */
function memMuck(): PixelBuffer {
  const b = new PixelBuffer(PAINT_W, PAINT_H);
  sky(b, '#a8dcf0', '#f6eecb', 22);
  grassField(b, 22, 27);
  // a creek on the right with dark muck on its bank
  b.rect(74, 22, 22, 42, P.water1);
  for (let y = 26; y < 64; y += 6) b.hline(78, 90, y, P.water2);
  b.rect(66, 22, 8, 42, '#3a2a1e');
  // leaves under the trees
  const t = paintProp('tree', 1);
  b.blit(t, 2, 0);
  b.blit(paintProp('leaves'), 6, 30);
  // the compost heap in layers: leaves, muck, manure
  b.ellipse(30, 38, 26, 18, '#4e3222');
  b.rect(32, 42, 22, 3, '#a86a2a');
  b.rect(31, 46, 24, 3, '#2e2016');
  b.rect(30, 50, 26, 3, '#6b4a2a');
  b.rect(32, 42, 22, 1, '#d98a3a');
  // a shovel
  b.vline(58, 34, 50, P.wood2);
  b.rect(57, 50, 3, 4, P.metal);
  b.blit(paintCharacter(MIDDLE_CARVER, 'right', 0), 12, 36);
  b.blit(paintCharacter(TUSKEGEE_FARMER, 'left', 0), 60, 36);
  return b;
}

const PAINTERS: Record<string, () => PixelBuffer> = {
  farm: memoryFarm,
  woods: memoryWoods,
  doctor: memoryDoctor,
  beans: spotBeans,
  soil: spotSoil,
  ladybug: spotLadybug,
  carrots: spotCarrots,
  bee: spotBee,
  snail: spotSnail,
  mushrooms: spotMushrooms,
  'ch2-reading': ch2Reading,
  'ch2-neosho': ch2Neosho,
  'ch2-kansas': ch2Kansas,
  'ch2-highland': ch2Highland,
  'ch2-simpson': ch2Simpson,
  'ch2-iowastate': ch2IowaState,
  'ch2-tuskegee': ch2Tuskegee,
  'soil-west': soilWest,
  'soil-east': soilEast,
  'mem-station': memStation,
  'mem-bulletin': memBulletin,
  'mem-lab': memLab,
  'mem-congress': memCongress,
  'mem-wagon': memWagon,
  'mem-muck': memMuck,
};

const cache = new Map<string, HTMLCanvasElement>();

export function paintingCanvas(key: string): HTMLCanvasElement {
  let cv = cache.get(key);
  if (!cv) {
    cv = (PAINTERS[key] ?? memoryFarm)().toCanvas();
    cache.set(key, cv);
  }
  return cv;
}

/** Is there a painting with this key? (Used by the content tests.) */
export function hasPainting(key: string): boolean {
  return key in PAINTERS;
}
