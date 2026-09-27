import { describe, expect, it } from 'vitest';
import { QuestEngine, levelFor, type ProgressState } from '../src/quests/engine';
import { CHAPTERS } from '../src/content/chapters';
import { ITEMS } from '../src/content/items';
import { EventBus } from '../src/core/events';
import type { ChapterDefinition } from '../src/quests/types';

const fresh = (): ProgressState => ({ xp: 0, seeds: 0, chapters: {}, inventory: [] });

describe('QuestEngine: practice quest loop', () => {
  it('runs Carver assigns → Mae gives item → Carver debriefs', () => {
    const state = fresh();
    const bus = new EventBus();
    const granted: string[] = [];
    bus.on('item:granted', (e) => granted.push(e.itemId));
    const q = new QuestEngine(CHAPTERS, ITEMS, state, bus);

    // Fresh: Carver has the quest marker and is the next target.
    expect(q.progress('practice').stage).toBe('available');
    expect(q.markerFor('carver')).toBe('quest');
    expect(q.nextAction().targetNpcId).toBe('carver');
    expect(q.conversationFor('carver')).toBe('carver_practice_opening');
    expect(q.conversationFor('mae')).toBeNull(); // no lead yet
    expect(q.progress('ch1').stage).toBe('locked');

    q.apply({ type: 'acceptQuest', chapterId: 'practice' });
    expect(q.progress('practice').stage).toBe('active');
    expect(q.markerFor('mae')).toBe('lead');
    expect(q.markerFor('carver')).toBeNull();
    expect(q.nextAction().targetNpcId).toBe('mae');
    expect(q.conversationFor('carver')).toBe('carver_practice_waiting');
    expect(q.conversationFor('mae')).toBe('mae_practice_give');
    expect(q.leads('practice')[0]).toMatchObject({ npcId: 'mae', done: false });

    // Closing is refused until the steps are done.
    q.apply({ type: 'completeChapter', chapterId: 'practice' });
    expect(q.progress('practice').stage).toBe('active');

    q.apply({ type: 'grantItem', itemId: 'seed_packet', from: 'mae' });
    q.apply({ type: 'completeStep', chapterId: 'practice', stepId: 'get_seeds' });
    expect(granted).toEqual(['seed_packet']);
    expect(q.readyToReturn('practice')).toBe(true);
    expect(q.markerFor('carver')).toBe('turnin');
    expect(q.conversationFor('carver')).toBe('carver_practice_closing');
    expect(q.conversationFor('mae')).toBe('mae_practice_after');
    expect(q.itemChecklist('practice')[0]).toMatchObject({ collected: true, used: false });

    q.apply({ type: 'useItem', itemId: 'seed_packet', usedIn: 'Given to Carver' });
    q.apply({ type: 'completeChapter', chapterId: 'practice' });
    expect(q.progress('practice').stage).toBe('complete');
    expect(state.xp).toBe(50);
    expect(state.seeds).toBe(10);
    expect(q.itemChecklist('practice')[0]).toMatchObject({ collected: true, used: true });
    expect(q.conversationFor('carver')).toBe('carver_practice_after');
    // Chapter 1 is not built yet, so it stays locked and nothing dead-ends.
    expect(q.progress('ch1').stage).toBe('locked');
    expect(q.nextAction().text).toMatch(/Chapter 1/);
  });

  it('never duplicates items or one-time rewards', () => {
    const state = fresh();
    const q = new QuestEngine(CHAPTERS, ITEMS, state);
    q.apply({ type: 'acceptQuest', chapterId: 'practice' });
    expect(q.grantItem('seed_packet', 'mae')).toBe(true);
    expect(q.grantItem('seed_packet', 'mae')).toBe(false);
    expect(state.inventory).toHaveLength(1);
    q.apply({ type: 'completeStep', chapterId: 'practice', stepId: 'get_seeds' });
    q.completeChapter('practice');
    q.completeChapter('practice');
    expect(state.xp).toBe(50);
    expect(state.seeds).toBe(10);
  });

  it('ignores unknown items', () => {
    const q = new QuestEngine(CHAPTERS, ITEMS, fresh());
    expect(q.grantItem('not_real', 'x')).toBe(false);
  });

  it('runs a brand-new chapter definition without hub changes', () => {
    // A made-up chapter shows that new content is data only.
    const extra: ChapterDefinition = {
      id: 'test1', number: 1, title: 'Test', subtitle: 'T', status: 'playable',
      assignment: 'a', whyItMatters: 'b',
      carver: { opening: 'o', waiting: 'w', closing: 'c', after: 'x' },
      steps: [
        { id: 's1', kind: 'talk', npcId: 'gardener', text: 'Talk to the gardener', lead: 'l', conversation: 'g1', grants: ['nb'] },
        { id: 's2', kind: 'talk', npcId: 'naturalist', text: 'Talk to the naturalist', lead: 'l', conversation: 'n1', grants: ['lens'] },
        { id: 's3', kind: 'minigame', minigameId: 'observe', text: 'Inspect the garden', placeId: 'garden', uses: ['nb', 'lens'] },
      ],
      requiredItems: ['nb', 'lens'], itemUses: [], rewards: { xp: 10, seeds: 1 }, objectives: ['observe'],
    };
    const items = {
      ...ITEMS,
      nb: { id: 'nb', name: 'Notebook', icon: 'x', description: '', lookCloser: [], purpose: '', chapterId: 'test1' },
      lens: { id: 'lens', name: 'Lens', icon: 'x', description: '', lookCloser: [], purpose: '', chapterId: 'test1' },
    };
    const state = fresh();
    state.chapters.practice = { stage: 'complete', stepsDone: ['get_seeds'], flags: [], rewarded: true };
    const q = new QuestEngine([CHAPTERS[0], extra], items, state);
    expect(q.progress('test1').stage).toBe('available');
    expect(q.conversationFor('carver')).toBe('o');
    q.apply({ type: 'acceptQuest', chapterId: 'test1' });
    expect(q.nextAction().targetNpcId).toBe('gardener');
    // Steps can be done in any order.
    q.apply({ type: 'completeStep', chapterId: 'test1', stepId: 's2' });
    expect(q.markerFor('naturalist')).toBeNull();
    expect(q.markerFor('gardener')).toBe('lead');
    q.apply({ type: 'completeStep', chapterId: 'test1', stepId: 's1' });
    expect(q.nextAction()).toMatchObject({ targetPlaceId: 'garden' });
    q.apply({ type: 'completeStep', chapterId: 'test1', stepId: 's3' });
    expect(q.conversationFor('carver')).toBe('c');
  });

  it('computes levels', () => {
    expect(levelFor(0)).toEqual({ level: 1, into: 0, needed: 100 });
    expect(levelFor(250).level).toBe(3);
  });
});
