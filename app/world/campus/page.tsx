'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EventBus } from '@/components/phaser/EventBus';
import { AdventureEmbed } from '@/components/world/AdventureEmbed';
import { ShopModal } from '@/components/world/ShopModal';
import {
  ConversationPanel,
  type NpcConversationState,
} from '@/components/world/ConversationPanel';
import type { WorldBootstrap } from '@/game/worldBootstrap';

// Dynamically import Phaser component to avoid SSR issues
const PhaserGame = dynamic(
  () => import('@/components/phaser/PhaserGame').then((mod) => mod.PhaserGame),
  { ssr: false }
);

const XP_PER_GAME = 50;
const COINS_PER_GAME = 5;

/**
 * /world/campus — Gather-style campus world.
 *
 * Alternative to /world: one continuous 16-bit campus map where you walk up
 * to NPCs to talk (proximity conversations) and walk up to stations to play
 * learning games. Reuses the same auth, character, and reward APIs.
 */
export default function CampusWorldPage() {
  const { user: session, status } = useAuth();
  const router = useRouter();
  const [gameReady, setGameReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterData, setCharacterData] = useState<any>(null);
  const [bootstrap, setBootstrap] = useState<WorldBootstrap | null>(null);
  const [isCheckingCharacter, setIsCheckingCharacter] = useState(true);
  const [currentAdventure, setCurrentAdventure] = useState<{
    adventureId: string;
    type: 'game' | 'lesson';
  } | null>(null);
  const [conversation, setConversation] = useState<NpcConversationState | null>(null);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [notification, setNotification] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);

  const sessionRef = useRef(session);
  const characterDataRef = useRef(characterData);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { characterDataRef.current = characterData; }, [characterData]);

  // Check authentication and character
  useEffect(() => {
    const checkCharacter = async () => {
      if (status === 'unauthenticated') {
        router.push('/');
        return;
      }
      if (status !== 'authenticated') return;

      try {
        const [charRes, levelRes] = await Promise.all([
          fetch('/api/character'),
          fetch('/api/world/award'),
        ]);
        const charData = await charRes.json();
        const levelData = await levelRes.json().catch(() => null);

        if (!charData.character) {
          router.push('/world/create');
          return;
        }

        setCharacterData(charData.character);
        if (levelData?.level) {
          setXp(levelData.level.totalXP ?? 0);
          setCoins(levelData.level.currency ?? 0);
          setUserLevel(levelData.level.currentLevel ?? 1);
        }
        // Restore position only if the player was last seen on this map
        if (
          charData.character.lastScene === 'GatherCampusScene' &&
          charData.character.position
        ) {
          setBootstrap({
            avatarId: charData.character.avatarId,
            lastScene: charData.character.lastScene,
            position: charData.character.position,
          });
        }
        setIsCheckingCharacter(false);
      } catch (err) {
        console.error('Error fetching character:', err);
        setError('Failed to load character data');
        setIsCheckingCharacter(false);
      }
    };

    checkCharacter();
  }, [status, router]);

  // EventBus listeners
  useEffect(() => {
    const handleSavePosition = async (data: { x: number; y: number; scene: string }) => {
      if (!sessionRef.current || !characterDataRef.current) return;
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
    const handleOpenShop = () => setShowShop(true);
    const handleConversation = (data: NpcConversationState) => setConversation(data);
    const handleConversationEnd = () => setConversation(null);

    EventBus.on('save-player-position', handleSavePosition);
    EventBus.on('open-adventure', handleOpenAdventure);
    EventBus.on('open-shop', handleOpenShop);
    EventBus.on('npc-conversation', handleConversation);
    EventBus.on('npc-conversation-end', handleConversationEnd);

    return () => {
      EventBus.off('save-player-position', handleSavePosition);
      EventBus.off('open-adventure', handleOpenAdventure);
      EventBus.off('open-shop', handleOpenShop);
      EventBus.off('npc-conversation', handleConversation);
      EventBus.off('npc-conversation-end', handleConversationEnd);
    };
  }, []);

  // Freeze player movement while a modal (game embed / shop) is open
  useEffect(() => {
    EventBus.emit('world-pause', Boolean(currentAdventure || showShop));
  }, [currentAdventure, showShop]);

  const handleSceneReady = (_scene: string) => {
    setGameReady(true);
    if (characterDataRef.current?.avatarId) {
      EventBus.emit('set-avatar', { avatarId: characterDataRef.current.avatarId });
    }
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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unable to Load Campus</h1>
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
        <PhaserGame
          variant="gather"
          bootstrap={bootstrap}
          onSceneReady={handleSceneReady}
        />
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

      {/* Shop Modal — opened by finishing Merchant Mo's conversation */}
      {showShop && (
        <ShopModal
          onClose={() => setShowShop(false)}
          onPurchase={(_item, newBalance) => setCoins(newBalance)}
          currency={coins}
          userLevel={userLevel}
        />
      )}

      {/* NPC conversation panel */}
      {conversation && <ConversationPanel conversation={conversation} />}

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
              {characterData?.name || session?.name || 'Player'}
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
              onClick={() => router.push('/world')}
              className="bg-black/70 hover:bg-[#8B5CF6]/80 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              title="Switch to the classic open world"
            >
              🗺️ Classic World
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Exit Campus
            </button>
          </div>

          {/* Bottom-right: Controls hint */}
          <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg px-4 py-2 pointer-events-none">
            <p className="text-white text-sm">
              <span className="font-semibold">Move:</span> WASD / Arrows ·{' '}
              <span className="font-semibold">Talk:</span> walk up to anyone ·{' '}
              <span className="font-semibold">Play:</span> SPACE at a station
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
