// mathQuest.ts
// Pure TypeScript module — NO Phaser dependency.
//
// Demo quest loop for the Gather campus:
//   1. Talk to Professor Numbers in Math Hall — her race simulator lost its
//      power cells.
//   2. Gather 3 power cells scattered on the campus paths.
//   3. Return them to her — she boots up Math Race Rally.
//   4. Score 80+ (8/10 questions) to earn the Racing License and finish.
//
// Hard-coded to Math Race Rally for the demo; when the platform's uploaded
// games get quest support, swap QUEST_GAME_ID / dialogue / items for a
// quest-definition object per game.
//
// State is in-memory (resets on page reload) — fine for the demo. The scene
// drives transitions; React HUDs listen to the 'quest-updated' EventBus event.

import { EventBus } from '@/components/phaser/EventBus';
import { TILE_SIZE } from './TilemapGenerator';

const T = TILE_SIZE;

export type QuestStage = 'available' | 'gather' | 'return' | 'play' | 'complete';

export const QUEST_NPC_ID = 'npc_professor_numbers';
export const QUEST_GAME_ID = 'math-race-rally';
export const QUEST_PASS_SCORE = 80; // 8/10 questions × 10 pts = 80%

/** Power-cell spawn points — all on the guaranteed-walkable path bands. */
export const QUEST_ITEM_POSITIONS: { x: number; y: number }[] = [
  { x: 30 * T, y: 35.5 * T },   // west path, outside Math Hall
  { x: 47.5 * T, y: 12 * T },   // north path, toward the Discovery Lab
  { x: 47.5 * T, y: 55 * T },   // south path, by the Commons
];

export interface QuestSnapshot {
  stage: QuestStage;
  collected: number;
  total: number;
  /** One-line objective for the HUD tracker. */
  objective: string;
}

class MathQuest {
  private stage: QuestStage = 'available';
  private collected = 0;
  private lastScore: number | null = null;

  get currentStage(): QuestStage {
    return this.stage;
  }

  snapshot(): QuestSnapshot {
    return {
      stage: this.stage,
      collected: this.collected,
      total: QUEST_ITEM_POSITIONS.length,
      objective: this.objective(),
    };
  }

  private objective(): string {
    switch (this.stage) {
      case 'available': return 'Talk to Professor Numbers in Math Hall';
      case 'gather':    return `Find power cells (${this.collected}/${QUEST_ITEM_POSITIONS.length})`;
      case 'return':    return 'Return the cells to Professor Numbers';
      case 'play':      return `Score ${QUEST_PASS_SCORE}+ in Math Race Rally`;
      case 'complete':  return 'Racing License earned! 🏁';
    }
  }

  /** Professor Numbers' dialogue for the current stage. */
  dialogue(): string[] {
    switch (this.stage) {
      case 'available':
        return [
          "Oh thank goodness, a volunteer! My Math Race Rally simulator just died mid-race.",
          'Three of its power cells rolled off across campus — I saw them bounce down the paths.',
          'Find all 3 power cells and bring them back, and the first race is yours!',
        ];
      case 'gather':
        return [
          `Any luck? You've found ${this.collected} of ${QUEST_ITEM_POSITIONS.length} so far.`,
          'Check the main paths — one went west past our door, one north toward the Discovery Lab, one south to the Commons.',
        ];
      case 'return':
        return [
          'You found all three! Let me plug these in...',
          '*bzzzt* ...and the simulator is ALIVE! Now for your driving test.',
          `Score ${QUEST_PASS_SCORE} or more in Math Race Rally and you earn your official Racing License. Buckle up!`,
        ];
      case 'play':
        return this.lastScore === null
          ? [
              `The simulator is warmed up and waiting. Remember: ${QUEST_PASS_SCORE} points or more!`,
              "Hop back in whenever you're ready.",
            ]
          : [
              `${this.lastScore} points — so close! You need ${QUEST_PASS_SCORE} or more for the license.`,
              'Take a breath, then hop back in. The sevens table is sneaky — watch for it!',
            ];
      case 'complete':
        return [
          'There they are — our newest licensed Math Racer! 🏁',
          'That was some seriously speedy arithmetic. Come back tomorrow, I may have another challenge for you...',
        ];
    }
  }

  // ── transitions (called by the scene) ───────────────────────────────────────

  /** available → gather. Returns true if the transition happened. */
  accept(): boolean {
    if (this.stage !== 'available') return false;
    this.stage = 'gather';
    this.emit();
    return true;
  }

  /** Collect one power cell; auto-advances to 'return' when all found. */
  collectItem(): void {
    if (this.stage !== 'gather') return;
    this.collected = Math.min(this.collected + 1, QUEST_ITEM_POSITIONS.length);
    if (this.collected >= QUEST_ITEM_POSITIONS.length) {
      this.stage = 'return';
    }
    this.emit();
  }

  /** return → play (Professor Numbers takes the cells and opens the game). */
  turnIn(): boolean {
    if (this.stage !== 'return') return false;
    this.stage = 'play';
    this.emit();
    return true;
  }

  /**
   * Report a Math Race Rally result. Returns true when the quest completes.
   * A missing score (manual DONE button) counts as 0 — race again.
   */
  reportScore(score: number | undefined): boolean {
    if (this.stage !== 'play') return false;
    this.lastScore = score ?? 0;
    if (this.lastScore >= QUEST_PASS_SCORE) {
      this.stage = 'complete';
      this.emit();
      return true;
    }
    this.emit();
    return false;
  }

  private emit(): void {
    EventBus.emit('quest-updated', this.snapshot());
  }
}

/** Module singleton — quest state lives for the page session (demo scope). */
export const mathQuest = new MathQuest();
