import { PixelBuffer } from '../../kit/art/pixel';
import { mixHex } from '../../kit/worlds/shade';
import { WILD } from '../../kit/worlds/wild-lands/art';
import { paintCloud, paintDrip, paintPine, paintRain, paintStormCloud, paintThermometer, SKY } from '../../kit/worlds/wild-lands/weather-art';
import type { CloudPic, CycleStage } from './problems';

/**
 * The pictures for the Weather Book questions and hints, painted in the
 * Wild Lands style. Labels are added as text on top by the game (so they
 * can be read aloud and stay sharp), so these return the spots for them.
 */

type Pt = [number, number];

function sky(b: PixelBuffer, top = '#7cc0ec', bottom = '#d8eef6'): void {
  for (let y = 0; y < b.h; y++) {
    const t = y / b.h;
    const c = t < 0.33 ? top : t < 0.66 ? mixHex(top, bottom, 0.5) : bottom;
    for (let x = 0; x < b.w; x++) b.set(x, y, (x + y) % 2 && t > 0.3 && t < 0.36 ? top : c);
  }
}

function sun(b: PixelBuffer, cx: number, cy: number, r: number): void {
  for (let y = -r * 2; y <= r * 2; y++)
    for (let x = -r * 2; x <= r * 2; x++) {
      const d = Math.hypot(x, y);
      if (d <= r) b.set(cx + x, cy + y, d < r * 0.6 ? '#fff8d0' : '#ffd23a');
      else if (d <= r * 1.6 && (x + y) % 2 === 0 && Math.abs(Math.atan2(y, x) * 4) % 1.6 < 0.5) b.set(cx + x, cy + y, '#ffe27a');
    }
}

/** A faint rising shimmer: water vapor is invisible, so this is only a hint of warm air moving. */
function shimmer(b: PixelBuffer, x0: number, y0: number, w: number, h: number, seed = 0): void {
  for (let k = 0; k < w; k += 4)
    for (let t = 0; t < h; t++) {
      const x = Math.round(x0 + k + Math.sin(t * 0.5 + k + seed) * 1.2);
      if ((t + k) % 3) b.set(x, y0 - t, '#ffffff');
    }
}

function arrow(b: PixelBuffer, x0: number, y0: number, x1: number, y1: number, c: string): void {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n);
    const y = Math.round(y0 + ((y1 - y0) * i) / n);
    b.set(x, y, c);
    b.set(x + 1, y, c);
  }
  const a = Math.atan2(y1 - y0, x1 - x0);
  for (const s of [-1, 1])
    for (let i = 0; i < 5; i++) {
      b.set(Math.round(x1 - Math.cos(a + s * 0.6) * i), Math.round(y1 - Math.sin(a + s * 0.6) * i), c);
    }
}

function outline(b: PixelBuffer, x: number, y: number, w: number, h: number, c = '#ffd23a'): void {
  for (let i = 0; i < w; i++) {
    b.set(x + i, y, c);
    b.set(x + i, y + h - 1, c);
    b.set(x + i, y + 1, c);
    b.set(x + i, y + h - 2, c);
  }
  for (let j = 0; j < h; j++) {
    b.set(x, y + j, c);
    b.set(x + w - 1, y + j, c);
    b.set(x + 1, y + j, c);
    b.set(x + w - 2, y + j, c);
  }
}

function blitAt(b: PixelBuffer, s: PixelBuffer, cx: number, bottom: number): void {
  b.blit(s, Math.round(cx - s.w / 2), Math.round(bottom - s.h));
}

