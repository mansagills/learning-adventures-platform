import type { Song } from '../../kit/systems/audio';

/** A bouncy fairground waltz-like tune (C major, oom-pah bass). */
export const CARNIVAL_SONG: Song = {
  bpm: 112,
  chords: [
    [60, 64, 67],
    [55, 59, 62],
    [57, 60, 64],
    [53, 57, 60],
  ],
  bass: [36, 31, 33, 29],
  // prettier-ignore
  melody: [
    76, 74, 72, null, 74, 76, 79, null,
    77, 76, 74, null, 71, 72, 74, null,
    76, 77, 79, null, 81, 79, 76, null,
    77, null, 74, 72, 72, null, null, null,
  ],
  lead: 'square',
  drums: true,
};

/** Calmer and twinkly for the night finale. */
export const NIGHT_SONG: Song = {
  bpm: 88,
  chords: [
    [60, 64, 67, 71],
    [57, 60, 64, 67],
    [53, 57, 60, 64],
    [55, 59, 62, 65],
  ],
  bass: [36, 33, 29, 31],
  // prettier-ignore
  melody: [
    79, null, 76, null, 72, null, 76, null,
    81, null, 77, null, 72, null, null, null,
    77, null, 74, null, 71, null, 74, null,
    79, null, null, 76, 72, null, null, null,
  ],
  lead: 'sine',
};
