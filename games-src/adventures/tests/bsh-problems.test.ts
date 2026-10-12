import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { bank, makeQuestion, OPEN_MISSIONS, TIERS, type Kind, type Question } from '../src/games/body-system-heroes/problems';

const KINDS: Kind[] = ['scan', 'diagnose'];

/** Every question in every open mission, built once. */
function all(): Question[] {
  const out: Question[] = [];
  for (const m of OPEN_MISSIONS) for (const d of bank(m)) out.push(makeQuestion(m, d.tier, d.kind, mulberry32(1), bank(m).filter((x) => x.id !== d.id).map((x) => x.id)));
  return out;
}

const words = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);

describe('Body System Heroes questions', () => {
  it('each open mission has at least 4 scan and 2 diagnose questions at every level, with unique ids', () => {
    const ids = new Set<string>();
    for (const m of OPEN_MISSIONS)
      for (const t of TIERS) {
        expect(bank(m).filter((d) => d.tier === t && d.kind === 'scan').length).toBeGreaterThanOrEqual(4);
        expect(bank(m).filter((d) => d.tier === t && d.kind === 'diagnose').length).toBeGreaterThanOrEqual(2);
      }
    for (const m of OPEN_MISSIONS)
      for (const d of bank(m)) {
        expect(ids.has(d.id)).toBe(false);
        ids.add(d.id);
        expect(d.id.startsWith(m)).toBe(true);
      }
  });

  it('every question has three different answers, exactly one right, and a reason for each wrong one', () => {
    for (const q of all()) {
      expect(q.choices).toHaveLength(3);
      expect(q.choices.filter((c) => c.correct)).toHaveLength(1);
      expect(new Set(q.choices.map((c) => c.value)).size).toBe(3);
      for (const c of q.choices.filter((x) => !x.correct)) {
        expect(c.misconception, q.id).toBeTruthy();
        expect((c.why ?? '').length, q.id).toBeGreaterThan(15);
      }
      expect(q.explain.length).toBeGreaterThan(20);
      expect(q.hints.every((h) => h.length > 10)).toBe(true);
    }
  });

  it('follows the wording rule: facts first, one plain question at the end, short sentences', () => {
    for (const q of all()) {
      expect(q.ask.trim().endsWith('?'), q.id).toBe(true);
      // one question only, at the end
      expect(q.ask.split('?').length, q.id).toBe(2);
      for (const sentence of q.ask.split(/[.?!:]\s/)) expect(words(sentence).length, `${q.id}: ${sentence}`).toBeLessThanOrEqual(18);
    }
  });

  it('a hint before the last one never gives the answer away, and no wrong-answer sentence names the right answer', () => {
    for (const q of all()) {
      const right = q.choices.find((c) => c.correct)!.label.toLowerCase().replace(/[.]$/, '');
      for (const h of q.hints) expect(h.toLowerCase().includes(right), `${q.id}: ${h}`).toBe(false);
      for (const c of q.choices.filter((x) => !x.correct)) expect((c.why ?? '').toLowerCase().includes(right), `${q.id}: ${c.why}`).toBe(false);
    }
  });

  it('uses names, not "he" or "she", for the characters', () => {
    for (const q of all()) {
      const text = [q.ask, q.explain, ...q.hints, ...q.choices.map((c) => `${c.label} ${c.why ?? ''}`)].join(' ');
      expect(text, q.id).not.toMatch(/\b(he|she|him|her|his|hers)\b/i);
    }
  });

  it('shows every question of a level before repeating one', () => {
    for (const m of OPEN_MISSIONS)
      for (const t of TIERS)
        for (const k of KINDS) {
          const pool = bank(m).filter((d) => d.tier === t && d.kind === k);
          const r = mulberry32(7);
          const seen: string[] = [];
          for (let i = 0; i < pool.length; i++) seen.push(makeQuestion(m, t, k, r, seen).id);
          expect(new Set(seen).size).toBe(pool.length);
        }
  });

  it('the right answer is in a different place from question to question', () => {
    const spots = new Set<number>();
    const r = mulberry32(3);
    for (let i = 0; i < 30; i++) spots.add(makeQuestion('lungs', 1, 'scan', r).choices.findIndex((c) => c.correct));
    expect(spots.size).toBe(3);
  });
});
