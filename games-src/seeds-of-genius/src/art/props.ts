import { PixelBuffer, mix } from './pixel';
import { P } from './palette';
import { hash2 } from '../core/rng';
import type { BuildingDef, PropKind } from '../world/map';

/**
 * Standing props (billboards) and building facades, painted in code.
 * Sizes are in pixels; 16 px = one tile.
 */

const LEAVES = [
  [P.leaf4, P.leaf1, P.leaf2, P.leaf3],
  ['#2f6a3a', '#3f8448', '#5aa25a', '#7cc06a'],
  ['#35713a', '#4a8d3f', '#69a94c', '#8fc762'],
];

function tree(variant: number): PixelBuffer {
  const b = new PixelBuffer(32, 42);
  const [d, m, l, h] = LEAVES[variant % LEAVES.length];
  // trunk with root flare
  b.rect(13, 26, 6, 13, P.trunk);
  b.vline(13, 27, 38, mix(P.trunk, P.outline, 0.3));
  b.hline(11, 20, 39, P.trunk);
  b.set(15, 30, mix(P.trunk, P.outline, 0.4));
  // canopy: dark base, mid, highlight clumps
  b.ellipse(2, 3, 28, 26, d);
  b.ellipse(3, 2, 25, 22, m);
  b.ellipse(5, 3, 12, 11, l);
  b.ellipse(15, 5, 11, 9, l);
  b.ellipse(7, 4, 6, 5, h);
  b.ellipse(17, 6, 5, 4, h);
  // leafy texture
  for (let y = 3; y < 28; y++)
    for (let x = 2; x < 30; x++) {
      const c = b.get(x, y);
      if (c && (c === m || c === l) && hash2(x, y, variant + 11) > 0.86) b.set(x, y, c === m ? d : m);
    }
  if (variant === 2) {
    // a blossom tree
    for (let i = 0; i < 14; i++) {
      const x = 5 + Math.floor(hash2(i, 3, 5) * 22);
      const y = 5 + Math.floor(hash2(i, 7, 5) * 18);
      if (b.get(x, y)) b.set(x, y, i % 2 ? P.flowerPink : P.flowerWhite);
    }
  }
  return b.outline();
}

function pine(variant: number): PixelBuffer {
  const b = new PixelBuffer(24, 42);
  const [d, m, l] = LEAVES[variant % LEAVES.length];
  b.rect(10, 32, 4, 8, P.trunk);
  const tiers = [
    { y: 2, h: 12, w: 10 },
    { y: 9, h: 13, w: 16 },
    { y: 17, h: 16, w: 22 },
  ];
  for (const t of tiers) {
    for (let j = 0; j < t.h; j++) {
      const half = Math.round(((j + 1) / t.h) * (t.w / 2));
      b.hline(12 - half, 11 + half, t.y + j, j > t.h - 3 ? d : m);
      b.hline(12 - half, 12 - Math.max(0, half - 2), t.y + j, l);
    }
  }
  return b.outline();
}

function bush(variant: number): PixelBuffer {
  const b = new PixelBuffer(18, 15);
  b.ellipse(1, 2, 16, 12, P.leaf1);
  b.ellipse(2, 1, 9, 8, P.leaf2);
  b.ellipse(9, 3, 7, 6, P.leaf2);
  b.set(4, 3, P.leaf3);
  b.set(11, 4, P.leaf3);
  if (variant === 1) [[5, 6], [11, 8], [8, 4], [13, 6]].forEach(([x, y]) => b.set(x, y, P.flowerRed));
  return b.outline();
}

function lamp(): PixelBuffer {
  const b = new PixelBuffer(10, 34);
  b.rect(4, 9, 2, 23, P.metal);
  b.vline(4, 9, 31, P.metalLight);
  b.hline(2, 7, 32, P.metal);
  // lantern head
  b.hline(2, 7, 2, P.metal);
  b.hline(3, 6, 1, P.metal);
  b.rect(2, 3, 6, 5, P.metal);
  b.rect(3, 3, 4, 4, '#f3e3b5');
  b.hline(2, 7, 8, P.metal);
  return b.outline();
}

