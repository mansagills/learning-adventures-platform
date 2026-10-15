import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { FIND_ORDER, type FindKind } from './dive';
import { PLANET_ORDER, STATIONS, type PlanetId, type Station } from './problems';

export interface ExplorerSave {
  version: 1;
  appearance: Appearance;
  stars: Record<Station, number>;
  played: Record<Station, number>;
  /** Stations finished (each one lights a lens of the big telescope). */
  done: Station[];
  /** Stations whose helper has explained them. */
  introduced: Station[];
  openingSeen: boolean;
  /** Vee explains the star map the first time it opens. */
  mapTipSeen: boolean;
  /** The first rover drive and the first cloud dive each get a tip. */
  driveTipSeen: boolean;
  diveTipSeen: boolean;
  /** Planets whose postcard is in the album. */
  postcards: PlanetId[];
  /** Finds already collected at a planet whose postcard is not earned yet. */
  finds: Partial<Record<PlanetId, FindKind[]>>;
  /** Question ids seen lately at each station (so every question comes up before any repeats). */
  recent: Record<Station, string[]>;
  learner: LearnerState;
  seed: number;
}

const zeroes = (): Record<Station, number> => ({ orrery: 0, sunrise: 0, dome: 0, launch: 0 });

export function freshSave(): ExplorerSave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'teal', accessory: 'none' },
    stars: zeroes(),
    played: zeroes(),
    done: [],
    introduced: [],
    openingSeen: false,
    mapTipSeen: false,
    driveTipSeen: false,
    diveTipSeen: false,
    postcards: [],
    finds: {},
    recent: { orrery: [], sunrise: [], dome: [], launch: [] },
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

export function cleanSave(raw: unknown): ExplorerSave {
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
  const stations = (v: unknown) => (Array.isArray(v) ? STATIONS.filter((s) => (v as unknown[]).includes(s)) : []);
  const planets = (v: unknown) => (Array.isArray(v) ? PLANET_ORDER.filter((p) => (v as unknown[]).includes(p)) : []);
  const finds: Partial<Record<PlanetId, FindKind[]>> = {};
  if (typeof r.finds === 'object' && r.finds)
    for (const p of PLANET_ORDER) {
      const f = (r.finds as Record<string, unknown>)[p];
      if (Array.isArray(f)) {
        const list = FIND_ORDER.filter((k) => f.includes(k));
        if (list.length) finds[p] = list;
      }
    }
  const recent = { orrery: [] as string[], sunrise: [] as string[], dome: [] as string[], launch: [] as string[] };
  if (typeof r.recent === 'object' && r.recent)
    for (const s of STATIONS) {
      const v = (r.recent as Record<string, unknown>)[s];
      if (Array.isArray(v)) recent[s] = v.filter((x): x is string => typeof x === 'string' && x.length < 60).slice(-40);
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
    done: stations(r.done),
    introduced: stations(r.introduced),
    openingSeen: r.openingSeen === true,
    mapTipSeen: r.mapTipSeen === true,
    driveTipSeen: r.driveTipSeen === true,
    diveTipSeen: r.diveTipSeen === true,
    postcards: planets(r.postcards),
    finds,
    recent,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<ExplorerSave>('solarSystemExplorer.save', freshSave, cleanSave);
