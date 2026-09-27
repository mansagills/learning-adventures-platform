import type { EventBus } from '../core/events';
import type {
  ChapterDefinition,
  ChapterProgress,
  ConversationId,
  DialogueEffect,
  InventoryEntry,
  ItemDefinition,
  ItemId,
  NextAction,
  NpcId,
  QuestStep,
} from './types';

/** The slice of the save file the quest engine owns. */
export interface ProgressState {
  xp: number;
  seeds: number;
  chapters: Record<string, ChapterProgress>;
  inventory: InventoryEntry[];
}

export type NpcMarker = 'quest' | 'turnin' | 'lead' | null;

export const CARVER: NpcId = 'carver';

export function emptyChapterProgress(stage: ChapterProgress['stage'] = 'locked'): ChapterProgress {
  return { stage, stepsDone: [], flags: [], rewarded: false };
}

/**
 * Runs any chapter definition through the same loop:
 * Carver assigns → supporting NPCs help → (minigame) → Carver debriefs.
 *
 * It holds no chapter-specific code. Everything it knows comes from the
 * ChapterDefinition data, which is what lets new chapters be added without
 * touching the hub.
 */
export class QuestEngine {
  private readonly byId = new Map<string, ChapterDefinition>();

  constructor(
    private readonly chapters: ChapterDefinition[],
    private readonly items: Record<ItemId, ItemDefinition>,
    private readonly state: ProgressState,
    private readonly bus?: EventBus,
    private readonly now: () => number = () => Date.now(),
  ) {
    chapters.forEach((c) => this.byId.set(c.id, c));
    this.refreshUnlocks();
  }

  // ------------------------------------------------------------ queries

  allChapters(): ChapterDefinition[] {
    return [...this.chapters].sort((a, b) => a.number - b.number);
  }

  getChapter(id: string): ChapterDefinition | undefined {
    return this.byId.get(id);
  }

  progress(id: string): ChapterProgress {
    if (!this.state.chapters[id]) this.state.chapters[id] = emptyChapterProgress();
    return this.state.chapters[id];
  }

  /** The chapter the player is working on (or about to start). */
  currentChapter(): ChapterDefinition | null {
    for (const c of this.allChapters()) {
      const p = this.progress(c.id);
      if (p.stage === 'active' || p.stage === 'available') return c;
    }
    return null;
  }

  /** True once every step (talks and minigames) is done: time to return to Carver. */
  readyToReturn(chapterId: string): boolean {
    const c = this.byId.get(chapterId);
    if (!c) return false;
    const p = this.progress(chapterId);
    return p.stage === 'active' && c.steps.every((s) => p.stepsDone.includes(s.id));
  }

  openSteps(chapterId: string): QuestStep[] {
    const c = this.byId.get(chapterId);
    if (!c) return [];
    const p = this.progress(chapterId);
    return c.steps.filter((s) => !p.stepsDone.includes(s.id));
  }

  hasItem(itemId: ItemId): boolean {
    return this.state.inventory.some((e) => e.itemId === itemId);
  }

  inventoryEntry(itemId: ItemId): InventoryEntry | undefined {
    return this.state.inventory.find((e) => e.itemId === itemId);
  }

  itemDef(itemId: ItemId): ItemDefinition | undefined {
    return this.items[itemId];
  }

  /**
   * Which conversation an NPC should start right now. Quest talks win over
   * small talk. Returns null when the NPC has nothing quest-related to say
   * (the caller then uses the NPC's own ambient lines).
   */
  conversationFor(npcId: NpcId): ConversationId | null {
    const current = this.currentChapter();

    if (npcId === CARVER) {
      if (current) {
        const p = this.progress(current.id);
        if (p.stage === 'available') return current.carver.opening;
        if (this.readyToReturn(current.id)) return current.carver.closing;
        return current.carver.waiting;
      }
      // Everything playable is done: replay the latest reflection.
      const done = this.allChapters().filter((c) => this.progress(c.id).stage === 'complete');
      const last = done[done.length - 1];
      return last ? last.carver.after : null;
    }

    // Supporting NPCs: an open step for the active chapter comes first.
    if (current && this.progress(current.id).stage === 'active') {
      const step = this.openSteps(current.id).find((s) => s.kind === 'talk' && s.npcId === npcId);
      if (step && step.kind === 'talk') return step.conversation;
    }
    // Otherwise, the "after" line of the most recent step this NPC helped with.
    for (const c of [...this.allChapters()].reverse()) {
      const p = this.progress(c.id);
      const step = c.steps.find((s) => s.kind === 'talk' && s.npcId === npcId && p.stepsDone.includes(s.id));
      if (step && step.kind === 'talk' && step.after) return step.after;
    }
    return null;
  }

  markerFor(npcId: NpcId): NpcMarker {
    const current = this.currentChapter();
    if (!current) return null;
    const p = this.progress(current.id);
    if (npcId === CARVER) {
      if (p.stage === 'available') return 'quest';
      if (this.readyToReturn(current.id)) return 'turnin';
      return null;
    }
    if (p.stage !== 'active') return null;
    return this.openSteps(current.id).some((s) => s.kind === 'talk' && s.npcId === npcId) ? 'lead' : null;
  }

