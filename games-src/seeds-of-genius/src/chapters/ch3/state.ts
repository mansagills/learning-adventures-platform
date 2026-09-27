import { CROP_ORDER, FARMER_PLAN, PLOTS, SEASONS, WHY_OPTIONS, type CropId } from './data';

/**
 * Chapter 3's saved state. It lives in save.chapterData.ch3 as plain JSON,
 * so it is checked and repaired here every time it is read.
 */
export interface Ch3State {
  /** Soil-view zones looked at, per plot. */
  looked: Record<'west' | 'east', string[]>;
  /** The plan being edited on the bench. */
  draft: CropId[];
  /** Every plan the player has tested (results are recomputed from the plan). */
  tested: CropId[][];
  /** Wrong answers tried on the "why" question, and whether it is answered. */
  whyWrong: string[];
  whyDone: boolean;
  /** Index into `tested` of the plan the player chose for Carver. */
  chosen: number | null;
  /** Hint rung for planning (0 = none, 3 = worked example). */
  rung: number;
  /** Plans the player tried to bring that did not fit (for hints). */
  rejected: number;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isCrop = (v: unknown): v is CropId => typeof v === 'string' && (CROP_ORDER as string[]).includes(v);
const isPlan = (v: unknown): v is CropId[] => Array.isArray(v) && v.length === SEASONS && v.every(isCrop);

const checked = new WeakSet<object>();

export function ch3State(data: Record<string, unknown>): Ch3State {
  if (checked.has(data)) return data as unknown as Ch3State;
  checked.add(data);
  const looked: Ch3State['looked'] = { west: [], east: [] };
  if (isObj(data.looked))
    for (const plot of PLOTS) {
      const v = (data.looked as Record<string, unknown>)[plot.id];
      const ids = plot.zones.map((z) => z.id);
      if (Array.isArray(v)) looked[plot.id] = [...new Set(v.filter((x): x is string => typeof x === 'string' && ids.includes(x)))];
    }
  data.looked = looked;
  data.draft = isPlan(data.draft) ? data.draft : [...FARMER_PLAN];
  data.tested = Array.isArray(data.tested) ? data.tested.filter(isPlan).slice(-12) : [];
  const wrongIds = WHY_OPTIONS.filter((o) => !o.ok).map((o) => o.id as string);
  data.whyWrong = Array.isArray(data.whyWrong) ? data.whyWrong.filter((x): x is string => typeof x === 'string' && wrongIds.includes(x)) : [];
  data.whyDone = data.whyDone === true;
  const tested = data.tested as CropId[][];
  data.chosen = typeof data.chosen === 'number' && Number.isInteger(data.chosen) && data.chosen >= 0 && data.chosen < tested.length ? data.chosen : null;
  data.rung = typeof data.rung === 'number' ? Math.min(3, Math.max(0, Math.floor(data.rung))) : 0;
  data.rejected = typeof data.rejected === 'number' ? Math.max(0, data.rejected) : 0;
  return data as unknown as Ch3State;
}

/** Has the player looked at every part of both soil samples? */
export function plotDone(st: Ch3State, id: 'west' | 'east'): boolean {
  const plot = PLOTS.find((p) => p.id === id)!;
  return plot.zones.every((z) => st.looked[id].includes(z.id));
}

export function bothPlotsDone(st: Ch3State): boolean {
  return plotDone(st, 'west') && plotDone(st, 'east');
}

/** Did the player test Mr. Hill's plan and at least one plan with a legume? */
export function comparedPlans(st: Ch3State): boolean {
  const farmer = st.tested.some((p) => p.every((c) => c === 'cotton'));
  const other = st.tested.some((p) => p.some((c) => c === 'peanuts' || c === 'cowpeas'));
  return farmer && other;
}

/** Record a tested plan (same plan twice counts once). Returns its index. */
export function addTested(st: Ch3State, plan: CropId[]): number {
  const i = st.tested.findIndex((p) => p.join() === plan.join());
  if (i >= 0) return i;
  st.tested.push([...plan]);
  return st.tested.length - 1;
}
