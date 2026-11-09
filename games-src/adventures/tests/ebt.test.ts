import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/kit/core/rng';
import { PIECE_IDS, type Ground, type PieceId } from '../src/kit/worlds/wild-lands/eco-art';
import { ISLAND_INFO, PIECE_FACT, RULE_TEXT, TROUBLE_TEXT, UPGRADES } from '../src/games/ecosystem-building-tycoon/content';
import { bank, makeQuestion, STATIONS, TIERS } from '../src/games/ecosystem-building-tycoon/problems';
import { ruleDeltas } from '../src/games/ecosystem-building-tycoon/board';
import {
  BREAKS_DOWN,
  bestMove,
  canPlace,
  census,
  dealHand,
  deck,
  diagnose,
  EATS,
  emptyBoard,
  HABITAT,
  ISLAND_KINDS,
  makeIsland,
  place,
  role,
  RUNS,
  score,
  spotsFor,
  spreadVines,
  UNLOCK_ORDER,
  UPGRADE_IDS,
  VINE_EVERY,
  dropLeaves,
  droughtCells,
  DROUGHT_SEASONS,
  endDrought,
  HOME_KINDS,
  seasonName,
  sizeOf,
  startDrought,
  type Board,
  type Island,
  type IslandKind,
  type Rule,
  type RunLength,
} from '../src/games/ecosystem-building-tycoon/rules';
import { cleanSave, freshSave } from '../src/games/ecosystem-building-tycoon/save';
import { checkArrow, webLinksAmong } from '../src/games/ecosystem-building-tycoon/guide';

/** A small test island: every square grass unless the map says otherwise (w water, m mud, s sand, r rich soil, k rock). */
function island(rows: string[]): Board {
  const map: Record<string, Ground> = { g: 'grass', w: 'water', m: 'mud', s: 'sand', r: 'rich', k: 'rock', o: 'soil' };
  const is: Island = {
    kind: 'meadow',
    w: rows[0].length,
    h: rows.length,
    ground: rows
      .join('')
      .split('')
      .map((c) => map[c] ?? null),
  };
  return emptyBoard(is);
}

/** Put tiles down by [x, y]. */
function put(b: Board, ...tiles: Array<[PieceId, number, number]>): Board {
  for (const [id, x, y] of tiles) b = place(b, id, y * b.island.w + x);
  return b;
}

const pts = (b: Board, x: number, y: number) => score(b).pieces.find((p) => p.i === y * b.island.w + x)!;
const has = (b: Board, x: number, y: number, rule: Rule) => pts(b, x, y).reasons.some((r) => r.rule === rule);
const bonus = (b: Board, rule: Rule) => score(b).bonuses.filter((x) => x.rule === rule);

describe('the living things (checked against the science)', () => {
  it('every eater eats something that is in the game, plant-eaters eat plants and hunters eat animals', () => {
    for (const [id, foods] of Object.entries(EATS) as Array<[PieceId, PieceId[]]>) {
      expect(foods.length).toBeGreaterThan(0);
      for (const f of foods) expect(PIECE_IDS).toContain(f);
      const r = role(id);
      if (r === 'herbivore') for (const f of foods) expect(role(f)).toBe('producer');
      if (r === 'carnivore') for (const f of foods) expect(role(f)).not.toBe('producer');
      if (r === 'omnivore') {
        expect(foods.some((f) => role(f) === 'producer')).toBe(true);
        expect(foods.some((f) => role(f) !== 'producer')).toBe(true);
      }
    }
  });
  it('plants and decomposers eat nothing; every animal has food', () => {
    for (const id of PIECE_IDS) {
      const r = role(id);
      if (r === 'producer' || r === 'decomposer' || r === 'feature' || r === 'invasive') expect(EATS[id]).toBeUndefined();
      if (r === 'herbivore' || r === 'carnivore' || r === 'omnivore') expect(EATS[id]).toBeDefined();
      if (r === 'decomposer') expect(BREAKS_DOWN[id]?.length).toBeGreaterThan(0);
    }
  });
  it('the heron is the top predator: nothing eats it', () => {
    for (const foods of Object.values(EATS)) expect(foods).not.toContain('heron');
  });
  it('every tile has a fact, and every rule, upgrade and trouble has words', () => {
    for (const id of PIECE_IDS) expect(PIECE_FACT[id].length).toBeGreaterThan(20);
    const rules: Rule[] = [
      'sun',
      'big-tree',
      'water',
      'rich-ground',
      'rich-soil',
      'pollination',
      'shaded',
      'fed',
      'both-foods',
      'hungry',
      'decompose',
      'idle',
      'shelter',
      'reed-cover',
      'invasive',
      'food-chain',
      'circle',
      'too-many-eaters',
      'too-many-hunters',
      'litter',
    ];
    for (const r of rules) expect(RULE_TEXT[r].tip.length).toBeGreaterThan(10);
    for (const u of UPGRADE_IDS) expect(UPGRADES[u].science.length).toBeGreaterThan(20);
    for (const t of Object.keys(TROUBLE_TEXT)) expect(TROUBLE_TEXT[t as keyof typeof TROUBLE_TEXT].length).toBeGreaterThan(20);
  });
});

