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
  scene: 'hub';
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

/** Chapter 1: the community gardener and a young naturalist. */
NPCS.push(
  {
    id: 'hattie',
    name: 'Hattie Bell',
    role: 'Community gardener',
    look: {
      build: 'adult',
      skin: { base: '#7a4a2e', shade: '#633b23' },
      hair: { style: 'bun', base: gray.base, shade: gray.shade, light: gray.light },
      shirt: { base: '#e7d9b8', shade: '#cdbd98' },
      pants: '#3e5a88',
      shoes: '#4a3326',
      accessory: 'sunhat',
      accent: '#4f9a4a',
      extras: { apron: '#4b6fa8' },
    },
    portrait: 'hattie',
    scene: 'hub',
    pos: { x: 13.5, y: 8.4 },
    facing: 'down',
    presence: 'always',
    ambient: { default: 'hattie_ambient' },
    voice: 240,
    required: true,
  },
  {
    id: 'theo',
    name: 'Theo',
    role: 'Young naturalist',
    look: {
      build: 'kid',
      skin: { base: '#9c6440', shade: '#834f31' },
      hair: { style: 'curly', base: black.base, shade: black.shade, light: black.light },
      shirt: { base: '#c9b27a', shade: '#a8925e' },
      pants: '#5d4a33',
      shoes: '#3a2a22',
      accessory: 'glasses',
      accent: '#e0823a',
    },
    portrait: 'theo',
    scene: 'hub',
    pos: { x: 25.5, y: 19.5 },
    facing: 'left',
    presence: 'always',
    ambient: { default: 'theo_ambient' },
    voice: 380,
    required: true,
  },
);

/** Chapter 2: the schoolteacher and a young artist. */
NPCS.push(
  {
    id: 'ruth',
    name: 'Ms. Ruth Nelson',
    role: 'Schoolteacher',
    look: {
      build: 'adult',
      skin: { base: '#5a3825', shade: '#462a1b' },
      hair: { style: 'bun', base: black.base, shade: black.shade, light: black.light },
      shirt: { base: '#2f7a6a', shade: '#235e51' },
      pants: '#3a3a44',
      shoes: '#2f2521',
      accessory: 'glasses',
      accent: P.flowerYellow,
    },
    portrait: 'ruth',
    scene: 'hub',
    pos: { x: 4.5, y: 25.5 },
    facing: 'right',
    presence: 'always',
    ambient: { default: 'ruth_ambient' },
    voice: 260,
    required: true,
  },
  {
    id: 'ada',
    name: 'Ada',
    role: 'Young artist',
    look: {
      build: 'kid',
      skin: { base: '#dcaa7e', shade: '#c38f65' },
      hair: { style: 'braids', base: '#9c4a2c', shade: '#7a3620', light: '#bd6440' },
      shirt: { base: '#e0823a', shade: '#bb652a' },
      pants: '#4a5a7a',
      shoes: '#3a2a22',
      accessory: 'headband',
      accent: '#4b7fcf',
    },
    portrait: 'ada',
    scene: 'hub',
    pos: { x: 15.5, y: 12.5 },
    facing: 'down',
    presence: 'always',
    ambient: { default: 'ada_ambient' },
    voice: 400,
    required: true,
  },
);

/** Chapter 3: the farmer with the tired field. (Mae keeps the crop cards.) */
NPCS.push({
  id: 'amos',
  name: 'Mr. Amos Hill',
  role: 'Farmer at Hilltop Farm',
  look: {
    build: 'adult',
    skin: { base: '#4e3020', shade: '#3c2418' },
    hair: { style: 'short', base: gray.base, shade: gray.shade, light: gray.light },
    shirt: { base: '#b8513a', shade: '#963f2d' },
    pants: '#3e5a88',
    shoes: '#3a2a22',
    accessory: 'cap',
    accent: '#d9b25a',
    extras: { beard: '#bdb8b0' },
  },
  portrait: 'amos',
  scene: 'hub',
  pos: { x: 31.5, y: 8.4 },
  facing: 'down',
  presence: 'always',
  ambient: { default: 'amos_ambient' },
  voice: 150,
  required: true,
});

/** Chapter 4: the community cook and the craftsperson. */
NPCS.push(
  {
    id: 'lottie',
    name: 'Miss Lottie Greene',
    role: 'Cook at the community kitchen',
    look: {
      build: 'adult',
      skin: { base: '#7a4a2e', shade: '#633b23' },
      hair: { style: 'wrap', base: black.base, shade: black.shade, light: black.light },
      shirt: { base: '#d95f5f', shade: '#b84a4a' },
      pants: '#4a4038',
      shoes: '#2f2521',
      accessory: 'none',
      accent: '#f2d15a',
      extras: { apron: '#f6f0e0' },
    },
    portrait: 'lottie',
    scene: 'hub',
    pos: { x: 24.5, y: 14.5 },
    facing: 'left',
    presence: 'always',
    ambient: { default: 'lottie_ambient' },
    voice: 330,
    required: true,
  },
  {
    id: 'wendell',
    name: 'Mr. Wendell Brooks',
    role: 'Craftsperson at the workshop',
    look: {
      build: 'adult',
      skin: { base: '#9c6440', shade: '#834f31' },
      hair: { style: 'short', base: black.base, shade: black.shade, light: black.light },
      shirt: { base: '#5a7a4a', shade: '#46603a' },
      pants: '#6b5a4a',
      shoes: '#3a2a22',
      accessory: 'glasses',
      accent: '#d9b25a',
      extras: { apron: '#8a6a48', mustache: '#2a1f1d' },
    },
    portrait: 'wendell',
    scene: 'hub',
    pos: { x: 35.5, y: 25.5 },
    facing: 'down',
    presence: 'always',
    ambient: { default: 'wendell_ambient' },
    voice: 200,
    required: true,
  },
);

export function npcById(id: NpcId): NpcDefinition | undefined {
  return NPCS.find((n) => n.id === id);
}
