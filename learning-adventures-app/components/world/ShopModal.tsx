'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, ShoppingBag, Coins } from 'lucide-react';

interface ShopItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  type: 'CONSUMABLE' | 'EQUIPMENT' | 'PET';
  price: number;
  levelRequirement: number;
  iconEmoji: string;
  effects: Record<string, any> | null;
}

interface ShopModalProps {
  onClose: () => void;
  onPurchase?: (item: ShopItem, newBalance: number) => void;
  currency: number;
  userLevel: number;
}

const TYPE_LABELS: Record<string, string> = {
  CONSUMABLE: '🧪 Consumables',
  EQUIPMENT: '👒 Cosmetics',
  PET: '🐾 Pets',
};

const TYPE_ORDER = ['CONSUMABLE', 'EQUIPMENT', 'PET'];

export function ShopModal({
  onClose,
  onPurchase,
  currency: initialCurrency,
  userLevel,
}: ShopModalProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [ownedItemIds, setOwnedItemIds] = useState<Set<string>>(new Set());
  const [currency, setCurrency] = useState(initialCurrency);
  const [activeTab, setActiveTab] = useState<string>('CONSUMABLE');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShopData = useCallback(async () => {
    try {
      const res = await fetch('/api/shop/items');
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        setCurrency(data.currency ?? initialCurrency);
        const owned = new Set<string>(
          (data.inventory ?? []).map((i: any) => i.id as string)
        );
        setOwnedItemIds(owned);
      }
    } catch (err) {
      console.error('Failed to load shop:', err);
    } finally {
      setLoading(false);
    }
  }, [initialCurrency]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handlePurchase = async (item: ShopItem) => {
    if (purchasing) return;
    setPurchasing(item.itemId);
    setFeedback(null);

    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.itemId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: 'error',
          message: data.error ?? 'Purchase failed',
        });
      } else {
        setCurrency(data.newBalance);
        if (item.type !== 'CONSUMABLE') {
          setOwnedItemIds((prev) => {
            const next = new Set(prev);
            next.add(item.itemId);
            return next;
          });
        }
        setFeedback({
          type: 'success',
          message: `Bought ${item.iconEmoji} ${item.name}!`,
        });
        onPurchase?.(item, data.newBalance);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Try again.' });
    } finally {
      setPurchasing(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const tabItems = items.filter((item) => item.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[90vw] max-w-3xl max-h-[85vh] flex flex-col bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden border border-[#8B5CF6]/40">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: 'linear-gradient(135deg, #14B8A6, #0D9488)' }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Campus Shop</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <span className="text-yellow-300 font-bold text-lg">🪙</span>
              <span className="text-white font-bold">{currency}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
              aria-label="Close shop"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 shrink-0">
          {TYPE_ORDER.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === type
                  ? 'text-[#14B8A6] border-b-2 border-[#14B8A6] bg-white/5'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
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

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              Loading items...
            </div>
          ) : tabItems.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No items available in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tabItems.map((item) => {
                const canAfford = currency >= item.price;
                const meetsLevel = userLevel >= item.levelRequirement;
                const owned = ownedItemIds.has(item.itemId);
                const isBuying = purchasing === item.itemId;
                const disabled =
                  isBuying || (!owned && (!canAfford || !meetsLevel));

                return (
                  <div
                    key={item.itemId}
                    className={`relative flex flex-col rounded-xl border p-3 transition-all ${
                      owned
                        ? 'border-[#14B8A6]/60 bg-[#14B8A6]/10'
                        : canAfford && meetsLevel
                          ? 'border-white/20 bg-white/5 hover:border-[#14B8A6]/60 hover:bg-white/10 cursor-pointer'
                          : 'border-white/10 bg-white/5 opacity-60'
                    }`}
                  >
                    {/* Owned badge */}
                    {owned && item.type !== 'CONSUMABLE' && (
                      <div className="absolute top-2 right-2 text-xs bg-[#14B8A6] text-white px-1.5 py-0.5 rounded-full font-bold">
                        Owned
                      </div>
                    )}

                    {/* Icon */}
                    <div className="text-4xl mb-2 text-center">
                      {item.iconEmoji}
                    </div>

                    {/* Name & description */}
                    <p className="text-white font-semibold text-sm text-center leading-tight mb-1">
                      {item.name}
                    </p>
                    <p className="text-gray-400 text-xs text-center leading-tight mb-3 flex-1">
                      {item.description}
                    </p>

                    {/* Level requirement */}
                    {item.levelRequirement > 1 && (
                      <p
                        className={`text-xs text-center mb-1 font-medium ${meetsLevel ? 'text-gray-400' : 'text-red-400'}`}
                      >
                        Lv. {item.levelRequirement}+
                      </p>
                    )}

                    {/* Buy button */}
                    <button
                      onClick={() => !owned && handlePurchase(item)}
                      disabled={owned ? true : disabled}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${
                        owned && item.type !== 'CONSUMABLE'
                          ? 'bg-[#14B8A6]/30 text-[#14B8A6] cursor-default'
                          : canAfford && meetsLevel
                            ? 'bg-[#14B8A6] hover:bg-[#0D9488] text-white hover:scale-105'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isBuying ? (
                        '...'
                      ) : owned && item.type !== 'CONSUMABLE' ? (
                        '✓ Owned'
                      ) : !meetsLevel ? (
                        `Need Lv.${item.levelRequirement}`
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          🪙 {item.price}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 text-center text-xs text-gray-500 shrink-0">
          Earn coins by completing adventures and leveling up!
        </div>
      </div>
    </div>
  );
}
