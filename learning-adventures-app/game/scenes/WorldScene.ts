import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Door } from '../entities/Door';
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
    // Placeholder assets - will be replaced with actual pixel art
    // For now, we'll use simple colored rectangles

    // Create a simple placeholder player sprite
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x8B5CF6, 1); // Vivid violet (brand color)
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player-placeholder', 32, 32);
    playerGraphics.destroy();

    // Create placeholder ground tiles
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x90EE90, 1); // Light green for grass
    groundGraphics.fillRect(0, 0, 32, 32);
    groundGraphics.generateTexture('ground-tile', 32, 32);
    groundGraphics.destroy();

    // Create placeholder wall tiles
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x8B4513, 1); // Brown for walls/buildings
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.generateTexture('wall-tile', 32, 32);
    wallGraphics.destroy();

    // Create placeholder path tiles
    const pathGraphics = this.add.graphics();
    pathGraphics.fillStyle(0xD3D3D3, 1); // Light gray for paths
    pathGraphics.fillRect(0, 0, 32, 32);
    pathGraphics.generateTexture('path-tile', 32, 32);
    pathGraphics.destroy();
  }

  create(): void {
    // Create a simple tile-based world (placeholder until we have real tilemaps)
    this.createPlaceholderWorld();

    // Create player at spawn point (center of campus)
    this.player = new Player(this, 640, 360, 'player-placeholder');

    // Configure camera to follow player (top-down perspective)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1); // Adjust zoom level as needed

    // Set world bounds
    this.physics.world.setBounds(0, 0, 1280, 720);

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
    // Create a simple grid-based world
    // Ground layer (grass)
    for (let y = 0; y < 23; y++) {
      for (let x = 0; x < 40; x++) {
        const tile = this.add.image(x * 32, y * 32, 'ground-tile');
        tile.setOrigin(0, 0);
      }
    }

    // Add some paths (horizontal and vertical)
    // Vertical path (center)
    for (let y = 0; y < 23; y++) {
      const tile = this.add.image(19 * 32, y * 32, 'path-tile');
      tile.setOrigin(0, 0);
      const tile2 = this.add.image(20 * 32, y * 32, 'path-tile');
      tile2.setOrigin(0, 0);
    }

    // Horizontal path (center)
    for (let x = 0; x < 40; x++) {
      const tile = this.add.image(x * 32, 11 * 32, 'path-tile');
      tile.setOrigin(0, 0);
      const tile2 = this.add.image(x * 32, 12 * 32, 'path-tile');
      tile2.setOrigin(0, 0);
    }

    // Add Math building placeholder (top center)
    const mathBuildingGroup = this.add.group();
    for (let y = 2; y < 7; y++) {
      for (let x = 17; x < 23; x++) {
        const wall = this.add.image(x * 32, y * 32, 'wall-tile');
        wall.setOrigin(0, 0);
        mathBuildingGroup.add(wall);

        // Add collision (placeholder - will use tilemap collision later)
        const wallBody = this.physics.add.staticImage(x * 32 + 16, y * 32 + 16, 'wall-tile');
        wallBody.setVisible(false);
      }
    }

    // Add interactive door to Math building
    const doorX = 19 * 32 + 16;
    const doorY = 7 * 32 + 16;

    // Create door graphic if it doesn't exist
    if (!this.textures.exists('door-gold-small')) {
      const doorGraphics = this.add.graphics();
      doorGraphics.fillStyle(0xFFD700, 1); // Gold for door
      doorGraphics.fillCircle(16, 16, 16);
      doorGraphics.generateTexture('door-gold-small', 32, 32);
      doorGraphics.destroy();
    }

    // Create interactive Door entity
    const mathDoor = new Door(
      this,
      doorX,
      doorY,
      'door-gold-small',
      'MathBuildingScene', // Target scene
      320, // Spawn X in Math building
      500  // Spawn Y in Math building
    );
    mathDoor.setPromptText('Press SPACE: Enter Math Building');
    this.interactables.push(mathDoor);

    // Add text label
    const mathLabel = this.add.text(19 * 32 + 16, 4 * 32, 'MATH\nBUILDING', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 4, y: 4 },
      align: 'center',
    });
    mathLabel.setOrigin(0.5);

    // Add other buildings (locked - placeholder)
    // Science building (bottom left)
    this.addPlaceholderBuilding(3, 15, 'SCIENCE\n(Coming Soon)', 0x666666);

    // English building (bottom right)
    this.addPlaceholderBuilding(30, 15, 'ENGLISH\n(Coming Soon)', 0x666666);

    // Shop (left side)
    this.addPlaceholderBuilding(3, 8, 'SHOP', 0x14B8A6); // Teal accent

    // Add welcome text
    const welcomeText = this.add.text(640, 60, 'Welcome to Learning Adventures Campus!\nUse WASD or Arrow Keys to move', {
      fontSize: '20px',
      color: '#8B5CF6',
      backgroundColor: '#FFFFFF',
      padding: { x: 10, y: 5 },
      align: 'center',
    });
    welcomeText.setOrigin(0.5);
    welcomeText.setScrollFactor(0); // Fixed to camera (HUD element)
  }

  private addPlaceholderBuilding(x: number, y: number, label: string, color: number): void {
    // Simple 4x4 building
    for (let dy = 0; dy < 4; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        const wall = this.add.rectangle((x + dx) * 32, (y + dy) * 32, 32, 32, color);
        wall.setOrigin(0, 0);
        wall.setStrokeStyle(2, 0x000000);

        // Add collision
        const wallBody = this.physics.add.staticImage((x + dx) * 32 + 16, (y + dy) * 32 + 16, 'wall-tile');
        wallBody.setVisible(false);
      }
    }

    // Add label
    const buildingLabel = this.add.text((x + 2) * 32, (y + 1.5) * 32, label, {
      fontSize: '14px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 4, y: 4 },
      align: 'center',
    });
    buildingLabel.setOrigin(0.5);
  }

  private setupEventListeners(): void {
    // Listen for save position events from Player
    EventBus.on('save-player-position', (data: { x: number; y: number; scene: string }) => {
      // Emit to React to save to backend
      console.log('Saving player position:', data);
      // React component will handle the actual API call
    });
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
    // Clean up interactables before scene stops
    this.interactables.forEach((interactable) => {
      if (interactable && interactable.destroy) {
        interactable.destroy();
      }
    });
    this.interactables = [];
  }

  destroy(): void {
    // Clean up event listeners
    EventBus.off('save-player-position');
    super.destroy();
  }
}
