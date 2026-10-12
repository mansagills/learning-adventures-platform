import { PixelBuffer } from '../../kit/art/pixel';
import { STAR } from '../../kit/worlds/star-station/art';
import { BODY, paintBloodBandit, paintBodyMap, paintPlaqueJack, paintQueasyLouie, paintScrapesMcGee, paintSniffles } from '../../kit/worlds/star-station/body-art';
import { Paint, ramp } from '../../kit/worlds/shade';
import type { Mission } from './problems';

/**
 * Body System Heroes art, painted in code in the Star Station style. The
 * cast and the inside-the-body areas live in the world kit
 * (src/kit/worlds/star-station/body-art.ts and body.ts); this file has the
 * game's own pieces: the body map on its stand, icons, germ portraits for the
 * talk box, the scan marker and the healthy-habit pictures.
 */

const U = (T: number) => T / 16;

/** Where each mission's organ sits on the body map (see paintBodyMap: brain, mouth, lungs, heart, gut, skin). */
export const ORGAN_INDEX: Record<Mission, number> = { brain: 0, mouth: 1, lungs: 2, heart: 3, gut: 4, skin: 5 };

/** The body map on a stand (about 1.6 tiles wide): the organs of healed missions glow. */
export function paintMapStand(T: number, healed: number[], frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => Math.round(v * u);
  const screen = paintBodyMap(T, healed, frame);
  const out = new PixelBuffer(screen.w + S(4), screen.h + S(14));
  const p = new Paint(out.w, out.h);
  p.rect(out.w / 2 - S(1.5), screen.h, S(3), S(12), STAR.trim, { form: 'cylV' });
  p.rect(out.w / 2 - S(7), out.h - S(3), S(14), S(3), STAR.dark, { form: 'flat', level: 2, sep: true });
  const b = p.toBuffer();
  out.blit(b, 0, 0);
  out.blit(screen, S(2), 0);
  return out;
}

/** A small icon for each mission (16 x 16): the organ. */
export function paintMissionIcon(m: Mission, on = true): PixelBuffer {
  const p = new Paint(16, 16);
  const c = (hex: string) => ramp(on ? hex : '#6c6f86');
  if (m === 'skin') {
    p.rect(2, 4, 12, 8, c('#e9b48c'), { form: 'sphere', sep: true });
    p.rect(5, 6, 6, 4, c('#ffffff'), { form: 'flat', level: 3 });
    for (const x of [6, 9]) p.pix(x, 8, on ? '#e0606a' : '#4a4d66');
  } else if (m === 'mouth') {
    p.ellipse(8, 9, 6.5, 5, c('#e86a86'), { form: 'sphere', sep: true });
    for (const x of [4, 7, 10]) p.rect(x, 5, 2.5, 3, c('#f4f1e6'), { form: 'flat', level: 3 });
  } else if (m === 'lungs') {
    p.ellipse(5, 9, 3.6, 5, c('#f4a6b4'), { form: 'sphere', sep: true });
    p.ellipse(11, 9, 3.6, 5, c('#f4a6b4'), { form: 'sphere', sep: true });
    p.rect(7, 1, 2, 6, c('#d9707f'), { form: 'cylV' });
  } else if (m === 'gut') {
    p.ellipse(8, 8, 6, 6, c('#f09a7a'), { form: 'sphere', sep: true });
    p.line(4, 8, 12, 8, c('#dc7f66'), 1, { onlyOver: true });
  } else if (m === 'heart') {
    p.ellipse(5.5, 6.5, 3.5, 3.5, c('#e0434f'), { form: 'sphere' });
    p.ellipse(10.5, 6.5, 3.5, 3.5, c('#e0434f'), { form: 'sphere' });
    p.poly(
      [
        [2, 7],
        [14, 7],
        [8, 14],
      ],
      c('#e0434f'),
      { form: 'sphere', sep: true },
    );
  } else {
    p.ellipse(8, 8, 6.5, 5.5, c('#f4b6c8'), { form: 'sphere', sep: true });
    p.line(8, 3, 8, 13, c('#d98aa2'), 1, { onlyOver: true });
  }
  return p.toBuffer();
}

export type GermId = 'scrapes' | 'plaque' | 'sniffles' | 'queasy' | 'bandit';
export const GERM_IDS: GermId[] = ['scrapes', 'plaque', 'sniffles', 'queasy', 'bandit'];

