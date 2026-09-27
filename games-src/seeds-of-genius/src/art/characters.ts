import { PixelBuffer, mix } from './pixel';
import {
  P,
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_COLORS,
  type AccessoryId,
  type HairStyleId,
} from './palette';

/**
 * Paints characters (player and NPCs) from parts, facing four directions
 * with three walk frames each. Kids are 16x24 pixels; adults are 16x28.
 */

export type Dir = 'down' | 'left' | 'right' | 'up';
export const DIRS: Dir[] = ['down', 'left', 'right', 'up'];
export const WALK_FRAMES = 3;

interface Tone {
  base: string;
  shade: string;
}

export interface CharacterLook {
  build: 'kid' | 'adult';
  skin: Tone;
  hair: { style: HairStyleId | 'carver' | 'wrap' | 'bun'; base: string; shade: string; light: string };
  shirt: Tone;
  pants: string;
  shoes: string;
  accessory: AccessoryId;
  /** Color for hats, headbands and scarves. */
  accent: string;
  extras?: {
    mustache?: string;
    beard?: string;
    jacket?: Tone;
    tie?: string;
    lapelFlower?: string;
    apron?: string;
    lantern?: boolean;
  };
}

/** What the player picks on the customization screen (ids only, no names). */
export interface Appearance {
  skin: string;
  hairStyle: HairStyleId;
  hairColor: string;
  outfit: string;
  accessory: AccessoryId;
}

export const DEFAULT_APPEARANCE: Appearance = {
  skin: 'skin2',
  hairStyle: 'puffs',
  hairColor: 'black',
  outfit: 'teal',
  accessory: 'none',
};

export function lookFromAppearance(a: Appearance): CharacterLook {
  const skin = SKIN_TONES.find((s) => s.id === a.skin) ?? SKIN_TONES[1];
  const hair = HAIR_COLORS.find((h) => h.id === a.hairColor) ?? HAIR_COLORS[0];
  const outfit = OUTFIT_COLORS.find((o) => o.id === a.outfit) ?? OUTFIT_COLORS[4];
  const accent = outfit.id === 'yellow' ? '#2f9a94' : P.flowerYellow;
  return {
    build: 'kid',
    skin: { base: skin.base, shade: skin.shade },
    hair: { style: a.hairStyle, base: hair.base, shade: hair.shade, light: hair.light },
    shirt: { base: outfit.base, shade: outfit.shade },
    pants: '#3f4a6b',
    shoes: '#5a3a2a',
    accessory: a.accessory,
    accent,
  };
}

interface Layout {
  H: number;
  torsoTop: number;
  torsoBot: number;
  pantsTop: number;
  legTop: number;
  legBot: number;
  shoeY: number;
  sleeveRows: number;
  handRows: number;
}

function layoutFor(build: CharacterLook['build']): Layout {
  return build === 'adult'
    ? { H: 28, torsoTop: 13, torsoBot: 19, pantsTop: 20, legTop: 21, legBot: 25, shoeY: 26, sleeveRows: 5, handRows: 2 }
    : { H: 24, torsoTop: 13, torsoBot: 17, pantsTop: 18, legTop: 19, legBot: 21, shoeY: 22, sleeveRows: 3, handRows: 2 };
}

/** Paint one frame. */
export function paintCharacter(look: CharacterLook, dir: Dir, frame: number): PixelBuffer {
  if (dir === 'left') return paintCharacter(look, 'right', frame).flipX();
  const L = layoutFor(look.build);
  const b = new PixelBuffer(16, L.H);
  const side = dir === 'right';

  if (side) paintBodySide(b, look, L, frame);
  else paintBodyFront(b, look, L, frame, dir === 'up');

  hairBack(b, look, dir);
  paintHead(b, look, dir);
  hairFront(b, look, dir);
  accessory(b, look, dir);
  if (look.extras?.lantern) lantern(b, dir, L, frame);

  b.outline();
  return b;
}

// ------------------------------------------------------------------ body