describe('where tiles can go', () => {
  const b = island(['gwms', 'kgrg']);
  it('land tiles on grass, soil, rich soil and mud; not on water, sand or rock', () => {
    expect(canPlace(b, 'rabbit', 0)).toBe(true);
    expect(canPlace(b, 'rabbit', 1)).toBe(false);
    expect(canPlace(b, 'rabbit', 2)).toBe(true);
    expect(canPlace(b, 'rabbit', 3)).toBe(false);
    expect(canPlace(b, 'rabbit', 4)).toBe(false);
  });
  it('pond tiles in the water; edge tiles in the water or the mud; logs on any dry square', () => {
    expect(canPlace(b, 'fish', 1)).toBe(true);
    expect(canPlace(b, 'fish', 2)).toBe(false);
    expect(canPlace(b, 'frog', 2)).toBe(true);
    expect(canPlace(b, 'frog', 0)).toBe(false);
    expect(canPlace(b, 'log', 3)).toBe(true);
    expect(canPlace(b, 'log', 4)).toBe(true);
    expect(canPlace(b, 'log', 1)).toBe(false);
  });
  it('one tile per square', () => {
    const c = put(b, ['grass', 0, 0]);
    expect(canPlace(c, 'rabbit', 0)).toBe(false);
    expect(() => place(c, 'rabbit', 0)).toThrow();
  });
  it('every tile has a habitat', () => {
    for (const id of PIECE_IDS) expect(HABITAT[id]).toBeDefined();
  });
});

describe('scoring: plants', () => {
  it('a plant makes its own food from sunlight', () => {
    const b = put(island(['ggg']), ['grass', 1, 0]);
    expect(has(b, 1, 0, 'sun')).toBe(true);
    expect(score(b).total).toBe(1);
  });
  it('a land plant next to water grows better; on rich ground too', () => {
    const b = put(island(['wgr']), ['grass', 1, 0], ['flowers', 2, 0]);
    expect(has(b, 1, 0, 'water')).toBe(true);
    expect(has(b, 2, 0, 'rich-ground')).toBe(true);
    expect(has(b, 2, 0, 'water')).toBe(false);
  });
  it('an oak makes more food than grass', () => {
    const b = put(island(['ggg']), ['oak', 0, 0], ['grass', 2, 0]);
    expect(pts(b, 0, 0).pts).toBeGreaterThan(pts(b, 2, 0).pts);
  });
  it('pollination: flowers and berry bushes next to a bee or butterfly; grass is not pollinated by insects here', () => {
    const b = put(island(['gggg']), ['flowers', 0, 0], ['bee', 1, 0], ['berries', 2, 0], ['grass', 3, 0]);
    expect(has(b, 0, 0, 'pollination')).toBe(true);
    expect(has(b, 2, 0, 'pollination')).toBe(true);
    expect(has(b, 3, 0, 'pollination')).toBe(false);
  });
  it('the invasive vine shades the plants next to it', () => {
    const b = put(island(['ggg']), ['grass', 0, 0], ['vine', 1, 0]);
    expect(has(b, 0, 0, 'shaded')).toBe(true);
    expect(has(b, 1, 0, 'invasive')).toBe(true);
  });
});

