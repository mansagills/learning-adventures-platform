import { PixelBuffer, mix } from '../../kit/art/pixel';
import { P } from '../../kit/art/palette';
import { paintText, textWidth } from '../../kit/art/pixelFont';
import { mulberry32 } from '../../kit/core/rng';
import { drawHand } from './clockface';
import { handAngles, type Time } from './problems';

/**
 * Time Attack Clock's art, painted in code in the Seeds of Genius pixel
 * style: the town square, the clock tower (its hands, bell and lights come
 * back as the player fixes the town), the school, the bakery, the bus stop
 * and the bus.
 */

export interface Plaza {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** The square: cobbles in the middle, grass at the sides, and a road along the bottom. */
export function paintTown(w: number, h: number, plaza: Plaza, roadY: number, seed = 21): HTMLCanvasElement {
  const W = w * 16;
  const H = h * 16;
  const b = new PixelBuffer(W, H);
  const r = mulberry32(seed);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const tx = x / 16;
      const ty = y / 16;
      const v = r();
      if (ty >= roadY) b.set(x, y, v < 0.1 ? '#55565e' : '#61626b');
      else if (tx >= plaza.x0 && tx < plaza.x1 && ty >= plaza.y0 && ty < plaza.y1) b.set(x, y, P.cobble1);
      else b.set(x, y, v < 0.12 ? P.grass2 : v < 0.2 ? P.grass3 : P.grass1);
    }
  // cobbles: offset rows of rounded stones
  for (let y = plaza.y0 * 16; y < plaza.y1 * 16; y += 6) {
    const off = (y / 6) % 2 ? 4 : 0;
    for (let x = plaza.x0 * 16 + off; x < plaza.x1 * 16; x += 8) {
      const c = r() < 0.3 ? P.cobble3 : r() < 0.5 ? P.cobble2 : P.cobble1;
      b.rect(x + 1, y + 1, 6, 4, c);
      b.hline(x + 1, x + 6, y + 5, mix(P.cobble2, '#000000', 0.12));
    }
  }
  // a curb along the road and a yellow dashed line
  b.rect(0, roadY * 16 - 3, W, 3, '#b8b2a6');
  b.hline(0, W - 1, roadY * 16 - 1, '#8f897e');
  const mid = Math.round((roadY + (h - roadY) / 2) * 16);
  for (let x = 4; x < W; x += 24) b.rect(x, mid, 12, 2, '#f2c94c');
  // the crosswalk to the bus stop
  for (let x = 4 * 16; x < 6 * 16; x += 6) b.rect(x, roadY * 16 + 2, 4, (h - roadY) * 16 - 4, '#e9e6de');
  // flowers in the grass
  const fl = ['#ef8fb1', '#f2c94c', '#ffffff', '#9ad1e8'];
  for (let i = 0; i < (W * H) / 300; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * H);
    const tx = x / 16;
    const ty = y / 16;
    if (ty < roadY - 0.3 && !(tx >= plaza.x0 && tx < plaza.x1 && ty >= plaza.y0 && ty < plaza.y1)) b.set(x, y, fl[Math.floor(r() * fl.length)]);
  }
  return b.toCanvas();
}

