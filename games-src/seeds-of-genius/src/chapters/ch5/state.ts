import { FARMER_ORDER, LOOKS_NEEDED, OPTION_ORDER, SPOTS, judgePlan, type FarmerId, type OptionId } from './data';

/**
 * Chapter 5's saved state. It lives in save.chapterData.ch5 as plain JSON,
 * so it is checked and repaired here every time it is read.
 */
export interface Attempt {
  farmer: FarmerId;
  picks: OptionId[];
}

export interface Ch5State {
  /** Spots the player has looked at (see data SPOTS). */
  looked: string[];
  /** The two cards picked right now at the table, per farmer. */
  draft: Record<FarmerId, OptionId[]>;
  /** Every plan the player checked, in order. */
  attempts: Attempt[];
  /** The plan that fits, once found. */
  plan: Record<FarmerId, OptionId[] | null>;
  /** The farmer heard the reasons and reacted. */
  explained: Record<FarmerId, boolean>;
  /** Hint rung per farmer (0 = none, 3 = worked example). */
  rung: Record<FarmerId, number>;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function cleanPicks(v: unknown): OptionId[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.filter((x): x is OptionId => OPTION_ORDER.includes(x as OptionId)))].slice(0, 2);
}

const checked = new WeakSet<object>();

export function ch5State(data: Record<string, unknown>): Ch5State {
  if (checked.has(data)) return data as unknown as Ch5State;
  checked.add(data);
  const ids = SPOTS.map((s) => s.id);
  data.looked = Array.isArray(data.looked) ? [...new Set(data.looked.filter((x): x is string => ids.includes(x as string)))] : [];
  const per = <T,>(key: string, clean: (v: unknown, f: FarmerId) => T): Record<FarmerId, T> => {
    const src = isObj(data[key]) ? (data[key] as Record<string, unknown>) : {};
    return Object.fromEntries(FARMER_ORDER.map((f) => [f, clean(src[f], f)])) as Record<FarmerId, T>;
  };
  data.draft = per('draft', (v) => cleanPicks(v));
  data.plan = per('plan', (v, f) => {
    const p = cleanPicks(v);
    return p.length === 2 && judgePlan(f, p).passes ? p : null;
  });
  data.explained = per('explained', (v, f) => v === true && (data.plan as Record<FarmerId, unknown>)[f] !== null);
  data.rung = per('rung', (v) => (typeof v === 'number' ? Math.min(3, Math.max(0, Math.floor(v))) : 0));
  const attempts: Attempt[] = [];
  if (Array.isArray(data.attempts))
    for (const a of data.attempts.slice(-30)) {
      if (!isObj(a) || !FARMER_ORDER.includes(a.farmer as FarmerId)) continue;
      const picks = cleanPicks(a.picks);
      if (picks.length === 2) attempts.push({ farmer: a.farmer as FarmerId, picks });
    }
  data.attempts = attempts;
  return data as unknown as Ch5State;
}

export function lookedAt(st: Ch5State, farmer: FarmerId): number {
  return SPOTS.filter((s) => s.farmer === farmer && st.looked.includes(s.id)).length;
}

export const looksDone = (st: Ch5State) => FARMER_ORDER.every((f) => lookedAt(st, f) >= LOOKS_NEEDED);

/** Both plans found and both farmers told why. */
export const bothHelped = (st: Ch5State) => FARMER_ORDER.every((f) => st.plan[f] !== null && st.explained[f]);

/** Did the player try store fertilizer in any plan? (Carver brings it up.) */
export const triedFertilizer = (st: Ch5State) => st.attempts.some((a) => a.picks.includes('fertilizer'));
