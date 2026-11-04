/**
 * The side-scroller's physics (first used by Weather Wizard Battle): a tile
 * map, a player body with gravity and jumping, platforms that can move (a
 * cloud pushed by the wind) or be stood on from above only, and a camera
 * that follows. Pure: no drawing, no timers, so every rule is unit tested.
 *
 * Units are tiles (a tile is 24 pixels in the Wild Lands) and seconds. y
 * grows downward, like the screen.
 *
 * The jump is tuned for children: a little "coyote time" (you can still
 * jump just after running off a ledge), a jump buffer (a press just before
 * landing still counts), a lower jump when the button is let go early, and
 * an easy setting with a slower run and a double jump.
 */

/**
 * What a tile is: air, solid ground, a ledge you can jump up through and
 * stand on, water (falling in sends you back to the last checkpoint), or ice
 * (solid but slippery).
 */
export const Cell = { Air: 0, Solid: 1, Ledge: 2, Water: 3, Ice: 4 } as const;
export type Cell = (typeof Cell)[keyof typeof Cell];

export class TileMap {
  readonly cells: Uint8Array;
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.cells = new Uint8Array(w * h);
  }
  get(x: number, y: number): Cell {
    if (x < 0 || x >= this.w) return Cell.Solid;
    if (y < 0) return Cell.Air;
    if (y >= this.h) return Cell.Air;
    return this.cells[y * this.w + x] as Cell;
  }
  set(x: number, y: number, c: Cell): void {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y * this.w + x] = c;
  }
}

/** A box that can be stood on: a cloud, an ice bridge, a raft. */
export interface Platform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Stood on from above only (clouds), or solid all round (an ice block). */
  oneWay: boolean;
  /** Moved this step (set by the game; riders move with it). */
  dx?: number;
  dy?: number;
  /** Slippery to stand on. */
  icy?: boolean;
  /** Turned off (melted, rained away). */
  gone?: boolean;
}

export interface Body {
  /** Top-left corner and size, in tiles. */
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  /** Standing on ice (slippery). */
  onIce: boolean;
  /** The platform stood on, if any. */
  standingOn: string | null;
  facing: 1 | -1;
  /** Seconds since last on the ground (for coyote time). */
  airTime: number;
  /** Seconds since the jump button was pressed (for the jump buffer); Infinity when not pressed. */
  jumpAsk: number;
  /** Jumps used since landing (for the easy setting's double jump). */
  jumps: number;
}

export interface Tuning {
  gravity: number;
  maxFall: number;
  run: number;
  accel: number;
  airAccel: number;
  /** How fast you slow down with no key held, on ground and on ice. */
  stop: number;
  iceStop: number;
  jumpSpeed: number;
  /** Letting go of jump early keeps only this much upward speed. */
  jumpCut: number;
  coyote: number;
  buffer: number;
  /** Jumps allowed before landing again (2 is the easy setting's double jump). */
  maxJumps: number;
}

export const NORMAL: Tuning = {
  gravity: 38,
  maxFall: 16,
  run: 6.2,
  accel: 42,
  airAccel: 28,
  stop: 36,
  iceStop: 5,
  jumpSpeed: 13.6,
  jumpCut: 0.45,
  coyote: 0.1,
  buffer: 0.12,
  maxJumps: 1,
};

/** The easy setting: slower, floatier, with a double jump. */
export const EASY: Tuning = { ...NORMAL, run: 4.8, gravity: 32, maxJumps: 2, coyote: 0.16, buffer: 0.18 };

/** How high a jump goes, in tiles (v² / 2g). */
export function jumpHeight(t: Tuning): number {
  return (t.jumpSpeed * t.jumpSpeed) / (2 * t.gravity);
}

export function newBody(x: number, y: number, w = 0.62, h = 1.36): Body {
  return { x, y, w, h, vx: 0, vy: 0, onGround: false, onIce: false, standingOn: null, facing: 1, airTime: 0, jumpAsk: Infinity, jumps: 0 };
}

export interface Controls {
  left: boolean;
  right: boolean;
  /** Pressed this step (a new press). */
  jump: boolean;
  /** Still held down. */
  jumpHeld: boolean;
}

