import { PixelBuffer, mix } from '../../kit/art/pixel';
import { P } from '../../kit/art/palette';
import type { Expression } from '../../kit/art/portraits';
import { mulberry32 } from '../../kit/core/rng';
import type { Booth } from './problems';

/**
 * Counting Carnival's art, painted in code in the Seeds of Genius pixel
 * style: the fairground, four booths, Munch the monster, and the pieces the
 * booth games use (ducks, rings, cookies, tickets, prizes).
 */

export const BOOTH_COLORS: Record<Booth, { stripe: string; stripe2: string; sign: string }> = {
  ducks: { stripe: '#3d8fd6', stripe2: '#f4f1e8', sign: '#f2c94c' },
  rings: { stripe: '#d23b33', stripe2: '#f4f1e8', sign: '#4f9a4a' },
  snacks: { stripe: '#8a5cc4', stripe2: '#f4f1e8', sign: '#e47aa6' },
  tickets: { stripe: '#e0823a', stripe2: '#fdf3c4', sign: '#2f6f6a' },
};

// ------------------------------------------------------------------ ground

/** The fairground: a sandy plaza with stone paths and grass around the edge. */
export function paintFairground(w: number, h: number, plaza: { x0: number; y0: number; x1: number; y1: number }, seed = 11): HTMLCanvasElement {
  const W = w * 16;
  const H = h * 16;
  const b = new PixelBuffer(W, H);
  const r = mulberry32(seed);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const tx = x / 16;
      const ty = y / 16;
      const inPlaza = tx >= plaza.x0 && tx < plaza.x1 && ty >= plaza.y0 && ty < plaza.y1;
      const v = r();
      if (inPlaza) b.set(x, y, v < 0.1 ? '#d2b07a' : v < 0.16 ? '#e9cc94' : '#dfbf87');
      else b.set(x, y, v < 0.12 ? P.grass2 : v < 0.2 ? P.grass3 : P.grass1);
    }
  // plaza edge and a checkered path through the middle
  for (let x = plaza.x0 * 16; x < plaza.x1 * 16; x++) {
    b.set(x, plaza.y0 * 16, '#b39a72');
    b.set(x, plaza.y1 * 16 - 1, '#b39a72');
  }
  for (let y = plaza.y0 * 16; y < plaza.y1 * 16; y++) {
    b.set(plaza.x0 * 16, y, '#b39a72');
    b.set(plaza.x1 * 16 - 1, y, '#b39a72');
  }
  const midX = Math.floor((plaza.x0 + plaza.x1) / 2) - 1;
  for (let ty = plaza.y0; ty < h; ty++)
    for (let tx = midX; tx < midX + 2; tx++) {
      const c = (tx + ty) % 2 ? '#c9b48c' : '#e7d6b0';
      b.rect(tx * 16 + 1, ty * 16 + 1, 14, 14, c);
    }
  // confetti and flowers
  const confetti = ['#d23b33', '#f2c94c', '#3d8fd6', '#4f9a4a', '#e47aa6', '#8a5cc4'];
  for (let i = 0; i < (W * H) / 220; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * H);
    const inPlaza = x / 16 >= plaza.x0 && x / 16 < plaza.x1 && y / 16 >= plaza.y0 && y / 16 < plaza.y1;
    const c = confetti[Math.floor(r() * confetti.length)];
    if (inPlaza) {
      if (r() < 0.35) b.set(x, y, c);
    } else {
      b.set(x, y, r() < 0.5 ? P.grass2 : c);
    }
  }
  return b.toCanvas();
}

