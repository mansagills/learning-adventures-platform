/**
 * Equation Balance Scale: the math, as pure functions (no drawing, no timers)
 * so every rule can be unit tested.
 *
 * Every question is a balance scale. The two sides of an equation are the two
 * pans, and "=" means the pans weigh the same. The outpost on the alien planet
 * has three jobs, each with three levels:
 *
 *   Weigh Station (Ranger Kiri), grades 3-4: the equals sign means "the same as" (1.OA.7, 3.OA.7)
 *     1. crystals on both pans: is 5 + 3 = 8 true? Which pan is heavier?
 *     2. sums on both sides: 7 + 2 = 4 + 5, a number alone on the left (9 = 4 + 5),
 *        and the one-pan trap (6 + 4 = 10 + 1 is false)
 *     3. with x and /: 3 x 4 = 2 x 6, 20 / 4 = 10 - 5
 *   Rover (Mechanic Juno), grades 3-4: the missing number, anywhere (1.OA.8, 3.OA.4)
 *     1. 7 + ? = 12 and ? - 6 = 9
 *     2. ? x 4 = 24 and 36 / ? = 9
 *     3. something on both sides: 8 + 4 = ? + 5, 3 x 8 = 6 x ?, 15 - 7 = ? - 10
 *   Dome (Botanist Pax), grades 4-5: two-step problems (half 2 of the build)
 *
 * Weigh Station answers are always the same three: "True: it balances",
 * "False: the left is heavier" and "False: the right is heavier", so a child
 * learns that "=" is a statement about both sides. Rover answers are three
 * crystal weights; the one the player puts in the gap makes the scale tip, so
 * a wrong weight shows which pan it made too heavy. Wrong answers are made
 * from real mistakes ("=" means the answer comes next, adding everything,
 * the wrong operation for the missing number). No number anywhere, shown or
 * worked out on the way, is ever below zero.
 */

