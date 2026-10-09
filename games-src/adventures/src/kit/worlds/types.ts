import type * as THREE from 'three';
import type { Song } from '../systems/audio';
import type { Lighting } from '../world/sceneKit';

/**
 * Worlds, styles and settings (see docs/GAME_WORLDS_PROPOSAL.md, 4b).
 *
 * A world is a style: its pixel size, characters, lighting, glow, talk-box
 * accent and music stay the same everywhere in that world. A setting is a
 * place inside a world (the station deck, an alien planet, a Malian river
 * market, a Roman forum), painted with the world's style. A game picks one
 * world and one setting.
 */

export type WorldId = 'sunny-town' | 'star-station' | 'ancient-kingdoms';
export type TimeOfDay = 'day' | 'evening';

export interface WorldStyle {
  id: WorldId;
  name: string;
  /** Pixels per tile. Sunny Town is 16; the 16-bit worlds are 24 (owner decision, level b). */
  px: number;
  /** 'classic' = the kit's 16x24 characters; '16bit' = the 24x36 characters in hero16.ts. */
  characters: 'classic' | '16bit';
  /** Light tint for the whole scene, by time of day (the evening also turns glows on). */
  tint: Record<TimeOfDay, [number, number, number]>;
  /** What the times of day are called in this world (for labels and grown-ups notes). */
  timeNames: Record<TimeOfDay, string>;
  /** Class put on the page so kit panels pick up the world's accent (see worlds.css). */
  panelClass: string;
  /** The world's accent color (panel stripe, highlights). */
  accent: string;
  /** Glow colors used by every setting in the world. */
  glow: Record<string, string>;
  /** The world's theme music (register with audio.addSong). */
  music?: Song;
}

/** What a game needs to build a setting into its scene. */
export interface SceneCtx {
  scene: THREE.Scene;
  lighting: Lighting;
  /** Pixels per tile (normally the world's px). */
  px: number;
  time: TimeOfDay;
  /** Parts of the setting a game draws itself instead (for example 'braziers', which a game lights one by one). */
  omit?: string[];
}

export interface Spot {
  x: number;
  y: number;
}

/** A built setting: everything placed in the scene, plus what the game needs to know about it. */
export interface SettingScene {
  map: { w: number; h: number };
  /** Where the camera looks (x), the lowest row that must stay in view, and how far above row 0 the backdrop reaches. */
  focus: { x: number; feet: number; top: number };
  /** Background color behind everything (shows past the map edges). */
  clear: string;
  /** Where walking is allowed (tile rectangle), for games with a walking player. */
  walk?: { x0: number; y0: number; x1: number; y1: number };
  /** Footprints of the solid things in the setting (tile rectangles), so a player walks round them. */
  blocks?: Array<{ x: number; y: number; w: number; h: number }>;
  /** Where people can stand: at least 'player' and 'host'. */
  spots: Record<string, Spot>;
  /** Animate the setting; `t` is seconds since the start, `camX` the camera's tile x (for parallax). */
  update(t: number, camX: number): void;
}

export interface Setting {
  id: string;
  world: WorldId;
  name: string;
  /** The real places and times it is inspired by (shown on the grown-ups page). */
  inspiredBy: string;
  /** Reliable sources checked for historical details (historical settings only). */
  sources?: string[];
  build(ctx: SceneCtx): SettingScene;
}
