import type { Song } from '../../kit/systems/audio';
import { WILD_LANDS } from '../../kit/worlds/wild-lands/style';

/** The Wild Lands theme (every game in the world shares it), played at the field camp. */
export const CAMP_SONG: Song = WILD_LANDS.music!;

/** Sunny Shore: a bright, bouncy tune in G major with steel-drum-like notes, for running along the beach. */
export const SHORE_SONG: Song = {
  bpm: 124,
  chords: [
    [55, 59, 62],
    [52, 55, 59],
    [48, 52, 55],
    [50, 54, 57],
  ],
  bass: [43, 40, 36, 38],
  // prettier-ignore
  melody: [
    79, null, 76, 79, 81, null, 79, 76,
    74, null, 76, null, 71, null, null, null,
    72, null, 76, null, 79, 81, 83, null,
    81, null, 78, null, 74, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** Cloud Heights: airy and floating in D major, with long notes like drifting clouds. */
export const CLOUDS_SONG: Song = {
  bpm: 112,
  chords: [
    [50, 54, 57],
    [55, 59, 62],
    [47, 50, 54],
    [52, 55, 59],
  ],
  bass: [38, 43, 35, 40],
  // prettier-ignore
  melody: [
    78, null, null, 81, 83, null, 81, null,
    79, null, 78, null, 74, null, null, null,
    76, null, 78, null, 81, null, 79, 78,
    76, null, null, null, 74, null, null, null,
  ],
  lead: 'sine',
  drums: true,
};

/** Mountain Pass: brisk and crisp in A minor, a climbing tune with a chill in it. */
export const MOUNTAIN_SONG: Song = {
  bpm: 118,
  chords: [
    [45, 48, 52],
    [41, 45, 48],
    [48, 52, 55],
    [43, 47, 50],
  ],
  bass: [33, 29, 36, 31],
  // prettier-ignore
  melody: [
    76, null, 72, 76, 79, null, 76, null,
    77, null, 76, null, 72, null, null, null,
    74, null, 76, null, 79, null, 83, 81,
    79, null, null, 76, 74, null, null, null,
  ],
  lead: 'square',
  drums: true,
};

/** The Weather Book and the forecast stops: calm and thoughtful in F major. */
export const BOOK_SONG: Song = {
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
    77, null, 81, null, 84, null, 81, null,
    82, null, 79, null, 77, null, null, null,
    74, null, 77, null, 81, null, 79, 77,
    76, null, null, null, 72, null, null, null,
  ],
  lead: 'triangle',
};

/** River Run: a rolling, quick tune in E major for riding the raft downstream. */
export const RIVER_SONG: Song = {
  bpm: 132,
  chords: [
    [52, 56, 59],
    [49, 52, 56],
    [45, 49, 52],
    [47, 51, 54],
  ],
  bass: [40, 37, 33, 35],
  // prettier-ignore
  melody: [
    76, 78, 80, null, 83, null, 80, 78,
    76, null, 73, null, 71, null, null, null,
    73, 76, 78, null, 81, null, 80, 78,
    76, null, 75, null, 71, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** The Storm Front: dramatic and brave in D minor, with low rumbling chords. */
export const STORM_SONG: Song = {
  bpm: 108,
  chords: [
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
    [45, 49, 52],
  ],
  bass: [38, 34, 36, 33],
  // prettier-ignore
  melody: [
    74, null, 77, null, 81, null, 79, 77,
    76, null, 74, null, 73, null, null, null,
    74, null, 77, 79, 81, null, 82, 81,
    79, null, 77, null, 76, null, null, null,
  ],
  lead: 'square',
  drums: true,
};
