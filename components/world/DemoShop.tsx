'use client';

import { useEffect, useState } from 'react';
import { EventBus } from '@/components/phaser/EventBus';
import {
  demoEconomy,
  DEMO_SHOP_ITEMS,
  type DemoEconomySnapshot,
} from '@/game/world/demoEconomy';

/**
 * Demo-sandbox economy UI (no auth/backend):
 * - DemoXpChip: XP balance in the HUD, with a "+100 XP" toast on awards
 * - DemoShop: campus-shop modal where quest XP buys cosmetic items
 * State lives in game/world/demoEconomy.ts (localStorage-backed).
 */

const hudPanel: React.CSSProperties = {
  background: 'rgba(5,8,16,0.82)',
  border: '1px solid var(--hud-accent, #00ccff)',
  borderRadius: '8px',
  boxShadow: '0 0 12px color-mix(in srgb, var(--hud-accent, #00ccff) 30%, transparent)',
};

export function DemoXpChip() {
  const [snapshot, setSnapshot] = useState<DemoEconomySnapshot | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (data: DemoEconomySnapshot) => {
      setSnapshot(data);
      if (data.gained) {
        setToast(`+${data.gained.amount} XP — ${data.gained.reason}`);
        setTimeout(() => setToast(null), 3500);
      }
    };
    EventBus.on('demo-economy-updated', handleUpdate);
    demoEconomy.announce();
    return () => {
      EventBus.off('demo-economy-updated', handleUpdate);
    };
  }, []);

  if (!snapshot) return null;

  return (
    <>
      <div
        className="absolute top-4 right-4 px-4 py-2 flex items-center gap-2 pointer-events-none"
        style={hudPanel}
      >
        <span className="text-yellow-400 text-lg" aria-hidden>⭐</span>
        <span className="text-white font-bold">{snapshot.xp} XP</span>
      </div>
      {toast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-yellow-400 text-yellow-900 font-extrabold text-xl px-8 py-3 rounded-2xl shadow-2xl animate-bounce">
            ⭐ {toast}
          </div>
        </div>
      )}
    </>
  );
}

interface DemoShopProps {
  onClose: () => void;
}

export function DemoShop({ onClose }: DemoShopProps) {
  const [snapshot, setSnapshot] = useState<DemoEconomySnapshot>(() => demoEconomy.snapshot());

  useEffect(() => {
    const handleUpdate = (data: DemoEconomySnapshot) => setSnapshot(data);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    EventBus.on('demo-economy-updated', handleUpdate);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      EventBus.off('demo-economy-updated', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const owned = new Set(snapshot.owned);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-[92vw] max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#0d1320', border: '2px solid var(--hud-accent, #00ccff)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-extrabold text-lg">🏪 Campus Shop</h2>
            <p className="text-white/60 text-xs">Spend the XP you earn from quests and games</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-bold">⭐ {snapshot.xp} XP</span>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xl px-2"
              aria-label="Close shop"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Items */}
        <ul className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {DEMO_SHOP_ITEMS.map((item) => {
            const isOwned = owned.has(item.id);
            const affordable = snapshot.xp >= item.cost;
            return (
              <li
                key={item.id}
                className="flex items-center gap-4 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-3xl" aria-hidden>{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{item.name}</p>
                  <p className="text-white/60 text-xs">{item.description}</p>
                </div>
                {isOwned ? (
                  <span className="text-green-400 font-bold text-sm px-3 py-1.5">✓ Owned</span>
                ) : (
                  <button
                    onClick={() => demoEconomy.purchase(item.id)}
                    disabled={!affordable}
                    className="shrink-0 px-4 py-1.5 rounded-lg font-bold text-sm transition-colors"
                    style={
                      affordable
                        ? { background: 'var(--hud-accent, #00ccff)', color: '#04121f' }
                        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }
                    }
                  >
                    ⭐ {item.cost}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <p className="px-5 pb-4 text-white/40 text-xs">
          Finish Professor Numbers&apos; quest to earn 100 XP · ESC to close
        </p>
      </div>
    </div>
  );
}
