import { bus } from '../core/events';

/**
 * Player preferences, shared by every Learning Adventures game (a player
 * who needs large text or reduced motion gets it in every game). Stored
 * apart from each game's save, so they survive "Start over".
 */
export interface Settings {
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
  muted: boolean;
  reducedMotion: boolean;
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  textSize: 'normal' | 'large';
  touchControls: 'auto' | 'on' | 'off';
  /** Read text aloud: 'auto' lets each game decide (on for games for young readers). */
  readAloud: 'auto' | 'on' | 'off';
}

const KEY = 'learningAdventures.settings';

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function defaultSettings(): Settings {
  return {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    muted: false,
    reducedMotion: prefersReducedMotion(),
    textSpeed: 'normal',
    textSize: 'normal',
    touchControls: 'auto',
    readAloud: 'auto',
  };
}

function clean(raw: unknown): Settings {
  const d = defaultSettings();
  if (typeof raw !== 'object' || raw === null) return d;
  const r = raw as Record<string, unknown>;
  const vol = (v: unknown, dv: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : dv);
  const pick = <T extends string>(v: unknown, list: readonly T[], dv: T) => (list.includes(v as T) ? (v as T) : dv);
  return {
    musicVolume: vol(r.musicVolume, d.musicVolume),
    sfxVolume: vol(r.sfxVolume, d.sfxVolume),
    muted: r.muted === true,
    reducedMotion: typeof r.reducedMotion === 'boolean' ? r.reducedMotion : d.reducedMotion,
    textSpeed: pick(r.textSpeed, ['slow', 'normal', 'fast', 'instant'] as const, d.textSpeed),
    textSize: pick(r.textSize, ['normal', 'large'] as const, d.textSize),
    touchControls: pick(r.touchControls, ['auto', 'on', 'off'] as const, d.touchControls),
    readAloud: pick(r.readAloud, ['auto', 'on', 'off'] as const, d.readAloud),
  };
}

function load(): Settings {
  try {
    const t = window.localStorage.getItem(KEY);
    return t ? clean(JSON.parse(t)) : defaultSettings();
  } catch {
    return defaultSettings();
  }
}

export const settings: Settings = load();

export function updateSettings(patch: Partial<Settings>): void {
  Object.assign(settings, clean({ ...settings, ...patch }));
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* private mode: settings last for this visit only */
  }
  applySettingsToDocument();
  bus.emit('settings:changed', {});
}

export function applySettingsToDocument(): void {
  const root = document.documentElement;
  root.dataset.textSize = settings.textSize;
  root.dataset.reducedMotion = settings.reducedMotion ? 'true' : 'false';
}

export function isTouchDevice(): boolean {
  try {
    return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  } catch {
    return false;
  }
}

export function touchControlsVisible(): boolean {
  if (settings.touchControls === 'on') return true;
  if (settings.touchControls === 'off') return false;
  return isTouchDevice();
}

/** Characters revealed per second for each text speed (0 = instant). */
export function charsPerSecond(): number {
  return { slow: 28, normal: 55, fast: 110, instant: 0 }[settings.textSpeed];
}
