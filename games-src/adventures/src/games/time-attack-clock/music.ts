import type { Song } from '../../kit/systems/audio';

/** A ticking, cheerful town tune (G major; the bass walks like a pendulum). */
export const TOWN_SONG: Song = {
  bpm: 112,
  chords: [
    [67, 71, 74],
    [64, 67, 71],
    [60, 64, 67],
    [62, 66, 69],
  ],
  bass: [43, 40, 36, 38],
  // prettier-ignore
  melody: [
    79, null, 74, null, 79, null, 81, 83,
    76, null, 71, null, 76, null, null, null,
    72, null, 76, 79, 81, null, 79, 76,
    74, null, 78, null, 79, null, null, null,
  ],
  lead: 'square',
  drums: true,
};

/** A faster tune for the Time Attack round. */
export const ATTACK_SONG: Song = {
  bpm: 150,
  chords: [
    [69, 72, 76],
    [65, 69, 72],
    [67, 71, 74],
    [64, 68, 71],
  ],
  bass: [45, 41, 43, 40],
  // prettier-ignore
  melody: [
    81, 79, 81, 76, 81, 79, 81, 84,
    77, 76, 77, 72, 77, 76, 77, 81,
    79, 77, 79, 74, 79, 77, 79, 83,
    80, 79, 80, 76, 80, null, 83, null,
  ],
  lead: 'square',
  drums: true,
};

/** The evening tune once the tower is fixed. */
export const EVENING_SONG: Song = {
  bpm: 84,
  chords: [
    [67, 71, 74],
    [64, 67, 71],
    [60, 64, 67],
    [62, 66, 69],
  ],
  bass: [43, 40, 36, 38],
  // prettier-ignore
  melody: [
    74, null, null, 76, 79, null, null, null,
    71, null, null, 72, 76, null, null, null,
    72, null, 74, null, 76, null, 79, null,
    78, null, null, null, 79, null, null, null,
  ],
  lead: 'triangle',
};
