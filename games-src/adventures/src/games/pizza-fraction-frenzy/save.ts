import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { STATIONS, type Station } from './problems';

export interface FeastSave {
  version: 1;
  appearance: Appearance;
  stars: Record<Station, number>;
  played: Record<Station, number>;
  /** Jobs finished (each one lights a brazier). */
  done: Station[];
  /** Jobs whose person has explained them. */
  introduced: Station[];
  openingSeen: boolean;
  /** Livia's "all four braziers" call to the feast. */
  feastCalled: boolean;
  /** The Festival Feast finale has been played. */
  feastSeen: boolean;
  /** Best Frenzy score (loaves served in 60 seconds). */
  best: number;
  /** How many of the ten Fraction Pizza Party problems have been asked (they come first at level 2). */
  party: number;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Station, number> => ({ bakery: 0, road: 0, market: 0, mosaic: 0 });

export function freshSave(): FeastSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'teal', accessory: 'none' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    introduced: [],
    openingSeen: false,
    feastCalled: false,
    feastSeen: false,
    best: 0,
    party: 0,
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

const isStation = (v: unknown): v is Station => STATIONS.includes(v as Station);

export function cleanSave(raw: unknown): FeastSave {
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
  const int = (v: unknown, max: number, dv: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : dv);
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
    introduced: Array.isArray(r.introduced) ? STATIONS.filter((s) => (r.introduced as unknown[]).filter(isStation).includes(s)) : [],
    openingSeen: r.openingSeen === true,
    feastCalled: r.feastCalled === true,
    feastSeen: r.feastSeen === true,
    best: int(r.best, 999, 0),
    party: int(r.party, 1000, 0),
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<FeastSave>('forumFractionFeast.save', freshSave, cleanSave);
