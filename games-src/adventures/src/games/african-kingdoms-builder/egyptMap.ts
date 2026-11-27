import type { Season } from './content';

/**
 * The Egypt chapter map as pure functions, so the rules the scene shows can
 * be unit tested: where the river runs, which land is Kemet (the black land
 * the flood covers) and which is Deshret (the red desert), and what the flood
 * covers in each season. x runs west to east, z north (negative) to south.
 */

export const MAP_HALF = 28;

/** The middle of the Nile at a given z (it bends gently). */
export function riverX(z: number): number {
  return 3 + 2.6 * Math.sin(z * 0.085 + 0.6);
}

export const RIVER_HALF_WIDTH = 1.6;
/** How far either side of the river's middle the floodplain reaches. */
export const FLOODPLAIN_HALF_WIDTH = 10;

/** Raised village mounds: villages were built on higher ground, above the flood. */
export const MOUNDS: Array<{ x: number; z: number; r: number }> = [
  { x: 9.5, z: 3, r: 3.4 }, // the east-bank village
  { x: -4.6, z: -9, r: 2.6 }, // the west-bank village
];

export type Zone = 'river' | 'kemet' | 'mound' | 'deshret' | 'plateau';

function smooth(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function noise(x: number, z: number): number {
  return Math.sin(x * 0.7 + z * 0.3) * 0.5 + Math.sin(x * 0.23 - z * 0.61) * 0.35 + Math.sin(x * 1.7 + z * 1.3) * 0.15;
}

export function zoneAt(x: number, z: number): Zone {
  const d = Math.abs(x - riverX(z));
  if (d < RIVER_HALF_WIDTH) return 'river';
  if (MOUNDS.some((m) => Math.hypot(x - m.x, z - m.z) < m.r)) return 'mound';
  if (x - riverX(z) < -(FLOODPLAIN_HALF_WIDTH + 2)) return 'plateau';
  if (d < FLOODPLAIN_HALF_WIDTH) return 'kemet';
  return 'deshret';
}

/** Ground height at a point. The floodplain is low and flat; the desert rises. */
export function heightAt(x: number, z: number): number {
  const rx = riverX(z);
  const d = Math.abs(x - rx);
  if (d < RIVER_HALF_WIDTH) return -0.9 + (d / RIVER_HALF_WIDTH) * 0.6;
  let h = 0.02 + 0.06 * smooth((d - RIVER_HALF_WIDTH) / 3) + noise(x, z) * 0.03;
  // Out past the floodplain the desert climbs, with dunes.
  const desert = smooth((d - FLOODPLAIN_HALF_WIDTH + 1) / 4);
  h += desert * (0.8 + noise(x * 0.6, z * 0.6) * 0.35);
  // The west-bank plateau: a cliff, then flat rock.
  if (x < rx) {
    const cliff = smooth((rx - x - FLOODPLAIN_HALF_WIDTH - 1.2) / 2);
    h += cliff * 1.5;
  }
  for (const m of MOUNDS) {
    const t = 1 - Math.hypot(x - m.x, z - m.z) / m.r;
    if (t > 0) h = Math.max(h, 0.48 * smooth(t * 2.5) + 0.02);
  }
  return h;
}

/** Where the water's surface is in each season. */
export const WATER_LEVEL: Record<Season, number> = {
  akhet: 0.3, // the flood covers the floodplain but not the mounds
  peret: -0.32,
  shemu: -0.45, // the river is at its lowest before the next flood
};

export function isFlooded(x: number, z: number, season: Season): boolean {
  return heightAt(x, z) < WATER_LEVEL[season];
}
