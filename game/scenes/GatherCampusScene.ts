import * as Phaser from 'phaser';
import { OpenWorldScene } from './OpenWorldScene';
import { TalkableNPC } from '../entities/TalkableNPC';
import { SimLearner } from '../entities/SimLearner';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';
import type { BuildingDoorConfig } from '../world/TilemapGenerator';
import {
  buildSimLearnerConfigs,
  findStudyCircles,
  type StudyCircle,
} from '../world/simLearners';
import {
  buildGatherNpcConfigs,
  carveGatherRooms,
  getGatherRoomLabels,
  GATHER_STATIONS,
} from '../world/gatherPresentation';

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
  private simLearners: SimLearner[] = [];
  private studyCircleLayer?: Phaser.GameObjects.Graphics;
  private stations: InteractableObject[] = [];
  private activeNpc: TalkableNPC | null = null;
  private isPaused = false;
  private extraInteractKey?: Phaser.Input.Keyboard.Key;

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
    EventBus.on('adventure-completed', this.handleAdventureCompleted);
    this.events.once('shutdown', this.cleanupGather, this);
    this.events.once('destroy', this.cleanupGather, this);
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
    this.createStations();
    this.createSimLearners();
  }

  private createSimLearners(): void {
    this.studyCircleLayer = this.add.graphics();
    this.studyCircleLayer.setDepth(7);
    buildSimLearnerConfigs().forEach((config) => {
      this.simLearners.push(new SimLearner(this, config));
    });
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
    this.renderStudyCircles();

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

  private handleAdventureCompleted = (data: { adventureId?: string }) => {
    const adventureId = data.adventureId ?? 'unknown-activity';
    this.simLearners.forEach((learner) => learner.reactToCelebration(adventureId));
  };

  private renderStudyCircles(): void {
    if (!this.studyCircleLayer) return;

    const circles = findStudyCircles(
      this.simLearners.map((learner) => learner.getStudyCircleParticipant()),
      150,
    );

    const layer = this.studyCircleLayer;
    layer.clear();
    circles.forEach((circle) => this.drawStudyCircle(layer, circle));
  }

  private drawStudyCircle(
    layer: Phaser.GameObjects.Graphics,
    circle: StudyCircle,
  ): void {
    layer.lineStyle(3, circle.color, 0.42);
    layer.fillStyle(circle.color, 0.08);
    layer.fillCircle(circle.centerX, circle.centerY + 8, circle.radius);
    layer.strokeCircle(circle.centerX, circle.centerY + 8, circle.radius);
  }

  private gatherCleaned = false;

  private cleanupGather(): void {
    if (this.gatherCleaned) return;
    this.gatherCleaned = true;
    EventBus.off('world-pause', this.handleWorldPause);
    EventBus.off('adventure-completed', this.handleAdventureCompleted);
    this.npcs.forEach((npc) => npc.destroy());
    this.simLearners.forEach((learner) => learner.destroy());
    this.studyCircleLayer?.destroy();
    this.npcs = [];
    this.simLearners = [];
    this.studyCircleLayer = undefined;
    this.stations = []; // destroyed by the base interactables cleanup
    this.activeNpc = null;
  }
}