describe('scoring: animals and food chains', () => {
  it('a plant-eater scores only next to a plant it really eats', () => {
    const fed = put(island(['ggg']), ['grass', 0, 0], ['rabbit', 1, 0]);
    expect(has(fed, 1, 0, 'fed')).toBe(true);
    const lonely = put(island(['ggg']), ['rabbit', 1, 0]);
    expect(has(lonely, 1, 0, 'hungry')).toBe(true);
    expect(pts(lonely, 1, 0).pts).toBe(0);
    // a rabbit does not eat berries in this game; a mouse does
    const b = put(island(['ggg']), ['berries', 0, 0], ['rabbit', 1, 0], ['mouse', 2, 0]);
    expect(has(b, 1, 0, 'hungry')).toBe(true);
  });
  it('a meat-eater needs prey next to it, not plants', () => {
    const b = put(island(['ggg']), ['grass', 0, 0], ['fox', 1, 0]);
    expect(has(b, 1, 0, 'hungry')).toBe(true);
    const c = put(island(['ggg']), ['rabbit', 0, 0], ['fox', 1, 0]);
    expect(has(c, 1, 0, 'fed')).toBe(true);
  });
  it('grass, rabbit, fox in a row make a food chain bonus, with arrows from food to eater', () => {
    const b = put(island(['ggg']), ['grass', 0, 0], ['rabbit', 1, 0], ['fox', 2, 0]);
    expect(bonus(b, 'food-chain')).toHaveLength(1);
    expect(bonus(b, 'food-chain')[0].cells).toEqual([0, 1, 2]);
    const links = score(b).links;
    expect(links).toContainEqual({ from: 0, to: 1, kind: 'eat' });
    expect(links).toContainEqual({ from: 1, to: 2, kind: 'eat' });
  });
  it('no chain when the plant-eater has nothing to eat', () => {
    const b = put(island(['ggg']), ['rabbit', 1, 0], ['fox', 2, 0]);
    expect(bonus(b, 'food-chain')).toHaveLength(0);
  });
  it('the pond chain: lily pad, snail, fish, heron', () => {
    const b = put(island(['wwww']), ['lilies', 0, 0], ['snail', 1, 0], ['fish', 2, 0], ['heron', 3, 0]);
    expect(has(b, 1, 0, 'fed')).toBe(true);
    expect(has(b, 2, 0, 'fed')).toBe(true);
    expect(has(b, 3, 0, 'fed')).toBe(true);
    expect(bonus(b, 'food-chain').length).toBeGreaterThanOrEqual(1);
  });
  it('a duck is an omnivore: plant food and animal food score a little more', () => {
    const b = put(island(['www']), ['lilies', 0, 0], ['duck', 1, 0], ['snail', 2, 0]);
    expect(has(b, 1, 0, 'both-foods')).toBe(true);
    const c = put(island(['www']), ['lilies', 0, 0], ['duck', 1, 0]);
    expect(has(c, 1, 0, 'both-foods')).toBe(false);
  });
  it('hawks and owls hunt from two squares away only with the Hawk Eyes research', () => {
    const b = put(island(['ggg']), ['mouse', 0, 0], ['owl', 2, 0]);
    expect(has(b, 2, 0, 'hungry')).toBe(true);
    expect(
      score(b, ['hawk-eye'])
        .pieces.find((p) => p.i === 2)!
        .reasons.some((r) => r.rule === 'fed'),
    ).toBe(true);
    const fox = put(island(['ggg']), ['mouse', 0, 0], ['fox', 2, 0]);
    expect(
      score(fox, ['hawk-eye'])
        .pieces.find((p) => p.i === 2)!
        .reasons.some((r) => r.rule === 'hungry'),
    ).toBe(true);
  });
  it('small animals shelter in a rock pile', () => {
    const b = put(island(['ggg']), ['mouse', 0, 0], ['stones', 1, 0]);
    expect(has(b, 1, 0, 'shelter')).toBe(true);
  });
});

