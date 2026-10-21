import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { ANIMAL_ORDER, type AnimalId } from './animals';
import { CHALLENGES, cleanParts, type ChallengeId, type Parts } from './designer';
import { STATIONS, type Station } from './problems';

/** The parts of the game that can be finished: the two expeditions and the Creature Designer. */
export type Part = Station | 'designer';
export const PARTS: Part[] = ['sunlight', 'twilight', 'designer'];

export interface SavedCreature {
  name: string;
  parts: Parts;
}

export interface DiverSave {
  version: 1;
  appearance: Appearance;
  /** Logbook stars and questions answered, per expedition. */
  stars: Record<Station, number>;
  played: Record<Station, number>;
  /** Parts finished (each one lights a band on the zone chart, or the lab badge). */
  done: Part[];
  /** Parts that have been explained. */
  introduced: Part[];
  /** Expeditions whose dive has been finished (all photos taken; the twilight one also needs the night trip). */
  dived: Station[];
  /** Animals in the field guide. */
  photos: AnimalId[];
  /** Creature Designer challenges met. */
  challenges: ChallengeId[];
  /** Creatures the child saved to the field guide (up to six, newest last). */
  creatures: SavedCreature[];
  openingSeen: boolean;
  diveTipSeen: boolean;
  /** Ranger Tala's goodbye for this part of the game has been said. */
  allDoneSeen: boolean;
  /** Question ids seen lately at each expedition (so every question comes up before any repeats). */
  recent: Record<Station, string[]>;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Station, number> => ({ sunlight: 0, twilight: 0 });
export const MAX_CREATURES = 6;

export function freshSave(): DiverSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'teal', accessory: 'none' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    introduced: [],
    dived: [],
    photos: [],
    challenges: [],
    creatures: [],
    openingSeen: false,
    diveTipSeen: false,
    allDoneSeen: false,
    recent: { sunlight: [], twilight: [] },
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

export function cleanSave(raw: unknown): DiverSave {
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
  const only = <T extends string>(v: unknown, list: readonly T[]): T[] => (Array.isArray(v) ? list.filter((x) => (v as unknown[]).includes(x)) : []);
  const recent = { sunlight: [] as string[], twilight: [] as string[] };
  if (typeof r.recent === 'object' && r.recent)
    for (const s of STATIONS) {
      const v = (r.recent as Record<string, unknown>)[s];
      if (Array.isArray(v)) recent[s] = v.filter((x): x is string => typeof x === 'string' && x.length < 60).slice(-40);
    }
  const creatures: SavedCreature[] = Array.isArray(r.creatures)
    ? (r.creatures as unknown[])
        .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
        .map((c) => ({ name: typeof c.name === 'string' ? c.name.replace(/[^A-Za-z ]/g, '').slice(0, 16) || 'Swishy' : 'Swishy', parts: cleanParts(c.parts) }))
        .slice(-MAX_CREATURES)
    : [];
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
    done: only(r.done, PARTS),
    introduced: only(r.introduced, PARTS),
    dived: only(r.dived, STATIONS),
    photos: only(r.photos, ANIMAL_ORDER),
    challenges: only(
      r.challenges,
      CHALLENGES.map((c) => c.id),
    ),
    creatures,
    openingSeen: r.openingSeen === true,
    diveTipSeen: r.diveTipSeen === true,
    allDoneSeen: r.allDoneSeen === true,
    recent,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<DiverSave>('oceanDepthDiver.save', freshSave, cleanSave);
