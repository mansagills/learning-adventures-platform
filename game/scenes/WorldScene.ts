import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { InteractableObject } from '../entities/InteractableObject';
import { NPC } from '../entities/NPC';
import { EventBus } from '@/components/phaser/EventBus';

/**
 * BuildingZone — tracks whether the player is inside a building footprint.
 * Used to gate interior station/NPC interactions (no visual transition needed;
 * buildings are always-open/visible as part of the campus).
 */
interface BuildingZone {
  id: string;
  footprint: Phaser.Geom.Rectangle; // world-pixel rect covering the interior
  playerInside: boolean;
}

/**
 * WorldScene — Main campus world (top-down, always-open buildings).
 *
 * Layout (20 cols × 14 rows at 64 px/tile = 1280 × 896 world pixels):
 *
 *   Rows 0–5:  Math Building (cols 7–12, 6 × 6 tiles)
 *              Interior floor visible at all times (Necesse-style open top).
 *              South wall has a door gap at col 10 — player walks straight in.
 *   Rows 6–7:  Horizontal campus path (all cols)
 *   Rows 8–13: Lower campus — vertical path (cols 9–10), Science (placeholder),
 *              English (placeholder)
 *   Shop   : cols 1–3,  rows 2–4
 *   Job Board: cols 16–18, rows 2–4
 *
 * Buildings are rendered as a flat tile layer — no scene transitions.
 * Interior stations and NPCs live in WorldScene and only respond to the player
 * when the player is inside the matching BuildingZone.
 *
 * === SPRITE UPGRADE NOTE ===
 * When new Necesse-style 192×192 character sheets arrive from Sorceress:
 *   1. Update frameWidth / frameHeight in preload() to 48.
 *   2. Update animation row layout in Player.ts (see comment there).
 *   3. Update Player body.setSize / setOffset for the smaller frame.
 */
/** Quest status per buildingId — 'available' | 'in_progress' | 'completed' | 'none' */
type BuildingQuestStatus = 'available' | 'in_progress' | 'completed' | 'none';

export class WorldScene extends Phaser.Scene {
  private player?: Player;
  private wallGroup?: Phaser.Physics.Arcade.StaticGroup;

  /** Outdoor interactables (shop door, job board door). */
  private interactables: InteractableObject[] = [];

  /** Interior interactables keyed by buildingId. */
  private interiorInteractables: Map<string, InteractableObject[]> = new Map();

  /** Building footprint zones for player-inside detection. */
  private buildings: BuildingZone[] = [];

  private interactKey?: Phaser.Input.Keyboard.Key;

  /**
   * Quest marker text objects — keyed by buildingId.
   * '!' (yellow) = quests available/in-progress, '✓' (green) = all completed.
   */
  private questMarkers: Map<string, Phaser.GameObjects.Text> = new Map();
  private questMarkerTween: Map<string, Phaser.Tweens.Tween> = new Map();

  constructor() {
    super({ key: 'WorldScene' });
  }

  // ---------------------------------------------------------------------------
  // PRELOAD
  // ---------------------------------------------------------------------------

