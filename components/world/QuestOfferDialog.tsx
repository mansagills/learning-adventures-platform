'use client';

import { X, Star } from 'lucide-react';

interface QuestOffer {
  npcName: string;
  questId: string;
  questTitle: string;
  questDescription: string;
  xpReward: number;
  coinReward: number;
  status: 'available' | 'active';
}

interface QuestOfferDialogProps {
  offer: QuestOffer;
  onAccept: (questId: string) => void;
  onClose: () => void;
}

export function QuestOfferDialog({ offer, onAccept, onClose }: QuestOfferDialogProps) {
  const isActive = offer.status === 'active';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-full max-w-sm mx-4 bg-[#1A1A2E] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* NPC header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-[#8B5CF6]/20 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-xl flex-shrink-0">
            🧑‍🏫
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold truncate">{offer.npcName}</p>
            <p className="text-white/50 text-xs">Quest Giver</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quest content */}
        <div className="px-5 py-4 space-y-4">
          {isActive ? (
            <p className="text-white/70 text-sm italic">
              "{offer.npcName} checks in on your progress..."
            </p>
          ) : (
            <p className="text-white/70 text-sm italic">
              "I have a quest for you, adventurer. Are you up for the challenge?"
            </p>
          )}

          <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <p className="text-white font-bold">{offer.questTitle}</p>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{offer.questDescription}</p>
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-3">
            <p className="text-white/50 text-xs uppercase tracking-wide font-semibold">Rewards</p>
            <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-1">
              <Star size={12} className="text-yellow-400" />
              <span className="text-yellow-300 text-sm font-bold">{offer.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-200/10 border border-yellow-200/20 rounded-lg px-3 py-1">
              <span className="text-sm">🪙</span>
              <span className="text-yellow-200 text-sm font-bold">{offer.coinReward}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          {isActive ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
              >
                Keep Going!
              </button>
              <button
                onClick={() => onAccept(offer.questId)}
                className="flex-1 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold transition-colors"
              >
                View Quest Log
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={() => onAccept(offer.questId)}
                className="flex-1 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold transition-colors"
              >
                Accept Quest!
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
