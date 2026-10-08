/**
 * The world theme layer (W1). Import from here:
 *
 *   import { settingById, WORLD_STYLES } from '../../kit/worlds';
 *   const setting = settingById('roman-forum');
 *   const style = WORLD_STYLES[setting.world];
 *   const built = setting.build({ scene, lighting, px: style.px, time: 'day' });
 *
 * Use `Stage` (stage.ts) as the camera, at the world's px, and paint the
 * people with `paintHero` (hero16.ts) when the style's characters are '16bit'.
 * See README.md in this folder.
 */
import { RIVER_MARKET } from './ancient-kingdoms/market';
import { ROMAN_FORUM } from './ancient-kingdoms/forum';
import { STATION_DECK } from './star-station/deck';
import { ALIEN_PLANET } from './star-station/planet';
import type { Setting, WorldId } from './types';

export { WORLD_STYLES, SUNNY_TOWN, STAR_STATION, ANCIENT_KINGDOMS } from './styles';
export type { Setting, SettingScene, SceneCtx, Spot, TimeOfDay, WorldId, WorldStyle } from './types';
export { Stage, billboard, glow, groundPiece, lightPool, shadow } from './stage';
export { Figure, swapFrame } from './figure';
export { paintHero, paintPortrait16, size16, type Look16, type Dir16, type Mood } from './hero16';

/** Every setting, by world. Add new settings here (and a test to tests/worlds.test.ts). */
export const SETTINGS: Setting[] = [STATION_DECK, ALIEN_PLANET, RIVER_MARKET, ROMAN_FORUM];

export function settingById(id: string): Setting {
  const s = SETTINGS.find((x) => x.id === id);
  if (!s) throw new Error(`No world setting called "${id}"`);
  return s;
}

export function settingsIn(world: WorldId): Setting[] {
  return SETTINGS.filter((s) => s.world === world);
}
