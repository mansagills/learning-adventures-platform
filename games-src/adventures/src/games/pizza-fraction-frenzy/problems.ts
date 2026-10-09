/**
 * Forum Fraction Feast: the fraction math, as pure functions (no drawing, no
 * timers) so every rule can be unit tested.
 *
 * Each job in the forum practises one skill, with three levels:
 *
 *   Bakery (Livia), grades 2-3, equal shares and naming fractions (2.G.3, 3.NF.1)
 *     1. fair shares: which loaf is cut fairly, and what the pieces are called
 *     2. name the part eaten or left (Anser the goose steals pieces), and sharing
 *     3. the whole (4/4 is one loaf), building the whole from one piece, a/b as a pieces of 1/b
 *   Milestone road (Marcus), grade 3, fractions on a number line (3.NF.2)
 *     1. unit fractions (1/2, 1/3, 1/4) between milestone 0 and milestone 1
 *     2. other fractions (3/4, 5/8, 2/6)
 *     3. a road to milestone 2: fractions past 1 (5/4, 3/2) and 4/4 at milestone 1
 *
 * Wrong answers are made from real mistakes (eaten over left instead of over
 * all the pieces, counting posts instead of stretches, the fraction upside
 * down), so a wrong pick tells the game which idea to explain.
 */

