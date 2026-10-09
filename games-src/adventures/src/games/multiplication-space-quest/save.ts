import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { PAINT_IDS, type PaintId } from './art';
import type { UpgradeId } from './content';
import { SECTORS, type Sector } from './problems';

export interface QuestSave {
  version: 1;
  appearance: Appearance;
  stars: Record<Sector, number>;
  played: Record<Sector, number>;
  /** Sectors cleared (5 stars and level 2, or 12 questions). */
  done: Sector[];
  /** Sectors whose chief has given the first briefing. */
  introduced: Sector[];
  openingSeen: boolean;
  /** The first-flight controls tip has been shown. */
  flightTipSeen: boolean;
  /** Supply ships rescued (the fleet). */
  fleet: number;
  /** Stardust to spend on upgrades. */
  dust: number;
  upgrades: UpgradeId[];
  paints: PaintId[];
  paint: PaintId;
  /** Star Map facts answered right first time ("3x7"). */
  starMap: string[];
  flights: number;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Sector, number> => ({ formations: 0, engines: 0 });
const UPGRADE_IDS: UpgradeId[] = ['twin', 'rapid', 'shield1', 'shield2', 'thrusters'];

export function freshSave(): QuestSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'teal', accessory: 'none' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    introduced: [],
    openingSeen: false,
    flightTipSeen: false,
    fleet: 0,
    dust: 0,
    upgrades: [],
    paints: ['teal'],
    paint: 'teal',
    starMap: [],
    flights: 0,
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

const FACT = /^(10|[1-9])x(10|[1-9])$/;

export function cleanSave(raw: unknown): QuestSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v)
      for (const s of SECTORS) {
        const n = (v as Record<string, unknown>)[s];
        if (typeof n === 'number' && Number.isFinite(n)) out[s] = Math.max(0, Math.min(max, Math.floor(n)));
      }
    return out;
  };
  const int = (v: unknown, max: number, dv: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : dv);
  const list = <T extends string>(v: unknown, allowed: readonly T[]) => (Array.isArray(v) ? allowed.filter((x) => (v as unknown[]).includes(x)) : []);
  const paints = list(r.paints, PAINT_IDS);
  if (!paints.includes('teal')) paints.unshift('teal');
  const paint = paints.includes(r.paint as PaintId) ? (r.paint as PaintId) : 'teal';
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
    done: list(r.done, SECTORS),
    introduced: list(r.introduced, SECTORS),
    openingSeen: r.openingSeen === true,
    flightTipSeen: r.flightTipSeen === true,
    fleet: int(r.fleet, 99999, 0),
    dust: int(r.dust, 99999, 0),
    upgrades: list(r.upgrades, UPGRADE_IDS),
    paints,
    paint,
    starMap: Array.isArray(r.starMap) ? [...new Set((r.starMap as unknown[]).filter((x): x is string => typeof x === 'string' && FACT.test(x)))] : [],
    flights: int(r.flights, 99999, 0),
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<QuestSave>('multiplicationSpaceQuest.save', freshSave, cleanSave);
