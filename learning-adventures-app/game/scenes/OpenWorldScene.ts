import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Door } from '../entities/Door';
import { NPC } from '../entities/NPC';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';
import {
  generate,
  getBuildingDoorPositions,
  TILE_ASSET_KEYS,
  TILE,
  WORLD_COLS,
  WORLD_ROWS,
  TILE_SIZE,
} from '../world/TilemapGenerator';
import { ZoneManager } from '../world/ZoneManager';
import { WanderingNPC } from '../entities/WanderingNPC';
import { CollectibleSystem } from '../world/CollectibleSystem';

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
  private collectibles?: CollectibleSystem;

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

    // Create player at world centre spawn point (Town Square)
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

    // Place building doors, NPC placeholders, shop, and job board
    this.createInteractables();

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

  // ─── Interactables ───────────────────────────────────────────────────────────

  private createInteractables(): void {
    const doors = getBuildingDoorPositions();

    doors.forEach((config) => {
      const px = config.doorTileCol * TILE_SIZE;
      const py = config.doorTileRow * TILE_SIZE;

      if (config.targetScene) {
        // Fully wired door (Math Building → MathBuildingScene)
        const door = new Door(
          this, px, py,
          'door-gold-small',
          config.targetScene,
          config.spawnX,
          config.spawnY,
        );
        this.interactables.push(door);
      } else {
        // Placeholder NPC for buildings not yet implemented
        const npc = new NPC(
          this, px, py,
          'door-teal-small',
          config.building,
          [{ text: 'Coming soon! Check back later.', speaker: config.building }],
        );
        this.interactables.push(npc);
      }
    });

    // Shop interactable — front of Shop building (cols 5-7, rows 36-38)
    // Position at centre-front: col 6, row 39
    const shop = new InteractableObject(this, 6 * TILE_SIZE, 39 * TILE_SIZE, 'door-teal-small');
    shop.setPromptText('Press SPACE: Open Shop');
    shop.setOnInteract(() => EventBus.emit('open-shop', {}));
    this.interactables.push(shop);

    // Job Board interactable — front of Job Board building (cols 86-88, rows 36-38)
    // Position at centre-front: col 87, row 39
    const jobBoard = new InteractableObject(this, 87 * TILE_SIZE, 39 * TILE_SIZE, 'door-amber-small');
    jobBoard.setPromptText('Press SPACE: Open Job Board');
    jobBoard.setOnInteract(() => EventBus.emit('open-job-board', {}));
    this.interactables.push(jobBoard);

    // Wandering NPCs — 3 per zone (27 total)
    this.createWanderingNPCs();

    // Collectibles — 45 stars (5 per zone)
    this.collectibles = new CollectibleSystem(this);
    // Include collectibles in the proximity loop
    this.interactables.push(...this.collectibles.getObjects());
  }

  private createWanderingNPCs(): void {
    const T = TILE_SIZE;
    // Helper to push a wandering NPC with waypoints
    const addNPC = (name: string, texture: string, waypoints: { x: number; y: number }[], dialog: string) => {
      const start = waypoints[0];
      const npc = new WanderingNPC(this, start.x, start.y, texture, name, [{ text: dialog, speaker: name }]);
      npc.startWandering(waypoints);
      this.interactables.push(npc);
    };

    // Math Zone (cols 0-31, rows 0-23)
    addNPC('Professor Euler',  'door-gold-small',  [{ x: 8*T, y: 10*T }, { x: 20*T, y: 10*T }, { x: 14*T, y: 18*T }], 'Math is the language of the universe!');
    addNPC('Axiom Alice',      'door-teal-small',  [{ x: 4*T, y: 4*T },  { x: 28*T, y: 4*T },  { x: 28*T, y: 20*T }], 'Every problem has a pattern. Find it!');
    addNPC('Count Von Count',  'door-amber-small', [{ x: 16*T, y: 8*T }, { x: 26*T, y: 14*T }, { x: 10*T, y: 20*T }], 'One, two, three — wonderful numbers!');

    // Library Zone (cols 32-63, rows 0-23)
    addNPC('Librarian Owl',    'door-gold-small',  [{ x: 36*T, y: 8*T }, { x: 52*T, y: 8*T },  { x: 44*T, y: 18*T }], 'Shhh... knowledge lives in these halls.');
    addNPC('Scholar Sam',      'door-teal-small',  [{ x: 34*T, y: 14*T }, { x: 58*T, y: 14*T }, { x: 46*T, y: 20*T }], "Books are the world's greatest treasure!");
    addNPC('Dewey',            'door-amber-small', [{ x: 40*T, y: 4*T },  { x: 60*T, y: 20*T }, { x: 34*T, y: 20*T }], 'Everything is organised if you know how to look.');

    // Science Zone (cols 64-95, rows 0-23)
    addNPC('Dr. Bunsen',       'door-gold-small',  [{ x: 70*T, y: 10*T }, { x: 86*T, y: 10*T }, { x: 78*T, y: 20*T }], "Don't forget your safety goggles!");
    addNPC('Lab Rat Rita',     'door-teal-small',  [{ x: 66*T, y: 4*T },  { x: 90*T, y: 4*T },  { x: 78*T, y: 16*T }], 'Hypothesis first, then experiment!');
    addNPC('Newton Jr.',       'door-amber-small', [{ x: 68*T, y: 18*T }, { x: 88*T, y: 6*T },  { x: 80*T, y: 12*T }], 'What goes up must come down — and WHY?');

    // History Zone (cols 0-31, rows 24-47)
    addNPC('Knight Harold',    'door-gold-small',  [{ x: 6*T, y: 28*T }, { x: 26*T, y: 28*T }, { x: 14*T, y: 42*T }], 'Those who forget history are doomed to repeat it!');
    addNPC('Lady Chronos',     'door-teal-small',  [{ x: 4*T, y: 36*T }, { x: 28*T, y: 36*T }, { x: 16*T, y: 44*T }], 'Every era tells a story.');
    addNPC('Fossil Fred',      'door-amber-small', [{ x: 10*T, y: 26*T }, { x: 28*T, y: 44*T }, { x: 4*T, y: 44*T }],  'Dig deep enough and the past reveals itself!');

    // Town Square (cols 32-63, rows 24-47)
    addNPC('Mayor Maple',      'door-gold-small',  [{ x: 40*T, y: 30*T }, { x: 56*T, y: 30*T }, { x: 48*T, y: 44*T }], 'Welcome to the campus, adventurer!');
    addNPC('Courier Coco',     'door-teal-small',  [{ x: 34*T, y: 26*T }, { x: 62*T, y: 26*T }, { x: 48*T, y: 40*T }], 'News travels fast in this town!');
    addNPC('Merchant Mo',      'door-amber-small', [{ x: 36*T, y: 42*T }, { x: 60*T, y: 42*T }, { x: 48*T, y: 34*T }], 'The best deals are right here in town!');

    // English Zone (cols 64-95, rows 24-47)
    addNPC('Grammar Gary',     'door-gold-small',  [{ x: 70*T, y: 28*T }, { x: 88*T, y: 28*T }, { x: 80*T, y: 42*T }], 'A well-placed comma can save a life!');
    addNPC('Poet Penelope',    'door-teal-small',  [{ x: 66*T, y: 36*T }, { x: 92*T, y: 36*T }, { x: 80*T, y: 26*T }], 'Let your words paint a thousand pictures.');
    addNPC('Narrator Nick',    'door-amber-small', [{ x: 68*T, y: 44*T }, { x: 90*T, y: 44*T }, { x: 78*T, y: 32*T }], 'Every story needs a beginning, middle, and end.');

    // Nature Park (cols 0-31, rows 48-71)
    addNPC('Ranger Robin',     'door-gold-small',  [{ x: 8*T, y: 54*T }, { x: 26*T, y: 54*T }, { x: 14*T, y: 66*T }], 'Respect nature and it will reward you!');
    addNPC('Botanist Bea',     'door-teal-small',  [{ x: 4*T, y: 60*T }, { x: 28*T, y: 60*T }, { x: 16*T, y: 70*T }], 'Every plant has a story to tell.');
    addNPC('Tracker Theo',     'door-amber-small', [{ x: 6*T, y: 50*T }, { x: 28*T, y: 68*T }, { x: 4*T, y: 68*T }],  'Follow the path — it always leads somewhere.');

    // Market Zone (cols 32-63, rows 48-71)
    addNPC('Vendor Victor',    'door-gold-small',  [{ x: 36*T, y: 54*T }, { x: 60*T, y: 54*T }, { x: 48*T, y: 66*T }], 'Best prices in the whole campus!');
    addNPC('Baker Bella',      'door-teal-small',  [{ x: 34*T, y: 60*T }, { x: 62*T, y: 60*T }, { x: 48*T, y: 70*T }], 'Freshly baked ideas are always welcome!');
    addNPC('Trader Tomas',     'door-amber-small', [{ x: 38*T, y: 50*T }, { x: 58*T, y: 68*T }, { x: 44*T, y: 68*T }], 'Every trade is an opportunity to learn!');

    // Interdisciplinary Zone (cols 64-95, rows 48-71)
    addNPC('Professor Poly',   'door-gold-small',  [{ x: 70*T, y: 54*T }, { x: 88*T, y: 54*T }, { x: 80*T, y: 66*T }], 'The best ideas cross every boundary!');
    addNPC('Crossroads Casey', 'door-teal-small',  [{ x: 66*T, y: 60*T }, { x: 92*T, y: 60*T }, { x: 78*T, y: 50*T }], 'Where subjects meet, magic happens!');
    addNPC('Fusion Felix',     'door-amber-small', [{ x: 68*T, y: 70*T }, { x: 90*T, y: 70*T }, { x: 80*T, y: 58*T }], 'Mix math with art, science with poetry!');
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

        // Add invisible static physics body for wall tiles so player cannot walk through
        if (
          tileIndex === TILE.WALL_MATH ||
          tileIndex === TILE.WALL_SCI ||
          tileIndex === TILE.WALL_ENG ||
          tileIndex === TILE.WALL_BRICK
        ) {
          const wall = this.physics.add.staticImage(
            px + TILE_SIZE / 2,
            py + TILE_SIZE / 2,
            'wall-tile',
          );
          wall.setVisible(false).setDisplaySize(TILE_SIZE, TILE_SIZE).refreshBody();
          if (this.player) {
            this.physics.add.collider(this.player, wall);
          }
          group.add(wall);
        }
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

    // Destroy collectible system
    this.collectibles?.destroy();
    this.collectibles = undefined;

    // Destroy all active chunks
    this.chunks.forEach(group => group.destroy(true));
    this.chunks.clear();
  }
}
