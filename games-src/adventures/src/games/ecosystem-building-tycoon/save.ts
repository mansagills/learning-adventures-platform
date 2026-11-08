import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import { PIECE_IDS, type PieceId } from '../../kit/worlds/wild-lands/eco-art';
import { ISLAND_KINDS, UNLOCK_ORDER, UPGRADE_IDS, W, H, type IslandKind, type RunLength, type UpgradeId } from './rules';

/** A run in progress, so a child can stop and come back to it. */
export interface RunSave {
  kind: IslandKind;
  length: RunLength;
  /** The island's seed (the island is made again from it). */
  seed: number;
  pieces: Array<PieceId | null>;
  /** The season being played (1 is the first spring). */
  season: number;
  hand: PieceId[];
  rerolls: number;
  /** Times the hand was changed this run (so each new hand is different). */
  deals: number;
  upgrades: UpgradeId[];
  /** Targets reached so far. */
  reached: number;
}

export interface EcoSave {
  version: 1;
  /** Extra tiles earned at the end of runs. */
  unlocked: PieceId[];
  /** Island types restored at least once. */
  restored: IslandKind[];
  /** Runs finished (restored or not), per island type. */
  runs: Record<IslandKind, number>;
  /** Best health at the end of a run, per island type. */
  best: Record<IslandKind, number>;
  /** Field Notebook stars and questions answered, per island type. */
  stars: Record<IslandKind, number>;
  played: Record<IslandKind, number>;
  /** Island types whose talk-it-through question is done. */
  debriefs: IslandKind[];
  /** Tiles the child has placed at least once (the Field Guide in half 2). */
  seen: PieceId[];
  openingSeen: boolean;
  halfDoneSeen: boolean;
  /** Short or long: the last choice, offered first next time. */
  lastLength: RunLength;
  recent: Record<IslandKind, string[]>;
  learner: LearnerState;
  seed: number;
  run: RunSave | null;
}

const zeroes = (): Record<IslandKind, number> => ({ meadow: 0, pond: 0 });
const noLists = (): Record<IslandKind, string[]> => ({ meadow: [], pond: [] });

export function freshSave(): EcoSave {
  return {
    version: 1,
    unlocked: [],
    restored: [],
    runs: zeroes(),
    best: zeroes(),
    stars: zeroes(),
    played: zeroes(),
    debriefs: [],
    seen: [],
    openingSeen: false,
    halfDoneSeen: false,
    lastLength: 'short',
    recent: noLists(),
    learner: {},
    seed: Math.floor(Math.random() * 1e9),
    run: null,
  };
}

const int = (v: unknown, max: number, dv = 0) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : dv);
const only = <T extends string>(v: unknown, list: readonly T[]): T[] => (Array.isArray(v) ? list.filter((x) => (v as unknown[]).includes(x)) : []);

function cleanRun(raw: unknown): RunSave | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (!ISLAND_KINDS.includes(r.kind as IslandKind)) return null;
  if (r.length !== 'short' && r.length !== 'long') return null;
  if (!Array.isArray(r.pieces) || r.pieces.length !== W * H) return null;
  const pieces = (r.pieces as unknown[]).map((p) => (PIECE_IDS.includes(p as PieceId) ? (p as PieceId) : null));
  const hand = Array.isArray(r.hand) ? (r.hand as unknown[]).filter((p): p is PieceId => PIECE_IDS.includes(p as PieceId)).slice(0, 4) : [];
  return {
    kind: r.kind as IslandKind,
    length: r.length,
    seed: int(r.seed, 2 ** 31 - 1),
    pieces,
    season: Math.max(1, int(r.season, 40, 1)),
    hand,
    rerolls: int(r.rerolls, 20),
    deals: int(r.deals, 100000),
    upgrades: only(r.upgrades, UPGRADE_IDS),
    reached: int(r.reached, 5),
  };
}

export function cleanSave(raw: unknown): EcoSave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const nums = (v: unknown, max: number) => {
    const out = zeroes();
    if (typeof v === 'object' && v) for (const k of ISLAND_KINDS) out[k] = int((v as Record<string, unknown>)[k], max);
    return out;
  };
  const recent = noLists();
  if (typeof r.recent === 'object' && r.recent)
    for (const k of ISLAND_KINDS) {
      const v = (r.recent as Record<string, unknown>)[k];
      if (Array.isArray(v)) recent[k] = v.filter((x): x is string => typeof x === 'string' && x.length < 60).slice(-40);
    }
  return {
    version: 1,
    unlocked: only(r.unlocked, UNLOCK_ORDER),
    restored: only(r.restored, ISLAND_KINDS),
    runs: nums(r.runs, 100000),
    best: nums(r.best, 9999),
    stars: nums(r.stars, 5),
    played: nums(r.played, 100000),
    debriefs: only(r.debriefs, ISLAND_KINDS),
    seen: only(r.seen, PIECE_IDS),
    openingSeen: r.openingSeen === true,
    halfDoneSeen: r.halfDoneSeen === true,
    lastLength: r.lastLength === 'long' ? 'long' : 'short',
    recent,
    learner: cleanLearner(r.learner),
    seed: typeof r.seed === 'number' && Number.isFinite(r.seed) ? Math.floor(Math.abs(r.seed)) % 2 ** 31 : d.seed,
    run: cleanRun(r.run),
  };
}

export const store = new SaveStore<EcoSave>('ecosystemBuildingTycoon.save', freshSave, cleanSave);
