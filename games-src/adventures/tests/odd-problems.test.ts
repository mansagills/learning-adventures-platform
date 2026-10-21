import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { ANIMAL_ORDER, ANIMALS, ANIMALS_IN, dials, OPEN_ZONES } from '../src/games/ocean-depth-diver/animals';
import { CHALLENGES, cleanParts, creatureName, meets, PART_KEYS, PART_OPTIONS, START_PARTS, testCreature, type Parts } from '../src/games/ocean-depth-diver/designer';
import { bank, makeQuestion, STATIONS, TIERS } from '../src/games/ocean-depth-diver/problems';

describe('Ocean Depth Diver questions', () => {
  it('has at least five questions at every level of each expedition, with unique ids', () => {
    const ids = new Set<string>();
    for (const s of STATIONS)
      for (const t of TIERS) {
        const n = bank(s).filter((d) => d.tier === t).length;
        expect(n, `${s} level ${t}`).toBeGreaterThanOrEqual(5);
      }
    for (const s of STATIONS)
      for (const d of bank(s)) {
        expect(ids.has(d.id), d.id).toBe(false);
        ids.add(d.id);
      }
  });

  it('gives every question one right answer and two wrong ones, each with a misconception and a reason', () => {
    for (const s of STATIONS)
      for (const d of bank(s)) {
        expect(d.wrong.length, d.id).toBe(2);
        const labels = [d.right, ...d.wrong.map((w) => w[0])];
        expect(new Set(labels).size, d.id).toBe(3);
        for (const [label, mis, why] of d.wrong) {
          expect(mis, `${d.id}: ${label}`).toBeTruthy();
          expect(why.length, `${d.id}: ${label}`).toBeGreaterThan(10);
          // a wrong answer's reason never just names the right answer
          expect(why.toLowerCase().includes(d.right.toLowerCase()), `${d.id}: ${label}`).toBe(false);
        }
        expect(d.hints[0].length).toBeGreaterThan(10);
        expect(d.hints[1].length).toBeGreaterThan(10);
      }
  });

  it('keeps questions short: the facts first, then one plain question at the end', () => {
    for (const s of STATIONS)
      for (const d of bank(s)) {
        expect(d.ask.trim().endsWith('?'), d.id).toBe(true);
        expect((d.ask.match(/\?/g) ?? []).length, d.id).toBe(1);
        for (const sentence of d.ask.split(/(?<=[.?!])\s+/)) expect(sentence.split(/\s+/).length, `${d.id}: ${sentence}`).toBeLessThanOrEqual(26);
      }
  });

  it('shuffles the choices but keeps exactly one right answer, and avoids recent questions', () => {
    const r = mulberry32(7);
    for (const s of STATIONS)
      for (const t of TIERS) {
        const q = makeQuestion(s, t, r);
        expect(q.choices.filter((c) => c.correct).length).toBe(1);
        expect(q.tier).toBe(t);
        const others = bank(s)
          .filter((d) => d.tier === t && d.id !== q.id)
          .map((d) => d.id);
        const next = makeQuestion(s, t, mulberry32(3), [q.id]);
        expect(others).toContain(next.id);
      }
  });

  it('only shows animals the field guide knows, and only from open zones', () => {
    for (const s of STATIONS) for (const d of bank(s)) if (d.pic.k === 'animal') expect(ANIMAL_ORDER).toContain(d.pic.id);
    for (const a of ANIMAL_ORDER) expect(OPEN_ZONES).toContain(ANIMALS[a].zone);
  });

  it('gets the tricky facts right', () => {
    const all = STATIONS.flatMap((s) => bank(s));
    const find = (id: string) => all.find((d) => d.id === id)!;
    // energy starts with the Sun, not the water or the top predator
    expect(find('sun-chain-start').right).toBe('The Sun');
    // the ocean makes about half of our oxygen
    expect(find('sun-oxygen').right).toMatch(/half/);
    // red looks dark deep down, and the nightly trip is at night
    expect(find('sun-red-fades').right).toMatch(/dark/i);
    expect(find('tw-migrate-when').right).toBe('At night');
    // belly lights hide a fish; they do not make it easier to see
    expect(find('tw-belly-lights').right).toMatch(/hard to see/);
    // coral is an animal: the algae inside it need the sunlight
    expect(find('sun-coral-animal').right).toMatch(/algae/);
  });
});

