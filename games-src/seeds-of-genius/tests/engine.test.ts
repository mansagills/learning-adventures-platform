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
    // Chapter 1 unlocks and Carver offers it next.
    expect(q.progress('ch1').stage).toBe('available');
    expect(q.markerFor('carver')).toBe('quest');
    expect(q.conversationFor('carver')).toBe('carver_ch1_opening');
  });

  it('runs Chapter 1: Carver → Hattie + Theo (any order) → garden minigame → Carver', () => {
    const state = fresh();
    const q = new QuestEngine(CHAPTERS, ITEMS, state);
    q.apply({ type: 'acceptQuest', chapterId: 'practice' });
    q.apply({ type: 'grantItem', itemId: 'seed_packet', from: 'mae' });
    q.apply({ type: 'completeStep', chapterId: 'practice', stepId: 'get_seeds' });
    q.apply({ type: 'completeChapter', chapterId: 'practice' });

    q.apply({ type: 'acceptQuest', chapterId: 'ch1' });
    expect(q.markerFor('hattie')).toBe('lead');
    expect(q.markerFor('theo')).toBe('lead');
    expect(q.nextAction().targetNpcId).toBe('hattie');
    expect(q.leads('ch1').map((l) => l.npcId)).toEqual(['hattie', 'theo']);
    // Theo first is fine.
    q.apply({ type: 'grantItem', itemId: 'magnifying_lens', from: 'theo' });
    q.apply({ type: 'completeStep', chapterId: 'ch1', stepId: 'get_lens' });
    expect(q.conversationFor('theo')).toBe('theo_ch1_after');
    expect(q.nextAction().targetNpcId).toBe('hattie');
    q.apply({ type: 'grantItem', itemId: 'field_notebook', from: 'hattie' });
    q.apply({ type: 'completeStep', chapterId: 'ch1', stepId: 'get_notebook' });
    expect(q.nextAction()).toMatchObject({ targetPlaceId: 'garden' });
    expect(q.conversationFor('carver')).toBe('carver_ch1_waiting');
    expect(q.readyToReturn('ch1')).toBe(false);
    q.apply({ type: 'useItem', itemId: 'field_notebook', usedIn: 'x' });
    q.apply({ type: 'useItem', itemId: 'magnifying_lens', usedIn: 'x' });
    q.apply({ type: 'completeStep', chapterId: 'ch1', stepId: 'observe_sort' });
    expect(q.markerFor('carver')).toBe('turnin');
    expect(q.conversationFor('carver')).toBe('carver_ch1_closing');
    q.apply({ type: 'grantItem', itemId: 'nature_card', from: 'carver' });
    q.apply({ type: 'completeChapter', chapterId: 'ch1' });
    expect(q.progress('ch1').stage).toBe('complete');
    expect(state.xp).toBe(200);
    expect(state.seeds).toBe(30);
    // Chapter 2 is playable now, so Carver offers it next.
    expect(q.progress('ch2').stage).toBe('available');
    expect(q.markerFor('carver')).toBe('quest');
    expect(q.conversationFor('carver')).toBe('carver_ch2_opening');
    q.completeChapter('ch1');
    expect(state.xp).toBe(200);
  });

  it('runs Chapter 2: Carver → Ms. Nelson + Ada → timeline → Carver, then Chapter 3 waits', () => {
    const state = fresh();
    // A save from Phase 1 (Chapter 1 done, Chapter 2 still 'locked') opens Chapter 2 on load.
    for (const id of ['practice', 'ch1']) state.chapters[id] = { stage: 'complete', stepsDone: [], flags: [], rewarded: true };
    state.chapters.ch2 = { stage: 'locked', stepsDone: [], flags: [], rewarded: false };
    const q = new QuestEngine(CHAPTERS, ITEMS, state);
    expect(q.progress('ch2').stage).toBe('available');
    q.apply({ type: 'acceptQuest', chapterId: 'ch2' });
    expect(q.markerFor('ruth')).toBe('lead');
    expect(q.markerFor('ada')).toBe('lead');
    expect(q.conversationFor('carver')).toBe('carver_ch2_waiting');
    expect(q.conversationFor('ruth')).toBe('ruth_ch2_give');
    q.apply({ type: 'grantItem', itemId: 'botanical_sketch', from: 'ada' });
    q.apply({ type: 'completeStep', chapterId: 'ch2', stepId: 'get_sketch' });
    expect(q.nextAction().targetNpcId).toBe('ruth');
    q.apply({ type: 'grantItem', itemId: 'school_record', from: 'ruth' });
    q.apply({ type: 'completeStep', chapterId: 'ch2', stepId: 'get_record' });
    expect(q.nextAction()).toMatchObject({ targetPlaceId: 'school' });
    expect(q.conversationFor('ruth')).toBe('ruth_ch2_after');
    q.apply({ type: 'useItem', itemId: 'school_record', usedIn: 'x' });
    q.apply({ type: 'useItem', itemId: 'botanical_sketch', usedIn: 'x' });
    q.apply({ type: 'completeStep', chapterId: 'ch2', stepId: 'build_timeline' });
    expect(q.markerFor('carver')).toBe('turnin');
    expect(q.conversationFor('carver')).toBe('carver_ch2_closing');
    q.apply({ type: 'grantItem', itemId: 'journey_card', from: 'carver' });
    q.apply({ type: 'completeChapter', chapterId: 'ch2' });
    expect(q.progress('ch2').stage).toBe('complete');
    expect(state.xp).toBe(150);
    expect(state.seeds).toBe(20);
    // Chapter 3 is playable, so Carver offers it next.
    expect(q.progress('ch3').stage).toBe('available');
    expect(q.conversationFor('carver')).toBe('carver_ch3_opening');
  });

  it('runs Chapter 3: Carver → Mr. Hill + Mae → soil lab → Carver, then Chapter 4 waits', () => {
    const state = fresh();
    for (const id of ['practice', 'ch1', 'ch2']) state.chapters[id] = { stage: 'complete', stepsDone: [], flags: [], rewarded: true };
    state.chapters.ch3 = { stage: 'locked', stepsDone: [], flags: [], rewarded: false };
    const q = new QuestEngine(CHAPTERS, ITEMS, state);
    expect(q.progress('ch3').stage).toBe('available');
    q.apply({ type: 'acceptQuest', chapterId: 'ch3' });
    expect(q.markerFor('amos')).toBe('lead');
    expect(q.markerFor('mae')).toBe('lead');
    expect(q.conversationFor('mae')).toBe('mae_ch3_give');
    expect(q.nextAction().targetNpcId).toBe('amos');
    q.apply({ type: 'grantItem', itemId: 'soil_samples', from: 'amos' });
    q.apply({ type: 'grantItem', itemId: 'crop_history', from: 'amos' });
    q.apply({ type: 'completeStep', chapterId: 'ch3', stepId: 'get_samples' });
    expect(q.nextAction().targetNpcId).toBe('mae');
    q.apply({ type: 'grantItem', itemId: 'crop_cards', from: 'mae' });
    q.apply({ type: 'completeStep', chapterId: 'ch3', stepId: 'get_cards' });
    expect(q.nextAction()).toMatchObject({ targetPlaceId: 'farm' });
    expect(q.conversationFor('mae')).toBe('mae_ch3_after');
    expect(q.readyToReturn('ch3')).toBe(false);
    for (const it of ['soil_samples', 'crop_history', 'crop_cards']) q.apply({ type: 'useItem', itemId: it, usedIn: 'x' });
    q.apply({ type: 'completeStep', chapterId: 'ch3', stepId: 'soil_lab' });
    expect(q.conversationFor('carver')).toBe('carver_ch3_closing');
    q.apply({ type: 'grantItem', itemId: 'rotation_card', from: 'carver' });
    q.apply({ type: 'completeChapter', chapterId: 'ch3' });
    expect(q.progress('ch3').stage).toBe('complete');
    expect(state.xp).toBe(150);
    expect(state.seeds).toBe(20);
    expect(q.isUnlocked('ch4')).toBe(true);
    expect(q.progress('ch4').stage).toBe('locked');
    expect(q.nextAction().text).toMatch(/Chapter 4 is unlocked/);
    expect(q.conversationFor('carver')).toBe('carver_ch3_after');
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
