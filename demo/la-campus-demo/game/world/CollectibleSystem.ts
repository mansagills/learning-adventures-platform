import * as Phaser from 'phaser';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';

export interface CollectibleConfig {
  id: string;
  x: number;
  y: number;
  xp: number;
  coins: number;
}

// 45 collectibles — 5 per zone (world pixels: tileCol * 64, tileRow * 64)
const COLLECTIBLES: CollectibleConfig[] = [
  // Math Zone (cols 0-31, rows 0-23)
  { id: 'math-1',   x: 256,  y: 640,  xp: 10, coins: 2 },
  { id: 'math-2',   x: 1280, y: 256,  xp: 10, coins: 2 },
  { id: 'math-3',   x: 1792, y: 1152, xp: 10, coins: 2 },
  { id: 'math-4',   x: 640,  y: 1280, xp: 10, coins: 2 },
  { id: 'math-5',   x: 1536, y: 640,  xp: 10, coins: 2 },

  // Library Zone (cols 32-63, rows 0-23)
  { id: 'lib-1',    x: 2304, y: 256,  xp: 10, coins: 2 },
  { id: 'lib-2',    x: 3328, y: 512,  xp: 10, coins: 2 },
  { id: 'lib-3',    x: 3840, y: 1152, xp: 10, coins: 2 },
  { id: 'lib-4',    x: 2432, y: 1280, xp: 10, coins: 2 },
  { id: 'lib-5',    x: 3584, y: 896,  xp: 10, coins: 2 },

  // Science Zone (cols 64-95, rows 0-23)
  { id: 'sci-1',    x: 4352, y: 320,  xp: 10, coins: 2 },
  { id: 'sci-2',    x: 5376, y: 640,  xp: 10, coins: 2 },
  { id: 'sci-3',    x: 4608, y: 1152, xp: 10, coins: 2 },
  { id: 'sci-4',    x: 5760, y: 384,  xp: 10, coins: 2 },
  { id: 'sci-5',    x: 4864, y: 896,  xp: 10, coins: 2 },

  // History Zone (cols 0-31, rows 24-47)
  { id: 'hist-1',   x: 320,  y: 1792, xp: 10, coins: 2 },
  { id: 'hist-2',   x: 1408, y: 2560, xp: 10, coins: 2 },
  { id: 'hist-3',   x: 1792, y: 2048, xp: 10, coins: 2 },
  { id: 'hist-4',   x: 768,  y: 2816, xp: 10, coins: 2 },
  { id: 'hist-5',   x: 1280, y: 2304, xp: 10, coins: 2 },

  // Town Square (cols 32-63, rows 24-47) — better rewards
  { id: 'town-1',   x: 2304, y: 1792, xp: 15, coins: 3 },
  { id: 'town-2',   x: 3712, y: 2560, xp: 15, coins: 3 },
  { id: 'town-3',   x: 2816, y: 2816, xp: 15, coins: 3 },
  { id: 'town-4',   x: 3328, y: 2048, xp: 15, coins: 3 },
  { id: 'town-5',   x: 3072, y: 2304, xp: 15, coins: 3 },

  // English Zone (cols 64-95, rows 24-47)
  { id: 'eng-1',    x: 4352, y: 1920, xp: 10, coins: 2 },
  { id: 'eng-2',    x: 5248, y: 2560, xp: 10, coins: 2 },
  { id: 'eng-3',    x: 5760, y: 1792, xp: 10, coins: 2 },
  { id: 'eng-4',    x: 4736, y: 2816, xp: 10, coins: 2 },
  { id: 'eng-5',    x: 5504, y: 2304, xp: 10, coins: 2 },

  // Nature Park (cols 0-31, rows 48-71) — best rewards
  { id: 'nat-1',    x: 256,  y: 3328, xp: 20, coins: 5 },
  { id: 'nat-2',    x: 1152, y: 3968, xp: 20, coins: 5 },
  { id: 'nat-3',    x: 1792, y: 4352, xp: 20, coins: 5 },
  { id: 'nat-4',    x: 640,  y: 3712, xp: 20, coins: 5 },
  { id: 'nat-5',    x: 1536, y: 4480, xp: 20, coins: 5 },

  // Market Zone (cols 32-63, rows 48-71)
  { id: 'mkt-1',    x: 2304, y: 3328, xp: 10, coins: 2 },
  { id: 'mkt-2',    x: 3328, y: 3840, xp: 10, coins: 2 },
  { id: 'mkt-3',    x: 3840, y: 4352, xp: 10, coins: 2 },
  { id: 'mkt-4',    x: 2688, y: 4224, xp: 10, coins: 2 },
  { id: 'mkt-5',    x: 3712, y: 3456, xp: 10, coins: 2 },

  // Interdisciplinary Zone (cols 64-95, rows 48-71)
  { id: 'inter-1',  x: 4352, y: 3456, xp: 10, coins: 2 },
  { id: 'inter-2',  x: 5376, y: 3968, xp: 10, coins: 2 },
  { id: 'inter-3',  x: 5760, y: 4480, xp: 10, coins: 2 },
  { id: 'inter-4',  x: 4608, y: 4224, xp: 10, coins: 2 },
  { id: 'inter-5',  x: 5120, y: 3712, xp: 10, coins: 2 },
];

/**
 * CollectibleSystem — places 45 star collectibles across the open world (5 per zone).
 *
 * Generates a star texture procedurally and creates InteractableObjects that emit
 * `collectible-collected` on the EventBus when the player interacts with them.
 */
export class CollectibleSystem {
  private scene: Phaser.Scene;
  private objects: InteractableObject[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.generateTexture();
    this.placeAll();
  }

  private generateTexture(): void {
    if (this.scene.textures.exists('collectible-star')) return;
    const g = this.scene.add.graphics();
    g.fillStyle(0xFFD700, 1);
    // Draw a 5-pointed star at centre (16, 16), outer radius 14, inner radius 7
    const cx = 16, cy = 16, points = 5, outerR = 14, innerR = 7;
    const step = (Math.PI * 2) / (points * 2);
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = i * step - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
    g.generateTexture('collectible-star', 32, 32);
    g.destroy();
  }

  private placeAll(): void {
    for (const cfg of COLLECTIBLES) {
      const obj = new InteractableObject(this.scene, cfg.x, cfg.y, 'collectible-star', undefined, 32);
      obj.setPromptText('Press SPACE to collect!');
      obj.setInteractRadius(50);
      const id = cfg.id;
      const xp = cfg.xp;
      const coins = cfg.coins;
      obj.setOnInteract(() => {
        EventBus.emit('collectible-collected', { id, xp, coins });
        obj.destroy();
        this.objects = this.objects.filter(o => o !== obj);
      });
      this.objects.push(obj);
    }
  }

  /** Returns all active collectible objects (for external proximity checks if needed). */
  getObjects(): InteractableObject[] {
    return this.objects;
  }

  destroy(): void {
    this.objects.forEach(o => o.destroy());
    this.objects = [];
  }
}
