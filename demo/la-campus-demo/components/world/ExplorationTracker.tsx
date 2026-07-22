'use client';

import { useEffect, useState } from 'react';
import { EventBus } from '@/components/phaser/EventBus';

/**
 * ExplorationTracker — HUD checklist of campus buildings the player has
 * entered. Listens to 'exploration-updated' from the Phaser scene
 * (game/world/explorationState.ts). Visits persist in localStorage.
 */

interface Room {
  id: string;
  label: string;
}

interface ExplorationSnapshot {
  visited: string[];
  total: number;
  percent: number;
  discovered?: Room;
}

// Mirrors EXPLORATION_ROOMS (kept local so this stays a pure client component)
const ROOMS: Room[] = [
  { id: 'math-hall',     label: 'Math Hall' },
  { id: 'discovery-lab', label: 'Discovery Lab' },
  { id: 'story-grove',   label: 'Story Grove' },
  { id: 'commons',       label: 'The Commons' },
];

export function ExplorationTracker() {
  const [snapshot, setSnapshot] = useState<ExplorationSnapshot | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (data: ExplorationSnapshot) => {
      setSnapshot(data);
      if (data.discovered) {
        setToast(`New area discovered: ${data.discovered.label}!`);
        setTimeout(() => setToast(null), 3500);
      }
    };
    EventBus.on('exploration-updated', handleUpdate);
    return () => {
      EventBus.off('exploration-updated', handleUpdate);
    };
  }, []);

  if (!snapshot) return null;

  const visited = new Set(snapshot.visited);

  return (
    <>
      <div
        className="absolute top-44 left-4 px-3 py-2 pointer-events-none min-w-[10rem]"
        style={{
          background: 'rgba(5,8,16,0.82)',
          border: '1px solid var(--hud-accent, #00ccff)',
          borderRadius: '8px',
          boxShadow: '0 0 12px color-mix(in srgb, var(--hud-accent, #00ccff) 30%, transparent)',
        }}
      >
        <p
          className="text-[10px] font-bold tracking-widest mb-1"
          style={{ color: 'var(--hud-accent, #00ccff)' }}
        >
          🧭 EXPLORED {snapshot.percent}%
        </p>
        <ul className="space-y-0.5">
          {ROOMS.map((room) => {
            const seen = visited.has(room.id);
            return (
              <li
                key={room.id}
                className="text-xs flex items-center gap-1.5"
                style={{ color: seen ? '#ffffff' : 'rgba(255,255,255,0.45)' }}
              >
                <span aria-hidden style={{ color: seen ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                  {seen ? '✓' : '·'}
                </span>
                {room.label}
              </li>
            );
          })}
        </ul>
      </div>

      {/* First-visit toast */}
      {toast && (
        <div className="absolute top-48 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div
            className="px-6 py-2.5 rounded-xl font-bold text-white shadow-2xl"
            style={{
              background: 'rgba(5,8,16,0.92)',
              border: '2px solid #4ade80',
              boxShadow: '0 0 16px rgba(74,222,128,0.4)',
            }}
          >
            🧭 {toast}
          </div>
        </div>
      )}
    </>
  );
}
