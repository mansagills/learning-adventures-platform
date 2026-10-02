import { describe, expect, it } from 'vitest';
import { cleanLearner, recordAnswer, topMisconception, type LearnerState } from '../src/kit/learning/mastery';
import { cleanSave, freshSave } from '../src/games/number-line-ninja/save';

const rules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };

describe('learner model', () => {
  it('two clean answers move up a tier; two misses move down', () => {
    const s: LearnerState = {};
    expect(recordAnswer(s, 'x', { correct: true, hintRung: 0 }, rules).tierChange).toBe(0);
    expect(recordAnswer(s, 'x', { correct: true, hintRung: 1 }, rules).tierChange).toBe(1);
    expect(s.x.tier).toBe(2);
    recordAnswer(s, 'x', { correct: false, hintRung: 0, misconception: 'wrong-way' }, rules);
    expect(recordAnswer(s, 'x', { correct: false, hintRung: 0, misconception: 'wrong-way' }, rules).tierChange).toBe(-1);
    expect(s.x.tier).toBe(1);
    expect(topMisconception(s.x)).toBe('wrong-way');
  });

  it('answers that needed the model or the worked example are not clean', () => {
    const s: LearnerState = {};
    const o = recordAnswer(s, 'x', { correct: true, hintRung: 2 }, rules);
    expect(o.clean).toBe(false);
    recordAnswer(s, 'x', { correct: true, hintRung: 3 }, rules);
    expect(s.x.tier).toBe(1);
    expect(s.x.streak).toBe(0);
  });

  it('mastery comes from clean answers at the mastery tier', () => {
    const s: LearnerState = {};
    let mastered = false;
    for (let i = 0; i < 8 && !mastered; i++) mastered = recordAnswer(s, 'x', { correct: true, hintRung: 0 }, rules).justMastered;
    expect(mastered).toBe(true);
    expect(s.x.tier).toBe(3);
  });

  it('a damaged learner record is cleaned, not trusted', () => {
    const s = cleanLearner({ ok: { attempts: 3, correct: 2, tier: 2, misconceptions: { a: 2, b: 'x' } }, bad: 'nope', worse: { tier: -4, attempts: NaN } });
    expect(s.ok).toMatchObject({ attempts: 3, correct: 2, tier: 2, misconceptions: { a: 2 } });
    expect(s.bad).toBeUndefined();
    expect(s.worse.tier).toBe(1);
    expect(s.worse.attempts).toBe(0);
  });
});

describe('Number Line Ninja save', () => {
  it('a fresh save starts on the white belt with nothing earned', () => {
    const s = freshSave();
    expect(s.current).toBe('white');
    expect(s.earned).toEqual([]);
  });

  it('earned belts cannot skip ahead, and the current belt must be unlocked', () => {
    const s = cleanSave({ earned: ['white', 'orange', 'green'], current: 'black', stars: { white: 99, yellow: -2 } });
    expect(s.earned).toEqual(['white']);
    expect(s.current).toBe('yellow');
    expect(s.stars.white).toBe(5);
    expect(s.stars.yellow).toBe(0);
  });

  it('unknown looks fall back to defaults', () => {
    const s = cleanSave({ appearance: { skin: 'green-alien', body: 'robot', outfit: 'teal' } });
    expect(s.appearance.skin).toBe(freshSave().appearance.skin);
    expect(s.appearance.body).toBe(freshSave().appearance.body);
    expect(s.appearance.outfit).toBe('teal');
  });

  it('garbage becomes a fresh save', () => {
    expect(cleanSave('not a save').current).toBe('white');
    expect(cleanSave(null).earned).toEqual([]);
  });
});
