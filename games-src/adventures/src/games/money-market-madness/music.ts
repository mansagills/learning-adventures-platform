import type { Song } from '../../kit/systems/audio';

/** A sunny, bouncy market tune (F major, with a skip in the melody). */
export const MARKET_SONG: Song = {
  bpm: 118,
  chords: [
    [65, 69, 72],
    [62, 65, 69],
    [58, 62, 65],
    [60, 64, 67],
  ],
  bass: [41, 38, 34, 36],
  // prettier-ignore
  melody: [
    77, null, 76, 77, 79, null, 77, null,
    74, null, 72, 74, 77, null, null, null,
    70, null, 72, 74, 76, null, 74, 72,
    72, 74, 76, null, 77, null, null, null,
  ],
  lead: 'square',
  drums: true,
};

/** Gentle tune for the shop and the end of the day. */
export const SHOP_SONG: Song = {
  bpm: 92,
  chords: [
    [65, 69, 72],
    [67, 70, 74],
    [64, 67, 72],
    [65, 69, 72],
  ],
  bass: [41, 43, 36, 41],
  // prettier-ignore
  melody: [
    72, null, 74, null, 76, null, 77, null,
    79, null, 77, null, 74, null, null, null,
    76, null, 74, null, 72, null, 70, null,
    69, null, 70, 72, 72, null, null, null,
  ],
  lead: 'triangle',
};
