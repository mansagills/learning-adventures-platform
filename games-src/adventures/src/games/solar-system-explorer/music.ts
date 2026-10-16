import type { Song } from '../../kit/systems/audio';
import { STAR_STATION } from '../../kit/worlds';

/** The Star Station theme (every game in the world shares it), played in the observatory. */
export const OBSERVATORY_SONG: Song = STAR_STATION.music!;

/** At a station: thoughtful and twinkly, in G major, with a soft triangle lead. */
export const STATION_SONG: Song = {
  bpm: 88,
  chords: [
    [55, 59, 62],
    [52, 55, 59],
    [48, 52, 55],
    [50, 54, 57],
  ],
  bass: [43, 40, 36, 38],
  // prettier-ignore
  melody: [
    79, null, 83, null, 86, null, 83, null,
    81, null, 79, null, 76, null, null, null,
    76, null, 79, null, 84, null, 83, 81,
    78, null, 81, null, 79, null, null, null,
  ],
  lead: 'triangle',
};

/** Out among the planets (the rover and the cloud dive): wide and wondering, in E minor. */
export const PLANET_SONG: Song = {
  bpm: 76,
  chords: [
    [52, 55, 59],
    [48, 52, 55],
    [43, 47, 50],
    [50, 54, 57],
  ],
  bass: [40, 36, 31, 38],
  // prettier-ignore
  melody: [
    76, null, null, 79, 83, null, null, null,
    84, null, 83, null, 79, null, null, null,
    74, null, null, 78, 81, null, 79, null,
    78, null, null, null, 74, null, null, null,
  ],
  lead: 'sine',
};

/** The Grand Tour: bright and on the move, in D major, with a square lead. */
export const TOUR_SONG: Song = {
  bpm: 112,
  chords: [
    [50, 54, 57],
    [55, 59, 62],
    [47, 50, 54],
    [57, 61, 64],
  ],
  bass: [38, 43, 35, 45],
  // prettier-ignore
  melody: [
    74, null, 78, 81, 86, null, 81, null,
    83, null, 79, null, 74, null, 79, 83,
    78, null, 74, null, 71, 74, 78, null,
    81, null, 85, null, 88, null, null, null,
  ],
  lead: 'square',
};

/** The star party under the open dome: warm and gentle, in F major. */
export const PARTY_SONG: Song = {
  bpm: 84,
  chords: [
    [53, 57, 60],
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
  ],
  bass: [41, 38, 34, 36],
  // prettier-ignore
  melody: [
    77, null, 81, null, 84, null, 81, 79,
    77, null, 74, null, 77, null, null, null,
    74, null, 77, null, 82, null, 81, 79,
    76, null, 79, null, 77, null, null, null,
  ],
  lead: 'triangle',
};
