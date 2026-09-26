// chapter0.ts
// Pure TypeScript module — NO Phaser dependency.
//
// Chapter 0 — "The First Spark" (docs/lore/chapters/chapter-0.md).
// The player's on-ramp into the Season 1 story:
//   1. meet     — talk to Jaylen in the plaza (Scenes 1–3: arrival, controls,
//                 meeting SPARK, condensed for walk-up dialogue).
//   2. ignite   — free exploration: enter ANY subject building. The moment
//                 you do, your Spark ignites (Scene 4).
//   3. play     — clear any game in that building. Chapter 0 is deliberately
//                 low-stakes: any clear counts, no score gate (per the lore's
//                 "reward-light, onboarding and tone-setting" dev note).
//   4. complete — Jaylen's debrief plants the Hush tell (Scene 5), and hands
//                 off to Professor Numbers' quest (the Racing License loop),
//                 turning the two quests into one progression arc.
//
// Same architecture as mathQuest.ts: in-memory state (resets on reload — by
// design for pitch runs), scene drives transitions, HUDs listen to
// 'quest-updated'. The tracker snapshot carries `icon`/`celebrateText` so the
// HUD needs no per-quest knowledge.

import { EventBus } from '@/components/phaser/EventBus';
import { playQuestDing, playQuestFanfare } from './campusAudio';
import { getIdentity } from './playerIdentity';

export type Chapter0Stage = 'meet' | 'ignite' | 'play' | 'complete';

export const CHAPTER0_NPC_ID = 'npc_jaylen_guide';
export const CHAPTER0_QUEST_ID = 'chapter-0-first-spark';
export const CHAPTER0_XP_REWARD = 50; // reward-light by design (see lore dev notes)

export interface Chapter0Snapshot {
  stage: Chapter0Stage;
  collected: number;
  total: number;
  objective: string;
  hint: string;
  icon: string;
  celebrateText?: string;
}

class Chapter0 {
  private stage: Chapter0Stage = 'meet';
  /** Room the player's Spark ignited in (label, e.g. "Discovery Lab"). */
  private ignitedRoom: string | null = null;

  get currentStage(): Chapter0Stage {
    return this.stage;
  }

  get isComplete(): boolean {
    return this.stage === 'complete';
  }

  get sparkRoom(): string | null {
    return this.ignitedRoom;
  }

  snapshot(): Chapter0Snapshot {
    return {
      stage: this.stage,
      collected: 0,
      total: 0,
      objective: this.objective(),
      hint: this.hint(),
      icon: this.icon(),
      celebrateText: this.stage === 'complete' ? '✨ Your Spark is awake!' : undefined,
    };
  }

  private icon(): string {
    switch (this.stage) {
      case 'meet':     return '👋';
      case 'ignite':   return '🧭';
      case 'play':     return '✨';
      case 'complete': return '✨';
    }
  }

  private objective(): string {
    switch (this.stage) {
      case 'meet':     return 'Talk to Jaylen in the plaza';
      case 'ignite':   return 'Explore! Step inside any building that looks interesting';
      case 'play':     return `Your Spark woke up! Play any game in ${this.ignitedRoom ?? 'that building'}`;
      case 'complete': return 'Chapter 0 complete — your Spark is awake! ✨';
    }
  }

  private hint(): string {
    switch (this.stage) {
      case 'meet':     return 'Follow the gold arrow — he wanders the central plaza';
      case 'ignite':   return "There's no wrong answer. Follow whatever pulls at you";
      case 'play':     return 'Walk up to a glowing station and press SPACE';
      case 'complete': return 'Professor Numbers in Math Hall has your first real quest';
    }
  }

