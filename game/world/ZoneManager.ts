import { EventBus } from '@/components/phaser/EventBus';
import { CAMPUS_ZONES } from './campusLayout';

export interface ZoneInfo {
  name: string;
  displayName: string;
  key: string;
  color: number;
  neonAccent: string;
  neonDim: string;
  pixelX: number;
  pixelY: number;
  pixelW: number;
  pixelH: number;
}

const ZONES: ZoneInfo[] = CAMPUS_ZONES;

/**
 * ZoneManager — plain TypeScript class (no Phaser dependency).
 *
 * Tracks which Campus V1 zone the player is currently in and emits
 * a 'zone-changed' event on the EventBus whenever the player crosses a boundary.
 *
 * Usage:
 *   const zm = new ZoneManager();
 *   // In OpenWorldScene.update():
 *   zm.update(this.player.x, this.player.y);
 */
export class ZoneManager {
  private currentZoneKey: string = '';

  /** Returns the static array of Campus V1 zones (used by Minimap). */
  getZones(): ZoneInfo[] {
    return ZONES;
  }

  /**
   * Returns the ZoneInfo that contains the given world coordinates.
   * Falls back to Main Hub if no zone matches.
   */
  getCurrentZone(worldX: number, worldY: number): ZoneInfo {
    for (const zone of ZONES) {
      if (
        worldX >= zone.pixelX &&
        worldX < zone.pixelX + zone.pixelW &&
        worldY >= zone.pixelY &&
        worldY < zone.pixelY + zone.pixelH
      ) {
        return zone;
      }
    }
    // Fallback: return main hub
    return ZONES.find((z) => z.key === 'main-hub')!;
  }

  /**
   * Called every frame from OpenWorldScene.update().
   * Emits 'zone-changed' on the EventBus only when the player crosses into a new zone.
   */
  update(worldX: number, worldY: number): void {
    const zone = this.getCurrentZone(worldX, worldY);
    if (zone.key !== this.currentZoneKey) {
      this.currentZoneKey = zone.key;
      EventBus.emit('zone-changed', { zone });
    }
  }
}
