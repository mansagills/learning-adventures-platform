import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';
import {
  generate,
  TILE_ASSET_KEYS,
  WORLD_COLS,
  WORLD_ROWS,
  TILE_SIZE,
} from '../world/TilemapGenerator';
import { ZoneManager } from '../world/ZoneManager';

// ─── Chunk constants ──────────────────────────────────────────────────────────
const CHUNK_TILE_COLS = 16;  // tiles per chunk horizontally
const CHUNK_TILE_ROWS = 12;  // tiles per chunk vertically
const CHUNK_PIXEL_W = CHUNK_TILE_COLS * TILE_SIZE;  // 1024
const CHUNK_PIXEL_H = CHUNK_TILE_ROWS * TILE_SIZE;  // 768
const WORLD_PIXEL_W = WORLD_COLS * TILE_SIZE;        // 6144
const WORLD_PIXEL_H = WORLD_ROWS * TILE_SIZE;        // 4608
const TOTAL_CHUNK_COLS = WORLD_COLS / CHUNK_TILE_COLS;  // 6
const TOTAL_CHUNK_ROWS = WORLD_ROWS / CHUNK_TILE_ROWS;  // 6

/**
 * OpenWorldScene - Large open campus world (96×72 tiles, 6144×4608px)
 *
 * Replaces WorldScene with camera-driven chunk streaming.
 * The world is divided into a 6×6 grid of 16×12-tile chunks.
 * Only the 3×3 area of chunks surrounding the camera centre is active at any time.
 */
export class OpenWorldScene extends Phaser.Scene {
  private player?: Player;
  private interactables: InteractableObject[] = [];
  private interactKey?: Phaser.Input.Keyboard.Key;
  private zoneManager!: ZoneManager;

  // Chunk streaming state
  private mapData: number[][] = [];
  private chunks: Map<string, Phaser.GameObjects.Group> = new Map();
  private lastCameraChunk = { cx: -1, cy: -1 };

  constructor() {
    super({ key: 'OpenWorldScene' });
  }