describe('scoring: decomposers and the circle of life', () => {
  it('mushrooms need something dead to break down', () => {
    const idle = put(island(['ggg']), ['mushrooms', 1, 0]);
    expect(has(idle, 1, 0, 'idle')).toBe(true);
    const busy = put(island(['ggg']), ['mushrooms', 1, 0], ['log', 0, 0]);
    expect(has(busy, 1, 0, 'decompose')).toBe(true);
  });
  it('a working decomposer makes rich soil for the plants next to it', () => {
    const b = put(island(['ggg']), ['log', 0, 0], ['worms', 1, 0], ['grass', 2, 0]);
    expect(has(b, 2, 0, 'rich-soil')).toBe(true);
    const c = put(island(['ggg']), ['worms', 1, 0], ['grass', 2, 0]);
    expect(has(c, 2, 0, 'rich-soil')).toBe(false);
  });
  it('a dung beetle needs a big plant-eater (its dung), not a log', () => {
    const b = put(island(['ggg']), ['beetle', 1, 0], ['log', 0, 0]);
    expect(has(b, 1, 0, 'idle')).toBe(true);
    const c = put(island(['ggg']), ['beetle', 1, 0], ['deer', 0, 0]);
    expect(has(c, 1, 0, 'decompose')).toBe(true);
  });
  it('the circle of life: a food chain plus a decomposer making soil for a plant', () => {
    const b = put(island(['gggg', 'gggg']), ['grass', 0, 0], ['rabbit', 1, 0], ['fox', 2, 0], ['log', 0, 1], ['mushrooms', 1, 1]);
    expect(bonus(b, 'circle')).toHaveLength(1);
    const noChain = put(island(['gggg', 'gggg']), ['grass', 0, 0], ['rabbit', 1, 0], ['log', 0, 1], ['mushrooms', 1, 1]);
    expect(bonus(noChain, 'circle')).toHaveLength(0);
  });
  it('the Compost research makes rich soil worth more', () => {
    const b = put(island(['ggg']), ['log', 0, 0], ['worms', 1, 0], ['grass', 2, 0]);
    expect(score(b, ['compost']).total).toBe(score(b).total + 1);
  });
});

describe('scoring: balance (the energy pyramid)', () => {
  it('more plant-eaters than plants costs points', () => {
    const b = put(island(['gggg']), ['grass', 0, 0], ['rabbit', 1, 0], ['mouse', 2, 0], ['deer', 3, 0]);
    const t = bonus(b, 'too-many-eaters');
    expect(t).toHaveLength(1);
    expect(t[0].pts).toBe(-4);
  });
  it('more hunters than plant-eaters costs points', () => {
    const b = put(island(['gggg']), ['grass', 0, 0], ['rabbit', 1, 0], ['fox', 2, 0], ['hawk', 3, 0]);
    expect(bonus(b, 'too-many-hunters')[0].pts).toBe(-2);
  });
  it('the census counts each kind of living thing', () => {
    const b = put(island(['ggggg']), ['grass', 0, 0], ['rabbit', 1, 0], ['fox', 2, 0], ['worms', 3, 0], ['vine', 4, 0]);
    expect(census(b)).toEqual({ plants: 1, plantEaters: 1, hunters: 1, decomposers: 1, vines: 1 });
  });
  it('health is never below zero', () => {
    const b = put(island(['ggg']), ['fox', 0, 0], ['hawk', 1, 0], ['vine', 2, 0]);
    expect(score(b).total).toBe(0);
  });
});

describe('the invasive vine', () => {
  it('creeps one square at a time onto empty land', () => {
    const b = put(island(['gggg']), ['vine', 0, 0]);
    const { board, spread } = spreadVines(b);
    expect(spread).toEqual([1]);
    expect(board.pieces.filter((p) => p === 'vine')).toHaveLength(2);
  });
  it('two native plants next to it crowd it out', () => {
    const b = put(island(['ggg', 'ggg']), ['vine', 1, 0], ['grass', 0, 0], ['flowers', 2, 0]);
    expect(spreadVines(b).spread).toEqual([]);
  });
  it('does not grow into the water or the mud', () => {
    const b = put(island(['gwm']), ['vine', 0, 0]);
    expect(spreadVines(b).spread).toEqual([]);
  });
});

