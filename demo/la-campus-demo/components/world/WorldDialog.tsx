'use client';

import { X } from 'lucide-react';

export interface NpcDialogState {
  npcName: string;
  text: string;
  speaker: string;
  hasMore: boolean;
}

interface WorldDialogProps {
  dialog: NpcDialogState;
  onClose: () => void;
}

export function WorldDialog({ dialog, onClose }: WorldDialogProps) {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,28rem)] pointer-events-auto">
      <div
        className="relative p-4 rounded"
        style={{
          background: 'rgba(5,8,16,0.95)',
          border: '2px solid var(--hud-accent, #00ccff)',
          boxShadow: '0 0 20px color-mix(in srgb, var(--hud-accent, #00ccff) 30%, transparent)',
        }}
      >
        {/* Name chip */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            style={{
              fontFamily: 'var(--font-pixel, monospace)',
              fontSize: '8px',
              color: '#050810',
              background: 'var(--hud-accent, #00ccff)',
              padding: '3px 8px',
              borderRadius: '2px',
              letterSpacing: '1px',
            }}
          >
            {dialog.speaker}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded transition-all hover:brightness-125"
            style={{ border: '1px solid rgba(204,221,255,0.3)', color: '#ccddff' }}
            aria-label="Close dialog"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Dialog text */}
        <p
          style={{
            fontFamily: 'var(--font-pixel, monospace)',
            fontSize: '8px',
            color: '#ccddff',
            lineHeight: '1.8',
          }}
        >
          {dialog.text}
        </p>

        {/* Advance cue */}
        <p
          style={{
            fontFamily: 'var(--font-pixel, monospace)',
            fontSize: '6px',
            color: 'var(--hud-accent, #00ccff)',
            marginTop: '10px',
            opacity: 0.8,
          }}
        >
          {dialog.hasMore ? 'SPACE — next ▼' : 'SPACE / walk away to close'}
        </p>

        {/* Scanline overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
            pointerEvents: 'none',
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );
}
