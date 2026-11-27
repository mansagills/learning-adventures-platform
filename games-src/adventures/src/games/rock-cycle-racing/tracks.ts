import { TrackGraph, type ForkSpec, type PathSpec, type TrackKind, type Vec3, v3 } from '../../kit/race/track';

/**
 * The test track: a short part of the Lava Run for the look preview.
 *
 * You start as magma in the chamber under the volcano and roll up the vent
 * to one fork:
 *   - left, "Stay deep and cool slowly": a winding tunnel to a crystal cave
 *     (you finish as granite);
 *   - right, "Erupt and flow out": up the volcano's throat, out through the
 *     crater and down the mountain as a lava flow (you finish as basalt).
 *
 * The volcano sits at the origin. y is up; the canyon floor is at 0.
 */

export const VOLCANO = {
  /** Where the cone meets the canyon floor. */
  base: 60,
  /** The crater's edge. */
  rim: 8,
  rimHeight: 22,
  /** The lava lake in the crater. */
  lake: 20.5,
};

/** Height of the volcano's slope at distance `r` from its middle (no crater). */
export function coneHeight(r: number): number {
  if (r >= VOLCANO.base) return 0;
  if (r <= VOLCANO.rim) return VOLCANO.lake;
  // A slightly hollow curve, like a real volcano's sides.
  return VOLCANO.rimHeight * Math.pow((VOLCANO.base - r) / (VOLCANO.base - VOLCANO.rim), 1.2);
}

/** The canyon: a flat floor with red walls that rise far from the volcano. */
export function canyonHeight(x: number, z: number): number {
  const wall = (d: number, from: number, rise: number) => (d > from ? Math.min(rise, (d - from) * 1.6) : 0);
  const zz = z - 20;
  const w = Math.max(wall(Math.abs(x), 110, 34), wall(Math.abs(zz), 150, 34));
  // A few soft bumps on the floor so it isn't perfectly flat.
  const bump = Math.sin(x * 0.07) * Math.cos(z * 0.06) * 0.6;
  return Math.max(coneHeight(Math.hypot(x, z)), w + bump);
}

/** Points along a spiral around the volcano's middle. */
function spiral(opts: { from: number; to: number; r0: number; r1: number; y0: number; y1: number; steps: number; y?: (r: number, t: number) => number }): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i <= opts.steps; i++) {
    const t = i / opts.steps;
    const a = opts.from + (opts.to - opts.from) * t;
    const r = opts.r0 + (opts.r1 - opts.r0) * t;
    const y = opts.y ? opts.y(r, t) : opts.y0 + (opts.y1 - opts.y0) * t;
    out.push(v3(Math.sin(a) * r, y, Math.cos(a) * r));
  }
  return out;
}

export interface TestTrack {
  graph: TrackGraph;
  specs: PathSpec[];
  forks: ForkSpec[];
  /** Speed pads: a path and a distance along it. */
  boosts: Array<{ path: string; s: number }>;
  /** The question gate on the vent. */
  gate: { path: string; s: number };
  /** The fork's id. */
  fork: string;
}

export function buildTestTrack(): TestTrack {
  const kinds = (n: number, k: TrackKind): TrackKind[] => new Array(n).fill(k);

  // The vent: from the magma chamber up to the fork, with gentle S-bends.
  const ventPts = [v3(0, -18, 122), v3(0, -17.6, 112), v3(4, -16, 100), v3(-3, -13.5, 82), v3(2.5, -10.5, 62), v3(0, -8.6, 48), v3(0, -8, 40)];
  const vent: PathSpec = {
    id: 'vent',
    points: ventPts,
    width: [9, 8, 7, 7, 7, 9, 11],
    kind: 'tunnel',
    next: 'fork:top',
  };

  // Left: stay deep. A long, winding tunnel through crystal caves (gently downhill).
  const deepPts = [
    v3(-3, -8, 40),
    v3(-5, -8.1, 33),
    v3(-14, -8.5, 28),
    v3(-28, -9, 28),
    v3(-40, -10, 38),
    v3(-44, -11, 56),
    v3(-36, -11.6, 72),
    v3(-44, -12, 88),
    v3(-62, -12, 96),
    v3(-78, -12, 86),
    v3(-84, -12, 70),
    v3(-82, -12, 58),
  ];
  const deep: PathSpec = { id: 'deep', points: deepPts, width: [5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 9, 12], kind: 'tunnel', next: 'finish' };

  // Right: erupt. Up the volcano's throat in a spiral, across the crater's
  // lava lake, out through the gap in its rim and down the mountain.
  const throat = spiral({ from: 0.35, to: 0.35 + Math.PI * 4, r0: 13, r1: 4.5, y0: -4, y1: VOLCANO.lake - 0.2, steps: 16 });
  const a1 = 0.35 + Math.PI * 4;
  const crater = spiral({ from: a1 + 0.5, to: a1 + 1.7, r0: 5.5, r1: 9.5, y0: VOLCANO.lake - 0.2, y1: VOLCANO.lake - 0.4, steps: 3 });
  const a2 = a1 + 1.7;
  const flow = spiral({
    from: a2 + 0.45,
    to: a2 + Math.PI * 2.05,
    r0: 12,
    r1: 63,
    y0: 0,
    y1: 0,
    steps: 18,
    y: (r) => Math.max(0.25, Math.min(VOLCANO.lake - 0.6, coneHeight(r) - 0.3) + 0.2),
  });
  // Out onto the canyon floor: carry on along the last direction.
  const last = flow[flow.length - 1];
  const prev = flow[flow.length - 2];
  const dx = last.x - prev.x;
  const dz = last.z - prev.z;
  const dl = Math.hypot(dx, dz);
  const runout = [1, 2].map((i) => v3(last.x + (dx / dl) * 14 * i, 0.25, last.z + (dz / dl) * 14 * i));
  const eruptPts = [v3(3, -8, 40), v3(3, -7.4, 31), v3(2, -6, 22), ...throat, ...crater, ...flow, ...runout];
  // The throat is a tunnel until it is near the top, then an open shaft into the crater.
  const covered = throat.filter((p) => p.y < 13).length;
  const eruptKind: TrackKind[] = [...kinds(3 + covered, 'tunnel'), ...kinds(throat.length - covered + crater.length + flow.length + runout.length, 'lava')];
  const eruptWidth = eruptPts.map((_, i) => (i === 0 ? 5 : i < 3 + throat.length ? 7 : i < 3 + throat.length + crater.length ? 8 : 9));
  const erupt: PathSpec = { id: 'erupt', points: eruptPts, width: eruptWidth, kind: eruptKind, next: 'finish' };

  const forks: ForkSpec[] = [
    {
      id: 'top',
      choices: [
        { path: 'deep', offset: -3 },
        { path: 'erupt', offset: 3 },
      ],
    },
  ];
  const specs = [vent, deep, erupt];
  const graph = new TrackGraph('vent', specs, forks, 1);
  const eruptLen = graph.path('erupt').length;
  return {
    graph,
    specs,
    forks,
    // Gas pressure pushes rising magma up the throat; the lava runs fast down the slope.
    boosts: [
      { path: 'erupt', s: 34 },
      { path: 'erupt', s: 74 },
      { path: 'erupt', s: Math.round(eruptLen * 0.55) },
    ],
    gate: { path: 'vent', s: 36 },
    fork: 'top',
  };
}
