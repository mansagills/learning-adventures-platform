import { PixelBuffer } from '../art/pixel';
import type { Appearance } from '../art/characters';
import { HAIR_COLORS, OUTFIT_COLORS, P, SKIN_TONES } from '../art/palette';
import { Paint, mixHex, ramp, selout, toHsl, fromHsl, type Ramp } from './shade';

/**
 * Characters for the new worlds, in the richer 16-bit style (look
 * development, phase W0). One design is painted at any detail level:
 *   u = 1.5 gives a 24x36 child (24x42 adult)
 *   u = 2   gives a 32x48 child (32x56 adult)
 * Level (a), today's 16x24 size with richer color only, is made by
 * `richen()` from the kit's own character, so it matches Sunny Town exactly
 * in shape.
 */

export type Dir16 = 'down' | 'right' | 'left' | 'up';

export interface Look16 {
  build: 'kid' | 'adult';
  skin: string;
  hair: { style: 'puffs' | 'locs' | 'wrap' | 'short'; color: string; tie?: string };
  top: { color: string; trim: string; kind: 'dress' | 'jumpsuit' | 'robe' };
  legs: string;
  shoes: string;
  sole?: string;
  belt?: string;
  badge?: string;
  /** Bogolan (Malian mud cloth) marks on a robe. */
  mudcloth?: string;
  /** Two stripes down the front of a tunic (Roman clavi). */
  clavi?: string;
  /** A headset with a little microphone (Star Station crew). */
  headset?: string;
  /** A bead necklace. */
  beads?: [string, string];
}

/** The default player (the same child as Sunny Town's default). */
export const PLAYER16: Look16 = {
  build: 'kid',
  skin: '#7a4a2e',
  hair: { style: 'puffs', color: '#2c2433', tie: '#f2c94c' },
  top: { color: '#2f9a94', trim: '#f2c94c', kind: 'dress' },
  legs: '#3f4a6b',
  shoes: '#e0574f',
  sole: '#f4efe6',
  badge: '#f2c94c',
};

/** Test host for Star Station (a crew engineer). */
export const STATION_HOST: Look16 = {
  build: 'adult',
  skin: '#9c6440',
  hair: { style: 'locs', color: '#3b2a24', tie: '#ff9f43' },
  top: { color: '#e9edf5', trim: '#ff8a3d', kind: 'jumpsuit' },
  legs: '#e9edf5',
  shoes: '#5b6478',
  sole: '#c9d1de',
  belt: '#4a5266',
  badge: '#4fd6ff',
  headset: '#4a5266',
};

/** Test host for the Roman forum (a merchant in a tunic with clavi). */
export const FORUM_HOST: Look16 = {
  build: 'adult',
  skin: '#c08a5c',
  hair: { style: 'short', color: '#3a2a24' },
  top: { color: '#efe6d2', trim: '#b8483e', kind: 'robe' },
  legs: '#efe6d2',
  shoes: '#8a5a3a',
  clavi: '#b8483e',
};

/** Test host for Ancient Kingdoms (a market storyteller). */
export const ANCIENT_HOST: Look16 = {
  build: 'adult',
  skin: '#5a3825',
  hair: { style: 'wrap', color: '#2f4f9e', tie: '#f2b53a' },
  top: { color: '#efe2c4', trim: '#b5562e', kind: 'robe' },
  legs: '#efe2c4',
  shoes: '#8a5a3a',
  mudcloth: '#4a2e22',
  beads: ['#f2b53a', '#c9483f'],
};

/** The hair styles the 16-bit characters can show (the customize screen offers only these). */
export const HAIR16 = ['short', 'puffs', 'locs'] as const;

/**
 * The player's look in a 16-bit world, from the same choices as the kit's
 * customize screen: a tunic (with Roman stripes) or a dress in the outfit
 * color, bare legs and sandals. Hair styles the 16-bit painter does not have
 * yet fall back to the nearest one it has.
 */
export function look16FromAppearance(a: Appearance, opts: { clavi?: boolean } = {}): Look16 {
  const skin = (SKIN_TONES.find((s) => s.id === a.skin) ?? SKIN_TONES[1]).base;
  const hair = (HAIR_COLORS.find((h) => h.id === a.hairColor) ?? HAIR_COLORS[0]).base;
  const outfit = OUTFIT_COLORS.find((o) => o.id === a.outfit) ?? OUTFIT_COLORS[4];
  const style: Look16['hair']['style'] = a.hairStyle === 'puffs' || a.hairStyle === 'long' ? 'puffs' : a.hairStyle === 'locs' || a.hairStyle === 'braids' ? 'locs' : 'short';
  const trim = outfit.id === 'yellow' ? '#2f9a94' : '#f2c94c';
  const girl = a.body === 'girl';
  return {
    build: 'kid',
    skin,
    hair: { style, color: hair, tie: style === 'puffs' ? trim : undefined },
    top: { color: outfit.base, trim, kind: girl ? 'dress' : 'jumpsuit' },
    legs: skin,
    shoes: '#8a5a3a',
    sole: '#c9a074',
    belt: girl ? undefined : '#7a4a2e',
    clavi: !girl && opts.clavi ? trim : undefined,
  };
}

interface Layout {
  H: number;
  headCy: number;
  headRx: number;
  headRy: number;
  torsoTop: number;
  hem: number;
  legTop: number;
  foot: number;
  shoulderW: number;
  hemW: number;
}

function layout(l: Look16): Layout {
  if (l.build === 'adult')
    return { H: 28, headCy: 6.5, headRx: 4.3, headRy: 4.6, torsoTop: 11.0, hem: l.top.kind === 'robe' ? 26.0 : 20.4, legTop: 19.6, foot: 26.5, shoulderW: 3.6, hemW: l.top.kind === 'robe' ? 5.2 : 3.5 };
  return { H: 24, headCy: 7.7, headRx: 5.0, headRy: 5.1, torsoTop: 12.8, hem: 19.7, legTop: 19.0, foot: 22.5, shoulderW: 3.0, hemW: 4.4 };
}

interface Ramps {
  skin: Ramp;
  hair: Ramp;
  top: Ramp;
  trim: Ramp;
  legs: Ramp;
  shoes: Ramp;
  sole: Ramp;
  tie: Ramp;
  belt: Ramp;
  badge: Ramp;
}