describe('islands', () => {
  for (const kind of ISLAND_KINDS)
    it(`${kind} islands: the same seed makes the same island, with enough room`, () => {
      for (let s = 1; s <= 40; s++) {
        const a = makeIsland(kind, mulberry32(s * 101));
        const b = makeIsland(kind, mulberry32(s * 101));
        expect(a).toEqual(b);
        const land = a.pieces.map((_, i) => i).filter((i) => canPlace(a, 'rabbit', i)).length;
        const water = a.pieces.map((_, i) => i).filter((i) => canPlace(a, 'fish', i)).length;
        expect(land + water).toBeGreaterThanOrEqual(RUNS[kind].long.seasons + 6);
        if (kind === 'pond') expect(water).toBeGreaterThanOrEqual(7);
        if (kind === 'meadow') expect(a.pieces).toContain('vine');
        // the edge of the grid is sea or beach
        for (let i = 0; i < a.pieces.length; i++) {
          const x = i % a.island.w;
          const y = Math.floor(i / a.island.w);
          if (x === 0 || y === 0 || x === a.island.w - 1 || y === a.island.h - 1) expect([null, 'sand']).toContain(a.island.ground[i]);
        }
      }
    });
});

describe('the hand', () => {
  it('three different tiles that can all be placed, with a plant and an animal', () => {
    for (let s = 1; s <= 60; s++) {
      const r = mulberry32(s);
      const kind: IslandKind = s % 2 ? 'meadow' : 'pond';
      const b = makeIsland(kind, r);
      const hand = dealHand(b, deck(kind, []), 3, r);
      expect(hand).toHaveLength(3);
      expect(new Set(hand).size).toBe(3);
      for (const id of hand) expect(spotsFor(b, id).length).toBeGreaterThan(0);
      expect(hand.some((id) => role(id) === 'producer')).toBe(true);
      expect(hand.some((id) => !!EATS[id])).toBe(true);
    }
  });
  it('four tiles with the Field team research', () => {
    const r = mulberry32(9);
    const b = makeIsland('meadow', r);
    expect(dealHand(b, deck('meadow', []), 4, r)).toHaveLength(4);
  });
  it('unlocked tiles join both islands; the meadow has no pond tiles', () => {
    expect(deck('meadow', [])).not.toContain('owl');
    expect(deck('meadow', ['owl'])).toContain('owl');
    expect(deck('pond', ['owl'])).toContain('owl');
    expect(deck('meadow', UNLOCK_ORDER).some((id) => HABITAT[id] === 'water')).toBe(false);
  });
});

/** Play a run the way Bramble suggests (the best move each season), changing the hand when nothing helps. Returns the targets reached. */
function playRun(kind: IslandKind, length: RunLength, seed: number, careful: boolean, unlocked: PieceId[] = []): number {
  const r = mulberry32(seed);
  let b = makeIsland(kind, r);
  const spec = RUNS[kind][length];
  let rerolls = spec.rerolls;
  let reached = 0;
  let dry: number[] = [];
  let dryLeft = 0;
  for (let s = 1; s <= spec.seasons; s++) {
    let hand = dealHand(b, deck(kind, unlocked), 3, r);
    if (careful) {
      let m = bestMove(b, hand);
      if (m && m.gain <= 1 && rerolls > 0) {
        rerolls--;
        hand = dealHand(b, deck(kind, unlocked), 3, r);
        m = bestMove(b, hand);
      }
      if (m) b = place(b, hand[m.card], m.cell);
    } else {
      const id = hand[Math.floor(r() * hand.length)];
      const spots = spotsFor(b, id);
      b = place(b, id, spots[Math.floor(r() * spots.length)]);
    }
    if (s % VINE_EVERY === 0) b = spreadVines(b).board;
    if (seasonName(s) === 'Autumn') b = dropLeaves(b).board;
    // the drought, in the same order as the game (it starts at the end of its season and lasts DROUGHT_SEASONS seasons)
    if (dryLeft > 0) {
      dryLeft--;
      if (dryLeft === 0) b = endDrought(b, dry);
    } else if (spec.drought && s === spec.drought) {
      dry = droughtCells(b.island);
      b = startDrought(b).board;
      dryLeft = DROUGHT_SEASONS;
    }
    const t = spec.targets[reached];
    if (t && s === t.season) {
      if (score(b).total < t.health) return reached;
      reached++;
    }
  }
  return reached;
}

