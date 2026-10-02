import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { BELTS, type BeltId } from './problems';
import { DEFAULT_GEAR, cleanGear, type Gear } from './gear';

export interface NinjaSave {
  version: 1;
  appearance: Appearance;
  /** Ninja gear: gi color, mask and headband. */
  gear: Gear;
  /** Belts earned, in order. */
  earned: BeltId[];
  /** Stars toward each belt (0..5; kept after the belt is earned). */
  stars: Record<BeltId, number>;
  /** Challenges played on each belt (for the grown-ups page). */
  played: Record<BeltId, number>;
  current: BeltId;
  learner: LearnerState;
  /** Belts whose introduction Sensei has given. */
  introduced: BeltId[];
  /** Advances with every challenge so each one is new. */
  seed: number;
}

const zeroes = (): Record<BeltId, number> => ({ white: 0, yellow: 0, orange: 0, green: 0, black: 0 });

export function freshSave(): NinjaSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'blue', accessory: 'none' },
    gear: { ...DEFAULT_GEAR },
    earned: [],
    stars: zeroes(),
    played: zeroes(),
    current: 'white',
    learner: {},
    introduced: [],
    seed: Math.floor(Math.random() * 1e9),
  };
}

const isBelt = (v: unknown): v is BeltId => BELTS.includes(v as BeltId);

/** Turn untrusted JSON into a valid save (unknown values fall back to defaults). */
export function cleanSave(raw: unknown): NinjaSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const appearance: Appearance = {
    body: a.body === 'boy' || a.body === 'girl' ? a.body : d.appearance.body,
    skin: pick(a.skin, SKIN_TONES, d.appearance.skin),
    hairStyle: pick(a.hairStyle, HAIR_STYLES, d.appearance.hairStyle) as Appearance['hairStyle'],
    hairColor: pick(a.hairColor, HAIR_COLORS, d.appearance.hairColor),
    outfit: pick(a.outfit, OUTFIT_COLORS, d.appearance.outfit),
    accessory: pick(a.accessory, ACCESSORIES, d.appearance.accessory) as Appearance['accessory'],
  };
  // Earned belts must be a prefix of the belt order (no skipping).
  const earnedRaw = Array.isArray(r.earned) ? r.earned.filter(isBelt) : [];
  const earned: BeltId[] = [];
  for (const b of BELTS) if (earnedRaw.includes(b)) earned.push(b);
  while (earned.length && earned[earned.length - 1] !== BELTS[earned.length - 1]) earned.pop();
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v)
      for (const b of BELTS) {
        const n = (v as Record<string, unknown>)[b];
        if (typeof n === 'number' && Number.isFinite(n)) out[b] = Math.max(0, Math.min(max, Math.floor(n)));
      }
    return out;
  };
  const unlocked = (b: BeltId) => BELTS.indexOf(b) <= earned.length;
  return {
    version: 1,
    appearance,
    gear: cleanGear(r.gear),
    earned,
    stars: nums(r.stars, 5),
    played: nums(r.played, 100000),
    current: isBelt(r.current) && unlocked(r.current) ? r.current : BELTS[Math.min(earned.length, BELTS.length - 1)],
    learner: cleanLearner(r.learner),
    introduced: Array.isArray(r.introduced) ? r.introduced.filter(isBelt) : [],
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<NinjaSave>('numberLineNinja.save', freshSave, cleanSave);
