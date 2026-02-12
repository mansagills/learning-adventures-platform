import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Door } from '../entities/Door';
import { NPC } from '../entities/NPC';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';

/**
 * MathBuildingScene - Interior of Math building (top-down view)
 *
 * Contains:
 * - 5 game stations (arcade cabinets/computers)
 * - Math Teacher NPC
 * - Exit door back to campus
 */
export class MathBuildingScene extends Phaser.Scene {
  private player?: Player;
  private interactables: InteractableObject[] = [];
  private interactKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'MathBuildingScene' });
  }

  init(data: { spawnX?: number; spawnY?: number; fromScene?: string }) {
    // Store spawn position from scene transition
    this.registry.set('spawnX', data.spawnX || 320);
    this.registry.set('spawnY', data.spawnY || 500);
  }

  preload(): void {
    // Placeholder assets will be created in create()
  }

  create(): void {
    // Create placeholder textures
    this.createPlaceholderTextures();

    // Build the interior
    this.createInterior();

    // Create player at spawn point
    const spawnX = this.registry.get('spawnX') as number;
    const spawnY = this.registry.get('spawnY') as number;
    this.player = new Player(this, spawnX, spawnY, 'player-placeholder');

    // Configure camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.fadeIn(500);

    // Set world bounds
    this.physics.world.setBounds(0, 0, 640, 640);

    // Setup interaction key
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
    }

    // Emit scene ready
    EventBus.emit('scene-ready', { scene: 'MathBuildingScene' });

    // Add shutdown handler to clean up interactables
    this.events.once('shutdown', this.shutdown, this);

    console.log('MathBuildingScene created - Math building interior ready!');
  }

  private createPlaceholderTextures(): void {
    // Floor tiles (light wood)
    if (!this.textures.exists('floor-wood')) {
      const floorGraphics = this.add.graphics();
      floorGraphics.fillStyle(0xDEB887, 1);
      floorGraphics.fillRect(0, 0, 32, 32);
      floorGraphics.lineStyle(1, 0xC0A070, 0.3);
      floorGraphics.strokeRect(0, 0, 32, 32);
      floorGraphics.generateTexture('floor-wood', 32, 32);
      floorGraphics.destroy();
    }

    // Wall tiles (red brick)
    if (!this.textures.exists('wall-brick')) {
      const wallGraphics = this.add.graphics();
      wallGraphics.fillStyle(0xB22222, 1);
      wallGraphics.fillRect(0, 0, 32, 32);
      wallGraphics.lineStyle(2, 0x8B0000, 1);
      wallGraphics.strokeRect(0, 0, 32, 32);
      wallGraphics.generateTexture('wall-brick', 32, 32);
      wallGraphics.destroy();
    }

    // Arcade cabinet (purple)
    if (!this.textures.exists('arcade-cabinet')) {
      const arcadeGraphics = this.add.graphics();
      arcadeGraphics.fillStyle(0x8B5CF6, 1);
      arcadeGraphics.fillRoundedRect(0, 0, 32, 40, 4);
      arcadeGraphics.fillStyle(0x000000, 1);
      arcadeGraphics.fillRect(4, 4, 24, 20); // Screen
      arcadeGraphics.generateTexture('arcade-cabinet', 32, 40);
      arcadeGraphics.destroy();
    }

    // Door (gold)
    if (!this.textures.exists('door-gold')) {
      const doorGraphics = this.add.graphics();
      doorGraphics.fillStyle(0xFFD700, 1);
      doorGraphics.fillRect(0, 0, 32, 48);
      doorGraphics.lineStyle(2, 0xB8860B, 1);
      doorGraphics.strokeRect(0, 0, 32, 48);
      doorGraphics.generateTexture('door-gold', 32, 48);
      doorGraphics.destroy();
    }

    // NPC (orange - Math Teacher)
    if (!this.textures.exists('npc-teacher')) {
      const npcGraphics = this.add.graphics();
      npcGraphics.fillStyle(0xFF8C00, 1);
      npcGraphics.fillCircle(16, 16, 16);
      npcGraphics.fillStyle(0xFFFFFF, 1);
      npcGraphics.fillCircle(12, 12, 4); // Eyes
      npcGraphics.fillCircle(20, 12, 4);
      npcGraphics.generateTexture('npc-teacher', 32, 32);
      npcGraphics.destroy();
    }
  }

  private createInterior(): void {
    // Create floor (20x20 tiles)
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        const floor = this.add.image(x * 32, y * 32, 'floor-wood');
        floor.setOrigin(0, 0);
      }
    }

    // Create walls (room boundaries)
    this.createWalls();

    // Add title
    const title = this.add.text(320, 40, 'MATH BUILDING', {
      fontSize: '24px',
      color: '#8B5CF6',
      backgroundColor: '#FFFFFF',
      padding: { x: 10, y: 5 },
      align: 'center',
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0); // Fixed to camera

    // Place game stations (5 arcade cabinets)
    this.createGameStations();

    // Create Math Teacher NPC
    this.createMathTeacher();

    // Create exit door
    this.createExitDoor();
  }

  private createWalls(): void {
    // Top wall
    for (let x = 0; x < 20; x++) {
      this.createWall(x * 32, 0);
    }

    // Bottom wall
    for (let x = 0; x < 20; x++) {
      this.createWall(x * 32, 19 * 32);
    }

    // Left wall
    for (let y = 1; y < 19; y++) {
      this.createWall(0, y * 32);
    }

    // Right wall
    for (let y = 1; y < 19; y++) {
      this.createWall(19 * 32, y * 32);
    }

    // Internal walls (create rooms)
    // Vertical divider (left side)
    for (let y = 1; y < 10; y++) {
      this.createWall(7 * 32, y * 32);
    }

    // Vertical divider (right side)
    for (let y = 1; y < 10; y++) {
      this.createWall(12 * 32, y * 32);
    }
  }

  private createWall(x: number, y: number): void {
    const wall = this.add.image(x, y, 'wall-brick');
    wall.setOrigin(0, 0);

    // Add collision
    const wallBody = this.physics.add.staticImage(x + 16, y + 16, 'wall-brick');
    wallBody.setVisible(false);

    if (this.player) {
      this.physics.add.collider(this.player, wallBody);
    }
  }

  private createGameStations(): void {
    // Game stations with their adventure IDs (matching actual HTML files)
    const stations = [
      { x: 160, y: 160, gameId: 'pizza-fraction-frenzy', name: 'Pizza Fractions' },
      { x: 480, y: 160, gameId: 'math-race-rally', name: 'Math Race Rally' },
      { x: 160, y: 320, gameId: 'multiplication-bingo-bonanza', name: 'Multiplication Bingo' },
      { x: 480, y: 320, gameId: 'number-monster-feeding', name: 'Number Monsters' },
      { x: 320, y: 480, gameId: 'math-jeopardy-junior', name: 'Math Jeopardy' },
    ];

    stations.forEach((station) => {
      const arcade = new InteractableObject(
        this,
        station.x,
        station.y,
        'arcade-cabinet'
      );

      arcade.setPromptText(`Press SPACE: ${station.name}`);
      arcade.setOnInteract(() => this.playGame(station.gameId));

      // Add label above arcade
      const label = this.add.text(station.x, station.y - 50, station.name, {
        fontSize: '12px',
        color: '#000000',
        backgroundColor: '#FFFFFF',
        padding: { x: 4, y: 2 },
        align: 'center',
      });
      label.setOrigin(0.5);

      this.interactables.push(arcade);

      // Add collision if player exists
      if (this.player) {
        // Create a small collision body around the arcade
        const arcadeBody = this.physics.add.staticImage(station.x, station.y, 'arcade-cabinet');
        arcadeBody.setVisible(false);
        this.physics.add.collider(this.player, arcadeBody);
      }
    });
  }

  private createMathTeacher(): void {
    const teacher = new NPC(
      this,
      320,
      200,
      'npc-teacher',
      'Ms. Numbers',
      [
        { text: 'Welcome to the Math Building! 🎓' },
        { text: 'Try out our fun math games at the arcade stations!' },
        { text: 'Each game will help you practice different math skills.' },
        { text: 'Have fun learning!' },
      ]
    );

    this.interactables.push(teacher);

    // Add name label
    const nameLabel = this.add.text(320, 160, 'Ms. Numbers\n(Math Teacher)', {
      fontSize: '12px',
      color: '#FFFFFF',
      backgroundColor: '#FF8C00',
      padding: { x: 4, y: 2 },
      align: 'center',
    });
    nameLabel.setOrigin(0.5);
  }

  private createExitDoor(): void {
    // Exit door at bottom center
    const exitDoor = Door.createExitDoor(
      this,
      320,
      600,
      'door-gold',
      'WorldScene',
      640, // Spawn back at center of campus
      360
    );

    this.interactables.push(exitDoor);

    // Add "EXIT" label
    const exitLabel = this.add.text(320, 560, 'EXIT', {
      fontSize: '16px',
      color: '#000000',
      backgroundColor: '#FFD700',
      padding: { x: 6, y: 3 },
      align: 'center',
    });
    exitLabel.setOrigin(0.5);
  }

  private playGame(gameId: string): void {
    console.log(`Playing game: ${gameId}`);

    // Emit event to React to open game embed modal
    EventBus.emit('open-adventure', {
      adventureId: gameId,
      type: 'game',
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
    EventBus.off('close-adventure');
    super.destroy();
  }
}
