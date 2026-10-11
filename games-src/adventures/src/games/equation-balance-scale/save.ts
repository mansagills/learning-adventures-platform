import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { JOBS, type Job } from './problems';

export interface ScaleSave {
  version: 1;
  appearance: Appearance;
  stars: Record<Job, number>;
  played: Record<Job, number>;
  /** Jobs finished (each one lights a part of the beacon). */
  done: Job[];
  /** Jobs whose helper has explained them. */
  introduced: Job[];
  openingSeen: boolean;
  /** The first time on a scale, the controls tip is shown. */
  scaleTipSeen: boolean;
  /** Kiri's call to The Big Weigh-in (all three jobs done). */
  weighinCalled: boolean;
  /** The Big Weigh-in finale has been played. */
  weighinSeen: boolean;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Job, number> => ({ weigh: 0, rover: 0, dome: 0 });

export function freshSave(): ScaleSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'teal', accessory: 'none' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    introduced: [],
    openingSeen: false,
    scaleTipSeen: false,
    weighinCalled: false,
    weighinSeen: false,
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

export function cleanSave(raw: unknown): ScaleSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v)
      for (const j of JOBS) {
        const n = (v as Record<string, unknown>)[j];
        if (typeof n === 'number' && Number.isFinite(n)) out[j] = Math.max(0, Math.min(max, Math.floor(n)));
      }
    return out;
  };
  const jobs = (v: unknown) => (Array.isArray(v) ? JOBS.filter((j) => (v as unknown[]).includes(j)) : []);
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
    done: jobs(r.done),
    introduced: jobs(r.introduced),
    openingSeen: r.openingSeen === true,
    scaleTipSeen: r.scaleTipSeen === true,
    weighinCalled: r.weighinCalled === true,
    weighinSeen: r.weighinSeen === true,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<ScaleSave>('equationBalanceScale.save', freshSave, cleanSave);
