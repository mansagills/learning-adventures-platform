/**
 * The restrained 16-bit palette. Every pixel in the game is drawn from these
 * colors so the world, characters and UI feel like one storybook.
 */
export const P = {
  outline: '#2b1d1e',
  ink: '#3a2a26',
  shadow: 'rgba(30, 20, 30, 0.28)',

  grass1: '#7cb356',
  grass2: '#6aa24a',
  grass3: '#8cc463',
  grassDark: '#4f8a3c',
  grassDeep: '#3f7336',

  path1: '#d9b27c',
  path2: '#c79c66',
  path3: '#e6c592',
  cobble1: '#b9ab98',
  cobble2: '#a39381',
  cobble3: '#cfc2ae',

  water1: '#4f9fcf',
  water2: '#6fb8de',
  water3: '#3c86b8',
  waterEdge: '#9ad1e8',

  soil1: '#7a4f33',
  soil2: '#65402a',
  soil3: '#8e5f3f',

  wood1: '#a0643c',
  wood2: '#84502f',
  wood3: '#bd7c4c',
  woodDark: '#5c3822',

  brick1: '#c0674a',
  brick2: '#a4553d',
  plaster: '#f1e3c6',
  plaster2: '#dfcdab',

  roofRed1: '#b8483e',
  roofRed2: '#963a33',
  roofBlue1: '#4e6fa3',
  roofBlue2: '#3e5a88',
  roofGreen1: '#5a8a4e',
  roofGreen2: '#46703e',
  roofBrown1: '#8a5a3a',
  roofBrown2: '#6e472e',

  glass1: '#bfe6ee',
  glass2: '#98d0de',
  glassFrame: '#f4f1e8',

  leaf1: '#3f8a3a',
  leaf2: '#56a347',
  leaf3: '#76bf5a',
  leaf4: '#2e6b31',
  trunk: '#7a4c2c',

  flowerRed: '#e0574f',
  flowerYellow: '#f2c94c',
  flowerWhite: '#f7f3ea',
  flowerPink: '#ef8fb1',
  flowerPurple: '#9d7ad6',
  flowerBlue: '#6ea5e6',

  metal: '#5b5f6b',
  metalLight: '#8f95a3',
  lampGlow: '#ffe7a3',
  windowLit: '#ffd88a',
  windowDark: '#35506b',

  paper: '#f6ecd3',
  paper2: '#e7d8b4',
  gold: '#f2b53a',
  gold2: '#c98c1f',
  white: '#fdfbf5',
} as const;

/** Inclusive skin tones for the player (and NPCs). */
export const SKIN_TONES = [
  { id: 'skin1', name: 'Deep', base: '#5a3825', shade: '#462a1b' },
  { id: 'skin2', name: 'Dark brown', base: '#7a4a2e', shade: '#633b23' },
  { id: 'skin3', name: 'Brown', base: '#9c6440', shade: '#834f31' },
  { id: 'skin4', name: 'Warm tan', base: '#c08a5c', shade: '#a47049' },
  { id: 'skin5', name: 'Light tan', base: '#dcaa7e', shade: '#c38f65' },
  { id: 'skin6', name: 'Light', base: '#f0c9a4', shade: '#d9ab86' },
] as const;

export const HAIR_COLORS = [
  { id: 'black', name: 'Black', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
  { id: 'darkbrown', name: 'Dark brown', base: '#4a2f22', shade: '#352016', light: '#664335' },
  { id: 'brown', name: 'Brown', base: '#7a4a2a', shade: '#5d371e', light: '#96603a' },
  { id: 'auburn', name: 'Auburn', base: '#9c4a2c', shade: '#7a3620', light: '#bd6440' },
  { id: 'blonde', name: 'Blonde', base: '#d9b061', shade: '#b88f45', light: '#ecc97e' },
  { id: 'gray', name: 'Silver', base: '#b9b7b4', shade: '#8f8c89', light: '#dedbd6' },
] as const;

export const OUTFIT_COLORS = [
  { id: 'red', name: 'Tomato red', base: '#c9483f', shade: '#a2362f' },
  { id: 'orange', name: 'Pumpkin', base: '#e0823a', shade: '#bb652a' },
  { id: 'yellow', name: 'Sunflower', base: '#e8bd3f', shade: '#c29a2c' },
  { id: 'green', name: 'Leaf green', base: '#4f9a4a', shade: '#3c7b39' },
  { id: 'teal', name: 'Pond teal', base: '#2f9a94', shade: '#237872' },
  { id: 'blue', name: 'Sky blue', base: '#4b7fcf', shade: '#3a64a6' },
  { id: 'purple', name: 'Violet', base: '#8a5cc4', shade: '#6d469e' },
  { id: 'pink', name: 'Blossom', base: '#dc6f9c', shade: '#b8567f' },
] as const;

export const HAIR_STYLES = [
  { id: 'short', name: 'Short' },
  { id: 'curly', name: 'Curly' },
  { id: 'puffs', name: 'Puffs' },
  { id: 'braids', name: 'Braids' },
  { id: 'long', name: 'Long' },
  { id: 'locs', name: 'Locs' },
] as const;

export const ACCESSORIES = [
  { id: 'none', name: 'None' },
  { id: 'glasses', name: 'Glasses' },
  { id: 'sunhat', name: 'Sun hat' },
  { id: 'cap', name: 'Cap' },
  { id: 'headband', name: 'Headband' },
  { id: 'scarf', name: 'Scarf' },
] as const;

export type HairStyleId = (typeof HAIR_STYLES)[number]['id'];
export type AccessoryId = (typeof ACCESSORIES)[number]['id'];
