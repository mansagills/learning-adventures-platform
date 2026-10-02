/**
 * The learner model shared by every game: one record per skill, kept only in
 * this browser's save. It is rule-based, so it works fully offline, and the
 * rules are simple enough to explain to a parent:
 *
 * - A **clean** answer is right with no hint, or with only the first nudge.
 * - Two clean answers in a row move the player **up** a difficulty tier.
 * - Two misses in a row move the player **down** a tier (and the game
 *   offers a hint before the next try).
 * - A skill is **mastered** after enough clean answers at the top tier the
 *   game asks for.
 *
 * Misconceptions (the idea behind a wrong answer, like "counted the stone
 * you started on") are counted, so the game and the grown-ups page can say
 * which one comes up most.
 */

export interface SkillRecord {
  attempts: number;
  correct: number;
  /** Clean answers in a row (right with at most the first hint). */
  streak: number;
  /** Wrong answers in a row. */
  missStreak: number;
  /** Current difficulty tier, starting at 1. */
  tier: number;
  /** Clean answers at or above the mastery tier. */
  cleanAtTop: number;
  hintsUsed: number;
  misconceptions: Record<string, number>;
  mastered: boolean;
}

export type LearnerState = Record<string, SkillRecord>;

export interface SkillRules {
  /** Highest tier for this skill. */
  maxTier: number;
  /** The tier at which clean answers count toward mastery. */
  masteryTier: number;
  /** Clean answers needed at that tier. */
  masteryCount: number;
}

export const DEFAULT_RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };

export function emptySkill(): SkillRecord {
  return { attempts: 0, correct: 0, streak: 0, missStreak: 0, tier: 1, cleanAtTop: 0, hintsUsed: 0, misconceptions: {}, mastered: false };
}

export function skill(state: LearnerState, id: string): SkillRecord {
  if (!state[id]) state[id] = emptySkill();
  return state[id];
}

export interface AnswerResult {
  correct: boolean;
  /** Highest hint rung used on this item (0 = none, 3 = worked example). */
  hintRung: number;
  misconception?: string | null;
}

export interface AnswerOutcome {
  record: SkillRecord;
  clean: boolean;
  tierChange: -1 | 0 | 1;
  justMastered: boolean;
}

/** Record one answer and apply the tier rules. */
export function recordAnswer(state: LearnerState, id: string, r: AnswerResult, rules: SkillRules = DEFAULT_RULES): AnswerOutcome {
  const rec = skill(state, id);
  rec.attempts += 1;
  if (r.hintRung > 0) rec.hintsUsed += 1;
  let tierChange: -1 | 0 | 1 = 0;
  const wasMastered = rec.mastered;
  const clean = r.correct && r.hintRung <= 1;

  if (r.correct) {
    rec.correct += 1;
    rec.missStreak = 0;
    if (clean) {
      rec.streak += 1;
      if (rec.tier >= rules.masteryTier) rec.cleanAtTop += 1;
      if (rec.streak >= 2 && rec.tier < rules.maxTier) {
        rec.tier += 1;
        rec.streak = 0;
        tierChange = 1;
      }
    } else rec.streak = 0;
  } else {
    rec.streak = 0;
    rec.missStreak += 1;
    if (r.misconception) rec.misconceptions[r.misconception] = (rec.misconceptions[r.misconception] ?? 0) + 1;
    if (rec.missStreak >= 2 && rec.tier > 1) {
      rec.tier -= 1;
      rec.missStreak = 0;
      tierChange = -1;
    }
  }
  if (rec.cleanAtTop >= rules.masteryCount) rec.mastered = true;
  return { record: rec, clean, tierChange, justMastered: rec.mastered && !wasMastered };
}

/** The misconception seen most often for a skill, if any. */
export function topMisconception(rec: SkillRecord | undefined): string | null {
  if (!rec) return null;
  let best: string | null = null;
  let n = 0;
  for (const [k, v] of Object.entries(rec.misconceptions))
    if (v > n) {
      best = k;
      n = v;
    }
  return best;
}

/** Load a learner state from untrusted JSON, keeping only well-formed records. */
export function cleanLearner(raw: unknown): LearnerState {
  const out: LearnerState = {};
  if (typeof raw !== 'object' || raw === null) return out;
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v !== 'object' || v === null) continue;
    const r = v as Record<string, unknown>;
    const num = (x: unknown, d = 0) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? Math.floor(x) : d);
    const mis: Record<string, number> = {};
    if (typeof r.misconceptions === 'object' && r.misconceptions)
      for (const [k, n] of Object.entries(r.misconceptions as Record<string, unknown>)) if (typeof n === 'number' && n > 0) mis[k.slice(0, 40)] = Math.floor(n);
    out[id.slice(0, 40)] = {
      attempts: num(r.attempts),
      correct: num(r.correct),
      streak: num(r.streak),
      missStreak: num(r.missStreak),
      tier: Math.max(1, num(r.tier, 1)),
      cleanAtTop: num(r.cleanAtTop),
      hintsUsed: num(r.hintsUsed),
      misconceptions: mis,
      mastered: r.mastered === true,
    };
  }
  return out;
}
