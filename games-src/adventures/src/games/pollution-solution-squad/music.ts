import type { Song } from '../../kit/systems/audio';
import { WILD_LANDS } from '../../kit/worlds/wild-lands/style';

/** The Wild Lands theme (every game in the world shares it), played at Beach Camp. */
export const CAMP_SONG: Song = WILD_LANDS.music!;

/** Turtle Beach: a sunny, rolling tune in C major, like waves on the sand. */
export const BEACH_SONG: Song = {
  bpm: 118,
  chords: [
    [60, 64, 67],
    [57, 60, 64],
    [53, 57, 60],
    [55, 59, 62],
  ],
  bass: [48, 45, 41, 43],
  // prettier-ignore
  melody: [
    76, null, 79, 76, 72, null, 74, 76,
    77, null, 76, null, 72, null, null, null,
    74, null, 77, 74, 71, null, 72, 74,
    76, null, 74, null, 67, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** The Harbor: a busy, bobbing sea shanty feel in A minor. */
export const HARBOR_SONG: Song = {
  bpm: 126,
  chords: [
    [57, 60, 64],
    [55, 59, 62],
    [53, 57, 60],
    [52, 56, 59],
  ],
  bass: [45, 43, 41, 40],
  // prettier-ignore
  melody: [
    69, 72, 76, null, 74, 72, 71, null,
    72, null, 69, null, 67, null, null, null,
    65, 69, 72, null, 71, 69, 68, null,
    69, null, 71, null, 64, null, null, null,
  ],
  lead: 'square',
  drums: true,
};

/** The Squad Journal and the water test: calm and thoughtful in F major. */
export const JOURNAL_SONG: Song = {
  bpm: 88,
  chords: [
    [53, 57, 60],
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
  ],
  bass: [41, 38, 34, 36],
  // prettier-ignore
  melody: [
    72, null, 77, null, 81, null, 77, null,
    79, null, 77, null, 74, null, null, null,
    74, null, 76, null, 77, null, 79, 77,
    76, null, null, null, 72, null, null, null,
  ],
  lead: 'triangle',
};

/** The Wetland: slow and misty in D minor, with frogs and dragonflies. */
export const WETLAND_SONG: Song = {
  bpm: 96,
  chords: [
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
    [45, 49, 52],
  ],
  bass: [38, 34, 36, 33],
  // prettier-ignore
  melody: [
    74, null, null, 77, 76, null, 74, null,
    70, null, 72, null, 74, null, null, null,
    72, null, null, 76, 74, null, 72, null,
    69, null, 73, null, 76, null, null, null,
  ],
  lead: 'triangle',
  drums: false,
};

/** Farm and Town: a bright, walking country tune in G major. */
export const TOWN_SONG: Song = {
  bpm: 112,
  chords: [
    [55, 59, 62],
    [60, 64, 67],
    [62, 66, 69],
    [55, 59, 62],
  ],
  bass: [43, 48, 50, 43],
  // prettier-ignore
  melody: [
    71, 74, 79, null, 78, 76, 74, null,
    76, null, 72, null, 74, null, null, null,
    74, 78, 81, null, 79, 78, 76, null,
    74, null, 71, null, 67, null, null, null,
  ],
  lead: 'square',
  drums: true,
};

/** The Big Rain and Clean Coast Day: a big, warm finale in C major. */
export const FINALE_SONG: Song = {
  bpm: 104,
  chords: [
    [60, 64, 67],
    [65, 69, 72],
    [57, 60, 64],
    [67, 71, 74],
  ],
  bass: [48, 53, 45, 43],
  // prettier-ignore
  melody: [
    79, null, 76, 79, 84, null, 81, null,
    77, null, 81, null, 79, null, null, null,
    76, null, 72, 76, 81, null, 79, 77,
    79, null, 74, null, 72, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};
