import * as Phaser from 'phaser';
import { OpenWorldScene } from './OpenWorldScene';
import { TalkableNPC } from '../entities/TalkableNPC';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';
import { TILE_SIZE, type BuildingDoorConfig } from '../world/TilemapGenerator';
import {
  buildGatherNpcConfigs,
  carveGatherRooms,
  getGatherRoomLabels,
  GATHER_ROOMS,
  GATHER_STATIONS,
} from '../world/gatherPresentation';
import { exploration } from '../world/explorationState';
import { buildSimStudentConfigs } from '../world/simStudents';
import { applyFuturisticTiles } from '../world/futuristicTiles';
import { preloadRccSheets, applyRccTiles } from '../world/rccTiles';
import { preloadModernTiles, applyModernTiles } from '../world/modernTiles';
import { preloadCampusProps, placeCampusProps } from '../world/campusDecorations';
import { playPickup, startAmbience, stopAmbience } from '../world/campusAudio';
import { demoEconomy } from '../world/demoEconomy';
import { wearableForOwned } from '../world/wearables';

/**
 * Campus art source — switch here to compare looks (procedural futuristic
 * set always loads first as the fallback):
 *  - 'procedural': neon/alloy tiles generated at runtime (futuristicTiles.ts)
 *  - 'rcc':        RCC apartment pack, cyberpunk (game-assets/rcc/)
 *  - 'modern':     Modern Interiors/Exteriors pack, bright contemporary
 *                  campus (game-assets/modern/)
 */
const CAMPUS_ART: 'procedural' | 'rcc' | 'modern' = 'modern';
import {
  mathQuest,
  QUEST_NPC_ID,
  QUEST_GAME_ID,
  QUEST_ITEM_POSITIONS,
} from '../world/mathQuest';

/**
 * GatherCampusScene — Gather.town-style variant of the 96×72 campus world.
 *
 * Inherits the full zoned open world from OpenWorldScene (chunk-streamed
 * tilemap from campusLayout.ts, zone tracking/banners, collectibles) and
 * makes it Gather-style:
 *
 * - Buildings are OPEN walk-in rooms (carved into the map: perimeter walls +
 *   a doorway + stone floor) instead of teleport doors — you walk in and out
 *   seamlessly, no scene transitions. Each room holds that subject's learning
 *   stations and its host NPC (Math Hall has the full Math Lab game set and
 *   Professor Numbers, the quest giver).
 * - Campus NPCs become TalkableNPCs — animated 16-bit sprites with name tags
 *   that auto-start a conversation when the player walks up (typewriter
 *   speech bubble + React chat panel) and end it when the player walks away.
 * - Stations launch adventures via the existing `open-adventure` embed flow.
 * - SPACE/E or tap advances the active conversation; otherwise interacts with
 *   stations, the quest board, and the shop.
 */
