'use client';

import { useEffect, useState } from 'react';
import { X, Volume2, VolumeX, Music } from 'lucide-react';
import {
  loadWorldSettings,
  saveWorldSettings,
  type WorldSettings,
} from '@/lib/world/settings';
import { EventBus } from '@/components/phaser/EventBus';

interface WorldPauseMenuProps {
  onClose: () => void;
  onExit: () => void;
}

export function WorldPauseMenu({ onClose, onExit }: WorldPauseMenuProps) {
  const [settings, setSettings] = useState<WorldSettings>(loadWorldSettings);

  useEffect(() => {
    EventBus.emit('world-pause', true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      EventBus.emit('world-pause', false);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const updateSetting = (patch: Partial<WorldSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveWorldSettings(next);
    EventBus.emit('world-settings-changed', next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="w-[min(92vw,24rem)] bg-[#1a1a2e] rounded-2xl border border-[#8B5CF6]/40 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#8B5CF6]">
          <h2 className="text-lg font-bold text-white">Paused</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white"
            aria-label="Resume"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-gray-400 text-sm">Campus is paused. Adjust settings or resume exploring.</p>

          <label className="flex items-center justify-between gap-3 text-white">
            <span className="flex items-center gap-2 text-sm font-medium">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Sound effects
            </span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSetting({ soundEnabled: e.target.checked })}
              className="w-5 h-5 accent-[#8B5CF6]"
            />
          </label>

          <label className="flex items-center justify-between gap-3 text-white">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Music className="w-4 h-4" />
              Background music
            </span>
            <input
              type="checkbox"
              checked={settings.musicEnabled}
              onChange={(e) => updateSetting({ musicEnabled: e.target.checked })}
              className="w-5 h-5 accent-[#8B5CF6]"
            />
          </label>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#8B5CF6] text-white font-bold hover:bg-[#7C3AED]"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={onExit}
              className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20"
            >
              Exit to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