/** The water cycle (the sea, the Sun, rising vapor, a cloud, rain on a hill, a river back to the sea), with one stage outlined. */
export function paintCycle(w: number, h: number, stage: CycleStage | null): { buf: PixelBuffer; at: Record<CycleStage, Pt> } {
  const b = new PixelBuffer(w, h);
  sky(b);
  sun(b, 16, 14, 8);
  // the hill on the right with a river running down to the sea on the left
  const ground = (x: number) => Math.round(h * 0.72 - Math.max(0, x - w * 0.5) * 0.55);
  for (let x = 0; x < w; x++) {
    const top = x < w * 0.42 ? h : ground(x);
    for (let y = top; y < h; y++) b.set(x, y, y < top + 2 ? WILD.grass[3] : WILD.grass[2]);
  }
  for (let x = 0; x < w * 0.45; x++) for (let y = Math.round(h * 0.76); y < h; y++) b.set(x, y, y < h * 0.78 ? '#bfe8f8' : WILD.sea[(x + y) % 9 ? 2 : 3]);
  // the river
  for (let x = Math.round(w * 0.45); x < w * 0.92; x++) {
    const y = ground(x) + 2;
    b.set(x, y, WILD.river[3]);
    b.set(x, y + 1, WILD.river[2]);
  }
  // rising vapor, the cloud, the rain
  shimmer(b, 22, Math.round(h * 0.72), 22, Math.round(h * 0.34));
  arrow(b, 46, Math.round(h * 0.62), 62, Math.round(h * 0.34), '#ffffff');
  const cl = paintCloud(16, 4, 'grey');
  b.blit(cl, Math.round(w * 0.5), 8);
  const rain = paintRain(cl.w - 8, Math.round(h * 0.3), 0);
  b.blit(rain, Math.round(w * 0.5) + 4, 8 + cl.h);
  arrow(b, Math.round(w * 0.6), h - 6, Math.round(w * 0.47), h - 6, WILD.river[4]);
  const at: Record<CycleStage, Pt> = {
    evaporation: [34 / w, 0.44],
    condensation: [(w * 0.5 + cl.w / 2) / w, 0.06],
    precipitation: [(w * 0.5 + cl.w / 2) / w, 0.5],
    collection: [0.22, 0.86],
  };
  if (stage === 'evaporation') outline(b, 14, Math.round(h * 0.3), 36, Math.round(h * 0.5));
  if (stage === 'condensation') outline(b, Math.round(w * 0.5) - 3, 4, cl.w + 6, cl.h + 6);
  if (stage === 'precipitation') outline(b, Math.round(w * 0.5) + 1, 6 + cl.h, cl.w - 2, Math.round(h * 0.32));
  if (stage === 'collection') outline(b, 2, Math.round(h * 0.72), Math.round(w * 0.9), Math.round(h * 0.28) - 1);
  return { buf: b, at };
}

/** A puddle drying in the sun. */
export function paintPuddle(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  sky(b);
  sun(b, w - 22, 16, 9);
  const gy = Math.round(h * 0.7);
  for (let y = gy; y < h; y++) for (let x = 0; x < w; x++) b.set(x, y, WILD.dirt[(x * 7 + y * 3) % 11 ? 2 : 1]);
  b.ellipse(Math.round(w * 0.3), gy + 4, Math.round(w * 0.4), 8, WILD.river[3]);
  b.ellipse(Math.round(w * 0.32), gy + 5, Math.round(w * 0.34), 5, WILD.river[2]);
  shimmer(b, Math.round(w * 0.32), gy + 2, Math.round(w * 0.34), 24);
  return b;
}

