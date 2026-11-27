import { describe, expect, it } from 'vitest';
import { DEFAULT_ROLL, newRoll, steadySpeed, stepRoll, type RollInput } from '../src/kit/race/roll';
import { TrackGraph, TrackPath, v3, vec } from '../src/kit/race/track';
import { CAST, FORK_SIGNS, HOST_LINES, ORDER_CARDS, ROCK_FORMS, UI, VENT_QUESTION } from '../src/games/rock-cycle-racing/content';
import { FAMILY, apply, nextRocks, route, type Rock } from '../src/games/rock-cycle-racing/cycle';
import { buildTestTrack, coneHeight } from '../src/games/rock-cycle-racing/tracks';

const flat: RollInput = { throttle: 0.6, brake: false, steer: 0, jump: false };

describe('race track paths', () => {
  const straight = new TrackPath({ id: 'a', points: [v3(0, 0, 0), v3(0, 0, -20), v3(0, 0, -40)], width: 8, next: 'finish' });

  it('samples a path evenly and measures its length', () => {
    expect(straight.length).toBeCloseTo(40, 0);
    const gaps = straight.samples.slice(1).map((s, i) => s.d - straight.samples[i].d);
    for (const g of gaps) expect(g).toBeCloseTo(gaps[0], 1);
  });

  it('has no jumps between neighbouring samples', () => {
    const track = buildTestTrack();
    for (const p of track.graph.paths.values()) {
      for (let i = 1; i < p.samples.length; i++) {
        const d = vec.len(vec.sub(p.samples[i].p, p.samples[i - 1].p));
        expect(d, `${p.spec.id} at ${i}`).toBeLessThan(p.step * 1.6);
      }
    }
  });

  it('points right of the direction of travel for positive x', () => {
    // Heading toward -z, right is +x.
    expect(straight.point(10, 2, 0).x).toBeCloseTo(2, 3);
    expect(straight.at(10).curve).toBeCloseTo(0, 3);
    expect(straight.at(10).grade).toBeCloseTo(0, 3);
  });

  it('measures slopes and the way a bend turns', () => {
    const up = new TrackPath({ id: 'up', points: [v3(0, 0, 0), v3(0, 5, -20), v3(0, 10, -40)], width: 6, next: 'finish' });
    expect(up.at(20).grade).toBeGreaterThan(0.2);
    const rightBend = new TrackPath({ id: 'r', points: [v3(0, 0, 0), v3(0, 0, -20), v3(20, 0, -40)], width: 6, next: 'finish' });
    expect(rightBend.at(rightBend.length / 2).curve).toBeGreaterThan(0);
  });
});

describe('the test track', () => {
  const track = buildTestTrack();

  it('has two ways from the start to the finish', () => {
    const routes = track.graph.routes();
    expect(routes).toEqual([
      ['vent', 'deep'],
      ['vent', 'erupt'],
    ]);
  });

  it('starts each fork branch where the fork sign says, beside the end of the vent', () => {
    const vent = track.graph.path('vent');
    for (const c of track.forks[0].choices) {
      const expected = vent.point(vent.length, c.offset, 0);
      const start = track.graph.path(c.path).samples[0].p;
      expect(vec.len(vec.sub(start, expected)), c.path).toBeLessThan(0.6);
    }
  });

  it('picks the branch on the side of the road you are on', () => {
    const fork = track.forks[0];
    expect(track.graph.pick(fork, -2).path).toBe('deep');
    expect(track.graph.pick(fork, 2.5).path).toBe('erupt');
  });

  it('gives every Order Card a way to finish as its rock', () => {
    for (const card of ORDER_CARDS) {
      const sign = FORK_SIGNS.find((f) => f.result === card.goal);
      expect(sign, card.id).toBeTruthy();
      expect(track.graph.routes().some((r) => r.includes(sign!.path))).toBe(true);
    }
  });

  it('keeps the tunnels under the ground and the lava flow on it', () => {
    for (const p of track.graph.paths.values())
      for (const s of p.samples) {
        // The tunnel's roof is about 5 above the road.
        const ground = coneHeight(Math.hypot(s.p.x, s.p.z));
        if (s.kind === 'tunnel') expect(s.p.y + 5.2, `${p.spec.id} at ${s.d.toFixed(0)}`).toBeLessThan(ground);
        else expect(s.p.y, `${p.spec.id} at ${s.d.toFixed(0)}`).toBeGreaterThan(0);
      }
  });

  it('puts the question gate on the vent, before the fork', () => {
    expect(track.gate.path).toBe('vent');
    expect(track.gate.s).toBeLessThan(track.graph.path('vent').length - 10);
  });

  it('has slopes a rolling rock can climb with the push held', () => {
    for (const p of track.graph.paths.values())
      for (const s of p.samples) expect(steadySpeed(s.t.y, 1, DEFAULT_ROLL), `${p.spec.id} at ${s.d.toFixed(0)}`).toBeGreaterThan(6);
  });
});