describe('half 2: autumn leaves, leaf piles, hunters and the drought', () => {
  it('in autumn an oak drops its leaves next to it', () => {
    const b = put(island(['ggg']), ['oak', 1, 0]);
    const { board, fell } = dropLeaves(b);
    expect(fell).toHaveLength(1);
    expect(board.pieces[fell[0]]).toBe('leaves');
  });
  it('fallen leaves that no decomposer is breaking down pile up and cost a point', () => {
    const b = put(island(['ggg']), ['leaves', 0, 0]);
    expect(has(b, 0, 0, 'litter')).toBe(true);
    const c = put(island(['ggg']), ['leaves', 0, 0], ['worms', 1, 0]);
    expect(has(c, 0, 0, 'litter')).toBe(false);
    // a dung beetle does not eat leaves, so the pile stays
    const d = put(island(['ggg']), ['leaves', 0, 0], ['beetle', 1, 0]);
    expect(has(d, 0, 0, 'litter')).toBe(true);
  });
  it('a hunter with prey next to it keeps the plant-eaters in check', () => {
    const boom = put(island(['gggg']), ['grass', 0, 0], ['rabbit', 1, 0], ['mouse', 2, 0]);
    expect(bonus(boom, 'too-many-eaters')[0].pts).toBe(-2);
    const checked = place(boom, 'hawk', 3);
    expect(bonus(checked, 'too-many-eaters')).toHaveLength(0);
    // a hunter with nothing to eat does not help
    const hungry = put(island(['ggggg']), ['grass', 0, 0], ['rabbit', 1, 0], ['mouse', 2, 0], ['owl', 4, 0]);
    expect(bonus(hungry, 'too-many-eaters')).toHaveLength(1);
  });
  it('the drought dries the east pond: open-water life leaves, edge life stays, and the rain fills it again', () => {
    const b = put(island(['gggwww', 'gggwww']), ['fish', 4, 0], ['frog', 5, 0], ['lilies', 4, 1], ['grass', 0, 0]);
    const cells = droughtCells(b.island);
    expect(cells).toEqual([3, 4, 5, 9, 10, 11]);
    const { board, gone } = startDrought(b);
    expect(gone.map(([, id]) => id).sort()).toEqual(['fish', 'lilies']);
    expect(board.pieces[5]).toBe('frog');
    expect(board.island.ground[4]).toBe('mud');
    const wet = endDrought(board, cells);
    expect(wet.island.ground[4]).toBe('water');
    expect(wet.pieces[5]).toBe('frog');
  });
  it('the Archipelago is bigger, and has a pond for the drought to dry', () => {
    expect(sizeOf('archipelago')).toEqual({ w: 16, h: 10 });
    for (let s = 1; s <= 30; s++) {
      const a = makeIsland('archipelago', mulberry32(s));
      expect(a.pieces).toHaveLength(160);
      expect(droughtCells(a.island).length).toBeGreaterThanOrEqual(3);
      expect(RUNS.archipelago.short.drought).toBeLessThan(RUNS.archipelago.short.seasons);
    }
  });
  it('the woods start with oaks and dead wood; the wetland starts with too many snails', () => {
    const w = makeIsland('woods', mulberry32(3));
    expect(w.pieces.filter((p) => p === 'oak')).toHaveLength(2);
    const n = makeIsland('wetland', mulberry32(3));
    expect(n.pieces.filter((p) => p === 'snail')).toHaveLength(3);
    expect(bonus(n, 'too-many-eaters').length).toBe(1);
  });
});

describe('the food web board', () => {
  it('lists every true arrow between the tiles found, and only those', () => {
    expect(webLinksAmong(['grass', 'rabbit', 'fox']).sort()).toEqual(['grass>rabbit', 'rabbit>fox']);
    expect(webLinksAmong(['grass', 'fox'])).toEqual([]);
    expect(webLinksAmong(['log', 'mushrooms', 'deer', 'beetle']).sort()).toEqual(['deer>beetle', 'log>mushrooms']);
  });
  it('checks an arrow: right, backwards or wrong', () => {
    expect(checkArrow('snail', 'fish')).toBe('yes');
    expect(checkArrow('fish', 'snail')).toBe('backwards');
    expect(checkArrow('fox', 'snail')).toBe('no');
    expect(checkArrow('leaves', 'worms')).toBe('yes');
  });
});

