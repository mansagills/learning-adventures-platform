import * as Phaser from 'phaser';
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
  private handleTeleport!: (data: { x: number; y: number; scene?: string }) => void;
  private handleSpeedChange!: (data: { speed: number }) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale sprite to 64x64 display (sprites are 96x96 per frame)
    this.setDisplaySize(64, 64);

    // Configure physics body
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCollideWorldBounds(true);
      body.setSize(40, 40);   // Collision box — slightly smaller than display
      body.setOffset(28, 40); // Offset within 96px frame to align feet
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
    // Sprite sheets: 384x384, 4 cols x 4 rows, 96x96 per frame (16 frames total)
    // Row 0 (frames 0-3):  walk UP   (back of character, walking away)
    // Row 1 (frames 4-7):  walk SIDE (left-facing; mirror for right via flipX)
    // Row 2 (frames 8-11): walk DOWN (front of character, facing camera)
    // Row 3 (frames 12-15): walk SIDE variant / idle
    const chars = ['human-1', 'human-2', 'robot-blue', 'wizard-purple', 'cat-orange', 'knight-silver'];
    const anims = [
      { key: 'walk-up',    start: 0,  end: 3  },
      { key: 'walk-side',  start: 4,  end: 7  },
      { key: 'walk-down',  start: 8,  end: 11 },
      { key: 'idle',       start: 12, end: 15 },
    ];

    for (const char of chars) {
      const textureKey = `player-${char}`;
      if (!this.scene.textures.exists(textureKey)) continue;
      for (const anim of anims) {
        const animKey = `${char}-${anim.key}`;
        if (!this.scene.anims.exists(animKey)) {
          this.scene.anims.create({
            key: animKey,
            frames: this.scene.anims.generateFrameNumbers(textureKey, { start: anim.start, end: anim.end }),
            frameRate: anim.key === 'idle' ? 3 : 8,
            repeat: -1,
          });
        }
      }
    }
  }

  private setupEventListeners(): void {
    // Store bound callbacks so they can be removed precisely in destroy()
    this.handleTeleport = (data: { x: number; y: number; scene?: string }) => {
      if (data.scene && data.scene !== this.scene.scene.key) {
        return;
      }
      this.setPosition(data.x, data.y);
    };

    this.handleSpeedChange = (data: { speed: number }) => {
      this.speed = data.speed;
    };

    EventBus.on('teleport-player', this.handleTeleport);
    EventBus.on('player-speed-change', this.handleSpeedChange);
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
    // Derive the character id from the texture key (e.g. 'player-human-1' → 'human-1')
    const char = this.texture.key.replace('player-', '');
    const hasAnims = this.scene.anims.exists(`${char}-walk-down`);

    if (!hasAnims) {
      // Fallback: keep legacy tint system if animations haven't loaded yet
      if (velocityX === 0 && velocityY === 0) {
        this.clearTint();
      } else if (Math.abs(velocityX) > Math.abs(velocityY)) {
        this.setTint(velocityX > 0 ? 0xff0000 : 0x0000ff);
      } else {
        this.setTint(velocityY > 0 ? 0x00ff00 : 0xffff00);
      }
      return;
    }

    this.clearTint();

    if (velocityX === 0 && velocityY === 0) {
      this.anims.play(`${char}-idle`, true);
    } else if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.anims.play(`${char}-walk-side`, true);
      this.setFlipX(velocityX < 0); // Mirror sprite for left movement
    } else if (velocityY > 0) {
      this.anims.play(`${char}-walk-down`, true);
      this.setFlipX(false);
    } else {
      this.anims.play(`${char}-walk-up`, true);
      this.setFlipX(false);
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
    // Remove only this instance's listeners (not all listeners for these events)
    EventBus.off('teleport-player', this.handleTeleport);
    EventBus.off('player-speed-change', this.handleSpeedChange);

    super.destroy(fromScene);
  }
}
