import { PixelBuffer, mix } from '../../kit/art/pixel';
import { P } from '../../kit/art/palette';
import { paintText, textWidth } from '../../kit/art/pixelFont';
import { mulberry32 } from '../../kit/core/rng';
import { partById, type CarLook } from './cosmetics';

/**
 * Math Race Rally's art, painted in code: cars seen from behind (every body,
 * paint, style, wheel and spoiler), the answer gates that span the road, the
 * start/finish banner, scenery for each track and the sky behind it.
 */

export type Theme = 'hills' | 'desert' | 'seaside' | 'city';

export interface ThemeColors {
  sky: [string, string];
  fog: string;
  grass: [string, string];
  /** Off the road beyond the grass (water at the seaside). */
  far: string;
  road: [string, string];
  rumble: [string, string];
  lane: string;
  night: boolean;
}

export const THEMES: Record<Theme, ThemeColors> = {
  hills: { sky: ['#6fbbe8', '#cfeefa'], fog: '#cfeefa', grass: ['#7cb356', '#6aa24a'], far: '#5f9a40', road: ['#6b6b74', '#64646d'], rumble: ['#d2453a', '#f4f1e8'], lane: '#f4f1e8', night: false },
  desert: { sky: ['#f0a75a', '#fde3b0'], fog: '#fde3b0', grass: ['#e3bf7c', '#d6b06c'], far: '#c99a5a', road: ['#7a6e64', '#72675d'], rumble: ['#c9483f', '#f4f1e8'], lane: '#f2c94c', night: false },
  seaside: { sky: ['#58b4e8', '#d6f2fb'], fog: '#d6f2fb', grass: ['#f0dca8', '#e6cf96'], far: '#3f9fd6', road: ['#6b6b74', '#64646d'], rumble: ['#3f7fd6', '#f4f1e8'], lane: '#f4f1e8', night: false },
  city: { sky: ['#141a3a', '#3a2f6a'], fog: '#2a2552', grass: ['#3a3d4a', '#33363f'], far: '#24262f', road: ['#4a4a55', '#44444e'], rumble: ['#e47aa6', '#4fe8d0'], lane: '#ffe08a', night: true },
};

// ------------------------------------------------------------------ cars

const OUT = P.outline;

/** Paint text scaled up (each font pixel becomes a s x s block). */
export function paintBigText(b: PixelBuffer, text: string, x: number, y: number, color: string, s: number): void {
  const tmp = new PixelBuffer(textWidth(text), 5);
  paintText(tmp, text, 0, 0, color);
  for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < tmp.w; xx++) if (tmp.get(xx, yy)) b.rect(x + xx * s, y + yy * s, s, s, color);
}

/**
 * A car seen from behind, 48 x 32 pixels, centered at the bottom. `lean` is
 * -1, 0 or 1 for steering (the car body shifts a pixel).
 */