/** Two things side by side: one in the sun, one in the shade of a tree. */
export function paintSunShade(w: number, h: number, thing: 'towel' | 'cup'): PixelBuffer {
  const b = new PixelBuffer(w, h);
  sky(b);
  sun(b, 16, 14, 8);
  const gy = Math.round(h * 0.78);
  for (let y = gy; y < h; y++) for (let x = 0; x < w; x++) b.set(x, y, WILD.grass[2]);
  // the shade tree on the right
  for (let y = 10; y < gy; y++) for (let x = w - 40; x < w; x++) if (Math.hypot(x - (w - 20), (y - 22) * 1.2) < 22) b.set(x, y, WILD.leaf2[(x + y) % 5 ? 2 : 1]);
  b.rect(w - 22, 30, 4, gy - 30, WILD.bark[2]);
  for (let y = gy; y < h; y++) for (let x = w * 0.55; x < w; x++) if ((x + y) % 2) b.set(Math.round(x), y, WILD.grass[1]);
  const put = (cx: number, sunny: boolean) => {
    if (thing === 'towel') {
      b.rect(cx - 10, gy - 34, 20, 1, '#5a3a24');
      b.rect(cx - 8, gy - 33, 16, 20, sunny ? '#e0503a' : '#3a7ad8');
      for (let i = 0; i < 6; i++) b.set(cx - 6 + i * 2, gy - 12, WILD.river[3]);
    } else {
      b.rect(cx - 8, gy - 16, 16, 16, '#f2f4ec');
      b.rect(cx - 6, gy - 14, 12, 4, WILD.river[3]);
      b.rect(cx + 8, gy - 12, 3, 6, '#f2f4ec');
    }
    if (sunny) shimmer(b, cx - 6, gy - (thing === 'towel' ? 34 : 17), 12, 12, 1);
  };
  put(Math.round(w * 0.3), true);
  put(Math.round(w * 0.72), false);
  return b;
}

/** Water as a solid (an ice cube), a liquid (a glass) and a gas (an empty jar: vapor is invisible). */
export function paintStates(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  b.rect(0, 0, w, h, '#e6f2f8');
  const cw = Math.round(w / 3);
  for (let i = 1; i < 3; i++) b.rect(i * cw, 4, 1, h - 8, '#b8d0dc');
  const base = h - 10;
  // ice
  const c0 = Math.round(cw / 2);
  b.rect(c0 - 12, base - 24, 24, 24, SKY.ice[2]);
  b.rect(c0 - 12, base - 24, 24, 4, SKY.ice[4]);
  b.rect(c0 - 12, base - 24, 3, 24, SKY.ice[3]);
  for (let k = 0; k < 8; k++) b.set(c0 - 4 + k, base - 16 + (k >> 1), '#ffffff');
  // liquid in a glass
  const c1 = cw + Math.round(cw / 2);
  b.rect(c1 - 10, base - 30, 1, 30, '#9ab0bc');
  b.rect(c1 + 9, base - 30, 1, 30, '#9ab0bc');
  b.rect(c1 - 10, base, 20, 1, '#9ab0bc');
  b.rect(c1 - 9, base - 18, 18, 18, WILD.river[3]);
  b.rect(c1 - 9, base - 18, 18, 2, WILD.river[4]);
  // gas: an empty-looking jar with only a few faint specks (vapor is invisible)
  const c2 = 2 * cw + Math.round(cw / 2);
  b.rect(c2 - 12, base - 30, 1, 30, '#9ab0bc');
  b.rect(c2 + 11, base - 30, 1, 30, '#9ab0bc');
  b.rect(c2 - 12, base, 24, 1, '#9ab0bc');
  b.rect(c2 - 12, base - 32, 24, 2, '#7a6a5a');
  for (const [dx, dy] of [
    [-6, -20],
    [4, -12],
    [-2, -6],
    [7, -25],
  ])
    b.set(c2 + dx, base + dy, '#d0e4ee');
  return b;
}

/** A kettle: a clear gap right at the spout (invisible vapor), then white steam (tiny drops). */
export function paintKettle(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  b.rect(0, 0, w, h, '#f2e6d0');
  b.rect(0, h - 14, w, 14, '#b88a5a');
  const kx = 40;
  const ky = h - 14;
  b.ellipse(kx - 22, ky - 34, 44, 36, '#c0c8d0');
  b.ellipse(kx - 18, ky - 30, 16, 12, '#e6eef4');
  b.rect(kx - 6, ky - 42, 12, 6, '#3a3a4a');
  // the spout
  for (let i = 0; i < 18; i++) b.rect(kx + 18 + i, ky - 18 - i, 4, 4, '#a8b0b8');
  const sx = kx + 40;
  const sy = ky - 38;
  // the clear gap (nothing drawn), then the steam
  for (let k = 0; k < 7; k++) {
    const cx = sx + 14 + k * 8;
    const cy = sy - 6 - k * 3;
    const r = 4 + k;
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (Math.hypot(x, y) <= r && (x + y + k) % 3) b.set(cx + x, cy + y, '#ffffff');
  }
  return b;
}