describe('runs and targets', () => {
  it('targets come at the right seasons, and go up', () => {
    for (const kind of ISLAND_KINDS) {
      expect(RUNS[kind].short.targets).toHaveLength(3);
      expect(RUNS[kind].long.targets).toHaveLength(5);
      for (const len of ['short', 'long'] as RunLength[]) {
        const t = RUNS[kind][len].targets;
        expect(t[t.length - 1].season).toBe(RUNS[kind][len].seasons);
        for (let i = 1; i < t.length; i++) {
          expect(t[i].season).toBeGreaterThan(t[i - 1].season);
          expect(t[i].health).toBeGreaterThan(t[i - 1].health);
        }
      }
    }
  });
  for (const kind of ISLAND_KINDS)
    for (const len of ['short', 'long'] as RunLength[])
      it(`${kind}, ${len} run: careful placing restores almost every island; careless placing almost never does`, () => {
        const N = 120;
        let careful = 0;
        let careless = 0;
        for (let s = 1; s <= N; s++) {
          if (playRun(kind, len, s * 7919, true) === RUNS[kind][len].targets.length) careful++;
          if (playRun(kind, len, s * 7919 + 3, false) === RUNS[kind][len].targets.length) careless++;
        }
        expect(careful / N).toBeGreaterThanOrEqual(0.95);
        expect(careless / N).toBeLessThanOrEqual(0.1);
      }, 30000);
  it('the browser test seeds are won by careful placing', () => {
    expect(playRun('meadow', 'short', 4242, true)).toBe(3);
    expect(playRun('pond', 'short', 2424, true)).toBe(3);
    expect(playRun('woods', 'short', 1111, true)).toBe(3);
    expect(playRun('wetland', 'short', 2222, true)).toBe(3);
    expect(playRun('archipelago', 'short', 3333, true)).toBe(3);
  });
});

describe('what held the island back', () => {
  it('names too many hunters', () => {
    const b = put(island(['gggggg']), ['grass', 0, 0], ['rabbit', 1, 0], ['fox', 2, 0], ['hawk', 3, 0], ['fox', 4, 0], ['hawk', 5, 0]);
    expect(diagnose(b)).toBe('too-many-hunters');
  });
  it('names hungry animals', () => {
    const b = put(island(['ggggg', 'ggggg']), ['grass', 0, 0], ['grass', 0, 1], ['grass', 1, 1], ['grass', 2, 1], ['rabbit', 4, 0], ['mouse', 4, 1], ['butterfly', 3, 0]);
    expect(diagnose(b)).toBe('hungry');
  });
  it('names missing decomposers on a busy island with no recycling', () => {
    const b = put(
      island(['gggggg', 'gggggg']),
      ['grass', 0, 0],
      ['rabbit', 1, 0],
      ['fox', 2, 0],
      ['grass', 3, 0],
      ['flowers', 4, 0],
      ['bee', 5, 0],
      ['grass', 0, 1],
      ['log', 3, 1],
      ['mushrooms', 5, 1],
    );
    expect(diagnose(b)).toBe('no-decomposers');
  });
});

describe('the popups name what changed', () => {
  it('placing a fox next to a fed rabbit shows the food and the chain', () => {
    const before = put(island(['ggg']), ['grass', 0, 0], ['rabbit', 1, 0]);
    const after = place(before, 'fox', 2);
    const d = new Map(ruleDeltas(score(before), score(after)));
    expect(d.get('fed')).toBe(4);
    expect(d.get('food-chain')).toBe(3);
  });
});

