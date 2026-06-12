import * as Phaser from 'phaser';
import { EventBus } from '@/components/phaser/EventBus';

export interface TalkableNpcConfig {
  id: string;
  name: string;
  /** Character sheet id — texture key is `player-${charKey}` */
  charKey: string;
  x: number;
  y: number;
  /** Lines spoken in order when the player walks up */
  lines: string[];
  /** Optional patrol waypoints (pixel coords). NPC wanders when not talking. */
  wander?: { x: number; y: number }[];
  /** Optional EventBus event emitted when the conversation finishes */
  onComplete?: { event: string; payload?: Record<string, unknown> };
}

/**
 * TalkableNPC — Gather-style "walk up and talk" character.
 *
 * Intentionally standalone (not extending NPC/InteractableObject): those are
 * press-key-to-interact entities with static images, while this one owns an
 * animated sprite, auto-start proximity conversations, and in-canvas speech
 * bubbles. If a third conversation system appears, extract a shared base.
 *
 * Behaviour:
 * - Always shows a name tag above the sprite (like Gather.town).
 * - When the player enters the OUTER radius, a connection ring appears.
 * - When the player enters the TALK radius, a conversation starts
 *   automatically: an in-canvas speech bubble types out the first line and
 *   `npc-conversation` is emitted for the React chat panel.
 * - SPACE advances lines (the scene calls advance()). Walking away ends the
 *   conversation (`npc-conversation-end`).
 * - NPCs with waypoints wander between them and pause to face the player
 *   while talking.
 */

const OUTER_RADIUS = 150; // connection ring appears
const TALK_RADIUS = 85;   // conversation auto-starts
const END_RADIUS = 130;   // conversation ends (hysteresis so it doesn't flicker)

const BUBBLE_WIDTH = 230;
const TYPE_INTERVAL_MS = 22;

export class TalkableNPC extends Phaser.GameObjects.Container {
  public readonly npcId: string;
  public readonly npcName: string;

  private def: TalkableNpcConfig;
  private sprite: Phaser.GameObjects.Sprite;
  private nameTag: Phaser.GameObjects.Text;
  private ring: Phaser.GameObjects.Graphics;
  private bubble: Phaser.GameObjects.Container;
  private bubbleBg: Phaser.GameObjects.Graphics;
  private bubbleText: Phaser.GameObjects.Text;

  private isTalking = false;
  private playerInOuter = false;
  /** After a conversation ends, the player must leave END_RADIUS before a new one can start. */
  private needsExit = false;
  private lineIndex = 0;

  private wanderTween?: Phaser.Tweens.Tween;
  private wanderIndex = 0;
  private wanderTimer?: Phaser.Time.TimerEvent;

  private typeTimer?: Phaser.Time.TimerEvent;
  private fullLineText = '';

  constructor(scene: Phaser.Scene, def: TalkableNpcConfig) {
    super(scene, def.x, def.y);
    this.def = def;
    this.npcId = def.id;
    this.npcName = def.name;

    // Character sprite (96×96 frames displayed at 64×64, same as Player)
    this.sprite = scene.add.sprite(0, 0, `player-${def.charKey}`);
    this.sprite.setDisplaySize(64, 64);
    this.add(this.sprite);
    this.playAnim('idle');

    // Connection ring (hidden until player is near)
    this.ring = scene.add.graphics();
    this.ring.lineStyle(3, 0x4ade80, 0.9);
    this.ring.strokeCircle(0, 8, 38);
    this.ring.setVisible(false);
    this.addAt(this.ring, 0);

    // Gather-style name tag
    this.nameTag = scene.add.text(0, -42, def.name, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#1f2937e6',
      padding: { x: 6, y: 2 },
      align: 'center',
    });
    this.nameTag.setOrigin(0.5);
    this.add(this.nameTag);

