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
 * Cargo (division) and Constellations (fact families) come in half 2.
 *
 * Wrong answers are made from real mistakes (adding instead of multiplying,
 * counting only the edge of a formation, doubling once for x4, taking away
 * 1 instead of a group for x9), so a wrong rock tells the game which idea to
 * explain.
 */

export type Sector = 'formations' | 'engines';
export const SECTORS: Sector[] = ['formations', 'engines'];
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
  kind: 'groups-count' | 'groups-sentence' | 'array-count' | 'array-turn' | 'split' | 'basic' | 'shortcut' | 'break-apart' | 'big';
  /** The two factors (a groups of b, or a rows of b). */
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

export function makeProblem(sector: Sector, tier: Tier, r: Rand): Problem {
  return sector === 'formations' ? makeFormations(tier, r) : makeEngines(tier, r);
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
