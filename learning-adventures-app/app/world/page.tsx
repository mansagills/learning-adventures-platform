'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EventBus } from '@/components/phaser/EventBus';
import { AdventureEmbed } from '@/components/world/AdventureEmbed';
import { ShopModal } from '@/components/world/ShopModal';
import { InventoryPanel } from '@/components/world/InventoryPanel';

// Dynamically import Phaser component to avoid SSR issues
const PhaserGame = dynamic(
  () => import('@/components/phaser/PhaserGame').then((mod) => mod.PhaserGame),
  { ssr: false }
);

const XP_PER_GAME = 50;
const COINS_PER_GAME = 5;

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
  const [coins, setCoins] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [notification, setNotification] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  // Use refs so EventBus callbacks always have latest values without re-registering
  const sessionRef = useRef(session);
  const characterDataRef = useRef(characterData);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { characterDataRef.current = characterData; }, [characterData]);

  // Check authentication and character — runs once on auth status change
  useEffect(() => {
    const checkCharacter = async () => {
      if (status === 'unauthenticated') {
        router.push('/');
        return;
      }

      if (status === 'authenticated') {
        try {
          const [charRes, levelRes] = await Promise.all([
            fetch('/api/character'),
            fetch('/api/world/award'),
          ]);
          const charData = await charRes.json();
          const levelData = await levelRes.json().catch(() => null);

          if (!charData.character) {
            router.push('/world/create');
          } else {
            setCharacterData(charData.character);
            if (levelData?.level) {
              setXp(levelData.level.totalXP ?? 0);
              setCoins(levelData.level.currency ?? 0);
              setUserLevel(levelData.level.currentLevel ?? 1);
            }
            setIsCheckingCharacter(false);
          }
        } catch (err) {
          console.error('Error fetching character:', err);
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
          body: JSON.stringify({ position: data, lastScene: data.scene }),
        });
      } catch (err) {
        console.error('Failed to save position:', err);
      }
    };

    const handleOpenAdventure = (data: { adventureId: string; type: 'game' | 'lesson' }) => {
      setCurrentAdventure(data);
    };

    const handleOpenShop = () => {
      setShowShop(true);
    };

    EventBus.on('save-player-position', handleSavePosition);
    EventBus.on('open-adventure', handleOpenAdventure);
    EventBus.on('open-shop', handleOpenShop);

    return () => {
      EventBus.off('save-player-position', handleSavePosition);
      EventBus.off('open-adventure', handleOpenAdventure);
      EventBus.off('open-shop', handleOpenShop);
    };
  }, []);

  const handleSceneReady = (_scene: string) => {
    setGameReady(true);
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdventureComplete = async (adventureId: string) => {
    setXp((prev) => prev + XP_PER_GAME);
    setCoins((prev) => prev + COINS_PER_GAME);
    setCurrentAdventure(null);
    EventBus.emit('adventure-completed', { adventureId });
    showNotification(`+${XP_PER_GAME} XP  +${COINS_PER_GAME} 🪙`);

    // Persist XP and coins to backend
    try {
      const res = await fetch('/api/world/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: XP_PER_GAME, coins: COINS_PER_GAME }),
      });
      const data = await res.json();
      if (data.level) {
        setXp(data.level.totalXP);
        setCoins(data.level.currency);
        setUserLevel(data.level.currentLevel);
        if (data.leveledUp) {
          showNotification(`🎉 Level Up! You're now Level ${data.level.currentLevel}! +100 🪙`);
        }
      }
    } catch (err) {
      console.error('Failed to save adventure reward:', err);
    }
  };

  const handleShopPurchase = (_item: any, newBalance: number) => {
    setCoins(newBalance);
  };

  const handleEquip = (_itemId: string, _equipment: Record<string, string | null>) => {
    // Could emit to Phaser here to update sprite cosmetics in future
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
      {/* Game canvas */}
      <div className="absolute inset-0">
        <PhaserGame onSceneReady={handleSceneReady} />
      </div>

      {/* Adventure Embed Modal */}
      {currentAdventure && (
        <AdventureEmbed
          adventureId={currentAdventure.adventureId}
          type={currentAdventure.type}
          onClose={() => setCurrentAdventure(null)}
          onComplete={() => handleAdventureComplete(currentAdventure.adventureId)}
        />
      )}

      {/* Shop Modal */}
      {showShop && (
        <ShopModal
          onClose={() => setShowShop(false)}
          onPurchase={handleShopPurchase}
          currency={coins}
          userLevel={userLevel}
        />
      )}

      {/* Inventory Panel */}
      {showInventory && (
        <InventoryPanel
          onClose={() => setShowInventory(false)}
          onEquip={handleEquip}
        />
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-yellow-400 text-yellow-900 font-extrabold text-xl px-8 py-3 rounded-2xl shadow-2xl animate-bounce">
            ⭐ {notification}
          </div>
        </div>
      )}

      {/* HUD Overlay */}
      {gameReady && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top-left: Character info */}
          <div className="absolute top-4 left-4 bg-black/70 rounded-lg px-4 py-2 pointer-events-auto">
            <p className="text-white font-semibold">
              {characterData?.name || session?.user?.name || 'Player'}
            </p>
            <p className="text-xs text-gray-300">Level {userLevel}</p>
          </div>

          {/* Top-center: XP + Coins */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-none">
            <div className="bg-black/70 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-yellow-400 text-lg">⭐</span>
              <span className="text-white font-bold">{xp} XP</span>
            </div>
            <div className="bg-black/70 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-yellow-300 text-lg">🪙</span>
              <span className="text-white font-bold">{coins}</span>
            </div>
          </div>

          {/* Top-right: Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
            <button
              onClick={() => setShowInventory(true)}
              className="bg-black/70 hover:bg-[#8B5CF6]/80 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              title="Open Inventory"
            >
              🎒 Bag
            </button>
            <button
              onClick={() => setShowShop(true)}
              className="bg-black/70 hover:bg-[#14B8A6]/80 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              title="Open Shop"
            >
              🛒 Shop
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Exit World
            </button>
          </div>

          {/* Bottom-right: Controls hint */}
          <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg px-4 py-2 pointer-events-none">
            <p className="text-white text-sm">
              <span className="font-semibold">Controls:</span> WASD or Arrow Keys to move
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
