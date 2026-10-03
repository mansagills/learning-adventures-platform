import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { STARTING, UPGRADES } from './upgrades';

export interface MarketSave {
  version: 1;
  appearance: Appearance;
  /** Money in the till, in cents. */
  money: number;
  /** The market day about to start (1 = first). */
  day: number;
  owned: string[];
  introSeen: boolean;
  served: number;
  bestDay: number;
  learner: LearnerState;
}

export function freshSave(): MarketSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'orange', accessory: 'cap' },
    money: 0,
    day: 1,
    owned: [...STARTING],
    introSeen: false,
    served: 0,
    bestDay: 0,
    learner: {},
  };
}

const count = (v: unknown, max: number, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : d);

export function cleanSave(raw: unknown): MarketSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const owned = Array.isArray(r.owned) ? UPGRADES.map((u) => u.id).filter((id) => (r.owned as unknown[]).includes(id)) : [...STARTING];
  for (const s of STARTING) if (!owned.includes(s)) owned.push(s);
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
    money: count(r.money, 100_000_000),
    day: Math.max(1, count(r.day, 100_000, 1)),
    owned,
    introSeen: r.introSeen === true,
    served: count(r.served, 10_000_000),
    bestDay: count(r.bestDay, 100_000_000),
    learner: cleanLearner(r.learner),
  };
}

export const store = new SaveStore<MarketSave>('moneyMarketMadness.save', freshSave, cleanSave);
