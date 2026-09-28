/**
 * Chapter 6: A Scientist's Method / Design Your Own Experiment.
 *
 * The player tests one question about bean seedlings with two trays of
 * three pots. The growth rules are a simple model for the game, based on
 * what really happens to young bean plants over two weeks:
 * - shade: seedlings stretch toward light, so they grow TALLER, but pale
 *   and floppy (this surprises most people);
 * - too little or too much water: both stunt them;
 * - compost: in the first two weeks a bean mostly lives on the food stored
 *   in its seed, so height hardly changes, but leaves are greener.
 */

export type VarId = 'light' | 'water' | 'soil';
export type Light = 'sun' | 'shade';
export type Water = 'little' | 'some' | 'lots';
export type Soil = 'plain' | 'compost';

export interface Setup {
  light: Light;
  water: Water;
  soil: Soil;
}

export const VAR_ORDER: VarId[] = ['light', 'water', 'soil'];

export const VARS: Record<VarId, { name: string; levels: Array<{ id: string; name: string }> }> = {
  light: {
    name: 'Light',
    levels: [
      { id: 'sun', name: 'Sunny bench' },
      { id: 'shade', name: 'Shady shelf' },
    ],
  },
  water: {
    name: 'Water',
    levels: [
      { id: 'little', name: '¼ cup' },
      { id: 'some', name: '½ cup' },
      { id: 'lots', name: '1 cup' },
    ],
  },
  soil: {
    name: 'Soil',
    levels: [
      { id: 'plain', name: 'Plain soil' },
      { id: 'compost', name: 'Soil + compost' },
    ],
  },
};

export function levelName(v: VarId, level: string): string {
  return VARS[v].levels.find((l) => l.id === level)?.name ?? level;
}

export const USUAL: Setup = { light: 'sun', water: 'some', soil: 'plain' };

export function setupText(s: Setup): string {
  return VAR_ORDER.map((v) => levelName(v, s[v])).join(', ');
}

// ---------------------------------------------------------------- questions

export interface Question {
  id: string;
  text: string;
  /** The one thing to change, if the question can be tested. */
  variable: VarId | null;
  /** Why it can, or cannot, be tested. */
  feedback: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 'light',
    text: 'Does a shady spot change how tall bean seedlings grow?',
    variable: 'light',
    feedback: 'Testable: you can change the light and measure the height.',
  },
  {
    id: 'water',
    text: 'Does the amount of water change how tall bean seedlings grow?',
    variable: 'water',
    feedback: 'Testable: you can change the water and measure the height.',
  },
  {
    id: 'soil',
    text: 'Does adding compost change how tall bean seedlings grow?',
    variable: 'soil',
    feedback: 'Testable: you can add compost to one tray and measure the height.',
  },
  {
    id: 'pretty',
    text: 'Which bean plant is the prettiest?',
    variable: null,
    feedback: '"Prettiest" is an opinion. People can disagree, and a ruler cannot measure it. Pick a question you can measure.',
  },
  {
    id: 'happy',
    text: 'What makes plants happy?',
    variable: null,
    feedback: 'That is a big, fuzzy question. What would you change, and what would you measure? Pick a question that names one thing to change.',
  },
  {
    id: 'grow',
    text: 'Do bean seeds grow?',
    variable: null,
    feedback: 'We already know they do! A good test question compares two ways of growing them. Pick one that asks what changes the height.',
  },
];

export const questionById = (id: string | null) => QUESTIONS.find((q) => q.id === id) ?? null;

// ---------------------------------------------------------------- hypotheses

export type Prediction = 'taller' | 'shorter' | 'same';

/** The level tray B tests for each question (tray A keeps the usual way). */
export const TEST_LEVELS: Record<VarId, Array<{ id: string; phrase: string; noun: string }>> = {
  light: [{ id: 'shade', phrase: 'grow on the shady shelf', noun: 'shade' }],
  water: [
    { id: 'lots', phrase: 'get more water (1 cup)', noun: 'more water' },
    { id: 'little', phrase: 'get less water (¼ cup)', noun: 'less water' },
  ],
  soil: [{ id: 'compost', phrase: 'grow in soil with compost', noun: 'compost' }],
};

export function testNoun(v: VarId, level: string): string {
  return TEST_LEVELS[v].find((t) => t.id === level)?.noun ?? levelName(v, level);
}

export interface Hypothesis {
  /** Tray B's level for the question's variable. */
  level: string;
  prediction: Prediction;
}

export function testPhrase(v: VarId, level: string): string {
  return TEST_LEVELS[v].find((t) => t.id === level)?.phrase ?? `get ${levelName(v, level)}`;
}

export const PREDICTION_TEXT: Record<Prediction, string> = {
  taller: 'grow taller',
  shorter: 'grow shorter',
  same: 'grow about the same',
};

export function hypothesisText(v: VarId, h: Hypothesis): string {
  return `If bean seedlings ${testPhrase(v, h.level)}, they will ${PREDICTION_TEXT[h.prediction]} than seedlings grown the usual way.`;
}

/** Tray A (the comparison) grown the usual way; tray B changes only the tested thing. */
export function plannedSetups(v: VarId, h: Hypothesis): { a: Setup; b: Setup } {
  return { a: { ...USUAL }, b: { ...USUAL, [v]: h.level } as Setup };
}

// ---------------------------------------------------------------- checking the setup

export type SetupProblem =
  | { kind: 'ok' }
  | { kind: 'none' }
  | { kind: 'many'; changed: VarId[] }
  | { kind: 'wrong'; changed: VarId }
  | { kind: 'direction' }
  | { kind: 'comparison' };

