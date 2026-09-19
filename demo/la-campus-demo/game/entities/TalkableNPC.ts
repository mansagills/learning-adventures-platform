import * as Phaser from 'phaser';
import { EventBus } from '@/components/phaser/EventBus';
import { containerFeetBody } from '../world/characterBody';

export interface NpcWaypoint {
  x: number;
  y: number;
  /** How long to linger at this waypoint (ms). Default: 1.8-3.8s random. */
  pauseMs?: number;
  /** Emote shown above the name tag while lingering (e.g. '🎮', '💭'). */
  emote?: string;
}

export interface TalkableNpcConfig {
  id: string;
  name: string;
  /** Character sheet id — texture key is `player-${charKey}` */
  charKey: string;
  x: number;
  y: number;
  /** Lines spoken in order when the player walks up */
  lines: string[];
  /**
   * Optional rotating dialogue: each encounter uses the next set, so talking
   * to the NPC twice gives a different conversation. Overrides `lines`.
   */
  lineSets?: string[][];
  /** Optional patrol waypoints (pixel coords). NPC wanders when not talking. */
  wander?: NpcWaypoint[];
  /** Walk speed in px/s (default 90). Small variations make a crowd feel alive. */
  speed?: number;
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

/** How close counts as "arrived" at a waypoint (px). */
const ARRIVE_RADIUS = 8;
/** Distance we must close each frame to count as making progress (px). */
const PROGRESS_EPSILON = 0.25;
/** Give up on a blocked leg after this long and move to the next waypoint. */
const STUCK_TIMEOUT_MS = 2500;

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
  /** Lines for the current conversation (rotates through def.lineSets). */
  private activeLines: string[];
  private encounterCount = 0;
  /** Quest override: fixed dialogue replacing lineSets rotation while set. */
  private questLines: string[] | null = null;

  /** Steering state. NPCs move by body velocity so they collide like the
   *  player does; a tween would write x/y straight past the physics step. */
  private wanderIndex = 0;
  private wanderTimer?: Phaser.Time.TimerEvent;
  private walkTarget: NpcWaypoint | null = null;
  /** Distance to the target last frame — used to notice we stopped making
   *  progress (blocked by a wall, a prop, or another NPC). */
  private lastDistToTarget = Number.POSITIVE_INFINITY;
  private blockedForMs = 0;
  private emoteTag?: Phaser.GameObjects.Text;
  private emoteTimer?: Phaser.Time.TimerEvent;

  private typeTimer?: Phaser.Time.TimerEvent;
  private fullLineText = '';
  /** Bubble hangs below the NPC when the player is standing above them. */
  private bubbleBelow = false;

  constructor(scene: Phaser.Scene, def: TalkableNpcConfig) {
    super(scene, def.x, def.y);
    this.def = def;
    this.npcId = def.id;
    this.npcName = def.name;
    this.activeLines = def.lineSets?.[0] ?? def.lines;

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

    // Physics body — the same feet box the player uses (characterBody.ts), so
    // NPCs are stopped by walls, furniture and each other instead of gliding
    // over them. A Container has no origin, so the offset is a plain
    // world-pixel shift from its centre.
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      const feet = containerFeetBody();
      body.setSize(feet.width, feet.height);
      body.setOffset(feet.offsetX, feet.offsetY);
      body.setCollideWorldBounds(true);
      // The player can walk up against an NPC and be blocked, but never shove
      // them off their patrol route; NPC-vs-NPC likewise just blocks.
      body.pushable = false;
    }

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

  /** Pick the next waypoint and start steering toward it. */
  private moveToNextWaypoint(): void {
    if (this.isTalking || !this.def.wander || !this.scene) return;

    this.wanderIndex = (this.wanderIndex + 1) % this.def.wander.length;
    const wp = this.def.wander[this.wanderIndex];
    if (Phaser.Math.Distance.Between(this.x, this.y, wp.x, wp.y) < 4) {
      this.scheduleNextWander(1500);
      return;
    }

    this.walkTarget = wp;
    this.lastDistToTarget = Number.POSITIVE_INFINITY;
    this.blockedForMs = 0;
  }

  /** Stop steering, stand still, and queue the next leg after `pauseMs`. */
  private arriveAtWaypoint(wp: NpcWaypoint): void {
    this.walkTarget = null;
    this.setVelocity(0, 0);
    this.playAnim('idle');

    const pause = wp.pauseMs ?? 1800 + Math.random() * 2000;
    if (wp.emote) {
      this.showEmote(wp.emote, pause);
    }
    this.scheduleNextWander(pause);
  }

  private setVelocity(x: number, y: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    body?.setVelocity(x, y);
  }

