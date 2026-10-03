import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import {
  addMinutes,
  attackProblem,
  countOn,
  diagnoseSet,
  fmt,
  fmtDuration,
  handAngles,
  makeProblem,
  medalFor,
  readDistractors,
  say,
  STATIONS,
  swapped,
  TIERS,
  toMinutes,
  words,
} from '../src/games/time-attack-clock/problems';

describe('time basics', () => {
  it('writes, says and names times', () => {
    expect(fmt({ h: 3, m: 5 })).toBe('3:05');
    expect(say({ h: 3, m: 5 })).toBe('3 oh 5');
    expect(say({ h: 3, m: 0 })).toBe("3 o'clock");
    expect(words({ h: 2, m: 45 })).toBe('quarter to 3');
    expect(words({ h: 12, m: 45 })).toBe('quarter to 1');
    expect(words({ h: 2, m: 15 })).toBe('quarter past 2');
    expect(words({ h: 2, m: 30 })).toBe('half past 2');
    expect(fmtDuration(85)).toBe('1 hour 25 minutes');
    expect(fmtDuration(120)).toBe('2 hours');
  });

  it('adds minutes around the clock', () => {
    expect(addMinutes({ h: 2, m: 50 }, 25)).toEqual({ h: 3, m: 15 });
    expect(addMinutes({ h: 12, m: 40 }, 30)).toEqual({ h: 1, m: 10 });
    expect(addMinutes({ h: 11, m: 30 }, 60)).toEqual({ h: 12, m: 30 });
    expect(addMinutes({ h: 1, m: 0 }, -30)).toEqual({ h: 12, m: 30 });
  });

  it('puts the hour hand part of the way to the next hour', () => {
    expect(handAngles({ h: 3, m: 0 })).toEqual({ hour: 90, minute: 0 });
    expect(handAngles({ h: 2, m: 30 }).hour).toBe(75);
    expect(handAngles({ h: 12, m: 15 })).toEqual({ hour: 7.5, minute: 90 });
  });

  it('knows what swapped hands would say', () => {
    expect(swapped({ h: 3, m: 0 })).toEqual({ h: 12, m: 15 });
    expect(swapped({ h: 6, m: 20 })).toEqual({ h: 4, m: 32 });
  });
});

describe('count on', () => {
  it('jumps to the hour, then on', () => {
    expect(countOn({ h: 2, m: 50 }, { h: 3, m: 15 })).toEqual([
      { to: { h: 3, m: 0 }, add: 10 },
      { to: { h: 3, m: 15 }, add: 15 },
    ]);
  });
  it('counts whole hours by hours', () => {
    expect(countOn({ h: 2, m: 30 }, { h: 4, m: 30 }).map((s) => fmt(s.to))).toEqual(['3:30', '4:30']);
  });
  it('always adds up to the gap', () => {
    for (let seed = 1; seed < 300; seed++) {
      const p = makeProblem('bakery', TIERS[seed % 3], mulberry32(seed));
      if (p.kind !== 'elapsed') throw new Error('expected elapsed');
      const path = countOn(p.start, p.end);
      expect(path.reduce((a, s) => a + s.add, 0)).toBe(p.minutes);
      expect(path[path.length - 1].to).toEqual(p.end);
    }
  });
});

describe('problems', () => {
  it('every station and tier makes a valid problem', () => {
    for (const station of STATIONS)
      for (const tier of TIERS)
        for (let seed = 1; seed < 250; seed++) {
          const p = makeProblem(station, tier, mulberry32(seed * 7 + tier));
          expect(p.station).toBe(station);
          expect(p.tier).toBe(tier);
          if (p.kind === 'read') {
            const m = p.time.m;
            if (tier === 1) expect([0, 30]).toContain(m);
            if (tier === 2) expect(m % 5 === 0 && m !== 0 && m !== 30).toBe(true);
            if (tier === 3) expect(m % 5).not.toBe(0);
            expect(p.choices.length).toBeGreaterThanOrEqual(3);
            expect(p.choices.filter((c) => c.correct)).toHaveLength(1);
            expect(p.choices.find((c) => c.correct)!.label).toBe(p.words ? words(p.time) : fmt(p.time));
            expect(new Set(p.choices.map((c) => c.value)).size).toBe(p.choices.length);
            for (const c of p.choices) if (!c.correct) expect(c.misconception).toBeTruthy();
          } else if (p.kind === 'set') {
            expect(toMinutes(p.start)).not.toBe(toMinutes(p.time));
            expect(p.step).toBe(tier === 1 ? 30 : tier === 2 ? 5 : 1);
            expect(diagnoseSet(p.time, p.time)).toBeNull();
          } else {
            expect(addMinutes(p.start, p.minutes)).toEqual(p.end);
            if (tier === 1) expect(p.minutes % 60).toBe(0);
            if (tier === 2) {
              expect(p.minutes % 5).toBe(0);
              expect(p.end.h).toBe(p.start.h);
            }
            if (tier === 3) expect(p.end.h).not.toBe(p.start.h);
            expect(p.choices).toHaveLength(3);
            expect(p.choices.filter((c) => c.correct)).toHaveLength(1);
            expect(new Set(p.choices.map((c) => c.value)).size).toBe(3);
          }
        }
  });

  it('reading distractors come from real mistakes', () => {
    const d = readDistractors({ h: 2, m: 45 }, 2);
    expect(d[0]).toEqual({ time: { h: 3, m: 45 }, mis: 'next-hour' });
    expect(d.find((x) => x.mis === 'by-ones')!.time).toEqual({ h: 2, m: 9 });
    expect(readDistractors({ h: 4, m: 0 }, 1).map((x) => x.mis)).toContain('swapped');
  });

  it('diagnoses a clock set wrong', () => {
    const t = { h: 2, m: 45 };
    expect(diagnoseSet({ h: 3, m: 45 }, t)).toBe('next-hour');
    expect(diagnoseSet({ h: 2, m: 50 }, t)).toBe('off-five');
    expect(diagnoseSet({ h: 2, m: 15 }, t)).toBe('backwards');
    expect(diagnoseSet({ h: 2, m: 50 }, { h: 2, m: 10 })).toBe('by-ones');
    expect(diagnoseSet({ h: 9, m: 10 }, t)).toBe('swapped');
    expect(diagnoseSet({ h: 4, m: 30 }, { h: 4, m: 0 })).toBe('half-hour');
    expect(diagnoseSet({ h: 7, m: 3 }, t)).toBe('other');
  });

  it('time attack uses reading questions near the player level', () => {
    for (let seed = 1; seed < 60; seed++) {
      const p = attackProblem(3, mulberry32(seed));
      expect(p.kind).toBe('read');
      expect(p.tier).toBeGreaterThanOrEqual(2);
    }
    expect(medalFor(15)).toBe('gold');
    expect(medalFor(10)).toBe('silver');
    expect(medalFor(6)).toBe('bronze');
    expect(medalFor(3)).toBeNull();
  });
});