/** Sky, a big striped top and a Ferris wheel: a tall picture behind the fairground. */
export function paintBackdrop(widthPx: number, heightPx: number, night: number, seed = 5): HTMLCanvasElement {
  const b = new PixelBuffer(widthPx, heightPx);
  const r = mulberry32(seed);
  const top = mix('#8fd0ee', '#141a3a', night);
  const low = mix('#fbe7c6', '#3a3566', night);
  for (let y = 0; y < heightPx; y++) {
    const t = y / heightPx;
    const band = Math.floor(t * 6) / 6;
    for (let x = 0; x < widthPx; x++) b.set(x, y, mix(top, low, (x + y) % 2 && t * 6 - Math.floor(t * 6) > 0.8 ? band + 1 / 6 : band));
  }
  if (night > 0.5) for (let i = 0; i < widthPx / 8; i++) b.set(Math.floor(r() * widthPx), Math.floor(r() * heightPx * 0.6), '#fff6cf');
  // Ferris wheel on the left
  const cx = Math.floor(widthPx * 0.2);
  const cy = heightPx - 62;
  const R = 46;
  const steel = night > 0.5 ? '#9aa3c8' : '#f4f1e8';
  for (let a = 0; a < 360; a += 1) {
    const rad = (a * Math.PI) / 180;
    b.set(Math.round(cx + Math.cos(rad) * R), Math.round(cy + Math.sin(rad) * R), steel);
    b.set(Math.round(cx + Math.cos(rad) * (R - 1)), Math.round(cy + Math.sin(rad) * (R - 1)), mix(steel, '#7a8094', 0.4));
  }
  const cabins = ['#d23b33', '#f2c94c', '#3d8fd6', '#4f9a4a', '#e47aa6', '#e0823a', '#8a5cc4', '#2f9a94'];
  for (let k = 0; k < 8; k++) {
    const rad = (k * Math.PI) / 4;
    const ex = Math.round(cx + Math.cos(rad) * R);
    const ey = Math.round(cy + Math.sin(rad) * R);
    for (let s = 0; s <= R; s += 2) b.set(Math.round(cx + Math.cos(rad) * s), Math.round(cy + Math.sin(rad) * s), steel);
    b.rect(ex - 3, ey, 7, 6, cabins[k]);
    b.hline(ex - 3, ex + 3, ey, mix(cabins[k], '#ffffff', 0.4));
  }
  for (let i = 0; i < 50; i++) {
    b.set(cx - Math.floor(i / 2), cy + i, steel);
    b.set(cx + Math.floor(i / 2), cy + i, steel);
  }
  // big top tent in the middle right
  const tx = Math.floor(widthPx * 0.62);
  const ty = heightPx - 70;
  for (let row = 0; row < 40; row++) {
    const half = 8 + row * 2;
    for (let x = -half; x <= half; x++) b.set(tx + x, ty + row, Math.floor((x + 200) / 8) % 2 ? '#d23b33' : '#f4f1e8');
  }
  b.rect(tx - 88, ty + 40, 177, 30, '#f4f1e8');
  for (let x = tx - 88; x <= tx + 88; x += 16) b.rect(x, ty + 40, 8, 30, '#d23b33');
  b.rect(tx - 10, ty + 48, 20, 22, '#2b1d1e');
  b.vline(tx, ty - 14, ty, '#7a4c2c');
  b.rect(tx + 1, ty - 14, 9, 6, '#f2c94c');
  // distant trees along the bottom
  const tl = mix('#3f7336', '#1d3b2e', night);
  for (let x = 0; x < widthPx; x += 4) b.ellipse(x - 3, heightPx - 8 - Math.floor(r() * 6), 9, 14, tl);
  b.rect(0, heightPx - 4, widthPx, 4, tl);
  return b.toCanvas();
}

// ------------------------------------------------------------------ booths and props

/** A booth facade (64 px wide, 4 tiles): striped awning, sign with its picture, counter, and lights. */
export function paintBooth(booth: Booth, lit: boolean, night: number): PixelBuffer {
  const c = BOOTH_COLORS[booth];
  const b = new PixelBuffer(64, 60);
  const dim = (col: string) => mix(col, '#1a2050', night * 0.35);
  // posts
  b.rect(3, 18, 3, 40, dim(P.wood2));
  b.rect(58, 18, 3, 40, dim(P.wood2));
  // back wall
  b.rect(6, 22, 52, 22, dim('#f1e3c6'));
  // counter
  b.rect(2, 40, 60, 18, dim(P.wood1));
  b.hline(2, 61, 40, dim(P.wood3));
  for (let x = 2; x < 62; x += 8) b.vline(x, 41, 57, dim(P.wood2));
  // awning with scalloped edge
  for (let y = 10; y < 22; y++) for (let x = 0; x < 64; x++) b.set(x, y, dim(Math.floor(x / 8) % 2 ? c.stripe : c.stripe2));
  for (let x = 0; x < 64; x += 8) b.ellipse(x, 19, 8, 6, dim(Math.floor(x / 8) % 2 ? c.stripe : c.stripe2));
  b.hline(0, 63, 10, dim(mix(c.stripe, '#ffffff', 0.3)));
  // sign on top
  b.rect(18, 0, 28, 11, dim(c.sign));
  b.hline(18, 45, 0, dim(mix(c.sign, '#ffffff', 0.35)));
  const icon = boothIcon(booth);
  b.blit(icon, 32 - Math.floor(icon.w / 2), 1);
  // goods on the counter
  b.blit(boothIcon(booth), 10, 30);
  b.blit(boothIcon(booth), 42, 30);
  // light bulbs along the awning: glow when the booth is complete
  for (let x = 4; x < 64; x += 8) {
    b.set(x, 22, lit ? '#fff6a8' : dim('#7a7468'));
    b.set(x, 23, lit ? '#ffd35e' : dim('#5e584e'));
  }
  return b.outline();
}

