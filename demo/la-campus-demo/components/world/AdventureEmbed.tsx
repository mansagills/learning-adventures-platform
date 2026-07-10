'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdventureEmbedProps {
  adventureId: string;
  type: 'game' | 'lesson';
  onClose: () => void;
  onComplete?: (score?: number) => void;
  rewardXP?: number;
}

const GAME_MAP: Record<string, string> = {
  'pizza-fraction-frenzy': '/games/pizza-fraction-frenzy.html',
  'math-race-rally': '/games/math-race-rally.html',
  'multiplication-bingo-bonanza': '/games/multiplication-bingo-bonanza.html',
  'number-monster-feeding': '/games/number-monster-feeding.html',
  'math-jeopardy-junior': '/games/math-jeopardy-junior.html',
  'cafeteria-cashier': '/games/cafeteria-cashier.html',
  'library-organizer': '/games/math-dash.html',
  'garden-keeper': '/games/math-dash.html',
};

/**
 * AdventureEmbed - Modal with inline iframe for embedded HTML games/lessons.
 * Games signal completion via window.parent.postMessage({ type: 'game-complete', adventureId, score }).
 * Falls back to a manual "I finished" button for games that don't postMessage.
 */
export function AdventureEmbed({
  adventureId,
  type,
  onClose,
  onComplete,
  rewardXP = 50,
}: AdventureEmbedProps) {
  const [completed, setCompleted] = useState(false);

  const embedPath = GAME_MAP[adventureId] ?? `/games/${adventureId}.html`;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (
        (data.type === 'game-complete' || data.type === 'lesson-complete') &&
        data.adventureId === adventureId
      ) {
        setCompleted(true);
        onComplete?.(data.score);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adventureId, onComplete, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-[95vw] h-[95vh] max-w-7xl rounded shadow-2xl overflow-hidden flex flex-col"
        style={{ background: '#050810', border: '1px solid var(--hud-accent, #9b5cff)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0d1320 0%, #1a0a33 50%, #050810 100%)',
            borderBottom: '1px solid var(--hud-accent, #9b5cff)',
            boxShadow: '0 4px 20px rgba(155,92,255,0.3)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-pixel, monospace)',
              fontSize: '9px',
              color: 'var(--hud-accent, #9b5cff)',
              letterSpacing: '1px',
            }}
          >
            {type === 'game' ? 'PLAYING GAME' : 'LEARNING ACTIVITY'}
          </h2>
          <div className="flex items-center gap-3">
            {!completed && (
              <button
                onClick={() => { setCompleted(true); onComplete?.(); }}
                className="px-4 py-1.5 rounded transition-all hover:brightness-125"
                style={{
                  background: 'rgba(0,255,179,0.1)',
                  border: '1px solid #00ffb3',
                  color: '#00ffb3',
                  fontFamily: 'var(--font-pixel, monospace)',
                  fontSize: '7px',
                }}
              >
                DONE
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded transition-all hover:brightness-125"
              style={{ border: '1px solid rgba(204,221,255,0.3)', color: '#ccddff' }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Completion banner */}
        {completed && (
          <div
            className="shrink-0 text-center py-3"
            style={{
              background: 'rgba(0,255,179,0.1)',
              borderBottom: '1px solid #00ffb3',
              color: '#00ffb3',
              fontFamily: 'var(--font-pixel, monospace)',
              fontSize: '8px',
            }}
          >
            MISSION COMPLETE! +{rewardXP} XP EARNED
          </div>
        )}

        {/* Game iframe */}
        <iframe
          src={embedPath}
          className="w-full flex-1 border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title={adventureId}
          allow="autoplay"
        />

        {/* Footer */}
        <div
          className="shrink-0 px-4 py-2 text-center"
          style={{
            background: 'rgba(5,8,16,0.95)',
            borderTop: '1px solid rgba(204,221,255,0.15)',
            color: '#ccddff',
            fontFamily: 'var(--font-pixel, monospace)',
            fontSize: '6px',
          }}
        >
          COMPLETE ACTIVITY TO EARN XP · ESC OR X TO EXIT
        </div>
      </div>
    </div>
  );
}
