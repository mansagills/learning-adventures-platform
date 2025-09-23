'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGameComponent, getGameMetadata, isGameRegistered } from '@/lib/gameLoader';
import { GameProps } from '@/components/games/shared/types';

interface GamePageProps {
  params: {
    gameId: string;
  };
}

function GameLoader({ gameId, onExit, onComplete }: {
  gameId: string;
  onExit: () => void;
  onComplete: (score: number) => void;
}) {
  const [GameComponent, setGameComponent] = useState<React.ComponentType<GameProps> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGameRegistered(gameId)) {
      setError(`Game "${gameId}" not found`);
      return;
    }

    const loadGame = async () => {
      try {
        const LazyGameComponent = loadGameComponent(gameId);
        setGameComponent(() => LazyGameComponent);
      } catch (err) {
        setError(`Failed to load game: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    loadGame();
  }, [gameId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Game Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  if (!GameComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    }>
      <GameComponent onExit={onExit} onComplete={onComplete} />
    </Suspense>
  );
}

export default function GamePage({ params }: GamePageProps) {
  const router = useRouter();
  const { gameId } = params;

  const handleExit = () => {
    router.push('/catalog');
  };

  const handleComplete = (score: number) => {
    // In a real app, you might save the score to a database here
    console.log(`Game completed with score: ${score}`);

    // Show completion modal or redirect
    // For now, just go back to catalog
    setTimeout(() => {
      router.push('/catalog');
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <GameLoader
        gameId={gameId}
        onExit={handleExit}
        onComplete={handleComplete}
      />
    </div>
  );
}