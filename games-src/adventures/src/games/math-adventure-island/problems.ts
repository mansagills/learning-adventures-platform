/**
 * Math Adventure Island: the math, as pure functions (no drawing, no timers)
 * so every rule can be unit tested.
 *
 * - Word problems for four zones (one operation each), in three steps:
 *   what is the question asking, which operation, then solve. Some problems
 *   put a "trap" key word in the story (they got MORE, but you subtract to
 *   find the start), because that is where children really slip.
 * - Treasure clues: estimate, calculate, check whether an answer is
 *   reasonable, then find the grid square to dig.
 * - The quiz show board, with a "show your strategy" bonus.
 */

export type Zone = 'add' | 'sub' | 'mul' | 'div';
export const ZONES: Zone[] = ['add', 'sub', 'mul', 'div'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];
export type Op = '+' | '−' | '×' | '÷';
export const OPS: Op[] = ['+', '−', '×', '÷'];

export type Misconception =
  | 'wrong-question' // answered a different question than the one asked
  | 'keyword-trap' // picked the operation from a key word ("more" means add)
  | 'wrong-op' // picked another operation
  | 'no-regroup' // forgot to carry
  | 'smaller-from-bigger' // took the smaller digit from the bigger
  | 'off-one'
  | 'off-ten'
  | 'added-instead' // added the numbers in a multiplication or division story
  | 'fact-slip' // one group too many or too few
  | 'place-value' // wrote partial products side by side (1224 for 24 x 6)
  | 'remainder-ignored' // dropped the leftovers when they needed one more
  | 'remainder-kept' // counted a part-full bag
  | 'remainder-as-answer' // gave the leftovers as the answer
  | 'round-wrong' // rounded the wrong way or to the wrong place
  | 'not-rounded' // gave the exact answer when asked to estimate
  | 'said-reasonable' // called a far-off answer reasonable
  | 'said-unreasonable' // called a good answer unreasonable
  | 'swapped-xy' // dug at (y, x)
  | 'wrong-square'
  | 'wrong-strategy'
  | 'other';

export interface Choice<T = number> {
  value: T;
  label: string;
  correct: boolean;
  misconception?: Misconception;
}

export type Model =
  | { kind: 'join'; parts: [number | null, number | null]; total: number | null; unit: string }
  | { kind: 'compare'; big: number; small: number; label: [string, string]; unit: string }
  | { kind: 'groups'; groups: number; each: number; unit: string }
  | { kind: 'array'; rows: number; cols: number; unit: string }
  | { kind: 'share'; total: number; size: number; unit: string; askGroups: boolean };

