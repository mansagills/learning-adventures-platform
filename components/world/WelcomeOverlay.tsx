'use client';

import { markWelcomeSeen } from '@/game/world/welcomeState';
import { unlockAudio, startAmbience } from '@/game/world/campusAudio';

interface WelcomeOverlayProps {
  onDismiss: () => void;
}

/**
 * WelcomeOverlay — one-time first-visit card (game/world/welcomeState.ts
 * gates repeat showings). The "Start Exploring" button doubles as the
 * required user gesture that unlocks the Web Audio ambience/SFX
 * (game/world/campusAudio.ts) — browsers block audio before a click.
 */
export function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  const handleStart = () => {
    markWelcomeSeen();
    unlockAudio();
    startAmbience();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-[92vw] max-w-md rounded-2xl overflow-hidden text-center"
        style={{ background: '#0d1320', border: '2px solid var(--hud-accent, #00ccff)' }}
      >
        <div className="px-6 pt-8 pb-6">
          <p className="text-5xl mb-3" aria-hidden>🎓</p>
          <h1 className="text-white font-extrabold text-2xl mb-2">Welcome to Campus!</h1>
          <p className="text-white/70 text-sm mb-6">
            Explore Math Hall, Discovery Lab, Story Grove, and The Commons.
            Chat with anyone you meet, and find Professor Numbers for your first quest.
          </p>

          <ul className="text-left text-sm text-white/85 space-y-2 mb-7 px-2">
            <li className="flex items-center gap-2">
              <span
                className="shrink-0 w-16 text-center font-bold text-xs py-1 rounded"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--hud-accent, #00ccff)' }}
              >
                WASD
              </span>
              Move around campus
            </li>
            <li className="flex items-center gap-2">
              <span
                className="shrink-0 w-16 text-center font-bold text-xs py-1 rounded"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--hud-accent, #00ccff)' }}
              >
                Walk up
              </span>
              Talk to anyone automatically
            </li>
            <li className="flex items-center gap-2">
              <span
                className="shrink-0 w-16 text-center font-bold text-xs py-1 rounded"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--hud-accent, #00ccff)' }}
              >
                SPACE
              </span>
              Continue talking / use a station
            </li>
          </ul>

          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl font-extrabold text-lg transition-transform hover:scale-[1.02]"
            style={{ background: 'var(--hud-accent, #00ccff)', color: '#04121f' }}
          >
            🚀 Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
