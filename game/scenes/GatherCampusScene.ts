import * as Phaser from 'phaser';
import { OpenWorldScene } from './OpenWorldScene';
import { TalkableNPC } from '../entities/TalkableNPC';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';
import type { BuildingDoorConfig } from '../world/TilemapGenerator';
import {
  buildGatherNpcConfigs,
  carveGatherRooms,
  getGatherRoomLabels,
  GATHER_STATIONS,
} from '../world/gatherPresentation';
import { buildSimStudentConfigs } from '../world/simStudents';
import { applyFuturisticTiles } from '../world/futuristicTiles';
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

  constructor() {
    super('GatherCampusScene');
  }

  preload(): void {
    super.preload();
    // Station objects (1024×1024 sources displayed at 64×64)
    this.load.image('arcade-cabinet', '/game-assets/tilemaps/arcade-cabinet.png');
    this.load.image('desk-computer', '/game-assets/tilemaps/desk-computer.png');
  }

  create(): void {
    // Swap the campus tile art for the futuristic set BEFORE the base scene
    // builds the tilemap images (keys stay the same, only pixels change)
    applyFuturisticTiles(this);

    super.create();

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
    mathQuest.reportScore(data.score);
    this.questGiver?.setQuestDialogue(mathQuest.dialogue());
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
      this.npcs.push(new TalkableNPC(this, config));
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
    this.questItems.forEach((c) => c.destroy());
    this.questItems = [];
    this.questGiver = undefined;
    this.npcs.forEach((npc) => npc.destroy());
    this.npcs = [];
    this.stations = []; // destroyed by the base interactables cleanup
    this.activeNpc = null;
  }
}
