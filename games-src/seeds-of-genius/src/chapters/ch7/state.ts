import {
  EMPTY,
  EVIDENCE_ORDER,
  EXTRA_ORDER,
  MAIN_ORDER,
  MATERIAL_ORDER,
  MEASURE_ORDER,
  NEEDS,
  TRYOUT,
  allOk,
  checkTyped,
  rubric,
  upgradeFor,
  type Category,
  type Design,
  type Neighbor,
} from './data';

/**
 * Chapter 7's saved state. It lives in save.chapterData.ch7 as plain JSON,
 * so it is checked and repaired here every time it is read.
 */
export interface Ch7State {
  /** A need card id, or 'custom'. */
  needId: string | null;
  customNeed: string | null;
  customCategory: Category | null;
  /** Optional project name the player typed. */
  name: string | null;
  draft: Design;
  /** The version the neighbor tried first. */
  first: Design | null;
  /** The improved version that passed every check. */
  final: Design | null;
  /** Hint rung (0 = none, 3 = worked example). */
  rung: number;
  /** The player presented the card (the chapter's minigame step is done). */
  presented: boolean;
}

export type Step = 'need' | 'build' | 'revise' | 'card';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const CATS: Category[] = ['water', 'shade', 'waste', 'nature'];
const pick = <T extends string>(v: unknown, list: readonly T[]): T | null => (list.includes(v as T) ? (v as T) : null);

export function cleanDesign(v: unknown): Design {
  if (!isObj(v)) return { ...EMPTY, evidence: [] };
  const main = pick(v.main, MAIN_ORDER);
  return {
    main,
    material: pick(v.material, MATERIAL_ORDER),
    extra: pick(v.extra, EXTRA_ORDER),
    evidence: Array.isArray(v.evidence) ? [...new Set(v.evidence.filter((e) => EVIDENCE_ORDER.includes(e as never)))].slice(0, 2) as Design['evidence'] : [],
    measure: pick(v.measure, MEASURE_ORDER),
    compare: pick(v.compare, ['before_after', 'with_without'] as const),
    repeat: pick(v.repeat, ['once', 'several'] as const),
    upgrade: main && TRYOUT[main].upgrades.some((u) => u.id === v.upgrade) ? (v.upgrade as string) : null,
  };
}

const checked = new WeakSet<object>();

export function ch7State(data: Record<string, unknown>): Ch7State {
  if (checked.has(data)) return data as unknown as Ch7State;
  checked.add(data);
  const custom = typeof data.customNeed === 'string' ? checkTyped(data.customNeed, { min: 10, max: 120, words: 3 }) : null;
  data.customNeed = custom?.ok ? custom.text : null;
  data.customCategory = pick(data.customCategory, CATS);
  const needOk = NEEDS.some((n) => n.id === data.needId) || (data.needId === 'custom' && data.customNeed && data.customCategory);
  data.needId = needOk ? data.needId : null;
  const name = typeof data.name === 'string' ? checkTyped(data.name, { min: 2, max: 40 }) : null;
  data.name = name?.ok ? name.text : null;
  data.draft = cleanDesign(data.draft);
  data.first = data.needId && isObj(data.first) ? cleanDesign(data.first) : null;
  const st = data as unknown as Ch7State;
  const fin = st.first && isObj(data.final) ? cleanDesign(data.final) : null;
  data.final = fin && st.needId && passesRevision(fin, categoryOf(st)!) ? fin : null;
  data.rung = typeof data.rung === 'number' ? Math.min(3, Math.max(0, Math.floor(data.rung))) : 0;
  data.presented = data.presented === true && data.final !== null;
  return st;
}

export function need(st: Ch7State): { text: string; who: string; category: Category; from: Neighbor } | null {
  if (st.needId === 'custom' && st.customNeed && st.customCategory)
    return { text: st.customNeed, who: 'my community', category: st.customCategory, from: st.customCategory === 'water' || st.customCategory === 'shade' ? 'theo' : 'lottie' };
  const n = NEEDS.find((x) => x.id === st.needId);
  return n ? { text: n.text, who: n.who, category: n.category, from: n.from } : null;
}

export const categoryOf = (st: Ch7State) => need(st)?.category ?? null;

/** A revision passes when every check is met and the tryout problem is fixed. */
export function passesRevision(d: Design, category: Category): boolean {
  return allOk(rubric(d, category)) && !!upgradeFor(d)?.ok;
}

export function step(st: Ch7State): Step {
  if (!need(st)) return 'need';
  if (!st.first) return 'build';
  if (!st.final) return 'revise';
  return 'card';
}

/** Start the project over (keeps nothing but the chapter's progress). */
export function restart(st: Ch7State): void {
  st.needId = null;
  st.customNeed = null;
  st.customCategory = null;
  st.name = null;
  st.draft = { ...EMPTY, evidence: [] };
  st.first = null;
  st.final = null;
  st.rung = 0;
  st.presented = false;
}