/** Small pictures that tell a booth apart (also used on its sign). */
export function boothIcon(booth: Booth): PixelBuffer {
  switch (booth) {
    case 'ducks':
      return paintDuck(0);
    case 'rings': {
      const b = new PixelBuffer(10, 9);
      b.ellipse(0, 0, 10, 9, '#d23b33');
      b.ellipse(3, 3, 4, 3, null);
      return b;
    }
    case 'snacks':
      return paintCookie('small');
    case 'tickets': {
      const b = new PixelBuffer(10, 8);
      b.rect(0, 0, 10, 8, '#f2c94c');
      b.set(0, 3, null);
      b.set(9, 3, null);
      b.hline(2, 7, 2, '#c98c1f');
      b.hline(2, 6, 5, '#c98c1f');
      return b;
    }
  }
}

export function paintLamp(lit: boolean): PixelBuffer {
  const b = new PixelBuffer(10, 34);
  b.rect(4, 8, 2, 26, P.metal);
  b.rect(2, 32, 6, 2, P.metal);
  b.rect(1, 2, 8, 7, '#3a3a46');
  b.rect(2, 3, 6, 5, lit ? '#ffe7a3' : '#6b6656');
  b.rect(3, 0, 4, 2, '#3a3a46');
  return b.outline();
}

export function paintPopcornCart(): PixelBuffer {
  const b = new PixelBuffer(28, 36);
  b.rect(2, 14, 24, 16, '#d23b33');
  b.rect(4, 4, 20, 12, '#cfe6ee');
  for (let i = 0; i < 40; i++) b.set(5 + (i * 7) % 18, 9 + ((i * 3) % 7), i % 3 ? '#fff8e0' : '#f2c94c');
  b.rect(2, 0, 24, 4, '#f2c94c');
  b.ellipse(3, 28, 8, 8, '#2b2b33');
  b.ellipse(17, 28, 8, 8, '#2b2b33');
  b.hline(5, 22, 20, '#f4f1e8');
  return b.outline();
}

export function paintBalloons(seed: number): PixelBuffer {
  const r = mulberry32(seed);
  const b = new PixelBuffer(24, 40);
  const cols = ['#d23b33', '#f2c94c', '#3d8fd6', '#4f9a4a', '#e47aa6', '#8a5cc4'];
  for (let i = 0; i < 4; i++) {
    const x = 2 + i * 5;
    const y = 2 + Math.floor(r() * 8);
    const c = cols[Math.floor(r() * cols.length)];
    b.ellipse(x, y, 7, 9, c);
    b.set(x + 2, y + 2, mix(c, '#ffffff', 0.5));
    for (let yy = y + 9; yy < 38; yy++) b.set(12 + Math.round(((x + 3 - 12) * (38 - yy)) / 30), yy, '#5c463a');
  }
  b.rect(9, 36, 7, 4, P.wood2);
  return b.outline();
}

export function paintFlagString(widthPx: number, seed: number): PixelBuffer {
  const r = mulberry32(seed);
  const b = new PixelBuffer(widthPx, 12);
  const cols = ['#d23b33', '#f2c94c', '#3d8fd6', '#4f9a4a', '#e47aa6'];
  for (let x = 0; x < widthPx; x++) {
    const y = Math.round(2 + Math.sin((x / widthPx) * Math.PI) * 3);
    b.set(x, y, '#5c463a');
    if (x % 8 === 2) {
      const c = cols[Math.floor(r() * cols.length)];
      for (let j = 0; j < 5; j++) b.hline(x, x + 4 - j, y + 1 + j, c);
    }
  }
  return b;
}