function bench(): PixelBuffer {
  const b = new PixelBuffer(32, 16);
  b.rect(2, 2, 28, 3, P.wood1);
  b.hline(2, 29, 2, P.wood3);
  b.rect(2, 7, 28, 3, P.wood1);
  b.hline(2, 29, 7, P.wood3);
  b.rect(4, 10, 2, 5, P.woodDark);
  b.rect(26, 10, 2, 5, P.woodDark);
  b.rect(4, 5, 2, 2, P.woodDark);
  b.rect(26, 5, 2, 2, P.woodDark);
  return b.outline();
}

function sign(): PixelBuffer {
  const b = new PixelBuffer(18, 20);
  b.rect(8, 10, 2, 9, P.woodDark);
  b.rect(1, 2, 16, 9, P.wood3);
  b.hline(1, 16, 10, P.wood1);
  b.hline(3, 12, 4, P.woodDark);
  b.hline(3, 14, 6, P.woodDark);
  b.hline(3, 9, 8, P.woodDark);
  return b.outline();
}

function well(): PixelBuffer {
  const b = new PixelBuffer(32, 36);
  // roof
  for (let j = 0; j < 7; j++) b.hline(9 - j, 22 + j, 1 + j, j % 2 ? P.roofRed1 : P.roofRed2);
  b.hline(2, 29, 8, P.roofRed2);
  // posts and rope
  b.rect(5, 9, 2, 14, P.wood2);
  b.rect(25, 9, 2, 14, P.wood2);
  b.hline(7, 24, 11, P.woodDark);
  b.vline(16, 12, 17, '#d8c08a');
  b.rect(15, 18, 3, 3, P.wood1);
  // stone ring
  b.ellipse(2, 20, 28, 15, P.cobble2);
  b.rect(2, 24, 28, 7, P.cobble2);
  b.ellipse(5, 21, 22, 7, '#2f4c5e');
  for (let x = 3; x < 30; x += 5) {
    b.rect(x, 26, 4, 2, P.cobble1);
    b.rect(x + 2, 29, 4, 2, P.cobble3);
  }
  return b.outline();
}

function stall(): PixelBuffer {
  const b = new PixelBuffer(34, 36);
  // striped awning
  for (let x = 1; x < 33; x++) {
    const c = Math.floor((x - 1) / 4) % 2 ? P.white : '#c9483f';
    b.vline(x, 2, 8, c);
    if (x % 4 === 2) b.set(x, 9, c);
  }
  b.hline(1, 32, 2, mix('#c9483f', P.outline, 0.2));
  // posts
  b.rect(3, 9, 2, 15, P.wood2);
  b.rect(29, 9, 2, 15, P.wood2);
  // counter with produce baskets
  b.rect(1, 22, 32, 12, P.wood1);
  b.hline(1, 32, 22, P.wood3);
  for (let x = 3; x < 32; x += 6) b.vline(x, 24, 33, P.wood2);
  const produce = [P.flowerRed, '#e0823a', P.leaf2, P.flowerYellow];
  produce.forEach((c, i) => {
    const x = 4 + i * 7;
    b.rect(x, 18, 6, 4, P.wood3);
    b.ellipse(x, 15, 6, 5, c);
    b.set(x + 2, 16, mix(c, P.white, 0.5));
  });
  // seed packets hanging
  [9, 15, 21].forEach((x, i) => {
    b.rect(x, 11, 3, 4, P.paper);
    b.set(x + 1, 12, [P.flowerPink, P.leaf2, P.flowerYellow][i]);
  });
  return b.outline();
}

function mailbox(): PixelBuffer {
  const b = new PixelBuffer(12, 20);
  b.rect(5, 9, 2, 10, P.woodDark);
  b.rect(1, 2, 10, 8, '#4b7fcf');
  b.hline(2, 9, 1, '#4b7fcf');
  b.hline(1, 10, 9, '#3a64a6');
  b.rect(3, 4, 6, 1, '#3a64a6');
  b.rect(10, 3, 1, 4, '#c9483f');
  return b.outline();
}

function fence(variant: number): PixelBuffer {
  const b = new PixelBuffer(16, 14);
  if (variant === 1) {
    b.rect(7, 2, 3, 11, P.wood3);
    b.vline(9, 2, 12, P.wood1);
    return b.outline();
  }
  b.rect(1, 2, 3, 11, P.wood3);
  b.rect(12, 2, 3, 11, P.wood3);
  b.rect(0, 5, 16, 2, P.wood1);
  b.rect(0, 9, 16, 2, P.wood1);
  b.hline(0, 15, 5, P.wood3);
  return b.outline();
}

