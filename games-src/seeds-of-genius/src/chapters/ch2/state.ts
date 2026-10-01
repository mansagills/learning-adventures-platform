import { BARRIERS, STAGES, SUPPORTS, shuffledOrder } from './data';

/**
 * Chapter 2's saved state. It lives in save.chapterData.ch2 as plain JSON,
 * so it is checked and repaired here every time it is read.
 */
export interface Ch2State {
  /** Displays the player has opened (a skipped sensitive display counts). */
  visited: string[];
  /** Sensitive displays the player chose to skip for now. */
  skipped: string[];
  /** The player's current timeline arrangement (always all six stages). */
  order: string[];
  /** How many cards at the top of the timeline a hint has locked in place. */
  locked: number;
  /** Times "Check my order" found a mistake. */
  checks: number;
  /** Hint rung for the timeline (0 = none, 3 = worked example). */
  rung: number;
  /** Which activity screen is open: order, then barrier, then support, then done. */
  phase: 'order' | 'barrier' | 'support' | 'done';
  barrier: string | null;
  support: string | null;
  /** Wrong picks tried, so they stay crossed out after a reload. */
  wrongPicks: string[];
  seed: number;
}

const STAGE_IDS = STAGES.map((s) => s.id);
const known = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && STAGE_IDS.includes(x)))] : []);
const PHASES = ['order', 'barrier', 'support', 'done'] as const;

const checked = new WeakSet<object>();

/** Is this list exactly the six stages, each once? */
function isFullOrder(v: unknown): v is string[] {
  return Array.isArray(v) && v.length === STAGE_IDS.length && STAGE_IDS.every((id) => v.includes(id));
}

/**
 * Normalise the chapter's data object in place and return it typed. Each
 * object is checked once, so objects handed out (e.g. to an open panel)
 * stay the same objects afterwards.
 */
export function ch2State(data: Record<string, unknown>): Ch2State {
  if (checked.has(data)) return data as unknown as Ch2State;
  checked.add(data);
  if (typeof data.seed !== 'number') data.seed = Math.floor(Math.random() * 1e9);
  data.visited = known(data.visited);
  data.skipped = known(data.skipped);
  if (!isFullOrder(data.order)) data.order = shuffledOrder(data.seed as number);
  data.locked = typeof data.locked === 'number' ? Math.min(STAGE_IDS.length, Math.max(0, Math.floor(data.locked))) : 0;
  data.checks = typeof data.checks === 'number' ? Math.max(0, data.checks) : 0;
  data.rung = typeof data.rung === 'number' ? Math.min(3, Math.max(0, Math.floor(data.rung))) : 0;
  if (!PHASES.includes(data.phase as Ch2State['phase'])) data.phase = 'order';
  data.barrier = BARRIERS.some((b) => b.ok && b.id === data.barrier) ? data.barrier : null;
  data.support = SUPPORTS.some((s) => s.ok && s.id === data.support) ? data.support : null;
  const pickIds = [...BARRIERS, ...SUPPORTS].map((p) => p.id);
  data.wrongPicks = Array.isArray(data.wrongPicks) ? data.wrongPicks.filter((x): x is string => typeof x === 'string' && pickIds.includes(x)) : [];
  const st = data as unknown as Ch2State;
  // Keep the phases consistent with the answers (e.g. after a hand-edited save).
  if (st.phase !== 'order' && !isCorrect(st.order)) st.phase = 'order';
  if ((st.phase === 'support' || st.phase === 'done') && !st.barrier) st.phase = 'barrier';
  if (st.phase === 'done' && !st.support) st.phase = 'support';
  return st;
}

/** Is the timeline in the right order? */
export function isCorrect(order: string[]): boolean {
  return order.length === STAGE_IDS.length && order.every((id, i) => id === STAGE_IDS[i]);
}

/** How many cards are already in their right place. */
export function rightPlaces(order: string[]): number {
  return order.filter((id, i) => id === STAGE_IDS[i]).length;
}

/**
 * Hint rung 2: put the first card that is out of place where it belongs and
 * lock every card above it, so the player can't undo the help.
 */
export function lockNextCard(st: Ch2State): string | null {
  const i = st.order.findIndex((id, k) => id !== STAGE_IDS[k]);
  if (i < 0) return null;
  const want = STAGE_IDS[i];
  const from = st.order.indexOf(want);
  st.order.splice(from, 1);
  st.order.splice(i, 0, want);
  st.locked = Math.max(st.locked, i + 1);
  return want;
}

/** Swap a card with its neighbour, unless that would move a locked card. */
export function moveCard(st: Ch2State, index: number, dir: -1 | 1): boolean {
  const j = index + dir;
  if (index < st.locked || j < st.locked || j < 0 || j >= st.order.length) return false;
  [st.order[index], st.order[j]] = [st.order[j], st.order[index]];
  return true;
}
