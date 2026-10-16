/**
 * Tess's launch cannon, worked out with real gravity (Isaac Newton's famous
 * thought experiment). A little planet of radius 1 pulls with gravity that
 * gets weaker with distance (strength 1 / distance squared). The cannon sits
 * on a tall mountain at height ORBIT_R above the middle and fires sideways.
 *
 * `speed` is measured against the "just right" speed for a circle at the
 * mountain top (speed 1 = a perfect circular orbit):
 *   below about 0.94, the path dips into the ground and the probe lands;
 *   from there up to 1.41 (the square root of 2), the probe goes round and
 *   round (an orbit, a circle at exactly 1, a stretched loop above it);
 *   at 1.41 and faster, gravity cannot bring it back and it flies off.
 *
 * Pure functions, no drawing, so the rules can be unit tested.
 */

export const ORBIT_R = 1.25;
export type Outcome = 'land' | 'orbit' | 'escape';

export interface Flight {
  /** Points along the path, in planet radii, with the planet's middle at 0, 0 (y grows downward, the mountain is on top). */
  path: Array<[number, number]>;
  outcome: Outcome;
}

/** The speed that makes a perfect circle at the mountain top. */
const CIRCLE = Math.sqrt(1 / ORBIT_R);

/** Fly one shot. Stops when the probe lands, goes all the way round, or gets far away. */
export function launch(speed: number, maxSteps = 6000): Flight {
  let x = 0;
  let y = -ORBIT_R;
  let vx = speed * CIRCLE;
  let vy = 0;
  const dt = 0.004;
  const path: Array<[number, number]> = [[x, y]];
  let turned = 0;
  let lastA = Math.atan2(y, x);
  // leapfrog steps keep orbits closed (they do not slowly spiral in or out)
  const acc = (px: number, py: number): [number, number] => {
    const r = Math.hypot(px, py);
    const k = -1 / (r * r * r);
    return [px * k, py * k];
  };
  let [ax, ay] = acc(x, y);
  for (let i = 0; i < maxSteps; i++) {
    vx += ax * dt * 0.5;
    vy += ay * dt * 0.5;
    x += vx * dt;
    y += vy * dt;
    [ax, ay] = acc(x, y);
    vx += ax * dt * 0.5;
    vy += ay * dt * 0.5;
    if (i % 6 === 0) path.push([x, y]);
    const r = Math.hypot(x, y);
    if (r <= 1) {
      path.push([x / r, y / r]);
      return { path, outcome: 'land' };
    }
    if (r > 8) return { path, outcome: 'escape' };
    const a = Math.atan2(y, x);
    let da = a - lastA;
    if (da > Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    turned += da;
    lastA = a;
    if (Math.abs(turned) >= Math.PI * 2) return { path, outcome: 'orbit' };
  }
  // still going after the last step: it is on a huge loop (an orbit) unless it is speeding away
  const energy = (vx * vx + vy * vy) / 2 - 1 / Math.hypot(x, y);
  return { path, outcome: energy >= 0 ? 'escape' : 'orbit' };
}

/** The speeds on Tess's dial, slowest to fastest (1 is the perfect circle). */
export const DIAL = [0.45, 0.65, 0.85, 1, 1.2, 1.55];

/** The three shots the pictures show. */
export const SHOT_SPEED = { slow: 0.8, orbit: 1, escape: 1.55 } as const;