export function paintTree(seed: number, night: number): PixelBuffer {
  const r = mulberry32(seed);
  const b = new PixelBuffer(28, 36);
  b.rect(12, 22, 4, 14, P.trunk);
  const g = [P.leaf1, P.leaf2, P.leaf3];
  [[2, 8, 14, 14], [12, 6, 14, 14], [6, 0, 16, 14], [8, 12, 14, 12]].forEach(([x, y, w, h]) => b.ellipse(x, y, w, h, mix(g[1], '#1a2050', night * 0.3)));
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(r() * 28);
    const y = Math.floor(r() * 24);
    if (b.get(x, y)) b.set(x, y, mix(g[Math.floor(r() * 3)], '#1a2050', night * 0.3));
  }
  return b.outline();
}

export function paintArch(): PixelBuffer {
  const b = new PixelBuffer(80, 56);
  b.rect(2, 16, 8, 40, '#d23b33');
  b.rect(70, 16, 8, 40, '#d23b33');
  for (let y = 16; y < 56; y += 6) {
    b.hline(2, 9, y, '#f4f1e8');
    b.hline(70, 77, y, '#f4f1e8');
  }
  // arched sign
  for (let x = 0; x < 80; x++) {
    const top = Math.round(10 - Math.sin((x / 79) * Math.PI) * 9);
    for (let y = top; y < top + 12; y++) b.set(x, y, '#f2c94c');
    b.set(x, top, '#fff1b8');
  }
  // stars on the sign
  for (let x = 8; x < 76; x += 10) {
    const y = Math.round(10 - Math.sin((x / 79) * Math.PI) * 9) + 5;
    b.set(x, y, '#d23b33');
    b.set(x - 1, y, '#d23b33');
    b.set(x + 1, y, '#d23b33');
    b.set(x, y - 1, '#d23b33');
    b.set(x, y + 1, '#d23b33');
  }
  return b.outline();
}

// ------------------------------------------------------------------ Munch

const MUNCH = { body: '#7e57c2', shade: '#5e3f9a', light: '#a685e0', belly: '#c9b4ef', horn: '#f2c94c', mouth: '#4a1f3a', tongue: '#e0574f' };

/** Munch the snack monster: 24x26, two frames (mouth closed / open wide). */
export function paintMunch(frame: number): PixelBuffer {
  const b = new PixelBuffer(24, 26);
  const m = MUNCH;
  b.ellipse(2, 4, 20, 20, m.body);
  b.ellipse(5, 11, 14, 11, m.belly);
  // fuzzy edge
  for (let x = 3; x < 21; x += 3) b.set(x, 4, m.light);
  // horn and feet
  b.rect(11, 0, 2, 4, m.horn);
  b.set(12, 0, '#fff1b8');
  b.rect(5, 23, 5, 3, m.shade);
  b.rect(14, 23, 5, 3, m.shade);
  // one big eye
  b.ellipse(8, 6, 8, 7, '#fdfbf5');
  b.rect(11, 8, 3, 3, P.outline);
  b.set(11, 8, '#ffffff');
  // mouth
  if (frame === 1) {
    b.ellipse(6, 14, 12, 8, m.mouth);
    b.rect(9, 18, 6, 2, m.tongue);
    b.set(8, 14, '#ffffff');
    b.set(15, 14, '#ffffff');
  } else {
    b.hline(7, 16, 16, m.mouth);
    b.set(6, 15, m.mouth);
    b.set(17, 15, m.mouth);
    b.set(9, 17, '#ffffff');
    b.set(14, 17, '#ffffff');
  }
  // arms
  b.rect(0, 13, 3, 5, m.shade);
  b.rect(21, 13, 3, 5, m.shade);
  return b.outline();
}

/** Munch's 48x48 portrait for the talk box. */
export function paintMunchPortrait(expression: Expression): PixelBuffer {
  const b = new PixelBuffer(48, 48);
  const m = MUNCH;
  b.ellipse(4, 8, 40, 42, m.body);
  b.ellipse(12, 26, 24, 20, m.belly);
  for (let x = 6; x < 42; x += 4) b.set(x, 9, m.light);
  b.rect(22, 0, 4, 9, m.horn);
  b.rect(23, 0, 2, 2, '#fff1b8');
  // eye
  const happy = expression === 'smile' || expression === 'proud';
  b.ellipse(14, 12, 20, 16, '#fdfbf5');
  if (happy) {
    for (let x = 18; x < 30; x++) b.set(x, 20 - Math.round(Math.sin(((x - 18) / 11) * Math.PI) * 3), P.outline);
  } else {
    b.ellipse(21, 16, 7, 7, P.outline);
    b.rect(22, 17, 2, 2, '#ffffff');
    if (expression === 'thinking') b.hline(15, 32, 11, m.shade);
  }
  // mouth
  if (expression === 'curious') b.ellipse(19, 32, 10, 8, m.mouth);
  else {
    b.ellipse(10, 30, 28, 12, m.mouth);
    b.rect(18, 37, 12, 3, m.tongue);
    for (let x = 13; x < 36; x += 5) b.rect(x, 30, 2, 2, '#ffffff');
  }
  return b.outline();
}