export interface StepEvents {
  jumped: boolean;
  landed: boolean;
  /** Fell into water or off the bottom of the map. */
  fell: boolean;
  bumped: boolean;
}

const EPS = 1e-4;

function solidCell(c: Cell): boolean {
  return c === Cell.Solid || c === Cell.Ice;
}

/** Move one body for `dt` seconds through the map and platforms. */
export function step(b: Body, c: Controls, map: TileMap, plats: readonly Platform[], t: Tuning, dt: number): StepEvents {
  const ev: StepEvents = { jumped: false, landed: false, fell: false, bumped: false };
  // ride the platform stood on (it moved this step)
  if (b.standingOn) {
    const p = plats.find((q) => q.id === b.standingOn && !q.gone);
    if (p) {
      b.x += p.dx ?? 0;
      b.y += p.dy ?? 0;
    }
  }
  // run
  const want = (c.right ? 1 : 0) - (c.left ? 1 : 0);
  if (want) b.facing = want > 0 ? 1 : -1;
  const target = want * t.run;
  const a = !b.onGround ? t.airAccel : want ? (b.onIce ? t.accel * 0.35 : t.accel) : b.onIce ? t.iceStop : t.stop;
  if (b.vx < target) b.vx = Math.min(target, b.vx + a * dt);
  else if (b.vx > target) b.vx = Math.max(target, b.vx - a * dt);
  // jump (with coyote time and a jump buffer)
  b.jumpAsk = c.jump ? 0 : b.jumpAsk + dt;
  if (b.onGround) {
    b.airTime = 0;
    b.jumps = 0;
  } else b.airTime += dt;
  const canGround = b.onGround || b.airTime <= t.coyote;
  // in the air, walking off a ledge counts as the first jump (so only the easy setting's double jump works there)
  const used = Math.max(b.jumps, 1);
  if (b.jumpAsk <= t.buffer && (canGround || used < t.maxJumps)) {
    b.vy = -t.jumpSpeed;
    b.jumps = canGround ? 1 : used + 1;
    b.jumpAsk = Infinity;
    b.onGround = false;
    b.airTime = t.coyote + 1;
    b.standingOn = null;
    ev.jumped = true;
  }
  if (!c.jumpHeld && b.vy < 0) b.vy *= Math.pow(t.jumpCut, dt * 12);
  // fall
  b.vy = Math.min(t.maxFall, b.vy + t.gravity * dt);
  // move across, then down (each axis on its own, so corners slide)
  moveX(b, b.vx * dt, map, plats, ev);
  const wasGround = b.onGround;
  moveY(b, b.vy * dt, map, plats, ev);
  if (b.onGround && !wasGround) ev.landed = true;
  // water or the bottom of the world
  const midX = Math.floor(b.x + b.w / 2);
  const feet = Math.floor(b.y + b.h - 0.2);
  if (b.y > map.h + 1 || map.get(midX, feet) === Cell.Water) ev.fell = true;
  return ev;
}

function moveX(b: Body, dx: number, map: TileMap, plats: readonly Platform[], ev: StepEvents): void {
  if (!dx) return;
  b.x += dx;
  const y0 = Math.floor(b.y + EPS);
  const y1 = Math.floor(b.y + b.h - EPS);
  if (dx > 0) {
    const tx = Math.floor(b.x + b.w);
    for (let y = y0; y <= y1; y++)
      if (solidCell(map.get(tx, y))) {
        b.x = tx - b.w - EPS;
        b.vx = 0;
        ev.bumped = true;
        break;
      }
  } else {
    const tx = Math.floor(b.x);
    for (let y = y0; y <= y1; y++)
      if (solidCell(map.get(tx, y))) {
        b.x = tx + 1 + EPS;
        b.vx = 0;
        ev.bumped = true;
        break;
      }
  }
  for (const p of plats) {
    if (p.gone || p.oneWay || !overlap(b, p)) continue;
    b.x = dx > 0 ? p.x - b.w - EPS : p.x + p.w + EPS;
    b.vx = 0;
    ev.bumped = true;
  }
}

