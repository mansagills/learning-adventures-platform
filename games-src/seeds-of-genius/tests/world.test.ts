import { describe, expect, it } from 'vitest';
import { buildHubMap, buildRoomMap } from '../src/world/map';
import { CollisionGrid, findPath } from '../src/world/collision';
import { NPCS } from '../src/content/npcs';

describe('hub world', () => {
  const map = buildHubMap();
  const grid = new CollisionGrid(map);
  // NPCs block their tiles, as in the game.
  NPCS.filter((n) => n.scene === 'hub').forEach((n) => grid.setDynamic(n.id, [[Math.floor(n.pos.x), Math.floor(n.pos.y)]]));

  it('has a walkable spawn', () => {
    expect(grid.isFree(map.spawn.x, map.spawn.y, 0.28)).toBe(true);
  });

  it('can reach every NPC and every place from the spawn (no dead ends)', () => {
    for (const n of NPCS.filter((n) => n.scene === 'hub')) {
      expect(findPath(grid, map.spawn, n.pos), n.id).not.toBeNull();
    }
    for (const p of map.places) expect(findPath(grid, map.spawn, p), p.id).not.toBeNull();
  });

  it('keeps every road out from behind a roof', () => {
    // A building hides (h + d) rows north of its front wall on screen.
    for (const b of map.buildings) {
      const front = b.y + b.d;
      const hiddenFrom = front - b.d - b.h;
      for (let y = Math.ceil(hiddenFrom); y < b.y; y++)
        for (let x = b.x; x < b.x + b.w; x++) expect(map.ground[y][x], `${b.id} hides path at ${x},${y}`).not.toBe('path');
    }
  });

  it('can walk the full road loop', () => {
    const loop = [
      { x: 11.5, y: 9.5 }, { x: 27.5, y: 9.5 }, { x: 27.5, y: 26.5 }, { x: 11.5, y: 26.5 }, { x: 11.5, y: 9.5 },
    ];
    let from = map.spawn;
    for (const p of loop) {
      expect(findPath(grid, from, p)).not.toBeNull();
      from = p;
    }
  });

  it('keeps the player out of water and buildings', () => {
    expect(grid.isFree(19.5, 20.5, 0.28)).toBe(false); // pond
    expect(grid.isFree(19.5, 4.5, 0.28)).toBe(false); // greenhouse
    expect(grid.isFree(-1, 5, 0.28)).toBe(false); // off the map
  });

  it('slides along walls instead of sticking', () => {
    // Just below the greenhouse wall, pushing up-and-right still moves right.
    const r = grid.move(17.5, 6.3, 0.2, -0.2, 0.28);
    expect(r.x).toBeGreaterThan(17.5);
  });

  it('keeps personal space around characters and slides around them', () => {
    const g = new CollisionGrid(buildHubMap());
    g.setBlocker('carver', 21.5, 7.5, 0.85);
    // Walking straight up into Carver stops outside his space.
    let p = { x: 21.5, y: 9.2 };
    for (let i = 0; i < 40; i++) p = g.move(p.x, p.y, 0, -0.05, 0.28);
    expect(Math.hypot(p.x - 21.5, p.y - 7.5)).toBeGreaterThanOrEqual(1.12);
    // Walking sideways past him slides around instead of sticking.
    let q = { x: 19.9, y: 8.2 };
    for (let i = 0; i < 80; i++) q = g.move(q.x, q.y, 0.05, 0, 0.28);
    expect(q.x).toBeGreaterThan(22.5);
  });

  it('the room connects the door, bed, wardrobe and windowsill', () => {
    const room = buildRoomMap();
    const g = new CollisionGrid(room);
    for (const p of room.places) expect(findPath(g, room.spawn, p), p.id).not.toBeNull();
  });
});