function paintBodyFront(b: PixelBuffer, look: CharacterLook, L: Layout, frame: number, back: boolean): void {
  const lift = frame === 1 ? [1, 0] : frame === 2 ? [0, 1] : [0, 0];
  const swing = frame === 1 ? [1, -1] : frame === 2 ? [-1, 1] : [0, 0];
  const pantsShade = mix(look.pants, P.outline, 0.3);

  // Legs and shoes.
  b.rect(5, L.legTop, 2, L.legBot - L.legTop + 1 - lift[0], look.pants);
  b.rect(9, L.legTop, 2, L.legBot - L.legTop + 1 - lift[1], look.pants);
  b.set(6, L.legTop, pantsShade);
  b.hline(4, 6, L.shoeY - lift[0], look.shoes);
  b.hline(9, 11, L.shoeY - lift[1], look.shoes);

  // Waist and torso.
  const top = look.extras?.jacket ?? look.shirt;
  b.rect(4, L.pantsTop, 8, 1, look.pants);
  b.rect(4, L.torsoTop, 8, L.torsoBot - L.torsoTop + 1, top.base);
  b.vline(11, L.torsoTop + 1, L.torsoBot, top.shade);
  b.hline(4, 11, L.torsoBot, top.shade);

  // Arms: sleeve, then hand.
  [3, 12].forEach((x, i) => {
    const y0 = L.torsoTop + Math.max(0, swing[i]);
    b.rect(x, y0, 1, L.sleeveRows, i === 1 ? top.shade : top.base);
    b.rect(x, y0 + L.sleeveRows, 1, L.handRows - (swing[i] < 0 ? 1 : 0), look.skin.base);
  });

  const ex = look.extras;
  if (!back) {
    if (ex?.jacket) {
      // White collar, open lapels, tie and Carver's lapel flower.
      b.hline(6, 9, L.torsoTop, P.white);
      b.vline(6, L.torsoTop + 1, L.torsoTop + 2, P.white);
      b.vline(9, L.torsoTop + 1, L.torsoTop + 2, P.white);
      if (ex.tie) b.rect(7, L.torsoTop + 1, 2, 4, ex.tie);
      if (ex.lapelFlower) {
        b.set(4, L.torsoTop + 1, ex.lapelFlower);
        b.set(5, L.torsoTop + 1, mix(ex.lapelFlower, P.white, 0.45));
        b.set(5, L.torsoTop + 2, ex.lapelFlower);
        b.set(4, L.torsoTop + 2, P.leaf2);
      }
    } else {
      b.set(7, L.torsoTop, look.skin.shade);
      b.set(8, L.torsoTop, look.skin.shade);
    }
    if (ex?.apron) {
      b.rect(5, L.torsoTop + 2, 6, L.pantsTop - L.torsoTop, ex.apron);
      b.set(5, L.torsoTop + 1, ex.apron);
      b.set(10, L.torsoTop + 1, ex.apron);
      b.hline(6, 9, L.torsoTop + 4, mix(ex.apron, P.outline, 0.2));
    }
  } else if (ex?.apron) {
    b.set(7, L.torsoTop + 1, ex.apron);
    b.set(8, L.torsoTop + 2, ex.apron);
  }
}

function paintBodySide(b: PixelBuffer, look: CharacterLook, L: Layout, frame: number): void {
  const pantsFar = mix(look.pants, P.outline, 0.3);
  const shoeFar = mix(look.shoes, P.outline, 0.3);
  const legH = L.legBot - L.legTop + 1;
  // near leg / far leg x positions per frame
  const pose = frame === 1 ? { near: 9, far: 5 } : frame === 2 ? { near: 5, far: 9 } : { near: 7, far: 6 };
  b.rect(pose.far, L.legTop, 2, legH, pantsFar);
  b.hline(pose.far, pose.far + 2, L.shoeY, shoeFar);
  b.rect(pose.near, L.legTop, 2, legH, look.pants);
  b.hline(pose.near, pose.near + 2, L.shoeY, look.shoes);

  const top = look.extras?.jacket ?? look.shirt;
  b.rect(5, L.pantsTop, 6, 1, look.pants);
  b.rect(5, L.torsoTop, 6, L.torsoBot - L.torsoTop + 1, top.base);
  b.vline(5, L.torsoTop, L.torsoBot, top.shade);

  const ex = look.extras;
  if (ex?.jacket) {
    b.vline(10, L.torsoTop, L.torsoTop + 2, P.white);
    if (ex.tie) b.vline(10, L.torsoTop + 1, L.torsoTop + 3, ex.tie);
    if (ex.lapelFlower) {
      b.set(9, L.torsoTop + 1, ex.lapelFlower);
      b.set(9, L.torsoTop + 2, P.leaf2);
    }
  }
  if (ex?.apron) b.rect(9, L.torsoTop + 2, 2, L.pantsTop - L.torsoTop, ex.apron);

  // One arm swings opposite the near leg.
  const armX = frame === 1 ? 6 : frame === 2 ? 9 : 7;
  b.rect(armX, L.torsoTop, 2, L.sleeveRows, top.shade);
  b.rect(armX, L.torsoTop + L.sleeveRows, 2, L.handRows, look.skin.base);
}