function moveY(b: Body, dy: number, map: TileMap, plats: readonly Platform[], ev: StepEvents): void {
  const oldBottom = b.y + b.h;
  b.y += dy;
  b.onGround = false;
  b.onIce = false;
  b.standingOn = null;
  const x0 = Math.floor(b.x + EPS);
  const x1 = Math.floor(b.x + b.w - EPS);
  if (dy >= 0) {
    const ty = Math.floor(b.y + b.h);
    for (let x = x0; x <= x1; x++) {
      const cell = map.get(x, ty);
      // ledges only catch you from above
      if (solidCell(cell) || (cell === Cell.Ledge && oldBottom <= ty + EPS * 10)) {
        b.y = ty - b.h;
        b.vy = 0;
        b.onGround = true;
        if (cell === Cell.Ice) b.onIce = true;
      }
    }
    for (const p of plats) {
      if (p.gone) continue;
      const lands = b.x + b.w > p.x && b.x < p.x + p.w && b.y + b.h >= p.y && oldBottom <= p.y + Math.max(0, p.dy ?? 0) + EPS * 10;
      if (lands) {
        b.y = p.y - b.h;
        b.vy = 0;
        b.onGround = true;
        b.standingOn = p.id;
        if (p.icy) b.onIce = true;
      }
    }
  } else {
    const ty = Math.floor(b.y);
    for (let x = x0; x <= x1; x++)
      if (solidCell(map.get(x, ty))) {
        b.y = ty + 1 + EPS;
        b.vy = 0;
        ev.bumped = true;
      }
    for (const p of plats) {
      if (p.gone || p.oneWay || !overlap(b, p)) continue;
      b.y = p.y + p.h + EPS;
      b.vy = 0;
      ev.bumped = true;
    }
  }
}

function overlap(b: { x: number; y: number; w: number; h: number }, p: { x: number; y: number; w: number; h: number }): boolean {
  return b.x < p.x + p.w && b.x + b.w > p.x && b.y < p.y + p.h && b.y + b.h > p.y;
}

// ------------------------------------------------------------------ the camera

export interface Camera {
  x: number;
  y: number;
}

/**
 * Follow the player smoothly: look ahead in the direction they face, keep
 * them a little below the middle (so you see where you jump to), and never
 * show past the map's edges.
 */
export function follow(cam: Camera, b: Body, viewW: number, viewH: number, map: TileMap, dt: number, snap = false): Camera {
  const tx = b.x + b.w / 2 - viewW / 2 + b.facing * viewW * 0.12;
  const ty = b.y + b.h / 2 - viewH * 0.58;
  const k = snap ? 1 : Math.min(1, dt * 5);
  const nx = cam.x + (tx - cam.x) * k;
  const ny = cam.y + (ty - cam.y) * Math.min(1, k * 0.8);
  return { x: Math.max(0, Math.min(map.w - viewW, nx)), y: Math.max(0, Math.min(map.h - viewH, ny)) };
}

// ------------------------------------------------------------------ levels written as text

export interface LevelThing {
  kind: string;
  x: number;
  y: number;
}

export interface Level {
  map: TileMap;
  spawn: { x: number; y: number };
  things: LevelThing[];
}

/**
 * A level as rows of text, one character per tile:
 *   `#` ground, `=` a ledge, `~` water, `I` ice, `.` or space air,
 *   `P` the player's start, and any other letter a thing for the game
 *   (a checkpoint, a droplet, a puddle...), placed on an air tile.
 */
export function parseLevel(rows: readonly string[]): Level {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const map = new TileMap(w, h);
  const things: LevelThing[] = [];
  let spawn = { x: 1, y: 1 };
  rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const ch = row[x] ?? '.';
      if (ch === '#') map.set(x, y, Cell.Solid);
      else if (ch === '=') map.set(x, y, Cell.Ledge);
      else if (ch === '~') map.set(x, y, Cell.Water);
      else if (ch === 'I') map.set(x, y, Cell.Ice);
      else if (ch === 'P') spawn = { x, y };
      else if (ch !== '.' && ch !== ' ') things.push({ kind: ch, x, y });
    }
  });
  return { map, spawn, things };
}

/** Put a body's feet on the tile below a start point. */
export function placeAt(b: Body, x: number, y: number): void {
  b.x = x + 0.5 - b.w / 2;
  b.y = y + 1 - b.h;
  b.vx = 0;
  b.vy = 0;
}
