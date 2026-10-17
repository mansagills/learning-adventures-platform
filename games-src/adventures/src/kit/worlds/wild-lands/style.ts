import type { WorldStyle } from '../types';

/**
 * Wild Lands: the nature world (docs/GAME_WORLDS_PROPOSAL.md 7c). Rainforest
 * camps, coral reefs, coastlines and meadows, painted in the same 16-bit
 * style as Star Station and Ancient Kingdoms. Leaf greens, earth browns and
 * sea blues; cool blue-green shadows and warm sunlit edges. After dusk the
 * world's glow is living light: fireflies, glowing mushrooms and the blue
 * sparkle of plankton in the sea.
 *
 * In look development: kept out of WORLD_STYLES (styles.ts) and worlds.css
 * until the owner approves the look, so the finished games stay the same.
 */
export const WILD_LANDS: WorldStyle = {
  id: 'wild-lands',
  name: 'Wild Lands',
  px: 24,
  characters: '16bit',
  tint: { day: [1, 1, 1], evening: [0.66, 0.74, 0.9] },
  timeNames: { day: 'day', evening: 'dusk' },
  panelClass: 'world-wild',
  accent: '#3fae5a',
  glow: {
    firefly: '#f6ff8a',
    mushroom: '#7dffb0',
    plankton: '#5fd8ff',
    lantern: '#ffd07a',
  },
  // a bright, bouncy marimba-like tune (a plucky triangle lead over warm chords)
  music: {
    bpm: 104,
    chords: [
      [60, 64, 67],
      [57, 60, 64],
      [65, 69, 72],
      [67, 71, 74],
    ],
    bass: [36, 33, 41, 43],
    // prettier-ignore
    melody: [
      72, 76, null, 79, 76, null, 72, null,
      69, 72, null, 76, 72, null, 69, 67,
      72, null, 77, 76, 74, null, 72, null,
      71, 74, null, 79, 74, null, null, null,
    ],
    lead: 'triangle',
    drums: true,
  },
};
