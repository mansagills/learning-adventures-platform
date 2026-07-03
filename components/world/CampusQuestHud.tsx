'use client';

import {
  CAMPUS_GUIDED_QUEST_STAGES,
  type CampusGuidedQuestStage,
} from '@/game/world/campusGuidedQuest';

interface CampusQuestHudProps {
  stage: CampusGuidedQuestStage;
  className?: string;
}

export function CampusQuestHud({ stage, className }: CampusQuestHudProps) {
  const activeIndex = CAMPUS_GUIDED_QUEST_STAGES.findIndex(
    (item) => item.id === stage.id,
  );

  return (
    <div
      className={`absolute z-30 w-[min(24rem,calc(100vw-2rem))] pointer-events-none ${
        className ?? 'left-4 bottom-4'
      }`}
    >
      <div
        className="px-4 py-3 text-white shadow-2xl"
        style={{
          background: 'rgba(5,8,16,0.86)',
          border: '1px solid var(--hud-accent, #9b5cff)',
          borderRadius: '8px',
          boxShadow:
            '0 0 14px color-mix(in srgb, var(--hud-accent, #9b5cff) 32%, transparent)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[0.7rem] font-bold uppercase tracking-normal"
              style={{ color: 'var(--hud-accent, #9b5cff)' }}
            >
              First Quest · Step {activeIndex + 1} of {CAMPUS_GUIDED_QUEST_STAGES.length}
            </p>
            <h2 className="mt-0.5 text-base font-extrabold leading-tight">
              {stage.title}
            </h2>
          </div>
          {stage.isComplete && (
            <span
              className="shrink-0 rounded px-2 py-1 text-[0.65rem] font-bold uppercase"
              style={{
                color: '#001b12',
                background: '#4ade80',
              }}
            >
              Done
            </span>
          )}
        </div>

        <p className="mt-2 text-sm font-semibold leading-snug text-white/92">
          {stage.objective}
        </p>
        <p className="mt-1 text-xs leading-snug text-white/62">{stage.hint}</p>

        <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
          {CAMPUS_GUIDED_QUEST_STAGES.map((item, index) => {
            const isReached = index <= activeIndex;
            return (
              <div
                key={item.id}
                className="h-1.5 rounded-full"
                style={{
                  background: isReached
                    ? 'var(--hud-accent, #9b5cff)'
                    : 'rgba(255,255,255,0.22)',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
