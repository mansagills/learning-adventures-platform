import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { Cell, parseLevel } from '../src/kit/scroller/physics';
import { CAMP, LEVELS, tempAt } from '../src/games/weather-wizard-battle/levels';
import { cast, freezes } from '../src/games/weather-wizard-battle/powers';
import { bank, makeQuestion, STATIONS, TIERS } from '../src/games/weather-wizard-battle/problems';

describe('Weather Wizard Battle questions', () => {
  it('has six questions at every level of each region, with unique ids', () => {
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

  it('keeps questions plain for grades 3 to 5: the facts first, then one question at the end', () => {
    for (const s of STATIONS)
      for (const d of bank(s)) {
        expect(d.ask.trim().endsWith('?'), d.id).toBe(true);
        expect((d.ask.match(/\?/g) ?? []).length, d.id).toBe(1);
        for (const sentence of d.ask.split(/(?<=[.?!])\s+/)) expect(sentence.split(/\s+/).length, `${d.id}: ${sentence}`).toBeLessThanOrEqual(24);
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
    // water vapor is invisible; steam is tiny drops
    expect(find('s-invisible').right).toMatch(/invisible/);
    expect(find('s-steam').wrong.find((w) => w[0] === 'Water vapor')?.[1]).toBe('vapor-visible');
    // evaporation does not need boiling; the salt stays behind; most water is salty
    expect(find('s-noboil').right).toMatch(/^No/);
    expect(find('s-salt').right).toMatch(/Salt/);
    expect(find('s-97').right).toBe('Salty');
    // clouds are tiny drops, not smoke or cotton
    expect(find('c-made').right).toMatch(/[Tt]iny drops/);
    // cold air makes snow, not the other way round
    expect(find('m-cold-air').right).toBe('Cold air makes the snow');
    expect(find('m-cold-air').wrong.find((w) => /Snow makes/.test(w[0]))?.[1]).toBe('snow-makes-cold');
    // higher is colder, not warmer for being closer to the Sun
    expect(find('m-up').wrong.find((w) => /Sun/.test(w[0]))?.[1]).toBe('closer-sun');
    // the lapse-rate sum: 10 − 6 − 6 = −2
    expect(find('m-lapse').right).toBe('About −2 °C');
    // a wizard cannot make rain from a clear sky
    expect(find('c-clear').right).toMatch(/no cloud/);
    // the fixed facts from the old game: no tornado wind record, no "snow brings cold", no hurricane bombs
    for (const d of all) expect(`${d.ask} ${d.right} ${d.explain}`).not.toMatch(/253|atomic|bombs|500 million/);
  });

  it('shows a thermometer on the side of 0 °C its answer needs', () => {
    for (const s of STATIONS)
      for (const d of bank(s)) {
        if (d.pic.k !== 'therm') continue;
        if (d.right === 'Snow') expect(d.pic.c, d.id).toBeLessThan(0);
        if (d.right === 'Rain') expect(d.pic.c, d.id).toBeGreaterThan(0);
      }
  });
});

describe('Weather Wizard Battle powers', () => {
  const spot = { temp: 10, water: false, ice: false, vapor: false, cloud: null } as const;

  it('makes no rain without a full, grey cloud', () => {
    expect(cast('rain', { ...spot }).effect).toBe('none');
    expect(cast('rain', { ...spot, cloud: 'cumulus' }).effect).toBe('none');
    expect(cast('rain', { ...spot, cloud: 'cumulus' }).say).toMatch(/not full enough/);
    expect(cast('rain', { ...spot, cloud: 'grey' }).effect).toBe('rain');
  });

  it('turns rain to snow, and lets water freeze, only below 0 °C', () => {
    expect(freezes(0)).toBe(false);
    expect(freezes(-1)).toBe(true);
    expect(cast('rain', { ...spot, cloud: 'grey', temp: -5 }).effect).toBe('snow');
    expect(cast('rain', { ...spot, cloud: 'grey', temp: 2 }).effect).toBe('rain');
    expect(cast('cold', { ...spot, water: true, temp: 2 }).effect).toBe('none');
    expect(cast('cold', { ...spot, water: true, temp: 2 }).say).toMatch(/2 °C/);
    expect(cast('cold', { ...spot, water: true, temp: -6 }).effect).toBe('freeze');
    expect(cast('cold', { ...spot, temp: -6 }).effect).toBe('none');
  });

  it('needs vapor to make a cloud, water or ice for the Sun, and a cloud for the wind', () => {
    expect(cast('cool', { ...spot, water: true }).effect).toBe('none');
    expect(cast('cool', { ...spot, vapor: true }).effect).toBe('condense');
    expect(cast('sun', { ...spot }).effect).toBe('none');
    expect(cast('sun', { ...spot, water: true }).effect).toBe('evaporate');
    expect(cast('sun', { ...spot, water: true, ice: true }).effect).toBe('melt');
    expect(cast('wind', { ...spot }).effect).toBe('none');
    expect(cast('wind', { ...spot, cloud: 'grey' }).effect).toBe('push');
  });

  it('says invisible about water vapor', () => {
    expect(cast('sun', { ...spot, water: true }).say).toMatch(/invisible/);
  });
});

describe('Weather Wizard Battle levels', () => {
  it('reads every level, with a start, a finish flag, weather vanes and droplets', () => {
    for (const l of LEVELS) {
      const lv = parseLevel(l.rows);
      const kinds = lv.things.map((t) => t.kind);
      expect(new Set(l.rows.map((r) => r.length)).size, l.id).toBe(1);
      expect(kinds.filter((k) => k === 'F').length, l.id).toBe(1);
      expect(kinds.filter((k) => k === 'C').length, l.id).toBeGreaterThanOrEqual(2);
      expect(kinds.filter((k) => k === 'D').length, l.id).toBeGreaterThanOrEqual(6);
      expect(kinds.filter((k) => k === 'R').length, l.id).toBe(1);
      expect(l.request, l.id).toBeTruthy();
      // the start and every vane stand on something solid
      for (const t of [lv.spawn, ...lv.things.filter((x) => x.kind === 'C' || x.kind === 'F')]) {
        const below = lv.map.get(t.x, t.y + 1);
        expect(below === Cell.Solid || below === Cell.Ice, `${l.id} at ${t.x},${t.y}`).toBe(true);
      }
    }
  });

  it('gives each level only the powers learned so far, in order', () => {
    const order = ['sun', 'cool', 'wind', 'rain', 'cold'];
    let have = 0;
    for (const l of LEVELS) {
      expect(l.powers, l.id).toEqual(order.slice(0, l.powers.length));
      expect(l.powers.length, l.id).toBeGreaterThanOrEqual(have);
      have = l.powers.length;
    }
  });

  it('only asks for powers the level has', () => {
    for (const l of LEVELS) {
      const kinds = parseLevel(l.rows).things.map((t) => t.kind);
      if (kinds.includes('T')) expect(l.powers).toContain('sun');
      if (kinds.includes('G') || kinds.includes('S')) expect(l.powers).toContain('rain');
      if (kinds.includes('W')) expect(l.powers).toContain('cold');
      if (kinds.includes('B') || kinds.includes('Z')) expect(l.powers).toContain('sun');
    }
  });

  it('puts the mountain water to freeze below 0 °C and the water too warm to freeze above it', () => {
    const m1 = LEVELS.find((l) => l.id === 'mountain-1')!;
    expect(tempAt(m1, 36)).toBeGreaterThan(0); // the pond: use a cloud
    expect(tempAt(m1, 62)).toBeLessThan(0); // the river: freeze it
    expect(tempAt(m1, 81)).toBeLessThan(0); // the waterfall
    const m2 = LEVELS.find((l) => l.id === 'mountain-2')!;
    expect(tempAt(m2, 21)).toBeLessThan(0);
    expect(tempAt(m2, 66)).toBeGreaterThan(0);
  });

  it('has a camp with the three hosts and the map', () => {
    const kinds = parseLevel(CAMP.rows).things.map((t) => t.kind);
    for (const k of ['N', 'J', 'A', 'X']) expect(kinds).toContain(k);
  });
});
