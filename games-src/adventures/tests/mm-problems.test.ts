import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { countDistractors, countUp, diagnoseChange, fewest, fmt, makeProblem, say, sum, TIERS, VALUE } from '../src/games/money-market-madness/problems';
import { bonuses, customersPerDay, menu, nextIn, shopOffers, STARTING, UPGRADES } from '../src/games/money-market-madness/upgrades';

describe('money formatting', () => {
  it('writes and says amounts', () => {
    expect(fmt(35)).toBe('35¢');
    expect(fmt(105)).toBe('$1.05');
    expect(fmt(400)).toBe('$4.00');
    expect(say(105)).toBe('1 dollar and 5 cents');
    expect(say(1)).toBe('1 cent');
  });
});

describe('problems by tier', () => {
  it('every tier makes solvable problems in its range', () => {
    for (const tier of TIERS)
      for (let seed = 1; seed < 200; seed++) {
        const p = makeProblem(tier, mulberry32(seed));
        expect(p.tier).toBe(tier);
        for (const s of p.steps) {
          if (s.kind === 'count') {
            expect(s.answer).toBe(sum(s.coins));
            expect(s.choices.filter((c) => c.correct)).toHaveLength(1);
            expect(s.choices.find((c) => c.correct)!.value).toBe(s.answer);
            expect(new Set(s.choices.map((c) => c.value)).size).toBe(s.choices.length);
            if (tier === 1) {
              expect(s.answer).toBeLessThanOrEqual(50);
              expect(s.coins).not.toContain('quarter');
            } else {
              expect(s.answer).toBeLessThanOrEqual(99);
              expect(s.coins).toContain('quarter');
            }
          }
          if (s.kind === 'enough') expect(s.answer).toBe(s.paid >= s.price);
          if (s.kind === 'total') {
            expect(s.answer).toBe(s.prices[0] + s.prices[1]);
            expect(s.choices.find((c) => c.correct)!.value).toBe(s.answer);
          }
          if (s.kind === 'change') {
            expect(s.answer).toBe(s.paid - s.price);
            expect(s.answer).toBeGreaterThan(0);
            expect(s.paid).toBe(tier === 3 ? 100 : 500);
          }
        }
      }
  });

  it('tier 1 usually mixes nickels and dimes so the size trap shows', () => {
    let both = 0;
    for (let seed = 1; seed < 300; seed++) {
      const s = makeProblem(1, mulberry32(seed)).steps[0];
      if (s.kind === 'count' && s.coins.includes('nickel') && s.coins.includes('dime')) both++;
    }
    expect(both).toBeGreaterThan(150);
  });

  it('tier 4 totals mostly need regrouping into dollars', () => {
    let regroup = 0;
    for (let seed = 1; seed < 300; seed++) {
      const p = makeProblem(4, mulberry32(seed));
      if ((p.prices[0] % 100) + (p.prices[1] % 100) >= 100) regroup++;
    }
    expect(regroup).toBeGreaterThan(150);
  });
});

describe('mistakes', () => {
  it('coin-count, size/value and quarter-20 distractors', () => {
    const d = countDistractors(['quarter', 'dime', 'nickel', 'penny']);
    expect(d).toContainEqual([4, 'coin-count']);
    expect(d).toContainEqual([20 + 10 + 5 + 1, 'quarter-20']);
    expect(d).toContainEqual([25 + 5 + 10 + 1, 'size-value']);
  });
  it('diagnoses change', () => {
    expect(diagnoseChange(35, 100, 65)).toBeNull();
    expect(diagnoseChange(35, 100, 35)).toBe('gave-price');
    expect(diagnoseChange(35, 100, 75)).toBe('off-ten');
    expect(diagnoseChange(35, 100, 60)).toBe('off-five');
    expect(diagnoseChange(35, 100, 64)).toBe('off-one');
    expect(diagnoseChange(275, 500, 325)).toBe('off-dollar');
  });
});

describe('helpers', () => {
  it('fewest coins', () => {
    expect(fewest(65)).toEqual(['quarter', 'quarter', 'dime', 'nickel']);
    expect(sum(fewest(287))).toBe(287);
  });
  it('counting up from the price reaches what was paid', () => {
    const steps = countUp(35, 100);
    expect(steps.map((s) => s.reach)).toEqual([40, 50, 75, 100]);
    for (let price = 1; price < 500; price += 7) {
      const st = countUp(price, 500);
      expect(st[st.length - 1].reach).toBe(500);
      let at = price;
      for (const s of st) {
        at += VALUE[s.coin];
        expect(at).toBe(s.reach);
      }
    }
  });
});

describe('upgrades', () => {
  it('lines unlock in order and starting items are free', () => {
    for (const id of STARTING) expect(UPGRADES.find((u) => u.id === id)!.cost).toBe(0);
    expect(nextIn('food', STARTING)!.id).toBe('pretzel');
    expect(shopOffers(STARTING).map((u) => u.id)).toEqual(['pretzel', 'lemonade', 'salt', 'awning']);
  });
  it('costs grow within each line', () => {
    for (const line of ['food', 'drink', 'topping', 'stall'] as const) {
      const costs = UPGRADES.filter((u) => u.line === line).map((u) => u.cost);
      for (let i = 1; i < costs.length; i++) expect(costs[i]).toBeGreaterThan(costs[i - 1]);
    }
  });
  it('bonuses, menu and customers grow with what you own', () => {
    const all = UPGRADES.map((u) => u.id);
    expect(bonuses(all).tip).toBeGreaterThan(bonuses(STARTING).tip);
    expect(menu(all).food.length).toBe(5);
    expect(menu(STARTING).topping.length).toBe(0);
    expect(customersPerDay(STARTING)).toBe(6);
    expect(customersPerDay(all)).toBeLessThanOrEqual(14);
  });
});
