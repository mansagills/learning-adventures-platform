/**
 * Counting Carnival: every challenge at the four booths, generated from a
 * seed (the same seed always gives the same challenge). Pure functions only.
 *
 *   Duck Pond      count objects, one-to-one, "the last number tells how many"   K.CC.4, K.CC.5, 1.NBT.1
 *   Ring Toss      quick looks on a ten-frame, then "how many more make 10?"     K.CC.4, K.OA.3, K.OA.4
 *   Munch's Snacks more / fewer, 1 more / 1 less, 10 more / 10 less          K.CC.6, K.CC.7, 1.NBT.3, 1.NBT.5
 *   Prize Counter  tickets in tens and ones, up to 120                         1.NBT.1, 1.NBT.2, 2.NBT.1
 *
 * Each booth has three levels; the learner model moves the player between
 * them. Level 1 is kindergarten, level 3 reaches first and second grade.
 */

export const BOOTHS = ['ducks', 'rings', 'snacks', 'tickets'] as const;
export type Booth = (typeof BOOTHS)[number];

/** Short ids for the idea behind a wrong answer. The game explains each one. */
export type Misconception =
  | 'skipped' // missed one while counting (one too few)
  | 'double-counted' // counted one twice (one too many)
  | 'miscount' // off by one on a quick look
  | 'top-row-only' // saw the full row of 5 and stopped
  | 'said-the-count' // gave the rings already there, not the rings still needed
  | 'said-ten' // answered 10 for "how many more to make 10"
  | 'wrong-way' // more for less, or less for more
  | 'same-number' // answered the starting number
  | 'one-for-ten' // changed the ones instead of the tens
  | 'ten-for-one' // changed the tens instead of the ones
  | 'bigger-looks-more' // picked the plate with bigger cookies, not more cookies
  | 'counted-strips' // said 4 for four strips of ten
  | 'reversed' // 74 for 47
  | 'added-digits' // 4 tens and 7 ones = 11
  | 'tens-off' // a ten too many or too few
  | 'other';

export interface Option {
  label: string;
  value: number;
  correct: boolean;
  misconception?: Misconception;
}

interface Base {
  booth: Booth;
  tier: number;
  /** The words for the challenge (also read aloud). */
  prompt: string;
}

export interface DuckProblem extends Base {
  booth: 'ducks';
  count: number;
  /** row (1-5), scattered (6-10), or a full row of ten plus more (11-20) */
  layout: 'row' | 'scatter' | 'ten-and-more';
  /** Number tags on tapped ducks: stay, fade after a moment, or none (count the ten as a group). */
  tags: 'show' | 'fade' | 'none';
  options: Option[];
}

export interface RingProblem extends Base {
  booth: 'rings';
  mode: 'how-many' | 'make-ten';
  /** Rings already on the ten-frame pegs. */
  count: number;
  /** Rings are shown only for a moment (quick look). */
  flash: boolean;
  answer: number;
  options: Option[];
}

export interface Plate {
  count: number;
  size: 'big' | 'small';
}

export interface SnackProblem extends Base {
  booth: 'snacks';
  mode: 'compare' | 'one-more' | 'ten-more';
  /** compare: which plate Munch wants */
  ask?: 'more' | 'fewer';
  plates?: [Plate, Plate];
  /** one-more / ten-more */
  base?: number;
  delta?: number;
  answer: number;
  options: Option[];
}

export interface TicketProblem extends Base {
  booth: 'tickets';
  mode: 'count-tens' | 'count-tens-ones' | 'build';
  tens: number;
  ones: number;
  answer: number;
  options: Option[];
  /** build: the prize the player is paying for */
  prize?: string;
}

export type Problem = DuckProblem | RingProblem | SnackProblem | TicketProblem;

// ------------------------------------------------------------------ random

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

