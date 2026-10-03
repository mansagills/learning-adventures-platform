import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { cleanLook, PARTS, STARTING_LOOK, STARTING_OWNED, TRACKS, type CarLook } from './cosmetics';

export interface RaceSave {
  version: 1;
  bolts: number;
  owned: string[];
  look: CarLook;
  wins: number;
  races: number;
  /** The track picked last. */
  track: string;
  introSeen: boolean;
  /** Most right answers in one race. */
  bestCorrect: number;
  learner: LearnerState;
  seed: number;
}

export function freshSave(): RaceSave {
  return {
    version: 1,
    bolts: 0,
    owned: [...STARTING_OWNED],
    look: { ...STARTING_LOOK },
    wins: 0,
    races: 0,
    track: TRACKS[0].id,
    introSeen: false,
    bestCorrect: 0,
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
  };
}

const num = (v: unknown, max: number, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : d);

export function cleanSave(raw: unknown): RaceSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const owned = Array.isArray(r.owned) ? [...new Set([...STARTING_OWNED, ...r.owned.filter((x): x is string => typeof x === 'string' && PARTS.some((p) => p.id === x))])] : d.owned;
  const wins = num(r.wins, 100000);
  const track = TRACKS.find((t) => t.id === r.track && t.wins <= wins)?.id ?? d.track;
  return {
    version: 1,
    bolts: num(r.bolts, 99999),
    owned,
    look: cleanLook(typeof r.look === 'object' && r.look ? (r.look as Record<string, unknown>) : {}, owned),
    wins,
    races: num(r.races, 100000),
    track,
    introSeen: r.introSeen === true,
    bestCorrect: num(r.bestCorrect, 100),
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
  };
}

export const store = new SaveStore<RaceSave>('mathRaceRally.save', freshSave, cleanSave);
