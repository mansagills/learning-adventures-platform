/**
 * Math Race Rally: the race math, as pure functions (no drawing, no timers)
 * so every rule can be unit tested.
 *
 * Five tiers (one learner skill):
 *   1. Add and subtract within 10.
 *   2. Within 20: make a ten, doubles and near doubles, take back to ten.
 *   3. Two-digit and one-digit numbers (no regrouping), and adding or taking away tens.
 *   4. Two-digit numbers with regrouping.
 *   5. Three-digit numbers (with regrouping), and "close to a hundred" sums.
 *
 * Every question has three answers for the three lanes. The wrong ones come
 * from real mistakes, so a wrong gate tells the game which idea to explain.
 */

export type Tier = 1 | 2 | 3 | 4 | 5;
export const TIERS: Tier[] = [1, 2, 3, 4, 5];
export type Op = '+' | '-';

export type Misconception =
  | 'off-one' // counted the starting number (or a slip of one)
  | 'wrong-op' // added instead of subtracting, or the other way round
  | 'no-regroup' // forgot to carry the ten (47 + 38 = 75)
  | 'smaller-from-bigger' // took the smaller digit from the bigger (52 - 27 = 35)
  | 'tens-ones' // added a ones number to the tens (34 + 5 = 84)
  | 'off-ten' // a ten too many or too few
  | 'off-hundred' // a hundred too many or too few
  | 'other';

export interface Choice {
  value: number;
  correct: boolean;
  misconception?: Misconception;
}

export interface Problem {
  tier: Tier;
  a: number;
  b: number;
  op: Op;
  answer: number;
  /** "8 + 7" */
  text: string;
  /** Three answers, one per lane (left, middle, right). */
  choices: Choice[];
  /** One sentence showing a strategy that solves it. */
  strategy: string;
}

type Rand = () => number;
const int = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T>(r: Rand, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
function shuffle<T>(r: Rand, xs: T[]): T[] {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }
  return xs;
}

export const solve = (a: number, op: Op, b: number) => (op === '+' ? a + b : a - b);
const ones = (n: number) => n % 10;
const tens = (n: number) => Math.floor(n / 10) % 10;

/** Does this sum need a carry, or this difference a trade, in the ones place? */
export function needsRegroup(a: number, op: Op, b: number): boolean {
  return op === '+' ? ones(a) + ones(b) >= 10 : ones(a) < ones(b);
}

/** Adding or subtracting place by place without carrying or trading. */
export function noRegroup(a: number, op: Op, b: number): number {
  if (op === '+') {
    // write only the ones digit of each column (47 + 38 -> 7+8=15 -> 5, 4+3 -> 7: 75)
    let out = 0;
    let place = 1;
    let x = a;
    let y = b;
    while (x > 0 || y > 0) {
      out += ((ones(x) + ones(y)) % 10) * place;
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
      place *= 10;
    }
    return out;
  }
  // take the smaller digit from the bigger in each column (52 - 27 -> 5, 3: 35)
  let out = 0;
  let place = 1;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    out += Math.abs(ones(x) - ones(y)) * place;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
    place *= 10;
  }
  return out;
}

