/**
 * A 3D race track made of paths that can split at forks. Pure math (no
 * drawing and no Three.js) so it can be unit tested.
 *
 * A path is a smooth curve through control points (a Catmull-Rom spline),
 * resampled so its samples are evenly spaced along its length. Each sample
 * knows its direction, how much the road is tilted sideways (the bank), how
 * hard it bends, and how wide the road is.
 *
 * Paths link up into a graph. A path ends in the next path, in a fork (two or
 * three paths that start side by side; which one you take depends on where
 * you are across the road), or at the finish line.
 *
 * Coordinates: y is up. "Right" is to the right of the direction of travel.
 * Built for Rock Cycle Racing; the ideas come from Math Race Rally's road
 * (`src/games/math-race-rally/track.ts`), which is left as it is.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const v3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z });
const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const scale = (a: Vec3, s: number): Vec3 => ({ x: a.x * s, y: a.y * s, z: a.z * s });
const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: Vec3, b: Vec3): Vec3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const len = (a: Vec3): number => Math.hypot(a.x, a.y, a.z);
const norm = (a: Vec3): Vec3 => {
  const l = len(a) || 1;
  return scale(a, 1 / l);
};
const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => add(a, scale(sub(b, a), t));
export const vec = { add, sub, scale, dot, cross, len, norm, lerp };

/** What kind of ground a stretch of track is (it changes how it is drawn). */
export type TrackKind = 'tunnel' | 'surface' | 'lava';

export interface PathSpec {
  id: string;
  points: Vec3[];
  /** Road width at each control point (or one width for all). */
  width: number | number[];
  /**
   * Sideways tilt at each control point, in radians; positive means the
   * right side is lower. Leave it out to bank the curves automatically.
   */
  bank?: number[];
  /** How the stretch is drawn, per control point (or one kind for all). */
  kind?: TrackKind | TrackKind[];
  /** Where the path leads: another path's id, `fork:<id>`, or `finish`. */
  next: string;
}

export interface ForkChoice {
  path: string;
  /** How far right of the fork point this path starts (world units). */
  offset: number;
}

export interface ForkSpec {
  id: string;
  choices: ForkChoice[];
}

export interface Sample {
  p: Vec3;
  /** Unit direction of travel. */
  t: Vec3;
  /** Distance from the start of the path. */
  d: number;
  width: number;
  bank: number;
  kind: TrackKind;
}

/** Everything about one place on a path. */
export interface Frame {
  pos: Vec3;
  tangent: Vec3;
  /** Unit vector across the road to the right (tilted by the bank). */
  right: Vec3;
  /** Unit vector straight up from the road surface. */
  up: Vec3;
  bank: number;
  /** The slope: the sine of the angle up (positive) or down (negative). */
  grade: number;
  /** How hard the road turns, per world unit; positive turns right. */
  curve: number;
  halfWidth: number;
  kind: TrackKind;
}

const UP: Vec3 = { x: 0, y: 1, z: 0 };

function catmull(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y), z: f(p0.z, p1.z, p2.z, p3.z) };
}

const perPoint = <T>(v: T | T[], i: number): T => (Array.isArray(v) ? v[Math.min(i, v.length - 1)] : v);

/** The signed turn between two directions, as seen from above (positive = right). */
function turn(a: Vec3, b: Vec3): number {
  const c = cross(a, b).y;
  return -Math.atan2(c, a.x * b.x + a.z * b.z);
}

export class TrackPath {
  readonly samples: Sample[] = [];
  readonly length: number;
  /** Turn per unit at each sample (positive = right). */
  private readonly curves: number[] = [];