/** Sky and a row of rooftops behind the square, darker as evening falls. */
export function paintSkyline(widthPx: number, heightPx: number, night: number, seed = 8): HTMLCanvasElement {
  const b = new PixelBuffer(widthPx, heightPx);
  const r = mulberry32(seed);
  const top = mix('#8fd0ee', '#141a3a', night);
  const low = mix('#fde9c9', '#3a3566', night);
  for (let y = 0; y < heightPx; y++) {
    const band = Math.floor((y / heightPx) * 6) / 6;
    for (let x = 0; x < widthPx; x++) b.set(x, y, mix(top, low, band));
  }
  if (night > 0.5) for (let i = 0; i < widthPx / 8; i++) b.set(Math.floor(r() * widthPx), Math.floor(r() * heightPx * 0.5), '#fff6cf');
  // far hills
  for (let x = 0; x < widthPx; x++) {
    const hh = 26 + Math.round(Math.sin(x / 37) * 7 + Math.sin(x / 13) * 3);
    b.vline(x, heightPx - hh, heightPx - 1, mix('#8cbf7a', '#1d2a3a', night * 0.8));
  }
  // houses with pointed roofs
  const roofs = ['#b9503e', '#3f6fa8', '#5f8a3a', '#8a5cc4', '#c7782e'];
  const walls = ['#f1e3c6', '#e7d0b0', '#f4ecdc', '#dcc7a3'];
  let x = -6;
  while (x < widthPx) {
    const w = 26 + Math.floor(r() * 18);
    const wallTop = heightPx - 18 - Math.floor(r() * 10);
    const roof = mix(roofs[Math.floor(r() * roofs.length)], '#141a3a', night * 0.5);
    const wall = mix(walls[Math.floor(r() * walls.length)], '#2a2d4a', night * 0.55);
    b.rect(x, wallTop, w, heightPx - wallTop, wall);
    const peak = Math.floor(w / 2);
    for (let k = 0; k <= peak; k++) b.hline(x + k - 1, x + w - k, wallTop - Math.floor(k * 0.7), roof);
    for (let wx = x + 5; wx < x + w - 6; wx += 9) {
      const lit = night > 0.3 && r() < 0.7;
      b.rect(wx, wallTop + 4, 5, 6, lit ? '#ffe7a3' : mix('#9ad1e8', '#2a3050', night));
    }
    x += w + 1;
  }
  return b.toCanvas();
}

export interface TowerState {
  hands: boolean;
  bell: boolean;
  lights: boolean;
}

/**
 * The clock tower: stone, with a pointed roof, a belfry and a big clock face.
 * Without its hands the clock shows nothing; without its bell the belfry is
 * empty; with its lights there are glowing windows and a lamp at the top.
 */
export function paintTower(state: TowerState, time: Time, night: number): PixelBuffer {
  const W = 56;
  const H = 140;
  const b = new PixelBuffer(W, H);
  const stone = '#c9bda8';
  const stone2 = '#b3a68f';
  const trim = '#8f826c';
  // body
  b.rect(8, 52, 40, H - 52, stone);
  for (let y = 54; y < H; y += 6) {
    const off = (y / 6) % 2 ? 0 : 5;
    for (let x = 8 + off; x < 48; x += 10) b.rect(x, y, 9, 5, (x + y) % 3 ? stone : stone2);
  }
  b.rect(6, 48, 44, 6, trim);
  b.rect(6, H - 10, 44, 10, trim);
  // the door
  b.rect(21, H - 30, 14, 22, P.woodDark);
  b.ellipse(21, H - 36, 14, 12, P.woodDark);
  b.rect(23, H - 30, 10, 20, P.wood2);
  b.ellipse(23, H - 34, 10, 10, P.wood2);
  b.vline(28, H - 34, H - 11, P.woodDark);
  b.set(31, H - 20, '#f2c94c');
  // a window (glowing once the lights are back)
  b.rect(24, 88, 8, 12, trim);
  b.rect(25, 89, 6, 10, state.lights ? '#ffe08a' : mix('#6d7f99', '#1a2040', night));
  b.vline(28, 89, 98, trim);
  // belfry: arches, with the bell inside once it is fixed
  b.rect(10, 24, 36, 24, stone2);
  b.rect(14, 28, 28, 18, '#3a2f2a');
  b.ellipse(14, 24, 28, 10, '#3a2f2a');
  b.rect(26, 24, 4, 24, stone2);
  if (state.bell) {
    for (const bx of [17, 31]) {
      b.ellipse(bx + 1, 31, 8, 6, '#e0b13a');
      b.rect(bx + 1, 34, 8, 6, '#e0b13a');
      b.hline(bx, bx + 9, 40, '#b88a1f');
      b.set(bx + 5, 41, '#8a6a12');
    }
  }
  // the roof spire
  for (let k = 0; k < 22; k++) b.hline(26 - Math.floor(k * 0.85), 29 + Math.floor(k * 0.85), 3 + k, k % 4 === 0 ? '#2f4f7a' : '#3f6fa8');
  b.rect(27, 0, 2, 4, P.metal);
  if (state.lights) b.rect(26, 0, 4, 3, '#ffe08a');
  // the clock face
  const cx = 28;
  const cy = 68;
  b.ellipse(cx - 15, cy - 15, 30, 30, '#8a6a12');
  b.ellipse(cx - 14, cy - 14, 28, 28, '#c9a227');
  b.ellipse(cx - 12, cy - 12, 24, 24, state.lights && night > 0.3 ? '#fff4c2' : '#fdf6e3');
  for (let n = 0; n < 12; n++) {
    const a = (n * 30 * Math.PI) / 180;
    b.set(Math.round(cx - 0.5 + Math.sin(a) * 10), Math.round(cy - 0.5 - Math.cos(a) * 10), n % 3 === 0 ? '#3a2a26' : '#9b8c78');
    if (n % 3 === 0) b.set(Math.round(cx - 0.5 + Math.sin(a) * 9), Math.round(cy - 0.5 - Math.cos(a) * 9), '#3a2a26');
  }
  if (state.hands) {
    const ang = handAngles(time);
    drawHand(b, cx - 0.5, cy - 0.5, ang.hour, 6, 2, '#2b3a67');
    drawHand(b, cx - 0.5, cy - 0.5, ang.minute, 9, 1, '#d2453a');
  } else {
    // a stopped clock: a crack across the face
    for (let i = 0; i < 9; i++) b.set(cx - 6 + i, cy - 4 + Math.round(Math.sin(i * 1.3) * 1.5) + Math.floor(i / 2), '#9b8c78');
  }
  b.rect(cx - 1, cy - 1, 2, 2, '#8a6a12');
  return b.outline();
}

