import { PixelBuffer, mix } from '../../kit/art/pixel';
import { P } from '../../kit/art/palette';
import { paintText, textWidth } from '../../kit/art/pixelFont';
import { hash2, mulberry32 } from '../../kit/core/rng';
import type { Money } from './problems';

/**
 * Money Market art, painted in code in the same pixel style as the other
 * games: the market square, the stand (which changes as upgrades are
 * bought), coins and bills at true relative sizes, and the menu icons.
 */

// ------------------------------------------------------------------ money

const SILVER = { base: '#c7ccd2', light: '#eef1f4', shade: '#8f96a0', edge: '#6b7280' };
const COPPER = { base: '#c87a43', light: '#e6a26e', shade: '#9a5a2e', edge: '#6e3d1d' };

/** Coin sizes in pixels follow the real coins: dime smallest, then penny, nickel, quarter. */
export const COIN_SIZE: Record<'penny' | 'nickel' | 'dime' | 'quarter', number> = { dime: 14, penny: 15, nickel: 17, quarter: 19 };

/** A coin seen from above, with its value stamped on it (so young players can check). */
export function paintCoin(m: 'penny' | 'nickel' | 'dime' | 'quarter', stamped = true): PixelBuffer {
  const d = COIN_SIZE[m];
  const tone = m === 'penny' ? COPPER : SILVER;
  const b = new PixelBuffer(d + 2, d + 2);
  const c = (d + 1) / 2;
  for (let y = 0; y < d + 2; y++)
    for (let x = 0; x < d + 2; x++) {
      const r = Math.hypot(x + 0.5 - c - 0.5, y + 0.5 - c - 0.5);
      if (r > d / 2) continue;
      let col = tone.base;
      if (r > d / 2 - 1.2) col = tone.edge;
      else if (r > d / 2 - 2.2) col = (x + y) % 2 ? tone.shade : tone.base; // the ridged rim
      else if (x + y < d * 0.7) col = mix(tone.base, tone.light, 0.35);
      b.set(x, y, col);
    }
  if (stamped) {
    const v = m === 'penny' ? '1' : m === 'nickel' ? '5' : m === 'dime' ? '10' : '25';
    const tw = textWidth(v);
    paintText(b, v, Math.round((d + 2 - tw) / 2), Math.round((d + 2 - 5) / 2), tone.edge);
  }
  return b;
}

/** A dollar bill: green, with its value in each corner and a portrait oval. */
export function paintBill(m: 'dollar' | 'five'): PixelBuffer {
  const b = new PixelBuffer(46, 22);
  const g = m === 'dollar' ? { base: '#9dc48a', shade: '#6f9a5c', ink: '#2f5a2a' } : { base: '#b6c98f', shade: '#8aa166', ink: '#3d5a24' };
  b.rect(0, 0, 46, 22, g.shade);
  b.rect(1, 1, 44, 20, g.base);
  b.rect(3, 3, 40, 16, mix(g.base, '#ffffff', 0.18));
  for (let y = 5; y < 17; y++) for (let x = 18; x < 28; x++) if (Math.hypot((x - 22.5) / 5, (y - 10.5) / 6) <= 1) b.set(x, y, g.shade);
  const v = m === 'dollar' ? '1' : '5';
  paintText(b, v, 4, 4, g.ink);
  paintText(b, v, 39, 13, g.ink);
  paintText(b, v, 39, 4, g.ink);
  paintText(b, v, 4, 13, g.ink);
  return b.outline('#3a4a32');
}

export function paintMoney(m: Money, stamped = true): PixelBuffer {
  return m === 'dollar' || m === 'five' ? paintBill(m) : paintCoin(m, stamped);
}

// ------------------------------------------------------------------ menu icons

export const ICON_IDS = [
  'popcorn', 'pretzel', 'hotdog', 'taco', 'pizza',
  'water', 'lemonade', 'punch', 'smoothie', 'cocoa',
  'salt', 'ketchup', 'mustard', 'cheese', 'sprinkles',
  'awning', 'sign', 'plants', 'lights',
] as const;