/** The numbers for a question at this tier. */
function operands(tier: Tier, r: Rand): { a: number; b: number; op: Op } {
  const op: Op = r() < 0.5 ? '+' : '-';
  if (tier === 1) {
    if (op === '+') {
      const a = int(r, 1, 8);
      return { a, b: int(r, 1, 10 - a), op };
    }
    const a = int(r, 3, 10);
    return { a, b: int(r, 1, a - 1), op };
  }
  if (tier === 2) {
    // crossing ten, or doubles and near doubles
    if (op === '+') {
      if (r() < 0.35) {
        const d = int(r, 5, 9);
        return r() < 0.5 ? { a: d, b: d, op } : { a: d, b: d + 1, op };
      }
      const a = int(r, 6, 9);
      return { a, b: int(r, 11 - a, 9), op };
    }
    const a = int(r, 11, 18);
    return { a, b: int(r, a - 9, 9), op };
  }
  if (tier === 3) {
    if (r() < 0.35) {
      // tens: 40 + 30, 70 - 20, or 46 + 30
      const a = r() < 0.5 ? int(r, 1, 8) * 10 : int(r, 11, 69);
      if (op === '+') return { a, b: int(r, 1, Math.floor((99 - a) / 10)) * 10, op };
      const aa = a < 20 ? a + 30 : a;
      return { a: aa, b: int(r, 1, Math.floor(aa / 10) - 1) * 10, op };
    }
    // two-digit and one-digit, no regrouping
    for (;;) {
      const a = int(r, 12, 98);
      const b = int(r, 1, 9);
      if (!needsRegroup(a, op, b) && solve(a, op, b) > 0 && solve(a, op, b) < 100) return { a, b, op };
    }
  }
  if (tier === 4) {
    // two-digit with regrouping
    for (;;) {
      const a = int(r, 15, 95);
      const b = int(r, 12, 89);
      if (op === '-' && b >= a) continue;
      if (op === '+' && a + b > 99) continue;
      if (needsRegroup(a, op, b) && (op === '+' || a - b >= 5)) return { a, b, op };
    }
  }
  // tier 5: three digits, sometimes "close to a hundred"
  if (r() < 0.3 && op === '+') {
    const a = pick(r, [98, 99, 197, 198, 199, 298, 299, 398, 399, 498, 499]);
    return { a, b: int(r, 112, 389), op };
  }
  for (;;) {
    const a = int(r, 205, 899);
    const b = int(r, 112, 499);
    if (op === '-' && b >= a - 20) continue;
    if (op === '+' && a + b > 999) continue;
    if (needsRegroup(a, op, b)) return { a, b, op };
  }
}

/** Wrong answers from real mistakes, best first. */
export function distractors(a: number, op: Op, b: number, tier: Tier): Array<{ value: number; mis: Misconception }> {
  const ans = solve(a, op, b);
  const out: Array<{ value: number; mis: Misconception }> = [];
  const add = (value: number, mis: Misconception) => {
    if (value < 0 || value === ans || out.some((o) => o.value === value)) return;
    out.push({ value, mis });
  };
  if (tier >= 4 || (tier === 3 && b >= 10)) {
    if (needsRegroup(a, op, b)) add(noRegroup(a, op, b), op === '+' ? 'no-regroup' : 'smaller-from-bigger');
  }
  if (tier === 3 && b < 10) add(solve(a, op, b * 10), 'tens-ones');
  if (tier <= 2) {
    add(ans + 1, 'off-one');
    add(ans - 1, 'off-one');
  }
  if (tier <= 3) add(solve(a, op === '+' ? '-' : '+', b), 'wrong-op');
  if (tier >= 3) {
    add(ans + 10, 'off-ten');
    add(ans - 10, 'off-ten');
  }
  if (tier === 5) {
    add(ans + 100, 'off-hundred');
    add(ans - 100, 'off-hundred');
  }
  add(ans + 1, 'off-one');
  add(ans - 1, 'off-one');
  add(ans + 2, 'other');
  return out;
}

