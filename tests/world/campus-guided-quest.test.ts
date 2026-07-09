import { describe, expect, it } from 'vitest';

import {
  CAMPUS_GUIDED_QUEST_STAGES,
  CAMPUS_QUEST_ITEMS,
  MATH_RACE_PASSING_SCORE,
  advanceCampusGuidedQuest,
  getCampusGuidedQuestStage,
  getCampusGuidedQuestStageView,
  getCampusQuestCollectedCount,
  isCampusQuestReadyToReturn,
  isPassingMathRaceScore,
} from '@/game/world/campusGuidedQuest';

describe('campus guided quest progression', () => {
  it('starts by sending the player to Mrs. Numbers', () => {
    const stage = getCampusGuidedQuestStage('get-quest-from-mrs-numbers');

    expect(stage.title).toBe('Get Quest From Mrs. Numbers');
    expect(stage.objective).toContain('Mrs. Numbers');
    expect(stage.target).toEqual({ x: 960, y: 1984 });
  });

  it('starts the fetch quest after talking to Mrs. Numbers', () => {
    const stage = advanceCampusGuidedQuest('get-quest-from-mrs-numbers', {
      type: 'talked-to-npc',
      npcId: 'npc_professor_numbers',
    });

    expect(stage).toBe('collect-rally-parts');
  });

  it('does not skip the quest briefing when entering Math Hall', () => {
    const stage = advanceCampusGuidedQuest('get-quest-from-mrs-numbers', {
      type: 'entered-zone',
      zoneKey: 'math-hall',
    });

    expect(stage).toBe('get-quest-from-mrs-numbers');
  });

  it('tracks unique rally parts and advances when all are collected', () => {
    const collected = CAMPUS_QUEST_ITEMS.map((item) => item.id);

    expect(getCampusQuestCollectedCount([...collected, collected[0]])).toBe(
      CAMPUS_QUEST_ITEMS.length,
    );
    expect(isCampusQuestReadyToReturn(collected)).toBe(true);

    const stage = advanceCampusGuidedQuest('collect-rally-parts', {
      type: 'collected-quest-item',
      itemId: collected[collected.length - 1],
      collectedItemIds: collected,
    });

    expect(stage).toBe('return-rally-parts');
  });

  it('keeps the player collecting until every rally part is found', () => {
    const stage = advanceCampusGuidedQuest('collect-rally-parts', {
      type: 'collected-quest-item',
      itemId: CAMPUS_QUEST_ITEMS[0].id,
      collectedItemIds: [CAMPUS_QUEST_ITEMS[0].id],
    });

    expect(stage).toBe('collect-rally-parts');
    expect(getCampusGuidedQuestStageView(stage, [CAMPUS_QUEST_ITEMS[0].id]).objective).toBe(
      `Collect rally parts (1/${CAMPUS_QUEST_ITEMS.length}).`,
    );
  });

  it('unlocks Math Race Rally after returning the parts', () => {
    const stage = advanceCampusGuidedQuest('return-rally-parts', {
      type: 'talked-to-npc',
      npcId: 'npc_professor_numbers',
    });

    expect(stage).toBe('start-math-race-rally');
  });

  it('advances to score guidance after Math Race Rally starts', () => {
    const stage = advanceCampusGuidedQuest('start-math-race-rally', {
      type: 'opened-adventure',
      adventureId: 'math-race-rally',
    });

    expect(stage).toBe('score-math-race-rally');
  });

  it('requires at least 80 percent to finish Math Race Rally', () => {
    expect(isPassingMathRaceScore(MATH_RACE_PASSING_SCORE - 10)).toBe(false);
    expect(isPassingMathRaceScore(MATH_RACE_PASSING_SCORE)).toBe(true);

    const retryStage = advanceCampusGuidedQuest('score-math-race-rally', {
      type: 'completed-adventure',
      adventureId: 'math-race-rally',
      score: 70,
    });

    expect(retryStage).toBe('score-math-race-rally');
    expect(getCampusGuidedQuestStageView(retryStage, [], 70).objective).toContain('Retry');

    const completedStage = advanceCampusGuidedQuest('score-math-race-rally', {
      type: 'completed-adventure',
      adventureId: 'math-race-rally',
      score: 80,
    });

    expect(completedStage).toBe('math-explorer-earned');
    expect(getCampusGuidedQuestStage(completedStage).isComplete).toBe(true);
  });

  it('never regresses after the badge stage is reached', () => {
    const stage = advanceCampusGuidedQuest('math-explorer-earned', {
      type: 'entered-zone',
      zoneKey: 'main-hub',
    });

    expect(stage).toBe('math-explorer-earned');
  });

  it('keeps the stage order explicit for the demo HUD', () => {
    expect(CAMPUS_GUIDED_QUEST_STAGES.map((stage) => stage.id)).toEqual([
      'get-quest-from-mrs-numbers',
      'collect-rally-parts',
      'return-rally-parts',
      'start-math-race-rally',
      'score-math-race-rally',
      'math-explorer-earned',
    ]);
  });
});