// ------------------------------------------------------------------ booth game pieces

/** A rubber duck (16x14), two bob frames. */
export function paintDuck(frame: number): PixelBuffer {
  const b = new PixelBuffer(16, 14);
  const y = frame ? 1 : 0;
  b.ellipse(1, 5 + y, 13, 8, '#f2c94c');
  b.ellipse(8, 0 + y, 7, 7, '#f2c94c');
  b.rect(14, 3 + y, 2, 2, '#e0823a');
  b.set(11, 2 + y, P.outline);
  b.ellipse(3, 7 + y, 6, 3, '#e8b53a');
  b.set(1, 6 + y, '#f2c94c');
  return b.outline('#8a5a0e');
}

/** A ring for the ring toss (12x8 seen at an angle). */
/** A ring seen from the side (the one that flies through the air). */
export function paintRing(color = '#d23b33'): PixelBuffer {
  const b = new PixelBuffer(16, 8);
  b.ellipse(0, 0, 16, 8, color);
  b.ellipse(3, 2, 10, 4, null);
  b.hline(4, 11, 0, mix(color, '#ffffff', 0.4));
  return b.outline();
}

/**
 * A peg on the ring-toss board, with or without a ring around it. The ring's
 * back half is drawn behind the post and its front half in front, so it
 * reads as a ring that has dropped over the peg.
 */
export function paintPeg(ring: string | null = null): PixelBuffer {
  const b = new PixelBuffer(18, 22);
  b.ellipse(2, 16, 14, 5, P.woodDark);
  b.ellipse(3, 16, 12, 4, P.wood2);
  const post = () => {
    b.rect(8, 4, 3, 15, P.wood1);
    b.vline(8, 4, 18, P.wood3);
    b.ellipse(6, 1, 7, 4, P.wood3);
    b.hline(8, 10, 1, '#d9a06c');
  };
  if (!ring) {
    post();
    return b.outline();
  }
  const r = new PixelBuffer(18, 8);
  r.ellipse(0, 0, 18, 8, ring);
  r.ellipse(4, 2, 10, 4, null);
  r.hline(4, 13, 0, mix(ring, '#ffffff', 0.4));
  r.shadeWhere((_x, y) => y >= 6, mix(ring, '#000000', 0.25));
  const top = 13;
  const split = 4; // rows of the ring above this are behind the post
  for (let y = 0; y < split; y++) for (let x = 0; x < 18; x++) if (r.get(x, y)) b.set(x, top + y, r.get(x, y));
  post();
  for (let y = split; y < 8; y++) for (let x = 0; x < 18; x++) if (r.get(x, y)) b.set(x, top + y, r.get(x, y));
  return b.outline();
}

export function paintCookie(size: 'big' | 'small'): PixelBuffer {
  const d = size === 'big' ? 18 : 9;
  const b = new PixelBuffer(d + 2, d + 2);
  b.ellipse(1, 1, d, d, '#c98c4a');
  b.ellipse(2, 2, d - 3, d - 3, '#dba15c');
  const chips = size === 'big' ? 6 : 2;
  for (let i = 0; i < chips; i++) {
    const a = (i / chips) * Math.PI * 2;
    const rr = d / 4;
    b.rect(Math.round(1 + d / 2 + Math.cos(a) * rr), Math.round(1 + d / 2 + Math.sin(a) * rr), size === 'big' ? 2 : 1, size === 'big' ? 2 : 1, '#4a2a1a');
  }
  return b.outline();
}

export function paintPlate(): PixelBuffer {
  const b = new PixelBuffer(60, 26);
  b.ellipse(0, 0, 60, 26, '#f4f1e8');
  b.ellipse(6, 3, 48, 19, '#e3ddd0');
  return b.outline('#8f97a8');
}