describe('rolling physics', () => {
  const road = (grade: number, curve = 0, bank = 0) => ({ grade, curve, bank, halfWidth: 4 });
  const run = (grade: number, seconds: number, input = flat, start = 10) => {
    const st = newRoll(0, 0);
    st.v = start;
    for (let i = 0; i < seconds * 120; i++) stepRoll(st, input, road(grade), DEFAULT_ROLL, 1 / 120);
    return st;
  };

  it('speeds up downhill and slows down uphill', () => {
    expect(run(-0.2, 2).v).toBeGreaterThan(run(0, 2).v);
    expect(run(0.2, 2).v).toBeLessThan(run(0, 2).v);
  });

  it('settles at a steady speed on the flat', () => {
    expect(run(0, 20).v).toBeCloseTo(steadySpeed(0, 0.6, DEFAULT_ROLL), 1);
  });

  it('keeps rolling for a while after you let go', () => {
    const st = run(0, 1, { ...flat, throttle: 0 }, 12);
    expect(st.v).toBeGreaterThan(5);
  });

  it('stops at the walls and loses a little speed', () => {
    const st = newRoll(0, 0);
    st.v = 15;
    let hit = false;
    for (let i = 0; i < 240; i++) hit = stepRoll(st, { ...flat, steer: 1 }, road(0), DEFAULT_ROLL, 1 / 120).hitWall || hit;
    expect(st.x).toBeLessThanOrEqual(4 - DEFAULT_ROLL.radius + 1e-9);
    expect(hit).toBe(true);
  });

  it('lands after a jump', () => {
    const st = newRoll(0, 0);
    st.v = 10;
    stepRoll(st, { ...flat, jump: true }, road(0), DEFAULT_ROLL, 1 / 120);
    expect(st.air).toBe(true);
    let landed = false;
    for (let i = 0; i < 240 && !landed; i++) landed = stepRoll(st, flat, road(0), DEFAULT_ROLL, 1 / 120).landed;
    expect(landed).toBe(true);
    expect(st.h).toBe(0);
  });

  it('is pushed to the outside of a bend unless the road is banked', () => {
    const go = (bank: number) => {
      const st = newRoll(0, 0);
      st.v = 20;
      for (let i = 0; i < 60; i++) stepRoll(st, flat, road(0, 0.02, bank), DEFAULT_ROLL, 1 / 120);
      return st.x;
    };
    // A right bend pushes the ball left (outside); banking into it helps.
    expect(go(0)).toBeLessThan(0);
    expect(go(0.25)).toBeGreaterThan(go(0));
  });

  it('never goes backwards or faster than its top speed', () => {
    const slow = run(0.3, 5, { ...flat, throttle: 0, brake: true });
    expect(slow.v).toBe(0);
    expect(run(-0.5, 10, { ...flat, throttle: 1 }, 30).v).toBeLessThanOrEqual(DEFAULT_ROLL.maxSpeed);
  });
});