/** A germ's sprite (the kit's art). */
export function paintGerm(g: GermId, T: number, frame = 0): PixelBuffer {
  if (g === 'scrapes') return paintScrapesMcGee(T, frame);
  if (g === 'plaque') return paintPlaqueJack(T, frame);
  if (g === 'queasy') return paintQueasyLouie(T, frame);
  if (g === 'bandit') return paintBloodBandit(T, frame);
  return paintSniffles(T, frame);
}

/** A germ's portrait for the talk box and the wanted poster (72 x 72). */
export function paintGermPortrait(g: GermId): PixelBuffer {
  const out = new PixelBuffer(72, 72);
  const bg = new Paint(72, 72);
  const back: Record<GermId, string> = { sniffles: '#3a2a62', plaque: '#5a2a3a', scrapes: '#5a3a2a', queasy: '#3a4a2a', bandit: '#4a2246' };
  bg.rect(0, 0, 72, 72, ramp(back[g]), { level: 2 });
  for (let y = 0; y < 72; y += 6) bg.line(0, y, 71, y, ramp('#ffffff'), 0, { onlyOver: true });
  out.blit(bg.toBuffer({ outline: false }), 0, 0);
  const sprite = paintGerm(g, 32, 0);
  // scale to fill the frame
  const k = Math.min(64 / sprite.w, 64 / sprite.h);
  const big = new PixelBuffer(Math.floor(sprite.w * k), Math.floor(sprite.h * k));
  for (let y = 0; y < big.h; y++) for (let x = 0; x < big.w; x++) big.set(x, y, sprite.get(Math.floor(x / k), Math.floor(y / k)));
  out.blit(big, Math.round(36 - big.w / 2), Math.round(38 - big.h / 2));
  return out;
}

/** The scan marker over a scan spot: a cyan diamond with a dot, bobbing (two frames). */
export function paintScanMarker(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(12 * u), Math.round(16 * u));
  p.poly(
    [
      [S(6), S(1)],
      [S(11), S(6)],
      [S(6), S(11)],
      [S(1), S(6)],
    ],
    frame % 2 ? STAR.cyan : ramp('#7ff0ff'),
    { form: 'sphere', sep: true },
  );
  p.ellipse(S(6), S(6), S(1.6), S(1.6), ramp('#ffffff'), { form: 'flat', level: 2 });
  p.poly(
    [
      [S(4.5), S(12)],
      [S(7.5), S(12)],
      [S(6), S(15)],
    ],
    STAR.cyan,
    { form: 'flat', level: 2 },
  );
  return p.toBuffer();
}

export type UpgradeId = 'escort' | 'wave' | 'net' | 'buddies' | 'darts';
export const UPGRADE_IDS: UpgradeId[] = ['escort', 'wave', 'net', 'buddies', 'darts'];

/** An icon for each ship upgrade (16 x 16). */
export function paintUpgradeIcon(id: UpgradeId | 'scanner', on = true): PixelBuffer {
  const p = new Paint(16, 16);
  const c = (hex: string) => ramp(on ? hex : '#6c6f86');
  if (id === 'scanner') {
    p.ellipse(8, 8, 6, 6, c('#4fd6ff'), { form: 'sphere', sep: true });
    p.ellipse(8, 8, 3, 3, c('#26324f'), { form: 'flat', level: 1 });
    p.pix(7, 7, '#ffffff');
  } else if (id === 'escort') {
    for (const [x, y, r] of [
      [6, 7, 4],
      [10, 6, 4],
      [8, 10, 4.5],
    ])
      p.ellipse(x, y, r, r * 0.9, c('#f2eee4'), { box: [2, 2, 12, 12] });
    p.pix(7, 8, '#1d1a30');
    p.pix(10, 8, '#1d1a30');
  } else if (id === 'wave') {
    for (let k = 0; k < 3; k++) p.ellipse(8, 8, 2 + k * 2.4, 2 + k * 2.4, c(k % 2 ? '#8fe6ff' : '#4fd6ff'), { form: 'flat', level: 3 - k });
  } else if (id === 'buddies') {
    p.capsule(4, 6, 10, 6, 3, c('#5ccf8a'), { sep: true });
    p.capsule(7, 11, 13, 11, 3, c('#5ccf8a'), { sep: true });
    p.pix(6, 6, '#1d1a30');
    p.pix(9, 11, '#1d1a30');
  } else if (id === 'darts') {
    p.line(2, 13, 10, 5, c('#ffcf6a'), 2);
    p.poly(
      [
        [9, 3],
        [13, 3],
        [13, 7],
      ],
      c('#ff6fc0'),
      { form: 'flat', level: 3, sep: true },
    );
    p.line(2, 11, 4, 13, c('#ffcf6a'), 2);
  } else {
    p.ellipse(8, 9, 6.5, 4.5, c('#e8e07a'), { form: 'sphere', sep: true });
    for (let x = 3; x < 14; x += 3) p.line(x, 5, x, 13, c('#c8b84a'), 1, { onlyOver: true });
  }
  return p.toBuffer();
}