/** 16x16 icons for the menu, orders and the upgrade shop. */
export function paintItem(id: string): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  const cup = (fill: string, top?: string) => {
    b.rect(4, 4, 8, 11, '#f4f1e8');
    b.rect(5, 6, 6, 8, fill);
    if (top) b.rect(5, 5, 6, 2, top);
    b.hline(3, 12, 3, '#d9d3c4');
    b.vline(9, 0, 3, '#e0574f');
  };
  switch (id) {
    case 'popcorn':
      b.rect(4, 8, 8, 7, '#e0574f');
      for (let x = 5; x < 12; x += 2) b.vline(x, 8, 14, '#fdfbf5');
      for (let i = 0; i < 9; i++) b.rect(3 + ((i * 5) % 9), 3 + ((i * 3) % 5), 3, 3, i % 3 ? '#fff4c9' : '#f2c94c');
      break;
    case 'pretzel':
      for (let a = 0; a < 40; a++) {
        const t = (a / 40) * Math.PI * 2;
        const x = 8 + Math.sin(t) * 6;
        const y = 8 + Math.sin(2 * t) * 3.5;
        b.rect(Math.round(x), Math.round(y), 2, 2, '#a5612a');
      }
      [3, 7, 11].forEach((x) => b.set(x, 6, '#fdfbf5'));
      break;
    case 'hotdog':
      b.rect(1, 7, 14, 5, '#e3a85d');
      b.rect(2, 6, 12, 3, '#b8452e');
      b.hline(3, 12, 7, '#d9603f');
      b.rect(1, 10, 14, 2, '#c98c4a');
      break;
    case 'taco':
      for (let x = 1; x < 15; x++) {
        const h = Math.round(Math.sqrt(Math.max(0, 49 - (x - 8) ** 2)));
        b.vline(x, 14 - h, 14, '#e8bd3f');
      }
      b.hline(3, 12, 8, '#4f9a4a');
      b.hline(4, 11, 9, '#b8452e');
      b.hline(5, 10, 10, '#f2c94c');
      break;
    case 'pizza':
      for (let y = 2; y < 15; y++) b.hline(8 - Math.floor((y - 2) / 2), 8 + Math.floor((y - 2) / 2), 16 - y, '#f2c94c');
      b.hline(2, 14, 14, '#c98c4a');
      b.hline(2, 14, 15, '#a5612a');
      [[7, 7], [9, 10], [6, 11], [10, 12]].forEach(([x, y]) => b.rect(x, y, 2, 2, '#c9483f'));
      break;
    case 'water':
      cup('#9ad1e8', '#c9ecf7');
      break;
    case 'lemonade':
      cup('#f6e27a', '#fff4b0');
      b.rect(10, 4, 3, 3, '#e8bd3f');
      break;
    case 'punch':
      cup('#d2453a', '#ef8fb1');
      break;
    case 'smoothie':
      cup('#c062a8', '#ef8fb1');
      b.rect(6, 4, 2, 2, '#4f9a4a');
      break;
    case 'cocoa':
      b.rect(3, 6, 9, 8, '#e0823a');
      b.rect(12, 8, 2, 4, '#e0823a');
      b.rect(4, 6, 7, 2, '#6b3f22');
      b.rect(6, 4, 3, 2, '#fdfbf5');
      break;
    case 'salt':
      b.rect(5, 5, 6, 10, '#f4f1e8');
      b.rect(5, 3, 6, 3, P.metalLight);
      [6, 8, 10].forEach((x) => b.set(x, 4, '#2b1d1e'));
      break;
    case 'ketchup':
    case 'mustard': {
      const c = id === 'ketchup' ? '#c9483f' : '#e8bd3f';
      b.rect(5, 5, 6, 10, c);
      b.rect(6, 2, 4, 3, c);
      b.rect(7, 0, 2, 2, mix(c, '#000000', 0.2));
      b.rect(6, 8, 4, 3, '#fdfbf5');
      break;
    }
    case 'cheese':
      for (let y = 5; y < 14; y++) b.hline(2 + Math.max(0, 5 - (y - 5)), 14, y, '#f2c94c');
      [[6, 9], [10, 7], [11, 11]].forEach(([x, y]) => b.rect(x, y, 2, 2, '#d9a62e'));
      break;
    case 'sprinkles':
      for (let i = 0; i < 16; i++) {
        const r = mulberry32(i + 3);
        b.rect(2 + Math.floor(r() * 12), 2 + Math.floor(r() * 12), 2, 1, ['#c9483f', '#4b7fcf', '#f2c94c', '#4f9a4a', '#dc6f9c'][i % 5]);
      }
      break;
    case 'awning':
      for (let x = 1; x < 15; x++) b.vline(x, 3, 9, Math.floor((x - 1) / 3) % 2 ? '#f4f1e8' : '#d2453a');
      for (let x = 1; x < 15; x += 3) b.rect(x, 10, 2, 2, '#d2453a');
      b.vline(1, 3, 15, P.wood2);
      b.vline(14, 3, 15, P.wood2);
      break;
    case 'sign':
      b.rect(2, 2, 12, 10, P.wood2);
      b.rect(3, 3, 10, 8, '#2f3a33');
      b.hline(4, 11, 5, '#fdfbf5');
      b.hline(4, 9, 7, '#fdfbf5');
      b.hline(4, 10, 9, '#f2c94c');
      b.vline(5, 12, 15, P.wood2);
      b.vline(10, 12, 15, P.wood2);
      break;
    case 'plants':
      b.rect(4, 10, 8, 5, '#b85d3a');
      b.rect(3, 9, 10, 2, '#d0744c');
      for (let i = 0; i < 12; i++) b.rect(3 + ((i * 7) % 10), 2 + ((i * 5) % 7), 2, 2, i % 4 === 0 ? '#ef8fb1' : i % 2 ? P.leaf2 : P.leaf1);
      break;
    case 'lights':
      for (let x = 0; x < 16; x++) b.set(x, 3 + Math.round(Math.sin((x / 15) * Math.PI) * 4), '#2b1d1e');
      [2, 5, 8, 11, 14].forEach((x, i) => b.rect(x - 1, 5 + Math.round(Math.sin((x / 15) * Math.PI) * 4), 3, 3, ['#ffd84a', '#ef8fb1', '#9ad1e8', '#ffd84a', '#7fd8cf'][i]));
      break;
  }
  return b.outline();
}

