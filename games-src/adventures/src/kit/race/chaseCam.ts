import * as THREE from 'three';
import { settings } from '../systems/settings';
import type { TrackGraph, Vec3 } from './track';

/**
 * A chase camera for a racer on a `TrackGraph`: it rides the track a little
 * behind the racer, so it follows bends and tunnels without cutting through
 * walls, and looks a little ahead. Use it with a `LowpolyRenderer` made with
 * `controls: 'none'`.
 *
 * Reduced motion (and the `steady` option) sits higher and farther back,
 * follows more smoothly and never shakes, for players who feel queasy in
 * fast 3D.
 */
export class ChaseCam {
  private readonly pos = new THREE.Vector3();
  private readonly look = new THREE.Vector3();
  private started = false;
  private shakeLeft = 0;
  private shakeSize = 0;

  constructor(
    readonly camera: THREE.PerspectiveCamera,
    readonly track: TrackGraph,
    readonly opts: { behind?: number; height?: number; ahead?: number; steady?: boolean } = {},
  ) {}

  private get steady(): boolean {
    return !!this.opts.steady || settings.reducedMotion;
  }

  /** A short shake (a bump or an eruption); skipped with reduced motion. */
  shake(size: number, seconds = 0.35): void {
    if (this.steady) return;
    this.shakeSize = Math.max(this.shakeSize, size);
    this.shakeLeft = Math.max(this.shakeLeft, seconds);
  }

  /** Jump straight to the right place (at the start, or after a reset). */
  snap(): void {
    this.started = false;
  }

  /**
   * Follow a racer at distance `s` along `path`, `x` across and `h` above
   * the road, `ball` being its real position.
   */
  update(dt: number, path: string, s: number, x: number, h: number, ball: Vec3): void {
    const steady = this.steady;
    const behind = (this.opts.behind ?? 6.5) * (steady ? 1.2 : 1);
    const height = (this.opts.height ?? 2.4) * (steady ? 1.25 : 1);
    const ahead = this.opts.ahead ?? 5;
    const p = this.track.pointBack(path, s - behind, x * 0.55, height + h * 0.5);
    const at = this.track.path(path);
    const fwd = at.point(Math.min(at.length, s + ahead), x * 0.4, 0.8 + h * 0.6);
    const goalPos = new THREE.Vector3(p.x, p.y, p.z);
    const goalLook = new THREE.Vector3(fwd.x, fwd.y, fwd.z).lerp(new THREE.Vector3(ball.x, ball.y, ball.z), 0.35);
    if (!this.started) {
      this.pos.copy(goalPos);
      this.look.copy(goalLook);
      this.started = true;
    } else {
      const k = 1 - Math.exp(-dt * (steady ? 4 : 7));
      const kl = 1 - Math.exp(-dt * (steady ? 5 : 10));
      this.pos.lerp(goalPos, k);
      this.look.lerp(goalLook, kl);
    }
    this.camera.position.copy(this.pos);
    if (this.shakeLeft > 0) {
      this.shakeLeft -= dt;
      const a = this.shakeSize * Math.max(0, this.shakeLeft) * 2;
      this.camera.position.x += (Math.random() - 0.5) * a;
      this.camera.position.y += (Math.random() - 0.5) * a;
      if (this.shakeLeft <= 0) this.shakeSize = 0;
    }
    this.camera.lookAt(this.look);
  }
}
