/**
 * Multiplication Space Quest: the multiplication math, as pure functions (no
 * drawing, no timers) so every rule can be unit tested.
 *
 * The game is a space shooter. Each question floats in as a row of three
 * "answer rocks"; the player flies under the right one. Every flight belongs
 * to one sector of the route, and each sector practises one skill with three
 * levels:
 *
 *   Formations (Pilot Mei), grade 3, equal groups and arrays (3.OA.1, 3.OA.3, 3.OA.5)
 *     1. equal groups of stranded ships: how many ships, and which times sentence matches
 *     2. formations (arrays): rows x columns, and a formation turned on its side
 *     3. a big formation split in two (7 x 8 = 7 x 5 + 7 x 3): pick the split, then the total
 *   Engines (Engineer Rafi), grades 3-4, fact strategies (3.OA.5, 3.OA.7, 3.OA.9)
 *     1. x2 (doubles), x5 (half of x10), x10, x1 and x0
 *     2. x4 (double, double again), x9 (ten groups take away one), x3 (double and one more group):
 *        pick the shortcut, then the answer
 *     3. x6, x7, x8 and x9 facts (break apart into a fact you know), and the 11s and 12s
 *
 *   Cargo (Quartermaster Dot), grades 3-4, division and the missing factor (3.OA.2, 3.OA.4, 3.OA.6, 4.OA.3)
 *     1. share crates equally between ships: how many on each ship
 *     2. the missing factor (? x 6 = 42), and "how many groups?" next to "how many in each?" stories
 *     3. leftovers: how many shuttles so everyone flies, how many full crates, how many left over
 *   Constellations (Navigator Sol), grades 3-5, fact families and factors (3.OA.6, 3.OA.7, 4.OA.4)
 *     1. finish the fact family (3, 4 and 12 make 3 x 4, 4 x 3, 12 / 3 and 12 / 4)
 *     2. which fact does not belong in the family
 *     3. the missing factor pair, which number is a factor, which number is prime
 *
 * Bingo Boss (the finale, Multiplication Bingo Bonanza merged in): a 5 x 5
 * card of answers; every call's answer is on the card and not yet marked.
 * Meteor Run (the old Space Quest race): quick facts, mostly ones the
 * player has not lit on the Star Map yet.
 *
 * Wrong answers are made from real mistakes (adding instead of multiplying,
 * counting only the edge of a formation, doubling once for x4, taking away
 * 1 instead of a group for x9), so a wrong rock tells the game which idea to
 * explain.
 */

