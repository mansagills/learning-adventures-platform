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