/** A body fact card floating in a healed area (about 0.8 tiles): gold, with a star. `frame` twinkles it. */
export function paintFactCard(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(16 * u));
  p.rect(S(1), S(1), S(12), S(14), ramp('#ffcf6a'), { form: 'flat', level: 2, sep: true });
  p.rect(S(2.5), S(2.5), S(9), S(11), ramp('#fff6d8'), { form: 'flat', level: 3 });
  p.poly(
    [
      [S(7), S(4)],
      [S(8.2), S(7)],
      [S(11), S(7.2)],
      [S(8.8), S(9.2)],
      [S(9.6), S(12)],
      [S(7), S(10.4)],
      [S(4.4), S(12)],
      [S(5.2), S(9.2)],
      [S(3), S(7.2)],
      [S(5.8), S(7)],
    ],
    ramp(frame % 2 ? '#ff9f43' : '#ffb547'),
    { form: 'flat', level: 3 },
  );
  if (frame % 2) p.pix(S(3), S(3), '#ffffff');
  return p.toBuffer();
}

/** A nerve relay marker for the finale: a glowing spark in a ring (two frames). */
export function paintRelayMarker(T: number, frame = 0): PixelBuffer {
  const u = U(T);
  const S = (v: number) => v * u;
  const p = new Paint(Math.round(14 * u), Math.round(16 * u));
  p.ellipse(S(7), S(6), S(5.6), S(5.6), ramp('#ffd86a'), { form: 'sphere', sep: true });
  p.ellipse(S(7), S(6), S(3.4), S(3.4), ramp(frame % 2 ? '#ffffff' : '#fff1b0'), { form: 'flat', level: 3 });
  p.poly(
    [
      [S(5), S(12)],
      [S(9), S(12)],
      [S(7), S(15)],
    ],
    ramp('#ffd86a'),
    { form: 'flat', level: 2 },
  );
  return p.toBuffer();
}

// ------------------------------------------------------------------ the healthy-habit pictures

/** Two hands, palms up (for the 20-second handwashing). 128 x 96. */
export function paintHands(): PixelBuffer {
  const p = new Paint(128, 96);
  const skin = ramp('#c98a5e');
  for (const k of [-1, 1]) {
    const cx = 64 + k * 30;
    p.ellipse(cx, 58, 22, 26, skin, { form: 'sphere', sep: true });
    for (let f = 0; f < 4; f++) {
      const fx = cx - k * 14 + k * f * 9.5;
      p.capsule(fx, 40, fx + k * (f - 1.5) * 2, 10 + Math.abs(f - 1.5) * 4, 4.4, skin, { sep: true });
    }
    p.capsule(cx + k * 22, 62, cx + k * 34, 44, 5, skin, { sep: true });
  }
  return p.toBuffer();
}

/** A smile of teeth (for brushing). 128 x 80. */
export function paintSmile(): PixelBuffer {
  const p = new Paint(128, 80);
  p.ellipse(64, 40, 62, 36, BODY.gum, { form: 'sphere', sep: true });
  p.ellipse(64, 46, 50, 20, ramp('#7a2a3e'), { form: 'flat', level: 1 });
  for (let i = 0; i < 8; i++) {
    const x = 14 + i * 13;
    p.rect(x, 18, 11, 14, BODY.tooth, { form: 'sphere', sep: true, box: [x, 18, 11, 14] });
    p.rect(x, 52, 11, 12, BODY.tooth, { form: 'sphere', sep: true, box: [x, 52, 11, 12] });
  }
  return p.toBuffer();
}

