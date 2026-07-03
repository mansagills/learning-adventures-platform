'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EventBus } from '@/components/phaser/EventBus';
import { AdventureEmbed } from '@/components/world/AdventureEmbed';
import { CampusQuestHud } from '@/components/world/CampusQuestHud';
import {
  ConversationPanel,
  type NpcConversationState,
} from '@/components/world/ConversationPanel';
import {
  advanceCampusGuidedQuest,
  getCampusGuidedQuestStage,
  type CampusGuidedQuestEvent,
  type CampusGuidedQuestStageId,
} from '@/game/world/campusGuidedQuest';

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
  const [questStage, setQuestStage] =
    useState<CampusGuidedQuestStageId>('find-professor-numbers');
  const questStageRef = useRef<CampusGuidedQuestStageId>('find-professor-numbers');

  useEffect(() => {
    questStageRef.current = questStage;
  }, [questStage]);

  useEffect(() => {
    const advanceQuest = (event: CampusGuidedQuestEvent) => {
      setQuestStage((current) => {
        const next = advanceCampusGuidedQuest(current, event);
        questStageRef.current = next;
        (window as any).__campusTest.questStage = next;
        return next;
      });
    };

    const handleConversation = (data: NpcConversationState) => {
      setConversation(data);
      (window as any).__campusTest.conversation = data;
      advanceQuest({ type: 'talked-to-npc', npcId: data.npcId });
    };
    const handleConversationEnd = () => {
      setConversation(null);
      (window as any).__campusTest.conversation = null;
    };
    const handleOpenAdventure = (data: { adventureId: string; type: 'game' | 'lesson' }) => {
      setCurrentAdventure(data);
      (window as any).__campusTest.adventure = data;
      advanceQuest({ type: 'opened-adventure', adventureId: data.adventureId });
    };
    const handleOpenShop = () => {
      (window as any).__campusTest.shopOpened = true;
      setNotice('🛒 Shop would open here (requires login)');
      setTimeout(() => setNotice(null), 3000);
    };
    const handleOpenJobBoard = () => {
      (window as any).__campusTest.questBoardOpened = true;
      setNotice('📋 Quest Board would open here (requires login)');
      setTimeout(() => setNotice(null), 3000);
    };
    const handlePosition = (data: { x: number; y: number }) => {
      (window as any).__campusTest.position = data;
    };
    const handleZoneChanged = (data: { zone: { key: string; neonAccent: string; neonDim: string } }) => {
      document.documentElement.style.setProperty('--hud-accent', data.zone.neonAccent);
      document.documentElement.style.setProperty('--hud-accent-dim', data.zone.neonDim);
      advanceQuest({ type: 'entered-zone', zoneKey: data.zone.key });
    };
    const handleAdventureCompleted = (data: { adventureId?: string }) => {
      if (data.adventureId) {
        advanceQuest({ type: 'completed-adventure', adventureId: data.adventureId });
      }
    };

    // Deterministic test hooks for automated browser testing
    (window as any).__campusTest = {
      conversation: null,
      adventure: null,
      questStage: questStageRef.current,
      position: null,
      shopOpened: false,
      questBoardOpened: false,
      move: (x: number, y: number) => EventBus.emit('touch-move', { x, y }),
      teleport: (x: number, y: number) => EventBus.emit('teleport-player', { x, y }),
    };

    EventBus.on('npc-conversation', handleConversation);
    EventBus.on('npc-conversation-end', handleConversationEnd);
    EventBus.on('open-adventure', handleOpenAdventure);
    EventBus.on('open-shop', handleOpenShop);
    EventBus.on('open-job-board', handleOpenJobBoard);
    EventBus.on('minimap-position', handlePosition);
    EventBus.on('zone-changed', handleZoneChanged);
    EventBus.on('adventure-completed', handleAdventureCompleted);

    return () => {
      EventBus.off('npc-conversation', handleConversation);
      EventBus.off('npc-conversation-end', handleConversationEnd);
      EventBus.off('open-adventure', handleOpenAdventure);
      EventBus.off('open-shop', handleOpenShop);
      EventBus.off('open-job-board', handleOpenJobBoard);
      EventBus.off('minimap-position', handlePosition);
      EventBus.off('zone-changed', handleZoneChanged);
      EventBus.off('adventure-completed', handleAdventureCompleted);
      delete (window as any).__campusTest;
    };
  }, []);

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
          onComplete={() => {
            EventBus.emit('adventure-completed', {
              adventureId: currentAdventure.adventureId,
            });
            setCurrentAdventure(null);
          }}
        />
      )}

      {conversation && <ConversationPanel conversation={conversation} />}
      <CampusQuestHud stage={getCampusGuidedQuestStage(questStage)} />

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