function crop(variant: number): PixelBuffer {
  if (variant >= 4) return fieldCrop(variant);
  const b = new PixelBuffer(16, variant === 3 ? 24 : 16);
  if (variant === 0) {
    // lettuce
    b.ellipse(3, 7, 10, 8, P.leaf2);
    b.ellipse(5, 6, 6, 6, P.leaf3);
    b.set(7, 9, P.leaf1);
  } else if (variant === 1) {
    // carrot tops
    for (const x of [5, 7, 9]) {
      b.vline(x, 5, 12, P.leaf2);
      b.set(x - 1, 6, P.leaf3);
      b.set(x + 1, 8, P.leaf3);
    }
    b.hline(5, 9, 13, '#e0823a');
  } else if (variant === 2) {
    // bean pole
    b.vline(8, 1, 14, P.wood2);
    for (let y = 3; y < 14; y += 2) {
      b.set(7 + (y % 4 ? 1 : -1), y, P.leaf2);
      b.set(9, y + 1, P.leaf3);
    }
  } else {
    // tall farm crop
    for (const x of [4, 8, 11]) {
      b.vline(x, 4, 22, P.leaf1);
      b.set(x - 1, 8, P.leaf2);
      b.set(x + 1, 12, P.leaf2);
      b.set(x - 1, 16, P.leaf2);
      b.set(x, 3, P.flowerYellow);
    }
  }
  return b.outline();
}

/**
 * Chapter 3's field crops: 4 = thin cotton on tired soil (pale leaves, few
 * bolls), 5 = legume vines (peanuts/cowpeas, low and leafy), 6 = sturdy
 * cotton, 7 = sweet potato vines.
 */
function fieldCrop(variant: number): PixelBuffer {
  const b = new PixelBuffer(16, 20);
  if (variant === 4) {
    for (const x of [4, 11]) {
      b.vline(x, 11, 19, '#8a8a4a');
      b.set(x - 1, 14, '#c9c46a');
      b.set(x + 1, 13, '#b8b060');
      b.set(x + 1, 16, '#c9c46a');
    }
    b.rect(10, 10, 2, 2, P.white); // one small boll
  } else if (variant === 5) {
    b.ellipse(1, 11, 14, 8, P.leaf2);
    b.ellipse(3, 10, 5, 4, P.leaf3);
    b.ellipse(9, 11, 5, 4, P.leaf3);
    b.set(6, 15, P.leaf1);
    b.set(11, 16, P.leaf1);
    b.rect(4, 16, 3, 1, '#c9d36a'); // a pod
  } else if (variant === 7) {
    // sweet potato vines: low, heart-shaped leaves with purple stems
    b.hline(1, 14, 18, '#7a4a7a');
    for (const [x, y] of [[2, 13], [7, 11], [11, 14]] as Array<[number, number]>) {
      b.ellipse(x, y, 5, 5, P.leaf2);
      b.set(x + 2, y + 1, P.leaf3);
    }
    b.rect(5, 17, 4, 2, '#c8643a'); // a sweet potato peeking out
  } else {
    for (const x of [4, 8, 12]) {
      b.vline(x, 5, 19, P.leaf1);
      b.set(x - 1, 9, P.leaf2);
      b.set(x + 1, 12, P.leaf2);
      b.set(x - 1, 15, P.leaf3);
      b.rect(x - 1, 3 + (x % 3), 3, 2, P.white); // cotton bolls
    }
  }
  return b.outline();
}

function scarecrow(): PixelBuffer {
  const b = new PixelBuffer(18, 30);
  b.vline(9, 10, 28, P.woodDark);
  b.hline(2, 15, 12, P.woodDark);
  b.ellipse(5, 2, 8, 8, '#e8d49a');
  b.set(7, 5, P.outline);
  b.set(10, 5, P.outline);
  b.hline(3, 14, 2, '#8a5a3a');
  b.rect(5, 0, 8, 2, '#8a5a3a');
  b.rect(5, 11, 8, 9, '#4b7fcf');
  b.set(3, 13, '#e8d49a');
  b.set(14, 13, '#e8d49a');
  return b.outline();
}

function crate(): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  b.rect(1, 3, 14, 12, P.wood1);
  b.rect(1, 3, 14, 2, P.wood3);
  b.vline(4, 5, 14, P.wood2);
  b.vline(11, 5, 14, P.wood2);
  b.ellipse(3, 0, 5, 4, P.flowerRed);
  b.ellipse(8, 1, 5, 4, P.leaf2);
  return b.outline();
}

