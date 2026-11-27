/**
 * Rolling physics for a ball racer on a `TrackPath`. Pure math, no drawing,
 * so it can be unit tested.
 *
 * The racer keeps a distance along the path (`s`), a place across the road
 * (`x`, right is positive) and a height above it (`h`, for jumps). Gravity
 * speeds it up downhill and slows it uphill; it keeps rolling when you let
 * go; curves push it to the outside unless the road is banked into them;
 * the low walls at the road's edges stop it and cost a little speed.
 */

export interface RollState {
  s: number;
  x: number;
  h: number;
  /** Speed along the road (units a second, never below zero). */
  v: number;
  /** Speed across the road. */
  vx: number;
  /** Speed up and down while in the air. */
  vh: number;
  air: boolean;
  /** How far the ball has turned (radians), for drawing it rolling. */
  spin: number;
  /** Seconds of boost left. */
  boost: number;
}

export interface RollInput {
  /** 0 = coast, 1 = push hard. */
  throttle: number;
  brake: boolean;
  /** -1 = left, 1 = right. */
  steer: number;
  jump: boolean;
}

export interface RollTuning {
  /** Push from the throttle (units a second, each second). */
  accel: number;
  brake: number;
  /** Air and rolling drag; the top speed on flat ground is accel / drag. */
  drag: number;
  gravity: number;
  /** How much of the slope's pull reaches the ball (a rolling ball feels about 5/7). */
  slopePull: number;
  /** Fastest sideways speed when steering. */
  steerSpeed: number;
  /** How quickly the sideways speed follows the steering (per second). */
  grip: number;
  /** How strongly curves and banks push the ball sideways (0..1). */
  sideways: number;
  jumpSpeed: number;
  radius: number;
  /** Share of speed lost each time the ball hits a wall. */
  wallLoss: number;
  /** Extra speed during a boost. */
  boostSpeed: number;
  /** Never faster than this. */
  maxSpeed: number;
}

export const DEFAULT_ROLL: RollTuning = {
  accel: 14,
  brake: 18,
  drag: 0.62,
  gravity: 22,
  slopePull: 5 / 7,
  steerSpeed: 9,
  grip: 7,
  sideways: 0.35,
  jumpSpeed: 9,
  radius: 0.62,
  wallLoss: 0.18,
  boostSpeed: 9,
  maxSpeed: 40,
};

/** What the road is like where the ball is (from `TrackPath.at`). */
export interface RoadHere {
  grade: number;
  curve: number;
  bank: number;
  halfWidth: number;
}

export interface RollEvents {
  hitWall: boolean;
  jumped: boolean;
  landed: boolean;
}

export function newRoll(s = 0, x = 0): RollState {
  return { s, x, h: 0, v: 0, vx: 0, vh: 0, air: false, spin: 0, boost: 0 };
}

/** Move the ball forward by `dt` seconds. */
export function stepRoll(st: RollState, input: RollInput, road: RoadHere, tune: RollTuning, dt: number): RollEvents {
  const ev: RollEvents = { hitWall: false, jumped: false, landed: false };
  // Along the road.
  let a = input.throttle * tune.accel - tune.drag * st.v;
  if (!st.air) a -= tune.gravity * tune.slopePull * road.grade;
  if (input.brake) a -= tune.brake;
  if (st.boost > 0) {
    a += tune.boostSpeed * 1.5;
    st.boost = Math.max(0, st.boost - dt);
  }
  st.v = Math.min(tune.maxSpeed, Math.max(0, st.v + a * dt));
  st.s += st.v * dt;

  // Across the road: steering, then the curve's push and the bank's pull.
  const control = st.air ? 0.35 : 1;
  const target = input.steer * tune.steerSpeed * (0.55 + 0.45 * Math.min(1, st.v / 18));
  st.vx += (target - st.vx) * Math.min(1, tune.grip * control * dt);
  if (!st.air) {
    const side = tune.gravity * Math.sin(road.bank) - st.v * st.v * road.curve;
    st.vx += side * tune.sideways * dt;
  }
  st.x += st.vx * dt;
  const edge = Math.max(0, road.halfWidth - tune.radius);
  if (Math.abs(st.x) > edge) {
    st.x = Math.sign(st.x) * edge;
    if (Math.abs(st.vx) > 1.5) {
      ev.hitWall = true;
      st.v *= 1 - tune.wallLoss;
    }
    st.vx = -st.vx * 0.25;
  }

  // Up and down: jumps.
  if (!st.air && input.jump) {
    st.air = true;
    st.vh = tune.jumpSpeed;
    ev.jumped = true;
  }
  if (st.air) {
    st.vh -= tune.gravity * dt;
    st.h += st.vh * dt;
    if (st.h <= 0) {
      st.h = 0;
      st.vh = 0;
      st.air = false;
      ev.landed = true;
    }
  }
  st.spin += (st.v * dt) / tune.radius;
  return ev;
}

/** The fastest steady speed on a slope with the throttle held (for tuning and tests). */
export function steadySpeed(grade: number, throttle: number, tune: RollTuning): number {
  return Math.max(0, Math.min(tune.maxSpeed, (throttle * tune.accel - tune.gravity * tune.slopePull * grade) / tune.drag));
}