/** A knee with a scrape (for clean and cover): a leg seen from the front, bent a little. 128 x 96. */
export function paintKnee(covered = false): PixelBuffer {
  const p = new Paint(128, 96);
  const skin = ramp('#c98a5e');
  // the thigh comes in from the top, the shin goes out at the bottom
  p.capsule(60, -10, 64, 44, 27, skin, { form: 'cylV' });
  p.capsule(64, 52, 68, 108, 22, skin, { form: 'cylV' });
  p.ellipse(64, 48, 30, 24, skin, { form: 'sphere', sep: true });
  if (!covered) {
    p.ellipse(64, 48, 18, 10, BODY.scrape, { form: 'flat', level: 2 });
    for (const [x, y] of [
      [56, 46],
      [66, 50],
      [72, 45],
    ])
      p.pix(x, y, '#8a2a3a');
  } else {
    p.rect(40, 38, 48, 20, ramp('#f2d0a0'), { form: 'cylV', sep: true, box: [40, 38, 48, 20] });
    p.rect(54, 40, 20, 16, ramp('#fff4e0'), { form: 'flat', level: 3 });
    for (let x = 44; x < 86; x += 6) p.pix(x, 41, '#d8b080');
  }
  return p.toBuffer();
}

/** A germ speck to scrub away (8 x 8). */
export function paintSpeck(kind: 'germ' | 'dirt' | 'plaque', seed = 0): PixelBuffer {
  const p = new Paint(9, 9);
  const r = kind === 'dirt' ? ramp('#8a7a6a') : kind === 'plaque' ? BODY.plaqueFilm : ramp(seed % 2 ? '#9ad04a' : '#7c6ae0');
  p.ellipse(4.5, 4.5, 3.6, 3.2, r, { form: 'sphere', sep: true });
  if (kind === 'germ') {
    p.pix(3, 4, '#ffffff');
    p.pix(6, 4, '#ffffff');
  }
  return p.toBuffer();
}

/** The soap bubble brush the child moves around (12 x 12). */
export function paintScrubber(kind: 'soap' | 'brush' | 'water'): PixelBuffer {
  const p = new Paint(14, 14);
  if (kind === 'brush') {
    p.rect(1, 6, 12, 4, ramp('#4fd6ff'), { form: 'cylV', sep: true });
    for (let x = 2; x < 12; x += 2) p.line(x, 2, x, 6, ramp('#ffffff'), 3);
  } else {
    p.ellipse(7, 7, 6, 6, ramp(kind === 'soap' ? '#f4f1ff' : '#8fe6ff'), { form: 'sphere', bias: 0.2, sep: true });
    p.pix(5, 4, '#ffffff');
  }
  return p.toBuffer();
}

/** An apple, a carrot and lettuce on a cutting board (for washing food). 128 x 96. */
export function paintProduce(): PixelBuffer {
  const p = new Paint(128, 96);
  p.rect(6, 52, 116, 36, ramp('#c99a62'), { form: 'cylV', sep: true, box: [6, 52, 116, 36] });
  for (let x = 14; x < 116; x += 18) p.line(x, 56, x + 6, 84, ramp('#a87a48'), 2, { onlyOver: true });
  // lettuce
  for (const [x, y, r] of [
    [28, 52, 16],
    [20, 44, 11],
    [38, 42, 12],
  ])
    p.ellipse(x, y, r, r * 0.8, ramp('#7ccf5a'), { form: 'sphere', sep: true });
  p.line(28, 40, 28, 62, ramp('#c8ef9a'), 1, { onlyOver: true });
  // the apple
  p.ellipse(66, 56, 15, 14, ramp('#e04a4a'), { form: 'sphere', sep: true });
  p.line(66, 42, 68, 36, ramp('#6a4a2a'), 2);
  p.ellipse(73, 38, 5, 2.6, ramp('#5ccf5a'), { form: 'sphere' });
  // the carrot
  p.poly(
    [
      [90, 50],
      [120, 62],
      [92, 68],
    ],
    ramp('#ff8a3c'),
    { form: 'sphere', sep: true },
  );
  for (const x of [98, 106]) p.line(x, 55, x + 2, 65, ramp('#ff8a3c'), 1, { onlyOver: true });
  for (let k = 0; k < 3; k++) p.line(90, 58, 80 - k * 2, 46 + k * 6, ramp('#5ccf5a'), 2);
  return p.toBuffer();
}

/** A pixel heart for the jump-rope game (beats bigger on frame 1). 40 x 36. */
export function paintBigHeart(frame = 0): PixelBuffer {
  const p = new Paint(40, 36);
  const k = frame ? 1.1 : 1;
  const c = ramp('#e0434f');
  p.ellipse(13, 13, 9 * k, 9 * k, c, { form: 'sphere' });
  p.ellipse(27, 13, 9 * k, 9 * k, c, { form: 'sphere' });
  p.poly(
    [
      [20 - 17 * k, 15],
      [20 + 17 * k, 15],
      [20, 15 + 18 * k],
    ],
    c,
    { form: 'sphere', sep: true },
  );
  p.pix(11, 9, '#ffffff');
  return p.toBuffer();
}