  preload(): void {
    // Character sprite sheets (384×384, 4 cols × 4 rows, 96×96 per frame).
    // TODO: when new 192×192 Necesse-style sheets arrive, change frameWidth/frameHeight to 48.
    const chars = ['human-1', 'human-2', 'robot-blue', 'wizard-purple', 'cat-orange', 'knight-silver'];
    chars.forEach(c =>
      this.load.spritesheet(`player-${c}`, `/game-assets/sprites/${c}.png`, {
        frameWidth: 96, frameHeight: 96,
      })
    );

    // Ground tiles
    this.load.image('ground-grass-1', '/game-assets/tilemaps/grass-plain-1.png');
    this.load.image('ground-grass-2', '/game-assets/tilemaps/grass-plain-2.png');
    this.load.image('ground-grass-3', '/game-assets/tilemaps/grass-plain-3.png');
    this.load.image('ground-path',    '/game-assets/tilemaps/stone-path-1.png');

    // Exterior building wall tiles
    this.load.image('wall-math-1',    '/game-assets/tilemaps/math-wall-1.png');
    this.load.image('wall-math-2',    '/game-assets/tilemaps/math-wall-2.png');
    this.load.image('wall-math-3',    '/game-assets/tilemaps/math-wall-3.png');
    this.load.image('wall-science-1', '/game-assets/tilemaps/science-building-1.png');
    this.load.image('wall-english-1', '/game-assets/tilemaps/english-building-1.png');

    // Interior floor tiles (always visible inside Math Building)
    this.load.image('floor-wood-1', '/game-assets/tilemaps/wood-floor-1.png');
    this.load.image('floor-wood-2', '/game-assets/tilemaps/wood-floor-2.png');
    this.load.image('floor-wood-3', '/game-assets/tilemaps/wood-floor-3.png');

    // Interior objects
    this.load.image('arcade-cabinet', '/game-assets/tilemaps/arcade-cabinet.png');
    this.load.image('desk-computer',  '/game-assets/tilemaps/desk-computer.png');
    this.load.image('npc-teacher',    '/game-assets/tilemaps/npc-teacher.png');

    // Interior wall tiles (brick perimeter inside Math Building)
    this.load.image('wall-brick-1', '/game-assets/tilemaps/brick-wall-1.png');
    this.load.image('wall-brick-2', '/game-assets/tilemaps/brick-wall-2.png');
    this.load.image('wall-brick-3', '/game-assets/tilemaps/brick-wall-3.png');

    // Invisible physics texture + small door icons (generated at runtime)
    this.generatePlaceholderTextures();
  }