  /**
   * Per-frame steering, driven by the scene's update loop.
   *
   * Waypoint routes are hand-authored along wall-free lines, so collision is
   * normally just a safety net — but the player (or another NPC) can still
   * body-block a route. If we stop closing on the target for STUCK_TIMEOUT_MS
   * we give up on this leg and move on rather than grinding into the obstacle
   * forever, since there is no pathfinding here to route around it.
   */
  public updateMovement(delta: number): void {
    const wp = this.walkTarget;
    if (!wp) return;
    if (this.isTalking) {
      this.setVelocity(0, 0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, wp.x, wp.y);
    if (dist < ARRIVE_RADIUS) {
      this.arriveAtWaypoint(wp);
      return;
    }

    // Progress check: closing in resets the timer, standing still accrues it.
    if (dist < this.lastDistToTarget - PROGRESS_EPSILON) {
      this.blockedForMs = 0;
      this.lastDistToTarget = dist;
    } else {
      this.blockedForMs += delta;
      if (this.blockedForMs >= STUCK_TIMEOUT_MS) {
        this.arriveAtWaypoint(wp);
        return;
      }
    }

    const speed = this.def.speed ?? 90; // px/s stroll
    const angle = Phaser.Math.Angle.Between(this.x, this.y, wp.x, wp.y);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    this.setVelocity(vx, vy);

    // Face/animate toward travel direction
    if (Math.abs(vx) > Math.abs(vy)) {
      this.playAnim('walk-side');
      this.sprite.setFlipX(vx < 0);
    } else {
      this.playAnim(vy > 0 ? 'walk-down' : 'walk-up');
      this.sprite.setFlipX(false);
    }
  }

  /** Show a floating emote above the name tag while the NPC lingers. */
  private showEmote(emote: string, durationMs: number): void {
    this.hideEmote();
    if (!this.emoteTag) {
      this.emoteTag = this.scene.add.text(0, -64, '', { fontSize: '18px' });
      this.emoteTag.setOrigin(0.5);
      this.add(this.emoteTag);
    }
    this.emoteTag.setText(emote);
    this.emoteTag.setVisible(true);
    // Gentle bob so it reads as "doing something", not a stuck sprite
    this.scene.tweens.add({
      targets: this.emoteTag,
      y: -70,
      duration: 600,
      yoyo: true,
      repeat: Math.max(Math.floor(durationMs / 1200) - 1, 0),
      ease: 'Sine.easeInOut',
    });
    this.emoteTimer = this.scene.time.delayedCall(durationMs, () => this.hideEmote());
  }

  private hideEmote(): void {
    this.emoteTimer?.remove();
    this.emoteTimer = undefined;
    if (this.emoteTag) {
      this.scene.tweens.killTweensOf(this.emoteTag);
      this.emoteTag.setVisible(false);
      this.emoteTag.setY(-64);
    }
    this.chatterTag?.setVisible(false);
  }

  // ─── Ambient life (scene-driven, no conversation state) ─────────────────────

  private chatterTag?: Phaser.GameObjects.Text;

  /**
   * Show a short overheard line above the NPC (ambient chatter — the campus
   * talking to itself, not a conversation). Ignored while actually talking.
   */
  public chatter(text: string, durationMs = 3500): void {
    if (this.isTalking || !this.scene) return;
    if (!this.chatterTag) {
      this.chatterTag = this.scene.add.text(0, -60, '', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#1f2937',
        backgroundColor: '#ffffffe6',
        padding: { x: 6, y: 3 },
        align: 'center',
        wordWrap: { width: 150 },
      });
      this.chatterTag.setOrigin(0.5, 1);
      this.add(this.chatterTag);
    }
    this.chatterTag.setText(text);
    this.chatterTag.setVisible(true);
    this.scene.time.delayedCall(durationMs, () => {
      this.chatterTag?.setVisible(false);
    });
  }

  /** Quest celebration: bounce a 🎉 above the NPC. */
  public celebrate(): void {
    if (!this.isTalking) {
      this.showEmote('🎉', 4000);
    }
  }

  /**
   * Ambient acknowledgement — a quick 👋 when the player walks past (outside
   * conversation range). Scene-throttled per NPC so it never spams.
   */
  public wave(): void {
    if (!this.isTalking) {
      this.showEmote('👋', 2200);
    }
  }

  /** Ambient activity emote (e.g. 🏀 while playing on the court). */
  public activityEmote(emote: string, durationMs = 2500): void {
    if (!this.isTalking) {
      this.showEmote(emote, durationMs);
    }
  }

