import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { BALLOON_COLORS } from './art';
import { BOOTHS, type Booth } from './problems';

export interface CarnivalSave {
  version: 1;
  appearance: Appearance;
  /** Carnival tickets won at the booths (spent on balloons). */
  tickets: number;
  stars: Record<Booth, number>;
  played: Record<Booth, number>;
  /** Booths completed (lit up). */
  done: Booth[];
  /** Booths whose host has explained them. */
  introduced: Booth[];
  openingSeen: boolean;
  finaleSeen: boolean;
  balloons: string[];
  carrying: string | null;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Booth, number> => ({ ducks: 0, rings: 0, snacks: 0, tickets: 0 });

export function freshSave(): CarnivalSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'red', accessory: 'cap' },
    tickets: 0,
    stars: zeroes(),
    played: zeroes(),
    done: [],
    introduced: [],
    openingSeen: false,
    finaleSeen: false,
    balloons: [],
    carrying: null,
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

const isBooth = (v: unknown): v is Booth => BOOTHS.includes(v as Booth);

export function cleanSave(raw: unknown): CarnivalSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v)
      for (const b of BOOTHS) {
        const n = (v as Record<string, unknown>)[b];
        if (typeof n === 'number' && Number.isFinite(n)) out[b] = Math.max(0, Math.min(max, Math.floor(n)));
      }
    return out;
  };
  const balloons = Array.isArray(r.balloons) ? r.balloons.filter((b): b is string => BALLOON_COLORS.some((c) => c.id === b)) : [];
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
    tickets: typeof r.tickets === 'number' && Number.isFinite(r.tickets) ? Math.max(0, Math.min(9999, Math.floor(r.tickets))) : 0,
    stars: nums(r.stars, 5),
    played: nums(r.played, 100000),
    done: Array.isArray(r.done) ? BOOTHS.filter((b) => (r.done as unknown[]).includes(b)) : [],
    introduced: Array.isArray(r.introduced) ? r.introduced.filter(isBooth) : [],
    openingSeen: r.openingSeen === true,
    finaleSeen: r.finaleSeen === true,
    balloons,
    carrying: typeof r.carrying === 'string' && balloons.includes(r.carrying) ? r.carrying : null,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<CarnivalSave>('countingCarnival.save', freshSave, cleanSave);