  constructor(
    readonly spec: PathSpec,
    readonly step = 1,
  ) {
    const pts = spec.points;
    if (pts.length < 2) throw new Error(`path ${spec.id} needs two points`);
    // A dense first pass along the spline, with distances.
    const dense: Array<{ p: Vec3; seg: number; u: number }> = [];
    const per = 24;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      // Mirror the ends so the curve leaves the first point straight.
      const a = i === 0 ? sub(scale(pts[0], 2), pts[1]) : p0;
      const d = i + 2 > pts.length - 1 ? sub(scale(pts[pts.length - 1], 2), pts[pts.length - 2]) : p3;
      for (let k = 0; k < per; k++) dense.push({ p: catmull(a, pts[i], pts[i + 1], d, k / per), seg: i, u: k / per });
    }
    dense.push({ p: pts[pts.length - 1], seg: pts.length - 2, u: 1 });
    const dist = [0];
    for (let i = 1; i < dense.length; i++) dist.push(dist[i - 1] + len(sub(dense[i].p, dense[i - 1].p)));
    this.length = dist[dist.length - 1];
    // Even samples every `step`.
    const n = Math.max(2, Math.ceil(this.length / step) + 1);
    let j = 0;
    for (let i = 0; i < n; i++) {
      const d = Math.min(this.length, (i * this.length) / (n - 1));
      while (j < dist.length - 2 && dist[j + 1] < d) j++;
      const span = dist[j + 1] - dist[j] || 1;
      const f = (d - dist[j]) / span;
      const p = lerp(dense[j].p, dense[j + 1].p, f);
      const seg = dense[j].seg;
      const u = dense[j].u + (dense[j + 1].u - dense[j].u + (dense[j + 1].seg - seg)) * f;
      const width = mix(perPoint(spec.width, seg), perPoint(spec.width, seg + 1), u);
      const kindAt = perPoint(spec.kind ?? 'surface', Math.round(seg + u));
      this.samples.push({ p, t: UP, d, width, bank: 0, kind: kindAt });
    }
    // Directions and turning.
    for (let i = 0; i < this.samples.length; i++) {
      const a = this.samples[Math.max(0, i - 1)].p;
      const b = this.samples[Math.min(this.samples.length - 1, i + 1)].p;
      this.samples[i].t = norm(sub(b, a));
    }
    for (let i = 0; i < this.samples.length; i++) {
      const a = this.samples[Math.max(0, i - 2)];
      const b = this.samples[Math.min(this.samples.length - 1, i + 2)];
      const ds = b.d - a.d || 1;
      this.curves.push(turn(a.t, b.t) / ds);
    }
    // Banks: given per control point, or tilted into the turn automatically.
    for (let i = 0; i < this.samples.length; i++) {
      const s = this.samples[i];
      if (spec.bank) {
        const seg = Math.min(pts.length - 2, Math.floor((i / (this.samples.length - 1)) * (pts.length - 1)));
        const u = (i / (this.samples.length - 1)) * (pts.length - 1) - seg;
        s.bank = mix(perPoint(spec.bank, seg), perPoint(spec.bank, seg + 1), u);
      } else {
        // Smooth the turn a little and lean into it, up to about 17 degrees.
        let c = 0;
        let w = 0;
        for (let k = -4; k <= 4; k++) {
          const q = this.curves[Math.min(this.curves.length - 1, Math.max(0, i + k))];
          c += q;
          w++;
        }
        s.bank = clamp((c / w) * 9, -0.3, 0.3);
      }
    }
  }

  /** The frame at distance `s` along the path (clamped to the path). */
  at(s: number): Frame {
    const d = clamp(s, 0, this.length);
    const f = (d / this.length) * (this.samples.length - 1);
    const i = Math.min(this.samples.length - 2, Math.floor(f));
    const u = f - i;
    const a = this.samples[i];
    const b = this.samples[i + 1];
    const pos = lerp(a.p, b.p, u);
    const tangent = norm(lerp(a.t, b.t, u));
    const bank = mix(a.bank, b.bank, u);
    const flatRight = norm(cross(tangent, UP));
    const flatUp = norm(cross(flatRight, tangent));
    // Tilt right and up around the direction of travel: positive bank lowers the right side.
    const c = Math.cos(bank);
    const sn = Math.sin(bank);
    const right = norm(add(scale(flatRight, c), scale(flatUp, -sn)));
    const up = norm(add(scale(flatUp, c), scale(flatRight, sn)));
    return {
      pos,
      tangent,
      right,
      up,
      bank,
      grade: tangent.y,
      curve: mix(this.curves[i], this.curves[i + 1], u),
      halfWidth: mix(a.width, b.width, u) / 2,
      kind: u < 0.5 ? a.kind : b.kind,
    };
  }

  /** A point on the road: `x` across (right is positive) and `h` above it. */
  point(s: number, x = 0, h = 0): Vec3 {
    const f = this.at(s);
    return add(add(f.pos, scale(f.right, x)), scale(f.up, h));
  }
}

