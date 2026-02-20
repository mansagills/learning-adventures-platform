import Phaser from 'phaser';
import { InteractableObject } from './InteractableObject';
import { EventBus } from '@/components/phaser/EventBus';

/**
 * Door - Interactable object for scene transitions
 * Used to enter/exit buildings
 */
export class Door extends InteractableObject {
  private targetScene: string;
  private spawnX: number;
  private spawnY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    targetScene: string,
    spawnX: number,
    spawnY: number
  ) {
    super(scene, x, y, texture);

    this.targetScene = targetScene;
    this.spawnX = spawnX;
    this.spawnY = spawnY;

    // Set prompt text
    this.setPromptText('Press SPACE to enter');

    // Set interaction callback
    this.setOnInteract(() => this.enterDoor());
  }

  private enterDoor(): void {
    console.log(`Entering door to ${this.targetScene}`);

    // Save player position before transition
    EventBus.emit('save-player-position', {
      x: this.x,
      y: this.y,
      scene: this.scene.scene.key,
    });

    // Fade out camera
    this.scene.cameras.main.fadeOut(500, 0, 0, 0);

    // Wait for fade to complete, then transition
    this.scene.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        // Stop current scene
        this.scene.scene.stop();

        // Start target scene
        this.scene.scene.start(this.targetScene, {
          spawnX: this.spawnX,
          spawnY: this.spawnY,
          fromScene: this.scene.scene.key,
        });
      }
    );
  }

  /**
   * Create a door that returns to a previous scene
   */
  public static createExitDoor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    targetScene: string = 'WorldScene',
    spawnX: number = 640,
    spawnY: number = 360
  ): Door {
    const door = new Door(scene, x, y, texture, targetScene, spawnX, spawnY);
    door.setPromptText('Press SPACE to exit');
    return door;
  }
}
