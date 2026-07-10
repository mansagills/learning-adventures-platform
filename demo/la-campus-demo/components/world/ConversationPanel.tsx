'use client';

/**
 * ConversationPanel — Gather-style chat card shown while the player is
 * standing next to an NPC. Mirrors the in-canvas speech bubble so dialogue
 * is readable on small screens, and shows progress through the conversation.
 */

export interface NpcConversationState {
  npcId: string;
  npcName: string;
  text: string;
  lineIndex: number;
  total: number;
  hasMore: boolean;
}

interface ConversationPanelProps {
  conversation: NpcConversationState;
}

export function ConversationPanel({ conversation }: ConversationPanelProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,30rem)] pointer-events-none">
      <div className="bg-[#1f2937]/95 border-2 border-[#4ade80] rounded-2xl shadow-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold text-[#4ade80]">{conversation.npcName}</p>
          <div className="flex gap-1">
            {Array.from({ length: conversation.total }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= conversation.lineIndex ? 'bg-[#4ade80]' : 'bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm leading-relaxed">{conversation.text}</p>
        <p className="text-xs text-white/50 mt-2">
          {conversation.hasMore
            ? 'SPACE to continue · walk away to leave'
            : 'SPACE to finish · walk away to leave'}
        </p>
      </div>
    </div>
  );
}
