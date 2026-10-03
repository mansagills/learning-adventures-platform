import { mulberry32 } from '../../kit/core/rng';

/**
 * The race road as a list of points along its center, one per segment.
 * Pure math (no drawing) so it can be tested. A track is made of sections:
 * straights, gentle and sharp bends, and hills, eased in and out so the road
 * flows. The first and last stretches are flat and straight for the start
 * and the finish.
 */

/** World units per segment. */
export const SEG = 2;
/** Road width in world units (three lanes). */
export const ROAD_W = 9;
/** How far from the center a car may go (world units). */
export const EDGE = ROAD_W / 2 - 0.9;
/** Lane centers as a fraction of EDGE (left, middle, right). */
export const LANES = [-0.78, 0, 0.78];

export interface TrackPoint {
  x: number;
  y: number;
  z: number;
  heading: number;
  /** Heading change per segment here (how hard the road bends). */
  curve: number;
}

export class Track {
  readonly points: TrackPoint[] = [];

  constructor(
    seed: number,
    readonly length: number,
    opts: { bendiness?: number; hilliness?: number } = {},
  ) {
    const r = mulberry32(seed);
    const bend = opts.bendiness ?? 1;
    const hill = opts.hilliness ?? 1;
    const curves: number[] = [];
    const climbs: number[] = [];
    const flatStart = 50;
    const flatEnd = 60;
    while (curves.length < length + 200) {
      const i = curves.length;
      if (i < flatStart || i > length - flatEnd) {
        curves.push(0);
        climbs.push(0);
        continue;
      }
      const len = 35 + Math.floor(r() * 60);
      const kind = r();
      const c = kind < 0.3 ? 0 : (r() < 0.5 ? -1 : 1) * (0.006 + r() * 0.016) * bend;
      const h = r() < 0.5 ? 0 : (r() < 0.5 ? -1 : 1) * (0.04 + r() * 0.1) * hill;
      for (let k = 0; k < len; k++) {
        const ease = Math.sin((k / len) * Math.PI);
        curves.push(c * ease);
        // a hill goes up then down within the section, so the road returns to its height
        climbs.push(h * Math.sin((k / len) * Math.PI * 2));
      }
    }
    let x = 0;
    let y = 0;
    let z = 0;
    let heading = 0;
    for (let i = 0; i < curves.length; i++) {
      this.points.push({ x, y, z, heading, curve: curves[i] });
      heading += curves[i];
      x += Math.sin(heading) * SEG;
      z -= Math.cos(heading) * SEG;
      y += climbs[i];
    }
  }

  /** The point at segment position s (between points, smoothly). */
  at(s: number): TrackPoint {
    const n = this.points.length;
    const i = Math.max(0, Math.min(n - 2, Math.floor(s)));
    const f = Math.max(0, Math.min(1, s - i));
    const a = this.points[i];
    const b = this.points[i + 1];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: a.z + (b.z - a.z) * f, heading: a.heading + (b.heading - a.heading) * f, curve: a.curve + (b.curve - a.curve) * f };
  }

  /** World position at segment s, `lateral` from -1 (left edge) to 1 (right edge), `up` above the road. */
  pos(s: number, lateral: number, up = 0): { x: number; y: number; z: number } {
    const p = this.at(s);
    const off = lateral * EDGE;
    return { x: p.x + Math.cos(p.heading) * off, y: p.y + up, z: p.z + Math.sin(p.heading) * off };
  }
}

/** Which lane (0, 1, 2) a car at this lateral position is in. */
export function laneOf(lateral: number): number {
  return lateral < -0.39 ? 0 : lateral > 0.39 ? 2 : 1;
}