export type Station = 'bakery' | 'road';
/** The jobs built so far (half 1). The market stall and the mosaic join in half 2. */
export const STATIONS: Station[] = ['bakery', 'road'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'unequal-parts' // calls pieces "fourths" when they are not the same size
  | 'wrong-count' // equal pieces, but not the number of pieces asked for
  | 'counted-cuts' // counted the cut lines instead of the pieces
  | 'part-over-part' // eaten over left (2/6) instead of eaten over all the pieces (2/8)
  | 'eaten-left-swap' // gave what is left when asked what was eaten, or the other way round
  | 'upside-down' // 8/2 for 2/8
  | 'whole-not-one' // does not see 4/4 as one whole loaf
  | 'gave-whole' // each friend gets the whole loaf (k/k)
  | 'unit-only' // only thinks about one piece (1/b) when the fraction is a/b
  | 'denominator-count' // thinks the bottom number says how many pieces you have
  | 'start-at-one' // counted the first post as 1, so landed one stretch short
  | 'count-posts' // counted the posts, not the stretches between them
  | 'off-by-one' // one piece or one stretch too many
  | 'from-end' // counted from the wrong end of the road
  | 'whole-at-end' // put 4/4 at the end of the road instead of at milestone 1
  | 'whole-road' // used the whole road (0 to 2) as the whole (named 5/4 as 5/8)
  | 'past-one-only' // counted only the part past milestone 1 (5/4 put at 1/4)
  | 'other';

export interface Frac {
  n: number;
  d: number;
}

export const fstr = (f: Frac) => `${f.n}/${f.d}`;

/** "halves", "thirds", "fourths" ... (or one "half", "third", "fourth"). */
export function partName(d: number, plural = true): string {
  const one: Record<number, string> = { 1: 'whole', 2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 8: 'eighth', 10: 'tenth', 12: 'twelfth' };
  const many: Record<number, string> = { 1: 'wholes', 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths', 12: 'twelfths' };
  return (plural ? many[d] : one[d]) ?? `${d}ths`;
}

/** A loaf picture: round loaves are cut into wedges, long loaves into slices. */
export interface Loaf {
  shape: 'round' | 'long';
  /** Relative size of each piece (all 1 when the loaf is cut fairly). */
  sizes: number[];
  /** Pieces that are gone (eaten by Anser or by a customer). */
  gone: number[];
  /** Pieces drawn with a glow (the part the question is about). */
  shaded: number[];
}

export interface Choice {
  /** A unique key ("3/4", "fair", "post-5"). */
  value: string;
  label: string;
  correct: boolean;
  misconception?: Misconception;
  /** A loaf picture for picture choices. */
  loaf?: Loaf;
}

/** The road between milestones: `stretches` equal stretches between milestone 0 and 1, and `end` milestones in all. */
export interface Road {
  d: number;
  end: 1 | 2;
  /** Post index of the marker already on the road (for "what fraction is this?"). */
  marker?: number;
}

export type BakeryProblem =
  | { kind: 'fair'; station: 'bakery'; tier: Tier; d: number; choices: Choice[] }
  | { kind: 'name-cut'; station: 'bakery'; tier: Tier; d: number; loaf: Loaf; choices: Choice[] }
  | { kind: 'eaten' | 'left'; station: 'bakery'; tier: Tier; d: number; a: number; loaf: Loaf; choices: Choice[] }
  | { kind: 'share'; station: 'bakery'; tier: Tier; d: number; loaf: Loaf; choices: Choice[] }
  | { kind: 'whole'; station: 'bakery'; tier: Tier; d: number; loaf: Loaf; choices: Choice[] }
  | { kind: 'build'; station: 'bakery'; tier: Tier; d: number; loaf: Loaf; choices: Choice[] }
  | { kind: 'unit-count'; station: 'bakery'; tier: Tier; d: number; n: number; loaf: Loaf; choices: Choice[] };

export type RoadProblem =
  | { kind: 'place'; station: 'road'; tier: Tier; target: Frac; road: Road; choices: Choice[] }
  | { kind: 'name'; station: 'road'; tier: Tier; target: Frac; road: Road; choices: Choice[] };

export type Problem = BakeryProblem | RoadProblem;

type Rand = () => number;
const pick = <T>(r: Rand, list: readonly T[]): T => list[Math.floor(r() * list.length) % list.length];
const ones = (n: number) => Array.from({ length: n }, () => 1);
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

function shuffle<T>(r: Rand, list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Keep the first choice for each value (the correct one goes first), then shuffle. */
function finish(r: Rand, list: Choice[], max: number): Choice[] {
  const seen = new Set<string>();
  const out: Choice[] = [];
  for (const c of list) {
    if (seen.has(c.value) || out.length >= max) continue;
    seen.add(c.value);
    out.push(c);
  }
  return shuffle(r, out);
}

const fracChoice = (n: number, d: number, correct: boolean, misconception?: Misconception): Choice => ({
  value: `${n}/${d}`,
  label: `${n}/${d}`,
  correct,
  misconception: correct ? undefined : misconception,
});

const numChoice = (v: number, correct: boolean, misconception?: Misconception): Choice => ({
  value: String(v),
  label: String(v),
  correct,
  misconception: correct ? undefined : misconception,
});

/** Sizes for an unfair cut into `d` pieces: some pieces clearly bigger than others. */
export function unequalSizes(r: Rand, d: number): number[] {
  const patterns: Record<number, number[][]> = {
    2: [
      [1, 2],
      [2, 3],
    ],
    3: [
      [1, 1, 2],
      [1, 2, 3],
    ],
    4: [
      [1, 1, 2, 2],
      [1, 2, 2, 3],
      [2, 1, 1, 3],
    ],
  };
  const list = patterns[d] ?? [[...ones(d - 1), 3]];
  return shuffle(r, pick(r, list));
}

// ------------------------------------------------------------ the bakery

export function makeBakery(tier: Tier, r: Rand): BakeryProblem {
  if (tier === 1) {
    const d = pick(r, [2, 3, 4]);
    if (r() < 0.55) {
      const shape = pick(r, ['round', 'long'] as const);
      const fair: Loaf = { shape, sizes: ones(d), gone: [], shaded: [] };
      const unfair: Loaf = { shape, sizes: unequalSizes(r, d), gone: [], shaded: [] };
      const other = d === 2 ? 3 : pick(r, [d - 1, d + 1]);
      const wrongCount: Loaf = { shape, sizes: ones(other), gone: [], shaded: [] };
      const choices = finish(
        r,
        [
          { value: 'fair', label: `${d} equal pieces`, correct: true, loaf: fair },
          { value: 'unfair', label: `${d} pieces, not the same size`, correct: false, misconception: 'unequal-parts', loaf: unfair },
          { value: 'count', label: `${other} equal pieces`, correct: false, misconception: 'wrong-count', loaf: wrongCount },
        ],
        3,
      );
      return { kind: 'fair', station: 'bakery', tier, d, choices };
    }
    // a long loaf cut into slices: d pieces, but only d - 1 cuts
    const dd = pick(r, [3, 4]);
    const loaf: Loaf = { shape: 'long', sizes: ones(dd), gone: [], shaded: [] };
    const choices = finish(
      r,
      [
        { value: partName(dd), label: partName(dd), correct: true },
        { value: partName(dd - 1), label: partName(dd - 1), correct: false, misconception: 'counted-cuts' },
        { value: partName(dd + 1), label: partName(dd + 1), correct: false, misconception: 'wrong-count' },
      ],
      3,
    );
    return { kind: 'name-cut', station: 'bakery', tier, d: dd, loaf, choices };
  }

  if (tier === 2) {
    const roll = r();
    if (roll < 0.18) {
      // friends share a loaf equally
      const k = pick(r, [2, 3, 4, 6]);
      const loaf: Loaf = { shape: 'round', sizes: ones(k), gone: [], shaded: [0] };
      const choices = finish(
        r,
        [fracChoice(1, k, true), fracChoice(k, 1, false, 'upside-down'), fracChoice(k, k, false, 'gave-whole'), fracChoice(1, k + 1, false, 'off-by-one')],
        4,
      );
      return { kind: 'share', station: 'bakery', tier, d: k, loaf, choices };
    }
    const d = pick(r, [3, 4, 6, 8]);
    const a = 1 + Math.floor(r() * (d - 1));
    const kind = r() < 0.5 ? 'eaten' : 'left';
    const left = d - a;
    const loaf: Loaf = { shape: 'round', sizes: ones(d), gone: range(0, a - 1), shaded: kind === 'left' ? range(a, d - 1) : [] };
    const right = kind === 'eaten' ? a : left;
    const other = kind === 'eaten' ? left : a;
    const choices = finish(
      r,
      [
        fracChoice(right, d, true),
        fracChoice(right, other, false, 'part-over-part'),
        fracChoice(other, d, false, 'eaten-left-swap'),
        fracChoice(d, right, false, 'upside-down'),
        fracChoice(right + 1 <= d ? right + 1 : right - 1, d, false, 'off-by-one'),
      ],
      4,
    );
    return { kind, station: 'bakery', tier, d, a, loaf, choices };
  }

  const d = pick(r, [3, 4, 6, 8]);
  const roll = r();
  if (roll < 0.34) {
    const loaf: Loaf = { shape: 'round', sizes: ones(d), gone: [], shaded: [] };
    const choices = finish(r, [fracChoice(d, d, true), fracChoice(1, d, false, 'whole-not-one'), fracChoice(0, d, false, 'eaten-left-swap'), fracChoice(d, 1, false, 'upside-down')], 4);
    return { kind: 'whole', station: 'bakery', tier, d, loaf, choices };
  }
  if (roll < 0.67) {
    // one piece on its own: how many like it make the loaf?
    const loaf: Loaf = { shape: 'round', sizes: ones(d), gone: range(1, d - 1), shaded: [0] };
    const choices = finish(r, [numChoice(d, true), numChoice(1, false, 'unit-only'), numChoice(d - 1, false, 'counted-cuts'), numChoice(d + 1, false, 'off-by-one')], 4);
    return { kind: 'build', station: 'bakery', tier, d, loaf, choices };
  }
  const n = 2 + Math.floor(r() * (d - 2));
  const loaf: Loaf = { shape: 'round', sizes: ones(d), gone: [], shaded: range(0, n - 1) };
  const choices = finish(r, [numChoice(n, true), numChoice(d, false, 'denominator-count'), numChoice(1, false, 'unit-only'), numChoice(n + 1, false, 'off-by-one')], 4);
  return { kind: 'unit-count', station: 'bakery', tier, d, n, loaf, choices };
}

// ------------------------------------------------------------ the milestone road

/** Number of posts on a road (one at each end of every stretch). */
export const postCount = (road: Road) => road.d * road.end + 1;

/** Which mistake puts the marker for `target` at post `k`? */
export function postMistake(target: Frac, road: Road, k: number): Misconception {
  const { n, d } = target;
  if (k === n - 1) return 'start-at-one';
  if (road.end === 2 && n === d && k === 2 * d) return 'whole-at-end';
  if (n > d && k === n - d) return 'past-one-only';
  if (k === n + 1) return 'off-by-one';
  if (k === d * road.end - n) return 'from-end';
  return 'count-posts';
}

export function makeRoad(tier: Tier, r: Rand): RoadProblem {
  let target: Frac;
  let road: Road;
  if (tier === 1) {
    const d = pick(r, [2, 3, 4]);
    target = { n: 1, d };
    road = { d, end: 1 };
  } else if (tier === 2) {
    const d = pick(r, [3, 4, 6, 8]);
    target = { n: 2 + Math.floor(r() * (d - 2)), d };
    road = { d, end: 1 };
  } else {
    const d = pick(r, [2, 3, 4]);
    // past 1 most of the time, and sometimes the whole (4/4 belongs at milestone 1)
    const n = r() < 0.2 ? d : d + 1 + Math.floor(r() * (d - 1));
    target = { n, d };
    road = { d, end: 2 };
  }

  if (r() < 0.55) {
    // put the marker on the road: every post is a choice
    const choices = range(0, postCount(road) - 1).map<Choice>((k) => ({
      value: `post-${k}`,
      label: `post ${k}`,
      correct: k === target.n,
      misconception: k === target.n ? undefined : postMistake(target, road, k),
    }));
    return { kind: 'place', station: 'road', tier, target, road, choices };
  }

  // the marker is on the road: what fraction is it at?
  const { n, d } = target;
  const posts = postCount(road);
  const list: Choice[] = [
    fracChoice(n, d, true),
    road.end === 2 ? fracChoice(n, 2 * d, false, 'whole-road') : fracChoice(n, posts, false, 'count-posts'),
    fracChoice(n + 1, d, false, 'start-at-one'),
    n > d ? fracChoice(n - d, d, false, 'past-one-only') : fracChoice(d, n, false, 'upside-down'),
    fracChoice(n, posts, false, 'count-posts'),
  ];
  const choices = finish(r, list, 4);
  return { kind: 'name', station: 'road', tier, target, road: { ...road, marker: n }, choices };
}

export function makeProblem(station: Station, tier: Tier, r: Rand): Problem {
  return station === 'bakery' ? makeBakery(tier, r) : makeRoad(tier, r);
}

/** The correct choice of a problem. */
export const rightChoice = (p: Problem): Choice => p.choices.find((c) => c.correct)!;

// ------------------------------------------------------------ the Fraction Pizza Party problems

/**
 * The ten word problems from the old Fraction Pizza Party activity, kept as
 * they were (with loaves instead of pizzas). They are asked first at level 2,
 * before the made-up ones. Each one was checked: all ten answers are right.
 */
export const PARTY_PROBLEMS: Array<{ text: string; d: number; eaten: number; ask: 'eaten' | 'left' | 'share' | 'whole'; answer: string }> = [
  { text: 'Anser ate 2 slices of a loaf cut into 8 pieces. What fraction did Anser eat?', d: 8, eaten: 2, ask: 'eaten', answer: '2/8' },
  { text: 'Half of the loaf is gone! It was cut into 8 pieces. What fraction is left?', d: 8, eaten: 4, ask: 'left', answer: '4/8' },
  { text: 'Anser ate 3 out of 4 pieces. What fraction did Anser eat?', d: 4, eaten: 3, ask: 'eaten', answer: '3/4' },
  { text: '6 pieces out of 8 are eaten. What fraction is left?', d: 8, eaten: 6, ask: 'left', answer: '2/8' },
  { text: 'A loaf is cut into 6 pieces, and Anser eats 1. What fraction did Anser eat?', d: 6, eaten: 1, ask: 'eaten', answer: '1/6' },
  { text: 'Three friends share a loaf equally. What fraction does each friend get?', d: 3, eaten: 0, ask: 'share', answer: '1/3' },
  { text: '5 out of 8 pieces are eaten. What fraction is left?', d: 8, eaten: 5, ask: 'left', answer: '3/8' },
  { text: 'A whole loaf is cut into 4 pieces. What fraction is the whole loaf?', d: 4, eaten: 0, ask: 'whole', answer: '4/4' },
  { text: 'Anser eats 2 pieces from a loaf cut into 6. What fraction is left?', d: 6, eaten: 2, ask: 'left', answer: '4/6' },
  { text: 'Anser eats 7 out of 8 pieces. What tiny fraction is left?', d: 8, eaten: 7, ask: 'left', answer: '1/8' },
];

/** A Fraction Pizza Party problem as a bakery problem (same choices and mistakes as the made-up ones). */
export function partyProblem(i: number, r: Rand): BakeryProblem & { text: string } {
  const q = PARTY_PROBLEMS[i % PARTY_PROBLEMS.length];
  const { d } = q;
  if (q.ask === 'share') {
    const loaf: Loaf = { shape: 'round', sizes: ones(d), gone: [], shaded: [0] };
    const choices = finish(r, [fracChoice(1, d, true), fracChoice(d, 1, false, 'upside-down'), fracChoice(d, d, false, 'gave-whole'), fracChoice(1, d + 1, false, 'off-by-one')], 4);
    return { kind: 'share', station: 'bakery', tier: 2, d, loaf, choices, text: q.text };
  }
  if (q.ask === 'whole') {
    const loaf: Loaf = { shape: 'round', sizes: ones(d), gone: [], shaded: [] };
    const choices = finish(r, [fracChoice(d, d, true), fracChoice(1, d, false, 'whole-not-one'), fracChoice(0, d, false, 'eaten-left-swap'), fracChoice(d, 1, false, 'upside-down')], 4);
    return { kind: 'whole', station: 'bakery', tier: 2, d, loaf, choices, text: q.text };
  }
  const a = q.eaten;
  const left = d - a;
  const right = q.ask === 'eaten' ? a : left;
  const other = q.ask === 'eaten' ? left : a;
  const loaf: Loaf = { shape: 'round', sizes: ones(d), gone: range(0, a - 1), shaded: q.ask === 'left' ? range(a, d - 1) : [] };
  const choices = finish(
    r,
    [
      fracChoice(right, d, true),
      fracChoice(right, other, false, 'part-over-part'),
      fracChoice(other, d, false, 'eaten-left-swap'),
      fracChoice(d, right, false, 'upside-down'),
      fracChoice(right + 1 <= d ? right + 1 : right - 1, d, false, 'off-by-one'),
    ],
    4,
  );
  return { kind: q.ask, station: 'bakery', tier: 2, d, a, loaf, choices, text: q.text };
}
