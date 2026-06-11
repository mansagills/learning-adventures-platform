import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { TalkableNPC } from '../entities/TalkableNPC';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';
import { getWorldBootstrap, clearWorldBootstrap } from '../worldBootstrap';
import {
  generateCampus,
  getBuildingLabels,
  CTILE_ASSET_KEYS,
  SOLID_TILES,
  CAMPUS_COLS,
  CAMPUS_ROWS,
  CAMPUS_PIXEL_W,
  CAMPUS_PIXEL_H,
  CAMPUS_SPAWN,
  CAMPUS_NPCS,
  CAMPUS_STATIONS,
  TILE_SIZE,
} from '../world/GatherCampusMap';

/**
 * GatherCampusScene — Gather.town-style continuous campus (40×30 tiles).
 *
 * One walkable 16-bit map with open-front buildings instead of scene
 * transitions. Walk up to an NPC and a conversation starts automatically;
 * walk away and it ends. Learning stations launch adventures via the
 * existing `open-adventure` embed flow.
 */
export class GatherCampusScene extends Phaser.Scene {
  private player?: Player;
  private npcs: TalkableNPC[] = [];
  private stations: InteractableObject[] = [];
  private activeNpc: TalkableNPC | null = null;
  private interactKeys: Phaser.Input.Keyboard.Key[] = [];
  private isPaused = false;
  private solids!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'GatherCampusScene' });
  }

  preload(): void {
    // Character sprite sheets (384×384, 4×4 grid of 96×96 frames)
    const chars = ['human-1', 'human-2', 'robot-blue', 'wizard-purple', 'cat-orange', 'knight-silver'];
    chars.forEach((c) => {
      this.load.spritesheet(`player-${c}`, `/game-assets/sprites/${c}.png`, {
        frameWidth: 96,
        frameHeight: 96,
      });
    });

    // Ground + wall tiles (1024×1024 sources displayed at 64×64)
    this.load.image('ground-grass-1', '/game-assets/tilemaps/grass-plain-1.png');
    this.load.image('ground-grass-2', '/game-assets/tilemaps/grass-plain-2.png');
    this.load.image('ground-grass-3', '/game-assets/tilemaps/grass-plain-3.png');
    this.load.image('ground-flowers-1', '/game-assets/tilemaps/grass-flowers-1.png');
    this.load.image('ground-flowers-2', '/game-assets/tilemaps/grass-flowers-2.png');
    this.load.image('ground-path', '/game-assets/tilemaps/stone-path-1.png');
    this.load.image('ground-water', '/game-assets/tilemaps/water-1.png');
    this.load.image('wall-math-1', '/game-assets/tilemaps/math-wall-1.png');
    this.load.image('wall-science-1', '/game-assets/tilemaps/science-building-1.png');
    this.load.image('wall-english-1', '/game-assets/tilemaps/english-building-1.png');
    this.load.image('wall-brick-1', '/game-assets/tilemaps/brick-wall-1.png');
    this.load.image('floor-wood-1', '/game-assets/tilemaps/wood-floor-1.png');
    this.load.image('floor-wood-2', '/game-assets/tilemaps/wood-floor-2.png');
    this.load.image('floor-stone-1', '/game-assets/tilemaps/stone-floor-1.png');
    this.load.image('floor-stone-2', '/game-assets/tilemaps/stone-floor-2.png');

    // Station objects
    this.load.image('arcade-cabinet', '/game-assets/tilemaps/arcade-cabinet.png');
    this.load.image('desk-computer', '/game-assets/tilemaps/desk-computer.png');
  }

  create(): void {
    // Invisible texture for static collision bodies
    if (!this.textures.exists('wall-tile')) {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      g.generateTexture('wall-tile', TILE_SIZE, TILE_SIZE);
      g.destroy();
    }

    this.physics.world.setBounds(0, 0, CAMPUS_PIXEL_W, CAMPUS_PIXEL_H);

    // Restore last position if the player was previously in this scene
    const bootstrap = getWorldBootstrap();
    let spawnX = CAMPUS_SPAWN.x;
    let spawnY = CAMPUS_SPAWN.y;
    if (bootstrap?.lastScene === 'GatherCampusScene' && bootstrap.position) {
      spawnX = bootstrap.position.x;
      spawnY = bootstrap.position.y;
      clearWorldBootstrap();
    }

    // Player first — its constructor registers the shared character
    // animations that TalkableNPC reuses.
    const avatarId = this.game.registry.get('avatarId') as string | undefined;
    const playerTexture =
      avatarId && this.textures.exists(`player-${avatarId}`)
        ? `player-${avatarId}`
        : 'player-human-1';
    this.player = new Player(this, spawnX, spawnY, playerTexture);
    this.player.setDepth(10);

    // All solid bodies (walls, water, stations) share one static group so a
    // single collider covers the whole map.
    this.solids = this.physics.add.staticGroup();

    // Map tiles + collision
    this.buildMap();

    // Building signs
    getBuildingLabels().forEach((label) => {
      this.addLabel(label.x, label.y, label.text, 'sign');
    });

    // NPCs and learning stations
    CAMPUS_NPCS.forEach((def) => this.npcs.push(new TalkableNPC(this, def)));
    this.createStations();

    this.physics.add.collider(this.player, this.solids);

    // Camera
    this.cameras.main.setBounds(0, 0, CAMPUS_PIXEL_W, CAMPUS_PIXEL_H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(400);

    // SPACE or E to talk/interact
    if (this.input.keyboard) {
      this.interactKeys = [
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      ];
    }

    // Tap/click also advances conversations and uses stations (mobile support)
    this.input.on('pointerdown', this.handleInteract, this);

    // Minimap position feed for React overlays
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.player) {
          EventBus.emit('minimap-position', { x: this.player.x, y: this.player.y });
        }
      },
    });

    EventBus.on('set-avatar', this.handleSetAvatar);
    EventBus.on('world-pause', this.handleWorldPause);
    // 'shutdown' fires on scene stop; 'destroy' fires when the whole game is
    // torn down (page unmount / HMR) without a shutdown — cover both.
    this.events.once('shutdown', this.shutdown, this);
    this.events.once('destroy', this.shutdown, this);

    EventBus.emit('scene-ready', { scene: 'GatherCampusScene' });
  }

  // ─── Map construction ────────────────────────────────────────────────────────

  private buildMap(): void {
    const mapData = generateCampus();

    for (let row = 0; row < CAMPUS_ROWS; row++) {
      for (let col = 0; col < CAMPUS_COLS; col++) {
        const tileIndex = mapData[row][col];
        const assetKey =
          (CTILE_ASSET_KEYS as Record<number, string>)[tileIndex] ?? 'ground-grass-1';
        const px = col * TILE_SIZE;
        const py = row * TILE_SIZE;

        const img = this.add.image(px, py, assetKey);
        img.setOrigin(0, 0);
        img.setDisplaySize(TILE_SIZE, TILE_SIZE);
        img.setDepth(0);

        if (SOLID_TILES.has(tileIndex)) {
          this.addSolidBody(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE);
        }
      }
    }
  }

  private createStations(): void {
    CAMPUS_STATIONS.forEach((def) => {
      const station = new InteractableObject(this, def.x, def.y, def.texture);
      station.setPromptText(`Press SPACE: ${def.name}`);
      station.setOnInteract(() => {
        EventBus.emit('open-adventure', { adventureId: def.adventureId, type: 'game' });
      });
      station.setDepth(5);
      this.stations.push(station);

      this.addLabel(def.x, def.y + 42, def.name, 'tag');

      // Solid so the player walks up to (not through) the station
      this.addSolidBody(def.x, def.y, 48);
    });
  }

  /** Adds an invisible static collision body to the shared solids group. */
  private addSolidBody(x: number, y: number, size: number): void {
    const body = this.solids.create(x, y, 'wall-tile') as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    body.setDisplaySize(size, size);
    body.refreshBody();
  }

  /** Shared text style for building signs ('sign') and station tags ('tag'). */
  private addLabel(x: number, y: number, text: string, style: 'sign' | 'tag'): void {
    const sign = style === 'sign';
    const label = this.add.text(x, y, text, {
      fontSize: sign ? '16px' : '11px',
      fontFamily: 'monospace',
      fontStyle: sign ? 'bold' : 'normal',
      color: sign ? '#ffffff' : '#1f2937',
      backgroundColor: sign ? '#1f2937e6' : '#ffffffcc',
      padding: sign ? { x: 8, y: 4 } : { x: 4, y: 2 },
      align: 'center',
    });
    label.setOrigin(0.5);
    label.setDepth(sign ? 20 : 5);
  }

  // ─── Frame update ────────────────────────────────────────────────────────────

  update(time: number, delta: number): void {
    if (!this.player) return;

    this.player.update(time, delta);

    // Proximity conversations — only one NPC may talk at a time
    let talkingNpc: TalkableNPC | null = null;
    for (const npc of this.npcs) {
      const canStart = this.activeNpc === null || this.activeNpc === npc;
      if (npc.updateProximity(this.player.x, this.player.y, canStart)) {
        talkingNpc = npc;
      }
    }
    this.activeNpc = talkingNpc;

    // Station prompts
    this.stations.forEach((station) => {
      station.checkPlayerProximity(this.player!.x, this.player!.y);
    });

    // SPACE / E: advance active conversation, otherwise use a nearby station
    const justPressed =
      !this.isPaused &&
      this.interactKeys.some((key) => Phaser.Input.Keyboard.JustDown(key));
    if (justPressed) {
      this.handleInteract();
    }
  }

  /** Shared interact action for SPACE/E and tap/click. */
  private handleInteract(): void {
    if (this.isPaused) return;
    if (this.activeNpc) {
      this.activeNpc.advance();
    } else {
      this.stations.forEach((station) => station.interact());
    }
  }

  // ─── Events / cleanup ────────────────────────────────────────────────────────

  private handleWorldPause = (paused: boolean) => {
    this.isPaused = paused;
  };

  private handleSetAvatar = (data: { avatarId: string }) => {
    if (!this.player) return;
    const textureKey = `player-${data.avatarId}`;
    if (this.textures.exists(textureKey)) {
      this.player.setTexture(textureKey);
      this.player.setDisplaySize(64, 64);
      const idleKey = `${data.avatarId}-idle`;
      if (this.anims.exists(idleKey)) {
        this.player.anims.play(idleKey, true);
      }
      this.game.registry.set('avatarId', data.avatarId);
    }
  };

  private cleanedUp = false;

  shutdown(): void {
    if (this.cleanedUp) return;
    this.cleanedUp = true;
    EventBus.off('set-avatar', this.handleSetAvatar);
    EventBus.off('world-pause', this.handleWorldPause);
    this.npcs.forEach((npc) => npc.destroy());
    this.npcs = [];
    this.stations.forEach((station) => station.destroy());
    this.stations = [];
    this.activeNpc = null;
  }
}
