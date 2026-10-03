import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { STATIONS, type Station } from './problems';

export interface ClockSave {
  version: 1;
  appearance: Appearance;
  stars: Record<Station, number>;
  played: Record<Station, number>;
  /** Jobs finished (each fixed part of the tower). */
  done: Station[];
  /** Places whose person has explained their job. */
  introduced: Station[];
  openingSeen: boolean;
  finaleSeen: boolean;
  /** Best Time Attack score, and every medal won. */
  best: number;
  medals: Array<'gold' | 'silver' | 'bronze'>;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Station, number> => ({ school: 0, bus: 0, bakery: 0 });

export function freshSave(): ClockSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'blue', accessory: 'none' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    introduced: [],
    openingSeen: false,
    finaleSeen: false,
    best: 0,
    medals: [],
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

const isStation = (v: unknown): v is Station => STATIONS.includes(v as Station);
const MEDALS = ['gold', 'silver', 'bronze'] as const;

export function cleanSave(raw: unknown): ClockSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v)
      for (const s of STATIONS) {
        const n = (v as Record<string, unknown>)[s];
        if (typeof n === 'number' && Number.isFinite(n)) out[s] = Math.max(0, Math.min(max, Math.floor(n)));
      }
    return out;
  };
  return {
    version: 1,
    appearance: {
      body: a.body === 'boy' || a.body === 'girl' ? a.body : d.appearance.body,
      skin: pick(a.skin, SKIN_TONES, d.appearance.skin),
      hairStyle: pick(a.hairStyle, HAIR_STYLES, d.appearance.hairStyle) as Appearance['hairStyle'],
      hairColor: pick(a.hairColor, HAIR_COLORS, d.appearance.hairColor),
      outfit: pick(a.outfit, OUTFIT_COLORS, d.appearance.outfit),
      accessory: pick(a.accessory, ACCESSORIES, d.appearance.accessory) as Appearance['accessory'],
    },
    stars: nums(r.stars, 5),
    played: nums(r.played, 100000),
    done: Array.isArray(r.done) ? STATIONS.filter((s) => (r.done as unknown[]).includes(s)) : [],
    introduced: Array.isArray(r.introduced) ? r.introduced.filter(isStation) : [],
    openingSeen: r.openingSeen === true,
    finaleSeen: r.finaleSeen === true,
    best: typeof r.best === 'number' && Number.isFinite(r.best) ? Math.max(0, Math.min(999, Math.floor(r.best))) : 0,
    medals: Array.isArray(r.medals) ? MEDALS.filter((m) => (r.medals as unknown[]).includes(m)) : [],
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<ClockSave>('timeAttackClock.save', freshSave, cleanSave);
