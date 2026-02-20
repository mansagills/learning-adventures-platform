'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EventBus } from '@/components/phaser/EventBus';
import { AdventureEmbed } from '@/components/world/AdventureEmbed';

// Dynamically import Phaser component to avoid SSR issues
const PhaserGame = dynamic(
  () => import('@/components/phaser/PhaserGame').then((mod) => mod.PhaserGame),
  { ssr: false }
);

export default function WorldPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameReady, setGameReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterData, setCharacterData] = useState<any>(null);
  const [isCheckingCharacter, setIsCheckingCharacter] = useState(true);
  const [currentAdventure, setCurrentAdventure] = useState<{
    adventureId: string;
    type: 'game' | 'lesson';
  } | null>(null);
  const [xp, setXp] = useState(0);
  const [xpNotification, setXpNotification] = useState<string | null>(null);

  // Use refs so EventBus callbacks always have latest values without re-registering
  const sessionRef = useRef(session);
  const characterDataRef = useRef(characterData);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { characterDataRef.current = characterData; }, [characterData]);

  // Check authentication and character - runs once on auth status change
  useEffect(() => {
    const checkCharacter = async () => {
      if (status === 'unauthenticated') {
        router.push('/');
        return;
      }

      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/character');
          const data = await response.json();

          if (!data.character) {
            router.push('/world/create');
          } else {
            setCharacterData(data.character);
            setIsCheckingCharacter(false);
          }
        } catch (error) {
          console.error('Error fetching character:', error);
          setError('Failed to load character data');
          setIsCheckingCharacter(false);
        }
      }
    };

    checkCharacter();
  }, [status, router]);

  // Setup EventBus listeners once — use refs for latest values
  useEffect(() => {
    const handleSavePosition = async (data: { x: number; y: number; scene: string }) => {
      if (!sessionRef.current?.user || !characterDataRef.current) return;

      try {
        await fetch('/api/character/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position: data,
            lastScene: data.scene,
          }),
        });
        console.log('Position saved:', data);
      } catch (err) {
        console.error('Failed to save position:', err);
      }
    };

    const handleOpenAdventure = (data: { adventureId: string; type: 'game' | 'lesson' }) => {
      console.log('Opening adventure:', data);
      setCurrentAdventure(data);
    };

    EventBus.on('save-player-position', handleSavePosition);
    EventBus.on('open-adventure', handleOpenAdventure);

    return () => {
      EventBus.off('save-player-position', handleSavePosition);
      EventBus.off('open-adventure', handleOpenAdventure);
    };
  }, []); // Empty deps — refs keep values fresh without re-registering

  const handleSceneReady = (scene: string) => {
    console.log(`Scene ${scene} is ready`);
    setGameReady(true);
  };

  const handleAdventureComplete = async (adventureId: string) => {
    const XP_PER_GAME = 50;
    setXp((prev) => prev + XP_PER_GAME);
    setXpNotification(`+${XP_PER_GAME} XP!`);
    setCurrentAdventure(null);
    EventBus.emit('adventure-completed', { adventureId });
    // Clear notification after 3 seconds
    setTimeout(() => setXpNotification(null), 3000);
  };

  const handleCloseAdventure = () => {
    setCurrentAdventure(null);
  };

  // Loading screen
  if (status === 'loading' || isCheckingCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]" />
          <p className="mt-4 text-lg text-[#8B5CF6] font-semibold">
            {isCheckingCharacter ? 'Loading character...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unable to Load Game World</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <a
            href="/catalog"
            className="inline-block px-6 py-3 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors"
          >
            Browse Catalog Instead
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#FFFDF5]">
      {/* Game container — always mounted, never conditionally rendered */}
      <div className="absolute inset-0">
        <PhaserGame onSceneReady={handleSceneReady} />
      </div>

      {/* Adventure Embed Modal — rendered on top, does NOT affect PhaserGame */}
      {currentAdventure && (
        <AdventureEmbed
          adventureId={currentAdventure.adventureId}
          type={currentAdventure.type}
          onClose={handleCloseAdventure}
          onComplete={() => handleAdventureComplete(currentAdventure.adventureId)}
        />
      )}

      {/* XP Notification Toast */}
      {xpNotification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div
            className="bg-yellow-400 text-yellow-900 font-extrabold text-2xl px-8 py-4 rounded-2xl shadow-2xl animate-bounce"
          >
            ⭐ {xpNotification}
          </div>
        </div>
      )}

      {/* HUD Overlay */}
      {gameReady && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between pointer-events-auto">
            <div className="bg-black/70 rounded-lg px-4 py-2">
              <p className="text-white font-semibold">
                {characterData?.name || session?.user?.name || 'Player'}
              </p>
              <p className="text-xs text-gray-300">Level 1</p>
            </div>

            <div className="bg-black/70 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">⭐</span>
                <span className="text-white font-bold">{xp} XP</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg px-4 py-2 pointer-events-auto">
            <p className="text-white text-sm">
              <span className="font-semibold">Controls:</span> WASD or Arrow Keys to move
            </p>
          </div>

          <div className="absolute top-4 right-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg transition-colors pointer-events-auto"
            >
              Exit World
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
