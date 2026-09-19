'use client';

import { cardFor } from '@/game/world/characterCards';

/**
 * ConversationPanel — the pop-up character card shown while the player is
 * standing next to an NPC.
 *
 * This used to be a flat text box: name, line, dot progress. A player meeting
 * Professor Numbers for the first time had no idea who she was or why she
 * mattered. The card now leads with a portrait, a role and a location, so a
 * character introduces themselves the moment you walk up — the dialogue is
 * still the point, the card is the frame around it.
 *
 * The portrait is cropped straight out of the character's existing walk
 * sprite sheet (384×384, 4×4 grid of 96×96 frames). Frame 8 — row 2, column 0
 * — is the first walk-DOWN frame, i.e. the character facing the camera, which
 * is the only frame that reads as a portrait.
 */

export interface NpcConversationState {
  npcId: string;
  npcName: string;
  /** Character sheet id — portrait comes from /game-assets/sprites/<charKey>.png */
  charKey?: string;
  text: string;
  lineIndex: number;
  total: number;
  hasMore: boolean;
}

interface ConversationPanelProps {
  conversation: NpcConversationState;
}

/** Portrait size on screen. The sheet is 4 frames wide, so scale by 4. */
const PORTRAIT = 72;

export function ConversationPanel({ conversation }: ConversationPanelProps) {
  const card = cardFor(conversation.npcId);
  const sheet = conversation.charKey
    ? `/game-assets/sprites/${conversation.charKey}.png`
    : null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[min(94vw,34rem)] pointer-events-none">
      <div
        className="rounded-2xl shadow-2xl border-2 bg-[#111827]/95 backdrop-blur-sm text-white overflow-hidden"
        style={{ borderColor: card.accent }}
      >
        {/* Header: portrait + identity, tinted with the character's accent */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ backgroundColor: `${card.accent}1f` }}
        >
          {sheet && (
            <div
              aria-hidden="true"
              className="shrink-0 rounded-xl border-2 bg-[#0b1220]"
              style={{
                width: PORTRAIT,
                height: PORTRAIT,
                borderColor: card.accent,
                backgroundImage: `url(${sheet})`,
                // 4×4 sheet: show one frame by scaling the sheet up 4× and
                // shifting to row 2, column 0 (the facing-camera frame).
                backgroundSize: `${PORTRAIT * 4}px ${PORTRAIT * 4}px`,
                backgroundPosition: `0px -${PORTRAIT * 2}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
              }}
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-base font-bold leading-tight truncate">
              {conversation.npcName}
            </p>
            <p
              className="text-xs font-semibold leading-tight truncate"
              style={{ color: card.accent }}
            >
              {card.badge} {card.title}
            </p>
            <p className="text-[11px] text-white/55 leading-tight truncate">
              📍 {card.location}
            </p>
          </div>

          {/* Progress through this conversation */}
          <div className="flex shrink-0 gap-1 self-start pt-1">
            {Array.from({ length: conversation.total }).map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    i <= conversation.lineIndex ? card.accent : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Who they are — only while the first line is on screen, so it
            introduces them once and then gets out of the way. */}
        {conversation.lineIndex === 0 && (
          <p className="px-4 pt-3 text-xs italic leading-relaxed text-white/65">
            {card.blurb}
          </p>
        )}

        {/* The line they are actually saying */}
        <p className="px-4 pt-3 text-sm leading-relaxed">{conversation.text}</p>

        <p className="px-4 pb-3 pt-2 text-xs text-white/45">
          {conversation.hasMore
            ? 'SPACE to continue · walk away to leave'
            : 'SPACE to finish · walk away to leave'}
        </p>
      </div>
    </div>
  );
}
