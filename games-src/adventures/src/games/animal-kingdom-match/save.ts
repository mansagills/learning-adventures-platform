import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import type { Critter } from '../../kit/worlds/wild-lands/habitats';
import { JOURNAL_ORDER, TRIPS, type Trip } from './animals';

export interface AnimalSave {
  version: 1;
  appearance: Appearance;
  /** Ranger Journal stars and questions answered, per trip. */
  stars: Record<Trip, number>;
  played: Record<Trip, number>;
  /** Trips finished (photos, the Rescue Center, five stars and the talk-it-through question): a patch each. */
  done: Trip[];
  /** Trips whose habitat has been visited (the host's welcome has been said). */
  visited: Trip[];
  /** Trips whose animals have all been spotted. */
  spottedAll: Trip[];
  /** Trips whose Rescue Center visit is done. */
  rescued: Trip[];
  /** The Ranger Journal: every animal photographed, in the order they were found. */
  journal: Critter[];
  /** Animals taken home from the Rescue Center (all visits). */
  homes: number;
  openingSeen: boolean;
  amaraMet: boolean;
  /** Ranger Tala's goodbye for half 1 has been said. */
  halfDoneSeen: boolean;
  /** Question ids seen lately on each trip (so every question comes up before any repeats). */
  recent: Record<Trip, string[]>;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Trip, number> => ({ rainforest: 0, desert: 0, poles: 0, wetland: 0 });
const noLists = (): Record<Trip, string[]> => ({ rainforest: [], desert: [], poles: [], wetland: [] });

export function freshSave(): AnimalSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'green', accessory: 'none' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    visited: [],
    spottedAll: [],
    rescued: [],
    journal: [],
    homes: 0,
    openingSeen: false,
    amaraMet: false,
    halfDoneSeen: false,
    recent: noLists(),
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

export function cleanSave(raw: unknown): AnimalSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v)
      for (const s of TRIPS) {
        const n = (v as Record<string, unknown>)[s];
        if (typeof n === 'number' && Number.isFinite(n)) out[s] = Math.max(0, Math.min(max, Math.floor(n)));
      }
    return out;
  };
  const count = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(100000, Math.floor(v))) : 0);
  const only = <T extends string>(v: unknown, list: readonly T[]): T[] => (Array.isArray(v) ? list.filter((x) => (v as unknown[]).includes(x)) : []);
  const recent = noLists();
  if (typeof r.recent === 'object' && r.recent)
    for (const s of TRIPS) {
      const v = (r.recent as Record<string, unknown>)[s];
      if (Array.isArray(v)) recent[s] = v.filter((x): x is string => typeof x === 'string' && x.length < 60).slice(-40);
    }
  // the journal keeps the order the animals were found in
  const journal = Array.isArray(r.journal) ? (r.journal as unknown[]).filter((x, i, all): x is Critter => JOURNAL_ORDER.includes(x as Critter) && all.indexOf(x) === i) : [];
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
    done: only(r.done, TRIPS),
    visited: only(r.visited, TRIPS),
    spottedAll: only(r.spottedAll, TRIPS),
    rescued: only(r.rescued, TRIPS),
    journal,
    homes: count(r.homes),
    openingSeen: r.openingSeen === true,
    amaraMet: r.amaraMet === true,
    halfDoneSeen: r.halfDoneSeen === true,
    recent,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<AnimalSave>('animalKingdomMatch.save', freshSave, cleanSave);
