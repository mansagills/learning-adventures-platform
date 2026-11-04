import { describe, expect, it } from 'vitest';
import { Cell, EASY, follow, jumpHeight, newBody, NORMAL, parseLevel, placeAt, step, type Body, type Controls, type Platform, type Tuning } from '../src/kit/scroller/physics';

const idle: Controls = { left: false, right: false, jump: false, jumpHeld: false };
const DT = 1 / 60;

/** Run `n` steps with the same controls (a jump press only counts on the first step). */
function run(b: Body, c: Controls, lv: ReturnType<typeof parseLevel>, n: number, plats: Platform[] = [], t: Tuning = NORMAL) {
  const events = [];
  for (let i = 0; i < n; i++) events.push(step(b, i === 0 ? c : { ...c, jump: false }, lv.map, plats, t, DT));
  return events;
}

const FLAT = parseLevel(['..........', '..........', '..........', '..........', '.P........', '##########']);

describe('the side-scroller physics', () => {
  it('reads a level from text', () => {
    const lv = parseLevel(['P..C', '#=~I']);
    expect(lv.spawn).toEqual({ x: 0, y: 0 });
    expect(lv.things).toEqual([{ kind: 'C', x: 3, y: 0 }]);
    expect(lv.map.get(0, 1)).toBe(Cell.Solid);
    expect(lv.map.get(1, 1)).toBe(Cell.Ledge);
    expect(lv.map.get(2, 1)).toBe(Cell.Water);
    expect(lv.map.get(3, 1)).toBe(Cell.Ice);
    // the sides of the map are walls; above and below are open
    expect(lv.map.get(-1, 0)).toBe(Cell.Solid);
    expect(lv.map.get(0, -1)).toBe(Cell.Air);
  });

  it('falls and lands on the ground, standing still', () => {
    const b = newBody(0, 0);
    placeAt(b, 1, 1);
    const ev = run(b, idle, FLAT, 90);
    expect(ev.some((e) => e.landed)).toBe(true);
    expect(b.onGround).toBe(true);
    expect(b.y + b.h).toBeCloseTo(5, 3);
  });

  it('jumps about 2.4 tiles high, enough for a 2-tile ledge but not a 3-tile wall', () => {
    expect(jumpHeight(NORMAL)).toBeGreaterThan(2.2);
    expect(jumpHeight(NORMAL)).toBeLessThan(2.8);
    const b = newBody(0, 0);
    placeAt(b, 1, 4);
    run(b, idle, FLAT, 5);
    const ground = b.y;
    let top = b.y;
    const ev = step(b, { ...idle, jump: true, jumpHeld: true }, FLAT.map, [], NORMAL, DT);
    expect(ev.jumped).toBe(true);
    for (let i = 0; i < 80; i++) {
      step(b, { ...idle, jumpHeld: true }, FLAT.map, [], NORMAL, DT);
      top = Math.min(top, b.y);
    }
    expect(ground - top).toBeGreaterThan(2.1);
    expect(b.onGround).toBe(true);
  });

  it('jumps lower when the button is let go early', () => {
    const peak = (held: number) => {
      const b = newBody(0, 0);
      placeAt(b, 1, 4);
      run(b, idle, FLAT, 5);
      const ground = b.y;
      let top = b.y;
      for (let i = 0; i < 80; i++) {
        step(b, { ...idle, jump: i === 0, jumpHeld: i < held }, FLAT.map, [], NORMAL, DT);
        top = Math.min(top, b.y);
      }
      return ground - top;
    };
    expect(peak(4)).toBeLessThan(peak(60) * 0.75);
  });

  it('runs and stops at walls', () => {
    const lv = parseLevel(['.....#', '.....#', '.P...#', '######']);
    const b = newBody(0, 0);
    placeAt(b, lv.spawn.x, lv.spawn.y);
    run(b, { ...idle, right: true }, lv, 120);
    expect(b.x + b.w).toBeLessThanOrEqual(5);
    expect(b.x + b.w).toBeGreaterThan(4.9);
    expect(b.facing).toBe(1);
  });

  it('lets you jump up through a ledge and stand on it', () => {
    const lv = parseLevel(['......', '......', '......', '.====.', '.P....', '######']);
    const b = newBody(0, 0);
    placeAt(b, lv.spawn.x, lv.spawn.y);
    run(b, idle, lv, 5);
    run(b, { ...idle, jump: true, jumpHeld: true }, lv, 90);
    expect(b.onGround).toBe(true);
    expect(b.y + b.h).toBeCloseTo(3, 3);
  });

  it('gives a moment of coyote time after running off a ledge, but no jump in mid-air after that', () => {
    const lv = parseLevel(['........', '........', '........', '........', 'P.......', '##......', '........', '........', '........', '........']);
    const b = newBody(0, 0);
    placeAt(b, lv.spawn.x, lv.spawn.y);
    run(b, idle, lv, 5);
    // run right until just past the edge
    let n = 0;
    while (b.onGround && n++ < 200) step(b, { ...idle, right: true }, lv.map, [], NORMAL, DT);
    const late = { ...b };
    expect(step(b, { ...idle, jump: true, jumpHeld: true }, lv.map, [], NORMAL, DT).jumped).toBe(true);
    // too late: well after leaving the ledge
    const c = { ...late };
    run(c, idle, lv, 20);
    expect(step(c, { ...idle, jump: true, jumpHeld: true }, lv.map, [], NORMAL, DT).jumped).toBe(false);
  });

  it('gives the easy setting a double jump', () => {
    const b = newBody(0, 0);
    placeAt(b, 1, 4);
    run(b, idle, FLAT, 5, [], EASY);
    expect(step(b, { ...idle, jump: true, jumpHeld: true }, FLAT.map, [], EASY, DT).jumped).toBe(true);
    run(b, { ...idle, jumpHeld: true }, FLAT, 15, [], EASY);
    expect(step(b, { ...idle, jump: true, jumpHeld: true }, FLAT.map, [], EASY, DT).jumped).toBe(true);
    run(b, { ...idle, jumpHeld: true }, FLAT, 5, [], EASY);
    expect(step(b, { ...idle, jump: true, jumpHeld: true }, FLAT.map, [], EASY, DT).jumped).toBe(false);
  });

  it('reports a fall into water', () => {
    const lv = parseLevel(['P.....', '#~~~~#', '######']);
    const b = newBody(0, 0);
    placeAt(b, lv.spawn.x, lv.spawn.y);
    const ev = run(b, { ...idle, right: true }, lv, 60);
    expect(ev.some((e) => e.fell)).toBe(true);
  });

  it('slides on ice', () => {
    const stopAfter = (ground: string) => {
      const lv = parseLevel(['..........', 'P.........', ground]);
      const b = newBody(0, 0);
      placeAt(b, lv.spawn.x, lv.spawn.y);
      run(b, { ...idle, right: true }, lv, 40);
      const x = b.x;
      run(b, idle, lv, 60);
      return b.x - x;
    };
    expect(stopAfter('IIIIIIIIII')).toBeGreaterThan(stopAfter('##########') * 2);
  });

  it('stands on a cloud from above, and rides it when the wind moves it', () => {
    const lv = parseLevel(['..........', '..........', '..........', '..........', '..........', '..........']);
    const cloud: Platform = { id: 'cloud', x: 1, y: 3, w: 3, h: 0.6, oneWay: true };
    const b = newBody(2, 0);
    run(b, idle, lv, 60, [cloud]);
    expect(b.standingOn).toBe('cloud');
    const x = b.x;
    cloud.dx = 0.05;
    for (let i = 0; i < 20; i++) {
      cloud.x += cloud.dx;
      step(b, idle, lv.map, [cloud], NORMAL, DT);
    }
    expect(b.x - x).toBeCloseTo(1, 1);
    // a cloud that rains away drops you
    cloud.gone = true;
    run(b, idle, lv, 5, [cloud]);
    expect(b.standingOn).toBe(null);
  });

  it('cannot walk through a solid ice block', () => {
    const lv = parseLevel(['..........', 'P.........', '##########']);
    const block: Platform = { id: 'ice', x: 4, y: 0, w: 1, h: 2, oneWay: false };
    const b = newBody(0, 0);
    placeAt(b, lv.spawn.x, lv.spawn.y);
    run(b, { ...idle, right: true }, lv, 90, [block]);
    expect(b.x + b.w).toBeLessThanOrEqual(4.001);
  });

  it('keeps the camera inside the map', () => {
    const lv = parseLevel(Array.from({ length: 12 }, () => '#'.repeat(40)));
    const b = newBody(0, 0);
    placeAt(b, 1, 5);
    let cam = follow({ x: 0, y: 0 }, b, 20, 11, lv.map, DT, true);
    expect(cam.x).toBe(0);
    placeAt(b, 39, 5);
    cam = follow(cam, b, 20, 11, lv.map, DT, true);
    expect(cam.x).toBe(20);
    expect(cam.y).toBeGreaterThanOrEqual(0);
    expect(cam.y).toBeLessThanOrEqual(1);
  });
});
