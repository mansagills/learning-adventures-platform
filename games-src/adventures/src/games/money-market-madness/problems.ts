/**
 * Money Market Madness: the money math, as pure functions (no drawing, no
 * timers) so every rule can be unit tested. All amounts are whole cents.
 *
 * Four tiers (one learner skill):
 *   1. Count the coins a customer pays with (pennies, nickels, dimes; up to 50¢).
 *   2. Count coins with quarters (up to 99¢), then: is it enough for the price?
 *   3. The customer pays with a $1 bill: make change with coins (count up).
 *   4. Two items: add the total, then make change from $5 with bills and coins.
 */

export type Tier = 1 | 2 | 3 | 4;
export const TIERS: Tier[] = [1, 2, 3, 4];

export type Money = 'penny' | 'nickel' | 'dime' | 'quarter' | 'dollar' | 'five';
export const VALUE: Record<Money, number> = { penny: 1, nickel: 5, dime: 10, quarter: 25, dollar: 100, five: 500 };
export const COINS: Money[] = ['penny', 'nickel', 'dime', 'quarter'];
export const NAME: Record<Money, string> = { penny: 'penny', nickel: 'nickel', dime: 'dime', quarter: 'quarter', dollar: 'one-dollar bill', five: 'five-dollar bill' };

export type Misconception =
  | 'coin-count' // counted coins instead of adding their values
  | 'size-value' // treated a nickel as 10¢ and a dime as 5¢ (bigger coin, more money)
  | 'quarter-20' // counted a quarter as 20¢
  | 'miscount' // a slip of one coin
  | 'said-yes' // "enough" when it was not
  | 'said-no' // "not enough" when it was
  | 'gave-price' // gave the price instead of the change
  | 'off-one' // change off by 1¢
  | 'off-five' // change off by 5¢
  | 'off-ten' // change off by 10¢
  | 'off-dollar' // change off by $1
  | 'no-regroup' // added cents without carrying into dollars
  | 'dollars-only' // added only the dollars
  | 'other';

export interface Choice {
  value: number;
  label: string;
  correct: boolean;
  misconception?: Misconception;
}

export type Step =
  | { kind: 'count'; coins: Money[]; answer: number; choices: Choice[] }
  | { kind: 'enough'; paid: number; price: number; answer: boolean }
  | { kind: 'total'; prices: number[]; answer: number; choices: Choice[] }
  | { kind: 'change'; price: number; paid: number; paidWith: Money[]; answer: number; allowed: Money[] };

export interface Problem {
  tier: Tier;
  /** What the customer ordered: one or two item prices (the names come from the menu). */
  prices: number[];
  steps: Step[];
}

