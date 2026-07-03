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
  MATH_RACE_RALLY_ID,
  advanceCampusGuidedQuest,
  getCampusGuidedQuestStageView,
  isPassingMathRaceScore,
  type CampusGuidedQuestEvent,
  type CampusGuidedQuestStageId,
} from '@/game/world/campusGuidedQuest';

const PhaserGame = dynamic(
  () => import('@/components/phaser/PhaserGame').then((mod) => mod.PhaserGame),
  { ssr: false },
);

/**
 * /dev/campus-sandbox is a development-only test harness for the Gather-style
 * campus scene. It mounts Phaser without auth/character requirements so the
 * walk-up quest loop can be tested in isolation.
 */
export default function CampusSandboxPage() {
  const [conversation, setConversation] = useState<NpcConversationState | null>(null);
  const [currentAdventure, setCurrentAdventure] = useState<{
    adventureId: string;
    type: 'game' | 'lesson';
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [questStage, setQuestStage] =
    useState<CampusGuidedQuestStageId>('get-quest-from-mrs-numbers');
  const [collectedItemIds, setCollectedItemIds] = useState<string[]>([]);
  const [lastMathRaceScore, setLastMathRaceScore] = useState<number | undefined>();
  const questStageRef = useRef<CampusGuidedQuestStageId>('get-quest-from-mrs-numbers');
  const collectedItemIdsRef = useRef<string[]>([]);

  useEffect(() => {
    questStageRef.current = questStage;
  }, [questStage]);

  useEffect(() => {
    collectedItemIdsRef.current = collectedItemIds;
  }, [collectedItemIds]);

  useEffect(() => {
    const showQuestNotice = (message: string) => {
      setNotice(message);
      setTimeout(() => setNotice(null), 3000);
    };

    const advanceQuest = (event: CampusGuidedQuestEvent) => {
      setQuestStage((current) => {
        const next = advanceCampusGuidedQuest(current, event);
        questStageRef.current = next;
        (window as any).__campusTest.questStage = next;
        if (next === 'start-math-race-rally') {
          EventBus.emit('campus-quest-math-race-unlocked');
          showQuestNotice('Math Race Rally unlocked. Score 80% or better to finish.');
        }
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
      showQuestNotice('Shop would open here (requires login).');
    };
    const handleOpenJobBoard = () => {
      (window as any).__campusTest.questBoardOpened = true;
      showQuestNotice('Quest Board would open here (requires login).');
    };
    const handlePosition = (data: { x: number; y: number }) => {
      (window as any).__campusTest.position = data;
    };
    const handleZoneChanged = (data: { zone: { key: string; neonAccent: string; neonDim: string } }) => {
      document.documentElement.style.setProperty('--hud-accent', data.zone.neonAccent);
      document.documentElement.style.setProperty('--hud-accent-dim', data.zone.neonDim);
      advanceQuest({ type: 'entered-zone', zoneKey: data.zone.key });
    };
    const handleQuestItemCollected = (data: { itemId: string; collectedItemIds: string[] }) => {
      setCollectedItemIds(data.collectedItemIds);
      collectedItemIdsRef.current = data.collectedItemIds;
      (window as any).__campusTest.collectedItemIds = data.collectedItemIds;
      advanceQuest({ type: 'collected-quest-item', ...data });
    };
    const handleQuestNotice = (data: { message: string }) => {
      showQuestNotice(data.message);
    };
    const handleAdventureCompleted = (data: { adventureId?: string; score?: number }) => {
      if (!data.adventureId) return;
      if (data.adventureId === MATH_RACE_RALLY_ID) {
        setLastMathRaceScore(data.score);
        (window as any).__campusTest.lastMathRaceScore = data.score;
        if (!isPassingMathRaceScore(data.score)) {
          showQuestNotice(`Score ${data.score ?? 0}%. Try again for 80% or better.`);
        }
      }
      advanceQuest({
        type: 'completed-adventure',
        adventureId: data.adventureId,
        score: data.score,
      });
    };

    (window as any).__campusTest = {
      conversation: null,
      adventure: null,
      questStage: questStageRef.current,
      collectedItemIds: collectedItemIdsRef.current,
      lastMathRaceScore: undefined,
      position: null,
      shopOpened: false,
      questBoardOpened: false,
      move: (x: number, y: number) => EventBus.emit('touch-move', { x, y }),
      teleport: (x: number, y: number) => EventBus.emit('teleport-player', { x, y }),
      collectItem: (itemId: string, collectedItemIds = [itemId]) =>
        EventBus.emit('campus-quest-item-collected', { itemId, collectedItemIds }),
      unlockMathRace: () => EventBus.emit('campus-quest-math-race-unlocked'),
      completeMathRace: (score = 100) =>
        EventBus.emit('adventure-completed', {
          adventureId: MATH_RACE_RALLY_ID,
          score,
        }),
    };

    EventBus.on('npc-conversation', handleConversation);
    EventBus.on('npc-conversation-end', handleConversationEnd);
    EventBus.on('open-adventure', handleOpenAdventure);
    EventBus.on('open-shop', handleOpenShop);
    EventBus.on('open-job-board', handleOpenJobBoard);
    EventBus.on('minimap-position', handlePosition);
    EventBus.on('zone-changed', handleZoneChanged);
    EventBus.on('campus-quest-item-collected', handleQuestItemCollected);
    EventBus.on('campus-quest-notice', handleQuestNotice);
    EventBus.on('adventure-completed', handleAdventureCompleted);

    return () => {
      EventBus.off('npc-conversation', handleConversation);
      EventBus.off('npc-conversation-end', handleConversationEnd);
      EventBus.off('open-adventure', handleOpenAdventure);
      EventBus.off('open-shop', handleOpenShop);
      EventBus.off('open-job-board', handleOpenJobBoard);
      EventBus.off('minimap-position', handlePosition);
      EventBus.off('zone-changed', handleZoneChanged);
      EventBus.off('campus-quest-item-collected', handleQuestItemCollected);
      EventBus.off('campus-quest-notice', handleQuestNotice);
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
          manualCompleteScore={
            currentAdventure.adventureId === MATH_RACE_RALLY_ID ? 100 : undefined
          }
          isCompletionAccepted={(score) =>
            currentAdventure.adventureId !== MATH_RACE_RALLY_ID ||
            isPassingMathRaceScore(score)
          }
          onComplete={(score) => {
            EventBus.emit('adventure-completed', {
              adventureId: currentAdventure.adventureId,
              score,
            });
            if (currentAdventure.adventureId !== MATH_RACE_RALLY_ID || isPassingMathRaceScore(score)) {
              setCurrentAdventure(null);
            }
          }}
        />
      )}

      {conversation && <ConversationPanel conversation={conversation} />}
      <CampusQuestHud
        stage={getCampusGuidedQuestStageView(
          questStage,
          collectedItemIds,
          lastMathRaceScore,
        )}
      />

      {notice && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-yellow-400 text-yellow-900 font-bold px-6 py-2 rounded-xl shadow-xl">
            {notice}
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg pointer-events-none">
        DEV SANDBOX - Gather Campus (no auth)
      </div>
    </div>
  );
}
