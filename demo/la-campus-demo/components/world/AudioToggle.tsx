'use client';

import { useEffect, useState } from 'react';
import { isMuted, toggleMuted } from '@/game/world/campusAudio';

/**
 * AudioToggle — small speaker chip for muting the synthesized campus
 * SFX/ambience (game/world/campusAudio.ts). Reads/writes the same
 * localStorage preference the audio module already persists.
 */
export function AudioToggle() {
  // Start `false` on the server render and hydrate the real value on mount,
  // avoiding a hydration mismatch (localStorage isn't available server-side).
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  return (
    <button
      onClick={() => setMutedState(toggleMuted())}
      className="absolute top-16 right-4 w-10 h-10 flex items-center justify-center pointer-events-auto text-lg"
      style={{
        background: 'rgba(5,8,16,0.82)',
        border: '1px solid var(--hud-accent, #00ccff)',
        borderRadius: '8px',
        boxShadow: '0 0 12px color-mix(in srgb, var(--hud-accent, #00ccff) 30%, transparent)',
      }}
      title={muted ? 'Unmute campus sound' : 'Mute campus sound'}
      aria-label={muted ? 'Unmute campus sound' : 'Mute campus sound'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