// ------------------------------------------------------------------ the square

/** The market square: warm cobbles, a crosswalk-ish path to the stand, flower beds. */
export function paintSquare(w: number, h: number, seed = 5): HTMLCanvasElement {
  const W = w * 16;
  const H = h * 16;
  const b = new PixelBuffer(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const cx = Math.floor((x + (Math.floor(y / 8) % 2) * 4) / 8);
      const cy = Math.floor(y / 8);
      const v = hash2(cx, cy, seed);
      let c = v < 0.33 ? '#c9b48c' : v < 0.66 ? '#bfa983' : '#d3bf98';
      if ((x + (Math.floor(y / 8) % 2) * 4) % 8 === 0 || y % 8 === 0) c = '#a8936e';
      b.set(x, y, c);
    }
  // grass edges at the bottom and a few flower beds
  const r = mulberry32(seed);
  for (let y = H - 24; y < H; y++) for (let x = 0; x < W; x++) b.set(x, y, r() < 0.15 ? P.grass2 : P.grass1);
  for (let i = 0; i < W / 9; i++) b.set(Math.floor(r() * W), H - 2 - Math.floor(r() * 20), [P.flowerRed, P.flowerYellow, P.flowerPink, P.flowerWhite][i % 4]);
  return b.toCanvas();
}

