import type { Song } from '../../kit/systems/audio';
import { STAR_STATION } from '../../kit/worlds';

/** The Star Station theme (every game in the world shares it), played in the med bay. */
export const MEDBAY_SONG: Song = STAR_STATION.music!;

/** Flying inside the body: bubbly and curious, in E minor, with a heartbeat bass. */
export const BODY_SONG: Song = {
  bpm: 96,
  chords: [
    [52, 55, 59],
    [48, 52, 55],
    [50, 54, 57],
    [47, 50, 54],
  ],
  bass: [40, 36, 38, 35],
  // prettier-ignore
  melody: [
    76, null, 79, 78, 76, null, 71, null,
    72, null, 76, null, 74, null, null, null,
    74, null, 78, 76, 74, null, 69, null,
    71, null, 74, null, 76, null, null, null,
  ],
  lead: 'triangle',
};

/** Germs out of the nest: quicker and bouncy, but never scary, in G major. */
export const HEAL_SONG: Song = {
  bpm: 128,
  chords: [
    [55, 59, 62],
    [52, 55, 59],
    [48, 52, 55],
    [50, 54, 57],
  ],
  bass: [43, 40, 36, 38],
  // prettier-ignore
  melody: [
    79, 79, null, 83, null, 81, 79, null,
    76, null, 79, null, 83, null, 81, null,
    72, null, 76, 79, null, 76, 74, null,
    74, null, 78, null, 81, null, null, null,
  ],
  lead: 'square',
};
