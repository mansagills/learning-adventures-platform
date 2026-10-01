/**
 * Chapter 1's saved state. It lives in save.chapterData.ch1 as plain JSON,
 * so it is checked and repaired here every time it is read.
 */
export interface SpotState {
  looked: string[];
  recorded: boolean;
  tries: number;
}

export interface SortState {
  deck: string[];
  placed: Record<string, 'obs' | 'guess'>;
  mistakes: number;
  rung: number;
  done: boolean;
}

export interface Ch1State {
  spots: Record<string, SpotState>;
  observations: Array<{ spot: string; text: string }>;
  bonus: string[];
  sort: SortState | null;
  /** Mistakes in the first completed sort (Carver talks about it). */
  firstSortMistakes: number | null;
  seed: number;
  rounds: number;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

const checked = new WeakSet<object>();

/**
 * Normalise the chapter's data object in place and return it typed. Each
 * object is checked once, so objects handed out (e.g. to an open panel)
 * stay the same objects afterwards.
 */
export function ch1State(data: Record<string, unknown>): Ch1State {
  if (checked.has(data)) return data as unknown as Ch1State;
  checked.add(data);
  const spots: Record<string, SpotState> = {};
  if (isObj(data.spots))
    for (const [k, v] of Object.entries(data.spots)) {
      if (!isObj(v)) continue;
      spots[k] = { looked: strs(v.looked), recorded: v.recorded === true, tries: typeof v.tries === 'number' ? v.tries : 0 };
    }
  data.spots = spots;
  data.observations = Array.isArray(data.observations)
    ? data.observations.filter((o): o is { spot: string; text: string } => isObj(o) && typeof o.spot === 'string' && typeof o.text === 'string')
    : [];
  data.bonus = strs(data.bonus);
  if (isObj(data.sort)) {
    const s = data.sort;
    const placed: Record<string, 'obs' | 'guess'> = {};
    if (isObj(s.placed)) for (const [k, v] of Object.entries(s.placed)) if (v === 'obs' || v === 'guess') placed[k] = v;
    data.sort = {
      deck: strs(s.deck),
      placed,
      mistakes: typeof s.mistakes === 'number' ? s.mistakes : 0,
      rung: typeof s.rung === 'number' ? Math.min(3, Math.max(0, s.rung)) : 0,
      done: s.done === true,
    };
  } else data.sort = null;
  if (typeof data.firstSortMistakes !== 'number') data.firstSortMistakes = null;
  if (typeof data.seed !== 'number') data.seed = Math.floor(Math.random() * 1e9);
  if (typeof data.rounds !== 'number') data.rounds = 0;
  return data as unknown as Ch1State;
}

export function spotState(st: Ch1State, id: string): SpotState {
  if (!st.spots[id]) st.spots[id] = { looked: [], recorded: false, tries: 0 };
  return st.spots[id];
}
