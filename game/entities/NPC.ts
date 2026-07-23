import * as Phaser from 'phaser';
import { InteractableObject } from './InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';

export interface DialogLine {
  text: string;
  speaker?: string;
}

export interface QuestGiverConfig {
  questId: string;
  questTitle: string;
  questDescription: string;
  xpReward: number;
  coinReward: number;
}

/**
 * NPC - Non-player character with dialog and optional quest-giving.
 * If constructed with a QuestGiverConfig, interaction emits 'quest-offer'
 * to React instead of plain dialog when the quest is available.
 */
export class NPC extends InteractableObject {
  private npcName: string;
  private dialog: DialogLine[];
  private currentDialogIndex: number = 0;
  private questConfig?: QuestGiverConfig;
  private readonly onFinalDialogLine?: () => void;
  // Injected by OpenWorldScene after each quest-status-update
  questStatus: 'available' | 'active' | 'completed' | 'locked' | 'none' = 'none';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    npcName: string,
    dialog: DialogLine[],
    questConfigOrFinalDialogLine?: QuestGiverConfig | (() => void),
    onFinalDialogLine?: () => void
  ) {
    super(scene, x, y, texture);

    this.npcName = npcName;
    this.dialog = dialog;
    if (typeof questConfigOrFinalDialogLine === 'function') {
      this.onFinalDialogLine = questConfigOrFinalDialogLine;
    } else {
      this.questConfig = questConfigOrFinalDialogLine;
      this.onFinalDialogLine = onFinalDialogLine;
    }

    this.setPromptText(`Press SPACE to talk to ${npcName}`);
    this.setOnInteract(() => this.onInteract());
  }

  private onInteract(): void {
    // If this NPC has an available quest, offer it
    if (this.questConfig && (this.questStatus === 'available' || this.questStatus === 'active')) {
      EventBus.emit('quest-offer', {
        npcName: this.npcName,
        questId: this.questConfig.questId,
        questTitle: this.questConfig.questTitle,
        questDescription: this.questConfig.questDescription,
        xpReward: this.questConfig.xpReward,
        coinReward: this.questConfig.coinReward,
        status: this.questStatus,
      });
      return;
    }

    // Otherwise show regular dialog
    this.showDialog();
  }

  private showDialog(): void {
    if (this.dialog.length === 0) return;
    const dialogLine = this.dialog[this.currentDialogIndex];
    const eventData = {
      npcName: this.npcName,
      text: dialogLine.text,
      speaker: dialogLine.speaker ?? this.npcName,
      hasMore: this.currentDialogIndex < this.dialog.length - 1,
    };

    EventBus.emit('npc-dialog', eventData);

    if (
      this.currentDialogIndex === this.dialog.length - 1 &&
      this.onFinalDialogLine
    ) {
      this.onFinalDialogLine();
    }

    // Cycle through dialog
    this.currentDialogIndex = (this.currentDialogIndex + 1) % this.dialog.length;
  }

  /**
   * Reset dialog to beginning
   */
  public resetDialog(): void {
    this.currentDialogIndex = 0;
  }

  /**
   * Add new dialog lines
   */
  public addDialog(newDialog: DialogLine[]): void {
    this.dialog.push(...newDialog);
  }

  /**
   * Set dialog lines (replaces existing)
   */
  public setDialog(newDialog: DialogLine[]): void {
    this.dialog = newDialog;
    this.currentDialogIndex = 0;
  }
}