function barrel(): PixelBuffer {
  const b = new PixelBuffer(14, 18);
  b.ellipse(1, 1, 12, 16, P.wood1);
  b.hline(2, 11, 4, P.metal);
  b.hline(2, 11, 13, P.metal);
  b.vline(4, 2, 16, P.wood3);
  return b.outline();
}

function reeds(): PixelBuffer {
  const b = new PixelBuffer(16, 18);
  [3, 7, 11].forEach((x, i) => {
    b.rect(x, 6 + (i % 2) * 2, 2, 11 - (i % 2) * 2, P.leaf2);
    b.vline(x, 6 + (i % 2) * 2, 16, P.leaf1);
    if (i !== 1) b.rect(x, 3 + i, 2, 3, P.trunk);
  });
  b.set(6, 10, P.leaf3);
  b.set(10, 12, P.leaf3);
  return b.outline(P.grassDeep);
}

function potting(): PixelBuffer {
  const b = new PixelBuffer(24, 22);
  b.rect(2, 10, 20, 3, P.wood3);
  b.hline(2, 21, 10, '#d99a62');
  b.rect(3, 13, 2, 8, P.wood2);
  b.rect(19, 13, 2, 8, P.wood2);
  b.hline(4, 19, 17, P.wood2);
  // pots with seedlings
  [4, 11].forEach((x) => {
    b.rect(x, 6, 5, 4, '#b8634a');
    b.hline(x - 1, x + 5, 6, '#d0775b');
    b.vline(x + 2, 2, 5, P.leaf1);
    b.set(x + 1, 3, P.leaf3);
    b.set(x + 3, 2, P.leaf3);
  });
  // a small stack of cards
  b.rect(17, 7, 5, 3, P.paper);
  b.hline(17, 21, 7, '#4f9a4a');
  return b.outline();
}

export function paintProp(kind: PropKind, variant = 0): PixelBuffer {
  switch (kind) {
    case 'potting':
      return potting();
    case 'tree':
      return tree(variant);
    case 'pine':
      return pine(variant);
    case 'bush':
      return bush(variant);
    case 'lamp':
      return lamp();
    case 'bench':
      return bench();
    case 'sign':
      return sign();
    case 'well':
      return well();
    case 'stall':
      return stall();
    case 'mailbox':
      return mailbox();
    case 'fence':
      return fence(variant);
    case 'crop':
      return crop(variant);
    case 'scarecrow':
      return scarecrow();
    case 'crate':
      return crate();
    case 'barrel':
      return barrel();
    case 'reeds':
      return reeds();
  }
}

// ------------------------------------------------------------ buildings

interface Facade {
  wall: HTMLCanvasElement;
  /** Only the window panes, painted in the lit color (shown at night). */
  lit: HTMLCanvasElement;
  roof: HTMLCanvasElement;
}

const WALL_STYLE: Record<BuildingDef['style'], { base: string; shade: string; trim: string }> = {
  cottage: { base: P.plaster, shade: P.plaster2, trim: P.wood2 },
  greenhouse: { base: P.glass1, shade: P.glass2, trim: P.glassFrame },
  shop: { base: '#e7c9a0', shade: '#d4b388', trim: P.wood2 },
  school: { base: P.brick1, shade: P.brick2, trim: P.white },
  workshop: { base: P.wood1, shade: P.wood2, trim: P.woodDark },
};

const ROOF: Record<BuildingDef['roof'], [string, string]> = {
  red: [P.roofRed1, P.roofRed2],
  blue: [P.roofBlue1, P.roofBlue2],
  green: [P.roofGreen1, P.roofGreen2],
  brown: [P.roofBrown1, P.roofBrown2],
  glass: [P.glass1, P.glass2],
};