const rampCache = new Map<Look16, Ramps>();
function ramps(l: Look16): Ramps {
  let r = rampCache.get(l);
  if (!r) {
    r = {
      skin: ramp(l.skin, { spread: 0.85, cool: 0.6 }),
      hair: ramp(l.hair.color, toHsl(l.hair.color)[2] < 0.25 ? { spread: 1.15, hiHue: 250, warm: 2.2 } : { spread: 0.9 }),
      top: ramp(l.top.color),
      trim: ramp(l.top.trim),
      legs: ramp(l.legs),
      shoes: ramp(l.shoes),
      sole: ramp(l.sole ?? '#f4efe6'),
      tie: ramp(l.hair.tie ?? l.top.trim),
      belt: ramp(l.belt ?? l.top.trim),
      badge: ramp(l.badge ?? P.gold),
    };
    rampCache.set(l, r);
  }
  return r;
}

const EYE = '#2a1a1c';
const EYE_LIGHT = '#fdfbf5';
const IRIS = '#5b3a30';

export interface Frame16 {
  /** 0-3: contact, passing, contact, passing. */
  walk?: number;
  blink?: boolean;
}

/** Sprite size in pixels for a look at detail `u`. */
export function size16(l: Look16, u: number): { w: number; h: number } {
  return { w: Math.round(16 * u), h: Math.round(layout(l).H * u) };
}

export function paintHero(l: Look16, u: number, dir: Dir16, f: Frame16 = {}): PixelBuffer {
  if (dir === 'left') return paintHero(l, u, 'right', f).flipX();
  const { w, h } = size16(l, u);
  const p = new Paint(w, h);
  if (dir === 'right') side(p, l, u, f);
  else frontBack(p, l, u, f, dir === 'up');
  return p.toBuffer();
}

// ------------------------------------------------------------------ front and back

function frontBack(p: Paint, l: Look16, u: number, f: Frame16, back: boolean): void {
  const L = layout(l);
  const R = ramps(l);
  const S = (v: number) => v * u;
  const walk = f.walk ?? 0;
  const phase = [1, 0, -1, 0][walk % 4];
  const bob = walk % 2 === 1 ? -Math.max(1, Math.round(0.4 * u)) : 0;
  const cx = S(8);
  const Y = (v: number) => S(v) + bob;

  // hair that hangs behind the head and shoulders
  hairBehind(p, l, u, back, bob);

  // legs and feet
  const legX = [6.3, 9.7];
  legX.forEach((lx, i) => {
    const lift = (i === 0 ? phase > 0 : phase < 0) ? 0.8 : 0;
    const footY = S(L.foot - lift);
    if (l.top.kind !== 'robe') p.capsule(S(lx), Y(L.legTop), S(lx), footY - S(0.6), S(l.build === 'adult' ? 1.15 : 0.95), R.legs, { bias: i ? -0.05 : 0.05 });
    shoe(p, l, R, S(lx + (i ? 0.15 : -0.15)), footY, u, back ? 'back' : 'front');
  });

  // torso
  const tt = Y(L.torsoTop);
  const hem = l.top.kind === 'robe' ? S(L.hem) : Y(L.hem);
  p.poly(
    [
      [cx - S(L.shoulderW), tt],
      [cx + S(L.shoulderW), tt],
      [cx + S(L.hemW), hem],
      [cx - S(L.hemW), hem],
    ],
    R.top,
    { sep: true, box: [cx - S(L.hemW), tt, S(L.hemW * 2), hem - tt] },
  );
  // hem trim
  if (l.top.kind === 'dress') p.shape((_x, y) => y >= hem - S(0.85) && y < hem, [0, hem - S(1), p.w, S(1)], R.trim, { form: 'cylV', onlyOver: true, box: [cx - S(L.hemW), tt, S(L.hemW * 2), hem - tt] });
  if (l.top.kind === 'robe') {
    p.shape((_x, y) => y >= hem - S(0.8), [0, hem - S(1), p.w, S(1)], R.trim, { form: 'cylV', onlyOver: true, box: [cx - S(L.hemW), tt, S(L.hemW * 2), hem - tt] });
    if (l.mudcloth) mudcloth(p, l.mudcloth, cx, tt + S(2.4), hem - S(1.0), u);
    if (l.clavi && !back) clavi(p, l.clavi, cx, tt, hem, u, [-1, 1]);
  }
  if (l.top.kind === 'jumpsuit') {
    // legs of the jumpsuit and its orange panels
    p.ellipse(cx - S(L.shoulderW - 0.3), tt + S(0.7), S(1.7), S(1.2), R.trim, { onlyOver: true });
    p.ellipse(cx + S(L.shoulderW - 0.3), tt + S(0.7), S(1.7), S(1.2), R.trim, { onlyOver: true });
    if (!back) {
      p.line(cx, tt + S(1.2), cx, Y(L.hem) - S(1), R.top, 1, { onlyOver: true });
    }
  }
  if (l.belt) {
    const by = Y(l.build === 'adult' ? 15.8 : 16.4);
    p.shape((_x, y) => y >= by && y < by + S(0.9), [0, by, p.w, S(1)], R.belt, { form: 'cylV', onlyOver: true, box: [cx - S(L.hemW), tt, S(L.hemW * 2), hem - tt] });
    if (!back) p.rect(cx - S(0.7), by, S(1.4), S(0.9), R.badge, { level: 3 });
  }

  // collar and chest details
  if (!back) {
    if (l.top.kind === 'dress' || l.top.kind === 'robe') {
      const v = l.top.kind === 'robe' ? 1.8 : 1.4;
      p.poly(
        [
          [cx - S(1.6), tt - S(0.1)],
          [cx + S(1.6), tt - S(0.1)],
          [cx, tt + S(v)],
        ],
        R.trim,
        { form: 'flat', level: 3 },
      );
      p.poly(
        [
          [cx - S(0.9), tt - S(0.1)],
          [cx + S(0.9), tt - S(0.1)],
          [cx, tt + S(v - 0.6)],
        ],
        R.skin,
        { form: 'flat', level: 1 },
      );
    } else {
      p.rect(cx - S(1.1), tt, S(2.2), S(0.7), R.trim, { level: 2 });
    }
    if (l.badge && u >= 1.5 && l.top.kind !== 'robe') {
      const bx = cx + S(1.7);
      const by = tt + S(2.0);
      star(p, bx, by, u, R.badge);
    }
  }

  // arms
  const sleeveR = S(l.top.kind === 'robe' ? 1.35 : 1.05);
  [-1, 1].forEach((side, i) => {
    const swing = (i === 0 ? -phase : phase) * 0.55;
    const out = l.build === 'kid' ? 1.0 : l.top.kind === 'robe' ? 1.0 : 0.6;
    const sx = cx + side * S(L.shoulderW + 0.5);
    const sy = tt + S(0.9);
    const ex = cx + side * S(L.shoulderW + 0.75 + out);
    const ey = tt + S(l.build === 'adult' ? 3.6 : 2.9) + S(swing * 0.5);
    const hx = cx + side * S(L.shoulderW + 1.0 + out);
    const hy = tt + S(l.build === 'adult' ? 6.6 : 5.0) + S(swing);
    p.capsule(sx, sy, ex, ey, sleeveR, R.top, { sep: 2, bias: side > 0 ? -0.15 : 0.05 });
    if (l.top.kind === 'robe') p.capsule(ex, ey, hx, hy - S(0.9), sleeveR, R.top, { bias: side > 0 ? -0.15 : 0.05 });
    else p.capsule(ex, ey, hx, hy - S(0.6), S(0.82), R.skin, { sep: 2, bias: side > 0 ? -0.1 : 0.1 });
    p.ellipse(hx, hy, S(0.95), S(1.0), R.skin, { bias: side > 0 ? -0.05 : 0.15, sep: true });
  });

  // neck and head
  p.rect(cx - S(1.0), Y(L.headCy + L.headRy - 0.9), S(2.0), tt - Y(L.headCy + L.headRy - 0.9) + S(0.3), R.skin, { level: 1 });
  const hcx = cx;
  const hcy = Y(L.headCy);
  // ears
  [-1, 1].forEach((side) => p.ellipse(hcx + side * S(L.headRx + 0.1), hcy + S(0.6), S(0.85), S(1.2), R.skin, { bias: side > 0 ? -0.25 : 0.1 }));
  p.ellipse(hcx, hcy, S(L.headRx), S(L.headRy), R.skin, { sep: true, bias: 0.3, soft: true });
  hairFront(p, l, u, back, hcx, hcy, L);
  if (!back) face(p, l, u, hcx, hcy, L, f.blink ?? false);
  if (l.headset) headset(p, l, u, hcx, hcy, L, back);
  if (l.beads && !back) beads(p, l.beads, cx, tt, u);
}

