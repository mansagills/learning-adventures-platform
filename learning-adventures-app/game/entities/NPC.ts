import Phaser from 'phaser';
import { InteractableObject } from './InteractableObject';

export interface DialogLine {
  text: string;
  speaker?: string;
}

/**
 * NPC - Non-player character with dialog system
 */
export class NPC extends InteractableObject {
  private name: string;
  private dialog: DialogLine[];
  private currentDialogIndex: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    name: string,
    dialog: DialogLine[]
  ) {
    super(scene, x, y, texture);

    this.name = name;
    this.dialog = dialog;

    // Set prompt text
    this.setPromptText(`Press SPACE to talk to ${name}`);

    // Set interaction callback
    this.setOnInteract(() => this.showDialog());
  }

  private showDialog(): void {
    if (this.dialog.length === 0) return;

    // Get current dialog line
    const dialogLine = this.dialog[this.currentDialogIndex];

    // Emit event to React to show dialog modal
    // (React component will handle the actual UI)
    const eventData = {
      npcName: this.name,
      text: dialogLine.text,
      speaker: dialogLine.speaker || this.name,
      hasMore: this.currentDialogIndex < this.dialog.length - 1,
    };

    console.log('NPC Dialog:', eventData);

    // For now, just log to console
    // TODO: Create dialog modal in React (Phase 3 polish)

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
