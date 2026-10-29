import type { Song } from '../../kit/systems/audio';
import { WILD_LANDS } from '../../kit/worlds/wild-lands/style';

/** The Wild Lands theme (every game in the world shares it), played at the dig site. */
export const CAMP_SONG: Song = WILD_LANDS.music!;

/** Digging in the quarry: a steady, plucky beat in G major, like tapping with a rock pick. */
export const DIG_SONG: Song = {
  bpm: 96,
  chords: [
    [55, 59, 62],
    [52, 55, 59],
    [48, 52, 55],
    [50, 54, 57],
  ],
  bass: [43, 40, 36, 38],
  // prettier-ignore
  melody: [
    74, null, 71, null, 74, 76, 74, null,
    71, null, 67, null, 69, null, null, null,
    72, null, 76, null, 79, null, 76, 74,
    72, null, 71, null, 69, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** At the logbook and the cliff: slow and thoughtful, in A minor. */
export const LAB_SONG: Song = {
  bpm: 80,
  chords: [
    [45, 48, 52],
    [41, 45, 48],
    [43, 47, 50],
    [40, 44, 47],
  ],
  bass: [33, 29, 31, 28],
  // prettier-ignore
  melody: [
    76, null, null, 72, 74, null, 76, null,
    77, null, 76, null, 74, null, null, null,
    72, null, 71, null, 69, null, 72, 71,
    68, null, null, null, 64, null, null, null,
  ],
  lead: 'sine',
};
