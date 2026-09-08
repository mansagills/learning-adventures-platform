'use client';

import { useEffect, useState } from 'react';
import { EventBus } from '@/components/phaser/EventBus';

/**
 * StoryItemsChip — HUD chip showing the Season 1 story items the player has
 * recovered (e.g. the Null Fragment from Chapter 1). Listens to
 * 'story-items-updated' from game/world/storyItems.ts. Hidden until the
 * player has at least one, so it only appears as a payoff.
 *
 * Sandbox-only (reads demo-local story state) — the authed campus would
 * surface real account rewards instead.
 */

interface Item { id: string; label: string; emoji: string; }

export function StoryItemsChip() {
  const [items, setItems] = useState<Item[]>([]);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const onUpdate = (list: Item[]) => {
      setItems((prev) => {
        if (Array.isArray(list) && list.length > prev.length) {
          setPulse(true);
          setTimeout(() => setPulse(false), 1600);
        }
        return Array.isArray(list) ? list : [];
      });
    };
    EventBus.on('story-items-updated', onUpdate);
    return () => { EventBus.off('story-items-updated', onUpdate); };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="absolute top-28 right-4 px-3 py-2 pointer-events-none flex items-center gap-2 z-10"
      style={{
        background: 'rgba(5,8,16,0.82)',
        border: '1px solid color-mix(in srgb, #22d3ee 55%, transparent)',
        borderRadius: '10px',
        boxShadow: pulse
          ? '0 0 22px color-mix(in srgb, #22d3ee 70%, transparent)'
          : '0 0 10px color-mix(in srgb, #22d3ee 22%, transparent)',
        transition: 'box-shadow .4s ease',
      }}
    >
      <span className="text-[10px] font-bold tracking-widest" style={{ color: '#67e8f9' }}>
        RECOVERED
      </span>
      {items.map((it) => (
        <span key={it.id} className="text-sm text-white flex items-center gap-1" title={it.label}>
          <span aria-hidden>{it.emoji}</span>
          <span className="hidden sm:inline text-xs text-white/85">{it.label}</span>
        </span>
      ))}
    </div>
  );
}
