import type { TimeOfDay } from '../quests/types';

/**
 * The clock. One in-game day lasts about 12 real minutes. Time only sets the
 * mood (light, sounds, which optional townsfolk are out); it never locks a
 * lesson, and the player can pause it or sleep to change it.
 */

export const REAL_SECONDS_PER_GAME_MINUTE = 0.5;

interface Key {
  h: number;
  tint: [number, number, number];
  night: number;
}

// Hour → light color (multiplied over the world) and night amount (0..1).
// Night stays bright enough to read the world clearly.
const KEYS: Key[] = [
  { h: 0, tint: [0.5, 0.56, 0.8], night: 1 },
  { h: 4.5, tint: [0.5, 0.56, 0.8], night: 1 },
  { h: 6, tint: [0.95, 0.8, 0.78], night: 0.25 },
  { h: 7.5, tint: [1, 1, 1], night: 0 },
  { h: 17, tint: [1, 1, 1], night: 0 },
  { h: 18.5, tint: [1, 0.86, 0.68], night: 0.1 },
  { h: 19.5, tint: [0.78, 0.66, 0.82], night: 0.55 },
  { h: 20.5, tint: [0.5, 0.56, 0.8], night: 1 },
  { h: 24, tint: [0.5, 0.56, 0.8], night: 1 },
];

export function lightAt(minutes: number): { tint: [number, number, number]; night: number } {
  const h = (((minutes % 1440) + 1440) % 1440) / 60;
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (h >= a.h && h <= b.h) {
      const t = b.h === a.h ? 0 : (h - a.h) / (b.h - a.h);
      const s = t * t * (3 - 2 * t);
      return {
        tint: [0, 1, 2].map((k) => a.tint[k] + (b.tint[k] - a.tint[k]) * s) as [number, number, number],
        night: a.night + (b.night - a.night) * s,
      };
    }
  }
  return { tint: [1, 1, 1], night: 0 };
}

export function timeOfDay(minutes: number): TimeOfDay {
  const h = (((minutes % 1440) + 1440) % 1440) / 60;
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'evening';
  return 'night';
}

/** Optional NPC presence: 'day' folk are out 6:00-19:00, 'night' folk 18:00-6:00. */
export function isPresent(presence: 'always' | 'day' | 'night', minutes: number): boolean {
  if (presence === 'always') return true;
  const h = (((minutes % 1440) + 1440) % 1440) / 60;
  return presence === 'day' ? h >= 6 && h < 19 : h >= 18 || h < 6;
}

export function clockLabel(minutes: number): string {
  const m = Math.floor(((minutes % 1440) + 1440) % 1440);
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${h24 < 12 ? 'AM' : 'PM'}`;
}
