import * as Phaser from 'phaser';
import { OpenWorldScene } from './OpenWorldScene';
import { TalkableNPC } from '../entities/TalkableNPC';
import { SimLearner } from '../entities/SimLearner';
import { InteractableObject } from '../entities/InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';
import { TILE_SIZE, type BuildingDoorConfig } from '../world/TilemapGenerator';
import { CAMPUS_BUILDINGS } from '../world/campusLayout';
import {
  buildSimLearnerConfigs,
  findStudyCircles,
  type StudyCircle,
} from '../world/simLearners';
import {
  buildGatherNpcConfigs,
  carveGatherRooms,
  getGatherRoomLabels,
  GATHER_ROOMS,
  GATHER_STATIONS,
} from '../world/gatherPresentation';
import {
  getFuturisticLandmarkSkin,
  getFuturisticRoomSkin,
} from '../world/futuristicCampusArt';
import {
  CAMPUS_QUEST_ITEMS,
  MATH_RACE_RALLY_ID,
  type CampusQuestItem,
} from '../world/campusGuidedQuest';

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
  private futuristicFacadeLayer?: Phaser.GameObjects.Container;
  private studyCircleLayer?: Phaser.GameObjects.Graphics;
  private stations: InteractableObject[] = [];
  private questItems: InteractableObject[] = [];
  private collectedQuestItemIds = new Set<string>();
  private isMathRaceUnlocked = false;
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

    this.createFuturisticRoomFacades();

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
    EventBus.on('campus-quest-math-race-unlocked', this.handleMathRaceUnlocked);
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
    this.createQuestItems();
    this.createSimLearners();
  }

  private createSimLearners(): void {
    this.studyCircleLayer = this.add.graphics();
    this.studyCircleLayer.setDepth(7);
    buildSimLearnerConfigs().forEach((config) => {
      this.simLearners.push(new SimLearner(this, config));
    });
  }

  private createFuturisticRoomFacades(): void {
    this.futuristicFacadeLayer = this.add.container(0, 0);
    this.futuristicFacadeLayer.setDepth(4);

    GATHER_ROOMS.forEach((room) => {
      const skin = getFuturisticRoomSkin(room.id);
      if (!skin) return;

      const x = room.c0 * TILE_SIZE;
      const y = room.r0 * TILE_SIZE;
      const width = (room.c1 - room.c0 + 1) * TILE_SIZE;
      const height = (room.r1 - room.r0 + 1) * TILE_SIZE;
      const roomGraphics = this.add.graphics();

      roomGraphics.fillStyle(skin.darkColor, 0.52);
      roomGraphics.fillRoundedRect(x + 4, y + 4, width - 8, height - 8, 8);
      roomGraphics.lineStyle(6, skin.accentColor, 0.95);
      roomGraphics.strokeRoundedRect(x + 8, y + 8, width - 16, height - 16, 7);
      roomGraphics.lineStyle(2, skin.glassColor, 0.7);
      roomGraphics.strokeRoundedRect(x + 18, y + 18, width - 36, height - 36, 5);

      this.drawGlassPanels(roomGraphics, x, y, width, height, skin.glassColor);
      this.drawInteriorGrid(roomGraphics, x, y, width, height, skin.glassColor);
      this.drawDoorGlow(roomGraphics, room, skin.accentColor);
      this.drawCornerCaps(roomGraphics, x, y, width, height, skin.accentColor);

      this.futuristicFacadeLayer?.add(roomGraphics);

      const sign = this.add.text(x + width / 2, y + 24, skin.shortLabel, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#f8fafc',
        backgroundColor: '#020617cc',
        padding: { x: 8, y: 4 },
      });
      sign.setOrigin(0.5);
      sign.setDepth(7);
      this.futuristicFacadeLayer?.add(sign);
    });

    this.createFuturisticLandmarkFacades();
  }

  private drawGlassPanels(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    glassColor: number,
  ): void {
    graphics.fillStyle(glassColor, 0.23);

    for (let panelX = x + 44; panelX < x + width - 44; panelX += 96) {
      graphics.fillRect(panelX, y + 14, 48, 10);
      graphics.fillRect(panelX, y + height - 24, 48, 10);
    }

    for (let panelY = y + 52; panelY < y + height - 52; panelY += 92) {
      graphics.fillRect(x + 14, panelY, 10, 42);
      graphics.fillRect(x + width - 24, panelY, 10, 42);
    }
  }

  private drawInteriorGrid(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    glassColor: number,
  ): void {
    graphics.lineStyle(1, glassColor, 0.18);

    for (let gridX = x + TILE_SIZE * 2; gridX < x + width - TILE_SIZE; gridX += TILE_SIZE * 2) {
      graphics.lineBetween(gridX, y + TILE_SIZE, gridX, y + height - TILE_SIZE);
    }

    for (let gridY = y + TILE_SIZE * 2; gridY < y + height - TILE_SIZE; gridY += TILE_SIZE * 2) {
      graphics.lineBetween(x + TILE_SIZE, gridY, x + width - TILE_SIZE, gridY);
    }
  }

  private drawDoorGlow(
    graphics: Phaser.GameObjects.Graphics,
    room: (typeof GATHER_ROOMS)[number],
    accentColor: number,
  ): void {
    room.door.forEach((doorTile) => {
      const doorX = doorTile.c * TILE_SIZE;
      const doorY = doorTile.r * TILE_SIZE;

      graphics.fillStyle(accentColor, 0.4);
      graphics.fillRoundedRect(doorX + 6, doorY + 18, TILE_SIZE - 12, 34, 6);
      graphics.lineStyle(3, accentColor, 0.9);
      graphics.lineBetween(doorX + 8, doorY + 54, doorX + TILE_SIZE - 8, doorY + 54);
    });
  }

  private drawCornerCaps(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    accentColor: number,
  ): void {
    const capSize = 28;
    graphics.fillStyle(accentColor, 0.85);
    graphics.fillRect(x + 12, y + 12, capSize, 8);
    graphics.fillRect(x + 12, y + 12, 8, capSize);
    graphics.fillRect(x + width - 40, y + 12, capSize, 8);
    graphics.fillRect(x + width - 20, y + 12, 8, capSize);
    graphics.fillRect(x + 12, y + height - 20, capSize, 8);
    graphics.fillRect(x + 12, y + height - 40, 8, capSize);
    graphics.fillRect(x + width - 40, y + height - 20, capSize, 8);
    graphics.fillRect(x + width - 20, y + height - 40, 8, capSize);
  }

  private createFuturisticLandmarkFacades(): void {
    CAMPUS_BUILDINGS.forEach((building) => {
      const skin = getFuturisticLandmarkSkin(building.id);
      if (!skin) return;

      const x = building.wallTileCol * TILE_SIZE;
      const y = building.wallTileRow * TILE_SIZE;
      const width = building.wallTileW * TILE_SIZE;
      const height = building.wallTileH * TILE_SIZE;
      const graphics = this.add.graphics();

      graphics.fillStyle(skin.darkColor, 0.72);
      graphics.fillRoundedRect(x + 3, y + 3, width - 6, height - 6, 8);
      graphics.lineStyle(5, skin.accentColor, 0.96);
      graphics.strokeRoundedRect(x + 8, y + 8, width - 16, height - 16, 7);
      graphics.fillStyle(skin.glassColor, 0.25);
      graphics.fillRect(x + 22, y + 20, width - 44, 16);
      graphics.fillRect(x + 22, y + height - 38, width - 44, 12);
      graphics.lineStyle(2, skin.glassColor, 0.65);
      graphics.lineBetween(x + 18, y + height / 2, x + width - 18, y + height / 2);

      const doorX = building.doorTileCol * TILE_SIZE;
      const doorY = building.doorTileRow * TILE_SIZE;
      graphics.fillStyle(skin.accentColor, 0.4);
      graphics.fillRoundedRect(doorX + 8, doorY + 18, TILE_SIZE - 16, 36, 6);
      graphics.lineStyle(3, skin.accentColor, 0.9);
      graphics.lineBetween(doorX + 10, doorY + 55, doorX + TILE_SIZE - 10, doorY + 55);

      this.drawCornerCaps(graphics, x, y, width, height, skin.accentColor);
      this.futuristicFacadeLayer?.add(graphics);

      const sign = this.add.text(x + width / 2, y + 24, skin.shortLabel, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#f8fafc',
        backgroundColor: '#020617cc',
        padding: { x: 7, y: 3 },
      });
      sign.setOrigin(0.5);
      sign.setDepth(7);
      this.futuristicFacadeLayer?.add(sign);
    });
  }

  private createStations(): void {
    GATHER_STATIONS.forEach((def) => {
      const station = new InteractableObject(this, def.x, def.y, def.texture);
      station.setPromptText(`Press SPACE: ${def.name}`);
      station.setOnInteract(() => {
        if (def.adventureId === MATH_RACE_RALLY_ID && !this.isMathRaceUnlocked) {
          EventBus.emit('campus-quest-notice', {
            message: 'Bring the rally parts back to Mrs. Numbers first.',
          });
          return;
        }
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

  private createQuestItems(): void {
    CAMPUS_QUEST_ITEMS.forEach((item) => {
      const questItem = new InteractableObject(this, item.x, item.y, 'desk-computer', undefined, 38);
      questItem.setPromptText(`Pick up: ${item.label}`);
      questItem.setInteractRadius(58);
      questItem.setOnInteract(() => this.collectQuestItem(item, questItem));
      questItem.setDepth(6);
      this.questItems.push(questItem);
      this.interactables.push(questItem);
      this.addNameLabel(item.label, item.x, item.y + 34);
    });
  }

  private collectQuestItem(item: CampusQuestItem, questItem: InteractableObject): void {
    if (this.collectedQuestItemIds.has(item.id)) return;

    this.collectedQuestItemIds.add(item.id);
    this.questItems = this.questItems.filter((candidate) => candidate !== questItem);
    this.interactables = this.interactables.filter((candidate) => candidate !== questItem);
    questItem.destroy();

    EventBus.emit('campus-quest-item-collected', {
      itemId: item.id,
      collectedItemIds: Array.from(this.collectedQuestItemIds),
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

  private handleMathRaceUnlocked = () => {
    this.isMathRaceUnlocked = true;
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
    EventBus.off('campus-quest-math-race-unlocked', this.handleMathRaceUnlocked);
    this.npcs.forEach((npc) => npc.destroy());
    this.simLearners.forEach((learner) => learner.destroy());
    this.questItems.forEach((item) => item.destroy());
    this.futuristicFacadeLayer?.destroy();
    this.studyCircleLayer?.destroy();
    this.npcs = [];
    this.simLearners = [];
    this.questItems = [];
    this.collectedQuestItemIds.clear();
    this.isMathRaceUnlocked = false;
    this.futuristicFacadeLayer = undefined;
    this.studyCircleLayer = undefined;
    this.stations = []; // destroyed by the base interactables cleanup
    this.activeNpc = null;
  }
}
