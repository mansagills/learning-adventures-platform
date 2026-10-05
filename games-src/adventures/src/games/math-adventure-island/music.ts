import type { Song } from '../../kit/systems/audio';

/** A sunny calypso for exploring the island (F major, a bouncy bass). */
export const ISLAND_SONG: Song = {
  bpm: 118,
  chords: [
    [65, 69, 72],
    [70, 74, 77],
    [72, 76, 79],
    [65, 69, 72],
  ],
  bass: [41, 46, 48, 41],
  // prettier-ignore
  melody: [
    77, null, 76, 77, null, 72, 74, null,
    77, null, 79, null, 77, 74, null, null,
    76, null, 79, 76, null, 72, 74, 76,
    77, null, 72, null, 69, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** The game-show tune for the Quiz Show. */
export const QUIZ_SONG: Song = {
  bpm: 136,
  chords: [
    [60, 64, 67],
    [57, 60, 64],
    [62, 65, 69],
    [55, 59, 62],
  ],
  bass: [36, 33, 38, 31],
  // prettier-ignore
  melody: [
    72, 76, 79, null, 76, null, 72, null,
    69, 72, 76, null, 72, null, 69, null,
    74, 77, 81, null, 77, 74, 72, null,
    71, null, 74, null, 79, null, null, null,
  ],
  lead: 'square',
  drums: true,
};

/** A slow night tune once the torches blaze. */
export const NIGHT_SONG: Song = {
  bpm: 80,
  chords: [
    [65, 69, 72],
    [62, 65, 69],
    [70, 74, 77],
    [72, 76, 79],
  ],
  bass: [41, 38, 46, 48],
  // prettier-ignore
  melody: [
    72, null, null, 74, 77, null, null, null,
    74, null, null, 72, 69, null, null, null,
    70, null, 74, null, 77, null, 76, null,
    76, null, null, null, 72, null, null, null,
  ],
  lead: 'triangle',
};
