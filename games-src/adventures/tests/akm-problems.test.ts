import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { ANIMALS, animal, HABITAT_INFO, JOURNAL_ORDER, OPEN_TRIPS, toSpot, TRIP_ANIMALS } from '../src/games/animal-kingdom-match/animals';
import { bank, makeQuestion, STATIONS, TIERS } from '../src/games/animal-kingdom-match/problems';
import { BEAM_R, HIT_R, NIGHT_ANIMALS, NIGHT_H, NIGHT_W, nearestNight, shineHit, whereIs } from '../src/games/animal-kingdom-match/night';
import { givesStep, partStep, pickRescues, stepsFor, wrongHomeReason } from '../src/games/animal-kingdom-match/rescue';
import { ANIMAL_HOME } from '../src/kit/worlds/wild-lands/animal-art';
import { POLAR_ANIMALS, POLAR_SEA } from '../src/kit/worlds/wild-lands/habitats';

describe('Animal Kingdom Match questions', () => {
  it('has six questions at every level of each trip, with unique ids', () => {
    const ids = new Set<string>();
    for (const s of STATIONS) for (const t of TIERS) expect(bank(s).filter((d) => d.tier === t).length, `${s} ${t}`).toBe(6);
    for (const s of STATIONS)
      for (const d of bank(s)) {
        expect(ids.has(d.id), d.id).toBe(false);
        ids.add(d.id);
      }
  });

  it('gives every question one right answer and two wrong ones, each with a mistake and a reason that never names the answer', () => {
    for (const s of STATIONS)
      for (const d of bank(s)) {
        expect(d.wrong.length, d.id).toBe(2);
        expect(new Set([d.right, ...d.wrong.map((w) => w[0])]).size, d.id).toBe(3);
        for (const [label, mis, why] of d.wrong) {
          expect(mis, `${d.id}: ${label}`).toBeTruthy();
          expect(why.length, `${d.id}: ${label}`).toBeGreaterThan(10);
          expect(why.toLowerCase().includes(d.right.toLowerCase()), `${d.id}: ${label}`).toBe(false);
        }
        expect(d.hints[0].length).toBeGreaterThan(10);
        expect(d.hints[1].length).toBeGreaterThan(10);
      }
  });

  it('keeps questions short for grades 1 to 4: the facts first, then one plain question at the end', () => {
    for (const s of STATIONS)
      for (const d of bank(s)) {
        expect(d.ask.trim().endsWith('?'), d.id).toBe(true);
        expect((d.ask.match(/\?/g) ?? []).length, d.id).toBe(1);
        const limit = d.tier === 1 ? 20 : 24;
        for (const sentence of d.ask.split(/(?<=[.?!])\s+/)) expect(sentence.split(/\s+/).length, `${d.id}: ${sentence}`).toBeLessThanOrEqual(limit);
      }
  });

  it('shuffles the choices but keeps exactly one right answer, and avoids recent questions', () => {
    const r = mulberry32(7);
    for (const s of STATIONS)
      for (const t of TIERS) {
        const q = makeQuestion(s, t, r);
        expect(q.choices.filter((c) => c.correct).length).toBe(1);
        const next = makeQuestion(s, t, mulberry32(3), [q.id]);
        expect(next.id).not.toBe(q.id);
      }
  });

  it('gets the tricky facts right', () => {
    const all = STATIONS.flatMap((s) => bank(s));
    const find = (id: string) => all.find((d) => d.id === id)!;
    // a camel's hump is fat, and the water answer is tagged as the mistake
    expect(find('d-hump').right).toMatch(/^Fat/);
    expect(find('d-hump').wrong.find((w) => w[0].includes('Water'))?.[1]).toBe('hump-water');
    // Antarctica is a desert (deserts are about rain, not heat)
    expect(find('d-antarctica').right).toMatch(/cold desert/);
    // a sloth cannot choose its green fur; bright colors are a warning
    expect(find('r-sloth-green').wrong.some((w) => w[1] === 'change-color')).toBe(true);
    expect(find('r-dart').right).toMatch(/[Dd]o not eat/);
    // body parts come from the parents
    expect(find('r-spots').right).toMatch(/parents/);
    // nothing claims a parrot lives 80 years in the wild, or that lions are the only cats in groups
    for (const d of all) expect(`${d.ask} ${d.right} ${d.explain}`).not.toMatch(/80 years|only cats/);
    // penguins live in the south; polar bears and wild penguins never meet
    expect(find('p-penguins').right).toMatch(/south/);
    expect(find('p-penguins').wrong.find((w) => /Arctic/.test(w[0]))?.[1]).toBe('penguin-north');
    expect(find('p-never-meet').right).toMatch(/^No/);
    // whales and dolphins are mammals that breathe air
    expect(find('w-whale').right).toMatch(/mammal/);
    expect(find('w-dolphin').wrong.some((w) => w[1] === 'breathe-water')).toBe(true);
    // the sea is the salty one; migration is not hibernation
    expect(find('w-salty').right).toBe('The sea');
    expect(find('p-migration').right).toBe('Migration');
    expect(find('w-cycle').right).toBe('A frog');
  });
});

