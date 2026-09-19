'use client';

import { useEffect, useRef, useState } from 'react';
import { EventBus } from './EventBus';
import type { WorldBootstrap } from '@/game/worldBootstrap';

interface PhaserGameProps {
  bootstrap?: WorldBootstrap | null;
  /** 'open' = chunked open world (default), 'gather' = Gather-style campus */
  variant?: 'open' | 'gather';
  onReady?: (game: Phaser.Game) => void;
  onSceneReady?: (scene: string) => void;
}

export function PhaserGame({ bootstrap, variant = 'open', onReady, onSceneReady }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadPhase, setLoadPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadPercent, setLoadPercent] = useState(0);

  const onReadyRef = useRef(onReady);
  const onSceneReadyRef = useRef(onSceneReady);
  const bootstrapRef = useRef(bootstrap);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onSceneReadyRef.current = onSceneReady; }, [onSceneReady]);
  useEffect(() => { bootstrapRef.current = bootstrap; }, [bootstrap]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    let cancelled = false;
    const progressTimer = window.setInterval(() => {
      setLoadPercent((p) => Math.min(p + 12, 85));
    }, 120);

    const initGame = async () => {
      try {
        const { createPhaserGame } = await import('@/game/main');
        if (cancelled) return;

        const game = createPhaserGame(
          'phaser-game-container',
          bootstrapRef.current ?? null,
          variant
        );
        gameRef.current = game;
        onReadyRef.current?.(game);
        setLoadPercent(100);
      } catch (err) {
        console.error('Phaser init failed:', err);
        setLoadPhase('error');
      }
    };

    initGame();

    const handleSceneReady = (data: { scene: string }) => {
      window.clearInterval(progressTimer);
      setLoadPercent(100);
      setLoadPhase('ready');
      onSceneReadyRef.current?.(data.scene);
    };

    EventBus.on('scene-ready', handleSceneReady);

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
      EventBus.off('scene-ready', handleSceneReady);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#FFFDF5]"
    >
      <div id="phaser-game-container" className="w-full h-full" />

      {loadPhase !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FFFDF5]">
          <div className="text-center w-64">
            {loadPhase === 'error' ? (
              <>
                <p className="text-red-600 font-semibold mb-2">Could not start the campus</p>
                <p className="text-sm text-gray-600">Try reloading the page.</p>
              </>
            ) : (
              <>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]" />
                <p className="mt-4 text-lg text-[#8B5CF6] font-semibold">Loading campus...</p>
                <div className="mt-3 h-2 bg-[#8B5CF6]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8B5CF6] transition-all duration-200"
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{loadPercent}%</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