// ------------------------------------------------------------------ head

function paintHead(b: PixelBuffer, look: CharacterLook, dir: Dir): void {
  const s = look.skin;
  b.rect(3, 4, 10, 9, s.base);
  // round the corners
  b.set(3, 4, null);
  b.set(12, 4, null);
  b.set(3, 12, null);
  b.set(12, 12, null);
  b.hline(4, 11, 12, s.shade);

  if (dir === 'down') {
    b.vline(12, 6, 11, s.shade);
    b.set(2, 8, s.base);
    b.set(13, 8, s.shade);
    b.vline(5, 8, 9, P.outline);
    b.vline(10, 8, 9, P.outline);
    const mouth = mix(s.shade, P.outline, 0.35);
    b.set(7, 11, mouth);
    b.set(8, 11, mouth);
    if (look.extras?.mustache) b.hline(5, 10, 10, look.extras.mustache);
    if (look.extras?.beard) {
      b.hline(4, 11, 11, look.extras.beard);
      b.hline(5, 10, 12, look.extras.beard);
    }
  } else if (dir === 'right') {
    b.set(13, 9, s.base); // nose
    b.vline(10, 8, 9, P.outline);
    b.set(11, 11, mix(s.shade, P.outline, 0.35));
    b.rect(7, 8, 1, 2, s.shade); // ear
    if (look.extras?.mustache) b.hline(10, 12, 10, look.extras.mustache);
    if (look.extras?.beard) {
      b.hline(7, 12, 11, look.extras.beard);
      b.hline(8, 11, 12, look.extras.beard);
    }
  } else {
    b.set(2, 8, s.base);
    b.set(13, 8, s.base);
  }
}

// ------------------------------------------------------------------ hair

function curlTexture(b: PixelBuffer, x0: number, y0: number, x1: number, y1: number, hair: CharacterLook['hair']): void {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const c = b.get(x, y);
      if (c !== hair.base) continue;
      if ((x * 3 + y * 5) % 7 === 0) b.set(x, y, hair.shade);
      else if ((x + y * 2) % 11 === 0 && y < 5) b.set(x, y, hair.light);
    }
}

function hairBack(b: PixelBuffer, look: CharacterLook, dir: Dir): void {
  const h = look.hair;
  const side = dir === 'right';
  switch (h.style) {
    case 'curly':
      if (dir === 'up') b.ellipse(1, 1, 14, 12, h.base);
      else if (side) b.ellipse(2, 1, 11, 11, h.base);
      else b.ellipse(1, 1, 14, 11, h.base);
      break;
    case 'long':
      if (dir === 'down') {
        b.rect(2, 5, 2, 10, h.base);
        b.rect(12, 5, 2, 10, h.base);
        b.vline(2, 6, 14, h.shade);
      } else if (side) b.rect(2, 5, 5, 11, h.base);
      break;
    case 'locs':
      if (dir === 'down') {
        for (const x of [1, 2, 3, 12, 13, 14]) b.vline(x, 5, 15 - (x % 2), x % 2 ? h.shade : h.base);
      } else if (side) for (let x = 2; x <= 6; x++) b.vline(x, 5, 16 - (x % 2), x % 2 ? h.shade : h.base);
      break;
    case 'braids':
      if (dir === 'down') {
        for (const x of [1, 13]) for (let y = 6; y <= 16; y++) b.rect(x, y, 2, 1, y % 2 ? h.base : h.shade);
        b.rect(1, 17, 2, 1, look.accent);
        b.rect(13, 17, 2, 1, look.accent);
      } else if (side) {
        for (let y = 6; y <= 17; y++) b.rect(3, y, 2, 1, y % 2 ? h.base : h.shade);
        b.rect(3, 18, 2, 1, look.accent);
      }
      break;
    default:
      break;
  }
}

