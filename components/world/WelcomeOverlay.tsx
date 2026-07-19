'use client';

import { useState } from 'react';
import { markWelcomeSeen } from '@/game/world/welcomeState';
import { unlockAudio, startAmbience } from '@/game/world/campusAudio';
import {
  AVATAR_CHOICES,
  getIdentity,
  saveIdentity,
  sanitizeName,
} from '@/game/world/playerIdentity';
import { EventBus } from '@/components/phaser/EventBus';

interface WelcomeOverlayProps {
  onDismiss: () => void;
  /**
   * Show the demo identity picker (first name + avatar). Sandbox only —
   * the authed /world/campus page gets its avatar from the account, so it
   * must NOT pass this.
   */
  identityPicker?: boolean;
}

/**
 * WelcomeOverlay — one-time first-visit card (game/world/welcomeState.ts
 * gates repeat showings). The "Start Exploring" button doubles as the
 * required user gesture that unlocks the Web Audio ambience/SFX
 * (game/world/campusAudio.ts) — browsers block audio before a click.
 *
 * With `identityPicker`, it also asks for a first name and one of the six
 * character sprites (game/world/playerIdentity.ts), personalizing the demo
 * for whoever is holding the mouse.
 */
export function WelcomeOverlay({ onDismiss, identityPicker }: WelcomeOverlayProps) {
  // Prefill from a previous run so a demo reset re-offers the last identity.
  const [name, setName] = useState(() => (identityPicker ? getIdentity().name : ''));
  const [avatarId, setAvatarId] = useState(() =>
    identityPicker ? getIdentity().avatarId : AVATAR_CHOICES[0].id
  );

  const handleStart = () => {
    if (identityPicker) {
      const saved = saveIdentity({ name, avatarId });
      // Live texture swap for the already-spawned player behind the overlay
      EventBus.emit('set-avatar', { avatarId: saved.avatarId });
    }
    markWelcomeSeen();
    unlockAudio();
    startAmbience();
    // Cue the scene's cinematic intro flyover (GatherCampusScene)
    EventBus.emit('welcome-dismissed');
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-[92vw] max-w-md rounded-2xl overflow-hidden text-center"
        style={{ background: '#0d1320', border: '2px solid var(--hud-accent, #00ccff)' }}
      >
        <div className="px-6 pt-8 pb-6">
          <p className="text-5xl mb-3" aria-hidden>🎓</p>
          <h1 className="text-white font-extrabold text-2xl mb-2">Welcome to Campus!</h1>
          <p className="text-white/70 text-sm mb-6">
            Explore Math Hall, Discovery Lab, Story Grove, and The Commons.
            Chat with anyone you meet, and find Professor Numbers for your first quest.
          </p>

          {identityPicker && (
            <div className="mb-6 text-left">
              <label
                htmlFor="campus-player-name"
                className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--hud-accent, #00ccff)' }}
              >
                What&apos;s your first name?
              </label>
              <input
                id="campus-player-name"
                type="text"
                value={name}
                maxLength={14}
                autoComplete="off"
                placeholder="Explorer"
                onChange={(e) => setName(sanitizeName(e.target.value))}
                className="w-full mb-4 px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid color-mix(in srgb, var(--hud-accent, #00ccff) 45%, transparent)',
                }}
              />

              <p
                className="text-xs font-bold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--hud-accent, #00ccff)' }}
              >
                Pick your character
              </p>
              <div className="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Choose your character">
                {AVATAR_CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    role="radio"
                    aria-checked={avatarId === choice.id}
                    aria-label={choice.label}
                    title={choice.label}
                    onClick={() => setAvatarId(choice.id)}
                    className="flex flex-col items-center gap-0.5 rounded-lg py-1.5 transition-transform hover:scale-105"
                    style={{
                      background:
                        avatarId === choice.id
                          ? 'color-mix(in srgb, var(--hud-accent, #00ccff) 22%, transparent)'
                          : 'rgba(255,255,255,0.05)',
                      border:
                        avatarId === choice.id
                          ? '2px solid var(--hud-accent, #00ccff)'
                          : '2px solid transparent',
                    }}
                  >
                    {/* Front-facing frame (col 0, row 2) of the 384×384 sheet, at half scale */}
                    <span
                      aria-hidden
                      className="block w-12 h-12"
                      style={{
                        backgroundImage: `url(/game-assets/sprites/${choice.id}.png)`,
                        backgroundSize: '192px 192px',
                        backgroundPosition: '0px -96px',
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated',
                      }}
                    />
                    <span className="text-[10px] text-white/75 leading-none">{choice.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <ul className="text-left text-sm text-white/85 space-y-2 mb-7 px-2">
            <li className="flex items-center gap-2">
              <span
                className="shrink-0 w-16 text-center font-bold text-xs py-1 rounded"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--hud-accent, #00ccff)' }}
              >
                WASD
              </span>
              Move around campus
            </li>
            <li className="flex items-center gap-2">
              <span
                className="shrink-0 w-16 text-center font-bold text-xs py-1 rounded"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--hud-accent, #00ccff)' }}
              >
                Walk up
              </span>
              Talk to anyone automatically
            </li>
            <li className="flex items-center gap-2">
              <span
                className="shrink-0 w-16 text-center font-bold text-xs py-1 rounded"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--hud-accent, #00ccff)' }}
              >
                SPACE
              </span>
              Continue talking / use a station
            </li>
          </ul>

          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl font-extrabold text-lg transition-transform hover:scale-[1.02]"
            style={{ background: 'var(--hud-accent, #00ccff)', color: '#04121f' }}
          >
            🚀 Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
