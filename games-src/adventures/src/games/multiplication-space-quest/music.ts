import type { Song } from '../../kit/systems/audio';
import { STAR_STATION } from '../../kit/worlds';

/** The Star Station theme (every game in the world shares it on the deck). */
export const DECK_SONG: Song = STAR_STATION.music!;

/** The flight: driving and bright, in A minor like the station theme, with drums. */
export const FLIGHT_SONG: Song = {
  bpm: 132,
  chords: [
    [57, 60, 64],
    [53, 57, 60],
    [55, 59, 62],
    [57, 61, 64],
  ],
  bass: [45, 41, 43, 45],
  // prettier-ignore
  melody: [
    81, null, 76, 79, 81, null, 84, null,
    77, null, 72, 76, 77, null, 81, null,
    79, null, 74, 77, 79, 81, 83, null,
    81, 79, 76, null, 73, null, 76, null,
  ],
  lead: 'square',
  drums: true,
};

/** A sector cleared: a short, proud fanfare loop (C major). */
export const CLEAR_SONG: Song = {
  bpm: 100,
  chords: [
    [60, 64, 67],
    [65, 69, 72],
    [67, 71, 74],
    [60, 64, 67],
  ],
  bass: [48, 53, 55, 48],
  // prettier-ignore
  melody: [
    72, null, 76, null, 79, null, 76, 79,
    84, null, 81, null, 77, null, null, null,
    79, null, 83, null, 86, null, 83, 79,
    84, null, null, null, 72, null, null, null,
  ],
  lead: 'triangle',
  drums: true,
};

/** The Bingo Boss: the heart of the Static. Driving, a little tense (D minor), still friendly. */
export const BOSS_SONG: Song = {
  bpm: 140,
  chords: [
    [50, 53, 57],
    [46, 50, 53],
    [48, 52, 55],
    [45, 49, 52],
  ],
  bass: [38, 34, 36, 33],
  // prettier-ignore
  melody: [
    74, 77, 81, null, 77, 74, 77, null,
    70, 74, 77, null, 74, 70, 74, null,
    72, 76, 79, null, 76, 72, 79, 81,
    73, null, 76, null, 79, null, 81, null,
  ],
  lead: 'square',
  drums: true,
};
