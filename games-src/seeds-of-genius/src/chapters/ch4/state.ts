import { CONTAINER_ORDER, CROP_ORDER, STEP_ORDER, evaluate, sameDesign, type CropId, type Design } from './data';

/**
 * Chapter 4's saved state. It lives in save.chapterData.ch4 as plain JSON,
 * so it is checked and repaired here every time it is read.
 */
export interface Trial {
  design: Design;
  /** The trial this one improves on, if the player chose "Improve this idea". */
  from: number | null;
}

export interface Ch4State {
  /** Crop-shelf tests the player has tried, per crop. */
  explored: Record<CropId, string[]>;
  draft: Design;
  trials: Trial[];
  /** The trial being improved right now. */
  improving: number | null;
  /** Hint rung (0 = none, 3 = worked example). */
  rung: number;
  /** The trial the player chose to bring to Carver. */
  chosen: number | null;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function cleanDesign(v: unknown): Design | null {
  if (!isObj(v)) return null;
  const crop = CROP_ORDER.includes(v.crop as CropId) ? (v.crop as CropId) : null;
  const container = CONTAINER_ORDER.includes(v.container as Design['container']) ? (v.container as Design['container']) : null;
  const steps = Array.isArray(v.steps) ? v.steps.filter((s): s is Design['steps'][number] => STEP_ORDER.includes(s as Design['steps'][number])).slice(0, 2) : [];
  if (!crop || !container || new Set(steps).size !== steps.length) return null;
  return { crop, steps, container, label: v.label === true };
}

const DEFAULT_DRAFT: Design = { crop: 'peanuts', steps: ['boil'], container: 'bowl', label: false };

const checked = new WeakSet<object>();

export function ch4State(data: Record<string, unknown>): Ch4State {
  if (checked.has(data)) return data as unknown as Ch4State;
  checked.add(data);
  const explored = { peanuts: [], sweetpotato: [], cowpeas: [] } as Record<CropId, string[]>;
  if (isObj(data.explored))
    for (const c of CROP_ORDER) {
      const v = (data.explored as Record<string, unknown>)[c];
      if (Array.isArray(v)) explored[c] = [...new Set(v.filter((x): x is string => typeof x === 'string'))];
    }
  data.explored = explored;
  data.draft = cleanDesign(data.draft) ?? { ...DEFAULT_DRAFT };
  const trials: Trial[] = [];
  if (Array.isArray(data.trials))
    for (const t of data.trials.slice(0, 40)) {
      const d = isObj(t) ? cleanDesign(t.design) : null;
      if (!d) continue;
      const from = isObj(t) && typeof t.from === 'number' && t.from >= 0 && t.from < trials.length ? t.from : null;
      trials.push({ design: d, from });
    }
  data.trials = trials;
  data.improving = typeof data.improving === 'number' && data.improving >= 0 && data.improving < trials.length ? data.improving : null;
  data.rung = typeof data.rung === 'number' ? Math.min(3, Math.max(0, Math.floor(data.rung))) : 0;
  data.chosen = typeof data.chosen === 'number' && data.chosen >= 0 && data.chosen < trials.length && isRevision(trials, data.chosen) ? data.chosen : null;
  return data as unknown as Ch4State;
}

export function exploredCount(st: Ch4State): number {
  return CROP_ORDER.filter((c) => st.explored[c].length > 0).length;
}
export const exploredAll = (st: Ch4State) => exploredCount(st) === CROP_ORDER.length;

/**
 * A trial is a real revision when it improves on an earlier trial: it
 * passes the need, is not the same design, and either the earlier one
 * failed or this one scores at least as well.
 */
export function isRevision(trials: Trial[], i: number): boolean {
  const t = trials[i];
  if (!t || t.from === null) return false;
  const base = trials[t.from];
  if (!base || sameDesign(base.design, t.design)) return false;
  const r = evaluate(t.design);
  const b = evaluate(base.design);
  return r.passes && (!b.passes || r.score >= b.score);
}

export function hasRevision(st: Ch4State): boolean {
  return st.trials.some((_, i) => isRevision(st.trials, i));
}
