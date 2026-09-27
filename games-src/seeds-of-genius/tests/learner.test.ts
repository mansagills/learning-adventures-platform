import { describe, expect, it } from 'vitest';
import { escalateHint, isConfident, recordAttempt, type LearnerState } from '../src/learning/learnerModel';
import { authoredHints, createRemoteHintProvider } from '../src/learning/hints';

describe('learner model', () => {
  it('tracks attempts, misconceptions and mastery', () => {
    const s: LearnerState = {};
    recordAttempt(s, 'observe', { correct: false, misconception: 'prediction-as-observation' });
    expect(escalateHint(s, 'observe')).toBe(1);
    recordAttempt(s, 'observe', { correct: true, evidence: 'picked the observation' });
    expect(s.observe).toMatchObject({ attempts: 2, correct: 1, hintLevel: 1, misconception: 'prediction-as-observation', mastered: true });
    expect(isConfident(s, 'observe')).toBe(false);
  });

  it('caps the hint ladder at a worked example', () => {
    const s: LearnerState = {};
    expect([escalateHint(s, 'x'), escalateHint(s, 'x'), escalateHint(s, 'x'), escalateHint(s, 'x')]).toEqual([1, 2, 3, 3]);
    recordAttempt(s, 'x', { correct: true });
    expect(s.x.mastered).toBe(false); // needed the worked example
  });

  it('confident players are right first time without hints', () => {
    const s: LearnerState = {};
    recordAttempt(s, 'observe', { correct: true });
    expect(isConfident(s, 'observe')).toBe(true);
  });

  it('hint providers fall back to authored text', async () => {
    expect(await authoredHints.getHint({ objectiveId: 'o', rung: 1, authoredHint: 'look' })).toBe('look');
    const remote = createRemoteHintProvider('http://127.0.0.1:1/never', 200);
    expect(await remote.getHint({ objectiveId: 'o', rung: 2, authoredHint: 'narrow' })).toBe('narrow');
    expect(createRemoteHintProvider(undefined).name).toBe('authored');
  });
});