/** Up to three options (the answer plus two distinct wrong ones), shuffled by the seed. */
function choices(r: () => number, answer: number, wrong: Array<[number, Misconception]>, label = (n: number) => String(n)): Option[] {
  const out: Option[] = [{ label: label(answer), value: answer, correct: true }];
  for (const [v, m] of wrong) {
    if (out.length >= 3) break;
    if (v < 0 || v > 200 || out.some((o) => o.value === v)) continue;
    out.push({ label: label(v), value: v, correct: false, misconception: m });
  }
  // Always offer three, falling back to near misses.
  for (let d = 2; out.length < 3; d++) {
    const v = answer + (out.length % 2 ? d : -d);
    if (v >= 0 && !out.some((o) => o.value === v)) out.push({ label: label(v), value: v, correct: false, misconception: 'other' });
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ------------------------------------------------------------------ generators

export function makeProblem(booth: Booth, tier: number, seed: number): Problem {
  const r = rng(seed);
  const t = Math.min(3, Math.max(1, Math.round(tier)));
  switch (booth) {
    case 'ducks':
      return ducks(r, t);
    case 'rings':
      return rings(r, t);
    case 'snacks':
      return snacks(r, t);
    case 'tickets':
      return tickets(r, t);
  }
}

function ducks(r: () => number, tier: number): DuckProblem {
  const count = tier === 1 ? int(r, 2, 5) : tier === 2 ? int(r, 6, 10) : int(r, 11, 20);
  return {
    booth: 'ducks',
    tier,
    count,
    layout: tier === 1 ? 'row' : tier === 2 ? 'scatter' : 'ten-and-more',
    tags: tier === 1 ? 'show' : tier === 2 ? 'fade' : 'none',
    prompt: tier === 3 ? 'The top row has ten ducks. How many ducks in all?' : 'Tap each duck to count it. How many ducks?',
    options: choices(r, count, [
      [count - 1, 'skipped'],
      [count + 1, 'double-counted'],
    ]),
  };
}

function rings(r: () => number, tier: number): RingProblem {
  if (tier === 3) {
    const count = int(r, 1, 9);
    const answer = 10 - count;
    return {
      booth: 'rings',
      tier,
      mode: 'make-ten',
      count,
      flash: false,
      answer,
      prompt: `There are ${count} rings. How many more rings make 10?`,
      options: choices(r, answer, [
        [count, 'said-the-count'],
        [answer + 1, 'miscount'],
        [10, 'said-ten'],
        [answer - 1, 'miscount'],
      ]),
    };
  }
  const count = tier === 1 ? int(r, 1, 5) : int(r, 6, 10);
  return {
    booth: 'rings',
    tier,
    mode: 'how-many',
    count,
    flash: tier === 2,
    answer: count,
    prompt: tier === 2 ? 'Quick look! How many rings did you see?' : 'How many rings are on the pegs?',
    options: choices(r, count, [
      ...(count > 5 ? ([[5, 'top-row-only']] as Array<[number, Misconception]>) : []),
      [count + 1, 'miscount'],
      [count - 1, 'miscount'],
    ]),
  };
}

function snacks(r: () => number, tier: number): SnackProblem {
  if (tier === 1) {
    const a = int(r, 1, 8);
    let b = int(r, 1, 9);
    while (b === a) b = int(r, 1, 9);
    const ask: 'more' | 'fewer' = r() < 0.6 ? 'more' : 'fewer';
    // Half the time the plate with fewer cookies has the big ones: a classic trap.
    const trap = r() < 0.5;
    const plates: [Plate, Plate] = [
      { count: a, size: trap && a < b ? 'big' : 'small' },
      { count: b, size: trap && b < a ? 'big' : 'small' },
    ];
    const wantLeft = ask === 'more' ? a > b : a < b;
    const answer = wantLeft ? 0 : 1;
    // with the size trap on, the wrong plate is the one that LOOKS right
    const wrongMis: Misconception = trap ? 'bigger-looks-more' : 'wrong-way';
    return {
      booth: 'snacks',
      tier,
      mode: 'compare',
      ask,
      plates,
      answer,
      prompt: ask === 'more' ? 'Munch wants the plate with MORE cookies. Which plate?' : 'Munch is full. Give Munch the plate with FEWER cookies.',
      options: [
        { label: 'This plate', value: 0, correct: answer === 0, misconception: answer === 0 ? undefined : wrongMis },
        { label: 'This plate', value: 1, correct: answer === 1, misconception: answer === 1 ? undefined : wrongMis },
      ],
    };
  }
  if (tier === 2) {
    const delta = r() < 0.6 ? 1 : -1;
    const base = delta > 0 ? int(r, 3, 19) : int(r, 2, 20);
    const answer = base + delta;
    return {
      booth: 'snacks',
      tier,
      mode: 'one-more',
      base,
      delta,
      answer,
      prompt: `Munch wants ${delta > 0 ? '1 more' : '1 less'} than ${base}. Which number?`,
      options: choices(r, answer, [
        [base - delta, 'wrong-way'],
        [base, 'same-number'],
        [base + 10 * delta, 'ten-for-one'],
      ]),
    };
  }
  const delta = r() < 0.6 ? 10 : -10;
  const base = delta > 0 ? int(r, 11, 89) : int(r, 20, 99);
  const answer = base + delta;
  return {
    booth: 'snacks',
    tier,
    mode: 'ten-more',
    base,
    delta,
    answer,
    prompt: `Munch wants ${delta > 0 ? '10 more' : '10 less'} than ${base}. Which number?`,
    options: choices(r, answer, [
      [base + Math.sign(delta), 'one-for-ten'],
      [base - delta, 'wrong-way'],
      [base, 'same-number'],
    ]),
  };
}

const PRIZES = ['a teddy bear', 'a kite', 'a yo-yo', 'a toy drum', 'a star wand', 'a pinwheel', 'a robot', 'a beach ball'];

function tickets(r: () => number, tier: number): TicketProblem {
  if (tier === 1) {
    const tens = int(r, 2, 9);
    const answer = tens * 10;
    return {
      booth: 'tickets',
      tier,
      mode: 'count-tens',
      tens,
      ones: 0,
      answer,
      prompt: 'Each strip has 10 tickets. Count by tens. How many tickets?',
      options: choices(r, answer, [
        [tens, 'counted-strips'],
        [answer + 10, 'tens-off'],
        [answer - 10, 'tens-off'],
      ]),
    };
  }
  if (tier === 2) {
    const tens = int(r, 1, 9);
    let ones = int(r, 1, 9);
    if (ones === tens) ones = ones === 9 ? 8 : ones + 1;
    const answer = tens * 10 + ones;
    return {
      booth: 'tickets',
      tier,
      mode: 'count-tens-ones',
      tens,
      ones,
      answer,
      prompt: 'Strips are 10 tickets. Single tickets are 1. How many tickets in all?',
      options: choices(r, answer, [
        [ones * 10 + tens, 'reversed'],
        [tens + ones, 'added-digits'],
        [answer + 10, 'tens-off'],
      ]),
    };
  }
  const answer = int(r, 21, 120);
  const prize = PRIZES[int(r, 0, PRIZES.length - 1)];
  return {
    booth: 'tickets',
    tier,
    mode: 'build',
    tens: Math.floor(answer / 10),
    ones: answer % 10,
    answer,
    prize,
    prompt: `${prize[0].toUpperCase()}${prize.slice(1)} costs ${answer} tickets. Put out exactly ${answer} tickets.`,
    options: [],
  };
}

// ------------------------------------------------------------------ checking a built amount

/** Prize Counter level 3: what idea might explain the amount the player put out? */
export function diagnoseBuild(answer: number, built: number): Misconception | null {
  if (built === answer) return null;
  const at = Math.floor(answer / 10);
  const ao = answer % 10;
  const bt = Math.floor(built / 10);
  const bo = built % 10;
  if (bt === ao && bo === at) return 'reversed';
  if (Math.abs(built - answer) === 10) return 'tens-off';
  if (Math.abs(built - answer) === 1) return built < answer ? 'skipped' : 'double-counted';
  if (built === at + ao) return 'added-digits';
  return 'other';
}

/** Ten-frame layout for Ring Toss: pegs fill the top row first, left to right. */
export function tenFrame(count: number): boolean[] {
  return Array.from({ length: 10 }, (_, i) => i < count);
}