export function paintCar(look: CarLook, opts: { lean?: number; boost?: boolean; helmet?: string } = {}): PixelBuffer {
  const W = 48;
  const H = 34;
  const b = new PixelBuffer(W, H);
  const paint = partById(look.paint) ?? partById('red')!;
  const body = paint.color!;
  const shade = paint.shade!;
  const light = mix(body, '#ffffff', 0.35);
  const rim = partById(look.wheels)?.color ?? '#2b2b33';
  const tire = '#24242b';
  const helmet = opts.helmet ?? '#f4f1e8';
  const lean = opts.lean ?? 0;
  const cx = 24 + lean;
  const wheel = (x: number, y: number, w: number, h: number) => {
    b.rect(x, y, w, h, tire);
    b.rect(x + 1, y + Math.floor(h / 2) - 1, w - 2, 2, rim === '#2b2b33' ? '#3a3a44' : rim);
    if (look.wheels === 'neon') b.hline(x, x + w - 1, y + h, '#4fe8d0');
  };
  // shadow under the car
  b.ellipse(4, H - 5, W - 8, 5, 'rgba(0,0,0,0.35)');
  let top = 12;
  let stripeTop = 18;
  let stripeBottom = 27;
  let left = cx - 15;
  let right = cx + 14;
  switch (look.body) {
    case 'kart': {
      // big rear tires, low body, driver in a helmet
      wheel(cx - 21, 20, 9, 11);
      wheel(cx + 12, 20, 9, 11);
      b.rect(cx - 12, 21, 24, 8, body);
      b.rect(cx - 12, 27, 24, 2, shade);
      b.rect(cx - 10, 19, 20, 3, shade);
      b.ellipse(cx - 6, 8, 12, 12, helmet);
      b.rect(cx - 5, 12, 10, 3, mix(helmet, '#000000', 0.25));
      b.rect(cx - 8, 17, 16, 4, '#3a3a46');
      b.rect(cx - 3, 28, 6, 2, '#3a3a46');
      top = 18;
      stripeTop = 21;
      stripeBottom = 28;
      left = cx - 12;
      right = cx + 11;
      break;
    }
    case 'roadster': {
      wheel(cx - 19, 24, 7, 8);
      wheel(cx + 12, 24, 7, 8);
      b.rect(cx - 17, 16, 34, 13, body);
      b.rect(cx - 17, 27, 34, 2, shade);
      b.rect(cx - 12, 8, 24, 9, shade);
      b.rect(cx - 10, 9, 20, 7, '#9ad1e8');
      b.ellipse(cx - 4, 9, 8, 7, helmet);
      b.hline(cx - 17, cx + 16, 16, light);
      b.rect(cx - 16, 19, 5, 3, '#ff6b5e');
      b.rect(cx + 11, 19, 5, 3, '#ff6b5e');
      b.rect(cx - 5, 23, 10, 3, '#f4f1e8');
      top = 8;
      left = cx - 17;
      right = cx + 16;
      break;
    }
    case 'bubble': {
      wheel(cx - 15, 24, 6, 8);
      wheel(cx + 9, 24, 6, 8);
      b.ellipse(cx - 14, 10, 28, 20, body);
      b.rect(cx - 13, 24, 26, 4, shade);
      b.ellipse(cx - 9, 6, 18, 12, '#9ad1e8');
      b.ellipse(cx - 4, 8, 8, 8, helmet);
      b.set(cx - 6, 8, '#ffffff');
      b.rect(cx - 12, 19, 4, 3, '#ff6b5e');
      b.rect(cx + 8, 19, 4, 3, '#ff6b5e');
      top = 6;
      stripeTop = 17;
      stripeBottom = 26;
      left = cx - 13;
      right = cx + 12;
      break;
    }
    case 'pickup': {
      wheel(cx - 20, 23, 8, 9);
      wheel(cx + 12, 23, 8, 9);
      b.rect(cx - 18, 13, 36, 16, body);
      b.rect(cx - 18, 27, 36, 2, shade);
      b.rect(cx - 13, 4, 26, 10, shade);
      b.rect(cx - 11, 5, 22, 7, '#9ad1e8');
      b.ellipse(cx - 4, 6, 8, 7, helmet);
      b.hline(cx - 18, cx + 17, 13, light);
      b.hline(cx - 18, cx + 17, 16, shade);
      b.rect(cx - 17, 18, 5, 4, '#ff6b5e');
      b.rect(cx + 12, 18, 5, 4, '#ff6b5e');
      b.rect(cx - 6, 21, 12, 3, '#f4f1e8');
      top = 4;
      left = cx - 18;
      right = cx + 17;
      break;
    }
    default: {
      // rocket: a narrow body with fins and a big exhaust
      wheel(cx - 17, 24, 6, 8);
      wheel(cx + 11, 24, 6, 8);
      b.rect(cx - 9, 10, 18, 19, body);
      b.rect(cx - 9, 27, 18, 2, shade);
      for (let k = 0; k < 8; k++) {
        b.hline(cx - 9 - k, cx - 9, 18 + k, shade);
        b.hline(cx + 8, cx + 8 + k, 18 + k, shade);
      }
      b.ellipse(cx - 5, 3, 10, 10, '#9ad1e8');
      b.ellipse(cx - 3, 5, 6, 6, helmet);
      b.ellipse(cx - 4, 22, 8, 7, '#3a3a46');
      b.ellipse(cx - 2, 24, 4, 3, opts.boost ? '#ffe08a' : '#ff8a3a');
      top = 3;
      stripeTop = 12;
      stripeBottom = 20;
      left = cx - 9;
      right = cx + 8;
    }
  }
  // style decals
  const st = look.stripe;
  if (st === 'stripe') {
    b.rect(cx - 4, stripeTop, 2, stripeBottom - stripeTop, '#f4f1e8');
    b.rect(cx + 2, stripeTop, 2, stripeBottom - stripeTop, '#f4f1e8');
  } else if (st === 'checker') {
    for (let x = left; x <= right; x++) for (let y = stripeTop; y < stripeTop + 4; y++) b.set(x, y, (Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? '#f4f1e8' : '#2b2b33');
  } else if (st === 'stars') {
    for (const sx of [left + 4, cx, right - 4]) {
      b.set(sx, stripeTop + 2, '#ffe08a');
      b.hline(sx - 1, sx + 1, stripeTop + 3, '#ffe08a');
      b.set(sx, stripeTop + 4, '#ffe08a');
    }
  } else if (st === 'flames') {
    for (let x = left; x <= right; x++) {
      const hgt = 2 + Math.abs(((x * 7) % 9) - 4);
      for (let k = 0; k < hgt; k++) b.set(x, stripeBottom - k, k > hgt - 2 ? '#ffe08a' : '#ff8a3a');
    }
  } else if (st === 'bolt') {
    const pts = [
      [cx + 3, stripeTop],
      [cx - 2, stripeTop + 4],
      [cx + 2, stripeTop + 4],
      [cx - 3, stripeBottom],
    ];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let t = 0; t <= n; t++) b.rect(Math.round(x0 + ((x1 - x0) * t) / n), Math.round(y0 + ((y1 - y0) * t) / n), 2, 1, '#ffe08a');
    }
  }
  // spoiler
  if (look.spoiler === 'lip') b.rect(left + 2, stripeTop - 3, right - left - 3, 2, shade);
  if (look.spoiler === 'wing') {
    const wy = Math.max(0, top - 2);
    b.rect(cx - 8, wy + 2, 2, 5, '#3a3a46');
    b.rect(cx + 6, wy + 2, 2, 5, '#3a3a46');
    b.rect(left - 1, wy, right - left + 3, 3, shade);
    b.hline(left - 1, right + 1, wy, light);
  }
  // boost flames from the exhaust
  if (opts.boost) {
    b.rect(cx - 7, 30, 3, 3, '#ffe08a');
    b.rect(cx + 4, 30, 3, 3, '#ffe08a');
    b.set(cx - 6, 33, '#ff8a3a');
    b.set(cx + 5, 33, '#ff8a3a');
  }
  return b.outline(OUT);
}