function shoe(p: Paint, l: Look16, R: Ramps, x: number, y: number, u: number, view: 'front' | 'back' | 'side'): void {
  const S = (v: number) => v * u;
  if (l.top.kind === 'robe') {
    // sandals: bare feet with a strap
    p.ellipse(x, y - S(0.3), S(view === 'side' ? 1.6 : 1.35), S(0.8), R.skin, { bias: 0 });
    p.shape((_fx, fy) => fy > y + S(0.2), [x - S(2), y - S(1), S(4), S(2)], R.shoes, { form: 'flat', level: 1, onlyOver: true });
    if (u >= 1.5) p.line(x - S(0.8), y - S(0.4), x + S(0.8), y - S(0.4), R.shoes, 2, { onlyOver: true });
    return;
  }
  const rx = view === 'side' ? S(1.7) : S(1.3);
  const sx = view === 'side' ? x + S(0.45) : x;
  p.ellipse(sx, y - S(0.15), rx, S(0.95), R.shoes, { sep: true });
  if (u >= 1.5) p.shape((_fx, fy) => fy >= y + S(0.35), [sx - rx, y - S(1), rx * 2, S(2)], R.sole, { form: 'flat', level: 3, onlyOver: true });
  if (u >= 2 && view !== 'back') p.dot(sx + (view === 'side' ? S(0.8) : 0), y - S(0.6), R.shoes, 4);
}

function star(p: Paint, x: number, y: number, u: number, r: Ramp): void {
  if (u >= 2) {
    p.dot(x, y - 1, r, 4);
    p.dot(x - 1, y, r, 3);
    p.dot(x, y, r, 4);
    p.dot(x + 1, y, r, 2);
    p.dot(x, y + 1, r, 2);
  } else {
    p.dot(x, y, r, 4);
    p.dot(x + 1, y, r, 2);
  }
}

function mudcloth(p: Paint, ink: string, cx: number, y0: number, y1: number, u: number): void {
  // Rows of bogolan-style marks: zigzags, dots and crosses on the cream cloth.
  const r = ramp(ink);
  const step = Math.max(3, Math.round(2.2 * u));
  let row = 0;
  for (let y = Math.round(y0); y < y1 - 1; y += step, row++) {
    for (let x = Math.round(cx - 6 * u); x < cx + 6 * u; x++) {
      const k = row % 3;
      let on = false;
      if (k === 0) on = (x + row) % 4 === 0;
      if (k === 1) on = true;
      if (k === 2) on = (x + row * 2) % 3 === 0;
      if (!on) continue;
      if (k === 1) {
        if (p.filled(x, y) && p.rampAt(x, y)?.[2] !== ink) p.dot(x, y + ((x >> 1) % 2), r, 2);
      } else if (p.filled(x, y)) p.dot(x, y, r, 1);
    }
  }
}

function clavi(p: Paint, color: string, cx: number, tt: number, hem: number, u: number, sides: number[]): void {
  const r = ramp(color);
  for (const k of sides)
    for (let w = 0; w < Math.max(1, Math.round(u * 0.8)); w++) p.line(cx + k * 1.6 * u + w, tt + 0.4 * u, cx + k * 2.1 * u + w, hem - u, r, 2, { onlyOver: true });
}

function beads(p: Paint, colors: [string, string], cx: number, tt: number, u: number): void {
  const n = Math.round(4 * u);
  const ra = ramp(colors[0]);
  const rb = ramp(colors[1]);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = cx - 1.9 * u + t * 3.8 * u;
    const y = tt + 0.3 * u + Math.sin(t * Math.PI) * 1.6 * u;
    p.dot(x, y, i % 2 ? rb : ra, 3);
  }
}

function headset(p: Paint, l: Look16, u: number, cx: number, cy: number, L: Layout, back: boolean): void {
  const r = ramp(l.headset!);
  const S = (v: number) => v * u;
  // the band over the head and the ear cup
  for (let a = Math.PI * 1.05; a <= Math.PI * 1.95; a += 0.04) p.dot(cx + Math.cos(a) * S(L.headRx + 0.5), cy - S(0.6) + Math.sin(a) * S(L.headRy + 0.3), r, 2);
  p.ellipse(cx - S(L.headRx + 0.3), cy + S(0.4), S(0.9), S(1.25), r, {});
  if (!back) {
    p.line(cx - S(L.headRx + 0.2), cy + S(1.4), cx - S(2.0), cy + S(3.2), r, 1);
    p.dot(cx - S(1.9), cy + S(3.2), ramp('#4fd6ff'), 3);
  }
}

