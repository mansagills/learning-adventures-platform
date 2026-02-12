'use client';

import { useEffect, useRef, useState } from 'react';
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    return gameMap[adventureId] || `/games/${adventureId}.html`;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-[95vw] h-[95vh] max-w-7xl bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-vivid-violet to-electric-purple text-white">
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

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-warm-cream">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-vivid-violet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading adventure...</p>
            </div>
          </div>
        )}

        {/* Embedded Game/Lesson */}
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          className="w-full h-full border-0 pt-14"
          title={`Adventure: ${adventureId}`}
          sandbox="allow-scripts allow-same-origin"
          onLoad={handleIframeLoad}
        />

        {/* Instructions Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-2 text-white text-sm text-center">
          <p>Complete the activity to earn XP! Press ESC or click the X to exit.</p>
        </div>
      </div>
    </div>
  );
}
