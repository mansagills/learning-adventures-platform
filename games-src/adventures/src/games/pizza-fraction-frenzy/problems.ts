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
 *   Market stall (Cornelia), grades 3-4, comparing fractions (3.NF.3d, 4.NF.2)
 *     1. same bottom number (3/8 or 5/8)
 *     2. same top number (1/4 or 1/8: more pieces means smaller pieces)
 *     3. different tops and bottoms, compared with 1/2, and pairs that are equal
 *   Mosaic (Tullia), grades 3-4, equivalent fractions (3.NF.3a-c, 4.NF.1)
 *     1. which tile strip covers the same as 1/2 (2/4, 3/6, 2/6 for 1/3 ...)
 *     2. the missing number (3/4 = ?/8) and whole numbers as fractions (4/4 = 1, 6/3 = 2)
 *     3. multiply top and bottom (2/3 = ?/12), and spot the one that is not equal
 *   Frenzy mode (the old Pizza Fraction Frenzy race): serve the loaf that shows the order
 *
 * Wrong answers are made from real mistakes (eaten over left instead of over
 * all the pieces, counting posts instead of stretches, the fraction upside
 * down), so a wrong pick tells the game which idea to explain.
 */

export type Station = 'bakery' | 'road' | 'market' | 'mosaic';
export const STATIONS: Station[] = ['bakery', 'road', 'market', 'mosaic'];
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
  | 'counted-missing' // same bottom number, but picked the one with fewer pieces (thought of the pieces missing)
  | 'bigger-denominator' // thinks a bigger bottom number means a bigger piece (1/8 > 1/4)
  | 'top-only' // compared only the top numbers (3/8 > 2/3 because 3 > 2), or read 4/4 as 4
  | 'thinks-equal' // said two different fractions are the same (same top number, or both one piece short)
  | 'looks-different' // thinks equal fractions are different because the numbers differ (2/4 and 3/6)
  | 'add-same' // added the same number to the top and bottom (1/2 = 2/3)
  | 'same-top' // changed the bottom number but kept the top (3/4 = 3/8)
  | 'half-multiply' // multiplied the bottom but not the top by the same number (2/3 = 4/12)
  | 'bottom-number' // read a whole-number fraction as its bottom number (6/3 as 3)
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

/** Cornelia's shares: two fractions of the same-size loaf to compare. */
export type MarketProblem = { kind: 'compare'; station: 'market'; tier: Tier; a: Frac; b: Frac; ask: 'bigger' | 'smaller'; choices: Choice[] };

/** Tullia's tile strips: a strip of `d` tiles with `n` colored. */
export type MosaicProblem =
  | { kind: 'match'; station: 'mosaic'; tier: Tier; target: Frac; choices: Choice[] }
  | { kind: 'missing'; station: 'mosaic'; tier: Tier; given: Frac; want: { n: number | null; d: number | null }; answer: Frac; choices: Choice[] }
  | { kind: 'whole-number'; station: 'mosaic'; tier: Tier; given: Frac; choices: Choice[] }
  | { kind: 'odd-one'; station: 'mosaic'; tier: Tier; target: Frac; choices: Choice[] };

export type Problem = BakeryProblem | RoadProblem | MarketProblem | MosaicProblem;

/** Exact comparison of two fractions: negative, zero or positive. */
export const cmp = (a: Frac, b: Frac) => a.n * b.d - b.n * a.d;
export const sameValue = (a: Frac, b: Frac) => cmp(a, b) === 0;

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

// ------------------------------------------------------------ the market stall

/** The mistake behind believing `x` is bigger than `y` (when it is not). */
export function biggerBelief(x: Frac, y: Frac): Misconception {
  if (x.d === y.d && x.n < y.n) return 'counted-missing';
  if (x.n === y.n && x.d > y.d) return 'bigger-denominator';
  if (x.n > y.n) return 'top-only';
  if (x.d > y.d) return 'bigger-denominator';
  return 'other';
}