/** "35¢", "$1.05", "$4.00". */
export function fmt(cents: number): string {
  if (cents < 100) return `${cents}¢`;
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

/** The same said out loud: "1 dollar and 5 cents". */
export function say(cents: number): string {
  const d = Math.floor(cents / 100);
  const c = cents % 100;
  const dollars = d ? `${d} dollar${d === 1 ? '' : 's'}` : '';
  const cs = c ? `${c} cent${c === 1 ? '' : 's'}` : '';
  return [dollars, cs].filter(Boolean).join(' and ') || '0 cents';
}

export function sum(m: Money[]): number {
  return m.reduce((a, x) => a + VALUE[x], 0);
}

/** The fewest coins and bills that make an amount (greedy works for US money). */
export function fewest(cents: number, allowed: Money[] = ['five', 'dollar', 'quarter', 'dime', 'nickel', 'penny']): Money[] {
  const out: Money[] = [];
  let left = cents;
  for (const m of [...allowed].sort((a, b) => VALUE[b] - VALUE[a]))
    while (left >= VALUE[m]) {
      out.push(m);
      left -= VALUE[m];
    }
  return out;
}

const randInt = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const shuffle = <T>(a: T[], r: () => number) => a.map((x) => [r(), x] as const).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

/** Three choices: the answer plus two wrong ones from real mistakes (or near misses). */
function choices(r: () => number, answer: number, wrong: Array<[number, Misconception]>): Choice[] {
  const seen = new Set([answer]);
  const out: Choice[] = [{ value: answer, label: fmt(answer), correct: true }];
  for (const [v, m] of wrong) {
    if (out.length >= 3) break;
    if (v > 0 && !seen.has(v)) {
      seen.add(v);
      out.push({ value: v, label: fmt(v), correct: false, misconception: m });
    }
  }
  for (const d of [1, 5, -5, 10, -10, 2]) {
    if (out.length >= 3) break;
    const v = answer + d;
    if (v > 0 && !seen.has(v)) {
      seen.add(v);
      out.push({ value: v, label: fmt(v), correct: false, misconception: 'miscount' });
    }
  }
  return shuffle(out, r);
}

/** Wrong totals for a handful of coins, from the mistakes children really make. */
export function countDistractors(coins: Money[]): Array<[number, Misconception]> {
  const swapped = coins.reduce((a, c) => a + (c === 'nickel' ? 10 : c === 'dime' ? 5 : VALUE[c]), 0);
  const q20 = coins.reduce((a, c) => a + (c === 'quarter' ? 20 : VALUE[c]), 0);
  const out: Array<[number, Misconception]> = [];
  if (coins.includes('quarter')) out.push([q20, 'quarter-20']);
  if (coins.includes('nickel') || coins.includes('dime')) out.push([swapped, 'size-value']);
  out.push([coins.length, 'coin-count']);
  return out;
}

function sortCoins(m: Money[]): Money[] {
  return [...m].sort((a, b) => VALUE[b] - VALUE[a]);
}

/** A customer's order and the steps to serve it, at a tier. */
export function makeProblem(tier: Tier, r: () => number = Math.random): Problem {
  if (tier === 1) {
    const pool: Money[] = ['penny', 'nickel', 'dime'];
    let coins: Money[] = [];
    // at least one nickel and one dime most of the time, so a size/value mix-up shows
    do {
      coins = Array.from({ length: randInt(r, 2, 6) }, () => pool[Math.floor(r() * pool.length)]);
    } while (sum(coins) > 50 || (r() < 0.7 && !(coins.includes('nickel') && coins.includes('dime'))));
    coins = sortCoins(coins);
    const answer = sum(coins);
    return { tier, prices: [answer], steps: [{ kind: 'count', coins, answer, choices: choices(r, answer, countDistractors(coins)) }] };
  }
  if (tier === 2) {
    const pool: Money[] = ['penny', 'nickel', 'dime', 'quarter'];
    let coins: Money[] = [];
    do {
      coins = Array.from({ length: randInt(r, 2, 6) }, () => pool[Math.floor(r() * pool.length)]);
    } while (sum(coins) > 99 || sum(coins) < 15 || !coins.includes('quarter'));
    coins = sortCoins(coins);
    const paid = sum(coins);
    // the price is close to what they paid: a little more, a little less, or exactly it
    const roll = r();
    const price = roll < 0.4 ? paid + 5 * randInt(r, 1, 3) : roll < 0.8 ? Math.max(5, paid - 5 * randInt(r, 1, 3)) : paid;
    return {
      tier,
      prices: [price],
      steps: [
        { kind: 'count', coins, answer: paid, choices: choices(r, paid, countDistractors(coins)) },
        { kind: 'enough', paid, price, answer: paid >= price },
      ],
    };
  }
  if (tier === 3) {
    const price = 5 * randInt(r, 3, 19) + (r() < 0.25 ? randInt(r, 1, 4) : 0);
    return { tier, prices: [price], steps: [{ kind: 'change', price, paid: 100, paidWith: ['dollar'], answer: 100 - price, allowed: COINS }] };
  }
  // tier 4: two items, then change from $5
  let a = 0;
  let b = 0;
  do {
    a = 25 * randInt(r, 3, 10);
    b = 5 * randInt(r, 5, 30);
  } while (a + b > 450 || a + b < 150 || ((a % 100) + (b % 100) < 100 && r() < 0.6)); // most need regrouping
  const total = a + b;
  const noRegroup = Math.floor(a / 100) * 100 + Math.floor(b / 100) * 100 + ((a % 100) + (b % 100)) % 100;
  const dollarsOnly = (Math.floor(a / 100) + Math.floor(b / 100)) * 100;
  return {
    tier,
    prices: [a, b],
    steps: [
      { kind: 'total', prices: [a, b], answer: total, choices: choices(r, total, [[noRegroup, 'no-regroup'], [dollarsOnly, 'dollars-only'], [total + 100, 'off-dollar']]) },
      { kind: 'change', price: total, paid: 500, paidWith: ['five'], answer: 500 - total, allowed: ['dollar', 'quarter', 'dime', 'nickel', 'penny'] },
    ],
  };
}

/** Why the change handed over is wrong (null when it is right). */
export function diagnoseChange(price: number, paid: number, given: number): Misconception | null {
  const right = paid - price;
  if (given === right) return null;
  if (given === price) return 'gave-price';
  const d = Math.abs(given - right);
  if (d === 100) return 'off-dollar';
  if (d === 10) return 'off-ten';
  if (d === 5) return 'off-five';
  if (d === 1) return 'off-one';
  return 'other';
}

/**
 * Coins counted up from the price to what was paid (the "count up" hint):
 * pennies to the next 5, a nickel or dimes to the next quarter, quarters to
 * the next dollar, then dollars. 35¢ from $1: 40, 50, 75, $1.
 */
export function countUp(price: number, paid: number): Array<{ coin: Money; reach: number }> {
  const steps: Array<{ coin: Money; reach: number }> = [];
  let at = price;
  while (at < paid && steps.length < 40) {
    let c: Money;
    if (at % 5) c = 'penny';
    else if (at % 25) c = (Math.ceil(at / 25) * 25 - at) % 10 === 5 ? 'nickel' : 'dime';
    else if (at % 100) c = 'quarter';
    else c = 'dollar';
    at += VALUE[c];
    steps.push({ coin: c, reach: at });
  }
  return steps;
}