  /** Jaylen's dialogue for the current stage (rebuilt per conversation so it
   *  picks up the player's chosen name from the welcome overlay). */
  dialogue(): string[] {
    const name = getIdentity().name;
    const hey = name ? `Hey, ${name}!` : 'Hey!';
    switch (this.stage) {
      case 'meet':
        return [
          `${hey} I'm Jaylen — kind of the campus guide around here, unofficially. First day?`,
          "Don't worry — everybody stands in that exact spot looking exactly that lost. It's basically a tradition.",
          'Buildings are everywhere you look. Walk up to a door and you\'re in — each one\'s got its own games and challenges.',
          "SPARK: [chirp] — hi. Question anytime. I'm around.",
          "That's SPARK. Study buddy, question-answerer, occasional voice of reason. Hard to explain, honestly.",
          'Okay, here\'s your whole first assignment: go poke around any building that looks interesting. That\'s it. Follow whatever makes you curious.',
        ];
      case 'ignite':
        return [
          'Nothing pulling at you yet? No rush — curiosity doesn\'t run on a schedule.',
          'Math Hall, Discovery Lab, Story Grove, the Commons... pick whichever one you\'d peek into first.',
        ];
      case 'play':
        return [
          'There it is — you feel that? That little warm flicker? That\'s called a Spark.',
          "Everybody's got one somewhere, but it doesn't usually wake up on day one. Mine took months.",
          "It just means you got really curious about something. That's it — that's the whole secret. Nobody hands you a cape.",
          `Every Spark's worth following. Go play whatever caught your eye in ${this.ignitedRoom ?? 'there'} — I'll wait.`,
        ];
      case 'complete':
        return [
          'See? Told you. That was just your Spark doing exactly what it\'s supposed to do.',
          "Can I tell you something? Probably nothing. But lately some stuff around here's been... quiet. A kid stops mid-question and can't remember what they were asking. A hallway feels grayer for an hour.",
          'SPARK: [low chirp] — logged. Filed under "probably nothing." ...Definitely something.',
          "Ha. Yeah. Keep an eye out for me, yeah? If you notice anything... gray. You'll know it when you see it.",
          'Oh — and Professor Numbers in Math Hall has a real quest for you. Tell her I sent you!',
        ];
    }
  }

  // ── transitions (called by the scene) ───────────────────────────────────────

  /** meet → ignite (Jaylen's intro conversation finished). */
  beginExploring(): boolean {
    if (this.stage !== 'meet') return false;
    this.stage = 'ignite';
    playQuestDing();
    this.emit();
    return true;
  }

  /**
   * ignite → play. Called by the scene whenever the player is inside a
   * subject building (idempotent). Returns true only on the ignition itself
   * so the scene can play the one-shot Spark VFX.
   */
  enterBuilding(roomLabel: string): boolean {
    if (this.stage !== 'ignite') return false;
    this.stage = 'play';
    this.ignitedRoom = roomLabel;
    playQuestDing();
    EventBus.emit('spark-ignited', { room: roomLabel });
    this.emit();
    return true;
  }

  /** play → complete. Any adventure clear counts (no score gate). */
  completePlay(): boolean {
    if (this.stage !== 'play') return false;
    this.stage = 'complete';
    playQuestFanfare();
    this.emit();
    // Pages award per their economy (sandbox: demoEconomy; campus: API)
    EventBus.emit('quest-completed', { questId: CHAPTER0_QUEST_ID, xp: CHAPTER0_XP_REWARD });
    return true;
  }

  private emit(): void {
    EventBus.emit('quest-updated', this.snapshot());
  }
}

/** What Professor Numbers says while Chapter 0 is still in progress —
 *  gates the Racing License quest behind Jaylen's onboarding. */
export function professorGateDialogue(): string[] {
  return [
    'Welcome, welcome! But before any racing — have you met Jaylen yet?',
    "He's out in the central plaza. Every new student starts with him.",
    "Come back once your Spark's awake — then we'll talk racing licenses!",
  ];
}

/** Module singleton — chapter state lives for the page session (demo scope). */
export const chapter0 = new Chapter0();
