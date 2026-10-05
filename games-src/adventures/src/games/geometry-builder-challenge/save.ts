import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { STATIONS, type Station } from './problems';

export interface YardSave {
  version: 1;
  appearance: Appearance;
  stars: Record<Station, number>;
  played: Record<Station, number>;
  /** Jobs finished (each delivers a part of the clubhouse). */
  done: Station[];
  /** Places whose helper has explained the job (plus 'chip' and 'rush'). */
  introduced: string[];
  openingSeen: boolean;
  finaleSeen: boolean;
  /** Best Rush score, and how many Rush rounds beat Chip. */
  rushBest: number;
  rushWins: number;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Station, number> => ({ arcade: 0, blocks: 0, blueprint: 0, garden: 0 });

export function freshSave(): YardSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'orange', accessory: 'cap' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    introduced: [],
    openingSeen: false,
    finaleSeen: false,
    rushBest: 0,
    rushWins: 0,
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

export function cleanSave(raw: unknown): YardSave {
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
  const num = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0);
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
    introduced: Array.isArray(r.introduced) ? r.introduced.filter((x): x is string => typeof x === 'string' && x.length < 20).slice(0, 12) : [],
    openingSeen: r.openingSeen === true,
    finaleSeen: r.finaleSeen === true,
    rushBest: num(r.rushBest, 999),
    rushWins: num(r.rushWins, 100000),
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<YardSave>('shapeTownBuilders.save', freshSave, cleanSave);
