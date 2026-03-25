'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdventureEmbedProps {
  adventureId: string;
  type: 'game' | 'lesson';
  onClose: () => void;
  onComplete?: (score?: number) => void;
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
      <div className="relative w-[95vw] h-[95vh] max-w-7xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 text-white shrink-0" style={{ background: 'linear-gradient(to right, #8B5CF6, #6D28D9)' }}>
          <h2 className="text-lg font-bold">
            {type === 'game' ? '🎮 Playing Game' : '📚 Learning Activity'}
          </h2>
          <div className="flex items-center gap-3">
            {/* Manual fallback — visible if game doesn't auto-postMessage */}
            {!completed && (
              <button
                onClick={() => { setCompleted(true); onComplete?.(); }}
                className="px-4 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold transition-colors"
              >
                ✅ I finished!
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Completion banner — shown after auto or manual complete */}
        {completed && (
          <div className="shrink-0 bg-green-500 text-white text-center py-3 font-bold text-lg">
            🏆 Great work! +50 XP earned! Closing in a moment…
          </div>
        )}

        {/* Game iframe — fills remaining space */}
        <iframe
          src={embedPath}
          className="w-full flex-1 border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title={adventureId}
          allow="autoplay"
        />

        {/* Footer */}
        <div className="shrink-0 bg-black/80 px-4 py-2 text-white text-sm text-center">
          Complete the activity to earn XP! Press ESC or click the X to exit.
        </div>
      </div>
    </div>
  );
}