/** A tide pool drying out in the sun, with white salt left on its rocks. */
export function paintSalt(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  sky(b);
  sun(b, w - 20, 14, 8);
  const gy = Math.round(h * 0.55);
  for (let y = gy; y < h; y++) for (let x = 0; x < w; x++) b.set(x, y, SKY.rock[(x * 3 + y * 5) % 13 ? 2 : 3]);
  const cx = Math.round(w / 2);
  const cy = gy + Math.round((h - gy) / 2);
  b.ellipse(cx - 50, cy - 14, 100, 28, '#f6f6f2');
  b.ellipse(cx - 42, cy - 10, 84, 20, '#e0e4e4');
  b.ellipse(cx - 30, cy - 7, 60, 14, WILD.sea[3]);
  for (let i = 0; i < 40; i++) b.set(cx - 46 + ((i * 37) % 92), cy - 12 + ((i * 13) % 24), '#ffffff');
  shimmer(b, cx - 20, cy - 8, 40, 20);
  return b;
}

/** 100 drops of Earth's water: 97 salty (blue), 2 frozen (white), 1 other fresh (light blue). */
export function paintEarth(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  b.rect(0, 0, w, h, '#eef4f8');
  const cell = Math.floor(Math.min((w - 8) / 10, (h - 8) / 10));
  const ox = Math.round((w - cell * 10) / 2);
  const oy = Math.round((h - cell * 10) / 2);
  const drop = (i: number, c: string) => {
    const x = ox + (i % 10) * cell + Math.round(cell / 2);
    const y = oy + Math.floor(i / 10) * cell + Math.round(cell / 2);
    const r = Math.max(2, Math.round(cell * 0.32));
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.hypot(dx, dy) <= r) b.set(x + dx, y + dy, c);
    for (let k = 1; k <= r; k++) b.set(x, y - r - k + 1, c);
  };
  for (let i = 0; i < 100; i++) drop(i, i < 97 ? WILD.sea[2] : i < 99 ? '#ffffff' : '#9ae0f2');
  // outline the last three (fresh water)
  return b;
}

/** A big thermometer with its 0 °C line. */
export function paintTherm(w: number, h: number, c: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  sky(b, c < 0 ? '#9ab8d8' : '#7cc0ec', c < 0 ? '#e6eef6' : '#d8eef6');
  if (c < 0) b.blit(paintRain(w, h, 0, true), 0, 0);
  const t = paintThermometer(48, c);
  b.blit(t, Math.round(w / 2 - t.w / 2), Math.round((h - t.h) / 2));
  return b;
}

/** A kind of cloud on a sky. */
export function paintCloudPic(w: number, h: number, kind: CloudPic): PixelBuffer {
  const b = new PixelBuffer(w, h);
  sky(b, kind === 'cumulus' ? '#5aa8e8' : '#8a9ab0', kind === 'cumulus' ? '#cfe8f6' : '#c8d0d8');
  const gy = h - 10;
  for (let y = gy; y < h; y++) for (let x = 0; x < w; x++) b.set(x, y, WILD.grass[2]);
  if (kind === 'cumulus') {
    blitAt(b, paintCloud(24, 3, 'cumulus'), w * 0.3, h * 0.45);
    blitAt(b, paintCloud(16, 3, 'cumulus'), w * 0.75, h * 0.32);
    sun(b, w - 18, 12, 7);
  } else if (kind === 'grey') {
    const c = paintCloud(24, 5, 'grey');
    blitAt(b, c, w / 2, h * 0.42);
    b.blit(paintRain(c.w - 20, Math.round(gy - h * 0.42), 0), Math.round(w / 2 - c.w / 2) + 10, Math.round(h * 0.42));
  } else if (kind === 'cumulonimbus') {
    const s = paintStormCloud(16, 0);
    blitAt(b, s, w / 2, gy + 2);
  } else {
    for (let y = 8; y < 30; y++) for (let x = 0; x < w; x++) b.set(x, y, SKY.grey[y < 10 ? 3 : y > 27 ? 1 : (x + y) % 7 ? 2 : 3]);
    for (let i = 0; i < 60; i++) b.set((i * 29) % w, 32 + ((i * 11) % (gy - 34)), '#a8c8e0');
  }
  return b;
}