  // ─── preload ─────────────────────────────────────────────────────────────────
  preload(): void {
    // Character sprite sheets (384x384, 4 cols × 4 rows, 96x96 per frame)
    this.load.spritesheet('player-human-1',      '/game-assets/sprites/human-1.png',        { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-human-2',      '/game-assets/sprites/human-2.png',        { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-robot-blue',   '/game-assets/sprites/robot-blue.png',     { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-wizard-purple','/game-assets/sprites/wizard-purple.png',  { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-cat-orange',   '/game-assets/sprites/cat-orange.png',     { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-knight-silver','/game-assets/sprites/knight-silver.png',  { frameWidth: 96, frameHeight: 96 });

    // Ground tiles (1024x1024 seamless, displayed at 64x64)
    this.load.image('ground-grass-1',   '/game-assets/tilemaps/grass-plain-1.png');
    this.load.image('ground-grass-2',   '/game-assets/tilemaps/grass-plain-2.png');
    this.load.image('ground-grass-3',   '/game-assets/tilemaps/grass-plain-3.png');
    this.load.image('ground-flowers-1', '/game-assets/tilemaps/grass-flowers-1.png');
    this.load.image('ground-flowers-2', '/game-assets/tilemaps/grass-flowers-2.png');
    this.load.image('ground-path',      '/game-assets/tilemaps/stone-path-1.png');
    this.load.image('ground-dirt',      '/game-assets/tilemaps/dirt-earth-1.png');
    this.load.image('ground-water',     '/game-assets/tilemaps/water-1.png');

    // Building wall tiles
    this.load.image('wall-math-1',     '/game-assets/tilemaps/math-wall-1.png');
    this.load.image('wall-math-2',     '/game-assets/tilemaps/math-wall-2.png');
    this.load.image('wall-math-3',     '/game-assets/tilemaps/math-wall-3.png');
    this.load.image('wall-science-1',  '/game-assets/tilemaps/science-building-1.png');
    this.load.image('wall-english-1',  '/game-assets/tilemaps/english-building-1.png');
    this.load.image('wall-brick-1',    '/game-assets/tilemaps/brick-wall-1.png');

    // Fallback placeholder textures for doors/collision bodies (generated at runtime)
    const g = this.add.graphics();
    g.fillStyle(0xFFD700, 1); g.fillCircle(16, 16, 16);
    g.generateTexture('door-gold-small', 32, 32); g.destroy();

    const g2 = this.add.graphics();
    g2.fillStyle(0x14B8A6, 1); g2.fillCircle(16, 16, 16);
    g2.generateTexture('door-teal-small', 32, 32); g2.destroy();

    const g3 = this.add.graphics();
    g3.fillStyle(0xF59E0B, 1); g3.fillCircle(16, 16, 16);
    g3.generateTexture('door-amber-small', 32, 32); g3.destroy();

    const g4 = this.add.graphics();
    g4.fillStyle(0x000000, 0); g4.fillRect(0, 0, 64, 64);
    g4.generateTexture('wall-tile', 64, 64); g4.destroy();
  }

  // ─── create ──────────────────────────────────────────────────────────────────
  create(): void {
    // Generate tile data for the full 96×72 world
    this.mapData = generate();

    // Set physics world bounds to match open world size
    this.physics.world.setBounds(0, 0, WORLD_PIXEL_W, WORLD_PIXEL_H);

    // Create player at world centre spawn point
    const avatarId = this.game.registry.get('avatarId') as string | undefined;
    const playerTexture = avatarId ? `player-${avatarId}` : 'player-human-1';
    this.player = new Player(this, 3072, 2304, playerTexture);
    this.player.setDepth(10);

    // Initialise zone tracker (pure TS, no Phaser dependency)
    this.zoneManager = new ZoneManager();

    // Emit minimap-position every 100 ms so the React minimap stays in sync
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.player) {
          EventBus.emit('minimap-position', { x: this.player.x, y: this.player.y });
        }
      }
    });

    // Configure camera for open world
    this.cameras.main.setBounds(0, 0, WORLD_PIXEL_W, WORLD_PIXEL_H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Bootstrap chunk streaming (loads the 3×3 chunks around spawn)
    this.createInitialChunks();

    // Setup interaction key (SPACE)
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
    }

    // Wire up EventBus listeners
    this.setupEventListeners();

    // Shutdown cleanup
    this.events.once('shutdown', this.shutdown, this);

    // Signal React that the scene is ready
    EventBus.emit('scene-ready', { scene: 'OpenWorldScene' });

    console.log('OpenWorldScene created — open world ready!');
  }

  // ─── update ──────────────────────────────────────────────────────────────────
  update(time: number, delta: number): void {
    if (this.player) {
      this.player.update(time, delta);
      this.zoneManager.update(this.player.x, this.player.y);

      // Check proximity to all interactables
      this.interactables.forEach((interactable) => {
        interactable.checkPlayerProximity(this.player!.x, this.player!.y);
      });

      // Check for interaction key press
      if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.interactables.forEach((interactable) => {
          interactable.interact();
        });
      }
    }