const marketPairs: Record<Tier, Array<[Frac, Frac]>> = {
  1: [
    [{ n: 3, d: 8 }, { n: 5, d: 8 }],
    [{ n: 1, d: 4 }, { n: 3, d: 4 }],
    [{ n: 2, d: 6 }, { n: 5, d: 6 }],
    [{ n: 2, d: 3 }, { n: 1, d: 3 }],
    [{ n: 7, d: 8 }, { n: 4, d: 8 }],
    [{ n: 1, d: 2 }, { n: 2, d: 2 }],
  ],
  2: [
    [{ n: 1, d: 4 }, { n: 1, d: 8 }],
    [{ n: 1, d: 2 }, { n: 1, d: 3 }],
    [{ n: 1, d: 6 }, { n: 1, d: 3 }],
    [{ n: 3, d: 4 }, { n: 3, d: 8 }],
    [{ n: 2, d: 3 }, { n: 2, d: 6 }],
    [{ n: 1, d: 8 }, { n: 1, d: 2 }],
  ],
  3: [
    [{ n: 3, d: 8 }, { n: 2, d: 3 }],
    [{ n: 4, d: 6 }, { n: 3, d: 8 }],
    [{ n: 2, d: 5 }, { n: 3, d: 4 }],
    [{ n: 5, d: 8 }, { n: 1, d: 3 }],
    [{ n: 3, d: 10 }, { n: 2, d: 3 }],
    [{ n: 2, d: 4 }, { n: 3, d: 6 }],
    [{ n: 1, d: 4 }, { n: 2, d: 8 }],
    [{ n: 4, d: 8 }, { n: 1, d: 2 }],
  ],
};

export function makeMarket(tier: Tier, r: Rand): MarketProblem {
  const [p, q] = pick(r, marketPairs[tier]);
  const [a, b] = r() < 0.5 ? [p, q] : [q, p];
  const equal = sameValue(a, b);
  // "which is smaller?" now and then (not for equal pairs: "the same" is the answer either way)
  const ask: 'bigger' | 'smaller' = !equal && r() < 0.3 ? 'smaller' : 'bigger';
  const big = cmp(a, b) > 0 ? a : b;
  const small = big === a ? b : a;
  const choiceOf = (f: Frac): Choice => {
    if (equal) return fracChoice(f.n, f.d, false, biggerBelief(f, f === a ? b : a));
    const right = ask === 'bigger' ? big : small;
    if (f === right) return fracChoice(f.n, f.d, true);
    // picking the wrong one means believing it is the bigger (or smaller) one
    const mis = ask === 'bigger' ? biggerBelief(f, f === a ? b : a) : biggerBelief(f === a ? b : a, f);
    return fracChoice(f.n, f.d, false, mis);
  };
  const same: Choice = { value: 'same', label: 'They are the same', correct: equal, misconception: equal ? undefined : 'thinks-equal' };
  // keep the two shares in the order they are shown, with "the same" last
  return { kind: 'compare', station: 'market', tier, a, b, ask, choices: [choiceOf(a), choiceOf(b), same] };
}

// ------------------------------------------------------------ the mosaic

const EQUIV: Array<[Frac, number]> = [
  [{ n: 1, d: 2 }, 2],
  [{ n: 1, d: 2 }, 3],
  [{ n: 1, d: 2 }, 4],
  [{ n: 1, d: 3 }, 2],
  [{ n: 2, d: 3 }, 2],
  [{ n: 1, d: 4 }, 2],
  [{ n: 3, d: 4 }, 2],
];