/** One sentence that shows a strategy for this exact question. */
export function strategyFor(a: number, op: Op, b: number, tier: Tier): string {
  const ans = solve(a, op, b);
  if (tier === 1) return op === '+' ? `Start at ${Math.max(a, b)} and count on ${Math.min(a, b)}: ${ans}.` : `Think addition: ${b} + ? = ${a}. It is ${ans}.`;
  if (tier === 2) {
    if (op === '+') {
      if (a === b) return `Doubles: ${a} + ${a} = ${ans}.`;
      if (Math.abs(a - b) === 1 && Math.min(a, b) <= 6) return `Near doubles: ${Math.min(a, b)} + ${Math.min(a, b)} = ${2 * Math.min(a, b)}, plus 1 more is ${ans}.`;
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      const fill = 10 - big;
      return `Make a ten: ${big} + ${fill} = 10, then 10 + ${small - fill} = ${ans}.`;
    }
    const down = a - 10;
    return `Take back to ten: ${a} - ${down} = 10, then 10 - ${b - down} = ${ans}.`;
  }
  if (tier === 3) {
    if (b % 10 === 0) return `Count by tens: ${a} ${op} ${b} = ${ans}. Only the tens change.`;
    return `Just the ones: ${ones(a)} ${op} ${b} = ${ones(a) + (op === '+' ? b : -b)}, and the tens stay the same: ${ans}.`;
  }
  if (tier === 4) {
    if (op === '+') {
      const o = ones(a) + ones(b);
      return `Ones: ${ones(a)} + ${ones(b)} = ${o}. Write ${o - 10} and carry the ten. Tens: ${tens(a)} + ${tens(b)} + 1 = ${tens(a) + tens(b) + 1}. So ${ans}.`;
    }
    return `You can't take ${ones(b)} from ${ones(a)}, so trade a ten: ${ones(a) + 10} - ${ones(b)} = ${ones(a) + 10 - ones(b)}. Tens: ${tens(a) - 1} - ${tens(b)} = ${tens(a) - 1 - tens(b)}. So ${ans}.`;
  }
  const near = Math.round(a / 100) * 100;
  if (op === '+' && near - a > 0 && near - a <= 2) return `${a} is close to ${near}: ${near} + ${b} = ${near + b}, then take away ${near - a}: ${ans}.`;
  return op === '+'
    ? `Add place by place: hundreds, tens, then ones, and carry when a place reaches 10. ${a} + ${b} = ${ans}.`
    : `Subtract place by place, and trade from the next place when the top digit is smaller. ${a} - ${b} = ${ans}.`;
}

export function makeProblem(tier: Tier, r: Rand): Problem {
  const { a, b, op } = operands(tier, r);
  const answer = solve(a, op, b);
  const wrong = distractors(a, op, b, tier);
  const chosen = [wrong[0], wrong.length > 2 && r() < 0.4 ? wrong[2] : wrong[1]];
  const choices = shuffle(r, [{ value: answer, correct: true }, ...chosen.map((w) => ({ value: w.value, correct: false, misconception: w.mis }))]);
  return { tier, a, b, op, answer, text: `${a} ${op === '-' ? '−' : '+'} ${b}`, choices, strategy: strategyFor(a, op, b, tier) };
}

// ------------------------------------------------------------ the pit stop (memory match)

export interface MemoryCard {
  /** Cards with the same pair id match. */
  pair: number;
  face: string;
  kind: 'fact' | 'answer';
}

/**
 * A board of fact and answer cards. Facts the player missed in the race come
 * first, then other facts from the race, then new ones; answers are never
 * repeated, so every fact has exactly one matching card.
 */
export function memoryBoard(pairs: number, missed: Problem[], seen: Problem[], tier: Tier, r: Rand): MemoryCard[] {
  const chosen: Problem[] = [];
  const answers = new Set<number>();
  const take = (p: Problem) => {
    if (chosen.length >= pairs || answers.has(p.answer)) return;
    chosen.push(p);
    answers.add(p.answer);
  };
  missed.forEach(take);
  shuffle(r, [...seen]).forEach(take);
  for (let guard = 0; chosen.length < pairs && guard < 500; guard++) take(makeProblem(tier, r));
  const cards: MemoryCard[] = [];
  chosen.forEach((p, i) => {
    cards.push({ pair: i, face: p.text, kind: 'fact' });
    cards.push({ pair: i, face: String(p.answer), kind: 'answer' });
  });
  return shuffle(r, cards);
}

/** Bolts earned at the pit stop: one per match, and a bonus for a tidy board. */
export function boltsFor(matches: number, misses: number, pairs: number): number {
  return matches + (matches === pairs ? Math.max(0, 4 - Math.floor(misses / 2)) : 0);
}

// ------------------------------------------------------------ the race

/** Speed levels 1-6. A right gate goes up one, a wrong gate down one (never to a stop). */
export const SPEED_LEVELS = 6;
export function nextLevel(level: number, correct: boolean): number {
  return Math.max(1, Math.min(SPEED_LEVELS, level + (correct ? 1 : -1)));
}
/** Road speed in segments per second for a speed level. */
export function speedFor(level: number): number {
  return 9 + level * 2.2;
}