  /** The single "what do I do next?" line the HUD shows. */
  nextAction(): NextAction {
    const current = this.currentChapter();
    if (!current) {
      const upcoming = this.allChapters().find((c) => this.progress(c.id).stage !== 'complete');
      return {
        text: upcoming
          ? `Chapter ${upcoming.number} is unlocked and arrives in the next update. Explore, rest in your room, or chat with Carver.`
          : 'You finished every chapter! Visit Carver any time.',
        targetNpcId: undefined,
      };
    }
    const p = this.progress(current.id);
    if (p.stage === 'available') return { text: 'Talk to George Washington Carver', targetNpcId: CARVER };
    if (this.readyToReturn(current.id)) return { text: 'Return to Carver with what you found', targetNpcId: CARVER };
    const step = this.openSteps(current.id)[0];
    if (step.kind === 'talk') return { text: step.text, targetNpcId: step.npcId };
    return { text: step.text, targetPlaceId: step.placeId };
  }

  /** Journal "NPC leads" for a chapter. */
  leads(chapterId: string): Array<{ npcId: NpcId; lead: string; done: boolean }> {
    const c = this.byId.get(chapterId);
    if (!c) return [];
    const p = this.progress(chapterId);
    return c.steps
      .filter((s): s is Extract<QuestStep, { kind: 'talk' }> => s.kind === 'talk')
      .map((s) => ({ npcId: s.npcId, lead: s.lead, done: p.stepsDone.includes(s.id) }));
  }

  /** Journal item checklist for a chapter. */
  itemChecklist(chapterId: string): Array<{ item: ItemDefinition; collected: boolean; used: boolean; usedIn?: string }> {
    const c = this.byId.get(chapterId);
    if (!c) return [];
    return c.requiredItems
      .map((id) => this.items[id])
      .filter(Boolean)
      .map((item) => {
        const e = this.inventoryEntry(item.id);
        return { item, collected: !!e, used: !!e?.used, usedIn: e?.usedIn };
      });
  }

  // ------------------------------------------------------------ changes

  apply(effect: DialogueEffect): void {
    switch (effect.type) {
      case 'acceptQuest': {
        const p = this.progress(effect.chapterId);
        if (p.stage === 'available') {
          p.stage = 'active';
          this.bus?.emit('quest:changed', { chapterId: effect.chapterId });
        }
        break;
      }
      case 'grantItem':
        this.grantItem(effect.itemId, effect.from);
        break;
      case 'useItem':
        this.useItem(effect.itemId, effect.usedIn);
        break;
      case 'completeStep': {
        const p = this.progress(effect.chapterId);
        if (p.stage === 'active' && !p.stepsDone.includes(effect.stepId)) {
          p.stepsDone.push(effect.stepId);
          this.bus?.emit('quest:changed', { chapterId: effect.chapterId });
        }
        break;
      }
      case 'setFlag': {
        const p = this.progress(effect.chapterId);
        if (!p.flags.includes(effect.flag)) p.flags.push(effect.flag);
        break;
      }
      case 'completeChapter':
        this.completeChapter(effect.chapterId);
        break;
    }
  }

  /** Items are never duplicated, and required items can't be lost. */
  grantItem(itemId: ItemId, from: NpcId): boolean {
    if (!this.items[itemId] || this.hasItem(itemId)) return false;
    this.state.inventory.push({ itemId, from, obtainedAt: this.now(), used: false, inspected: false });
    this.bus?.emit('item:granted', { itemId, from });
    return true;
  }

  useItem(itemId: ItemId, usedIn: string): boolean {
    const e = this.inventoryEntry(itemId);
    if (!e || e.used) return false;
    e.used = true;
    e.usedIn = usedIn;
    this.bus?.emit('item:used', { itemId, usedIn });
    return true;
  }

  markInspected(itemId: ItemId): void {
    const e = this.inventoryEntry(itemId);
    if (e) e.inspected = true;
  }

  /** Rewards are paid once, no matter how many times a chapter is replayed. */
  completeChapter(chapterId: string): void {
    const c = this.byId.get(chapterId);
    if (!c) return;
    const p = this.progress(chapterId);
    if (p.stage !== 'active' && p.stage !== 'complete') return;
    if (p.stage === 'active' && !this.readyToReturn(chapterId)) return;
    p.stage = 'complete';
    p.completedAt ??= this.now();
    if (!p.rewarded) {
      p.rewarded = true;
      this.state.xp += c.rewards.xp;
      this.state.seeds += c.rewards.seeds;
      this.bus?.emit('chapter:completed', { chapterId, xp: c.rewards.xp, seeds: c.rewards.seeds });
      this.bus?.emit('rewards:changed', { xp: this.state.xp, seeds: this.state.seeds });
    }
    this.refreshUnlocks();
    this.bus?.emit('quest:changed', { chapterId });
  }

  /**
   * Unlocked = the chapter before it is complete. A chapter that is unlocked
   * but not built yet shows as "unlocked, arriving in the next update".
   */
  isUnlocked(chapterId: string): boolean {
    const list = this.allChapters();
    const i = list.findIndex((c) => c.id === chapterId);
    if (i <= 0) return i === 0;
    return this.progress(list[i - 1].id).stage === 'complete';
  }

  /** Chapters unlock strictly in order, and only once they are built. */
  refreshUnlocks(): void {
    let previousComplete = true;
    for (const c of this.allChapters()) {
      const p = this.progress(c.id);
      if (p.stage === 'locked' && previousComplete && c.status === 'playable') p.stage = 'available';
      previousComplete = p.stage === 'complete';
    }
  }
}

/** Level from XP: 100 XP per level, starting at level 1. */
export function levelFor(xp: number): { level: number; into: number; needed: number } {
  const level = Math.floor(xp / 100) + 1;
  return { level, into: xp % 100, needed: 100 };
}
