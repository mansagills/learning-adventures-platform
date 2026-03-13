import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Door } from '../entities/Door';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';

/**
 * WorldScene - Main campus world (top-down view)
 *
 * This is the main scene where students explore the campus.
 * Buildings, NPCs, and interactive objects are placed here.
 */
export class WorldScene extends Phaser.Scene {
  private player?: Player;
  private groundLayer?: Phaser.Tilemaps.TilemapLayer;
  private wallsLayer?: Phaser.Tilemaps.TilemapLayer;
  private interactables: any[] = [];
  private interactKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'WorldScene' });
  }

  preload(): void {
    // Character sprite sheets (384x384, 4 cols x 4 rows, 96x96 per frame)
    this.load.spritesheet('player-human-1',     '/game-assets/sprites/human-1.png',       { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-human-2',     '/game-assets/sprites/human-2.png',       { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-robot-blue',  '/game-assets/sprites/robot-blue.png',    { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-wizard-purple','/game-assets/sprites/wizard-purple.png',{ frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-cat-orange',  '/game-assets/sprites/cat-orange.png',    { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('player-knight-silver','/game-assets/sprites/knight-silver.png',{ frameWidth: 96, frameHeight: 96 });

    // Ground tiles (1024x1024 seamless, displayed at 64x64)
    this.load.image('ground-grass-1',    '/game-assets/tilemaps/grass-plain-1.png');
    this.load.image('ground-grass-2',    '/game-assets/tilemaps/grass-plain-2.png');
    this.load.image('ground-grass-3',    '/game-assets/tilemaps/grass-plain-3.png');
    this.load.image('ground-flowers-1',  '/game-assets/tilemaps/grass-flowers-1.png');
    this.load.image('ground-flowers-2',  '/game-assets/tilemaps/grass-flowers-2.png');
    this.load.image('ground-path',       '/game-assets/tilemaps/stone-path-1.png');
    this.load.image('ground-dirt',       '/game-assets/tilemaps/dirt-earth-1.png');
    this.load.image('ground-water',      '/game-assets/tilemaps/water-1.png');

    // Building wall tiles
    this.load.image('wall-math-1',       '/game-assets/tilemaps/math-wall-1.png');
    this.load.image('wall-math-2',       '/game-assets/tilemaps/math-wall-2.png');
    this.load.image('wall-math-3',       '/game-assets/tilemaps/math-wall-3.png');
    this.load.image('wall-science-1',    '/game-assets/tilemaps/science-building-1.png');
    this.load.image('wall-english-1',    '/game-assets/tilemaps/english-building-1.png');

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

  create(): void {
    // Create a simple tile-based world (placeholder until we have real tilemaps)
    this.createPlaceholderWorld();

    // Create player at spawn point — default to human-1, overridden by CharacterCreator avatarId
    const avatarId = this.game.registry.get('avatarId') as string | undefined;
    const playerTexture = avatarId ? `player-${avatarId}` : 'player-human-1';
    this.player = new Player(this, 640, 360, playerTexture);

    // Configure camera to follow player (top-down perspective)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1); // Adjust zoom level as needed

    // Set world bounds (20x12 tiles at 64px each)
    this.physics.world.setBounds(0, 0, 1280, 768);

    // Setup interaction key
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
    }

    // Emit scene ready event
    EventBus.emit('scene-ready', { scene: 'WorldScene' });

    // Listen for save position events
    this.setupEventListeners();

    // Add shutdown handler to clean up interactables
    this.events.once('shutdown', this.shutdown, this);

    console.log('WorldScene created - Top-down campus ready!');
  }

  private createPlaceholderWorld(): void {
    const TS = 64; // tile size — 1024px textures scaled to 64x64

    // Ground layer (grass) — alternate 3 variants for visual variety
    const grassKeys = ['ground-grass-1', 'ground-grass-2', 'ground-grass-3'];
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 20; x++) {
        const key = grassKeys[(x + y * 3) % 3];
        const tile = this.add.image(x * TS, y * TS, key);
        tile.setOrigin(0, 0);
        tile.setDisplaySize(TS, TS);
      }
    }

    // Paths — vertical (center columns 9-10)
    for (let y = 0; y < 12; y++) {
      [9, 10].forEach(px => {
        const tile = this.add.image(px * TS, y * TS, 'ground-path');
        tile.setOrigin(0, 0);
        tile.setDisplaySize(TS, TS);
      });
    }

    // Paths — horizontal (center rows 5-6)
    for (let x = 0; x < 20; x++) {
      [5, 6].forEach(py => {
        const tile = this.add.image(x * TS, py * TS, 'ground-path');
        tile.setOrigin(0, 0);
        tile.setDisplaySize(TS, TS);
      });
    }

    // Math building (top center) — cols 8–11 (4 wide), rows 1–3 (3 tall)
    const mathWallKeys = ['wall-math-1', 'wall-math-2', 'wall-math-3'];
    for (let y = 1; y < 4; y++) {
      for (let x = 8; x < 12; x++) {
        const key = mathWallKeys[(x + y) % 3];
        const wall = this.add.image(x * TS, y * TS, key);
        wall.setOrigin(0, 0);
        wall.setDisplaySize(TS, TS);

        const wallBody = this.physics.add.staticImage(x * TS + TS / 2, y * TS + TS / 2, 'wall-tile');
        wallBody.setDisplaySize(TS, TS);
        wallBody.setVisible(false);
        wallBody.refreshBody();
      }
    }

    // Math building border outline
    const mathOutline = this.add.graphics();
    mathOutline.lineStyle(3, 0x6D28D9, 1);
    mathOutline.strokeRect(8 * TS, 1 * TS, 4 * TS, 3 * TS);

    // Math building door tile (bottom-center of building, row 4)
    // Uses door-gold-small placeholder until real door tile arrives from Sorceress
    const mathDoor = new Door(
      this,
      10 * TS,
      4 * TS,
      'door-gold-small',
      'MathBuildingScene',
      320,
      500
    );
    mathDoor.setPromptText('Press SPACE: Enter Math Building');
    this.interactables.push(mathDoor);

    const mathLabel = this.add.text(10 * TS, 2 * TS, 'MATH\nBUILDING', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#00000099',
      padding: { x: 6, y: 4 },
      align: 'center',
    });
    mathLabel.setOrigin(0.5);

    // Science building (bottom left)
    this.addPlaceholderBuilding(1, 7, 'SCIENCE\n(Coming Soon)', 0x14B8A6, 'wall-science-1');
    const scienceOutline = this.add.graphics();
    scienceOutline.lineStyle(3, 0x14B8A6, 1);
    scienceOutline.strokeRect(1 * TS, 7 * TS, 3 * TS, 3 * TS);

    // English building (bottom right)
    this.addPlaceholderBuilding(15, 7, 'ENGLISH\n(Coming Soon)', 0xF59E0B, 'wall-english-1');
    const englishOutline = this.add.graphics();
    englishOutline.lineStyle(3, 0xF59E0B, 1);
    englishOutline.strokeRect(15 * TS, 7 * TS, 3 * TS, 3 * TS);

    // Shop (left side)
    this.addShopBuilding(1, 3);

    // Job Board (right side)
    this.addJobBoardBuilding(16, 3);

    // Welcome text (fixed to camera)
    const welcomeText = this.add.text(640, 40, 'Welcome to Learning Adventures Campus!  WASD / Arrow Keys to move', {
      fontSize: '16px',
      color: '#8B5CF6',
      backgroundColor: '#FFFFFFCC',
      padding: { x: 10, y: 5 },
      align: 'center',
    });
    welcomeText.setOrigin(0.5, 0);
    welcomeText.setScrollFactor(0);
  }

  private addShopBuilding(tileX: number, tileY: number): void {
    const TS = 64;
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        const wall = this.add.image((tileX + dx) * TS, (tileY + dy) * TS, 'wall-science-1');
        wall.setOrigin(0, 0);
        wall.setDisplaySize(TS, TS);
        if (dy < 2) {
          const wb = this.physics.add.staticImage((tileX + dx) * TS + TS / 2, (tileY + dy) * TS + TS / 2, 'wall-tile');
          wb.setDisplaySize(TS, TS);
          wb.setVisible(false);
          wb.refreshBody();
        }
      }
    }
    const shopLabel = this.add.text((tileX + 1.5) * TS, (tileY + 1) * TS, 'SHOP', {
      fontSize: '14px', color: '#FFFFFF', backgroundColor: '#00000099', padding: { x: 4, y: 4 }, align: 'center',
    });
    shopLabel.setOrigin(0.5);

    const shopOutline = this.add.graphics();
    shopOutline.lineStyle(3, 0x14B8A6, 1);
    shopOutline.strokeRect(tileX * TS, tileY * TS, 3 * TS, 3 * TS);

    const shopInteractable = new InteractableObject(this, (tileX + 1.5) * TS, (tileY + 3) * TS, 'door-teal-small');
    shopInteractable.setPromptText('Press SPACE: Open Shop');
    shopInteractable.setOnInteract(() => EventBus.emit('open-shop', {}));
    this.interactables.push(shopInteractable);
  }

  private addJobBoardBuilding(tileX: number, tileY: number): void {
    const TS = 64;
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        const wall = this.add.image((tileX + dx) * TS, (tileY + dy) * TS, 'wall-english-1');
        wall.setOrigin(0, 0);
        wall.setDisplaySize(TS, TS);
        if (dy < 2) {
          const wb = this.physics.add.staticImage((tileX + dx) * TS + TS / 2, (tileY + dy) * TS + TS / 2, 'wall-tile');
          wb.setDisplaySize(TS, TS);
          wb.setVisible(false);
          wb.refreshBody();
        }
      }
    }
    const label = this.add.text((tileX + 1.5) * TS, (tileY + 1) * TS, 'JOB\nBOARD', {
      fontSize: '13px', color: '#FFFFFF', backgroundColor: '#00000099', padding: { x: 4, y: 4 }, align: 'center',
    });
    label.setOrigin(0.5);

    const jobOutline = this.add.graphics();
    jobOutline.lineStyle(3, 0xF59E0B, 1);
    jobOutline.strokeRect(tileX * TS, tileY * TS, 3 * TS, 3 * TS);

    const jobInteractable = new InteractableObject(this, (tileX + 1.5) * TS, (tileY + 3) * TS, 'door-amber-small');
    jobInteractable.setPromptText('Press SPACE: Open Job Board');
    jobInteractable.setOnInteract(() => EventBus.emit('open-job-board', {}));
    this.interactables.push(jobInteractable);
  }

  private addPlaceholderBuilding(x: number, y: number, label: string, _color: number, wallKey: string): void {
    const TS = 64;
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        const wall = this.add.image((x + dx) * TS, (y + dy) * TS, wallKey);
        wall.setOrigin(0, 0);
        wall.setDisplaySize(TS, TS);
        const wb = this.physics.add.staticImage((x + dx) * TS + TS / 2, (y + dy) * TS + TS / 2, 'wall-tile');
        wb.setDisplaySize(TS, TS);
        wb.setVisible(false);
        wb.refreshBody();
      }
    }
    const buildingLabel = this.add.text((x + 1.5) * TS, (y + 1) * TS, label, {
      fontSize: '14px', color: '#FFFFFF', backgroundColor: '#00000099', padding: { x: 4, y: 4 }, align: 'center',
    });
    buildingLabel.setOrigin(0.5);
  }

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

  update(time: number, delta: number): void {
    if (this.player) {
      this.player.update(time, delta);

      // Check proximity to all interactables
      this.interactables.forEach((interactable) => {
        interactable.checkPlayerProximity(this.player!.x, this.player!.y);
      });

      // Check for interaction key press
      if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        // Interact with nearby objects
        this.interactables.forEach((interactable) => {
          interactable.interact();
        });
      }
    }
  }

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
  }

}
