/**
 * Number Line Ninja: every challenge, generated from a seed so the same seed
 * always gives the same challenge (for tests, and so a reload replays the
 * challenge on screen). Pure functions only: no DOM, no Three.js.
 *
 * Five belts, each with three difficulty tiers chosen by the learner model:
 *
 *   white  Find it      locate a number using landmark labels      0–20   (1.NBT.1, 2.MD.6)
 *   yellow Hop forward  add by counting on                         0–20   (1.OA.5, 1.OA.6)
 *   orange Hop back     subtract by counting back                  0–20   (1.OA.5, 1.OA.6)
 *   green  Big hops     add/subtract with tens and ones            0–100  (2.NBT.5, 2.MD.6)
 *   black  Mystery gap  how far from one number to another         0–100  (1.OA.8, 2.OA.1, 2.MD.6)
 */

export const BELTS = ['white', 'yellow', 'orange', 'green', 'black'] as const;
export type BeltId = (typeof BELTS)[number];

export type Kind = 'find' | 'add' | 'sub' | 'tens' | 'gap';

/** Which stones show their number. The start stone is always labelled. */
export type Labels = 'all' | 'fives' | 'tens';

export interface Problem {
  belt: BeltId;
  kind: Kind;
  tier: number;
  /** The last stone (the line runs 0..lineMax). */
  lineMax: 20 | 100;
  start: number;
  /** The stone the ninja should land on. */
  target: number;
  /** target - start (negative when hopping back). */
  change: number;
  labels: Labels;
  /** The big hop size offered besides 1 (0 = only single hops). */
  bigHop: 0 | 5 | 10;
  /** Number sentence shown on the card, e.g. "8 + 3 = ?". */
  equation: string;
  /** What to do, in a few words, e.g. "Start at 8. Hop forward 3." */
  prompt: string;
}

// ------------------------------------------------------------------ seeded random

export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

// ------------------------------------------------------------------ generators

export function makeProblem(belt: BeltId, tier: number, seed: number): Problem {
  const r = rng(seed);
  const t = Math.min(3, Math.max(1, Math.round(tier)));
  switch (belt) {
    case 'white':
      return find(r, t);
    case 'yellow':
      return addSub(r, t, 1);
    case 'orange':
      return addSub(r, t, -1);
    case 'green':
      return tens(r, t);
    case 'black':
      return gap(r, t);
  }
}

/** White belt: hop from 0 to a number whose label is hidden. */
function find(r: () => number, tier: number): Problem {
  let target: number;
  let labels: Labels;
  if (tier === 1) {
    labels = 'fives';
    do target = int(r, 1, 10);
    while (target % 5 === 0);
  } else if (tier === 2) {
    labels = 'fives';
    do target = int(r, 11, 19);
    while (target % 5 === 0);
  } else {
    labels = 'tens';
    do target = int(r, 2, 19);
    while (target % 10 === 0 || target % 5 === 0);
  }
  return {
    belt: 'white',
    kind: 'find',
    tier,
    lineMax: 20,
    start: 0,
    target,
    change: target,
    labels,
    bigHop: tier === 3 ? 10 : 5,
    equation: `Find ${target}`,
    prompt: `Hop to stone ${target}, then land.`,
  };
}

/** Yellow (dir 1) and orange (dir -1) belts: count on or back within 20. */
function addSub(r: () => number, tier: number, dir: 1 | -1): Problem {
  let a: number;
  let b: number;
  if (tier === 1) {
    b = int(r, 1, 4);
    a = dir > 0 ? int(r, 0, 10) : int(r, b + 1, 12);
  } else if (tier === 2) {
    // within 20, staying on one side of 10
    b = int(r, 3, 6);
    if (r() < 0.5) a = dir > 0 ? int(r, 0, 9 - b) : int(r, b + 1, 9);
    else a = dir > 0 ? int(r, 11, 19 - b) : int(r, 11 + b, 19);
  } else {
    // crossing ten: the "make a ten" step
    b = int(r, 3, 9);
    if (dir > 0) a = int(r, Math.max(1, 11 - b), 9);
    else a = int(r, 11, Math.min(19, 9 + b));
  }
  const target = a + dir * b;
  const sign = dir > 0 ? '+' : '−';
  return {
    belt: dir > 0 ? 'yellow' : 'orange',
    kind: dir > 0 ? 'add' : 'sub',
    tier,
    lineMax: 20,
    start: a,
    target,
    change: dir * b,
    labels: tier === 1 ? 'all' : 'fives',
    bigHop: 0,
    equation: `${a} ${sign} ${b} = ?`,
    prompt: `Start at ${a}. Hop ${dir > 0 ? 'forward' : 'back'} ${b}.`,
  };
}