  private generatePlaceholderTextures(): void {
    const colorDots: Array<{ key: string; color: number }> = [
      { key: 'door-teal-small',  color: 0x14B8A6 },
      { key: 'door-amber-small', color: 0xF59E0B },
    ];
    colorDots.forEach(({ key, color }) => {
      if (!this.textures.exists(key)) {
        const g = this.add.graphics();
        g.fillStyle(color, 1).fillCircle(16, 16, 16);
        g.generateTexture(key, 32, 32);
        g.destroy();
      }
    });
    if (!this.textures.exists('wall-tile')) {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0).fillRect(0, 0, 64, 64);
      g.generateTexture('wall-tile', 64, 64);
      g.destroy();
    }
  }

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------

  create(): void {
    // Wall group must exist before createWorld() draws buildings.
    this.wallGroup = this.physics.add.staticGroup();

    this.createWorld();

    // Player spawns on the path just south of the Math Building entrance.
    const avatarId = this.game.registry.get('avatarId') as string | undefined;
    const texture  = avatarId ? `player-${avatarId}` : 'player-human-1';
    this.player = new Player(this, 10 * 64, 7 * 64, texture);
    this.player.setDepth(4);

    // Player collides with all wall bodies.
    this.physics.add.collider(this.player, this.wallGroup);

    // Camera follows player; world is 1280 × 896 (20 × 14 tiles at 64 px).
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, 20 * 64, 14 * 64);
    this.physics.world.setBounds(0, 0, 20 * 64, 14 * 64);

    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    EventBus.emit('scene-ready', { scene: 'WorldScene' });
    this.setupEventListeners();
    this.events.once('shutdown', this.shutdown, this);

    console.log('WorldScene created — always-open campus ready!');
  }

  // ---------------------------------------------------------------------------
  // WORLD CONSTRUCTION
  // ---------------------------------------------------------------------------

  private createWorld(): void {
    const TS = 64;

    // — Ground (depth 0) -------------------------------------------------------
    const grassKeys = ['ground-grass-1', 'ground-grass-2', 'ground-grass-3'];
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 20; x++) {
        const key = grassKeys[(x * 3 + y * 7) % 3];
        this.add.image(x * TS, y * TS, key)
          .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(0);
      }
    }

    // — Paths (depth 1) --------------------------------------------------------
    // Horizontal path: rows 6–7 (full width)
    for (let x = 0; x < 20; x++) {
      [6, 7].forEach(py => {
        this.add.image(x * TS, py * TS, 'ground-path')
          .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(1);
      });
    }
    // Vertical path: cols 9–10, rows 8–13 (below horizontal)
    for (let y = 8; y < 14; y++) {
      [9, 10].forEach(px => {
        this.add.image(px * TS, y * TS, 'ground-path')
          .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(1);
      });
    }

    // — Buildings (depth 2–3) --------------------------------------------------
    this.createMathBuilding();
    this.createShopBuilding();
    this.createJobBoardBuilding();

    // Horizontal connector paths at row 13 so player can walk to science/english doors.
    for (let x = 3; x <= 9; x++) {
      this.add.image(x * TS, 13 * TS, 'ground-path')
        .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(1);
    }
    for (let x = 10; x <= 16; x++) {
      this.add.image(x * TS, 13 * TS, 'ground-path')
        .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(1);
    }

    // Open-interior buildings (Science + English)
    this.createScienceBuilding();
    this.createEnglishBuilding();

    // — HUD hint (fixed to camera, depth 10) -----------------------------------
    this.add.text(640, 10,
      'WASD to move  ·  SPACE to interact',
      { fontSize: '13px', color: '#8B5CF6', backgroundColor: '#FFFFFFCC', padding: { x: 8, y: 4 } }
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10);
  }

  // ---------------------------------------------------------------------------
  // MATH BUILDING — always-open interior
  // ---------------------------------------------------------------------------
  //
  // Footprint: cols 7–12 (6 tiles), rows 0–5 (6 tiles).
  // Interior floor: rows 1–4, cols 8–11.
  // South wall has a 1-tile door gap at col 10 (x = 640).
  // Player walks from the path (row 6–7) northward through the gap.

  private createMathBuilding(): void {
    const TS = 64;
    const mathWalls  = ['wall-math-1',  'wall-math-2',  'wall-math-3'];
    const brickWalls = ['wall-brick-1', 'wall-brick-2', 'wall-brick-3'];
    const floors     = ['floor-wood-1', 'floor-wood-2', 'floor-wood-3'];

    // Interior floor (depth 2 — below player and station objects)
    for (let y = 1; y < 5; y++) {
      for (let x = 8; x < 12; x++) {
        this.add.image(x * TS, y * TS, floors[(x + y * 2) % 3])
          .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(2);
      }
    }

    // Top wall — row 0, cols 7–12 (with solid physics)
    for (let x = 7; x <= 12; x++) {
      this.addWallTile(x * TS, 0, mathWalls[x % 3]);
    }

    // Left wall — col 7, rows 1–5 (with solid physics)
    for (let y = 1; y <= 5; y++) {
      this.addWallTile(7 * TS, y * TS, mathWalls[y % 3]);
    }

    // Right wall — col 12, rows 1–5 (with solid physics)
    for (let y = 1; y <= 5; y++) {
      this.addWallTile(12 * TS, y * TS, mathWalls[y % 3]);
    }

    // South wall — row 5, cols 7–9 (left side) + cols 11–12 (right side)
    // Gap at col 10 = door entrance — NO wall tile, NO physics body there.
    [7, 8, 9, 11, 12].forEach(x => {
      this.addWallTile(x * TS, 5 * TS, brickWalls[x % 3]);
    });

    // Building label
    this.add.text(10 * TS, 1 * TS + 8, 'MATH\nBUILDING', {
      fontSize: '15px', color: '#FFFFFF', backgroundColor: '#00000099',
      padding: { x: 6, y: 4 }, align: 'center',
    }).setOrigin(0.5, 0).setDepth(5);

    // Register building zone (interior footprint only — cols 8–12, rows 0–5)
    this.buildings.push({
      id: 'math',
      footprint: new Phaser.Geom.Rectangle(8 * TS, 0, 4 * TS, 5 * TS),
      playerInside: false,
    });

    // Interior interactables (gated — only active when player is inside)
    const interiors: InteractableObject[] = [];
    this.createMathStations(interiors);
    this.createMathTeacher(interiors);
    this.interiorInteractables.set('math', interiors);
  }

  private createMathStations(interiors: InteractableObject[]): void {
    const TS = 64;
    const stations = [
      { x: 8 * TS + 32,  y: 1 * TS + 32, gameId: 'pizza-fraction-frenzy',       name: 'Pizza Fractions'      },
      { x: 11 * TS + 32, y: 1 * TS + 32, gameId: 'math-race-rally',              name: 'Math Race Rally'      },
      { x: 9 * TS + 32,  y: 2 * TS + 32, gameId: 'math-jeopardy-junior',         name: 'Math Jeopardy'        },
      { x: 8 * TS + 32,  y: 3 * TS + 32, gameId: 'multiplication-bingo-bonanza', name: 'Multiplication Bingo' },
      { x: 11 * TS + 32, y: 3 * TS + 32, gameId: 'number-monster-feeding',        name: 'Number Monsters'      },
    ];

    stations.forEach(s => {
      const obj = new InteractableObject(this, s.x, s.y, 'arcade-cabinet');
      obj.setDepth(3);
      obj.setPromptText(`Press SPACE: ${s.name}`);
      obj.setOnInteract(() => {
        EventBus.emit('open-adventure', { adventureId: s.gameId, type: 'game' });
      });

      // Station name label
      this.add.text(s.x, s.y - 36, s.name, {
        fontSize: '10px', color: '#111111', backgroundColor: '#FFFFFFCC',
        padding: { x: 3, y: 2 }, align: 'center',
      }).setOrigin(0.5).setDepth(5);

      // Collision body so player can't walk through the cabinet
      this.addPhysicsBody(s.x, s.y, 56, 56);

      interiors.push(obj);
    });
  }

  private createMathTeacher(interiors: InteractableObject[]): void {
    const x = 10 * 64 + 32;
    const y =  4 * 64 + 8;
    const teacher = new NPC(this, x, y, 'npc-teacher', 'Ms. Numbers', [
      { text: 'Welcome to the Math Building!' },
      { text: 'Try the arcade stations to practice your math skills.' },
      { text: 'Each game teaches something different. Have fun!' },
    ]);
    teacher.setDepth(4);

    this.add.text(x, y - 40, 'Ms. Numbers', {
      fontSize: '10px', color: '#FFFFFF', backgroundColor: '#FF8C00CC',
      padding: { x: 4, y: 2 }, align: 'center',
    }).setOrigin(0.5).setDepth(5);

    interiors.push(teacher);
  }

  // ---------------------------------------------------------------------------
  // SHOP + JOB BOARD
  // ---------------------------------------------------------------------------

  private createShopBuilding(): void {
    const TS = 64;
    const tX = 1, tY = 2;
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        this.add.image((tX + dx) * TS, (tY + dy) * TS, 'wall-science-1')
          .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(2);
        if (dy < 2) this.addPhysicsBody((tX + dx) * TS + TS / 2, (tY + dy) * TS + TS / 2, TS, TS);
      }
    }
    this.add.graphics()
      .lineStyle(3, 0x14B8A6, 1)
      .strokeRect(tX * TS, tY * TS, 3 * TS, 3 * TS)
      .setDepth(3);
    this.add.text((tX + 1.5) * TS, (tY + 1) * TS, 'SHOP', {
      fontSize: '14px', color: '#FFFFFF', backgroundColor: '#00000099', padding: { x: 4, y: 4 },
    }).setOrigin(0.5).setDepth(4);

    const door = new InteractableObject(this, (tX + 1.5) * TS, (tY + 3) * TS, 'door-teal-small');
    door.setPromptText('Press SPACE: Open Shop');
    door.setOnInteract(() => EventBus.emit('open-shop', {}));
    door.setDepth(3);
    this.interactables.push(door);
  }

  private createJobBoardBuilding(): void {
    const TS = 64;
    const tX = 16, tY = 2;
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        this.add.image((tX + dx) * TS, (tY + dy) * TS, 'wall-english-1')
          .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(2);
        if (dy < 2) this.addPhysicsBody((tX + dx) * TS + TS / 2, (tY + dy) * TS + TS / 2, TS, TS);
      }
    }
    this.add.graphics()
      .lineStyle(3, 0xF59E0B, 1)
      .strokeRect(tX * TS, tY * TS, 3 * TS, 3 * TS)
      .setDepth(3);
    this.add.text((tX + 1.5) * TS, (tY + 1) * TS, 'JOB\nBOARD', {
      fontSize: '13px', color: '#FFFFFF', backgroundColor: '#00000099', padding: { x: 4, y: 4 },
    }).setOrigin(0.5).setDepth(4);

    const door = new InteractableObject(this, (tX + 1.5) * TS, (tY + 3) * TS, 'door-amber-small');
    door.setPromptText('Press SPACE: Open Job Board');
    door.setOnInteract(() => EventBus.emit('open-job-board', {}));
    door.setDepth(3);
    this.interactables.push(door);
  }

  // ---------------------------------------------------------------------------
  // SCIENCE BUILDING — always-open interior (cols 0–5, rows 8–12)
  // ---------------------------------------------------------------------------
  // 6 × 5 footprint. Interior floor: cols 1–4, rows 9–11 (4 × 3 = 12 tiles).
  // Door gap at col 3 in the south wall (row 12). Player enters from row 13.

  private createScienceBuilding(): void {
    const TS = 64;
    const tX = 0, tY = 8; // 6 × 5 footprint
    const floors = ['floor-wood-1', 'floor-wood-2', 'floor-wood-3'];

    // Interior floor (depth 2) — cols 1–4, rows 9–11
    for (let y = tY + 1; y < tY + 4; y++) {
      for (let x = tX + 1; x < tX + 5; x++) {
        this.add.image(x * TS, y * TS, floors[(x + y) % 3])
          .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(2);
      }
    }

    // Top wall — row tY (row 8), cols tX–tX+5
    for (let x = tX; x <= tX + 5; x++) {
      this.addWallTile(x * TS, tY * TS, 'wall-science-1');
    }
    // Left wall — col tX (col 0), rows tY+1 to tY+4
    for (let y = tY + 1; y <= tY + 4; y++) {
      this.addWallTile(tX * TS, y * TS, 'wall-science-1');
    }
    // Right wall — col tX+5 (col 5), rows tY+1 to tY+4
    for (let y = tY + 1; y <= tY + 4; y++) {
      this.addWallTile((tX + 5) * TS, y * TS, 'wall-science-1');
    }
    // South wall — row tY+4 (row 12), gap at col 3 (tX+3) — door entrance
    [tX, tX + 1, tX + 2, tX + 4, tX + 5].forEach(x => {
      this.addWallTile(x * TS, (tY + 4) * TS, 'wall-brick-1');
    });

    // Building label (depth 5)
    this.add.text((tX + 3) * TS, (tY + 0.6) * TS, 'SCIENCE', {
      fontSize: '13px', color: '#FFFFFF', backgroundColor: '#00000099',
      padding: { x: 5, y: 3 }, align: 'center',
    }).setOrigin(0.5).setDepth(5);

    // "Coming Soon" label inside
    this.add.text((tX + 3) * TS, (tY + 2) * TS, '🔬 Coming\nSoon!', {
      fontSize: '11px', color: '#14B8A6', backgroundColor: '#FFFFFFEE',
      padding: { x: 5, y: 4 }, align: 'center',
    }).setOrigin(0.5).setDepth(5);

    // Register building zone (interior: cols 1–4, rows 9–11)
    this.buildings.push({
      id: 'science',
      footprint: new Phaser.Geom.Rectangle((tX + 1) * TS, (tY + 1) * TS, 4 * TS, 3 * TS),
      playerInside: false,
    });

    // Interior objects — 4 desk computers at interior corners
    const interiors: InteractableObject[] = [];
    const positions = [
      { x: (tX + 1) * TS + 32, y: (tY + 1) * TS + 32 },
      { x: (tX + 4) * TS + 32, y: (tY + 1) * TS + 32 },
      { x: (tX + 1) * TS + 32, y: (tY + 3) * TS + 32 },
      { x: (tX + 4) * TS + 32, y: (tY + 3) * TS + 32 },
    ];
    positions.forEach(pos => {
      const desk = new InteractableObject(this, pos.x, pos.y, 'desk-computer');
      desk.setDepth(3);
      desk.setPromptText('Science Lab — Coming Soon!');
      desk.setOnInteract(() => {});
      this.addPhysicsBody(pos.x, pos.y, 48, 48);
      interiors.push(desk);
    });
    this.interiorInteractables.set('science', interiors);
  }

  // ---------------------------------------------------------------------------
  // ENGLISH BUILDING — always-open interior (cols 14–19, rows 8–12)
  // ---------------------------------------------------------------------------
  // 6 × 5 footprint. Interior floor: cols 15–18, rows 9–11 (4 × 3 = 12 tiles).
  // Door gap at col 16 in the south wall (row 12). Player enters from row 13.

  private createEnglishBuilding(): void {
    const TS = 64;
    const tX = 14, tY = 8; // 6 × 5 footprint
    const floors = ['floor-wood-1', 'floor-wood-2', 'floor-wood-3'];

    // Interior floor (depth 2) — cols 15–18, rows 9–11
    for (let y = tY + 1; y < tY + 4; y++) {
      for (let x = tX + 1; x < tX + 5; x++) {
        this.add.image(x * TS, y * TS, floors[(x + y) % 3])
          .setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(2);
      }
    }

    // Top wall — row tY (row 8), cols tX–tX+5
    for (let x = tX; x <= tX + 5; x++) {
      this.addWallTile(x * TS, tY * TS, 'wall-english-1');
    }
    // Left wall — col tX (col 14), rows tY+1 to tY+4
    for (let y = tY + 1; y <= tY + 4; y++) {
      this.addWallTile(tX * TS, y * TS, 'wall-english-1');
    }
    // Right wall — col tX+5 (col 19), rows tY+1 to tY+4
    for (let y = tY + 1; y <= tY + 4; y++) {
      this.addWallTile((tX + 5) * TS, y * TS, 'wall-english-1');
    }
    // South wall — row tY+4 (row 12), gap at col 16 (tX+2) — door entrance
    [tX, tX + 1, tX + 3, tX + 4, tX + 5].forEach(x => {
      this.addWallTile(x * TS, (tY + 4) * TS, 'wall-brick-2');
    });

    // Building label (depth 5)
    this.add.text((tX + 3) * TS, (tY + 0.6) * TS, 'ENGLISH', {
      fontSize: '13px', color: '#FFFFFF', backgroundColor: '#00000099',
      padding: { x: 5, y: 3 }, align: 'center',
    }).setOrigin(0.5).setDepth(5);

    // "Coming Soon" label inside
    this.add.text((tX + 3) * TS, (tY + 2) * TS, '📚 Coming\nSoon!', {
      fontSize: '11px', color: '#F59E0B', backgroundColor: '#FFFFFFEE',
      padding: { x: 5, y: 4 }, align: 'center',
    }).setOrigin(0.5).setDepth(5);

    // Register building zone (interior: cols 15–18, rows 9–11)
    this.buildings.push({
      id: 'english',
      footprint: new Phaser.Geom.Rectangle((tX + 1) * TS, (tY + 1) * TS, 4 * TS, 3 * TS),
      playerInside: false,
    });

    // Interior objects — 4 desk computers at interior corners
    const interiors: InteractableObject[] = [];
    const positions = [
      { x: (tX + 1) * TS + 32, y: (tY + 1) * TS + 32 },
      { x: (tX + 4) * TS + 32, y: (tY + 1) * TS + 32 },
      { x: (tX + 1) * TS + 32, y: (tY + 3) * TS + 32 },
      { x: (tX + 4) * TS + 32, y: (tY + 3) * TS + 32 },
    ];
    positions.forEach(pos => {
      const desk = new InteractableObject(this, pos.x, pos.y, 'desk-computer');
      desk.setDepth(3);
      desk.setPromptText('English Library — Coming Soon!');
      desk.setOnInteract(() => {});
      this.addPhysicsBody(pos.x, pos.y, 48, 48);
      interiors.push(desk);
    });
    this.interiorInteractables.set('english', interiors);
  }

  // ---------------------------------------------------------------------------
  // PHYSICS HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Draw a wall tile image and add a matching static physics body to wallGroup.
   */
  private addWallTile(x: number, y: number, texture: string): void {
    const TS = 64;
    this.add.image(x, y, texture).setOrigin(0, 0).setDisplaySize(TS, TS).setDepth(3);
    this.addPhysicsBody(x + TS / 2, y + TS / 2, TS, TS);
  }

  /** Add an invisible static physics body to wallGroup. */
  private addPhysicsBody(cx: number, cy: number, w: number, h: number): void {
    const body = this.wallGroup!.create(cx, cy, 'wall-tile') as Phaser.Physics.Arcade.Sprite;
    body.setDisplaySize(w, h).setVisible(false).refreshBody();
  }

  // ---------------------------------------------------------------------------
  // QUEST MARKERS
  // ---------------------------------------------------------------------------

  /**
   * Building anchor points (world pixels) for quest markers.
   * Placed above each building's entrance label area.
   */
  private readonly BUILDING_MARKER_POSITIONS: Record<string, { x: number; y: number }> = {
    'math-building':     { x: 10 * 64,      y: 0 * 64 - 18 },  // top of Math Building
    'science-building':  { x: 3 * 64,       y: 8 * 64 - 18 },  // top of Science Building
    'business-building': { x: 17.5 * 64,    y: 2 * 64 - 18 },  // top of Job Board area (placeholder)
  };

  /**
   * Create or update a floating quest marker above a building.
   * Called when React emits 'quest-status-update'.
   */
  private setQuestMarker(buildingId: string, status: BuildingQuestStatus): void {
    const pos = this.BUILDING_MARKER_POSITIONS[buildingId];
    if (!pos) return;

    // Remove existing marker
    const existing = this.questMarkers.get(buildingId);
    const existingTween = this.questMarkerTween.get(buildingId);
    if (existingTween) existingTween.destroy();
    if (existing) existing.destroy();

    if (status === 'none') return;

    const isComplete = status === 'completed';
    const markerText = isComplete ? '✓' : '!';
    const bgColor    = isComplete ? '#16a34a' : '#ca8a04';  // green : amber
    const textColor  = '#ffffff';

    const marker = this.add.text(pos.x, pos.y, markerText, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: textColor,
      backgroundColor: bgColor,
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 1).setDepth(8).setScrollFactor(1);

    // Gentle bob animation
    const tween = this.tweens.add({
      targets: marker,
      y: pos.y - 8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.questMarkers.set(buildingId, marker);
    this.questMarkerTween.set(buildingId, tween);
  }

  /**
   * Called from React via EventBus when quest data is loaded.
   * Payload: Array of { buildingId, status } entries.
   */
  private handleQuestStatusUpdate = (data: { buildingId: string; status: BuildingQuestStatus }[]) => {
    data.forEach(({ buildingId, status }) => this.setQuestMarker(buildingId, status));
  };

  // ---------------------------------------------------------------------------
  // EVENT LISTENERS
  // ---------------------------------------------------------------------------

  private savePositionHandler = (data: { x: number; y: number; scene: string }) => {
    // React world/page.tsx handles the actual API call via its own EventBus listener.
    console.log('Saving player position:', data);
  };

  private handleSetAvatar = (data: { avatarId: string }) => {
    if (!this.player) return;
    const key = `player-${data.avatarId}`;
    if (this.textures.exists(key)) {
      this.player.setTexture(key);
      this.player.setDisplaySize(64, 64);
      const idleKey = `${data.avatarId}-idle`;
      if (this.anims.exists(idleKey)) this.player.anims.play(idleKey, true);
      this.game.registry.set('avatarId', data.avatarId);
    }
  };

  private setupEventListeners(): void {
    EventBus.on('save-player-position', this.savePositionHandler);
    EventBus.on('set-avatar', this.handleSetAvatar);
    EventBus.on('quest-status-update', this.handleQuestStatusUpdate);
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------

  update(time: number, delta: number): void {
    if (!this.player) return;
    this.player.update(time, delta);

    const px = this.player.x;
    const py = this.player.y;

    // Update building zone state (player position changes every frame).
    this.buildings.forEach(zone => {
      zone.playerInside = zone.footprint.contains(px, py);
    });

    // Outdoor interactables — always checked.
    this.interactables.forEach(obj => obj.checkPlayerProximity(px, py));

    // Interior interactables — proximity gated per building.
    // Passing (-99999, -99999) when outside forces any visible prompt to hide.
    this.buildings.forEach(zone => {
      const interiors = this.interiorInteractables.get(zone.id) ?? [];
      const pos = zone.playerInside ? { x: px, y: py } : { x: -99999, y: -99999 };
      interiors.forEach(obj => obj.checkPlayerProximity(pos.x, pos.y));
    });

    // SPACE key interaction — outdoor + whichever building the player is inside.
    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.interactables.forEach(obj => obj.interact());
      this.buildings.forEach(zone => {
        if (zone.playerInside) {
          (this.interiorInteractables.get(zone.id) ?? []).forEach(obj => obj.interact());
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // SHUTDOWN
  // ---------------------------------------------------------------------------

  shutdown(): void {
    EventBus.off('save-player-position', this.savePositionHandler);
    EventBus.off('set-avatar', this.handleSetAvatar);
    EventBus.off('quest-status-update', this.handleQuestStatusUpdate);

    const all = [
      ...this.interactables,
      ...Array.from(this.interiorInteractables.values()).flat(),
    ];
    all.forEach(obj => { if (obj?.destroy) obj.destroy(); });

    this.interactables = [];
    this.interiorInteractables.clear();

    this.questMarkerTween.forEach(t => t.destroy());
    this.questMarkers.forEach(m => m.destroy());
    this.questMarkerTween.clear();
    this.questMarkers.clear();
  }
}