    // Chunk streaming: check if camera chunk changed
    this.updateChunks();
  }

  // ─── Chunk streaming ─────────────────────────────────────────────────────────

  /** Returns the chunk coordinates that currently contain the camera centre. */
  private getCameraChunk(): { cx: number; cy: number } {
    const cam = this.cameras.main;
    // Use camera centre (scroll + half viewport)
    const camCenterX = cam.scrollX + cam.width / 2;
    const camCenterY = cam.scrollY + cam.height / 2;
    return {
      cx: Math.floor(camCenterX / CHUNK_PIXEL_W),
      cy: Math.floor(camCenterY / CHUNK_PIXEL_H),
    };
  }

  /** Bootstrap: force the first updateChunks() call to run by using a sentinel. */
  private createInitialChunks(): void {
    this.lastCameraChunk = { cx: -99, cy: -99 };
    this.updateChunks();
  }

  /** Create/destroy chunks so only the 3×3 area around the camera is loaded. */
  private updateChunks(): void {
    const { cx, cy } = this.getCameraChunk();
    if (cx === this.lastCameraChunk.cx && cy === this.lastCameraChunk.cy) return;
    this.lastCameraChunk = { cx, cy };

    // Determine which chunks should exist (3×3 around camera)
    const needed = new Set<string>();
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ncx = cx + dx;
        const ncy = cy + dy;
        if (ncx >= 0 && ncx < TOTAL_CHUNK_COLS && ncy >= 0 && ncy < TOTAL_CHUNK_ROWS) {
          needed.add(`${ncx},${ncy}`);
        }
      }
    }

    // Destroy chunks no longer needed
    Array.from(this.chunks.keys()).forEach((key) => {
      if (!needed.has(key)) {
        const [ncx = 0, ncy = 0] = key.split(',').map(Number);
        this.destroyChunk(ncx, ncy);
      }
    });

    // Create chunks that are needed but don't exist yet
    Array.from(needed).forEach((key) => {
      if (!this.chunks.has(key)) {
        const [ncx, ncy] = key.split(',').map(Number);
        this.createChunk(ncx, ncy);
      }
    });
  }

  /** Instantiate all tile images for a single 16×12-tile chunk and group them. */
  private createChunk(cx: number, cy: number): void {
    const key = `${cx},${cy}`;
    if (this.chunks.has(key)) return;

    const group = this.add.group();
    const tileColStart = cx * CHUNK_TILE_COLS;
    const tileRowStart = cy * CHUNK_TILE_ROWS;

    for (let row = tileRowStart; row < tileRowStart + CHUNK_TILE_ROWS; row++) {
      for (let col = tileColStart; col < tileColStart + CHUNK_TILE_COLS; col++) {
        if (row >= WORLD_ROWS || col >= WORLD_COLS) continue;
        const tileIndex = this.mapData[row][col];
        const assetKey = (TILE_ASSET_KEYS as Record<number, string>)[tileIndex] ?? 'ground-grass-1';
        const px = col * TILE_SIZE;
        const py = row * TILE_SIZE;
        const img = this.add.image(px, py, assetKey);
        img.setOrigin(0, 0);
        img.setDisplaySize(TILE_SIZE, TILE_SIZE);
        img.setDepth(0);
        group.add(img);
      }
    }

    this.chunks.set(key, group);
  }

  /** Destroy all tile images inside a chunk and remove it from the map. */
  private destroyChunk(cx: number, cy: number): void {
    const key = `${cx},${cy}`;
    const group = this.chunks.get(key);
    if (group) {
      group.destroy(true); // true = destroys children too
      this.chunks.delete(key);
    }
  }

  // ─── Event listeners ─────────────────────────────────────────────────────────

  private savePositionHandler = (data: { x: number; y: number; scene: string }) => {
    // React world/page.tsx handles the actual API call via its own EventBus listener
    console.log('Saving player position:', data);
  };

  private handleSetAvatar = (data: { avatarId: string }) => {
    if (!this.player) return;
    const textureKey = `player-${data.avatarId}`;
    if (this.textures.exists(textureKey)) {
      this.player.setTexture(textureKey);
      this.player.setDisplaySize(64, 64);
      // Re-play idle animation for the new character
      const idleKey = `${data.avatarId}-idle`;
      if (this.anims.exists(idleKey)) {
        this.player.anims.play(idleKey, true);
      }
      this.game.registry.set('avatarId', data.avatarId);
    }
  };

  private setupEventListeners(): void {
    EventBus.on('save-player-position', this.savePositionHandler);
    EventBus.on('set-avatar', this.handleSetAvatar);
  }

  // ─── shutdown ────────────────────────────────────────────────────────────────
  shutdown(): void {
    EventBus.off('save-player-position', this.savePositionHandler);
    EventBus.off('set-avatar', this.handleSetAvatar);

    // Clean up interactables before scene stops
    this.interactables.forEach((interactable) => {
      if (interactable && interactable.destroy) {
        interactable.destroy();
      }
    });
    this.interactables = [];

    // Destroy all active chunks
    this.chunks.forEach(group => group.destroy(true));
    this.chunks.clear();
  }
}
