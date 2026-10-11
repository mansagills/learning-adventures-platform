import type { Song } from '../../kit/systems/audio';
import { STAR_STATION } from '../../kit/worlds';

/** The Star Station theme (every game in the world shares it), played at the outpost. */
export const OUTPOST_SONG: Song = STAR_STATION.music!;

/** Weighing: calm and careful (this skill is about care, not speed), in D minor with soft chimes. */
export const WEIGH_SONG: Song = {
  bpm: 92,
  chords: [
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
    [45, 49, 52],
  ],
  bass: [38, 34, 36, 33],
  // prettier-ignore
  melody: [
    74, null, 77, null, 76, null, 74, null,
    70, null, 74, null, 72, null, null, null,
    72, null, 76, null, 79, null, 77, 76,
    73, null, 76, null, 74, null, null, null,
  ],
  lead: 'triangle',
};

/** The beacon is lit (and the finale): bright and proud, in F major. */
export const BEACON_SONG: Song = {
  bpm: 104,
  chords: [
    [53, 57, 60],
    [58, 62, 65],
    [60, 64, 67],
    [53, 57, 60],
  ],
  bass: [41, 46, 48, 41],
  // prettier-ignore
  melody: [
    77, null, 81, null, 84, null, 81, 84,
    82, null, 86, null, 89, null, 86, null,
    84, null, 88, null, 91, null, 88, 84,
    89, null, 84, null, 81, null, null, null,
  ],
  lead: 'square',
};