describe('Animal Kingdom Match animals', () => {
  it('has a card for every animal to spot on the open trips, with two facts', () => {
    for (const t of OPEN_TRIPS)
      for (const id of toSpot(t)) {
        const a = animal(id);
        expect(a.home, id).toBe(t);
        expect(a.facts[0].length).toBeGreaterThan(20);
        expect(a.facts[1].length).toBeGreaterThan(20);
        expect(a.where.length).toBeGreaterThan(10);
      }
    expect(JOURNAL_ORDER.length).toBe(24);
    expect(new Set(JOURNAL_ORDER).size).toBe(24);
    expect(toSpot('poles').filter((id) => id === 'penguin').length).toBe(1);
    // the wetland's tree frog belongs to the rainforest page
    expect(toSpot('wetland')).not.toContain('frog');
    for (const id of toSpot('poles')) expect(animal(id).side, id).toBeTruthy();
    for (const id of toSpot('wetland')) expect(animal(id).water, id).toBeTruthy();
  });

  it('agrees with the art about where each new animal lives', () => {
    for (const a of Object.values(ANIMALS)) {
      const art = ANIMAL_HOME[a!.id as keyof typeof ANIMAL_HOME];
      const habitat = { arctic: 'poles', antarctic: 'poles', sea: 'wetland', wetland: 'wetland', rainforest: 'rainforest', desert: 'desert', night: null }[art ?? 'night'];
      if (habitat) expect(habitat, a!.id).toBe(a!.home);
      if (art === 'arctic') expect(a!.side).toBe('north');
      if (art === 'antarctic') expect(a!.side).toBe('south');
      if (art === 'sea') expect(a!.water).toBe('salt');
    }
  });

  it('never puts penguins in the north or polar bears in the south', () => {
    for (const a of POLAR_ANIMALS) {
      if (a.who === 'penguin' || a.who === 'seal') expect(a.x, a.who).toBeGreaterThan(POLAR_SEA.x1);
      if (a.who === 'polar-bear' || a.who === 'arctic-fox' || a.who === 'walrus') expect(a.x, a.who).toBeLessThan(POLAR_SEA.x0);
    }
    expect(TRIP_ANIMALS.poles.filter((a) => a.who === 'penguin').length).toBe(1);
  });

  it('describes all four habitats, all open', () => {
    expect(OPEN_TRIPS).toEqual(['rainforest', 'desert', 'poles', 'wetland']);
    for (const h of Object.values(HABITAT_INFO)) expect(h.is.length).toBeGreaterThan(20);
  });
});