// ------------------------------------------------------------------ gates and banners

/**
 * An answer gate that spans the road: three panels, one over each lane.
 * `state` marks the picked panel right (green) or wrong (red), and the
 * hint mode outlines the right one.
 */
export function paintGate(values: number[], opts: { picked?: number; correct?: number; hint?: number } = {}): PixelBuffer {
  const W = 192;
  const H = 64;
  const b = new PixelBuffer(W, H);
  // posts
  b.rect(2, 10, 6, H - 10, '#e9e6de');
  b.rect(W - 8, 10, 6, H - 10, '#e9e6de');
  for (let y = 12; y < H; y += 8) {
    b.rect(2, y, 6, 4, '#d2453a');
    b.rect(W - 8, y, 6, 4, '#d2453a');
  }
  // top beam
  b.rect(0, 2, W, 8, '#3a3a46');
  for (let x = 0; x < W; x += 8) b.rect(x, 3, 4, 2, '#ffe08a');
  const pw = 52;
  const gap = (W - 16 - pw * 3) / 2;
  values.forEach((v, i) => {
    const x = 8 + i * (pw + gap);
    const right = opts.picked === i && opts.correct === i;
    const wrong = opts.picked === i && opts.correct !== i;
    const showRight = opts.picked !== undefined && opts.correct === i;
    const bg = right || showRight ? '#7fd36a' : wrong ? '#f08a7e' : '#fdfbf5';
    b.rect(x, 10, pw, 30, opts.hint === i ? '#3fae5a' : '#2b2b33');
    b.rect(x + 2, 12, pw - 4, 26, bg);
    const txt = String(v);
    const s = txt.length >= 3 ? 3 : 4;
    const tw = textWidth(txt) * s;
    paintBigText(b, txt, Math.round(x + pw / 2 - tw / 2), Math.round(25 - (5 * s) / 2), '#2b2b33', s);
    // a little hanger chain
    b.vline(x + 8, 9, 10, '#9aa1ad');
    b.vline(x + pw - 9, 9, 10, '#9aa1ad');
  });
  return b;
}

