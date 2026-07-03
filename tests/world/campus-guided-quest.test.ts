import { describe, expect, it } from 'vitest';

import {
  CAMPUS_GUIDED_QUEST_STAGES,
  advanceCampusGuidedQuest,
  getCampusGuidedQuestStage,
} from '@/game/world/campusGuidedQuest';

describe('campus guided quest progression', () => {
  it('starts by sending the player to Math Hall', () => {
    const stage = getCampusGuidedQuestStage('find-professor-numbers');

    expect(stage.title).toBe('Find Professor Numbers');
    expect(stage.objective).toContain('Math Hall');
    expect(stage.target).toEqual({ x: 960, y: 1984 });
  });

  it('advances from Math Hall arrival to starting Math Race Rally', () => {
    const stage = advanceCampusGuidedQuest('find-professor-numbers', {
      type: 'entered-zone',
      zoneKey: 'math-hall',
    });

    expect(stage).toBe('start-math-race-rally');
  });

  it('also advances after talking to Professor Numbers', () => {
    const stage = advanceCampusGuidedQuest('find-professor-numbers', {
      type: 'talked-to-npc',
      npcId: 'npc_professor_numbers',
    });

    expect(stage).toBe('start-math-race-rally');
  });

  it('advances to completion guidance after Math Race Rally starts', () => {
    const stage = advanceCampusGuidedQuest('start-math-race-rally', {
      type: 'opened-adventure',
      adventureId: 'math-race-rally',
    });

    expect(stage).toBe('complete-math-race-rally');
  });

  it('finishes when Math Race Rally is completed', () => {
    const stage = advanceCampusGuidedQuest('complete-math-race-rally', {
      type: 'completed-adventure',
      adventureId: 'math-race-rally',
    });

    expect(stage).toBe('math-explorer-earned');
    expect(getCampusGuidedQuestStage(stage).isComplete).toBe(true);
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
      'find-professor-numbers',
      'start-math-race-rally',
      'complete-math-race-rally',
      'math-explorer-earned',
    ]);
  });
});
