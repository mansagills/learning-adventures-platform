// chapter1.ts
// Pure TypeScript module — NO Phaser dependency.
//
// Chapter 1 — "The Frozen Field" (Season 1, the Math wing; villain Null).
// The first real Quest: it wraps the Null Run game (public/games/null-run.html)
// in the Quest Dev Brief's 5 slots — briefing, reskin (Null Run reads the
// player's Spark color), gameplay (the math IS the obstacle), a skill-based
// completion gate, and a debrief that grants the guaranteed story item.
//
// Gated behind Chapter 0 (chapter0.isComplete). Jaylen — the recurring guide
// who's been tracking the Hush — hands it over:
//   offer    — talk to Jaylen: he explains the gray is thickest in Math Hall
//              and sends you to run the Null field.
//   play     — beat Null Run with a score >= 80 (skill gate, NO RNG — the
//              game posts pure accuracy).
//   complete — Jaylen debriefs; first clear grants the Null Fragment + fixed
//              XP. Replays pay XP only (storyItems enforces first-clear-only).
//
// Same architecture as chapter0.ts / mathQuest.ts: in-memory stage machine
// (resets on reload, by design), scene drives transitions, HUDs listen to
// 'quest-updated'. The snapshot carries icon/celebrateText so the tracker
// stays quest-agnostic.

import { EventBus } from '@/components/phaser/EventBus';
import { playQuestDing, playQuestFanfare } from './campusAudio';
import { getIdentity } from './playerIdentity';
import { storyItems, NULL_FRAGMENT } from './storyItems';

export type Chapter1Stage = 'locked' | 'offer' | 'play' | 'complete';

export const CHAPTER1_NPC_ID = 'npc_jaylen_guide';
export const CHAPTER1_GAME_ID = 'null-run';
export const CHAPTER1_QUEST_ID = 'chapter-1-null-run';
export const CHAPTER1_PASS_SCORE = 80;   // matches the Null Run accuracy gate
export const CHAPTER1_XP_REWARD = 150;   // story-quest reward (fixed, no RNG)

/** Null Run arcade cabinet tile in Math Hall (gatherPresentation GATHER_STATIONS
 *  math-nullrun at col 12, row 32). TILE_SIZE = 64. */
export const NULL_RUN_CABINET = { x: 12 * 64, y: 32 * 64 };

export interface Chapter1Snapshot {
  stage: Chapter1Stage;
  collected: number;
  total: number;
  objective: string;
  hint: string;
  icon: string;
  celebrateText?: string;
}

class Chapter1 {
  private stage: Chapter1Stage = 'locked';
  private lastScore: number | null = null;
  private fragmentGranted = false;

  get currentStage(): Chapter1Stage {
    return this.stage;
  }

  get isComplete(): boolean {
    return this.stage === 'complete';
  }

  snapshot(): Chapter1Snapshot {
    return {
      stage: this.stage,
      collected: 0,
      total: 0,
      objective: this.objective(),
      hint: this.hint(),
      icon: this.icon(),
      celebrateText: this.stage === 'complete' ? '🧊 Null Fragment recovered!' : undefined,
    };
  }

  private icon(): string {
    switch (this.stage) {
      case 'locked':
      case 'offer':    return '🧭';
      case 'play':     return '🚀';
      case 'complete': return '🧊';
    }
  }

  private objective(): string {
    switch (this.stage) {
      case 'locked':
      case 'offer':    return 'Talk to Jaylen — he tracked the gray to Math Hall';
      case 'play':     return `Beat Null Run in Math Hall (score ${CHAPTER1_PASS_SCORE}+)`;
      case 'complete': return 'Chapter 1 complete — Null Fragment recovered! 🧊';
    }
  }

  private hint(): string {
    switch (this.stage) {
      case 'locked':
      case 'offer':    return 'He wanders the central plaza — follow the arrow';
      case 'play':
        return this.lastScore === null
          ? 'The Null Run cabinet is in Math Hall (follow the arrow)'
          : `You scored ${this.lastScore}. Null's seal needs ${CHAPTER1_PASS_SCORE}+ — run it again!`;
      case 'complete': return 'Show Jaylen the fragment — Chapter 2 is coming';
    }
  }

  /** Jaylen's dialogue for the current stage (rebuilt per conversation so it
   *  greets the player by their chosen name). */
  dialogue(): string[] {
    const name = getIdentity().name;
    const you = name || 'friend';
    switch (this.stage) {
      case 'locked':
      case 'offer':
        return [
          `Okay — ${you}, you felt that gray earlier? I wasn't imagining it. I finally tracked where it's thickest.`,
          "Math Hall. The patterns in there are freezing over — numbers locking up, the equation cores going quiet. That's the Hush's Math lieutenant. We call it Null.",
          "There's a run through the frozen field — the Null Run cabinet, right there in Math Hall. Fly it, thaw the cores back, and we'll know for sure what we're dealing with.",
          `Score 80 or better and the field holds. Every Spark's worth following, ${you} — go follow yours into the gray.`,
        ];
      case 'play':
        return this.lastScore === null
          ? [
              'The Null Run cabinet\'s in Math Hall — steer into the right answers, thaw the cores. Score 80+.',
              'Come back to me the second you pull something out of that field.',
            ]
          : [
              `${this.lastScore} points — Null's seal held. So close.`,
              'Warm your Spark back up and run it again. Watch the times tables — that\'s where it freezes hardest.',
            ];
      case 'complete':
        return [
          "You pulled it out — a Null Fragment. Cold as anything, but it's real, and it's PROOF.",
          "This is the first solid piece we've got that the Hush is one thing, not a hundred random glitches. I knew it.",
          `Hang onto that, ${you}. When the gray comes back — and it will — this is how we fight it. Chapter's just getting started.`,
        ];
    }
  }

  // ── transitions (called by the scene) ───────────────────────────────────────

  /** locked → offer (Chapter 0 just completed; Jaylen can now brief Ch1). */
  unlock(): boolean {
    if (this.stage !== 'locked') return false;
    this.stage = 'offer';
    this.emit();
    return true;
  }

  /** offer → play (Jaylen's briefing conversation finished). */
  accept(): boolean {
    if (this.stage !== 'offer') return false;
    this.stage = 'play';
    playQuestDing();
    this.emit();
    return true;
  }

  /**
   * Report a Null Run result. Returns true when the quest completes (>= 80).
   * A missing score counts as 0 (run it again). First clear grants the Null
   * Fragment; replays pay XP only.
   */
  reportScore(score: number | undefined): boolean {
    if (this.stage !== 'play') return false;
    this.lastScore = score ?? 0;
    if (this.lastScore >= CHAPTER1_PASS_SCORE) {
      this.stage = 'complete';
      // First clear only: guaranteed, non-random story item.
      this.fragmentGranted = storyItems.grant(NULL_FRAGMENT);
      playQuestFanfare();
      this.emit();
      // Pages award XP per their economy (sandbox: demoEconomy; campus: API).
      EventBus.emit('quest-completed', { questId: CHAPTER1_QUEST_ID, xp: CHAPTER1_XP_REWARD });
      return true;
    }
    this.emit();
    return false;
  }

  /** Whether the last completion newly granted the fragment (for messaging). */
  get grantedFragment(): boolean {
    return this.fragmentGranted;
  }

  private emit(): void {
    EventBus.emit('quest-updated', this.snapshot());
  }
}

/** Module singleton — chapter state lives for the page session (demo scope). */
export const chapter1 = new Chapter1();
