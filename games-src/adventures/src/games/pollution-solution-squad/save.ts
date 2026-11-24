import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import type { Inventory } from '../../kit/craft/workbench';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { NATURE_IDS, TRASH_IDS, VISITOR_NAME, type NatureId, type TrashId, type VisitorId } from '../../kit/worlds/wild-lands/coast-art';
import { LEVELS, LOT } from './levels';
import type { Placed } from './nature';
import { RECIPES, STATIONS, type RecipeId, type Station } from './problems';

const RECIPE_IDS = Object.keys(RECIPES) as RecipeId[];
const VISITOR_IDS = Object.keys(VISITOR_NAME) as VisitorId[];

export interface SquadSave {
  version: 1;
  appearance: Appearance;
  /** Levels reached the flag on. */
  levelsDone: string[];
  /** Squad Journal stars and questions answered, per stretch. */
  stars: Record<Station, number>;
  played: Record<Station, number>;
  /** Right answers at the water test after each stretch’s first level. */
  tests: Record<Station, number>;
  /** Stretches finished (both levels, five stars and the talk-it-through question). */
  done: Station[];
  /** Levels whose host has given the welcome talk. */
  introSeen: string[];
  openingSeen: boolean;
  halfDoneSeen: boolean;
  /** The Big Rain and Clean Coast Day have been seen (the game is finished). */
  finaleSeen: boolean;
  /** Ollie has been freed (from the first level on, Ollie comes along). */
  ollie: boolean;
  easy: boolean;
  /** Question ids seen lately in each stretch (so every question comes up before any repeats). */
  recent: Record<Station, string[]>;
  learner: LearnerState;
  seed: number;
  /** The backpack: materials for crafting, and trash still to sort. */
  bag: Inventory;
  /** Every kind of trash ever picked up (for the Squad Journal). */
  found: TrashId[];
  /** Designs tried on each blueprint, and the fixes built that work. */
  tried: Partial<Record<RecipeId, string[]>>;
  built: RecipeId[];
  /** Trash sorted at the sorting station, and how many went in the right bin first time. */
  sorted: number;
  sortedRight: number;
  /** The Nature Center. */
  nature: Placed[];
  visitors: VisitorId[];
}

const zeroes = (): Record<Station, number> => ({ beach: 0, harbor: 0, wetland: 0, town: 0 });
const noLists = (): Record<Station, string[]> => ({ beach: [], harbor: [], wetland: [], town: [] });

export function freshSave(): SquadSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'green', accessory: 'none' },
    levelsDone: [],
    stars: zeroes(),
    played: zeroes(),
    tests: zeroes(),
    done: [],
    introSeen: [],
    openingSeen: false,
    halfDoneSeen: false,
    finaleSeen: false,
    ollie: false,
    easy: false,
    recent: noLists(),
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
    bag: {},
    found: [],
    tried: {},
    built: [],
    sorted: 0,
    sortedRight: 0,
    nature: [],
    visitors: [],
  };
}

export function cleanSave(raw: unknown): SquadSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const num = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0);
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v) for (const s of STATIONS) out[s] = num((v as Record<string, unknown>)[s], max);
    return out;
  };
  const only = <T extends string>(v: unknown, list: readonly T[]): T[] => (Array.isArray(v) ? list.filter((x) => (v as unknown[]).includes(x)) : []);
  const ids = LEVELS.map((l) => l.id);
  const recent = noLists();
  if (typeof r.recent === 'object' && r.recent)
    for (const s of STATIONS) {
      const v = (r.recent as Record<string, unknown>)[s];
      if (Array.isArray(v)) recent[s] = v.filter((x): x is string => typeof x === 'string' && x.length < 60).slice(-40);
    }
  const bag: Inventory = {};
  if (typeof r.bag === 'object' && r.bag)
    for (const id of TRASH_IDS) {
      const n = num((r.bag as Record<string, unknown>)[id], 99);
      if (n) bag[id] = n;
    }
  const tried: Partial<Record<RecipeId, string[]>> = {};
  if (typeof r.tried === 'object' && r.tried)
    for (const id of RECIPE_IDS) {
      const v = (r.tried as Record<string, unknown>)[id];
      const ok = RECIPES[id].designs.map((x) => x.id);
      if (Array.isArray(v)) tried[id] = ok.filter((x) => v.includes(x));
    }
  const nature: Placed[] = [];
  if (Array.isArray(r.nature))
    for (const p of r.nature) {
      if (typeof p !== 'object' || !p) continue;
      const { id, x } = p as Record<string, unknown>;
      if (NATURE_IDS.includes(id as NatureId) && typeof x === 'number' && x >= LOT.x0 && x <= LOT.x1) nature.push({ id: id as NatureId, x: Math.floor(x) });
      if (nature.length >= 30) break;
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
    stars: nums(r.stars, 5),
    played: nums(r.played, 100000),
    tests: nums(r.tests, 99),
    done: only(r.done, STATIONS),
    introSeen: only(r.introSeen, ids),
    openingSeen: r.openingSeen === true,
    halfDoneSeen: r.halfDoneSeen === true,
    finaleSeen: r.finaleSeen === true,
    ollie: r.ollie === true,
    easy: r.easy === true,
    recent,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
    bag,
    found: only(r.found, TRASH_IDS),
    tried,
    built: only(r.built, RECIPE_IDS),
    sorted: num(r.sorted, 100000),
    sortedRight: num(r.sortedRight, 100000),
    nature,
    visitors: only(r.visitors, VISITOR_IDS),
  };
}

export const store = new SaveStore<SquadSave>('pollutionSolutionSquad.save', freshSave, cleanSave);
