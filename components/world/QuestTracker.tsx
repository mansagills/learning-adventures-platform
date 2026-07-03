'use client';

import { useEffect, useState } from 'react';
import { EventBus } from '@/components/phaser/EventBus';

/**
 * QuestTracker — HUD chip showing the active demo quest objective.
 * Listens to 'quest-updated' from the Phaser quest flow (game/world/mathQuest.ts).
 */

interface QuestSnapshot {
  stage: 'available' | 'gather' | 'return' | 'play' | 'complete';
  collected: number;
  total: number;
  objective: string;
}

const STAGE_ICON: Record<QuestSnapshot['stage'], string> = {
  available: '❗',
  gather: '🔋',
  return: '↩️',
  play: '🏎️',
  complete: '🏁',
};

export function QuestTracker() {
  const [quest, setQuest] = useState<QuestSnapshot | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const handleUpdate = (snapshot: QuestSnapshot) => {
      setQuest((prev) => {
        if (prev && prev.stage !== 'complete' && snapshot.stage === 'complete') {
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 4000);
        }
        return snapshot;
      });
    };
    EventBus.on('quest-updated', handleUpdate);
    return () => {
      EventBus.off('quest-updated', handleUpdate);
    };
  }, []);

  if (!quest) return null;

  return (
    <>
      <div
        className="absolute top-24 left-4 px-3 py-2 pointer-events-none max-w-[16rem]"
        style={{
          background: 'rgba(5,8,16,0.82)',
          border: '1px solid var(--hud-accent, #00ccff)',
          borderRadius: '8px',
          boxShadow: '0 0 12px color-mix(in srgb, var(--hud-accent, #00ccff) 30%, transparent)',
        }}
      >
        <p
          className="text-[10px] font-bold tracking-widest mb-0.5"
          style={{ color: 'var(--hud-accent, #00ccff)' }}
        >
          QUEST
        </p>
        <p className="text-white text-sm leading-snug">
          <span aria-hidden className="mr-1.5">{STAGE_ICON[quest.stage]}</span>
          {quest.objective}
        </p>
        {quest.stage === 'gather' && (
          <div className="flex gap-1 mt-1.5" aria-hidden>
            {Array.from({ length: quest.total }, (_, i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  background:
                    i < quest.collected
                      ? 'var(--hud-accent, #00ccff)'
                      : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completion celebration banner */}
      {celebrate && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-yellow-400 text-yellow-900 font-extrabold text-2xl px-10 py-4 rounded-2xl shadow-2xl animate-bounce">
            🏁 Racing License earned!
          </div>
        </div>
      )}
    </>
  );
}
