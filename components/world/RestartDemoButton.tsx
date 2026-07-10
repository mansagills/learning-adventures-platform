'use client';

import { useEffect, useRef, useState } from 'react';
import { resetDemo } from '@/game/world/demoReset';

const ARM_TIMEOUT_MS = 3000;

/**
 * RestartDemoButton — sandbox-only control that wipes XP, inventory,
 * exploration progress, and the welcome-seen flag, then reloads, so a
 * presenter gets an identical fresh run every time (game/world/demoReset.ts).
 *
 * Two-stage confirm (click to arm, click again within 3s to actually reset)
 * instead of a native confirm() dialog, so an accidental click during a
 * live pitch can't wipe progress.
 */
export function RestartDemoButton() {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (armed) {
      if (timerRef.current) clearTimeout(timerRef.current);
      resetDemo();
      return;
    }
    setArmed(true);
    timerRef.current = setTimeout(() => setArmed(false), ARM_TIMEOUT_MS);
  };

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-4 left-4 px-3 py-2 pointer-events-auto text-xs font-bold transition-colors"
      style={
        armed
          ? {
              background: 'rgba(220,38,38,0.9)',
              border: '1px solid #fca5a5',
              color: '#fff',
              borderRadius: '8px',
            }
          : {
              background: 'rgba(5,8,16,0.82)',
              border: '1px solid var(--hud-accent, #00ccff)',
              color: 'rgba(255,255,255,0.85)',
              borderRadius: '8px',
            }
      }
      title="Wipe XP, inventory, exploration, and the welcome card, then reload"
      aria-label={armed ? 'Confirm restart demo' : 'Restart demo'}
    >
      {armed ? '⚠️ Click again to confirm' : '🔄 Restart Demo'}
    </button>
  );
}
