import type { Song } from '../../kit/systems/audio';
import { ANCIENT_KINGDOMS } from '../../kit/worlds';

/** The Ancient Kingdoms theme (every game in the world shares it while walking). */
export const FORUM_SONG: Song = ANCIENT_KINGDOMS.music!;

/** A brighter dance for the bakery and road panels (D major, like a festival pipe tune). */
export const WORK_SONG: Song = {
  bpm: 108,
  chords: [
    [62, 66, 69],
    [67, 71, 74],
    [69, 73, 76],
    [62, 66, 69],
  ],
  bass: [38, 43, 45, 38],
  // prettier-ignore
  melody: [
    74, 76, 78, null, 76, 74, 76, null,
    79, null, 78, 76, 74, null, 71, null,
    76, 78, 79, null, 81, 79, 78, 76,
    74, null, 69, null, 74, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};
