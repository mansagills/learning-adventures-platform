import type { Song } from '../../kit/systems/audio';

/** A quick, bouncy "busy library" tune (it speeds up the feel without being loud). */
export const RUSH_SONG: Song = {
  bpm: 132,
  chords: [
    [57, 60, 64],
    [53, 57, 60],
    [55, 59, 62],
    [52, 55, 59],
  ],
  bass: [33, 29, 31, 28],
  // prettier-ignore
  melody: [
    69, null, 72, 74, 76, null, 74, 72,
    69, null, 72, null, 77, 76, 74, null,
    71, null, 74, 76, 79, null, 77, 76,
    76, 74, 72, null, 71, null, null, null,
  ],
  lead: 'square',
  drums: true,
};

/** Calm piano-ish tune for the title and the end-of-shift summary. */
export const QUIET_SONG: Song = {
  bpm: 90,
  chords: [
    [60, 64, 67],
    [57, 60, 64],
    [53, 57, 60],
    [55, 59, 62],
  ],
  bass: [36, 33, 29, 31],
  // prettier-ignore
  melody: [
    72, null, 76, null, 79, null, 76, null,
    72, null, 76, 77, 76, null, null, null,
    69, null, 72, null, 77, null, 76, 74,
    71, null, 72, 74, 72, null, null, null,
  ],
  lead: 'triangle',
};
