import * as Phaser from 'phaser';
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
  private isExiting = false;

  constructor() {
    super({ key: 'MathBuildingScene' });
  }

  init(data: { spawnX?: number; spawnY?: number; fromScene?: string }) {
    // Store spawn position and origin scene from transition data so the exit
    // door returns to whichever world variant the player came from.
    this.registry.set('spawnX', data.spawnX || 320);
    this.registry.set('spawnY', data.spawnY || 500);
    this.registry.set('mathBuildingFromScene', data.fromScene || 'OpenWorldScene');
  }

  preload(): void {
    // Interior tiles (1024x1024, displayed at 64x64)
    this.load.image('floor-wood-1',   '/game-assets/tilemaps/wood-floor-1.png');
    this.load.image('floor-wood-2',   '/game-assets/tilemaps/wood-floor-2.png');
    this.load.image('floor-wood-3',   '/game-assets/tilemaps/wood-floor-3.png');
    this.load.image('floor-stone-1',  '/game-assets/tilemaps/stone-floor-1.png');
    this.load.image('wall-brick-1',   '/game-assets/tilemaps/brick-wall-1.png');
    this.load.image('wall-brick-2',   '/game-assets/tilemaps/brick-wall-2.png');
    this.load.image('wall-brick-3',   '/game-assets/tilemaps/brick-wall-3.png');

    // Interior objects (1024x1024, displayed at 64x64)
    this.load.image('arcade-cabinet', '/game-assets/tilemaps/arcade-cabinet.png');
    this.load.image('desk-computer',  '/game-assets/tilemaps/desk-computer.png');
    this.load.image('door-interior',  '/game-assets/tilemaps/door-interior.png');
    this.load.image('npc-teacher',    '/game-assets/tilemaps/npc-teacher.png');

    // Character sprite sheets — force reload by removing stale global cache entries first
    const chars = ['human-1','human-2','robot-blue','wizard-purple','cat-orange','knight-silver'];
    chars.forEach(c => {
      const key = `player-${c}`;
      this.load.spritesheet(key, `/game-assets/sprites/${c}.png`, { frameWidth: 96, frameHeight: 96 });
    });

  }

  create(): void {
    // Collision placeholder (invisible)
    if (!this.textures.exists('wall-tile')) {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0);
      g.fillRect(0, 0, 64, 64);
      g.generateTexture('wall-tile', 64, 64);
      g.destroy();
    }

    // Create player FIRST so wall/arcade colliders can reference it
    const spawnX = this.registry.get('spawnX') as number;
    const spawnY = this.registry.get('spawnY') as number;
    const avatarId = this.game.registry.get('avatarId') as string | undefined;
    const requestedTexture = avatarId ? `player-${avatarId}` : 'player-human-1';
    const playerTexture = this.textures.exists(requestedTexture)
      ? requestedTexture
      : 'player-human-1';
    this.player = new Player(this, spawnX, spawnY, playerTexture);

    // Build the interior (walls and arcade colliders need this.player)
    this.createInterior();

    // Keep the small interior room fixed on screen while the avatar moves inside it.
    this.cameras.main.setBounds(0, 0, 640, 640);
    this.cameras.main.centerOn(320, 320);
    this.cameras.main.setZoom(1);
    this.cameras.main.fadeIn(500);

    // Set world bounds to the full 10x10 room. Wall colliders define blocked edges.
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

  // Placeholder textures method removed — real assets loaded in preload()

  private createInterior(): void {
    const TS = 64;
    const floorKeys = ['floor-wood-1', 'floor-wood-2', 'floor-wood-3'];

    // Create floor (10x10 tiles at 64px)
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const key = floorKeys[(x + y * 2) % 3];
        const floor = this.add.image(x * TS, y * TS, key);
        floor.setOrigin(0, 0);
        floor.setDisplaySize(TS, TS);
      }
    }

    // Create walls (room boundaries)
    this.createWalls();

    // Add title (fixed to camera)
    const title = this.add.text(320, 16, 'QUANTUM LAB', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#9b5cff',
      backgroundColor: '#050810CC',
      padding: { x: 10, y: 6 },
      align: 'center',
    });
    title.setOrigin(0.5, 0);
    title.setScrollFactor(0);

    // Place game stations (5 arcade cabinets)
    this.createGameStations();

    // Create Professor Numbers NPC
    this.createMathTeacher();

    // Create exit door
    this.createExitDoor();
  }

  private createWalls(): void {
    const TS = 64;
    // Border walls (10 tiles wide, 10 tall)
    for (let x = 0; x < 10; x++) {
      this.createWall(x * TS, 0);           // Top
      if (x < 4 || x > 6) {
        this.createWall(x * TS, 9 * TS);    // Bottom, with doorway gap
      }
    }
    for (let y = 1; y < 9; y++) {
      this.createWall(0, y * TS);            // Left
      this.createWall(9 * TS, y * TS);      // Right
    }
  }

  private createWall(x: number, y: number): void {
    const TS = 64;
    const brickKeys = ['wall-brick-1', 'wall-brick-2', 'wall-brick-3'];
    const key = brickKeys[Math.floor((x / TS + y / TS) % 3)];
    const wall = this.add.image(x, y, key);
    wall.setOrigin(0, 0);
    wall.setDisplaySize(TS, TS);

    const wallBody = this.physics.add.staticImage(x + TS / 2, y + TS / 2, 'wall-tile');
    wallBody.setDisplaySize(TS, TS);
    wallBody.setVisible(false);
    wallBody.refreshBody();

    if (this.player) {
      this.physics.add.collider(this.player, wallBody);
    }
  }

  private createGameStations(): void {
    // 10x10 tile interior at 64px — place 5 stations in a cross pattern
    const stations = [
      { x: 2 * 64, y: 2 * 64, gameId: 'pizza-fraction-frenzy',      name: 'Pizza Fractions' },
      { x: 7 * 64, y: 2 * 64, gameId: 'math-race-rally',             name: 'Math Race Rally' },
      { x: 2 * 64, y: 6 * 64, gameId: 'multiplication-bingo-bonanza',name: 'Multiplication Bingo' },
      { x: 7 * 64, y: 6 * 64, gameId: 'number-monster-feeding',       name: 'Number Monsters' },
      { x: 4 * 64 + 32, y: 4 * 64, gameId: 'math-jeopardy-junior',   name: 'Math Jeopardy' },
    ];

    stations.forEach((station) => {
      const arcade = new InteractableObject(this, station.x, station.y, 'arcade-cabinet');
      arcade.setPromptText(`Press SPACE: ${station.name}`);
      arcade.setOnInteract(() => this.playGame(station.gameId));

      const label = this.add.text(station.x, station.y - 40, station.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px', color: '#ccddff', backgroundColor: '#050810CC',
        padding: { x: 3, y: 2 }, align: 'center',
      });
      label.setOrigin(0.5);

      this.interactables.push(arcade);

      if (this.player) {
        const arcadeBody = this.physics.add.staticImage(station.x, station.y, 'wall-tile');
        arcadeBody.setDisplaySize(64, 64);
        arcadeBody.setVisible(false);
        arcadeBody.refreshBody();
        this.physics.add.collider(this.player, arcadeBody);
      }
    });
  }

  private createMathTeacher(): void {
    const teacher = new NPC(
      this,
      5 * 64, 3 * 64,
      'npc-teacher',
      'Professor Numbers',
      [
        { text: 'Professor Ivy told me you were coming. Your first Math Lab quest is ready.' },
        { text: 'Start Math Race Rally from the Quest Board, solve the challenge, and bring your result back to campus.' },
        { text: 'Quest reward: 100 XP and the Math Explorer badge. Let us begin!' },
      ],
      () => EventBus.emit('open-job-board', {}),
    );
    this.interactables.push(teacher);

    const nameLabel = this.add.text(5 * 64, 3 * 64 - 40, 'Prof. Numbers', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#9b5cff', backgroundColor: '#050810CC',
      padding: { x: 4, y: 2 }, align: 'center',
    });
    nameLabel.setOrigin(0.5);
  }

  private createExitDoor(): void {
    const returnScene =
      (this.registry.get('mathBuildingFromScene') as string | undefined) ??
      'OpenWorldScene';
    const exitDoor = Door.createExitDoor(
      this,
      5 * 64, 8 * 64,
      'door-interior',
      returnScene,
      14 * 64,
      32 * 64
    );
    exitDoor.setInteractRadius(96);
    this.interactables.push(exitDoor);

    const exitPad = this.add.rectangle(5 * 64, 8 * 64, 160, 80, 0xffb300, 0.28);
    exitPad.setStrokeStyle(3, 0xfff1a6, 0.9);
    exitPad.setDepth(1);

    const exitLabel = this.add.text(5 * 64, 8 * 64 - 58, 'EXIT TO CAMPUS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffb300', backgroundColor: '#050810CC',
      padding: { x: 6, y: 4 }, align: 'center',
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
      this.checkExitZone();

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

  private checkExitZone(): void {
    if (!this.player || this.isExiting) return;

    const isInExitColumn = this.player.x >= 240 && this.player.x <= 400;
    const isAtExitThreshold = this.player.y >= 472;
    if (!isInExitColumn || !isAtExitThreshold) return;

    this.isExiting = true;
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop();
      this.scene.start('OpenWorldScene', {
        spawnX: 14 * 64,
        spawnY: 32 * 64,
        fromScene: this.scene.key,
      });
    });
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

}
