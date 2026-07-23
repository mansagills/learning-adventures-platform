import { QuestLog } from '@/components/world/QuestLog';
import { QuestOfferDialog } from '@/components/world/QuestOfferDialog';
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
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [questOffer, setQuestOffer] = useState<{
    npcName: string;
    questId: string;
    questTitle: string;
    questDescription: string;
    xpReward: number;
    coinReward: number;
    status: 'available' | 'active';
  } | null>(null);
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

  // Quest marker data — computed from the active quest list and emitted to Phaser
  const questMarkerDataRef = useRef<{ buildingId: string; status: 'available' | 'in_progress' | 'completed' | 'none' }[]>([]);
  const questMarkerAbortRef = useRef<AbortController | null>(null);

  const fetchAndEmitQuestMarkers = () => {
    // Cancel any in-flight fetch before starting a new one
    questMarkerAbortRef.current?.abort();
    const controller = new AbortController();
    questMarkerAbortRef.current = controller;

    fetch('/api/quests/active', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.quests)) return;

        const buildingMap = new Map<string, { available: number; inProgress: number; completed: number }>();
        for (const q of data.quests) {
          const entry = buildingMap.get(q.buildingId) ?? { available: 0, inProgress: 0, completed: 0 };
          if (q.status === 'completed') entry.completed++;
          else if (q.status === 'active') entry.inProgress++;
          else if (q.status === 'available') entry.available++;
          buildingMap.set(q.buildingId, entry);
        }

        const markerData = Array.from(buildingMap.entries()).map(([buildingId, counts]) => ({
          buildingId,
          status: (counts.inProgress > 0 ? 'in_progress'
            : counts.available > 0 ? 'available'
            : counts.completed > 0 ? 'completed'
            : 'none') as 'available' | 'in_progress' | 'completed' | 'none',
        }));

        questMarkerDataRef.current = markerData;
        EventBus.emit('quest-status-update', markerData);
      })
      .catch((err) => {
        // AbortError is expected when a newer fetch cancels this one
        if (err?.name !== 'AbortError') console.error('Quest marker fetch failed:', err);
      });
  };

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
            // Pre-fetch quest markers so they're ready when Phaser scene fires
            fetchAndEmitQuestMarkers();
          }
        } catch (err) {
          console.error('Error fetching character:', err);
          setError('Failed to load character data');
          setIsCheckingCharacter(false);
        }
      }
    };

    checkCharacter();
    return () => { questMarkerAbortRef.current?.abort(); };
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
    const handleQuestOffer = (data: typeof questOffer) => setQuestOffer(data);
    const handleCollectibleCollected = async (data: { id: string; xp: number; coins: number }) => {
      setXp((prev) => prev + data.xp);
      setCoins((prev) => prev + data.coins);
      showNotification(`+${data.xp} XP  +${data.coins} coins`);

      try {
        const res = await fetch('/api/world/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xp: data.xp, coins: data.coins }),
        });
        const reward = await res.json();
        if (res.ok && reward.level) {
          setXp(reward.level.totalXP);
          setCoins(reward.level.currency);
          setUserLevel(reward.level.currentLevel);
        }
      } catch (err) {
        console.error('Failed to save collectible reward:', err);
      }
    };
    const handleNpcDialog = (data: NpcDialogState) => setNpcDialog(data);

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
    EventBus.on('quest-offer', handleQuestOffer);
    EventBus.on('npc-dialog', handleNpcDialog);
    EventBus.on('collectible-collected', handleCollectibleCollected);
    EventBus.on('zone-changed', handleZoneChanged);

    return () => {
      EventBus.off('save-player-position', handleSavePosition);
      EventBus.off('open-adventure', handleOpenAdventure);
      EventBus.off('open-shop', handleOpenShop);
      EventBus.off('open-job-board', handleOpenJobBoard);
      EventBus.off('quest-offer', handleQuestOffer);
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
    // Emit cached quest markers or fetch fresh ones
    if (questMarkerDataRef.current.length > 0) {
      EventBus.emit('quest-status-update', questMarkerDataRef.current);
    } else {
      fetchAndEmitQuestMarkers();
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

    // Refresh quest markers — completing a game may unlock new quests
    fetchAndEmitQuestMarkers();
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

      {/* Quest Log */}
      {showQuestLog && (
        <QuestLog onClose={() => setShowQuestLog(false)} />
      )}

      {/* Quest Offer Dialog — shown when player talks to a quest-giver NPC */}
      {questOffer && (
        <QuestOfferDialog
          offer={questOffer}
          onAccept={() => {
            setQuestOffer(null);
            setShowQuestLog(true);
          }}
          onClose={() => setQuestOffer(null)}
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

      {/* SPARK chat panel — fixed floating panel, bottom-right */}
      {showSpark && (
        <div className="fixed bottom-16 right-4 w-80 max-w-[85vw] h-[420px] z-50 shadow-2xl flex flex-col rounded-2xl overflow-hidden pointer-events-auto">
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
              onClick={() => router.push('/world/campus')}
              className="bg-black/70 hover:bg-[#4ade80]/80 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              title="Try the Gather-style campus"
            >
              🏫 Campus
            </button>
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
              onClick={() => setShowQuestLog(true)}
              className="bg-black/70 hover:bg-[#8B5CF6]/80 text-white px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
              title="Open Quest Log"
            >
              📋 Quests
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
