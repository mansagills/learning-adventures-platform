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

/** True for elements the player types into (name box, search field, etc.) */
function isTextEntry(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  if (el instanceof HTMLInputElement) {
    return !['button', 'checkbox', 'radio', 'range', 'submit', 'reset'].includes(el.type);
  }
  return (el as HTMLElement).isContentEditable === true;
}

export function PhaserGame({ bootstrap, variant = 'open', onReady, onSceneReady }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadPhase, setLoadPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadPercent, setLoadPercent] = useState(0);

  const onReadyRef = useRef(onReady);
  const onSceneReadyRef = useRef(onSceneReady);
  const bootstrapRef = useRef(bootstrap);
  const variantRef = useRef(variant);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onSceneReadyRef.current = onSceneReady; }, [onSceneReady]);
  useEffect(() => { bootstrapRef.current = bootstrap; }, [bootstrap]);
  useEffect(() => { variantRef.current = variant; }, [variant]);

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
          variantRef.current
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

    // Phaser listens for keys on the whole page and blocks the ones it uses
    // (WASD, arrows, Space, E), so they never reach a text box. Switch the
    // game's keyboard off while the player is typing, and back on after.
    const syncKeyboardToFocus = () => {
      const keyboard = gameRef.current?.input?.keyboard;
      if (!keyboard) return;
      const typing = isTextEntry(document.activeElement);
      if (keyboard.enabled === !typing) return;
      keyboard.enabled = !typing;
      if (typing) {
        // Drop any key Phaser thought was held so the player doesn't drift
        gameRef.current?.scene
          .getScenes(true)
          .forEach((scene) => scene.input?.keyboard?.resetKeys());
      }
    };
    // focusout fires before the next element gains focus, so check afterwards
    const handleFocusChange = () => window.setTimeout(syncKeyboardToFocus, 0);
    document.addEventListener('focusin', handleFocusChange);
    document.addEventListener('focusout', handleFocusChange);
    EventBus.on('scene-ready', syncKeyboardToFocus);

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
      EventBus.off('scene-ready', handleSceneReady);
      EventBus.off('scene-ready', syncKeyboardToFocus);
      document.removeEventListener('focusin', handleFocusChange);
      document.removeEventListener('focusout', handleFocusChange);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#050810]"
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
