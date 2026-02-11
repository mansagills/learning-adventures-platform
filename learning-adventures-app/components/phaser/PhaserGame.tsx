'use client';

import { useEffect, useRef, useState } from 'react';
import { EventBus } from './EventBus';

interface PhaserGameProps {
  onReady?: (game: Phaser.Game) => void;
  onSceneReady?: (scene: string) => void;
}

/**
 * PhaserGame - React bridge component for Phaser game instance
 *
 * This component handles:
 * - Phaser game lifecycle (create, destroy)
 * - Dynamic import to avoid SSR issues
 * - Event communication with parent React components
 */
export function PhaserGame({ onReady, onSceneReady }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGameReady, setIsGameReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent multiple instances
    if (gameRef.current) return;

    // Dynamically import Phaser game creation to avoid SSR
    const initGame = async () => {
      const { createPhaserGame } = await import('@/game/main');

      // Create game instance
      const game = createPhaserGame('phaser-game-container');
      gameRef.current = game;

      // Notify parent that game is ready
      if (onReady) {
        onReady(game);
      }

      console.log('Phaser game created');
    };

    initGame();

    // Listen for scene ready events
    const handleSceneReady = (data: { scene: string }) => {
      console.log(`Scene ready: ${data.scene}`);
      setIsGameReady(true);
      onSceneReady?.(data.scene);
    };

    EventBus.on('scene-ready', handleSceneReady);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up Phaser game');
      EventBus.off('scene-ready', handleSceneReady);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onReady, onSceneReady]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#FFFDF5]"
    >
      <div id="phaser-game-container" className="w-full h-full" />

      {/* Loading indicator */}
      {!isGameReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FFFDF5]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]" />
            <p className="mt-4 text-lg text-[#8B5CF6] font-semibold">
              Loading world...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
