import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { bank, FACTS, makeQuestion, OPEN_STATIONS, PLANET_ORDER, STATIONS, stopBank, stopQuestion, TIERS, type Question, type QDef } from '../src/games/solar-system-explorer/problems';
import { DIAL, launch, ORBIT_R, SHOT_SPEED } from '../src/games/solar-system-explorer/physics';

/** Every question, built once (stations and planet stops). */
function all(): Question[] {
  const out: Question[] = [];
  for (const s of OPEN_STATIONS) for (const d of bank(s)) out.push(makeQuestion(s, d.tier, mulberry32(1), bank(s).filter((x) => x.id !== d.id).map((x) => x.id)));
  for (const p of PLANET_ORDER) for (const t of TIERS) out.push(stopQuestion(p, t, mulberry32(2)));
  return out;
}

const words = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);

describe('Solar System Explorer questions', () => {
  it('each open station has at least 6 questions at every level, with unique ids', () => {
    const ids = new Set<string>();
    for (const s of OPEN_STATIONS) {
      for (const t of TIERS) expect(bank(s).filter((d) => d.tier === t).length, `${s} level ${t}`).toBeGreaterThanOrEqual(6);
      for (const d of bank(s)) {
        expect(ids.has(d.id), d.id).toBe(false);
        ids.add(d.id);
        expect(d.id.startsWith(s)).toBe(true);
      }
    }
  });

  it('every planet has a fact card and one stop question at each level', () => {
    expect(PLANET_ORDER).toEqual(['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']);
    for (const p of PLANET_ORDER) {
      const f = FACTS[p];
      for (const v of [f.name, f.distance, f.spin, f.year, f.moons, f.sample, f.fact]) expect(v.length).toBeGreaterThan(0);
      expect(f.stop).toBe(['jupiter', 'saturn', 'uranus', 'neptune'].includes(p) ? 'dive' : 'surface');
      for (const t of TIERS) expect(stopBank(p).filter((d) => d.tier === t)).toHaveLength(1);
      for (const d of stopBank(p)) expect(d.id.startsWith(`stop-${p}`)).toBe(true);
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
      expect(q.ask.split('?').length, q.id).toBe(2);
      for (const sentence of q.ask.split(/[.?!:]\s/)) expect(words(sentence).length, `${q.id}: ${sentence}`).toBeLessThanOrEqual(18);
    }
  });

  it('no hint before the last one, and no wrong-answer sentence, names the right answer', () => {
    for (const q of all()) {
      const right = q.choices.find((c) => c.correct)!.label.toLowerCase().replace(/[.]$/, '');
      for (const h of q.hints) expect(h.toLowerCase().includes(right), `${q.id}: ${h}`).toBe(false);
      for (const c of q.choices.filter((x) => !x.correct)) expect((c.why ?? '').toLowerCase().includes(right), `${q.id}: ${c.why}`).toBe(false);
    }
  });

  it('a question never names its own answer (the stop question on Venus does not say "Venus")', () => {
    for (const q of all()) {
      const right = q.choices.find((c) => c.correct)!.label.toLowerCase().replace(/[.]$/, '');
      if (right.split(' ').length <= 2) expect(q.ask.toLowerCase().includes(right), `${q.id}`).toBe(false);
    }
  });

  it('orrery order pictures match their answers (the glowing ring is the next planet)', () => {
    const names = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
    for (const d of bank('orrery') as QDef[])
      if (d.pic.k === 'orrery' && d.pic.glow !== undefined) {
        expect(d.pic.glow, d.id).toBe(d.pic.placed);
        expect(d.right, d.id).toBe(names[d.pic.glow]);
      }
  });

  it('keeps facts that are easy to get wrong right (checked against NASA)', () => {
    const text = [...OPEN_STATIONS.flatMap((s) => bank(s)), ...PLANET_ORDER.flatMap((p) => stopBank(p))].map((d) => `${d.ask} ${d.right} ${d.explain} ${d.hints.join(' ')} ${d.wrong.map((w) => w[0] + ' ' + w[2]).join(' ')}`).join(' ');
    // the old games' mistakes must not come back
    expect(text).not.toMatch(/400 years/);
    expect(text).not.toMatch(/3 times taller|three times taller/i);
    expect(text).not.toMatch(/\b95\+|\b146\b/);
    // Mercury's speed comes from the Sun's pull, and a short path is a wrong answer
    const fast = (bank('orrery') as QDef[]).find((d) => d.id === 'orrery-fastest')!;
    expect(fast.right).toMatch(/pull/);
    expect(fast.wrong.map((w) => w[0])).toContain('It has the shortest path.');
    // Uranus: "spins backwards" is true, so it is never offered as a wrong answer
    for (const d of [...bank('orrery'), ...stopBank('uranus')]) for (const w of d.wrong) expect(w[0]).not.toMatch(/backwards/i);
  });

  it('uses names, not "he" or "she"', () => {
    for (const q of all()) {
      const text = [q.ask, q.explain, ...q.hints, ...q.choices.map((c) => `${c.label} ${c.why ?? ''}`)].join(' ');
      expect(text, q.id).not.toMatch(/\b(he|she|him|her|his|hers)\b/i);
    }
  });

  it('shows every question of a level before repeating one, and moves the right answer around', () => {
    for (const s of OPEN_STATIONS)
      for (const t of TIERS) {
        const pool = bank(s).filter((d) => d.tier === t);
        const r = mulberry32(7);
        const seen: string[] = [];
        for (let i = 0; i < pool.length; i++) seen.push(makeQuestion(s, t, r, seen).id);
        expect(new Set(seen).size).toBe(pool.length);
      }
    const spots = new Set<number>();
    const r = mulberry32(3);
    for (let i = 0; i < 30; i++) spots.add(makeQuestion('orrery', 1, r).choices.findIndex((c) => c.correct));
    expect(spots.size).toBe(3);
  });

  it('all four stations are open', () => {
    expect(OPEN_STATIONS).toEqual(STATIONS);
  });

  it('the Star Dome and the Launch Bay keep the tricky facts right', () => {
    const right = (s: 'dome' | 'launch', id: string) => (bank(s) as QDef[]).find((d) => d.id === id)!;
    // the Sun is a middle-sized star that looks big because it is close; "the biggest star" is only ever a wrong answer
    for (const d of bank('dome')) expect(d.right, d.id).not.toMatch(/biggest star/i);
    expect(right('dome', 'dome-why-big').right).toMatch(/closer/);
    // the Moon and the planets shine with reflected sunlight
    expect(right('dome', 'dome-moon-shine').right).toMatch(/sunlight/i);
    // the seasons come from the tilt, not the distance (Earth is closest in early January)
    expect(right('launch', 'launch-seasons').right).toMatch(/tilt/);
    expect(right('launch', 'launch-seasons').wrong.map((w) => w[1])).toContain('season-distance');
    // astronauts float because they are falling round Earth; "no gravity in space" is only ever a wrong answer
    expect(right('launch', 'launch-astronauts').right).toMatch(/falling/);
    for (const d of [...bank('dome'), ...bank('launch')]) expect(d.right, d.id).not.toMatch(/no gravity/i);
    // down points to the middle of Earth everywhere
    expect(right('launch', 'launch-bottom').right).toMatch(/middle/);
  });

  it('every Star Dome and Launch Bay question has a picture for hint 2 (a model, or a change to its picture)', () => {
    // the hint picture each picture kind can show, by model (the game draws these)
    const shows: Record<string, string[]> = {
      lamps: ['lamps'],
      starsky: ['daysky', 'lamps'],
      season: ['seasons'],
      moonlight: ['moonlight', 'paths'],
      cannon: ['paths'],
      down: ['down'],
      tilt: ['tilt'],
      planet: ['lamps', 'card'],
      orrery: ['years', 'order'],
    };
    for (const d of [...bank('dome'), ...bank('launch')] as QDef[]) expect(shows[d.pic.k] ?? [], `${d.id}: ${d.pic.k} + ${d.model}`).toContain(d.model);
  });

  it('the cannon pictures match their questions (the orbit questions show an orbit)', () => {
    for (const d of bank('launch') as QDef[]) {
      if (d.pic.k !== 'cannon') continue;
      const text = `${d.ask} ${d.right}`.toLowerCase();
      if (d.pic.shot === 'orbit') expect(text, d.id).toMatch(/orbit|around|float/);
      if (d.pic.shot === 'slow') expect(text, d.id).toMatch(/slow/);
      if (d.pic.shot === 'escape') expect(text, d.id).toMatch(/super fast|flies off/);
    }
  });
});

describe('Tess’s cannon (real gravity)', () => {
  it('a slow shot lands, a just-right shot orbits, a super fast one flies away', () => {
    expect(launch(SHOT_SPEED.slow).outcome).toBe('land');
    expect(launch(SHOT_SPEED.orbit).outcome).toBe('orbit');
    expect(launch(SHOT_SPEED.escape).outcome).toBe('escape');
  });

  it('the dial goes from landing, to orbits, to flying away, in order', () => {
    expect(DIAL.map((v) => launch(v).outcome)).toEqual(['land', 'land', 'land', 'orbit', 'orbit', 'escape']);
  });

  it('the just-right speed makes a circle that stays at the mountain top', () => {
    for (const [x, y] of launch(1).path) expect(Math.abs(Math.hypot(x, y) - ORBIT_R)).toBeLessThan(0.01);
  });

  it('a landing ends on the ground, and every path starts at the cannon', () => {
    const f = launch(SHOT_SPEED.slow);
    const [x, y] = f.path[f.path.length - 1];
    expect(Math.hypot(x, y)).toBeCloseTo(1, 5);
    expect(f.path[0]).toEqual([0, -ORBIT_R]);
  });
});
