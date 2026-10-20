import type { Song } from '../../kit/systems/audio';
import { WILD_LANDS } from '../../kit/worlds/wild-lands/style';

/** The Wild Lands theme (every game in the world shares it), played at the field camp. */
export const CAMP_SONG: Song = WILD_LANDS.music!;

/** The sunlight dive: bright and bubbly, in F major, with a plucky triangle lead. */
export const REEF_SONG: Song = {
  bpm: 100,
  chords: [
    [53, 57, 60],
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
  ],
  bass: [41, 38, 34, 36],
  // prettier-ignore
  melody: [
    72, null, 74, 77, null, 74, 72, null,
    69, null, 72, null, 74, null, null, null,
    70, null, 74, 77, 79, null, 77, 74,
    76, null, 72, null, 67, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** The twilight dive: slow and glowing, in D minor, with a soft sine lead. */
export const DEEP_SONG: Song = {
  bpm: 66,
  chords: [
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
    [45, 49, 52],
  ],
  bass: [38, 34, 36, 33],
  // prettier-ignore
  melody: [
    69, null, null, 72, 74, null, null, null,
    72, null, 70, null, 69, null, null, null,
    65, null, null, 69, 72, null, 70, null,
    69, null, null, null, 64, null, null, null,
  ],
  lead: 'sine',
};

/** At the logbook and in the lab: thoughtful, in C major. */
export const LAB_SONG: Song = {
  bpm: 86,
  chords: [
    [48, 52, 55],
    [53, 57, 60],
    [50, 53, 57],
    [55, 59, 62],
  ],
  bass: [36, 41, 38, 43],
  // prettier-ignore
  melody: [
    76, null, 79, null, 81, null, 79, null,
    77, null, 76, null, 74, null, null, null,
    72, null, 74, null, 76, null, 79, 77,
    74, null, 76, null, 72, null, null, null,
  ],
  lead: 'triangle',
};