// ------------------------------------------------------------------ hair

function hairBehind(p: Paint, l: Look16, u: number, back: boolean, bob: number): void {
  const L = layout(l);
  const R = ramps(l);
  const S = (v: number) => v * u;
  const cx = S(8);
  const cy = S(L.headCy) + bob;
  if (l.hair.style === 'puffs' && !back) {
    [-1, 1].forEach((side) => {
      const id = p.ellipse(cx + side * S(4.4), cy - S(4.3), S(2.75), S(2.65), R.hair, { bias: side > 0 ? -0.1 : 0.05 });
      curls(p, id, u);
    });
  }
  if (l.hair.style === 'locs') {
    const n = back ? 6 : 3;
    for (let i = 0; i < n; i++) {
      const sideX = back ? -3.3 + i * 1.3 : 0;
      [-1, 1].forEach((side) => {
        if (back && side > 0) return;
        const x = back ? cx + S(sideX) : cx + side * S(L.headRx - 0.6 + i * 0.55);
        p.capsule(x, cy - S(1), x + (back ? 0 : side * S(0.3)), cy + S(L.headRy + 2.6 - (back ? 0 : i * 0.4)), S(0.62), R.hair, { bias: -0.1 - i * 0.05 });
      });
    }
  }
}

/** Coily hair texture: a pattern of small round coils, each lit on its top-left. */
function curls(p: Paint, partId: number, u: number): void {
  if (u < 1.5) return;
  const c = u >= 2 ? 3 : 2;
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) {
      const i = y * p.w + x;
      if (p.part[i] !== partId) continue;
      const row = Math.floor(y / c);
      const gx = x + (row % 2 ? Math.floor(c / 2) : 0);
      const lx = gx % c;
      const ly = y % c;
      const lv = p.lv[i];
      if (lx === 0 && ly === 0 && lv >= 1) p.lv[i] = Math.min(4, lv + 1);
      else if (lx === c - 1 && ly === c - 1 && lv >= 1) p.lv[i] = lv - 1;
    }
}

function hairFront(p: Paint, l: Look16, u: number, back: boolean, cx: number, cy: number, L: Layout): void {
  const R = ramps(l);
  const S = (v: number) => v * u;
  const top = cy - S(L.headRy);
  const box: [number, number, number, number] = [cx - S(L.headRx), top, S(L.headRx * 2), S(L.headRy * 2)];
  const inHead = (x: number, y: number, grow = 0.45) => ((x - cx) / S(L.headRx + grow)) ** 2 + ((y - cy) / S(L.headRy + grow)) ** 2 <= 1;

  if (l.hair.style === 'wrap') {
    // A tall head wrap with folds and a gold edge.
    const wr = R.hair;
    p.ellipse(cx + S(0.3), top - S(0.2), S(L.headRx + 0.6), S(2.6), wr, { sep: true });
    p.ellipse(cx - S(0.4), top + S(0.9), S(L.headRx + 0.8), S(2.1), wr, { bias: 0.05 });
    p.shape((x, y) => inHead(x, y, 0.6) && y < top + S(2.9), [cx - S(L.headRx + 1), top - S(1), S(L.headRx * 2 + 2), S(4)], wr, { box });
    const ty = top + S(2.6);
    p.shape((x, y) => inHead(x, y, 0.7) && y >= ty && y < ty + S(0.75), [cx - S(L.headRx + 1), ty, S(L.headRx * 2 + 2), S(1)], R.tie, { form: 'cylV', box });
    if (u >= 1.5) {
      // fold lines
      for (let k = 0; k < 3; k++) p.line(cx - S(2.8 - k * 1.6), top - S(1.5 - k * 0.4), cx - S(0.8 - k * 1.6), top + S(1.6), wr, 1, { onlyOver: true });
    }
    return;
  }

  const hairline = (x: number) => {
    const t = (x - cx) / S(L.headRx);
    return top + S(back ? 8.4 : l.hair.style === 'short' ? 2.6 : 2.9) + S(1.6) * t * t;
  };
  const id = p.shape((x, y) => inHead(x, y) && y < hairline(x), [cx - S(L.headRx + 0.5), top - S(0.5), S(L.headRx * 2 + 1), S(L.headRy * 2 + 1)], R.hair, {
    box,
    bias: 0.08,
    sep: !back,
  });
  if (l.hair.style === 'puffs') {
    curls(p, id, u);
    if (u >= 1.5) {
      // a middle part and a shine on the lit side
      if (back) p.line(cx, top + S(0.4), cx, top + S(7.4), R.hair, 0, { onlyOver: true });
      else p.line(cx, top + S(0.2), cx, top + S(1.6), R.hair, 1, { onlyOver: true });
    }
    if (back) {
      [-1, 1].forEach((side) => {
        const pid = p.ellipse(cx + side * S(4.4), cy - S(4.3), S(2.75), S(2.65), R.hair, { bias: side > 0 ? -0.1 : 0.05, sep: true });
        curls(p, pid, u);
      });
    }
    // hair ties where each puff meets the head
    [-1, 1].forEach((side) => {
      const px = cx + side * S(4.4);
      const py = cy - S(4.3);
      const dx = cx - px;
      const dy = cy - py;
      const d = Math.hypot(dx, dy);
      const tx = px + (dx / d) * S(2.35);
      const ty = py + (dy / d) * S(2.35);
      const nx = -dy / d;
      const ny = dx / d;
      p.capsule(tx - nx * S(0.95), ty - ny * S(0.95), tx + nx * S(0.95), ty + ny * S(0.95), S(0.42), R.tie, { form: 'flat', level: side > 0 ? 2 : 3 });
    });
  }
  if (l.hair.style === 'locs' && !back) {
    // tied up at the back with a band; a few locs fall over the forehead
    p.ellipse(cx + S(0.2), top - S(0.3), S(2.4), S(1.5), R.hair, { sep: true, bias: 0.05 });
    p.rect(cx - S(1.2), top + S(0.7), S(2.6), S(0.6), R.tie, { level: 2 });
    for (let i = -2; i <= 2; i++) if (u >= 1.5) p.line(cx + S(i * 1.4), top + S(1.2), cx + S(i * 1.4 + 0.3), hairline(cx + S(i * 1.4)) - S(0.4), R.hair, 1, { onlyOver: true });
  }
  if (l.hair.style === 'locs' && back) {
    p.ellipse(cx, top - S(0.3), S(2.4), S(1.5), R.hair, { sep: true, bias: 0.05 });
    p.rect(cx - S(1.3), top + S(0.7), S(2.6), S(0.6), R.tie, { level: 2 });
  }
}