describe('a fork graph', () => {
  it('looks back across a fork for the chase camera', () => {
    const g = new TrackGraph(
      'a',
      [
        { id: 'a', points: [v3(0, 0, 0), v3(0, 0, -20)], width: 8, next: 'fork:f' },
        { id: 'b', points: [v3(-3, 0, -20), v3(-3, 0, -40)], width: 5, next: 'finish' },
        { id: 'c', points: [v3(3, 0, -20), v3(3, 0, -40)], width: 5, next: 'finish' },
      ],
      [{ id: 'f', choices: [{ path: 'b', offset: -3 }, { path: 'c', offset: 3 }] }],
    );
    const back = g.pointBack('c', -5, 0, 0);
    expect(back.z).toBeCloseTo(-15, 0);
    expect(back.x).toBeCloseTo(3, 1);
  });
});

describe('the rock cycle rules', () => {
  it('cools magma into igneous rock, by how fast it cools', () => {
    expect(apply('magma', 'cool-slow')).toBe('granite');
    expect(apply('magma', 'cool-fast')).toBe('basalt');
    expect(apply('magma', 'cool-instant')).toBe('obsidian');
    expect(apply('magma', 'cool-gassy')).toBe('pumice');
    expect(apply('granite', 'cool-slow')).toBeNull();
  });

  it('melts any solid rock into magma, but heat and pressure never melt it', () => {
    for (const rock of Object.keys(FAMILY) as Rock[]) {
      if (rock === 'magma') continue;
      expect(apply(rock, 'melt'), rock).toBe('magma');
      expect(apply(rock, 'heat-press'), rock).not.toBe('magma');
    }
  });

  it('glues sediment into sedimentary rock', () => {
    expect(apply('sand', 'press-glue')).toBe('sandstone');
    expect(apply('mud', 'press-glue')).toBe('shale');
    expect(apply('granite', 'press-glue')).toBeNull();
  });

  it('lets every family reach every other family', () => {
    const families = ['igneous', 'sedimentary', 'metamorphic'] as const;
    const pick: Record<(typeof families)[number], Rock> = { igneous: 'basalt', sedimentary: 'sandstone', metamorphic: 'gneiss' };
    for (const a of families) for (const b of families) if (a !== b) expect(route(pick[a], pick[b]), `${a} to ${b}`).not.toBeNull();
  });

  it('only offers changes that really happen', () => {
    for (const n of nextRocks('basalt')) expect(n.rock).not.toBe('basalt');
    expect(nextRocks('magma').every((n) => FAMILY[n.rock] === 'igneous')).toBe(true);
  });
});

describe('Rock Cycle Racing words', () => {
  const all = JSON.stringify({ CAST, FORK_SIGNS, HOST_LINES, ORDER_CARDS, ROCK_FORMS, VENT_QUESTION, UI: { ...UI, place: [UI.place(1), UI.place(2)] } });

  it('has no emoji and no long dashes', () => {
    expect(all).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(all).not.toMatch(/[–—]/);
  });

  it('asks one question with exactly one right answer, and explains each wrong one', () => {
    expect(VENT_QUESTION.answers.filter((a) => a.right)).toHaveLength(1);
    for (const a of VENT_QUESTION.answers.filter((x) => !x.right)) {
      expect(a.mistake, a.text).toBeTruthy();
      expect(a.fix, a.text).toBeTruthy();
    }
    expect(VENT_QUESTION.text.trim().endsWith('?')).toBe(true);
  });

  it('describes every rock a race can finish as', () => {
    for (const f of FORK_SIGNS) expect(ROCK_FORMS[f.result], f.result).toBeTruthy();
    for (const c of ORDER_CARDS) expect(ROCK_FORMS[c.goal], c.goal).toBeTruthy();
  });
});