export function paintFacade(b: BuildingDef): Facade {
  const T = 16;
  const W = b.w * T;
  const H = Math.round(b.h * T);
  const wall = new PixelBuffer(W, H);
  const lit = new PixelBuffer(W, H);
  const s = WALL_STYLE[b.style];

  wall.rect(0, 0, W, H, s.base);
  if (b.style === 'school') {
    for (let y = 0; y < H; y += 4)
      for (let x = (y / 4) % 2 ? 0 : 4; x < W; x += 8) {
        wall.hline(x, x + 6, y + 3, s.shade);
        wall.set(x + 7, y + 1, s.shade);
      }
  } else if (b.style === 'workshop' || b.style === 'cottage' || b.style === 'shop') {
    const plank = b.style === 'workshop' ? 4 : 8;
    for (let y = plank - 1; y < H; y += plank) wall.hline(0, W - 1, y, s.shade);
  }
  if (b.style === 'greenhouse') {
    // glass panes with plants behind them
    for (let x = 0; x < W; x += 8) wall.vline(x, 0, H - 1, s.trim);
    wall.hline(0, W - 1, Math.floor(H / 2), s.trim);
    for (let x = 2; x < W - 2; x += 5) {
      const h = 5 + Math.floor(hash2(x, 1, 3) * 8);
      for (let y = H - 3; y > H - 3 - h; y--) wall.set(x, y, y % 3 ? P.leaf2 : P.leaf1);
      wall.set(x - 1, H - 3 - h + 2, P.leaf3);
      wall.set(x + 1, H - 3 - h + 3, P.leaf3);
      if (x % 3 === 0) wall.set(x, H - 3 - h, P.flowerRed);
    }
    wall.rect(0, H - 3, W, 3, P.cobble2);
  }
  // corner trim + base
  wall.vline(0, 0, H - 1, s.trim);
  wall.vline(W - 1, 0, H - 1, s.trim);
  if (b.style !== 'greenhouse') wall.rect(0, H - 3, W, 3, mix(s.shade, P.outline, 0.25));

  // door
  const dx = (b.doorX - b.x) * T + 3;
  const doorH = Math.min(H - 3, 22);
  const doorColor = b.style === 'greenhouse' ? P.glassFrame : b.style === 'school' ? P.roofBlue2 : P.woodDark;
  wall.rect(dx - 1, H - doorH - 1, 12, doorH + 1, s.trim);
  wall.rect(dx, H - doorH, 10, doorH, doorColor);
  if (b.style === 'greenhouse') wall.rect(dx + 1, H - doorH + 1, 8, doorH - 2, P.glass2);
  else {
    wall.rect(dx + 2, H - doorH + 2, 6, 6, mix(doorColor, P.white, 0.15));
    wall.set(dx + 8, H - Math.floor(doorH / 2), P.gold);
  }

  // windows (skip the door column)
  if (b.style !== 'greenhouse') {
    for (let tx = 0; tx < b.w; tx++) {
      if (tx + b.x === b.doorX || tx === 0 || tx === b.w - 1) continue;
      if ((tx + b.x) % 2 === 0 && b.w > 4) continue;
      const wx = tx * T + 3;
      const wy = Math.max(4, H - 26);
      wall.rect(wx - 1, wy - 1, 12, 11, s.trim);
      wall.rect(wx, wy, 10, 9, P.windowDark);
      wall.hline(wx, wx + 9, wy + 4, s.trim);
      wall.vline(wx + 5, wy, wy + 8, s.trim);
      wall.set(wx + 1, wy + 1, P.glass1);
      wall.set(wx + 6, wy + 1, P.glass1);
      if (b.style === 'cottage' || b.style === 'shop') {
        wall.hline(wx - 2, wx + 11, wy + 10, s.trim);
        [wx, wx + 3, wx + 7].forEach((x, i) => wall.set(x, wy + 9, [P.flowerRed, P.flowerYellow, P.flowerPink][i]));
      }
      // lit version (panes only)
      lit.rect(wx, wy, 10, 9, P.windowLit);
      lit.hline(wx, wx + 9, wy + 4, mix(P.windowLit, s.trim, 0.6));
      lit.vline(wx + 5, wy, wy + 8, mix(P.windowLit, s.trim, 0.6));
    }
  }
  // shop sign board
  if (b.style === 'shop' || b.style === 'school' || b.style === 'workshop') {
    const sx = Math.floor(W / 2) - 14;
    wall.rect(sx, 2, 28, 7, b.style === 'school' ? P.white : P.wood3);
    wall.hline(sx + 3, sx + 24, 5, P.woodDark);
    if (b.style === 'school') {
      wall.set(sx + 13, 1, P.gold);
    }
  }

  // Roof: front slope, shingles in rows; depth d tiles tall on screen.
  const RW = W + 8;
  const RH = b.d * T + 4;
  const roof = new PixelBuffer(RW, RH);
  const [r1, r2] = ROOF[b.roof];
  if (b.roof === 'glass') {
    roof.rect(0, 0, RW, RH, P.glass1);
    for (let x = 0; x < RW; x += 8) roof.vline(x, 0, RH - 1, P.glassFrame);
    for (let y = 0; y < RH; y += 10) roof.hline(0, RW - 1, y, P.glassFrame);
    for (let i = 0; i < RW; i += 3) roof.set(i, (i * 7) % RH, P.white);
    roof.hline(0, RW - 1, RH - 1, P.glassFrame);
    roof.hline(0, RW - 1, 0, P.glassFrame);
  } else {
    roof.rect(0, 0, RW, RH, r1);
    for (let y = 2; y < RH; y += 4) {
      roof.hline(0, RW - 1, y, r2);
      for (let x = (y / 4) % 2 ? 2 : 6; x < RW; x += 8) roof.vline(x, y - 3, y, r2);
    }
    roof.hline(0, RW - 1, 0, mix(r1, P.white, 0.3));
    roof.hline(0, RW - 1, RH - 1, mix(r2, P.outline, 0.4));
    roof.hline(0, RW - 1, RH - 2, mix(r2, P.outline, 0.2));
    if (b.style === 'cottage') {
      // chimney
      roof.rect(RW - 22, 0, 8, 10, P.brick1);
      roof.hline(RW - 23, RW - 13, 0, P.brick2);
      roof.hline(RW - 22, RW - 15, 5, P.brick2);
    }
    if (b.style === 'school') {
      // bell tower cap
      const cx = Math.floor(RW / 2);
      roof.rect(cx - 5, 0, 10, 9, P.white);
      roof.rect(cx - 3, 2, 6, 5, P.outline);
      roof.rect(cx - 1, 3, 2, 3, P.gold);
    }
  }
  return { wall: wall.toCanvas(), lit: lit.toCanvas(), roof: roof.outline(mix(r2, P.outline, 0.5)).toCanvas() };
}