export type Next = { kind: 'path'; path: string } | { kind: 'fork'; fork: ForkSpec } | { kind: 'finish' };

/** All the paths and forks of one track. */
export class TrackGraph {
  readonly paths = new Map<string, TrackPath>();
  readonly forks = new Map<string, ForkSpec>();
  /** For each path, the path before it and its offset at a fork. */
  private readonly before = new Map<string, { path: string; offset: number }>();

  constructor(
    readonly start: string,
    paths: PathSpec[],
    forks: ForkSpec[] = [],
    step = 1,
  ) {
    for (const p of paths) this.paths.set(p.id, new TrackPath(p, step));
    for (const f of forks) this.forks.set(f.id, f);
    for (const p of paths) {
      const n = this.next(p.id);
      if (n.kind === 'path') this.before.set(n.path, { path: p.id, offset: 0 });
      if (n.kind === 'fork') for (const c of n.fork.choices) this.before.set(c.path, { path: p.id, offset: c.offset });
    }
    if (!this.paths.has(start)) throw new Error(`no start path ${start}`);
  }

  path(id: string): TrackPath {
    const p = this.paths.get(id);
    if (!p) throw new Error(`no path ${id}`);
    return p;
  }

  next(id: string): Next {
    const n = this.path(id).spec.next;
    if (n === 'finish') return { kind: 'finish' };
    if (n.startsWith('fork:')) {
      const fork = this.forks.get(n.slice(5));
      if (!fork) throw new Error(`no fork ${n}`);
      return { kind: 'fork', fork };
    }
    if (!this.paths.has(n)) throw new Error(`path ${id} leads to missing path ${n}`);
    return { kind: 'path', path: n };
  }

  /** The path before this one, if any (and how far right this one started). */
  previous(id: string): { path: string; offset: number } | undefined {
    return this.before.get(id);
  }

  /** At a fork, the choice nearest to `x` (the racer's place across the road). */
  pick(fork: ForkSpec, x: number): ForkChoice {
    let best = fork.choices[0];
    for (const c of fork.choices) if (Math.abs(c.offset - x) < Math.abs(best.offset - x)) best = c;
    return best;
  }

  /**
   * A point at distance `s` along `path`, where `s` may be below zero: then
   * it is looked up on the path before (used by the chase camera).
   */
  pointBack(path: string, s: number, x = 0, h = 0): Vec3 {
    let id = path;
    let d = s;
    let xx = x;
    while (d < 0) {
      const prev = this.previous(id);
      if (!prev) break;
      xx += prev.offset;
      id = prev.path;
      d += this.path(id).length;
    }
    return this.path(id).point(Math.max(0, d), xx, h);
  }

  /** Every way from the start to the finish, as lists of path ids. */
  routes(): string[][] {
    const out: string[][] = [];
    const walk = (id: string, seen: string[]) => {
      if (seen.includes(id)) throw new Error(`track loops back to ${id}`);
      const here = [...seen, id];
      const n = this.next(id);
      if (n.kind === 'finish') out.push(here);
      else if (n.kind === 'path') walk(n.path, here);
      else for (const c of n.fork.choices) walk(c.path, here);
    };
    walk(this.start, []);
    return out;
  }

  /** The total length of a route. */
  routeLength(route: string[]): number {
    return route.reduce((t, id) => t + this.path(id).length, 0);
  }
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