function hairFront(b: PixelBuffer, look: CharacterLook, dir: Dir): void {
  const h = look.hair;
  const side = dir === 'right';

  const cap = () => {
    b.hline(4, 11, 3, h.base);
    b.rect(3, 4, 10, 2, h.base);
    b.hline(5, 6, 4, h.light);
  };
  const fullBack = () => {
    cap();
    b.rect(3, 6, 10, 6, h.base);
    b.hline(4, 11, 11, h.shade);
  };
  const sideBack = () => {
    b.hline(5, 11, 3, h.base);
    b.rect(3, 4, 10, 2, h.base);
    b.rect(3, 6, 4, 5, h.base);
    b.set(11, 6, h.base);
    b.set(12, 6, h.base);
    b.hline(6, 8, 4, h.light);
  };

  switch (h.style) {
    case 'wrap': {
      // A head wrap in the accent color with a knot on top.
      const c = look.accent;
      const s = mix(c, P.outline, 0.25);
      b.hline(4, 11, 2, c);
      b.rect(3, 3, 10, 3, c);
      b.hline(3, 12, 5, s);
      if (dir === 'up') b.rect(3, 6, 10, 4, c);
      if (side) b.rect(3, 6, 4, 4, c);
      b.rect(7, 1, 3, 2, s);
      return;
    }
    case 'carver':
      // Close-cropped hair, receding at the temples.
      if (dir === 'up') {
        b.rect(4, 4, 8, 7, h.base);
        b.hline(4, 11, 3, h.base);
        b.vline(3, 6, 10, h.base);
        b.vline(12, 6, 10, h.base);
      } else if (side) {
        b.hline(5, 10, 3, h.base);
        b.rect(3, 4, 6, 2, h.base);
        b.rect(3, 6, 3, 5, h.base);
      } else {
        b.hline(5, 10, 3, h.base);
        b.hline(4, 11, 4, h.base);
        b.vline(3, 5, 8, h.base);
        b.vline(12, 5, 8, h.base);
        b.set(7, 4, h.light);
      }
      return;
    case 'bun':
      if (dir === 'up') fullBack();
      else if (side) sideBack();
      else {
        cap();
        b.vline(3, 6, 8, h.base);
        b.vline(12, 6, 8, h.base);
      }
      b.ellipse(6, 0, 4, 4, h.base);
      b.set(7, 1, h.light);
      return;
    case 'curly':
      if (dir === 'up') {
        curlTexture(b, 1, 1, 14, 12, h);
        return;
      }
      if (side) {
        b.ellipse(3, 1, 10, 6, h.base);
        b.rect(3, 5, 4, 6, h.base);
        curlTexture(b, 2, 1, 13, 11, h);
        return;
      }
      b.ellipse(2, 1, 12, 7, h.base);
      b.vline(3, 6, 9, h.base);
      b.vline(12, 6, 9, h.base);
      b.set(6, 6, null);
      curlTexture(b, 1, 1, 14, 11, h);
      // put the face back where the fringe overlaps it
      b.rect(4, 6, 8, 1, look.skin.base);
      return;
    default:
      break;
  }

  if (dir === 'up') {
    fullBack();
    if (h.style === 'long') {
      b.rect(3, 12, 10, 5, h.base);
      b.vline(7, 12, 16, h.shade);
    }
    if (h.style === 'locs') for (let x = 3; x <= 12; x++) b.vline(x, 12, 17 - (x % 2), x % 2 ? h.shade : h.base);
    if (h.style === 'braids') {
      for (const x of [5, 9]) for (let y = 12; y <= 17; y++) b.rect(x, y, 2, 1, y % 2 ? h.base : h.shade);
      b.rect(5, 18, 2, 1, look.accent);
      b.rect(9, 18, 2, 1, look.accent);
    }
  } else if (side) {
    sideBack();
  } else {
    cap();
    b.vline(3, 6, 7, h.base);
    b.vline(12, 6, 7, h.base);
    b.hline(4, 6, 6, h.base); // fringe
    b.set(11, 6, h.base);
  }

  if (h.style === 'puffs') {
    if (side) {
      b.ellipse(1, 1, 5, 5, h.base);
      b.set(2, 2, h.light);
    } else {
      b.ellipse(1, 1, 5, 5, h.base);
      b.ellipse(10, 1, 5, 5, h.base);
      b.set(2, 2, h.light);
      b.set(11, 2, h.light);
    }
  }
}

