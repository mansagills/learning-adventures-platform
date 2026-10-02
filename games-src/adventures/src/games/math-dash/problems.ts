/**
 * Library Rush: the numbers on the books and the shelves they belong on.
 *
 * Pure functions only (no drawing, no timers), so every rule can be unit
 * tested. A run walks through three stages:
 *
 * 1. Picture Books: 0–59, one shelf per ten (place value: tens and ones).
 * 2. Chapter Books: 100–599, one shelf per hundred (hundreds, tens, ones).
 * 3. Reference: 0–999 on shelves like "< 250", "250 to 499", "> 749"
 *    (comparing three-digit numbers, the < and > symbols).
 *
 * Books are not random in a flat way: many are chosen so that the usual
 * mistakes (reading the last digit, thinking 98 is big because 9 is big)
 * would send them to a real, wrong shelf. That is what lets the game catch
 * and explain the mistake.
 */

export type Stage = 1 | 2 | 3;
export const STAGES: Stage[] = [1, 2, 3];

/** Right answers needed in a stage before the run moves on. */
export const BOOKS_PER_STAGE = 12;

export interface Shelf {
  id: string;
  lo: number;
  hi: number;
  /** What the sign says, e.g. "20–29", "300–399", "< 250". */
  label: string;
  /** The same in the pixel font on the bookcase sign (digits, -, <, > and s only). */
  sign: string;
  /** The same, said in words (read-aloud and screen readers). */
  spoken: string;
}

export type Misconception =
  | 'last-digit' // used the ones digit as if it were the tens (or hundreds)
  | 'middle-digit' // used the tens digit as if it were the hundreds
  | 'two-digit-big' // a two-digit number put with big three-digit numbers (98 "looks" big)
  | 'boundary' // a number right next to a shelf's edge, one shelf off
  | 'symbol-flip' // mixed up < and >
  | 'next-shelf' // one shelf off
  | 'other';

export const SKILL_ID: Record<Stage, string> = { 1: 'tens', 2: 'hundreds', 3: 'compare' };

/** The shelves for a stage. Stage 3 picks its cut points with the given random source. */
export function makeShelves(stage: Stage, rnd: () => number = Math.random): Shelf[] {
  if (stage === 1) {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `t${i}`,
      lo: i * 10,
      hi: i * 10 + 9,
      label: `${i * 10}–${i * 10 + 9}`,
      sign: `${i * 10}-${i * 10 + 9}`,
      spoken: `${i * 10} to ${i * 10 + 9}`,
    }));
  }
  if (stage === 2) {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `h${i + 1}`,
      lo: (i + 1) * 100,
      hi: (i + 1) * 100 + 99,
      label: `${i + 1}00–${i + 1}99`,
      sign: `${i + 1}00-${i + 1}99`,
      spoken: `${i + 1} hundred to ${i + 1} hundred 99`,
    }));
  }
  // Stage 3: four shelves with cuts on multiples of 50, at least 150 apart.
  const pick = (lo: number, hi: number) => lo + 50 * Math.floor(rnd() * ((hi - lo) / 50 + 1));
  const a = pick(150, 300);
  const b = pick(a + 150, a + 300);
  const c = pick(b + 150, Math.min(900, b + 300));
  return [
    { id: 'c0', lo: 0, hi: a - 1, label: `< ${a}`, sign: `<${a}`, spoken: `less than ${a}` },
    { id: 'c1', lo: a, hi: b - 1, label: `${a} to ${b - 1}`, sign: `${a}-${b - 1}`, spoken: `${a} to ${b - 1}` },
    { id: 'c2', lo: b, hi: c - 1, label: `${b} to ${c - 1}`, sign: `${b}-${c - 1}`, spoken: `${b} to ${c - 1}` },
    { id: 'c3', lo: c, hi: 999, label: `> ${c - 1}`, sign: `>${c - 1}`, spoken: `more than ${c - 1}` },
  ];
}

export function shelfFor(n: number, shelves: Shelf[]): Shelf | null {
  return shelves.find((s) => n >= s.lo && n <= s.hi) ?? null;
}

const randInt = (rnd: () => number, lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));

/** The call number for a new book. */
export function makeBookNumber(stage: Stage, shelves: Shelf[], rnd: () => number = Math.random): number {
  const trap = rnd() < 0.55;
  if (stage === 1) {
    if (trap) {
      // tens and ones are both 0–5 and different: the ones digit names a real, wrong shelf
      const t = randInt(rnd, 0, 5);
      let o = randInt(rnd, 0, 5);
      if (o === t) o = (o + 1 + randInt(rnd, 0, 4)) % 6;
      return t * 10 + o;
    }
    return randInt(rnd, 0, 59);
  }
  if (stage === 2) {
    const h = randInt(rnd, 1, 5);
    if (trap) {
      // the tens or ones digit is a different hundreds shelf
      const other = ((h - 1 + randInt(rnd, 1, 4)) % 5) + 1;
      return rnd() < 0.5 ? h * 100 + other * 10 + randInt(rnd, 0, 9) : h * 100 + randInt(rnd, 0, 9) * 10 + other;
    }
    return randInt(rnd, h * 100, h * 100 + 99);
  }
  // Stage 3
  const r = rnd();
  if (r < 0.2) return randInt(rnd, 60, 99); // two-digit numbers with a big tens digit
  if (r < 0.6) {
    // close to a cut, on either side
    const cuts = shelves.slice(1).map((s) => s.lo);
    const cut = cuts[Math.floor(rnd() * cuts.length)];
    const n = rnd() < 0.5 ? cut - randInt(rnd, 1, 20) : cut + randInt(rnd, 0, 19);
    return Math.max(0, Math.min(999, n));
  }
  return randInt(rnd, 100, 999);
}

/** Why a book went on the wrong shelf (null when it is the right shelf). */
export function diagnose(n: number, chosen: Shelf, shelves: Shelf[], stage: Stage): Misconception | null {
  if (n >= chosen.lo && n <= chosen.hi) return null;
  const right = shelfFor(n, shelves);
  const ri = right ? shelves.indexOf(right) : -1;
  const ci = shelves.indexOf(chosen);
  const ones = n % 10;
  const tens = Math.floor(n / 10) % 10;
  if (stage === 1) {
    if (chosen.lo === ones * 10) return 'last-digit';
    if (Math.abs(ri - ci) === 1) return 'next-shelf';
    return 'other';
  }
  if (stage === 2) {
    if (chosen.lo === ones * 100) return 'last-digit';
    if (chosen.lo === tens * 100) return 'middle-digit';
    if (Math.abs(ri - ci) === 1) return 'next-shelf';
    return 'other';
  }
  if (n < 100 && chosen.lo > n) return 'two-digit-big';
  if ((ci === 0 && ri === shelves.length - 1) || (ci === shelves.length - 1 && ri === 0)) return 'symbol-flip';
  if (Math.abs(ri - ci) === 1) {
    const edge = ci > ri ? chosen.lo : chosen.hi + 1;
    return Math.abs(n - edge) <= 25 ? 'boundary' : 'next-shelf';
  }
  return 'other';
}

/** Hundreds, tens and ones of a number (for Reading Glasses and explanations). */
export function digits(n: number): { h: number; t: number; o: number } {
  return { h: Math.floor(n / 100), t: Math.floor(n / 10) % 10, o: n % 10 };
}

/** The stage after `right` correct shelvings in a run that started at `start`. */
export function stageAfter(start: Stage, right: number): Stage {
  return Math.min(3, start + Math.floor(right / BOOKS_PER_STAGE)) as Stage;
}
