import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { FOSSIL_IDS, type FossilId } from '../../kit/worlds/wild-lands/dig-art';
import { STATIONS, type Station } from './problems';

export interface FoundFossil {
  id: FossilId;
  /** A shovel or pick chipped it on the last layer (still found, but not perfect). */
  chipped: boolean;
  /** The quarry square it came from (A1 to H6), or the cliff. */
  where: string;
}

export interface DigSave {
  version: 1;
  appearance: Appearance;
  /** Logbook stars and questions answered, per station. */
  stars: Record<Station, number>;
  played: Record<Station, number>;
  /** Stations finished (five stars and the talk-it-through question). */
  done: Station[];
  /** Stations that have been explained. */
  introduced: Station[];
  /** Stations whose hands-on job has been done at least once (a dug square, a rebuilt cliff). */
  worked: Station[];
  /** Squares dug in the quarry, and cliffs rebuilt. */
  digs: number;
  cliffs: number;
  /** The Fossil Drawer: each fossil the first time it was found (a later clean find replaces a chipped one). */
  drawer: FoundFossil[];
  openingSeen: boolean;
  /** Ranger Tala's goodbye for half 1 has been said. */
  halfDoneSeen: boolean;
  /** Question ids seen lately at each station (so every question comes up before any repeats). */
  recent: Record<Station, string[]>;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Station, number> => ({ quarry: 0, cliff: 0 });
const noLists = (): Record<Station, string[]> => ({ quarry: [], cliff: [] });

export function freshSave(): DigSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'orange', accessory: 'none' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    introduced: [],
    worked: [],
    digs: 0,
    cliffs: 0,
    drawer: [],
    openingSeen: false,
    halfDoneSeen: false,
    recent: noLists(),
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

export function cleanSave(raw: unknown): DigSave {
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
  const count = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(100000, Math.floor(v))) : 0);
  const only = <T extends string>(v: unknown, list: readonly T[]): T[] => (Array.isArray(v) ? list.filter((x) => (v as unknown[]).includes(x)) : []);
  const recent = noLists();
  if (typeof r.recent === 'object' && r.recent)
    for (const s of STATIONS) {
      const v = (r.recent as Record<string, unknown>)[s];
      if (Array.isArray(v)) recent[s] = v.filter((x): x is string => typeof x === 'string' && x.length < 60).slice(-40);
    }
  const drawer: FoundFossil[] = [];
  if (Array.isArray(r.drawer))
    for (const f of r.drawer as unknown[]) {
      if (typeof f !== 'object' || f === null) continue;
      const o = f as Record<string, unknown>;
      if (!FOSSIL_IDS.includes(o.id as FossilId) || drawer.some((x) => x.id === o.id)) continue;
      drawer.push({ id: o.id as FossilId, chipped: o.chipped === true, where: typeof o.where === 'string' ? o.where.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 16) : '' });
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
    stars: nums(r.stars, 5),
    played: nums(r.played, 100000),
    done: only(r.done, STATIONS),
    introduced: only(r.introduced, STATIONS),
    worked: only(r.worked, STATIONS),
    digs: count(r.digs),
    cliffs: count(r.cliffs),
    drawer,
    openingSeen: r.openingSeen === true,
    halfDoneSeen: r.halfDoneSeen === true,
    recent,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<DigSave>('fossilDigAdventure.save', freshSave, cleanSave);