/** A cold glass of ice water with drops on the outside. */
export function paintGlass(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  b.rect(0, 0, w, h, '#f2e6d0');
  sun(b, 18, 14, 7);
  b.rect(0, h - 12, w, 12, '#b88a5a');
  const cx = Math.round(w / 2);
  const top = 14;
  const base = h - 12;
  for (let y = top; y < base; y++) {
    b.set(cx - 18, y, '#9ab0bc');
    b.set(cx + 17, y, '#9ab0bc');
    for (let x = cx - 17; x < cx + 17; x++) if (y > top + 8) b.set(x, y, WILD.river[(x + y) % 9 ? 4 : 3]);
  }
  for (const [dx, dy] of [
    [-12, 14],
    [2, 22],
    [-4, 34],
  ])
    b.rect(cx + dx, top + dy, 9, 9, SKY.ice[3]);
  // the drops on the outside
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1;
    const x = cx + side * (19 + (i % 3));
    const y = top + 10 + ((i * 7) % (base - top - 14));
    b.set(x, y, '#ffffff');
    b.set(x, y + 1, WILD.river[3]);
  }
  return b;
}

/** A mountain with damp air rising up the left (clouds and rain) and a dry right side. */
export function paintMountain(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  sky(b);
  const peak = Math.round(w / 2);
  for (let x = 0; x < w; x++) {
    const top = Math.round(14 + Math.abs(x - peak) * ((h - 22) / peak));
    for (let y = top; y < h; y++) {
      const left = x < peak;
      let c = left ? WILD.leaf2[(x + y) % 6 ? 2 : 3] : WILD.sand[(x + y) % 6 ? 2 : 1];
      if (y < 24) c = SKY.snow[3];
      b.set(x, y, c);
    }
  }
  const c = paintCloud(16, 3, 'grey');
  b.blit(c, peak - c.w - 6, 18);
  b.blit(paintRain(c.w - 8, 30, 0), peak - c.w - 2, 18 + c.h);
  arrow(b, 8, h - 12, peak - c.w - 12, 30, '#ffffff');
  for (const x of [w - 40, w - 22]) b.blit(paintPine(10, false, 0), x, h - 24);
  return b;
}

/** A mountain with snow on top and a thermometer at the bottom. */
export function paintHeight(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  sky(b);
  const peak = Math.round(w * 0.55);
  for (let x = 0; x < w; x++) {
    const top = Math.round(10 + Math.abs(x - peak) * 0.9);
    for (let y = top; y < h; y++) b.set(x, y, y < 30 ? SKY.snow[(x + y) % 5 ? 3 : 4] : SKY.rock[(x * 3 + y) % 9 ? 2 : 1]);
  }
  for (let y = h - 8; y < h; y++) for (let x = 0; x < w; x++) b.set(x, y, WILD.grass[2]);
  b.blit(paintThermometer(16, 10), 8, h - 34);
  b.blit(paintRain(40, 24, 0, true), peak - 20, 2);
  return b;
}

