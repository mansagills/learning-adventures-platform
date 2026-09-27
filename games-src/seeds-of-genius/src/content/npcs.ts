import type { CharacterLook, Dir } from '../art/characters';
import { HAIR_COLORS, P } from '../art/palette';
import type { ConversationId, NpcId, TimeOfDay } from '../quests/types';

export interface NpcDefinition {
  id: NpcId;
  name: string;
  /** Short role shown under the name in dialogue. */
  role: string;
  look: CharacterLook;
  /** Portrait painter key (art/portraits.ts). */
  portrait: string;
  scene: 'hub' | 'room';
  /** Tile position (x, y); fractional values are fine. */
  pos: { x: number; y: number };
  facing: Dir;
  /** Required NPCs are 'always' so a lesson never waits on the clock. */
  presence: 'always' | 'day' | 'night';
  /** Small talk when there is no quest conversation. */
  ambient: Partial<Record<TimeOfDay, ConversationId>> & { default: ConversationId };
  /** Pitch of the soft "talk" blips (Hz). */
  voice: number;
  /** Holds a lantern after dark. */
  lanternAtNight?: boolean;
  /** Required for the story: must always be reachable. */
  required?: boolean;
}

const gray = HAIR_COLORS.find((h) => h.id === 'gray')!;
const black = HAIR_COLORS.find((h) => h.id === 'black')!;

/**
 * George Washington Carver is shown as an adult storybook guide: gray,
 * close-cropped hair, a mustache, a work suit and the fresh flower he was
 * known for wearing in his lapel.
 */
export const CARVER_LOOK: CharacterLook = {
  build: 'adult',
  skin: { base: '#6e4329', shade: '#573320' },
  hair: { style: 'carver', base: gray.base, shade: gray.shade, light: gray.light },
  shirt: { base: '#f4efe4', shade: '#d9d2c2' },
  pants: '#4a4038',
  shoes: '#2f2521',
  accessory: 'none',
  accent: P.flowerYellow,
  extras: {
    mustache: '#c9c5bf',
    jacket: { base: '#6b5a4a', shade: '#54463a' },
    tie: '#7a2f38',
    lapelFlower: '#e0574f',
  },
};

export const NPCS: NpcDefinition[] = [
  {
    id: 'carver',
    name: 'George Washington Carver',
    role: 'Scientist and your guide',
    look: CARVER_LOOK,
    portrait: 'carver',
    scene: 'hub',
    pos: { x: 21.5, y: 7.5 },
    facing: 'down',
    presence: 'always',
    ambient: { default: 'carver_ambient' },
    voice: 180,
    required: true,
  },
  {
    id: 'mae',
    name: 'Mae Porter',
    role: 'Keeper of the Seed & Mail',
    look: {
      build: 'adult',
      skin: { base: '#9c6440', shade: '#834f31' },
      hair: { style: 'wrap', base: black.base, shade: black.shade, light: black.light },
      shirt: { base: '#d9824a', shade: '#b86a38' },
      pants: '#5a4a6b',
      shoes: '#3a2a2a',
      accessory: 'none',
      accent: '#4f9a4a',
      extras: { apron: '#f1e3c6' },
    },
    portrait: 'mae',
    scene: 'hub',
    pos: { x: 32.5, y: 18.5 },
    facing: 'down',
    presence: 'always',
    ambient: { default: 'mae_ambient', night: 'mae_ambient_night' },
    voice: 300,
    lanternAtNight: true,
    required: true,
  },
  {
    id: 'jojo',
    name: 'Jojo',
    role: 'Bug watcher',
    look: {
      build: 'kid',
      skin: { base: '#5a3825', shade: '#462a1b' },
      hair: { style: 'short', base: black.base, shade: black.shade, light: black.light },
      shirt: { base: '#e8bd3f', shade: '#c29a2c' },
      pants: '#4b7fcf',
      shoes: '#c9483f',
      accessory: 'cap',
      accent: '#c9483f',
    },
    portrait: 'jojo',
    scene: 'hub',
    pos: { x: 14.5, y: 20.5 },
    facing: 'right',
    presence: 'day',
    ambient: { default: 'jojo_ambient' },
    voice: 420,
  },
  {
    id: 'odell',
    name: 'Mr. Odell',
    role: 'Lamplighter',
    look: {
      build: 'adult',
      skin: { base: '#c08a5c', shade: '#a47049' },
      hair: { style: 'short', base: gray.base, shade: gray.shade, light: gray.light },
      shirt: { base: '#3e5a88', shade: '#2f466b' },
      pants: '#3a3a44',
      shoes: '#2f2521',
      accessory: 'cap',
      accent: '#46703e',
      extras: { beard: '#b9b7b4', mustache: '#b9b7b4' },
    },
    portrait: 'odell',
    scene: 'hub',
    pos: { x: 22.5, y: 15.6 },
    facing: 'left',
    presence: 'night',
    ambient: { default: 'odell_ambient' },
    voice: 140,
    lanternAtNight: true,
  },
];

export function npcById(id: NpcId): NpcDefinition | undefined {
  return NPCS.find((n) => n.id === id);
}
