import type { WorldId, WorldStyle } from './types';

/**
 * The three world styles. A style is what stays the same in every setting
 * of a world (docs/GAME_WORLDS_PROPOSAL.md, 4b).
 */

/**
 * Sunny Town: today's look (the eight finished Math games). It is recorded
 * here so the site and later games can name it, but its games keep their own
 * scene code and are not changed (owner decision, 2026-10-06).
 */
export const SUNNY_TOWN: WorldStyle = {
  id: 'sunny-town',
  name: 'Sunny Town',
  px: 16,
  characters: 'classic',
  tint: { day: [1, 1, 1], evening: [0.78, 0.72, 0.92] },
  timeNames: { day: 'day', evening: 'evening' },
  panelClass: 'world-sunny',
  accent: '#4f9a4a',
  glow: { lamp: '#ffe7a3' },
};

/** Star Station: a friendly sci-fi world of decks, domes and alien planets. Cool shadows, neon glows. */
export const STAR_STATION: WorldStyle = {
  id: 'star-station',
  name: 'Star Station',
  px: 24,
  characters: '16bit',
  tint: { day: [1, 1, 1], evening: [0.6, 0.64, 0.92] },
  timeNames: { day: 'day shift', evening: 'night shift' },
  panelClass: 'world-star',
  accent: '#4fd6ff',
  glow: { neon: '#5fe3ff', pink: '#ff7fc8', green: '#8dffb0', amber: '#ffcf6a' },
  music: {
    bpm: 96,
    chords: [
      [57, 60, 64],
      [53, 57, 60],
      [55, 59, 62],
      [52, 55, 59],
    ],
    bass: [45, 41, 43, 40],
    // prettier-ignore
    melody: [
      76, null, 72, null, 69, null, 72, 76,
      77, null, 72, null, 69, null, 65, null,
      79, null, 74, null, 71, null, 74, 79,
      76, null, 71, null, 67, null, null, null,
    ],
    lead: 'square',
  },
};

/** Ancient Kingdoms: warm, sunlit places of long ago (Mali, Kush, Egypt, Rome...). Torchlight and dusk skies. */
export const ANCIENT_KINGDOMS: WorldStyle = {
  id: 'ancient-kingdoms',
  name: 'Ancient Kingdoms',
  px: 24,
  characters: '16bit',
  tint: { day: [1, 1, 1], evening: [0.92, 0.66, 0.66] },
  timeNames: { day: 'day', evening: 'dusk' },
  panelClass: 'world-ancient',
  accent: '#2f4f9e',
  glow: { torch: '#ffb050', ember: '#ff9a40', door: '#ffb060' },
  music: {
    bpm: 92,
    chords: [
      [62, 65, 69],
      [60, 64, 67],
      [62, 65, 69],
      [57, 60, 64],
    ],
    bass: [38, 36, 38, 33],
    // prettier-ignore
    melody: [
      74, null, 72, 74, 77, null, 74, null,
      72, null, 69, null, 67, 69, null, null,
      74, null, 77, null, 79, 77, 74, null,
      72, 69, null, 67, 62, null, null, null,
    ],
    lead: 'triangle',
    drums: true,
  },
};

export const WORLD_STYLES: Record<WorldId, WorldStyle> = {
  'sunny-town': SUNNY_TOWN,
  'star-station': STAR_STATION,
  'ancient-kingdoms': ANCIENT_KINGDOMS,
};