describe('Field Notebook questions', () => {
  it('every island has at least five questions at every level', () => {
    for (const s of STATIONS) for (const t of TIERS) expect(bank(s).filter((q) => q.tier === t).length).toBeGreaterThanOrEqual(5);
  });
  it('ids are unique; one right answer; every wrong answer names a mistake and explains it', () => {
    const ids = new Set<string>();
    for (const s of STATIONS)
      for (const d of bank(s)) {
        expect(ids.has(d.id)).toBe(false);
        ids.add(d.id);
        expect(d.wrong).toHaveLength(2);
        for (const [label, mis, why] of d.wrong) {
          expect(label).not.toBe(d.right);
          expect(mis.length).toBeGreaterThan(2);
          expect(why.length).toBeGreaterThan(15);
          // a hint about a wrong answer never gives the right one away
          expect(why.toLowerCase()).not.toContain(d.right.toLowerCase());
        }
        expect(d.hints[0].length).toBeGreaterThan(5);
        expect(d.explain.length).toBeGreaterThan(20);
      }
  });
  it('questions are short: plain sentences, no question over 60 words', () => {
    for (const s of STATIONS) for (const d of bank(s)) expect(d.ask.split(/\s+/).length).toBeLessThanOrEqual(60);
  });
  it('the questions shuffle the answers and avoid ones seen lately', () => {
    const recent = bank('pond')
      .filter((d) => d.tier === 1)
      .slice(1)
      .map((d) => d.id);
    for (let s = 0; s < 10; s++) {
      const q = makeQuestion('pond', 1, mulberry32(s), recent);
      expect(recent).not.toContain(q.id);
      expect(q.choices.filter((c) => c.correct)).toHaveLength(1);
    }
  });
  it('the talk-it-through questions have one right answer and a full hint ladder', () => {
    for (const k of ISLAND_KINDS) {
      const d = ISLAND_INFO[k].debrief;
      expect(d.options.filter((o) => o.correct)).toHaveLength(1);
      expect(d.hints).toHaveLength(3);
    }
  });
});

describe('saving', () => {
  it('cleans a broken save', () => {
    expect(cleanSave(null)).toMatchObject({ version: 1, unlocked: [], run: null });
    const s = cleanSave({ unlocked: ['owl', 'dragon'], restored: ['meadow', 'moon'], stars: { meadow: 99 }, run: { kind: 'meadow', length: 'short', pieces: [1, 2] } });
    expect(s.unlocked).toEqual(['owl']);
    expect(s.restored).toEqual(['meadow']);
    expect(s.stars.meadow).toBe(5);
    expect(s.run).toBeNull();
  });
  it('keeps progress for all five islands, and the food web arrows', () => {
    const s = cleanSave({ stars: { woods: 3, archipelago: 2 }, restored: ['woods', 'archipelago'], webLinks: ['grass>rabbit', 'bad link', 7] });
    expect(s.stars.woods).toBe(3);
    expect(s.restored).toEqual(['woods', 'archipelago']);
    expect(s.webLinks).toEqual(['grass>rabbit']);
    expect(HOME_KINDS).toHaveLength(4);
  });
  it('keeps an Archipelago run in the middle of a drought', () => {
    const b = makeIsland('archipelago', mulberry32(8));
    const s = cleanSave({
      run: { kind: 'archipelago', length: 'short', seed: 8, pieces: b.pieces, season: 7, hand: [], rerolls: 1, deals: 9, upgrades: [], reached: 1, drought: 1, droughtDone: false },
    });
    expect(s.run).toMatchObject({ kind: 'archipelago', drought: 1 });
    // the wrong size for the island is thrown away
    expect(cleanSave({ run: { kind: 'archipelago', length: 'short', seed: 8, pieces: new Array(96).fill(null) } }).run).toBeNull();
  });
  it('keeps a run in progress', () => {
    const b = makeIsland('pond', mulberry32(5));
    const run = { kind: 'pond', length: 'long', seed: 5, pieces: b.pieces, season: 7, hand: ['fish', 'duck', 'grass'], rerolls: 1, deals: 9, upgrades: ['compost', 'nonsense'], reached: 1 };
    const s = cleanSave({ ...freshSave(), run });
    expect(s.run).toMatchObject({ kind: 'pond', length: 'long', season: 7, hand: ['fish', 'duck', 'grass'], upgrades: ['compost'], reached: 1 });
    expect(s.run!.pieces).toEqual(b.pieces);
  });
});
