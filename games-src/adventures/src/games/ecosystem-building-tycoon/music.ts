import type { Song } from '../../kit/systems/audio';
import { WILD_LANDS } from '../../kit/worlds/wild-lands/style';

/** The Wild Lands theme (every game in the world shares it), played at the ranger station. */
export const STATION_SONG: Song = WILD_LANDS.music!;

/** Meadow Island: a sunny, skipping tune in C major, like bees going flower to flower. */
export const MEADOW_SONG: Song = {
  bpm: 108,
  chords: [
    [48, 52, 55],
    [45, 48, 52],
    [41, 45, 48],
    [43, 47, 50],
  ],
  bass: [36, 33, 29, 31],
  // prettier-ignore
  melody: [
    76, null, 79, 76, 72, null, 74, 76,
    77, null, 76, null, 72, null, null, null,
    74, null, 77, 81, 79, null, 77, 76,
    74, null, 71, null, 72, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** Pond Island: slow and rippling in G major, with plinking notes like drops on the water. */
export const POND_SONG: Song = {
  bpm: 96,
  chords: [
    [43, 47, 50],
    [40, 43, 47],
    [48, 52, 55],
    [50, 54, 57],
  ],
  bass: [31, 28, 36, 38],
  // prettier-ignore
  melody: [
    74, null, null, 79, 83, null, 81, null,
    79, null, 76, null, 74, null, null, null,
    72, null, 76, null, 79, 81, 79, null,
    78, null, null, null, 74, null, null, null,
  ],
  lead: 'sine',
  drums: true,
};

/** The Field Notebook and the research choices: calm and thoughtful in F major. */
export const NOTEBOOK_SONG: Song = {
  bpm: 86,
  chords: [
    [53, 57, 60],
    [48, 52, 55],
    [50, 53, 57],
    [46, 50, 53],
  ],
  bass: [41, 36, 38, 34],
  // prettier-ignore
  melody: [
    77, null, 76, null, 72, null, 74, null,
    76, null, 79, null, 77, null, null, null,
    74, null, 72, null, 69, null, 72, 74,
    77, null, null, null, 76, null, null, null,
  ],
  lead: 'triangle',
};

/** A restored island at night: a soft lullaby in D major, with the fireflies out. */
export const NIGHT_SONG: Song = {
  bpm: 72,
  chords: [
    [50, 54, 57],
    [47, 50, 54],
    [43, 47, 50],
    [45, 49, 52],
  ],
  bass: [38, 35, 31, 33],
  // prettier-ignore
  melody: [
    78, null, null, null, 81, null, 78, null,
    76, null, null, null, 74, null, null, null,
    71, null, 74, null, 78, null, 76, null,
    73, null, null, null, 74, null, null, null,
  ],
  lead: 'sine',
};

/** Woods Island: a gentle, walking tune in E minor, with low, woody notes under the trees. */
export const WOODS_SONG: Song = {
  bpm: 92,
  chords: [
    [40, 43, 47],
    [36, 40, 43],
    [43, 47, 50],
    [38, 42, 45],
  ],
  bass: [28, 24, 31, 26],
  // prettier-ignore
  melody: [
    71, null, 69, 67, 64, null, 67, null,
    72, null, 71, null, 67, null, null, null,
    71, null, 74, null, 71, 69, 67, null,
    66, null, 67, null, 69, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** Wetland Island: a slow, swaying tune in A major, like reeds in the wind. */
export const WETLAND_SONG: Song = {
  bpm: 88,
  chords: [
    [45, 49, 52],
    [42, 45, 49],
    [50, 54, 57],
    [52, 56, 59],
  ],
  bass: [33, 30, 38, 40],
  // prettier-ignore
  melody: [
    76, null, null, 73, 76, null, 78, null,
    81, null, 78, null, 76, null, null, null,
    74, null, 78, null, 81, null, 76, null,
    73, null, null, null, 71, null, null, null,
  ],
  lead: 'sine',
  drums: true,
};

/** The Archipelago and Open Day: a bright, proud tune in D major that brings the islands' tunes together. */
export const FINALE_SONG: Song = {
  bpm: 112,
  chords: [
    [50, 54, 57],
    [55, 59, 62],
    [47, 50, 54],
    [45, 49, 52],
  ],
  bass: [38, 43, 35, 33],
  // prettier-ignore
  melody: [
    74, null, 78, 81, 86, null, 83, 81,
    79, null, 83, null, 81, null, null, null,
    78, null, 81, 83, 81, null, 78, 76,
    74, null, 76, null, 73, null, null, null,
  ],
  lead: 'square',
  drums: true,
};
