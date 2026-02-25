'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdventureEmbedProps {
  adventureId: string;
  type: 'game' | 'lesson';
  onClose: () => void;
  onComplete?: (score?: number) => void;
}

/**
 * AdventureEmbed - Modal component for embedding HTML games/lessons
 * Receives postMessage events from embedded content for completion tracking
 */
export function AdventureEmbed({
  adventureId,
  type,
  onClose,
  onComplete,
}: AdventureEmbedProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen for postMessage events from embedded game
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin if needed (for now, accept localhost)
      // if (event.origin !== window.location.origin) return;

      const data = event.data;

      // Handle game completion
      if (data.type === 'game-complete' && data.adventureId === adventureId) {
        console.log('Game completed:', data);
        if (onComplete) {
          onComplete(data.score);
        }
      }

      // Handle lesson completion
      if (data.type === 'lesson-complete' && data.adventureId === adventureId) {
        console.log('Lesson completed:', data);
        if (onComplete) {
          onComplete();
        }
      }
    };

    // Listen for ESC key to close modal
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adventureId, onComplete, onClose]);

  const getEmbedUrl = () => {
    // Map adventureId to actual HTML file path
    const gameMap: Record<string, string> = {
      'pizza-fraction-frenzy': '/games/pizza-fraction-frenzy.html',
      'math-race-rally': '/games/math-race-rally.html',
      'multiplication-bingo-bonanza': '/games/multiplication-bingo-bonanza.html',
      'number-monster-feeding': '/games/number-monster-feeding.html',
      'math-jeopardy-junior': '/games/math-jeopardy-junior.html',
    };

    console.log('[AdventureEmbed] adventureId:', adventureId);
    const path = gameMap[adventureId] ?? `/games/${adventureId}.html`;
    const url = `${window.location.origin}${path}`;
    console.log('[AdventureEmbed] loading URL:', url);
    return url;
  };

  const handleIframeLoad = () => {
    // Game opened in new tab — show completion confirmation
    setIsLoading(true);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-[95vw] h-[95vh] max-w-7xl bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 text-white" style={{ background: 'linear-gradient(to right, #8B5CF6, #6D28D9)' }}>
          <h2 className="text-lg font-bold">
            {type === 'game' ? '🎮 Playing Game' : '📚 Learning Activity'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game launcher */}
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 pt-14 pb-12">
          {!isLoading ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Play!</h3>
              <p className="text-gray-500 mb-6">Click below to open the game in a new tab.</p>
              <a
                href={getEmbedUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleIframeLoad}
                className="inline-block px-8 py-4 rounded-xl text-white font-bold text-lg transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(to right, #8B5CF6, #6D28D9)' }}
              >
                Open Game
              </a>
              <p className="text-sm text-gray-400 mt-4">Come back here when you&apos;re done!</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Nice work!</h3>
              <p className="text-gray-500 mb-6">Did you finish the game?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => onComplete && onComplete()}
                  className="px-8 py-4 rounded-xl text-white font-bold text-lg transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}
                >
                  ⭐ Yes, I finished! (+50 XP)
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-4 rounded-xl text-gray-700 font-bold text-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Not yet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-2 text-white text-sm text-center">
          <p>Complete the activity to earn XP! Press ESC or click the X to exit.</p>
        </div>
      </div>
    </div>
  );
}