export function diffVars(a: Setup, b: Setup): VarId[] {
  return VAR_ORDER.filter((v) => a[v] !== b[v]);
}

/** Is this a fair test of the question and hypothesis? */
export function checkSetup(v: VarId, h: Hypothesis, a: Setup, b: Setup): SetupProblem {
  const changed = diffVars(a, b);
  if (changed.length === 0) return { kind: 'none' };
  if (changed.length > 1) return { kind: 'many', changed };
  if (changed[0] !== v) return { kind: 'wrong', changed: changed[0] };
  if (a[v] !== USUAL[v]) return { kind: 'comparison' };
  if (b[v] !== h.level) return { kind: 'direction' };
  return { kind: 'ok' };
}

// ---------------------------------------------------------------- growing

/** Small, fixed differences between pots, so trials vary like real ones. */
const WOBBLE = { a: [0.5, -1, 0.5], b: [-0.5, 1, -0.5] };

export function growth(s: Setup): { height: number; leaves: string } {
  let height = 10;
  if (s.light === 'shade') height += 5;
  if (s.water === 'little') height -= 4;
  if (s.water === 'lots') height -= 3;
  if (s.soil === 'compost') height += 0.5;
  const notes: string[] = [];
  if (s.light === 'shade') notes.push('pale, thin, floppy stems');
  if (s.water === 'little') notes.push('droopy, dry leaves');
  if (s.water === 'lots') notes.push('yellow lower leaves, soggy soil');
  if (s.soil === 'compost' && s.light === 'sun') notes.push('dark green leaves');
  return { height, leaves: notes.length ? notes.join('; ') : 'green, sturdy' };
}

export interface TrayResult {
  heights: number[];
  average: number;
  leaves: string;
}

export function runTray(s: Setup, tray: 'a' | 'b'): TrayResult {
  const g = growth(s);
  const heights = WOBBLE[tray].map((w) => g.height + w);
  const average = Math.round((heights.reduce((x, y) => x + y, 0) / heights.length) * 10) / 10;
  return { heights, average, leaves: g.leaves };
}

/** What the data says about tray B compared with tray A. */
export function outcome(a: TrayResult, b: TrayResult): Prediction {
  const d = b.average - a.average;
  if (Math.abs(d) < 1) return 'same';
  return d > 0 ? 'taller' : 'shorter';
}

export const cm = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} cm`;

// ---------------------------------------------------------------- conclusions

export interface Choice {
  id: string;
  text: string;
  ok: boolean;
  feedback: string;
}

/** Three conclusion statements: one matches the data; two are common mistakes. */
export function conclusionChoices(v: VarId, h: Hypothesis, a: TrayResult, b: TrayResult): Choice[] {
  const o = outcome(a, b);
  const bWord = testNoun(v, h.level);
  const data = `(tray B averaged ${cm(b.average)}; tray A averaged ${cm(a.average)})`;
  const main =
    o === 'same'
      ? `Seedlings that ${testPhrase(v, h.level)} grew about the same height as the usual way ${data}.`
      : `Seedlings that ${testPhrase(v, h.level)} grew ${o} than the usual way ${data}.`;
  const tallest = Math.max(...b.heights, ...a.heights);
  const which = b.heights.includes(tallest) ? 'B' : 'A';
  return [
    {
      id: 'one-pot',
      text: `The tallest single pot was in tray ${which} (${cm(tallest)}), so tray ${which} wins.`,
      ok: false,
      feedback: 'One pot can be a fluke. That is why you grew three pots in each tray. Look at the averages.',
    },
    {
      id: 'data',
      text: main + (v === 'light' ? ' But they were pale and floppy.' : ''),
      ok: true,
      feedback: 'Yes. Your conclusion uses the averages from all your pots.',
    },
    {
      id: 'always',
      text: `This proves ${bWord} is ${o === 'taller' ? 'good' : o === 'shorter' ? 'bad' : 'useless'} for every plant in the world, forever.`,
      ok: false,
      feedback: 'You tested bean seedlings for two weeks, not every plant. A good conclusion only says what your data shows.',
    },
  ];
}

/** What to do next: after the data, a scientist keeps going (or changes their mind). */
export function nextChoices(supported: boolean): Choice[] {
  return supported
    ? [
        { id: 'repeat', text: 'Test it again with more pots, to check the result.', ok: true, feedback: 'Good plan. Repeating a test makes a result stronger.' },
        { id: 'done', text: 'Stop. One test proves it forever.', ok: false, feedback: 'One test is a good start, but scientists repeat tests to be sure. What could you do next?' },
        { id: 'new', text: 'Ask a new question that my results made me wonder about.', ok: true, feedback: 'Yes! Good results lead to new questions.' },
      ]
    : [
        { id: 'revise', text: 'Change my idea to match what the data showed, then test again.', ok: true, feedback: 'Yes. When the data disagrees with your guess, you change your idea, not the data.' },
        { id: 'ignore', text: 'Keep my hypothesis and ignore the data.', ok: false, feedback: 'The data is what really happened. A scientist changes the idea, never the data. What could you do instead?' },
        { id: 'repeat', text: 'Test again with more pots, to check the surprise.', ok: true, feedback: 'Good plan. A surprising result is worth checking again.' },
      ];
}

/** Worked examples for the top of each hint ladder. */
export const EXAMPLE = {
  question: 'soil',
  hypothesis: { level: 'compost', prediction: 'taller' as Prediction },
};