/** The school: red brick, a small bell tower and a flag. Lit windows when finished. */
export function paintSchool(done: boolean, night: number): PixelBuffer {
  const W = 88;
  const H = 76;
  const b = new PixelBuffer(W, H);
  b.rect(4, 26, 80, 50, P.brick1);
  for (let y = 28; y < H; y += 4) for (let x = 4 + ((y / 4) % 2) * 4; x < 84; x += 8) b.hline(x, x + 6, y, P.brick2);
  // roof
  for (let k = 0; k < 14; k++) b.hline(2 + k * 2, W - 3 - k * 2, 26 - k, k % 3 === 0 ? '#5a4a4f' : '#6e5c61');
  // bell cupola and flag
  b.rect(38, 4, 12, 10, P.plaster);
  b.rect(40, 6, 8, 7, '#3a2f2a');
  b.ellipse(41, 7, 6, 5, '#e0b13a');
  for (let k = 0; k < 5; k++) b.hline(37 + k, 50 - k, 3 - k + 1, '#5a4a4f');
  b.vline(62, 0, 14, P.metal);
  b.rect(63, 1, 10, 6, '#4b7fcf');
  b.rect(63, 3, 10, 2, '#f4f1e8');
  // windows and door
  for (const wx of [10, 26, 56, 72]) {
    b.rect(wx, 36, 10, 14, P.plaster);
    b.rect(wx + 1, 37, 8, 12, done ? '#ffe08a' : mix('#9ad1e8', '#2a3050', night));
    b.hline(wx + 1, wx + 8, 43, P.plaster);
  }
  b.rect(36, 50, 16, 26, P.plaster);
  b.rect(38, 52, 12, 24, '#3f6fa8');
  b.vline(44, 52, 75, '#2f4f7a');
  // sign
  b.rect(26, 28, 36, 7, '#f4f1e8');
  for (let i = 0; i < 6; i++) b.rect(30 + i * 5, 30, 3, 3, ['#d2453a', '#f2c94c', '#4f9a4a', '#4b7fcf', '#8a5cc4', '#e0823a'][i]);
  return b.outline();
}

