'use client';

import { useEffect, useRef, useState } from 'react';
import { EventBus } from './EventBus';

interface PhaserGameProps {
  onReady?: (game: Phaser.Game) => void;
  onSceneReady?: (scene: string) => void;
}

export function PhaserGame({ onReady, onSceneReady }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGameReady, setIsGameReady] = useState(false);

  // Keep callback refs fresh without triggering effect re-runs
  const onReadyRef = useRef(onReady);
  const onSceneReadyRef = useRef(onSceneReady);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onSceneReadyRef.current = onSceneReady; }, [onSceneReady]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    const initGame = async () => {
      const { createPhaserGame } = await import('@/game/main');
      const game = createPhaserGame('phaser-game-container');
      gameRef.current = game;
      onReadyRef.current?.(game);
      console.log('Phaser game created');
    };

    initGame();

    const handleSceneReady = (data: { scene: string }) => {
      console.log(`Scene ready: ${data.scene}`);
      setIsGameReady(true);
      onSceneReadyRef.current?.(data.scene);
    };

    EventBus.on('scene-ready', handleSceneReady);

    return () => {
      console.log('Cleaning up Phaser game');
      EventBus.off('scene-ready', handleSceneReady);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Empty — Phaser initializes once and never restarts

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#FFFDF5]"
    >
      <div id="phaser-game-container" className="w-full h-full" />

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
