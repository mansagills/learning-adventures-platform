import Phaser from 'phaser';

/**
 * InteractableObject - Base class for objects that players can interact with
 * Used for: doors, arcade cabinets, computers, NPCs, chests, etc.
 */
export class InteractableObject extends Phaser.GameObjects.Container {
  protected interactRadius: number = 50; // Distance player must be within to interact
  protected isPlayerNearby: boolean = false;
  protected promptText?: Phaser.GameObjects.Text;
  protected highlightGraphics?: Phaser.GameObjects.Graphics;
  protected onInteractCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y);

    // Add sprite to container
    const sprite = scene.add.image(0, 0, texture, frame);
    this.add(sprite);

    // Add to scene
    scene.add.existing(this);

    // Create interaction prompt (hidden by default)
    this.createPrompt();

    // Create highlight effect (hidden by default)
    this.createHighlight();
  }

  private createPrompt(): void {
    this.promptText = this.scene.add.text(0, -40, 'Press SPACE', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 6, y: 3 },
      align: 'center',
    });
    this.promptText.setOrigin(0.5);
    this.promptText.setVisible(false);
    this.promptText.setScrollFactor(1); // Follow camera
    this.add(this.promptText);
  }

  private createHighlight(): void {
    this.highlightGraphics = this.scene.add.graphics();
    this.highlightGraphics.lineStyle(3, 0xFFD700, 1); // Gold outline
    this.highlightGraphics.strokeCircle(0, 0, 25);
    this.highlightGraphics.setVisible(false);
    this.add(this.highlightGraphics);
  }

  /**
   * Check if player is nearby and show/hide prompt
   */
  public checkPlayerProximity(playerX: number, playerY: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      playerX,
      playerY
    );

    const wasNearby = this.isPlayerNearby;
    this.isPlayerNearby = distance < this.interactRadius;

    // Show/hide prompt based on proximity
    if (this.isPlayerNearby && !wasNearby) {
      this.showPrompt();
    } else if (!this.isPlayerNearby && wasNearby) {
      this.hidePrompt();
    }

    return this.isPlayerNearby;
  }

  /**
   * Show interaction prompt
   */
  protected showPrompt(): void {
    if (this.promptText) {
      this.promptText.setVisible(true);
    }
    if (this.highlightGraphics && this.scene && this.scene.tweens) {
      this.highlightGraphics.setVisible(true);
      // Add pulsing animation
      this.scene.tweens.add({
        targets: this.highlightGraphics,
        alpha: { from: 1, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /**
   * Hide interaction prompt
   */
  protected hidePrompt(): void {
    if (this.promptText) {
      this.promptText.setVisible(false);
    }
    if (this.highlightGraphics) {
      this.highlightGraphics.setVisible(false);
      if (this.scene && this.scene.tweens) {
        this.scene.tweens.killTweensOf(this.highlightGraphics);
      }
      this.highlightGraphics.setAlpha(1);
    }
  }

  /**
   * Handle interaction when player presses interact key
   */
  public interact(): void {
    if (this.isPlayerNearby && this.onInteractCallback) {
      this.onInteractCallback();
    }
  }

  /**
   * Set callback for when player interacts
   */
  public setOnInteract(callback: () => void): void {
    this.onInteractCallback = callback;
  }

  /**
   * Update prompt text
   */
  public setPromptText(text: string): void {
    if (this.promptText) {
      this.promptText.setText(text);
    }
  }

  /**
   * Set interaction radius
   */
  public setInteractRadius(radius: number): void {
    this.interactRadius = radius;
  }

  public destroy(fromScene?: boolean): void {
    // Clean up tweens (check if scene still exists)
    if (this.highlightGraphics && this.scene && this.scene.tweens) {
      this.scene.tweens.killTweensOf(this.highlightGraphics);
    }
    super.destroy(fromScene);
  }
}
