'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { EventBus } from '@/components/phaser/EventBus';
import { AdventureEmbed } from '@/components/world/AdventureEmbed';
import {
  ConversationPanel,
  type NpcConversationState,
} from '@/components/world/ConversationPanel';

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
      setNotice('🛒 Shop would open here (requires login)');
      setTimeout(() => setNotice(null), 3000);
    };
    const handlePosition = (data: { x: number; y: number }) => {
      (window as any).__campusTest.position = data;
    };

    // Deterministic test hooks for automated browser testing
    (window as any).__campusTest = {
      conversation: null,
      adventure: null,
      position: null,
      shopOpened: false,
      move: (x: number, y: number) => EventBus.emit('touch-move', { x, y }),
    };

    EventBus.on('npc-conversation', handleConversation);
    EventBus.on('npc-conversation-end', handleConversationEnd);
    EventBus.on('open-adventure', handleOpenAdventure);
    EventBus.on('open-shop', handleOpenShop);
    EventBus.on('minimap-position', handlePosition);

    return () => {
      EventBus.off('npc-conversation', handleConversation);
      EventBus.off('npc-conversation-end', handleConversationEnd);
      EventBus.off('open-adventure', handleOpenAdventure);
      EventBus.off('open-shop', handleOpenShop);
      EventBus.off('minimap-position', handlePosition);
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
          onComplete={() => setCurrentAdventure(null)}
        />
      )}

      {conversation && <ConversationPanel conversation={conversation} />}

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