/** A big snowflake (Drip's snow form, without the face). */
export function paintSnowflake(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  sky(b, '#8ab0d8', '#dceaf6');
  const s = paintDrip(64, 'snow');
  // cover the face: draw a plain centre over it
  b.blit(s, Math.round(w / 2 - s.w / 2), Math.round(h / 2 - s.h / 2));
  const cx = Math.round(w / 2);
  const cy = Math.round(h / 2 - s.h / 2 + s.h * 0.53);
  for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) if (Math.hypot(x, y) <= 9) b.set(cx + x, cy + y, Math.hypot(x, y) < 5 ? '#ffffff' : SKY.ice[3]);
  return b;
}

/** Grass with dew in the early morning, or fog lying over a lake. */
export function paintDew(w: number, h: number, fog: boolean): PixelBuffer {
  const b = new PixelBuffer(w, h);
  sky(b, '#f2c8a8', '#f8e8d0');
  sun(b, 20, h - 30, 7);
  const gy = Math.round(h * 0.62);
  if (fog) {
    for (let y = gy; y < h; y++) for (let x = 0; x < w; x++) b.set(x, y, WILD.river[(x + y) % 7 ? 2 : 3]);
    for (let y = gy - 14; y < gy + 10; y++) for (let x = 0; x < w; x++) if ((x + y) % 2 || (y > gy - 8 && y < gy + 4)) b.set(x, y, '#f4f6f8');
    for (const x of [w - 50, w - 30]) b.blit(paintPine(14, false, x), x, gy - 34);
  } else {
    for (let y = gy; y < h; y++) for (let x = 0; x < w; x++) b.set(x, y, WILD.grass[(x + y) % 4 ? 2 : 3]);
    for (let x = 2; x < w; x += 3) {
      const ht = 6 + ((x * 7) % 9);
      for (let k = 0; k < ht; k++) b.set(x, gy - k, WILD.leaf[2]);
      if (x % 2) b.set(x, gy - ht - 1, '#ffffff');
    }
  }
  return b;
}

/** The cloud chart (hint 2): cumulus (fair), stratus (grey day), cumulonimbus (storms). */
export function paintCloudChart(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  b.rect(0, 0, w, h, '#eaf4fa');
  const cw = Math.round(w / 3);
  blitAt(b, paintCloud(14, 3, 'cumulus'), cw / 2, h - 18);
  for (let y = h - 30; y < h - 18; y++) for (let x = cw + 6; x < 2 * cw - 6; x++) b.set(x, y, SKY.grey[y === h - 30 ? 3 : 2]);
  const s = paintStormCloud(10, 0);
  blitAt(b, s, cw * 2.5, h - 4);
  for (let i = 1; i < 3; i++) b.rect(i * cw, 4, 1, h - 8, '#b8d0dc');
  return b;
}

/** Professor Nimbus's talk-box portrait, with the tall wizard's hat (72x72). */
export function hatOnPortrait(p: PixelBuffer): PixelBuffer {
  const b = new PixelBuffer(p.w, p.h);
  b.blit(p, 0, 0);
  const ind = SKY.indigo;
  // the cone, leaning a little, from the brim up out of the frame
  for (let y = 0; y <= 14; y++) {
    const half = Math.round(3 + (y / 14) * 12);
    const cx = 37 - Math.round((14 - y) * 0.25);
    for (let x = -half; x <= half; x++) b.set(cx + x, y, x < -half + 3 ? ind[3] : x > half - 4 ? ind[1] : ind[2]);
  }
  // the band and the brim
  for (let x = 20; x <= 54; x++) {
    b.set(x, 11, '#f2c94c');
    b.set(x, 12, '#f2c94c');
  }
  for (let x = 10; x <= 64; x++) for (let y = 14; y <= 18; y++) if (((x - 37) / 27) ** 2 + ((y - 16) / 2.6) ** 2 <= 1) b.set(x, y, y === 14 ? ind[3] : y >= 17 ? ind[0] : ind[1]);
  for (const [x, y] of [
    [32, 4],
    [42, 7],
    [36, 9],
  ]) {
    b.set(x, y, '#f2c94c');
    b.set(x + 1, y, '#fff6c0');
  }
  return b;
}
