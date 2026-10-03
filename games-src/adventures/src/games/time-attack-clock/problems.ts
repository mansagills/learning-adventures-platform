/**
 * Time Attack Clock: the clock math, as pure functions (no drawing, no
 * timers) so every rule can be unit tested.
 *
 * A time is an hour (1-12) and minutes (0-59), as on a clock face. Three
 * places in town each practise one skill, with three tiers:
 *
 *   School bell (read a clock):     1. hours and half hours  2. five-minute steps  3. to the minute
 *   Bus stop (set the hands):       1. hours and half hours  2. five-minute steps  3. to the minute
 *   Bakery (how long? elapsed time): 1. whole hours  2. minutes inside one hour  3. across the hour
 *
 * Wrong answers are made from real mistakes (hands swapped, the hour hand
 * read as the next hour, minutes counted by ones), so a wrong pick tells the
 * game which idea to explain.
 */

export type Station = 'school' | 'bus' | 'bakery';
export const STATIONS: Station[] = ['school', 'bus', 'bakery'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export interface Time {
  h: number;
  m: number;
}

export type Misconception =
  | 'swapped' // read or set the hour and minute hands the wrong way round
  | 'next-hour' // the hour hand is close to the next number, so read that hour (2:45 as 3:45)
  | 'prev-hour' // one hour too few
  | 'by-ones' // the number the minute hand points to, read as minutes (on the 4 = 4 minutes)
  | 'backwards' // counted the minutes the wrong way round the clock
  | 'half-hour' // mixed up o'clock and half past
  | 'past-to' // mixed up "past" and "to"
  | 'to-hour' // "quarter to 2" for 2:45 (named the hour that has passed)
  | 'off-five' // one five-minute step off
  | 'off-one' // a minute or two off
  | 'off-hour' // a whole hour off (elapsed)
  | 'gave-start' // gave the starting time instead of the end
  | 'hundred-minutes' // subtracted times like ordinary numbers (3:15 - 2:50 = 65)
  | 'minutes-only' // subtracted only the minute numbers
  | 'no-carry' // went past 60 minutes without moving to the next hour (2:75)
  | 'same-hour' // added the minutes but kept the old hour
  | 'other';

export interface Choice {
  /** A unique key ("3:15", "25"). */
  value: string;
  label: string;
  correct: boolean;
  misconception?: Misconception;
}

export type Problem =
  | { kind: 'read'; station: 'school'; tier: Tier; time: Time; words: boolean; choices: Choice[] }
  | { kind: 'set'; station: 'bus'; tier: Tier; time: Time; start: Time; words: boolean; step: number }
  | { kind: 'elapsed'; station: 'bakery'; tier: Tier; start: Time; end: Time; minutes: number; ask: 'end' | 'duration'; choices: Choice[] };

// ------------------------------------------------------------ basics

const wrap12 = (h: number) => ((((h - 1) % 12) + 12) % 12) + 1;

/** Minutes since 12:00 (0-719). */
export function toMinutes(t: Time): number {
  return (t.h % 12) * 60 + t.m;
}

export function fromMinutes(total: number): Time {
  const t = ((total % 720) + 720) % 720;
  return { h: wrap12(Math.floor(t / 60)), m: t % 60 };
}

export function addMinutes(t: Time, n: number): Time {
  return fromMinutes(toMinutes(t) + n);
}

export const same = (a: Time, b: Time) => a.h === b.h && a.m === b.m;

/** "3:05". */
export function fmt(t: Time): string {
  return `${t.h}:${String(t.m).padStart(2, '0')}`;
}

/** "3 o'clock", "half past 3", "quarter to 4", or "3:20". */
export function words(t: Time): string {
  if (t.m === 0) return `${t.h} o'clock`;
  if (t.m === 15) return `quarter past ${t.h}`;
  if (t.m === 30) return `half past ${t.h}`;
  if (t.m === 45) return `quarter to ${wrap12(t.h + 1)}`;
  return fmt(t);
}

/** How a time is said out loud: "3 15", "3 oh 5", "3 o'clock". */
export function say(t: Time): string {
  if (t.m === 0) return `${t.h} o'clock`;
  return t.m < 10 ? `${t.h} oh ${t.m}` : `${t.h} ${t.m}`;
}

/** "25 minutes", "1 hour", "1 hour 10 minutes". */
export function fmtDuration(min: number): string {
  const hrs = Math.floor(min / 60);
  const m = min % 60;
  const hs = hrs ? `${hrs} hour${hrs === 1 ? '' : 's'}` : '';
  const ms = m ? `${m} minute${m === 1 ? '' : 's'}` : '';
  return [hs, ms].filter(Boolean).join(' ') || '0 minutes';
}

/** Angles in degrees clockwise from 12. The hour hand moves a little as the minutes pass. */
export function handAngles(t: Time): { hour: number; minute: number } {
  return { hour: ((t.h % 12) + t.m / 60) * 30, minute: t.m * 6 };
}

/** What the clock says if the two hands are swapped (the hour hand read as minutes and the other way round). */
export function swapped(t: Time): Time {
  const a = handAngles(t);
  const h = wrap12(Math.round(a.minute / 30) || 12);
  const m = Math.round(a.hour / 6) % 60;
  return { h, m };
}

/** The step a tier works in: half hours, five minutes, or single minutes. */
export function stepFor(tier: Tier): number {
  return tier === 1 ? 30 : tier === 2 ? 5 : 1;
}

/** Count on from one time to another in friendly jumps: to the next 5, then to the hour, then hours, then the minutes. */
export function countOn(start: Time, end: Time): Array<{ to: Time; add: number }> {
  const out: Array<{ to: Time; add: number }> = [];
  let cur = toMinutes(start);
  let goal = toMinutes(end);
  if (goal < cur) goal += 720;
  const push = (to: number) => {
    out.push({ to: fromMinutes(to), add: to - cur });
    cur = to;
  };
  if ((goal - cur) % 60 === 0) {
    while (goal > cur) push(cur + 60);
    return out;
  }
  if (cur % 5 && goal - cur >= 5 - (cur % 5)) push(cur + (5 - (cur % 5)));
  if (cur % 60 && Math.ceil(cur / 60) * 60 <= goal) push(Math.ceil(cur / 60) * 60);
  while (goal - cur >= 60) push(cur + 60);
  if (goal - cur >= 5) push(cur + Math.floor((goal - cur) / 5) * 5);
  if (goal > cur) push(goal);
  return out;
}

// ------------------------------------------------------------ making problems

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

/** A time to read or set at this tier. */
export function randomTime(tier: Tier, r: Rand): Time {
  const h = int(r, 1, 12);
  if (tier === 1) return { h, m: r() < 0.5 ? 0 : 30 };
  if (tier === 2) {
    // mostly not o'clock or half past (those were tier 1), and quarters are common
    const m = r() < 0.35 ? pick(r, [15, 45]) : pick(r, [5, 10, 20, 25, 35, 40, 50, 55]);
    return { h, m };
  }
  let m = int(r, 1, 58);
  if (m % 5 === 0) m += 1;
  return { h, m };
}

/** Wrong times a child might read from this clock, each tagged with its mistake. Best first. */
export function readDistractors(t: Time, tier: Tier): Array<{ time: Time; mis: Misconception }> {
  const out: Array<{ time: Time; mis: Misconception }> = [];
  const add = (time: Time, mis: Misconception) => {
    if (time.m < 0 || time.m > 59 || same(time, t) || out.some((o) => same(o.time, time))) return;
    out.push({ time: { h: wrap12(time.h), m: time.m }, mis });
  };
  if (t.m >= 30 && t.m > 0) add({ h: t.h + 1, m: t.m }, 'next-hour');
  if (t.m % 5 === 0 && t.m >= 5 && t.m <= 55) add({ h: t.h, m: t.m / 5 }, 'by-ones');
  add(swapped(t), 'swapped');
  if (tier === 1) add({ h: t.h, m: t.m === 0 ? 30 : 0 }, 'half-hour');
  if (t.m !== 0 && t.m !== 30) add({ h: t.h, m: 60 - t.m }, 'backwards');
  if (tier === 2) {
    add({ h: t.h, m: t.m + 5 }, 'off-five');
    add({ h: t.h, m: t.m - 5 }, 'off-five');
  }
  if (tier === 3) {
    add({ h: t.h, m: t.m + 1 }, 'off-one');
    add({ h: t.h, m: t.m - 1 }, 'off-one');
    add({ h: t.h, m: t.m + 5 }, 'off-five');
  }
  add({ h: t.h - 1, m: t.m }, 'prev-hour');
  add({ h: t.h + 1, m: t.m }, 'next-hour');
  return out;
}

/** Word-name distractors for the quarter and half hours ("quarter to 3" for 2:45). */
function wordDistractors(t: Time): Array<{ label: string; mis: Misconception }> {
  const next = wrap12(t.h + 1);
  if (t.m === 45) return [
    { label: `quarter to ${t.h}`, mis: 'to-hour' },
    { label: `quarter past ${t.h}`, mis: 'past-to' },
    { label: `quarter past ${next}`, mis: 'next-hour' },
  ];
  if (t.m === 15) return [
    { label: `quarter to ${t.h}`, mis: 'past-to' },
    { label: `quarter past ${next}`, mis: 'next-hour' },
    { label: `quarter to ${next}`, mis: 'backwards' },
  ];
  if (t.m === 30) return [
    { label: `half past ${next}`, mis: 'next-hour' },
    { label: `${t.h} o'clock`, mis: 'half-hour' },
  ];
  return [
    { label: `half past ${t.h}`, mis: 'half-hour' },
    { label: `${next} o'clock`, mis: 'next-hour' },
  ];
}

function readProblem(tier: Tier, r: Rand): Problem {
  const time = randomTime(tier, r);
  const useWords = tier === 2 && (time.m === 15 || time.m === 45) && r() < 0.6;
  let choices: Choice[];
  if (useWords) {
    const wrong = wordDistractors(time).slice(0, 2);
    choices = [{ value: words(time), label: words(time), correct: true }, ...wrong.map((w) => ({ value: w.label, label: w.label, correct: false, misconception: w.mis }))];
  } else {
    const wrong = readDistractors(time, tier);
    // keep the two most telling mistakes, but vary which one comes second
    const chosen = [wrong[0], wrong.length > 2 && r() < 0.5 ? wrong[2] : wrong[1]].filter(Boolean);
    choices = [{ value: fmt(time), label: fmt(time), correct: true }, ...chosen.map((w) => ({ value: fmt(w.time), label: fmt(w.time), correct: false, misconception: w.mis }))];
  }
  return { kind: 'read', station: 'school', tier, time, words: useWords, choices: shuffle(r, choices) };
}

function setProblem(tier: Tier, r: Rand): Problem {
  const time = randomTime(tier, r);
  // the hands start somewhere else, never already right
  let start = { h: 12, m: 0 };
  if (same(start, time) || (tier > 1 && r() < 0.5)) start = addMinutes(time, (r() < 0.5 ? -1 : 1) * int(r, 2, 5) * 60 + (tier === 1 ? 30 : 15));
  if (same(start, time)) start = addMinutes(time, 90);
  const useWords = tier === 2 && (time.m === 15 || time.m === 45) && r() < 0.5;
  return { kind: 'set', station: 'bus', tier, time, start, words: useWords, step: stepFor(tier) };
}

/** Where a child might set the hands by mistake, and why. */
export function diagnoseSet(set: Time, target: Time): Misconception | null {
  if (same(set, target)) return null;
  // the long hand on the hour's number, and the short hand near the minute's number
  const shortOn = wrap12(Math.round(target.m / 5) || 12);
  if (same(set, swapped(target)) || (set.m === (target.h % 12) * 5 && (set.h === shortOn || set.h === wrap12(shortOn - 1)))) return 'swapped';
  if (set.m === target.m) {
    const d = (toMinutes(set) - toMinutes(target) + 720) % 720;
    if (d === 60) return 'next-hour';
    if (d === 660) return 'prev-hour';
  }
  if (set.h === target.h || Math.abs(toMinutes(set) - toMinutes(target)) < 60) {
    if (target.m >= 1 && target.m <= 11 && set.m === (target.m * 5) % 60) return 'by-ones';
    if (target.m !== 0 && target.m !== 30 && set.m === 60 - target.m) return 'backwards';
    if ((target.m === 0 && set.m === 30) || (target.m === 30 && set.m === 0)) return 'half-hour';
    const dm = Math.abs(set.m - target.m);
    if (dm === 5) return 'off-five';
    if (dm <= 2) return 'off-one';
  }
  return 'other';
}

/** Distractors for "how long?" answers. */
function durationChoices(minutes: number, start: Time, end: Time, tier: Tier): Choice[] {
  const out: Choice[] = [{ value: String(minutes), label: fmtDuration(minutes), correct: true }];
  const add = (n: number, mis: Misconception) => {
    if (n <= 0 || n > 240 || out.some((c) => c.value === String(n))) return;
    out.push({ value: String(n), label: fmtDuration(n), correct: false, misconception: mis });
  };
  if (tier === 1) {
    add(minutes + 60, 'off-hour');
    add(minutes - 60, 'off-hour');
    add(minutes / 60, 'by-ones');
  } else if (tier === 2) {
    add(minutes / 5, 'by-ones');
    add(minutes + 5, 'off-five');
    add(minutes - 5, 'off-five');
  } else {
    add(end.h * 100 + end.m - (start.h * 100 + start.m), 'hundred-minutes');
    add(Math.abs(end.m - start.m), 'minutes-only');
    add(minutes + 5, 'off-five');
    add(minutes - 5, 'off-five');
  }
  return out.slice(0, 3);
}

/** Distractors for "when will it be ready?" answers. */
function endChoices(start: Time, end: Time, minutes: number, tier: Tier): Choice[] {
  const out: Choice[] = [{ value: fmt(end), label: fmt(end), correct: true }];
  const add = (label: string, mis: Misconception) => {
    if (out.some((c) => c.value === label)) return;
    out.push({ value: label, label, correct: false, misconception: mis });
  };
  if (tier === 1) {
    add(fmt(addMinutes(end, 60)), 'off-hour');
    add(fmt(start), 'gave-start');
    add(fmt(addMinutes(end, -60)), 'off-hour');
  } else if (tier === 2) {
    add(fmt(addMinutes(end, 5)), 'off-five');
    add(fmt(start), 'gave-start');
    add(fmt(addMinutes(end, -5)), 'off-five');
  } else {
    add(`${start.h}:${start.m + minutes}`, 'no-carry');
    add(fmt({ h: start.h, m: end.m }), 'same-hour');
    add(fmt(addMinutes(end, 5)), 'off-five');
  }
  return out.slice(0, 3);
}

function elapsedProblem(tier: Tier, r: Rand): Problem {
  let start: Time;
  let minutes: number;
  if (tier === 1) {
    start = { h: int(r, 1, 10), m: r() < 0.6 ? 0 : 30 };
    minutes = int(r, 1, 3) * 60;
  } else if (tier === 2) {
    // inside one hour: start at a five, end before the next hour
    const sm = pick(r, [0, 5, 10, 15, 20, 25, 30]);
    start = { h: int(r, 1, 11), m: sm };
    minutes = int(r, 2, Math.floor((55 - sm) / 5)) * 5;
  } else {
    // across the hour: 2:50 to 3:15
    const sm = pick(r, [35, 40, 45, 50, 55]);
    start = { h: int(r, 1, 10), m: sm };
    const minEnd = 60 - sm + 5;
    minutes = int(r, minEnd / 5, Math.min(11, Math.floor((60 - sm + 45) / 5))) * 5;
  }
  const end = addMinutes(start, minutes);
  const ask: 'end' | 'duration' = r() < 0.5 ? 'end' : 'duration';
  const choices = ask === 'end' ? endChoices(start, end, minutes, tier) : durationChoices(minutes, start, end, tier);
  return { kind: 'elapsed', station: 'bakery', tier, start, end, minutes, ask, choices: shuffle(r, choices) };
}

export function makeProblem(station: Station, tier: Tier, r: Rand): Problem {
  if (station === 'school') return readProblem(tier, r);
  if (station === 'bus') return setProblem(tier, r);
  return elapsedProblem(tier, r);
}

/** A quick question for the Time Attack round: read a clock, three choices. */
export function attackProblem(maxTier: Tier, r: Rand): Problem {
  const tier = (maxTier === 1 ? 1 : int(r, Math.max(1, maxTier - 1), maxTier)) as Tier;
  return readProblem(tier, r);
}

/** Medals for a Time Attack round (correct answers in 60 seconds). */
export function medalFor(score: number): 'gold' | 'silver' | 'bronze' | null {
  return score >= 14 ? 'gold' : score >= 10 ? 'silver' : score >= 6 ? 'bronze' : null;
}
