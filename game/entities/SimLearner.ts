import * as Phaser from 'phaser';
import {
  getAmbientChatLine,
  getCelebrationLine,
  type SimLearnerConfig,
  type SimLearnerWaypoint,
  type StudyCircleParticipant,
} from '../world/simLearners';

const WALK_SPEED_PX_PER_SECOND = 86;
const STOP_DELAY_MS = 1700;
const CHAT_VISIBLE_MS = 3600;
const CHAT_BUBBLE_WIDTH = 210;

/**
 * SimLearner renders a local-only "other student" for the single-player
 * campus demo. It intentionally has no networking or interaction logic; the
 * job is to make the campus feel socially alive with predictable movement.
 */
export class SimLearner extends Phaser.GameObjects.Container {
  public readonly simId: string;

  private sprite: Phaser.GameObjects.Sprite;
  private nameTag: Phaser.GameObjects.Text;
  private statusTag: Phaser.GameObjects.Text;
  private chatBubble: Phaser.GameObjects.Container;
  private chatBubbleBg: Phaser.GameObjects.Graphics;
  private chatBubbleText: Phaser.GameObjects.Text;
  private waypoints: SimLearnerWaypoint[];
  private waypointIndex = 0;
  private moveTween?: Phaser.Tweens.Tween;
  private waitTimer?: Phaser.Time.TimerEvent;
  private chatTimer?: Phaser.Time.TimerEvent;
  private hideChatTimer?: Phaser.Time.TimerEvent;
  private charKey: string;
  private chatSequence = 0;

  constructor(scene: Phaser.Scene, config: SimLearnerConfig) {
    const firstWaypoint = config.waypoints[0];
    super(scene, firstWaypoint?.x ?? 0, firstWaypoint?.y ?? 0);

    this.simId = config.id;
    this.charKey = config.charKey;
    this.waypoints = config.waypoints;

    this.sprite = scene.add.sprite(0, 0, `player-${config.charKey}`);
    this.sprite.setDisplaySize(56, 56);
    this.add(this.sprite);

    this.nameTag = scene.add.text(0, -39, `${config.name} L${config.level}`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#111827e6',
      padding: { x: 6, y: 2 },
      align: 'center',
    });
    this.nameTag.setOrigin(0.5);
    this.add(this.nameTag);

    this.statusTag = scene.add.text(0, -58, config.status, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#bbf7d0',
      backgroundColor: '#064e3be6',
      padding: { x: 6, y: 2 },
      align: 'center',
    });
    this.statusTag.setOrigin(0.5);
    this.add(this.statusTag);

    this.chatBubbleBg = scene.add.graphics();
    this.chatBubbleText = scene.add.text(0, 0, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#111827',
      wordWrap: { width: CHAT_BUBBLE_WIDTH - 22 },
      align: 'center',
      lineSpacing: 2,
    });
    this.chatBubbleText.setOrigin(0.5);
    this.chatBubble = scene.add.container(0, 0, [
      this.chatBubbleBg,
      this.chatBubbleText,
    ]);
    this.chatBubble.setVisible(false);
    this.add(this.chatBubble);

    scene.add.existing(this);
    this.setDepth(9);
    this.playAnim('idle');

    this.waitTimer = scene.time.delayedCall(config.startDelayMs, () => {
      this.moveToNextWaypoint();
    });
    this.scheduleAmbientChat(2600 + config.startDelayMs);
  }

  public getStudyCircleParticipant(): StudyCircleParticipant {
    return {
      id: this.simId,
      x: this.x,
      y: this.y,
    };
  }

  public reactToCelebration(activityId: string): void {
    this.showChat(getCelebrationLine(activityId, this.simId), CHAT_VISIBLE_MS + 1200);
  }

  private moveToNextWaypoint(): void {
    if (this.waypoints.length < 2 || !this.scene) return;

    const nextIndex = (this.waypointIndex + 1) % this.waypoints.length;
    const waypoint = this.waypoints[nextIndex];
    const dx = waypoint.x - this.x;
    const dy = waypoint.y - this.y;
    const distance = Math.hypot(dx, dy);

    this.faceMovement(dx, dy);
    this.statusTag.setText('Traveling');

    this.moveTween = this.scene.tweens.add({
      targets: this,
      x: waypoint.x,
      y: waypoint.y,
      duration: Math.max(600, (distance / WALK_SPEED_PX_PER_SECOND) * 1000),
      ease: 'Linear',
      onComplete: () => {
        this.waypointIndex = nextIndex;
        this.statusTag.setText(waypoint.status);
        this.playAnim('idle');
        this.waitTimer = this.scene.time.delayedCall(STOP_DELAY_MS, () => {
          this.moveToNextWaypoint();
        });
      },
    });
  }

  private faceMovement(dx: number, dy: number): void {
    if (Math.abs(dx) > Math.abs(dy)) {
      this.playAnim('walk-side');
      this.sprite.setFlipX(dx < 0);
    } else if (dy > 0) {
      this.playAnim('walk-down');
      this.sprite.setFlipX(false);
    } else {
      this.playAnim('walk-up');
      this.sprite.setFlipX(false);
    }
  }

  private playAnim(kind: 'idle' | 'walk-up' | 'walk-down' | 'walk-side'): void {
    const key = `${this.charKey}-${kind}`;
    if (this.scene.anims.exists(key)) {
      this.sprite.anims.play(key, true);
    }
  }

  private scheduleAmbientChat(delayMs: number): void {
    this.chatTimer = this.scene.time.delayedCall(delayMs, () => {
      this.showChat(getAmbientChatLine(this.simId, this.chatSequence));
      this.chatSequence++;
      const nextDelay = 9000 + (this.chatSequence % 4) * 1800;
      this.scheduleAmbientChat(nextDelay);
    });
  }

  private showChat(text: string, durationMs = CHAT_VISIBLE_MS): void {
    this.hideChatTimer?.remove();
    this.chatBubbleText.setText(text);
    this.layoutChatBubble();
    this.chatBubble.setVisible(true);
    this.hideChatTimer = this.scene.time.delayedCall(durationMs, () => {
      this.chatBubble.setVisible(false);
    });
  }

  private layoutChatBubble(): void {
    const width = Math.min(
      CHAT_BUBBLE_WIDTH,
      Math.max(96, this.chatBubbleText.width + 22),
    );
    const height = this.chatBubbleText.height + 16;
    const bubbleY = -84 - height / 2;
    const top = bubbleY - height / 2;
    const left = -width / 2;
    const tailY = top + height;

    this.chatBubbleBg.clear();
    this.chatBubbleBg.fillStyle(0xffffff, 0.96);
    this.chatBubbleBg.lineStyle(2, 0x111827, 0.9);
    this.chatBubbleBg.fillRoundedRect(left, top, width, height, 7);
    this.chatBubbleBg.strokeRoundedRect(left, top, width, height, 7);
    this.chatBubbleBg.fillTriangle(-7, tailY - 1, 7, tailY - 1, 0, tailY + 8);
    this.chatBubbleBg.lineBetween(-7, tailY, 0, tailY + 8);
    this.chatBubbleBg.lineBetween(7, tailY, 0, tailY + 8);
    this.chatBubbleText.setPosition(0, bubbleY);
  }

  public destroy(fromScene?: boolean): void {
    this.waitTimer?.remove();
    this.chatTimer?.remove();
    this.hideChatTimer?.remove();
    this.moveTween?.stop();
    super.destroy(fromScene);
  }
}