export interface WordProblem {
  zone: Zone;
  tier: Tier;
  story: string;
  /** Step 1: what is the question asking? */
  ask: Choice<string>[];
  /** Step 2: the operation that solves it, and the trap a key word suggests. */
  op: Op;
  trap?: Op;
  /** Step 3 */
  answer: number;
  unit: string;
  choices: Choice[];
  model: Model;
  /** One sentence showing how to solve it. */
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

const NAMES = ['Mia', 'Leo', 'Kai', 'Ana', 'Omar', 'Priya', 'Jin', 'Ada', 'Sam', 'Lena', 'Ravi', 'Zoe'];
const twoNames = (r: Rand): [string, string] => {
  const a = pick(r, NAMES);
  let b = pick(r, NAMES);
  while (b === a) b = pick(r, NAMES);
  return [a, b];
};

/** Column addition without carrying (47 + 38 = 75). */
export function addNoCarry(a: number, b: number): number {
  let out = 0;
  let place = 1;
  while (a > 0 || b > 0) {
    out += ((a % 10) + (b % 10)) % 10 * place;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
    place *= 10;
  }
  return out;
}
/** Column subtraction taking the smaller digit from the bigger (52 - 27 = 35). */
export function subSmallerFromBigger(a: number, b: number): number {
  let out = 0;
  let place = 1;
  while (a > 0 || b > 0) {
    out += Math.abs((a % 10) - (b % 10)) * place;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
    place *= 10;
  }
  return out;
}

/** Three answers: the right one and the two best wrong ones (no repeats, none negative). */
function numChoices(r: Rand, answer: number, wrong: Array<[number, Misconception]>, unit: string): Choice[] {
  const out: Choice[] = [{ value: answer, label: String(answer), correct: true }];
  for (const [v, m] of wrong) {
    if (out.length >= 3) break;
    if (!Number.isFinite(v) || v < 0 || out.some((c) => c.value === v)) continue;
    out.push({ value: v, label: String(v), correct: false, misconception: m });
  }
  for (const d of [1, -1, 10, -10, 2, 5]) {
    if (out.length >= 3) break;
    const v = answer + d;
    if (v >= 0 && !out.some((c) => c.value === v)) out.push({ value: v, label: String(v), correct: false, misconception: Math.abs(d) === 10 ? 'off-ten' : 'off-one' });
  }
  void unit;
  return shuffle(r, out);
}

function asks(r: Rand, right: string, wrong: string[]): Choice<string>[] {
  return shuffle(r, [{ value: right, label: right, correct: true }, ...wrong.slice(0, 2).map((w) => ({ value: w, label: w, correct: false, misconception: 'wrong-question' as Misconception }))]);
}

// ------------------------------------------------------------ the four zones

function addProblem(tier: Tier, r: Rand): WordProblem {
  const [p, q] = twoNames(r);
  const unit = 'shells';
  if (tier === 1 || (tier === 3 && r() < 0.4)) {
    // join, result unknown
    const big = tier === 1;
    const a = big ? int(r, 14, 68) : int(r, 125, 489);
    const b = big ? int(r, 12, 99 - a) : int(r, 116, 899 - a);
    const ans = a + b;
    return {
      zone: 'add',
      tier,
      story: `${p} found ${a} shells. ${q} found ${b} shells. How many shells did they find in all?`,
      ask: asks(r, 'How many shells they found together', [`How many more shells ${a > b ? p : q} found`, `How many shells ${q} found`]),
      op: '+',
      answer: ans,
      unit,
      choices: numChoices(r, ans, [[addNoCarry(a, b), 'no-regroup'], [Math.abs(a - b), 'wrong-op'], [ans + 10, 'off-ten']], unit),
      model: { kind: 'join', parts: [a, b], total: null, unit },
      strategy: `Join the two parts: ${a} + ${b} = ${ans}.`,
    };
  }
  if (tier === 2) {
    // change unknown: start + ? = end (the key word "more" tempts you to add)
    const start = int(r, 15, 58);
    const add = int(r, 12, 39);
    const end = start + add;
    return {
      zone: 'add',
      tier,
      story: `${p} had ${start} shells. Then ${p} found some more. Now ${p} has ${end} shells. How many shells did ${p} find?`,
      ask: asks(r, `How many shells ${p} found`, [`How many shells ${p} has now`, `How many shells ${p} had at first`]),
      op: '−',
      trap: '+',
      answer: add,
      unit,
      choices: numChoices(r, add, [[start + end, 'keyword-trap'], [subSmallerFromBigger(end, start), 'smaller-from-bigger'], [add + 10, 'off-ten']], unit),
      model: { kind: 'join', parts: [start, null], total: end, unit },
      strategy: `The whole is ${end} and one part is ${start}. The missing part is ${end} − ${start} = ${add}.`,
    };
  }
  // start unknown: ? + found = now
  const found = int(r, 118, 365);
  const startN = int(r, 126, 480);
  const now = startN + found;
  return {
    zone: 'add',
    tier,
    story: `Mo had some shells in his jar. He found ${found} more on the beach. Now he has ${now} shells. How many shells did Mo have at first?`,
    ask: asks(r, 'How many shells Mo had at first', ['How many shells Mo has now', 'How many shells Mo found on the beach']),
    op: '−',
    trap: '+',
    answer: startN,
    unit,
    choices: numChoices(r, startN, [[now + found, 'keyword-trap'], [subSmallerFromBigger(now, found), 'smaller-from-bigger'], [startN + 100, 'other']], unit),
    model: { kind: 'join', parts: [null, found], total: now, unit },
    strategy: `The whole is ${now} and one part is ${found}. The start is ${now} − ${found} = ${startN}.`,
  };
}

function subProblem(tier: Tier, r: Rand): WordProblem {
  const [p, q] = twoNames(r);
  const unit = 'fish';
  if (tier === 1) {
    // take away
    let a = int(r, 31, 98);
    let b = int(r, 12, a - 5);
    if (a % 10 >= b % 10 && r() < 0.6) {
      // usually needs a trade
      b = Math.min(a - 5, b - (b % 10) + Math.min(9, (a % 10) + 1 + int(r, 0, 3)));
      if (b <= 0) b = 13;
      if (b >= a) a = b + 8;
    }
    const ans = a - b;
    return {
      zone: 'sub',
      tier,
      story: `Ana caught ${a} fish. She sold ${b} of them at the market. How many fish does Ana have left?`,
      ask: asks(r, 'How many fish Ana has left', ['How many fish Ana caught', 'How many fish she sold and kept in all']),
      op: '−',
      answer: ans,
      unit,
      choices: numChoices(r, ans, [[subSmallerFromBigger(a, b), 'smaller-from-bigger'], [a + b, 'wrong-op'], [ans + 10, 'off-ten']], unit),
      model: { kind: 'join', parts: [b, null], total: a, unit },
      strategy: `Start with ${a} and take away ${b}: ${a} − ${b} = ${ans}.`,
    };
  }
  if (tier === 2) {
    // compare: how many more (the word "more" tempts you to add)
    const big = int(r, 41, 96);
    const small = int(r, 15, big - 8);
    const ans = big - small;
    return {
      zone: 'sub',
      tier,
      story: `${p} caught ${big} fish. ${q} caught ${small} fish. How many more fish did ${p} catch than ${q}?`,
      ask: asks(r, `How many more fish ${p} caught than ${q}`, ['How many fish they caught in all', `How many fish ${q} caught`]),
      op: '−',
      trap: '+',
      answer: ans,
      unit,
      choices: numChoices(r, ans, [[big + small, 'keyword-trap'], [subSmallerFromBigger(big, small), 'smaller-from-bigger'], [ans + 10, 'off-ten']], unit),
      model: { kind: 'compare', big, small, label: [p, q], unit },
      strategy: `Compare the two bars: ${big} − ${small} = ${ans} more.`,
    };
  }
  // how many more are needed to fill the boat (3-digit)
  const cap = pick(r, [300, 400, 500, 600, 750]);
  const has = int(r, 112, cap - 40);
  const ans = cap - has;
  return {
    zone: 'sub',
    tier,
    story: `The big boat can hold ${cap} fish. It already has ${has} fish. How many more fish can it hold?`,
    ask: asks(r, 'How many more fish fit in the boat', ['How many fish the boat holds in all', 'How many fish are in the boat now']),
    op: '−',
    trap: '+',
    answer: ans,
    unit,
    choices: numChoices(r, ans, [[cap + has, 'keyword-trap'], [subSmallerFromBigger(cap, has), 'smaller-from-bigger'], [ans + 100, 'other']], unit),
    model: { kind: 'join', parts: [has, null], total: cap, unit },
    strategy: `Count up from ${has} to ${cap}, or subtract: ${cap} − ${has} = ${ans}.`,
  };
}

function mulProblem(tier: Tier, r: Rand): WordProblem {
  const unit = 'coconuts';
  if (tier === 1) {
    const each = pick(r, [2, 5, 10]);
    const groups = int(r, 2, 9);
    const ans = groups * each;
    return {
      zone: 'mul',
      tier,
      story: `Tavi has ${groups} coconut trees. Each tree has ${each} coconuts. How many coconuts are there in all?`,
      ask: asks(r, 'How many coconuts on all the trees', ['How many coconuts on one tree', 'How many trees Tavi has']),
      op: '×',
      answer: ans,
      unit,
      choices: numChoices(r, ans, [[groups + each, 'added-instead'], [ans + each, 'fact-slip'], [ans - each, 'fact-slip']], unit),
      model: { kind: 'groups', groups, each, unit },
      strategy: `${groups} groups of ${each}: count by ${each}s, ${groups} times. ${groups} × ${each} = ${ans}.`,
    };
  }
  if (tier === 2) {
    const rows = int(r, 3, 9);
    const cols = int(r, 3, 9);
    const ans = rows * cols;
    return {
      zone: 'mul',
      tier,
      story: `Tavi planted ${rows} rows of palm trees with ${cols} trees in each row. How many palm trees did Tavi plant?`,
      ask: asks(r, 'How many palm trees in all the rows', ['How many trees in one row', 'How many rows there are']),
      op: '×',
      answer: ans,
      unit: 'trees',
      choices: numChoices(r, ans, [[rows + cols, 'added-instead'], [ans + cols, 'fact-slip'], [ans - rows, 'fact-slip']], 'trees'),
      model: { kind: 'array', rows, cols, unit: 'trees' },
      strategy: `An array of ${rows} rows of ${cols}: ${rows} × ${cols} = ${ans}.`,
    };
  }
  if (r() < 0.35) {
    // times as many
    const base = int(r, 4, 12);
    const k = int(r, 3, 6);
    const ans = base * k;
    return {
      zone: 'mul',
      tier,
      story: `Ana picked ${base} coconuts. Tavi picked ${k} times as many coconuts as Ana. How many coconuts did Tavi pick?`,
      ask: asks(r, 'How many coconuts Tavi picked', ['How many coconuts Ana picked', 'How many they picked together']),
      op: '×',
      trap: '+',
      answer: ans,
      unit,
      choices: numChoices(r, ans, [[base + k, 'added-instead'], [ans + base, 'wrong-question'], [ans + base * 1, 'fact-slip']], unit),
      model: { kind: 'groups', groups: k, each: base, unit },
      strategy: `${k} times as many as ${base} means ${k} groups of ${base}: ${k} × ${base} = ${ans}.`,
    };
  }
  // two-digit x one-digit (with a carry)
  let a = int(r, 13, 48);
  const b = int(r, 3, 8);
  if (((a % 10) * b) < 10) a += 5;
  const ans = a * b;
  const ones = (a % 10) * b;
  const tens = Math.floor(a / 10) * b;
  return {
    zone: 'mul',
    tier,
    story: `Each crate holds ${a} coconuts. Tavi fills ${b} crates for the market. How many coconuts is that?`,
    ask: asks(r, 'How many coconuts in all the crates', ['How many coconuts in one crate', 'How many crates Tavi fills']),
    op: '×',
    answer: ans,
    unit,
    choices: numChoices(r, ans, [[Number(`${tens}${ones}`), 'place-value'], [tens * 10 + (ones % 10), 'no-regroup'], [a + b, 'added-instead']], unit),
    model: { kind: 'groups', groups: b, each: a, unit },
    strategy: `Split ${a} into ${Math.floor(a / 10) * 10} and ${a % 10}: ${b} × ${Math.floor(a / 10) * 10} = ${tens * 10}, ${b} × ${a % 10} = ${ones}, and ${tens * 10} + ${ones} = ${ans}.`,
  };
}

function divProblem(tier: Tier, r: Rand): WordProblem {
  const unit = 'mangoes';
  if (tier === 1) {
    const groups = int(r, 2, 5);
    const each = int(r, 2, 9);
    const total = groups * each;
    return {
      zone: 'div',
      tier,
      story: `Bao shares ${total} mangoes equally into ${groups} baskets. How many mangoes go in each basket?`,
      ask: asks(r, 'How many mangoes in each basket', ['How many baskets there are', 'How many mangoes Bao has in all']),
      op: '÷',
      answer: each,
      unit,
      choices: numChoices(r, each, [[total - groups, 'wrong-op'], [total * groups, 'wrong-op'], [each + 1, 'fact-slip']], unit),
      model: { kind: 'share', total, size: groups, unit, askGroups: false },
      strategy: `Share ${total} into ${groups} equal groups: ${total} ÷ ${groups} = ${each}, because ${groups} × ${each} = ${total}.`,
    };
  }
  if (tier === 2) {
    const size = int(r, 3, 9);
    const groups = int(r, 3, 9);
    const total = size * groups;
    return {
      zone: 'div',
      tier,
      story: `Bao has ${total} mangoes. Bao puts ${size} mangoes in each bag. How many bags can Bao fill?`,
      ask: asks(r, 'How many bags Bao can fill', ['How many mangoes in one bag', 'How many mangoes Bao has']),
      op: '÷',
      answer: groups,
      unit: 'bags',
      choices: numChoices(r, groups, [[total - size, 'wrong-op'], [total + size, 'added-instead'], [groups + 1, 'fact-slip']], 'bags'),
      model: { kind: 'share', total, size, unit, askGroups: true },
      strategy: `How many ${size}s make ${total}? ${total} ÷ ${size} = ${groups}, because ${size} × ${groups} = ${total}.`,
    };
  }
  // remainders: round up for boats, drop the rest for full bags
  const size = int(r, 3, 6);
  let total = int(r, 15, 50);
  if (total % size === 0) total += int(r, 1, size - 1);
  const q = Math.floor(total / size);
  const rem = total % size;
  if (r() < 0.5) {
    return {
      zone: 'div',
      tier,
      story: `${total} kids want a boat ride around the island. Each boat holds ${size} kids. How many boats are needed so everyone gets a ride?`,
      ask: asks(r, 'How many boats are needed for everyone', ['How many kids fit in one boat', 'How many kids are left over']),
      op: '÷',
      answer: q + 1,
      unit: 'boats',
      choices: numChoices(r, q + 1, [[q, 'remainder-ignored'], [rem, 'remainder-as-answer'], [total - size, 'wrong-op']], 'boats'),
      model: { kind: 'share', total, size, unit: 'kids', askGroups: true },
      strategy: `${total} ÷ ${size} = ${q} with ${rem} left over. Those ${rem} kids need a boat too, so ${q + 1} boats.`,
    };
  }
  return {
    zone: 'div',
    tier,
    story: `Bao has ${total} mangoes. Bao packs ${size} in each bag. How many bags can Bao fill all the way?`,
    ask: asks(r, 'How many full bags Bao can pack', ['How many mangoes are left over', 'How many mangoes go in one bag']),
    op: '÷',
    answer: q,
    unit: 'bags',
    choices: numChoices(r, q, [[q + 1, 'remainder-kept'], [rem, 'remainder-as-answer'], [total - size, 'wrong-op']], 'bags'),
    model: { kind: 'share', total, size, unit, askGroups: true },
    strategy: `${total} ÷ ${size} = ${q} with ${rem} left over. The leftover ${rem} cannot fill a bag, so ${q} full bags.`,
  };
}

export function makeWordProblem(zone: Zone, tier: Tier, r: Rand): WordProblem {
  if (zone === 'add') return addProblem(tier, r);
  if (zone === 'sub') return subProblem(tier, r);
  if (zone === 'mul') return mulProblem(tier, r);
  return divProblem(tier, r);
}

/** The mistake behind picking an operation. */
export function opMistake(p: WordProblem, picked: Op): Misconception | null {
  if (picked === p.op) return null;
  return picked === p.trap ? 'keyword-trap' : 'wrong-op';
}

// ------------------------------------------------------------ treasure clues

export const GRID = { cols: 5, rows: 4 };
export const COL_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export interface Square {
  col: number; // 0-based, left to right
  row: number; // 0-based, bottom to top
}
/** "B3" (letter for the column, number for the row) or "(2, 3)" at the top tier. */
export function squareName(s: Square, ordered: boolean): string {
  return ordered ? `(${s.col + 1}, ${s.row + 1})` : `${COL_LETTERS[s.col]}${s.row + 1}`;
}

export interface TreasureClue {
  tier: Tier;
  story: string;
  exact: number;
  /** Step 1: estimate (round, then compute). */
  estimate: number;
  estimateHow: string;
  estimateChoices: Choice[];
  /** Step 2: calculate. */
  computeChoices: Choice[];
  /** Step 3: Pip's answer to check. */
  pipAnswer: number;
  reasonable: boolean;
  /** How far from the estimate a good answer can be (rounding can move it this much). */
  tolerance: number;
  /** Step 4: where to dig. */
  square: Square;
  ordered: boolean;
}

const roundTo = (n: number, place: number) => Math.round(n / place) * place;

export function makeClue(tier: Tier, r: Rand, square: Square): TreasureClue {
  let a: number;
  let b: number;
  let op: '+' | '−' | '×';
  let story: string;
  let estimate: number;
  let estimateHow: string;
  let exact: number;
  let wrongs: Array<[number, Misconception]>;
  let estWrongs: Array<[number, Misconception]>;
  if (tier === 1) {
    a = int(r, 23, 69);
    b = int(r, 14, 49);
    op = r() < 0.6 ? '+' : '−';
    if (op === '−' && b >= a) [a, b] = [b + 20, a];
    exact = op === '+' ? a + b : a - b;
    const ra = roundTo(a, 10);
    const rb = roundTo(b, 10);
    estimate = op === '+' ? ra + rb : ra - rb;
    estimateHow = `${a} is about ${ra} and ${b} is about ${rb}: ${ra} ${op} ${rb} = ${estimate}.`;
    story = op === '+' ? `Pip the parrot flew ${a} steps along the beach, then ${b} more. How far did Pip fly?` : `The old pirate buried ${a} coins and spent ${b}. How many coins are left?`;
    estWrongs = [[estimate + 10, 'round-wrong'], [estimate - 10, 'round-wrong'], [exact, 'not-rounded']];
    wrongs = op === '+' ? [[addNoCarry(a, b), 'no-regroup'], [exact + 10, 'off-ten']] : [[subSmallerFromBigger(a, b), 'smaller-from-bigger'], [exact + 10, 'off-ten']];
  } else if (tier === 2) {
    a = int(r, 212, 689);
    b = int(r, 118, 449);
    op = r() < 0.6 ? '+' : '−';
    if (op === '−' && b >= a) [a, b] = [b + 150, a];
    exact = op === '+' ? a + b : a - b;
    const ra = roundTo(a, 100);
    const rb = roundTo(b, 100);
    estimate = op === '+' ? ra + rb : ra - rb;
    estimateHow = `${a} is about ${ra} and ${b} is about ${rb}: ${ra} ${op} ${rb} = ${estimate}.`;
    story = op === '+' ? `The treasure ship sailed ${a} miles one day and ${b} miles the next. How far did it sail?` : `A chest held ${a} gold coins. Pirates took ${b}. How many coins are still in the chest?`;
    estWrongs = [[estimate + 100, 'round-wrong'], [estimate - 100, 'round-wrong'], [exact, 'not-rounded']];
    wrongs = op === '+' ? [[addNoCarry(a, b), 'no-regroup'], [exact + 100, 'other']] : [[subSmallerFromBigger(a, b), 'smaller-from-bigger'], [exact + 100, 'other']];
  } else {
    a = int(r, 21, 89);
    b = int(r, 3, 9);
    op = '×';
    exact = a * b;
    const ra = roundTo(a, 10);
    estimate = ra * b;
    estimateHow = `${a} is about ${ra}: ${ra} × ${b} = ${estimate}.`;
    story = `Each treasure map has ${a} squares. The captain has ${b} maps. How many squares is that in all?`;
    estWrongs = [[estimate + b * 10, 'round-wrong'], [estimate - b * 10, 'round-wrong'], [exact, 'not-rounded']];
    const ones = (a % 10) * b;
    const tens = Math.floor(a / 10) * b;
    wrongs = [[Number(`${tens}${ones}`), 'place-value'], [tens * 10 + (ones % 10), 'no-regroup']];
  }
  const estimateChoices = numChoices(r, estimate, estWrongs.filter(([v]) => v > 0), '');
  const computeChoices = numChoices(r, exact, wrongs, '');
  // Pip's answer: sometimes right, sometimes way off (10 times too big, a hundred or a thousand off)
  const tolerance = tier === 1 ? 20 : tier === 2 ? 150 : 8 * b;
  let pipAnswer = exact;
  if (r() < 0.5) {
    const far = shuffle(r, [exact * 10, exact + (tier === 1 ? 100 : 1000), Math.round(exact / 10)]).find((v) => !isReasonable(v, estimate, tolerance));
    if (far !== undefined) pipAnswer = far;
  }
  const reasonable = isReasonable(pipAnswer, estimate, tolerance);
  return { tier, story, exact, estimate, estimateHow, estimateChoices, computeChoices, pipAnswer, reasonable, tolerance, square, ordered: tier === 3 };
}

/** Is an answer close enough to the estimate to be reasonable? */
export function isReasonable(answer: number, estimate: number, tolerance: number): boolean {
  return Math.abs(answer - estimate) <= tolerance;
}

/** The mistake behind digging in the wrong square. */
export function digMistake(dug: Square, target: Square): Misconception | null {
  if (dug.col === target.col && dug.row === target.row) return null;
  if (dug.col === target.row && dug.row === target.col) return 'swapped-xy';
  return 'wrong-square';
}

/** Four different dig squares for the four map pieces. */
export function digSquares(r: Rand): Square[] {
  const all: Square[] = [];
  for (let c = 0; c < GRID.cols; c++) for (let rr = 0; rr < GRID.rows; rr++) all.push({ col: c, row: rr });
  // keep squares whose swap is also on the grid sometimes, so (x, y) order matters
  return shuffle(r, all).slice(0, 4);
}

// ------------------------------------------------------------ the quiz show

export type Category = 'addsub' | 'muldiv' | 'words' | 'estimate';
export const CATEGORIES: Category[] = ['addsub', 'muldiv', 'words', 'estimate'];
export const VALUES = [100, 200, 300];

export interface StrategyBonus {
  text: string;
  options: Choice<string>[];
}

export interface QuizQuestion {
  category: Category;
  value: number;
  text: string;
  choices: Choice[];
  explain: string;
  bonus: StrategyBonus | null;
}

function strategyBonus(r: Rand, a: number, op: '+' | '−' | '×' | '÷', b: number): StrategyBonus {
  let right: string;
  let wrong: string[];
  if (op === '+') {
    const up = Math.ceil(a / 10) * 10;
    const d = up - a;
    right = d ? `${up} + ${b} − ${d}` : `${a} + ${Math.floor(b / 10) * 10} + ${b % 10}`;
    wrong = d ? [`${up} + ${b} + ${d}`, `${up} + ${b}`] : [`${a} + ${b % 10}`, `${a} + ${b} + 10`];
  } else if (op === '−') {
    right = `${a} − ${Math.floor(b / 10) * 10} − ${b % 10}`;
    wrong = [`${a} − ${Math.floor(b / 10) * 10} + ${b % 10}`, `${b} − ${a}`];
  } else if (op === '×') {
    const s = Math.min(5, b - 1);
    right = `${a} × ${s} + ${a} × ${b - s}`;
    wrong = [`${a} × ${s} + ${b - s}`, `${a} + ${b}`];
  } else {
    right = `Think: ${b} × ? = ${a}`;
    wrong = [`Think: ${a} − ${b}`, `Think: ${a} × ${b}`];
  }
  return {
    text: 'Bonus! Which way also works for this problem?',
    options: shuffle(r, [{ value: right, label: right, correct: true }, ...wrong.map((w) => ({ value: w, label: w, correct: false, misconception: 'wrong-strategy' as Misconception }))]),
  };
}

export function makeQuizQuestion(category: Category, value: number, r: Rand): QuizQuestion {
  const tier = (VALUES.indexOf(value) + 1) as Tier;
  if (category === 'words') {
    const zone = pick(r, ZONES);
    const p = makeWordProblem(zone, tier, r);
    return { category, value, text: p.story, choices: p.choices, explain: p.strategy, bonus: null };
  }
  if (category === 'estimate') {
    const clue = makeClue(tier, r, { col: 0, row: 0 });
    return { category, value, text: `${clue.story} Estimate first: about how much?`, choices: clue.estimateChoices, explain: clue.estimateHow, bonus: null };
  }
  if (category === 'addsub') {
    const op: '+' | '−' = r() < 0.5 ? '+' : '−';
    const a = tier === 1 ? int(r, 26, 68) : tier === 2 ? int(r, 41, 97) : int(r, 213, 794);
    const b = tier === 1 ? int(r, 13, 29) : tier === 2 ? int(r, 15, 38) : int(r, 116, Math.min(399, a - 20));
    const ans = op === '+' ? a + b : a - b;
    const choices = numChoices(r, ans, op === '+' ? [[addNoCarry(a, b), 'no-regroup'], [ans + 10, 'off-ten']] : [[subSmallerFromBigger(a, b), 'smaller-from-bigger'], [ans + 10, 'off-ten']], '');
    return { category, value, text: `${a} ${op} ${b} = ?`, choices, explain: `${a} ${op} ${b} = ${ans}.`, bonus: value >= 200 ? strategyBonus(r, a, op, b) : null };
  }
  // multiply and divide
  if (r() < 0.5) {
    const a = tier === 3 ? int(r, 12, 29) : int(r, 3, 9);
    const b = int(r, tier === 1 ? 2 : 3, tier === 1 ? 5 : 9);
    const ans = a * b;
    const choices = numChoices(r, ans, [[a + b, 'added-instead'], [ans + a, 'fact-slip'], [ans - b, 'fact-slip']], '');
    return { category, value, text: `${a} × ${b} = ?`, choices, explain: `${a} × ${b} = ${ans}.`, bonus: value >= 200 ? strategyBonus(r, a, '×', b) : null };
  }
  const b = int(r, tier === 1 ? 2 : 3, tier === 1 ? 5 : 9);
  const q = int(r, 2, tier === 3 ? 12 : 9);
  const a = b * q;
  const choices = numChoices(r, q, [[a - b, 'wrong-op'], [q + 1, 'fact-slip'], [a * b, 'wrong-op']], '');
  return { category, value, text: `${a} ÷ ${b} = ?`, choices, explain: `${a} ÷ ${b} = ${q}, because ${b} × ${q} = ${a}.`, bonus: value >= 200 ? strategyBonus(r, a, '÷', b) : null };
}

export const BONUS_POINTS = 50;
/** Pip scores the value of each question you miss. You win by beating Pip. */
export function quizWinner(you: number, pip: number): 'you' | 'pip' | 'tie' {
  return you > pip ? 'you' : you < pip ? 'pip' : 'tie';
}