// ------------------------------------------------------------------ face

function face(p: Paint, l: Look16, u: number, cx: number, cy: number, _L: Layout, blink: boolean): void {
  const R = ramps(l);
  const kid = l.build === 'kid';
  const eyeY = Math.round(cy + u * (kid ? 0.9 : 0.6));
  const gap = u * (kid ? 2.1 : 1.8);
  const blush = mixHex(l.skin, '#ff6f7a', 0.32);
  const lips = mixHex(R.skin[0], '#b8505a', 0.45);
  if (u >= 2) {
    // tall 2x4 eyes with a shine, a lash and a brown glint
    [-1, 1].forEach((side) => {
      const ex = Math.round(cx + side * gap - 1);
      if (blink) {
        p.fillPix(ex, eyeY + 2, 2, 1, EYE);
        p.pix(side < 0 ? ex - 1 : ex + 2, eyeY + 1, EYE);
      } else {
        p.fillPix(ex, eyeY, 2, 4, EYE);
        p.pix(side < 0 ? ex : ex + 1, eyeY + 1, EYE_LIGHT);
        p.pix(side < 0 ? ex + 1 : ex, eyeY + 3, IRIS);
        p.pix(side < 0 ? ex - 1 : ex + 2, eyeY, EYE);
      }
      // brows
      const brow = ramps(l).hair;
      p.dot(ex, eyeY - 2, brow, 1);
      p.dot(ex + 1, eyeY - 2, brow, 1);
      p.dot(side < 0 ? ex - 1 : ex + 2, eyeY - 2, brow, 1);
      // cheeks
      p.pix(ex + (side < 0 ? -1 : 1), eyeY + 5, blush);
      p.pix(ex + (side < 0 ? 0 : 2), eyeY + 5, blush);
    });
    const mx = Math.round(cx);
    const my = eyeY + 6;
    p.dot(mx, eyeY + 4, R.skin, 1); // nose
    p.pix(mx - 2, my, lips);
    p.pix(mx + 1, my, lips);
    p.pix(mx - 1, my + 1, lips);
    p.pix(mx, my + 1, lips);
    if (!kid) {
      p.dot(mx - 1, my + 2, R.skin, 1);
      p.dot(mx, my + 2, R.skin, 1);
    }
  } else {
    // 2x3 eyes with a highlight
    [-1, 1].forEach((side) => {
      const ex = Math.round(cx + side * gap - 1);
      if (blink) p.fillPix(ex, eyeY + 2, 2, 1, EYE);
      else {
        p.fillPix(ex, eyeY, 2, 3, EYE);
        p.pix(ex, eyeY, EYE_LIGHT);
        p.pix(ex + 1, eyeY + 2, IRIS);
      }
      p.dot(ex, eyeY - 2, R.hair, 1);
      p.dot(ex + 1, eyeY - 2, R.hair, 1);
      p.pix(ex + (side < 0 ? 0 : 1), eyeY + 4, blush);
    });
    const mx = Math.round(cx);
    const my = eyeY + 4;
    p.dot(mx, eyeY + 3, R.skin, 1);
    p.dot(mx - 2, my, R.skin, 1);
    p.dot(mx + 1, my, R.skin, 1);
    p.pix(mx - 1, my + 1, lips);
    p.pix(mx, my + 1, lips);
  }
}

// ------------------------------------------------------------------ side view

