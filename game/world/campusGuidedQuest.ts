export type CampusGuidedQuestStageId =
  | 'find-professor-numbers'
  | 'start-math-race-rally'
  | 'complete-math-race-rally'
  | 'math-explorer-earned';

export type CampusGuidedQuestEvent =
  | { type: 'entered-zone'; zoneKey: string }
  | { type: 'talked-to-npc'; npcId: string }
  | { type: 'opened-adventure'; adventureId: string }
  | { type: 'completed-adventure'; adventureId: string };

export interface CampusGuidedQuestStage {
  id: CampusGuidedQuestStageId;
  title: string;
  objective: string;
  hint: string;
  target?: { x: number; y: number };
  isComplete?: boolean;
}

const MATH_RACE_RALLY_ID = 'math-race-rally';

export const CAMPUS_GUIDED_QUEST_STAGES: CampusGuidedQuestStage[] = [
  {
    id: 'find-professor-numbers',
    title: 'Find Professor Numbers',
    objective: 'Head west into Math Hall.',
    hint: 'Look for the purple professor inside the Math Hall room.',
    target: { x: 960, y: 1984 },
  },
  {
    id: 'start-math-race-rally',
    title: 'Start Math Race Rally',
    objective: 'Use the Math Race Rally arcade cabinet.',
    hint: 'Stand near the cabinet in Math Hall and press SPACE or E.',
    target: { x: 640, y: 1728 },
  },
  {
    id: 'complete-math-race-rally',
    title: 'Finish The Rally',
    objective: 'Complete Math Race Rally to earn your first badge.',
    hint: 'Use the DONE button in the demo build if the game does not auto-finish.',
  },
  {
    id: 'math-explorer-earned',
    title: 'Math Explorer Earned',
    objective: 'Quest complete. The campus noticed your win.',
    hint: 'Simulated students will react around campus.',
    isComplete: true,
  },
];

const STAGES_BY_ID = new Map(
  CAMPUS_GUIDED_QUEST_STAGES.map((stage) => [stage.id, stage]),
);

export function getCampusGuidedQuestStage(
  stageId: CampusGuidedQuestStageId,
): CampusGuidedQuestStage {
  const stage = STAGES_BY_ID.get(stageId);
  if (!stage) {
    throw new Error(`Unknown campus guided quest stage: ${stageId}`);
  }
  return stage;
}

export function advanceCampusGuidedQuest(
  currentStage: CampusGuidedQuestStageId,
  event: CampusGuidedQuestEvent,
): CampusGuidedQuestStageId {
  if (currentStage === 'math-explorer-earned') {
    return currentStage;
  }

  if (
    currentStage === 'find-professor-numbers' &&
    ((event.type === 'entered-zone' && event.zoneKey === 'math-hall') ||
      (event.type === 'talked-to-npc' && event.npcId === 'npc_professor_numbers'))
  ) {
    return 'start-math-race-rally';
  }

  if (
    currentStage === 'start-math-race-rally' &&
    event.type === 'opened-adventure' &&
    event.adventureId === MATH_RACE_RALLY_ID
  ) {
    return 'complete-math-race-rally';
  }

  if (
    currentStage === 'complete-math-race-rally' &&
    event.type === 'completed-adventure' &&
    event.adventureId === MATH_RACE_RALLY_ID
  ) {
    return 'math-explorer-earned';
  }

  return currentStage;
}
