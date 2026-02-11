import Phaser from 'phaser';
import { EventBus } from '@/components/phaser/EventBus';

/**
 * Player entity for top-down movement
 * Handles keyboard/touch input, animations, and state sync to backend
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private speed: number = 160; // Movement speed in pixels/second
  private lastSaveTime: number = 0;
  private saveInterval: number = 10000; // Save position every 10 seconds
  private currentDirection: 'up' | 'down' | 'left' | 'right' = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics body
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCollideWorldBounds(true); // Don't let player leave world bounds
      body.setSize(16, 16); // Collision box size (adjust based on sprite)
      body.setOffset(8, 16); // Offset collision box if needed
    }

    // Setup controls
    this.setupControls();

    // Create animations (placeholder - will be replaced with actual sprite animations)
    this.createAnimations();

    // Listen for EventBus commands
    this.setupEventListeners();
  }

  private setupControls(): void {
    if (this.scene.input.keyboard) {
      // Arrow keys
      this.cursors = this.scene.input.keyboard.createCursorKeys();

      // WASD keys
      this.wasd = this.scene.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      }) as {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
      };
    }
  }

  private createAnimations(): void {
    // Placeholder animations - will be replaced with actual sprite sheets
    // For now, we'll just use tint to indicate direction
    // TODO: Replace with actual animation frames when sprite sheets are ready
  }

  private setupEventListeners(): void {
    // Listen for teleport commands from React
    EventBus.on('teleport-player', (data: { x: number; y: number; scene?: string }) => {
      if (data.scene && data.scene !== this.scene.scene.key) {
        // Scene change requested - let scene manager handle it
        return;
      }
      this.setPosition(data.x, data.y);
    });

    // Listen for speed changes (e.g., speed boost items)
    EventBus.on('player-speed-change', (data: { speed: number }) => {
      this.speed = data.speed;
    });
  }

  public update(time: number, delta: number): void {
    this.handleMovement();
    this.syncToBackend(time);
  }

  private handleMovement(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    let velocityX = 0;
    let velocityY = 0;

    // Check keyboard input
    if (this.cursors && this.wasd) {
      // Horizontal movement
      if (this.cursors.left.isDown || this.wasd.A.isDown) {
        velocityX = -this.speed;
        this.currentDirection = 'left';
      } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
        velocityX = this.speed;
        this.currentDirection = 'right';
      }

      // Vertical movement
      if (this.cursors.up.isDown || this.wasd.W.isDown) {
        velocityY = -this.speed;
        this.currentDirection = 'up';
      } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
        velocityY = this.speed;
        this.currentDirection = 'down';
      }
    }

    // Normalize diagonal movement (so diagonal speed isn't faster)
    if (velocityX !== 0 && velocityY !== 0) {
      const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX = (velocityX / length) * this.speed;
      velocityY = (velocityY / length) * this.speed;
    }

    // Apply velocity
    body.setVelocity(velocityX, velocityY);

    // Update sprite direction (placeholder - will use animations later)
    this.updateSpriteDirection(velocityX, velocityY);
  }

  private updateSpriteDirection(velocityX: number, velocityY: number): void {
    // Placeholder visual feedback - change tint based on direction
    // TODO: Replace with actual sprite animations
    if (velocityX === 0 && velocityY === 0) {
      // Idle - no tint
      this.clearTint();
    } else if (Math.abs(velocityX) > Math.abs(velocityY)) {
      // Moving horizontally
      this.setTint(velocityX > 0 ? 0xff0000 : 0x0000ff); // Red right, blue left
    } else {
      // Moving vertically
      this.setTint(velocityY > 0 ? 0x00ff00 : 0xffff00); // Green down, yellow up
    }
  }

  private syncToBackend(currentTime: number): void {
    // Debounced save - only save position every 10 seconds
    if (currentTime - this.lastSaveTime > this.saveInterval) {
      this.lastSaveTime = currentTime;

      // Emit event to React to save position
      EventBus.emit('save-player-position', {
        x: this.x,
        y: this.y,
        scene: this.scene.scene.key,
      });
    }
  }

  public destroy(fromScene?: boolean): void {
    // Clean up event listeners
    EventBus.off('teleport-player');
    EventBus.off('player-speed-change');

    super.destroy(fromScene);
  }
}
