import type { Song } from '../../kit/systems/audio';

/** A bright pentatonic tune for the daytime river (C major pentatonic). */
export const DOJO_SONG: Song = {
  bpm: 96,
  chords: [
    [60, 64, 67],
    [57, 60, 64],
    [53, 57, 60],
    [55, 59, 62],
  ],
  bass: [36, 33, 29, 31],
  // prettier-ignore
  melody: [
    72, null, 74, 76, null, 79, 76, null,
    81, null, 79, null, 76, 74, null, null,
    72, null, 76, null, 74, null, 72, 69,
    67, null, 69, 72, null, 74, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** A slow, hushed tune for Lantern River at night (A minor pentatonic). */
export const NIGHT_SONG: Song = {
  bpm: 72,
  chords: [
    [57, 60, 64],
    [53, 57, 60],
    [55, 59, 62],
    [52, 55, 59],
  ],
  bass: [33, 29, 31, 28],
  // prettier-ignore
  melody: [
    76, null, null, 74, 72, null, null, null,
    69, null, 72, null, 74, null, null, null,
    76, null, 79, null, 76, null, 74, null,
    72, null, null, null, 69, null, null, null,
  ],
  lead: 'sine',
};