/** Shops along the back of the square (a standing backdrop). */
export function paintStreet(wTiles: number): HTMLCanvasElement {
  const W = wTiles * 16;
  const H = 72;
  const b = new PixelBuffer(W, H);
  const fronts = [
    { wall: '#d98b6a', trim: '#8a4a32', awn: '#4b7fcf' },
    { wall: '#e8d29a', trim: '#8a6a32', awn: '#4f9a4a' },
    { wall: '#9cb6c9', trim: '#3e5a72', awn: '#d2453a' },
    { wall: '#c9a0d0', trim: '#6d469e', awn: '#e8bd3f' },
  ];
  let x = 0;
  let i = 0;
  while (x < W) {
    const w = 52 + Math.floor(hash2(i, 1, 4) * 24);
    const f = fronts[i % fronts.length];
    const top = 6 + Math.floor(hash2(i, 2, 4) * 12);
    b.rect(x, top, w, H - top, f.wall);
    b.rect(x, top, w, 3, f.trim);
    // upstairs windows
    for (let wx = x + 6; wx < x + w - 12; wx += 16) {
      b.rect(wx, top + 8, 10, 12, f.trim);
      b.rect(wx + 1, top + 9, 8, 10, P.glass1);
      b.hline(wx + 1, wx + 8, top + 14, f.trim);
    }
    // the shop window and door
    b.rect(x + 4, H - 26, w - 22, 22, f.trim);
    b.rect(x + 5, H - 25, w - 24, 20, P.glass2);
    b.rect(x + w - 15, H - 28, 11, 28, f.trim);
    b.rect(x + w - 14, H - 27, 9, 27, mix(f.trim, '#000000', 0.15));
    for (let ax = x + 2; ax < x + w - 2; ax++) b.vline(ax, H - 34, H - 29, Math.floor((ax - x) / 5) % 2 ? '#f4f1e8' : f.awn);
    x += w + 2;
    i++;
  }
  return b.toCanvas();
}

export interface StallLook {
  owned: string[];
}

/**
 * The player's stand, 7 tiles wide. What is drawn depends on what has been
 * bought: the awning, the chalkboard sign, flower pots, string lights, and
 * each food, drink and topping sitting on the counter.
 */
export function paintStall(look: StallLook): PixelBuffer {
  const has = (id: string) => look.owned.includes(id);
  const W = 112;
  const H = 84;
  const b = new PixelBuffer(W, H);
  const counterTop = 52;
  // back posts and roof (a plain wooden roof, or a striped awning)
  b.rect(6, 10, 4, counterTop - 10, P.wood2);
  b.rect(W - 10, 10, 4, counterTop - 10, P.wood2);
  if (has('awning')) {
    for (let x = 2; x < W - 2; x++) b.vline(x, 4, 16, Math.floor((x - 2) / 9) % 2 ? '#f4f1e8' : '#d2453a');
    for (let x = 2; x < W - 2; x += 9) for (let k = 0; k < 4; k++) b.hline(x + k, x + 8 - k, 17 + k, Math.floor((x - 2) / 9) % 2 ? '#f4f1e8' : '#d2453a');
  } else {
    b.rect(2, 6, W - 4, 8, P.wood1);
    b.rect(2, 13, W - 4, 2, P.woodDark);
  }
  if (has('lights')) for (let x = 6; x < W - 6; x += 1) {
    const y = 22 + Math.round(Math.sin(((x - 6) / (W - 12)) * Math.PI * 3) * 2);
    b.set(x, y, '#2b1d1e');
    if ((x - 6) % 8 === 0) b.rect(x - 1, y + 1, 3, 3, ['#ffd84a', '#ef8fb1', '#9ad1e8', '#7fd8cf'][((x - 6) / 8) % 4]);
  }
  // the counter
  b.rect(0, counterTop, W, 4, P.wood3);
  b.rect(0, counterTop + 4, W, H - counterTop - 4, P.wood1);
  for (let x = 4; x < W - 4; x += 12) b.rect(x, counterTop + 8, 9, H - counterTop - 12, P.wood2);
  b.hline(0, W - 1, counterTop, '#d39563');
  // a low cash box in the middle, short so the stand owner shows behind it
  b.rect(49, counterTop - 5, 14, 5, '#5b5f6b');
  b.rect(51, counterTop - 4, 10, 2, '#8fe08a');
  // what is on sale, left to right on the counter
  const items = ['popcorn', 'pretzel', 'hotdog', 'taco', 'pizza', 'water', 'lemonade', 'punch', 'smoothie', 'cocoa'].filter(has);
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);
  const put = (id: string, x: number, y: number) => {
    const icon = paintItem(id);
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const c = icon.get(xx, yy);
      if (c) b.set(x + xx, y + yy, c);
    }
  };
  left.forEach((id, i) => put(id, 2 + i * 8, counterTop - 15 - (i % 2) * 3));
  right.forEach((id, i) => put(id, 62 + i * 8, counterTop - 15 - (i % 2) * 3));
  // toppings: squeeze bottles in a row at the front edge
  ['salt', 'ketchup', 'mustard', 'cheese', 'sprinkles'].filter(has).forEach((id, i) => {
    const c = id === 'ketchup' ? '#c9483f' : id === 'mustard' ? '#e8bd3f' : id === 'cheese' ? '#f2c94c' : id === 'salt' ? '#f4f1e8' : '#dc6f9c';
    b.rect(30 + i * 5, counterTop + 6, 3, 6, c);
    b.rect(31 + i * 5, counterTop + 4, 1, 2, c);
  });
  if (has('plants')) {
    for (const px of [0, W - 12]) {
      b.rect(px + 2, H - 12, 9, 12, '#b85d3a');
      for (let i = 0; i < 10; i++) b.rect(px + 1 + ((i * 7) % 10), H - 22 + ((i * 3) % 9), 3, 3, i % 3 === 0 ? '#ef8fb1' : P.leaf2);
    }
  }
  return b.outline();
}