export type Job = 'weigh' | 'rover' | 'dome';
export const JOBS: Job[] = ['weigh', 'rover', 'dome'];
/** The jobs built so far (the Dome comes in half 2). */
export const OPEN_JOBS: Job[] = ['weigh', 'rover'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'answer-next' // "=" means "the answer comes next": 8 + 4 = ? + 5 -> 12
  | 'added-all' // added every number shown: 8 + 4 = ? + 5 -> 17
  | 'wrong-operation' // undid the wrong way: ? - 6 = 9 -> 3, 7 + ? = 12 -> 19
  | 'add-change' // added or took away the change instead of multiplying: 3 x 8 = 6 x ? -> 5
  | 'one-pan' // checked only part of the other side: 6 + 4 = 10 + 1 called true
  | 'backwards' // thinks a number alone on the left makes it false: 9 = 4 + 5
  | 'tipped-wrong-way' // knew it was not balanced but picked the lighter pan as heavier
  | 'miscounted' // the pans do (or don't) weigh the same and the sums were slipped
  | 'one-off'; // a near miss by one

export interface Choice {
  /** A unique key (the number, or the answer word). */
  value: string;
  /** What the button or crystal weight shows. */
  label: string;
  correct: boolean;
  misconception?: Misconception;
}

/** One side of the equation, as it sits on a pan. */
export interface Pan {
  /** What the pan's tag shows ("5 + 3", "? × 4"). */
  text: string;
  /** What the pan weighs when the missing number is `x` (x is ignored when nothing is missing). */
  weight: (x: number) => number;
  /** True when this pan holds the missing number (the gap the player fills). */
  gap: boolean;
  /** Level 1 shows real crystals: one pile per number (small numbers only). */
  piles?: number[];
}

export type Verdict = 'balanced' | 'left' | 'right';

export interface Step {
  /** The banner text (short: it sits above the scale and is read aloud). */
  ask: string;
  choices: Choice[];
  /** Shown with the answer (rung 3 of the hints and after a right answer). */
  explain: string;
}

export interface Problem {
  job: Job;
  tier: Tier;
  kind:
    | 'tip' // Weigh: which way does the scale tip (crystals)
    | 'true-false' // Weigh: is this equation true, sums or x and /
    | 'missing' // Rover: the missing number on one side
    | 'both-sides'; // Rover: something on both sides
  left: Pan;
  right: Pan;
  /** Weigh: the verdict. Rover: the missing number. */
  answer: number | Verdict;
  steps: Step[];
}

export type Rand = () => number;
export const pick = <T>(r: Rand, list: readonly T[]): T => list[Math.floor(r() * list.length) % list.length];
export const int = (r: Rand, a: number, b: number) => a + Math.floor(r() * (b - a + 1));

export function shuffle<T>(r: Rand, list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const PLUS = '+';
const MINUS = '−';
const TIMES = '×';
const DIVIDE = '÷';

/** A pan with no gap: its text and its weight. */
const fixed = (text: string, w: number, piles?: number[]): Pan => ({ text, weight: () => w, gap: false, piles });

/** Which way a scale tips with these two weights. */
export function verdictOf(left: number, right: number): Verdict {
  return left === right ? 'balanced' : left > right ? 'left' : 'right';
}

/** The three Weigh Station answers, always in the same order (so the buttons never move). */
export const VERDICTS: Array<{ v: Verdict; label: string }> = [
  { v: 'balanced', label: 'True: it balances' },
  { v: 'left', label: 'False: the left is heavier' },
  { v: 'right', label: 'False: the right is heavier' },
];

/**
 * Three choices for a missing number: the answer and the first two mistakes
 * that give a different whole number (never below zero). A near miss pads the
 * list if two real mistakes can't be found.
 */
export function numberChoices(r: Rand, answer: number, mistakes: Array<[number, Misconception]>): Choice[] {
  const out: Choice[] = [{ value: String(answer), label: String(answer), correct: true }];
  const used = new Set([answer]);
  for (const [v, m] of mistakes) {
    if (out.length >= 3) break;
    // a crystal always weighs something: no zeros, no negatives, no fractions
    if (!Number.isInteger(v) || v < 1 || used.has(v)) continue;
    used.add(v);
    out.push({ value: String(v), label: String(v), correct: false, misconception: m });
  }
  for (const v of [answer + 1, answer - 1, answer + 2, answer - 2]) {
    if (out.length >= 3) break;
    if (v < 1 || used.has(v)) continue;
    used.add(v);
    out.push({ value: String(v), label: String(v), correct: false, misconception: 'one-off' });
  }
  return shuffle(r, out);
}

// ------------------------------------------------------------------ Weigh Station (Ranger Kiri)

/** One side of a Weigh Station equation: its text, its weight, and (level 1) its crystal piles. */
interface Side {
  text: string;
  w: number;
  piles?: number[];
  /** True when the side is one number on its own (for the "backwards" mistake). */
  alone?: boolean;
  /** The first number of the side (for the "one pan" trap: 6 + 4 = 10 + 1). */
  first: number;
}

const sum = (a: number, b: number): Side => ({ text: `${a} ${PLUS} ${b}`, w: a + b, piles: [a, b], first: a });
const diff = (a: number, b: number): Side => ({ text: `${a} ${MINUS} ${b}`, w: a - b, first: a });
const prod = (a: number, b: number): Side => ({ text: `${a} ${TIMES} ${b}`, w: a * b, first: a });
const quot = (a: number, b: number): Side => ({ text: `${a} ${DIVIDE} ${b}`, w: a / b, first: a });
const lone = (n: number): Side => ({ text: String(n), w: n, piles: [n], alone: true, first: n });

/** Builds a Weigh Station question from its two sides: the verdict, the three answers and their mistakes. */
function weighQuestion(tier: Tier, kind: Problem['kind'], L: Side, R: Side): Problem {
  const answer = verdictOf(L.w, R.w);
  const eq = `${L.text} = ${R.text}`;
  // the trap: the other side starts with this side's total (6 + 4 = 10 + 1)
  const onePan = answer !== 'balanced' && (R.first === L.w || L.first === R.w);
  const choices: Choice[] = VERDICTS.map(({ v, label }): Choice => {
    if (v === answer) return { value: v, label, correct: true };
    let misconception: Misconception;
    if (v === 'balanced') misconception = onePan ? 'one-pan' : 'miscounted';
    else if (answer === 'balanced') misconception = L.alone ? 'backwards' : 'miscounted';
    else misconception = 'tipped-wrong-way';
    return { value: v, label, correct: false, misconception };
  });
  const lw = `${L.text}${L.alone ? '' : ` = ${L.w}`}`;
  const rw = `${R.text}${R.alone ? '' : ` = ${R.w}`}`;
  const explain =
    answer === 'balanced'
      ? `Left: ${lw}. Right: ${rw}. Both pans weigh ${L.w}, so ${eq} is true.`
      : `Left: ${lw}. Right: ${rw}. ${Math.max(L.w, R.w)} is more than ${Math.min(L.w, R.w)}, so the ${answer} pan is heavier and ${eq} is false.`;
  return {
    job: 'weigh',
    tier,
    kind,
    // real crystals only at level 1; later levels show a crystal weight for each number
    left: fixed(L.text, L.w, tier === 1 ? L.piles : undefined),
    right: fixed(R.text, R.w, tier === 1 ? R.piles : undefined),
    answer,
    steps: [{ ask: `Left pan: ${L.text}. Right pan: ${R.text}. Is ${eq} true?`, choices, explain }],
  };
}

export function makeWeigh(tier: Tier, r: Rand): Problem {
  if (tier === 1) {
    // crystals: a + b on the left, one pile on the right; balanced about half the time
    const a = int(r, 1, 6);
    const b = int(r, 1, 5);
    const total = a + b;
    const roll = r();
    const right = roll < 0.5 ? total : roll < 0.75 ? Math.max(1, total - int(r, 1, 2)) : Math.min(12, total + int(r, 1, 2));
    // now and then the lone number goes on the left, to meet "8 = 5 + 3" early
    if (r() < 0.25) return weighQuestion(tier, 'tip', lone(right), sum(a, b));
    return weighQuestion(tier, 'tip', sum(a, b), lone(right));
  }
  if (tier === 2) {
    const kind = pick(r, ['balanced', 'lone-left', 'one-pan', 'off', 'minus'] as const);
    if (kind === 'balanced') {
      // two different ways to make the same number: 7 + 2 = 4 + 5
      const t = int(r, 6, 15);
      const a = int(r, 1, t - 1);
      // a different pair on the right (not the same two numbers, in either order)
      const others = Array.from({ length: t - 1 }, (_, i) => i + 1).filter((c) => c !== a && c !== t - a);
      const c = pick(r, others);
      return weighQuestion(tier, 'true-false', sum(a, t - a), sum(c, t - c));
    }
    if (kind === 'lone-left') {
      // a number alone on the left: 9 = 4 + 5 (true, and not "backwards")
      const t = int(r, 6, 15);
      const a = int(r, 1, t - 1);
      return weighQuestion(tier, 'true-false', lone(t), sum(a, t - a));
    }
    if (kind === 'one-pan') {
      // the trap: 6 + 4 = 10 + 1 (the right starts with the left's total, then adds more)
      const a = int(r, 2, 8);
      const b = int(r, 2, 8);
      return weighQuestion(tier, 'true-false', sum(a, b), sum(a + b, int(r, 1, 3)));
    }
    if (kind === 'off') {
      // sums that miss by one or two: 8 + 5 = 6 + 6
      const t = int(r, 8, 15);
      const a = int(r, 2, t - 2);
      const u = t + pick(r, [-2, -1, 1, 2]);
      const c = int(r, 1, u - 1);
      return r() < 0.5 ? weighQuestion(tier, 'true-false', sum(a, t - a), sum(c, u - c)) : weighQuestion(tier, 'true-false', sum(c, u - c), sum(a, t - a));
    }
    // a take-away on one side: 12 - 3 = 4 + 5 (always balanced or off by one, never below zero)
    const t = int(r, 5, 12);
    const b = int(r, 1, 6);
    const a = t + b;
    const u = r() < 0.6 ? t : t + pick(r, [-1, 1]);
    const c = int(r, 1, u - 1);
    return weighQuestion(tier, 'true-false', diff(a, b), sum(c, u - c));
  }
  // level 3: x and / on one or both sides
  const kind = pick(r, ['times-times', 'times-plus', 'divide-minus', 'times-off'] as const);
  if (kind === 'times-times') {
    // the same product two ways: 3 x 4 = 2 x 6
    const p = pick(r, [12, 16, 18, 20, 24, 30, 36]);
    const pairs: Array<[number, number]> = [];
    for (let a = 2; a <= 10; a++) if (p % a === 0 && p / a >= 2 && p / a <= 10 && a <= p / a) pairs.push([a, p / a]);
    const [x, y] = pick(r, pairs);
    const others = pairs.filter(([a]) => a !== x);
    const [u, v] = others.length ? pick(r, others) : [y, x];
    return weighQuestion(tier, 'true-false', prod(x, y), prod(v, u));
  }
  if (kind === 'times-plus') {
    // a product and a sum: 4 x 5 = 15 + 5 (true) or 15 + 6 (false)
    const a = int(r, 2, 6);
    const b = int(r, 3, 9);
    const p = a * b;
    const s = r() < 0.5 ? p : p + pick(r, [-2, -1, 1, 2]);
    const c = int(r, Math.max(1, s - 10), s - 1);
    return weighQuestion(tier, 'true-false', prod(a, b), sum(c, s - c));
  }
  if (kind === 'divide-minus') {
    // a quotient and a take-away: 20 / 4 = 10 - 5
    const d = int(r, 2, 6);
    const q = int(r, 2, 9);
    const s = r() < 0.5 ? q : q + pick(r, [-1, 1]);
    const b = int(r, 1, 9);
    return weighQuestion(tier, 'true-false', quot(d * q, d), diff(s + b, b));
  }
  // one group off: 6 x 4 = 5 x 5 (24 and 25)
  const a = int(r, 3, 8);
  const b = int(r, 3, 8);
  const p = a * b;
  // find a product within 1 or 2 of p
  const near: Array<[number, number]> = [];
  for (let x = 2; x <= 10; x++) for (let y = x; y <= 10; y++) if (Math.abs(x * y - p) >= 1 && Math.abs(x * y - p) <= 2) near.push([x, y]);
  if (!near.length) return makeWeigh(3, r);
  const [x, y] = pick(r, near);
  return weighQuestion(tier, 'true-false', prod(a, b), prod(x, y));
}

// ------------------------------------------------------------------ Rover (Mechanic Juno)

/** A pan with the gap: its text uses "?" and its weight depends on the number put in. */
const gapPan = (text: string, weight: (x: number) => number): Pan => ({ text, weight, gap: true });

function roverQuestion(tier: Tier, kind: Problem['kind'], left: Pan, right: Pan, answer: number, mistakes: Array<[number, Misconception]>, explain: string, r: Rand): Problem {
  const eq = `${left.text} = ${right.text}`;
  return {
    job: 'rover',
    tier,
    kind,
    left,
    right,
    answer,
    steps: [{ ask: `Find the missing number: ${eq}. Which crystal makes the scale balance?`, choices: numberChoices(r, answer, mistakes), explain }],
  };
}

export function makeRover(tier: Tier, r: Rand): Problem {
  if (tier === 1) {
    if (r() < 0.5) {
      // 7 + ? = 12 (or ? + 7 = 12)
      const a = int(r, 2, 9);
      const x = int(r, 2, 9);
      const t = a + x;
      const front = r() < 0.5;
      const left = gapPan(front ? `? ${PLUS} ${a}` : `${a} ${PLUS} ?`, (v) => v + a);
      return roverQuestion(tier, 'missing', left, fixed(String(t), t), x, [
        [t + a, 'wrong-operation'],
        [t, 'answer-next'],
      ], `${t} ${MINUS} ${a} = ${x}, so ${a} ${PLUS} ${x} = ${t}. Both pans weigh ${t}.`, r);
    }
    // ? - 6 = 9
    const b = int(r, 2, 9);
    const x0 = int(r, 2, 9);
    const x = x0 + b;
    const left = gapPan(`? ${MINUS} ${b}`, (v) => v - b);
    return roverQuestion(tier, 'missing', left, fixed(String(x0), x0), x, [
      [x0 - b, 'wrong-operation'],
      [x0, 'answer-next'],
    ], `${x0} ${PLUS} ${b} = ${x}, so ${x} ${MINUS} ${b} = ${x0}. Both pans weigh ${x0}.`, r);
  }
  if (tier === 2) {
    if (r() < 0.5) {
      // ? x 4 = 24 (or 4 x ? = 24)
      const a = int(r, 2, 9);
      const x = int(r, 2, 9);
      const p = a * x;
      const front = r() < 0.5;
      const left = gapPan(front ? `? ${TIMES} ${a}` : `${a} ${TIMES} ?`, (v) => v * a);
      return roverQuestion(tier, 'missing', left, fixed(String(p), p), x, [
        [p - a, 'wrong-operation'],
        [p * a, 'wrong-operation'],
        [p, 'answer-next'],
      ], `${a} ${TIMES} ${x} = ${p}, so ${p} ${DIVIDE} ${a} = ${x}. Both pans weigh ${p}.`, r);
    }
    // 36 / ? = 9
    const x = int(r, 2, 9);
    const q = int(r, 2, 9);
    const n = x * q;
    const left = gapPan(`${n} ${DIVIDE} ?`, (v) => (v === 0 ? Infinity : n / v));
    return roverQuestion(tier, 'missing', left, fixed(String(q), q), x, [
      [n * q, 'wrong-operation'],
      [n - q, 'wrong-operation'],
      [q, 'answer-next'],
    ], `${n} ${DIVIDE} ${x} = ${q}, because ${x} ${TIMES} ${q} = ${n}. Both pans weigh ${q}.`, r);
  }
  // level 3: something on both sides
  const kind = pick(r, ['plus', 'times', 'minus'] as const);
  if (kind === 'plus') {
    // 8 + 4 = ? + 5
    const a = int(r, 3, 9);
    const b = int(r, 2, 9);
    const t = a + b;
    const c = int(r, 2, t - 2);
    const x = t - c;
    const left = fixed(`${a} ${PLUS} ${b}`, t);
    const right = gapPan(`? ${PLUS} ${c}`, (v) => v + c);
    return roverQuestion(tier, 'both-sides', left, right, x, [
      [t, 'answer-next'],
      [t + c, 'added-all'],
    ], `The left pan weighs ${a} ${PLUS} ${b} = ${t}. ${t} ${MINUS} ${c} = ${x}, so ${x} ${PLUS} ${c} = ${t} too.`, r);
  }
  if (kind === 'times') {
    // 3 x 8 = 6 x ? (the second factor doubles, so the other halves)
    const pairs: Array<[number, number, number]> = [];
    for (const [a, k] of [
      [2, 2],
      [3, 2],
      [4, 2],
      [2, 3],
      [3, 3],
      [2, 4],
    ] as const)
      for (let x = 2; x <= 9; x++) {
        const b = x * k;
        if (b <= 12) pairs.push([a, b, a * k]);
      }
    const [a, b, c] = pick(r, pairs);
    const p = a * b;
    const x = p / c;
    const left = fixed(`${a} ${TIMES} ${b}`, p);
    const right = gapPan(`${c} ${TIMES} ?`, (v) => c * v);
    return roverQuestion(tier, 'both-sides', left, right, x, [
      [p, 'answer-next'],
      [b - (c - a), 'add-change'],
      [b + (c - a), 'add-change'],
    ], `The left pan weighs ${a} ${TIMES} ${b} = ${p}. ${p} ${DIVIDE} ${c} = ${x}, so ${c} ${TIMES} ${x} = ${p} too.`, r);
  }
  // 15 - 7 = ? - 10
  const b = int(r, 2, 8);
  const d = int(r, 2, 9);
  const a = b + d;
  const c = int(r, 2, 9);
  const x = d + c;
  const left = fixed(`${a} ${MINUS} ${b}`, d);
  const right = gapPan(`? ${MINUS} ${c}`, (v) => v - c);
  return roverQuestion(tier, 'both-sides', left, right, x, [
    [d, 'answer-next'],
    [d - c, 'wrong-operation'],
    [a + b + c, 'added-all'],
  ], `The left pan weighs ${a} ${MINUS} ${b} = ${d}. ${d} ${PLUS} ${c} = ${x}, so ${x} ${MINUS} ${c} = ${d} too.`, r);
}

// ------------------------------------------------------------------ any job

export function makeProblem(job: Job, tier: Tier, r: Rand): Problem {
  if (job === 'weigh') return makeWeigh(tier, r);
  if (job === 'rover') return makeRover(tier, r);
  // the Dome comes in half 2; until then it asks Rover questions
  return makeRover(tier, r);
}

/** What each pan weighs once the player's choice is in (the chosen number fills the gap). */
export function panWeights(p: Problem, chosen?: number): { left: number; right: number } {
  const x = chosen ?? (typeof p.answer === 'number' ? p.answer : 0);
  return { left: p.left.weight(x), right: p.right.weight(x) };
}
