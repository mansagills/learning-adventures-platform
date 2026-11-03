import type { Song } from '../../kit/systems/audio';
import { WILD_LANDS } from '../../kit/worlds/wild-lands/style';

/** The Wild Lands theme (every game in the world shares it), played at the field camp. */
export const CAMP_SONG: Song = WILD_LANDS.music!;

/** The rainforest: a bouncy marimba-like tune in F major, like hopping from leaf to leaf. */
export const FOREST_SONG: Song = {
  bpm: 108,
  chords: [
    [53, 57, 60],
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
  ],
  bass: [41, 38, 34, 36],
  // prettier-ignore
  melody: [
    77, null, 74, 77, 79, null, 77, null,
    74, null, 72, null, 69, null, null, null,
    70, null, 74, null, 77, 79, 81, null,
    79, null, 76, null, 72, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** The desert: slow and warm in D minor, with long notes like heat shimmering over the sand. */
export const DESERT_SONG: Song = {
  bpm: 84,
  chords: [
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
    [45, 49, 52],
  ],
  bass: [38, 34, 36, 33],
  // prettier-ignore
  melody: [
    74, null, null, 76, 77, null, 76, null,
    74, null, 73, null, 74, null, null, null,
    69, null, 70, null, 72, null, 70, 69,
    67, null, null, null, 69, null, null, null,
  ],
  lead: 'sine',
};

/** The Rescue Center and the Ranger Journal: gentle and thoughtful, in C major. */
export const JOURNAL_SONG: Song = {
  bpm: 88,
  chords: [
    [48, 52, 55],
    [45, 48, 52],
    [41, 45, 48],
    [43, 47, 50],
  ],
  bass: [36, 33, 29, 31],
  // prettier-ignore
  melody: [
    72, null, 76, null, 79, null, 76, null,
    77, null, 74, null, 72, null, null, null,
    69, null, 72, null, 76, null, 74, 72,
    71, null, null, null, 67, null, null, null,
  ],
  lead: 'triangle',
};