export function makeMosaic(tier: Tier, r: Rand): MosaicProblem {
  if (tier === 1) {
    const [t, k] = pick(r, EQUIV);
    const eq = { n: t.n * k, d: t.d * k };
    const list: Choice[] = [
      fracChoice(eq.n, eq.d, true),
      fracChoice(t.n + 1, t.d + 1, false, 'add-same'),
      fracChoice(t.n, eq.d, false, 'same-top'),
      fracChoice(eq.n + 1, eq.d, false, 'other'),
    ];
    return { kind: 'match', station: 'mosaic', tier, target: t, choices: finish(r, list, 3) };
  }
  if (tier === 2) {
    if (r() < 0.3) {
      // whole numbers as fractions: 4/4 = 1, 6/3 = 2, 3/1 = 3
      const given = pick(r, [
        { n: 4, d: 4 },
        { n: 6, d: 6 },
        { n: 6, d: 3 },
        { n: 8, d: 4 },
        { n: 3, d: 1 },
        { n: 4, d: 2 },
      ]);
      const w = given.n / given.d;
      const list: Choice[] = [numChoice(w, true), numChoice(given.n, false, 'top-only'), numChoice(given.d, false, 'bottom-number'), numChoice(given.n + given.d, false, 'other'), numChoice(w + 1, false, 'other')];
      return { kind: 'whole-number', station: 'mosaic', tier, given, choices: finish(r, list, 3) };
    }
    const [t, k] = pick(r, EQUIV);
    const answer = { n: t.n * k, d: t.d * k };
    // 3/4 = ?/8 : the top is missing
    const list: Choice[] = [
      numChoice(answer.n, true),
      numChoice(t.n + (answer.d - t.d), false, 'add-same'),
      numChoice(t.n, false, 'same-top'),
      numChoice(answer.n + 1, false, 'other'),
    ];
    return { kind: 'missing', station: 'mosaic', tier, given: t, want: { n: null, d: answer.d }, answer, choices: finish(r, list, 3) };
  }
  // level 3: multiply by 2, 3 or 4, sometimes the bottom is missing; or spot the one that is not equal
  const t = pick(r, [
    { n: 2, d: 3 },
    { n: 3, d: 4 },
    { n: 1, d: 3 },
    { n: 2, d: 5 },
    { n: 3, d: 5 },
    { n: 5, d: 6 },
  ]);
  const k = pick(r, [2, 3, 4]);
  const answer = { n: t.n * k, d: t.d * k };
  if (r() < 0.35) {
    const fakes: Choice[] = [
      { ...fracChoice(t.n + 1, t.d + 1, true), misconception: undefined },
      { ...fracChoice(t.n + 2, t.d + 2, true), misconception: undefined },
    ];
    const fake = pick(r, fakes);
    const trues = [2, 3, 4].map((m) => fracChoice(t.n * m, t.d * m, false, 'looks-different'));
    const list = shuffle(r, [fake, ...trues]);
    return { kind: 'odd-one', station: 'mosaic', tier, target: t, choices: list };
  }
  if (r() < 0.5) {
    const list: Choice[] = [numChoice(answer.n, true), numChoice(t.n + (answer.d - t.d), false, 'add-same'), numChoice(t.n * 2 === answer.n ? t.n * 3 : t.n * 2, false, 'half-multiply'), numChoice(t.n, false, 'same-top')];
    return { kind: 'missing', station: 'mosaic', tier, given: t, want: { n: null, d: answer.d }, answer, choices: finish(r, list, 4) };
  }
  // 2/3 = 8/? : the bottom is missing
  const list: Choice[] = [numChoice(answer.d, true), numChoice(t.d + (answer.n - t.n), false, 'add-same'), numChoice(t.d * 2 === answer.d ? t.d * 3 : t.d * 2, false, 'half-multiply'), numChoice(t.d, false, 'same-top')];
  return { kind: 'missing', station: 'mosaic', tier, given: t, want: { n: answer.n, d: null }, answer, choices: finish(r, list, 4) };
}

// ------------------------------------------------------------ Frenzy mode

/** A quick order: pick the loaf whose golden pieces show the fraction. */
export interface ServeProblem {
  target: Frac;
  choices: Choice[];
}

export function makeServe(tier: Tier, r: Rand): ServeProblem {
  const d = pick(r, tier === 1 ? [2, 3, 4] : tier === 2 ? [3, 4, 6, 8] : [5, 6, 8]);
  const n = 1 + Math.floor(r() * (d - 1));
  const gold = (k: number, sizes: number[]): Loaf => ({ shape: 'round', sizes, gone: [], shaded: range(0, k - 1) });
  const list: Choice[] = [{ value: `${n}/${d}`, label: `${n} of ${d} equal pieces golden`, correct: true, loaf: gold(n, ones(d)) }];
  if (d - n !== n) list.push({ value: `${d - n}/${d}`, label: `${d - n} of ${d} pieces golden`, correct: false, misconception: 'eaten-left-swap', loaf: gold(d - n, ones(d)) });
  const other = d + (d <= 4 ? 2 : -2);
  if (n < other) list.push({ value: `${n}/${other}`, label: `${n} of ${other} pieces golden`, correct: false, misconception: 'wrong-count', loaf: gold(n, ones(other)) });
  if (d <= 4) list.push({ value: 'unfair', label: `${n} of ${d} pieces, not the same size`, correct: false, misconception: 'unequal-parts', loaf: gold(n, unequalSizes(r, d)) });
  if (list.length < 3) list.push({ value: `${n}/${d + 1}`, label: `${n} of ${d + 1} pieces golden`, correct: false, misconception: 'wrong-count', loaf: gold(n, ones(d + 1)) });
  return { target: { n, d }, choices: finish(r, list, 3) };
}

export function makeProblem(station: Station, tier: Tier, r: Rand): Problem {
  if (station === 'bakery') return makeBakery(tier, r);
  if (station === 'road') return makeRoad(tier, r);
  if (station === 'market') return makeMarket(tier, r);
  return makeMosaic(tier, r);
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
