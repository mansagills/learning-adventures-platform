'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { EventBus } from '@/components/phaser/EventBus';
import { AdventureEmbed } from '@/components/world/AdventureEmbed';
import {
  ConversationPanel,
  type NpcConversationState,
} from '@/components/world/ConversationPanel';
import { ActivityFeed } from '@/components/world/ActivityFeed';
import { QuestTracker } from '@/components/world/QuestTracker';
import { ExplorationTracker } from '@/components/world/ExplorationTracker';
import { DemoShop, DemoXpChip } from '@/components/world/DemoShop';
import Minimap from '@/components/world/Minimap';
import { demoEconomy } from '@/game/world/demoEconomy';

const PhaserGame = dynamic(
  () => import('@/components/phaser/PhaserGame').then((mod) => mod.PhaserGame),
  { ssr: false }
);

/**
 * /dev/campus-sandbox — DEVELOPMENT-ONLY test harness for the Gather-style
 * campus scene. Mounts the Phaser game without auth/character requirements so
 * the walk-up-and-talk and station mechanics can be tested in isolation
 * (see the Test Games workflow in CLAUDE.md: registered ≠ cataloged).
 *
 * Renders nothing in production builds.
 */
export default function CampusSandboxPage() {
  const [conversation, setConversation] = useState<NpcConversationState | null>(null);
  const [currentAdventure, setCurrentAdventure] = useState<{
    adventureId: string;
    type: 'game' | 'lesson';
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);

  useEffect(() => {
    const handleConversation = (data: NpcConversationState) => {
      setConversation(data);
      (window as any).__campusTest.conversation = data;
    };
    const handleConversationEnd = () => {
      setConversation(null);
      (window as any).__campusTest.conversation = null;
    };
    const handleOpenAdventure = (data: { adventureId: string; type: 'game' | 'lesson' }) => {
      setCurrentAdventure(data);
      (window as any).__campusTest.adventure = data;
    };
    const handleOpenShop = () => {
      (window as any).__campusTest.shopOpened = true;
      setShowShop(true);
    };
    const handleQuestCompleted = (data: { xp: number }) => {
      demoEconomy.addXP(data.xp, 'Racing License quest');
    };
    const handleOpenJobBoard = () => {
      (window as any).__campusTest.questBoardOpened = true;
      setNotice('📋 Quest Board would open here (requires login)');
      setTimeout(() => setNotice(null), 3000);
    };
    const handlePosition = (data: { x: number; y: number }) => {
      (window as any).__campusTest.position = data;
    };
    const handleQuestUpdate = (snapshot: unknown) => {
      (window as any).__campusTest.quest = snapshot;
    };
    const handleExplorationUpdate = (snapshot: unknown) => {
      (window as any).__campusTest.exploration = snapshot;
    };

    // Deterministic test hooks for automated browser testing
    (window as any).__campusTest = {
      conversation: null,
      adventure: null,
      position: null,
      quest: null,
      exploration: null,
      shopOpened: false,
      questBoardOpened: false,
      move: (x: number, y: number) => EventBus.emit('touch-move', { x, y }),
      teleport: (x: number, y: number) => EventBus.emit('teleport-player', { x, y }),
      // Simulate a finished game (e.g. quest score gate) without playing it
      completeAdventure: (adventureId: string, score?: number) =>
        EventBus.emit('adventure-completed', { adventureId, score }),
      getEconomy: () => demoEconomy.snapshot(),
      buyItem: (itemId: string) => demoEconomy.purchase(itemId),
      openShop: () => setShowShop(true),
    };

    EventBus.on('npc-conversation', handleConversation);
    EventBus.on('npc-conversation-end', handleConversationEnd);
    EventBus.on('open-adventure', handleOpenAdventure);
    EventBus.on('open-shop', handleOpenShop);
    EventBus.on('open-job-board', handleOpenJobBoard);
    EventBus.on('minimap-position', handlePosition);
    EventBus.on('quest-updated', handleQuestUpdate);
    EventBus.on('exploration-updated', handleExplorationUpdate);
    EventBus.on('quest-completed', handleQuestCompleted);

    return () => {
      EventBus.off('npc-conversation', handleConversation);
      EventBus.off('npc-conversation-end', handleConversationEnd);
      EventBus.off('open-adventure', handleOpenAdventure);
      EventBus.off('open-shop', handleOpenShop);
      EventBus.off('open-job-board', handleOpenJobBoard);
      EventBus.off('minimap-position', handlePosition);
      EventBus.off('quest-updated', handleQuestUpdate);
      EventBus.off('exploration-updated', handleExplorationUpdate);
      EventBus.off('quest-completed', handleQuestCompleted);
      delete (window as any).__campusTest;
    };
  }, []);

  // Freeze player movement while a modal (game embed / shop) is open
  useEffect(() => {
    EventBus.emit('world-pause', Boolean(currentAdventure || showShop));
  }, [currentAdventure, showShop]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#FFFDF5]">
      <div className="absolute inset-0">
        <PhaserGame variant="gather" />
      </div>

      {currentAdventure && (
        <AdventureEmbed
          adventureId={currentAdventure.adventureId}
          type={currentAdventure.type}
          onClose={() => setCurrentAdventure(null)}
          onComplete={(score) => {
            EventBus.emit('adventure-completed', {
              adventureId: currentAdventure.adventureId,
              score,
            });
            setCurrentAdventure(null);
          }}
        />
      )}

      {conversation && <ConversationPanel conversation={conversation} />}

      {/* Ambient campus activity ticker (same as /world/campus) */}
      <ActivityFeed />

      {/* Demo quest objective HUD (same as /world/campus) */}
      <QuestTracker />

      {/* Demo economy: XP chip + campus shop (sandbox-local, no backend) */}
      <DemoXpChip />
      {showShop && <DemoShop onClose={() => setShowShop(false)} />}

      {/* Zone minimap with player + quest-target dots (same as /world/campus) */}
      <Minimap />

      {/* Buildings-visited checklist (same as /world/campus) */}
      <ExplorationTracker />

      {notice && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2 rounded-xl shadow-xl">
            {notice}
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg pointer-events-none">
        DEV SANDBOX — Gather Campus (no auth)
      </div>
    </div>
  );
}
