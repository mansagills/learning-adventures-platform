import { QUESTIONS, TEST_LEVELS, USUAL, VAR_ORDER, VARS, questionById, runTray, type Hypothesis, type Prediction, type Setup, type TrayResult } from './data';

/**
 * Chapter 6's saved state. It lives in save.chapterData.ch6 as plain JSON,
 * so it is checked and repaired here every time it is read.
 */
export interface Answers {
  /** Which tray grew taller on average ('a' | 'b' | 'same'), once read correctly. */
  taller: string | null;
  supported: boolean | null;
  conclusion: string | null;
  next: string | null;
}

export interface Experiment {
  question: string;
  hyp: Hypothesis;
  a: Setup;
  b: Setup;
  conclusion: string;
  next: string;
}

export interface Ch6State {
  /** Hattie's seedlings measured in the greenhouse ('sunny', 'shady'). */
  observed: string[];
  question: string | null;
  hyp: Hypothesis | null;
  a: Setup;
  b: Setup;
  /** The setup passed the fair-test check and is planted. */
  planted: boolean;
  /** Pots measured so far: 0-2 are tray A, 3-5 are tray B. */
  measured: number[];
  answers: Answers;
  /** Hint rung for the current step (0 = none, 3 = worked example). */
  rung: number;
  /** How many times Carver warned about changing more than one thing. */
  warnings: number;
  /** Finished experiments. */
  log: Experiment[];
  /** The experiment the player brought to Carver. */
  chosen: number | null;
}

export type Step = 'question' | 'hypothesis' | 'setup' | 'measure' | 'conclude' | 'done';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function cleanSetup(v: unknown): Setup {
  const out = { ...USUAL };
  if (isObj(v))
    for (const k of VAR_ORDER) if (VARS[k].levels.some((l) => l.id === v[k])) (out as Record<string, string>)[k] = v[k] as string;
  return out;
}

function cleanHyp(v: unknown, question: string | null): Hypothesis | null {
  const q = questionById(question);
  if (!q?.variable || !isObj(v)) return null;
  const level = TEST_LEVELS[q.variable].some((t) => t.id === v.level) ? (v.level as string) : null;
  const prediction = ['taller', 'shorter', 'same'].includes(v.prediction as string) ? (v.prediction as Prediction) : null;
  return level && prediction ? { level, prediction } : null;
}

const str = (v: unknown) => (typeof v === 'string' ? v : null);

const checked = new WeakSet<object>();

export function ch6State(data: Record<string, unknown>): Ch6State {
  if (checked.has(data)) return data as unknown as Ch6State;
  checked.add(data);
  data.observed = Array.isArray(data.observed) ? [...new Set(data.observed.filter((x) => x === 'sunny' || x === 'shady'))] : [];
  const q = QUESTIONS.find((x) => x.id === data.question && x.variable);
  data.question = q ? q.id : null;
  data.hyp = cleanHyp(data.hyp, data.question as string | null);
  data.a = cleanSetup(data.a);
  data.b = cleanSetup(data.b);
  data.planted = data.planted === true && data.hyp !== null;
  data.measured = data.planted && Array.isArray(data.measured) ? [...new Set(data.measured.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < 6))] : [];
  const ans = isObj(data.answers) ? data.answers : {};
  data.answers = {
    taller: ['a', 'b', 'same'].includes(ans.taller as string) ? ans.taller : null,
    supported: typeof ans.supported === 'boolean' ? ans.supported : null,
    conclusion: str(ans.conclusion),
    next: str(ans.next),
  };
  data.rung = typeof data.rung === 'number' ? Math.min(3, Math.max(0, Math.floor(data.rung))) : 0;
  data.warnings = typeof data.warnings === 'number' && data.warnings >= 0 ? Math.floor(data.warnings) : 0;
  const log: Experiment[] = [];
  if (Array.isArray(data.log))
    for (const e of data.log.slice(-20)) {
      if (!isObj(e)) continue;
      const question = QUESTIONS.find((x) => x.id === e.question && x.variable)?.id ?? null;
      const hyp = cleanHyp(e.hyp, question);
      const conclusion = str(e.conclusion);
      const next = str(e.next);
      if (question && hyp && conclusion && next) log.push({ question, hyp, a: cleanSetup(e.a), b: cleanSetup(e.b), conclusion, next });
    }
  data.log = log;
  data.chosen = typeof data.chosen === 'number' && data.chosen >= 0 && data.chosen < log.length ? data.chosen : null;
  return data as unknown as Ch6State;
}

export const observedAll = (st: Ch6State) => st.observed.length === 2;

export function step(st: Ch6State): Step {
  if (!st.question) return 'question';
  if (!st.hyp) return 'hypothesis';
  if (!st.planted) return 'setup';
  if (st.measured.length < 6) return 'measure';
  const a = st.answers;
  if (!a.taller || a.supported === null || !a.conclusion || !a.next) return 'conclude';
  return 'done';
}

export function results(st: Pick<Experiment, 'a' | 'b'>): { a: TrayResult; b: TrayResult } {
  return { a: runTray(st.a, 'a'), b: runTray(st.b, 'b') };
}

/** Start a fresh experiment; the observations and the log are kept. */
export function restart(st: Ch6State): void {
  st.question = null;
  st.hyp = null;
  st.a = { ...USUAL };
  st.b = { ...USUAL };
  st.planted = false;
  st.measured = [];
  st.answers = { taller: null, supported: null, conclusion: null, next: null };
  st.rung = 0;
}
