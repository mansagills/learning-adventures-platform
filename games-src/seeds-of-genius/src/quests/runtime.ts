import type { LearnerState } from '../learning/learnerModel';
import type { SaveData } from '../systems/save';
import type { QuestEngine } from './engine';
import type { DialogueEffect, Expression, NpcId } from './types';
import type { SceneId } from '../world/map';

/**
 * What a chapter's code can see and do. The game builds one of these for
 * each chapter runtime; chapters never reach into the hub directly.
 */
export interface RuntimeContext {
  /** Where to mount panels and modals. */
  host: HTMLElement;
  engine: QuestEngine;
  save: SaveData;
  /** This chapter's own saved state (plain JSON; the chapter validates it). */
  data: Record<string, unknown>;
  learner: LearnerState;
  apply(effect: DialogueEffect): void;
  persist(): void;
  toast(text: string, kind?: 'item' | 'info' | 'reward' | 'hint'): void;
  /** Play a few lines of dialogue (for small reactions). */
  say(lines: Array<{ speaker: NpcId | 'narrator'; expression?: Expression; text: string }>): Promise<void>;
  /** Only give one-time bonus rewards once. */
  grantBonus(key: string, seeds: number, xp: number): boolean;
  sound(kind: 'correct' | 'retry' | 'item' | 'open' | 'close' | 'complete'): void;
}

export interface RuntimePlace {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  /** 'sparkle' = a clear marker; 'faint' = a hidden bonus that twinkles when you're close. */
  marker: 'sparkle' | 'faint' | null;
  /** Which scene the place is in (default: the hub). */
  scene?: SceneId;
}

export interface ChapterRuntime {
  /** Places this chapter adds to the hub right now. */
  places(ctx: RuntimeContext): RuntimePlace[];
  /** The player used one of those places. */
  usePlace(id: string, ctx: RuntimeContext): Promise<void>;
  /** Values for {tokens} in this chapter's dialogue, so NPCs react to what happened. */
  tokens(ctx: RuntimeContext): Record<string, string>;
  /** A more specific "Next" line while the chapter's minigame step is open. */
  objective?(ctx: RuntimeContext): { text: string; x: number; y: number; scene?: SceneId; label?: string } | null;
  /** Extra journal content (e.g. the player's notebook). */
  journal?(ctx: RuntimeContext): HTMLElement | null;
}
