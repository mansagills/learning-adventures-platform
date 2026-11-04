import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import type { Power, Region } from '../../kit/worlds/wild-lands/weather-art';
import { LEVELS } from './levels';
import { GEAR_IDS, type GearId } from './shop';

const POWERS: Power[] = ['sun', 'cool', 'wind', 'rain', 'cold'];

const REGIONS: Region[] = ['shore', 'clouds', 'mountain', 'river', 'storm'];

export interface WeatherSave {
  version: 1;
  appearance: Appearance;
  /** Levels reached the flag on. */
  levelsDone: string[];
  /** The most droplets brought to the flag on each level. */
  bestDrops: Record<string, number>;
  /** Village requests helped (by level id). */
  requests: string[];
  /** Weather Book stars and questions answered, per region. */
  stars: Record<Region, number>;
  played: Record<Region, number>;
  /** Right answers at the forecast stop after each region's first level. */
  forecast: Record<Region, number>;
  /** Regions finished (both levels, five stars and the talk-it-through question). */
  done: Region[];
  /** Levels whose host has given the welcome talk. */
  introSeen: string[];
  openingSeen: boolean;
  irisMet: boolean;
  halfDoneSeen: boolean;
  easy: boolean;
  /** Question ids seen lately in each region (so every question comes up before any repeats). */
  recent: Record<Region, string[]>;
  learner: LearnerState;
  seed: number;
  /** Droplets to spend in the Weather Shop. */
  wallet: number;
  /** Power-ups bought, and the ones switched off for now. */
  gear: GearId[];
  gearOff: GearId[];
  /** Weather powers whose card has been shown. */
  powersSeen: Power[];
}

const zeroes = (): Record<Region, number> => ({ shore: 0, clouds: 0, mountain: 0, river: 0, storm: 0 });
const noLists = (): Record<Region, string[]> => ({ shore: [], clouds: [], mountain: [], river: [], storm: [] });

export function freshSave(): WeatherSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'teal', accessory: 'none' },
    levelsDone: [],
    bestDrops: {},
    requests: [],
    stars: zeroes(),
    played: zeroes(),
    forecast: zeroes(),
    done: [],
    introSeen: [],
    openingSeen: false,
    irisMet: false,
    halfDoneSeen: false,
    easy: false,
    recent: noLists(),
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
    wallet: 0,
    gear: [],
    gearOff: [],
    powersSeen: [],
  };
}

export function cleanSave(raw: unknown): WeatherSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v)
      for (const s of REGIONS) {
        const n = (v as Record<string, unknown>)[s];
        if (typeof n === 'number' && Number.isFinite(n)) out[s] = Math.max(0, Math.min(max, Math.floor(n)));
      }
    return out;
  };
  const only = <T extends string>(v: unknown, list: readonly T[]): T[] => (Array.isArray(v) ? list.filter((x) => (v as unknown[]).includes(x)) : []);
  const ids = LEVELS.map((l) => l.id);
  const recent = noLists();
  if (typeof r.recent === 'object' && r.recent)
    for (const s of REGIONS) {
      const v = (r.recent as Record<string, unknown>)[s];
      if (Array.isArray(v)) recent[s] = v.filter((x): x is string => typeof x === 'string' && x.length < 60).slice(-40);
    }
  const bestDrops: Record<string, number> = {};
  if (typeof r.bestDrops === 'object' && r.bestDrops)
    for (const id of ids) {
      const n = (r.bestDrops as Record<string, unknown>)[id];
      if (typeof n === 'number' && Number.isFinite(n)) bestDrops[id] = Math.max(0, Math.min(99, Math.floor(n)));
    }
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
    levelsDone: only(r.levelsDone, ids),
    bestDrops,
    requests: only(r.requests, ids),
    stars: nums(r.stars, 5),
    played: nums(r.played, 100000),
    forecast: nums(r.forecast, 99),
    done: only(r.done, REGIONS),
    introSeen: only(r.introSeen, ids),
    openingSeen: r.openingSeen === true,
    irisMet: r.irisMet === true,
    halfDoneSeen: r.halfDoneSeen === true,
    easy: r.easy === true,
    recent,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
    wallet: typeof r.wallet === 'number' && Number.isFinite(r.wallet) ? Math.max(0, Math.min(9999, Math.floor(r.wallet))) : 0,
    gear: only(r.gear, GEAR_IDS),
    gearOff: only(r.gearOff, GEAR_IDS),
    powersSeen: only(r.powersSeen, POWERS),
  };
}

export const store = new SaveStore<WeatherSave>('weatherWizardBattle.save', freshSave, cleanSave);
