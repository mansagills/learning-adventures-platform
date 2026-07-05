// campusAudio.ts
// Pure module — NO Phaser dependency.
//
// Every sound here is synthesized with Web Audio oscillators/gain envelopes,
// not loaded from asset files — no packs to source or license, and it stays
// tiny. A single AudioContext is created lazily and unlocked on the first
// user gesture (browser autoplay policy blocks audio before that; this
// module self-installs a one-time listener so callers don't have to wire it
// up per-page).
//
// Imported directly by the pure quest/economy modules (mathQuest.ts,
// demoEconomy.ts) so sound stays in sync with state changes regardless of
// which page (sandbox or authed campus) is driving them.

const MUTE_KEY = 'gather-demo-audio-muted';

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = loadMuted();
let unlocked = false;
let ambience: { stop: () => void } | null = null;

function loadMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

/** Call on first user gesture to satisfy the browser autoplay policy. Idempotent. */
export function unlockAudio(): void {
  if (unlocked) return;
  const c = ensureContext();
  if (!c) return;
  unlocked = true;
  if (c.state === 'suspended') {
    c.resume().catch(() => {
      // Autoplay still blocked (rare) — next gesture will retry via the
      // listener below since we only flip `unlocked` after a real resume.
      unlocked = false;
    });
  }
}

// Auto-install a one-time unlock on the first pointer/key interaction anywhere,
// so pages don't need to remember to call unlockAudio() themselves.
if (typeof window !== 'undefined') {
  const handler = () => {
    unlockAudio();
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('keydown', handler);
  };
  window.addEventListener('pointerdown', handler, { once: true });
  window.addEventListener('keydown', handler, { once: true });
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, 0.05);
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(MUTE_KEY, next ? '1' : '0');
    } catch {
      // Storage blocked: mute preference just won't persist
    }
  }
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}

// ─── Tone synthesis ──────────────────────────────────────────────────────────

interface TonePlan {
  freq: number;
  /** Seconds from now. */
  start: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

function playTones(tones: TonePlan[]): void {
  const c = ensureContext();
  const dest = masterGain;
  if (!c || !dest) return;
  tones.forEach(({ freq, start, duration, type = 'sine', gain = 0.2 }) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = c.currentTime + start;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(dest);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  });
}

/** Power-cell pickup: quick upward blip. */
export function playPickup(): void {
  playTones([
    { freq: 660, start: 0, duration: 0.12, type: 'triangle', gain: 0.18 },
    { freq: 990, start: 0.08, duration: 0.15, type: 'triangle', gain: 0.16 },
  ]);
}

/** XP gained: bright two-note chime. */
export function playXpChime(): void {
  playTones([
    { freq: 784, start: 0, duration: 0.18, type: 'sine', gain: 0.2 },
    { freq: 1046, start: 0.1, duration: 0.25, type: 'sine', gain: 0.18 },
  ]);
}

/** Quest accepted / turned in: soft single ding. */
export function playQuestDing(): void {
  playTones([{ freq: 880, start: 0, duration: 0.3, type: 'sine', gain: 0.16 }]);
}

/** Quest fully completed: short ascending fanfare. */
export function playQuestFanfare(): void {
  playTones([
    { freq: 523, start: 0, duration: 0.16, type: 'triangle', gain: 0.2 },
    { freq: 659, start: 0.12, duration: 0.16, type: 'triangle', gain: 0.2 },
    { freq: 784, start: 0.24, duration: 0.16, type: 'triangle', gain: 0.2 },
    { freq: 1046, start: 0.36, duration: 0.45, type: 'triangle', gain: 0.24 },
  ]);
}

/** Shop purchase: coin-like double click. */
export function playPurchase(): void {
  playTones([
    { freq: 1200, start: 0, duration: 0.06, type: 'square', gain: 0.1 },
    { freq: 1500, start: 0.05, duration: 0.12, type: 'square', gain: 0.12 },
  ]);
}

// ─── Ambience: soft looping pad ──────────────────────────────────────────────

/** Start the ambient campus pad (idempotent — no-op if already running). */
export function startAmbience(): void {
  const c = ensureContext();
  if (!c || !masterGain || ambience) return;

  const padGain = c.createGain();
  padGain.gain.value = 0;
  padGain.connect(masterGain);
  padGain.gain.linearRampToValueAtTime(0.05, c.currentTime + 3);

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.connect(padGain);

  // Slow-drifting lowpass cutoff so the pad feels alive, not static
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.05;
  lfoGain.gain.value = 250;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  // Three detuned oscillators = a soft, non-fatiguing chord pad (C3-E3-G3)
  const notes = [130.81, 164.81, 196.0];
  const oscs = notes.map((freq) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(filter);
    osc.start();
    return osc;
  });

  ambience = {
    stop: () => {
      padGain.gain.linearRampToValueAtTime(0, c.currentTime + 1);
      setTimeout(() => {
        oscs.forEach((o) => o.stop());
        lfo.stop();
      }, 1100);
    },
  };
}

export function stopAmbience(): void {
  ambience?.stop();
  ambience = null;
}
