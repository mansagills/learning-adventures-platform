import { DEFAULT_APPEARANCE, type Appearance } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { cleanLearner, type LearnerState } from '../../kit/learning/mastery';
import { SaveStore } from '../../kit/systems/save';
import type { Stage } from './problems';

export interface RunRecord {
  score: number;
  shelved: number;
  seconds: number;
  stage: Stage;
}

export interface LibrarySave {
  version: 1;
  appearance: Appearance;
  bestScore: number;
  /** The highest stage reached in any run (later runs may start there). */
  bestStage: Stage;
  /** The stage the next run starts at (chosen on the title screen). */
  startStage: Stage;
  introSeen: boolean;
  runs: number;
  totalShelved: number;
  lastRuns: RunRecord[];
  learner: LearnerState;
}

export function freshSave(): LibrarySave {
  return {
    version: 1,
    appearance: { ...DEFAULT_APPEARANCE, outfit: 'blue', accessory: 'glasses' },
    bestScore: 0,
    bestStage: 1,
    startStage: 1,
    introSeen: false,
    runs: 0,
    totalShelved: 0,
    lastRuns: [],
    learner: {},
  };
}

const stage = (v: unknown, d: Stage): Stage => (v === 1 || v === 2 || v === 3 ? v : d);
const count = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0);

export function cleanSave(raw: unknown): LibrarySave {
  const d = freshSave();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const a = (typeof r.appearance === 'object' && r.appearance ? r.appearance : {}) as Record<string, unknown>;
  const pick = <T extends { id: string }>(v: unknown, list: readonly T[], dv: string) => (list.some((x) => x.id === v) ? (v as string) : dv);
  const bestStage = stage(r.bestStage, 1);
  const runs = Array.isArray(r.lastRuns) ? r.lastRuns : [];
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
    bestScore: count(r.bestScore, 10_000_000),
    bestStage,
    startStage: Math.min(bestStage, stage(r.startStage, 1)) as Stage,
    introSeen: r.introSeen === true,
    runs: count(r.runs, 1_000_000),
    totalShelved: count(r.totalShelved, 10_000_000),
    lastRuns: runs
      .filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
      .slice(-10)
      .map((x) => ({ score: count(x.score, 10_000_000), shelved: count(x.shelved, 100_000), seconds: count(x.seconds, 1_000_000), stage: stage(x.stage, 1) })),
    learner: cleanLearner(r.learner),
  };
}

export const store = new SaveStore<LibrarySave>('mathDashLibraryRush.save', freshSave, cleanSave);