// ------------------------------------------------------------ room furniture

export function paintFurniture(kind: 'bed' | 'wardrobe' | 'shelf' | 'desk' | 'plantstand' | 'pot' | 'window' | 'lampdesk'): PixelBuffer {
  switch (kind) {
    case 'bed': {
      const b = new PixelBuffer(32, 30);
      b.rect(1, 1, 30, 8, P.wood2); // headboard
      b.rect(3, 3, 26, 4, P.wood3);
      b.rect(2, 8, 28, 20, P.white);
      b.rect(5, 9, 22, 5, '#f3eadb'); // pillow
      b.rect(2, 15, 28, 13, '#4b7fcf'); // quilt
      for (let x = 4; x < 30; x += 6) for (let y = 17; y < 28; y += 5) b.rect(x, y, 3, 2, '#e8bd3f');
      b.hline(2, 29, 15, '#6e9be0');
      b.rect(1, 27, 30, 2, P.wood2);
      return b.outline();
    }
    case 'wardrobe': {
      const b = new PixelBuffer(18, 32);
      b.rect(1, 1, 16, 30, P.wood1);
      b.hline(1, 16, 1, P.wood3);
      b.vline(9, 3, 28, P.woodDark);
      b.rect(3, 4, 5, 22, P.wood3);
      b.rect(10, 4, 5, 22, P.wood3);
      b.set(7, 16, P.gold);
      b.set(11, 16, P.gold);
      return b.outline();
    }
    case 'shelf': {
      const b = new PixelBuffer(18, 26);
      b.rect(1, 1, 16, 24, P.wood2);
      b.rect(2, 2, 14, 22, P.woodDark);
      [8, 15, 22].forEach((y) => b.hline(2, 15, y, P.wood3));
      b.rect(3, 4, 2, 4, '#c9483f');
      b.rect(5, 5, 2, 3, '#4b7fcf');
      b.rect(7, 4, 2, 4, '#e8bd3f');
      return b.outline();
    }
    case 'desk': {
      const b = new PixelBuffer(32, 22);
      b.rect(1, 6, 30, 4, P.wood3);
      b.rect(2, 10, 3, 11, P.wood2);
      b.rect(27, 10, 3, 11, P.wood2);
      b.rect(19, 10, 8, 7, P.wood1);
      b.set(22, 13, P.gold);
      b.rect(4, 2, 9, 4, P.paper); // open book
      b.vline(8, 2, 5, P.paper2);
      b.rect(24, 1, 2, 5, P.flowerYellow); // pencil cup
      b.rect(23, 4, 4, 2, P.flowerRed);
      return b.outline();
    }
    case 'plantstand': {
      const b = new PixelBuffer(14, 22);
      b.rect(3, 12, 8, 8, '#b8634a');
      b.hline(2, 11, 12, '#d0775b');
      b.ellipse(1, 1, 12, 12, P.leaf2);
      b.ellipse(3, 2, 6, 6, P.leaf3);
      return b.outline();
    }
    case 'pot': {
      const b = new PixelBuffer(12, 12);
      b.rect(2, 5, 8, 6, '#b8634a');
      b.hline(1, 10, 5, '#d0775b');
      b.hline(3, 8, 6, P.soil2);
      return b.outline();
    }
    case 'window': {
      const b = new PixelBuffer(28, 22);
      b.rect(0, 0, 28, 20, P.wood2);
      b.rect(2, 2, 24, 16, '#9fd3ee');
      b.ellipse(4, 11, 10, 8, '#7cb356');
      b.ellipse(12, 12, 14, 8, '#6aa24a');
      b.rect(5, 4, 5, 2, P.white);
      b.vline(13, 2, 17, P.wood2);
      b.hline(2, 25, 9, P.wood2);
      b.rect(0, 19, 28, 3, P.wood3);
      return b;
    }
    case 'lampdesk': {
      const b = new PixelBuffer(10, 12);
      b.rect(3, 1, 5, 4, P.flowerYellow);
      b.vline(5, 5, 10, P.metal);
      b.hline(3, 7, 10, P.metal);
      return b.outline();
    }
  }
}