/** The checkered start/finish banner across the road. */
export function paintFinish(): PixelBuffer {
  const W = 192;
  const H = 64;
  const b = new PixelBuffer(W, H);
  b.rect(2, 8, 6, H - 8, '#e9e6de');
  b.rect(W - 8, 8, 6, H - 8, '#e9e6de');
  for (let y = 4; y < 26; y++) for (let x = 0; x < W; x++) b.set(x, y, (Math.floor(x / 6) + Math.floor(y / 6)) % 2 ? '#f4f1e8' : '#2b2b33');
  b.rect(W / 2 - 34, 8, 68, 14, '#d2453a');
  // flags in the middle: a checkered banner reads at any distance
  for (let k = 0; k < 3; k++) b.rect(W / 2 - 24 + k * 18, 11, 12, 8, k % 2 ? '#f4f1e8' : '#ffe08a');
  return b;
}

// ------------------------------------------------------------------ scenery

/** A roadside sprite for a theme (several variants per theme). */
export function paintScenery(theme: Theme, variant: number): PixelBuffer {
  const r = mulberry32(variant * 31 + theme.length);
  if (theme === 'hills') {
    if (variant % 3 === 2) {
      // fence post with flowers
      const b = new PixelBuffer(24, 16);
      b.rect(0, 4, 24, 2, P.wood2);
      b.rect(0, 9, 24, 2, P.wood2);
      b.rect(2, 2, 3, 14, P.wood1);
      b.rect(19, 2, 3, 14, P.wood1);
      for (let i = 0; i < 6; i++) b.set(4 + Math.floor(r() * 16), 13 + Math.floor(r() * 3), ['#ef8fb1', '#f2c94c', '#ffffff'][i % 3]);
      return b.outline();
    }
    const b = new PixelBuffer(32, 44);
    b.rect(14, 28, 5, 16, P.trunk);
    const g = [P.leaf1, P.leaf2, P.leaf3];
    for (const [x, y, w, h] of [
      [3, 10, 15, 16],
      [14, 8, 15, 16],
      [7, 0, 18, 16],
      [9, 16, 16, 14],
    ])
      b.ellipse(x, y, w, h, g[1]);
    for (let i = 0; i < 60; i++) {
      const x = Math.floor(r() * 32);
      const y = Math.floor(r() * 30);
      if (b.get(x, y)) b.set(x, y, g[Math.floor(r() * 3)]);
    }
    return b.outline();
  }
  if (theme === 'desert') {
    if (variant % 3 === 2) {
      const b = new PixelBuffer(28, 14);
      b.ellipse(0, 2, 28, 12, '#b9805a');
      b.ellipse(3, 2, 18, 7, '#cf9a70');
      return b.outline();
    }
    const b = new PixelBuffer(24, 40);
    b.rect(9, 4, 7, 36, '#4f9a4a');
    b.rect(2, 14, 5, 12, '#4f9a4a');
    b.rect(2, 24, 9, 4, '#4f9a4a');
    b.rect(18, 10, 5, 12, '#4f9a4a');
    b.rect(14, 20, 9, 4, '#4f9a4a');
    for (let y = 6; y < 38; y += 4) b.set(12, y, '#7fc46a');
    if (variant % 2) b.rect(10, 1, 4, 3, '#ef8fb1');
    return b.outline();
  }
  if (theme === 'seaside') {
    if (variant % 3 === 2) {
      // beach umbrella
      const b = new PixelBuffer(28, 32);
      b.vline(14, 8, 31, '#e9e6de');
      for (let k = 0; k < 9; k++) for (let x = 14 - k * 1.5; x <= 14 + k * 1.5; x++) b.set(Math.round(x), 2 + k, Math.floor((x + 30) / 4) % 2 ? '#f4f1e8' : '#e47aa6');
      return b.outline();
    }
    const b = new PixelBuffer(32, 48);
    for (let y = 14; y < 48; y++) b.rect(15 + Math.round(Math.sin(y / 9) * 2), y, 4, 1, y % 4 ? '#a5754a' : '#8a5f3a');
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      for (let t = 0; t < 14; t++) b.rect(Math.round(17 + Math.cos(ang) * t), Math.round(12 + Math.sin(ang) * t * 0.6 + (t * t) / 30), 2, 2, t % 3 ? '#4f9a4a' : '#3c7b39');
    }
    return b.outline();
  }
  // city: buildings with lit windows, and street lamps
  if (variant % 3 === 2) {
    const b = new PixelBuffer(12, 40);
    b.rect(5, 8, 2, 32, '#5a5d6b');
    b.rect(2, 2, 8, 7, '#ffe08a');
    b.rect(1, 0, 10, 2, '#5a5d6b');
    return b.outline();
  }
  const w = 36 + Math.floor(r() * 16);
  const h = 60 + Math.floor(r() * 50);
  const b = new PixelBuffer(w, h);
  const wall = ['#3a3366', '#2f3f66', '#4a2f5a'][variant % 3];
  b.rect(0, 0, w, h, wall);
  for (let y = 6; y < h - 6; y += 8) for (let x = 4; x < w - 4; x += 7) if (r() < 0.6) b.rect(x, y, 4, 4, r() < 0.3 ? '#ef8fb1' : '#ffe08a');
  if (variant % 2) {
    b.rect(4, 2, w - 8, 6, '#e47aa6');
    b.hline(5, w - 6, 4, '#ffd6e6');
  }
  return b.outline();
}