// ------------------------------------------------------------------ extras

function accessory(b: PixelBuffer, look: CharacterLook, dir: Dir): void {
  const a = look.accessory;
  const acc = look.accent;
  const accShade = mix(acc, P.outline, 0.3);
  const side = dir === 'right';
  switch (a) {
    case 'glasses': {
      const f = '#39364a';
      const lens = '#cfe8f0';
      if (dir === 'down') {
        b.hline(4, 6, 7, f);
        b.hline(9, 11, 7, f);
        b.set(4, 8, f);
        b.set(6, 8, f);
        b.set(9, 8, f);
        b.set(11, 8, f);
        b.hline(7, 8, 8, f);
        b.set(5, 8, lens);
        b.set(10, 8, lens);
      } else if (side) {
        b.hline(9, 11, 7, f);
        b.set(11, 8, f);
        b.set(9, 8, f);
        b.hline(6, 8, 8, f);
        b.set(10, 8, lens);
      }
      break;
    }
    case 'sunhat': {
      const straw = '#e2c27a';
      const strawS = '#c7a55c';
      b.hline(1, 14, 4, straw);
      b.hline(2, 13, 5, strawS);
      b.rect(4, 1, 8, 3, straw);
      b.hline(4, 11, 3, acc);
      b.set(5, 1, strawS);
      break;
    }
    case 'cap':
      b.hline(4, 11, 2, acc);
      b.rect(3, 3, 10, 2, acc);
      b.set(7, 2, P.white);
      if (dir === 'down') b.hline(3, 12, 5, accShade);
      else if (side) b.hline(10, 14, 5, accShade);
      break;
    case 'headband':
      b.hline(3, 12, 5, acc);
      if (dir === 'down') b.set(10, 5, P.white);
      break;
    case 'scarf':
      b.hline(3, 12, 12, acc);
      b.hline(4, 11, 13, accShade);
      if (dir === 'down') b.rect(10, 14, 2, 2, acc);
      if (side) b.rect(4, 14, 2, 2, acc);
      break;
    default:
      break;
  }
}

function lantern(b: PixelBuffer, dir: Dir, L: Layout, frame: number): void {
  if (dir === 'up') return;
  const x = dir === 'right' ? 11 : 13;
  const y = L.torsoTop + L.sleeveRows + L.handRows - (frame === 0 ? 1 : 0);
  b.set(x, y, P.metal);
  b.rect(x, y + 1, 2, 3, P.lampGlow);
  b.set(x + 1, y + 1, P.windowLit);
  b.hline(x, x + 1, y + 4, P.metal);
}

// ------------------------------------------------------------------ sheets

/**
 * A sprite sheet: columns are walk frames (0 idle, 1 and 2 steps), rows are
 * directions in DIRS order.
 */
export function paintSheet(look: CharacterLook): HTMLCanvasElement {
  const H = layoutFor(look.build).H;
  const cv = document.createElement('canvas');
  cv.width = 16 * WALK_FRAMES;
  cv.height = H * DIRS.length;
  const ctx = cv.getContext('2d')!;
  DIRS.forEach((d, row) => {
    for (let f = 0; f < WALK_FRAMES; f++) paintCharacter(look, d, f).drawTo(ctx, f * 16, row * H);
  });
  return cv;
}

export function spriteHeight(look: CharacterLook): number {
  return layoutFor(look.build).H;
}
