import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../src/content/chapters';
import { CONVERSATIONS } from '../src/content/conversations';
import { ITEMS } from '../src/content/items';
import { NPCS } from '../src/content/npcs';
import type { DialogueEffect } from '../src/quests/types';
import { MEMORIES } from '../src/content/memories';

describe('content integrity', () => {
  const npcIds = new Set(NPCS.map((n) => n.id));

  it('every playable chapter references real conversations, NPCs and items', () => {
    for (const c of CHAPTERS.filter((c) => c.status === 'playable')) {
      for (const id of Object.values(c.carver)) expect(CONVERSATIONS[id], `${c.id}: ${id}`).toBeDefined();
      const talks = c.steps.filter((s) => s.kind === 'talk');
      for (const s of talks) {
        if (s.kind !== 'talk') continue;
        expect(npcIds.has(s.npcId), s.npcId).toBe(true);
        expect(CONVERSATIONS[s.conversation]).toBeDefined();
        if (s.after) expect(CONVERSATIONS[s.after]).toBeDefined();
        for (const it of s.grants ?? []) expect(ITEMS[it]).toBeDefined();
      }
      for (const it of c.requiredItems) expect(ITEMS[it], it).toBeDefined();
    }
  });

  it('Carver is the quest giver: every playable chapter opens and closes with him', () => {
    for (const c of CHAPTERS.filter((c) => c.status === 'playable')) {
      const open = CONVERSATIONS[c.carver.opening];
      const close = CONVERSATIONS[c.carver.closing];
      const effects = (conv: typeof open) => Object.values(conv.nodes).flatMap((n) => n.effects ?? []);
      expect(Object.values(open.nodes).every((n) => n.speaker === 'carver')).toBe(true);
      expect(effects(open)).toContainEqual({ type: 'acceptQuest', chapterId: c.id });
      expect(effects(close)).toContainEqual({ type: 'completeChapter', chapterId: c.id });
      // He uses (receives) every required item in the debrief or a minigame uses it.
      for (const it of c.requiredItems) {
        const usedByCarver = effects(close).some((e) => e.type === 'useItem' && e.itemId === it);
        const usedInGame = c.steps.some((s) => s.kind === 'minigame' && s.uses.includes(it));
        expect(usedByCarver || usedInGame, it).toBe(true);
      }
    }
  });

  it('every conversation link points to a real node, and effects are valid', () => {
    const chapterIds = new Set(CHAPTERS.map((c) => c.id));
    const checkEffect = (e: DialogueEffect) => {
      if ('chapterId' in e) expect(chapterIds.has(e.chapterId)).toBe(true);
      if (e.type === 'showMemory') expect(MEMORIES[e.memoryId]).toBeDefined();
      if ('itemId' in e) expect(ITEMS[e.itemId]).toBeDefined();
      if (e.type === 'completeStep') {
        const ch = CHAPTERS.find((c) => c.id === e.chapterId)!;
        expect(ch.steps.some((s) => s.id === e.stepId)).toBe(true);
      }
    };
    for (const conv of Object.values(CONVERSATIONS)) {
      expect(conv.nodes[conv.start]).toBeDefined();
      for (const n of Object.values(conv.nodes)) {
        expect(npcIds.has(n.speaker) || n.speaker === 'narrator').toBe(true);
        (n.effects ?? []).forEach(checkEffect);
        const nexts: Array<string | null | undefined> = [];
        if (n.kind === 'question') {
          nexts.push(n.next);
          expect(n.options.filter((o) => o.correct)).toHaveLength(1);
        } else {
          nexts.push(n.next);
          (n.choices ?? []).forEach((c) => {
            nexts.push(c.next);
            (c.effects ?? []).forEach(checkEffect);
          });
        }
        for (const nx of nexts) if (nx) expect(conv.nodes[nx], `${conv.id}.${n.id} → ${nx}`).toBeDefined();
      }
    }
  });

  it('required NPCs are always present (never locked behind the clock)', () => {
    for (const n of NPCS.filter((n) => n.required)) expect(n.presence).toBe('always');
    const questNpcs = CHAPTERS.flatMap((c) => c.steps).flatMap((s) => (s.kind === 'talk' ? [s.npcId] : []));
    for (const id of questNpcs) expect(NPCS.find((n) => n.id === id)?.presence).toBe('always');
  });

  it('lists seven lesson chapters in order', () => {
    expect(CHAPTERS.filter((c) => c.number >= 1).map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