function side(p: Paint, l: Look16, u: number, f: Frame16): void {
  const L = layout(l);
  const R = ramps(l);
  const S = (v: number) => v * u;
  const walk = f.walk ?? 0;
  const stride = [1, 0, -1, 0][walk % 4];
  const bob = walk % 2 === 1 ? -Math.max(1, Math.round(0.4 * u)) : 0;
  const Y = (v: number) => S(v) + bob;
  const cx = S(8);
  const tt = Y(L.torsoTop);
  const hem = l.top.kind === 'robe' ? S(L.hem) : Y(L.hem);
  const hipY = Y(L.legTop);

  // the far arm (behind the body)
  const armSwing = -stride;
  const far = (k: number) => cx - S(0.3) + S(k);
  p.capsule(far(0), tt + S(1), far(-armSwing * 1.2), tt + S(l.build === 'adult' ? 5.8 : 4.6), S(0.85), R.top, { bias: -0.45 });
  p.ellipse(far(-armSwing * 1.3), tt + S(l.build === 'adult' ? 6.4 : 5.1), S(0.85), S(0.9), R.skin, { bias: -0.4 });

  // hair behind
  if (l.hair.style === 'puffs') {
    const id = p.ellipse(cx - S(1.6), Y(L.headCy) - S(4.4), S(2.6), S(2.5), R.hair, { bias: -0.35 });
    curls(p, id, u);
  }
  if (l.hair.style === 'locs')
    for (let i = 0; i < 4; i++) p.capsule(cx - S(2.6 - i * 0.7), Y(L.headCy) - S(1), cx - S(3.0 - i * 0.6), Y(L.headCy) + S(L.headRy + 2.2 - i * 0.5), S(0.6), R.hair, { bias: -0.2 });

  // legs: a stride on contact frames, together on passing frames
  const legs: Array<[number, number, boolean]> =
    stride === 0
      ? [
          [cx, 0.8, false],
          [cx + S(0.2), 0, true],
        ]
      : [
          [cx - S(1.7 * stride), 0, false],
          [cx + S(1.7 * stride), 0, true],
        ];
  legs.forEach(([fx, lift, near]) => {
    const footY = S(L.foot - lift);
    if (l.top.kind !== 'robe') p.capsule(cx, hipY, fx, footY - S(0.6), S(l.build === 'adult' ? 1.15 : 0.95), R.legs, { bias: near ? 0.05 : -0.35 });
    shoe(p, l, R, fx, footY, u, 'side');
  });

  // torso
  p.poly(
    [
      [cx - S(L.shoulderW - 0.6), tt],
      [cx + S(L.shoulderW - 0.6), tt],
      [cx + S(L.hemW - 0.9), hem],
      [cx - S(L.hemW - 0.9), hem],
    ],
    R.top,
    { sep: true, box: [cx - S(L.hemW), tt, S(L.hemW * 2), hem - tt] },
  );
  const tbox: [number, number, number, number] = [cx - S(L.hemW), tt, S(L.hemW * 2), hem - tt];
  if (l.top.kind === 'dress' || l.top.kind === 'robe') p.shape((_x, y) => y >= hem - S(0.85) && y < hem, [0, hem - S(1), p.w, S(1)], R.trim, { form: 'cylV', onlyOver: true, box: tbox });
  if (l.mudcloth) mudcloth(p, l.mudcloth, cx, tt + S(2.4), hem - S(1), u);
  if (l.clavi) clavi(p, l.clavi, cx, tt, hem, u, [1]);
  if (l.belt) {
    const by = Y(l.build === 'adult' ? 15.8 : 16.4);
    p.shape((_x, y) => y >= by && y < by + S(0.9), [0, by, p.w, S(1)], R.belt, { form: 'cylV', onlyOver: true, box: tbox });
  }
  if (l.top.kind === 'jumpsuit') p.ellipse(cx, tt + S(0.8), S(1.8), S(1.2), R.trim, { onlyOver: true });

  // neck, head, face
  const hcx = cx + S(0.4);
  const hcy = Y(L.headCy);
  p.rect(cx - S(0.9), hcy + S(L.headRy - 1), S(1.8), tt - hcy - S(L.headRy - 1) + S(0.3), R.skin, { level: 1 });
  p.ellipse(hcx, hcy, S(L.headRx - 0.3), S(L.headRy), R.skin, { sep: true, bias: 0.3, soft: true });
  const top = hcy - S(L.headRy);
  const hrx = S(L.headRx - 0.3);
  const inHead = (x: number, y: number) => ((x - hcx) / (hrx + S(0.45))) ** 2 + ((y - hcy) / S(L.headRy + 0.45)) ** 2 <= 1;
  const box: [number, number, number, number] = [hcx - hrx, top, hrx * 2, S(L.headRy * 2)];
  if (l.hair.style === 'wrap') {
    p.ellipse(hcx - S(0.3), top - S(0.2), S(L.headRx + 0.4), S(2.6), R.hair, { sep: true });
    p.shape((x, y) => inHead(x, y) && y < top + S(2.9), [hcx - hrx - S(1), top - S(1), hrx * 2 + S(2), S(4)], R.hair, { box });
    const ty = top + S(2.6);
    p.shape((x, y) => inHead(x, y) && y >= ty && y < ty + S(0.75), [hcx - hrx - S(1), ty, hrx * 2 + S(2), S(1)], R.tie, { form: 'cylV', box });
  } else {
    // hair covers the back and top of the head; the face is to the right
    const faceArea = (x: number, y: number) => y > top + S(2.7) + Math.max(0, hcx + S(0.6) - x) * 0.9 && x > hcx - S(1.1);
    const id = p.shape((x, y) => inHead(x, y) && !faceArea(x, y) && y < hcy + S(L.headRy - 1.4), [hcx - hrx - S(0.5), top - S(0.5), hrx * 2 + S(1), S(L.headRy * 2)], R.hair, { box, bias: 0.06 });
    if (l.hair.style === 'puffs') {
      curls(p, id, u);
      const pid = p.ellipse(cx + S(0.2), hcy - S(4.6), S(2.6), S(2.5), R.hair, { sep: true });
      curls(p, pid, u);
      p.capsule(cx + S(0.2), hcy - S(2.6), cx + S(1.2), hcy - S(2.4), S(0.45), R.tie, { form: 'flat', level: 3 });
    }
    if (l.hair.style === 'locs') {
      p.ellipse(hcx - S(1.8), top + S(0.2), S(2.2), S(1.5), R.hair, { sep: true });
      p.rect(hcx - S(2.6), top + S(1.0), S(1.8), S(0.6), R.tie, { level: 2 });
    }
    // ear
    p.ellipse(hcx - S(0.9), hcy + S(0.7), S(0.8), S(1.15), R.skin, { bias: 0.05, sep: true });
  }
  if (l.headset) {
    const r = ramp(l.headset);
    p.ellipse(hcx - S(0.9), hcy + S(0.5), S(0.95), S(1.3), r, {});
    p.line(hcx - S(0.7), hcy + S(1.6), hcx + S(2.6), hcy + S(3.0), r, 1);
    p.dot(hcx + S(2.6), hcy + S(3.0), ramp('#4fd6ff'), 3);
  }

  // face: one eye, a nose and a small smile
  const ex = Math.round(hcx + S(L.headRx - 2.1));
  const ey = Math.round(hcy + u * (l.build === 'kid' ? 0.9 : 0.6));
  const blink = f.blink ?? false;
  if (u >= 2) {
    if (blink) p.fillPix(ex, ey + 2, 2, 1, EYE);
    else {
      p.fillPix(ex, ey, 2, 4, EYE);
      p.pix(ex, ey + 1, EYE_LIGHT);
      p.pix(ex + 1, ey + 2, IRIS);
      p.pix(ex + 1, ey + 3, IRIS);
      p.pix(ex + 2, ey, EYE);
    }
    p.dot(ex, ey - 2, R.hair, 1);
    p.dot(ex + 1, ey - 2, R.hair, 1);
    p.dot(ex + 2, ey - 2, R.hair, 1);
    p.pix(ex - 1, ey + 5, mixHex(l.skin, '#ff6f7a', 0.32));
  } else {
    if (blink) p.fillPix(ex, ey + 2, 2, 1, EYE);
    else {
      p.fillPix(ex, ey, 1, 3, EYE);
      p.pix(ex + 1, ey + 1, EYE);
      p.pix(ex + 1, ey + 2, EYE);
      p.pix(ex, ey, EYE_LIGHT);
    }
    p.dot(ex, ey - 2, R.hair, 1);
    p.dot(ex + 1, ey - 2, R.hair, 1);
  }
  // nose bump just past the edge of the face
  const nx = Math.round(hcx + hrx);
  const ny = ey + Math.round(u * 1.6);
  p.dot(nx, ny, R.skin, 2);
  if (u >= 2) p.dot(nx, ny + 1, R.skin, 1);
  const lips = mixHex(R.skin[0], '#b8505a', 0.45);
  p.pix(nx - 2, ny + Math.round(u * 1.2), lips);
  p.pix(nx - 1, ny + Math.round(u * 1.2) - 1, lips);

  if (l.beads) {
    const ra = ramp(l.beads[0]);
    for (let i = 0; i < 3 * u; i++) p.dot(cx + S(0.5) + i * 0.5, tt + S(0.6) + i * 0.6, i % 2 ? ramp(l.beads[1]) : ra, 3);
  }

  // the near arm, swinging opposite the near leg
  const swing = stride;
  const ax = cx + S(0.1);
  const handX = ax + S(swing * 1.5);
  const handY = tt + S(l.build === 'adult' ? 6.4 : 5.0);
  p.capsule(ax, tt + S(0.9), ax + S(swing * 0.7), tt + S(l.build === 'adult' ? 3.6 : 2.9), S(l.top.kind === 'robe' ? 1.3 : 1.0), R.top, { sep: 2 });
  if (l.top.kind === 'robe') p.capsule(ax + S(swing * 0.7), tt + S(3.6), handX, handY - S(0.9), S(1.3), R.top, {});
  else p.capsule(ax + S(swing * 0.7), tt + S(2.9), handX, handY - S(0.6), S(0.8), R.skin, { sep: 2 });
  p.ellipse(handX, handY, S(0.95), S(1.0), R.skin, { sep: true, bias: 0.1 });
}