export type Sector = 'formations' | 'engines' | 'cargo' | 'constellations';
export const SECTORS: Sector[] = ['formations', 'engines', 'cargo', 'constellations'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'added' // added the numbers: 4 groups of 3 -> 7
  | 'group-size' // gave the size of one group: 4 groups of 3 -> 3
  | 'group-count' // gave the number of groups: 4 groups of 3 -> 4
  | 'one-group-off' // one group too many or too few: 7 x 8 -> 49 or 63
  | 'counted-edge' // counted only the ships round the edge of a formation
  | 'turn-changes' // thinks turning a formation changes how many ships there are
  | 'split-both' // split both numbers: 7 x 8 = 7 x 5 + 8 x 3
  | 'split-forgot' // forgot to multiply the second part: 7 x 5 + 3
  | 'zero-keeps' // thinks n x 0 is n
  | 'one-makes-one' // thinks n x 1 is 1
  | 'rules-mixed' // mixed up the x0 and x1 rules (n x 0 = 1, or n x 1 = 0)
  | 'half-forgot' // x5 done as x10 (forgot to take half)
  | 'extra-zero' // x10 done with two zeros (x100)
  | 'double-once' // x4 done as a single double (x2)
  | 'nine-minus-one' // x9 done as ten groups take away 1 (not a group)
  | 'nines-flipped' // the digits of a x9 answer flipped: 9 x 7 -> 36
  | 'plus-three' // x3 done as a double plus 3 (not one more group)
  | 'subtracted' // took the numbers away instead of dividing: 24 crates, 4 ships -> 20
  | 'multiplied' // multiplied instead of dividing: 24 crates, 4 ships -> 96
  | 'swapped' // gave the number of groups when asked how many in each (or the other way round)
  | 'leftover-ignored' // forgot the leftover crew still need a shuttle (29 crew, 4 seats -> 7)
  | 'remainder-answer' // gave the leftover as the answer
  | 'rounded-up' // counted a part-full crate as full
  | 'gave-quotient' // gave how many groups when asked what is left over
  | 'missing-to-fill' // gave how many more would fill a group, not how many are left over
  | 'backwards-division' // divided the small number by the big one (4 / 12 = 3)
  | 'division-not-family' // thinks a division fact is not part of the multiplication family
  | 'repeated-pair' // counted a turned pair (12 x 2 after 2 x 12) as a new factor pair
  | 'not-a-factor' // picked a number that does not divide evenly
  | 'multiple-not-factor' // mixed up factors and multiples (84 is a multiple of 42, not a factor)
  | 'odd-means-prime' // thinks every odd number is prime (9, 15, 21)
  | 'one-is-prime' // thinks 1 is prime (a prime has exactly two factors)
  | 'other';

export interface Choice {
  /** A unique key (the number, or the sentence). */
  value: string;
  /** What the rock shows. */
  label: string;
  correct: boolean;
  misconception?: Misconception;
}

/**
 * The picture the stranded ships make when they fly in (and the hint picture):
 * equal groups, a formation of rows and columns, or a formation split in two.
 */
export type Picture =
  | { kind: 'groups'; groups: number; each: number }
  | { kind: 'array'; rows: number; cols: number }
  | { kind: 'split'; rows: number; cols: number; at: number }
  /** A pile of supply crates, with `rings` empty ships to share them into (0: no ships shown). */
  | { kind: 'crates'; crates: number; rings: number }
  | null;

/** One step of a question: what the banner asks, and the three rocks. */
export interface Step {
  /** The banner text (short: it sits above the flight and is read aloud). */
  ask: string;
  choices: Choice[];
  /** The strategy shown with the answer (rung 3 and after a right answer). */
  explain: string;
}

export interface Problem {
  sector: Sector;
  tier: Tier;
  kind:
    | 'groups-count'
    | 'groups-sentence'
    | 'array-count'
    | 'array-turn'
    | 'split'
    | 'basic'
    | 'shortcut'
    | 'break-apart'
    | 'big'
    | 'share'
    | 'missing-factor'
    | 'how-many-groups'
    | 'round-up'
    | 'full'
    | 'left-over'
    | 'family-missing'
    | 'odd-fact'
    | 'missing-pair'
    | 'is-factor'
    | 'prime';
  /**
   * The two numbers the question is about. Formations and Engines: the factors
   * (a groups of b). Cargo: the crates and the ships (or the group size).
   * Constellations: the two factors of the family, or the number whose factors are asked about.
   */
  a: number;
  b: number;
  answer: number;
  picture: Picture;
  /** One or two steps; a star needs every step right first time. */
  steps: Step[];
  /** The times-table facts this question uses, for the Star Map ("3x4" with the smaller number first). */
  facts: string[];
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

/** The Star Map key for a fact (smaller number first), or null if it is off the 1-10 map. */
export function factKey(a: number, b: number): string | null {
  const [x, y] = a <= b ? [a, b] : [b, a];
  return x >= 1 && y <= 10 ? `${x}x${y}` : null;
}

const facts = (...pairs: Array<[number, number]>) => [...new Set(pairs.map(([a, b]) => factKey(a, b)).filter((k): k is string => !!k))];

/**
 * Three choices: the answer and the first two mistakes (in order of how
 * telling they are) that give a different, sensible number. If two real
 * mistakes can't be found, a neighbouring fact pads the list.
 */
export function numberChoices(r: Rand, answer: number, mistakes: Array<[number, Misconception]>, step = 1): Choice[] {
  const out: Choice[] = [{ value: String(answer), label: String(answer), correct: true }];
  const used = new Set([answer]);
  for (const [v, m] of mistakes) {
    if (out.length >= 3) break;
    if (!Number.isInteger(v) || v < 0 || used.has(v)) continue;
    used.add(v);
    out.push({ value: String(v), label: String(v), correct: false, misconception: m });
  }
  for (const v of [answer + step, answer - step, answer + 2 * step, answer + 1, answer + 2]) {
    if (out.length >= 3) break;
    if (v < 0 || used.has(v)) continue;
    used.add(v);
    out.push({ value: String(v), label: String(v), correct: false, misconception: 'one-group-off' });
  }
  return shuffle(r, out);
}

/** Three sentence choices (for "which times sentence matches?" and the shortcuts). */
function sentenceChoices(r: Rand, right: string, wrong: Array<[string, Misconception]>): Choice[] {
  const out: Choice[] = [{ value: right, label: right, correct: true }];
  for (const [s, m] of wrong) if (out.length < 3 && !out.some((c) => c.value === s)) out.push({ value: s, label: s, correct: false, misconception: m });
  return shuffle(r, out);
}

const times = (a: number, b: number) => `${a} × ${b}`;

// ------------------------------------------------------------------ Formations (Pilot Mei)

export function makeFormations(tier: Tier, r: Rand): Problem {
  if (tier === 1) {
    const groups = int(r, 2, 5);
    let each = int(r, 2, 6);
    if (each === groups) each = each === 6 ? 5 : each + 1; // keep "groups" and "each" different, so the two mistakes differ
    const answer = groups * each;
    const picture: Picture = { kind: 'groups', groups, each };
    if (r() < 0.6)
      return {
        sector: 'formations',
        tier,
        kind: 'groups-count',
        a: groups,
        b: each,
        answer,
        picture,
        facts: facts([groups, each]),
        steps: [
          {
            ask: `${groups} groups of ${each} ships. How many ships?`,
            choices: numberChoices(
              r,
              answer,
              [
                [groups + each, 'added'],
                r() < 0.5 ? [each, 'group-size'] : [groups, 'group-count'],
                [(groups + 1) * each, 'one-group-off'],
              ],
              each,
            ),
            explain: `${groups} groups of ${each}: count by ${each}s, ${groups} times. ${times(groups, each)} = ${answer}.`,
          },
        ],
      };
    return {
      sector: 'formations',
      tier,
      kind: 'groups-sentence',
      a: groups,
      b: each,
      answer,
      picture,
      facts: facts([groups, each]),
      steps: [
        {
          ask: `${groups} groups of ${each} ships. Which times sentence matches?`,
          choices: sentenceChoices(r, times(groups, each), [
            [`${groups} + ${each}`, 'added'],
            [times(groups + 1, each), 'one-group-off'],
          ]),
          explain: `${groups} groups of ${each} is ${times(groups, each)}. Groups first, then how many in each group.`,
        },
      ],
    };
  }
  if (tier === 2) {
    const rows = int(r, 3, 6);
    let cols = int(r, 3, 8);
    if (cols === rows) cols++;
    const answer = rows * cols;
    const picture: Picture = { kind: 'array', rows, cols };
    const edge = 2 * rows + 2 * cols - 4;
    if (r() < 0.6)
      return {
        sector: 'formations',
        tier,
        kind: 'array-count',
        a: rows,
        b: cols,
        answer,
        picture,
        facts: facts([rows, cols]),
        steps: [
          {
            ask: `${rows} rows of ${cols} ships. How many ships?`,
            choices: numberChoices(
              r,
              answer,
              [
                [edge, 'counted-edge'],
                [rows + cols, 'added'],
                [(rows - 1) * cols, 'one-group-off'],
              ],
              cols,
            ),
            explain: `${rows} rows with ${cols} in each row: ${times(rows, cols)} = ${answer}.`,
          },
        ],
      };
    // the same formation turned on its side: same ships, same total
    return {
      sector: 'formations',
      tier,
      kind: 'array-turn',
      a: rows,
      b: cols,
      answer,
      picture: { kind: 'array', rows: cols, cols: rows },
      facts: facts([rows, cols]),
      steps: [
        {
          ask: `${times(rows, cols)} = ${answer}. Turned on its side, it is ${times(cols, rows)}. How many ships now?`,
          choices: numberChoices(
            r,
            answer,
            [
              [cols * (rows - 1), 'turn-changes'],
              [rows + cols, 'added'],
            ],
            rows,
          ),
          explain: `Turning a formation does not add or take away ships. ${times(cols, rows)} = ${times(rows, cols)} = ${answer}.`,
        },
      ],
    };
  }
  // level 3: split a big formation into a 5-wide part and the rest
  const rows = int(r, 6, 9);
  // rows and columns differ, or "split both numbers" would be the right split
  let cols = int(r, 6, 8);
  if (cols >= rows) cols++;
  const at = 5;
  const rest = cols - at;
  const answer = rows * cols;
  const first = rows * at;
  const second = rows * rest;
  return {
    sector: 'formations',
    tier,
    kind: 'split',
    a: rows,
    b: cols,
    answer,
    picture: { kind: 'split', rows, cols, at },
    facts: facts([rows, cols], [rows, at], [rows, rest]),
    steps: [
      {
        ask: `Split the ${rows} by ${cols} formation after ${at} columns. Which split matches?`,
        choices: sentenceChoices(r, `${times(rows, at)} + ${times(rows, rest)}`, [
          [`${times(rows, at)} + ${times(cols, rest)}`, 'split-both'],
          [`${times(rows, at)} + ${rest}`, 'split-forgot'],
        ]),
        explain: `Both parts still have ${rows} rows: ${times(rows, at)} on the left and ${times(rows, rest)} on the right.`,
      },
      {
        ask: `${times(rows, at)} = ${first} and ${times(rows, rest)} = ${second}. How many ships in all?`,
        choices: numberChoices(
          r,
          answer,
          [
            [first + rest, 'split-forgot'],
            [first + cols * rest, 'split-both'],
            [rows * (cols - 1), 'one-group-off'],
          ],
          rows,
        ),
        explain: `${first} + ${second} = ${answer}, so ${times(rows, cols)} = ${answer}.`,
      },
    ],
  };
}

// ------------------------------------------------------------------ Engines (Engineer Rafi)

/** Put the times-table number first or second at random (both orders must be fluent). */
function order(r: Rand, table: number, n: number): [number, number] {
  return r() < 0.5 ? [table, n] : [n, table];
}

/** A x9 answer with its two digits swapped (63 -> 36), when that is a different number. */
export function flipDigits(n: number): number | null {
  if (n < 10 || n > 99) return null;
  const f = (n % 10) * 10 + Math.floor(n / 10);
  return f === n ? null : f;
}

export function makeEngines(tier: Tier, r: Rand): Problem {
  if (tier === 1) {
    const table = pick(r, [2, 2, 5, 5, 10, 10, 1, 0] as const);
    const n = int(r, 2, 10);
    const [a, b] = order(r, table, n);
    const answer = table * n;
    const mistakes: Array<[number, Misconception]> =
      table === 0
        ? [
            [n, 'zero-keeps'],
            [1, 'rules-mixed'],
          ]
        : table === 1
          ? [
              [1, 'one-makes-one'],
              [n + 1, 'added'],
              [0, 'rules-mixed'],
            ]
          : table === 2
            ? [
                [n + 2, 'added'],
                [answer + 2, 'one-group-off'],
                [answer - 2, 'one-group-off'],
              ]
            : table === 5
              ? [
                  [n * 10, 'half-forgot'],
                  [n + 5, 'added'],
                  [answer + 5, 'one-group-off'],
                ]
              : [
                  [n * 100, 'extra-zero'],
                  [n + 10, 'added'],
                  [answer + 10, 'one-group-off'],
                ];
    const explain =
      table === 0
        ? `${n} groups of nothing is nothing: ${times(a, b)} = 0.`
        : table === 1
          ? `One group of ${n} is just ${n}: ${times(a, b)} = ${n}.`
          : table === 2
            ? `Times 2 is a double: ${n} + ${n} = ${answer}.`
            : table === 5
              ? `Times 5 is half of times 10: ${n} × 10 = ${n * 10}, and half of that is ${answer}.`
              : `Times 10 puts a zero on the end: ${times(a, b)} = ${answer}.`;
    return {
      sector: 'engines',
      tier,
      kind: 'basic',
      a,
      b,
      answer,
      picture: null,
      facts: facts([a, b]),
      steps: [{ ask: `Charge the engine: ${times(a, b)} = ?`, choices: numberChoices(r, answer, mistakes, Math.max(1, table)), explain }],
    };
  }
  if (tier === 2) {
    const table = pick(r, [4, 9, 3] as const);
    // for 3 x 3, "a double plus 3" would really be one more group, so the x3 shortcut uses 4 to 9
    const n = int(r, table === 3 ? 4 : 3, 9);
    const [a, b] = order(r, table, n);
    const answer = table * n;
    if (table === 4) {
      const d = 2 * n;
      return {
        sector: 'engines',
        tier,
        kind: 'shortcut',
        a,
        b,
        answer,
        picture: null,
        facts: facts([a, b], [2, n]),
        steps: [
          {
            ask: `Shortcut for ${times(a, b)}: which one works?`,
            choices: sentenceChoices(r, `${n} × 2 × 2`, [
              [`${n} × 2`, 'double-once'],
              [`${n} + 4`, 'added'],
            ]),
            explain: `Times 4 is double, then double again: ${n} doubled is ${d}, and ${d} doubled is ${answer}.`,
          },
          {
            ask: `${n} doubled is ${d}. Double again: ${times(a, b)} = ?`,
            choices: numberChoices(
              r,
              answer,
              [
                [d, 'double-once'],
                [answer + 4, 'one-group-off'],
                [n + 4, 'added'],
              ],
              4,
            ),
            explain: `${d} + ${d} = ${answer}, so ${times(a, b)} = ${answer}.`,
          },
        ],
      };
    }
    if (table === 9) {
      const ten = 10 * n;
      return {
        sector: 'engines',
        tier,
        kind: 'shortcut',
        a,
        b,
        answer,
        picture: null,
        facts: facts([a, b], [10, n]),
        steps: [
          {
            ask: `Shortcut for ${times(a, b)}: which one works?`,
            choices: sentenceChoices(r, `10 × ${n} − ${n}`, [
              [`10 × ${n} − 1`, 'nine-minus-one'],
              [`10 × ${n} + ${n}`, 'one-group-off'],
            ]),
            explain: `Times 9 is ten groups take away one group: 10 × ${n} = ${ten}, and ${ten} − ${n} = ${answer}.`,
          },
          {
            ask: `10 × ${n} = ${ten}. Take away one group: ${times(a, b)} = ?`,
            choices: numberChoices(
              r,
              answer,
              [
                [ten - 1, 'nine-minus-one'],
                [flipDigits(answer) ?? -1, 'nines-flipped'],
                [ten + n, 'one-group-off'],
              ],
              9,
            ),
            explain: `${ten} − ${n} = ${answer}. Check: the digits of ${answer} add up to ${String(answer).split('').reduce((s, c) => s + Number(c), 0)}.`,
          },
        ],
      };
    }
    const d = 2 * n;
    return {
      sector: 'engines',
      tier,
      kind: 'shortcut',
      a,
      b,
      answer,
      picture: null,
      facts: facts([a, b], [2, n]),
      steps: [
        {
          ask: `Shortcut for ${times(a, b)}: which one works?`,
          choices: sentenceChoices(r, `${n} × 2 + ${n}`, [
            [`${n} × 2 + 3`, 'plus-three'],
            [`${n} + 3`, 'added'],
          ]),
          explain: `Times 3 is a double and one more group: ${n} doubled is ${d}, and ${d} + ${n} = ${answer}.`,
        },
        {
          ask: `${n} doubled is ${d}. Add one more ${n}: ${times(a, b)} = ?`,
          choices: numberChoices(
            r,
            answer,
            [
              [d + 3, 'plus-three'],
              [d, 'one-group-off'],
              [n + 3, 'added'],
            ],
            3,
          ),
          explain: `${d} + ${n} = ${answer}, so ${times(a, b)} = ${answer}.`,
        },
      ],
    };
  }
  // level 3: the hard facts (6-9 times 6-9), and now and then an 11 or 12 as a stretch
  if (r() < 0.2) {
    const table = pick(r, [11, 12] as const);
    const n = int(r, 3, 9);
    const [a, b] = order(r, table, n);
    const answer = table * n;
    return {
      sector: 'engines',
      tier,
      kind: 'big',
      a,
      b,
      answer,
      picture: null,
      facts: facts([10, n]),
      steps: [
        {
          ask: `Super charge: ${times(a, b)} = ?`,
          choices: numberChoices(
            r,
            answer,
            [
              [table + n, 'added'],
              [10 * n, 'one-group-off'],
              [answer + n, 'one-group-off'],
            ],
            n,
          ),
          explain: `Break it apart: 10 × ${n} = ${10 * n}, and ${table - 10} × ${n} = ${(table - 10) * n}. ${10 * n} + ${(table - 10) * n} = ${answer}.`,
        },
      ],
    };
  }
  const x = int(r, 6, 9);
  const y = int(r, 6, 9);
  const [a, b] = r() < 0.5 ? [x, y] : [y, x];
  const answer = a * b;
  // break the first number apart into 5 and the rest
  const rest = a - 5;
  const mistakes: Array<[number, Misconception]> = [];
  if (a === 9 || b === 9) {
    const f = flipDigits(answer);
    if (f) mistakes.push([f, 'nines-flipped']);
  }
  mistakes.push([5 * b + rest, 'split-forgot'], [answer - b, 'one-group-off'], [answer + b, 'one-group-off'], [a + b, 'added']);
  return {
    sector: 'engines',
    tier,
    kind: 'break-apart',
    a,
    b,
    answer,
    picture: null,
    facts: facts([a, b], [5, b]),
    steps: [
      {
        ask: `Full power: ${times(a, b)} = ?`,
        choices: numberChoices(r, answer, mistakes, b),
        explain: `Break it apart: ${times(5, b)} = ${5 * b} and ${times(rest, b)} = ${rest * b}. ${5 * b} + ${rest * b} = ${answer}.`,
      },
    ],
  };
}

// ------------------------------------------------------------------ Cargo (Quartermaster Dot)

export function makeCargo(tier: Tier, r: Rand): Problem {
  if (tier === 1) {
    const ships = int(r, 2, 5);
    let each = int(r, 2, 8);
    if (each === ships) each++;
    const crates = ships * each;
    return {
      sector: 'cargo',
      tier,
      kind: 'share',
      a: crates,
      b: ships,
      answer: each,
      picture: { kind: 'crates', crates, rings: ships },
      facts: facts([ships, each]),
      steps: [
        {
          ask: `${crates} crates shared equally between ${ships} ships. How many on each ship?`,
          choices: numberChoices(
            r,
            each,
            [
              [crates - ships, 'subtracted'],
              [ships, 'swapped'],
              [crates * ships, 'multiplied'],
            ],
            1,
          ),
          explain: `Deal them out one each, round and round: ${crates} ÷ ${ships} = ${each}, because ${times(ships, each)} = ${crates}.`,
        },
      ],
    };
  }
  if (tier === 2) {
    const d = int(r, 2, 9);
    let q = int(r, 2, 9);
    if (q === d) q = q === 9 ? 8 : q + 1;
    const total = d * q;
    if (r() < 0.5) {
      const [x, y] = r() < 0.5 ? ['?', String(d)] : [String(d), '?'];
      return {
        sector: 'cargo',
        tier,
        kind: 'missing-factor',
        a: total,
        b: d,
        answer: q,
        picture: { kind: 'crates', crates: total, rings: 0 },
        facts: facts([d, q]),
        steps: [
          {
            ask: `Fill the cargo log: ${x} × ${y} = ${total}. What is the missing number?`,
            choices: numberChoices(
              r,
              q,
              [
                [total - d, 'subtracted'],
                [q + 1, 'one-group-off'],
                [total * d, 'multiplied'],
              ],
              1,
            ),
            explain: `What times ${d} makes ${total}? ${times(q, d)} = ${total}, so ${total} ÷ ${d} = ${q}.`,
          },
        ],
      };
    }
    // "how many groups?" (the group size is known) next to "how many in each?" (the number of groups is known)
    const groupsAsk = r() < 0.5;
    return {
      sector: 'cargo',
      tier,
      kind: 'how-many-groups',
      a: total,
      b: d,
      answer: q,
      picture: { kind: 'crates', crates: total, rings: groupsAsk ? 0 : d },
      facts: facts([d, q]),
      steps: [
        {
          ask: groupsAsk ? `${total} crates, ${d} crates in each ship. How many ships?` : `${total} crates shared by ${d} ships. How many in each ship?`,
          choices: numberChoices(
            r,
            q,
            [
              [total - d, 'subtracted'],
              [total * d, 'multiplied'],
              [q - 1, 'one-group-off'],
            ],
            1,
          ),
          explain: groupsAsk ? `Count how many groups of ${d} make ${total}: ${times(q, d)} = ${total}. ${q} ships.` : `Share ${total} into ${d} equal groups: ${total} ÷ ${d} = ${q} in each.`,
        },
      ],
    };
  }
  // level 3: leftovers (a remainder of 1 or more)
  const per = int(r, 3, 9);
  const q = int(r, 3, 9);
  const rem = int(r, 1, per - 1);
  const total = per * q + rem;
  const kind = pick(r, ['round-up', 'full', 'left-over'] as const);
  if (kind === 'round-up')
    return {
      sector: 'cargo',
      tier,
      kind,
      a: total,
      b: per,
      answer: q + 1,
      picture: { kind: 'crates', crates: total, rings: 0 },
      facts: facts([per, q]),
      steps: [
        {
          ask: `${total} crew, ${per} seats in each shuttle. How many shuttles so everyone flies?`,
          choices: numberChoices(
            r,
            q + 1,
            [
              [q, 'leftover-ignored'],
              [rem, 'remainder-answer'],
              [q + 2, 'one-group-off'],
            ],
            1,
          ),
          explain: `${times(q, per)} = ${per * q}, so ${q} shuttles are full and ${rem} crew are left. They need one more shuttle: ${q + 1}.`,
        },
      ],
    };
  if (kind === 'full')
    return {
      sector: 'cargo',
      tier,
      kind,
      a: total,
      b: per,
      answer: q,
      picture: { kind: 'crates', crates: total, rings: 0 },
      facts: facts([per, q]),
      steps: [
        {
          ask: `${total} cans of fuel, ${per} cans fill a crate. How many crates are full?`,
          choices: numberChoices(
            r,
            q,
            [
              [q + 1, 'rounded-up'],
              [rem, 'remainder-answer'],
              [q - 1, 'one-group-off'],
            ],
            1,
          ),
          explain: `${times(q, per)} = ${per * q}, with ${rem} left over. A crate with ${rem} is not full, so ${q} crates are full.`,
        },
      ],
    };
  return {
    sector: 'cargo',
    tier,
    kind: 'left-over',
    a: total,
    b: per,
    answer: rem,
    picture: { kind: 'crates', crates: total, rings: 0 },
    facts: facts([per, q]),
    steps: [
      {
        ask: `${total} cans of fuel go into crates of ${per}. How many cans are left over?`,
        choices: numberChoices(
          r,
          rem,
          [
            [q, 'gave-quotient'],
            [per - rem, 'missing-to-fill'],
            [rem + 1, 'one-group-off'],
          ],
          1,
        ),
        explain: `${times(q, per)} = ${per * q}. ${total} − ${per * q} = ${rem} left over.`,
      },
    ],
  };
}

// ------------------------------------------------------------------ Constellations (Navigator Sol)

/** The four facts of a family (a x b, b x a, p / a, p / b). */
export function family(a: number, b: number): string[] {
  const p = a * b;
  return [`${a} × ${b} = ${p}`, `${b} × ${a} = ${p}`, `${p} ÷ ${a} = ${b}`, `${p} ÷ ${b} = ${a}`];
}

/** Is a fact sentence like "12 ÷ 4 = 3" or "3 + 4 = 7" true? */
export function factTrue(s: string): boolean {
  const m = s.match(/^(\d+) ([×÷+−]) (\d+) = (\d+)$/);
  if (!m) return false;
  const [x, op, y, z] = [Number(m[1]), m[2], Number(m[3]), Number(m[4])];
  const v = op === '×' ? x * y : op === '÷' ? x / y : op === '+' ? x + y : x - y;
  return v === z;
}

export const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

export function factorPairs(n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let k = 1; k * k <= n; k++) if (n % k === 0) out.push([k, n / k]);
  return out;
}

export function makeConstellations(tier: Tier, r: Rand): Problem {
  if (tier === 1 || tier === 2) {
    const a = int(r, 2, 9);
    let b = int(r, 2, 9);
    if (b === a) b = b === 9 ? 8 : b + 1;
    const p = a * b;
    const fam = family(a, b);
    if (tier === 1) {
      const missing = int(r, 0, 3);
      const shown = fam.filter((_, i) => i !== missing);
      const right = fam[missing];
      // the wrong facts: the division turned backwards, and an addition fact (another family)
      const back = missing >= 2 ? `${missing === 2 ? a : b} ÷ ${p} = ${missing === 2 ? b : a}` : `${p} ÷ ${a + b} = ${b}`;
      const wrong: Array<[string, Misconception]> = [
        [missing >= 2 ? back : `${a} ÷ ${p} = ${b}`, 'backwards-division'],
        [`${a} + ${b} = ${a + b}`, 'added'],
      ];
      return {
        sector: 'constellations',
        tier,
        kind: 'family-missing',
        a,
        b,
        answer: p,
        picture: null,
        facts: facts([a, b]),
        steps: [
          {
            ask: `The ${a}, ${b}, ${p} family: ${shown.join(', ')}. Which fact finishes it?`,
            choices: sentenceChoices(r, right, wrong),
            explain: `${a}, ${b} and ${p} make four facts: ${fam.join(', ')}.`,
          },
        ],
      };
    }
    // level 2: which fact is NOT in the family (two true members and one that does not belong)
    const odd = pick(r, [`${b} ÷ ${p} = ${a}`, `${p} ÷ ${a} = ${b + 1}`, `${a} + ${b} = ${a + b}`]);
    const members = shuffle(r, [fam[1], fam[2], fam[3]]).slice(0, 2);
    const choices: Choice[] = shuffle(r, [
      { value: odd, label: odd, correct: true },
      ...members.map((m): Choice => ({ value: m, label: m, correct: false, misconception: m.includes('÷') ? 'division-not-family' : 'turn-changes' })),
    ]);
    return {
      sector: 'constellations',
      tier,
      kind: 'odd-fact',
      a,
      b,
      answer: p,
      picture: null,
      facts: facts([a, b]),
      steps: [
        {
          ask: `${fam[0]}. Which fact is NOT in this family?`,
          choices,
          explain: odd.includes('+') ? `${odd} is an adding fact. The family is ${fam.join(', ')}.` : `${odd} is not true. The family is ${fam.join(', ')}.`,
        },
      ],
    };
  }
  // level 3: factor pairs, factors and multiples, primes
  const kind = pick(r, ['missing-pair', 'is-factor', 'prime'] as const);
  if (kind === 'missing-pair') {
    const n = pick(r, [12, 18, 20, 24, 30, 36, 40, 48] as const);
    const pairs = factorPairs(n);
    // leave out 1 x n now and then (the pair children most often forget)
    const gone = r() < 0.4 ? 0 : int(r, 1, pairs.length - 1);
    const right = pairs[gone];
    const shown = pairs.filter((_, i) => i !== gone);
    // a pair already found, turned round (never a square pair like 6 x 6, which is the same both ways)
    const turned = [...shown].reverse().find(([x, y]) => x !== y)!;
    let k = int(r, 2, 6);
    while (n % k === 0) k++;
    const fake = `${k} × ${Math.round(n / k)}`;
    return {
      sector: 'constellations',
      tier,
      kind,
      a: n,
      b: right[0],
      answer: n,
      picture: null,
      facts: facts(...pairs.filter(([x, y]) => x > 1 && y <= 10).map((q) => q as [number, number])),
      steps: [
        {
          ask: `Park ${n} ships in a rectangle. Found: ${shown.map(([x, y]) => times(x, y)).join(', ')}. Which way is missing?`,
          choices: sentenceChoices(r, times(right[0], right[1]), [
            [times(turned[1], turned[0]), 'repeated-pair'],
            [fake, 'not-a-factor'],
          ]),
          explain: `The factor pairs of ${n} are ${pairs.map(([x, y]) => times(x, y)).join(', ')}. Turning a pair round is the same pair.`,
        },
      ],
    };
  }
  if (kind === 'is-factor') {
    const k = int(r, 3, 9);
    const m = int(r, 3, 9);
    const n = k * m;
    let not = k + 1;
    while (n % not === 0) not++;
    return {
      sector: 'constellations',
      tier,
      kind,
      a: n,
      b: k,
      answer: k,
      picture: null,
      facts: facts([k, m]),
      steps: [
        {
          ask: `Which number is a factor of ${n}? (It divides ${n} with nothing left over.)`,
          choices: numberChoices(
            r,
            k,
            [
              [n * 2, 'multiple-not-factor'],
              [not, 'not-a-factor'],
            ],
            1,
          ),
          explain: `${times(k, m)} = ${n}, so ${k} is a factor of ${n}. ${n * 2} is a multiple of ${n}, not a factor.`,
        },
      ],
    };
  }
  const p = pick(r, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  const odd = pick(r, [9, 15, 21, 25, 27, 33, 35]);
  return {
    sector: 'constellations',
    tier,
    kind: 'prime',
    a: p,
    b: odd,
    answer: p,
    picture: null,
    facts: [],
    steps: [
      {
        ask: 'Which number is prime? (A prime has exactly two factors: 1 and itself.)',
        choices: numberChoices(
          r,
          p,
          [
            [odd, 'odd-means-prime'],
            [1, 'one-is-prime'],
          ],
          1,
        ),
        explain: `${p} has only two factors, 1 and ${p}. ${odd} = ${factorPairs(odd)
          .filter(([x]) => x > 1)
          .map(([x, y]) => times(x, y))[0]}, and 1 has only one factor.`,
      },
    ],
  };
}

export function makeProblem(sector: Sector, tier: Tier, r: Rand): Problem {
  if (sector === 'formations') return makeFormations(tier, r);
  if (sector === 'engines') return makeEngines(tier, r);
  if (sector === 'cargo') return makeCargo(tier, r);
  return makeConstellations(tier, r);
}

// ------------------------------------------------------------------ Bingo Boss (the finale)

/** A call: the question Blip calls out, and the number it is looking for. */
export interface BingoCall {
  text: string;
  answer: number;
  kind: 'times' | 'divide' | 'missing';
  a: number;
  b: number;
}

/** 25 squares, row by row; the middle (index 12) is the free space (value 0). */
export interface BingoCard {
  values: number[];
}

export const FREE = 12;

/** A Bingo card: 8 small numbers (division answers) and 16 products, all different, at the player's level. */
export function makeBingoCard(tier: Tier, r: Rand): BingoCard {
  const small = shuffle(r, [2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 8);
  const tables = tier === 1 ? [2, 5, 10] : tier === 2 ? [2, 3, 4, 5, 9, 10] : [3, 4, 6, 7, 8, 9];
  const products = new Set<number>();
  for (const t of tables) for (let n = 2; n <= 10; n++) if (!small.includes(t * n)) products.add(t * n);
  const big = shuffle(r, [...products]).slice(0, 16);
  const vals = shuffle(r, [...small, ...big]);
  vals.splice(FREE, 0, 0);
  return { values: vals };
}

/** Every factor pair (2-10) that makes n. */
function smallPairs(n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let a = 2; a <= 10; a++) if (n % a === 0 && n / a >= 2 && n / a <= 10) out.push([a, n / a]);
  return out;
}

/**
 * Blip's next call: always for a number that is on the card and not marked
 * yet (the old Bingo Bonanza called facts whose answers were often not on
 * the card at all).
 */
export function makeBingoCall(card: BingoCard, marked: boolean[], r: Rand): BingoCall {
  const open = card.values.map((v, i) => ({ v, i })).filter(({ i }) => i !== FREE && !marked[i]);
  const { v } = pick(r, open);
  const pairs = smallPairs(v);
  if (v > 10 || (pairs.length && r() < 0.3)) {
    const [a, b] = pick(r, pairs);
    return { text: `${times(a, b)} = ?`, answer: v, kind: 'times', a, b };
  }
  const d = int(r, 2, 9);
  const p = v * d;
  if (r() < 0.5) return { text: `${p} ÷ ${d} = ?`, answer: v, kind: 'divide', a: p, b: d };
  return { text: `? × ${d} = ${p}`, answer: v, kind: 'missing', a: p, b: d };
}

/** The idea behind tapping the wrong square for a call. */
export function bingoMistake(c: BingoCall, picked: number): Misconception {
  if (c.kind === 'times') {
    if (picked === c.a + c.b) return 'added';
    if (picked === c.answer + c.a || picked === c.answer - c.a || picked === c.answer + c.b || picked === c.answer - c.b) return 'one-group-off';
    if (flipDigits(c.answer) === picked) return 'nines-flipped';
    return 'other';
  }
  if (picked === c.a - c.b) return 'subtracted';
  if (picked === c.b) return 'swapped';
  if (picked === c.answer + 1 || picked === c.answer - 1) return 'one-group-off';
  return 'other';
}

export const BINGO_LINES: number[][] = [
  ...[0, 1, 2, 3, 4].map((row) => [0, 1, 2, 3, 4].map((c) => row * 5 + c)),
  ...[0, 1, 2, 3, 4].map((col) => [0, 1, 2, 3, 4].map((row) => row * 5 + col)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

/** The first full line (row, column or diagonal), or null. */
export function bingoLine(marked: boolean[]): number[] | null {
  return BINGO_LINES.find((line) => line.every((i) => i === FREE || marked[i])) ?? null;
}

// ------------------------------------------------------------------ Meteor Run (the old 60-second race)

/** A quick fact for Meteor Run: mostly one the player has not lit on the Star Map yet. */
export function makeMeteor(lit: string[], r: Rand): Problem {
  const all: Array<[number, number]> = [];
  for (let a = 2; a <= 10; a++) for (let b = a; b <= 10; b++) all.push([a, b]);
  const dark = all.filter(([a, b]) => !lit.includes(factKey(a, b)!));
  const [x, y] = dark.length && r() < 0.75 ? pick(r, dark) : pick(r, all);
  const [a, b] = r() < 0.5 ? [x, y] : [y, x];
  const answer = a * b;
  const mistakes: Array<[number, Misconception]> = [];
  const f = flipDigits(answer);
  if ((a === 9 || b === 9) && f) mistakes.push([f, 'nines-flipped']);
  mistakes.push([answer + a, 'one-group-off'], [answer - b, 'one-group-off'], [a + b, 'added']);
  return {
    sector: 'engines',
    tier: 1,
    kind: 'basic',
    a,
    b,
    answer,
    picture: null,
    facts: facts([a, b]),
    steps: [{ ask: `${times(a, b)} = ?`, choices: numberChoices(r, answer, mistakes, Math.min(a, b)), explain: `${times(a, b)} = ${answer}.` }],
  };
}

/** Every answer in a step must be the step's one right choice (used by the tests). */
export function rightChoice(step: Step): Choice {
  return step.choices.find((c) => c.correct)!;
}

/** The value of a sentence like "7 × 5 + 7 × 3", "10 × 6 − 6" or "6 × 2 × 2" (only + − ×, left to right with × first). */
export function evalSentence(s: string): number {
  return s
    .replace(/−/g, '-')
    .split(/(?=[+-])/)
    .map((term) => term.trim())
    .reduce((sum, term) => {
      const sign = term.startsWith('-') ? -1 : 1;
      const body = term.replace(/^[+-]\s*/, '');
      return sum + sign * body.split('×').reduce((p, f) => p * Number(f.trim()), 1);
    }, 0);
}