export class GatherCampusScene extends OpenWorldScene {
  private npcs: TalkableNPC[] = [];
  private stations: InteractableObject[] = [];
  private activeNpc: TalkableNPC | null = null;
  private isPaused = false;
  private extraInteractKey?: Phaser.Input.Keyboard.Key;
  private questGiver?: TalkableNPC;
  private questItems: Phaser.GameObjects.Image[] = [];
  /** Throttle for the exploration room check (no need to test every frame). */
  private nextExplorationCheck = 0;
  // Quest guidance: pulsing marker at the target + screen-edge arrow
  private questPulse?: Phaser.GameObjects.Arc;
  private questArrow?: Phaser.GameObjects.Triangle;
  private nextGuidanceUpdate = 0;
  private lastGuidanceTarget: { x: number; y: number } | null = null;
  private shopDoor?: { x: number; y: number };
  private simStudents: TalkableNPC[] = [];
  private chatterTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('GatherCampusScene');
  }

  preload(): void {
    super.preload();
    // Station objects (1024×1024 sources displayed at 64×64)
    this.load.image('arcade-cabinet', '/game-assets/tilemaps/arcade-cabinet.png');
    this.load.image('desk-computer', '/game-assets/tilemaps/desk-computer.png');
    if (CAMPUS_ART === 'rcc') {
      preloadRccSheets(this);
    } else if (CAMPUS_ART === 'modern') {
      preloadModernTiles(this);
      preloadCampusProps(this);
    }
  }

  create(): void {
    // Swap the campus tile art BEFORE the base scene builds the tilemap
    // images (keys stay the same, only pixels change). Procedural futuristic
    // set first as the fallback, then the selected pack overrides.
    applyFuturisticTiles(this);
    if (CAMPUS_ART === 'rcc') {
      applyRccTiles(this);
    } else if (CAMPUS_ART === 'modern') {
      applyModernTiles(this);
    }

    super.create();

    // Furniture + outdoor props (needs the player for solid-prop colliders)
    if (CAMPUS_ART === 'modern') {
      placeCampusProps(this, this.player);
    }

    // Building signs over the open rooms
    getGatherRoomLabels().forEach((label) => {
      this.addBuildingLabel(label.text, label.x, label.y);
    });

    // E as an alternate interact key (base scene registers SPACE)
    if (this.input.keyboard) {
      this.extraInteractKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E,
      );
    }

    // Tap/click also advances conversations and uses stations (mobile support)
    this.input.on('pointerdown', this.handleInteract, this);

    EventBus.on('world-pause', this.handleWorldPause);
    this.events.once('shutdown', this.cleanupGather, this);
    this.events.once('destroy', this.cleanupGather, this);

    this.setupQuest();
    this.setupWearables();

    // Hydrate the exploration HUD with any previously-visited rooms
    exploration.announce();

    // Soft ambient pad — silent until the player's first click/keypress
    // unlocks the AudioContext (browser autoplay policy), then fades in.
    startAmbience();
  }

  // ─── Wearables: show the best shop-bought accessory on the player ──────────

  private updateWearable = () => {
    const w = wearableForOwned(demoEconomy.snapshot().owned);
    EventBus.emit('set-wearable', w ? { emoji: w.emoji, offsetY: w.offsetY } : { emoji: null });
  };

  private setupWearables(): void {
    // Player already exists (super.create()), so this initial emit lands.
    this.updateWearable();
    // Re-evaluate whenever the demo economy changes (purchase, reset).
    EventBus.on('demo-economy-updated', this.updateWearable);
  }

  /** Mark the room the player is standing inside (if any) as explored. */
  private checkExploration(time: number): void {
    if (!this.player || time < this.nextExplorationCheck) return;
    this.nextExplorationCheck = time + 400;

    const col = Math.floor(this.player.x / TILE_SIZE);
    const row = Math.floor(this.player.y / TILE_SIZE);
    for (const room of GATHER_ROOMS) {
      // Strictly inside the walls (walking past outside doesn't count)
      if (col > room.c0 && col < room.c1 && row > room.r0 && row < room.r1) {
        exploration.markVisited(room.id);
        return;
      }
    }
  }

  // ─── Demo quest: Professor Numbers → power cells → Math Race Rally 80+ ──────

  private setupQuest(): void {
    this.questGiver = this.npcs.find((n) => n.npcId === QUEST_NPC_ID);
    if (!this.questGiver) return;

    // Glowing power-cell texture (matches the futuristic tile palette)
    if (!this.textures.exists('quest-power-cell')) {
      const g = this.add.graphics();
      g.fillStyle(0x22d3ee, 0.25); g.fillCircle(16, 16, 15);
      g.fillStyle(0x0e7490, 1);    g.fillRoundedRect(9, 6, 14, 20, 4);
      g.fillStyle(0x67e8f9, 1);    g.fillRoundedRect(12, 9, 8, 14, 2);
      g.fillStyle(0xffffff, 0.9);  g.fillRect(14, 11, 2, 4);
      g.generateTexture('quest-power-cell', 32, 32);
      g.destroy();
    }

    this.questGiver.setQuestDialogue(mathQuest.dialogue());
    EventBus.emit('quest-updated', mathQuest.snapshot());

    EventBus.on('npc-conversation-end', this.handleQuestConversation);
    EventBus.on('adventure-completed', this.handleQuestGameResult);

    this.createQuestGuidance();
    this.startAmbientChatter();
  }

  // ─── Quest guidance: pulsing target marker + screen-edge arrow ─────────────

  private createQuestGuidance(): void {
    // Pulsing ring at the target (world space)
    this.questPulse = this.add.circle(0, 0, 26);
    this.questPulse.setStrokeStyle(4, 0xffd700, 0.9);
    this.questPulse.setDepth(9);
    this.questPulse.setVisible(false);
    this.tweens.add({
      targets: this.questPulse,
      scale: { from: 0.7, to: 1.3 },
      alpha: { from: 0.95, to: 0.25 },
      duration: 900,
      repeat: -1,
      ease: 'Sine.easeOut',
    });

    // Edge arrow (screen space) pointing at off-screen targets
    this.questArrow = this.add.triangle(0, 0, 0, 22, 11, 0, 22, 22, 0xffd700, 0.95);
    this.questArrow.setStrokeStyle(2, 0x92600a, 1);
    this.questArrow.setScrollFactor(0);
    this.questArrow.setDepth(50);
    this.questArrow.setVisible(false);
    this.tweens.add({
      targets: this.questArrow,
      scale: { from: 0.85, to: 1.15 },
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Where should the player go right now? null = no guidance (all done). */
  private questTarget(): { x: number; y: number } | null {
    switch (mathQuest.currentStage) {
      case 'available':
      case 'return':
      case 'play':
        return this.questGiver ? { x: this.questGiver.x, y: this.questGiver.y } : null;
      case 'gather': {
        // Nearest uncollected power cell
        if (!this.player || this.questItems.length === 0) return null;
        let best: { x: number; y: number } | null = null;
        let bestDist = Number.POSITIVE_INFINITY;
        for (const cell of this.questItems) {
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, cell.x, cell.y);
          if (d < bestDist) {
            bestDist = d;
            best = { x: cell.x, y: cell.y };
          }
        }
        return best;
      }
      case 'complete':
        return this.shopDoor ?? null;
    }
  }

  private updateQuestGuidance(time: number): void {
    if (!this.player || !this.questPulse || !this.questArrow) return;
    if (time < this.nextGuidanceUpdate) return;
    this.nextGuidanceUpdate = time + 120;

    const target = this.questTarget();

    // Keep the minimap's gold quest dot in sync (only emit on real change)
    const prev = this.lastGuidanceTarget;
    const moved =
      (target === null) !== (prev === null) ||
      (target && prev && (Math.abs(target.x - prev.x) > 2 || Math.abs(target.y - prev.y) > 2));
    if (moved) {
      this.lastGuidanceTarget = target;
      EventBus.emit('quest-guidance', target);
    }

    if (!target) {
      this.questPulse.setVisible(false);
      this.questArrow.setVisible(false);
      return;
    }

    // Pulse sits at the target in world space (visible whenever on camera)
    this.questPulse.setPosition(target.x, target.y);
    this.questPulse.setVisible(true);

    const view = this.cameras.main.worldView;
    const margin = 32;
    const onScreen =
      target.x > view.x + margin && target.x < view.right - margin &&
      target.y > view.y + margin && target.y < view.bottom - margin;

    if (onScreen) {
      this.questArrow.setVisible(false);
      return;
    }

    // Clamp the arrow to the screen edge along the player→target direction
    const cam = this.cameras.main;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    const inset = 42;
    const cx = cam.width / 2;
    const cy = cam.height / 2;
    const halfW = cam.width / 2 - inset;
    const halfH = cam.height / 2 - inset;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const scale = Math.min(
      halfW / Math.max(Math.abs(dx), 1e-6),
      halfH / Math.max(Math.abs(dy), 1e-6),
    );
    this.questArrow.setPosition(cx + dx * scale, cy + dy * scale);
    this.questArrow.setRotation(angle + Math.PI / 2);
    this.questArrow.setVisible(true);
  }

  // ─── Ambient chatter: overheard student lines, quest-aware ──────────────────

  private startAmbientChatter(): void {
    const CHATTER: Record<string, string[]> = {
      any: [
        'Race you to the fountain!',
        'I love this campus.',
        'The Discovery Lab games are so cool.',
        'Almost recess time!',
      ],
      available: [
        'Professor Numbers looked worried earlier...',
        'Something broke in Math Hall, I heard.',
      ],
      gather: [
        'Whoa, are those glowing power cells?',
        'I saw something sparkly by the paths!',
      ],
      return: ['Did you find all the cells? Nice!'],
      play: ['Good luck on the race!', 'The sevens table is sneaky!'],
      complete: [
        'You got the Racing License?! So cool!',
        'Congrats on the race! 🏁',
        'Campus Shop has new stuff, go look!',
      ],
    };

    const tick = () => {
      const pool = [
        ...CHATTER.any,
        ...(CHATTER[mathQuest.currentStage] ?? []),
      ];
      const student = Phaser.Utils.Array.GetRandom(this.simStudents);
      if (student && pool.length > 0) {
        student.chatter(Phaser.Utils.Array.GetRandom(pool));
      }
      this.chatterTimer = this.time.delayedCall(9000 + Math.random() * 8000, tick);
    };
    this.chatterTimer = this.time.delayedCall(6000, tick);
  }

  private handleQuestConversation = (data: { npcId: string; completed: boolean }) => {
    if (data.npcId !== QUEST_NPC_ID || !data.completed || !this.questGiver) return;

    switch (mathQuest.currentStage) {
      case 'available':
        if (mathQuest.accept()) this.spawnQuestItems();
        break;
      case 'return':
        if (mathQuest.turnIn()) {
          // She boots the simulator: launch Math Race Rally right away
          EventBus.emit('open-adventure', { adventureId: QUEST_GAME_ID, type: 'game' });
        }
        break;
      case 'play':
        // Talking to her again re-opens the game for another attempt
        EventBus.emit('open-adventure', { adventureId: QUEST_GAME_ID, type: 'game' });
        break;
    }
    this.questGiver.setQuestDialogue(mathQuest.dialogue());
  };

  private handleQuestGameResult = (data: { adventureId: string; score?: number }) => {
    if (data.adventureId !== QUEST_GAME_ID) return;
    const completed = mathQuest.reportScore(data.score);
    this.questGiver?.setQuestDialogue(mathQuest.dialogue());
    if (completed) {
      // The whole campus celebrates the new Racing License
      this.simStudents.forEach((s) => s.celebrate());
    }
  };

  private spawnQuestItems(): void {
    QUEST_ITEM_POSITIONS.forEach((pos) => {
      const cell = this.physics.add.staticImage(pos.x, pos.y, 'quest-power-cell');
      cell.setDepth(6);
      // Pulse so it reads as a pickup from across the path
      this.tweens.add({
        targets: cell,
        scale: { from: 1, to: 1.25 },
        alpha: { from: 1, to: 0.75 },
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      if (this.player) {
        this.physics.add.overlap(this.player, cell, () => this.collectQuestItem(cell));
      }
      this.questItems.push(cell);
    });
  }

  private collectQuestItem(cell: Phaser.GameObjects.Image): void {
    if (!cell.active) return;
    const body = cell.body as Phaser.Physics.Arcade.StaticBody | null;
    if (!body?.enable) return; // already collected this frame
    body.enable = false;
    this.tweens.killTweensOf(cell);
    // Pickup flourish: pop up and fade
    this.tweens.add({
      targets: cell,
      y: cell.y - 40,
      alpha: 0,
      scale: 1.6,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => cell.destroy(),
    });
    this.questItems = this.questItems.filter((c) => c !== cell);
    playPickup();
    mathQuest.collectItem();
    this.questGiver?.setQuestDialogue(mathQuest.dialogue());
  }

  /** Carve the open walk-in rooms into the base campus tile grid. */
  protected generateMap(): number[][] {
    const tiles = super.generateMap();
    carveGatherRooms(tiles);
    return tiles;
  }

  /**
   * Buildings are open rooms here, so suppress the teleport door and the
   * press-SPACE "coming soon" building NPCs. The quest board and shop stay as
   * SPACE interactions (handled by the base implementation).
   */
  protected createBuildingInteractable(config: BuildingDoorConfig): void {
    if (config.id === 'building_campus_shop') {
      // Post-quest guidance points here ("spend your XP at the shop")
      this.shopDoor = {
        x: config.doorTileCol * TILE_SIZE,
        y: config.doorTileRow * TILE_SIZE,
      };
    }
    if (
      config.id === 'building_quest_board' ||
      config.id === 'building_campus_shop'
    ) {
      super.createBuildingInteractable(config);
    }
    // math hall / discovery lab / story grove: open rooms — their TalkableNPC
    // and stations live inside; no door, no label here (room signs added above)
  }

  /**
   * Replaces the base press-SPACE campus NPCs with walk-up-and-talk
   * characters, and adds the in-room learning stations.
   */
  protected createCampusNPCs(): void {
    buildGatherNpcConfigs().forEach((config) => {
      this.npcs.push(new TalkableNPC(this, config));
    });
    // Simulated students — ambient "other players" patrolling the campus paths
    buildSimStudentConfigs().forEach((config) => {
      const student = new TalkableNPC(this, config);
      this.npcs.push(student);
      this.simStudents.push(student);
    });
    this.createStations();
  }

  private createStations(): void {
    GATHER_STATIONS.forEach((def) => {
      const station = new InteractableObject(this, def.x, def.y, def.texture);
      station.setPromptText(`Press SPACE: ${def.name}`);
      station.setOnInteract(() => {
        EventBus.emit('open-adventure', { adventureId: def.adventureId, type: 'game' });
      });
      station.setDepth(5);
      this.stations.push(station);
      this.interactables.push(station); // base loop handles proximity prompts
      this.addNameLabel(def.name, def.x, def.y + 42);

      // Solid so the player walks up to (not through) the station
      const body = this.physics.add.staticImage(def.x, def.y, 'wall-tile');
      body.setVisible(false).setDisplaySize(48, 48).refreshBody();
      if (this.player) {
        this.physics.add.collider(this.player, body);
      }
    });
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (!this.player) return;

    this.checkExploration(time);
    this.updateQuestGuidance(time);

    // Proximity conversations — only one NPC may talk at a time
    let talkingNpc: TalkableNPC | null = null;
    for (const npc of this.npcs) {
      const canStart = this.activeNpc === null || this.activeNpc === npc;
      if (npc.updateProximity(this.player.x, this.player.y, canStart)) {
        talkingNpc = npc;
      }
    }
    this.activeNpc = talkingNpc;

    // E key mirrors the base scene's SPACE handling
    if (
      this.extraInteractKey &&
      Phaser.Input.Keyboard.JustDown(this.extraInteractKey)
    ) {
      this.handleInteract();
    }
  }

  /** SPACE/E/tap: advance the active conversation, else interact normally. */
  protected handleInteract(): void {
    if (this.isPaused) return;
    if (this.activeNpc) {
      this.activeNpc.advance();
    } else {
      super.handleInteract();
    }
  }

  private handleWorldPause = (paused: boolean) => {
    this.isPaused = paused;
  };

  private gatherCleaned = false;

  private cleanupGather(): void {
    if (this.gatherCleaned) return;
    this.gatherCleaned = true;
    EventBus.off('world-pause', this.handleWorldPause);
    EventBus.off('npc-conversation-end', this.handleQuestConversation);
    EventBus.off('adventure-completed', this.handleQuestGameResult);
    EventBus.off('demo-economy-updated', this.updateWearable);
    this.chatterTimer?.remove();
    this.chatterTimer = undefined;
    stopAmbience();
    this.questItems.forEach((c) => c.destroy());
    this.questItems = [];
    this.questGiver = undefined;
    this.npcs.forEach((npc) => npc.destroy());
    this.npcs = [];
    this.simStudents = [];
    this.stations = []; // destroyed by the base interactables cleanup
    this.activeNpc = null;
  }
}
