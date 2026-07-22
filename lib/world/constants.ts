/** localStorage key — bump version to re-show campus tutorial */
export const WORLD_TUTORIAL_STORAGE_KEY = 'lap-world-tutorial-v1';

export const WORLD_SETTINGS_STORAGE_KEY = 'lap-world-settings-v1';

export interface WorldSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export const DEFAULT_WORLD_SETTINGS: WorldSettings = {
  soundEnabled: true,
  musicEnabled: false,
};

export const XP_PER_WORLD_GAME = 50;
export const COINS_PER_WORLD_GAME = 5;

/** Math building arcade stations → catalog progress metadata */
export const WORLD_ADVENTURE_META: Record<
  string,
  { category: string; adventureType: 'game' | 'lesson' }
> = {
  'pizza-fraction-frenzy': { category: 'math', adventureType: 'game' },
  'math-race-rally': { category: 'math', adventureType: 'game' },
  'multiplication-bingo-bonanza': { category: 'math', adventureType: 'game' },
  'number-monster-feeding': { category: 'math', adventureType: 'game' },
  'math-jeopardy-junior': { category: 'math', adventureType: 'game' },
  'cafeteria-cashier': { category: 'math', adventureType: 'game' },
  'math-dash': { category: 'math', adventureType: 'game' },
};