/** The bakery: striped awning, bread in the window, a chimney. Warm light when finished. */
export function paintBakery(done: boolean, night: number): PixelBuffer {
  const W = 88;
  const H = 76;
  const b = new PixelBuffer(W, H);
  b.rect(4, 22, 80, 54, '#f1e3c6');
  b.rect(4, 22, 80, 3, '#dfcdab');
  // roof and chimney
  b.rect(62, 0, 10, 16, P.brick2);
  b.rect(60, 0, 14, 3, P.brick1);
  for (let k = 0; k < 12; k++) b.hline(2 + k, W - 3 - k, 22 - k, k % 3 === 0 ? '#8a4f32' : '#a5603c');
  // awning
  for (let x = 2; x < W - 2; x++) b.vline(x, 34, 42, Math.floor((x - 2) / 8) % 2 ? '#f4f1e8' : '#e47aa6');
  for (let x = 2; x < W - 2; x += 8) for (let k = 0; k < 3; k++) b.hline(x + k, x + 7 - k, 43 + k, Math.floor((x - 2) / 8) % 2 ? '#f4f1e8' : '#e47aa6');
  // window with bread and a cake
  b.rect(8, 48, 44, 22, P.wood2);
  b.rect(10, 50, 40, 18, done ? '#ffe9b0' : mix('#cfe6ee', '#2a3050', night));
  b.rect(10, 62, 40, 6, P.wood3);
  for (const bx of [12, 22, 32]) {
    b.ellipse(bx, 57, 9, 6, '#c98c4a');
    b.hline(bx + 2, bx + 6, 58, '#e8b878');
  }
  b.rect(42, 54, 7, 8, '#f4f1e8');
  b.rect(42, 54, 7, 2, '#e47aa6');
  b.set(45, 53, '#d2453a');
  // door
  b.rect(60, 48, 16, 28, P.wood2);
  b.rect(62, 50, 12, 10, done ? '#ffe9b0' : '#cfe6ee');
  b.set(72, 64, '#f2c94c');
  // sign: a loaf
  b.rect(26, 26, 36, 7, P.woodDark);
  b.ellipse(37, 27, 14, 5, '#c98c4a');
  b.hline(40, 48, 29, '#e8b878');
  return b.outline();
}

/** The bus stop: a shelter, a sign with a bus on it, and a little clock. */
export function paintBusStop(time: Time | null): PixelBuffer {
  const W = 64;
  const H = 52;
  const b = new PixelBuffer(W, H);
  // shelter
  b.rect(4, 8, 40, 4, '#3f6fa8');
  b.rect(6, 12, 2, 36, P.metal);
  b.rect(40, 12, 2, 36, P.metal);
  b.rect(8, 14, 32, 24, '#cfe6ee');
  b.hline(8, 39, 14, '#e8f4f8');
  // bench
  b.rect(10, 38, 28, 3, P.wood3);
  b.rect(12, 41, 2, 7, P.metal);
  b.rect(34, 41, 2, 7, P.metal);
  // sign post with a bus
  b.rect(52, 6, 2, 42, P.metal);
  b.rect(46, 4, 14, 12, '#2f9a94');
  b.rect(48, 7, 10, 5, '#f2c94c');
  b.rect(49, 8, 3, 2, '#cfe6ee');
  b.rect(53, 8, 3, 2, '#cfe6ee');
  b.set(49, 12, '#2b1d1e');
  b.set(56, 12, '#2b1d1e');
  // a small round clock on the post
  b.ellipse(46, 18, 14, 14, '#c9a227');
  b.ellipse(47, 19, 12, 12, '#fdf6e3');
  if (time) {
    const a = handAngles(time);
    drawHand(b, 52.5, 24.5, a.hour, 3, 1, '#2b3a67');
    drawHand(b, 52.5, 24.5, a.minute, 5, 1, '#d2453a');
  }
  return b.outline();
}

/** The town bus (facing right). */
export function paintBus(): PixelBuffer {
  const W = 80;
  const H = 40;
  const b = new PixelBuffer(W, H);
  b.rect(2, 6, 74, 26, '#f2c94c');
  b.rect(2, 6, 74, 3, '#f7dc7a');
  b.rect(2, 26, 74, 4, '#d9a92a');
  for (let x = 6; x < 62; x += 12) b.rect(x, 11, 10, 9, '#9ad1e8');
  b.rect(64, 11, 10, 13, '#9ad1e8');
  b.rect(76, 22, 2, 6, '#fff4c2');
  b.rect(4, 22, 2, 4, '#d2453a');
  b.hline(4, 74, 21, '#2b1d1e');
  for (const wx of [14, 58]) {
    b.ellipse(wx - 6, 26, 12, 12, '#2b2b33');
    b.ellipse(wx - 3, 29, 6, 6, '#9aa3ab');
  }
  b.rect(20, 23, 12, 2, '#2b1d1e');
  paintText(b, '8', 66, 25, '#2b1d1e');
  return b.outline();
}

/** A puff of chimney smoke (three sizes for a little animation). */
export function paintSmoke(size: number): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  const s = 6 + size * 3;
  b.ellipse(8 - s / 2, 8 - s / 2, s, s, '#eef0f2');
  b.ellipse(8 - s / 2 + 1, 8 - s / 2, s - 3, s - 3, '#ffffff');
  return b;
}

