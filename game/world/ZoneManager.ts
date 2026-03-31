import { EventBus } from '@/components/phaser/EventBus';

export interface ZoneInfo {
  name: string;
  key: string;
  color: number;  // hex for minimap rendering
  pixelX: number;
  pixelY: number;
  pixelW: number;  // always 2048
  pixelH: number;  // always 1536
}

const ZONE_W = 2048;
const ZONE_H = 1536;

const ZONES: ZoneInfo[] = [
  { key: 'math',              name: 'Math Zone',          color: 0x8B5CF6, pixelX: 0,    pixelY: 0,    pixelW: ZONE_W, pixelH: ZONE_H },
  { key: 'library',           name: 'Library',            color: 0x3B82F6, pixelX: 2048, pixelY: 0,    pixelW: ZONE_W, pixelH: ZONE_H },
  { key: 'science',           name: 'Science Zone',       color: 0x14B8A6, pixelX: 4096, pixelY: 0,    pixelW: ZONE_W, pixelH: ZONE_H },
  { key: 'history',           name: 'History Zone',       color: 0xF59E0B, pixelX: 0,    pixelY: 1536, pixelW: ZONE_W, pixelH: ZONE_H },
  { key: 'town-square',       name: 'Town Square',        color: 0x10B981, pixelX: 2048, pixelY: 1536, pixelW: ZONE_W, pixelH: ZONE_H },
  { key: 'english',           name: 'English Zone',       color: 0xEC4899, pixelX: 4096, pixelY: 1536, pixelW: ZONE_W, pixelH: ZONE_H },
  { key: 'nature',            name: 'Nature Park',        color: 0x22C55E, pixelX: 0,    pixelY: 3072, pixelW: ZONE_W, pixelH: ZONE_H },
  { key: 'market',            name: 'Market',             color: 0xEF4444, pixelX: 2048, pixelY: 3072, pixelW: ZONE_W, pixelH: ZONE_H },
  { key: 'interdisciplinary', name: 'Interdisciplinary',  color: 0xA78BFA, pixelX: 4096, pixelY: 3072, pixelW: ZONE_W, pixelH: ZONE_H },
];

/**
 * ZoneManager — plain TypeScript class (no Phaser dependency).
 *
 * Tracks which of the 9 campus zones the player is currently in and emits
 * a 'zone-changed' event on the EventBus whenever the player crosses a boundary.
 *
 * Usage:
 *   const zm = new ZoneManager();
 *   // In OpenWorldScene.update():
 *   zm.update(this.player.x, this.player.y);
 */
export class ZoneManager {
  private currentZoneKey: string = '';

  /** Returns the static array of all 9 zones (used by Minimap). */
  getZones(): ZoneInfo[] {
    return ZONES;
  }

  /**
   * Returns the ZoneInfo that contains the given world coordinates.
   * Falls back to town-square if no zone matches (should not happen in a valid world).
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
    // Fallback: return town-square
    return ZONES.find((z) => z.key === 'town-square')!;
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
