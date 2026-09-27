import { PixelBuffer, mix } from './pixel';
import { P } from './palette';
import type { CharacterLook } from './characters';
import type { Expression } from '../quests/types';

/**
 * 48x48 dialogue portraits with expressions. Carver's portrait adds the
 * details that make him recognizable at a glance: silver close-cropped hair,
 * a full mustache, a work suit, and a fresh flower in his lapel.
 */
export function paintPortrait(look: CharacterLook, expression: Expression, opts: { elder?: boolean } = {}): PixelBuffer {
  const b = new PixelBuffer(48, 48);
  const s = look.skin;
  const h = look.hair;
  const top = look.extras?.jacket ?? look.shirt;

  // shoulders
  b.ellipse(4, 38, 40, 18, top.base);
  b.rect(4, 44, 40, 4, top.base);
  b.ellipse(4, 40, 10, 10, top.shade);
  // neck
  b.rect(19, 33, 10, 7, s.shade);

  const ex = look.extras;
  if (ex?.jacket) {
    // white collar, open lapels, tie, lapel flower
    b.rect(18, 38, 12, 10, P.white);
    b.rect(22, 39, 4, 9, ex.tie ?? P.outline);
    b.set(23, 38, mix(ex.tie ?? P.outline, P.white, 0.2));
    for (let i = 0; i < 7; i++) {
      b.set(17 - Math.floor(i / 2), 39 + i, top.shade);
      b.set(30 + Math.floor(i / 2), 39 + i, top.shade);
    }
    if (ex.lapelFlower) {
      b.ellipse(9, 40, 5, 5, ex.lapelFlower);
      b.set(11, 41, mix(ex.lapelFlower, P.white, 0.5));
      b.set(11, 42, P.flowerYellow);
      b.set(13, 45, P.leaf2);
      b.set(12, 45, P.leaf1);
    }
  } else {
    b.rect(20, 38, 8, 3, s.shade);
  }
  if (ex?.apron) {
    b.rect(14, 42, 20, 6, ex.apron);
    b.vline(15, 38, 42, ex.apron);
    b.vline(32, 38, 42, ex.apron);
  }

  // hair behind the head
  if (h.style === 'curly') b.ellipse(6, 2, 36, 34, h.base);
  if (h.style === 'long' || h.style === 'locs' || h.style === 'braids') b.rect(9, 12, 30, 26, h.shade);

  // head
  b.ellipse(11, 6, 26, 32, s.base);
  b.ellipse(8, 18, 5, 8, s.base); // ears
  b.ellipse(35, 18, 5, 8, s.shade);
  // cheek/jaw shading on the right
  for (let y = 10; y < 38; y++)
    for (let x = 28; x < 38; x++) if (b.get(x, y) === s.base && (x - 28) * 2 + (y - 10) * 0.4 > 12) b.set(x, y, s.shade);
  b.hline(17, 30, 37, s.shade);

  const eyeY = 21;
  const eyeL = 17;
  const eyeR = 28;
  const white = '#fbf6ec';
  const dark = P.outline;
  const brow = h.style === 'wrap' ? mix(s.shade, P.outline, 0.5) : h.shade;

  switch (expression) {
    case 'smile':
    case 'proud':
      // happy closed/curved eyes
      [eyeL, eyeR].forEach((x) => {
        b.hline(x, x + 3, eyeY, dark);
        b.set(x - 1, eyeY + 1, dark);
        b.set(x + 4, eyeY + 1, dark);
      });
      break;
    case 'thinking':
      [eyeL, eyeR].forEach((x) => {
        b.rect(x, eyeY - 1, 4, 4, white);
        b.rect(x + 2, eyeY - 1, 2, 2, dark);
      });
      break;
    default:
      [eyeL, eyeR].forEach((x) => {
        b.rect(x, eyeY - 1, 4, 4, white);
        b.rect(x + 1, eyeY - 1, 2, 4, dark);
        b.set(x + 1, eyeY - 1, P.white);
      });
  }
  // eyebrows
  if (expression === 'curious') {
    b.hline(eyeL - 1, eyeL + 3, eyeY - 4, brow);
    b.hline(eyeR, eyeR + 4, eyeY - 5, brow);
  } else if (expression === 'thinking') {
    b.hline(eyeL - 1, eyeL + 3, eyeY - 3, brow);
    b.hline(eyeR, eyeR + 4, eyeY - 4, brow);
  } else {
    b.hline(eyeL - 1, eyeL + 3, eyeY - 3, brow);
    b.hline(eyeR, eyeR + 4, eyeY - 3, brow);
  }
  // nose
  b.vline(24, 22, 27, s.shade);
  b.hline(22, 25, 28, s.shade);

  // mouth
  const lip = mix(s.shade, P.outline, 0.45);
  const mouthY = 32;
  if (expression === 'proud') {
    b.hline(20, 28, mouthY, lip);
    b.rect(21, mouthY + 1, 7, 2, '#8e3b3b');
    b.hline(22, 26, mouthY + 1, P.white);
  } else if (expression === 'smile') {
    b.hline(21, 27, mouthY, lip);
    b.set(20, mouthY - 1, lip);
    b.set(28, mouthY - 1, lip);
  } else if (expression === 'curious') {
    b.rect(23, mouthY - 1, 3, 3, lip);
  } else {
    b.hline(21, 27, mouthY, lip);
  }

  // age lines for elders
  if (opts.elder) {
    b.set(15, eyeY + 3, s.shade);
    b.set(32, eyeY + 3, s.shade);
    b.hline(20, 23, 11, s.shade);
    b.hline(25, 28, 12, s.shade);
    b.vline(19, 27, 29, s.shade);
    b.vline(29, 27, 29, s.shade);
  }

  if (ex?.mustache) {
    b.rect(18, 29, 13, 3, ex.mustache);
    b.hline(19, 29, 28, ex.mustache);
    b.set(17, 31, ex.mustache);
    b.set(31, 31, ex.mustache);
    b.hline(19, 29, 31, mix(ex.mustache, P.outline, 0.2));
  }
  if (ex?.beard) {
    b.ellipse(14, 28, 21, 12, ex.beard);
    b.rect(20, 31, 9, 2, lip);
  }

  // hair on top
  switch (h.style) {
    case 'carver':
      // Close-cropped silver hair with a soft, natural hairline.
      b.ellipse(11, 3, 26, 13, h.base);
      b.rect(10, 10, 3, 9, h.base);
      b.rect(35, 10, 3, 9, h.base);
      b.ellipse(14, 10, 20, 6, s.base);
      for (let x = 12; x < 36; x += 2) for (let y = 4; y < 12; y += 3) if (b.get(x, y) === h.base && (x + y) % 4 === 0) b.set(x, y, h.shade);
      b.hline(17, 26, 5, h.light);
      break;
    case 'wrap': {
      const c = look.accent;
      b.ellipse(8, 0, 32, 18, c);
      b.rect(10, 9, 28, 4, c);
      b.hline(10, 37, 13, mix(c, P.outline, 0.3));
      b.ellipse(26, 0, 12, 8, mix(c, P.white, 0.15));
      for (let x = 12; x < 36; x += 4) b.set(x, 6, mix(c, P.outline, 0.25));
      break;
    }
    case 'curly':
      b.ellipse(8, 1, 32, 16, h.base);
      for (let i = 0; i < 40; i++) {
        const x = 8 + ((i * 13) % 32);
        const y = 2 + ((i * 7) % 14);
        if (b.get(x, y) === h.base) b.set(x, y, h.shade);
      }
      b.ellipse(8, 8, 5, 18, h.base);
      b.ellipse(35, 8, 5, 18, h.base);
      break;
    default: {
      b.ellipse(10, 3, 28, 14, h.base);
      b.rect(10, 9, 3, 10, h.base);
      b.rect(35, 9, 3, 10, h.base);
      b.hline(16, 22, 6, h.light);
      if (h.style === 'puffs') {
        b.ellipse(3, 0, 13, 13, h.base);
        b.ellipse(32, 0, 13, 13, h.base);
        b.set(7, 3, h.light);
        b.set(36, 3, h.light);
      }
      if (h.style === 'long' || h.style === 'locs' || h.style === 'braids') {
        b.rect(8, 12, 4, 26, h.base);
        b.rect(36, 12, 4, 26, h.base);
      }
      if (h.style === 'bun') b.ellipse(19, 0, 10, 8, h.base);
    }
  }

  // glasses
  if (look.accessory === 'glasses') {
    const f = '#39364a';
    [eyeL - 2, eyeR - 1].forEach((x) => {
      b.hline(x, x + 6, eyeY - 2, f);
      b.hline(x, x + 6, eyeY + 3, f);
      b.vline(x, eyeY - 2, eyeY + 3, f);
      b.vline(x + 6, eyeY - 2, eyeY + 3, f);
    });
    b.hline(eyeL + 5, eyeR - 1, eyeY, f);
  }
  // hats last
  if (look.accessory === 'sunhat') {
    const straw = '#e2c27a';
    b.ellipse(2, 5, 44, 10, '#c7a55c');
    b.ellipse(3, 4, 42, 9, straw);
    b.ellipse(12, 0, 24, 11, straw);
    b.rect(12, 6, 24, 3, look.accent);
    for (let x = 6; x < 42; x += 4) b.set(x, 9, '#c7a55c');
  }
  if (look.accessory === 'cap') {
    b.ellipse(10, 1, 28, 12, look.accent);
    b.rect(10, 8, 28, 3, look.accent);
    b.rect(8, 11, 32, 2, mix(look.accent, P.outline, 0.3));
  }
  return b.outline();
}