/** Schoolhouse furniture. */
export function paintSchool(kind: 'desk' | 'easel' | 'globe', variant = 0): PixelBuffer {
  if (kind === 'desk') {
    const b = new PixelBuffer(32, 22);
    b.rect(1, 4, 30, 4, P.wood3); // desk top
    b.hline(1, 30, 4, '#d99a62');
    b.rect(2, 8, 2, 12, P.wood2);
    b.rect(28, 8, 2, 12, P.wood2);
    b.rect(3, 14, 26, 3, P.wood1); // bench
    b.rect(6, 1, 7, 3, P.paper); // open book
    b.vline(9, 1, 3, P.paper2);
    b.rect(20, 2, 5, 2, '#3a3a44'); // slate
    return b.outline();
  }
  if (kind === 'globe') {
    const b = new PixelBuffer(14, 22);
    b.ellipse(1, 1, 12, 12, P.water1);
    b.ellipse(3, 3, 5, 4, P.leaf2);
    b.ellipse(7, 7, 4, 3, P.leaf2);
    b.vline(7, 13, 19, P.metal);
    b.hline(3, 11, 20, P.wood2);
    return b.outline();
  }
  // easel with a framed storybook picture (colors vary)
  const b = new PixelBuffer(20, 32);
  const skies = ['#9fd3ee', '#f6d9a8', '#cfe6c4', '#e6ddf5', '#fbe3c0', '#bfe3c8'];
  b.vline(4, 10, 30, P.wood2);
  b.vline(15, 10, 30, P.wood2);
  b.vline(10, 12, 30, P.woodDark);
  b.rect(1, 2, 18, 15, P.wood1); // frame
  b.rect(3, 4, 14, 11, skies[variant % skies.length]);
  b.rect(3, 11, 14, 4, P.grass1);
  b.ellipse(10, 5, 4, 4, P.gold);
  b.rect(6, 9, 3, 4, P.trunk);
  b.ellipse(4, 6, 7, 5, P.leaf2);
  b.hline(2, 17, 18, P.wood3); // ledge
  return b.outline();
}

/** Seedling that appears in the windowsill pot after the practice quest. */
export function paintSprout(): PixelBuffer {
  const b = new PixelBuffer(12, 16);
  b.rect(2, 9, 8, 6, '#b8634a');
  b.hline(1, 10, 9, '#d0775b');
  b.hline(3, 8, 10, P.soil2);
  b.set(6, 8, P.soil3);
  b.set(5, 7, P.soil3);
  return b.outline();
}
