import {
  DEFAULT_WORLD_SETTINGS,
  WORLD_SETTINGS_STORAGE_KEY,
  WORLD_TUTORIAL_STORAGE_KEY,
  type WorldSettings,
} from './constants';

export type { WorldSettings };

export function loadWorldSettings(): WorldSettings {
  if (typeof window === 'undefined') return DEFAULT_WORLD_SETTINGS;
  try {
    const raw = localStorage.getItem(WORLD_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_WORLD_SETTINGS;
    return { ...DEFAULT_WORLD_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WORLD_SETTINGS;
  }
}

export function saveWorldSettings(settings: WorldSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WORLD_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function hasSeenWorldTutorial(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(WORLD_TUTORIAL_STORAGE_KEY) === '1';
}

export function markWorldTutorialSeen(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WORLD_TUTORIAL_STORAGE_KEY, '1');
}
