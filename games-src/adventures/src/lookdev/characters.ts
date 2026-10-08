import { DEFAULT_APPEARANCE, lookFromAppearance, paintCharacter, type Dir } from '../kit/art/characters';
import type { PixelBuffer } from '../kit/art/pixel';
import { paintPortrait } from '../kit/art/portraits';
import { PLAYER16, paintHero, paintPortrait16, richen, type Dir16, type Mood } from './hero';

/**
 * The character test sheet (W0 step 1): the same child at today's Sunny Town
 * look and at three richer 16-bit levels, side by side.
 */

export interface Version {
  id: 'today' | 'a' | 'b' | 'c';
  label: string;
  note: string;
  /** Pixels per tile in this version's world. */
  tile: number;
  sprite(dir: Dir16, walk: number, blink: boolean): PixelBuffer;
}

const kidLook = lookFromAppearance(DEFAULT_APPEARANCE);
const kitDir = (d: Dir16): Dir => d;
/** Today's walk has 3 frames (stand, step, step); map our 4-frame cycle onto it. */
const kitFrame = (walk: number) => [1, 0, 2, 0][walk % 4];

export const VERSIONS: Version[] = [
  {
    id: 'today',
    label: 'Today (Sunny Town)',
    note: '16 x 24 pixels, 2-3 shades per color, one brown outline. Stays as it is.',
    tile: 16,
    sprite: (d, w) => paintCharacter(kidLook, kitDir(d), w ? kitFrame(w) : 0),
  },
  {
    id: 'a',
    label: '(a) Same size, richer color',
    note: '16 x 24 pixels. 5 shades per color, lit and shadow edges, colored outlines.',
    tile: 16,
    sprite: (d, w) => richen(paintCharacter(kidLook, kitDir(d), w ? kitFrame(w) : 0)),
  },
  {
    id: 'b',
    label: '(b) 24 x 36, more detail',
    note: '24 pixels per tile. Eyes with a shine, hair texture, collar, badge, sneakers. 4-frame walk and a blink.',
    tile: 24,
    sprite: (d, w, blink) => paintHero(PLAYER16, 1.5, d, { walk: w, blink }),
  },
  {
    id: 'c',
    label: '(c) 32 x 48, most detail',
    note: '32 pixels per tile. Larger eyes with lashes and a glint, rounder shapes, finer shading.',
    tile: 32,
    sprite: (d, w, blink) => paintHero(PLAYER16, 2, d, { walk: w, blink }),
  },
];

export const MOODS: Mood[] = ['smile', 'neutral', 'curious', 'thinking'];

export function todayPortrait(): PixelBuffer {
  return paintPortrait(kidLook, 'smile');
}

export function newPortrait(m: Mood): PixelBuffer {
  return paintPortrait16(PLAYER16, m);
}