/** Green belt: tens and ones on a 0–100 line. */
function tens(r: () => number, tier: number): Problem {
  let a: number;
  let b: number;
  let dir: 1 | -1 = 1;
  if (tier === 1) {
    b = 10 * int(r, 1, 3);
    dir = r() < 0.7 ? 1 : -1;
    a = dir > 0 ? int(r, 1, 99 - b) : int(r, b + 1, 99);
  } else if (tier === 2) {
    // two-digit, no crossing a ten in the ones
    const bt = int(r, 1, 3);
    const bo = int(r, 1, 6);
    b = bt * 10 + bo;
    dir = r() < 0.7 ? 1 : -1;
    if (dir > 0) {
      const ao = int(r, 0, 9 - bo);
      const at = int(r, 1, 8 - bt);
      a = at * 10 + ao;
    } else {
      const ao = int(r, bo, 9);
      const at = int(r, bt + 1, 9);
      a = at * 10 + ao;
    }
  } else {
    // crossing a ten: 47 + 16, 72 − 25
    const bt = int(r, 1, 3);
    const bo = int(r, 3, 9);
    b = bt * 10 + bo;
    dir = r() < 0.6 ? 1 : -1;
    if (dir > 0) {
      const ao = int(r, 10 - bo, 9);
      const at = int(r, 1, 8 - bt - 1);
      a = at * 10 + ao;
    } else {
      const ao = int(r, 0, bo - 1);
      const at = int(r, bt + 1, 9);
      a = at * 10 + ao;
    }
  }
  const target = a + dir * b;
  return {
    belt: 'green',
    kind: 'tens',
    tier,
    lineMax: 100,
    start: a,
    target,
    change: dir * b,
    labels: 'tens',
    bigHop: 10,
    equation: `${a} ${dir > 0 ? '+' : '−'} ${b} = ?`,
    prompt: `Start at ${a}. Hop ${dir > 0 ? 'forward' : 'back'} ${b}.`,
  };
}

/** Black belt: hop from the start to the flag, then say how far it was. */
function gap(r: () => number, tier: number): Problem {
  let a: number;
  let t: number;
  let lineMax: 20 | 100 = 100;
  if (tier === 1) {
    lineMax = 20;
    a = int(r, 1, 12);
    t = a + int(r, 3, 8);
  } else if (tier === 2) {
    a = int(r, 11, 60);
    t = a + int(r, 12, 35);
  } else {
    a = int(r, 20, 90);
    const d = int(r, 13, 38);
    t = (r() < 0.5 || a + d > 99) && a - d >= 1 ? a - d : a + d;
  }
  return {
    belt: 'black',
    kind: 'gap',
    tier,
    lineMax,
    start: a,
    target: t,
    change: t - a,
    labels: lineMax === 20 ? 'fives' : 'tens',
    bigHop: lineMax === 20 ? 5 : 10,
    equation: t > a ? `${a} + ? = ${t}` : `${a} − ? = ${t}`,
    prompt: `Hop from ${a} to the flag on ${t}. How far is it?`,
  };
}

// ------------------------------------------------------------------ checking

/** Short ids for the ideas behind wrong answers. The game explains each one. */
export type Misconception =
  | 'counted-start' // counted the stone you started on as a hop (lands one short)
  | 'one-off' // miscounted by one
  | 'wrong-way' // hopped forward for take-away, or back for add
  | 'tens-as-ones' // hopped 2 for 20 (place value)
  | 'ten-off' // one big hop too many or too few
  | 'landmark' // counted from the wrong landmark (off by 5 or 10)
  | 'reversed' // 41 for 14
  | 'no-hop' // landed without moving
  | 'other';