  /** Stand still for a conversation, keeping the current leg to resume later. */
  private pauseWandering(): void {
    this.setVelocity(0, 0);
    this.wanderTimer?.remove();
    this.wanderTimer = undefined;
  }

  private resumeWandering(): void {
    if (!this.def.wander) return;
    // Mid-leg: updateMovement picks straight back up on the stored target.
    // The player may have nudged us while we talked, so reset the progress
    // tracker rather than counting that as being stuck.
    if (this.walkTarget) {
      this.lastDistToTarget = Number.POSITIVE_INFINITY;
      this.blockedForMs = 0;
      return;
    }
    this.scheduleNextWander(800);
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
      this.startConversation(playerX, playerY);
    } else if (this.isTalking && dist > END_RADIUS) {
      this.endConversation(false);
    }

    // Keep the bubble on the opposite side from the player, so walking around
    // an NPC mid-conversation never leaves the bubble sitting on top of you.
    if (this.isTalking) {
      const below = playerY < this.y;
      if (below !== this.bubbleBelow) {
        this.bubbleBelow = below;
        this.layoutBubble();
      }
    }

    return this.isTalking;
  }

  /**
   * Quest override: replace the NPC's dialogue with quest-stage lines.
   * While set, lineSets rotation AND the config onComplete event are
   * suppressed (quest flow owns this NPC). Pass null to restore normal
   * behaviour.
   */
  public setQuestDialogue(lines: string[] | null): void {
    this.questLines = lines;
  }

  private startConversation(playerX: number, playerY: number): void {
    this.isTalking = true;
    this.lineIndex = 0;
    if (this.questLines) {
      this.activeLines = this.questLines;
    } else if (this.def.lineSets && this.def.lineSets.length > 0) {
      // Rotate through dialogue sets so repeat visits hear something new
      this.activeLines = this.def.lineSets[this.encounterCount % this.def.lineSets.length];
    }
    this.encounterCount++;
    this.pauseWandering();
    this.hideEmote();
    this.bubbleBelow = playerY < this.y;

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

    if (this.lineIndex < this.activeLines.length - 1) {
      this.lineIndex++;
      this.showLine();
    } else {
      this.endConversation(true);
    }
  }

  private showLine(): void {
    const text = this.activeLines[this.lineIndex];
    this.fullLineText = text;
    this.bubble.setVisible(true);
    this.startTyping(text);

    EventBus.emit('npc-conversation', {
      npcId: this.npcId,
      npcName: this.npcName,
      // The React card crops a portrait out of this character's sprite sheet.
      charKey: this.def.charKey,
      text,
      lineIndex: this.lineIndex,
      total: this.activeLines.length,
      hasMore: this.lineIndex < this.activeLines.length - 1,
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

    // Quest override suppresses the config onComplete (quest flow owns this NPC)
    if (completed && this.def.onComplete && !this.questLines) {
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

  /**
   * Redraws the bubble background (reusing one Graphics) to fit the text.
   *
   * The bubble sits above the NPC by default, but flips below when the player
   * is standing above them — otherwise the bubble covers the player's own
   * sprite, which happens constantly with the room hosts since you approach
   * most of them from the doorway side.
   */
  private layoutBubble(): void {
    const w = Math.max(this.bubbleText.width + 24, 80);
    const h = this.bubbleText.height + 18;
    // Clear of the name tag above, or of the character's feet below.
    const bubbleY = this.bubbleBelow ? 62 + h / 2 : -58 - h / 2;
    // The edge the tail grows from, and which way it points (toward the NPC).
    const tailBase = this.bubbleBelow ? bubbleY - h / 2 : bubbleY + h / 2;
    const tailDir = this.bubbleBelow ? -1 : 1;

    const g = this.bubbleBg;
    g.clear();
    g.fillStyle(0xffffff, 0.97);
    g.lineStyle(2, 0x1f2937, 1);
    g.fillRoundedRect(-w / 2, bubbleY - h / 2, w, h, 8);
    g.strokeRoundedRect(-w / 2, bubbleY - h / 2, w, h, 8);
    // Tail pointing at the NPC: outline, then white fill covering the border
    g.lineBetween(-7, tailBase, 0, tailBase + 9 * tailDir);
    g.lineBetween(7, tailBase, 0, tailBase + 9 * tailDir);
    g.fillTriangle(
      -7, tailBase - 2 * tailDir,
      7, tailBase - 2 * tailDir,
      0, tailBase + 8 * tailDir,
    );

    this.bubbleText.setPosition(0, bubbleY);
  }

  public destroy(fromScene?: boolean): void {
    this.stopTyping();
    this.emoteTimer?.remove();
    this.wanderTimer?.remove();
    this.walkTarget = null;
    super.destroy(fromScene);
  }
}