    // Speech bubble (hidden until conversation starts)
    this.bubbleText = scene.add.text(0, 0, '', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#1f2937',
      wordWrap: { width: BUBBLE_WIDTH - 24 },
      lineSpacing: 3,
    });
    this.bubbleText.setOrigin(0.5, 0.5);
    this.bubbleBg = scene.add.graphics();
    this.bubble = scene.add.container(0, 0, [this.bubbleBg, this.bubbleText]);
    this.bubble.setVisible(false);
    this.add(this.bubble);

    scene.add.existing(this);
    this.setDepth(10);

    if (def.wander && def.wander.length > 1) {
      this.scheduleNextWander(1000 + Math.random() * 1500);
    }
  }

  // ─── Animation helpers ───────────────────────────────────────────────────────

  /** Plays a Player-registered animation if it exists (e.g. `human-2-idle`). */
  private playAnim(kind: 'idle' | 'walk-up' | 'walk-down' | 'walk-side'): void {
    const key = `${this.def.charKey}-${kind}`;
    if (this.scene.anims.exists(key)) {
      this.sprite.anims.play(key, true);
    }
  }

  // ─── Wandering ───────────────────────────────────────────────────────────────

  private scheduleNextWander(delayMs: number): void {
    this.wanderTimer = this.scene.time.delayedCall(delayMs, () => this.moveToNextWaypoint());
  }

  private moveToNextWaypoint(): void {
    if (this.isTalking || !this.def.wander || !this.scene) return;

    this.wanderIndex = (this.wanderIndex + 1) % this.def.wander.length;
    const wp = this.def.wander[this.wanderIndex];
    const dx = wp.x - this.x;
    const dy = wp.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 4) {
      this.scheduleNextWander(1500);
      return;
    }

    // Face/animate toward movement direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.playAnim('walk-side');
      this.sprite.setFlipX(dx < 0);
    } else {
      this.playAnim(dy > 0 ? 'walk-down' : 'walk-up');
      this.sprite.setFlipX(false);
    }

    // ~90 px/s stroll
    this.wanderTween = this.scene.tweens.add({
      targets: this,
      x: wp.x,
      y: wp.y,
      duration: dist * 11,
      ease: 'Linear',
      onComplete: () => {
        this.playAnim('idle');
        this.scheduleNextWander(1800 + Math.random() * 2000);
      },
    });
  }

  private pauseWandering(): void {
    this.wanderTween?.pause();
    this.wanderTimer?.remove();
    this.wanderTimer = undefined;
  }

  private resumeWandering(): void {
    if (!this.def.wander) return;
    if (this.wanderTween && this.wanderTween.isPaused()) {
      this.wanderTween.resume();
    } else {
      this.scheduleNextWander(800);
    }
  }

  // ─── Proximity / conversation lifecycle ──────────────────────────────────────

  /**
   * Called every frame by the scene.
   * @param canStart false when another NPC already holds the conversation slot.
   * @returns true if this NPC is currently talking.
   */
  public updateProximity(playerX: number, playerY: number, canStart: boolean): boolean {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);

    // Connection ring on outer radius
    const inOuter = dist < OUTER_RADIUS;
    if (inOuter !== this.playerInOuter) {
      this.playerInOuter = inOuter;
      this.ring.setVisible(inOuter);
    }

    if (this.needsExit && dist > END_RADIUS) {
      this.needsExit = false;
    }

    if (!this.isTalking && !this.needsExit && canStart && dist < TALK_RADIUS) {
      this.startConversation(playerX);
    } else if (this.isTalking && dist > END_RADIUS) {
      this.endConversation(false);
    }

    return this.isTalking;
  }

  private startConversation(playerX: number): void {
    this.isTalking = true;
    this.lineIndex = 0;
    this.pauseWandering();

    // Face the player
    this.playAnim('idle');
    this.sprite.setFlipX(playerX < this.x);

    this.showLine();
  }

  /** Advance the conversation: finish typing, or show the next line. */
  public advance(): void {
    if (!this.isTalking) return;

    // If the bubble is still typing, reveal the full line first
    if (this.typeTimer) {
      this.finishTyping();
      return;
    }

    if (this.lineIndex < this.def.lines.length - 1) {
      this.lineIndex++;
      this.showLine();
    } else {
      this.endConversation(true);
    }
  }

  private showLine(): void {
    const text = this.def.lines[this.lineIndex];
    this.fullLineText = text;
    this.bubble.setVisible(true);
    this.startTyping(text);

    EventBus.emit('npc-conversation', {
      npcId: this.npcId,
      npcName: this.npcName,
      text,
      lineIndex: this.lineIndex,
      total: this.def.lines.length,
      hasMore: this.lineIndex < this.def.lines.length - 1,
    });
  }

  private endConversation(completed: boolean): void {
    if (!this.isTalking) return;
    this.isTalking = false;
    this.needsExit = true;
    this.stopTyping();
    this.bubble.setVisible(false);
    this.resumeWandering();

    EventBus.emit('npc-conversation-end', { npcId: this.npcId, completed });

    if (completed && this.def.onComplete) {
      EventBus.emit(this.def.onComplete.event, this.def.onComplete.payload ?? {});
    }
  }

  // ─── Speech bubble rendering ─────────────────────────────────────────────────

  private startTyping(text: string): void {
    this.stopTyping();
    this.bubbleText.setText('');
    let shown = 0;
    this.typeTimer = this.scene.time.addEvent({
      delay: TYPE_INTERVAL_MS,
      repeat: Math.max(text.length - 1, 0),
      callback: () => {
        shown++;
        this.bubbleText.setText(text.slice(0, shown));
        this.layoutBubble();
        if (shown >= text.length) {
          this.stopTyping();
        }
      },
    });
    this.layoutBubble();
  }

  private finishTyping(): void {
    this.stopTyping();
    this.bubbleText.setText(this.fullLineText);
    this.layoutBubble();
  }

  private stopTyping(): void {
    this.typeTimer?.remove();
    this.typeTimer = undefined;
  }

  /** Redraws the bubble background (reusing one Graphics) to fit the text. */
  private layoutBubble(): void {
    const w = Math.max(this.bubbleText.width + 24, 80);
    const h = this.bubbleText.height + 18;
    const bubbleY = -58 - h / 2; // hover above the name tag
    const tailTop = bubbleY + h / 2;

    const g = this.bubbleBg;
    g.clear();
    g.fillStyle(0xffffff, 0.97);
    g.lineStyle(2, 0x1f2937, 1);
    g.fillRoundedRect(-w / 2, bubbleY - h / 2, w, h, 8);
    g.strokeRoundedRect(-w / 2, bubbleY - h / 2, w, h, 8);
    // Tail pointing at the NPC: outline, then white fill covering the border
    g.lineBetween(-7, tailTop, 0, tailTop + 9);
    g.lineBetween(7, tailTop, 0, tailTop + 9);
    g.fillTriangle(-7, tailTop - 2, 7, tailTop - 2, 0, tailTop + 8);

    this.bubbleText.setPosition(0, bubbleY);
  }

  public destroy(fromScene?: boolean): void {
    this.stopTyping();
    this.wanderTimer?.remove();
    if (this.wanderTween) {
      this.wanderTween.stop();
    }
    super.destroy(fromScene);
  }
}
