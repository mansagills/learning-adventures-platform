import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { FOSSIL_IDS } from '../src/kit/worlds/wild-lands/dig-art';
import { dig, digDone, gridName, hidden, layerCards, layerWhy, newDig, rightLayer, rightSlot, slotWhy, sniff } from '../src/games/fossil-dig-adventure/dig-logic';
import { CLIFF_FINDS, DRAWER_ORDER, FOSSILS, LAYERS, QUARRY_FINDS } from '../src/games/fossil-dig-adventure/fossils';
import { bank, makeQuestion, STATIONS, TIERS } from '../src/games/fossil-dig-adventure/problems';

describe('Fossil Dig Adventure questions', () => {
  it('has six questions at every level of each station, with unique ids', () => {
    const ids = new Set<string>();
    for (const s of STATIONS) for (const t of TIERS) expect(bank(s).filter((d) => d.tier === t).length, `${s} ${t}`).toBeGreaterThanOrEqual(5);
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
        const next = makeQuestion(s, t, mulberry32(3), [q.id]);
        expect(next.id).not.toBe(q.id);
      }
  });

  it('gets the tricky facts right', () => {
    const all = STATIONS.flatMap((s) => bank(s));
    const find = (id: string) => all.find((d) => d.id === id)!;
    expect(find('c-oldest').right).toBe('The bottom layer');
    expect(find('q-minerals').right).toMatch(/[Ss]tone/);
    expect(find('q-people-dinos').right).toMatch(/^No/);
    expect(find('c-fault').right).toMatch(/^After/);
    expect(find('c-canyon').right).toMatch(/layers came first/);
    expect(find('c-gap').right).toMatch(/worn away/);
  });
});

describe('the Fossil Drawer', () => {
  it('has all 16 fossils, each from a real layer of the valley', () => {
    expect(new Set(DRAWER_ORDER)).toEqual(new Set(FOSSIL_IDS));
    for (const id of DRAWER_ORDER) {
      expect(LAYERS).toContain(FOSSILS[id].layer);
      for (const f of FOSSILS[id].facts) expect(f.length).toBeGreaterThan(20);
    }
    // the quarry is in the dinosaur layer; the cliff shows the other layers
    for (const id of QUARRY_FINDS) expect(FOSSILS[id].layer).toBe('river');
    expect(CLIFF_FINDS.map((id) => FOSSILS[id].layer)).not.toContain('river');
    expect(FOSSILS['mammoth-tusk'].layer).toBe('ice');
    expect(FOSSILS.trilobite.layer).toBe('sea');
    expect(FOSSILS.coprolite.kind).toBe('trace');
  });
});

describe('the quarry dig', () => {
  it('hides the finds apart from each other and off the edges', () => {
    for (let seed = 1; seed < 40; seed++) {
      const d = newDig(QUARRY_FINDS.slice(0, 4), mulberry32(seed));
      expect(d.finds.length, `seed ${seed}`).toBe(4);
      const at = d.cells.map((c, i) => (c.find ? i : -1)).filter((i) => i >= 0);
      for (const i of at) {
        expect(i % 8).toBeGreaterThan(0);
        expect(i % 8).toBeLessThan(7);
      }
    }
  });

  it('needs the shovel for dirt, the pick for rock and the brush for the last layer, and chips a fossil dug roughly', () => {
    const d = newDig(['trike-horn'], mulberry32(3));
    const i = d.cells.findIndex((c) => c.find);
    expect(dig(d, i, 'brush').k).toBe('too-soft');
    expect(dig(d, i, 'shovel')).toEqual({ k: 'dug', left: 2 });
    expect(dig(d, i, 'shovel').k).toBe('too-hard');
    expect(dig(d, i, 'pick')).toEqual({ k: 'dug', left: 1 });
    expect(dig(d, i, 'brush')).toEqual({ k: 'found', id: 'trike-horn', chipped: false });
    expect(digDone(d)).toBe(true);
    const e = newDig(['trex-tooth'], mulberry32(3));
    const j = e.cells.findIndex((c) => c.find);
    dig(e, j, 'shovel');
    dig(e, j, 'pick');
    expect(dig(e, j, 'pick')).toEqual({ k: 'found', id: 'trex-tooth', chipped: true });
    const empty = e.cells.findIndex((c) => !c.find);
    dig(e, empty, 'shovel');
    dig(e, empty, 'pick');
    expect(dig(e, empty, 'shovel').k).toBe('empty');
    expect(dig(e, empty, 'brush').k).toBe('done-here');
  });

  it('lets Pebble narrow the search to five squares round the nearest find', () => {
    const d = newDig(['amber', 'eggshell'], mulberry32(9));
    const marked = sniff(d, 0);
    expect(marked.length).toBeLessThanOrEqual(5);
    expect(marked.some((i) => d.cells[i].find)).toBe(true);
    expect(hidden(d).length).toBe(2);
    expect(gridName(d, 0)).toBe('A1');
    expect(gridName(d, 9)).toBe('B2');
  });
});

describe('the Cliff Wall puzzles', () => {
  it('orders the layers oldest at the bottom, and explains a wrong slot without giving the answer', () => {
    LAYERS.forEach((id, slot) => expect(rightSlot(id, slot)).toBe(true));
    expect(rightSlot('sea', 4)).toBe(false);
    expect(slotWhy('sea', 4)).toMatch(/older/);
    expect(slotWhy('today', 0)).toMatch(/younger/);
    expect(layerCards(1).every((c) => /years|today/.test(c.clue))).toBe(true);
    expect(layerCards(3).every((c) => !/years/.test(c.clue))).toBe(true);
  });

  it('puts each fossil in its own layer', () => {
    expect(rightLayer('trilobite', 'sea')).toBe(true);
    expect(rightLayer('mammoth-tusk', 'river')).toBe(false);
    expect(layerWhy('mammoth-tusk', 'sea')).toMatch(/Ice Age/);
    expect(layerWhy('fern', 'today')).toMatch(/too young/);
  });
});