// ------------------------------------------------------------------ level (a)

/**
 * Level (a): today's 16x24 sprite with richer color only. Each color gets a
 * 5-shade ramp (a bit more saturated); edges facing the light get the next
 * lighter shade, edges facing away the next darker one; and the outer
 * outline takes a dark shade of the color it wraps instead of one brown.
 */
export function richen(src: PixelBuffer): PixelBuffer {
  const out = new PixelBuffer(src.w, src.h);
  const OUT = P.outline;
  const empty = (x: number, y: number) => {
    const c = src.get(x, y);
    return !c || (c === OUT && isBorder(x, y));
  };
  const isBorder = (x: number, y: number) => !src.get(x - 1, y) || !src.get(x + 1, y) || !src.get(x, y - 1) || !src.get(x, y + 1);
  const richRamp = new Map<string, Ramp>();
  const R = (c: string) => {
    let r = richRamp.get(c);
    if (!r) {
      const [h, s, l] = toHsl(c);
      r = ramp(fromHsl(h, Math.min(1, s * 1.18 + 0.03), l), { spread: 0.8 });
      richRamp.set(c, r);
    }
    return r;
  };
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) {
      const c = src.get(x, y);
      if (!c) continue;
      if (c === OUT) {
        if (!isBorder(x, y)) {
          out.set(x, y, c);
          continue;
        }
        // a colored outline: the darkest shade of the color it wraps
        const n = [
          [x, y + 1],
          [x + 1, y],
          [x, y - 1],
          [x - 1, y],
        ].find(([nx, ny]) => {
          const nc = src.get(nx, ny);
          return nc && nc !== OUT;
        });
        out.set(x, y, n ? selout(R(src.get(n[0], n[1])!)) : '#24161c');
        continue;
      }
      if (!c.startsWith('#') || c.length !== 7) {
        out.set(x, y, c);
        continue;
      }
      const r = R(c);
      let level = 2;
      const lit = empty(x - 1, y) || empty(x, y - 1) || src.get(x, y - 1) === OUT || src.get(x - 1, y) === OUT;
      const dark = empty(x + 1, y) || empty(x, y + 1) || src.get(x + 1, y) === OUT || src.get(x, y + 1) === OUT;
      if (lit && !dark) level = 3;
      if (dark && !lit) level = 1;
      out.set(x, y, r[level]);
    }
  return out;
}

// ------------------------------------------------------------------ portraits

export type Mood = 'smile' | 'neutral' | 'curious' | 'thinking';