/** The chalkboard sign that stands beside the stand once bought. */
export function paintChalkboard(): PixelBuffer {
  const b = new PixelBuffer(22, 30);
  b.rect(1, 0, 20, 22, P.wood2);
  b.rect(3, 2, 16, 18, '#2f3a33');
  for (let y = 5; y < 18; y += 4) b.hline(5, 16 - (y % 3), y, y % 8 === 1 ? '#f2c94c' : '#fdfbf5');
  b.vline(4, 22, 29, P.wood2);
  b.vline(17, 22, 29, P.wood2);
  return b.outline();
}

export function paintLampPost(): PixelBuffer {
  const b = new PixelBuffer(12, 44);
  b.rect(5, 8, 2, 34, '#2f3a40');
  b.rect(3, 42, 6, 2, '#2f3a40');
  b.rect(2, 2, 8, 7, '#ffe7a3');
  b.rect(1, 0, 10, 2, '#2f3a40');
  b.rect(1, 8, 10, 1, '#2f3a40');
  return b.outline();
}

export function paintBunting(wTiles: number, seed = 2): PixelBuffer {
  const W = wTiles * 16;
  const b = new PixelBuffer(W, 14);
  const cols = ['#d2453a', '#f2c94c', '#4b7fcf', '#4f9a4a', '#dc6f9c'];
  for (let x = 0; x < W; x++) b.set(x, 2 + Math.round(Math.sin((x / W) * Math.PI) * 3), '#5a381f');
  for (let x = 4, i = seed; x < W - 6; x += 10, i++) {
    const y = 3 + Math.round(Math.sin((x / W) * Math.PI) * 3);
    for (let k = 0; k < 6; k++) b.hline(x + Math.floor(k / 2), x + 6 - Math.floor(k / 2), y + k, cols[i % cols.length]);
  }
  return b;
}

/** The "happy / waiting / grumpy" face over a customer's head (patience). */
export function paintMood(level: 0 | 1 | 2): PixelBuffer {
  const b = new PixelBuffer(11, 11);
  const c = level === 2 ? '#8fe08a' : level === 1 ? '#ffd84a' : '#ff8a7a';
  for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) if (Math.hypot(x - 5, y - 5) <= 5.2) b.set(x, y, c);
  b.set(3, 4, '#2b1d1e');
  b.set(7, 4, '#2b1d1e');
  if (level === 2) {
    b.hline(3, 7, 7, '#2b1d1e');
    b.set(2, 6, '#2b1d1e');
    b.set(8, 6, '#2b1d1e');
  } else if (level === 1) b.hline(3, 7, 7, '#2b1d1e');
  else {
    b.hline(3, 7, 7, '#2b1d1e');
    b.set(2, 8, '#2b1d1e');
    b.set(8, 8, '#2b1d1e');
  }
  return b.outline();
}
