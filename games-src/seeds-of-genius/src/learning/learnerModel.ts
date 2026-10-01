/**
 * Local learner model: one record per learning objective, kept only in this
 * browser's save. Rule-based so the game adapts fully offline.
 *
 * Phase 0 wires it up and records the practice quest's observation question;
 * later chapters add their own objectives and read the hint level back.
 */

export const OBJECTIVES = {
  observe: 'Record specific observations and tell an observation from a guess',
  journey: "Order Carver's educational journey; name a barrier and a support",
  soil: 'Compare single-crop planting with crop rotation; explain soil care',
  invent: 'Test uses for a crop against a need; explain evidence and tradeoffs',
  help: "Match a farmer's problem to a feasible science-based recommendation",
  method: 'Form a question and hypothesis, change one variable, revise a conclusion',
  capstone: 'Present an original community invention with a test plan and revision',
} as const;

export type ObjectiveId = keyof typeof OBJECTIVES;

export interface ObjectiveRecord {
  attempts: number;
  correct: number;
  /** Highest hint rung used so far (0 = none, 3 = worked example). */
  hintLevel: 0 | 1 | 2 | 3;
  /** Most recent misconception the player showed, if any. */
  misconception: string | null;
  /** Short notes on what the player actually did right. */
  evidence: string[];
  mastered: boolean;
}

export type LearnerState = Record<string, ObjectiveRecord>;

export function emptyRecord(): ObjectiveRecord {
  return { attempts: 0, correct: 0, hintLevel: 0, misconception: null, evidence: [], mastered: false };
}

export function getRecord(state: LearnerState, objectiveId: string): ObjectiveRecord {
  if (!state[objectiveId]) state[objectiveId] = emptyRecord();
  return state[objectiveId];
}

/**
 * Record one attempt. Mastery here means "got it right, at most one hint":
 * a simple, explainable rule the later chapters can refine.
 */
export function recordAttempt(
  state: LearnerState,
  objectiveId: string,
  result: { correct: boolean; misconception?: string; evidence?: string },
): ObjectiveRecord {
  const rec = getRecord(state, objectiveId);
  rec.attempts += 1;
  if (result.correct) {
    rec.correct += 1;
    if (result.evidence && !rec.evidence.includes(result.evidence)) {
      rec.evidence.push(result.evidence);
      if (rec.evidence.length > 12) rec.evidence.shift();
    }
    if (rec.hintLevel <= 1) rec.mastered = true;
  } else if (result.misconception) {
    rec.misconception = result.misconception;
  }
  return rec;
}

/** Move one rung up the hint ladder and return the new rung (1-3). */
export function escalateHint(state: LearnerState, objectiveId: string): 1 | 2 | 3 {
  const rec = getRecord(state, objectiveId);
  const next = Math.min(3, rec.hintLevel + 1) as 1 | 2 | 3;
  rec.hintLevel = next;
  return next;
}

/** A confident player (right first time, no hints) can be offered a deeper challenge. */
export function isConfident(state: LearnerState, objectiveId: string): boolean {
  const rec = state[objectiveId];
  return !!rec && rec.mastered && rec.hintLevel === 0 && rec.attempts === rec.correct;
}
