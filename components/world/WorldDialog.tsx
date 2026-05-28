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
      <div className="bg-white border-2 border-[#8B5CF6] rounded-2xl shadow-2xl p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-bold text-[#8B5CF6]">{dialog.speaker}</p>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-gray-800 text-sm leading-relaxed">{dialog.text}</p>
        <p className="text-xs text-gray-400 mt-3">
          {dialog.hasMore ? 'Press SPACE again for more' : 'Walk away or close when done'}
        </p>
      </div>
    </div>
  );
}
