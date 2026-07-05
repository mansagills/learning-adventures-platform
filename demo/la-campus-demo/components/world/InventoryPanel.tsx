'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Package } from 'lucide-react';

interface InventoryItem {
  id: string;
  type: 'CONSUMABLE' | 'EQUIPMENT' | 'PET';
  name: string;
  iconEmoji: string;
  effects: Record<string, any> | null;
  quantity?: number;
  acquiredAt?: string;
}

interface InventoryPanelProps {
  onClose: () => void;
  onEquip?: (itemId: string, equipment: Record<string, string | null>) => void;
}

export function InventoryPanel({ onClose, onEquip }: InventoryPanelProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [equipment, setEquipment] = useState<Record<string, string | null>>({});
  const [currency, setCurrency] = useState(0);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (res.ok) {
        setItems(data.items ?? []);
        setEquipment(data.equipment ?? {});
        setCurrency(data.currency ?? 0);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleEquip = async (item: InventoryItem) => {
    if (item.type === 'CONSUMABLE') return;
    setEquipping(item.id);
    setFeedback(null);

    try {
      const res = await fetch('/api/inventory/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error ?? 'Failed to equip' });
      } else {
        setEquipment(data.equipment);
        setFeedback({ type: 'success', message: `Equipped ${item.iconEmoji} ${item.name}!` });
        onEquip?.(item.id, data.equipment);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Try again.' });
    } finally {
      setEquipping(null);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const getSlotForItem = (item: InventoryItem): string | null => {
    if (item.type === 'PET') return 'pet';
    return item.effects?.slot ?? null;
  };

  const isEquipped = (item: InventoryItem): boolean => {
    const slot = getSlotForItem(item);
    if (!slot) return false;
    return equipment[slot] === item.id;
  };

  const equippedSection = items.filter((i) => i.type !== 'CONSUMABLE' && isEquipped(i));
  const wearableSection = items.filter((i) => i.type !== 'CONSUMABLE' && !isEquipped(i));
  const consumableSection = items.filter((i) => i.type === 'CONSUMABLE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[90vw] max-w-2xl max-h-[85vh] flex flex-col bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden border border-[#8B5CF6]/40">

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
        >
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Inventory</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <span className="text-yellow-300 font-bold text-lg">🪙</span>
              <span className="text-white font-bold">{currency}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
              aria-label="Close inventory"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <div
            className={`mx-4 mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-center shrink-0 ${
              feedback.type === 'success'
                ? 'bg-green-900/60 text-green-300 border border-green-600'
                : 'bg-red-900/60 text-red-300 border border-red-600'
            }`}
          >
            {feedback.type === 'success' ? '✅' : '❌'} {feedback.message}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              Loading inventory...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 gap-2">
              <p className="text-4xl">🎒</p>
              <p>Your inventory is empty.</p>
              <p className="text-sm">Visit the shop to buy items!</p>
            </div>
          ) : (
            <>
              {/* Currently Equipped */}
              {equippedSection.length > 0 && (
                <section>
                  <h3 className="text-[#14B8A6] font-bold text-sm mb-2 uppercase tracking-wide">
                    ✨ Currently Equipped
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {equippedSection.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        equipped
                        equipping={equipping === item.id}
                        onEquip={() => handleEquip(item)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Wearables */}
              {wearableSection.length > 0 && (
                <section>
                  <h3 className="text-gray-300 font-bold text-sm mb-2 uppercase tracking-wide">
                    👒 Cosmetics & Pets
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {wearableSection.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        equipped={false}
                        equipping={equipping === item.id}
                        onEquip={() => handleEquip(item)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Consumables */}
              {consumableSection.length > 0 && (
                <section>
                  <h3 className="text-gray-300 font-bold text-sm mb-2 uppercase tracking-wide">
                    🧪 Consumables
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {consumableSection.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        equipped={false}
                        equipping={false}
                        onEquip={() => {}}
                        isConsumable
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t border-white/10 text-center text-xs text-gray-500 shrink-0">
          Click cosmetics or pets to equip them!
        </div>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  equipped,
  equipping,
  onEquip,
  isConsumable = false,
}: {
  item: InventoryItem;
  equipped: boolean;
  equipping: boolean;
  onEquip: () => void;
  isConsumable?: boolean;
}) {
  return (
    <button
      onClick={isConsumable ? undefined : onEquip}
      disabled={equipping || isConsumable}
      className={`relative flex flex-col items-center rounded-xl border p-2 transition-all text-center ${
        equipped
          ? 'border-[#14B8A6] bg-[#14B8A6]/10 ring-1 ring-[#14B8A6]/50'
          : isConsumable
          ? 'border-white/10 bg-white/5 cursor-default'
          : 'border-white/15 bg-white/5 hover:border-[#8B5CF6]/60 hover:bg-white/10 cursor-pointer'
      }`}
    >
      {equipped && (
        <div className="absolute top-1 right-1 text-[10px] bg-[#14B8A6] text-white px-1 rounded-full font-bold">
          On
        </div>
      )}
      <span className="text-3xl mb-1">{item.iconEmoji}</span>
      <span className="text-white text-xs font-medium leading-tight">{item.name}</span>
      {item.quantity && item.quantity > 1 && (
        <span className="text-gray-400 text-xs mt-0.5">×{item.quantity}</span>
      )}
      {!isConsumable && !equipped && (
        <span className="text-[#8B5CF6] text-[10px] mt-1">{equipping ? '...' : 'Equip'}</span>
      )}
    </button>
  );
}