/** A sundial in a round flower bed, in the middle of the square. */
export function paintSundial(): PixelBuffer {
  const b = new PixelBuffer(36, 26);
  b.ellipse(0, 8, 36, 18, '#8a5a3a');
  b.ellipse(2, 9, 32, 15, P.grass2);
  const fl = ['#ef8fb1', '#f2c94c', '#ffffff', '#d2453a'];
  for (let i = 0; i < 22; i++) b.set(4 + ((i * 11) % 28), 11 + ((i * 7) % 10), fl[i % 4]);
  b.rect(15, 6, 6, 10, '#c9bda8');
  b.ellipse(10, 2, 16, 7, '#d9cdb8');
  for (let k = 0; k < 5; k++) b.vline(17 + Math.floor(k / 2), 1 + k, 5, '#8a6a12');
  return b.outline();
}

export function paintTree(seed: number, night: number): PixelBuffer {
  const r = mulberry32(seed);
  const b = new PixelBuffer(28, 36);
  b.rect(12, 22, 4, 14, P.trunk);
  const g = [P.leaf1, P.leaf2, P.leaf3];
  for (const [x, y, w, h] of [
    [2, 8, 14, 14],
    [12, 6, 14, 14],
    [6, 0, 16, 14],
    [8, 12, 14, 12],
  ])
    b.ellipse(x, y, w, h, mix(g[1], '#1a2050', night * 0.3));
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(r() * 28);
    const y = Math.floor(r() * 24);
    if (b.get(x, y)) b.set(x, y, mix(g[Math.floor(r() * 3)], '#1a2050', night * 0.3));
  }
  return b.outline();
}

export function paintLamp(): PixelBuffer {
  const b = new PixelBuffer(10, 34);
  b.rect(4, 8, 2, 26, P.metal);
  b.rect(2, 32, 6, 2, P.metal);
  b.rect(1, 2, 8, 7, '#3a3a46');
  b.rect(2, 3, 6, 5, '#ffe7a3');
  b.rect(3, 0, 4, 2, '#3a3a46');
  return b.outline();
}

export function paintBench(): PixelBuffer {
  const b = new PixelBuffer(30, 16);
  b.rect(1, 2, 28, 3, P.wood3);
  b.rect(1, 7, 28, 3, P.wood1);
  b.rect(3, 10, 2, 6, P.metal);
  b.rect(25, 10, 2, 6, P.metal);
  return b.outline();
}

/** A gear (the reward for fixing part of the tower). */
export function paintGear(color = '#c9a227'): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    b.rect(Math.round(7 + Math.sin(a) * 6), Math.round(7 - Math.cos(a) * 6), 2, 2, color);
  }
  b.ellipse(2, 2, 12, 12, color);
  b.ellipse(5, 5, 6, 6, null);
  return b.outline();
}

/** A medal for the Time Attack round. */
export function paintMedal(kind: 'gold' | 'silver' | 'bronze'): PixelBuffer {
  const c = kind === 'gold' ? '#f2c94c' : kind === 'silver' ? '#c9ced6' : '#c7782e';
  const b = new PixelBuffer(16, 20);
  b.rect(4, 0, 3, 8, '#d2453a');
  b.rect(9, 0, 3, 8, '#3f6fa8');
  b.ellipse(2, 6, 12, 12, c);
  b.ellipse(5, 9, 6, 6, mix(c, '#ffffff', 0.4));
  return b.outline();
}

/** A tiny pixel clock for buttons and the HUD. */
export function paintClockIcon(t: Time = { h: 10, m: 10 }): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  b.ellipse(0, 0, 16, 16, '#8a6a12');
  b.ellipse(1, 1, 14, 14, '#c9a227');
  b.ellipse(2, 2, 12, 12, '#fdf6e3');
  const a = handAngles(t);
  drawHand(b, 7.5, 7.5, a.hour, 3, 1, '#2b3a67');
  drawHand(b, 7.5, 7.5, a.minute, 5, 1, '#d2453a');
  return b;
}

/** A sign with a time on it ("3:15"), for the bus stop and bakery boards in the world. */
export function paintTimeSign(text: string): PixelBuffer {
  const w = textWidth(text) + 6;
  const b = new PixelBuffer(w, 11);
  b.rect(0, 0, w, 9, '#2f3a33');
  paintText(b, text, 3, 2, '#fdfbf5');
  b.vline(Math.floor(w / 2), 9, 10, P.wood2);
  return b.outline();
}
