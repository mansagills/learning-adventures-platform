import type { Song } from '../../kit/systems/audio';

/** A driving race tune (A minor, quick, with a rolling bass). */
export const RACE_SONG: Song = {
  bpm: 152,
  chords: [
    [69, 72, 76],
    [65, 69, 72],
    [67, 71, 74],
    [64, 68, 71],
  ],
  bass: [45, 41, 43, 40],
  // prettier-ignore
  melody: [
    76, 76, 79, 76, 81, null, 79, 76,
    77, 77, 81, 77, 84, null, 81, 77,
    79, 79, 83, 79, 86, null, 83, 79,
    80, null, 83, null, 88, null, 86, null,
  ],
  lead: 'square',
  drums: true,
};

/** A relaxed tune for the pit stop and the garage. */
export const GARAGE_SONG: Song = {
  bpm: 100,
  chords: [
    [60, 64, 67],
    [57, 60, 64],
    [62, 65, 69],
    [55, 59, 62],
  ],
  bass: [36, 33, 38, 31],
  // prettier-ignore
  melody: [
    72, null, 76, null, 79, null, 76, null,
    74, null, 72, null, 69, null, null, null,
    74, null, 77, null, 81, null, 77, null,
    79, null, 74, null, 71, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};