/** A strip of 10 tickets (8 wide, 40 tall), or a single ticket (8x6). */
export function paintTicketStrip(): PixelBuffer {
  const b = new PixelBuffer(10, 42);
  for (let i = 0; i < 10; i++) {
    b.rect(1, 1 + i * 4, 8, 4, i % 2 ? '#f2c94c' : '#f6d672');
    b.set(1, 1 + i * 4, null);
    b.set(8, 1 + i * 4, null);
  }
  return b.outline('#8a5a0e');
}

export function paintTicket(): PixelBuffer {
  const b = new PixelBuffer(10, 8);
  b.rect(1, 1, 8, 6, '#f2c94c');
  b.set(1, 3, null);
  b.set(8, 3, null);
  b.hline(3, 6, 3, '#c98c1f');
  return b.outline('#8a5a0e');
}

/** Prize pictures for the Prize Counter (16x16). */
export function paintPrize(name: string): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  if (name.includes('teddy')) {
    b.ellipse(3, 5, 10, 10, '#a0643c');
    b.ellipse(4, 0, 8, 7, '#a0643c');
    b.ellipse(2, 0, 4, 4, '#a0643c');
    b.ellipse(10, 0, 4, 4, '#a0643c');
    b.set(6, 3, P.outline);
    b.set(9, 3, P.outline);
    b.rect(7, 4, 2, 1, P.outline);
    b.ellipse(5, 8, 6, 5, '#d9b27c');
  } else if (name.includes('kite')) {
    for (let i = 0; i < 7; i++) b.hline(8 - i, 8 + i, i, '#3d8fd6');
    for (let i = 0; i < 6; i++) b.hline(3 + i, 13 - i, 7 + i, '#d23b33');
    b.vline(8, 13, 15, '#5c463a');
  } else if (name.includes('yo-yo')) {
    b.ellipse(3, 4, 11, 11, '#4f9a4a');
    b.ellipse(6, 7, 5, 5, '#f2c94c');
    b.vline(8, 0, 4, '#5c463a');
  } else if (name.includes('drum')) {
    b.rect(2, 5, 12, 9, '#d23b33');
    b.ellipse(2, 2, 12, 6, '#f4f1e8');
    for (let x = 3; x < 14; x += 3) b.vline(x, 7, 13, '#f2c94c');
  } else if (name.includes('wand')) {
    b.vline(6, 7, 15, '#8a5cc4');
    b.rect(5, 1, 3, 3, '#f2c94c');
    b.hline(3, 9, 2, '#f2c94c');
    b.vline(6, 0, 5, '#f2c94c');
  } else if (name.includes('pinwheel')) {
    b.vline(8, 8, 15, '#5c463a');
    for (let i = 0; i < 5; i++) {
      b.hline(8, 12 - i, 3 + i, '#e47aa6');
      b.hline(4 + i, 8, 3 + i, '#3d8fd6');
    }
  } else if (name.includes('robot')) {
    b.rect(4, 2, 8, 6, '#8f95a3');
    b.rect(3, 8, 10, 7, '#5b5f6b');
    b.set(6, 4, '#3d8fd6');
    b.set(9, 4, '#3d8fd6');
    b.vline(8, 0, 2, '#d23b33');
  } else {
    b.ellipse(2, 2, 12, 12, '#d23b33');
    b.rect(2, 7, 12, 2, '#f4f1e8');
    b.rect(7, 2, 2, 12, '#3d8fd6');
  }
  return b.outline();
}

/** Balloons the player can win and carry (cosmetic). */
export const BALLOON_COLORS = [
  { id: 'red', name: 'Red balloon', color: '#d23b33', cost: 6 },
  { id: 'gold', name: 'Gold balloon', color: '#f2c94c', cost: 6 },
  { id: 'blue', name: 'Blue balloon', color: '#3d8fd6', cost: 8 },
  { id: 'green', name: 'Green balloon', color: '#4f9a4a', cost: 8 },
  { id: 'pink', name: 'Pink balloon', color: '#e47aa6', cost: 10 },
  { id: 'purple', name: 'Purple balloon', color: '#8a5cc4', cost: 10 },
] as const;

export function paintCarriedBalloon(color: string): PixelBuffer {
  const b = new PixelBuffer(10, 26);
  b.ellipse(1, 0, 8, 10, color);
  b.set(3, 2, mix(color, '#ffffff', 0.5));
  for (let y = 10; y < 26; y++) b.set(5 + (y % 4 === 0 ? 1 : 0), y, '#5c463a');
  return b.outline();
}
