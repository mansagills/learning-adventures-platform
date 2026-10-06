import type { Song } from '../../kit/systems/audio';

/** A bouncy work-song for the building yard (C major, a hammering bass). */
export const YARD_SONG: Song = {
  bpm: 116,
  chords: [
    [60, 64, 67],
    [65, 69, 72],
    [67, 71, 74],
    [60, 64, 67],
  ],
  bass: [36, 41, 43, 36],
  // prettier-ignore
  melody: [
    72, null, 74, 76, null, 72, 67, null,
    69, null, 72, null, 77, null, 76, null,
    74, null, 71, 74, null, 79, 77, null,
    76, null, 72, null, 72, null, null, null,
  ],
  lead: 'square',
  drums: true,
};

/** The fast arcade tune for Rush mode. */
export const RUSH_SONG: Song = {
  bpm: 152,
  chords: [
    [62, 65, 69],
    [60, 64, 67],
    [58, 62, 65],
    [57, 61, 64],
  ],
  bass: [38, 36, 34, 33],
  // prettier-ignore
  melody: [
    74, 77, 81, 77, 74, 77, 81, 84,
    72, 76, 79, 76, 72, 76, 79, 83,
    70, 74, 77, 74, 70, 74, 77, 81,
    69, 73, 76, null, 81, null, 76, null,
  ],
  lead: 'square',
  drums: true,
};

/** The gentle evening tune once the clubhouse opens. */
export const EVENING_SONG: Song = {
  bpm: 84,
  chords: [
    [60, 64, 67],
    [57, 60, 64],
    [65, 69, 72],
    [67, 71, 74],
  ],
  bass: [36, 33, 41, 43],
  // prettier-ignore
  melody: [
    76, null, null, 74, 72, null, null, null,
    69, null, 72, null, 76, null, null, null,
    77, null, 76, null, 74, null, 72, null,
    74, null, null, null, 72, null, null, null,
  ],
  lead: 'triangle',
};
