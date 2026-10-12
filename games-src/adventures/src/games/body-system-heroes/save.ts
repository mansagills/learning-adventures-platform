import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import type { UpgradeId } from './art';
import { MISSIONS, type Mission } from './problems';

export interface HeroesSave {
  version: 1;
  appearance: Appearance;
  stars: Record<Mission, number>;
  played: Record<Mission, number>;
  /** Missions finished (each one heals an organ on the body map and gives an upgrade). */
  done: Mission[];
  /** Missions Dr. Ama has briefed. */
  briefed: Mission[];
  /** Missions whose healthy-habit game has been played. */
  habits: Mission[];
  upgrades: UpgradeId[];
  openingSeen: boolean;
  flyTipSeen: boolean;
  /** Question ids asked lately (so every question comes up before any repeats). */
  recent: string[];
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Mission, number> => ({ skin: 0, mouth: 0, lungs: 0, gut: 0, heart: 0, brain: 0 });
const UPGRADE_IDS: UpgradeId[] = ['escort', 'wave', 'net'];

export function freshSave(): HeroesSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'teal', accessory: 'none' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    briefed: [],
    habits: [],
    upgrades: [],
    openingSeen: false,
    flyTipSeen: false,
    recent: [],
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

export function cleanSave(raw: unknown): HeroesSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v)
      for (const m of MISSIONS) {
        const n = (v as Record<string, unknown>)[m];
        if (typeof n === 'number' && Number.isFinite(n)) out[m] = Math.max(0, Math.min(max, Math.floor(n)));
      }
    return out;
  };
  const missions = (v: unknown) => (Array.isArray(v) ? MISSIONS.filter((m) => (v as unknown[]).includes(m)) : []);
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
    done: missions(r.done),
    briefed: missions(r.briefed),
    habits: missions(r.habits),
    upgrades: Array.isArray(r.upgrades) ? UPGRADE_IDS.filter((u) => (r.upgrades as unknown[]).includes(u)) : [],
    openingSeen: r.openingSeen === true,
    flyTipSeen: r.flyTipSeen === true,
    recent: Array.isArray(r.recent) ? (r.recent as unknown[]).filter((x): x is string => typeof x === 'string' && x.length < 40).slice(-60) : [],
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<HeroesSave>('bodySystemHeroes.save', freshSave, cleanSave);