describe('the field guide and the dials', () => {
  it('lists six sunlight animals and three twilight animals in the right zones', () => {
    expect(ANIMALS_IN.sunlight.length).toBe(6);
    expect(ANIMALS_IN.twilight.length).toBe(3);
    for (const a of ANIMAL_ORDER) {
      const an = ANIMALS[a];
      if (an.zone === 'sunlight') expect(an.depth).toBeLessThan(200);
      if (an.zone === 'twilight') expect(an.depth).toBeGreaterThanOrEqual(200);
    }
  });

  it('gets colder and presses harder as the sub goes down', () => {
    let last = dials(0);
    expect(last.pressure).toBe(1);
    for (let m = 50; m <= 1000; m += 50) {
      const d = dials(m);
      expect(d.temp).toBeLessThanOrEqual(last.temp);
      expect(d.pressure).toBeGreaterThan(last.pressure);
      last = d;
    }
    expect(dials(100).pressure).toBe(11);
    expect(dials(1000).temp).toBe(4);
  });
});

describe('the Creature Designer', () => {
  const every = (): Parts[] => {
    const out: Parts[] = [];
    const go = (i: number, p: Partial<Parts>) => {
      if (i === PART_KEYS.length) return void out.push(p as Parts);
      for (const o of PART_OPTIONS[PART_KEYS[i]]) go(i + 1, { ...p, [PART_KEYS[i]]: o.id });
    };
    go(0, {});
    return out;
  };

  it('can meet every challenge with some creature', () => {
    for (const ch of CHALLENGES)
      expect(
        every().some((p) => meets(ch, testCreature(p, ch.zone))),
        ch.id,
      ).toBe(true);
  });

  it('shows that the same creature can thrive in one zone and struggle in another', () => {
    const twilightStar: Parts = { body: 'sleek', eyes: 'big', skin: 'silver', light: 'belly', mouth: 'small' };
    expect(testCreature(twilightStar, 'twilight').overall).toBe('thrives');
    expect(testCreature(twilightStar, 'sunlight').overall).not.toBe('thrives');
    const reefStar: Parts = { body: 'flat', eyes: 'small', skin: 'bright', light: 'none', mouth: 'small' };
    expect(testCreature(reefStar, 'sunlight').overall).toBe('thrives');
    expect(testCreature(reefStar, 'twilight').overall).toBe('struggles');
  });

  it('needs big eyes (or a lure) to find food in dim light, and a glowing belly to hide fully from below', () => {
    for (const p of every()) {
      const r = testCreature(p, 'twilight');
      const food = r.checks.find((c) => c.id === 'food')!;
      const hide = r.checks.find((c) => c.id === 'hide')!;
      if (p.eyes === 'small' && p.light !== 'lure') expect(food.grade).toBe(0);
      if (p.light !== 'belly') expect(hide.grade).toBeLessThan(2);
      for (const c of r.checks) expect(c.why.length).toBeGreaterThan(10);
    }
  });

  it('cleans saved parts and makes friendly names', () => {
    expect(cleanParts({ body: 'flat', eyes: 'giant', skin: 7 })).toEqual({ ...START_PARTS, body: 'flat' });
    expect(cleanParts(null)).toEqual(START_PARTS);
    expect(creatureName(0)).toMatch(/^[A-Z][a-z]+$/);
    expect(creatureName(13)).not.toBe(creatureName(0));
  });
});
