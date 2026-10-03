import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { GRID, ZONES, type Square, type Zone } from './problems';

export interface IslandSave {
  version: 1;
  appearance: Appearance;
  stars: Record<Zone, number>;
  played: Record<Zone, number>;
  /** Zones whose torch is lit. */
  lit: Zone[];
  /** People who have explained their job (zones, plus 'pip' and 'quiz'). */
  introduced: string[];
  openingSeen: boolean;
  /** The current treasure hunt: four dig squares and how many pieces are found. */
  hunt: { squares: Square[]; found: number; digging: boolean; ordered: boolean };
  chestOpened: boolean;
  quizWon: boolean;
  quizBest: number;
  finaleSeen: boolean;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Zone, number> => ({ add: 0, sub: 0, mul: 0, div: 0 });

export function freshSave(): IslandSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'teal', accessory: 'sunhat' },
    stars: zeroes(),
    played: zeroes(),
    lit: [],
    introduced: [],
    openingSeen: false,
    hunt: { squares: [], found: 0, digging: false, ordered: false },
    chestOpened: false,
    quizWon: false,
    quizBest: 0,
    finaleSeen: false,
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

const isSquare = (v: unknown): v is Square => {
  const s = v as Square;
  return typeof s === 'object' && s !== null && Number.isInteger(s.col) && Number.isInteger(s.row) && s.col >= 0 && s.row >= 0 && s.col < GRID.cols && s.row < GRID.rows;
};

export function cleanSave(raw: unknown): IslandSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v)
      for (const z of ZONES) {
        const n = (v as Record<string, unknown>)[z];
        if (typeof n === 'number' && Number.isFinite(n)) out[z] = Math.max(0, Math.min(max, Math.floor(n)));
      }
    return out;
  };
  const h = (typeof r.hunt === 'object' && r.hunt ? r.hunt : {}) as Record<string, unknown>;
  const squares = Array.isArray(h.squares) && h.squares.length === 4 && h.squares.every(isSquare) ? (h.squares as Square[]).map((s) => ({ col: s.col, row: s.row })) : [];
  const found = squares.length && typeof h.found === 'number' && Number.isFinite(h.found) ? Math.max(0, Math.min(4, Math.floor(h.found))) : 0;
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
    lit: Array.isArray(r.lit) ? ZONES.filter((z) => (r.lit as unknown[]).includes(z)) : [],
    introduced: Array.isArray(r.introduced) ? r.introduced.filter((x): x is string => typeof x === 'string' && x.length < 20).slice(0, 10) : [],
    openingSeen: r.openingSeen === true,
    hunt: { squares, found, digging: squares.length > 0 && found < 4 && h.digging === true, ordered: h.ordered === true },
    chestOpened: r.chestOpened === true,
    quizWon: r.quizWon === true,
    quizBest: typeof r.quizBest === 'number' && Number.isFinite(r.quizBest) ? Math.max(0, Math.min(9999, Math.floor(r.quizBest))) : 0,
    finaleSeen: r.finaleSeen === true,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<IslandSave>('mathAdventureIsland.save', freshSave, cleanSave);
