export type CampusGuidedQuestStageId =
  | 'get-quest-from-mrs-numbers'
  | 'collect-rally-parts'
  | 'return-rally-parts'
  | 'start-math-race-rally'
  | 'score-math-race-rally'
  | 'math-explorer-earned';

export type CampusGuidedQuestEvent =
  | { type: 'entered-zone'; zoneKey: string }
  | { type: 'talked-to-npc'; npcId: string }
  | { type: 'collected-quest-item'; itemId: string; collectedItemIds: string[] }
  | { type: 'opened-adventure'; adventureId: string }
  | { type: 'completed-adventure'; adventureId: string; score?: number };

export interface CampusGuidedQuestStage {
  id: CampusGuidedQuestStageId;
  title: string;
  objective: string;
  hint: string;
  target?: { x: number; y: number };
  isComplete?: boolean;
}

export interface CampusQuestItem {
  id: string;
  label: string;
  x: number;
  y: number;
  hint: string;
}

export const MATH_RACE_RALLY_ID = 'math-race-rally';
export const MATH_RACE_PASSING_SCORE = 80;
export const MRS_NUMBERS_NPC_ID = 'npc_professor_numbers';

export const CAMPUS_QUEST_ITEMS: CampusQuestItem[] = [
  {
    id: 'number-battery',
    label: 'Number Battery',
    x: 448,
    y: 1984,
    hint: 'Near the west study pod in Math Hall.',
  },
  {
    id: 'fraction-fuel-cell',
    label: 'Fraction Fuel Cell',
    x: 768,
    y: 2112,
    hint: 'Beside the central Math Hall workbench.',
  },
  {
    id: 'turbo-token',
    label: 'Turbo Token',
    x: 1216,
    y: 1984,
    hint: 'Near the east Math Hall simulator bay.',
  },
];

export const CAMPUS_GUIDED_QUEST_STAGES: CampusGuidedQuestStage[] = [
  {
    id: 'get-quest-from-mrs-numbers',
    title: 'Get Quest From Mrs. Numbers',
    objective: 'Talk to Mrs. Numbers in Math Hall.',
    hint: 'Head west into Math Hall and look for the purple math mentor.',
    target: { x: 960, y: 1984 },
  },
  {
    id: 'collect-rally-parts',
    title: 'Collect Rally Parts',
    objective: `Collect ${CAMPUS_QUEST_ITEMS.length} rally parts around Math Hall.`,
    hint: 'Search near the study pods, workbench, and simulator bay.',
    target: { x: 768, y: 2112 },
  },
  {
    id: 'return-rally-parts',
    title: 'Return To Mrs. Numbers',
    objective: 'Bring the rally parts back to Mrs. Numbers.',
    hint: 'Talk to her again to unlock Math Race Rally.',
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
    id: 'score-math-race-rally',
    title: 'Score 80% Or Better',
    objective: 'Finish Math Race Rally with at least 80%.',
    hint: 'Retry the race if your score is below the quest target.',
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

export function getCampusQuestCollectedCount(collectedItemIds: string[]): number {
  const validItemIds = new Set(CAMPUS_QUEST_ITEMS.map((item) => item.id));
  return new Set(collectedItemIds.filter((itemId) => validItemIds.has(itemId))).size;
}

export function isCampusQuestReadyToReturn(collectedItemIds: string[]): boolean {
  return getCampusQuestCollectedCount(collectedItemIds) >= CAMPUS_QUEST_ITEMS.length;
}

export function isPassingMathRaceScore(score: number | undefined): boolean {
  return typeof score === 'number' && score >= MATH_RACE_PASSING_SCORE;
}

export function getCampusGuidedQuestStageView(
  stageId: CampusGuidedQuestStageId,
  collectedItemIds: string[] = [],
  lastMathRaceScore?: number,
): CampusGuidedQuestStage {
  const stage = getCampusGuidedQuestStage(stageId);

  if (stageId === 'collect-rally-parts') {
    const count = getCampusQuestCollectedCount(collectedItemIds);
    return {
      ...stage,
      objective: `Collect rally parts (${count}/${CAMPUS_QUEST_ITEMS.length}).`,
    };
  }

  if (stageId === 'score-math-race-rally' && typeof lastMathRaceScore === 'number') {
    return {
      ...stage,
      objective:
        lastMathRaceScore >= MATH_RACE_PASSING_SCORE
          ? `Score ${lastMathRaceScore}%. Return to campus for your badge.`
          : `Score ${lastMathRaceScore}%. Retry for ${MATH_RACE_PASSING_SCORE}% or better.`,
    };
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
    currentStage === 'get-quest-from-mrs-numbers' &&
    event.type === 'talked-to-npc' &&
    event.npcId === MRS_NUMBERS_NPC_ID
  ) {
    return 'collect-rally-parts';
  }

  if (
    currentStage === 'collect-rally-parts' &&
    event.type === 'collected-quest-item' &&
    isCampusQuestReadyToReturn(event.collectedItemIds)
  ) {
    return 'return-rally-parts';
  }

  if (
    currentStage === 'return-rally-parts' &&
    event.type === 'talked-to-npc' &&
    event.npcId === MRS_NUMBERS_NPC_ID
  ) {
    return 'start-math-race-rally';
  }

  if (
    currentStage === 'start-math-race-rally' &&
    event.type === 'opened-adventure' &&
    event.adventureId === MATH_RACE_RALLY_ID
  ) {
    return 'score-math-race-rally';
  }

  if (
    currentStage === 'score-math-race-rally' &&
    event.type === 'completed-adventure' &&
    event.adventureId === MATH_RACE_RALLY_ID &&
    isPassingMathRaceScore(event.score)
  ) {
    return 'math-explorer-earned';
  }

  return currentStage;
}