export interface Check {
  correct: boolean;
  misconception: Misconception | null;
}

const reverse = (n: number) => Number(String(n).split('').reverse().join(''));

/** Where did the ninja land, and what idea might explain a wrong landing? */
export function checkLanding(p: Problem, landed: number): Check {
  if (landed === p.target) return { correct: true, misconception: null };
  return { correct: false, misconception: diagnose(p, landed) };
}

export function diagnose(p: Problem, landed: number): Misconception {
  const { start, target, change } = p;
  const size = Math.abs(change);
  const dir = Math.sign(change) || 1;
  if (landed === start) return 'no-hop';
  if (p.kind !== 'find' && p.kind !== 'gap' && landed === start - change) return 'wrong-way';
  if (p.kind === 'tens') {
    const tensDigit = Math.floor(size / 10);
    const ones = size % 10;
    if (tensDigit > 0 && (landed === start + dir * (tensDigit + ones) || landed === start + dir * tensDigit)) return 'tens-as-ones';
    if (Math.abs(landed - target) === 10) return 'ten-off';
    if (target >= 10 && landed === reverse(target) && landed !== target) return 'reversed';
  }
  if (landed === target - dir) return p.kind === 'find' || p.kind === 'gap' ? 'one-off' : 'counted-start';
  if (Math.abs(landed - target) === 1) return 'one-off';
  if (p.kind === 'find' && (Math.abs(landed - target) === 5 || Math.abs(landed - target) === 10)) return 'landmark';
  if (target >= 10 && landed === reverse(target)) return 'reversed';
  return 'other';
}

// ------------------------------------------------------------------ the "how far?" question

export interface GapOption {
  value: number;
  correct: boolean;
  misconception?: 'added-numbers' | 'counted-stones' | 'counted-hops' | 'one-off';
}

/**
 * Choices for "How far was it?" after a black-belt hop. Wrong choices come
 * from real mistakes: adding the two numbers, counting stones instead of
 * spaces, or counting how many hops instead of how far.
 */
export function gapOptions(p: Problem, hops: number[], seed: number): GapOption[] {
  const d = Math.abs(p.change);
  const opts: GapOption[] = [{ value: d, correct: true }];
  const add = (value: number, misconception: GapOption['misconception']) => {
    if (value > 0 && value <= 200 && !opts.some((o) => o.value === value)) opts.push({ value, correct: false, misconception });
  };
  add(p.start + p.target, 'added-numbers');
  add(d + 1, 'counted-stones');
  if (hops.length) add(hops.length, 'counted-hops');
  add(d - 1, 'one-off');
  add(d + 10, 'one-off');
  const three = opts.slice(0, 3);
  // Shuffle with the seed so the right answer is not always first.
  const r = rng(seed);
  for (let i = three.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [three[i], three[j]] = [three[j], three[i]];
  }
  return three;
}

/** Which stones show a number for this problem. */
export function isLabelled(p: Problem, n: number): boolean {
  if (n === p.start) return true;
  if (p.labels === 'all') return true;
  if (p.labels === 'fives') return n % 5 === 0;
  return n % 10 === 0;
}

/**
 * The hops a worked example uses: big hops first, then ones. For crossing
 * ten on the 0–20 line, the worked example hops to 10 first ("make a ten").
 */
export function workedHops(p: Problem): number[] {
  const dir = Math.sign(p.change) || 1;
  let left = Math.abs(p.change);
  const hops: number[] = [];
  if (p.lineMax === 20 && (p.kind === 'add' || p.kind === 'sub') && p.tier === 3) {
    // make a ten: hop to 10 first, one at a time, then the rest
    const toTen = Math.abs(10 - p.start);
    for (let i = 0; i < toTen; i++) hops.push(dir);
    left -= toTen;
  } else if (p.bigHop) {
    while (left >= p.bigHop) {
      hops.push(dir * p.bigHop);
      left -= p.bigHop;
    }
  }
  for (let i = 0; i < left; i++) hops.push(dir);
  return hops;
}
