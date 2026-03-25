import * as Phaser from 'phaser';
import { NPC } from './NPC';
import type { DialogLine } from './NPC';

interface Waypoint {
  x: number;
  y: number;
}

/**
 * WanderingNPC - An NPC that patrols between waypoints using Phaser tweens.
 *
 * Extends NPC with tween-based movement. The NPC pauses at each waypoint for a
 * random duration before moving to the next. No physics body — pass-through entity.
 */
export class WanderingNPC extends NPC {
  private waypoints: Waypoint[] = [];
  private waypointIndex: number = 0;
  private pauseDuration: number = 2000;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    npcName: string,
    dialog: DialogLine[],
  ) {
    super(scene, x, y, texture, npcName, dialog);
  }

  /**
   * Begin wandering between the given waypoints.
   * @param waypoints  List of {x, y} world-pixel positions to visit in order.
   * @param pauseDuration  Base pause time in ms at each waypoint (randomised ±1s).
   */
  startWandering(waypoints: Waypoint[], pauseDuration = 2000): void {
    if (waypoints.length === 0) return;
    this.waypoints = waypoints;
    this.pauseDuration = pauseDuration;
    this.moveToNext();
  }

  private moveToNext(): void {
    if (!this.scene || !this.scene.tweens || this.waypoints.length === 0) return;

    const wp = this.waypoints[this.waypointIndex];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, wp.x, wp.y);

    // ~250 px/s
    this.scene.tweens.add({
      targets: this,
      x: wp.x,
      y: wp.y,
      duration: dist * 4,
      ease: 'Linear',
      onComplete: () => {
        this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
        const jitter = Math.random() * 1000;
        this.scene.time.delayedCall(this.pauseDuration + jitter, () => this.moveToNext());
      },
    });
  }
}
