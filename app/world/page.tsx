'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EventBus } from '@/components/phaser/EventBus';
import { AdventureEmbed } from '@/components/world/AdventureEmbed';
import { ShopModal } from '@/components/world/ShopModal';
import { InventoryPanel } from '@/components/world/InventoryPanel';
import { JobBoard } from '@/components/world/JobBoard';
import { WorldDialog, type NpcDialogState } from '@/components/world/WorldDialog';
import Minimap from '@/components/world/Minimap';
import { JaylenGuide } from '@/components/onboarding/JaylenGuide';
import { SparkChat } from '@/components/world/SparkChat';
import type { WorldBootstrap } from '@/game/worldBootstrap';

// Dynamically import Phaser component to avoid SSR issues
const PhaserGame = dynamic(
  () => import('@/components/phaser/PhaserGame').then((mod) => mod.PhaserGame),
  { ssr: false }
);

const XP_PER_GAME = 50;
const COINS_PER_GAME = 5;

export default function WorldPage() {
  const { user: session, status } = useAuth();
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
  const [showJobBoard, setShowJobBoard] = useState(false);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [showJaylen, setShowJaylen] = useState(false);
  const [showSpark, setShowSpark] = useState(false);
  const [npcDialog, setNpcDialog] = useState<NpcDialogState | null>(null);
  const [zoneBanner, setZoneBanner] = useState<string | null>(null);
  const savedScene = characterData?.lastScene ?? characterData?.position?.scene ?? 'OpenWorldScene';
  const savedPosition = savedScene === 'WorldScene' || !characterData?.position
    ? { x: 3072, y: 2304, scene: 'OpenWorldScene' }
    : characterData.position;
  const worldBootstrap: WorldBootstrap | null = characterData
    ? {
        avatarId: characterData.avatarId ?? 'human-1',
        lastScene: savedScene === 'WorldScene' ? 'OpenWorldScene' : savedScene,
        position: savedPosition,
      }
    : null;

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
            // Show Jaylen guide on first-ever world visit
            if (!charData.hasCompletedOnboarding) {
              setShowJaylen(true);
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
      if (!sessionRef.current || !characterDataRef.current) return;
      if (data.scene !== 'OpenWorldScene') return;
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
    const handleOpenJobBoard = () => setShowJobBoard(true);
    const handleNpcDialog = (data: NpcDialogState) => setNpcDialog(data);
    // Placeholder for Phase D collectible handling
    const handleCollectibleCollected = (_data: any) => { /* Phase D: implement collectible rewards */ };

    const handleZoneChanged = (data: { zone: { displayName: string; neonAccent: string; neonDim: string } }) => {
      document.documentElement.style.setProperty('--hud-accent', data.zone.neonAccent);
      document.documentElement.style.setProperty('--hud-accent-dim', data.zone.neonDim);
      setZoneBanner(data.zone.displayName);
      setTimeout(() => setZoneBanner(null), 2800);
    };

    EventBus.on('save-player-position', handleSavePosition);
    EventBus.on('open-adventure', handleOpenAdventure);
    EventBus.on('open-shop', handleOpenShop);
    EventBus.on('open-job-board', handleOpenJobBoard);
    EventBus.on('npc-dialog', handleNpcDialog);
    EventBus.on('collectible-collected', handleCollectibleCollected);
    EventBus.on('zone-changed', handleZoneChanged);

    return () => {
      EventBus.off('save-player-position', handleSavePosition);
      EventBus.off('open-adventure', handleOpenAdventure);
      EventBus.off('open-shop', handleOpenShop);
      EventBus.off('open-job-board', handleOpenJobBoard);
      EventBus.off('npc-dialog', handleNpcDialog);
      EventBus.off('collectible-collected', handleCollectibleCollected);
      EventBus.off('zone-changed', handleZoneChanged);
    };
  }, []);

  const handleSceneReady = (_scene: string) => {
    setGameReady(true);
    // Pass avatarId to Phaser registry so Player uses the correct sprite sheet
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

  const handleStartJob = (job: any) => {
    if (job.gamePath) {
      // Launch the mini-game via AdventureEmbed (opens in new tab)
      setActiveJob(job);
      setCurrentAdventure({ adventureId: job.jobId, type: 'game' });
    }
  };

  const handleJobComplete = (currencyEarned: number, xpEarned: number, newLevel: number, leveledUp: boolean) => {
    setCoins((prev) => prev + currencyEarned);
    setXp((prev) => prev + xpEarned);
    setUserLevel(newLevel);
    showNotification(`+${xpEarned} XP  +${currencyEarned} 🪙`);
    if (leveledUp) {
      showNotification(`🎉 Level Up! You're now Level ${newLevel}! +100 🪙`);
    }
    setActiveJob(null);
  };

  // When a job mini-game completes, persist rewards via the job complete API
  const handleJobAdventureComplete = async (adventureId: string) => {
    if (activeJob && activeJob.jobId === adventureId) {
      try {
        const res = await fetch('/api/jobs/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: activeJob.jobId }),
        });
        const data = await res.json();
        if (res.ok) {
          handleJobComplete(
            data.currencyEarned,
            data.xpEarned,
            data.level?.currentLevel ?? userLevel,
            data.leveledUp ?? false,
          );
          if (data.level) {
            setXp(data.level.totalXP);
            setCoins(data.level.currency);
            setUserLevel(data.level.currentLevel);
          }
          if (data.newAchievements?.length) {
            const badgeTitle = data.newAchievements[0]?.title;
            if (badgeTitle) {
              showNotification(`Badge unlocked: ${badgeTitle}`);
            }
          }
        } else {
          showNotification(data.error ?? 'Job reward failed');
        }
      } catch (err) {
        console.error('Failed to complete job:', err);
      }
    } else {
      // Regular adventure completion
      await handleAdventureComplete(adventureId);
      return;
    }
    setCurrentAdventure(null);
  };

  // Loading screen
  if (status === 'loading' || isCheckingCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050810]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00CCFF]" />
          <p className="mt-4 text-sm text-[#00CCFF]" style={{ fontFamily: 'var(--font-pixel, monospace)' }}>
            {isCheckingCharacter ? 'LOADING...' : 'CONNECTING...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050810]">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-[#FF4DCC] mb-4">CONNECTION FAILED</h1>
          <p className="text-[#CCDDFF] mb-6">{error}</p>
          <a
            href="/catalog"
            className="inline-block px-6 py-3 bg-transparent text-[#00CCFF] rounded border border-[#00CCFF] hover:bg-[#00CCFF]/10 transition-colors"
          >
            Browse Catalog
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050810]">
      {/* Game canvas */}
      <div className="absolute inset-0">
        <PhaserGame bootstrap={worldBootstrap} onSceneReady={handleSceneReady} />
      </div>

      {/* Adventure Embed Modal */}
      {currentAdventure && (
        <AdventureEmbed
          adventureId={currentAdventure.adventureId}
          type={currentAdventure.type}
          onClose={() => { setCurrentAdventure(null); setActiveJob(null); }}
          onComplete={() => handleJobAdventureComplete(currentAdventure.adventureId)}
          rewardXP={activeJob?.xpReward ?? XP_PER_GAME}
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

      {/* Quest Board */}
      {showJobBoard && (
        <JobBoard
          onClose={() => setShowJobBoard(false)}
          onStartJob={handleStartJob}
          onJobComplete={handleJobComplete}
        />
      )}

      {/* NPC Dialog */}
      {npcDialog && (
        <WorldDialog
          dialog={npcDialog}
          onClose={() => setNpcDialog(null)}
        />
      )}

      {/* Jaylen onboarding guide — shown on first visit only */}
      {showJaylen && (
        <JaylenGuide onComplete={() => setShowJaylen(false)} />
      )}

      {/* SPARK chat panel — slides in from right */}
      {showSpark && (
        <div className="absolute right-0 top-0 bottom-0 w-80 z-40 shadow-2xl flex flex-col">
          <SparkChat onClose={() => setShowSpark(false)} />
        </div>
      )}

      {/* Zone Banner */}
      {zoneBanner && (
        <div className="zone-banner visible z-50 pointer-events-none">
          {zoneBanner}
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div
            className="px-8 py-3 rounded animate-bounce"
            style={{
              background: 'rgba(5,8,16,0.92)',
              border: '1px solid var(--hud-accent)',
              color: 'var(--hud-accent)',
              fontFamily: 'var(--font-pixel, monospace)',
              fontSize: '10px',
              boxShadow: '0 0 16px color-mix(in srgb, var(--hud-accent) 50%, transparent)',
            }}
          >
            + {notification}
          </div>
        </div>
      )}

      {/* HUD Overlay */}
      {gameReady && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top-left: Character info */}
          <div className="hud-panel absolute top-4 left-4 px-4 py-2 pointer-events-auto">
            <p className="text-[#ccddff]" style={{ fontFamily: 'var(--font-pixel, monospace)', fontSize: '8px', lineHeight: '1.6' }}>
              {characterData?.name || session?.name || 'PLAYER'}
            </p>
            <p style={{ fontFamily: 'var(--font-pixel, monospace)', fontSize: '7px', color: 'var(--hud-accent)', lineHeight: '1.6' }}>
              LVL {userLevel}
            </p>
          </div>

          {/* Top-center: XP + Coins */}
          <div id="xp-display" className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-none">
            <div className="hud-panel px-4 py-2 flex items-center gap-2">
              <span style={{ color: '#ffb300', fontSize: '14px' }}>★</span>
              <span style={{ fontFamily: 'var(--font-pixel, monospace)', fontSize: '8px', color: '#ffb300' }}>{xp} XP</span>
            </div>
            <div className="hud-panel px-4 py-2 flex items-center gap-2">
              <span style={{ color: '#ffb300', fontSize: '14px' }}>◈</span>
              <span style={{ fontFamily: 'var(--font-pixel, monospace)', fontSize: '8px', color: '#ffb300' }}>{coins}</span>
            </div>
          </div>

          {/* Top-right: Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
            <button
              onClick={() => setShowInventory(true)}
              className="hud-panel px-3 py-2 transition-all hover:brightness-125 cursor-pointer"
              style={{ fontFamily: 'var(--font-pixel, monospace)', fontSize: '7px' }}
              title="Open Inventory"
            >
              BAG
            </button>
            <button
              onClick={() => setShowShop(true)}
              className="hud-panel px-3 py-2 transition-all hover:brightness-125 cursor-pointer"
              style={{ fontFamily: 'var(--font-pixel, monospace)', fontSize: '7px' }}
              title="Open Shop"
            >
              SHOP
            </button>
            <button
              onClick={() => setShowJobBoard(true)}
              className="hud-panel px-3 py-2 transition-all hover:brightness-125 cursor-pointer"
              style={{ fontFamily: 'var(--font-pixel, monospace)', fontSize: '7px' }}
              title="Open Quest Board"
            >
              QUESTS
            </button>
            <button
              onClick={() => router.push('/')}
              className="hud-panel px-4 py-2 transition-all hover:brightness-125 cursor-pointer"
              style={{ fontFamily: 'var(--font-pixel, monospace)', fontSize: '7px' }}
            >
              EXIT
            </button>
          </div>

          {/* Bottom-right: SPARK button + Controls hint */}
          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
            <button
              id="spark-button"
              onClick={() => setShowSpark((prev) => !prev)}
              className="pointer-events-auto px-4 py-2 rounded transition-all hover:brightness-125 cursor-pointer"
              style={{
                background: 'rgba(5,8,16,0.92)',
                border: '1px solid #ffb300',
                color: '#ffb300',
                fontFamily: 'var(--font-pixel, monospace)',
                fontSize: '8px',
                boxShadow: '0 0 12px rgba(255,179,0,0.3)',
              }}
              title="Chat with SPARK"
            >
              ⚡ SPARK
            </button>
            <div id="controls-hint" className="hud-panel px-4 py-2 pointer-events-none">
              <p style={{ fontFamily: 'var(--font-pixel, monospace)', fontSize: '6px', color: '#ccddff', lineHeight: '1.8' }}>
                WASD / ARROWS TO MOVE
              </p>
            </div>
          </div>

          {/* Bottom-left: Minimap */}
          <Minimap />
        </div>
      )}
    </div>
  );
}
