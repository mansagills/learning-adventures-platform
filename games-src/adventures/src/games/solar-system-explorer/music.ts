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