/** The sky and far horizon for a theme (drawn behind everything). */
export function paintSky(theme: Theme): PixelBuffer {
  const c = THEMES[theme];
  const W = 512;
  const H = 128;
  const b = new PixelBuffer(W, H);
  const r = mulberry32(theme.length * 7);
  for (let y = 0; y < H; y++) {
    const band = Math.floor((y / H) * 8) / 8;
    b.hline(0, W - 1, y, mix(c.sky[0], c.sky[1], band));
  }
  if (c.night) for (let i = 0; i < 90; i++) b.set(Math.floor(r() * W), Math.floor(r() * 70), '#fff6cf');
  else {
    // clouds
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(r() * W);
      const y = 10 + Math.floor(r() * 40);
      b.ellipse(x, y, 30, 8, '#ffffff');
      b.ellipse(x + 8, y - 4, 18, 8, '#ffffff');
    }
  }
  const hor = H - 1;
  for (let x = 0; x < W; x++) {
    let hh: number;
    if (theme === 'hills') hh = 22 + Math.round(Math.sin(x / 40) * 10 + Math.sin(x / 13) * 3);
    else if (theme === 'desert') hh = 14 + (Math.floor(x / 60) % 3 === 0 ? 22 : 0) + Math.round(Math.sin(x / 9) * 1);
    else if (theme === 'seaside') hh = 8;
    else hh = 20 + ((Math.floor(x / 14) * 37) % 41);
    const col = theme === 'hills' ? '#6aa0b8' : theme === 'desert' ? '#c98a58' : theme === 'seaside' ? '#3f8fc6' : '#1f1d3a';
    b.vline(x, hor - hh, hor, col);
    if (theme === 'city') for (let y = hor - hh + 3; y < hor - 2; y += 5) if ((x * 13 + y * 7) % 11 === 0) b.set(x, y, '#ffe08a');
  }
  if (theme === 'seaside') for (let x = 0; x < W; x += 3) b.set(x, hor - 6 + ((x * 7) % 3), '#d6f2fb');
  if (theme === 'desert' || theme === 'hills') b.ellipse(W - 90, 18, 20, 20, theme === 'desert' ? '#fff1b3' : '#fff8d6');
  if (theme === 'city') b.ellipse(W - 90, 16, 16, 16, '#fdf6e3');
  return b;
}

/** A small pixel bolt (the garage money). */
export function paintBoltIcon(): PixelBuffer {
  const b = new PixelBuffer(12, 12);
  b.ellipse(1, 1, 10, 10, '#9aa1ad');
  b.ellipse(3, 3, 6, 6, '#c9ced6');
  b.rect(4, 5, 4, 2, '#5a5d6b');
  return b.outline();
}

/** A pixel trophy for the results. */
export function paintTrophy(place: number): PixelBuffer {
  const c = place === 1 ? '#f2c94c' : '#c9ced6';
  const b = new PixelBuffer(20, 22);
  b.rect(4, 0, 12, 10, c);
  b.ellipse(4, 4, 12, 10, c);
  b.rect(0, 2, 4, 2, c);
  b.rect(16, 2, 4, 2, c);
  b.rect(8, 12, 4, 5, c);
  b.rect(4, 17, 12, 4, '#84502f');
  b.rect(7, 3, 2, 5, mix(c, '#ffffff', 0.5));
  return b.outline();
}
