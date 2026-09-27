/**
 * The shapes every chapter, item and conversation must follow.
 *
 * Chapters are plain data. The hub, the quest engine, the journal and the
 * markers all read these definitions, so a new chapter is added by writing a
 * new definition (plus its minigame module) rather than by editing the hub.
 */

export type ItemId = string;
export type NpcId = string;
export type ConversationId = string;
export type ChapterId = string;

export type Expression = 'neutral' | 'smile' | 'curious' | 'proud' | 'thinking';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export interface ItemDefinition {
  id: ItemId;
  name: string;
  /** Key into the pixel icon painter (art/icons.ts). */
  icon: string;
  /** One-line summary shown in the bag. */
  description: string;
  /** Details the player notices when they inspect the item. */
  lookCloser: string[];
  /** Why the player needs it, shown in the journal. */
  purpose: string;
  chapterId: ChapterId;
}

// ---------------------------------------------------------------- dialogue

export type DialogueEffect =
  | { type: 'acceptQuest'; chapterId: ChapterId }
  | { type: 'grantItem'; itemId: ItemId; from: NpcId }
  | { type: 'useItem'; itemId: ItemId; usedIn: string }
  | { type: 'completeStep'; chapterId: ChapterId; stepId: string }
  | { type: 'setFlag'; chapterId: ChapterId; flag: string }
  | { type: 'completeChapter'; chapterId: ChapterId };

export interface DialogueChoice {
  text: string;
  next: string | null;
  effects?: DialogueEffect[];
  /** Only offer this choice when the chapter flag is (or is not) set. */
  requiresFlag?: { chapterId: ChapterId; flag: string; present: boolean };
}

interface NodeBase {
  id: string;
  speaker: NpcId | 'narrator';
  expression?: Expression;
  effects?: DialogueEffect[];
}

export interface LineNode extends NodeBase {
  kind?: 'line';
  text: string;
  /**
   * Said instead of `text` when the player needed more than one try on an
   * earlier question in this conversation, so the speaker can respond to
   * what actually happened.
   */
  textIfRetried?: string;
  next?: string | null;
  choices?: DialogueChoice[];
}

/**
 * A check-for-understanding question. Wrong answers get feedback and the
 * next rung of the hint ladder (notice → narrow → worked example), then the
 * question is asked again. It never ends the conversation or takes anything
 * away.
 */
export interface QuestionNode extends NodeBase {
  kind: 'question';
  objectiveId: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
    correct: boolean;
    /** What the speaker says right after this option is picked. */
    feedback: string;
    /** Named misconception recorded in the learner model when picked. */
    misconception?: string;
  }>;
  /** Three rungs: notice a clue, narrow the choices, show a worked example. */
  hints: [string, string, string];
  /** Where to go after a correct answer. */
  next: string | null;
}

export type DialogueNode = LineNode | QuestionNode;

export interface Conversation {
  id: ConversationId;
  /** Shown in the journal's conversation list. */
  title: string;
  start: string;
  nodes: Record<string, DialogueNode>;
}

// ---------------------------------------------------------------- chapters

export type QuestStep =
  | {
      id: string;
      kind: 'talk';
      npcId: NpcId;
      /** What the journal shows while this step is open. */
      text: string;
      /** The lead as Carver described it (journal "NPC leads"). */
      lead: string;
      conversation: ConversationId;
      /** Conversation once the step is done (replayable, optional). */
      after?: ConversationId;
      grants?: ItemId[];
    }
  | {
      id: string;
      kind: 'minigame';
      minigameId: string;
      text: string;
      /** The place in the hub where the minigame starts. */
      placeId: string;
      uses: ItemId[];
    };

export interface ChapterDefinition {
  id: ChapterId;
  /** 0 is the Phase 0 practice quest; 1-7 are the lessons. */
  number: number;
  title: string;
  subtitle: string;
  /** Build status. 'coming-soon' chapters show on the map but cannot start. */
  status: 'playable' | 'coming-soon';
  /** Carver's assignment, as the journal states it. */
  assignment: string;
  whyItMatters: string;
  carver: {
    opening: ConversationId;
    waiting: ConversationId;
    closing: ConversationId;
    after: ConversationId;
  };
  /** Steps to finish before Carver's closing talk. Any order is allowed. */
  steps: QuestStep[];
  requiredItems: ItemId[];
  /** Where each required item is used (documentation + journal). */
  itemUses: Array<{ itemId: ItemId; usedIn: string; description: string }>;
  rewards: { xp: number; seeds: number; unlock?: string };
  /** Learner-model objectives this chapter gives evidence for. */
  objectives: string[];
  analogActivity?: { title: string; description: string };
  /** Lazy loader for the chapter's minigame and art (later phases). */
  loadAssets?: () => Promise<unknown>;
}

// ---------------------------------------------------------------- progress

export type ChapterStage = 'locked' | 'available' | 'active' | 'complete';

export interface ChapterProgress {
  stage: ChapterStage;
  stepsDone: string[];
  flags: string[];
  /** Guards one-time rewards against replays. */
  rewarded: boolean;
  completedAt?: number;
}

export interface InventoryEntry {
  itemId: ItemId;
  from: NpcId;
  obtainedAt: number;
  used: boolean;
  usedIn?: string;
  inspected: boolean;
}

export interface NextAction {
  text: string;
  /** NPC the marker and off-screen arrow should point at. */
  targetNpcId?: NpcId;
  /** Or a named place (door, bed, minigame spot). */
  targetPlaceId?: string;
}