/** A 72x72 talk-box portrait in the new style, with four moods. */
export function paintPortrait16(l: Look16, mood: Mood): PixelBuffer {
  const p = new Paint(72, 72);
  const R = ramps(l);
  const cx = 36;
  const kid = l.build === 'kid';
  const cy = kid ? 38 : 35;
  const rx = kid ? 21 : 18;
  const ry = kid ? 22 : 21;

  // hair behind
  if (l.hair.style === 'puffs')
    [-1, 1].forEach((s) => {
      const id = p.ellipse(cx + s * 22.5, 14, 11.5, 11, R.hair, { bias: s > 0 ? -0.1 : 0.05 });
      curls(p, id, 2);
    });
  if (l.hair.style === 'locs')
    for (let i = 0; i < 5; i++)
      [-1, 1].forEach((s) => p.capsule(cx + s * (rx - 4 + i * 2), cy - 6, cx + s * (rx - 3 + i * 2.2), cy + 24 - i * 2, 2.4, R.hair, { bias: -0.1 - i * 0.06 }));

  // shoulders and clothes
  p.ellipse(cx, 76, 32, 18, R.top, { form: 'sphere', box: [4, 58, 64, 30] });
  if (l.top.kind === 'jumpsuit') {
    p.ellipse(cx - 22, 64, 9, 6, R.trim, { onlyOver: true });
    p.ellipse(cx + 22, 64, 9, 6, R.trim, { onlyOver: true });
    star(p, cx + 13, 66, 2, R.badge);
  }
  if (l.mudcloth) mudcloth(p, l.mudcloth, cx, 62, 72, 2.4);
  if (l.clavi) clavi(p, l.clavi, cx, 60, 72, 5, [-1, 1]);
  // neck and collar
  p.rect(cx - 6, cy + ry - 8, 12, 14, R.skin, { level: 1 });
  if (l.top.kind === 'jumpsuit') p.rect(cx - 9, 58, 18, 3, R.trim, { level: 2 });
  else {
    p.poly(
      [
        [cx - 10, 58],
        [cx + 10, 58],
        [cx, 70],
      ],
      R.trim,
      { form: 'flat', level: 3 },
    );
    p.poly(
      [
        [cx - 6, 58],
        [cx + 6, 58],
        [cx, 66],
      ],
      R.skin,
      { form: 'flat', level: 1 },
    );
  }
  if (l.beads)
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      p.ellipse(cx - 11 + t * 22, 59 + Math.sin(t * Math.PI) * 7, 1.3, 1.3, ramp(i % 2 ? l.beads[1] : l.beads[0]), {});
    }

  // ears, head
  [-1, 1].forEach((s) => p.ellipse(cx + s * (rx + 0.5), cy + 3, 3.2, 4.6, R.skin, { bias: s > 0 ? -0.25 : 0.1 }));
  p.ellipse(cx, cy, rx, ry, R.skin, { sep: true, bias: 0.3, soft: true, dither: true });
  const top = cy - ry;
  const box: [number, number, number, number] = [cx - rx, top, rx * 2, ry * 2];
  const inHead = (x: number, y: number) => ((x - cx) / (rx + 1.6)) ** 2 + ((y - cy) / (ry + 1.6)) ** 2 <= 1;
  if (l.hair.style === 'wrap') {
    p.ellipse(cx + 1, top - 2, rx + 2, 11, R.hair, { sep: true });
    p.ellipse(cx - 2, top + 3, rx + 3, 8, R.hair, { bias: 0.05 });
    p.shape((x, y) => inHead(x, y) && y < top + 11, [cx - rx - 4, top - 4, rx * 2 + 8, 16], R.hair, { box });
    p.shape((x, y) => inHead(x, y) && y >= top + 10 && y < top + 13, [cx - rx - 4, top + 9, rx * 2 + 8, 5], R.tie, { form: 'cylV', box });
    for (let k = 0; k < 4; k++) p.line(cx - 14 + k * 7, top - 9 + k, cx - 6 + k * 7, top + 8, R.hair, 1, { onlyOver: true });
  } else {
    const hl = (x: number) => top + (l.hair.style === 'short' ? 9 : 11) + 6 * ((x - cx) / rx) ** 2;
    const id = p.shape((x, y) => inHead(x, y) && y < hl(x), [cx - rx - 2, top - 2, rx * 2 + 4, ry * 2], R.hair, { box, bias: 0.08, sep: true });
    if (l.hair.style === 'puffs') {
      curls(p, id, 2);
      p.line(cx, top + 1, cx, top + 6, R.hair, 1, { onlyOver: true });
      [-1, 1].forEach((s) => p.capsule(cx + s * 12, top + 4, cx + s * 15, top + 1, 1.6, R.tie, { form: 'flat', level: s > 0 ? 2 : 3 }));
    }
    if (l.hair.style === 'locs') {
      p.ellipse(cx + 1, top - 2, 9, 6, R.hair, { sep: true });
      p.rect(cx - 5, top + 2, 11, 2, R.tie, { level: 2 });
      for (let i = -3; i <= 3; i++) p.line(cx + i * 5, top + 5, cx + i * 5 + 1, hl(cx + i * 5) - 1, R.hair, 1, { onlyOver: true });
    }
  }
  if (l.headset) {
    const r = ramp(l.headset);
    for (let a = Math.PI * 1.05; a <= Math.PI * 1.95; a += 0.015) {
      p.dot(cx + Math.cos(a) * (rx + 2), cy - 3 + Math.sin(a) * (ry + 1.5), r, 2);
      p.dot(cx + Math.cos(a) * (rx + 2), cy - 2 + Math.sin(a) * (ry + 1.5), r, 1);
    }
    p.ellipse(cx - rx - 1, cy + 2, 3.6, 5, r, {});
    for (let t = 0; t <= 1; t += 0.02) p.dot(cx - rx + t * 12, cy + 7 + t * 8, r, 1);
    p.ellipse(cx - rx + 12, cy + 15, 1.6, 1.6, ramp('#4fd6ff'), { form: 'flat', level: 3 });
  }

  // the face, drawn pixel by pixel from small maps
  const eyeY = cy + 1;
  const blush = mixHex(l.skin, '#ff6f7a', 0.34);
  const lipDark = mixHex(EYE, '#8a2434', 0.45);
  const gap = kid ? 9 : 8;
  const stamp = (rows: string[], x0: number, y0: number, colors: Record<string, string>, flip = false) =>
    rows.forEach((row, j) =>
      [...row].forEach((ch, i) => {
        const c = colors[ch];
        if (c) p.pix(flip ? x0 + row.length - 1 - i : x0 + i, y0 + j, c);
      }),
    );
  const eyeColors = { X: EYE, I: '#6e4536', G: '#9a6a52', W: EYE_LIGHT };
  [-1, 1].forEach((s) => {
    const ex = cx + s * gap - 3;
    const ey = eyeY - (mood === 'curious' ? 1 : 0);
    const flip = s > 0;
    if (mood === 'smile') {
      stamp(['  XX  ', ' XXXX ', 'XX  XX', 'X    X'], ex, ey + 2, eyeColors);
    } else {
      const look = mood === 'thinking' ? -1 : 0;
      const open = mood === 'curious' ? ['  XXXX ', ' XXXXXX', ' XWWXXX', ' XWWXXX', ' XXXXXX', ' XIIIIX', ' XIGGIX', '  XIIX '] : ['  XXXX ', ' XXXXXX', ' XWWXXX', ' XWWXXX', ' XIIIIX', ' XIGGIX', '  XIIX '];
      // the eye itself is not mirrored, so the shine stays on the lit (left) side
      stamp(open, ex - 1 + look, ey, eyeColors);
      p.pix(ex + 4 + look, ey + open.length - 3, EYE_LIGHT);
      // a lash flick at the outer corner
      stamp(['XX', 'X '], flip ? ex + 5 : ex - 2, ey - 1, eyeColors, flip);
    }
    // brows
    const by = ey - (mood === 'curious' ? 6 : 4);
    const browRows = mood === 'thinking' && s < 0 ? [' XXX  ', 'X   XX'] : mood === 'thinking' ? ['  XXX ', 'XX   X'] : [' XXXX ', 'X    X'];
    stamp(browRows, ex, by, { X: R.hair[1] }, flip);
    // cheeks
    p.fillPix(ex + (s < 0 ? -1 : 2), eyeY + 9, 4, 2, blush);
  });
  // nose: a soft shadow and a lit tip
  p.dot(cx + 1, eyeY + 7, R.skin, 1);
  p.dot(cx + 2, eyeY + 8, R.skin, 1);
  p.dot(cx - 1, eyeY + 8, R.skin, 1);
  p.dot(cx, eyeY + 7, R.skin, 3);
  // mouth
  const my = eyeY + 12;
  const mouthColors = { X: lipDark, W: EYE_LIGHT, R: '#c0506a', L: R.skin[3] };
  if (mood === 'smile') stamp(['X      X', ' XWWWWX ', '  XRRX  ', '   LL   '], cx - 4, my, mouthColors);
  else if (mood === 'curious') stamp([' XX ', 'XRRX', 'XRRX', ' XX '], cx - 2, my, mouthColors);
  else if (mood === 'thinking') stamp(['   XXX', 'XXX   '], cx - 2, my + 1, mouthColors);
  else stamp(['X    X', ' XXXX ', '  LL  '], cx - 3, my, mouthColors);
  return p.toBuffer();
}