describe('the Rescue Center', () => {
  it('picks three different animals, mostly from the trip just finished, plus one from an earlier trip', () => {
    for (let seed = 1; seed < 30; seed++) {
      const first = pickRescues('rainforest', [], mulberry32(seed));
      expect(first.length).toBe(3);
      expect(new Set(first).size).toBe(3);
      expect(first.every((id) => animal(id).home === 'rainforest')).toBe(true);
      const second = pickRescues('desert', ['rainforest'], mulberry32(seed));
      expect(new Set(second).size).toBe(3);
      expect(second.filter((id) => animal(id).home === 'desert').length).toBe(2);
      expect(second.filter((id) => animal(id).home === 'rainforest').length).toBe(1);
      const last = pickRescues('wetland', ['rainforest', 'desert', 'poles'], mulberry32(seed));
      expect(last.filter((id) => animal(id).home === 'wetland').length).toBe(2);
    }
  });

  it('gives a gentle reason for the wrong home, naming what the animal needs', () => {
    const why = wrongHomeReason('camel', 'rainforest');
    expect(why).toMatch(/^The camel needs dry, sandy ground/);
    expect(why).toMatch(/warm and wet/);
  });

  it('builds the level 2 and 3 steps with one right answer and wrong ones from other homes', () => {
    const r = mulberry32(5);
    for (const id of JOURNAL_ORDER) {
      for (const step of [givesStep(id, r), partStep(id, r)]) {
        expect(step.choices.length).toBe(3);
        expect(step.choices.filter((c) => c.correct).length).toBe(1);
        expect(new Set(step.choices.map((c) => c.label)).size).toBe(3);
        for (const c of step.choices.filter((x) => !x.correct)) {
          expect(c.misconception).toBeTruthy();
          expect(c.why!.length).toBeGreaterThan(20);
        }
        expect(step.ask.endsWith('?')).toBe(true);
      }
    }
    expect(stepsFor('camel', 1, r).length).toBe(0);
    expect(stepsFor('camel', 2, r).map((s) => s.kind)).toEqual(['gives']);
    expect(stepsFor('camel', 3, r).map((s) => s.kind)).toEqual(['gives', 'part']);
  });
});

describe('the Night Safari', () => {
  it('has five night animals, each with its eyes inside the scene and a question with a mistake behind each wrong answer', () => {
    expect(NIGHT_ANIMALS.length).toBe(5);
    expect(new Set(NIGHT_ANIMALS.map((a) => a.id)).size).toBe(5);
    for (const a of NIGHT_ANIMALS) {
      expect(a.eyes.x).toBeGreaterThan(BEAM_R / 2);
      expect(a.eyes.x).toBeLessThan(NIGHT_W - BEAM_R / 2);
      expect(a.eyes.y).toBeGreaterThan(0);
      expect(a.eyes.y).toBeLessThan(NIGHT_H);
      expect(a.ask.endsWith('?')).toBe(true);
      expect(a.wrong.length).toBe(2);
      for (const [, mis, why] of a.wrong) {
        expect(mis).toBeTruthy();
        expect(why.toLowerCase().includes(a.right.toLowerCase())).toBe(false);
      }
    }
    expect(NIGHT_ANIMALS.find((a) => a.id === 'bat')!.wrong.some((w) => w[1] === 'bats-blind')).toBe(true);
    expect(NIGHT_ANIMALS.find((a) => a.id === 'owl')!.wrong.some((w) => w[1] === 'owl-dark')).toBe(true);
  });

  it('finds an animal only when the beam is on its eyes, and only once', () => {
    const owl = NIGHT_ANIMALS.find((a) => a.id === 'owl')!;
    expect(shineHit(owl.eyes.x, owl.eyes.y, [])?.id).toBe('owl');
    expect(shineHit(owl.eyes.x + HIT_R + 2, owl.eyes.y, [])).toBe(null);
    expect(shineHit(owl.eyes.x, owl.eyes.y, ['owl'])).toBe(null);
    expect(nearestNight(owl.eyes.x, owl.eyes.y, ['owl'])?.id).not.toBe('owl');
    expect(
      nearestNight(
        0,
        0,
        NIGHT_ANIMALS.map((a) => a.id),
      ),
    ).toBe(null);
    expect(whereIs(owl)).toMatch(/left/);
  });
});
